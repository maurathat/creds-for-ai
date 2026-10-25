import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { EVIDENCE_LADDER, RECEIPTS } from "@/lib/credence";

export const Route = createFileRoute("/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts — Claw Street" },
      { name: "description", content: "Seeded example receipts. Tier 1 = gateway witnessed response (offline simulated here); Tier 2 = provider signed what it says it served (simulated here). No tier proves exact weights ran, and these hosted receipts are not cryptographically verified." },
      { property: "og:title", content: "Receipts — Claw Street" },
      { property: "og:description", content: "Seeded example receipts. Tier 1 = gateway witnessed response (offline simulated here); Tier 2 = provider signed what it says it served (simulated here). No tier proves exact weights ran, and these hosted receipts are not cryptographically verified." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Receipts"
      title="Inference receipts"
      description="Seeded example receipts. Tier 1 = gateway witnessed response (offline simulated here); Tier 2 = provider signed what it says it served (simulated here). No tier proves exact weights ran, and these hosted receipts are not cryptographically verified."
      level="simulated"
      sections={[
        { title: "Receipts", rows: RECEIPTS },
        { title: "Evidence ladder", rows: EVIDENCE_LADDER },
      ]}
    />
  );
}
