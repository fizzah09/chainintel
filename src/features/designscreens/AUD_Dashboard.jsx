import { useState } from 'react';
import { DLink } from '../design/DLink';
import { Bars, Empty, fmtDate, shortAddr } from '../design/dashParts';
import { verifyChain } from '../../mocks/store';
import { ROLE_NAMES } from '../../mocks/seed';
import { useStore } from '../../mocks/store';

export default function Screen() {
  const s = useStore(); const [vr, setVr] = useState(null); const N = (xs, f) => (xs || []).filter(f).length;
const me = s.session.name; const isOpen = (c) => c.status !== 'Closed';
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i)); return d; });
  const weekBars = days.map((d) => ({ label: d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }), value: N(s.audit, a => { const t = new Date(a.at); return t.toDateString() === d.toDateString(); }) }));
  const integrity = verifyChain(s.audit);
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
            <DLink href="/audit" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              <span>
                Audit Dashboard
              </span>
            </DLink>
            <DLink href="/wallets">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
                <path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z" />
                <circle cx="16" cy="13.5" r="1.2" />
              </svg>
              <span>
                Wallet Monitoring
              </span>
            </DLink>
          </div>
          <div className="nh">
            Records
          </div>
          <div className="nav">
            <DLink href="/audit/cases">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
              </svg>
              <span>
                Case Records
              </span>
            </DLink>
            <DLink href="/audit/evidence">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2.5h7.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
              </svg>
              <span>
                Evidence Records
              </span>
            </DLink>
            <DLink href="/reports">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h8l5 5v13H6z" />
                <path d="M14 3v5h5M9 13h7M9 17h7" />
              </svg>
              <span>
                Reports
              </span>
            </DLink>
            <DLink href="/design/CaseAuditTrail">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" />
              </svg>
              <span>
                Audit Logs
              </span>
            </DLink>
            <DLink href="/audit/review-history">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
              </svg>
              <span>
                Review History
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
              <b>
                Audit Dashboard
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
                IS
              </div>
              <div>
                <b>
                  Imran Sheikh
                </b>
                <span>
                  Auditor
                </span>
              </div>
            </DLink>
          </header>
          <main className="content" style={{ position: "relative" }}>
            <div className="ph">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Audit dashboard
                  </h1>
                </div>
                <p>
                  Read-only overview of compliance activity and record integrity.
                </p>
              </div>
              <div className="acts" />
            </div>
            <div className="kpis">
              <div className="kpi"><div className="l">
                  Cases in period
                </div><div className="v">{s.cases.length}</div><div className="s">{'all cases'}</div>
              </div>
              <div className="kpi" style={{ position: "relative" }}><div className="l">
                  <i style={{ background: "#16A34A" }} />
                  Audit events
                </div><div className="v">{s.audit.length}</div><div className="s">{'all events'}</div>
              </div>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div className="card" style={{ flex: "1 1 440px" }}>
                <div className="ct-h"><div><h3>Activity by week</h3><p>Audit events per day, last 7 days</p></div></div>
                {weekBars.every((b) => b.value === 0) ? <Empty>No audit events in the last 7 days.</Empty> : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180, padding: "8px 4px 0", borderBottom: "1px solid #EDF1F6" }}>
                    {weekBars.map((b) => { const max = Math.max(1, ...weekBars.map((x) => x.value)); return (
                      <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                        <b style={{ fontSize: 12, marginBottom: 4 }}>{b.value}</b>
                        <div style={{ width: "100%", maxWidth: 46, height: `${(b.value / max) * 130}px`, minHeight: 2, background: "#1769E0", borderRadius: "4px 4px 0 0" }} />
                        <span className="mu" style={{ fontSize: 11, marginTop: 6, whiteSpace: "nowrap" }}>{b.label.split(" ").slice(0, 2).join(" ")}</span>
                      </div>); })}
                  </div>)}
              </div>
              <div className="card" style={{ flex: "1 1 360px" }}>
                <div className="ct-h"><div><h3>Integrity</h3></div></div>
                <div>{vr ? (vr.ok ? `Audit chain verified (${vr.n} entries).` : `Chain broken at ${vr.at}.`) : (integrity.ok ? `Audit chain verified (${integrity.n} entries).` : `Chain broken at ${integrity.at}.`)}</div>
                <div style={{ marginTop: 12 }}><button className="btn pri" onClick={() => setVr(verifyChain(s.audit))}>Run verification</button></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
