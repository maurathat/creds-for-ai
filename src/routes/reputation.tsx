import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { PROVIDERS } from "@/lib/credence";

export const Route = createFileRoute("/reputation")({
  head: () => ({
    meta: [
      { title: "Reputation — Claw Street" },
      { name: "description", content: "Seeded conformity, dispute, SLA and buyer-rating figures per fictional provider. Browser simulation only." },
      { property: "og:title", content: "Reputation — Claw Street" },
      { property: "og:description", content: "Seeded conformity, dispute, SLA and buyer-rating figures per fictional provider. Browser simulation only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Reputation"
      title="Provider reputation"
      description="Seeded conformity, dispute, SLA and buyer-rating figures per fictional provider. Browser simulation only."
      level="simulated"
      sections={[
        { title: "Reputation ledger", rows: PROVIDERS.map(p => ({ name: p.name, reputation: p.reputation, conforming: p.conforming, disputes: p.disputes, slaPerf: p.slaPerf, availability: p.availability, buyerRating: p.buyerRating })) },
      ]}
    />
  );
}
