import { DLink } from '../design/DLink';
import { useStore } from '../../mocks/store';

export default function Screen() {
  const s = useStore(); const N = (xs, f) => (xs || []).filter(f).length;
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
                <svg width="166" height="109" viewBox="0 0 166 109" preserveAspectRatio="none" style={{ position: "absolute", left: "3px", top: "1px", width: "166px", height: "109px", overflow: "visible", fill: "none", stroke: "#8a8378", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}>
                  <path d="M94.2 8 C76.8 8 46.1 1.6 31.1 9.8 C26.1 12.4 23.9 15.9 20 20 C2.5 38.8 0 47.3 0 73.1 C0 83.5 0.2 98 11 104.2 C23.1 111.2 45.9 109.2 59.4 109.2 C98.3 109.2 159 116.2 166.3 64.1 C172.3 21.3 112.2 -13.6 79.1 4" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div className="card " style={{ flex: "1 1 440px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Activity by week
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <svg viewBox="0 0 560 220" width="100%" role="img" aria-label="Bar chart" style={{ display: "block" }}>
                  <line x1="40" x2="550" y1="192.0" y2="192.0" stroke="#E2E8F0" />
                  <text x="32" y="196.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    0
                  </text>
                  <line x1="40" x2="550" y1="147.0" y2="147.0" stroke="#E2E8F0" />
                  <text x="32" y="151.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    152
                  </text>
                  <line x1="40" x2="550" y1="102.0" y2="102.0" stroke="#E2E8F0" />
                  <text x="32" y="106.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    305
                  </text>
                  <line x1="40" x2="550" y1="57.0" y2="57.0" stroke="#E2E8F0" />
                  <text x="32" y="61.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    457
                  </text>
                  <line x1="40" x2="550" y1="12.0" y2="12.0" stroke="#E2E8F0" />
                  <text x="32" y="16.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    610
                  </text>
                  <rect x="56.0" y="100.4" width="40.8" height="91.6" rx="4" fill="#1769E0" />
                  <text x="76.4" y="211" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    W40
                  </text>
                  <rect x="128.9" y="68.0" width="40.8" height="124.0" rx="4" fill="#1769E0" />
                  <text x="149.3" y="211" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    W41
                  </text>
                  <rect x="201.7" y="79.8" width="40.8" height="112.2" rx="4" fill="#1769E0" />
                  <text x="222.1" y="211" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    W42
                  </text>
                  <rect x="274.6" y="41.4" width="40.8" height="150.6" rx="4" fill="#1769E0" />
                  <text x="295.0" y="211" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    W43
                  </text>
                  <rect x="347.5" y="56.2" width="40.8" height="135.8" rx="4" fill="#1769E0" />
                  <text x="367.9" y="211" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    W44
                  </text>
                  <rect x="420.3" y="35.5" width="40.8" height="156.5" rx="4" fill="#1769E0" />
                  <text x="440.7" y="211" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    W45
                  </text>
                  <rect x="493.2" y="47.3" width="40.8" height="144.7" rx="4" fill="#1769E0" />
                  <text x="513.6" y="211" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    W46
                  </text>
                </svg>
              </div>
              <div className="card " style={{ flex: "1 1 360px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Integrity
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div className="note ok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
                  </svg>
                  <div>
                    <b>
                      Audit log integrity verified
                    </b>
                    <div>
                      Last check 02 Nov 2026 15:00 UTC · 48,210 entries · no gaps
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "14px" }}>
                  <a href="#" className="btn pri">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
                    </svg>
                    Run verification
                  </a>
                </div>
              </div>
            </div>
            <svg width="140" height="126" viewBox="0 0 140 126" preserveAspectRatio="none" style={{ position: "absolute", left: "897px", top: "88px", width: "140px", height: "126px", overflow: "visible", fill: "none", stroke: "#8a8378", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M52 0 C43.6 0 30.1 -2.2 22.5 3.5 C-4.3 23.5 -10.8 86.2 13.7 110 C30.9 126.6 56.5 127.2 79 126 C93.3 125.3 110.5 120.4 122 111.5 C145.6 93.2 147.3 52.5 124.5 32.7 C117.8 26.9 109.7 25.1 102 21 C96.4 18 90.7 13.9 85 11.5 C65.3 3.2 60.2 6.9 43 4 C37.7 3.1 33 1.2 27 1" vectorEffect="non-scaling-stroke" />
            </svg>
          </main>
        </div>
      </div>
    </>
  );
}
