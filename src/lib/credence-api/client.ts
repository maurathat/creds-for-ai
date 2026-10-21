// Narrow client for the Credence API (Product P0). One method per logical operation.
//
// The client only moves JSON. It holds no keys, signs nothing and makes no policy decision:
// procurement is evaluated by Core behind the API, and response retrieval needs an
// authorization signed by the agent outside the browser. When the accepted integration backend
// replaces the offline adapter, only the server behind these routes changes.
//
// I2a: the `live*` methods call the integrated offline service (/v0/live) with the agent's
// session token. The token authenticates API calls; it is not a signing key. Purchases and
// response access still need Ed25519 signatures the agent makes outside this app, which the
// client forwards unchanged.

import type {
  AccountingExposure,
  Health,
  OperationDetail,
  OperationSummary,
  PaymentStatus,
  ProcurementEvaluation,
  ProcurementForm,
  ProcurementPreset,
  Provider,
  PurchaseSubmission,
  ReceiptEvidence,
  ReceiptSummary,
  ResponseRetrieval,
  XrplSettlementFixtures,
  LiveFacility,
  LiveOperationDetail,
  LiveOperationExposure,
  LiveOperationPage,
  LivePayment,
  LiveReceipt,
  LiveReport,
  LiveResponseResult,
  LiveSession,
  PrepareBody,
  Preparation,
  SignedObjectJson,
} from "./types";

export const API_PREFIX = "/v0";
export const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

/** An agent-signed ResponseAuthorization, produced by the agent outside this app. Opaque here. */
export type SignedResponseAuthorization = Record<string, unknown>;

export interface CredenceClient {
  health(): Promise<Health>;
  listProviders(): Promise<Provider[]>;
  procurementPresets(): Promise<ProcurementPreset[]>;
  evaluateProcurement(form: ProcurementForm): Promise<ProcurementEvaluation>;
  submitPurchase(form: ProcurementForm): Promise<PurchaseSubmission>;
  listOperations(): Promise<OperationSummary[]>;
  getOperation(operationId: string): Promise<OperationDetail>;
  getAccountingExposure(operationId: string): Promise<AccountingExposure>;
  listReceipts(): Promise<ReceiptSummary[]>;
  getReceiptEvidence(receiptDigest: string): Promise<ReceiptEvidence>;
  retrieveAuthorizedResponse(
    operationId: string,
    authorization: SignedResponseAuthorization,
  ): Promise<ResponseRetrieval>;
  getPaymentStatus(operationId: string): Promise<PaymentStatus>;
  xrplSettlementFixtures(): Promise<XrplSettlementFixtures>;
  // I2a, integrated offline service. Each needs the agent session token.
  liveSession(): Promise<LiveSession>;
  liveFacilities(): Promise<LiveFacility[]>;
  preparePurchase(body: PrepareBody): Promise<Preparation>;
  getPreparation(preparationId: string): Promise<Preparation>;
  submitSignedPurchase(body: {
    preparation_id: string;
    prompt: string;
    signature: SignedObjectJson;
  }): Promise<LiveReport>;
  listLiveOperations(after?: string | null): Promise<LiveOperationPage>;
  getLiveOperation(operationId: string): Promise<LiveOperationDetail>;
  getLiveExposure(operationId: string): Promise<LiveOperationExposure>;
  getLivePayment(operationId: string): Promise<LivePayment>;
  getLiveReceipt(receiptDigest: string): Promise<LiveReceipt>;
  postLiveResponse(
    operationId: string,
    authorization: SignedResponseAuthorization,
  ): Promise<LiveResponseResult>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail: string,
  ) {
    super(`${status} ${code}: ${detail}`);
    this.name = "ApiError";
  }
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

async function errorFrom(response: Response): Promise<ApiError> {
  let code = "HTTP_ERROR";
  let detail = response.statusText;
  try {
    const body = (await response.json()) as { error?: unknown; detail?: unknown };
    if (typeof body.error === "string") code = body.error;
    if (typeof body.detail === "string") detail = body.detail;
    else if (body.detail !== undefined) detail = JSON.stringify(body.detail);
  } catch {
    // Non-JSON error body: keep the status text.
  }
  return new ApiError(response.status, code, detail);
}

export function createHttpClient(
  baseUrl: string = DEFAULT_API_BASE_URL,
  fetchImpl: FetchLike = (input, init) => fetch(input, init),
  sessionToken: () => string | null = () => null,
): CredenceClient {
  const root = baseUrl.replace(/\/+$/, "") + API_PREFIX;

  async function raw(path: string, init?: RequestInit): Promise<Response> {
    let response: Response;
    try {
      response = await fetchImpl(root + path, init);
    } catch (cause) {
      throw new ApiError(0, "API_UNREACHABLE", `No response from ${root}: ${String(cause)}`);
    }
    if (!response.ok) throw await errorFrom(response);
    return response;
  }

  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    return (await (await raw(path, init)).json()) as T;
  }

  function authed(init: RequestInit = {}): RequestInit {
    const token = sessionToken();
    if (!token) throw new ApiError(401, "AUTHENTICATION_REQUIRED", "No agent session token set.");
    return { ...init, headers: { ...(init.headers ?? {}), authorization: `Bearer ${token}` } };
  }

  const live = async <T>(path: string) => call<T>(`/live${path}`, authed());
  const livePost = async (path: string, body: unknown) =>
    raw(
      `/live${path}`,
      authed({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

  const post = <T>(path: string, body: unknown) =>
    call<T>(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  const op = (id: string) => `/operations/${encodeURIComponent(id)}`;

  return {
    health: () => call("/health"),
    listProviders: () => call("/providers"),
    procurementPresets: () => call("/procurement/presets"),
    evaluateProcurement: (form) => post("/procurement/evaluate", form),
    submitPurchase: (form) => post("/purchases", form),
    listOperations: () => call("/operations"),
    getOperation: (id) => call(op(id)),
    getAccountingExposure: (id) => call(`${op(id)}/exposure`),
    listReceipts: () => call("/receipts"),
    getReceiptEvidence: (digest) => call(`/receipts/${encodeURIComponent(digest)}`),
    async retrieveAuthorizedResponse(id, authorization) {
      try {
        await post<unknown>(`${op(id)}/response`, authorization);
      } catch (error) {
        if (error instanceof ApiError && error.status === 501) {
          return { available: false, code: error.code, detail: error.detail };
        }
        throw error;
      }
      // P0 has no route that returns response bytes; anything else is a contract violation.
      throw new ApiError(500, "UNEXPECTED_RESPONSE", "retrieval is not connected in P0");
    },
    getPaymentStatus: (id) => call(`${op(id)}/payment`),
    xrplSettlementFixtures: () => call("/xrpl/settlement-fixtures"),
    liveSession: () => live("/session"),
    liveFacilities: () => live("/facilities"),
    preparePurchase: async (body) =>
      (await (await livePost("/purchases/prepare", body)).json()) as Preparation,
    getPreparation: (id) => live(`/purchases/preparations/${encodeURIComponent(id)}`),
    submitSignedPurchase: async (body) =>
      (await (await livePost("/purchases/submit", body)).json()) as LiveReport,
    listLiveOperations: (after) =>
      live(after ? `/operations?after=${encodeURIComponent(after)}` : "/operations"),
    getLiveOperation: (id) => live(op(id)),
    getLiveExposure: (id) => live(`${op(id)}/exposure`),
    getLivePayment: (id) => live(`${op(id)}/payment`),
    getLiveReceipt: (digest) => live(`/receipts/${encodeURIComponent(digest)}`),
    async postLiveResponse(id, authorization) {
      const response = await livePost(`${op(id)}/response`, authorization);
      if (response.status === 204) return { kind: "acknowledged" };
      return { kind: "retrieved", text: await response.text() };
    },
  };
}

export function apiBaseUrl(): string {
  const configured = import.meta.env?.["VITE_CREDENCE_API_BASE_URL"] as string | undefined;
  return configured && configured.length > 0 ? configured : DEFAULT_API_BASE_URL;
}
