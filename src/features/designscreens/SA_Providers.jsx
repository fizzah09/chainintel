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
            <DLink href="/platform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              <span>
                Platform Overview
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
            Platform
          </div>
          <div className="nav">
            <DLink href="/platform/tenants">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="3" width="14" height="18" rx="1.5" />
                <path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4" />
              </svg>
              <span>
                Tenant Management
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
            <DLink href="/platform/networks">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
              </svg>
              <span>
                Blockchain Networks
              </span>
            </DLink>
            <DLink href="/platform/providers" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <ellipse cx="12" cy="6" rx="8" ry="3" />
                <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
              </svg>
              <span>
                Data Providers
              </span>
            </DLink>
            <DLink href="/platform/risk-engine">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <path d="M9.5 9.5h5v5h-5zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
              </svg>
              <span>
                Risk Engine
              </span>
            </DLink>
            <DLink href="/watchlists">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12V4h8l10 10-8 8z" />
                <circle cx="7.5" cy="8.5" r="1.3" />
              </svg>
              <span>
                Platform Watchlists
              </span>
            </DLink>
          </div>
          <div className="nh">
            System
          </div>
          <div className="nav">
            <DLink href="/platform/audit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" />
              </svg>
              <span>
                Operations Audit Logs
              </span>
            </DLink>
            <DLink href="/platform/settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
              </svg>
              <span>
                Platform Settings
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
                Data Providers
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
                OF
              </div>
              <div>
                <b>
                  Omar Farooq
                </b>
                <span>
                  Platform Super Admin
                </span>
              </div>
            </DLink>
          </header>
          <main className="content">
            <div className="ph">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h1>
                    Data providers
                  </h1>
                </div>
                <p>
                  Configure sources, keys, quotas and fallbacks.
                </p>
              </div>
              <div className="acts">
                <a href="#" className="btn pri">
                  Run health check
                </a>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div className="tbl">
                <table>
                  <thead>
                    <tr>
                      <th className="">
                        Provider
                      </th>
                      <th className="">
                        Purpose
                      </th>
                      <th className="">
                        Quota used
                      </th>
                      <th className="">
                        Latency
                      </th>
                      <th className="">
                        Status
                      </th>
                      <th className="">
                        Last checked
                      </th>
                      <th className="r">
                        Health
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="">
                        Etherscan API V2
                      </td>
                      <td className="">
                        Transactions and labels
                      </td>
                      <td className="">
                        <div className="bar" style={{ width: "120px" }}>
                          <i style={{ width: "62%", background: "#1769E0" }} />
                        </div>
                      </td>
                      <td className="">
                        210 ms
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Healthy
                        </span>
                      </td>
                      <td className="mu sm">
                        1 min ago
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Check now
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        Ethereum RPC (primary)
                      </td>
                      <td className="">
                        Raw chain data
                      </td>
                      <td className="">
                        <div className="bar" style={{ width: "120px" }}>
                          <i style={{ width: "35%", background: "#1769E0" }} />
                        </div>
                      </td>
                      <td className="">
                        90 ms
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Healthy
                        </span>
                      </td>
                      <td className="mu sm">
                        1 min ago
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Check now
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        Blockscout
                      </td>
                      <td className="">
                        Fallback explorer
                      </td>
                      <td className="">
                        <div className="bar" style={{ width: "120px" }}>
                          <i style={{ width: "12%", background: "#1769E0" }} />
                        </div>
                      </td>
                      <td className="">
                        260 ms
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Healthy
                        </span>
                      </td>
                      <td className="mu sm">
                        1 min ago
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Check now
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        Forta labels
                      </td>
                      <td className="">
                        Malicious labels
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        <span className="chip warn">
                          Degraded
                        </span>
                      </td>
                      <td className="mu sm">
                        1 min ago
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Check now
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        OFAC SDN
                      </td>
                      <td className="">
                        Sanctions list
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Healthy
                        </span>
                      </td>
                      <td className="mu sm">
                        1 min ago
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Check now
                        </a>
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
                    Open-source intelligence feeds
                  </h3>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div className="tbl">
                <table>
                  <thead>
                    <tr>
                      <th className="">
                        Feed
                      </th>
                      <th className="">
                        Licence
                      </th>
                      <th className="">
                        Cadence
                      </th>
                      <th className="">
                        Use
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="">
                        OFAC SDN + UN + EU + UK lists
                      </td>
                      <td className="">
                        Public
                      </td>
                      <td className="">
                        Daily
                      </td>
                      <td className="">
                        Sanctions screening
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        Forta labelled-datasets
                      </td>
                      <td className="">
                        MIT
                      </td>
                      <td className="">
                        On release
                      </td>
                      <td className="">
                        Malicious contract labels
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        ScamSniffer scam-database
                      </td>
                      <td className="">
                        GPL-3.0
                      </td>
                      <td className="">
                        7-day delay
                      </td>
                      <td className="">
                        Scam addresses
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        MetaMask eth-phishing-detect
                      </td>
                      <td className="">
                        MIT
                      </td>
                      <td className="">
                        Hourly
                      </td>
                      <td className="">
                        Phishing domains
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        Ransomwhere
                      </td>
                      <td className="">
                        CC BY-NC 4.0
                      </td>
                      <td className="">
                        Monthly
                      </td>
                      <td className="">
                        Ransomware addresses
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        DefiLlama hacks
                      </td>
                      <td className="">
                        Open API
                      </td>
                      <td className="">
                        Daily
                      </td>
                      <td className="">
                        Exploit incidents
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        Dune / BigQuery crypto_ethereum
                      </td>
                      <td className="">
                        Per terms
                      </td>
                      <td className="">
                        Batch
                      </td>
                      <td className="">
                        Historical analytics
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
