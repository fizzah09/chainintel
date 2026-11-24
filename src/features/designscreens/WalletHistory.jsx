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
            <DLink href="/wallets" className="on">
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
              <span>
                Wallet Monitoring
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <span>
                0x7a3f…9B21
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <b>
                History
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
            <div className="card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#FEE2E2", color: "#991B1B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
                      <path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z" />
                      <circle cx="16" cy="13.5" r="1.2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <h1 style={{ fontSize: "20px" }} className="mono">
                        0x7a3f1c5e8b2d4096a1f7c3e5d8b2a49e0c619B21
                      </h1>
                      <span className="tier crit">
                        Critical
                      </span>
                      <span className="chip blue">
                        Ethereum
                      </span>
                      <span className="chip warn">
                        On watchlist
                      </span>
                    </div>
                    <div className="mu" style={{ marginTop: "6px" }}>
                      Type: Externally owned · First seen 14 Mar 2025 · Last active 02 Nov 2026 · Data fresh 4 min ago
                    </div>
                  </div>
                </div>
                <div className="acts">
                  <a href="#" className="btn ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="8" y="8" width="12" height="12" rx="2" />
                      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                    </svg>
                    Copy address
                  </a>
                  <a href="#" className="btn ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 12V4h8l10 10-8 8z" />
                      <circle cx="7.5" cy="8.5" r="1.3" />
                    </svg>
                    Add to watchlist
                  </a>
                  <DLink href="/cases/new" className="btn ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
                    </svg>
                    Create case
                  </DLink>
                  <DLink href="/trace" className="btn pri">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="5.5" cy="12" r="2.5" />
                      <circle cx="18" cy="5.5" r="2.5" />
                      <circle cx="18" cy="18.5" r="2.5" />
                      <path d="M8 11l7.6-4M8 13l7.6 4" />
                    </svg>
                    Trace transactions
                  </DLink>
                </div>
              </div>
            </div>
            <div className="tabs" style={{ position: "relative" }}>
              <DLink href="/design/WalletOverview">
                Overview
              </DLink>
              <DLink href="/design/WalletTransactions">
                Transactions
              </DLink>
              <DLink href="/design/WalletCounterparties">
                Counterparties
              </DLink>
              <DLink href="/design/RiskAssessment">
                Risk Assessment
              </DLink>
              <DLink href="/design/WalletGraph">
                Graph
              </DLink>
              <DLink href="/design/WalletEvidence">
                Evidence
              </DLink>
              <DLink href="/design/WalletCases">
                Cases
              </DLink>
              <DLink href="/design/WalletWatchlists">
                Watchlists
              </DLink>
              <DLink href="/design/WalletHistory" className="on">
                History
              </DLink>
              <svg width="1155" height="523" viewBox="0 0 1155 523" preserveAspectRatio="none" style={{ position: "absolute", left: "29px", top: "-5px", width: "1155px", height: "523px", overflow: "visible", fill: "none", stroke: "#8a8378", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}>
                <path d="M878 8 C852.4 8 821.4 3.8 797.5 15 C787.9 19.5 782.7 26.4 776 34 C758.4 53.9 738.1 69 711 73 C678.5 77.8 640.5 72.7 608 70 C570.8 67 533.4 66.1 496 67 C447.4 68.2 402 81.4 354 87 C303.8 92.9 252.2 86.8 202 95 C187.8 97.3 174.2 102.9 160 105 C123.4 110.5 27.9 127.5 6 168 C-4.9 188.2 0 218 0 240 C0 258 -2.5 278.9 4 296 C30.6 365.7 96.4 402.1 158 437 C174.9 446.6 191.4 457 209 465 C271.3 493.4 337.7 504.7 405 514 C483.4 524.8 565.6 529 644 516 C720.9 503.3 795.7 477.6 871 458 C923.5 444.3 975.3 426.4 1028 414 C1068.3 404.5 1109.7 396.4 1137 363 C1177.7 313.3 1145.8 244.7 1117 198 C1088.3 151.6 1025 72.7 977 48 C958.8 38.6 937.5 32.1 918 26 C908.1 22.9 899.2 16 889 14 C882.4 12.7 875.1 13.3 868.3 12 C853.1 9 841.9 2.5 826 2 C826 1.3 826 0.7 826 0" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div className="card " style={{ flex: "1 1 440px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Score history
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <svg viewBox="0 0 560 220" width="100%" role="img" aria-label="Trend chart" style={{ display: "block" }}>
                  <defs>
                    <lineargradient id="hs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#DC2626" stopOpacity=".22" />
                      <stop offset="1" stopColor="#DC2626" stopOpacity="0" />
                    </lineargradient>
                  </defs>
                  <line x1="48" x2="546" y1="192.0" y2="192.0" stroke="#E2E8F0" />
                  <text x="40" y="196.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    0
                  </text>
                  <line x1="48" x2="546" y1="147.0" y2="147.0" stroke="#E2E8F0" />
                  <text x="40" y="151.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    25
                  </text>
                  <line x1="48" x2="546" y1="102.0" y2="102.0" stroke="#E2E8F0" />
                  <text x="40" y="106.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    50
                  </text>
                  <line x1="48" x2="546" y1="57.0" y2="57.0" stroke="#E2E8F0" />
                  <text x="40" y="61.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    75
                  </text>
                  <line x1="48" x2="546" y1="12.0" y2="12.0" stroke="#E2E8F0" />
                  <text x="40" y="16.0" textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    100
                  </text>
                  <text x="48.0" y="212" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Mar
                  </text>
                  <text x="119.1" y="212" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    May
                  </text>
                  <text x="190.3" y="212" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    Jun
                  </text>
                  <text x="261.4" y="212" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    20 Oct
                  </text>
                  <text x="403.7" y="212" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    28 Oct
                  </text>
                  <text x="546.0" y="212" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                    02 Nov
                  </text>
                  <path d="M48.0 152.4L119.1 148.8L190.3 136.2L261.4 112.8L332.6 98.4L403.7 82.2L474.9 73.2L546.0 51.6L546.0 192L48.0 192Z" fill="url(#hs)" />
                  <path d="M48.0 152.4L119.1 148.8L190.3 136.2L261.4 112.8L332.6 98.4L403.7 82.2L474.9 73.2L546.0 51.6" fill="none" stroke="#DC2626" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </div>
              <div className="card " style={{ flex: "1 1 440px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Analysis runs
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div className="tbl">
                  <table>
                    <thead>
                      <tr>
                        <th className="">
                          Run
                        </th>
                        <th className="">
                          Date
                        </th>
                        <th className="">
                          Method
                        </th>
                        <th className="">
                          Score
                        </th>
                        <th className="">
                          Tier
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="">
                          v3
                        </td>
                        <td className="">
                          02 Nov 2026
                        </td>
                        <td className="">
                          Methodology v3
                        </td>
                        <td className="">
                          78
                        </td>
                        <td className="">
                          <span className="tier crit">
                            Critical
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="">
                          v2
                        </td>
                        <td className="">
                          28 Oct 2026
                        </td>
                        <td className="">
                          Methodology v3
                        </td>
                        <td className="">
                          61
                        </td>
                        <td className="">
                          <span className="tier high">
                            High
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="">
                          v1
                        </td>
                        <td className="">
                          20 Oct 2026
                        </td>
                        <td className="">
                          Methodology v2
                        </td>
                        <td className="">
                          44
                        </td>
                        <td className="">
                          <span className="tier mod">
                            Moderate
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <svg width="582" height="327" viewBox="0 0 582 327" preserveAspectRatio="none" style={{ position: "absolute", left: "609px", top: "272px", width: "582px", height: "327px", overflow: "visible", fill: "none", stroke: "#8a8378", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M38.7 2.7 C11.3 17.5 8 39.9 4.3 70.099 C3.7 75.199 1.2 80.199 0.5 85.299 C0.2 88.199 0 91.099 0 93.999 C0 120.399 13.6 147.099 19.6 171.799 C24.1 190.398 21.7 211.798 36.1 226.498 C69.199 260.398 117.099 276.498 160.799 290.098 C210.698 305.798 264.498 327.297 318.197 327.297 C328.897 327.297 339.597 326.397 350.297 324.497 C383.897 318.397 410.597 303.198 441.897 291.398 C487.896 274.098 546.796 260.898 569.095 209.998 C577.595 190.598 581.895 172.699 581.895 155.999 C581.895 123.599 565.596 96.099 532.196 72.599 C520.596 64.399 509.796 54.4 496.596 48.5 C477.096 39.7 469.496 41.5 449.496 35.7 C336.597 2.8 218.298 0 100.799 0 C76.699 0 52.5 0.1 28.5 0.1" vectorEffect="non-scaling-stroke" />
            </svg>
          </main>
        </div>
      </div>
    </>
  );
}
