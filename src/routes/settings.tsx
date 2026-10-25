import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { OPERATING_PROFILE, ROOT_ACTIONS } from "@/lib/credence";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Claw Street" },
      { name: "description", content: "Design ambition: facility changes would require a Ledger hardware root. Ledger hardware is not connected in this browser simulation." },
      { property: "og:title", content: "Settings — Claw Street" },
      { property: "og:description", content: "Design ambition: facility changes would require a Ledger hardware root. Ledger hardware is not connected in this browser simulation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Settings"
      title="Account & signing policy"
      description="Design ambition: facility changes would require a Ledger hardware root. Ledger hardware is not connected in this browser simulation."
      level="roadmap"
      sections={[
        { title: "Root-gated actions", rows: ROOT_ACTIONS },
        { title: "Operating profile", rows: [OPERATING_PROFILE] },
      ]}
    />
  );
}
