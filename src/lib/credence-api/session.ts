// The agent session token for the integrated offline service (I2a), kept in sessionStorage for
// this tab only. It authenticates API calls; it is not a signing key and authorizes no purchase
// by itself. The agent's private key is never entered here: the agent signs outside the browser.

const KEY = "credence.agentSessionToken";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY);
}

export function setSessionToken(token: string): void {
  window.sessionStorage.setItem(KEY, token.trim());
}

export function clearSessionToken(): void {
  window.sessionStorage.removeItem(KEY);
}

/** SHA-256 of the prompt's exact UTF-8 bytes, as Core's `sha256:` payload digest. */
export async function promptDigest(prompt: string): Promise<string> {
  const bytes = new TextEncoder().encode(prompt);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return "sha256:" + Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** A string quoted for a POSIX shell command line (single quotes). */
export function shellQuote(text: string): string {
  return "'" + text.replace(/'/g, "'\\''") + "'";
}
