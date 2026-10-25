import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, PlayCircle, RotateCcw, ShieldAlert, XCircle } from "lucide-react";
import { ATTACKS, PASS_DETAILS, SIM_DRAW, SIM_STAGES, SIM_STEP_MS, type Attack } from "@/lib/simulation";
import { AppShell } from "@/components/shell";
import { Chip, Gauge, KV, MaturityTag, PageHeader, Panel } from "@/components/kit";
import {
  ATTACK_CASES,
  CORE_FLOW,
  FACILITY,
  REPAYMENTS,
  ROOT_ACTIONS,
  TRANSACTIONS,
} from "@/lib/credence";

export const Route = createFileRoute("/credit")({
  head: () => ({
    meta: [
      { title: "Credit — Claw Street" },
      {
        name: "description",
        content:
          "Core demo: a purpose-bound 500 tRLUSD (test asset) facility letting ResearchBot-17 buy Tier-2 verified inference from an approved provider, settled on the XRP Ledger.",
      },
      { property: "og:title", content: "Credit — Claw Street" },
      {
        property: "og:description",
        content:
          "Utilization, repayment schedule, hardware-root signing policy and an attack-case verifier with PASS/REJECT outcomes.",
      },
    ],
  }),
  component: Credit,
});

type Run = { kind: "purchase" } | { kind: "attack"; attack: Attack };

function Simulator({ onSettled, onReset }: { onSettled: (amount: number) => void; onReset: () => void }) {
  const [run, setRun] = useState<Run | null>(null);
  const [step, setStep] = useState(-1); // number of steps resolved so far - 1
  const failAt = run?.kind === "attack" ? run.attack.failAt : -1;
  const finished = run !== null && (failAt >= 0 ? step >= failAt : step >= SIM_STAGES.length - 1);

  useEffect(() => {
    if (!run || finished) return;
    const t = setTimeout(() => setStep((s) => s + 1), SIM_STEP_MS);
    return () => clearTimeout(t);
  }, [run, step, finished]);

  useEffect(() => {
    if (run?.kind === "purchase" && finished) onSettled(SIM_DRAW);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const start = (r: Run) => {
    setStep(-1);
    setRun(r);
  };
  const reset = () => {
    setRun(null);
    setStep(-1);
    onReset();
  };
  const busy = run !== null && !finished;

  return (
    <Panel
      title="Simulate inference purchase"
      subtitle="Step-by-step walkthrough using demo data"
      right={<MaturityTag level="live" />}
    >
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => start({ kind: "purchase" })}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <PlayCircle className="size-4" />
          Simulate inference purchase
        </button>
        <button
          onClick={() => start({ kind: "attack", attack: ATTACKS[Math.floor(Math.random() * ATTACKS.length)]! })}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3.5 py-2 text-sm font-semibold text-destructive transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <ShieldAlert className="size-4" />
          Simulate attack
        </button>
        <button
          onClick={reset}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-border-strong px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
      </div>

      {run?.kind === "attack" && (
        <p className="mt-4 text-[12.5px] text-muted-foreground">
          Attack case: <span className="text-destructive">{run.attack.name}</span>
        </p>
      )}

      <ol className="mt-4 space-y-2">
        {SIM_STAGES.map((s, i) => {
          const resolved = step >= i;
          const failed = resolved && i === failAt;
          const skipped = failAt >= 0 && i > failAt;
          return (
            <li
              key={s}
              className={`rounded-md border px-3.5 py-3 transition-all duration-300 ${
                failed
                  ? "border-destructive/50 bg-destructive/10"
                  : resolved
                    ? "border-success/40 bg-success/5"
                    : "border-border bg-surface-2 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <span className="num text-[12.5px] text-muted-foreground">0{i + 1}</span>
                  {s}
                </span>
                {failed ? (
                  <span className="flex items-center gap-1 text-[12.5px] text-destructive">
                    <XCircle className="size-4" /> Rejected
                  </span>
                ) : resolved ? (
                  <span className="flex items-center gap-1 text-[12.5px] text-success">
                    <CheckCircle2 className="size-4" /> Passed
                  </span>
                ) : (
                  <Chip tone="neutral">{skipped && finished ? "Not reached" : "Pending"}</Chip>
                )}
              </div>
              {resolved && (
                <p className={`mt-2 text-[12.5px] leading-relaxed ${failed ? "text-destructive" : "text-muted-foreground"}`}>
                  {failed && run?.kind === "attack" ? run.attack.reason : PASS_DETAILS[i]}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {finished && run?.kind === "purchase" && (
        <p className="mt-4 text-[12.5px] text-success">
          Settled in policy — no hardware confirmation required. Balances above are updated.
        </p>
      )}
      {finished && run?.kind === "attack" && (
        <p className="mt-4 text-[12.5px] text-destructive">Rejected — no draw, balances unchanged.</p>
      )}
    </Panel>
  );
}

function Credit() {
  const [simDrawn, setSimDrawn] = useState(0);
  const outstanding = Math.round((FACILITY.outstanding + simDrawn) * 100) / 100;
  const available = Math.round((FACILITY.limit - outstanding) * 100) / 100;
  const utilization = +((outstanding / FACILITY.limit) * 100).toFixed(1);
  return (
    <AppShell>
      <PageHeader
        kicker="Core flow"
        title="Credence Credit"
        level="live"
        description="A machine credit facility that lets an autonomous agent purchase verified inference. Purpose-bound, provider-bound and profile-bound: the agent spends operationally, while facility terms change only under hardware-root authority."
        actions={<Chip tone="info">Target: RLUSD settlement on XRPL</Chip>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Active facility" right={<Chip tone="pass">{FACILITY.status}</Chip>}>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div>
              <KV k="Facility ID" v={FACILITY.id} mono />
              <KV k="Borrower" v={FACILITY.borrower} mono />
              <KV k="Example address" v={FACILITY.borrowerAccount} mono />
              <KV k="Facility limit" v={`${FACILITY.limit.toFixed(2)} tRLUSD`} mono />
              <KV k="Available" v={`${available.toFixed(2)} tRLUSD`} mono />
              <KV k="Outstanding" v={`${outstanding.toFixed(2)} tRLUSD`} mono />
              <KV k="Purpose" v={FACILITY.purpose} />
            </div>
            <div>
              <KV k="Approved provider" v={FACILITY.provider} mono />
              <KV k="Model" v={FACILITY.model} />
              <KV k="Artifact digest" v={FACILITY.digest} mono />
              <KV k="Precision" v={FACILITY.precision} mono />
              <KV k="Evidence tier" v={<span className="text-primary">{FACILITY.evidenceTier}</span>} mono />
              <KV k="Ledger" v={FACILITY.ledger} mono />
              <KV k="Settlement asset" v={FACILITY.settlement} mono />
            </div>
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel title="Utilization">
            <Gauge value={utilization} label={`of ${FACILITY.limit} tRLUSD drawn`} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-surface-2 px-3 py-2.5">
                <div className="label-xs">Available</div>
                <div className="num mt-1 text-primary">{available.toFixed(2)}</div>
              </div>
              <div className="rounded-md bg-surface-2 px-3 py-2.5">
                <div className="label-xs">APR</div>
                <div className="num mt-1">{FACILITY.apr}%</div>
              </div>
            </div>
          </Panel>
          <Panel title="Approved execution profile">
            <div className="space-y-2 text-sm">
              <KV k="Profile digest" v={FACILITY.profileDigest} mono />
              <KV k="Artifact" v="Meridian-70B-Instruct (open weights)" />
              <KV k="Precision / quantization" v="BF16" mono />
              <KV k="Kessai serialization" v="Canonical request binding v1" />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <Panel
          title="Hardware-root signing policy"
          subtitle="The hardware wallet is the constitution, not the cashier"
          right={<KeyRound className="size-4 text-primary" />}
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5">
              <div className="label-xs">Root authority</div>
              <div className="num mt-1 text-sm">{FACILITY.rootAuthority}</div>
            </div>
            <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
              <div className="label-xs">Operational authority</div>
              <div className="num mt-1 text-sm">{FACILITY.opAuthority}</div>
            </div>
          </div>
          <ul className="space-y-1.5">
            {ROOT_ACTIONS.map((a) => (
              <li
                key={a.action}
                className="flex items-start justify-between gap-3 rounded-md bg-surface-2 px-3 py-2"
              >
                <span>
                  <span className="block text-sm">{a.action}</span>
                  <span className="text-[12.5px] text-muted-foreground">{a.detail}</span>
                </span>
                <Chip tone={a.root ? "warn" : "pass"}>
                  {a.root ? "Ledger approval required" : "In policy"}
                </Chip>
              </li>
            ))}
          </ul>
        </Panel>

        <Simulator onSettled={(amt) => setSimDrawn((d) => d + amt)} onReset={() => setSimDrawn(0)} />
      </div>

      <Panel title="Core flow" subtitle="Request → verification → settlement → reputation">
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          {CORE_FLOW.map((s) => (
            <div key={s.step} className="rounded-md border border-border bg-surface-2 px-3.5 py-3">
              <div className="num text-[12.5px] text-primary">0{s.step}</div>
              <div className="mt-1 text-sm font-medium">{s.title}</div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Facility requests" subtitle="Draw attempts against FAC-XRPL-0x7C41" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Request", "Timestamp", "Provider", "Profile", "VIU", "tRLUSD", "Outcome", "Settlement ref (demo) / reason"].map(
                  (h) => (
                    <th key={h} className="label-xs px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="num px-4 py-2.5">{t.id}</td>
                  <td className="num px-4 py-2.5 text-muted-foreground">{t.ts}</td>
                  <td className="px-4 py-2.5">{t.provider}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{t.profile}</td>
                  <td className="num px-4 py-2.5">{t.viu}</td>
                  <td className="num px-4 py-2.5">{t.rlusd.toFixed(2)}</td>
                  <td className="px-4 py-2.5">
                    <Chip tone={t.outcome === "PASS" ? "pass" : "reject"}>{t.outcome}</Chip>
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-muted-foreground">
                    {t.outcome === "PASS" ? (
                      <span title="Illustrative reference — not an on-chain transaction." className="cursor-help underline decoration-dotted">
                        {t.xrpl}
                      </span>
                    ) : (
                      t.reason
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Panel
          title="Attack-case verifier"
          subtitle="One valid request and six rejected examples"
          right={<ShieldAlert className="size-4 text-warn" />}
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {ATTACK_CASES.map((c) => (
              <li key={c.id} className="px-5 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2.5">
                    <span className="num text-[12.5px] text-muted-foreground">{c.id}</span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </span>
                  <Chip tone={c.outcome === "PASS" ? "pass" : "reject"}>{c.outcome}</Chip>
                </div>
                <div className="num mt-1.5 break-all text-[12.5px] text-muted-foreground">{c.input}</div>
                <div className="mt-1 text-[12.5px] text-muted-foreground">
                  <span className="text-foreground/70">Check:</span> {c.check} · {c.note}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel title="Repayment schedule" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["ID", "Due", "Principal", "Interest", "Status"].map((h) => (
                    <th key={h} className="label-xs px-5 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REPAYMENTS.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="num px-5 py-2.5">{r.id}</td>
                    <td className="num px-5 py-2.5 text-muted-foreground">{r.due}</td>
                    <td className="num px-5 py-2.5">{r.principal.toFixed(2)}</td>
                    <td className="num px-5 py-2.5">{r.interest.toFixed(2)}</td>
                    <td className="px-5 py-2.5">
                      <Chip tone={r.status === "Paid" ? "pass" : "neutral"}>{r.status}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="XRPL role">
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              XRPL carries credit and facility state, settlement in RLUSD, account identity and
              facility transaction references. XRPL does not natively enforce application-level
              provider, model, precision or amount rules. Credence policy plus co-signing enforces
              those terms before settlement is released.
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
