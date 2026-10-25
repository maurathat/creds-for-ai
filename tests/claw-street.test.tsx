// Claw Street UI checkpoint: brand lockup, unavailable integrations, purchase progression and
// the activity feed. Run: bun test
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BRAND, ClawStreetBot, ClawStreetHero, ClawStreetLockup } from "../src/components/brand";
import { NOT_LIVE_INTEGRATIONS, PRIMARY_NAV } from "../src/lib/navigation";
import type { LiveOperationDetail, OperationState } from "../src/lib/credence-api/types";
import {
  activityFeed,
  liveSteps,
  preSubmitSteps,
  PURCHASE_STEPS,
  stepStatuses,
} from "../src/lib/credence-api/view";

describe("brand", () => {
  test("the hierarchy and display line", () => {
    expect(BRAND).toMatchObject({
      product: "Claw Street",
      infrastructure: "Credence",
      company: "Kessai Labs",
      display: "Claw Street — Powered by Credence",
      accent: "#3DFF8F",
    });
  });

  test("the robot is the reference's 38 crisp pixels with the reference palette", () => {
    const svg = renderToStaticMarkup(<ClawStreetBot width={48} />);
    expect(svg).toContain('viewBox="0 0 24 19"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain("Claw Street bot: a pixel robot with two claws raised");
    expect(svg.match(/<rect /g)).toHaveLength(38);
    for (const colour of ["#3DFF8F", "#22E6FF", "#FF6FA8", "#FFC94A", "#EAF2F8", "#071421"]) {
      expect(svg).toContain(colour);
    }
    expect(svg.match(/filter="url\(#cs-glow-/g)).toHaveLength(3); // antenna and both eyes
  });

  test("lockups read CLAW STREET and POWERED BY CREDENCE", () => {
    for (const html of [
      renderToStaticMarkup(<ClawStreetLockup />),
      renderToStaticMarkup(<ClawStreetHero />),
    ]) {
      expect(html.replace(/<[^>]+>/g, "")).toContain("CLAW STREET");
      expect(html).toContain("POWERED BY CREDENCE");
      expect(html).toContain('aria-label="Claw Street — Powered by Credence"');
    }
  });
});

describe("unavailable integrations", () => {
  test("XRPL, QuickNode, t54, Verifiable Intent and x402 are listed as not live", () => {
    expect(NOT_LIVE_INTEGRATIONS.map((i) => i.name)).toEqual([
      "XRPL ledger payments",
      "QuickNode XRPL reads",
      "t54 purchases",
      "Verifiable Intent",
      "x402 payments",
    ]);
    for (const i of NOT_LIVE_INTEGRATIONS) expect(i.detail).toMatch(/^No /);
  });

  test("no primary screen is labelled as one of them", () => {
    const labels = PRIMARY_NAV.map((n) => n.label).join(" ");
    expect(labels).not.toMatch(/XRPL|QuickNode|t54|Verifiable|x402/);
  });
});

describe("purchase progression", () => {
  const lifecycle = (reached: OperationState[]) =>
    (
      [
        "intent",
        "reserved",
        "executing",
        "delivered",
        "settled",
        "retrieved",
        "acknowledged",
      ] as OperationState[]
    ).map((state) => ({ state, reached: reached.includes(state) }));

  test("before submission: dry run, preparation, signature", () => {
    expect(preSubmitSteps(false, false, false)).toBe(0);
    expect(preSubmitSteps(true, false, false)).toBe(1);
    expect(preSubmitSteps(true, true, false)).toBe(2);
    expect(preSubmitSteps(true, true, true)).toBe(3);
  });

  test("after submission, each step only from its persisted record", () => {
    const all: OperationState[] = [
      "intent",
      "reserved",
      "executing",
      "delivered",
      "settled",
      "retrieved",
      "acknowledged",
    ];
    expect(liveSteps(lifecycle(all), "acknowledged")).toEqual({
      done: PURCHASE_STEPS.length,
      stopped: false,
    });
    expect(liveSteps(lifecycle(all.slice(0, 5)), "settled")).toEqual({ done: 6, stopped: false });
    // An unknown delivery stops before the provider step; it is never shown as executed.
    expect(liveSteps(lifecycle(["intent", "reserved", "executing"]), "unknown")).toEqual({
      done: 4,
      stopped: true,
    });
    expect(stepStatuses(4, true)[4]).toBe("stopped");
    expect(stepStatuses(6)).toEqual([
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "current",
      "pending",
    ]);
  });
});

describe("activity feed", () => {
  const op = (id: string, events: [string, string][]): LiveOperationDetail =>
    ({
      operation_id: id,
      provider_id: "nebius-token-factory",
      outcome_class: "accounting_settled",
      events: events.map(([event, at]) => ({ event, at, source: "s", detail: null })),
    }) as unknown as LiveOperationDetail;

  test("newest first across operations, without the repeated latest transition", () => {
    const feed = activityFeed([
      op("op-a", [
        ["intent_journaled", "2026-10-24T10:00:00Z"],
        ["accounting_settled", "2026-10-24T10:00:02Z"],
        ["latest_transition", "2026-10-24T10:00:02Z"],
      ]),
      op("op-b", [["intent_journaled", "2026-10-24T11:00:00Z"]]),
    ]);
    expect(feed.map((r) => `${r.operation_id}:${r.event}`)).toEqual([
      "op-b:intent_journaled",
      "op-a:accounting_settled",
      "op-a:intent_journaled",
    ]);
  });
});
