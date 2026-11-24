import { DLink } from '../design/DLink';

export default function Screen() {
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
            <DLink href="/my/reports" className="on">
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
                Reports
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <b>
                RPT-2026-0214
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
            <div className="ph">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    RPT-2026-0214
                  </h1>
                  <span className="chip ok">
                    Final
                  </span>
                </div>
                <p>
                  Wallet Risk Assessment · generated 02 Nov 2026 15:32 UTC
                </p>
              </div>
              <div className="acts">
                <a href="#" className="btn pri">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />
                  </svg>
                  Download PDF
                </a>
                <a href="#" className="btn ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
                  </svg>
                  Share
                </a>
              </div>
            </div>
            <div style={{ background: "#E8EDF4", borderRadius: "12px", padding: "32px", display: "flex", justifyContent: "center" }}>
              <div style={{ background: "#fff", width: "100%", maxWidth: "780px", padding: "56px 60px", boxShadow: "0 4px 18px rgba(15,23,42,.14)", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
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
                  <span className="mu sm">
                    Confidential · Example Bank
                  </span>
                </div>
                <h2 style={{ fontSize: "24px", marginTop: "10px" }}>
                  Wallet Risk Assessment
                </h2>
                <div className="mu mono">
                  0x7a3f1c5e8b2d4096a1f7c3e5d8b2a49e0c619B21
                </div>
                <div style={{ display: "flex", gap: "30px", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <svg viewBox="0 0 150 150" width="150" height="150" role="img" aria-label="Risk score 78 out of 100, Critical" style={{ display: "block", maxWidth: "100%", height: "auto" }}>
                      <path d="M25.74 122.24A68.25 68.25 0 0 1 11.41 50.21" stroke="#16A34A" strokeWidth="2.7" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M12.51 47.57A68.25 68.25 0 0 1 73.57 6.76" stroke="#F59E0B" strokeWidth="2.7" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M76.43 6.76A68.25 68.25 0 0 1 137.49 47.57" stroke="#EA580C" strokeWidth="2.7" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M138.59 50.21A68.25 68.25 0 0 1 124.26 122.24" stroke="#DC2626" strokeWidth="2.7" fill="none" strokeLinecap="round" opacity=".7" />
                      <path d="M36.82 113.18A54.0 54.0 0 1 1 113.18 113.18" stroke="#E8EDF4" strokeWidth="11.2" fill="none" strokeLinecap="round" />
                      <path d="M36.82 113.18A54.0 54.0 0 1 1 127.30 61.57" stroke="#DC2626" strokeWidth="11.2" fill="none" strokeLinecap="round" />
                      <circle cx="127.3" cy="61.6" r="3.9" fill="#fff" stroke="#DC2626" strokeWidth="3" />
                      <text x="75.0" y="81.0" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="39" fill="#0F172A" letterSpacing="-2">
                        78
                      </text>
                      <text x="75.0" y="99" textAnchor="middle" fontSize="9" fill="#5B6B82" fontFamily="Inter,sans-serif">
                        out of 100
                      </text>
                    </svg>
                  </div>
                  <div style={{ flex: "1", minWidth: "220px" }}>
                    <h4>
                      Executive summary
                    </h4>
                    <p className="mu" style={{ margin: "6px 0 0" }}>
                      The wallet scores 78 (Critical) driven by a direct mixer transfer and exposure to nine flagged counterparties.
                    </p>
                  </div>
                </div>
                <h4>
                  Contributing evidence
                </h4>
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
                          Points
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="">
                          EVD-000184
                        </td>
                        <td className="">
                          Direct transfer to a mixing service
                        </td>
                        <td className="">
                          +18.0
                        </td>
                      </tr>
                      <tr>
                        <td className="">
                          EVD-000185
                        </td>
                        <td className="">
                          Exposure to 9 flagged counterparties
                        </td>
                        <td className="">
                          +13.5
                        </td>
                      </tr>
                      <tr>
                        <td className="">
                          EVD-000186
                        </td>
                        <td className="">
                          Velocity 3.1× 30-day baseline
                        </td>
                        <td className="">
                          +20.0
                        </td>
                      </tr>
                      <tr>
                        <td className="">
                          EVD-000187
                        </td>
                        <td className="">
                          Rapid pass-through of inbound funds
                        </td>
                        <td className="">
                          +16.0
                        </td>
                      </tr>
                      <tr>
                        <td className="">
                          EVD-000188
                        </td>
                        <td className="">
                          Attribute: no ENS, fresh funding source
                        </td>
                        <td className="">
                          +6.0
                        </td>
                      </tr>
                      <tr>
                        <td className="">
                          EVD-000189
                        </td>
                        <td className="">
                          Other: repeated micro-transfers
                        </td>
                        <td className="">
                          +4.5
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h4>
                  Cases involved
                </h4>
                <p className="mu sm" style={{ margin: "0" }}>
                  Cases that include this wallet. 2 of 3 are still open.
                </p>
                <div className="tbl">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Case ID
                        </th>
                        <th>
                          Title
                        </th>
                        <th>
                          Case status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <DLink href="/design/CaseDetails" className="mono">
                            CASE-2026-00128
                          </DLink>
                        </td>
                        <td>
                          Suspected layering via mixer
                        </td>
                        <td>
                          <span className="chip pur">
                            Open · Under review
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <DLink href="/design/CaseDetails" className="mono">
                            CASE-2026-00127
                          </DLink>
                        </td>
                        <td>
                          Sanctioned counterparty exposure
                        </td>
                        <td>
                          <span className="chip blue">
                            Open · Analysis
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <DLink href="/design/CaseDetails" className="mono">
                            CASE-2026-00102
                          </DLink>
                        </td>
                        <td>
                          Exchange deposit review
                        </td>
                        <td>
                          <span className="chip gray">
                            Closed
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mu sm" style={{ margin: "0" }}>
                  Risk scores are decision-support signals, not legal conclusions. Source labels may be incomplete.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
