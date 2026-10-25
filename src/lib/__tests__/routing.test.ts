import { describe, expect, it } from "vitest";
import { BIDS } from "../credence";
import { route } from "../routing";

describe("routing strategies pick the right best bid", () => {
  it("Cheapest = lowest price", () => expect(route("Cheapest", BIDS).best?.provider).toBe("Northstar Compute"));
  it("Fastest = lowest p50", () => expect(route("Fastest", BIDS).best?.provider).toBe("Lisbon Vector"));
  it("Verified = Tier 2+ then highest reputation", () => expect(route("Verified", BIDS).best?.provider).toBe("Sorbonne Tensor"));
  it("Sovereign EU = cheapest EU bid", () => expect(route("Sovereign EU", BIDS).best?.provider).toBe("Aurora Nord"));
  it("Credit-eligible = cheapest allowlisted bid", () => expect(route("Credit-eligible", BIDS).best?.provider).toBe("Northstar Compute"));
  it("ineligible bids carry a reason", () => {
    const r = route("Sovereign EU", BIDS).bids.find((b) => b.provider === "Northstar Compute");
    expect(r?.eligible).toBe(false);
    expect(r?.ineligibleReason).toBe("Not EU");
    expect(route("Verified", BIDS).bids.find((b) => b.provider === "Aurora Nord")?.ineligibleReason).toBe("Not Tier 2+");
  });
});
