# Chain Intel

Wallet monitoring and investigations for regulated banks.

| Folder | What it is |
|---|---|
| `src/`, `public/`, `index.html` | React 18 + Vite app: 107 screens, demo roles, mock data. `src/engine/` is the JS risk engine prototype. |
| `docs/` | Backend notes and risk-engine methodology |
| `ml/` | Python training pipeline for the illicit-wallet classifier (writes into `src/engine/models/`) |
| `backend/` | Python FastAPI backend, one package per module: M3 data, M4 risk, M5 fund flow, M6 cases, M7 monitoring |
| `backend/legacy/wallet-graph-api/` | Old Node wallet-graph service, kept as reference while it is ported into M3 and M5. Not run. |
| `contracts/` | Hardhat project with the AuditAnchor contract |

## Frontend

React 18 + Vite + React Router, all 107 screens from the design, working end to end on mock data in the browser.

```bash
npm install
cp .env.example .env.local   # optional: RPC, Etherscan/Alchemy key, audit-anchor contract
npm run dev                  # http://localhost:5173
npm run build && npm run preview
```

## Signing in (invite-only)

There is no sign-up and no wallet sign-in. Accounts exist only because an admin invited them (`/admin/users/invite`).

1. `/login`: work email + password. Wrong details always show the same message; 5 failures lock the account for 15 minutes.
2. `/mfa`: 6-digit code sent to the work email (demo code **123456**), resend after 30 s, 5 wrong codes end the sign-in.
3. `/forgot-password`: email → 6-digit code → new password (8+ characters, a letter and a number). No reset links.

Demo accounts are under "Demo accounts" on the sign-in page; any 6+ character password works until you reset it.

The backend contract for these flows is in `docs/BACKEND-NOTES.md`.

## Folder structure

```
src/
  app/
    AppShell.jsx          sidebar + top bar + <Outlet />
    config/
      paths.js            every screen: URL, title, breadcrumbs; pathOf(key), homeOf(role)
      routes.jsx          screen key -> element; public and signed-in route lists
      navigation.js       sidebar menu per role
      roles.js            role codes, labels, landing screens
    router/               AppRouter, AuthGuard (signed in?), RoleRoute (role/permission + path param binding)
    providers/            React Query, wagmi, toasts
  components/
    ui/                   Button, Card, Chip, Modal, Input, OtpInput, ... (barrel: components/ui/index.js)
    layout/               Sidebar, TopBar, SearchBox, PageHeader
    data/                 DataTable (search, filters, sort, paging, column toggle, CSV export)
    charts/               RiskGauge, TrendChart, BarChart, BarList, DonutChart
    graph/                WalletGraph, FlowGraph, CaseGraph
    domain/               OnChain (live Ethereum data, audit anchoring), workspace helpers
  context/                useSession, toasts
  features/<area>/pages   one file per screen: auth, wallets, tracing, cases, evidence, watchlists,
                          alerts, reports, investigator, reviewer, compliance, audit, examiner,
                          bank-admin, super-admin, platform-ops, settings, notifications, search, errors
  lib/                    format, risk model, permissions, web3 (viem clients, contract)
  mocks/                  store (state, actions, keccak-256 audit chain) and seed data
  design/tokens.css       colour tokens
```

## URLs

Screens use real URLs with ids, for example `/cases/CASE-2026-00128/evidence`, `/wallets/0x…/risk`, `/transactions/0x…`, `/reports/RPT-2026-0214`. `RoleRoute` checks the role, binds the id to the store's current selection and shows 404 for an unknown id. Landing screens: Investigator `/dashboard`, Reviewer `/review`, Compliance Manager `/compliance`, Bank Admin `/admin`, Auditor `/audit`, Academic Examiner `/examiner`, Platform Admin `/ops`, Super Admin `/platform`.

## Risk engine (wallet monitoring and scoring)

`src/engine/` scores wallets two ways, shown side by side on each wallet's Risk Assessment tab:

- **Logical score (rules):** sanctions, mixer, scam and ransomware exposure (direct and up to 3 hops, decayed by distance and scaled by amount), behavioural anomalies, risky counterparties, cross-chain movement. Every point links to its calculation, transactions, addresses and source.
- **Predictive:** illicit probability from a gradient-boosted model trained in Python (`ml/`), anomaly detection against the wallet's own baseline, and a 30-day risk forecast.
- **Monitoring:** Alerts and Watchlists pages run the monitoring job over every watched wallet and raise alerts when exposure, tier, threshold, anomaly or model probability changes.

Details: `docs/RISK-ENGINE.md`. Tests: `npm test` (engine) and `cd ml && pytest` (training pipeline).

## Blockchain data

viem reads balances, ENS, receipts and the latest block from Ethereum; Etherscan or Alchemy supply transaction history when a key is set. Without them the app shows "Offline" and uses model data. The audit log can be anchored on Sepolia with the `AuditAnchor` contract (`../contracts`); a wallet is used only to sign that transaction, never to sign in.

## Moving to a real backend

Replace the actions in `src/mocks/store.js` with API calls (endpoints in `docs/BACKEND-NOTES.md`) and the generators in `src/lib/risk.js` with your data services. Screens only talk to the store, so they do not change.
