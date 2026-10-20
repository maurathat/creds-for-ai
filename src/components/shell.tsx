import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Landmark,
  Store,
  Server,
  BadgeCheck,
  CalendarClock,
  LineChart,
  ArrowLeftRight,
  Gauge as GaugeIcon,
  Wallet,
  ReceiptText,
  Settings2,
  Menu,
  X,
  SlidersHorizontal,
  Workflow,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealth } from "@/lib/credence-api/hooks";

// The P0 workflow, in the order an agent's purchase moves through it. These pages read the
// Credence API; the prototype pages below them still show the original seeded data.
const NAV = [
  { to: "/market", label: "Inference Market", icon: Store, tag: "P0" },
  { to: "/procure", label: "Procurement", icon: SlidersHorizontal, tag: "P0" },
  { to: "/operations", label: "Purchases", icon: Workflow, tag: "P0" },
  { to: "/credit", label: "Credit", icon: Landmark, tag: "P0" },
  { to: "/receipts", label: "Receipts", icon: ReceiptText, tag: "P0" },
  { to: "/settlement", label: "XRPL Settlement", icon: Link2, tag: "P0" },
] as const;

const PROTOTYPE_NAV = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard, tag: "" },
  { to: "/providers", label: "Providers", icon: Server, tag: "SIM" },
  { to: "/reputation", label: "Reputation", icon: BadgeCheck, tag: "SIM" },
  { to: "/reservations", label: "Reservations", icon: CalendarClock, tag: "RM" },
  { to: "/forwards", label: "Forwards", icon: LineChart, tag: "RM" },
  { to: "/secondary-market", label: "Secondary Market", icon: ArrowLeftRight, tag: "RM" },
  { to: "/price-index", label: "Price Index", icon: GaugeIcon, tag: "RM" },
  { to: "/machine-credit", label: "Machine Credit", icon: Wallet, tag: "RM" },
  { to: "/settings", label: "Settings", icon: Settings2, tag: "" },
] as const;

const TAG_CLS: Record<string, string> = {
  P0: "text-primary",
  SIM: "text-warn",
  RM: "text-roadmap",
};

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      <div className="label-xs px-2.5 pb-1">Procurement workflow</div>
      <NavItems items={NAV} onNavigate={onNavigate} />
      <div className="label-xs px-2.5 pb-1 pt-4">Prototype · seeded data</div>
      <NavItems items={PROTOTYPE_NAV} onNavigate={onNavigate} />
    </nav>
  );
}

function NavItems({
  items,
  onNavigate,
}: {
  items: readonly ((typeof NAV)[number] | (typeof PROTOTYPE_NAV)[number])[];
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeProps={{
            className:
              "bg-sidebar-accent text-sidebar-accent-foreground border-l-primary shadow-[inset_1px_0_0_0_var(--color-primary)]",
          }}
          className="group flex items-center gap-2.5 rounded-md border-l-2 border-l-transparent px-2.5 py-2 text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <item.icon className="size-4 shrink-0 opacity-70" />
          <span className="flex-1 truncate">{item.label}</span>
          {item.tag && (
            <span className={cn("text-[9px] font-semibold tracking-widest", TAG_CLS[item.tag])}>
              {item.tag}
            </span>
          )}
        </Link>
      ))}
    </>
  );
}

/** Computed from the API's health check, never typed: the app shows no connection it lacks. */
function StatusBadge() {
  const health = useHealth();
  if (health.isLoading) {
    return (
      <span className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground">
        Checking API…
      </span>
    );
  }
  if (health.error || !health.data) {
    return (
      <span className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        Credence API unreachable
      </span>
    );
  }
  const ledger = health.data.ledger;
  return (
    <span className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        API · {health.data.mode}
      </span>
      <span
        className="flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground"
        title={ledger.note}
      >
        <span className="size-1.5 rounded-full bg-muted-foreground" />
        {ledger.connected ? `Ledger · ${ledger.network}` : "No ledger connection"}
      </span>
    </span>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-4">
      <span className="grid size-8 place-items-center rounded-md border border-primary/40 bg-primary/10">
        <span className="num text-sm font-bold text-primary">C</span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight">Credence</span>
        <span className="label-xs">Markets</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <div className="mx-4 mb-3 h-px bg-sidebar-border" />
        <div className="flex-1 overflow-y-auto pb-4">
          <NavList />
        </div>
        <div className="border-t border-sidebar-border px-4 py-3.5">
          <div className="label-xs">Unit of account</div>
          <div className="num mt-1 text-xs text-foreground">micro-tRLUSD</div>
          <div className="mt-1 text-[11px] text-muted-foreground">tRLUSD is a test token.</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-md border border-border lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>
          <div className="hidden items-center gap-6 text-[11px] text-muted-foreground lg:flex">
            Inference procurement under spending, credit and evidence policies
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge />
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-7 px-4 py-7 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-5 text-[11px] leading-relaxed text-muted-foreground lg:px-8">
          Credence is a Kessai product. The procurement workflow pages read Credence's offline API:
          Core policy dry runs, recorded offline purchase runs and labelled fixtures. Amounts are in
          tRLUSD, a test token. Accounting settlement is not XRPL settlement, and no XRPL
          transaction exists. Prototype pages show seeded data only. Nothing here is
          production-ready.
        </footer>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                className="mr-3 grid size-8 place-items-center rounded-md border border-border"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
