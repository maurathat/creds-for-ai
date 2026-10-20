import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { FACILITY_CLASSES, MERCHANT_CATEGORIES, REVENUE_SERIES } from "@/lib/credence";

export const Route = createFileRoute("/machine-credit")({
  head: () => ({
    meta: [
      { title: "Machine Credit — Credence Markets" },
      {
        name: "description",
        content: "Facility classes beyond inference, and approved merchant categories.",
      },
      { property: "og:title", content: "Machine Credit — Credence Markets" },
      {
        property: "og:description",
        content: "Facility classes beyond inference, and approved merchant categories.",
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
      kicker="Machine Credit"
      title="Machine credit classes"
      description="Facility classes beyond inference, and approved merchant categories."
      level="roadmap"
      sections={[
        { title: "Facility classes", rows: FACILITY_CLASSES },
        { title: "Merchant categories", rows: MERCHANT_CATEGORIES.map((c) => ({ category: c })) },
        { title: "Revenue", rows: REVENUE_SERIES },
      ]}
    />
  );
}
