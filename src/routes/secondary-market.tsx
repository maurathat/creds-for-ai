import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { ConceptRibbon } from "@/components/kit";
import { ORDER_BOOK } from "@/lib/credence";

export const Route = createFileRoute("/secondary-market")({
  head: () => ({
    meta: [
      { title: "Capacity Transfers (concept) — Claw Street" },
      { name: "description", content: "Agent procurement concept: handing unused reserved capacity to another buyer. Not an exchange; transfer is not implemented. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:title", content: "Secondary Market — Claw Street" },
      { property: "og:description", content: "Agent procurement concept: handing unused reserved capacity to another buyer. Not an exchange; transfer is not implemented. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Capacity transfers"
      title="Capacity transfers (concept)"
      description="Agent procurement concept: handing unused reserved capacity to another buyer. Not an exchange; transfer is not implemented. Inactive concept preview — browser simulation, seeded data."
      level="roadmap"
      banner={<ConceptRibbon />}
      sections={[
        { title: "Buyer requests (illustrative)", rows: ORDER_BOOK.bids },
        { title: "Unused capacity offered (illustrative)", rows: ORDER_BOOK.asks },
      ]}
    />
  );
}
