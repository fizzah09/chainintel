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
              Platform
            </span>
            <b>
              Chain Intel Platform
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </b>
          </div>
          <div className="nav">
            <DLink href="/ops">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              <span>
                Operations Dashboard
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
            <DLink href="/reports/new">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>
              <span>
                Generate report
              </span>
            </DLink>
          </div>
          <div className="nh">
            Operations
          </div>
          <div className="nav">
            <DLink href="/ops/tenants">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="3" width="14" height="18" rx="1.5" />
                <path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4" />
              </svg>
              <span>
                Tenants
              </span>
            </DLink>
            <DLink href="/platform/users">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7" />
              </svg>
              <span>
                Platform Users
              </span>
            </DLink>
            <DLink href="/ops/network">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
              </svg>
              <span>
                Network Monitoring
              </span>
            </DLink>
            <DLink href="/ops/providers">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <ellipse cx="12" cy="6" rx="8" ry="3" />
                <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
              </svg>
              <span>
                Provider Monitoring
              </span>
            </DLink>
            <DLink href="/complaints" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
                <path d="M10 9v6" />
              </svg>
              <span>
                Complaints
              </span>
            </DLink>
            <DLink href="/complaints/new">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/></svg>
              <span>
                Raise a complaint
              </span>
            </DLink>
          </div>
          <div className="sfoot">
            <div className="nav">
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
                Complaints
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
              Chain Intel Platform
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
                HR
              </div>
              <div>
                <b>
                  Hina Raza
                </b>
                <span>
                  Platform Admin
                </span>
              </div>
            </DLink>
          </header>
          <main className="content">
            <div className="ph">
              <div>
                <h1>
                  Complaints
                </h1>
                <p>
                  Problems raised by bank users, such as a page or feature not working. The Platform Admin reviews and resolves them.
                </p>
              </div>
              <div className="acts" />
            </div>
            <div className="kpis">
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#1769E0" }} />
                  Open
                </div>
                <div className="v">
                  6
                </div>
                <div className="s">
                  2 high priority
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#F59E0B" }} />
                  In progress
                </div>
                <div className="v">
                  3
                </div>
                <div className="s" />
              </div>
              <div className="kpi">
                <div className="l">
                  Avg first response
                </div>
                <div className="v">
                  1.4 h
                </div>
                <div className="s">
                  Last 30 days
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#16A34A" }} />
                  Resolved (30 d)
                </div>
                <div className="v">
                  27
                </div>
                <div className="s" />
              </div>
            </div>
            <div className="card">
              <div className="tools">
                <label className="s">
                  <span style={{ position: "absolute", left: "-9999px" }}>
                    Search complaints
                  </span>
                  <input placeholder="Search complaints" />
                </label>
                <span className="sel">
                  <span>
                    Status
                  </span>
                  All
                </span>
                <span className="sel">
                  <span>
                    Priority
                  </span>
                  All
                </span>
                <span className="sel">
                  <span>
                    Tenant
                  </span>
                  All
                </span>
              </div>
              <div className="tbl">
                <table>
                  <thead>
                    <tr>
                      <th>
                        ID
                      </th>
                      <th>
                        Raised by
                      </th>
                      <th>
                        Subject
                      </th>
                      <th>
                        Priority
                      </th>
                      <th>
                        Status
                      </th>
                      <th>
                        Handled by
                      </th>
                      <th>
                        Updated
                      </th>
                      <th className="r" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="mono">
                        CMP-1042
                      </td>
                      <td>
                        <b>
                          Sara Ali
                        </b>
                        <div className="mu sm">
                          Example Bank · Investigator
                        </div>
                      </td>
                      <td>
                        Etherscan data not loading for one wallet
                      </td>
                      <td>
                        <span className="chip bad">
                          High
                        </span>
                      </td>
                      <td>
                        <span className="chip blue">
                          Open
                        </span>
                      </td>
                      <td>
                        Hina Raza
                      </td>
                      <td>
                        Today 10:05
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Resolve
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="mono">
                        CMP-1041
                      </td>
                      <td>
                        <b>
                          Bilal Qureshi
                        </b>
                        <div className="mu sm">
                          Northern Savings · Bank Admin
                        </div>
                      </td>
                      <td>
                        Cannot invite more users
                      </td>
                      <td>
                        <span className="chip warn">
                          Medium
                        </span>
                      </td>
                      <td>
                        <span className="chip warn">
                          In progress
                        </span>
                      </td>
                      <td>
                        Hina Raza
                      </td>
                      <td>
                        Yesterday
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Resolve
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="mono">
                        CMP-1039
                      </td>
                      <td>
                        <b>
                          Nadia Hussain
                        </b>
                        <div className="mu sm">
                          Harbour Credit · Reviewer
                        </div>
                      </td>
                      <td>
                        Invite link expired before sign-up
                      </td>
                      <td>
                        <span className="chip warn">
                          Medium
                        </span>
                      </td>
                      <td>
                        <span className="chip gray">
                          Waiting on bank
                        </span>
                      </td>
                      <td>
                        Hina Raza
                      </td>
                      <td>
                        18 Nov
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Resolve
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="mono">
                        CMP-1035
                      </td>
                      <td>
                        <b>
                          Ahmed Khan
                        </b>
                        <div className="mu sm">
                          Example Bank · Compliance Manager
                        </div>
                      </td>
                      <td>
                        Report PDF missing case graph
                      </td>
                      <td>
                        <span className="chip gray">
                          Low
                        </span>
                      </td>
                      <td>
                        <span className="chip ok">
                          Resolved
                        </span>
                      </td>
                      <td>
                        Hina Raza
                      </td>
                      <td>
                        15 Nov
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Resolve
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
