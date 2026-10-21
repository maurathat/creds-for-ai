// Connection badges. API availability and XRPL connectivity are separate facts: API health says
// only whether the Credence API answered. There is no XRPL status source at this baseline, so the
// XRPL badge takes no input and always reads "not connected".

export type ApiStatus =
  { kind: "checking" } | { kind: "unreachable" } | { kind: "ok"; mode: string };

const BADGE = "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]";

export function ApiBadge({ status }: { status: ApiStatus }) {
  if (status.kind === "checking") {
    return <span className={`${BADGE} border-border text-muted-foreground`}>API: checking…</span>;
  }
  if (status.kind === "unreachable") {
    return (
      <span className={`${BADGE} border-destructive/40 bg-destructive/10 text-destructive`}>
        <span className="size-1.5 rounded-full bg-destructive" />
        API: unreachable
      </span>
    );
  }
  return (
    <span className={`${BADGE} border-primary/40 bg-primary/10 text-primary`}>
      <span className="size-1.5 rounded-full bg-primary" />
      API: available ({status.mode})
    </span>
  );
}

export function XrplBadge() {
  return (
    <span
      className={`${BADGE} border-border-strong bg-surface-2 text-muted-foreground`}
      title="No XRPL connection or settlement is implemented. No payment has been submitted."
    >
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      XRPL: not connected · no payments submitted
    </span>
  );
}

export function ConnectionBadges({ api }: { api: ApiStatus }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <ApiBadge status={api} />
      <XrplBadge />
    </span>
  );
}
