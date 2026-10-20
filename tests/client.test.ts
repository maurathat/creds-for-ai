// Client-adapter tests for the Credence API client (Product P0). Run: bun test
import { describe, expect, test } from "bun:test";
import { ApiError, createHttpClient } from "../src/lib/credence-api/client";
import type { ProcurementForm } from "../src/lib/credence-api/types";

type Call = { url: string; method: string; body: unknown };

function fakeFetch(routes: Record<string, { status?: number; body: unknown }>) {
  const calls: Call[] = [];
  const fetchImpl = async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    calls.push({ url, method, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const route = routes[`${method} ${url}`];
    if (!route)
      return new Response(JSON.stringify({ error: "NOT_FOUND", detail: url }), { status: 404 });
    return new Response(JSON.stringify(route.body), { status: route.status ?? 200 });
  };
  return { calls, fetchImpl };
}

const BASE = "http://api.test";
const FORM: ProcurementForm = {
  model_family: "qwen3-30b-a3b-instruct-2507",
  prompt: "Synthetic Credence test prompt.",
  max_total_cost_micro_trlusd: null,
  minimum_evidence_tier: 1,
  allowed_providers: ["local-qwen-provider", "nebius-token-factory"],
  allowed_precisions: null,
  allowed_quantizations: null,
  allowed_jurisdictions: ["FI", "US"],
  allowed_data_residencies: ["FI", "US"],
  facility_limit_micro_trlusd: 10_000_000,
  facility_drawn_micro_trlusd: 0,
};

describe("routes", () => {
  test("every logical operation maps to one route", async () => {
    const op = "op-abc";
    const digest = "sha256:" + "ab".repeat(32);
    const { calls, fetchImpl } = fakeFetch({
      "GET http://api.test/v0/health": { body: { mode: "offline" } },
      "GET http://api.test/v0/providers": { body: [] },
      "GET http://api.test/v0/procurement/presets": { body: [] },
      "POST http://api.test/v0/procurement/evaluate": { body: { mode: "dry_run" } },
      "POST http://api.test/v0/purchases": { body: { mode: "offline_replay", operation_id: op } },
      "GET http://api.test/v0/operations": { body: [] },
      [`GET http://api.test/v0/operations/${op}`]: { body: { operation_id: op } },
      [`GET http://api.test/v0/operations/${op}/exposure`]: { body: { operation_id: op } },
      [`GET http://api.test/v0/operations/${op}/payment`]: {
        body: { xrpl: { state: "not_submitted" } },
      },
      "GET http://api.test/v0/receipts": { body: [] },
      [`GET http://api.test/v0/receipts/${encodeURIComponent(digest)}`]: {
        body: { receipt_digest: digest },
      },
      "GET http://api.test/v0/xrpl/settlement-fixtures": { body: { kind: "ui-state-fixtures" } },
    });
    const client = createHttpClient(BASE + "/", fetchImpl);
    await client.health();
    await client.listProviders();
    await client.procurementPresets();
    await client.evaluateProcurement(FORM);
    await client.submitPurchase(FORM);
    await client.listOperations();
    await client.getOperation(op);
    await client.getAccountingExposure(op);
    await client.getPaymentStatus(op);
    await client.listReceipts();
    await client.getReceiptEvidence(digest);
    await client.xrplSettlementFixtures();
    expect(calls.map((c) => `${c.method} ${c.url.replace(BASE, "")}`)).toEqual([
      "GET /v0/health",
      "GET /v0/providers",
      "GET /v0/procurement/presets",
      "POST /v0/procurement/evaluate",
      "POST /v0/purchases",
      "GET /v0/operations",
      `GET /v0/operations/${op}`,
      `GET /v0/operations/${op}/exposure`,
      `GET /v0/operations/${op}/payment`,
      "GET /v0/receipts",
      `GET /v0/receipts/${encodeURIComponent(digest)}`,
      "GET /v0/xrpl/settlement-fixtures",
    ]);
    // The form is sent as-is: amounts stay integers; nothing is added or computed client-side.
    expect(calls[3]?.body).toEqual(FORM);
    expect(calls[4]?.body).toEqual(FORM);
  });
});

describe("errors", () => {
  test("API errors keep the server's code and detail", async () => {
    const { fetchImpl } = fakeFetch({
      "POST http://api.test/v0/procurement/evaluate": {
        status: 422,
        body: { error: "INVALID_PROCUREMENT", detail: "MALFORMED_COUNTRY_CODE" },
      },
    });
    const client = createHttpClient(BASE, fetchImpl);
    const error = await client.evaluateProcurement(FORM).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).code).toBe("INVALID_PROCUREMENT");
    expect((error as ApiError).detail).toBe("MALFORMED_COUNTRY_CODE");
  });

  test("an unknown operation is a 404 ApiError", async () => {
    const client = createHttpClient(BASE, fakeFetch({}).fetchImpl);
    const error = await client.getOperation("op-missing").catch((e: unknown) => e);
    expect((error as ApiError).status).toBe(404);
  });

  test("an unreachable API is reported as API_UNREACHABLE", async () => {
    const client = createHttpClient(BASE, async () => {
      throw new TypeError("fetch failed");
    });
    const error = await client.health().catch((e: unknown) => e);
    expect((error as ApiError).code).toBe("API_UNREACHABLE");
    expect((error as ApiError).status).toBe(0);
  });
});

describe("response retrieval", () => {
  test("501 from the offline API means not connected, never a response", async () => {
    const op = "op-abc";
    const { calls, fetchImpl } = fakeFetch({
      [`POST http://api.test/v0/operations/${op}/response`]: {
        status: 501,
        body: { error: "RESPONSE_RETRIEVAL_NOT_CONNECTED", detail: "not connected" },
      },
    });
    const client = createHttpClient(BASE, fetchImpl);
    const authorization = { operation_id: op, action: "retrieve", signature: "from-the-agent" };
    const result = await client.retrieveAuthorizedResponse(op, authorization);
    expect(result).toEqual({
      available: false,
      code: "RESPONSE_RETRIEVAL_NOT_CONNECTED",
      detail: "not connected",
    });
    // The client forwards the agent's authorization unchanged; it never creates one.
    expect(calls[0]?.body).toEqual(authorization);
  });

  test("any 2xx retrieval in P0 is treated as a contract violation", async () => {
    const op = "op-abc";
    const { fetchImpl } = fakeFetch({
      [`POST http://api.test/v0/operations/${op}/response`]: { body: { response: "bytes" } },
    });
    const client = createHttpClient(BASE, fetchImpl);
    const error = await client.retrieveAuthorizedResponse(op, {}).catch((e: unknown) => e);
    expect((error as ApiError).code).toBe("UNEXPECTED_RESPONSE");
  });
});
