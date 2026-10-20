// Presentation tests for lifecycle, outcome, settlement and money display (Product P0). Run: bun test
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LifecycleTrack, Money } from "../src/components/credence";
import type { LifecycleStage, OperationState, OutcomeClass } from "../src/lib/credence-api/types";
import {
  formatMicro,
  formatTrlusd,
  lifecycleView,
  OUTCOME_LABEL,
  OUTCOME_TONE,
  shortDigest,
  STATE_LABEL,
  XRPL_STATE_TONE,
} from "../src/lib/credence-api/view";

const LIFECYCLE: [OperationState, string][] = [
  ["intent", "intent"],
  ["reserved", "reserved"],
  ["executing", "executing"],
  ["delivered", "delivered"],
  ["settled", "accounting_settled"],
  ["retrieved", "retrieved"],
  ["acknowledged", "acknowledged"],
];

function stages(reachedThrough: number): LifecycleStage[] {
  return LIFECYCLE.map(([state, label], i) => ({
    state,
    label,
    reached: i <= reachedThrough,
    observed_in_snapshot: i <= reachedThrough,
  }));
}

describe("lifecycle", () => {
  test("a fully settled and acknowledged purchase is done at every stage", () => {
    const view = lifecycleView(stages(6), "acknowledged");
    expect(view.map((s) => s.status)).toEqual(Array(7).fill("done"));
    expect(view.map((s) => s.label)).toEqual(LIFECYCLE.map(([, l]) => l));
  });

  test("a settled purchase awaiting retrieval stops at accounting_settled without a warning", () => {
    const view = lifecycleView(stages(4), "settled");
    expect(view.map((s) => s.status)).toEqual([
      "done",
      "done",
      "done",
      "done",
      "done",
      "not_reached",
      "not_reached",
    ]);
  });

  test("an unknown outcome is marked as stopped where it left the lifecycle", () => {
    const view = lifecycleView(stages(2), "unknown");
    expect(view[2]).toEqual({ state: "executing", label: "executing", status: "stopped" });
    expect(view.slice(3).every((s) => s.status === "not_reached")).toBe(true);
  });

  test("a disputed delivery stops at delivered", () => {
    const view = lifecycleView(stages(3), "disputed");
    expect(view[3]?.status).toBe("stopped");
  });

  test("a rejected purchase reaches nothing", () => {
    const view = lifecycleView(stages(-1), "no_qualifying_offer");
    expect(view.every((s) => s.status === "not_reached")).toBe(true);
  });

  test("the rendered track shows accounting settlement, never payment", () => {
    const html = renderToStaticMarkup(
      <LifecycleTrack stages={stages(6)} finalState="acknowledged" />,
    );
    expect(html).toContain("accounting_settled");
    expect(html.toLowerCase()).not.toContain("paid");
    expect(html).not.toContain("XRPL");
    expect(html.match(/data-status="done"/g)?.length).toBe(7);
  });
});

describe("labels", () => {
  test("journal state settled is labelled accounting_settled", () => {
    expect(STATE_LABEL.settled).toBe("accounting_settled");
  });

  test("every required outcome class has a label and tone", () => {
    const required: OutcomeClass[] = [
      "pending",
      "accounting_settled",
      "rejected",
      "released",
      "interrupted",
      "unknown",
      "disputed",
    ];
    for (const outcome of required) {
      expect(OUTCOME_LABEL[outcome]).toBeTruthy();
      expect(OUTCOME_TONE[outcome]).toBeTruthy();
    }
    expect(OUTCOME_LABEL.accounting_settled).toBe("Accounting settled");
  });

  test("only validated success is shown as a pass on XRPL", () => {
    const passing = Object.entries(XRPL_STATE_TONE).filter(([, tone]) => tone === "pass");
    expect(passing).toEqual([["validated_success", "pass"]]);
    expect(XRPL_STATE_TONE.not_submitted).toBe("neutral");
  });
});

describe("money and digests", () => {
  test("micro-tRLUSD is formatted with integer arithmetic", () => {
    expect(formatTrlusd(0)).toBe("0.000000");
    expect(formatTrlusd(2)).toBe("0.000002");
    expect(formatTrlusd(436)).toBe("0.000436");
    expect(formatTrlusd(10_000_000)).toBe("10.000000");
    expect(formatTrlusd(9_007_199_254_740_991)).toBe("9,007,199,254.740991");
    expect(formatMicro(9_999_914)).toBe("9,999,914");
  });

  test("non-integer amounts are refused", () => {
    expect(() => formatTrlusd(1.5)).toThrow(RangeError);
    expect(() => formatMicro(Number.NaN)).toThrow(RangeError);
  });

  test("money renders as tRLUSD, a test token", () => {
    const html = renderToStaticMarkup(<Money micro={86} />);
    expect(html).toContain("tRLUSD");
    expect(html).toContain("test token");
    expect(html).not.toMatch(/(?<!t)RLUSD/);
  });

  test("digests show the first 8 hex characters", () => {
    expect(shortDigest("sha256:" + "4a4903a1" + "0".repeat(56))).toBe("sha256:4a4903a1…");
    expect(shortDigest(null)).toBe("—");
  });
});
