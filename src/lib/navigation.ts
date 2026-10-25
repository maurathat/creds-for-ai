// Navigation for the app shell. The primary journey holds only the Claw Street workflow pages,
// which read the Credence API. The original prototype pages keep their seeded data and code but
// sit outside that journey, behind a collapsed group, and carry a prototype banner.

export const PRIMARY_NAV = [
  { to: "/", label: "Overview", tag: "" },
  { to: "/market", label: "Marketplace", tag: "" },
  { to: "/procure", label: "Agent Purchase", tag: "" },
  { to: "/credit", label: "Credit & Payments", tag: "" },
  { to: "/receipts", label: "Evidence", tag: "" },
  { to: "/activity", label: "Activity", tag: "" },
] as const;

/** Detail pages of the same journey: every purchase, and the XRPL status vocabulary. */
export const DETAIL_NAV = [
  { to: "/operations", label: "Purchases", tag: "" },
  { to: "/settlement", label: "XRPL status", tag: "" },
] as const;

/** Integrations that are not live in this build. Shown only as not connected. */
export const NOT_LIVE_INTEGRATIONS = [
  { name: "XRPL ledger payments", detail: "No XRPL transaction is built, signed or submitted." },
  { name: "QuickNode XRPL reads", detail: "No ledger read is connected." },
  { name: "t54 purchases", detail: "No t54 purchase path is connected." },
  { name: "Verifiable Intent", detail: "No Verifiable Intent credential is issued or checked." },
  { name: "x402 payments", detail: "No x402 payment is made." },
] as const;

export const PROTOTYPE_NAV = [
  { to: "/prototype-home", label: "Original landing page", tag: "PROTO" },
  { to: "/overview", label: "Overview", tag: "PROTO" },
  { to: "/providers", label: "Providers", tag: "PROTO" },
  { to: "/reputation", label: "Reputation", tag: "PROTO" },
  { to: "/reservations", label: "Reservations", tag: "PROTO" },
  { to: "/forwards", label: "Forwards", tag: "PROTO" },
  { to: "/secondary-market", label: "Secondary Market", tag: "PROTO" },
  { to: "/price-index", label: "Price Index", tag: "PROTO" },
  { to: "/machine-credit", label: "Machine Credit", tag: "PROTO" },
  { to: "/settings", label: "Settings", tag: "PROTO" },
] as const;

export const PROTOTYPE_BANNER =
  "Prototype page with seeded data from the original design. Nothing here is live: there is no " +
  "XRPL Mainnet settlement, no live lending and no active marketplace. Amounts labelled RLUSD on " +
  "this page are illustrative seeded values; Credence uses tRLUSD, a test token.";

export function isPrototypePath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return PROTOTYPE_NAV.some((item) => item.to === path);
}
