import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { ORDER_BOOK } from "@/lib/credence";

export const Route = createFileRoute("/secondary-market")({
  head: () => ({
    meta: [
      { title: "Capacity transfer — Credence Markets" },
      {
        name: "description",
        content:
          "Transfer of reserved inference capacity (concept). Seeded prototype data; no market, no matching.",
      },
      { property: "og:title", content: "Capacity transfer — Credence Markets" },
      {
        property: "og:description",
        content:
          "Transfer of reserved inference capacity (concept). Seeded prototype data; no market, no matching.",
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
      kicker="Capacity transfer"
      title="Reserved-capacity transfer (concept)"
      description="Transfer of reserved inference capacity (concept). Seeded prototype data; no market, no matching."
      level="roadmap"
      sections={[
        { title: "Transfer requests (seeded)", rows: ORDER_BOOK.bids },
        { title: "Transfer offers (seeded)", rows: ORDER_BOOK.asks },
      ]}
    />
  );
}
