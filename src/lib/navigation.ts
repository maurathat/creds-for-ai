// Navigation for the app shell. The primary journey holds only the procurement workflow pages,
// which read the Credence API. The original prototype pages keep their seeded data and code but
// sit outside that journey, behind a collapsed group, and carry a prototype banner.

export const PRIMARY_NAV = [
  { to: "/market", label: "Inference Market", tag: "P0" },
  { to: "/procure", label: "Procurement", tag: "P0" },
  { to: "/operations", label: "Purchases", tag: "P0" },
  { to: "/credit", label: "Credit", tag: "P0" },
  { to: "/receipts", label: "Receipts", tag: "P0" },
  { to: "/settlement", label: "XRPL Settlement", tag: "P0" },
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
