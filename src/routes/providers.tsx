import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";
import { PROVIDERS } from "@/lib/credence";

export const Route = createFileRoute("/providers")({
  head: () => ({
    meta: [
      { title: "Providers — Claw Street" },
      { name: "description", content: "Fictional seeded provider listings with models, artifacts, precision and allowlist status. No provider calls are made." },
      { property: "og:title", content: "Providers — Claw Street" },
      { property: "og:description", content: "Fictional seeded provider listings with models, artifacts, precision and allowlist status. No provider calls are made." },
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
      description="Fictional seeded provider listings with models, artifacts, precision and allowlist status. No provider calls are made."
      level="simulated"
      sections={[
        { title: "Providers", rows: PROVIDERS },
      ]}
    />
  );
}
