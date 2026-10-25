import { cn } from "@/lib/utils";
import type { Maturity } from "@/lib/credence";
import type { ReactNode } from "react";

const MATURITY_COPY: Record<Maturity, { label: string; cls: string }> = {
  live: { label: "Core demo", cls: "border-success/40 bg-success/10 text-success" },
  simulated: { label: "Simulated", cls: "border-warn/40 bg-warn/10 text-warn" },
  concept: { label: "Concept", cls: "border-roadmap/40 bg-roadmap/10 text-roadmap" },
  roadmap: { label: "Roadmap", cls: "border-roadmap/40 bg-roadmap/10 text-roadmap" },
};

export function MaturityTag({ level, className }: { level: Maturity; className?: string }) {
  const m = MATURITY_COPY[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        m.cls,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

export function Chip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "pass" | "reject" | "warn" | "info" | "roadmap";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "border-border-strong bg-surface-2 text-muted-foreground",
    pass: "border-success/40 bg-success/10 text-success",
    reject: "border-destructive/40 bg-destructive/10 text-destructive",
    warn: "border-warn/40 bg-warn/10 text-warn",
    info: "border-primary/40 bg-primary/10 text-primary",
    roadmap: "border-roadmap/40 bg-roadmap/10 text-roadmap",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  kicker,
  description,
  level,
  actions,
}: {
  title: string;
  kicker?: string;
  description?: string;
  level?: Maturity;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div className="min-w-0">
        {kicker && <div className="label-xs mb-2">{kicker}</div>}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-pixel text-base leading-relaxed text-foreground md:text-xl">{title}</h1>
          {level && <MaturityTag level={level} />}
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  right,
  subtitle,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  right?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel flex flex-col", className)}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={cn("flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  unit,
  delta,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  hint?: string;
  tone?: "default" | "primary" | "warn";
}) {
  return (
    <div className="panel p-4">
      <div className="label-xs">{label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "num text-2xl font-semibold",
            tone === "primary" && "text-primary",
            tone === "warn" && "text-warn",
          )}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {delta && <span className="num text-[11px] text-success">{delta}</span>}
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function KV({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={cn("text-right text-xs text-foreground", mono && "num")}>{v}</span>
    </div>
  );
}

export function Sparkline({
  points,
  className,
  tone = "primary",
}: {
  points: number[];
  className?: string;
  tone?: "primary" | "success" | "warn";
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 26 - ((p - min) / span) * 22 - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const stroke = {
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warn: "var(--color-warn)",
  }[tone];
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" className={cn("h-7 w-24", className)}>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Gauge({ value, label }: { value: number; label?: string }) {
  const r = 52;
  const c = Math.PI * r;
  const filled = (Math.min(value, 100) / 100) * c;
  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 128 72" className="w-full max-w-56">
        <path
          d="M 12 66 A 52 52 0 0 1 116 66"
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 12 66 A 52 52 0 0 1 116 66"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
        />
      </svg>
      <div className="-mt-7 text-center">
        <div className="num text-2xl font-semibold text-foreground">{value}%</div>
        {label && <div className="label-xs mt-0.5">{label}</div>}
      </div>
    </div>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-warn/25 bg-warn/5 px-3 py-2 text-[11px] leading-relaxed text-warn">
      {children}
    </p>
  );
}

export function RoadmapNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-roadmap/25 bg-roadmap/5 px-3 py-2 text-[11px] leading-relaxed text-roadmap">
      {children}
    </p>
  );
}
