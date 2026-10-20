// Presentation helpers for Credence API data. Formatting and labels only: no rule here decides
// eligibility, settlement or authorization. Every state and code shown comes from the API.

import type { EvidenceTierInfo, OperationState, OutcomeClass, XrplSettlementState } from "./types";

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
