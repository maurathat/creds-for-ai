import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { INDEXES, INDEX_SERIES } from "@/lib/credence";

export const Route = createFileRoute("/price-index")({
  head: () => ({
    meta: [
      { title: "Price Index — Credence Markets" },
      { name: "description", content: "Reference prices for verified inference units (VIU) in RLUSD." },
      { property: "og:title", content: "Price Index — Credence Markets" },
      { property: "og:description", content: "Reference prices for verified inference units (VIU) in RLUSD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Price Index"
      title="Credence price index"
      description="Reference prices for verified inference units (VIU) in RLUSD."
      level="simulated"
      sections={[
        { title: "Indexes", rows: INDEXES },
        { title: "Index history", rows: INDEX_SERIES },
      ]}
    />
  );
}
