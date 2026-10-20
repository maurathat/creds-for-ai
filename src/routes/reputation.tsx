import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { PROVIDERS } from "@/lib/credence";

export const Route = createFileRoute("/reputation")({
  head: () => ({
    meta: [
      { title: "Reputation — Credence Markets" },
      {
        name: "description",
        content: "Conformity, disputes, SLA performance and buyer ratings per provider.",
      },
      { property: "og:title", content: "Reputation — Credence Markets" },
      {
        property: "og:description",
        content: "Conformity, disputes, SLA performance and buyer ratings per provider.",
      },
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
      description="Conformity, disputes, SLA performance and buyer ratings per provider."
      level="simulated"
      sections={[
        {
          title: "Reputation ledger",
          rows: PROVIDERS.map((p) => ({
            name: p.name,
            reputation: p.reputation,
            conforming: p.conforming,
            disputes: p.disputes,
            slaPerf: p.slaPerf,
            availability: p.availability,
            buyerRating: p.buyerRating,
          })),
        },
      ]}
    />
  );
}
