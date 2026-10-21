// Shared display pieces for the Product P0 workflow. They render API data; they decide nothing.

import { useState, type ReactNode } from "react";
import { Check, Copy, PlugZap } from "lucide-react";
import { Chip, DemoNote } from "@/components/kit";
import { cn } from "@/lib/utils";
import { ApiError, apiBaseUrl } from "@/lib/credence-api/client";
import type { EvidenceTierInfo, OutcomeClass } from "@/lib/credence-api/types";
import {
  formatMicro,
  formatTrlusd,
  lifecycleView,
  PROVENANCE,
  OUTCOME_LABEL,
  OUTCOME_TONE,
  shortDigest,
  tierLabel,
  tierTone,
} from "@/lib/credence-api/view";
import type { LifecycleStage, OperationState } from "@/lib/credence-api/types";

export function Digest({
  value,
  full = false,
}: {
  value: string | null | undefined;
  full?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <span className={cn("num", full && "break-all")} title={value}>
        {full ? value : shortDigest(value)}
      </span>
      <button
        type="button"
        aria-label="Copy full value"
        className="text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          });
        }}
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </button>
    </span>
  );
}

/** An integer micro-tRLUSD amount. Shows both units; tRLUSD is a test token. */
export function Money({ micro, emphasis = false }: { micro: number; emphasis?: boolean }) {
  return (
    <span
      className="num whitespace-nowrap"
      title="tRLUSD is a test token. 1 tRLUSD = 1,000,000 micro-tRLUSD."
    >
      <span className={cn(emphasis && "text-foreground")}>{formatMicro(micro)}</span>
      <span className="text-muted-foreground"> µ</span>
      <span className="ml-1 text-[10px] text-muted-foreground">({formatTrlusd(micro)} tRLUSD)</span>
    </span>
  );
}

export function TierBadge({ evidence }: { evidence: EvidenceTierInfo }) {
  return (
    <span title={evidence.description}>
      <Chip tone={tierTone(evidence.tier)}>{tierLabel(evidence)}</Chip>
    </span>
  );
}

export function OutcomeChip({ outcome }: { outcome: OutcomeClass }) {
  return <Chip tone={OUTCOME_TONE[outcome]}>{OUTCOME_LABEL[outcome]}</Chip>;
}

export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-border-strong bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export function QueryState({
  isLoading,
  error,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  children: ReactNode;
}) {
  if (error) {
    const unreachable = error instanceof ApiError && error.code === "API_UNREACHABLE";
    return (
      <div className="panel space-y-2 p-5 text-xs">
        <div className="flex items-center gap-2 font-medium text-destructive">
          <PlugZap className="size-4" />
          {unreachable ? "Credence API unreachable" : "Request failed"}
        </div>
        <p className="text-muted-foreground">
          {error instanceof ApiError ? `${error.code}: ${error.detail}` : String(error)}
        </p>
        {unreachable && (
          <p className="text-muted-foreground">
            Start the offline API from the repository root:{" "}
            <code className="num text-foreground">
              uv run uvicorn --factory credence.api.app:create_app --port 8000
            </code>{" "}
            (expected at <span className="num">{apiBaseUrl()}</span>).
          </p>
        )}
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="panel p-5 text-xs text-muted-foreground">Loading from the Credence API…</div>
    );
  }
  return <>{children}</>;
}

export function LifecycleTrack({
  stages,
  finalState,
}: {
  stages: LifecycleStage[];
  finalState: OperationState;
}) {
  const view = lifecycleView(stages, finalState);
  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label="Purchase lifecycle">
      {view.map((s, i) => (
        <li key={s.state} className="flex items-center gap-1.5">
          <span
            data-status={s.status}
            className={cn(
              "num rounded-md border px-2 py-1 text-[11px]",
              s.status === "done" && "border-success/40 bg-success/10 text-success",
              s.status === "stopped" && "border-warn/50 bg-warn/10 text-warn",
              s.status === "not_reached" &&
                "border-border bg-surface-2 text-muted-foreground opacity-60",
            )}
          >
            {s.label}
          </span>
          {i < view.length - 1 && <span className="text-muted-foreground">→</span>}
        </li>
      ))}
    </ol>
  );
}

export function OfflineNotice() {
  return (
    <DemoNote>
      Offline P0. Procurement evaluations are real Credence Core policy dry runs: they reserve no
      funds and execute no inference. Purchases shown are recorded offline test executions, not live
      purchases. Prices are configured demo prices in tRLUSD, a test token. No XRPL payment has been
      submitted.
    </DemoNote>
  );
}

export type ProvenanceKind = keyof typeof PROVENANCE;

export function ProvenanceChip({ kind }: { kind: ProvenanceKind }) {
  const tone = kind === "live_evidence" ? "info" : kind === "offline_test" ? "warn" : "neutral";
  return <Chip tone={tone}>{PROVENANCE[kind].label}</Chip>;
}

/** Which kind of data a page shows, with the kind it cannot show yet always listed last. */
export function ProvenanceLegend({ kinds }: { kinds: ProvenanceKind[] }) {
  const shown: ProvenanceKind[] = [
    ...kinds.filter((k) => k !== "live_operation"),
    "live_operation",
  ];
  return (
    <ul className="grid gap-2 md:grid-cols-3" aria-label="Data provenance">
      {shown.map((kind) => (
        <li
          key={kind}
          className={cn(
            "rounded-md border border-border bg-surface-2 px-3 py-2",
            kind === "live_operation" && "opacity-70",
          )}
        >
          <ProvenanceChip kind={kind} />
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {PROVENANCE[kind].detail}
          </p>
        </li>
      ))}
    </ul>
  );
}
