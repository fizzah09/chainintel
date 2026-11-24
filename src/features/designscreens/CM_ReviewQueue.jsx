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
            <DLink href="/compliance/review-queue" className="on">
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
            <DLink href="/compliance/team">
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
                Review Queue
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
          <main className="content" style={{ width: "1188px", height: "513px", boxSizing: "border-box", maxWidth: "none", maxHeight: "none", flexGrow: "0", flexShrink: "0", flexBasis: "auto", position: "relative" }}>
            <div className="ph" style={{ position: "absolute", left: "32px", top: "26px", width: "1124px", height: "57px", boxSizing: "border-box", maxWidth: "none", maxHeight: "none", minWidth: "0", minHeight: "0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Review queue
                  </h1>
                </div>
                <p>
                  Cases submitted by investigators. Assign each one to a reviewer to put it under review.
                </p>
              </div>
              <div className="acts" />
            </div>
            <div className="card " style={{ position: "absolute", left: "32px", top: "103px", width: "1124px", height: "283px", boxSizing: "border-box", maxWidth: "none", maxHeight: "none", minWidth: "0", minHeight: "0" }}>
              <div className="tools">
                <label className="s">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4.5 4.5" />
                  </svg>
                  <input placeholder="Search" />
                </label>
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
              <div className="tbl" style={{ height: "212px" }}>
                <table>
                  <thead>
                    <tr>
                      <th className="">
                        Case
                      </th>
                      <th className="">
                        Title
                      </th>
                      <th className="">
                        Submitted by
                      </th>
                      <th className="">
                        Submitted
                      </th>
                      <th className="">
                        Priority
                      </th>
                      <th className="">
                        Status
                      </th>
                      <th className="">
                        Reviewer
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="">
                        <b>
                          CASE-2026-00128
                        </b>
                      </td>
                      <td className="">
                        Suspected layering via mixer
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
                        02 Nov 14:20
                      </td>
                      <td className="">
                        <span className="chip bad">
                          Critical
                        </span>
                      </td>
                      <td className="">
                        <span className="chip warn">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <b>
                          CASE-2026-00121
                        </b>
                      </td>
                      <td className="">
                        Unexplained inbound volume spike
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
                        02 Nov 09:10
                      </td>
                      <td className="">
                        <span className="chip blue">
                          Medium
                        </span>
                      </td>
                      <td className="">
                        <span className="chip pur">
                          Under review
                        </span>
                      </td>
                      <td className="">
                        Nadia Hussain
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <b>
                          CASE-2026-00110
                        </b>
                      </td>
                      <td className="">
                        Bridge hopping across chains
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
                        01 Nov 16:45
                      </td>
                      <td className="">
                        <span className="chip warn">
                          High
                        </span>
                      </td>
                      <td className="">
                        <span className="chip warn">
                          Pending
                        </span>
                      </td>
                      <td className="">
                        Nadia Hussain
                      </td>
                      <td className="" />
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
