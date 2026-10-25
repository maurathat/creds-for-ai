import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { ConceptRibbon } from "@/components/kit";
import { RESERVATIONS } from "@/lib/credence";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Claw Street" },
      { name: "description", content: "Agent procurement concept: reserving inference capacity by execution profile and delivery window. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:title", content: "Reservations — Claw Street" },
      { property: "og:description", content: "Agent procurement concept: reserving inference capacity by execution profile and delivery window. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Reservations"
      title="Capacity reservations (concept)"
      description="Agent procurement concept: reserving inference capacity by execution profile and delivery window. Inactive concept preview — browser simulation, seeded data."
      level="concept"
      banner={<ConceptRibbon />}
      sections={[
        { title: "Reservations", rows: RESERVATIONS },
      ]}
    />
  );
}
