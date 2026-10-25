import { describe, expect, it } from "vitest";
import { ATTACKS, SIM_DRAW } from "../simulation";

describe("credit simulation", () => {
  it("conforming draw is 10.46 tRLUSD", () => expect(SIM_DRAW).toBe(10.46));
  it("has six attack cases", () => expect(ATTACKS).toHaveLength(6));
  it("authority, provider and limit attacks fail at Authorization", () => {
    for (const k of ["provider", "expired", "overlimit"]) expect(ATTACKS.find((a) => a.key === k)?.failAt).toBe(0);
  });
  it("replay fails at Receipt; model and precision fail at Verification", () => {
    expect(ATTACKS.find((a) => a.key === "replay")?.failAt).toBe(1);
    expect(ATTACKS.find((a) => a.key === "model")?.failAt).toBe(2);
    expect(ATTACKS.find((a) => a.key === "precision")?.failAt).toBe(2);
  });
});
