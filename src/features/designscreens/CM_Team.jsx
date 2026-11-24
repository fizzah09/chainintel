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
            <DLink href="/compliance">
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
            <DLink href="/compliance/review-queue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5" />
              </svg>
              <span>
                Review Queue
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
          </div>
          <div className="nh">
            Manage
          </div>
          <div className="nav">
            <DLink href="/compliance/team" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12h4l3-8 4 16 3-8h4" />
              </svg>
              <span>
                Team Performance
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
                Team Performance
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
            <div className="ph" style={{ position: "relative" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Team performance
                  </h1>
                </div>
                <p>
                  Open and closed cases and activity for each team member.
                </p>
              </div>
              <div className="acts" />
            </div>
            <div className="kpis">
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#1769E0" }} />
                  Open cases
                </div>
                <div className="v">
                  18
                </div>
                <div className="s">
                  Across 4 people
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#93B4E8" }} />
                  Closed cases (90 d)
                </div>
                <div className="v">
                  63
                </div>
                <div className="s" />
              </div>
              <div className="kpi">
                <div className="l">
                  Evidence added
                </div>
                <div className="v">
                  67
                </div>
                <div className="s">
                  Last 90 days
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  Notes written
                </div>
                <div className="v">
                  83
                </div>
                <div className="s">
                  Last 90 days
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "stretch" }}>
              <div className="card" style={{ flex: "1 1 460px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Open vs closed cases
                    </h3>
                    <p>
                      Per team member, last 90 days
                    </p>
                  </div>
                </div>
                <div className="legend" style={{ marginBottom: "12px" }}>
                  <span>
                    <i style={{ background: "#1769E0" }} />
                    Open
                  </span>
                  <span>
                    <i style={{ background: "#93B4E8" }} />
                    Closed
                  </span>
                </div>
                <div role="img" aria-label="Open and closed cases per team member" style={{ display: "flex", gap: "12px", alignItems: "flex-end", borderBottom: "1px solid var(--ln)", paddingBottom: "4px" }}>
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "170px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          6
                        </b>
                        <i style={{ display: "block", width: "22px", height: "42px", background: "#1769E0", borderRadius: "4px 4px 0 0" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          17
                        </b>
                        <i style={{ display: "block", width: "22px", height: "119px", background: "#93B4E8", borderRadius: "4px 4px 0 0" }} />
                      </div>
                    </div>
                    <span className="sm" style={{ textAlign: "center" }}>
                      Sara Ali
                    </span>
                  </div>
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "170px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          5
                        </b>
                        <i style={{ display: "block", width: "22px", height: "35px", background: "#1769E0", borderRadius: "4px 4px 0 0" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          12
                        </b>
                        <i style={{ display: "block", width: "22px", height: "84px", background: "#93B4E8", borderRadius: "4px 4px 0 0" }} />
                      </div>
                    </div>
                    <span className="sm" style={{ textAlign: "center" }}>
                      Omar Siddiq
                    </span>
                  </div>
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "170px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          4
                        </b>
                        <i style={{ display: "block", width: "22px", height: "28px", background: "#1769E0", borderRadius: "4px 4px 0 0" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          13
                        </b>
                        <i style={{ display: "block", width: "22px", height: "91px", background: "#93B4E8", borderRadius: "4px 4px 0 0" }} />
                      </div>
                    </div>
                    <span className="sm" style={{ textAlign: "center" }}>
                      Maria Chen
                    </span>
                  </div>
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "170px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          3
                        </b>
                        <i style={{ display: "block", width: "22px", height: "21px", background: "#1769E0", borderRadius: "4px 4px 0 0" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <b style={{ fontSize: "12px" }}>
                          21
                        </b>
                        <i style={{ display: "block", width: "22px", height: "148px", background: "#93B4E8", borderRadius: "4px 4px 0 0" }} />
                      </div>
                    </div>
                    <span className="sm" style={{ textAlign: "center" }}>
                      Nadia Hussain
                    </span>
                  </div>
                </div>
              </div>
              <div className="card" style={{ flex: "1 1 380px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Activity by user
                    </h3>
                    <p>
                      Evidence added and notes written, last 90 days
                    </p>
                  </div>
                </div>
                <div className="legend">
                  <span>
                    <i style={{ background: "#0F766E" }} />
                    Evidence
                  </span>
                  <span>
                    <i style={{ background: "#5EB8AE" }} />
                    Notes
                  </span>
                </div>
                <div role="img" aria-label="Evidence and notes per team member">
                  <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 40px", gap: "12px", alignItems: "center", margin: "12px 0" }}>
                    <span className="sm">
                      Sara Ali
                    </span>
                    <div style={{ display: "flex", height: "14px", borderRadius: "5px", overflow: "hidden", background: "#E8EDF4" }}>
                      <i style={{ display: "block", width: "43.6%", background: "#0F766E" }} />
                      <i style={{ display: "block", width: "56.4%", background: "#5EB8AE" }} />
                    </div>
                    <b style={{ textAlign: "right" }}>
                      55
                    </b>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 40px", gap: "12px", alignItems: "center", margin: "12px 0" }}>
                    <span className="sm">
                      Omar Siddiq
                    </span>
                    <div style={{ display: "flex", height: "14px", borderRadius: "5px", overflow: "hidden", background: "#E8EDF4" }}>
                      <i style={{ display: "block", width: "27.3%", background: "#0F766E" }} />
                      <i style={{ display: "block", width: "40.0%", background: "#5EB8AE" }} />
                    </div>
                    <b style={{ textAlign: "right" }}>
                      37
                    </b>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 40px", gap: "12px", alignItems: "center", margin: "12px 0" }}>
                    <span className="sm">
                      Maria Chen
                    </span>
                    <div style={{ display: "flex", height: "14px", borderRadius: "5px", overflow: "hidden", background: "#E8EDF4" }}>
                      <i style={{ display: "block", width: "34.5%", background: "#0F766E" }} />
                      <i style={{ display: "block", width: "32.7%", background: "#5EB8AE" }} />
                    </div>
                    <b style={{ textAlign: "right" }}>
                      37
                    </b>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 40px", gap: "12px", alignItems: "center", margin: "12px 0" }}>
                    <span className="sm">
                      Nadia Hussain
                    </span>
                    <div style={{ display: "flex", height: "14px", borderRadius: "5px", overflow: "hidden", background: "#E8EDF4" }}>
                      <i style={{ display: "block", width: "16.4%", background: "#0F766E" }} />
                      <i style={{ display: "block", width: "21.8%", background: "#5EB8AE" }} />
                    </div>
                    <b style={{ textAlign: "right" }}>
                      21
                    </b>
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
