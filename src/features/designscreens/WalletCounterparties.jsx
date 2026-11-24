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
                Counterparties
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
          <main className="content" style={{ position: "relative" }}>
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
              <DLink href="/design/WalletCounterparties" className="on">
                Counterparties
              </DLink>
              <DLink href="/design/RiskAssessment">
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
              <div className="card " style={{ flex: "1 1 360px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Counterparties by risk tier
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                  <svg viewBox="0 0 170 170" width="170" height="170" role="img" aria-label="Distribution chart" style={{ display: "block", maxWidth: "100%", height: "auto" }}>
                    <circle cx="85.0" cy="85.0" r="62.9" fill="none" stroke="#16A34A" strokeWidth="22" strokeDasharray="148.21 247.01" strokeDashoffset="0.00" transform="rotate(-90 85.0 85.0)" />
                    <circle cx="85.0" cy="85.0" r="62.9" fill="none" stroke="#F59E0B" strokeWidth="22" strokeDasharray="112.50 282.71" strokeDashoffset="-150.21" transform="rotate(-90 85.0 85.0)" />
                    <circle cx="85.0" cy="85.0" r="62.9" fill="none" stroke="#EA580C" strokeWidth="22" strokeDasharray="81.11 314.11" strokeDashoffset="-264.71" transform="rotate(-90 85.0 85.0)" />
                    <circle cx="85.0" cy="85.0" r="62.9" fill="none" stroke="#DC2626" strokeWidth="22" strokeDasharray="45.40 349.81" strokeDashoffset="-347.81" transform="rotate(-90 85.0 85.0)" />
                    <text x="85.0" y="88.0" textAnchor="middle" fontWeight="700" fontSize="26" fill="#0F172A" fontFamily="Inter,sans-serif">
                      137
                    </text>
                    <text x="85.0" y="102" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      counterparties
                    </text>
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: "9px", flex: "1", minWidth: "150px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#16A34A" }} />
                      <span style={{ flex: "1" }}>
                        Low
                      </span>
                      <b>
                        62
                      </b>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#F59E0B" }} />
                      <span style={{ flex: "1" }}>
                        Moderate
                      </span>
                      <b>
                        41
                      </b>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#EA580C" }} />
                      <span style={{ flex: "1" }}>
                        High
                      </span>
                      <b>
                        25
                      </b>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#DC2626" }} />
                      <span style={{ flex: "1" }}>
                        Critical
                      </span>
                      <b>
                        9
                      </b>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card " style={{ flex: "1 1 360px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Exposure by category
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Exchange
                  </span>
                  <div className="bar">
                    <i style={{ width: "100.0%", background: "#1769E0" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    401
                  </b>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    DEX / DeFi
                  </span>
                  <div className="bar">
                    <i style={{ width: "52.9%", background: "#1769E0" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    212
                  </b>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Unknown
                  </span>
                  <div className="bar">
                    <i style={{ width: "62.3%", background: "#94A3B8" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    250
                  </b>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Mixing service
                  </span>
                  <div className="bar">
                    <i style={{ width: "23.9%", background: "#DC2626" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    96
                  </b>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Bridge
                  </span>
                  <div className="bar">
                    <i style={{ width: "7.7%", background: "#1769E0" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    31
                  </b>
                </div>
                <div className="mu sm">
                  Volume in $K · last 12 months
                </div>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div className="ct-h">
                <div>
                  <h3>
                    All counterparties
                  </h3>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div className="tools">
                <label className="s">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4.5 4.5" />
                  </svg>
                  <input placeholder="Search counterparties" />
                </label>
                <span className="sel">
                  <span>
                    Risk
                  </span>
                  All
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Label
                  </span>
                  All
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                  <span className="sel">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />
                    </svg>
                    Columns
                  </span>
                  <span className="sel">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />
                    </svg>
                    Export
                  </span>
                </span>
              </div>
              <div className="tbl">
                <table>
                  <thead>
                    <tr>
                      <th className="">
                        Counterparty
                      </th>
                      <th className="">
                        Transactions
                      </th>
                      <th className="">
                        Volume
                      </th>
                      <th className="">
                        Direction
                      </th>
                      <th className="" style={{ position: "relative" }}>
                        Risk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xE5f7…90b8
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        7
                      </td>
                      <td className="">
                        $128K
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Inbound
                        </span>
                      </td>
                      <td className="">
                        <span className="tier crit">
                          Critical
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0x5a8e…fd02
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        4
                      </td>
                      <td className="">
                        $96K
                      </td>
                      <td className="">
                        <span className="chip gray">
                          Outbound
                        </span>
                      </td>
                      <td className="">
                        <span className="tier crit">
                          Critical
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xd4b3…11c4
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        18
                      </td>
                      <td className="">
                        $212K
                      </td>
                      <td className="">
                        <span className="chip gray">
                          Outbound
                        </span>
                      </td>
                      <td className="">
                        <span className="tier mod">
                          Moderate
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xB7c4…0e21
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        12
                      </td>
                      <td className="">
                        $74K
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Inbound
                        </span>
                      </td>
                      <td className="">
                        <span className="tier high">
                          High
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0x28c6…1d60
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        31
                      </td>
                      <td className="">
                        $401K
                      </td>
                      <td className="">
                        <span className="chip blue">
                          Both
                        </span>
                      </td>
                      <td className="">
                        <span className="tier low">
                          Low
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0x98b1…2c70
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        9
                      </td>
                      <td className="">
                        $48K
                      </td>
                      <td className="">
                        <span className="chip gray">
                          Outbound
                        </span>
                      </td>
                      <td className="">
                        <span className="tier high">
                          High
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="pager">
                <span>
                  Showing 1–6 of 38
                </span>
                <div>
                  <b>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </b>
                  <b className="on">
                    1
                  </b>
                  <b>
                    2
                  </b>
                  <b>
                    3
                  </b>
                  <b>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </b>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
