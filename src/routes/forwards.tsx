import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { ConceptRibbon } from "@/components/kit";
import { FORWARDS, FORWARD_CURVE } from "@/lib/credence";

export const Route = createFileRoute("/forwards")({
  head: () => ({
    meta: [
      { title: "Forward Procurement (concept) — Claw Street" },
      { name: "description", content: "Agent procurement concept: pre-agreeing future inference capacity with a provider. Not a tradable contract. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:title", content: "Forwards — Claw Street" },
      { property: "og:description", content: "Agent procurement concept: pre-agreeing future inference capacity with a provider. Not a tradable contract. Inactive concept preview — browser simulation, seeded data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Forward procurement"
      title="Forward procurement (concept)"
      description="Agent procurement concept: pre-agreeing future inference capacity with a provider. Not a tradable contract. Inactive concept preview — browser simulation, seeded data."
      level="roadmap"
      banner={<ConceptRibbon />}
      sections={[
        { title: "Procurement agreements (illustrative)", rows: FORWARDS },
        { title: "Illustrative price path (simulated)", rows: FORWARD_CURVE },
      ]}
    />
  );
}
