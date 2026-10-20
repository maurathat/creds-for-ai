import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CircleCheck, CircleMinus, CircleX } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Chip, KV, PageHeader, Panel } from "@/components/kit";
import { Digest, Money, QueryState, SourceNote, TierBadge } from "@/components/credence";
import { useReceiptEvidence, useReceipts } from "@/lib/credence-api/hooks";
import type { ReceiptEvidence } from "@/lib/credence-api/types";
import { humanize } from "@/lib/credence-api/view";

type Search = { digest?: string };

export const Route = createFileRoute("/receipts")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["digest"] === "string" ? { digest: search["digest"] } : {},
  head: () => ({
    meta: [
      { title: "Receipts — Credence Markets" },
      {
        name: "description",
        content:
          "Delivery receipts, provider identity, evidence tier, signature checks and receipt-chain status.",
      },
    ],
  }),
  component: Page,
});

function CheckIcon({ result }: { result: string }) {
  if (result === "pass") return <CircleCheck className="size-3.5 text-success" />;
  if (result === "fail") return <CircleX className="size-3.5 text-destructive" />;
  return <CircleMinus className="size-3.5 text-muted-foreground" />;
}

function Json({ value }: { value: unknown }) {
  return (
    <pre className="num max-h-72 overflow-auto rounded-md border border-border bg-surface-2 p-3 text-[10.5px] leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function Inspector({ e }: { e: ReceiptEvidence }) {
  const offline = e.source === "recorded_offline_run";
  return (
    <div className="space-y-5">
      <SourceNote>
        <span className="text-foreground">{e.source_label}. </span>
        {offline
          ? "Evidence from a recorded offline run: synthetic responses, and any provider signature is made with a TEST key standing in for the provider. It is not a provider attestation."
          : "Recorded from a real run: a Nebius Token Factory response witnessed by Credence's gateway (Tier 1), or a local Qwen delivery signed by the provider key generated for that run (Tier 2). The agent and gateway keys in that run are TEST keys."}
      </SourceNote>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Receipt" right={<TierBadge evidence={e.evidence} />}>
          <KV k="Receipt digest" v={<Digest value={e.receipt_digest} full />} />
          <KV k="Provider" v={`${e.provider?.display_name ?? e.provider_id} (${e.provider_id})`} />
          <KV k="Model / profile" v={e.model_identifier} mono />
          <KV k="Execution profile digest" v={<Digest value={e.execution_profile_digest} full />} />
          <KV
            k="Tokens (in / out, provider-reported)"
            v={`${e.input_token_count} / ${e.output_token_count}`}
            mono
          />
          <KV k="Billed (demo quote)" v={<Money micro={e.price_micro_trlusd} emphasis />} />
          <KV
            k="Gateway signer"
            v={
              e.gateway_signer ? (
                <span>
                  <Digest value={e.gateway_signer.key_id} /> ({e.gateway_signer.role}:{" "}
                  {e.gateway_signer.subject})
                </span>
              ) : (
                "not in the recorded registry"
              )
            }
          />
          {e.operation_id && (
            <Link
              to="/operations/$operationId"
              params={{ operationId: e.operation_id }}
              className="mt-2 inline-block text-[11px] text-primary hover:underline"
            >
              Open the purchase lifecycle →
            </Link>
          )}
        </Panel>

        <Panel title="Evidence tier" subtitle="What this receipt proves, and what it does not">
          <ul className="space-y-1.5">
            {e.evidence_ladder.map((t) => (
              <li
                key={t.tier}
                className={`rounded-md border px-3 py-2 ${
                  t.present
                    ? "border-success/40 bg-success/5"
                    : "border-border bg-surface-2 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">
                    Tier {t.tier} · {t.name}
                  </span>
                  {!t.implemented ? (
                    <Chip tone="roadmap">Roadmap</Chip>
                  ) : t.present ? (
                    <Chip tone="pass">Present</Chip>
                  ) : (
                    <Chip>Not present</Chip>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Verification" subtitle={e.checks_note} bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {e.checks.map((c) => (
            <li key={c.check} className="flex items-start gap-3 px-5 py-2.5">
              <CheckIcon result={c.result} />
              <div className="min-w-0">
                <div className="text-xs font-medium">{humanize(c.check)}</div>
                <div className="num break-all text-[11px] text-muted-foreground">{c.detail}</div>
              </div>
              <span className="ml-auto">
                <Chip
                  tone={c.result === "pass" ? "pass" : c.result === "fail" ? "reject" : "neutral"}
                >
                  {humanize(c.result)}
                </Chip>
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-5 py-3 text-xs">
          <KV
            k="Core verifier decision (recorded)"
            v={`${e.verifier.outcome ?? "none recorded"}${e.verifier.reason_code ? ` · ${e.verifier.reason_code}` : ""}`}
            mono
          />
          {e.verifier.decision_digest && (
            <KV k="Decision record" v={<Digest value={e.verifier.decision_digest} />} />
          )}
        </div>
      </Panel>

      <Panel title="Receipt chain">
        <KV
          k="Previous receipt"
          v={
            e.chain.first_on_facility ? (
              "none (first receipt on this facility)"
            ) : (
              <Digest value={e.chain.previous_receipt_digest} />
            )
          }
        />
        <KV
          k="Accounting settled"
          v={
            e.chain.accounting_settled === null
              ? "not recorded"
              : e.chain.accounting_settled
                ? "yes"
                : "no"
          }
          mono
        />
        <KV k="Facility chain head" v={<Digest value={e.chain.chain_head} />} />
        <KV k="This receipt is the chain head" v={e.chain.is_chain_head ? "yes" : "no"} mono />
        <p className="mt-2 text-[11px] text-muted-foreground">{e.chain.note}</p>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Delivery receipt (canonical)">
          <Json value={e.receipt} />
        </Panel>
        <Panel title="Signatures">
          <div className="label-xs mb-1">Gateway signature</div>
          <Json value={e.gateway_signature} />
          <div className="label-xs mb-1 mt-3">Provider attestation and signature</div>
          {e.provider_attestation ? (
            <Json
              value={{ attestation: e.provider_attestation, signature: e.provider_signature }}
            />
          ) : (
            <p className="text-[11px] text-muted-foreground">
              None. At Tier 1 the provider signs nothing; nothing here implies the provider signed
              or attested this response.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/receipts" });
  const receipts = useReceipts();
  const selected = search.digest ?? receipts.data?.[0]?.receipt_digest;
  const evidence = useReceiptEvidence(selected);

  return (
    <AppShell>
      <PageHeader
        kicker="Evidence"
        title="Receipts and evidence"
        description="Each receipt binds the purchase request, the execution profile, the provider and the response digest. Signatures and digests are re-checked by Credence Core's own functions when you open a receipt."
      />
      <QueryState isLoading={receipts.isLoading} error={receipts.error}>
        <Panel title="Receipts" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {[
                    "Receipt",
                    "Source",
                    "Provider",
                    "Evidence",
                    "Billed",
                    "Verifier",
                    "Accounting",
                  ].map((h) => (
                    <th key={h} className="label-xs px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receipts.data?.map((r) => (
                  <tr
                    key={r.receipt_digest}
                    onClick={() => void navigate({ search: { digest: r.receipt_digest } })}
                    className={`cursor-pointer border-b border-border/60 last:border-0 hover:bg-surface-2 ${
                      r.receipt_digest === selected ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <Digest value={r.receipt_digest} />
                    </td>
                    <td className="px-4 py-2.5">
                      <Chip tone={r.source === "recorded_live_observation" ? "info" : "warn"}>
                        {r.source === "recorded_live_observation"
                          ? "Live recording"
                          : "Offline run"}
                      </Chip>
                    </td>
                    <td className="num px-4 py-2.5">{r.provider_id}</td>
                    <td className="px-4 py-2.5">
                      <TierBadge evidence={r.evidence} />
                    </td>
                    <td className="px-4 py-2.5">
                      <Money micro={r.price_micro_trlusd} />
                    </td>
                    <td className="num px-4 py-2.5">{r.verifier_outcome ?? "none"}</td>
                    <td className="num px-4 py-2.5">
                      {r.accounting_settled === null
                        ? "not recorded"
                        : r.accounting_settled
                          ? "settled"
                          : "not settled"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </QueryState>
      {selected && (
        <QueryState isLoading={evidence.isLoading} error={evidence.error}>
          {evidence.data && <Inspector e={evidence.data} />}
        </QueryState>
      )}
    </AppShell>
  );
}
