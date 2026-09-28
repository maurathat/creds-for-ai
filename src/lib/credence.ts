// Seeded demo data for the Credence Markets prototype.
// All values are fictional demo data unless explicitly noted as Live MVP state.

export type Maturity = "live" | "simulated" | "roadmap";

export const FACILITY = {
  id: "FAC-XRPL-0x7C41",
  borrower: "ResearchBot-17",
  borrowerAccount: "rG7bK2Qm9xDq4Yv3Lp8ZnWc5Ht6Fs1Ab2",
  limit: 500,
  available: 362.4,
  outstanding: 137.6,
  purpose: "Verified inference only",
  provider: "Northstar Compute",
  providerAccount: "rN9sTq4Lm2Kd7Yb1Xv8Zc3Hp5Ws6Fg2Aq",
  model: "Meridian-70B-Instruct (open weights)",
  digest: "sha256:9f3c1ab7…d42e08",
  profileDigest: "sha256:41b90e6c…7ac215",
  precision: "BF16",
  evidenceTier: "Tier 2",
  rootAuthority: "Ledger hardware signer",
  opAuthority: "Agent delegate — ResearchBot-17",
  ledger: "XRPL Mainnet (demo)",
  settlement: "RLUSD",
  status: "Active",
  apr: 9.4,
  openedAt: "2026-07-14",
  nextReview: "2026-10-31",
};

export const UTILIZATION = +((FACILITY.outstanding / FACILITY.limit) * 100).toFixed(1);

export const CORE_FLOW = [
  { step: 1, title: "Agent requests inference", detail: "ResearchBot-17 submits a scoped inference order against its facility." },
  { step: 2, title: "Credence checks facility", detail: "Limit, purpose, approved provider and execution profile are evaluated." },
  { step: 3, title: "Kessai serialization", detail: "Request is canonically serialized and bound to the execution profile digest." },
  { step: 4, title: "Provider returns Tier-2 receipt", detail: "Northstar Compute signs a provider-declared and bound delivery receipt." },
  { step: 5, title: "Credence verifies binding", detail: "Request digest, response digest and declared profile must match the order." },
  { step: 6, title: "Credence approves settlement", detail: "Policy engine co-signs; settlement is released in RLUSD." },
  { step: 7, title: "XRPL facility state updates", detail: "Available balance and facility references are written to the ledger." },
  { step: 8, title: "Reputation updates", detail: "Borrower repayment record and provider conformity score are updated." },
];

export const UTIL_SERIES = [
  { d: "Jul 14", util: 0, spend: 0 },
  { d: "Jul 28", util: 6.2, spend: 31 },
  { d: "Aug 11", util: 11.8, spend: 59 },
  { d: "Aug 25", util: 17.4, spend: 87 },
  { d: "Sep 08", util: 22.1, spend: 110.5 },
  { d: "Sep 15", util: 24.9, spend: 124.5 },
  { d: "Sep 22", util: 26.4, spend: 132 },
  { d: "Sep 28", util: UTILIZATION, spend: FACILITY.outstanding },
];

export const VIU_SPOT_SERIES = [
  { d: "Aug 01", global: 0.412, eu: 0.451, us: 0.298 },
  { d: "Aug 08", global: 0.418, eu: 0.455, us: 0.301 },
  { d: "Aug 15", global: 0.406, eu: 0.447, us: 0.294 },
  { d: "Aug 22", global: 0.399, eu: 0.44, us: 0.289 },
  { d: "Aug 29", global: 0.407, eu: 0.449, us: 0.292 },
  { d: "Sep 05", global: 0.421, eu: 0.462, us: 0.303 },
  { d: "Sep 12", global: 0.433, eu: 0.471, us: 0.311 },
  { d: "Sep 19", global: 0.428, eu: 0.468, us: 0.308 },
  { d: "Sep 26", global: 0.436, eu: 0.477, us: 0.314 },
];

export const VIU_SPOT = 0.436;

export const REPAYMENTS = [
  { id: "RP-014", due: "2026-10-05", principal: 40.0, interest: 0.31, status: "Scheduled" },
  { id: "RP-013", due: "2026-09-21", principal: 40.0, interest: 0.34, status: "Scheduled" },
  { id: "RP-012", due: "2026-09-07", principal: 35.0, interest: 0.29, status: "Paid" },
  { id: "RP-011", due: "2026-08-24", principal: 30.0, interest: 0.24, status: "Paid" },
  { id: "RP-010", due: "2026-08-10", principal: 25.0, interest: 0.19, status: "Paid" },
];

export type Txn = {
  id: string;
  ts: string;
  viu: number;
  rlusd: number;
  provider: string;
  profile: string;
  tier: string;
  outcome: "PASS" | "REJECT";
  reason?: string;
  xrpl?: string;
};

export const TRANSACTIONS: Txn[] = [
  { id: "REQ-4821", ts: "2026-09-28 04:51:12Z", viu: 24, rlusd: 10.46, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "PASS", xrpl: "E91C…7F2A" },
  { id: "REQ-4820", ts: "2026-09-28 03:18:44Z", viu: 12, rlusd: 5.23, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "PASS", xrpl: "A44D…10B7" },
  { id: "REQ-4819", ts: "2026-09-27 22:02:09Z", viu: 60, rlusd: 26.16, provider: "Helios Grid", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "REJECT", reason: "Provider not on facility allowlist" },
  { id: "REQ-4818", ts: "2026-09-27 19:44:51Z", viu: 40, rlusd: 17.44, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "PASS", xrpl: "C7B2…9E41" },
  { id: "REQ-4817", ts: "2026-09-27 16:30:27Z", viu: 40, rlusd: 17.44, provider: "Northstar Compute", profile: "OpenCoder-34B / BF16", tier: "Tier 2", outcome: "REJECT", reason: "Declared model differs from approved execution profile" },
  { id: "REQ-4816", ts: "2026-09-27 12:11:03Z", viu: 18, rlusd: 7.85, provider: "Northstar Compute", profile: "Meridian-70B / FP8", tier: "Tier 2", outcome: "REJECT", reason: "Declared precision FP8 ≠ approved BF16" },
  { id: "REQ-4815", ts: "2026-09-27 09:07:38Z", viu: 32, rlusd: 13.95, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "PASS", xrpl: "11F8…3D9C" },
  { id: "REQ-4814", ts: "2026-09-26 23:52:14Z", viu: 32, rlusd: 13.95, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "REJECT", reason: "Replayed delivery receipt — request digest already settled" },
  { id: "REQ-4813", ts: "2026-09-26 18:20:55Z", viu: 900, rlusd: 392.4, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "REJECT", reason: "Facility overspend — exceeds available 362.40 RLUSD" },
  { id: "REQ-4812", ts: "2026-09-26 15:06:31Z", viu: 20, rlusd: 8.72, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "REJECT", reason: "Agent delegate authority expired at 2026-09-26 12:00Z" },
  { id: "REQ-4811", ts: "2026-09-26 11:41:02Z", viu: 48, rlusd: 20.93, provider: "Northstar Compute", profile: "Meridian-70B / BF16", tier: "Tier 2", outcome: "PASS", xrpl: "7A0E…B412" },
];

export type AttackCase = {
  id: string;
  name: string;
  input: string;
  check: string;
  outcome: "PASS" | "REJECT";
  note: string;
};

export const ATTACK_CASES: AttackCase[] = [
  { id: "V-0", name: "Valid conforming request", input: "Northstar Compute · Meridian-70B-Instruct · BF16 · 24 VIU", check: "Allowlist · profile digest · request/response binding · limit · authority", outcome: "PASS", note: "Settled 10.46 RLUSD; facility state written to XRPL." },
  { id: "V-1", name: "Wrong provider", input: "Helios Grid · Meridian-70B-Instruct · BF16 · 60 VIU", check: "Provider allowlist bound to facility", outcome: "REJECT", note: "Provider account not co-signed into facility terms." },
  { id: "V-2", name: "Wrong model declaration", input: "Northstar · OpenCoder-34B · BF16 · 40 VIU", check: "Artifact digest vs approved execution profile", outcome: "REJECT", note: "Receipt declares a different artifact digest than contracted." },
  { id: "V-3", name: "Wrong precision declaration", input: "Northstar · Meridian-70B · FP8 · 18 VIU", check: "Precision field of execution profile digest", outcome: "REJECT", note: "FP8 delivery cannot settle against a BF16 order." },
  { id: "V-4", name: "Replayed delivery receipt", input: "Receipt for REQ-4815 resubmitted", check: "Request digest uniqueness ledger", outcome: "REJECT", note: "Kessai request digest already consumed by a settled draw." },
  { id: "V-5", name: "Facility overspend", input: "900 VIU · 392.40 RLUSD", check: "Available balance 362.40 RLUSD", outcome: "REJECT", note: "Draw exceeds available credit; no partial fill authorized." },
  { id: "V-6", name: "Expired / unauthorized spend", input: "Delegate key past expiry window", check: "Operational authority validity + scope", outcome: "REJECT", note: "Requires root (Ledger hardware) re-delegation before spend." },
];

export type Provider = {
  id: string;
  name: string;
  country: string;
  region: "US" | "EU" | "APAC";
  city: string;
  residency: string;
  model: string;
  family: string;
  artifact: string;
  precision: string;
  tier: "Tier 1" | "Tier 2" | "Tier 2+";
  price: number;
  latency: number;
  reputation: number;
  creditEligible: boolean;
  completedViu: number;
  conforming: number;
  disputes: number;
  slaPerf: number;
  availability: number;
  tiersSupported: string[];
  jurisdictions: string[];
  buyerRating: number;
};

export const PROVIDERS: Provider[] = [
  { id: "PRV-01", name: "Northstar Compute", country: "United States", region: "US", city: "Ashburn, VA", residency: "US only", model: "Meridian-70B-Instruct", family: "Meridian", artifact: "sha256:9f3c1ab7…d42e08", precision: "BF16", tier: "Tier 2", price: 0.436, latency: 412, reputation: 96, creditEligible: true, completedViu: 184_200, conforming: 99.7, disputes: 3, slaPerf: 99.1, availability: 99.95, tiersSupported: ["Tier 1", "Tier 2"], jurisdictions: ["US", "CA"], buyerRating: 4.8 },
  { id: "PRV-02", name: "Sorbonne Tensor", country: "France", region: "EU", city: "Paris", residency: "EU only", model: "Meridian-70B-Instruct", family: "Meridian", artifact: "sha256:9f3c1ab7…d42e08", precision: "BF16", tier: "Tier 2+", price: 0.478, latency: 388, reputation: 94, creditEligible: true, completedViu: 121_640, conforming: 99.4, disputes: 5, slaPerf: 98.4, availability: 99.9, tiersSupported: ["Tier 1", "Tier 2", "Tier 2+"], jurisdictions: ["FR", "EU"], buyerRating: 4.7 },
  { id: "PRV-03", name: "Rheinwerk AI", country: "Germany", region: "EU", city: "Frankfurt", residency: "EU only", model: "Meridian-70B-Instruct", family: "Meridian", artifact: "sha256:9f3c1ab7…d42e08", precision: "BF16", tier: "Tier 2", price: 0.469, latency: 402, reputation: 92, creditEligible: true, completedViu: 96_310, conforming: 99.1, disputes: 7, slaPerf: 97.8, availability: 99.82, tiersSupported: ["Tier 1", "Tier 2"], jurisdictions: ["DE", "EU"], buyerRating: 4.5 },
  { id: "PRV-04", name: "Aurora Nord", country: "Finland", region: "EU", city: "Kajaani", residency: "EU only", model: "Meridian-70B-Instruct", family: "Meridian", artifact: "sha256:9f3c1ab7…d42e08", precision: "BF16", tier: "Tier 2", price: 0.441, latency: 465, reputation: 90, creditEligible: true, completedViu: 74_880, conforming: 98.8, disputes: 9, slaPerf: 97.2, availability: 99.7, tiersSupported: ["Tier 1", "Tier 2"], jurisdictions: ["FI", "EU"], buyerRating: 4.4 },
  { id: "PRV-05", name: "Straits Silicon", country: "Singapore", region: "APAC", city: "Jurong", residency: "SG / APAC", model: "Meridian-70B-Instruct", family: "Meridian", artifact: "sha256:9f3c1ab7…d42e08", precision: "FP8", tier: "Tier 1", price: 0.287, latency: 259, reputation: 86, creditEligible: false, completedViu: 212_400, conforming: 96.9, disputes: 21, slaPerf: 96.1, availability: 99.6, tiersSupported: ["Tier 1"], jurisdictions: ["SG", "MY"], buyerRating: 4.1 },
  { id: "PRV-06", name: "Kanto Inference KK", country: "Japan", region: "APAC", city: "Osaka", residency: "JP only", model: "OpenCoder-34B", family: "OpenCoder", artifact: "sha256:c1704fe2…9b3d77", precision: "FP8", tier: "Tier 2", price: 0.314, latency: 301, reputation: 91, creditEligible: true, completedViu: 138_900, conforming: 99.0, disputes: 6, slaPerf: 98.1, availability: 99.88, tiersSupported: ["Tier 1", "Tier 2"], jurisdictions: ["JP", "KR"], buyerRating: 4.6 },
  { id: "PRV-07", name: "Helios Grid", country: "United States", region: "US", city: "Reno, NV", residency: "US only", model: "Meridian-70B-Instruct", family: "Meridian", artifact: "sha256:9f3c1ab7…d42e08", precision: "BF16", tier: "Tier 1", price: 0.352, latency: 498, reputation: 78, creditEligible: false, completedViu: 58_100, conforming: 94.2, disputes: 34, slaPerf: 92.6, availability: 98.9, tiersSupported: ["Tier 1"], jurisdictions: ["US"], buyerRating: 3.6 },
  { id: "PRV-08", name: "Lisbon Vector", country: "Portugal", region: "EU", city: "Lisbon", residency: "EU only", model: "OpenCoder-34B", family: "OpenCoder", artifact: "sha256:c1704fe2…9b3d77", precision: "BF16", tier: "Tier 2+", price: 0.502, latency: 355, reputation: 93, creditEligible: true, completedViu: 66_740, conforming: 99.5, disputes: 2, slaPerf: 98.9, availability: 99.91, tiersSupported: ["Tier 1", "Tier 2", "Tier 2+"], jurisdictions: ["PT", "EU"], buyerRating: 4.7 },
];

export const ROUTING_STRATEGIES = [
  { key: "cheapest", label: "Cheapest", detail: "Lowest RLUSD/VIU, ignores evidence tier." },
  { key: "fastest", label: "Fastest", detail: "Lowest p50 latency across eligible listings." },
  { key: "verified", label: "Verified", detail: "Tier 2+ receipts and ≥99% conformity only." },
  { key: "sovereign", label: "Sovereign EU", detail: "EU residency and EU-only jurisdictions." },
  { key: "credit", label: "Credit Eligible", detail: "Providers settleable from a Credence facility." },
];

export const ORDER_REQUIREMENT = {
  id: "ORD-2261",
  quantity: 100,
  model: "Meridian-70B-Instruct",
  precision: "BF16",
  residency: "EU data residency",
  tier: "Tier 2+",
  window: "2026-10-02 → 2026-10-09",
};

export const BIDS = [
  { id: "BID-01", provider: "Sorbonne Tensor", price: 0.478, sla: "p50 388ms / 99.5% avail", tier: "Tier 2+", capacity: "420 VIU free", reputation: 94, best: true },
  { id: "BID-02", provider: "Rheinwerk AI", price: 0.469, sla: "p50 402ms / 99.0% avail", tier: "Tier 2", capacity: "260 VIU free", reputation: 92, best: false },
  { id: "BID-03", provider: "Lisbon Vector", price: 0.502, sla: "p50 355ms / 99.6% avail", tier: "Tier 2+", capacity: "180 VIU free", reputation: 93, best: false },
  { id: "BID-04", provider: "Aurora Nord", price: 0.441, sla: "p50 465ms / 98.5% avail", tier: "Tier 2", capacity: "600 VIU free", reputation: 90, best: false },
];

export const RESERVATIONS = [
  { id: "RSV-1041", profile: "Meridian-70B / BF16 / EU", month: "November 2026", qty: 250, price: 0.462, provider: "Sorbonne Tensor", tier: "Tier 2+", window: "2026-11-01 → 2026-11-30", used: 0, status: "Confirmed" },
  { id: "RSV-1038", profile: "Meridian-70B / BF16 / EU", month: "October 2026", qty: 400, price: 0.455, provider: "Rheinwerk AI", tier: "Tier 2", window: "2026-10-01 → 2026-10-31", used: 118, status: "Delivering" },
  { id: "RSV-1033", profile: "OpenCoder-34B / FP8 / JP", month: "October 2026", qty: 150, price: 0.309, provider: "Kanto Inference KK", tier: "Tier 2", window: "2026-10-05 → 2026-10-25", used: 42, status: "Delivering" },
  { id: "RSV-1029", profile: "Meridian-70B / BF16 / US", month: "September 2026", qty: 300, price: 0.428, provider: "Northstar Compute", tier: "Tier 2", window: "2026-09-01 → 2026-09-30", used: 287, status: "Settling" },
  { id: "RSV-1024", profile: "Meridian-70B / BF16 / EU", month: "December 2026", qty: 500, price: 0.471, provider: "Aurora Nord", tier: "Tier 2", window: "2026-12-01 → 2026-12-31", used: 0, status: "Confirmed" },
];

export const FORWARDS = [
  { id: "FWD-2026-11-A", profile: "Meridian-70B / BF16 / EU", month: "Nov 2026", qty: 1000, price: 0.468, provider: "Sorbonne Tensor", buyer: "ResearchBot-17", tier: "Tier 2+", status: "Open" },
  { id: "FWD-2026-11-B", profile: "Meridian-70B / BF16 / US", month: "Nov 2026", qty: 750, price: 0.431, provider: "Northstar Compute", buyer: "Atlas Agent Fund", tier: "Tier 2", status: "Open" },
  { id: "FWD-2026-12-A", profile: "Meridian-70B / BF16 / EU", month: "Dec 2026", qty: 1500, price: 0.479, provider: "Rheinwerk AI", buyer: "ResearchBot-17", tier: "Tier 2", status: "Partially delivered" },
  { id: "FWD-2027-01-A", profile: "OpenCoder-34B / FP8 / JP", month: "Jan 2027", qty: 2000, price: 0.322, provider: "Kanto Inference KK", buyer: "Meridian Labs Ops", tier: "Tier 2", status: "Open" },
  { id: "FWD-2026-10-C", profile: "Meridian-70B / BF16 / EU", month: "Oct 2026", qty: 600, price: 0.458, provider: "Aurora Nord", buyer: "Northwind Research", tier: "Tier 2", status: "Delivered" },
];

export const FORWARD_CURVE = [
  { m: "Oct 26", eu: 0.458, us: 0.425 },
  { m: "Nov 26", eu: 0.468, us: 0.431 },
  { m: "Dec 26", eu: 0.479, us: 0.44 },
  { m: "Jan 27", eu: 0.486, us: 0.447 },
  { m: "Feb 27", eu: 0.482, us: 0.444 },
  { m: "Mar 27", eu: 0.475, us: 0.438 },
];

export const ORDER_BOOK = {
  bids: [
    { price: 0.461, qty: 240, delivery: "Nov 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.458, qty: 400, delivery: "Nov 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.452, qty: 150, delivery: "Dec 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.447, qty: 900, delivery: "Dec 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.318, qty: 500, delivery: "Jan 2027", profile: "OpenCoder-34B / FP8 / JP" },
  ],
  asks: [
    { price: 0.466, qty: 180, delivery: "Nov 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.471, qty: 320, delivery: "Nov 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.478, qty: 260, delivery: "Dec 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.484, qty: 750, delivery: "Dec 2026", profile: "Meridian-70B / BF16 / EU" },
    { price: 0.329, qty: 620, delivery: "Jan 2027", profile: "OpenCoder-34B / FP8 / JP" },
  ],
};

export const INDEX_SERIES = [
  { d: "Aug 01", mg: 0.412, meu: 0.451, ous: 0.298 },
  { d: "Aug 08", mg: 0.418, meu: 0.455, ous: 0.301 },
  { d: "Aug 15", mg: 0.406, meu: 0.447, ous: 0.294 },
  { d: "Aug 22", mg: 0.399, meu: 0.44, ous: 0.289 },
  { d: "Aug 29", mg: 0.407, meu: 0.449, ous: 0.292 },
  { d: "Sep 05", mg: 0.421, meu: 0.462, ous: 0.303 },
  { d: "Sep 12", mg: 0.433, meu: 0.471, ous: 0.311 },
  { d: "Sep 19", mg: 0.428, meu: 0.468, ous: 0.308 },
  { d: "Sep 26", mg: 0.436, meu: 0.477, ous: 0.314 },
];

export const INDEXES = [
  { code: "CVII-M70-BF16-G", name: "CVII Meridian-70B BF16 Global", value: 0.436, chg: 1.87, contributors: 14, volume: "1.42M VIU" },
  { code: "CVII-M70-BF16-EU", name: "CVII Meridian-70B BF16 EU", value: 0.477, chg: 1.92, contributors: 6, volume: "0.61M VIU" },
  { code: "CVII-OC34-FP8-US", name: "CVII OpenCoder-34B FP8 US", value: 0.314, chg: 1.95, contributors: 5, volume: "0.38M VIU" },
];

export const FACILITY_CLASSES = [
  { name: "Inference Facility", status: "live" as Maturity, limit: 500, used: 137.6, detail: "Verified inference purchases against approved execution profiles." },
  { name: "API Facility", status: "roadmap" as Maturity, limit: 250, used: 61.2, detail: "Metered data API and tool-call spend with receipt binding." },
  { name: "Agent-to-Agent Trade Credit", status: "roadmap" as Maturity, limit: 150, used: 28.5, detail: "Net-30 credit lines between autonomous counterparties." },
  { name: "Receivables Advance", status: "roadmap" as Maturity, limit: 400, used: 210.0, detail: "Advance against verified receipts owed to the agent." },
];

export const MERCHANT_CATEGORIES = [
  "Verified inference (Tier 2+)",
  "Data APIs — market & filings",
  "Vector storage & retrieval",
  "Tool-call execution",
  "Agent-to-agent services",
  "Software subscriptions",
];

export const OPERATING_PROFILE = {
  monthlyRevenue: 1_842.5,
  receivables: 613.2,
  utilization: 34.2,
  repaymentHistory: "18 / 18 on time",
  avgDso: 11.4,
};

export const REVENUE_SERIES = [
  { m: "Apr", rev: 940, cost: 410 },
  { m: "May", rev: 1120, cost: 495 },
  { m: "Jun", rev: 1285, cost: 540 },
  { m: "Jul", rev: 1410, cost: 602 },
  { m: "Aug", rev: 1666, cost: 688 },
  { m: "Sep", rev: 1842, cost: 741 },
];

export const RECEIPTS = [
  {
    id: "RCPT-9F2A",
    facility_id: FACILITY.id,
    borrower_id: "ResearchBot-17",
    provider_id: "PRV-01 · Northstar Compute",
    execution_profile_digest: "sha256:41b90e6c…7ac215",
    request_digest: "sha256:6d82ff10…c4390b",
    response_digest: "sha256:ba5711d9…08f7e2",
    output_token_count: 48_120,
    declared_execution_profile: "Meridian-70B-Instruct · BF16 · ctx 32k",
    evidence_tier: "Tier 2 — provider-declared and bound",
    provider_signature: "ed25519:4a17…ce09",
    completion_timestamp: "2026-09-28T04:51:12Z",
    xrpl_tx: "E91C7A4B20DF8813C5A6…7F2A",
    viu: 24,
    rlusd: 10.46,
  },
  {
    id: "RCPT-A44D",
    facility_id: FACILITY.id,
    borrower_id: "ResearchBot-17",
    provider_id: "PRV-01 · Northstar Compute",
    execution_profile_digest: "sha256:41b90e6c…7ac215",
    request_digest: "sha256:91ac0b47…7e11da",
    response_digest: "sha256:2f60cd83…b19a45",
    output_token_count: 23_640,
    declared_execution_profile: "Meridian-70B-Instruct · BF16 · ctx 32k",
    evidence_tier: "Tier 2 — provider-declared and bound",
    provider_signature: "ed25519:8c02…11fa",
    completion_timestamp: "2026-09-28T03:18:44Z",
    xrpl_tx: "A44D1093FE22B70C48D1…10B7",
    viu: 12,
    rlusd: 5.23,
  },
  {
    id: "RCPT-C7B2",
    facility_id: FACILITY.id,
    borrower_id: "ResearchBot-17",
    provider_id: "PRV-01 · Northstar Compute",
    execution_profile_digest: "sha256:41b90e6c…7ac215",
    request_digest: "sha256:0b41e9c2…5ad831",
    response_digest: "sha256:77e1ab08…931cf4",
    output_token_count: 79_900,
    declared_execution_profile: "Meridian-70B-Instruct · BF16 · ctx 32k",
    evidence_tier: "Tier 2 — provider-declared and bound",
    provider_signature: "ed25519:e77b…9a41",
    completion_timestamp: "2026-09-27T19:44:51Z",
    xrpl_tx: "C7B29E41008AC3D1F702…9E41",
    viu: 40,
    rlusd: 17.44,
  },
];

export const EVIDENCE_LADDER = [
  { label: "Requested", state: "yes", note: "Buyer order captured and Kessai-serialized." },
  { label: "Provider-declared and bound", state: "yes", note: "Tier 2 — signed receipt binds request, response and declared profile." },
  { label: "Loaded artifact measured", state: "no", note: "Tier 3 — roadmap. Requires attested artifact measurement at load." },
  { label: "Physical GPU execution proven", state: "no", note: "Tier 4 — roadmap. Requires hardware attestation chain." },
] as const;

export const ROOT_ACTIONS = [
  { action: "Raise facility limit", root: true, detail: "New limit must be co-signed by the Ledger hardware signer." },
  { action: "Change approved providers", root: true, detail: "Allowlist is part of facility terms." },
  { action: "Change execution profile", root: true, detail: "Model artifact and precision are contractual." },
  { action: "Withdraw unrestricted funds", root: true, detail: "Non-purpose-bound outflow is never delegated." },
  { action: "Rotate / revoke agent authority", root: true, detail: "Delegation keys are issued and revoked at root." },
  { action: "In-policy inference purchase", root: false, detail: "Proceeds under delegated operational authority — no device touch." },
  { action: "Schedule repayment from revenue", root: false, detail: "In-policy, purpose-bound settlement flow." },
];
