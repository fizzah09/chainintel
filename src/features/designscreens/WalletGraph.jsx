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
                Graph
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
              <DLink href="/design/RiskAssessment">
                Risk Assessment
              </DLink>
              <DLink href="/design/WalletGraph" className="on">
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
            <div className="card " style={{  }}>
              <div className="ct-h">
                <div>
                  <h3>
                    Relationship graph
                  </h3>
                  <p>
                    Click a node for details. Dashed edges are possible, not confirmed, relationships.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div className="tools" style={{ marginBottom: "14px" }}>
                <span className="sel">
                  <span>
                    Direction
                  </span>
                  Both
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Depth
                  </span>
                  2 hops
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Period
                  </span>
                  30 days
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Min amount
                  </span>
                  $100
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Risk
                  </span>
                  All tiers
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span style={{ marginLeft: "auto" }}>
                  <a href="#" className="btn sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />
                    </svg>
                    Export image
                  </a>
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <svg viewBox="0 0 960 560" width="100%" role="img" aria-label="Wallet relationship graph centred on the selected wallet" style={{ display: "block", background: "#F8FAFD", borderRadius: "10px" }}>
                  <defs>
                    <pattern id="gd" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="1.5" cy="1.5" r="1.1" fill="#DCE4EE" />
                    </pattern>
                    <marker id="am" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                      <path d="M0 0L10 5L0 10z" fill="#7C8CA3" />
                    </marker>
                  </defs>
                  <rect width="960" height="560" fill="url(#gd)" />
                  <line x1="230.0" y1="339.2" x2="436.6" y2="282.0" stroke="#7C8CA3" strokeWidth="2.4" markerEnd="url(#am)" />
                  <rect x="303" y="300" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="333" y="315" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    12 tx
                  </text>
                  <line x1="263.0" y1="174.8" x2="438.8" y2="251.9" stroke="#7C8CA3" strokeWidth="2.4" markerEnd="url(#am)" />
                  <rect x="321" y="202" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="351" y="217" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    7 tx
                  </text>
                  <line x1="422.0" y1="105.5" x2="465.0" y2="227.6" stroke="#7C8CA3" strokeWidth="3.8" markerEnd="url(#am)" />
                  <rect x="414" y="156" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="444" y="171" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    31 tx
                  </text>
                  <line x1="504.8" y1="237.4" x2="600.0" y2="112.1" stroke="#7C8CA3" strokeWidth="2.6" markerEnd="url(#am)" />
                  <rect x="522" y="164" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="552" y="179" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    18 tx
                  </text>
                  <line x1="520.2" y1="261.8" x2="739.4" y2="217.2" stroke="#7C8CA3" strokeWidth="1.9" markerEnd="url(#am)" />
                  <rect x="600" y="228" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="630" y="243" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    9 tx
                  </text>
                  <line x1="518.6" y1="283.7" x2="715.1" y2="353.3" stroke="#7C8CA3" strokeWidth="2.1" strokeDasharray="6 5" markerEnd="url(#am)" />
                  <rect x="587" y="308" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="617" y="323" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    4 tx
                  </text>
                  <line x1="497.7" y1="307.0" x2="557.3" y2="431.3" stroke="#7C8CA3" strokeWidth="1.6" strokeDasharray="6 5" markerEnd="url(#am)" />
                  <rect x="497" y="358" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="527" y="373" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    2 tx
                  </text>
                  <line x1="374.2" y1="442.4" x2="456.5" y2="308.4" stroke="#7C8CA3" strokeWidth="1.7" markerEnd="url(#am)" />
                  <rect x="385" y="364" width="60" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                  <text x="415" y="379" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily="Inter,sans-serif">
                    6 tx
                  </text>
                  <circle cx="203.96529264413937" cy="346.3559969974555" r="24" fill="#fff" stroke="#EA580C" strokeWidth="3" />
                  <circle cx="203.96529264413937" cy="346.3559969974555" r="10.08" fill="#EA580C" opacity=".16" />
                  <text x="203.96529264413937" y="388.3559969974555" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Wallet B
                  </text>
                  <text x="203.96529264413937" y="403.3559969974555" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Unknown
                  </text>
                  <circle cx="236.43035518562664" cy="163.125" r="34" fill="none" stroke="#1769E0" strokeWidth="2.5" strokeDasharray="4 4" />
                  <circle cx="236.43035518562664" cy="163.125" r="26" fill="#fff" stroke="#DC2626" strokeWidth="3" />
                  <circle cx="236.43035518562664" cy="163.125" r="10.92" fill="#DC2626" opacity=".16" />
                  <text x="236.43035518562664" y="207.125" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Wallet E
                  </text>
                  <text x="236.43035518562664" y="222.125" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Unknown
                  </text>
                  <circle cx="413.677619692479" cy="81.88594533020395" r="22" fill="#fff" stroke="#16A34A" strokeWidth="3" />
                  <circle cx="413.677619692479" cy="81.88594533020395" r="9.24" fill="#16A34A" opacity=".16" />
                  <text x="413.677619692479" y="121.88594533020395" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Exchange hot
                  </text>
                  <text x="413.677619692479" y="136.88594533020395" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Exchange
                  </text>
                  <circle cx="617.5" cy="89.00069060905236" r="22" fill="#fff" stroke="#F59E0B" strokeWidth="3" />
                  <circle cx="617.5" cy="89.00069060905236" r="9.24" fill="#F59E0B" opacity=".16" />
                  <text x="617.5" y="129.00069060905236" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    DEX router
                  </text>
                  <text x="617.5" y="144.00069060905236" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    DEX
                  </text>
                  <circle cx="769.7777478867205" cy="210.98925771662527" r="24" fill="#fff" stroke="#EA580C" strokeWidth="3" />
                  <circle cx="769.7777478867205" cy="210.98925771662527" r="10.08" fill="#EA580C" opacity=".16" />
                  <text x="769.7777478867205" y="252.98925771662527" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Wallet G
                  </text>
                  <text x="769.7777478867205" y="267.9892577166253" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Unknown
                  </text>
                  <circle cx="746.227912442016" cy="364.3495269336111" r="26" fill="#fff" stroke="#DC2626" strokeWidth="3" />
                  <circle cx="746.227912442016" cy="364.3495269336111" r="10.92" fill="#DC2626" opacity=".16" />
                  <text x="746.227912442016" y="408.3495269336111" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Mixer
                  </text>
                  <text x="746.227912442016" y="423.3495269336111" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Mixing service
                  </text>
                  <circle cx="569.7802876229881" cy="457.4686778467887" r="22" fill="#fff" stroke="#64748B" strokeWidth="3" />
                  <circle cx="569.7802876229881" cy="457.4686778467887" r="9.24" fill="#64748B" opacity=".16" />
                  <text x="569.7802876229881" y="497.4686778467887" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Bridge
                  </text>
                  <text x="569.7802876229881" y="512.4686778467888" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Bridge
                  </text>
                  <circle cx="361.13861388542836" cy="463.7232894790839" r="22" fill="#fff" stroke="#F59E0B" strokeWidth="3" />
                  <circle cx="361.13861388542836" cy="463.7232894790839" r="9.24" fill="#F59E0B" opacity=".16" />
                  <text x="361.13861388542836" y="503.7232894790839" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Wallet C
                  </text>
                  <text x="361.13861388542836" y="518.7232894790839" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Unknown
                  </text>
                  <circle cx="480" cy="270" r="44" fill="none" stroke="#1769E0" strokeWidth="2.5" strokeDasharray="4 4" />
                  <circle cx="480" cy="270" r="36" fill="#fff" stroke="#DC2626" strokeWidth="3" />
                  <circle cx="480" cy="270" r="15.12" fill="#DC2626" opacity=".16" />
                  <text x="480" y="324" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                    Selected wallet
                  </text>
                  <text x="480" y="339" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    {shortAddr(wallet)}
                  </text>
                  <text x="480" y="275" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0F172A" fontFamily="Inter,sans-serif">
                    78
                  </text>
                </svg>
                <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span className="ib" style={{ width: "36px", height: "36px" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span className="ib" style={{ width: "36px", height: "36px" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                  <span className="ib" style={{ width: "36px", height: "36px" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                    </svg>
                  </span>
                  <span className="ib" style={{ width: "36px", height: "36px" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 11a8 8 0 0 0-14.5-3.5M4 4v4h4M4 13a8 8 0 0 0 14.5 3.5M20 20v-4h-4" />
                    </svg>
                  </span>
                </div>
                <div style={{ position: "absolute", left: "12px", bottom: "12px", background: "#fff", border: "1px solid var(--ln)", borderRadius: "10px", padding: "8px 12px" }}>
                  <div className="legend">
                    <span>
                      <i style={{ background: "#16A34A" }} />
                      Low
                    </span>
                    <span>
                      <i style={{ background: "#F59E0B" }} />
                      Moderate
                    </span>
                    <span>
                      <i style={{ background: "#EA580C" }} />
                      High
                    </span>
                    <span>
                      <i style={{ background: "#DC2626" }} />
                      Critical
                    </span>
                    <span>
                      <i style={{ background: "#64748B" }} />
                      Unknown
                    </span>
                  </div>
                  <div className="legend" style={{ marginTop: "6px" }}>
                    <span>
                      ── Observed transfers
                    </span>
                    <span>
                      ╌╌ Possible relationship
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div className="card " style={{ flex: "1 1 380px", position: "relative" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Selected node: Wallet E
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div className="dl">
                  <span className="t">
                    Address
                  </span>
                  <span className="mono">
                    0xE5f7…90b8
                  </span>
                  <span className="t">
                    Risk
                  </span>
                  <span>
                    <span className="tier crit">
                      Critical
                    </span>
                  </span>
                  <span className="t">
                    Label
                  </span>
                  <span>
                    Unknown
                  </span>
                  <span className="t">
                    Transactions with target
                  </span>
                  <span>
                    7 · 4,200 USDT
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <DLink href="/design/WalletOverview" className="btn sm">
                    Open profile
                  </DLink>
                  <a href="#" className="btn sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="5.5" cy="12" r="2.5" />
                      <circle cx="18" cy="5.5" r="2.5" />
                      <circle cx="18" cy="18.5" r="2.5" />
                      <path d="M8 11l7.6-4M8 13l7.6 4" />
                    </svg>
                    Trace from here
                  </a>
                  <a href="#" className="btn sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
                    </svg>
                    Add to case
                  </a>
                </div>
                <svg width="379" height="50" viewBox="0 0 379 50" preserveAspectRatio="none" style={{ position: "absolute", left: "-40px", top: "104px", width: "379px", height: "50px", overflow: "visible", fill: "none", stroke: "#8a8378", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}>
                  <path d="M51.496 0 C134.157 4.138 218.826 17.862 302.079 9.496 C313.469 8.297 327.523 5.93 340.931 5.93 C356.167 5.93 370.568 8.987 379.275 20.289 C364.038 32.796 336.947 38.476 310.857 41.415 C294.827 43.222 279.174 43.994 266.882 44.679 C236.385 46.377 205.086 44.879 174.789 47.377 C153.934 49.089 133.942 50.091 113.891 50.091 C95.639 50.091 77.339 49.261 58.296 47.377 C45.065 46.104 31.735 45.831 18.693 43.94 C13.304 43.158 7.963 42.1 2.7 40.581 C1.8 36.583 0.9 32.483 0 28.485 C18.899 17.191 72.296 9.896 96.193 5.398" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="card " style={{ flex: "1 1 380px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Graph guidance
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="note info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1 1-1.1 1.9M12 17v.1" />
                    </svg>
                    <div>
                      Graphs are capped at 100 nodes and 250 edges by default. Narrow the filters to see more detail.
                    </div>
                  </div>
                  <div className="note ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3.5l9.5 16.5h-19z" />
                      <path d="M12 10v4.5M12 17.2v.1" />
                    </svg>
                    <div>
                      Some relationships are possible, not confirmed. Verify before using as case evidence.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
