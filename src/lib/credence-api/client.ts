// Narrow client for the Credence API (Product P0). One method per logical operation.
//
// The client only moves JSON. It holds no keys, signs nothing and makes no policy decision:
// procurement is evaluated by Core behind the API, and response retrieval needs an
// authorization signed by the agent outside the browser. When the accepted integration backend
// replaces the offline adapter, only the server behind these routes changes.

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
): CredenceClient {
  const root = baseUrl.replace(/\/+$/, "") + API_PREFIX;

  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetchImpl(root + path, init);
    } catch (cause) {
      throw new ApiError(0, "API_UNREACHABLE", `No response from ${root}: ${String(cause)}`);
    }
    if (!response.ok) throw await errorFrom(response);
    return (await response.json()) as T;
  }

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
  };
}

export function apiBaseUrl(): string {
  const configured = import.meta.env?.["VITE_CREDENCE_API_BASE_URL"] as string | undefined;
  return configured && configured.length > 0 ? configured : DEFAULT_API_BASE_URL;
}
