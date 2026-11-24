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
            <DLink href="/audit">
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
            Records
          </div>
          <div className="nav">
            <DLink href="/audit/cases" className="on">
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
                Case Records
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
          <main className="content">
            <div className="ph">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Case records
                  </h1>
                </div>
                <p>
                  Read-only access to closed and active cases.
                </p>
              </div>
              <div className="acts" />
            </div>
            <div className="card " style={{ position: "relative" }}>
              <div className="tools">
                <label className="s">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4.5 4.5" />
                  </svg>
                  <input placeholder="Search cases" />
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
                        Priority
                      </th>
                      <th className="">
                        Assigned by
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
                        <span className="chip bad">
                          Critical
                        </span>
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
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
                        <span className="chip warn">
                          High
                        </span>
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
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
                        <span className="chip warn">
                          High
                        </span>
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
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
                          Medium
                        </span>
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
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
                    <tr>
                      <td className="">
                        <DLink href="/design/CaseDetails" className="mono" style={{ color: "var(--pri)", fontWeight: "600" }}>
                          CASE-2026-00119
                        </DLink>
                      </td>
                      <td className="">
                        Phishing-linked deposit
                      </td>
                      <td className="">
                        <span className="chip blue">
                          Medium
                        </span>
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        28 Oct 2026
                      </td>
                      <td className="">
                        —
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <DLink href="/design/CaseDetails" className="mono" style={{ color: "var(--pri)", fontWeight: "600" }}>
                          CASE-2026-00110
                        </DLink>
                      </td>
                      <td className="">
                        Bridge hopping across chains
                      </td>
                      <td className="">
                        <span className="chip warn">
                          High
                        </span>
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        22 Oct 2026
                      </td>
                      <td className="">
                        05 Nov 2026
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <DLink href="/design/CaseDetails" className="mono" style={{ color: "var(--pri)", fontWeight: "600" }}>
                          CASE-2026-00102
                        </DLink>
                      </td>
                      <td className="">
                        Exchange deposit review
                      </td>
                      <td className="">
                        <span className="chip gray">
                          Low
                        </span>
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span className="av" style={{ width: "26px", height: "26px", fontSize: "10.5px", background: "#DCE6F5", color: "#1B3560" }}>
                            AK
                          </span>
                          <div style={{ lineHeight: "1.25" }}>
                            <div style={{ fontWeight: "550" }}>
                              Ahmed Khan
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="">
                        14 Oct 2026
                      </td>
                      <td className="">
                        —
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="pager">
                <span>
                  Showing 1–7 of 94
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
              <svg width="195" height="483" viewBox="0 0 195 483" preserveAspectRatio="none" style={{ position: "absolute", left: "690px", top: "33px", width: "195px", height: "483px", overflow: "visible", fill: "none", stroke: "#8a8378", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}>
                <path d="M63.898 25.299 C37.599 25.299 31.799 26.299 15.5 49.499 C1.3 69.598 0 88.498 0 110.897 C0 115.897 0.1 121.097 0.1 126.497 C0.1 158.996 3.8 186.895 5.6 218.895 C6.6 236.894 7.8 254.694 7.8 272.793 C7.8 311.792 11.3 351.291 17.7 389.39 C20.199 404.59 22.299 424.689 30.899 438.089 C39.399 451.389 55.499 457.289 66.098 468.588 C67.798 470.488 68.498 473.688 70.498 475.188 C78.598 481.288 92.598 483.088 105.697 483.088 C112.997 483.088 119.997 482.488 125.497 481.788 C136.797 480.188 146.596 472.288 155.196 465.288 C185.595 440.389 192.195 425.589 193.695 386.09 C193.895 378.391 195.195 369.991 195.195 361.891 C195.195 359.291 195.095 356.691 194.795 354.191 C189.595 316.892 153.196 265.893 136.497 229.894 C116.997 188.095 105.697 143.996 89.198 101.197 C81.598 81.698 69.398 61.498 64.098 41.199 C60.698 27.899 63.398 13.3 60.598 0 C35.399 1.9 33.799 21.999 29.799 42.899" vectorEffect="non-scaling-stroke" />
              </svg>
              <svg width="179" height="445" viewBox="0 0 179 445" preserveAspectRatio="none" style={{ position: "absolute", left: "429px", top: "61px", width: "179px", height: "445px", overflow: "visible", fill: "none", stroke: "#8a8378", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}>
                <path d="M56 0 C12.1 30.4 4.1 96.8 2 146 C-0.5 203.6 -2.8 262.4 2 320 C3.1 333.1 1.4 347 3.5 360 C7.1 382.5 15.8 405.3 23 427 C49.4 431.1 72.6 442.9 99.5 444.7 C107.7 445.3 120.7 447.3 127 441 C128.8 439.2 129.3 436 131 434 C133.5 431.1 137.7 430 140 427 C142.4 423.9 142.7 419.2 145 416 C146.8 413.3 150.2 411.7 152 409 C161 395.8 167.1 372.7 171 357 C177.5 330.6 179 303.3 179 276 C179 257 180.8 236.8 178 218 C175.4 200.8 171.4 183.2 170 166 C169.5 159.7 170.6 153.5 169.5 147.2 C164 114.7 147.7 86.4 132.5 58.2 C127 48.1 123.6 33.8 113.2 27.2 C108.9 24.5 104.2 24.9 99.7 22.7 C82.7 14.6 68.8 5.6 49 5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
