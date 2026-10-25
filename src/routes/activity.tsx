import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { AppShell } from "@/components/shell";
import { Chip, PageHeader, Panel } from "@/components/kit";
import { OutcomeChip, ProvenanceChip, QueryState, SourceNote } from "@/components/credence";
import { TruthStrip } from "@/components/claw";
import { AgentSessionPanel, useAgentToken } from "@/components/agent-session";
import { credenceClient, useLiveOperations, useOperations } from "@/lib/credence-api/hooks";
import type { LiveOperationDetail } from "@/lib/credence-api/types";
import { activityFeed, humanize, STATE_LABEL } from "@/lib/credence-api/view";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Claw Street" },
      {
        name: "description",
        content: "Chronological purchase history from the events each record persisted.",
      },
    ],
  }),
  component: Page,
});

const FEED_LIMIT = 25;

function LiveFeed({ token }: { token: string }) {
  const list = useLiveOperations(token);
  const ids = (list.data?.operations ?? []).map((o) => o.operation_id).slice(-FEED_LIMIT);
  const details = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["credence", "live", "operation", id],
      queryFn: () => credenceClient().getLiveOperation(id),
      staleTime: 0,
    })),
  });
  const loaded = details.map((d) => d.data).filter((d): d is LiveOperationDetail => !!d);
  const feed = activityFeed(loaded);
  return (
    <QueryState isLoading={list.isLoading} error={list.error}>
      <Panel
        title="Integrated purchases · newest first"
        subtitle="Each row is one event at the time its own record persisted; nothing is inferred"
        right={<ProvenanceChip kind="integrated_offline" />}
        bodyClassName="p-0"
      >
        {feed.length === 0 ? (
          <p className="px-5 py-4 text-xs text-muted-foreground">
            No integrated purchases yet.{" "}
            <Link to="/procure" className="text-primary hover:underline">
              Start an agent purchase →
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Activity feed">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Time (UTC)", "Event", "Operation", "Provider", "Detail", "Now"].map((h) => (
                    <th key={h} className="label-xs px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feed.map((row, i) => (
                  <tr
                    key={`${row.operation_id}-${row.event}-${i}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="num px-4 py-2 text-muted-foreground">{row.at}</td>
                    <td className="num px-4 py-2">{humanize(row.event)}</td>
                    <td className="px-4 py-2">
                      <Link
                        to="/live/$operationId"
                        params={{ operationId: row.operation_id }}
                        className="num text-primary hover:underline"
                      >
                        {row.operation_id.slice(0, 14)}…
                      </Link>
                    </td>
                    <td className="num px-4 py-2 text-muted-foreground">
                      {row.provider_id ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-muted-foreground">
                      {row.detail ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <OutcomeChip outcome={row.outcome_class} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {(list.data?.operations.length ?? 0) > FEED_LIMIT && (
        <SourceNote>
          Showing the latest {FEED_LIMIT} purchases. All of them are listed under Purchases.
        </SourceNote>
      )}
    </QueryState>
  );
}

function RecordedRuns() {
  const recorded = useOperations();
  return (
    <QueryState isLoading={recorded.isLoading} error={recorded.error}>
      <Panel
        title="Recorded offline runs"
        subtitle="Real Integration service runs with fake providers and a test clock; not purchases"
        right={<ProvenanceChip kind="offline_test" />}
        bodyClassName="p-0"
      >
        <table className="w-full text-xs">
          <tbody>
            {recorded.data?.map((o) => (
              <tr key={o.operation_id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5">
                  <Link
                    to="/operations/$operationId"
                    params={{ operationId: o.operation_id }}
                    className="text-primary hover:underline"
                  >
                    {o.title}
                  </Link>
                </td>
                <td className="num px-4 py-2.5">{STATE_LABEL[o.state]}</td>
                <td className="px-4 py-2.5">
                  <OutcomeChip outcome={o.outcome_class} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </QueryState>
  );
}

function Page() {
  const [token, setToken] = useAgentToken();
  return (
    <AppShell>
      <PageHeader
        kicker="Activity"
        title="Purchase history"
        description="Every integrated purchase, newest event first, from the timestamps Credence Core and the Integration journal persisted. Recorded offline runs are listed separately."
        actions={<Chip tone="neutral">XRPL: not submitted</Chip>}
      />
      <TruthStrip />
      <AgentSessionPanel token={token} setToken={setToken} />
      {token && <LiveFeed token={token} />}
      <RecordedRuns />
    </AppShell>
  );
}
