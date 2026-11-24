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
            <DLink href="/dashboard" className="on">
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
              <b>
                Investigator Dashboard
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
            <div className="ph">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Investigator dashboard
                  </h1>
                </div>
                <p>
                  Your assigned cases, tasks and wallets that need attention today.
                </p>
              </div>
              <div className="acts">
                <DLink href="/cases/new" className="btn pri">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create case
                </DLink>
              </div>
            </div>
            <div className="kpis" style={{ position: "relative" }}>
              <div className="kpi">
                <div className="l">
                  My open cases
                </div>
                <div className="v">
                  6
                </div>
                <div className="s">
                  2 due this week
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#DC2626" }} />
                  Open tasks
                </div>
                <div className="v">
                  9
                </div>
                <div className="s">
                  1 overdue
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#EA580C" }} />
                  Watchlist alerts
                </div>
                <div className="v">
                  5
                </div>
                <div className="s">
                  2 critical
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div style={{ flex: "2 1 560", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Active cases
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <DLink href="/cases" className="btn sm">
                        View all
                      </DLink>
                    </div>
                  </div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th className="">
                            Case ID
                          </th>
                          <th className="">
                            Title
                          </th>
                          <th className="">
                            Status
                          </th>
                          <th className="">
                            Priority
                          </th>
                          <th className="">
                            Assignee
                          </th>
                          <th className="">
                            Opened
                          </th>
                          <th className="">
                            Due
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="">
                            <DLink href="/design/CaseDetails" className="mono" style={{ color: "var(--pri)", fontWeight: "600" }}>
                              CASE-2026-00128
                            </DLink>
                          </td>
                          <td className="">
                            Suspected layering via mixer
                          </td>
                          <td className="">
                            <span className="chip pur">
                              Under Review
                            </span>
                          </td>
                          <td className="">
                            <span className="chip bad">
                              Critical
                            </span>
                          </td>
                          <td className="">
                            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                              <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                                SA
                              </span>
                              <div style={{ lineHeight: "1.25" }}>
                                <div style={{ fontWeight: "550" }}>
                                  Sara Ali
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="">
                            02 Nov 2026
                          </td>
                          <td className="">
                            09 Nov 2026
                          </td>
                        </tr>
                        <tr>
                          <td className="">
                            <DLink href="/design/CaseDetails" className="mono" style={{ color: "var(--pri)", fontWeight: "600" }}>
                              CASE-2026-00127
                            </DLink>
                          </td>
                          <td className="">
                            Sanctioned counterparty exposure
                          </td>
                          <td className="">
                            <span className="chip blue">
                              Analysis
                            </span>
                          </td>
                          <td className="">
                            <span className="chip warn">
                              High
                            </span>
                          </td>
                          <td className="">
                            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                              <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                                SA
                              </span>
                              <div style={{ lineHeight: "1.25" }}>
                                <div style={{ fontWeight: "550" }}>
                                  Sara Ali
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="">
                            01 Nov 2026
                          </td>
                          <td className="">
                            08 Nov 2026
                          </td>
                        </tr>
                        <tr>
                          <td className="">
                            <DLink href="/design/CaseDetails" className="mono" style={{ color: "var(--pri)", fontWeight: "600" }}>
                              CASE-2026-00124
                            </DLink>
                          </td>
                          <td className="">
                            Rapid pass-through of customer funds
                          </td>
                          <td className="">
                            <span className="chip blue">
                              Evidence Collection
                            </span>
                          </td>
                          <td className="">
                            <span className="chip warn">
                              High
                            </span>
                          </td>
                          <td className="">
                            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                              <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                                OS
                              </span>
                              <div style={{ lineHeight: "1.25" }}>
                                <div style={{ fontWeight: "550" }}>
                                  Omar Siddiq
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="">
                            30 Oct 2026
                          </td>
                          <td className="">
                            07 Nov 2026
                          </td>
                        </tr>
                        <tr>
                          <td className="">
                            <DLink href="/design/CaseDetails" className="mono" style={{ color: "var(--pri)", fontWeight: "600" }}>
                              CASE-2026-00121
                            </DLink>
                          </td>
                          <td className="">
                            Unexplained inbound volume spike
                          </td>
                          <td className="">
                            <span className="chip blue">
                              Assigned
                            </span>
                          </td>
                          <td className="">
                            <span className="chip blue">
                              Medium
                            </span>
                          </td>
                          <td className="">
                            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                              <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                                MC
                              </span>
                              <div style={{ lineHeight: "1.25" }}>
                                <div style={{ fontWeight: "550" }}>
                                  Maria Chen
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="">
                            29 Oct 2026
                          </td>
                          <td className="">
                            12 Nov 2026
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        My tasks due
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th className="">
                            Task
                          </th>
                          <th className="">
                            Case
                          </th>
                          <th className="">
                            Due
                          </th>
                          <th className="">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="">
                            Draft case report
                          </td>
                          <td className="">
                            CASE-2026-00128
                          </td>
                          <td className="">
                            09 Nov
                          </td>
                          <td className="">
                            <span className="chip bad">
                              Overdue
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="">
                            Verify mixer label
                          </td>
                          <td className="">
                            CASE-2026-00128
                          </td>
                          <td className="">
                            07 Nov
                          </td>
                          <td className="">
                            <span className="chip blue">
                              In Progress
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="">
                            Screen related wallets
                          </td>
                          <td className="">
                            CASE-2026-00127
                          </td>
                          <td className="">
                            08 Nov
                          </td>
                          <td className="">
                            <span className="chip warn">
                              Waiting
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div style={{ flex: "1 1 320", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Wallets by risk tier
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                    <svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Distribution chart" style={{ display: "block", maxWidth: "100%", height: "auto" }}>
                      <circle cx="80.0" cy="80.0" r="59.2" fill="none" stroke="#16A34A" strokeWidth="21" strokeDasharray="139.37 232.59" strokeDashoffset="0.00" transform="rotate(-90 80.0 80.0)" />
                      <circle cx="80.0" cy="80.0" r="59.2" fill="none" stroke="#F59E0B" strokeWidth="21" strokeDasharray="105.77 266.20" strokeDashoffset="-141.37" transform="rotate(-90 80.0 80.0)" />
                      <circle cx="80.0" cy="80.0" r="59.2" fill="none" stroke="#EA580C" strokeWidth="21" strokeDasharray="76.22 295.75" strokeDashoffset="-249.14" transform="rotate(-90 80.0 80.0)" />
                      <circle cx="80.0" cy="80.0" r="59.2" fill="none" stroke="#DC2626" strokeWidth="21" strokeDasharray="42.61 329.35" strokeDashoffset="-327.35" transform="rotate(-90 80.0 80.0)" />
                      <text x="80.0" y="83.0" textAnchor="middle" fontWeight="700" fontSize="24" fill="#0F172A" fontFamily="Inter,sans-serif">
                        1,284
                      </text>
                      <text x="80.0" y="96" textAnchor="middle" fontSize="10" fill="#5B6B82" fontFamily="Inter,sans-serif">
                        wallets
                      </text>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px", flex: "1", minWidth: "150px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#16A34A" }} />
                        <span style={{ flex: "1" }}>
                          Low
                        </span>
                        <b>
                          488
                        </b>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#F59E0B" }} />
                        <span style={{ flex: "1" }}>
                          Moderate
                        </span>
                        <b>
                          372
                        </b>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#EA580C" }} />
                        <span style={{ flex: "1" }}>
                          High
                        </span>
                        <b>
                          270
                        </b>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <i style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#DC2626" }} />
                        <span style={{ flex: "1" }}>
                          Critical
                        </span>
                        <b>
                          154
                        </b>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card " style={{  }}>
                  <div className="ct-h">
                    <div>
                      <h3>
                        Recent alerts
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                  </div>
                  <div style={{ display: "flex", gap: "10px", padding: "9px 0", borderBottom: "1px solid #EDF1F6", alignItems: "center" }}>
                    <span className="mono" style={{ flex: "1" }}>
                      0x7a3f…9B21
                    </span>
                    <span className="tier crit">
                      Critical
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", padding: "9px 0", borderBottom: "1px solid #EDF1F6", alignItems: "center" }}>
                    <span className="mono" style={{ flex: "1" }}>
                      0xE5f7…90b8
                    </span>
                    <span className="tier crit">
                      Critical
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", padding: "9px 0", borderBottom: "1px solid #EDF1F6", alignItems: "center" }}>
                    <span className="mono" style={{ flex: "1" }}>
                      0x98b1…2c70
                    </span>
                    <span className="tier high">
                      High
                    </span>
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
