# Claw Street UI — page/layout design and integration impact

Checkpoint: hackathon UI design, on accepted I2b `726f643` (web `5ca1dff`). Web ownership only.

## Brand

| Level               | Name        | Where it appears                                                                                         |
| ------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| Company             | Kessai Labs | Footer                                                                                                   |
| Infrastructure      | Credence    | "Powered by Credence" under the wordmark; Credence terms (Core, evidence tiers, accounting) in page copy |
| Marketplace product | Claw Street | Sidebar lockup, page titles, browser titles                                                              |

Display: **Claw Street — Powered by Credence**.

Source of truth: the approved lockup export (`Logo Claw Street lockup-html/Main.dc.html`, and the matching `Claw Street Bot Logo.pdf`). The pixel robot is replicated rect-for-rect as an inline SVG component (`ClawStreetBot`), never redrawn. Values kept exactly: accent `#3DFF8F`, eyes and screen `#22E6FF`, cheeks `#FF6FA8`, status pixel `#FFC94A`, body `#EAF2F8` / `#A9BBCC` / `#6F8396`, visor `#071421`, glow filter (σ 0.35), wordmark "CLAW **STREET**" in Press Start 2P with STREET in the accent, tagline "POWERED BY CREDENCE" in `#8FA3B6`.

Terminal aesthetic: the existing dark terminal layout, panels and Space Grotesk / IBM Plex Mono typography stay. The primary accent moves from electric cyan to the brand's neon green; cyan becomes the informational accent (it is the robot's eye colour). Amber stays "simulated/warning", violet "roadmap", red "rejected". Press Start 2P is used only for the wordmark and page kickers, self-hosted (no runtime font CDN: the demo runs offline).

The Lovable reference (`creds-for-ai.lovable.app`) is the original Credence Markets prototype. It supplies the layout grammar (sidebar, KPI tiles, panels, tables). It is not a source of claims: it still shows "XRPL connected", "Live MVP" and RLUSD, which P0a corrected and which are not reintroduced.

## Navigation

Primary (Claw Street): Overview `/` · Marketplace `/market` · Agent Purchase `/procure` · Credit & Payments `/credit` · Evidence `/receipts` · Activity `/activity`.
Details: Purchases `/operations` (recorded and integrated runs) · XRPL settlement states `/settlement`.
Prototype pages: unchanged, collapsed, bannered.

## Screens

1. **Overview** (`/`, new). Lockup hero; truth strip (API offline · providers offline mocks · XRPL not submitted · price cap preview-only). KPI tiles from real data: providers and offers, cheapest maximum cost (configured demo quote), qualifying offers per scenario (real Core dry runs), and, with an agent session, integrated purchases, accounting-settled spend, held, headroom. Economic activity: latest integrated purchases and per-facility drawn bars. "Not live in this build" panel.
2. **Marketplace** (`/market`). Existing provider cards, prices and evidence; adds an eligibility matrix: each scenario's real Core dry run, offer by offer (eligible / reason code), and the routing rule.
3. **Agent Purchase** (`/procure`, `/live/$id`). Existing dry run → prepare → sign outside the browser → submit flow, unchanged; adds an eight-step progression rail driven by real state: Core evaluation, prepared, signed by the agent, submitted, offline provider executed, receipt verified and accounting settled, retrieved, acknowledged.
4. **Credit & Payments** (`/credit`). Existing live facilities and recorded exposure; adds a payments panel: each integrated purchase's accounting outcome next to its XRPL status (`not_submitted`, from the API), and the synthetic tRLUSD unit label.
5. **Evidence** (`/receipts`). Existing receipt verification; adds integrated receipts (linked to their operations), the evidence-tier ladder and a limitations panel.
6. **Activity** (`/activity`, new). One chronological feed of integrated purchases, newest first, built from each operation's persisted lifecycle events; recorded offline runs listed separately and labelled.

Every screen keeps unavailable integrations visibly separate: XRPL ledger payments, QuickNode reads, t54 purchases, Verifiable Intent and x402 are shown only in a "Not live in this build" panel, status "not connected · not validated".

## Integration impact

| Area                                                          | Impact                                                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Core, Inference, Integration, XRPL, x402, custody, accounting | None. No file outside `web/` changes                                                                                                      |
| API                                                           | None. Every screen uses existing routes (`/v0/providers`, `/procurement/presets`, `/procurement/evaluate`, `/live/*`, P0 recorded routes) |
| Nebius / Qwen workflows                                       | Unchanged: same components and calls; only layout, labels and theme tokens change                                                         |
| Claims                                                        | No new claim. XRPL stays `not_submitted`; tRLUSD labelled a test token; providers labelled offline mocks                                  |
| Dependencies                                                  | `@fontsource/press-start-2p` (self-hosted font, OFL)                                                                                      |
| Tests                                                         | Navigation test updated to the new journey; new brand, overview and activity tests; browser scenarios A/B rerun                           |
| Risk                                                          | Visual only. Theme change is token-level; recorded P0 pages keep their data                                                               |
