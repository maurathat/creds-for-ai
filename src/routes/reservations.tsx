import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { ConceptRibbon } from "@/components/kit";
import { RESERVATIONS } from "@/lib/credence";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Claw Street" },
      { name: "description", content: "Reserved VIU capacity by execution profile and delivery window." },
      { property: "og:title", content: "Reservations — Claw Street" },
      { property: "og:description", content: "Reserved VIU capacity by execution profile and delivery window." },
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
      title="Capacity reservations"
      description="Reserved VIU capacity by execution profile and delivery window."
      level="concept"
      sections={[
        { title: "Reservations", rows: RESERVATIONS },
      ]}
    />
  );
}
