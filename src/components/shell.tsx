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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FACILITY, VIU_SPOT } from "@/lib/credence";

const NAV = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard, tag: "" },
  { to: "/credit", label: "Credit", icon: Landmark, tag: "DEMO" },
  { to: "/market", label: "Inference Market", icon: Store, tag: "SIM" },
  { to: "/providers", label: "Providers", icon: Server, tag: "SIM" },
  { to: "/reputation", label: "Reputation", icon: BadgeCheck, tag: "SIM" },
  { to: "/reservations", label: "Reservations", icon: CalendarClock, tag: "RM" },
  { to: "/forwards", label: "Forwards", icon: LineChart, tag: "RM" },
  { to: "/secondary-market", label: "Secondary Market", icon: ArrowLeftRight, tag: "RM" },
  { to: "/price-index", label: "Price Index", icon: GaugeIcon, tag: "RM" },
  { to: "/machine-credit", label: "Machine Credit", icon: Wallet, tag: "RM" },
  { to: "/receipts", label: "Receipts", icon: ReceiptText, tag: "DEMO" },
  { to: "/settings", label: "Settings", icon: Settings2, tag: "" },
] as const;

const TAG_CLS: Record<string, string> = {
  DEMO: "text-success",
  SIM: "text-warn",
  RM: "text-roadmap",
};

const MOBILE_NAV = [
  { to: "/overview", label: "Overview" },
  { to: "/market", label: "Market" },
  { to: "/credit", label: "Credit" },
  { to: "/receipts", label: "Receipts" },
  { to: "/reservations", label: "Reservations" },
  { to: "/forwards", label: "Forwards" },
  { to: "/secondary-market", label: "Secondary Market" },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeProps={{
            className:
              "bg-sidebar-accent text-primary! border-l-primary shadow-[inset_1px_0_0_0_var(--color-primary)]",
          }}
          className="group flex items-center gap-2.5 rounded-md border-l-2 border-l-transparent px-2.5 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <item.icon className="size-4 shrink-0 opacity-70" />
          <span className="flex-1 truncate">{item.label}</span>
          {item.tag && (
            <span className={cn("text-[11px] font-semibold tracking-widest", TAG_CLS[item.tag])}>
              {item.tag}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-4">
      <img src="/claw-street-icon-512.png" alt="" className="size-10 rounded-md" />
      <span className="leading-tight">
        <span className="font-pixel block text-[12.5px] text-foreground">CLAW STREET</span>
        <span className="mt-1 block text-[11px] text-muted-foreground">Powered by Credence</span>
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
          <div className="label-xs">Settlement asset</div>
          <div className="num mt-1 text-sm text-foreground">tRLUSD (test asset) · XRPL Testnet</div>
          <div className="mt-2 flex items-center justify-between text-[12.5px] text-muted-foreground">
            <span>VIU spot</span>
            <span className="num text-primary">{VIU_SPOT.toFixed(3)}</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-md border border-border lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>
          <div className="hidden items-center gap-6 text-[12.5px] text-muted-foreground lg:flex">
            <span>
              Borrower <span className="num text-foreground">{FACILITY.borrower}</span>
            </span>
            <span>
              Facility{" "}
              <span className="num text-foreground">{FACILITY.limit.toFixed(2)} tRLUSD</span>
            </span>
            <span>
              Available{" "}
              <span className="num text-primary">{FACILITY.available.toFixed(2)} tRLUSD</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[12.5px] text-muted-foreground sm:inline">
              Concept preview · illustrative data
            </span>
            <span className="flex items-center gap-1.5 rounded-md border border-border-strong bg-muted px-2 py-1 text-[12.5px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              XRPL Testnet · in integration
            </span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background/85 px-3 py-2 backdrop-blur lg:hidden">
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-primary! border-primary/50 bg-surface-2" }}
              className="shrink-0 whitespace-nowrap rounded-md border border-transparent px-2.5 py-1.5 text-sm text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-7 px-4 py-7 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-5 text-[12.5px] leading-relaxed text-muted-foreground lg:px-8">
          <div className="mb-2 text-foreground/80">Claw Street · Powered by Credence · Built by Kessai Labs</div>
          Claw Street is a product-vision prototype. One flow (Credence Credit) is a core demo;
          all other surfaces are simulated or roadmap. Nothing here is a regulated exchange, a credit
          rating, an offer of credit, or production-ready. No regulatory approval is claimed.
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
