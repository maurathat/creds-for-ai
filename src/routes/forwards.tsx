import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { FORWARDS, FORWARD_CURVE } from "@/lib/credence";

export const Route = createFileRoute("/forwards")({
  head: () => ({
    meta: [
      { title: "Delivery reservations — Credence Markets" },
      {
        name: "description",
        content:
          "Inference reservations, physically delivered (preview). Seeded prototype data; nothing is priced, held or delivered.",
      },
      { property: "og:title", content: "Delivery reservations — Credence Markets" },
      {
        property: "og:description",
        content:
          "Inference reservations, physically delivered (preview). Seeded prototype data; nothing is priced, held or delivered.",
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
      kicker="Delivery reservations"
      title="Inference reservations, physically delivered (preview)"
      description="Inference reservations, physically delivered (preview). Seeded prototype data; nothing is priced, held or delivered."
      level="roadmap"
      sections={[
        { title: "Dated reservations (seeded)", rows: FORWARDS },
        { title: "Reservation price schedule (illustrative)", rows: FORWARD_CURVE },
      ]}
    />
  );
}
