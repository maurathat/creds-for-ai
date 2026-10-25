import { FACILITY_ALLOWLIST, type Bid } from "@/lib/credence";

export const STRATEGIES = ["Cheapest", "Fastest", "Verified", "Sovereign EU", "Credit-eligible"] as const;
export type Strategy = (typeof STRATEGIES)[number];

export type RankedBid = Bid & { eligible: boolean; ineligibleReason?: string };
export type RoutingResult = { bids: RankedBid[]; best: RankedBid | null; reason: string };

function eligibility(s: Strategy, b: Bid): string | undefined {
  if (s === "Verified" && b.tier !== "Tier 2+") return "Not Tier 2+";
  if (s === "Sovereign EU" && b.region !== "EU") return "Not EU";
  if (s === "Credit-eligible" && !FACILITY_ALLOWLIST.includes(b.provider)) return "Not on facility allowlist";
  return undefined;
}

const byPrice = (a: Bid, b: Bid) => a.price - b.price;

export function route(strategy: Strategy, bids: readonly Bid[]): RoutingResult {
  const ranked: RankedBid[] = bids.map((b) => {
    const r = eligibility(strategy, b);
    return { ...b, eligible: !r, ineligibleReason: r };
  });
  const pool = ranked.filter((b) => b.eligible);
  const sorted = [...pool].sort(
    strategy === "Fastest"
      ? (a, b) => a.p50 - b.p50
      : strategy === "Verified"
        ? (a, b) => b.reputation - a.reputation || byPrice(a, b)
        : byPrice,
  );
  const best = sorted[0] ?? null;
  const reason = !best
    ? "no eligible bid"
    : strategy === "Fastest"
      ? `lowest p50 latency (${best.p50} ms)`
      : strategy === "Verified"
        ? `Tier 2+ with highest reputation (${best.reputation}) at ${best.price.toFixed(3)} tRLUSD/VIU`
        : strategy === "Sovereign EU"
          ? `lowest-priced EU provider at ${best.price.toFixed(3)} tRLUSD/VIU`
          : strategy === "Credit-eligible"
            ? `lowest-priced provider on the facility allowlist at ${best.price.toFixed(3)} tRLUSD/VIU`
            : `lowest price at ${best.price.toFixed(3)} tRLUSD/VIU`;
  return { bids: ranked, best, reason };
}
