# Claw Street — Powered by Credence

Claw Street is Kessai Labs' AI-agent procurement demo, powered by Credence. It demonstrates policy-governed inference purchases, signed requests and delivery receipts, response access and facility accounting.

> **Judges and reviewers: start with the [complete implementation and updated project README](https://github.com/maurathat/credence-xrpl).** This repository, `creds-for-ai`, contains the frontend. The backend, contracts, tests, sponsor-integration work and submission package are in the public `credence-xrpl` repository. Its `main` branch now contains the Claw Street release, not the old Checkpoint-0 skeleton.

## Judge quick links

| What to review | Link |
| --- | --- |
| Complete project and sponsor-integration overview | [Credence / Claw Street source](https://github.com/maurathat/credence-xrpl) |
| Working local demo and walkthrough | [Release guide](https://github.com/maurathat/credence-xrpl/blob/main/release/claw-street/README.md) |
| Demo recording | [Captioned three-minute video](https://github.com/maurathat/credence-xrpl/releases/download/claw-street-submission-2026-10-25/claw-street-demo-3min.webm) — silent, with captions |
| Pitch deck | [Six-slide PDF](https://github.com/maurathat/credence-xrpl/releases/download/claw-street-submission-2026-10-25/claw-street-pitch.pdf) |
| Packaged source, including frontend and custody dependency | [Source archive](https://github.com/maurathat/credence-xrpl/releases/download/claw-street-submission-2026-10-25/claw-street-source.zip) |
| Complete submission materials | [Submission kit](https://github.com/maurathat/credence-xrpl/releases/download/claw-street-submission-2026-10-25/claw-street-submission-kit.zip) |
| Test results and known limitations | [Validation record](https://github.com/maurathat/credence-xrpl/blob/main/release/claw-street/SUBMISSION-VALIDATION.md) and [integration disclosures](https://github.com/maurathat/credence-xrpl/blob/main/release/claw-street/DISCLOSURES.md) |
| Public browser experience | [Claw Street website](https://creds-for-ai.lovable.app) — a seeded browser simulation, not the local backend |

## What we accomplished

- **Local end-to-end procurement:** Core policy evaluation, agent-signed purchase requests, reservations, delivery verification, response retrieval and acknowledgement, and facility accounting.
- **Verifiable evidence:** canonical request/response binding, signed delivery evidence, access controls, revocation and durable purchase recovery. Evidence tiers are explicit rather than claims of proving physical execution.
- **Real observations, honestly labelled:** recorded Nebius API inference, recorded local Qwen provider evidence, and real unpaid x402 merchant challenges and t54 capability responses. The default demo replays offline mocks rather than charging providers or buying inference again.
- **XRPL engineering on separate branches:** standalone-ledger authorization/lending experiments, software two-signer verification, durable payment journaling and restart/finality hardening. These are not a connected marketplace payout or production lending claim.
- **Presentation and source deliverables:** local release UI, guided/recorded demonstration, pitch deck, talk track, submission kit and source archive.

The validation record distinguishes successful recorded local checks from the disclosed Linux CI ownership-test failure. No fresh full-product test run is implied by this README update.

## Sponsor and ecosystem integration status

| Technology | Accomplishment | Honest current boundary |
| --- | --- | --- |
| **XRP Ledger / Ripple** | Standalone-ledger experiments, software 2-of-2 authorization/payment verification, durable journal and reconciliation work. See the [XRPL adapter branch](https://github.com/maurathat/credence-xrpl/tree/maurathat/credence-multi-sig-ledger) and [standalone/Testnet research](https://github.com/maurathat/credence-xrpl/tree/maurathat/xrpl-credence-codex). | Separate workstreams, not connected purchase settlement in this frontend or the local marketplace release. No mainnet or production-ready lending claim. |
| **Nebius Token Factory** | Built the inference adapter and retained recorded evidence from a real public-API inference run. | Scenario A is an offline mock. Tier 1 means Credence witnessed the response, not that Nebius signed it. Normal Nebius billing is separate from XRPL; no partnership is implied. |
| **x402 / t54** | Recorded unpaid merchant challenges and facilitator `/supported` responses; implemented parsing, compatibility assessment and offline payment-proposal preparation in the backend. | No paid t54 inference, payment signing/submission, or facilitator `/verify` or `/settle` call. Observed RLUSD/Mainnet merchant terms are challenge data, not an executed payment or our accounting unit. |
| **QuickNode** | A separate read-only XRPL adapter with offline transport, credential, deadline and reconciliation hardening. See the [QuickNode branch](https://github.com/maurathat/credence-xrpl/tree/maurathat/quicknode-xrpl-integration). | Not connected to the release. Real endpoint validation remains pending in the recorded evidence; advisory reads do not establish authoritative payment finality. |
| **Ledger** | Defined the intended owner/agent/policy authority split; separate XRPL code uses a software two-signer baseline. | Ledger device, WebHID and Speculos integration remain unconnected. Software multisigning is not hardware-signing evidence. |
| **Lovable** | Built this frontend, the public seeded simulation and a separate UI for the local backend release. | The public site does not execute the backend's signature verification or payment authority. |
| **Kessai** | Uses the pinned serializer for canonical bytes and digests: JCS (RFC 8785) + NFC. | Consumed as a dependency, not reimplemented. |
| **Local Qwen provider** | Recorded local inference and provider-signed evidence; Scenario B demonstrates the corresponding verification/accounting flow offline. | Tier 2 means the provider signed what it says it served, not proof that exact model weights ran. No model runs in the default demo. |
| **Verifiable Intent** | Identified in the integration roadmap. | No credential issuance or verification is connected. |

See the [full backend integration overview](https://github.com/maurathat/credence-xrpl#sponsor-and-ecosystem-integrations) for branch links and evidence. Published workstream code is not automatically merged into the release or accepted through its remaining review gates.

## Repository and branch map

- **`maurathat/creds-for-ai` — this repository:** frontend code. `main` is the Lovable-connected browser simulation; `release/claw-street-ui` is the separate frontend used by the local full-stack release.
- **[`maurathat/credence-xrpl`](https://github.com/maurathat/credence-xrpl):** backend, Core accounting/verification, contracts, tests, integration work and release materials. Its `main` is the promoted Claw Street release; the `web` submodule pins the appropriate local-release frontend.
- **Separate development branches:** XRPL, QuickNode, inference, integration and review checkpoints remain visible independently. Updating this README does not merge backend code into the hosted frontend.

## Payment and evidence limits

Core accounting uses **integer micro-tRLUSD**; tRLUSD is a synthetic test unit, not RLUSD and not XRP drops. No provider receives an on-chain payment in the marketplace release. Account balances, routing and purchase outcomes on the hosted site are seeded browser simulations.

Native-XRP purchase authority under **X2-0R remains review-only and gated**. A separately approved one-drop Testnet demonstration would not convert or economically discharge a micro-tRLUSD inference charge. There is no live paid t54 flow, Ledger hardware signing, mainnet settlement, trustless settlement, production lending or proof that exact model weights ran. No sponsor or UOR Foundation endorsement is implied.

## Frontend development

This app uses React, TanStack Start/Router, Vite, TypeScript and Tailwind. Use Bun with the committed lockfile:

```sh
git clone https://github.com/maurathat/creds-for-ai.git
cd creds-for-ai
bun install --frozen-lockfile
bun run dev
```

Other available commands:

```sh
bun run test
bun run build
bun run lint
```

These commands run this frontend, not the full backend demo. Follow the [backend release guide](https://github.com/maurathat/credence-xrpl/blob/main/release/claw-street/README.md) for the full-stack setup.

Continue development in the [Lovable editor](https://lovable.dev/projects/307a6bdc-1e63-4463-bff7-e79d2573943f). Commits pushed to the connected branch sync to Lovable. Do not force-push, amend or rewrite published history.
