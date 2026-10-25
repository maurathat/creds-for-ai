import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Chip, KV, PageHeader, Panel } from "@/components/kit";
import {
  Digest,
  Money,
  OfflineNotice,
  QueryState,
  SourceNote,
  TierBadge,
} from "@/components/credence";
import { useQueries } from "@tanstack/react-query";
import { TruthStrip } from "@/components/claw";
import { credenceClient, usePresets, useProviders } from "@/lib/credence-api/hooks";
import type { Provider } from "@/lib/credence-api/types";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Marketplace — Claw Street" },
      {
        name: "description",
        content:
          "Inference providers, execution profiles, evidence tiers and configured demo prices.",
      },
    ],
  }),
  component: Page,
});

function ProviderCard({ provider }: { provider: Provider }) {
  const q = provider.quote;
  return (
    <Panel
      title={provider.display_name}
      subtitle={`${provider.role} · ${provider.provider_id}`}
      right={<TierBadge evidence={provider.evidence} />}
    >
      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
        {provider.relationship}
      </p>
      <div className="grid gap-x-8 lg:grid-cols-2">
        <div>
          <div className="label-xs mb-1">Model and profile</div>
          <KV k="Model family" v={provider.model_family} mono />
          <KV k="Model identifier" v={provider.model_identifier} mono />
          <KV k="Execution profile" v={<Digest value={provider.execution_profile.digest} />} />
          <KV
            k="Artifact digest"
            v={
              provider.execution_profile.fields["model_artifact_digest"] ? (
                <Digest value={provider.execution_profile.fields["model_artifact_digest"]} />
              ) : (
                <Chip>NOT ASSERTED</Chip>
              )
            }
          />
          <KV
            k="Quantization / precision"
            v={`${provider.execution_profile.fields["quantization"] ?? "NOT ASSERTED"} / ${
              provider.execution_profile.fields["precision"] ?? "NOT ASSERTED"
            }`}
            mono
          />
          <KV k="Runtime" v={provider.execution_profile.fields["runtime"] ?? "NOT ASSERTED"} mono />
          <KV
            k="Service location"
            v={`${provider.service_class.jurisdiction ?? "—"} · residency ${provider.service_class.data_residency.join(", ")}`}
            mono
          />
        </div>
        <div>
          <div className="label-xs mb-1 flex items-center gap-2">
            Configured price <Chip tone="warn">Demo</Chip>
          </div>
          <KV
            k="Input, per 1M tokens"
            v={<Money micro={q.input_price_per_million_micro_trlusd} />}
          />
          <KV
            k="Output, per 1M tokens"
            v={<Money micro={q.output_price_per_million_micro_trlusd} />}
          />
          <KV k="Token caps (in / out)" v={`${q.max_input_tokens} / ${q.max_output_tokens}`} mono />
          <KV
            k="Maximum cost per purchase"
            v={<Money micro={q.max_total_cost_micro_trlusd} emphasis />}
          />
          <KV k="Quote" v={<Digest value={q.digest} />} />
          <KV k="Valid until" v={q.valid_until} mono />
          <p className="mt-2 text-[11px] text-warn">{q.price_label}.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <SourceNote>
          <span className="text-foreground">Evidence: </span>
          {provider.evidence_capability}
        </SourceNote>
        <SourceNote>
          <span className="text-foreground">Availability: not monitored. </span>
          Last recorded live delivery {provider.availability.last_recorded_delivery.completed_at}
          {provider.availability.last_recorded_delivery.latency_ms !== null &&
            ` (${provider.availability.last_recorded_delivery.latency_ms} ms)`}{" "}
          in <span className="num">{provider.availability.last_recorded_delivery.source}</span>.
        </SourceNote>
      </div>
      {provider.execution_profile.not_asserted.length > 0 && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Not asserted by this profile:{" "}
          <span className="num">{provider.execution_profile.not_asserted.join(", ")}</span>. A
          procurement class that constrains one of these never matches it.
        </p>
      )}
      {provider.declared_metadata && (
        <div className="mt-3 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-[11px] text-muted-foreground">
          <div className="label-xs mb-1">
            Nebius catalog declarations ({provider.declared_metadata.observed_at})
          </div>
          quantization <span className="num">{provider.declared_metadata.quantization}</span> ·
          context{" "}
          <span className="num">{provider.declared_metadata.context_length.toLocaleString()}</span>{" "}
          · region{" "}
          <span className="num">
            {provider.declared_metadata.regions
              .map((r) => `${r.name} (${r.country_code})`)
              .join(", ")}
          </span>{" "}
          · pricing strings <span className="num">{provider.declared_metadata.pricing.prompt}</span>{" "}
          / <span className="num">{provider.declared_metadata.pricing.completion}</span>
          <div className="mt-1">{provider.declared_metadata.note}</div>
        </div>
      )}
    </Panel>
  );
}

/** Each scenario's real Core dry run, offer by offer: who is eligible and why not. */
function EligibilityMatrix() {
  const presets = usePresets();
  const runs = useQueries({
    queries: (presets.data ?? []).map((p) => ({
      queryKey: ["credence", "market-dry-run", p.preset_id],
      queryFn: () => credenceClient().evaluateProcurement(p.form),
      staleTime: 60_000,
    })),
  });
  const providerIds = [
    ...new Set(runs.flatMap((r) => r.data?.offers.map((o) => o.provider_id) ?? [])),
  ];
  return (
    <Panel
      title="Offers and eligibility"
      subtitle="Real Credence Core policy dry runs of each scenario · nothing reserved · no inference executed"
      right={<Chip tone="info">Core dry run</Chip>}
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs" aria-label="Eligibility matrix">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="label-xs px-4 py-2.5 font-medium">Scenario</th>
              {providerIds.map((id) => (
                <th key={id} className="label-xs px-4 py-2.5 font-medium">
                  {id}
                </th>
              ))}
              <th className="label-xs px-4 py-2.5 font-medium">Routed to</th>
            </tr>
          </thead>
          <tbody>
            {(presets.data ?? []).map((preset, i) => {
              const run = runs[i]?.data;
              return (
                <tr key={preset.preset_id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{preset.title}</td>
                  {providerIds.map((id) => {
                    const offer = run?.offers.find((o) => o.provider_id === id);
                    return (
                      <td
                        key={id}
                        className="px-4 py-3"
                        data-eligibility={`${preset.preset_id}:${id}`}
                      >
                        {!offer ? (
                          "…"
                        ) : offer.qualified ? (
                          <span className="flex flex-wrap items-center gap-1.5">
                            <Chip tone="pass">Eligible</Chip>
                            <Money micro={offer.max_total_cost_micro_trlusd} />
                          </span>
                        ) : (
                          <span title={offer.reason ?? ""}>
                            <Chip tone="reject">{offer.reason_code}</Chip>
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="num px-4 py-3">{run?.chosen_provider_id ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
        {runs[0]?.data?.routing_rule ??
          "Lowest maximum cost among offers Core accepted. Configured demo quotes; no auction or bidding."}
      </p>
    </Panel>
  );
}

function Page() {
  const providers = useProviders();
  return (
    <AppShell>
      <PageHeader
        kicker="Marketplace"
        title="Providers, prices and offers"
        description="The providers Claw Street agents can buy inference from today, with the execution profile each offer is checked against, its evidence tier, its configured price and whether Credence Core accepts it."
        actions={
          <Link
            to="/procure"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Start an agent purchase <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      <TruthStrip />
      <OfflineNotice />
      <EligibilityMatrix />
      <QueryState isLoading={providers.isLoading} error={providers.error}>
        <div className="grid gap-5 2xl:grid-cols-2">
          {providers.data?.map((p) => (
            <ProviderCard key={p.provider_id} provider={p} />
          ))}
        </div>
        <SourceNote>
          Two providers serve the same model family (qwen3-30b-a3b-instruct-2507). Comparison is at
          model-family level only: no artifact, precision or quantization equality is claimed. One
          offer per provider; Credence routes to the cheapest offer that Core accepts. There is no
          auction or bidding.
        </SourceNote>
      </QueryState>
    </AppShell>
  );
}
