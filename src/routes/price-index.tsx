import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { INDEXES, INDEX_SERIES } from "@/lib/credence";

export const Route = createFileRoute("/price-index")({
  head: () => ({
    meta: [
      { title: "Price Reference (concept) — Claw Street" },
      { name: "description", content: "Illustrative procurement price references per inference unit (VIU) in tRLUSD, a synthetic test unit. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:title", content: "Price Index — Claw Street" },
      { property: "og:description", content: "Illustrative procurement price references per inference unit (VIU) in tRLUSD, a synthetic test unit. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Price reference"
      title="Procurement price reference (concept)"
      description="Illustrative procurement price references per inference unit (VIU) in tRLUSD, a synthetic test unit. Inactive concept preview — browser simulation, seeded data."
      level="concept"
      sections={[
        { title: "Indexes", rows: INDEXES },
        { title: "Index history", rows: INDEX_SERIES },
      ]}
    />
  );
}
