import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { FACILITY_CLASSES, MERCHANT_CATEGORIES, REVENUE_SERIES } from "@/lib/credence";

export const Route = createFileRoute("/machine-credit")({
  head: () => ({
    meta: [
      { title: "Machine Credit — Claw Street" },
      { name: "description", content: "Roadmap concept: agent procurement budgets beyond inference and approved purchase categories. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:title", content: "Machine Credit — Claw Street" },
      { property: "og:description", content: "Roadmap concept: agent procurement budgets beyond inference and approved purchase categories. Inactive concept preview — browser simulation, seeded data." },
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
      description="Roadmap concept: agent procurement budgets beyond inference and approved purchase categories. Inactive concept preview — browser simulation, seeded data."
      level="roadmap"
      sections={[
        { title: "Facility classes", rows: FACILITY_CLASSES },
        { title: "Merchant categories", rows: MERCHANT_CATEGORIES.map(c => ({ category: c })) },
        { title: "Revenue", rows: REVENUE_SERIES },
      ]}
    />
  );
}
