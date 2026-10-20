import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Chip, KV, PageHeader, Panel, RoadmapNote } from "@/components/kit";
import {
  Money,
  OfflineNotice,
  OutcomeChip,
  QueryState,
  SourceNote,
  TierBadge,
} from "@/components/credence";
import { useExposure, useOperations } from "@/lib/credence-api/hooks";
import type { AccountingExposure, Exposure } from "@/lib/credence-api/types";
import { formatMicro, STATE_LABEL } from "@/lib/credence-api/view";
import { ROOT_ACTIONS } from "@/lib/credence";

type Search = { operation?: string };

export const Route = createFileRoute("/credit")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["operation"] === "string" ? { operation: search["operation"] } : {},
  head: () => ({
    meta: [
      { title: "Credit — Credence Markets" },
      {
        name: "description",
        content:
          "Facility limit, headroom, held exposure and drawn accounting from Credence Core's records.",
      },
    ],
  }),
  component: Credit,
});

const PARTS: { key: keyof Exposure; label: string; cls: string }[] = [
  { key: "drawn_micro_trlusd", label: "Drawn", cls: "bg-primary" },
  { key: "held_micro_trlusd", label: "Held", cls: "bg-warn" },
  { key: "headroom_micro_trlusd", label: "Headroom", cls: "bg-success/40" },
];

/** Proportional bar. Tiny amounts get a minimum visible width so a non-zero value is never hidden. */
function ExposureBar({ exposure }: { exposure: Exposure }) {
  const limit = exposure.limit_micro_trlusd || 1;
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
      {PARTS.map((p) => {
        const v = exposure[p.key];
        if (v === 0) return null;
        const pct = Math.max((v / limit) * 100, p.key === "headroom_micro_trlusd" ? 0 : 1.5);
        return (
          <div
            key={p.key}
            className={p.cls}
            style={{ width: `${pct}%` }}
            title={`${p.label}: ${formatMicro(v)} micro-tRLUSD`}
          />
        );
      })}
    </div>
  );
}

function Dashboard({ exposure }: { exposure: AccountingExposure }) {
  const c = exposure.current;
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["Facility limit", c.limit_micro_trlusd, exposure.terms.limit],
            ["Available headroom", c.headroom_micro_trlusd, exposure.terms.headroom],
            ["Held exposure", c.held_micro_trlusd, exposure.terms.held],
            ["Drawn (accounting)", c.drawn_micro_trlusd, exposure.terms.drawn],
          ] as const
        ).map(([label, value, term]) => (
          <div key={label} className="panel p-4">
            <div className="label-xs">{label}</div>
            <div className="mt-2">
              <Money micro={value} emphasis />
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{term}</p>
          </div>
        ))}
      </div>

      <Panel
        title={`Facility ${exposure.facility_id}`}
        subtitle={`${exposure.invariant} · as of step "${c.step}" (${c.at}, test clock)`}
      >
        <ExposureBar exposure={c} />
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
          {PARTS.map((p) => (
            <span key={p.key} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${p.cls}`} /> {p.label}
            </span>
          ))}
          <span>
            Non-zero drawn and held get a minimum bar width; exact values are in the figures.
          </span>
        </div>
        <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
          <div>
            <KV k="Status" v={exposure.facility.status} mono />
            <KV
              k="Minimum evidence tier"
              v={<TierBadge evidence={exposure.facility.minimum_evidence_tier} />}
            />
            <KV k="Allowed providers" v={exposure.facility.allowed_providers.join(", ")} mono />
          </div>
          <div>
            <KV k="Maturity" v={exposure.facility.maturity_at} mono />
            <KV k="XRPL loan" v={exposure.facility.xrpl_loan_id ?? "none (accounting only)"} mono />
            <KV k="Currency" v="micro-tRLUSD (tRLUSD is a test token)" />
          </div>
        </div>
      </Panel>

      <Panel title="Exposure through the purchase" subtitle={exposure.source} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                {["Step", "Journal", "Drawn", "Held", "Headroom", ""].map((h, i) => (
                  <th key={`${h}${i}`} className="label-xs px-4 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exposure.timeline.map((p, i) => (
                <tr key={`${p.step}-${i}`} className="border-b border-border/60 last:border-0">
                  <td className="num px-4 py-2">{p.step}</td>
                  <td className="num px-4 py-2 text-muted-foreground">
                    {p.journal_state ? STATE_LABEL[p.journal_state] : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <Money micro={p.drawn_micro_trlusd} />
                  </td>
                  <td className="px-4 py-2">
                    <Money micro={p.held_micro_trlusd} />
                  </td>
                  <td className="px-4 py-2">
                    <Money micro={p.headroom_micro_trlusd} />
                  </td>
                  <td className="w-48 px-4 py-2">
                    <ExposureBar exposure={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function Credit() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/credit" });
  const operations = useOperations();
  const selected = search.operation ?? operations.data?.[0]?.operation_id;
  const exposure = useExposure(selected);
  const current = operations.data?.find((o) => o.operation_id === selected);

  return (
    <AppShell>
      <PageHeader
        kicker="Credit"
        title="Credit facility"
        description="Limit, headroom, held exposure and drawn accounting, read from Credence Core's accounting records. Drawn is Credence's record of verified spending; it is not confirmed XRPL loan principal."
        actions={<Chip tone="info">Accounting only · no XRPL loan</Chip>}
      />
      <OfflineNotice />
      <QueryState isLoading={operations.isLoading} error={operations.error}>
        <Panel title="Recorded run" subtitle="Each recorded offline run has its own facility state">
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 text-xs"
              value={selected ?? ""}
              onChange={(e) => void navigate({ search: { operation: e.target.value } })}
            >
              {operations.data?.map((o) => (
                <option key={o.operation_id} value={o.operation_id}>
                  {o.title}
                </option>
              ))}
            </select>
            {current && <OutcomeChip outcome={current.outcome_class} />}
            {current && (
              <Link
                to="/operations/$operationId"
                params={{ operationId: current.operation_id }}
                className="text-[11px] text-primary hover:underline"
              >
                Open purchase lifecycle →
              </Link>
            )}
          </div>
        </Panel>
        <QueryState isLoading={exposure.isLoading} error={exposure.error}>
          {exposure.data && <Dashboard exposure={exposure.data} />}
        </QueryState>
      </QueryState>

      <Panel
        title="Hardware-root signing policy"
        subtitle="Design intent from the build plan"
        right={<KeyRound className="size-4 text-roadmap" />}
      >
        <RoadmapNote>
          Not implemented at this baseline: no Ledger device, owner approval or facility change flow
          is connected. Shown so the intended authority split is visible.
        </RoadmapNote>
        <ul className="mt-3 space-y-1.5">
          {ROOT_ACTIONS.map((a) => (
            <li
              key={a.action}
              className="flex items-start justify-between gap-3 rounded-md bg-surface-2 px-3 py-2"
            >
              <span>
                <span className="block text-xs">{a.action}</span>
                <span className="text-[11px] text-muted-foreground">{a.detail}</span>
              </span>
              <Chip tone={a.root ? "roadmap" : "neutral"}>
                {a.root ? "Owner approval (planned)" : "Agent, in policy"}
              </Chip>
            </li>
          ))}
        </ul>
      </Panel>
      <SourceNote>
        Facility exposure moves only through Core: a reservation holds the quote's maximum cost,
        accounting settlement replaces the hold with the verified charge, and a release or expiry
        frees it.
      </SourceNote>
    </AppShell>
  );
}
