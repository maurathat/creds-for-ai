import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { AppShell } from "@/components/shell";
import { Chip, Metric, PageHeader, Panel } from "@/components/kit";
import { Money, OutcomeChip, QueryState, SourceNote, TierBadge } from "@/components/credence";
import { ClawStreetHero } from "@/components/brand";
import { NotLiveIntegrations, TruthStrip } from "@/components/claw";
import { AgentSessionPanel, useAgentToken } from "@/components/agent-session";
import {
  credenceClient,
  useLiveFacilities,
  useLiveOperations,
  usePresets,
  useProviders,
} from "@/lib/credence-api/hooks";
import { formatMicro, STATE_LABEL } from "@/lib/credence-api/view";

// Claw Street overview. Every figure is read from the Credence API: configured demo quotes, real
// Core dry runs of the two scenarios and, with an agent session, the integrated offline service.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Claw Street" },
      {
        name: "description",
        content:
          "Claw Street marketplace overview: providers, offers, qualifying purchases and credit activity, powered by Credence.",
      },
    ],
  }),
  component: Overview,
});

function MarketKpis() {
  const providers = useProviders();
  const presets = usePresets();
  const evaluations = useQueries({
    queries: (presets.data ?? []).map((p) => ({
      queryKey: ["credence", "overview-dry-run", p.preset_id],
      queryFn: () => credenceClient().evaluateProcurement(p.form),
      staleTime: 60_000,
    })),
  });
  const quotes = providers.data?.map((p) => p.quote.max_total_cost_micro_trlusd) ?? [];
  return (
    <QueryState isLoading={providers.isLoading} error={providers.error}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Providers listed"
          value={providers.data?.length ?? 0}
          hint="Nebius Token Factory and local Qwen · offline mocks in this build"
        />
        <Metric
          label="Cheapest maximum cost"
          value={quotes.length ? formatMicro(Math.min(...quotes)) : "—"}
          unit="micro-tRLUSD"
          hint="Configured demo quote, at its token caps"
          tone="primary"
        />
        {(presets.data ?? []).map((p, i) => {
          const e = evaluations[i]?.data;
          return (
            <Metric
              key={p.preset_id}
              label={p.title}
              value={e ? `${e.qualifying_count} / ${e.offers.length}` : "…"}
              unit="offers qualify"
              hint={e ? `Core dry run · chosen ${e.chosen_provider_id ?? "none"}` : "Core dry run"}
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        Evidence offered:
        {providers.data?.map((p) => (
          <TierBadge key={p.provider_id} evidence={p.evidence} />
        ))}
      </div>
    </QueryState>
  );
}

function AgentActivity({ token }: { token: string }) {
  const facilities = useLiveFacilities(token);
  const operations = useLiveOperations(token);
  const ops = [...(operations.data?.operations ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const sum = (key: "drawn_micro_trlusd" | "held_micro_trlusd" | "headroom_micro_trlusd") =>
    (facilities.data ?? []).reduce((total, f) => total + f.exposure[key], 0);
  const settled = ops.filter((o) =>
    ["settled", "retrieved", "acknowledged"].includes(o.state),
  ).length;
  return (
    <QueryState
      isLoading={facilities.isLoading || operations.isLoading}
      error={facilities.error ?? operations.error}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Integrated purchases"
          value={ops.length}
          hint={`${settled} accounting settled · this agent`}
        />
        <Metric
          label="Drawn (accounting)"
          value={formatMicro(sum("drawn_micro_trlusd"))}
          unit="micro-tRLUSD"
          hint="Verified spending; not XRPL loan principal"
          tone="primary"
        />
        <Metric label="Held" value={formatMicro(sum("held_micro_trlusd"))} unit="micro-tRLUSD" />
        <Metric
          label="Headroom"
          value={formatMicro(sum("headroom_micro_trlusd"))}
          unit="micro-tRLUSD"
          hint={`${facilities.data?.length ?? 0} facilities`}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Economic activity" subtitle="Latest integrated purchases" bodyClassName="p-0">
          {ops.length === 0 ? (
            <p className="px-5 py-4 text-xs text-muted-foreground">
              No integrated purchases yet.{" "}
              <Link to="/procure" className="text-primary hover:underline">
                Start an agent purchase →
              </Link>
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Created", "Operation", "Provider", "State", "Outcome"].map((h) => (
                    <th key={h} className="label-xs px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ops.slice(0, 6).map((o) => (
                  <tr key={o.operation_id} className="border-b border-border/60 last:border-0">
                    <td className="num px-4 py-2.5 text-muted-foreground">{o.created_at}</td>
                    <td className="px-4 py-2.5">
                      <Link
                        to="/live/$operationId"
                        params={{ operationId: o.operation_id }}
                        className="num text-primary hover:underline"
                      >
                        {o.operation_id.slice(0, 14)}…
                      </Link>
                    </td>
                    <td className="num px-4 py-2.5">{o.provider_id ?? "—"}</td>
                    <td className="num px-4 py-2.5">{STATE_LABEL[o.state]}</td>
                    <td className="px-4 py-2.5">
                      <OutcomeChip outcome={o.outcome_class} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="Facility drawn" subtitle="Core accounting, read now">
          <div className="space-y-3">
            {facilities.data?.map((f) => (
              <div key={f.facility_id}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="num">{f.facility_id}</span>
                  <Money micro={f.exposure.drawn_micro_trlusd} />
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.max(
                        (f.exposure.drawn_micro_trlusd / (f.exposure.limit_micro_trlusd || 1)) *
                          100,
                        f.exposure.drawn_micro_trlusd > 0 ? 1.5 : 0,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </QueryState>
  );
}

function Overview() {
  const [token, setToken] = useAgentToken();
  return (
    <AppShell>
      <div className="panel grid items-center gap-6 px-6 py-6 lg:grid-cols-[auto_1fr]">
        <ClawStreetHero />
        <div className="space-y-3">
          <PageHeader
            kicker="Overview"
            title="The marketplace where agents buy verified inference"
            description="Agents state what they may buy; Credence Core decides which offers qualify, reserves against a purpose-bound credit facility, verifies the delivery receipt and records accounting settlement. Kessai Labs builds Claw Street on Credence infrastructure."
          />
          <TruthStrip />
        </div>
      </div>
      <MarketKpis />
      <AgentSessionPanel token={token} setToken={setToken} />
      {token && <AgentActivity token={token} />}
      <NotLiveIntegrations />
      <SourceNote>
        Providers in this build are offline mocks: no provider is called. Prices are configured demo
        prices in micro-tRLUSD; tRLUSD is a synthetic test token. Accounting settlement is
        Credence&apos;s internal record, not an XRPL payment. <Chip tone="neutral">Offline</Chip>
      </SourceNote>
    </AppShell>
  );
}
