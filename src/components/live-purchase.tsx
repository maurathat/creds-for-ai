// Integrated offline purchase (I2a): prepare on the server, sign outside the browser, submit.
// The browser never holds or asks for the agent's private key. It shows the exact prepared
// request and forwards the agent's pasted SignedObject unchanged; the service and Core decide.

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Send } from "lucide-react";
import { Chip, KV, Panel } from "@/components/kit";
import { Digest, Money, SourceNote, TierBadge } from "@/components/credence";
import { ApiError } from "@/lib/credence-api/client";
import { useHealth, usePreparePurchase, useSubmitSignedPurchase } from "@/lib/credence-api/hooks";
import { promptDigest, shellQuote } from "@/lib/credence-api/session";
import type { Preparation, ProcurementEvaluation } from "@/lib/credence-api/types";
import { livePurchaseAction, parseSignedObject, preSubmitSteps } from "@/lib/credence-api/view";
import { PurchaseSteps } from "@/components/claw";

const areaCls =
  "num w-full rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 text-[11px] text-foreground focus:border-primary focus:outline-none";

function errorText(error: unknown): string {
  return error instanceof ApiError ? `${error.code}: ${error.detail}` : String(error);
}

export function signCommand(preparation: Preparation, prompt: string): string {
  return (
    "uv run python -m credence.agent.cli --demo-dir <demo-dir> sign " +
    `--preparation ${preparation.preparation_id} --prompt ${shellQuote(prompt)}`
  );
}

function PreparedRequest({ preparation, prompt }: { preparation: Preparation; prompt: string }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-x-8 sm:grid-cols-2">
        <div>
          <KV k="Preparation" v={preparation.preparation_id} mono />
          <KV k="Operation (on submit)" v={preparation.operation_id} mono />
          <KV k="Facility" v={preparation.facility_id} mono />
          <KV
            k="Provider"
            v={`${preparation.provider?.display_name ?? preparation.provider_id} · ${preparation.quote_id}`}
          />
          <KV k="Evidence" v={<TierBadge evidence={preparation.evidence} />} />
        </div>
        <div>
          <KV
            k="Maximum cost (demo quote)"
            v={<Money micro={preparation.price.max_total_cost_micro_trlusd} emphasis />}
          />
          <KV k="Nonce" v={preparation.nonce} mono />
          <KV k="Expires at" v={preparation.expires_at} mono />
          <KV k="Request digest" v={<Digest value={preparation.request.digest} />} />
          <KV k="Prompt digest" v={<Digest value={preparation.prompt_digest} />} />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {preparation.provider_label}. {preparation.price.label}
      </p>
      <details className="text-[11px]">
        <summary className="cursor-pointer text-muted-foreground">
          Exact canonical request and the C3A statement the agent signs
        </summary>
        <pre className="num mt-2 overflow-x-auto rounded-md border border-border bg-surface-2 p-2.5">
          {preparation.request.canonical_json}
        </pre>
        <div className="mt-2 break-all">
          <span className="label-xs">Statement ({preparation.signing.domain}) </span>
          <span className="num">{preparation.signing.statement_hex}</span>
        </div>
      </details>
      <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-[11px]">
        <div className="label-xs mb-1">Agent: verify and sign outside the browser</div>
        <code className="num block break-all text-foreground">
          {signCommand(preparation, prompt)}
        </code>
        <p className="mt-1.5 text-muted-foreground">{preparation.signing.note}</p>
      </div>
    </div>
  );
}

export function LivePurchasePanel({
  evaluation,
  hasSession,
}: {
  evaluation: ProcurementEvaluation | undefined;
  hasSession: boolean;
}) {
  const health = useHealth();
  const prepare = usePreparePurchase();
  const submit = useSubmitSignedPurchase();
  const navigate = useNavigate();
  const [signature, setSignature] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const action = livePurchaseAction(evaluation, health.data?.integration, hasSession);
  const preparation = prepare.data;
  const prompt = evaluation?.form.prompt ?? "";

  const onPrepare = async () => {
    if (!evaluation || !action.enabled) return;
    submit.reset();
    setSignature("");
    const {
      prompt: text,
      facility_limit_micro_trlusd: _limit,
      facility_drawn_micro_trlusd: _drawn,
      ...procurement
    } = evaluation.form;
    prepare.mutate({ ...procurement, prompt_digest: await promptDigest(text) });
  };

  const onSubmit = async () => {
    if (!preparation) return;
    let signed;
    try {
      signed = parseSignedObject(signature);
    } catch (error) {
      setPasteError(String(error));
      return;
    }
    setPasteError(null);
    const report = await submit.mutateAsync({
      preparation_id: preparation.preparation_id,
      prompt,
      signature: signed,
    });
    await navigate({ to: "/live/$operationId", params: { operationId: report.operation_id } });
  };

  return (
    <Panel
      title="Integrated purchase · offline mock providers"
      subtitle="Prepare on the server, sign outside the browser, submit"
      right={<Chip tone="warn">Offline mock providers</Chip>}
    >
      <div className="mb-4">
        <PurchaseSteps
          done={preSubmitSteps(!!evaluation, !!preparation, signature.trim().length > 0)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => void onPrepare()}
          disabled={!action.enabled || prepare.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40"
          title={action.note}
        >
          <ShieldCheck className="size-4" />
          {prepare.isPending ? "Preparing…" : action.label}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{action.note}</p>
      {prepare.error && <SourceNote>{errorText(prepare.error)}</SourceNote>}
      {preparation && (
        <div className="mt-4 space-y-3">
          <PreparedRequest preparation={preparation} prompt={prompt} />
          <label className="block space-y-1">
            <span className="label-xs">Paste the agent&apos;s signature (SignedObject JSON)</span>
            <textarea
              aria-label="Agent signature JSON"
              className={areaCls}
              rows={4}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder='{"object_type": "credence.signed_object", ...}'
            />
          </label>
          <button
            onClick={() => void onSubmit()}
            disabled={!signature.trim() || submit.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-border-strong px-3.5 py-2 text-xs font-semibold hover:bg-surface-2 disabled:opacity-40"
          >
            <Send className="size-4" />
            {submit.isPending ? "Submitting…" : "Submit signed purchase"}
          </button>
          {pasteError && <SourceNote>{pasteError}</SourceNote>}
          {submit.error && <SourceNote>{errorText(submit.error)}</SourceNote>}
        </div>
      )}
    </Panel>
  );
}
