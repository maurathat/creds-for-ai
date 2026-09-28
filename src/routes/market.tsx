import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { BIDS, ROUTING_STRATEGIES } from "@/lib/credence";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Inference Market — Credence Markets" },
      { name: "description", content: "Route orders across providers by price, latency, evidence tier and residency." },
      { property: "og:title", content: "Inference Market — Credence Markets" },
      { property: "og:description", content: "Route orders across providers by price, latency, evidence tier and residency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Inference Market"
      title="Verified inference market"
      description="Route orders across providers by price, latency, evidence tier and residency."
      level="simulated"
      sections={[
        { title: "Provider bids for ORD-2261", rows: BIDS },
        { title: "Routing strategies", rows: ROUTING_STRATEGIES },
      ]}
    />
  );
}
