import { DLink } from '../design/DLink';
import { Gauge } from '../../components/ui';
import { CFG, TN } from '../../lib/risk';
import { fdt, ago, num, usd } from '../../lib/format';
import { useWallet } from '../wallets/shared';
import { shortAddr } from '../design/dashParts';
import { useStore } from '../../mocks/store';
import { useParams } from 'react-router-dom';

export default function Screen() {
  const { address } = useParams(); const sel = useStore(); const wallet = address || sel.ctx.wallet || '—';
  const [p] = useWallet(); const onWatch = sel.watchlists.some((w) => w.wallets.some((x) => x.a.toLowerCase() === (wallet || '').toLowerCase()));
  return (
    <>
      <div className="app">
        <nav className="side" aria-label="Main">
          <div className="brand">
            <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
              <rect width="40" height="40" rx="11" fill="#1769E0" />
              <circle cx="12" cy="20" r="3.2" fill="#fff" />
              <circle cx="27" cy="11.5" r="3.2" fill="#fff" />
              <circle cx="27" cy="28.5" r="3.2" fill="#fff" />
              <path d="M14.7 18.5l9.6-5.5M14.7 21.5l9.6 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <b>
              Chain Intel
            </b>
          </div>
          <div className="ws">
            <span>
              Workspace
            </span>
            <b>
              Example Bank
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </b>
          </div>
          <div className="nav">
            <DLink href="/dashboard">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              <span>
                Investigator Dashboard
              </span>
            </DLink>
            <DLink href="/wallets" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
                <path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z" />
                <circle cx="16" cy="13.5" r="1.2" />
              </svg>
              <span>
                Wallet Monitoring
              </span>
            </DLink>
            <DLink href="/trace">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 7h12l-3-3M17 17H5l3 3" />
              </svg>
              <span>
                Transaction Tracing
              </span>
            </DLink>
            <DLink href="/design/CaseRelGraph">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="5.5" cy="12" r="2.5" />
                <circle cx="18" cy="5.5" r="2.5" />
                <circle cx="18" cy="18.5" r="2.5" />
                <path d="M8 11l7.6-4M8 13l7.6 4" />
              </svg>
              <span>
                Investigation Graph
              </span>
            </DLink>
          </div>
          <div className="nh">
            Work
          </div>
          <div className="nav">
            <DLink href="/my/cases">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
              </svg>
              <span>
                My Cases
              </span>
            </DLink>
            <DLink href="/my/tasks">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1" />
              </svg>
              <span>
                My Tasks
              </span>
            </DLink>
            <DLink href="/watchlists">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>
                My Watchlists
              </span>
            </DLink>
            <DLink href="/alerts">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3.5l9.5 16.5h-19z" />
                <path d="M12 10v4.5M12 17.2v.1" />
              </svg>
              <span>
                Alerts
              </span>
            </DLink>
            <DLink href="/my/reports">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h8l5 5v13H6z" />
                <path d="M14 3v5h5M9 13h7M9 17h7" />
              </svg>
              <span>
                Reports
              </span>
            </DLink>
            <DLink href="/reports/new">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>
              <span>
                Generate report
              </span>
            </DLink>
          </div>
          <div className="sfoot">
            <div className="nav">
              <DLink href="/notifications">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z" />
                  <path d="M10 21h4" />
                </svg>
                <span>
                  Notifications
                </span>
              </DLink>
              <DLink href="/settings/preferences">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8.5" r="3.5" />
                  <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
                </svg>
                <span>
                  My Profile
                </span>
              </DLink>
              <DLink href="/login">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />
                </svg>
                <span>
                  Sign out
                </span>
              </DLink>
            </div>
          </div>
        </nav>
        <div className="main">
          <header className="top">
            <div className="crumbs">
              <span>
                Wallet Monitoring
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <span>
                {shortAddr(wallet)}
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <b>
                Risk Assessment
              </b>
            </div>
            <label className="search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
              <span style={{ position: "absolute", left: "-9999px" }}>
                Global search
              </span>
              <input type="search" placeholder="Search wallet, transaction, case, evidence" />
            </label>
            <span className="pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="3" width="14" height="18" rx="1.5" />
                <path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4" />
              </svg>
              Example Bank
            </span>
            <span className="pill">
              <i />
              Ethereum Mainnet
            </span>
            <DLink href="/notifications" className="ib" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z" />
                <path d="M10 21h4" />
              </svg>
              <em />
            </DLink>
            <a className="ib" href="#" aria-label="Help">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1 1-1.1 1.9M12 17v.1" />
              </svg>
            </a>
            <DLink href="/settings/profile" className="user">
              <div className="av" aria-hidden="true">
                SA
              </div>
              <div>
                <b>
                  Sara Ali
                </b>
                <span>
                  Investigator
                </span>
              </div>
            </DLink>
          </header>
          <main className="content">
            <div className="card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#FEE2E2", color: "#991B1B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
                      <path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z" />
                      <circle cx="16" cy="13.5" r="1.2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <h1 style={{ fontSize: "20px" }} className="mono">
                        {wallet}
                      </h1>
                      <span className={`tier ${p.tier}`}>{TN[p.tier] || "Unknown"}</span>
                      <span className="chip blue">
                        Ethereum
                      </span>
                      {onWatch && <span className="chip warn">On watchlist</span>}
                    </div>
                    <div className="mu" style={{ marginTop: "6px" }}>
                      {p.first ? `First seen ${fdt(p.first)} · Last active ${fdt(p.last)}` : 'No on-chain activity loaded. The backend analyses a wallet when it is opened.'}
                    </div>
                  </div>
                </div>
                <div className="acts">
                  <a href="#" className="btn ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="8" y="8" width="12" height="12" rx="2" />
                      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                    </svg>
                    Copy address
                  </a>
                  <a href="#" className="btn ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 12V4h8l10 10-8 8z" />
                      <circle cx="7.5" cy="8.5" r="1.3" />
                    </svg>
                    Add to watchlist
                  </a>
                  <DLink href="/cases/new" className="btn ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
                    </svg>
                    Create case
                  </DLink>
                  <DLink href="/trace" className="btn pri">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="5.5" cy="12" r="2.5" />
                      <circle cx="18" cy="5.5" r="2.5" />
                      <circle cx="18" cy="18.5" r="2.5" />
                      <path d="M8 11l7.6-4M8 13l7.6 4" />
                    </svg>
                    Trace transactions
                  </DLink>
                </div>
              </div>
            </div>
            <div className="tabs">
              <DLink href="/design/WalletOverview">
                Overview
              </DLink>
              <DLink href="/design/WalletTransactions">
                Transactions
              </DLink>
              <DLink href="/design/WalletCounterparties">
                Counterparties
              </DLink>
              <DLink href="/design/RiskAssessment" className="on">
                Risk Assessment
              </DLink>
              <DLink href="/design/WalletGraph">
                Graph
              </DLink>
              <DLink href="/design/WalletEvidence">
                Evidence
              </DLink>
              <DLink href="/design/WalletCases">
                Cases
              </DLink>
              <DLink href="/design/WalletWatchlists">
                Watchlists
              </DLink>
              <DLink href="/design/WalletHistory">
                History
              </DLink>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Overall risk
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <svg viewBox="0 0 230 230" width="230" height="230" role="img" aria-label="Risk score 78 out of 100, Critical" style={{ display: "block", maxWidth: "100%", height: "auto" }}>
                      <path d="M39.47 187.43A104.65 104.65 0 0 1 17.50 76.99" stroke="#16A34A" strokeWidth="4.1" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M19.18 72.94A104.65 104.65 0 0 1 112.81 10.37" stroke="#F59E0B" strokeWidth="4.1" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M117.19 10.37A104.65 104.65 0 0 1 210.82 72.94" stroke="#EA580C" strokeWidth="4.1" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M212.50 76.99A104.65 104.65 0 0 1 190.53 187.43" stroke="#DC2626" strokeWidth="4.1" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M56.45 173.55A82.8 82.8 0 1 1 173.55 173.55" stroke="#E8EDF4" strokeWidth="17.2" fill="none" strokeLinecap="round" />
                      <path d="M56.45 173.55A82.8 82.8 0 1 1 195.20 94.41" stroke="#DC2626" strokeWidth="17.2" fill="none" strokeLinecap="round" />
                      <circle cx="195.2" cy="94.4" r="6.0" fill="#fff" stroke="#DC2626" strokeWidth="3" />
                      <text x="115.0" y="124.2" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="60" fill="#0F172A" letterSpacing="-2">
                        78
                      </text>
                      <text x="115.0" y="152" textAnchor="middle" fontSize="14" fill="#5B6B82" fontFamily="Inter,sans-serif">
                        out of 100
                      </text>
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span className="tier crit">
                      Critical
                    </span>
                  </div>
                  <div className="mu sm" style={{ textAlign: "center", marginTop: "10px" }}>
                    R = 0.35T + 0.25E + 0.20B + 0.10A + 0.10O = 78.0
                  </div>
                </div>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Tier thresholds
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div className="legend" style={{ flexDirection: "column", gap: "8px" }}>
                    <span>
                      <i style={{ background: "#16A34A" }} />
                      Low: 0–24
                    </span>
                    <span>
                      <i style={{ background: "#F59E0B" }} />
                      Moderate: 25–49
                    </span>
                    <span>
                      <i style={{ background: "#EA580C" }} />
                      High: 50–74
                    </span>
                    <span>
                      <i style={{ background: "#DC2626" }} />
                      Critical: 75–100
                    </span>
                  </div>
                  <div className="hint" style={{ marginTop: "10px" }}>
                    Thresholds are configurable by Platform Admin.
                  </div>
                </div>
              </div>
              <div style={{ flex: "2 1 560", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="card " style={{ position: "relative" }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Score explanation
                      </h3>
                      <p>
                        Weighted components, per risk methodology v3
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div style={{ padding: "14px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <b>
                        Transaction risk
                      </b>
                      <span className="mu">
                        90 × 0.35 =
                        <b style={{ color: "var(--tx)" }}>
                          31.5
                        </b>
                      </span>
                    </div>
                    <div className="bar" style={{ marginTop: "8px" }}>
                      <i style={{ width: "90%", background: "#DC2626" }} />
                    </div>
                  </div>
                  <div style={{ padding: "14px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <b>
                        Exposure risk
                      </b>
                      <span className="mu">
                        80 × 0.25 =
                        <b style={{ color: "var(--tx)" }}>
                          20.0
                        </b>
                      </span>
                    </div>
                    <div className="bar" style={{ marginTop: "8px" }}>
                      <i style={{ width: "80%", background: "#DC2626" }} />
                    </div>
                  </div>
                  <div style={{ padding: "14px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <b>
                        Behaviour risk
                      </b>
                      <span className="mu">
                        80 × 0.20 =
                        <b style={{ color: "var(--tx)" }}>
                          16.0
                        </b>
                      </span>
                    </div>
                    <div className="bar" style={{ marginTop: "8px" }}>
                      <i style={{ width: "80%", background: "#DC2626" }} />
                    </div>
                  </div>
                  <div style={{ padding: "14px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <b>
                        Attribute risk
                      </b>
                      <span className="mu">
                        60 × 0.10 =
                        <b style={{ color: "var(--tx)" }}>
                          6.0
                        </b>
                      </span>
                    </div>
                    <div className="bar" style={{ marginTop: "8px" }}>
                      <i style={{ width: "60%", background: "#EA580C" }} />
                    </div>
                  </div>
                  <div style={{ padding: "14px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <b>
                        Other signals
                      </b>
                      <span className="mu">
                        45 × 0.10 =
                        <b style={{ color: "var(--tx)" }}>
                          4.5
                        </b>
                      </span>
                    </div>
                    <div className="bar" style={{ marginTop: "8px" }}>
                      <i style={{ width: "45%", background: "#F59E0B" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "14px" }}>
                    <b>
                      Final score
                    </b>
                    <b style={{ fontSize: "18px" }}>
                      78.0
                    </b>
                  </div>
                </div>
                <div className="card " style={{ position: "relative" }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Contributing evidence
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th className="">
                            Evidence
                          </th>
                          <th className="">
                            Finding
                          </th>
                          <th className="">
                            Component
                          </th>
                          <th className="">
                            Contribution
                          </th>
                        </tr>
                      </thead>
                      <tbody>
<tr><td colSpan={4} className="mu">Risk evidence comes from the backend risk engine, which is not connected in this build.</td></tr>
</tbody>
                    </table>
                  </div>
                  <div className="mu sm" style={{ paddingTop: "12px" }}>
                    Contributions: 18.0 + 13.5 + 20.0 + 16.0 + 6.0 + 4.5 = 78.0
                  </div>
                </div>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div className="ct-h">
                <div>
                  <h3>
                    Methodology and limitations
                  </h3>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div className="note info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1 1-1.1 1.9M12 17v.1" />
                </svg>
                <div>
                  Risk scores are decision-support signals and not legal conclusions. Labels from third-party sources may be incomplete or out of date. Always verify evidence before acting.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
