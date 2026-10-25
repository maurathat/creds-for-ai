import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Chip, KV, PageHeader, Panel } from "@/components/kit";
import {
  Digest,
  LifecycleTrack,
  Money,
  OutcomeChip,
  ProvenanceChip,
  QueryState,
  SourceNote,
  TierBadge,
} from "@/components/credence";
import { AgentSessionPanel, useAgentToken } from "@/components/agent-session";
import { PurchaseSteps } from "@/components/claw";
import { ApiError } from "@/lib/credence-api/client";
import {
  useLiveExposure,
  useLiveOperation,
  useLivePayment,
  useLiveReceipt,
  useLiveResponse,
} from "@/lib/credence-api/hooks";
import type { LiveOperationDetail } from "@/lib/credence-api/types";
import {
  humanize,
  liveSteps,
  parseResponseAuthorization,
  STATE_LABEL,
  XRPL_STATE_LABEL,
  XRPL_STATE_TONE,
} from "@/lib/credence-api/view";

export const Route = createFileRoute("/live/$operationId")({
  head: () => ({ meta: [{ title: "Integrated purchase — Claw Street" }] }),
  component: Page,
});

const areaCls =
  "num w-full rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 text-[11px] text-foreground focus:border-primary focus:outline-none";

function errorText(error: unknown): string {
  return error instanceof ApiError ? `${error.code}: ${error.detail}` : String(error);
}

function Events({ op }: { op: LiveOperationDetail }) {
  return (
    <Panel title="Recorded lifecycle events" subtitle={op.events_note} bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              {["Time", "Event", "Detail", "Record"].map((h) => (
                <th key={h} className="label-xs px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {op.events.map((e, i) => (
              <tr key={`${e.event}-${i}`} className="border-b border-border/60 last:border-0">
                <td className="num px-4 py-2 text-muted-foreground">{e.at}</td>
                <td className="num px-4 py-2">{humanize(e.event)}</td>
                <td className="px-4 py-2 text-[11px] text-muted-foreground">{e.detail ?? "—"}</td>
                <td className="num px-4 py-2 text-[11px] text-muted-foreground">{e.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Exposure({ operationId }: { operationId: string }) {
  const exposure = useLiveExposure(operationId);
  const e = exposure.data?.exposure;
  return (
    <Panel title="Facility exposure (Core, read now)" subtitle={exposure.data?.invariant ?? ""}>
      <QueryState isLoading={exposure.isLoading} error={exposure.error}>
        {exposure.data && e && (
          <>
            <KV k="Facility" v={exposure.data.facility_id} mono />
            <KV k="Limit" v={<Money micro={e.limit_micro_trlusd} />} />
            <KV k="Drawn (accounting)" v={<Money micro={e.drawn_micro_trlusd} emphasis />} />
            <KV k="Held" v={<Money micro={e.held_micro_trlusd} />} />
            <KV k="Headroom" v={<Money micro={e.headroom_micro_trlusd} />} />
            <KV
              k="Evidence floor"
              v={<TierBadge evidence={exposure.data.minimum_evidence_tier} />}
            />
            <KV k="Terms digest" v={<Digest value={exposure.data.terms.digest} />} />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Read at <span className="num">{e.at}</span>. {exposure.data.history_note} Drawn is
              Credence&apos;s record of verified spending, not confirmed loan principal.
            </p>
          </>
        )}
      </QueryState>
    </Panel>
  );
}

function Receipt({ digest }: { digest: string | null }) {
  const receipt = useLiveReceipt(digest);
  if (!digest) {
    return (
      <Panel title="Receipt and evidence">
        <p className="text-xs text-muted-foreground">No receipt: no evidence was captured.</p>
      </Panel>
    );
  }
  return (
    <Panel
      title="Receipt and evidence"
      subtitle={receipt.data?.checks_note ?? ""}
      right={receipt.data && <TierBadge evidence={receipt.data.evidence} />}
    >
      <QueryState isLoading={receipt.isLoading} error={receipt.error}>
        {receipt.data && (
          <>
            <KV k="Receipt" v={<Digest value={receipt.data.receipt_digest} />} />
            <KV k="Provider" v={receipt.data.provider_id} mono />
            <KV k="Price" v={<Money micro={receipt.data.price_micro_trlusd} />} />
            <KV
              k="Accounting"
              v={
                receipt.data.accounting.settled
                  ? `settled ${receipt.data.accounting.settled_at}`
                  : "not settled"
              }
              mono
            />
            <KV
              k="Previous receipt"
              v={<Digest value={receipt.data.chain.previous_receipt_digest} />}
            />
            <KV k="Chain head" v={receipt.data.chain.is_chain_head ? "this receipt" : "later"} />
            <ul className="mt-3 space-y-1 text-[11px]">
              {receipt.data.checks.map((c) => (
                <li key={c.check} className="flex gap-2">
                  <Chip
                    tone={c.result === "pass" ? "pass" : c.result === "fail" ? "reject" : "neutral"}
                  >
                    {c.result}
                  </Chip>
                  <span className="num">{c.check}</span>
                  <span className="text-muted-foreground">{c.detail}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">{receipt.data.provider_label}</p>
          </>
        )}
      </QueryState>
    </Panel>
  );
}

function Settlement({ op }: { op: LiveOperationDetail }) {
  const payment = useLivePayment(op.operation_id);
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
        </QueryState>
      </Panel>
    </div>
  );
}

function authorizeCommand(operationId: string, action: "retrieve" | "acknowledge"): string {
  return (
    "uv run python -m credence.agent.cli --demo-dir <demo-dir> authorize " +
    `--operation ${operationId} --action ${action}`
  );
}

function ResponseAccess({ op }: { op: LiveOperationDetail }) {
  const respond = useLiveResponse(op.operation_id);
  const [pasted, setPasted] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const next = op.state === "retrieved" || text !== null ? "acknowledge" : "retrieve";

  const onSend = async () => {
    let authorization;
    try {
      authorization = parseResponseAuthorization(pasted);
    } catch (error) {
      setPasteError(String(error));
      return;
    }
    setPasteError(null);
    const result = await respond.mutateAsync(authorization);
    if (result.kind === "retrieved") setText(result.text);
    setPasted("");
  };

  return (
    <Panel title="Response access" right={<KeyRound className="size-4 text-primary" />}>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{op.response.note}</p>
      <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
        <div>
          <KV k="Available to the agent" v={op.response.available_to_agent ? "yes" : "no"} />
          <KV k="Retained" v={op.response.retained ? "yes" : "no (deleted)"} />
          <KV k="Response digest" v={<Digest value={op.operation["response_digest"]} />} />
          <KV k="Retrieved at" v={op.operation["retrieved_at"] ?? "—"} mono />
          <KV k="Acknowledged at" v={op.operation["acknowledged_at"] ?? "—"} mono />
        </div>
        <div>
          {text !== null && (
            <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-[11px]">
              <div className="label-xs mb-1">Retrieved (synthetic reply from an offline mock)</div>
              <span className="num">{text}</span>
            </div>
          )}
        </div>
      </div>
      {op.response.available_to_agent && op.state !== "acknowledged" && (
        <div className="mt-4 space-y-2">
          <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-[11px]">
            <div className="label-xs mb-1">Agent: sign a single-use authorization ({next})</div>
            <code className="num block break-all text-foreground">
              {authorizeCommand(op.operation_id, next)}
            </code>
          </div>
          <textarea
            aria-label="Agent response authorization JSON"
            className={areaCls}
            rows={3}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder='{"operation_id": "...", "action": "retrieve", ...}'
          />
          <button
            onClick={() => void onSend()}
            disabled={!pasted.trim() || respond.isPending}
            className="rounded-md border border-border-strong px-3 py-1.5 text-[11px] font-semibold hover:bg-surface-2 disabled:opacity-40"
          >
            {next === "retrieve" ? "Retrieve response" : "Acknowledge (delete retained copy)"}
          </button>
          {pasteError && <SourceNote>{pasteError}</SourceNote>}
          {respond.error && <SourceNote>{errorText(respond.error)}</SourceNote>}
        </div>
      )}
    </Panel>
  );
}

function Detail({ op }: { op: LiveOperationDetail }) {
  const live = useLiveOperation(op.operation_id);
  return (
    <>
      <PageHeader
        kicker="Integrated purchase · offline mock providers"
        title={`Purchase ${op.operation_id}`}
        description={op.state_text}
        actions={
          <div className="flex flex-wrap gap-1.5">
            <ProvenanceChip kind="integrated_offline" />
            <OutcomeChip outcome={op.outcome_class} />
            <button
              onClick={() => void live.refetch()}
              className="inline-flex items-center gap-1 rounded-md border border-border-strong px-2 py-0.5 text-[11px] hover:bg-surface-2"
            >
              <RefreshCw className="size-3" /> Refresh
            </button>
          </div>
        }
      />
      <SourceNote>{op.source_label}. No XRPL payment exists for this purchase.</SourceNote>
      <Panel title="Agent purchase progression" subtitle="Each step from the record that proves it">
        <PurchaseSteps {...liveSteps(op.lifecycle, op.state)} />
      </Panel>
      <Panel title="Lifecycle" subtitle={`Current journal state: ${STATE_LABEL[op.state]}`}>
        <LifecycleTrack
          stages={op.lifecycle.map((s) => ({ ...s, observed_in_snapshot: s.reached }))}
          finalState={op.state}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Purchase">
          <KV k="Facility" v={op.facility_id} mono />
          <KV k="Provider" v={op.provider_id ?? "none chosen"} mono />
          <KV k="Reservation" v={op.operation["reservation_id"] ?? "—"} mono />
          <KV k="Purchase request" v={<Digest value={op.operation["request_digest"]} />} />
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
          <p className="mt-2 text-[11px] text-muted-foreground">
            Signed by the agent&apos;s own key outside the browser. The UI never signs.
          </p>
        </Panel>
        <Exposure operationId={op.operation_id} />
      </div>
      <Events op={op} />
      <Receipt digest={op.receipt_digest} />
      <Settlement op={op} />
      <ResponseAccess op={op} />
      <Link to="/operations" className="text-[11px] text-primary hover:underline">
        ← All purchases
      </Link>
    </>
  );
}

function Page() {
  const { operationId } = Route.useParams();
  const [token, setToken] = useAgentToken();
  const operation = useLiveOperation(operationId);
  return (
    <AppShell>
      {!token ? (
        <AgentSessionPanel token={token} setToken={setToken} />
      ) : (
        <QueryState isLoading={operation.isLoading} error={operation.error}>
          {operation.data && <Detail op={operation.data} />}
        </QueryState>
      )}
    </AppShell>
  );
}
