import { describe, expect, it } from "vitest";
import { FACILITY, PRIOR_BALANCE, TRANSACTIONS, UTILIZATION, VIU_SPOT, REPAYMENTS } from "../credence";

describe("facility demo data adds up", () => {
  it("limit is 500.00", () => expect(FACILITY.limit).toBe(500));
  it("outstanding = PASS draws + prior unpaid balance", () => {
    const pass = TRANSACTIONS.filter((t) => t.outcome === "PASS").reduce((s, t) => s + t.rlusd, 0);
    expect(FACILITY.outstanding).toBeCloseTo(pass + PRIOR_BALANCE, 2);
    expect(FACILITY.outstanding).toBe(137.6);
  });
  it("available = limit − outstanding", () => expect(FACILITY.available).toBe(362.4));
  it("utilization = outstanding / limit", () => expect(UTILIZATION).toBe(27.5));
  it("every PASS draw is priced at 0.436 per VIU", () => {
    expect(VIU_SPOT).toBe(0.436);
    for (const t of TRANSACTIONS.filter((t) => t.outcome === "PASS"))
      expect(t.rlusd).toBeCloseTo(t.viu * 0.436, 2);
  });
  it("past repayments are paid, one November 2026 repayment is scheduled", () => {
    const today = "2026-10-25";
    for (const r of REPAYMENTS.filter((r) => r.due < today)) expect(r.status).not.toBe("Scheduled");
    expect(REPAYMENTS.filter((r) => r.due.startsWith("2026-11") && r.status === "Scheduled")).toHaveLength(1);
  });
});
