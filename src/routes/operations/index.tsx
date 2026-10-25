import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { Chip, PageHeader, Panel } from "@/components/kit";
import {
  Money,
  OfflineNotice,
  OutcomeChip,
  ProvenanceLegend,
  QueryState,
  SourceNote,
} from "@/components/credence";
import { AgentSessionPanel, useAgentToken } from "@/components/agent-session";
import { useLiveOperations, useOperations } from "@/lib/credence-api/hooks";
import { STATE_LABEL } from "@/lib/credence-api/view";

export const Route = createFileRoute("/operations/")({
  head: () => ({
    meta: [
      { title: "Purchases — Claw Street" },
      {
        name: "description",
        content:
          "Integrated offline purchases and recorded offline runs of the Integration service.",
      },
    ],
  }),
  component: Page,
});

function LiveOperations({ token }: { token: string }) {
  const live = useLiveOperations(token);
  return (
    <QueryState isLoading={live.isLoading} error={live.error}>
      <Panel
        title="Integrated offline purchases (this agent)"
        subtitle={live.data?.source_label ?? ""}
        bodyClassName="p-0"
      >
        {live.data && live.data.operations.length === 0 ? (
          <p className="px-5 py-4 text-xs text-muted-foreground">
            No integrated purchases yet. Prepare one from Procurement.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Operation", "Outcome", "Journal state", "Provider", "Reason", "Created"].map(
                    (h) => (
                      <th key={h} className="label-xs px-4 py-2.5 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {live.data?.operations.map((o) => (
                  <tr key={o.operation_id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to="/live/$operationId"
                        params={{ operationId: o.operation_id }}
                        className="num font-medium text-primary hover:underline"
                      >
                        {o.operation_id}
                      </Link>
                      <div className="num mt-0.5 text-[11px] text-muted-foreground">
                        {o.facility_id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <OutcomeChip outcome={o.outcome_class} />
                    </td>
                    <td className="num px-4 py-3">{STATE_LABEL[o.state]}</td>
                    <td className="num px-4 py-3 text-muted-foreground">{o.provider_id ?? "—"}</td>
                    <td className="num px-4 py-3 text-[11px] text-muted-foreground">
                      {o.reason_code ?? o.detail ?? "—"}
                    </td>
                    <td className="num px-4 py-3 text-[11px] text-muted-foreground">
                      {o.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </QueryState>
  );
}

function Page() {
  const operations = useOperations();
  const [token, setToken] = useAgentToken();
  return (
    <AppShell>
      <PageHeader
        kicker="Purchase lifecycle"
        title="Purchases"
        description="Integrated offline purchases made by the signed-in agent through the embedded Integration service (offline mock providers), and recorded offline test executions of the same service: settled, rejected, released, interrupted, unknown and disputed outcomes. None calls a live provider."
      />
      <OfflineNotice />
      <ProvenanceLegend kinds={["integrated_offline", "offline_test"]} />
      <AgentSessionPanel token={token} setToken={setToken} />
      {token && <LiveOperations token={token} />}
      <QueryState isLoading={operations.isLoading} error={operations.error}>
        <Panel title="Recorded offline test executions" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {[
                    "Operation",
                    "Outcome",
                    "Journal state",
                    "Provider",
                    "Reason",
                    "Drawn",
                    "Held",
                  ].map((h) => (
                    <th key={h} className="label-xs px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operations.data?.map((o) => (
                  <tr
                    key={o.operation_id}
                    className="border-b border-border/60 align-top last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/operations/$operationId"
                        params={{ operationId: o.operation_id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {o.title}
                      </Link>
                      <div className="num mt-0.5 text-[11px] text-muted-foreground">
                        {o.operation_id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <OutcomeChip outcome={o.outcome_class} />
                        {o.interrupted && <Chip tone="warn">Interrupted</Chip>}
                      </div>
                    </td>
                    <td className="num px-4 py-3">{STATE_LABEL[o.state]}</td>
                    <td className="num px-4 py-3 text-muted-foreground">{o.provider_id ?? "—"}</td>
                    <td className="num px-4 py-3 text-[11px] text-muted-foreground">
                      {o.reason_code ?? o.detail ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Money micro={o.drawn_micro_trlusd} />
                    </td>
                    <td className="px-4 py-3">
                      <Money micro={o.held_micro_trlusd} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <SourceNote>
          Each recorded run uses its own database, so drawn and held are per run and are not added
          together. Drawn is accounting settlement, not an XRPL payment.
        </SourceNote>
      </QueryState>
    </AppShell>
  );
}
