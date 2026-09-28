import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { PROVIDERS } from "@/lib/credence";

export const Route = createFileRoute("/providers")({
  head: () => ({
    meta: [
      { title: "Providers — Credence Markets" },
      { name: "description", content: "Listed execution providers with models, artifacts, precision and credit eligibility." },
      { property: "og:title", content: "Providers — Credence Markets" },
      { property: "og:description", content: "Listed execution providers with models, artifacts, precision and credit eligibility." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DataPage
      kicker="Providers"
      title="Provider directory"
      description="Listed execution providers with models, artifacts, precision and credit eligibility."
      level="simulated"
      sections={[
        { title: "Providers", rows: PROVIDERS },
      ]}
    />
  );
}
