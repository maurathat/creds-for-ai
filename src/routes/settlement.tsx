import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { Chip, KV, PageHeader, Panel } from "@/components/kit";
import { OutcomeChip, QueryState, SourceNote } from "@/components/credence";
import { useOperations, usePaymentStatus, useXrplFixtures } from "@/lib/credence-api/hooks";
import type { OperationSummary } from "@/lib/credence-api/types";
import { XRPL_STATE_LABEL, XRPL_STATE_TONE } from "@/lib/credence-api/view";

export const Route = createFileRoute("/settlement")({
  head: () => ({
    meta: [
      { title: "XRPL settlement — Credence Markets" },
      {
        name: "description",
        content:
          "XRPL settlement states, kept separate from Credence's internal accounting settlement.",
      },
    ],
  }),
  component: Page,
});

function PaymentRow({ op }: { op: OperationSummary }) {
  const payment = usePaymentStatus(op.operation_id);
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="px-4 py-2.5">
        <Link
          to="/operations/$operationId"
          params={{ operationId: op.operation_id }}
          className="text-primary hover:underline"
        >
          {op.title}
        </Link>
      </td>
      <td className="px-4 py-2.5">
        <OutcomeChip outcome={op.outcome_class} />
      </td>
      <td className="px-4 py-2.5">
        {payment.data ? (
          <Chip tone={XRPL_STATE_TONE[payment.data.xrpl.state]}>
            {XRPL_STATE_LABEL[payment.data.xrpl.state]}
          </Chip>
        ) : payment.error ? (
          <Chip tone="reject">unavailable</Chip>
        ) : (
          "…"
        )}
      </td>
      <td className="num px-4 py-2.5 text-muted-foreground">
        {payment.data?.xrpl.transaction_hash ?? "none"}
      </td>
    </tr>
  );
}

function Page() {
  const operations = useOperations();
  const fixtures = useXrplFixtures();
  return (
    <AppShell>
      <PageHeader
        kicker="Settlement"
        title="XRPL settlement"
        description="Credence's accounting settlement and XRPL settlement are different records. Accounting settlement means drawn includes the verified charge. Only a validated XRPL transaction would mean a provider payment is confirmed."
        actions={<Chip>No ledger connection</Chip>}
      />

      <QueryState isLoading={operations.isLoading} error={operations.error}>
        <Panel title="Purchases: accounting outcome and XRPL state" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Purchase", "Accounting (Core)", "XRPL", "Transaction"].map((h) => (
                    <th key={h} className="label-xs px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operations.data?.map((o) => (
                  <PaymentRow key={o.operation_id} op={o} />
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <SourceNote>
          Every purchase is <span className="num">not_submitted</span> on XRPL: at this baseline no
          XRPL transaction is built, signed or submitted. An accounting-settled purchase is not a
          payment.
        </SourceNote>
      </QueryState>

      <QueryState isLoading={fixtures.isLoading} error={fixtures.error}>
        {fixtures.data && (
          <Panel
            title="Simulated XRPL settlement states (fixtures)"
            subtitle={fixtures.data.id}
            right={<Chip tone="warn">UI fixtures</Chip>}
          >
            <p className="mb-4 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[11px] font-medium text-warn">
              {fixtures.data.fixture_notice}
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {fixtures.data.states.map((s) => (
                <div key={s.state} className="rounded-md border border-border bg-surface-2 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <Chip tone={XRPL_STATE_TONE[s.state]}>{s.label}</Chip>
                    <Chip tone="warn">Fixture · not observed</Chip>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {s.meaning}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed">
                    <span className="text-muted-foreground">Operator: </span>
                    {s.operator_action}
                  </p>
                  <div className="mt-2 text-[11px]">
                    <KV k="Transaction hash" v="none (fixture)" mono />
                    <KV k="Ledger index" v="none (fixture)" mono />
                    <KV k="Result" v="none (fixture)" mono />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </QueryState>
    </AppShell>
  );
}
