import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/shell";
import { PageHeader, Panel } from "@/components/kit";
import type { Maturity } from "@/lib/credence";

type Row = Record<string, unknown>;

function fmt(v: unknown): string {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return v.toLocaleString();
  if (Array.isArray(v)) return v.join(", ");
  if (v && typeof v === "object") return JSON.stringify(v);
  return String(v ?? "—");
}

const TIP = "Illustrative reference — not an on-chain transaction.";
const SETTLEMENT_COLS = new Set(["xrpl_tx", "xrpl", "xrplTx"]);

function label(k: string) {
  if (SETTLEMENT_COLS.has(k)) return "Settlement ref (demo)";
  if (k === "rlusd") return "tRLUSD";
  return k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function DataTable({ rows, columns }: { rows: readonly Row[]; columns?: string[] | undefined }) {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]) : []);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[15px]">
        <thead>
          <tr className="border-b border-border text-left">
            {cols.map((c) => (
              <th key={c} className="label-xs whitespace-nowrap px-3 py-2">
                {label(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {cols.map((c) => (
                <td
                  key={c}
                  title={SETTLEMENT_COLS.has(c) ? TIP : undefined}
                  className={cn(
                    "whitespace-nowrap px-3 py-2 font-mono text-sm",
                    typeof r[c] === "number" ? "text-gold" : "text-foreground",
                  )}
                >
                  {fmt(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataPage({
  kicker,
  title,
  description,
  level,
  sections,
  banner,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  level: Maturity;
  sections: { title: string; rows: readonly Row[]; columns?: string[] }[];
  banner?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <AppShell>
      <div className="space-y-6">
        {banner}
        <PageHeader kicker={kicker} title={title} description={description} level={level} />
        {children}
        {sections.map((s) => (
          <Panel key={s.title} title={s.title} bodyClassName="p-0">
            <DataTable rows={s.rows} columns={s.columns} />
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
