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
            <DLink href="/compliance" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              <span>
                Compliance Dashboard
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
          </div>
          <div className="nh">
            Oversight
          </div>
          <div className="nav">
            <DLink href="/cases">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
              </svg>
              <span>
                Cases
              </span>
            </DLink>
            <DLink href="/compliance/assignment">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7" />
              </svg>
              <span>
                Case Assignment
              </span>
            </DLink>
            <DLink href="/watchlists">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12V4h8l10 10-8 8z" />
                <circle cx="7.5" cy="8.5" r="1.3" />
              </svg>
              <span>
                Watchlists
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
            <DLink href="/reports">
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
          <div className="nh">
            Manage
          </div>
          <div className="nav">
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
                Compliance Dashboard
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
                AK
              </div>
              <div>
                <b>
                  Ahmed Khan
                </b>
                <span>
                  Compliance Manager
                </span>
              </div>
            </DLink>
          </header>
          <main className="content" style={{ position: "relative" }}>
            <div className="ph">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Compliance dashboard
                  </h1>
                </div>
                <p>
                  Portfolio view of cases, alerts, workload and risk exposure.
                </p>
              </div>
              <div className="acts">
                <DLink href="/reports/new" className="btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 3h8l5 5v13H6z" />
                    <path d="M14 3v5h5M9 13h7M9 17h7" />
                  </svg>
                  Generate report
                </DLink>
              </div>
            </div>
            <div className="kpis" style={{ position: "relative" }}>
              <div className="kpi"><div className="l">
                  Total wallets
                </div><div className="v">{s.recent.length}</div><div className="s">{'in your recent list'}</div>
              </div>
              <div className="kpi"><div className="l">
                  Open investigations
                </div><div className="v">{N(s.cases, c => c.status !== 'Closed')}</div><div className="s">{'not closed'}</div>
              </div>
              <div className="kpi"><div className="l">
                  <i style={{ background: "#F59E0B" }} />
                  Under review
                </div><div className="v">{N(s.cases, c => c.status === 'Under Review')}</div><div className="s">{'awaiting decision'}</div>
              </div>
              <div className="kpi"><div className="l">
                  Closed (90 d)
                </div><div className="v">{N(s.cases, c => c.status === 'Closed' && Date.now() - new Date(c.opened) < 90 * 864e5)}</div><div className="s">{'last 90 days'}</div>
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
                            Assigned By
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
              </div>
              <div style={{ flex: "1 1 320", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="card">
                  <div className="ct-h">
                    <div>
                      <h3>
                        Fund flow in USDT
                      </h3>
                      <p>
                        Inflow vs outflow of monitored wallets, last 6 weeks (thousand USDT)
                      </p>
                    </div>
                  </div>
                  <div className="legend" style={{ marginBottom: "10px" }}>
                    <span>
                      <i style={{ background: "#1769E0" }} />
                      Inflow · 440k
                    </span>
                    <span>
                      <i style={{ background: "#EA580C" }} />
                      Outflow · 356k
                    </span>
                  </div>
                  <div role="img" aria-label="Weekly inflow and outflow in USDT" style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "1" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
                        <i style={{ display: "block", width: "12px", height: "74px", background: "#1769E0", borderRadius: "3px" }} />
                        <i style={{ display: "block", width: "12px", height: "57px", background: "#EA580C", borderRadius: "3px" }} />
                      </div>
                      <span className="mu sm">
                        W1
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "1" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
                        <i style={{ display: "block", width: "12px", height: "90px", background: "#1769E0", borderRadius: "3px" }} />
                        <i style={{ display: "block", width: "12px", height: "61px", background: "#EA580C", borderRadius: "3px" }} />
                      </div>
                      <span className="mu sm">
                        W2
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "1" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
                        <i style={{ display: "block", width: "12px", height: "69px", background: "#1769E0", borderRadius: "3px" }} />
                        <i style={{ display: "block", width: "12px", height: "79px", background: "#EA580C", borderRadius: "3px" }} />
                      </div>
                      <span className="mu sm">
                        W3
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "1" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
                        <i style={{ display: "block", width: "12px", height: "109px", background: "#1769E0", borderRadius: "3px" }} />
                        <i style={{ display: "block", width: "12px", height: "68px", background: "#EA580C", borderRadius: "3px" }} />
                      </div>
                      <span className="mu sm">
                        W4
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "1" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
                        <i style={{ display: "block", width: "12px", height: "84px", background: "#1769E0", borderRadius: "3px" }} />
                        <i style={{ display: "block", width: "12px", height: "87px", background: "#EA580C", borderRadius: "3px" }} />
                      </div>
                      <span className="mu sm">
                        W5
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "1" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
                        <i style={{ display: "block", width: "12px", height: "100px", background: "#1769E0", borderRadius: "3px" }} />
                        <i style={{ display: "block", width: "12px", height: "73px", background: "#EA580C", borderRadius: "3px" }} />
                      </div>
                      <span className="mu sm">
                        W6
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card " style={{ width: "355px", height: "232px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Workload by investigator
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Sara Ali
                  </span>
                  <div className="bar">
                    <i style={{ width: "100.0%", background: "#1769E0" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    6
                  </b>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Omar Siddiq
                  </span>
                  <div className="bar">
                    <i style={{ width: "83.3%", background: "#1769E0" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    5
                  </b>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Maria Chen
                  </span>
                  <div className="bar">
                    <i style={{ width: "66.7%", background: "#1769E0" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    4
                  </b>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "132px 1fr 44px", gap: "12px", alignItems: "center", margin: "9px 0" }}>
                  <span className="mu">
                    Unassigned
                  </span>
                  <div className="bar">
                    <i style={{ width: "50.0%", background: "#94A3B8" }} />
                  </div>
                  <b style={{ textAlign: "right" }}>
                    3
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
