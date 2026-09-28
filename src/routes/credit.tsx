import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, PlayCircle, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Chip, Gauge, KV, MaturityTag, PageHeader, Panel } from "@/components/kit";
import {
  ATTACK_CASES,
  CORE_FLOW,
  FACILITY,
  REPAYMENTS,
  ROOT_ACTIONS,
  TRANSACTIONS,
  UTILIZATION,
} from "@/lib/credence";

export const Route = createFileRoute("/credit")({
  head: () => ({
    meta: [
      { title: "Credence Credit — machine credit facility for verified inference" },
      {
        name: "description",
        content:
          "Live MVP: a purpose-bound 500 RLUSD facility letting ResearchBot-17 buy Tier-2 verified inference from an approved provider, settled on the XRP Ledger.",
      },
      { property: "og:title", content: "Credence Credit — machine credit facility" },
      {
        property: "og:description",
        content:
          "Utilization, repayment schedule, hardware-root signing policy and an attack-case verifier with PASS/REJECT outcomes.",
      },
    ],
  }),
  component: Credit,
});

const STAGES = ["Authorization", "Receipt", "Verification", "Settlement"] as const;

function Simulator() {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(-1);

  useEffect(() => {
    if (!running) return;
    if (stage >= STAGES.length - 1) {
      const done = setTimeout(() => setRunning(false), 600);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setStage((s) => s + 1), 850);
    return () => clearTimeout(t);
  }, [running, stage]);

  const start = () => {
    setStage(0);
    setRunning(true);
  };

  const detail = [
    "Facility check: provider allowlist ✓ · profile digest ✓ · available 362.40 RLUSD ✓",
    "Northstar Compute returns a Tier-2 signed delivery receipt for 24 VIU.",
    "Kessai serialization re-derived; request/response/profile binding matches.",
    "Policy co-signs. 10.46 RLUSD settled; XRPL facility state updated.",
  ];

  return (
    <Panel
      title="Simulate inference purchase"
      subtitle="Walks one conforming draw through the live settlement path"
      right={<MaturityTag level="live" />}
    >
      <button
        onClick={start}
        disabled={running}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <PlayCircle className="size-4" />
        {running ? "Running…" : "Simulate inference purchase"}
      </button>

      <ol className="mt-5 space-y-2">
        {STAGES.map((s, i) => {
          const active = stage === i;
          const done = stage > i;
          return (
            <li
              key={s}
              className={`rounded-md border px-3.5 py-3 transition-all duration-500 ${
                active
                  ? "border-primary/50 bg-primary/10"
                  : done
                    ? "border-success/40 bg-success/5"
                    : "border-border bg-surface-2 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-xs font-medium">
                  <span className="num text-[11px] text-muted-foreground">0{i + 1}</span>
                  {s}
                </span>
                {done ? (
                  <Chip tone="pass">Complete</Chip>
                ) : active ? (
                  <Chip tone="info">In progress</Chip>
                ) : (
                  <Chip tone="neutral">Pending</Chip>
                )}
              </div>
              {(active || done) && (
                <p className="animate-fade-in mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {detail[i]}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {stage === STAGES.length - 1 && !running && (
        <p className="animate-fade-in mt-4 text-[11px] text-success">
          Settled. No hardware confirmation required — this purchase was in policy.
        </p>
      )}
    </Panel>
  );
}

function Credit() {
  return (
    <AppShell>
      <PageHeader
        kicker="Core flow"
        title="Credence Credit"
        level="live"
        description="A machine credit facility that lets an autonomous agent purchase verified inference. Purpose-bound, provider-bound and profile-bound: the agent spends operationally, while facility terms change only under hardware-root authority."
        actions={<Chip tone="info">XRPL settlement · RLUSD</Chip>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Active facility" right={<Chip tone="pass">{FACILITY.status}</Chip>}>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div>
              <KV k="Facility ID" v={FACILITY.id} mono />
              <KV k="Borrower" v={FACILITY.borrower} mono />
              <KV k="Borrower account" v={FACILITY.borrowerAccount} mono />
              <KV k="Facility limit" v={`${FACILITY.limit.toFixed(2)} RLUSD`} mono />
              <KV k="Available" v={`${FACILITY.available.toFixed(2)} RLUSD`} mono />
              <KV k="Outstanding" v={`${FACILITY.outstanding.toFixed(2)} RLUSD`} mono />
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
            <Gauge value={UTILIZATION} label="of 500 RLUSD drawn" />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md bg-surface-2 px-3 py-2.5">
                <div className="label-xs">Available</div>
                <div className="num mt-1 text-primary">{FACILITY.available.toFixed(2)}</div>
              </div>
              <div className="rounded-md bg-surface-2 px-3 py-2.5">
                <div className="label-xs">APR</div>
                <div className="num mt-1">{FACILITY.apr}%</div>
              </div>
            </div>
          </Panel>
          <Panel title="Approved execution profile">
            <div className="space-y-2 text-xs">
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
              <div className="num mt-1 text-xs">{FACILITY.rootAuthority}</div>
            </div>
            <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
              <div className="label-xs">Operational authority</div>
              <div className="num mt-1 text-xs">{FACILITY.opAuthority}</div>
            </div>
          </div>
          <ul className="space-y-1.5">
            {ROOT_ACTIONS.map((a) => (
              <li
                key={a.action}
                className="flex items-start justify-between gap-3 rounded-md bg-surface-2 px-3 py-2"
              >
                <span>
                  <span className="block text-xs">{a.action}</span>
                  <span className="text-[11px] text-muted-foreground">{a.detail}</span>
                </span>
                <Chip tone={a.root ? "warn" : "pass"}>
                  {a.root ? "Ledger approval required" : "In policy"}
                </Chip>
              </li>
            ))}
          </ul>
        </Panel>

        <Simulator />
      </div>

      <Panel title="Core flow" subtitle="Request → verification → settlement → reputation">
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          {CORE_FLOW.map((s) => (
            <div key={s.step} className="rounded-md border border-border bg-surface-2 px-3.5 py-3">
              <div className="num text-[11px] text-primary">0{s.step}</div>
              <div className="mt-1 text-xs font-medium">{s.title}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Facility requests" subtitle="Draw attempts against FAC-XRPL-0x7C41" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                {["Request", "Timestamp", "Provider", "Profile", "VIU", "RLUSD", "Outcome", "Detail"].map(
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
                  <td className="px-4 py-2.5 text-[11px] text-muted-foreground">
                    {t.outcome === "PASS" ? `XRPL ${t.xrpl}` : t.reason}
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
                    <span className="num text-[11px] text-muted-foreground">{c.id}</span>
                    <span className="text-xs font-medium">{c.name}</span>
                  </span>
                  <Chip tone={c.outcome === "PASS" ? "pass" : "reject"}>{c.outcome}</Chip>
                </div>
                <div className="num mt-1.5 text-[11px] text-muted-foreground">{c.input}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  <span className="text-foreground/70">Check:</span> {c.check} · {c.note}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel title="Repayment schedule" bodyClassName="p-0">
            <table className="w-full text-xs">
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
          </Panel>
          <Panel title="XRPL role">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
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
