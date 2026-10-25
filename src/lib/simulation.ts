import { priceFor } from "@/lib/credence";

export const SIM_STAGES = ["Authorization", "Receipt", "Verification", "Settlement"] as const;
export const SIM_STEP_MS = 700;
export const SIM_DRAW_VIU = 24;
export const SIM_DRAW = priceFor(SIM_DRAW_VIU); // 10.46 tRLUSD

export const PASS_DETAILS = [
  "Agent signature valid · within limit · provider + profile allowed",
  "Seeded Tier 2 receipt (simulated — no provider call)",
  "Request, response and declared profile match (simulated check)",
  `Facility drawn +${SIM_DRAW.toFixed(2)} tRLUSD (in-browser accounting simulation — no payment, nothing settled on XRPL)`,
];

export type Attack = { key: string; name: string; failAt: number; reason: string };

/** The six attack cases and the step at which each is rejected. */
export const ATTACKS: Attack[] = [
  { key: "provider", name: "Wrong provider", failAt: 0, reason: "Helios Grid is not on the facility allowlist" },
  { key: "expired", name: "Expired key", failAt: 0, reason: "Agent delegate key expired — root re-delegation required" },
  { key: "overlimit", name: "Over limit", failAt: 0, reason: "900 VIU (392.40 tRLUSD) exceeds available credit" },
  { key: "replay", name: "Replayed receipt", failAt: 1, reason: "Receipt request digest already consumed by REQ-4815" },
  { key: "model", name: "Wrong model", failAt: 2, reason: "Receipt declares OpenCoder-34B, facility approves Meridian-70B-Instruct" },
  { key: "precision", name: "FP8 vs BF16", failAt: 2, reason: "Declared precision FP8 ≠ approved BF16" },
];
