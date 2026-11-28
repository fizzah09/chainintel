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
            <DLink href="/admin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
              <span>
                Bank Dashboard
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
            <DLink href="/cases">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18"/></svg>
              <span>
                Cases
              </span>
            </DLink>
          </div>
          <div className="nh">
            Operations
          </div>
          <div className="nav">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>
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
            <DLink href="/admin/users" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7"/></svg>
              <span>
                Users & Roles
              </span>
            </DLink>
            <DLink href="/admin/audit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>
              <span>
                Audit Logs
              </span>
            </DLink>
            <DLink href="/complaints/new">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/></svg>
              <span>
                Raise a complaint
              </span>
            </DLink>
          </div>
          <div className="nh">
            Administration
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
                Users
                &
                Roles
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
                BQ
              </div>
              <div>
                <b>
                  Bilal Qureshi
                </b>
                <span>
                  Bank Admin
                </span>
              </div>
            </DLink>
          </header>
          <main className="content">
            <div className="ph">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Users and roles
                  </h1>
                </div>
                <p>
                  Invite users, assign roles and manage access for your bank.
                </p>
              </div>
              <div className="acts">
                <DLink href="/admin/users/permissions" className="btn ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  Permission matrix
                </DLink>
                <DLink href="/admin/users/invite" className="btn pri">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Invite user
                </DLink>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div className="tools">
                <label className="s">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4.5 4.5" />
                  </svg>
                  <input placeholder="Search users" />
                </label>
                <span className="sel">
                  <span>
                    Role
                  </span>
                  All
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Status
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
                        User
                      </th>
                      <th className="">
                        Role
                      </th>
                      <th className="r">
                        Open cases
                      </th>
                      <th className="">
                        Status
                      </th>
                      <th className="">
                        Last active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            SA
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Sara Ali
                            </div>
                            <div className="mu" style={{ fontSize: "11.5px" }}>
                              sara.ali@examplebank.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        Investigator
                      </td>
                      <td className="r">
                        7
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Active
                        </span>
                      </td>
                      <td className="">
                        2 h ago
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
                            </div>
                            <div className="mu" style={{ fontSize: "11.5px" }}>
                              ahmed.khan@examplebank.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        Compliance Manager
                      </td>
                      <td className="r">
                        3
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Active
                        </span>
                      </td>
                      <td className="">
                        10 min ago
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            NH
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Nadia Hussain
                            </div>
                            <div className="mu" style={{ fontSize: "11.5px" }}>
                              nadia.h@examplebank.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        Reviewer
                      </td>
                      <td className="r">
                        5
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Active
                        </span>
                      </td>
                      <td className="">
                        Yesterday
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            IS
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Imran Sheikh
                            </div>
                            <div className="mu" style={{ fontSize: "11.5px" }}>
                              imran.s@examplebank.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        Auditor
                      </td>
                      <td className="r">
                        0
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Active
                        </span>
                      </td>
                      <td className="">
                        3 d ago
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            NH
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              New Hire
                            </div>
                            <div className="mu" style={{ fontSize: "11.5px" }}>
                              new.hire@examplebank.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        Investigator
                      </td>
                      <td className="r">
                        0
                      </td>
                      <td className="">
                        <span className="chip warn">
                          Invited
                        </span>
                      </td>
                      <td className="">
                        —
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            OU
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Old User
                            </div>
                            <div className="mu" style={{ fontSize: "11.5px" }}>
                              old.user@examplebank.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        Reviewer
                      </td>
                      <td className="r">
                        0
                      </td>
                      <td className="">
                        <span className="chip gray">
                          Disabled
                        </span>
                      </td>
                      <td className="">
                        90 d ago
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
