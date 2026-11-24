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
            <DLink href="/platform/networks" className="on">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
              </svg>
              <span>
                Blockchain Networks
              </span>
            </DLink>
            <DLink href="/platform/providers">
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
            <DLink href="/complaints">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
                <path d="M10 9v6" />
              </svg>
              <span>
                Complaints
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
                Blockchain Networks
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
                    Blockchain networks
                  </h1>
                </div>
                <p>
                  Supported networks. Networks beyond Ethereum are pending (OI-05).
                </p>
              </div>
              <div className="acts" />
            </div>
            <div className="card " style={{  }}>
              <div className="tbl">
                <table>
                  <thead>
                    <tr>
                      <th className="">
                        Network
                      </th>
                      <th className="">
                        Chain ID
                      </th>
                      <th className="">
                        Status
                      </th>
                      <th className="">
                        Latest block
                      </th>
                      <th className="">
                        Lag
                      </th>
                      <th className="">
                        Last test
                      </th>
                      <th className="r">
                        Connection
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="">
                        Ethereum Mainnet
                      </td>
                      <td className="">
                        1
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Enabled
                        </span>
                      </td>
                      <td className="">
                        21,044,611
                      </td>
                      <td className="">
                        2 s
                      </td>
                      <td className="">
                        <span className="chip ok">
                          Connected
                        </span>
                        {" "}
                        <span className="mu sm">
                          2 min ago
                        </span>
                      </td>
                      <td className="r">
                        <a href="#" className="btn sm">
                          Test connection
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        Polygon
                      </td>
                      <td className="">
                        137
                      </td>
                      <td className="">
                        <span className="chip gray">
                          Planned
                        </span>
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        <span className="mu sm">
                          Not tested
                        </span>
                      </td>
                      <td className="r">
                        <span className="btn sm dis">
                          Test connection
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="">
                        BNB Chain
                      </td>
                      <td className="">
                        56
                      </td>
                      <td className="">
                        <span className="chip gray">
                          Planned
                        </span>
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        —
                      </td>
                      <td className="">
                        <span className="mu sm">
                          Not tested
                        </span>
                      </td>
                      <td className="r">
                        <span className="btn sm dis">
                          Test connection
                        </span>
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
