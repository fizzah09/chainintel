import { DLink } from '../design/DLink';
import { Empty } from '../design/dashParts';
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
                Overview
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
              <DLink href="/design/WalletOverview" className="on">
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
            <div className="kpis">
              <div className="kpi"><div className="l">Current balance</div><div className="v">{p.bal == null ? '—' : `${num(p.bal, 2)} ETH`}</div><div className="s">{'On-chain balance'}</div>
              </div>
              <div className="kpi"><div className="l">Total transactions</div><div className="v">{num(p.tx)}</div><div className="s">{`${num(p.counts.in)} in · ${num(p.counts.out)} out`}</div>
              </div>
              <div className="kpi"><div className="l">Total volume</div><div className="v">{usd(p.vol)}</div><div className="s">{'Loaded transfers'}</div>
              </div>
              <div className="kpi"><div className="l"><i style={{ background: "#EA580C" }} />
                  Unique counterparties</div><div className="v">{num(p.cp)}</div><div className="s">{`${p.cps.filter((c) => c.risk >= CFG.thr[1]).length} flagged`}</div>
              </div>
              <div className="kpi"><div className="l">Last activity</div><div className="v">{p.last ? ago(p.last) : '—'}</div><div className="s">{p.last ? fdt(p.last) + ' UTC' : '—'}</div>
              </div>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Risk summary
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {p.score == null ? <Empty>Risk score appears once the backend analyses this wallet.</Empty> : <Gauge score={p.score} size={230} />}
                  </div>
                  <div style={{ textAlign: "center", margin: "-6px 0 12px" }}>
                    <span className="tier crit">
                      Critical
                    </span>
                  </div>
                  <div className="mu sm" style={{ textAlign: "center", marginBottom: "14px" }}>
                    {`Methodology v${CFG.version} · Based on ${p.evidence.length} evidence items`}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <DLink href="/design/RiskAssessment" className="btn ">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                      View score explanation
                    </DLink>
                  </div>
                </div>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Active alerts
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3.5l9.5 16.5h-19z" />
                      <path d="M12 10v4.5M12 17.2v.1" />
                    </svg>
                    <div style={{ flex: "1" }}>
                      <b>
                        Mixer exposure
                      </b>
                      <div className="mu sm">
                        Direct transfer to a known mixing service
                      </div>
                    </div>
                    <span className="tier crit">
                      Critical
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3.5l9.5 16.5h-19z" />
                      <path d="M12 10v4.5M12 17.2v.1" />
                    </svg>
                    <div style={{ flex: "1" }}>
                      <b>
                        New high-risk counterparty
                      </b>
                      <div className="mu sm">
                        Wallet E first seen 02 Nov
                      </div>
                    </div>
                    <span className="tier high">
                      High
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #EDF1F6" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3.5l9.5 16.5h-19z" />
                      <path d="M12 10v4.5M12 17.2v.1" />
                    </svg>
                    <div style={{ flex: "1" }}>
                      <b>
                        Velocity increase
                      </b>
                      <div className="mu sm">
                        3.1× the 30-day baseline
                      </div>
                    </div>
                    <span className="tier mod">
                      Moderate
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ flex: "2 1 520", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Balance and activity trend
                      </h3>
                      <p>
                        12-month transaction count
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <div className="legend">
                        <span>
                          <i style={{ background: "#1769E0" }} />
                          Transactions per month
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg viewBox="0 0 640 240" width="100%" role="img" aria-label="Trend chart" style={{ display: "block" }}>
                    <defs>
                      <lineargradient id="bt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#1769E0" stopOpacity=".22" />
                        <stop offset="1" stopColor="#1769E0" stopOpacity="0" />
                      </lineargradient>
                    </defs>
                    <line x1="48" x2="626" y1="212.0" y2="212.0" stroke="#E2E8F0" />
                    <text x="40" y="216.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      310
                    </text>
                    <line x1="48" x2="626" y1="162.0" y2="162.0" stroke="#E2E8F0" />
                    <text x="40" y="166.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      422
                    </text>
                    <line x1="48" x2="626" y1="112.0" y2="112.0" stroke="#E2E8F0" />
                    <text x="40" y="116.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      535
                    </text>
                    <line x1="48" x2="626" y1="62.0" y2="62.0" stroke="#E2E8F0" />
                    <text x="40" y="66.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      648
                    </text>
                    <line x1="48" x2="626" y1="12.0" y2="12.0" stroke="#E2E8F0" />
                    <text x="40" y="16.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      760
                    </text>
                    <text x="48.0" y="232" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Dec
                    </text>
                    <text x="153.1" y="232" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Feb
                    </text>
                    <text x="258.2" y="232" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Apr
                    </text>
                    <text x="363.3" y="232" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Jun
                    </text>
                    <text x="468.4" y="232" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Aug
                    </text>
                    <text x="573.5" y="232" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Oct
                    </text>
                    <text x="626.0" y="232" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Nov
                    </text>
                    <path d="M48.0 212.0L100.5 203.1L153.1 207.6L205.6 189.8L258.2 167.6L310.7 180.9L363.3 118.7L415.8 136.4L468.4 74.2L520.9 87.6L573.5 38.7L626.0 12.0L626.0 212L48.0 212Z" fill="url(#bt)" />
                    <path d="M48.0 212.0L100.5 203.1L153.1 207.6L205.6 189.8L258.2 167.6L310.7 180.9L363.3 118.7L415.8 136.4L468.4 74.2L520.9 87.6L573.5 38.7L626.0 12.0" fill="none" stroke="#1769E0" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Risk score history
                      </h3>
                      <p>
                        Score recalculated on each methodology run
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <div className="legend">
                        <span>
                          <i style={{ background: "#DC2626" }} />
                          Risk score
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg viewBox="0 0 640 200" width="100%" role="img" aria-label="Trend chart" style={{ display: "block" }}>
                    <defs>
                      <lineargradient id="rh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#DC2626" stopOpacity=".22" />
                        <stop offset="1" stopColor="#DC2626" stopOpacity="0" />
                      </lineargradient>
                    </defs>
                    <line x1="48" x2="626" y1="172.0" y2="172.0" stroke="#E2E8F0" />
                    <text x="40" y="176.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      0
                    </text>
                    <line x1="48" x2="626" y1="132.0" y2="132.0" stroke="#E2E8F0" />
                    <text x="40" y="136.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      25
                    </text>
                    <line x1="48" x2="626" y1="92.0" y2="92.0" stroke="#E2E8F0" />
                    <text x="40" y="96.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      50
                    </text>
                    <line x1="48" x2="626" y1="52.0" y2="52.0" stroke="#E2E8F0" />
                    <text x="40" y="56.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      75
                    </text>
                    <line x1="48" x2="626" y1="12.0" y2="12.0" stroke="#E2E8F0" />
                    <text x="40" y="16.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      100
                    </text>
                    <text x="48.0" y="192" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Mar
                    </text>
                    <text x="130.6" y="192" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      May
                    </text>
                    <text x="213.1" y="192" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      Jun
                    </text>
                    <text x="295.7" y="192" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      20 Oct
                    </text>
                    <text x="460.9" y="192" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      28 Oct
                    </text>
                    <text x="626.0" y="192" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      02 Nov
                    </text>
                    <path d="M48.0 136.8L130.6 133.6L213.1 122.4L295.7 101.6L378.3 88.8L460.9 74.4L543.4 66.4L626.0 47.2L626.0 172L48.0 172Z" fill="url(#rh)" />
                    <path d="M48.0 136.8L130.6 133.6L213.1 122.4L295.7 101.6L378.3 88.8L460.9 74.4L543.4 66.4L626.0 47.2" fill="none" stroke="#DC2626" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Top counterparties
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th className="">
                            Counterparty
                          </th>
                          <th className="">
                            Label
                          </th>
                          <th className="">
                            Direction
                          </th>
                          <th className="">
                            Volume
                          </th>
                          <th className="">
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
                            Unknown
                          </td>
                          <td className="">
                            Inbound
                          </td>
                          <td className="">
                            $128K
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
                            Mixing service
                          </td>
                          <td className="">
                            Outbound
                          </td>
                          <td className="">
                            $96K
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
                            DEX
                          </td>
                          <td className="">
                            Outbound
                          </td>
                          <td className="">
                            $212K
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
                            Unknown
                          </td>
                          <td className="">
                            Inbound
                          </td>
                          <td className="">
                            $74K
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
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
