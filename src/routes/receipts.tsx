import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { EVIDENCE_LADDER, RECEIPTS } from "@/lib/credence";

export const Route = createFileRoute("/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts — Credence Markets" },
      { name: "description", content: "Kessai-serialized receipts bound to requests. Tier 2 is provider-declared and bound, not proof of execution." },
      { property: "og:title", content: "Receipts — Credence Markets" },
      { property: "og:description", content: "Kessai-serialized receipts bound to requests. Tier 2 is provider-declared and bound, not proof of execution." },
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
      description="Kessai-serialized receipts bound to requests. Tier 2 is provider-declared and bound, not proof of execution."
      level="live"
      sections={[
        { title: "Receipts", rows: RECEIPTS },
        { title: "Evidence ladder", rows: EVIDENCE_LADDER },
      ]}
    />
  );
}
