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
              <b>
                Wallet Monitoring
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
                    Wallet monitoring
                  </h1>
                </div>
                <p>
                  Search any Ethereum address to view its risk profile, activity and relationships.
                </p>
              </div>
              <div className="acts">
                <a href="#" className="btn ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16V5M7.5 9L12 4.5 16.5 9M5 20h14" />
                  </svg>
                  Import addresses
                </a>
                <a href="#" className="btn pri">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add wallet
                </a>
              </div>
            </div>
            <div className="card" style={{ padding: "18px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <label className="search" style={{ flex: "1 1 420px", maxWidth: "none", margin: "0", minHeight: "46px", background: "#fff" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4.5 4.5" />
                  </svg>
                  <input placeholder="Paste a wallet address (0x…) or ENS name" />
                </label>
                <DLink href="/design/WalletOverview" className="btn pri">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                  </svg>
                  Analyse wallet
                </DLink>
              </div>
            </div>
            <div className="kpis">
              <div className="kpi">
                <div className="l">
                  Monitored wallets
                </div>
                <div className="v">
                  1,284
                </div>
                <div className="s">
                  +36 this week
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#DC2626" }} />
                  Critical risk
                </div>
                <div className="v">
                  154
                </div>
                <div className="s">
                  Score 75–100
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  <i style={{ background: "#EA580C" }} />
                  High risk
                </div>
                <div className="v">
                  270
                </div>
                <div className="s">
                  Score 50–74
                </div>
              </div>
              <div className="kpi">
                <div className="l">
                  Alerts today
                </div>
                <div className="v">
                  17
                </div>
                <div className="s">
                  6 unacknowledged
                </div>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div className="ct-h">
                <div>
                  <h3>
                    Recently analysed wallets
                  </h3>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div className="tools">
                <label className="s">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4.5 4.5" />
                  </svg>
                  <input placeholder="Filter wallets" />
                </label>
                <span className="sel">
                  <span>
                    Tier
                  </span>
                  All
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Label
                  </span>
                  All
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Network
                  </span>
                  Ethereum
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
                        Wallet
                      </th>
                      <th className="">
                        Label
                      </th>
                      <th className="">
                        Risk score
                      </th>
                      <th className="">
                        Tier
                      </th>
                      <th className="">
                        Transactions
                      </th>
                      <th className="">
                        Volume
                      </th>
                      <th className="">
                        Last activity
                      </th>
                      <th className="">
                        Watchlist
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0x7a3f…9B21
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Unknown
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            78
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "78%", background: "#DC2626" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier crit">
                          Critical
                        </span>
                      </td>
                      <td className="">
                        1,284
                      </td>
                      <td className="">
                        $2.41M
                      </td>
                      <td className="">
                        4 min ago
                      </td>
                      <td className="">
                        <span className="chip warn">
                          Watched
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xE5f7…90b8
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Unknown
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            81
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "81%", background: "#DC2626" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier crit">
                          Critical
                        </span>
                      </td>
                      <td className="">
                        412
                      </td>
                      <td className="">
                        $680K
                      </td>
                      <td className="">
                        1 h ago
                      </td>
                      <td className="">
                        <span className="chip warn">
                          Watched
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0x98b1…2c70
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Unknown
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            63
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "63%", background: "#EA580C" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier high">
                          High
                        </span>
                      </td>
                      <td className="">
                        98
                      </td>
                      <td className="">
                        $91K
                      </td>
                      <td className="">
                        3 h ago
                      </td>
                      <td className="">
                        <span className="mu">
                          —
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0x5a8e…fd02
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Mixing service
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            92
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "92%", background: "#DC2626" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier crit">
                          Critical
                        </span>
                      </td>
                      <td className="">
                        9,210
                      </td>
                      <td className="">
                        $14.2M
                      </td>
                      <td className="">
                        12 min ago
                      </td>
                      <td className="">
                        <span className="chip warn">
                          Watched
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xC1a2…55d0
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Unknown
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            58
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "58%", background: "#EA580C" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier high">
                          High
                        </span>
                      </td>
                      <td className="">
                        221
                      </td>
                      <td className="">
                        $140K
                      </td>
                      <td className="">
                        Yesterday
                      </td>
                      <td className="">
                        <span className="mu">
                          —
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xd4b3…11c4
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        DEX
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            31
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "31%", background: "#F59E0B" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier mod">
                          Moderate
                        </span>
                      </td>
                      <td className="">
                        58,402
                      </td>
                      <td className="">
                        $122M
                      </td>
                      <td className="">
                        1 min ago
                      </td>
                      <td className="">
                        <span className="mu">
                          —
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0x28c6…1d60
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Exchange
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            18
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "18%", background: "#16A34A" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier low">
                          Low
                        </span>
                      </td>
                      <td className="">
                        210,884
                      </td>
                      <td className="">
                        $1.9B
                      </td>
                      <td className="">
                        1 min ago
                      </td>
                      <td className="">
                        <span className="mu">
                          —
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xF2c6…7e14
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Unknown
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            12
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "12%", background: "#16A34A" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier low">
                          Low
                        </span>
                      </td>
                      <td className="">
                        17
                      </td>
                      <td className="">
                        $4.1K
                      </td>
                      <td className="">
                        5 days ago
                      </td>
                      <td className="">
                        <span className="mu">
                          —
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                            0xD9e4…1a33
                          </DLink>
                          <span style={{ color: "#8A99AE" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="8" y="8" width="12" height="12" rx="2" />
                              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                            </svg>
                          </span>
                        </span>
                      </td>
                      <td className="">
                        Unknown
                      </td>
                      <td className="">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ minWidth: "24px" }}>
                            41
                          </b>
                          <div className="bar" style={{ width: "80px" }}>
                            <i style={{ width: "41%", background: "#F59E0B" }} />
                          </div>
                        </div>
                      </td>
                      <td className="">
                        <span className="tier mod">
                          Moderate
                        </span>
                      </td>
                      <td className="">
                        64
                      </td>
                      <td className="">
                        $22K
                      </td>
                      <td className="">
                        2 days ago
                      </td>
                      <td className="">
                        <span className="mu">
                          —
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="pager">
                <span>
                  Showing 1–9 of 56
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
