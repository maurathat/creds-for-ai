import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Boxes, FileCheck2 } from "lucide-react";
import { Chip, MaturityTag } from "@/components/kit";
import { FACILITY, VIU_SPOT } from "@/lib/credence";
import logoGif from "@/assets/claw-street-logo.gif.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Claw Street — Financial Markets for Machine Intelligence" },
      {
        name: "description",
        content:
          "Credence finances verified inference for autonomous agents. Buy it. Finance it. Hedge it. Verify it.",
      },
      { property: "og:title", content: "Claw Street — Financial Markets for Machine Intelligence" },
      {
        property: "og:description",
        content:
          "A machine credit facility for autonomous agents purchasing verified inference, settled in tRLUSD (test token) on the XRP Ledger.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STACK = [
  { k: "Credit", d: "Purpose-bound machine credit facilities" },
  { k: "Marketplace", d: "Competing verified inference providers" },
  { k: "Reservations", d: "Forward capacity commitments" },
  { k: "Forwards", d: "Commercial forward delivery contracts" },
  { k: "Secondary", d: "Transferable capacity claims (concept)" },
];

function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src="/claw-street-icon-512.png" alt="" className="size-10 rounded-md" />
            <span className="leading-tight">
              <span className="font-pixel block text-[11px] text-foreground">CLAW STREET</span>
              <span className="mt-1 block text-[10px] text-muted-foreground">Powered by Credence</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="info">Target: RLUSD settlement on XRPL</Chip>
            <Link
              to="/overview"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2"
            >
              Open terminal <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="grid-lines border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-28">
          <div className="flex flex-wrap items-center gap-2">
            <MaturityTag level="live" />
            <Chip tone="neutral">Credence Credit is the live MVP</Chip>
            <Chip tone="roadmap">Other modules simulated / roadmap</Chip>
          </div>
          <h1 className="mt-7 flex justify-center">
            <img src={logoGif.url} alt="Claw Street — Powered by Credence" className="w-full max-w-[420px]" />
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-foreground/90 md:text-2xl">
            Financial markets for machine intelligence.
          </p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Finance verified inference for autonomous agents.
          </p>
          <p className="num mt-6 text-sm text-primary">
            &ldquo;The hardware wallet is the constitution, not the cashier.&rdquo;
          </p>
          <p className="label-xs mt-2">Buy it. Finance it. Hedge it. Verify it.</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/market"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Market <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/credit"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
            >
              View Credit Facility
            </Link>
            <Link
              to="/receipts"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Inspect Receipt
            </Link>
          </div>

          <dl className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Active facility", `${FACILITY.limit.toFixed(2)} tRLUSD`],
              ["Available", `${FACILITY.available.toFixed(2)} tRLUSD`],
              ["VIU spot reference", `${VIU_SPOT.toFixed(3)} tRLUSD`],
              ["Evidence tier settled", FACILITY.evidenceTier],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-5 py-4">
                <dt className="label-xs">{k}</dt>
                <dd className="num mt-1.5 text-lg font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="label-xs">Why now</div>
            <h2 className="mt-3 text-2xl font-semibold">
              Open models made model artifacts portable.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Credence makes inference contractible, financeable, and auditable across providers. A
              buyer states the execution profile it is paying for — artifact digest, precision,
              context — and settlement only releases against a receipt bound to that profile.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { i: ShieldCheck, t: "Contractible", d: "Execution profile is the contract term." },
                { i: Boxes, t: "Financeable", d: "Purpose-bound credit, not open-ended spend." },
                { i: FileCheck2, t: "Auditable", d: "Every draw maps to a signed receipt." },
              ].map((c) => (
                <div key={c.t} className="panel p-4">
                  <c.i className="size-4 text-primary" />
                  <div className="mt-2.5 text-sm font-semibold">{c.t}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <div className="label-xs">Market stack</div>
            <ol className="mt-4 space-y-2.5">
              {STACK.map((s, i) => (
                <li key={s.k} className="flex items-start gap-3 rounded-md bg-surface-2 px-3 py-2.5">
                  <span className="num mt-0.5 text-[11px] text-primary">0{i + 1}</span>
                  <span>
                    <span className="block text-sm font-medium">{s.k}</span>
                    <span className="text-xs text-muted-foreground">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
              XRPL carries credit state, settlement, account identity and facility transaction
              references. XRPL does not natively enforce application-level provider, model or amount
              rules — Credence policy plus co-signing enforces those terms before settlement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
