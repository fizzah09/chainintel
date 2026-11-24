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
            <DLink href="/trace" className="on">
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
                Transaction Tracing
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <b>
                Transaction detail
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
                    Transaction detail
                  </h1>
                </div>
              </div>
              <div className="acts">
                <a href="#" className="btn ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="8" y="8" width="12" height="12" rx="2" />
                    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                  </svg>
                  Copy hash
                </a>
                <a href="#" className="btn ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
                  </svg>
                  Add to case
                </a>
                <a href="#" className="btn ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" />
                  </svg>
                  View on explorer
                </a>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="mono" style={{ fontSize: "15px", fontWeight: "600" }}>
                    0x709b55bd3da0f5a838125bd0ee20c5bfdd7caba173912d4281cae816b79a201b
                  </div>
                  <div className="mu" style={{ marginTop: "6px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="chip ok">
                      Success
                    </span>
                    <span className="chip blue">
                      ERC-20 · USDT
                    </span>
                    <span className="tier high">
                      High
                    </span>
                    <span>
                      Block 21,044,310 · 02 Nov 2026 09:41:12 UTC
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mu sm">
                    Value
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    1,000 USDT
                  </div>
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div className="card " style={{ flex: "1 1 380px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Details
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div className="dl">
                  <span className="t">
                    From
                  </span>
                  <span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <DLink href="/design/WalletOverview" className="mono" style={{ color: "var(--pri)", fontWeight: "550" }}>
                        0xB7c4…0e21
                      </DLink>
                      <span style={{ color: "#8A99AE" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="8" y="8" width="12" height="12" rx="2" />
                          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                        </svg>
                      </span>
                    </span>
                  </span>
                  <span className="t">
                    To
                  </span>
                  <span>
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
                  </span>
                  <span className="t">
                    Gas used
                  </span>
                  <span>
                    51,204 · 14.2 gwei
                  </span>
                  <span className="t">
                    Fee
                  </span>
                  <span>
                    0.000727 ETH
                  </span>
                  <span className="t">
                    Confirmations
                  </span>
                  <span>
                    1,142
                  </span>
                  <span className="t">
                    Nonce
                  </span>
                  <span>
                    388
                  </span>
                </div>
              </div>
              <div className="card " style={{ flex: "1 1 380px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Risk assessment
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                  <svg viewBox="0 0 170 170" width="170" height="170" role="img" aria-label="Risk score 64 out of 100, High" style={{ display: "block", maxWidth: "100%", height: "auto" }}>
                    <path d="M29.17 138.54A77.35000000000001 77.35000000000001 0 0 1 12.93 56.90" stroke="#16A34A" strokeWidth="3.1" fill="none" strokeLinecap="round" opacity=".7" />
                    <path d="M14.17 53.91A77.35000000000001 77.35000000000001 0 0 1 83.38 7.67" stroke="#F59E0B" strokeWidth="3.1" fill="none" strokeLinecap="round" opacity=".7" />
                    <path d="M86.62 7.67A77.35000000000001 77.35000000000001 0 0 1 155.83 53.91" stroke="#EA580C" strokeWidth="3.1" fill="none" strokeLinecap="round" opacity=".7" />
                    <path d="M157.07 56.90A77.35000000000001 77.35000000000001 0 0 1 140.83 138.54" stroke="#DC2626" strokeWidth="3.1" fill="none" strokeLinecap="round" opacity=".7" />
                    <path d="M41.73 128.27A61.199999999999996 61.199999999999996 0 1 1 128.27 128.27" stroke="#E8EDF4" strokeWidth="12.8" fill="none" strokeLinecap="round" />
                    <path d="M41.73 128.27A61.199999999999996 61.199999999999996 0 0 1 122.51 36.64" stroke="#EA580C" strokeWidth="12.8" fill="none" strokeLinecap="round" />
                    <circle cx="122.5" cy="36.6" r="4.4" fill="#fff" stroke="#EA580C" strokeWidth="3" />
                    <text x="85.0" y="91.8" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="44" fill="#0F172A" letterSpacing="-2">
                      64
                    </text>
                    <text x="85.0" y="112" textAnchor="middle" fontSize="10" fill="#5B6B82" fontFamily="Inter,sans-serif">
                      out of 100
                    </text>
                  </svg>
                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <p style={{ margin: "0 0 8px" }}>
                      <span className="tier high">
                        High
                      </span>
                    </p>
                    <div className="mu">
                      Source wallet is linked to 2 flagged counterparties within 2 hops. Amount is above the wallet 30-day median.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div className="ct-h">
                <div>
                  <h3>
                    Source attribution
                  </h3>
                  <p>
                    Switch the attribution method to compare results.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                <button className="btn {{ prop }}">
                  Proportional
                </button>
                <button className="btn {{ fifo }}">
                  FIFO
                </button>
                <button className="btn {{ time }}">
                  Temporal
                </button>
              </div>
              <sc-if defaultValue="{{ isProp }}" hintPlaceholderVal="{{ true }}">
                <div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Source wallet
                          </th>
                          <th className="r">
                            Attributed amount
                          </th>
                          <th>
                            Share
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              428.57 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "42.9%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              178.57 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "17.9%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              285.71 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "28.6%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              107.14 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "10.7%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mu sm" style={{ paddingTop: "12px" }}>
                    Each source receives a share of the 1,000 USDT equal to its share of the inputs. Total: 1,000.00 USDT
                  </div>
                </div>
              </sc-if>
              <sc-if defaultValue="{{ isFifo }}" hintPlaceholderVal="{{ false }}">
                <div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Source wallet
                          </th>
                          <th className="r">
                            Attributed amount
                          </th>
                          <th>
                            Share
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              600.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "60.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              400.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "40.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              0.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "0.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              0.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "0.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mu sm" style={{ paddingTop: "12px" }}>
                    Earliest inflows are consumed first. Total: 1,000.00 USDT
                  </div>
                </div>
              </sc-if>
              <sc-if defaultValue="{{ isTime }}" hintPlaceholderVal="{{ false }}">
                <div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Source wallet
                          </th>
                          <th className="r">
                            Attributed amount
                          </th>
                          <th>
                            Share
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              0.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "0.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              0.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "0.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              700.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "70.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
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
                          <td className="r">
                            <b>
                              300.00 USDT
                            </b>
                          </td>
                          <td style={{ width: "200px" }}>
                            <div className="bar">
                              <i style={{ width: "30.0%", background: "#1769E0" }} />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mu sm" style={{ paddingTop: "12px" }}>
                    Inflows closest in time to the outflow are linked first. Total: 1,000.00 USDT
                  </div>
                </div>
              </sc-if>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
