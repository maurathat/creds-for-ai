# Credence Pre-Hackathon Foundation Plan

Goal: make the existing prototype internally coherent and ready for the judged XRPL lending feature on Oct 24-25, without building that feature now. All current pages, layout and visual design stay as they are.

## 1. Current project inventory

- **Pages (13):** `/` (home), `/overview` and `/credit` are full custom pages. The Credit page has the staged flow animation, the attack-case table and the root-vs-delegate actions. The other 10 pages (`market`, `providers`, `reputation`, `reservations`, `forwards`, `secondary-market`, `price-index`, `machine-credit`, `receipts`, `settings`) are generic tables rendered by `components/data-page.tsx`.
- **Data:** everything lives in one untyped file, `src/lib/credence.ts` (347 lines). It mixes facility, transactions, attack cases, providers, bids, reservations, forwards, order book, indexes, receipts, the evidence ladder and root actions. The only maturity type is `Maturity = live | simulated | roadmap`.
- **Shared UI:** `components/kit.tsx` (MaturityTag, Panel, KV, Chip, Gauge) and `components/shell.tsx` (sidebar).
- **Tooling:** TypeScript strict is on. There is no test runner (vitest is not installed). Nothing is connected on the backend, and nothing talks to XRPL or Ledger hardware.

## 2. Conflicts with the target semantics

1. **Outcomes are hard-coded, not computed.** `TRANSACTIONS[].outcome/reason` and `ATTACK_CASES[].outcome/note` are literal strings, so nothing actually verifies them.
2. **Duplicated numbers that can drift apart:**
   - `10.46`, `362.40` and `392.40` RLUSD are typed in by hand in transactions, attack cases, the Credit flow copy and receipts.
   - `UTIL_SERIES` and `INDEX_SERIES` repeat `VIU_SPOT_SERIES`.
   - The digest `sha256:9f3c…` is repeated as a plain string across providers.
3. **"Live MVP" overclaims.** Credit and Overview show "Live MVP" chips, and the shell shows "XRPL connected", but nothing is on-ledger. `FACILITY.ledger = "XRPL Mainnet (demo)"` adds to the confusion. These should read "Live local simulation", with the XRPL piece labelled as the hackathon target.
4. **Futures/hedging wording:**
   - The Forwards page says "Forward contracts to hedge future verified inference prices."
   - The tagline uses "Hedge it."
   - The Secondary Market page has a bid/ask order book for "transferring … forwards".
   - Planned fixes:
     - Reword Forwards to "commercial forward delivery agreements".
     - Keep the tagline unchanged as positioning, with a footnote on Forwards: "not a derivative; no cash settlement".
     - Relabel the order book as "capacity reservation transfer listings (concept)", with no exchange matching.
5. **Evidence tiers are inconsistent.** The ladder shows Tier 3 and Tier 4, while providers use `"Tier 2+"`. The target scheme is T1 requested, T2 provider-declared-and-bound, T3 measured-artifact (roadmap). Plan: keep the "physical GPU execution" row only as an explicitly unclaimed Roadmap note beyond T3, and map `Tier 2+` to `T2` plus a `conformity` attribute.
6. **"Policy engine co-signs".** This is fine as Credence application policy, but the copy must not suggest XRPL enforces it. Existing XRPL-role text already says this; keep it.
7. **Expiry case.** REQ-4812's expiry timestamp is a string. It needs to become a real `validUntil` compared against a fixed simulation clock so results are deterministic.

## 3. Proposed files and modules

```text
src/domain/
  types.ts          Provider, ModelArtifact, ExecutionProfile, VIUClass, EvidenceTier,
                    CreditFacility, DelegatedAuthority, InferenceRequest, DeliveryReceipt,
                    VerificationDecision, ReasonCode, ProviderReputation,
                    CapacityReservation, ForwardDeliveryAgreement, MarketQuote, ProviderBid,
                    BuildStage ("foundation" | "local-sim" | "hackathon-target" | "roadmap")
  money.ts          integer micro-RLUSD helpers, viuToRlusd(viu, price) — no float drift
  ids.ts            branded id types (ProviderId, ProfileDigest, RequestDigest …)
src/policy/
  reason-codes.ts   OK_T2_BOUND, E_PROVIDER_NOT_ALLOWLISTED, E_ARTIFACT_MISMATCH,
                    E_PRECISION_MISMATCH, E_REPLAY, E_OVERSPEND, E_AUTHORITY_EXPIRED,
                    E_AUTHORITY_SCOPE, E_TIER_INSUFFICIENT, E_BINDING_MISMATCH
  verifier.ts       verify(ctx: {facility, authority, now, settledDigests}, req, receipt)
                    -> VerificationDecision  (pure, ordered checks, first failure wins,
                       also returns full check list for UI)
  facility-state.ts applyDecision(state, decision) -> next state (available, outstanding,
                    settledDigests) — pure reducer used by Credit flow
  kessai.ts         interface KessaiSerializer { canonicalize(req): Uint8Array; digest(): string }
                    + PlaceholderKessai (stable JSON key-sort + SHA-256 via Web Crypto),
                    clearly labelled "placeholder until Kessai serialization lands"
src/adapters/       interfaces + Simulated* implementations only, no network
  xrpl-lending.ts       LendingVaultAdapter (Single Asset Vault deposit / loan draw / repay)
  xrpl-delegation.ts    DelegationAdapter (PermissionDelegationV1_1 grant / revoke / check)
  xrpl-settlement.ts    SettlementAdapter (RLUSD payment, AMM quote/path)
  ledger-signer.ts      HardwareSignerAdapter (requestRootApproval, signTx)
  inference-provider.ts ProviderExecutionAdapter (submit request, return DeliveryReceipt)
  index.ts              adapter registry; every adapter exposes `stage: BuildStage`
src/data/
  seed.ts           single source: providers, artifacts, profiles, facility, authority,
                    requests, receipts, reservations, forward agreements, quotes, index
  derived.ts        computed views: transactions (= verify() over seeded requests),
                    attack cases, utilization, reputation aggregates, KPIs
  build-status.ts   registry of capabilities -> BuildStage + short note
src/lib/credence.ts kept as a thin re-export shim of data/derived (pages migrate off it,
                    then shim removed at the end of the sequence)
src/routes/architecture.tsx   new "Architecture & Build Status" page
src/policy/__tests__/verifier.test.ts
src/policy/__tests__/facility-state.test.ts
src/data/__tests__/seed-consistency.test.ts
BASELINE.md         baseline marker (see section 6)
```

## 4. Implementation sequence

1. **Tooling.** Add vitest as a dev dependency and a `test` script. Configure the `@/` alias for tests.
2. **Domain types.** Add `domain/types.ts`, `money.ts` and `ids.ts`. `EvidenceTier = "T1" | "T2" | "T3"`, where T3 is typed but can never be produced by the simulation.
3. **Reason codes and verifier.** Add `policy/reason-codes.ts` and `policy/verifier.ts`. The check order is fixed: authority validity and scope, provider allowlist, artifact digest, precision, request/response binding, replay, tier, then available balance.
4. **Facility reducer and placeholder serializer.** Add `policy/facility-state.ts`, plus `kessai.ts` holding the interface and a placeholder.
5. **Tests.** Write the verifier tests for the seven cases (valid T2, wrong provider, wrong artifact, wrong precision, replay, overspend, expired/unauthorized). Add:
   - determinism tests: the same input gives the same decision
   - check-order tests
   - a reducer test: available goes from 362.40 to 351.94 after REQ-4821
6. **Central seed data.** Add `data/seed.ts`, rebuilding every current value with references (provider id, profile digest) instead of repeated strings. Add `data/derived.ts`, which computes transactions and attack-case outcomes by calling `verify()`. Add `seed-consistency.test.ts`, which asserts that every reference resolves and the totals match.
7. **Compatibility shim.** Point `lib/credence.ts` at the derived data, keeping export names. All pages keep rendering unchanged, which gives a safe checkpoint.
8. **Page migration.** Move pages one by one to `@/data/*`: Credit (flow steps driven by the reducer), Overview, Receipts, Providers, Reputation, Reservations, Market, Price Index, Forwards, Secondary, Machine Credit, Settings, Home. Change no layout or classes, only data sources and the copy fixes from section 2.
9. **Maturity labels.** Extend `Maturity` / `MaturityTag` with the four `BuildStage` labels: Pre-hackathon foundation, Live local simulation, Hackathon build target, Roadmap. Replace the "Live MVP" and "XRPL connected" claims with "Live local simulation" and "XRPL: hackathon target".
10. **Adapters.** Add the interfaces and Simulated implementations in `src/adapters/*`. The Credit flow calls the simulated adapters, so hackathon work is just swapping implementations.
11. **Architecture page.** Add `/architecture` with:
    - a module diagram
    - an adapter table (interface, current implementation, stage)
    - the build status registry
    - an evidence tier explainer ("T2 does not prove physical GPU execution")
    - the baseline marker
    
    Link it in the sidebar.
12. **Cleanup.** Remove the `lib/credence.ts` shim, then run tests and typecheck.
13. **Baseline.** Write `BASELINE.md` and set the checkpoint (section 6).

## 5. Explicitly NOT built before Oct 24

- No real XRPL connection of any kind:
  - no xrpl.js dependency
  - no testnet/devnet accounts, wallets or faucets
  - no Single Asset Vault, Lending or PermissionDelegation transactions
  - no RLUSD trust lines, payments or AMM calls
- No Ledger device integration (no WebHID/WebUSB, no Ledger SDK).
- No backend, database or auth, and no persisted facility state.
- No real inference provider calls.
- No real Kessai serialization (interface and placeholder only).
- No Tier 3 measurement or any attestation.
- No futures, options, cash-settled forwards, margining, exchange matching engine or price-settled contracts. Forwards are commercial physical-delivery agreements and reservations only.
- No new visual redesign.

## 6. Baseline marker / checkpoint

- `BASELINE.md` at the root records:
  - the date and commit hash
  - the list of files in `src/adapters/*`, with every adapter's `stage` and implementation name (all `Simulated*`)
  - a statement that there are no XRPL/Ledger network dependencies in `package.json`
- A `baseline.test.ts` snapshot asserts that every adapter in the registry is `Simulated*` and that `package.json` has no `xrpl` or `@ledgerhq` packages. During the hackathon this test is deliberately updated, which makes the diff self-documenting.
- Save the version in Lovable History named "pre-hackathon-baseline-2026-10-23". If GitHub is connected, also add a git tag `pre-hackathon-baseline`. Everything after it counts as hackathon work.

## Technical notes

- The verifier and reducer are pure, sync functions with an injected `now`, so there is no `Date.now()` inside policy code.
- Money is handled as integer micro-RLUSD internally and formatted at the UI edge.
- Assumption: the simulation clock is fixed at `2026-09-28T05:00:00Z` to match the existing seeded timestamps.
