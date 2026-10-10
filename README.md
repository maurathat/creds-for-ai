# Creds For Ai

Build a polished full-stack web app prototype called "Credence Markets" for an XRP Ledger hackathon.

PRODUCT POSITIONING
Credence finances verified inference for autonomous agents.
Tagline: "The hardware wallet is the constitution, not the cashier."
Secondary line: "Buy it. Finance it. Hedge it. Verify it."

IMPORTANT PRODUCT BOUNDARY
This is a product-vision prototype with ONE core flow treated as the live MVP and multiple future modules shown as realistic simulated/roadmap surfaces.
Clearly mark features as Live MVP, Simulated, or Roadmap. Do not imply regulatory approval or production readiness.

CORE LIVE MVP: CREDENCE CREDIT
A machine credit facility for an autonomous AI agent to purchase verified inference.
Seed one borrower, one inference provider, one model artifact, one execution profile, Tier 2 "provider-declared and bound" evidence, one facility, one settlement asset.
Show:
- Borrower: ResearchBot-17
- Facility: 500 RLUSD
- Available: 362.40 RLUSD
- Purpose: verified inference only
- Approved provider: Northstar Compute
- Model: open-weight model, use a generic invented name such as Meridian-70B-Instruct
- Artifact digest: truncated SHA256
- Precision: BF16
- Evidence tier: Tier 2
- Owner/root authority: Ledger hardware signer
- Operational authority: Agent delegate
- Ledger: XRPL
- Status: Active

CORE FLOW
1. Agent requests inference
2. Credence checks facility
3. Request is serialized/canonically bound
4. Provider returns Tier-2 receipt
5. Credence verifies request/response/profile binding
6. Credence approves settlement
7. XRPL facility state updates
8. Borrower and provider reputation update

Create a live-looking transaction trace for a valid request and six rejected examples:
- wrong provider
- wrong model declaration
- wrong precision declaration
- replayed delivery receipt
- facility overspend
- expired / unauthorized spend

INFORMATION ARCHITECTURE / PAGES
Create a left sidebar with:
Overview
Credit
Inference Market
Providers
Reputation
Reservations
Forwards
Secondary Market
Price Index
Machine Credit
Receipts
Settings

OVERVIEW
Executive dashboard with:
- Active credit facilities
- Verified inference purchased
- Outstanding balance
- Provider conformity score
- Current VIU spot reference price
- Recent receipt activity
- "Market stack" diagram showing Credit → Marketplace → Reservations → Forwards → Secondary Markets
Use seeded data and charts.

CREDIT PAGE — LIVE MVP
Make this the strongest page.
Include:
- active facility card
- utilization gauge
- repayment schedule
- approved execution profile
- hardware-root signing policy
- "Ledger approval required" for changing facility terms
- operational purchases can proceed without touching the Ledger device
- transaction/request table
- attack-case verifier panel with PASS/REJECT outcomes
- button "Simulate inference purchase"
When clicked, show a short animated state progression through authorization → receipt → verification → settlement.

INFERENCE MARKET — SIMULATED
A real marketplace-looking catalog of competing inference providers.
Filters:
model family
jurisdiction
data residency
precision
evidence tier
price per VIU
latency
credit eligible
Seed 6-8 fictional providers across US, France, Germany, Finland, Singapore, Japan.
Each listing must show:
provider name
region
open model
artifact profile
precision / quantization
evidence tier
RLUSD per VIU
latency
provider reputation
credit eligibility
A compare drawer for 3 providers.
Include routing concepts:
Cheapest
Fastest
Verified
Sovereign EU
Credit Eligible

PROVIDER BIDDING — SIMULATED
Inside an inference procurement order, show buyer requirement:
100 VIU
Meridian-70B-Instruct
BF16
EU residency
Tier 2+
delivery window
Then show 4 competing provider bids with price, SLA, evidence tier, capacity, reputation.
Allow selecting a bid visually.

PORTABLE PROVIDER REPUTATION — SIMULATED
Create provider scorecards with:
completed VIUs
conforming receipts
receipt disputes
latency SLA performance
availability
evidence tiers supported
jurisdictions served
buyer rating
Do not collapse into one opaque credit score; show decomposed metrics.

RESERVATIONS — ROADMAP
Inference Capacity Reservations page.
Show capacity reservation instruments such as:
"Meridian-70B / BF16 / EU / November / 250 VIU"
Display reserved quantity, fixed price, delivery window, provider, evidence tier, utilization.
Make it look operational but mark Roadmap / simulated.

FORWARDS — ROADMAP
Forward delivery contracts for verified inference.
Do not call this a regulated futures exchange.
Use language: commercial forward delivery / capacity contract.
Show examples with:
contract ID
model execution profile
delivery month
quantity VIU
fixed RLUSD/VIU
provider
buyer
evidence tier
delivery status
Include a small forward curve chart labeled "Illustrative / simulated".

SECONDARY MARKET — ROADMAP
Show transferable capacity claims only as conceptual/simulated.
Order book style UI:
Bid / Ask / Quantity / Delivery / Profile
Prominent label: "Roadmap concept — transferability and regulatory treatment not implemented."
Keep it elegant and believable.

PRICE INDEX — ROADMAP
"Credence Verified Inference Index (CVII)"
Show illustrative spot reference prices by execution profile and region.
Example indexes:
CVII Meridian-70B BF16 Global
CVII Meridian-70B BF16 EU
CVII OpenCoder-34B FP8 US
Use a line chart and methodology card:
- qualifying providers
- evidence tier threshold
- minimum observed volume
- outlier handling
Mark values as simulated demo data.

MACHINE CREDIT — ROADMAP
Broader facilities beyond inference:
data APIs
tool calls
other agents
storage
compute
software services
Show a fictional ResearchBot operating-capital profile:
monthly revenue
verified receivables
credit utilization
repayment history
approved merchant categories
Do not imply a real credit rating agency.
Show facility classes:
Inference Facility
API Facility
Agent-to-Agent Trade Credit
Receivables Advance

RECEIPTS
Create a detailed "Verified Inference Receipt" inspector.
Fields:
facility_id
borrower_id
provider_id
execution_profile_digest
request_digest
response_digest
output_token_count
declared_execution_profile
evidence_tier
provider_signature
completion_timestamp
XRPL transaction hash
Show the evidence distinction visually:
Requested ✓
Provider-declared and bound ✓
Loaded artifact measured —
Physical GPU execution proven —
Add explanatory text:
"Credence settles the evidence tier the parties contracted for — no more, no less."

SETTINGS / AUTHORITY
Show Root Authority:
Ledger hardware signer
and Operational Authority:
ResearchBot-17
Show facility changes requiring root approval:
raise limit
change providers
change execution profile
withdraw unrestricted funds
rotate/revoke agent authority
Normal in-policy inference purchases should not require hardware confirmation.

VISUAL DESIGN
High-end fintech / institutional markets aesthetic.
Dark charcoal / near-black background with crisp white typography and restrained electric accents.
Think institutional trading terminal + modern AI infrastructure company, not crypto casino.
Avoid excessive gradients, neon, or meme crypto visuals.
Dense but clean data UI.
Use cards, tables, tiny sparklines, status chips, metric blocks, and elegant charts.
Desktop-first but responsive.
Use realistic names and numbers but all demo data must be visibly marked "Simulated" where appropriate.

HOME HERO
Credence
Financial markets for machine intelligence.
"Finance verified inference for autonomous agents."
Buttons:
Explore Market
View Credit Facility
Inspect Receipt

Add a compact explanatory section:
Open models made model artifacts portable.
Credence makes inference contractible, financeable, and auditable across providers.

XRPL ROLE
Surface XRPL throughout:
credit/loan state
settlement
account identity
facility transaction references
Do not pretend XRPL natively enforces application-level provider/model/amount rules.
State that Credence policy + co-signing enforces application-level terms before settlement.

TECHNICAL CLARITY
Use the term Kessai serialization for request canonicalization/binding.
Do not call it UOR-ADDR.
Evidence Tier 2 means provider-declared and bound, not proof of physical execution.
Tier 3 measured-artifact execution is Roadmap.

Seed enough data so every page looks populated and demo-ready.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/307a6bdc-1e63-4463-bff7-e79d2573943f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
