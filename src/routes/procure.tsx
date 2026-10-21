import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CircleCheck, CircleX, FlaskConical, History } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Chip, PageHeader, Panel } from "@/components/kit";
import {
  Digest,
  Money,
  OfflineNotice,
  QueryState,
  SourceNote,
  TierBadge,
} from "@/components/credence";
import {
  useEvaluateProcurement,
  usePresets,
  useProviders,
  useSubmitPurchase,
} from "@/lib/credence-api/hooks";
import { ApiError } from "@/lib/credence-api/client";
import type { ProcurementEvaluation, ProcurementForm, Provider } from "@/lib/credence-api/types";
import { purchaseAction } from "@/lib/credence-api/view";
import { AgentSessionPanel, useAgentToken } from "@/components/agent-session";
import { LivePurchasePanel } from "@/components/live-purchase";

export const Route = createFileRoute("/procure")({
  head: () => ({
    meta: [
      { title: "Procurement — Credence Markets" },
      {
        name: "description",
        content: "Define an inference procurement and see which offers Credence Core accepts.",
      },
    ],
  }),
  component: Page,
});

const TIERS = [
  { tier: 0, label: "Tier 0 · Requested" },
  { tier: 1, label: "Tier 1 · Witnessed" },
  { tier: 2, label: "Tier 2 · Bound and signed" },
  { tier: 3, label: "Tier 3 · Measured (roadmap)" },
];
const LOCATIONS = ["FI", "US"];

const inputCls =
  "w-full rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="label-xs">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function toggle(list: string[], value: string, on: boolean): string[] {
  return on ? [...new Set([...list, value])].sort() : list.filter((v) => v !== value);
}

function parseInteger(text: string): number | null {
  return /^\d+$/.test(text.trim()) ? Number(text.trim()) : null;
}

function ConstraintField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[] | null;
  onChange: (next: string[] | null) => void;
  hint: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <select
          className={inputCls}
          value={value === null ? "any" : "set"}
          onChange={(e) => onChange(e.target.value === "any" ? null : (value ?? []))}
        >
          <option value="any">No constraint</option>
          <option value="set">Only these values</option>
        </select>
        {value !== null && (
          <input
            className={inputCls}
            placeholder="e.g. Q8_0"
            value={value.join(",")}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              )
            }
          />
        )}
      </div>
    </Field>
  );
}

function PolicyForm({
  form,
  setForm,
  providers,
}: {
  form: ProcurementForm;
  setForm: (f: ProcurementForm) => void;
  providers: Provider[];
}) {
  const families = [...new Set(providers.map((p) => p.model_family))];
  const [maxPrice, setMaxPrice] = useState(
    form.max_total_cost_micro_trlusd === null ? "" : String(form.max_total_cost_micro_trlusd),
  );
  useEffect(() => {
    setMaxPrice(
      form.max_total_cost_micro_trlusd === null ? "" : String(form.max_total_cost_micro_trlusd),
    );
  }, [form.max_total_cost_micro_trlusd]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Requested model family">
          <select
            className={inputCls}
            value={form.model_family}
            onChange={(e) => setForm({ ...form, model_family: e.target.value })}
          >
            {families.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Inference workload (prompt)"
          hint="Only its digest enters the purchase request. Core reserves each offer's maximum cost at the quote's token caps."
        >
          <textarea
            className={inputCls}
            rows={3}
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
          />
        </Field>
        <Field
          label="Maximum acceptable price (micro-tRLUSD) · preview only"
          hint="Core applies this cap in the dry run (PRICE_ABOVE_MAX). The purchase path cannot carry a buyer price cap yet, so no purchase can be made under it. Empty: each offer's own quote maximum, as the integrated purchase path does today."
        >
          <input
            className={inputCls}
            inputMode="numeric"
            value={maxPrice}
            placeholder="quote maximum"
            onChange={(e) => {
              setMaxPrice(e.target.value);
              const n = parseInteger(e.target.value);
              if (e.target.value.trim() === "" || n !== null) {
                setForm({ ...form, max_total_cost_micro_trlusd: n });
              }
            }}
          />
        </Field>
        <Field label="Minimum evidence tier">
          <select
            className={inputCls}
            value={form.minimum_evidence_tier}
            onChange={(e) => setForm({ ...form, minimum_evidence_tier: Number(e.target.value) })}
          >
            {TIERS.map((t) => (
              <option key={t.tier} value={t.tier}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="space-y-4">
        <Field label="Allowed providers">
          <div className="flex flex-wrap gap-3">
            {providers.map((p) => (
              <label key={p.provider_id} className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={form.allowed_providers.includes(p.provider_id)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      allowed_providers: toggle(
                        form.allowed_providers,
                        p.provider_id,
                        e.target.checked,
                      ),
                    })
                  }
                />
                <span className="num">{p.provider_id}</span>
              </label>
            ))}
          </div>
        </Field>
        <ConstraintField
          label="Quantization"
          value={form.allowed_quantizations}
          onChange={(v) => setForm({ ...form, allowed_quantizations: v })}
          hint="A constrained value never matches a profile that does not assert it."
        />
        <ConstraintField
          label="Precision"
          value={form.allowed_precisions}
          onChange={(v) => setForm({ ...form, allowed_precisions: v })}
          hint="Neither configured profile asserts a precision."
        />
        <Field label="Allowed jurisdictions and data residency">
          <div className="flex flex-wrap gap-4 text-xs">
            {LOCATIONS.map((c) => (
              <span key={c} className="flex items-center gap-3">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.allowed_jurisdictions.includes(c)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        allowed_jurisdictions: toggle(
                          form.allowed_jurisdictions,
                          c,
                          e.target.checked,
                        ),
                      })
                    }
                  />
                  <span className="num">{c}</span> jurisdiction
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.allowed_data_residencies.includes(c)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        allowed_data_residencies: toggle(
                          form.allowed_data_residencies,
                          c,
                          e.target.checked,
                        ),
                      })
                    }
                  />
                  <span className="num">{c}</span> residency
                </label>
              </span>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Facility limit (micro-tRLUSD)">
            <input
              className={inputCls}
              inputMode="numeric"
              value={form.facility_limit_micro_trlusd}
              onChange={(e) => {
                const n = parseInteger(e.target.value);
                if (n !== null) setForm({ ...form, facility_limit_micro_trlusd: n });
              }}
            />
          </Field>
          <Field label="Already drawn (micro-tRLUSD)">
            <input
              className={inputCls}
              inputMode="numeric"
              value={form.facility_drawn_micro_trlusd}
              onChange={(e) => {
                const n = parseInteger(e.target.value);
                if (n !== null) setForm({ ...form, facility_drawn_micro_trlusd: n });
              }}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function OfferComparison({ result }: { result: ProcurementEvaluation }) {
  return (
    <Panel
      title="Offer comparison under this policy"
      subtitle={`Real Credence Core policy dry run at ${result.evaluated_at} · no funds reserved · no inference executed · ${result.competition}`}
      right={<Chip tone="info">Core dry run</Chip>}
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              {[
                "Provider",
                "Evidence",
                "Maximum cost (demo quote)",
                "Core decision",
                "Why",
                "Decision record",
              ].map((h) => (
                <th key={h} className="label-xs px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.offers.map((o) => {
              const chosen = o.provider_id === result.chosen_provider_id;
              return (
                <tr
                  key={o.provider_id}
                  className="border-b border-border/60 align-top last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.display_name}</div>
                    <div className="num text-[11px] text-muted-foreground">{o.quote_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge evidence={o.evidence} />
                  </td>
                  <td className="px-4 py-3">
                    <Money micro={o.max_total_cost_micro_trlusd} emphasis />
                  </td>
                  <td className="px-4 py-3">
                    {o.qualified ? (
                      <span className="flex items-center gap-1.5">
                        <CircleCheck className="size-3.5 text-success" />
                        <Chip tone="pass">Eligible</Chip>
                        {chosen && <Chip tone="info">Selected</Chip>}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <CircleX className="size-3.5 text-destructive" />
                        <Chip tone="reject">{o.reason_code}</Chip>
                      </span>
                    )}
                  </td>
                  <td className="max-w-md px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                    {o.qualified
                      ? chosen
                        ? "Accepted by Core and lowest maximum cost among accepted offers."
                        : "Accepted by Core; not the lowest maximum cost."
                      : o.reason}
                    {o.reason_details.map((d) => (
                      <div key={d} className="mt-1 text-foreground/80">
                        · {d}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <Digest value={o.policy_decision.digest} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 border-t border-border px-5 py-3.5">
        <p className="text-[11px] text-muted-foreground">
          <span className="text-foreground">Routing rule:</span> {result.routing_rule}
        </p>
        <p className="text-[11px] text-muted-foreground">{result.notice}</p>
        <p className="text-[11px] text-muted-foreground">{result.facility.note}</p>
      </div>
    </Panel>
  );
}

function Page() {
  const presets = usePresets();
  const providers = useProviders();
  const evaluate = useEvaluateProcurement();
  const submit = useSubmitPurchase();
  const navigate = useNavigate();
  const [presetId, setPresetId] = useState<string>("scenario-a-general");
  const [form, setForm] = useState<ProcurementForm | null>(null);
  const [token, setToken] = useAgentToken();

  useEffect(() => {
    if (!form && presets.data?.[0]) setForm(presets.data[0].form);
  }, [form, presets.data]);

  const loadPreset = (id: string) => {
    const preset = presets.data?.find((p) => p.preset_id === id);
    if (preset) {
      setPresetId(id);
      setForm(preset.form);
      evaluate.reset();
      submit.reset();
    }
  };

  // Any edit invalidates the last dry run, so the button never acts on a stale evaluation.
  const editForm = (next: ProcurementForm) => {
    setForm(next);
    evaluate.reset();
    submit.reset();
  };
  const action = purchaseAction(evaluate.data);

  const onViewRecorded = async () => {
    if (!evaluate.data || !action.enabled) return;
    const result = await submit.mutateAsync(evaluate.data.form);
    if (result.mode === "offline_replay") {
      await navigate({
        to: "/operations/$operationId",
        params: { operationId: result.operation_id },
      });
    }
  };

  const error = evaluate.error ?? submit.error;

  return (
    <AppShell>
      <PageHeader
        kicker="Procurement"
        title="Define a procurement"
        description="State what the agent may buy: model, workload, price ceiling, evidence floor, providers and facility constraints. Credence Core decides which offers qualify in a real policy dry run, which reserves no funds and executes no inference."
      />
      <OfflineNotice />
      <QueryState
        isLoading={presets.isLoading || providers.isLoading}
        error={presets.error ?? providers.error}
      >
        <Panel
          title="Procurement policy"
          subtitle="Start from a preset, then change anything"
          right={
            <div className="flex gap-1.5">
              {presets.data?.map((p) => (
                <button
                  key={p.preset_id}
                  onClick={() => loadPreset(p.preset_id)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] ${
                    presetId === p.preset_id && form?.model_family
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border-strong text-muted-foreground hover:bg-surface-2"
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          }
        >
          {form && providers.data && (
            <PolicyForm form={form} setForm={editForm} providers={providers.data} />
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => form && evaluate.mutate(form)}
              disabled={!form || evaluate.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <FlaskConical className="size-4" />
              {evaluate.isPending ? "Running dry run…" : "Run Core policy dry run"}
            </button>
            <button
              onClick={() => void onViewRecorded()}
              disabled={!action.enabled || submit.isPending}
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-3.5 py-2 text-xs font-semibold hover:bg-surface-2 disabled:opacity-40"
              title={action.note}
            >
              <History className="size-4" />
              {action.label}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{action.note}</p>
        </Panel>
      </QueryState>

      {error && (
        <SourceNote>
          {error instanceof ApiError ? `${error.code}: ${error.detail}` : String(error)}
        </SourceNote>
      )}
      {submit.data?.mode === "not_available" && (
        <Panel title="No recorded purchase" right={<Chip tone="warn">{submit.data.code}</Chip>}>
          <p className="text-xs text-muted-foreground">{submit.data.detail}</p>
        </Panel>
      )}
      {evaluate.data && <OfferComparison result={evaluate.data} />}
      <AgentSessionPanel token={token} setToken={setToken} />
      {/* Keyed by the dry run, so an edited policy never submits an older preparation. */}
      <LivePurchasePanel
        key={evaluate.data?.evaluated_at ?? "none"}
        evaluation={evaluate.data}
        hasSession={!!token}
      />
      {evaluate.data && evaluate.data.form.max_total_cost_micro_trlusd !== null && (
        <SourceNote>
          <Chip tone="warn">Preview</Chip> The price cap of{" "}
          <span className="num">{evaluate.data.form.max_total_cost_micro_trlusd}</span> micro-tRLUSD
          was enforced by Core in this dry run only. No purchase can carry it until the backend
          supports a buyer price cap (CR-2); the integrated purchase refuses a capped policy.
        </SourceNote>
      )}
    </AppShell>
  );
}
