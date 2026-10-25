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
import { AgentSessionPanel, useAgentToken } from "@/components/agent-session";
import { useQueries } from "@tanstack/react-query";
import { NotLiveIntegrations, TruthStrip } from "@/components/claw";
import {
  credenceClient,
  useExposure,
  useLiveFacilities,
  useLiveOperations,
  useOperations,
} from "@/lib/credence-api/hooks";
import type { AccountingExposure, Exposure } from "@/lib/credence-api/types";
import {
  formatMicro,
  STATE_LABEL,
  XRPL_STATE_LABEL,
  XRPL_STATE_TONE,
} from "@/lib/credence-api/view";
import { ROOT_ACTIONS } from "@/lib/credence";

type Search = { operation?: string };

export const Route = createFileRoute("/credit")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["operation"] === "string" ? { operation: search["operation"] } : {},
  head: () => ({
    meta: [
      { title: "Credit & Payments — Claw Street" },
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

/** The signed-in agent's facilities, read now from Core through the integrated offline service. */
function LiveFacilities({ token }: { token: string }) {
  const facilities = useLiveFacilities(token);
  return (
    <QueryState isLoading={facilities.isLoading} error={facilities.error}>
      <Panel
        title="Live facilities (integrated offline service)"
        subtitle="Core accounting read now for this agent's facilities; offline mock providers"
        right={<Chip tone="warn">Integrated offline</Chip>}
      >
        <div className="space-y-4">
          {facilities.data?.map((f) => (
            <div key={f.facility_id} data-facility={f.facility_id} className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="num font-medium">{f.facility_id}</span>
                <TierBadge evidence={f.minimum_evidence_tier} />
                <span className="text-muted-foreground">{f.title}</span>
              </div>
              <ExposureBar exposure={f.exposure} />
              <div className="grid gap-x-6 text-[11px] sm:grid-cols-4">
                <KV k="Limit" v={<Money micro={f.exposure.limit_micro_trlusd} />} />
                <KV k="Drawn" v={<Money micro={f.exposure.drawn_micro_trlusd} emphasis />} />
                <KV k="Held" v={<Money micro={f.exposure.held_micro_trlusd} />} />
                <KV k="Headroom" v={<Money micro={f.exposure.headroom_micro_trlusd} />} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {facilities.data?.[0]?.history_note} Drawn is Credence&apos;s record of verified spending,
          not confirmed XRPL loan principal. No XRPL loan or payment exists.
        </p>
      </Panel>
    </QueryState>
  );
}

/** Payments: each integrated purchase's accounting outcome beside its XRPL status (from the API). */
function Payments({ token }: { token: string }) {
  const operations = useLiveOperations(token);
  const ops = operations.data?.operations ?? [];
  const payments = useQueries({
    queries: ops.map((o) => ({
      queryKey: ["credence", "live", "payment", o.operation_id],
      queryFn: () => credenceClient().getLivePayment(o.operation_id),
      staleTime: 0,
    })),
  });
  return (
    <QueryState isLoading={operations.isLoading} error={operations.error}>
      <Panel
        title="Payments"
        subtitle="Accounting settlement (Credence Core) and XRPL payment status, per integrated purchase"
        bodyClassName="p-0"
      >
        {ops.length === 0 ? (
          <p className="px-5 py-4 text-xs text-muted-foreground">No integrated purchases yet.</p>
        ) : (
          <table className="w-full text-xs" aria-label="Payments">
            <thead>
              <tr className="border-b border-border text-left">
                {["Operation", "Facility", "Accounting", "XRPL payment", "Transaction"].map((h) => (
                  <th key={h} className="label-xs px-4 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ops.map((o, i) => {
                const xrpl = payments[i]?.data?.xrpl;
                return (
                  <tr key={o.operation_id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5">
                      <Link
                        to="/live/$operationId"
                        params={{ operationId: o.operation_id }}
                        className="num text-primary hover:underline"
                      >
                        {o.operation_id.slice(0, 14)}…
                      </Link>
                    </td>
                    <td className="num px-4 py-2.5">{o.facility_id}</td>
                    <td className="px-4 py-2.5">
                      <OutcomeChip outcome={o.outcome_class} />
                    </td>
                    <td className="px-4 py-2.5" data-xrpl-state={xrpl?.state ?? ""}>
                      {xrpl ? (
                        <Chip tone={XRPL_STATE_TONE[xrpl.state]}>
                          {XRPL_STATE_LABEL[xrpl.state]}
                        </Chip>
                      ) : (
                        "…"
                      )}
                    </td>
                    <td className="num px-4 py-2.5 text-muted-foreground">
                      {xrpl?.transaction_hash ?? "none"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          Amounts are integer micro-tRLUSD; tRLUSD is a synthetic test token. Accounting settlement
          is Credence&apos;s internal record and is not an XRPL payment. No XRPL adapter is
          connected in this build, so every purchase&apos;s XRPL status is not submitted.
        </p>
      </Panel>
    </QueryState>
  );
}

function Credit() {
  const [token, setToken] = useAgentToken();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/credit" });
  const operations = useOperations();
  const selected = search.operation ?? operations.data?.[0]?.operation_id;
  const exposure = useExposure(selected);
  const current = operations.data?.find((o) => o.operation_id === selected);

  return (
    <AppShell>
      <PageHeader
        kicker="Credit & Payments"
        title="Facilities, exposure and payments"
        description="Limit, headroom, held exposure and drawn accounting, read from Credence Core's accounting records. Drawn is Credence's record of verified spending; it is not confirmed XRPL loan principal."
        actions={<Chip tone="info">Accounting only · no XRPL loan</Chip>}
      />
      <TruthStrip />
      <OfflineNotice />
      <AgentSessionPanel token={token} setToken={setToken} />
      {token && <LiveFacilities token={token} />}
      {token && <Payments token={token} />}
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
      <NotLiveIntegrations />
    </AppShell>
  );
}
