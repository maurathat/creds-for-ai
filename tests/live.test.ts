// I2a integrated offline service: client routes, session header, pasted-JSON parsing, the
// prepare action and the prompt digest. Run: bun test
import { describe, expect, test } from "bun:test";
import { ApiError, createHttpClient } from "../src/lib/credence-api/client";
import { promptDigest, shellQuote } from "../src/lib/credence-api/session";
import type { IntegrationHealth, ProcurementEvaluation } from "../src/lib/credence-api/types";
import {
  livePurchaseAction,
  parseResponseAuthorization,
  parseSignedObject,
} from "../src/lib/credence-api/view";

const BASE = "http://api.test";

function recordingFetch(status = 200, body: unknown = {}) {
  const calls: { url: string; method: string; headers: Record<string, string> }[] = [];
  const fetchImpl = async (url: string, init?: RequestInit) => {
    calls.push({
      url,
      method: init?.method ?? "GET",
      headers: (init?.headers ?? {}) as Record<string, string>,
    });
    if (status === 204) return new Response(null, { status });
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
  };
  return { calls, fetchImpl };
}

describe("live client", () => {
  test("live routes send the session token as a bearer header and nowhere else", async () => {
    const { calls, fetchImpl } = recordingFetch();
    const client = createHttpClient(BASE, fetchImpl, () => "session-123");
    await client.liveSession();
    await client.listLiveOperations("op-a");
    await client.getLiveReceipt("sha256:ab");
    await client.preparePurchase({
      model_family: "m",
      max_total_cost_micro_trlusd: null,
      minimum_evidence_tier: 1,
      allowed_providers: ["p"],
      allowed_precisions: null,
      allowed_quantizations: null,
      allowed_jurisdictions: ["US"],
      allowed_data_residencies: ["US"],
      prompt_digest: "sha256:00",
    });
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      `GET ${BASE}/v0/live/session`,
      `GET ${BASE}/v0/live/operations?after=op-a`,
      `GET ${BASE}/v0/live/receipts/sha256%3Aab`,
      `POST ${BASE}/v0/live/purchases/prepare`,
    ]);
    for (const c of calls) {
      expect(c.headers["authorization"]).toBe("Bearer session-123");
      expect(c.url).not.toContain("session-123");
    }
  });

  test("without a session token no live request is made", async () => {
    const { calls, fetchImpl } = recordingFetch();
    const client = createHttpClient(BASE, fetchImpl, () => null);
    await expect(client.liveSession()).rejects.toBeInstanceOf(ApiError);
    expect(calls).toHaveLength(0);
  });

  test("the recorded P0 routes stay unauthenticated", async () => {
    const { calls, fetchImpl } = recordingFetch();
    await createHttpClient(BASE, fetchImpl, () => "session-123").listOperations();
    expect(calls[0]?.headers["authorization"]).toBeUndefined();
  });

  test("retrieve returns the response text; acknowledge is 204", async () => {
    const text = recordingFetch(200, "Synthetic offline mock reply");
    expect(
      await createHttpClient(BASE, text.fetchImpl, () => "t").postLiveResponse("op-1", {}),
    ).toEqual({ kind: "retrieved", text: "Synthetic offline mock reply" });
    const ack = recordingFetch(204);
    expect(
      await createHttpClient(BASE, ack.fetchImpl, () => "t").postLiveResponse("op-1", {}),
    ).toEqual({ kind: "acknowledged" });
  });

  test("API refusal codes pass through unchanged", async () => {
    const { fetchImpl } = recordingFetch(409, { error: "PREPARATION_STALE", detail: "again" });
    const client = createHttpClient(BASE, fetchImpl, () => "t");
    const error = await client
      .submitSignedPurchase({
        preparation_id: "prep-1",
        prompt: "x",
        signature: {
          object_type: "credence.signed_object",
          schema_version: "1",
          object_digest: "d",
          key_id: "k",
          signature: "s",
        },
      })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("PREPARATION_STALE");
  });
});

describe("pasted agent material", () => {
  const signed = {
    object_type: "credence.signed_object",
    schema_version: "1",
    object_digest: "sha256:" + "a".repeat(64),
    key_id: "ed25519:" + "b".repeat(64),
    signature: "c".repeat(128),
  };

  test("a SignedObject is accepted exactly", () => {
    expect(parseSignedObject(JSON.stringify(signed))).toEqual(signed);
  });

  test("anything else is refused, including extra members such as a key", () => {
    expect(() => parseSignedObject(JSON.stringify({ ...signed, seed: "00" }))).toThrow();
    expect(() => parseSignedObject(JSON.stringify({ ...signed, object_type: "x" }))).toThrow();
    expect(() => parseSignedObject("[]")).toThrow();
    expect(() => parseSignedObject("not json")).toThrow();
  });

  test("a ResponseAuthorization is accepted exactly", () => {
    const auth = {
      operation_id: "op-1",
      action: "retrieve",
      agent_key_id: "ed25519:00",
      nonce: "0".repeat(32),
      expires_at: "2026-10-20T00:00:00Z",
      signature: "00",
    };
    expect(parseResponseAuthorization(JSON.stringify(auth))).toEqual(auth);
    expect(() => parseResponseAuthorization(JSON.stringify({ ...auth, extra: "x" }))).toThrow();
  });
});

describe("prepare action", () => {
  const integrated: IntegrationHealth = {
    integrated_service: true,
    providers: "offline_mock",
    providers_note: "mock",
    live_provider_execution: false,
    buyer_price_cap: "preview_only",
    xrpl: "not_connected",
  };
  const evaluation = (chosen: string | null, cap: number | null) =>
    ({
      chosen_provider_id: chosen,
      form: { max_total_cost_micro_trlusd: cap },
    }) as unknown as ProcurementEvaluation;

  test("enabled only with the service, a session, a choice and no price cap", () => {
    expect(livePurchaseAction(evaluation("p", null), integrated, true).enabled).toBe(true);
    expect(
      livePurchaseAction(evaluation("p", null), { integrated_service: false }, true).enabled,
    ).toBe(false);
    expect(livePurchaseAction(evaluation("p", null), integrated, false).enabled).toBe(false);
    expect(livePurchaseAction(evaluation(null, null), integrated, true).enabled).toBe(false);
    const capped = livePurchaseAction(evaluation("p", 5), integrated, true);
    expect(capped.enabled).toBe(false);
    expect(capped.note).toContain("preview-only");
  });

  test("the label names the offline mock providers", () => {
    expect(livePurchaseAction(undefined, integrated, true).label).toContain("offline mock");
  });
});

describe("prompt digest", () => {
  test("is SHA-256 of the exact UTF-8 bytes, as Core's payload digest", async () => {
    expect(await promptDigest("abc")).toBe(
      "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(await promptDigest("é")).toBe(
      "sha256:" + new Bun.CryptoHasher("sha256").update("é").digest("hex"),
    );
  });

  test("shell quoting survives single quotes", () => {
    expect(shellQuote("it's")).toBe("'it'\\''s'");
  });
});
