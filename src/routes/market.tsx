import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DataPage } from "@/components/data-page";
import { Chip, Panel } from "@/components/kit";
import { BIDS, ROUTING_STRATEGIES } from "@/lib/credence";
import { STRATEGIES, route, type Strategy } from "@/lib/routing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Inference Market — Claw Street" },
      { name: "description", content: "Route orders across providers by price, latency, evidence tier and residency." },
      { property: "og:title", content: "Inference Market — Claw Street" },
      { property: "og:description", content: "Route orders across providers by price, latency, evidence tier and residency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function BidRouter() {
  const [strategy, setStrategy] = useState<Strategy>("Verified");
  const { bids, best, reason } = route(strategy, BIDS);
  return (
    <Panel title="Provider bids for ORD-2261" bodyClassName="p-0">
      <div className="flex flex-wrap gap-1 border-b border-border p-3" role="radiogroup" aria-label="Routing strategy">
        {STRATEGIES.map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={s === strategy}
            onClick={() => setStrategy(s)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              s === strategy
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Bid", "Provider", "Region", "tRLUSD / VIU", "p50", "Avail.", "Tier", "Capacity", "Reputation", "Status"].map((h) => (
                <th key={h} className="label-xs whitespace-nowrap px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bids.map((b) => {
              const isBest = best?.id === b.id;
              return (
                <tr
                  key={b.id}
                  className={cn(
                    "border-b border-border/60 text-xs last:border-0",
                    !b.eligible && "opacity-40",
                    isBest && "bg-primary/5",
                  )}
                >
                  <td className="num px-3 py-2">{b.id}</td>
                  <td className="px-3 py-2">{b.provider}</td>
                  <td className="px-3 py-2">{b.region}</td>
                  <td className="num px-3 py-2">{b.price.toFixed(3)}</td>
                  <td className="num px-3 py-2">{b.p50} ms</td>
                  <td className="num px-3 py-2">{b.availability}%</td>
                  <td className="px-3 py-2">{b.tier}</td>
                  <td className="num px-3 py-2">{b.capacity} VIU</td>
                  <td className="num px-3 py-2">{b.reputation}</td>
                  <td className="px-3 py-2">
                    {isBest ? (
                      <Chip tone="pass">Best</Chip>
                    ) : b.eligible ? (
                      <span className="text-muted-foreground">Eligible</span>
                    ) : (
                      <span className="text-muted-foreground">{b.ineligibleReason}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Best under <span className="text-foreground">{strategy}</span>:{" "}
        <span className="text-primary">{best ? best.provider : "none"}</span> — {reason}
      </div>
    </Panel>
  );
}

function Page() {
  return (
    <DataPage
      kicker="Inference Market"
      title="Verified inference market"
      description="Route orders across providers by price, latency, evidence tier and residency."
      level="simulated"
      sections={[{ title: "Routing strategies", rows: ROUTING_STRATEGIES }]}
    >
      <BidRouter />
    </DataPage>
  );
}
