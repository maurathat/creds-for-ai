// Claw Street screen pieces. They display API data and fixed labels; they decide nothing.

import { Chip, Panel } from "@/components/kit";
import { cn } from "@/lib/utils";
import { useHealth } from "@/lib/credence-api/hooks";
import { NOT_LIVE_INTEGRATIONS } from "@/lib/navigation";
import { PURCHASE_STEPS, stepStatuses } from "@/lib/credence-api/view";

/** What this build is, stated on every Claw Street screen that shows activity. */
export function TruthStrip() {
  const health = useHealth();
  const integrated = health.data?.integration.integrated_service === true;
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Build status">
      <Chip tone={health.data ? "info" : "neutral"}>
        API: {health.data ? "available (offline)" : health.isLoading ? "checking" : "unreachable"}
      </Chip>
      <Chip tone={integrated ? "warn" : "neutral"}>
        {integrated ? "Providers: offline mocks" : "Recorded runs only"}
      </Chip>
      <Chip tone="neutral">XRPL: not submitted</Chip>
      <Chip tone="neutral">Price cap: preview only</Chip>
      <Chip tone="neutral">tRLUSD: synthetic test token</Chip>
    </div>
  );
}

/** Integrations that are not live in this build, kept visibly separate from working features. */
export function NotLiveIntegrations() {
  return (
    <Panel
      title="Not live in this build"
      subtitle="Shown so the plan is visible; none of these is connected or validated"
      right={<Chip tone="roadmap">Not connected</Chip>}
    >
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5" aria-label="Not live integrations">
        {NOT_LIVE_INTEGRATIONS.map((i) => (
          <li
            key={i.name}
            className="rounded-md border border-dashed border-border-strong bg-surface-2/60 px-3 py-2.5 opacity-80"
          >
            <div className="text-xs font-medium">{i.name}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{i.detail}</div>
            <div className="label-xs mt-1.5">Not connected · not validated</div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** The eight-step Agent Purchase rail. */
export function PurchaseSteps({ done, stopped = false }: { done: number; stopped?: boolean }) {
  const statuses = stepStatuses(done, stopped);
  return (
    <ol className="grid gap-1.5 sm:grid-cols-4 xl:grid-cols-8" aria-label="Purchase progression">
      {PURCHASE_STEPS.map((label, i) => (
        <li
          key={label}
          data-status={statuses[i]}
          className={cn(
            "rounded-md border px-2.5 py-2 text-[11px] leading-snug",
            statuses[i] === "done" && "border-primary/40 bg-primary/10 text-primary",
            statuses[i] === "current" && "border-info/50 bg-info/10 text-info",
            statuses[i] === "stopped" && "border-warn/50 bg-warn/10 text-warn",
            statuses[i] === "pending" && "border-border bg-surface-2 text-muted-foreground",
          )}
        >
          <span className="font-pixel mr-1.5 text-[8px]">{String(i + 1).padStart(2, "0")}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
