import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { FORWARDS, FORWARD_CURVE } from "@/lib/credence";

export const Route = createFileRoute("/forwards")({
  head: () => ({
    meta: [
      { title: "Forwards — Credence Markets" },
      { name: "description", content: "Forward contracts to hedge future verified inference prices." },
      { property: "og:title", content: "Forwards — Credence Markets" },
      { property: "og:description", content: "Forward contracts to hedge future verified inference prices." },
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
      description="Forward contracts to hedge future verified inference prices."
      level="roadmap"
      sections={[
        { title: "Forward contracts", rows: FORWARDS },
        { title: "Forward curve", rows: FORWARD_CURVE },
      ]}
    />
  );
}
