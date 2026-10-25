import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Chip, KV, PageHeader, Panel } from "@/components/kit";
import {
  Digest,
  LifecycleTrack,
  Money,
  OutcomeChip,
  QueryState,
  ProvenanceChip,
  SourceNote,
} from "@/components/credence";
import { useOperation, usePaymentStatus } from "@/lib/credence-api/hooks";
import type { OperationDetail, OperationStep } from "@/lib/credence-api/types";
import { STATE_LABEL, XRPL_STATE_LABEL, XRPL_STATE_TONE } from "@/lib/credence-api/view";

export const Route = createFileRoute("/operations/$operationId")({
  head: () => ({ meta: [{ title: "Purchase — Claw Street" }] }),
  component: Page,
});

function StepRow({ step, index }: { step: OperationStep; index: number }) {
  const e = step.core.exposure;
  const attempt = step.core.delivery_attempt;
  return (
    <tr className="animate-fade-in border-b border-border/60 align-top last:border-0">
      <td className="num px-4 py-2.5 text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </td>
      <td className="px-4 py-2.5">
        <div className="num">{step.step}</div>
        <div className="text-[11px] text-muted-foreground">{step.note}</div>
      </td>
      <td className="num px-4 py-2.5 text-muted-foreground">{step.at}</td>
      <td className="num px-4 py-2.5">
        {step.journal_state ? STATE_LABEL[step.journal_state] : "—"}
      </td>
      <td className="num px-4 py-2.5 text-[11px]">
        {step.core.reservation_status ?? "none"}
        {step.core.release_reason && ` (${step.core.release_reason})`}
      </td>
      <td className="num px-4 py-2.5 text-[11px] text-muted-foreground">
        {attempt
          ? `begun${attempt.execution_claimed_at ? ", claimed" : ""}${
              attempt.unknown_cause ? `, unknown: ${attempt.unknown_cause}` : ""
            }`
          : "none"}
      </td>
      <td className="px-4 py-2.5 text-[11px]">
        <div>
          drawn <Money micro={e.drawn_micro_trlusd} />
        </div>
        <div>
          held <Money micro={e.held_micro_trlusd} />
        </div>
      </td>
      <td className="px-4 py-2.5 text-[11px]">
        {step.response_available_to_agent ? (
          <Chip tone="pass">available</Chip>
        ) : step.response_retained ? (
          <Chip tone="neutral">retained, withheld</Chip>
        ) : (
          <span className="text-muted-foreground">none</span>
        )}
      </td>
    </tr>
  );
}

function StepReplay({ op }: { op: OperationDetail }) {
  const [shown, setShown] = useState(op.steps.length);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (shown >= op.steps.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [playing, shown, op.steps.length]);

  return (
    <Panel
      title="Recorded steps"
      subtitle="Journal state and Core's accounting records at each interruption point and after each call"
      right={
        <button
          onClick={() => {
            setShown(0);
            setPlaying(true);
          }}
          disabled={playing}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-2.5 py-1 text-[11px] hover:bg-surface-2 disabled:opacity-50"
        >
          <PlayCircle className="size-3.5" />
          {playing ? "Replaying…" : "Replay recording"}
        </button>
      }
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              {[
                "#",
                "Step",
                "Time (test clock)",
                "Journal",
                "Core reservation",
                "Delivery attempt",
                "Exposure",
                "Response",
              ].map((h) => (
                <th key={h} className="label-xs px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {op.steps.slice(0, shown).map((s, i) => (
              <StepRow key={`${s.step}-${i}`} step={s} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SettlementPanel({ op }: { op: OperationDetail }) {
  const payment = usePaymentStatus(op.operation_id);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel
        title="Accounting settlement (Credence Core)"
        right={<OutcomeChip outcome={op.outcome_class} />}
      >
        <KV k="Journal state" v={STATE_LABEL[op.state]} mono />
        <KV k="Settlement outcome" v={op.operation["settlement_outcome"] ?? "none"} mono />
        <KV k="Verifier decision" v={<Digest value={op.operation["verifier_decision_digest"]} />} />
        <KV k="Reason" v={op.reason_code ?? op.detail ?? "—"} mono />
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{op.state_text}</p>
      </Panel>
      <Panel
        title="XRPL settlement"
        right={
          payment.data && (
            <Chip tone={XRPL_STATE_TONE[payment.data.xrpl.state]}>
              {XRPL_STATE_LABEL[payment.data.xrpl.state]}
            </Chip>
          )
        }
      >
        <QueryState isLoading={payment.isLoading} error={payment.error}>
          <KV k="State" v={payment.data?.xrpl.state} mono />
          <KV k="Transaction" v={payment.data?.xrpl.transaction_hash ?? "none"} mono />
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {payment.data?.xrpl.detail} {payment.data?.accounting.note}
          </p>
          <Link
            to="/settlement"
            className="mt-2 inline-block text-[11px] text-primary hover:underline"
          >
            XRPL settlement states →
          </Link>
        </QueryState>
      </Panel>
    </div>
  );
}

function ResponsePanel({ op }: { op: OperationDetail }) {
  const retrieved = op.steps.find((s) => s.step === "retrieved");
  return (
    <Panel title="Response access" right={<KeyRound className="size-4 text-primary" />}>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {op.response_authorization.note}
      </p>
      <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
        <div>
          <KV k="Response digest" v={<Digest value={op.operation["response_digest"]} />} />
          <KV k="Retrieved at" v={op.operation["retrieved_at"] ?? "—"} mono />
          <KV k="Acknowledged at" v={op.operation["acknowledged_at"] ?? "—"} mono />
        </div>
        <div>
          {retrieved?.response_utf8 !== undefined ? (
            <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-[11px]">
              <div className="label-xs mb-1">Retrieved by the agent (synthetic reply)</div>
              <span className="num">{retrieved.response_utf8}</span>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              No retrieval in this recording. Responses are released only after accounting
              settlement.
            </p>
          )}
        </div>
      </div>
      <button
        disabled
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-border-strong px-3 py-1.5 text-[11px] opacity-50"
        title="Needs an agent-signed authorization and the accepted integration backend"
      >
        Retrieve response — requires the agent's signed authorization (not available in this app)
      </button>
    </Panel>
  );
}

function Detail({ op }: { op: OperationDetail }) {
  const request = op.objects["purchase_request"];
  return (
    <>
      <PageHeader
        kicker="Recorded purchase · offline test execution"
        title={op.title}
        description={op.summary}
        actions={
          <div className="flex flex-wrap gap-1.5">
            <ProvenanceChip kind="offline_test" />
            <OutcomeChip outcome={op.outcome_class} />
            {op.interrupted && <Chip tone="warn">Interrupted</Chip>}
          </div>
        }
      />
      <SourceNote>
        <span className="text-foreground">
          Recorded offline test execution, not a live purchase.{" "}
        </span>
        {op.source.provenance} <span className="text-foreground">Harness: </span>
        {op.source.harness}.
      </SourceNote>

      <Panel title="Lifecycle" subtitle={`Final journal state: ${STATE_LABEL[op.state]}`}>
        <LifecycleTrack stages={op.lifecycle} finalState={op.state} />
        {!op.lifecycle.some((s) => s.state === op.state) && (
          <p className="mt-3 text-[11px] text-warn">
            Ended outside the settled path as <span className="num">{STATE_LABEL[op.state]}</span>:{" "}
            {op.state_text}
          </p>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Purchase">
          <KV k="Operation" v={op.operation_id} mono />
          <KV k="Facility" v={op.facility_id} mono />
          <KV k="Provider" v={op.provider_id ?? "none chosen"} mono />
          <KV k="Reservation" v={op.operation["reservation_id"] ?? "—"} mono />
          <KV k="Purchase request" v={<Digest value={op.operation["request_digest"] ?? null} />} />
          <KV k="Prompt digest" v={<Digest value={op.operation["prompt_digest"]} />} />
          <KV
            k="Maximum cost (demo quote)"
            v={
              op.quote_max_total_cost_micro_trlusd === null ? (
                "—"
              ) : (
                <Money micro={op.quote_max_total_cost_micro_trlusd} />
              )
            }
          />
          <KV k="Signed by agent key" v={<Digest value={op.operation["agent_key_id"]} />} />
          {request && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Signed with a TEST agent key inside the recording harness. The UI never signs.
            </p>
          )}
        </Panel>
        <Panel title="Links">
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                to="/credit"
                search={{ operation: op.operation_id }}
                className="text-primary hover:underline"
              >
                Facility exposure through this purchase →
              </Link>
            </li>
            <li>
              {op.receipt_digest ? (
                <Link
                  to="/receipts"
                  search={{ digest: op.receipt_digest }}
                  className="text-primary hover:underline"
                >
                  Receipt and evidence →
                </Link>
              ) : (
                <span className="text-muted-foreground">No receipt: no evidence was captured.</span>
              )}
            </li>
          </ul>
          {(op.core_records.settlement_disputes.length > 0 ||
            op.core_records.late_delivery_disputes.length > 0 ||
            op.core_records.no_delivery_releases.length > 0) && (
            <div className="mt-4 space-y-1.5 text-[11px]">
              <div className="label-xs">Core records</div>
              {op.core_records.settlement_disputes.map((d, i) => (
                <div key={`d${i}`} className="num text-muted-foreground">
                  settlement dispute: {d["kind"]} · {d["reason_code"]}
                </div>
              ))}
              {op.core_records.late_delivery_disputes.map((d, i) => (
                <div key={`l${i}`} className="num text-muted-foreground">
                  late-delivery dispute: expired {d["expires_at"]}, submitted {d["submitted_at"]}
                </div>
              ))}
              {op.core_records.no_delivery_releases.map((d, i) => (
                <div key={`r${i}`} className="num text-muted-foreground">
                  no-delivery release: {d["reason"]} at {d["released_at"]}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <StepReplay op={op} />
      <SettlementPanel op={op} />
      <ResponsePanel op={op} />
    </>
  );
}

function Page() {
  const { operationId } = Route.useParams();
  const operation = useOperation(operationId);
  return (
    <AppShell>
      <QueryState isLoading={operation.isLoading} error={operation.error}>
        {operation.data && <Detail op={operation.data} />}
      </QueryState>
    </AppShell>
  );
}
