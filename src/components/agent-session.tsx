// Agent session for the integrated offline service (I2a). Holds a session token for this tab
// only. The token authenticates API calls; it is not a signing key. Never paste a private key.

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { Chip, Panel } from "@/components/kit";
import { Digest } from "@/components/credence";
import { ApiError } from "@/lib/credence-api/client";
import { useLiveSession } from "@/lib/credence-api/hooks";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/credence-api/session";

const inputCls =
  "w-full rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none";

export function useAgentToken(): [string | null, (token: string | null) => void] {
  const [token, setToken] = useState<string | null>(() => getSessionToken());
  const queries = useQueryClient();
  return [
    token,
    (next) => {
      if (next) setSessionToken(next);
      else clearSessionToken();
      setToken(next ? next.trim() : null);
      void queries.invalidateQueries({ queryKey: ["credence", "live"] });
    },
  ];
}

export function AgentSessionPanel({
  token,
  setToken,
}: {
  token: string | null;
  setToken: (token: string | null) => void;
}) {
  const [draft, setDraft] = useState("");
  const session = useLiveSession(token);
  const failed = session.error instanceof ApiError ? session.error : null;
  return (
    <Panel
      title="Agent session"
      subtitle="Authenticates this tab to the integrated offline service as one agent"
      right={<KeyRound className="size-4 text-primary" />}
    >
      {token && session.data ? (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Chip tone="pass">Signed in as {session.data.agent_id}</Chip>
          <span className="text-muted-foreground">
            agent key <Digest value={session.data.agent_key_id} />
          </span>
          <span className="num text-muted-foreground">
            facilities: {session.data.facility_ids.join(", ")}
          </span>
          <button
            onClick={() => setToken(null)}
            className="rounded-md border border-border-strong px-2.5 py-1 text-[11px] hover:bg-surface-2"
          >
            Sign out
          </button>
        </div>
      ) : (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setToken(draft);
            setDraft("");
          }}
        >
          <input
            type="password"
            autoComplete="off"
            aria-label="Agent session token"
            placeholder="Agent session token (from <demo-dir>/agent/session-token)"
            className={`${inputCls} max-w-md`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
          >
            Use session
          </button>
          {failed && (
            <span className="text-[11px] text-destructive">
              {failed.code}: {failed.detail}
            </span>
          )}
        </form>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        The session token is kept for this tab only and is not a signing key. Never paste a private
        key here: the agent verifies and signs every purchase and response authorization with its
        own key, outside the browser.
      </p>
    </Panel>
  );
}
