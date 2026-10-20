// Response shapes of the Credence API, Product P0 (contracts/API-CONTRACT.md in the parent repo).
// The web app displays these; it decides nothing. Amounts are integer micro-tRLUSD.

export type CanonicalObject = Record<string, unknown>;

export type EvidenceTierInfo = {
  tier: 0 | 1 | 2 | 3;
  name: string;
  description: string;
};

export type Health = {
  mode: "offline";
  baseline: string;
  core_dry_run: boolean;
  live_purchases: boolean;
  ledger: { connected: boolean; network: string | null; note: string };
  currency: { code: "tRLUSD"; unit: string; micro_units_per_token: number; note: string };
};

export type Provider = {
  provider_id: string;
  display_name: string;
  role: string;
  relationship: string;
  evidence_capability: string;
  model_family: string;
  model_identifier: string;
  execution_profile: {
    digest: string;
    fields: Record<string, string | null>;
    not_asserted: string[];
    context_min_tokens: number;
    object: CanonicalObject;
  };
  service_class: {
    digest: string;
    delivery_mode: string;
    service_tier: string;
    jurisdiction: string | null;
    data_residency: string[];
    object: CanonicalObject;
  };
  evidence: EvidenceTierInfo;
  quote: {
    price_kind: "configured_demo";
    price_label: string;
    quote_id: string;
    digest: string;
    input_price_per_million_micro_trlusd: number;
    output_price_per_million_micro_trlusd: number;
    max_input_tokens: number;
    max_output_tokens: number;
    max_total_cost_micro_trlusd: number;
    valid_until: string;
    object: CanonicalObject;
  };
  availability: {
    status: "not_monitored";
    note: string;
    last_recorded_delivery: {
      completed_at: string;
      receipt_digest: string;
      source: string;
      latency_ms: number | null;
    };
  };
  declared_metadata?: {
    source: string;
    observed_at: string;
    note: string;
    quantization: string;
    context_length: number;
    regions: { country_code: string; name: string }[];
    pricing: { prompt: string; completion: string };
  };
};

export type ProcurementForm = {
  model_family: string;
  prompt: string;
  max_total_cost_micro_trlusd: number | null;
  minimum_evidence_tier: number;
  allowed_providers: string[];
  allowed_precisions: string[] | null;
  allowed_quantizations: string[] | null;
  allowed_jurisdictions: string[];
  allowed_data_residencies: string[];
  facility_limit_micro_trlusd: number;
  facility_drawn_micro_trlusd: number;
};

export type ProcurementPreset = {
  preset_id: string;
  title: string;
  form: ProcurementForm;
  recorded_operation_id: string | null;
};

export type OfferEvaluation = {
  provider_id: string;
  display_name: string;
  quote_id: string;
  evidence: EvidenceTierInfo;
  max_total_cost_micro_trlusd: number;
  price_kind: "configured_demo";
  qualified: boolean;
  reason_code: string | null;
  reason: string | null;
  reason_details: string[];
  policy_decision: { digest: string; object: CanonicalObject };
};

export type ProcurementEvaluation = {
  mode: "dry_run";
  notice: string;
  evaluated_at: string;
  form: ProcurementForm;
  matching_preset: string | null;
  procurement_class: { digest: string; object: CanonicalObject };
  facility: {
    facility_id: string;
    limit_micro_trlusd: number;
    drawn_micro_trlusd: number;
    held_micro_trlusd: number;
    note: string;
  };
  routing_rule: string;
  offers: OfferEvaluation[];
  qualifying_count: number;
  competition: string;
  chosen_provider_id: string | null;
  chosen_quote_id: string | null;
};

export type PurchaseSubmission =
  | { mode: "offline_replay"; code: string; detail: string; operation_id: string }
  | { mode: "not_available"; code: string; detail: string; operation_id: null };

export type OperationState =
  | "intent"
  | "reserved"
  | "executing"
  | "delivered"
  | "settled"
  | "retrieved"
  | "acknowledged"
  | "no_qualifying_offer"
  | "policy_rejected"
  | "released_undelivered"
  | "expired"
  | "abandoned"
  | "unknown"
  | "delivery_failed"
  | "disputed"
  | "late";

export type OutcomeClass =
  | "pending"
  | "accounting_settled"
  | "rejected"
  | "released"
  | "interrupted"
  | "unknown"
  | "disputed";

export type Exposure = {
  limit_micro_trlusd: number;
  drawn_micro_trlusd: number;
  held_micro_trlusd: number;
  headroom_micro_trlusd: number;
};

export type OperationSummary = {
  operation_id: string;
  run_id: string;
  title: string;
  summary: string;
  facility_id: string;
  provider_id: string | null;
  state: OperationState;
  outcome_class: OutcomeClass;
  interrupted: boolean;
  reason_code: string | null;
  detail: string | null;
  receipt_digest: string | null;
  drawn_micro_trlusd: number;
  held_micro_trlusd: number;
  procurement_preset: string | null;
};

export type OperationStep = {
  step: string;
  note: string;
  at: string;
  journal_state: OperationState | null;
  state_text: string | null;
  core: {
    exposure: Exposure;
    reservation_status: string | null;
    release_reason: string | null;
    delivery_attempt: {
      begun_at: string;
      execution_claimed_at: string | null;
      unknown_cause: string | null;
    } | null;
    chain_head: string | null;
    receipt_accounting_settled: boolean | null;
  };
  response_retained: boolean;
  response_available_to_agent: boolean;
  response_utf8?: string;
  reconciliations?: { before: OperationState; after: OperationState }[];
};

export type LifecycleStage = {
  state: OperationState;
  label: string;
  reached: boolean;
  observed_in_snapshot: boolean;
};

export type OperationDetail = OperationSummary & {
  source: { kind: "recorded_offline_run"; fixture: string; provenance: string; harness: string };
  state_text: string;
  lifecycle: LifecycleStage[];
  steps: OperationStep[];
  operation: Record<string, string | null>;
  objects: Record<string, CanonicalObject | null>;
  quote_max_total_cost_micro_trlusd: number | null;
  core_records: {
    settlement_disputes: Record<string, string>[];
    late_delivery_disputes: Record<string, string>[];
    no_delivery_releases: Record<string, string>[];
  };
  response_authorization: { required: boolean; note: string };
};

export type AccountingExposure = {
  operation_id: string;
  facility_id: string;
  source: string;
  invariant: string;
  terms: Record<"limit" | "drawn" | "held" | "headroom", string>;
  facility: {
    minimum_evidence_tier: EvidenceTierInfo;
    allowed_providers: string[];
    status: string;
    maturity_at: string;
    xrpl_loan_id: string | null;
  };
  current: Exposure & { step: string; at: string; journal_state: OperationState | null };
  timeline: (Exposure & { step: string; at: string; journal_state: OperationState | null })[];
};

export type ReceiptSummary = {
  receipt_digest: string;
  source: "recorded_live_observation" | "recorded_offline_run";
  source_label: string;
  operation_id: string | null;
  provider_id: string;
  evidence: EvidenceTierInfo;
  price_micro_trlusd: number;
  completed_at: string;
  verifier_outcome: string | null;
  accounting_settled: boolean | null;
};

export type EvidenceCheck = {
  check: string;
  result: "pass" | "fail" | "not_applicable";
  detail: string;
};

export type ReceiptEvidence = {
  receipt_digest: string;
  source: ReceiptSummary["source"];
  source_label: string;
  operation_id: string | null;
  provider_id: string;
  provider: { display_name: string; role: string; relationship: string } | null;
  model_identifier: string;
  execution_profile_digest: string;
  evidence: EvidenceTierInfo;
  evidence_ladder: (EvidenceTierInfo & { present: boolean; implemented: boolean })[];
  receipt: CanonicalObject;
  gateway_signature: CanonicalObject;
  gateway_signer: { key_id: string; role: string; subject: string } | null;
  provider_attestation: CanonicalObject | null;
  provider_signature: CanonicalObject | null;
  purchase_request: CanonicalObject;
  checks: EvidenceCheck[];
  checks_note: string;
  verifier: {
    outcome: string | null;
    reason_code: string | null;
    decision_digest: string | null;
    decision: CanonicalObject | null;
  };
  chain: {
    previous_receipt_digest: string | null;
    first_on_facility: boolean;
    accounting_settled: boolean | null;
    chain_head: string | null;
    is_chain_head: boolean;
    note: string;
  };
  price_micro_trlusd: number;
  input_token_count: number;
  output_token_count: number;
};

export type XrplSettlementState =
  | "not_submitted"
  | "pending_confirmation"
  | "validated_success"
  | "validated_failure"
  | "expired_not_included"
  | "unknown_reconciliation_required";

export type PaymentStatus = {
  operation_id: string;
  xrpl: {
    state: XrplSettlementState;
    source: "baseline";
    transaction_hash: string | null;
    detail: string;
  };
  accounting: { settlement_outcome: string | null; state: OperationState; note: string };
};

export type XrplStateFixture = {
  state: XrplSettlementState;
  label: string;
  meaning: string;
  operator_action: string;
  transaction_hash: null;
  ledger_index: null;
  last_ledger_sequence: null;
  engine_result: null;
};

export type XrplSettlementFixtures = {
  id: string;
  kind: "ui-state-fixtures";
  regenerable: boolean;
  fixture_notice: string;
  states: XrplStateFixture[];
};

export type ResponseRetrieval = {
  available: false;
  code: string;
  detail: string;
};
