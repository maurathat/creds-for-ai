import { Link, useRouterState } from "@tanstack/react-router";
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
  Home,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealth } from "@/lib/credence-api/hooks";
import { ConnectionBadges, type ApiStatus } from "@/components/status";
import { isPrototypePath, PRIMARY_NAV, PROTOTYPE_BANNER, PROTOTYPE_NAV } from "@/lib/navigation";

const ICONS: Record<string, LucideIcon> = {
  "/market": Store,
  "/procure": SlidersHorizontal,
  "/operations": Workflow,
  "/credit": Landmark,
  "/receipts": ReceiptText,
  "/settlement": Link2,
  "/prototype-home": Home,
  "/overview": LayoutDashboard,
  "/providers": Server,
  "/reputation": BadgeCheck,
  "/reservations": CalendarClock,
  "/forwards": LineChart,
  "/secondary-market": ArrowLeftRight,
  "/price-index": GaugeIcon,
  "/machine-credit": Wallet,
  "/settings": Settings2,
};

const TAG_CLS: Record<string, string> = {
  P0: "text-primary",
  PROTO: "text-warn",
};

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      <div className="label-xs px-2.5 pb-1">Procurement workflow</div>
      <NavItems items={PRIMARY_NAV} onNavigate={onNavigate} />
      <details className="group/proto mt-4" open={isPrototypePath(pathname)}>
        <summary className="label-xs flex cursor-pointer list-none items-center gap-1 px-2.5 pb-1">
          <ChevronRight className="size-3 transition-transform group-open/proto:rotate-90" />
          Prototype pages · seeded data, not live
        </summary>
        <NavItems items={PROTOTYPE_NAV} onNavigate={onNavigate} />
      </details>
    </nav>
  );
}

function NavItems({
  items,
  onNavigate,
}: {
  items: readonly ((typeof PRIMARY_NAV)[number] | (typeof PROTOTYPE_NAV)[number])[];
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <>
      {items.map((item) => {
        const Icon = ICONS[item.to] ?? Store;
        return (
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
            <Icon className="size-4 shrink-0 opacity-70" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.tag && (
              <span className={cn("text-[9px] font-semibold tracking-widest", TAG_CLS[item.tag])}>
                {item.tag}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

/** API availability comes from the health check; XRPL connectivity is never inferred from it. */
function StatusBadge() {
  const health = useHealth();
  const api: ApiStatus = health.isLoading
    ? { kind: "checking" }
    : health.error || !health.data
      ? { kind: "unreachable" }
      : { kind: "ok", mode: health.data.mode };
  return <ConnectionBadges api={api} />;
}

function PrototypeBanner() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (!isPrototypePath(pathname)) return null;
  return (
    <p
      role="note"
      className="rounded-md border border-warn/50 bg-warn/10 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-warn"
    >
      {PROTOTYPE_BANNER}
    </p>
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
          <PrototypeBanner />
          {children}
        </main>

        <footer className="border-t border-border px-4 py-5 text-[11px] leading-relaxed text-muted-foreground lg:px-8">
          Credence is a Kessai product. The procurement workflow pages read Credence's offline API:
          Core policy dry runs, integrated offline purchases with mock providers, recorded offline
          purchase runs and labelled fixtures. Amounts are in tRLUSD, a test token. Accounting
          settlement is not XRPL settlement, and no XRPL transaction exists. Prototype pages show
          seeded data only. Nothing here is production-ready.
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
