import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ExternalLink,
  ArrowRight,
  Bot,
  BadgeCheck,
  KeyRound,
  Cpu,
  FileCheck2,
  Landmark,
  ShieldCheck,
  Boxes,
} from "lucide-react";
import { Chip, SimulationDisclosure } from "@/components/kit";
import { FACILITY, VIU_SPOT } from "@/lib/credence";
import logoGif from "@/assets/claw-street-logo.gif.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Claw Street — Powered by Credence · AI-agent procurement (browser simulation)" },
      {
        name: "description",
        content:
          "Browser simulation of AI-agent procurement: seeded data, no provider calls, no payments. Claw Street is powered by Credence and built by Kessai Labs.",
      },
      { property: "og:title", content: "Claw Street — Powered by Credence · AI-agent procurement (browser simulation)" },
      {
        property: "og:description",
        content:
          "Browser simulation of AI-agent procurement: seeded data, no provider calls, no payments. Claw Street is powered by Credence and built by Kessai Labs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STACK = [
  { k: "Credit", d: "Purpose-bound agent spending budget (in-browser accounting)" },
  { k: "Procurement", d: "Routing an order across competing providers (simulated)" },
  { k: "Reservations", d: "Reserving future capacity (inactive concept)" },
  { k: "Forward procurement", d: "Pre-agreeing future capacity (inactive concept)" },
  { k: "Capacity transfers", d: "Handing unused capacity to another buyer (inactive concept)" },
];

const STEPS = [
  { i: Bot, t: "Agent intent", d: "The buyer agent states what it needs to buy." },
  { i: BadgeCheck, t: "Provider eligibility", d: "Policy filters providers, artifacts and profiles." },
  { i: KeyRound, t: "Bounded authorization", d: "Spend stays inside facility limits and allowlists." },
  { i: Cpu, t: "Execution", d: "An approved provider runs the declared artifact." },
  { i: FileCheck2, t: "Delivery evidence", d: "A signed receipt binds the delivery to the request." },
  { i: Landmark, t: "Financial accounting", d: "The facility records the draw against the receipt." },
];

const SOURCE_URL = "https://github.com/maurathat/credence-xrpl/tree/maurathat/claw-street-release";

const NOT_CONNECTED = [
  "XRPL marketplace settlement",
  "QuickNode",
  "t54 / x402 payments",
  "Ledger hardware signing",
];

const ROADMAP = [
  "Reservations and forward procurement",
  "Capacity transfers",
  "Agent procurement budgets beyond inference",
  "Tier 3 measured-artifact execution",
];

function Home() {
  return (
    <div className="min-h-screen">
      <SimulationDisclosure />
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src="/claw-street-icon-512.png" alt="" className="size-10 rounded-md" />
            <span className="leading-tight">
              <span className="font-pixel block text-[12.5px] text-foreground">CLAW STREET</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">Powered by Credence</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="neutral">Browser simulation</Chip>
            <Link
              to="/overview"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-2"
            >
              Open terminal <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="grid-lines border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-28">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="warn">Browser simulation · seeded data</Chip>
            <Chip tone="neutral">No provider calls · no payments</Chip>
          </div>
          <h1 className="mt-7 flex justify-center">
            <img src={logoGif.url} alt="Claw Street — Powered by Credence" className="w-full max-w-[420px]" />
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-foreground/90 md:text-2xl">
            Rule-bound procurement for AI agents.
          </p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Claw Street explores how AI agents could buy inference under explicit rules — compare
            providers, spend within limits, check delivery evidence, and keep an auditable record.
            This public site is a browser simulation with seeded data.
          </p>
          <p className="num mt-6 text-[15px] text-primary">
            <span className="mr-2 text-[12.5px] text-muted-foreground">Design ambition (Ledger not connected):</span>
            &ldquo;The hardware wallet is the constitution, not the cashier.&rdquo;
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/overview"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open terminal <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-surface-2"
            >
              How it works
            </a>
          </div>

          <dl className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Simulated facility", `${FACILITY.limit.toFixed(2)} tRLUSD`],
              ["Available (in-browser)", `${FACILITY.available.toFixed(2)} tRLUSD`],
              ["Illustrative VIU price", `${VIU_SPOT.toFixed(3)} tRLUSD`],
              ["Evidence tier (simulated)", FACILITY.evidenceTier],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-5 py-4">
                <dt className="label-xs">{k}</dt>
                <dd className="num mt-1.5 text-lg font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] text-muted-foreground">
            tRLUSD is a synthetic test unit in this simulation. Credit changes are in-browser
            accounting only — no funds are released and nothing is settled on XRPL.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-16">
          <div className="label-xs">Differentiator</div>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground/90">
            Most agent payment tools answer: <span className="text-muted-foreground">how does an agent pay?</span>{" "}
            Claw Street answers:{" "}
            <span className="font-medium">
              what should an agent buy, under whose authority, on what terms — and how do we prove
              it was delivered?
            </span>
          </p>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-16">
          <div className="label-xs">How it works</div>
          <h2 className="mt-3 text-2xl font-semibold">Six steps from intent to accounting</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Shown here as a browser simulation. The separate local demo runs these steps with offline mock providers.
          </p>
          <div className="mt-8 flex flex-col gap-2 lg:flex-row lg:items-center">
            {STEPS.map((s, i) => (
              <div key={s.t} className="flex flex-col gap-2 lg:flex-row lg:items-center lg:flex-1">
                <div className="panel flex-1 p-4">
                  <span className="num text-[12.5px] text-primary">0{i + 1}</span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <s.i className="size-4 shrink-0 text-primary" />
                    <span className="text-[15px] font-medium">{s.t}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-16">
          <div className="label-xs">What&rsquo;s real today</div>
          <h2 className="mt-3 text-2xl font-semibold">Local working demo vs. this public site</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="panel p-5">
              <Chip tone="pass">Local working demo</Chip>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Core policy, agent-signed purchases, verified receipt evidence and internal
                accounting with offline mock providers. Runs locally, separate from this site.
              </p>
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary underline-offset-4 hover:underline"
              >
                Source and local demo instructions <ExternalLink className="size-3.5" />
              </a>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">Repository access is provided to judges separately.</p>
            </div>
            <div className="panel p-5">
              <Chip tone="warn">This public site: browser simulation</Chip>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Seeded data only. It does not run Credence Core, verify agent signatures, call
                providers or make payments. Buttons replay the flow and update in-browser
                accounting.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="panel p-5">
              <Chip tone="neutral">Not connected</Chip>
              <ul className="mt-4 space-y-2.5">
                {NOT_CONNECTED.map((item) => (
                  <li key={item} className="flex items-start justify-between gap-2 text-[15px] text-muted-foreground">
                    <span>{item}</span>
                    <span className="text-[12.5px] text-roadmap">NOT CONNECTED</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-5">
              <Chip tone="roadmap">Roadmap</Chip>
              <ul className="mt-4 space-y-2.5">
                {ROADMAP.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[15px] text-muted-foreground">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="panel mt-4 p-5">
            <div className="label-xs">Evidence tiers</div>
            <ul className="mt-3 space-y-1.5 text-[15px] text-muted-foreground">
              <li><span className="text-foreground">Tier 1</span> — gateway witnessed the response (offline simulated here).</li>
              <li><span className="text-foreground">Tier 2</span> — provider signed what it says it served (simulated here).</li>
              <li>No tier proves the exact weights ran. Seeded receipts on this site are not cryptographically verified.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="label-xs">Why now</div>
            <h2 className="mt-3 text-2xl font-semibold">
              Open models made model artifacts portable.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Credence aims to make agent inference purchases rule-bound and auditable across providers.
              A buyer states the execution profile it wants — artifact digest, precision, context —
              and a purchase is only accounted for against a receipt bound to that profile.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { i: ShieldCheck, t: "Contractible", d: "Execution profile is the contract term." },
                { i: Boxes, t: "Budgeted", d: "Purpose-bound spending, not open-ended spend." },
                { i: FileCheck2, t: "Auditable", d: "Every draw maps to a receipt (seeded here)." },
              ].map((c) => (
                <div key={c.t} className="panel p-4">
                  <c.i className="size-4 text-primary" />
                  <div className="mt-2.5 text-[15px] font-semibold">{c.t}</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <div className="label-xs">Market stack</div>
            <ol className="mt-4 space-y-2.5">
              {STACK.map((s, i) => (
                <li key={s.k} className="flex items-start gap-3 rounded-md bg-surface-2 px-3 py-2.5">
                  <span className="num mt-0.5 text-[12.5px] text-primary">0{i + 1}</span>
                  <span>
                    <span className="block text-[15px] font-medium">{s.k}</span>
                    <span className="text-sm text-muted-foreground">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="label-xs mt-5">XRPL&rsquo;s role (roadmap · not connected)</div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              XRPL could later carry facility state, settlement references and account identity. It is
              not connected here: no funds are released and no settlement is enforced on XRPL. XRPL
              would not natively enforce provider, model or amount rules — Credence policy does that,
              in the separate local demo only.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
