import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { OPERATING_PROFILE, ROOT_ACTIONS } from "@/lib/credence";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Credence Markets" },
      {
        name: "description",
        content:
          "Actions that require the Ledger hardware root. The hardware wallet is the constitution, not the cashier.",
      },
      { property: "og:title", content: "Settings — Credence Markets" },
      {
        property: "og:description",
        content:
          "Actions that require the Ledger hardware root. The hardware wallet is the constitution, not the cashier.",
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
      kicker="Settings"
      title="Account & signing policy"
      description="Actions that require the Ledger hardware root. The hardware wallet is the constitution, not the cashier."
      level="live"
      sections={[
        { title: "Root-gated actions", rows: ROOT_ACTIONS },
        { title: "Operating profile", rows: [OPERATING_PROFILE] },
      ]}
    />
  );
}
