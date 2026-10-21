// Presentation helpers for Credence API data. Formatting and labels only: no rule here decides
// eligibility, settlement or authorization. Every state and code shown comes from the API.

import type {
  EvidenceTierInfo,
  IntegrationHealth,
  OperationState,
  OutcomeClass,
  ProcurementEvaluation,
  SignedObjectJson,
  XrplSettlementState,
} from "./types";

export const MICRO_PER_TOKEN = 1_000_000;

/** Integer micro-tRLUSD as a tRLUSD decimal string, with integer arithmetic only. */
export function formatTrlusd(micro: number): string {
  if (!Number.isSafeInteger(micro)) throw new RangeError(`not an integer amount: ${micro}`);
  const sign = micro < 0 ? "-" : "";
  const abs = Math.abs(micro);
  const whole = Math.floor(abs / MICRO_PER_TOKEN);
  const fraction = String(abs % MICRO_PER_TOKEN).padStart(6, "0");
  return `${sign}${whole.toLocaleString("en-US")}.${fraction}`;
}

export function formatMicro(micro: number): string {
  if (!Number.isSafeInteger(micro)) throw new RangeError(`not an integer amount: ${micro}`);
  return micro.toLocaleString("en-US");
}

/** Build plan: the UI shows the first 8 hex characters of a digest. */
export function shortDigest(digest: string | null | undefined): string {
  if (!digest) return "—";
  const at = digest.indexOf(":");
  const prefix = at >= 0 ? digest.slice(0, at + 1) : "";
  const hex = at >= 0 ? digest.slice(at + 1) : digest;
  return hex.length > 8 ? `${prefix}${hex.slice(0, 8)}…` : digest;
}

export type Tone = "neutral" | "pass" | "reject" | "warn" | "info" | "roadmap";

export const OUTCOME_LABEL: Record<OutcomeClass, string> = {
  pending: "Pending",
  accounting_settled: "Accounting settled",
  rejected: "Rejected",
  released: "Released",
  interrupted: "Interrupted",
  unknown: "Unknown",
  disputed: "Disputed",
};

export const OUTCOME_TONE: Record<OutcomeClass, Tone> = {
  pending: "info",
  accounting_settled: "pass",
  rejected: "reject",
  released: "neutral",
  interrupted: "warn",
  unknown: "warn",
  disputed: "reject",
};

/** Journal state labels. `settled` is shown as accounting settlement, never as a payment. */
export const STATE_LABEL: Record<OperationState, string> = {
  intent: "intent",
  reserved: "reserved",
  executing: "executing",
  delivered: "delivered",
  settled: "accounting_settled",
  retrieved: "retrieved",
  acknowledged: "acknowledged",
  no_qualifying_offer: "no_qualifying_offer",
  policy_rejected: "policy_rejected",
  released_undelivered: "released_undelivered",
  expired: "expired",
  abandoned: "abandoned",
  unknown: "unknown",
  delivery_failed: "delivery_failed",
  disputed: "disputed",
  late: "late",
};

export function tierTone(tier: EvidenceTierInfo["tier"]): Tone {
  return tier >= 3 ? "roadmap" : tier === 2 ? "pass" : tier === 1 ? "info" : "neutral";
}

export function tierLabel(evidence: EvidenceTierInfo): string {
  return `Tier ${evidence.tier} · ${evidence.name}`;
}

export const XRPL_STATE_TONE: Record<XrplSettlementState, Tone> = {
  not_submitted: "neutral",
  pending_confirmation: "info",
  validated_success: "pass",
  validated_failure: "reject",
  expired_not_included: "warn",
  unknown_reconciliation_required: "warn",
};

export type LifecycleStageView = {
  state: OperationState;
  label: string;
  status: "done" | "stopped" | "not_reached";
};

/** Where the lifecycle stopped: the last reached stage is "stopped" unless the run ended there. */
export function lifecycleView(
  stages: { state: OperationState; label: string; reached: boolean }[],
  finalState: OperationState,
): LifecycleStageView[] {
  const lastReached = stages.reduce((last, s, i) => (s.reached ? i : last), -1);
  const endedOnLifecycle = stages.some((s) => s.state === finalState);
  return stages.map((s, i) => ({
    state: s.state,
    label: s.label,
    status: !s.reached
      ? "not_reached"
      : i === lastReached && !endedOnLifecycle
        ? "stopped"
        : "done",
  }));
}

export function humanize(code: string): string {
  return code.replace(/_/g, " ");
}

/** XRPL settlement labels. `not_submitted` says plainly that no payment exists. */
export const XRPL_STATE_LABEL: Record<XrplSettlementState, string> = {
  not_submitted: "Not submitted · no XRPL payment",
  pending_confirmation: "Pending confirmation",
  validated_success: "Validated: success",
  validated_failure: "Validated: failure",
  expired_not_included: "Expired: confirmed not included",
  unknown_reconciliation_required: "Unknown: reconciliation required",
};

/** The kinds of data the app can show, and the one it cannot show yet. */
export const PROVENANCE = {
  live_evidence: {
    label: "Recorded live evidence",
    detail:
      "Receipts from the real 2026-10-19 run: a Nebius Token Factory response witnessed by Credence's gateway, and a local Qwen delivery signed by its provider key.",
  },
  offline_test: {
    label: "Recorded offline test execution",
    detail:
      "Real Integration service code run offline with fake providers, synthetic responses and TEST keys. No provider was called and nothing was paid.",
  },
  integrated_offline: {
    label: "Integrated offline service",
    detail:
      "Real Integration service embedded in the API process, with offline mock providers (no provider is called), TEST provider keys and configured demo prices. The agent signs each purchase outside the browser. No XRPL payment.",
  },
  live_operation: {
    label: "Live provider execution (not enabled)",
    detail: "Live provider calls, XRPL payments and lending are not enabled. None is shown here.",
  },
} as const;

export type PurchaseAction = { label: string; enabled: boolean; note: string };

/**
 * What the purchase button may do after a dry run. Only a policy matching a preset with a recorded
 * offline run can open that recording; nothing here starts a purchase.
 */
export function purchaseAction(evaluation: ProcurementEvaluation | undefined): PurchaseAction {
  if (!evaluation) {
    return {
      label: "View recorded purchase",
      enabled: false,
      note: "Run the Core policy dry run first.",
    };
  }
  if (evaluation.chosen_provider_id === null) {
    return {
      label: "View recorded purchase",
      enabled: false,
      note: "No offer qualifies under this policy, so there is nothing to purchase.",
    };
  }
  if (evaluation.form.max_total_cost_micro_trlusd !== null) {
    return {
      label: "No recorded run",
      enabled: false,
      note: "The price cap is preview-only: Core applied it in this dry run, but the purchase path cannot carry a buyer price cap yet.",
    };
  }
  if (evaluation.matching_preset !== null) {
    return {
      label: "View recorded purchase",
      enabled: true,
      note: `Opens the recorded offline test execution for ${evaluation.matching_preset}. No purchase is made.`,
    };
  }
  return {
    label: "No recorded run",
    enabled: false,
    note: "No recorded offline run exists for this policy. An integrated offline purchase (mock providers) can be prepared below.",
  };
}

/**
 * Whether an integrated offline purchase may be prepared after a dry run. Display only: the
 * service and Core decide; this only avoids offering a button the backend will refuse.
 */
export function livePurchaseAction(
  evaluation: ProcurementEvaluation | undefined,
  integration: IntegrationHealth | undefined,
  hasSession: boolean,
): PurchaseAction {
  const label = "Prepare purchase (offline mock providers)";
  if (!integration?.integrated_service) {
    return {
      label,
      enabled: false,
      note: "The API is not running the integrated service. Start it with `uv run python -m credence.api.offline_demo serve <demo-dir>`.",
    };
  }
  if (!hasSession) {
    return { label, enabled: false, note: "Enter the agent's session token first." };
  }
  if (!evaluation) return { label, enabled: false, note: "Run the Core policy dry run first." };
  if (evaluation.chosen_provider_id === null) {
    return { label, enabled: false, note: "No offer qualifies under this policy." };
  }
  if (evaluation.form.max_total_cost_micro_trlusd !== null) {
    return {
      label,
      enabled: false,
      note: "The price cap is preview-only. Clear it to purchase at each quote's own maximum.",
    };
  }
  return {
    label,
    enabled: true,
    note: "Core selects the offer again against the facility's real holds; the service stores the exact request for the agent to verify and sign outside this app. Nothing is reserved yet.",
  };
}

/** Parse a pasted C3A SignedObject. Refuses anything else, including extra members. */
export function parseSignedObject(text: string): SignedObjectJson {
  const value: unknown = JSON.parse(text);
  const members = ["object_type", "schema_version", "object_digest", "key_id", "signature"];
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).sort().join() !== [...members].sort().join() ||
    !members.every((m) => typeof (value as Record<string, unknown>)[m] === "string")
  ) {
    throw new Error("Not a SignedObject: expected exactly " + members.join(", "));
  }
  if ((value as SignedObjectJson).object_type !== "credence.signed_object") {
    throw new Error("Not a credence.signed_object");
  }
  return value as SignedObjectJson;
}

/** Parse a pasted ResponseAuthorization (I1e). Refuses anything else. */
export function parseResponseAuthorization(text: string): Record<string, string> {
  const value: unknown = JSON.parse(text);
  const members = ["operation_id", "action", "agent_key_id", "nonce", "expires_at", "signature"];
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).sort().join() !== [...members].sort().join() ||
    !members.every((m) => typeof (value as Record<string, unknown>)[m] === "string")
  ) {
    throw new Error("Not a ResponseAuthorization: expected exactly " + members.join(", "));
  }
  return value as Record<string, string>;
}
