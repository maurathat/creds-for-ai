import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/shell";
import { Chip, DemoNote, Metric, PageHeader, Panel, Sparkline } from "@/components/kit";
import {
  FACILITY,
  TRANSACTIONS,
  UTILIZATION,
  UTIL_SERIES,
  VIU_SPOT,
  VIU_SPOT_SERIES,
} from "@/lib/credence";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Overview — Claw Street" },
      {
        name: "description",
        content:
          "Browser simulation dashboard for Claw Street: seeded facility accounting, inference purchased, provider conformity and an illustrative VIU price.",
      },
      { property: "og:title", content: "Overview — Claw Street" },
      {
        property: "og:description",
        content: "Seeded AI-agent procurement figures at a glance. Browser simulation · no provider calls · no payments.",
      },
    ],
  }),
  component: Overview,
});

const STACK = [
  { k: "Credit", s: "Simulated", tone: "pass" as const, to: "/credit" as const },
  { k: "Procurement", s: "Simulated", tone: "pass" as const, to: "/market" as const },
  { k: "Reservations", s: "Concept", tone: "roadmap" as const, to: "/reservations" as const },
  { k: "Forward procurement", s: "Concept", tone: "roadmap" as const, to: "/forwards" as const },
  { k: "Capacity transfers", s: "Concept", tone: "roadmap" as const, to: "/secondary-market" as const },
];

const chartAxis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border-strong)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
};

function Overview() {
  const recent = TRANSACTIONS.slice(0, 6);

  return (
    <AppShell>
      <PageHeader
        kicker="Executive dashboard"
        title="Overview"
        description="Browser simulation of AI-agent procurement with seeded data. Credit is the core simulated flow; procurement routing is simulated; reservations, forward procurement, price reference and capacity transfers are inactive concept previews."
        actions={
          <>
            <Chip tone="pass">1 simulated facility</Chip>
            <Chip tone="neutral">XRPL settlement · not connected</Chip>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <Metric label="Active credit facilities" value="1" hint="ResearchBot-17 · Active" />
        <Metric
          label="Inference purchased (simulated)"
          value="1,284"
          unit="VIU"
          delta="+18.2% MoM"
          tone="primary"
        />
        <Metric
          label="Outstanding balance"
          value={FACILITY.outstanding.toFixed(2)}
          unit="tRLUSD"
          hint={`${UTILIZATION}% utilization`}
        />
        <Metric label="Provider conformity score" value="99.7%" hint="Northstar Compute" />
        <Metric
          label="VIU spot reference"
          value={VIU_SPOT.toFixed(3)}
          unit="tRLUSD / VIU"
          delta="+1.87%"
          tone="primary"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Facility utilization & cumulative verified spend"
          subtitle="Facility FAC-XRPL-0x7C41 · since 2026-07-14"
          right={<Chip tone="pass">Simulated · seeded</Chip>}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={UTIL_SERIES} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="gUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="d" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="util"
                  name="Utilization %"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#gUtil)"
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  name="Drawn tRLUSD"
                  stroke="var(--color-success)"
                  strokeWidth={1.6}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="VIU spot reference price"
          subtitle="CVII composite · tRLUSD (test asset) per Verified Inference Unit"
          right={<Chip tone="warn">Simulated</Chip>}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VIU_SPOT_SERIES} margin={{ left: -14, right: 6, top: 6 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="d" {...chartAxis} />
                <YAxis domain={[0.26, 0.5]} {...chartAxis} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="global"
                  name="Global"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="eu"
                  name="EU"
                  stroke="var(--color-chart-4)"
                  strokeWidth={1.6}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="us"
                  name="US"
                  stroke="var(--color-chart-3)"
                  strokeWidth={1.6}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Market stack" subtitle="Credit → Procurement → Reservations → Forward procurement → Capacity transfers">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {STACK.map((s, i) => (
            <div key={s.k} className="flex flex-1 items-center gap-3">
              <Link
                to={s.to}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-4 py-4 transition-colors hover:border-border-strong"
              >
                <div className="num text-[12.5px] text-muted-foreground">0{i + 1}</div>
                <div className="mt-1.5 text-[15px] font-semibold">{s.k}</div>
                <Chip tone={s.tone} className="mt-2">
                  {s.s}
                </Chip>
              </Link>
              {i < STACK.length - 1 && (
                <span className="hidden text-muted-foreground lg:block">→</span>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Recent receipt activity" right={<Chip tone="pass">Simulated · seeded</Chip>} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Request", "Time", "VIU", "tRLUSD", "Profile", "Outcome"].map((h) => (
                    <th key={h} className="label-xs px-5 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="num px-5 py-2.5 text-foreground">{t.id}</td>
                    <td className="num px-5 py-2.5 text-muted-foreground">{t.ts.slice(5, 16)}</td>
                    <td className="num px-5 py-2.5">{t.viu}</td>
                    <td className="num px-5 py-2.5">{t.rlusd.toFixed(2)}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{t.profile}</td>
                    <td className="px-5 py-2.5">
                      <Chip tone={t.outcome === "PASS" ? "pass" : "reject"}>{t.outcome}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Facility snapshot">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Borrower</span>
                <span className="num">{FACILITY.borrower}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Approved provider</span>
                <span className="num">{FACILITY.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Execution profile</span>
                <span className="num">Meridian-70B · BF16</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Evidence tier</span>
                <span className="num text-primary">{FACILITY.evidenceTier}</span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="label-xs">14-day draw trend</div>
                  <div className="num mt-1 text-lg">{FACILITY.outstanding.toFixed(2)} tRLUSD</div>
                </div>
                <Sparkline points={UTIL_SERIES.map((u) => u.spend)} />
              </div>
            </div>
          </Panel>
          <DemoNote>
            All figures are seeded demo data for a hackathon prototype. Simulated and roadmap
            surfaces do not transact.
          </DemoNote>
        </div>
      </div>
    </AppShell>
  );
}
