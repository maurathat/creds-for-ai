import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { ORDER_BOOK } from "@/lib/credence";

export const Route = createFileRoute("/secondary-market")({
  head: () => ({
    meta: [
      { title: "Secondary Market — Claw Street" },
      { name: "description", content: "Order book for transferring reserved capacity and forwards." },
      { property: "og:title", content: "Secondary Market — Claw Street" },
      { property: "og:description", content: "Order book for transferring reserved capacity and forwards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Secondary Market"
      title="Secondary market"
      description="Order book for transferring reserved capacity and forwards."
      level="roadmap"
      sections={[
        { title: "Bids", rows: ORDER_BOOK.bids },
        { title: "Asks", rows: ORDER_BOOK.asks },
      ]}
    />
  );
}
