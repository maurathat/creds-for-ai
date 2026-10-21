// P0a claim corrections: navigation, connection badges, XRPL labels, purchase action and
// provenance. Run: bun test
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ConnectionBadges } from "../src/components/status";
import { ProvenanceLegend } from "../src/components/credence";
import {
  isPrototypePath,
  PRIMARY_NAV,
  PROTOTYPE_BANNER,
  PROTOTYPE_NAV,
} from "../src/lib/navigation";
import type { ProcurementEvaluation } from "../src/lib/credence-api/types";
import { purchaseAction, XRPL_STATE_LABEL, XRPL_STATE_TONE } from "../src/lib/credence-api/view";

describe("navigation", () => {
  test("the primary journey holds only the workflow pages", () => {
    expect(PRIMARY_NAV.map((n) => n.to)).toEqual([
      "/market",
      "/procure",
      "/operations",
      "/credit",
      "/receipts",
      "/settlement",
    ]);
  });

  test("seeded prototype pages are outside the primary journey and labelled", () => {
    const primary = new Set<string>(PRIMARY_NAV.map((n) => n.to));
    for (const page of ["/overview", "/forwards", "/secondary-market", "/prototype-home"]) {
      expect(primary.has(page)).toBe(false);
      expect(isPrototypePath(page)).toBe(true);
    }
    expect(PROTOTYPE_NAV.every((n) => n.tag === "PROTO")).toBe(true);
    expect(isPrototypePath("/market")).toBe(false);
    expect(isPrototypePath("/overview/")).toBe(true);
  });

  test("the prototype banner disclaims mainnet settlement, live lending and a live market", () => {
    expect(PROTOTYPE_BANNER).toContain("seeded data");
    expect(PROTOTYPE_BANNER).toContain("no XRPL Mainnet settlement");
    expect(PROTOTYPE_BANNER).toContain("no live lending");
    expect(PROTOTYPE_BANNER).toContain("no active marketplace");
    expect(PROTOTYPE_BANNER).toContain("tRLUSD, a test token");
  });
});

describe("connection badges", () => {
  const render = (api: Parameters<typeof ConnectionBadges>[0]["api"]) =>
    renderToStaticMarkup(<ConnectionBadges api={api} />);

  test("a healthy API never produces an XRPL-connected claim", () => {
    const html = render({ kind: "ok", mode: "offline" });
    expect(html).toContain("API: available (offline)");
    expect(html).toContain("XRPL: not connected");
    expect(html).not.toMatch(/XRPL connected|XRPL: connected/);
  });

  test("API availability and XRPL status are separate badges in every API state", () => {
    for (const api of [{ kind: "checking" }, { kind: "unreachable" }] as const) {
      const html = render(api);
      expect(html).toContain("XRPL: not connected · no payments submitted");
    }
    expect(render({ kind: "unreachable" })).toContain("API: unreachable");
  });
});

describe("XRPL settlement labels", () => {
  test("not_submitted says no payment exists", () => {
    expect(XRPL_STATE_LABEL.not_submitted).toBe("Not submitted · no XRPL payment");
    expect(XRPL_STATE_TONE.not_submitted).toBe("neutral");
  });

  test("all six states keep a label", () => {
    expect(Object.keys(XRPL_STATE_LABEL).sort()).toEqual(
      [
        "expired_not_included",
        "not_submitted",
        "pending_confirmation",
        "unknown_reconciliation_required",
        "validated_failure",
        "validated_success",
      ].sort(),
    );
  });
});

function evaluation(changes: Partial<ProcurementEvaluation> & { cap?: number | null }) {
  const { cap = null, ...rest } = changes;
  return {
    form: { max_total_cost_micro_trlusd: cap },
    matching_preset: "scenario-a-general",
    chosen_provider_id: "nebius-token-factory",
    ...rest,
  } as unknown as ProcurementEvaluation;
}

describe("purchase action", () => {
  test("a preset opens its recording, labelled as such", () => {
    const action = purchaseAction(evaluation({}));
    expect(action).toEqual({
      label: "View recorded purchase",
      enabled: true,
      note: "Opens the recorded offline test execution for scenario-a-general. No purchase is made.",
    });
  });

  test("nothing is offered before a dry run or when no offer qualifies", () => {
    expect(purchaseAction(undefined).enabled).toBe(false);
    expect(purchaseAction(evaluation({ chosen_provider_id: null })).enabled).toBe(false);
  });

  test("a custom policy cannot purchase: live purchases are not connected", () => {
    const action = purchaseAction(evaluation({ matching_preset: null }));
    expect(action.enabled).toBe(false);
    expect(action.label).toBe("Live purchase not connected");
  });

  test("a price cap is preview-only", () => {
    const action = purchaseAction(evaluation({ cap: 100, matching_preset: null }));
    expect(action.enabled).toBe(false);
    expect(action.note).toContain("preview-only");
  });

  test("no label ever says submit or buy", () => {
    const actions = [
      purchaseAction(undefined),
      purchaseAction(evaluation({})),
      purchaseAction(evaluation({ matching_preset: null })),
      purchaseAction(evaluation({ cap: 1 })),
    ];
    for (const a of actions) expect(a.label).not.toMatch(/submit|buy/i);
  });
});

describe("provenance", () => {
  test("live evidence, offline test executions and future live operations are distinct", () => {
    const html = renderToStaticMarkup(
      <ProvenanceLegend kinds={["live_evidence", "offline_test"]} />,
    );
    expect(html).toContain("Recorded live evidence");
    expect(html).toContain("Recorded offline test execution");
    expect(html).toContain("Live operation (not connected)");
  });

  test("the not-connected live kind is always shown", () => {
    const html = renderToStaticMarkup(<ProvenanceLegend kinds={["offline_test"]} />);
    expect(html).toContain("Live operation (not connected)");
    expect(html).not.toContain("Recorded live evidence");
  });
});
