import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { ConceptRibbon } from "@/components/kit";
import { FORWARDS, FORWARD_CURVE } from "@/lib/credence";

export const Route = createFileRoute("/forwards")({
  head: () => ({
    meta: [
      { title: "Forwards — Claw Street" },
      { name: "description", content: "Commercial forward delivery agreements for future verified inference capacity." },
      { property: "og:title", content: "Forwards — Claw Street" },
      { property: "og:description", content: "Commercial forward delivery agreements for future verified inference capacity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Forwards"
      title="Inference forwards"
      description="Commercial forward delivery agreements for future verified inference capacity."
      level="roadmap"
      banner={<ConceptRibbon />}
      sections={[
        { title: "Forward contracts", rows: FORWARDS },
        { title: "Forward curve", rows: FORWARD_CURVE },
      ]}
    />
  );
}
