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
                Transaction Tracing
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
                    Transaction tracing
                  </h1>
                </div>
                <p>
                  Follow funds across wallets using temporal, FIFO or proportional attribution.
                </p>
              </div>
              <div className="acts">
                <a href="#" className="btn ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />
                  </svg>
                  Save trace
                </a>
                <a href="#" className="btn pri">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18" />
                  </svg>
                  Add to case
                </a>
              </div>
            </div>
            <div className="card " style={{  }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end" }}>
                <div className="fld" style={{ flex: "2 1 320px" }}>
                  <label>
                    Start wallet or transaction hash
                    <i>
                      *
                    </i>
                  </label>
                  <div className="in">
                    <span>
                      0x7a3f…9B21
                    </span>
                  </div>
                </div>
                <div className="fld" style={{ flex: "1 1 170px" }}>
                  <label>
                    Direction
                  </label>
                  <div className="in">
                    <span>
                      Forward and backward
                    </span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <div className="fld" style={{ flex: "0 1 90px" }}>
                  <label>
                    Hops
                  </label>
                  <div className="in">
                    <span>
                      3
                    </span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <div className="fld" style={{ flex: "1 1 150px" }}>
                  <label>
                    Period
                  </label>
                  <div className="in">
                    <span>
                      Last 30 days
                    </span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <div className="fld" style={{ flex: "1 1 130px" }}>
                  <label>
                    Min amount
                  </label>
                  <div className="in">
                    <span>
                      100 USDT
                    </span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <div className="fld" style={{ flex: "1 1 150px" }}>
                  <label>
                    Attribution
                  </label>
                  <div className="in">
                    <span>
                      Proportional
                    </span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <div style={{ paddingBottom: "1px" }}>
                  <a href="#" className="btn pri">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 5l12 7-12 7z" />
                    </svg>
                    Run trace
                  </a>
                </div>
              </div>
            </div>
            <div className="card " style={{ position: "relative" }}>
              <div className="ct-h">
                <div>
                  <h3>
                    Trace result
                  </h3>
                  <p>
                    Selected path: Wallet B → C → E → G → Target
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div className="tools" style={{ marginBottom: "12px" }}>
                <span className="chip blue">
                  4 hops
                </span>
                <span className="chip gray">
                  38 nodes
                </span>
                <span className="chip gray">
                  71 edges
                </span>
                <span className="chip ok">
                  Within limits (100 nodes · 250 edges)
                </span>
                <span style={{ marginLeft: "auto" }}>
                  <a href="#" className="btn sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />
                    </svg>
                    Export
                  </a>
                </span>
              </div>
              <svg viewBox="0 0 980 300" width="100%" role="img" aria-label="Transaction flow graph across four hops from source to destination" style={{ display: "block", background: "#F8FAFD", borderRadius: "10px" }}>
                <defs>
                  <pattern id="gd2" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="1.5" r="1.1" fill="#DCE4EE" />
                  </pattern>
                  <marker id="am2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <path d="M0 0L10 5L0 10z" fill="#475569" />
                  </marker>
                </defs>
                <rect width="980" height="300" fill="url(#gd2)" />
                <line x1="152" y1="120" x2="224" y2="120" stroke="#475569" strokeWidth="2.4" markerEnd="url(#am2)" />
                <rect x="140" y="80" width="96" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                <text x="188" y="95" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  1,200 USDT
                </text>
                <text x="188" y="146" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  02 Nov 06:12
                </text>
                <circle cx="188" cy="178" r="12" fill="#1769E0" />
                <text x="188" y="182" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">
                  1
                </text>
                <line x1="352" y1="120" x2="424" y2="120" stroke="#475569" strokeWidth="2.4" markerEnd="url(#am2)" />
                <rect x="340" y="80" width="96" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                <text x="388" y="95" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  1,180 USDT
                </text>
                <text x="388" y="146" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  02 Nov 06:41
                </text>
                <circle cx="388" cy="178" r="12" fill="#1769E0" />
                <text x="388" y="182" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">
                  2
                </text>
                <line x1="552" y1="120" x2="624" y2="120" stroke="#7C8CA3" strokeWidth="2.4" strokeDasharray="7 6" markerEnd="url(#am2)" />
                <rect x="540" y="80" width="96" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                <text x="588" y="95" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  940 USDT
                </text>
                <text x="588" y="146" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  02 Nov 07:30
                </text>
                <circle cx="588" cy="178" r="12" fill="#E2E8F0" />
                <text x="588" y="182" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#334155" fontFamily="Inter,sans-serif">
                  3
                </text>
                <line x1="752" y1="120" x2="814" y2="120" stroke="#475569" strokeWidth="2.4" markerEnd="url(#am2)" />
                <rect x="735" y="80" width="96" height="22" rx="11" fill="#fff" stroke="#CBD5E1" />
                <text x="783" y="95" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  900 USDT
                </text>
                <text x="783" y="146" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  02 Nov 08:15
                </text>
                <circle cx="783" cy="178" r="12" fill="#1769E0" />
                <text x="783" y="182" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">
                  4
                </text>
                <rect x="28" y="86" width="124" height="68" rx="11" fill="#fff" stroke="#EA580C" strokeWidth="2" />
                <rect x="28" y="86" width="7" height="68" rx="3" fill="#EA580C" />
                <text x="46" y="106" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  Source
                </text>
                <text x="46" y="124" fontSize="12" fontWeight="600" fill="#0F172A" fontFamily="ui-monospace,monospace">
                  0xB7c4…0e21
                </text>
                <text x="46" y="143" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  66 · High
                </text>
                <rect x="228" y="86" width="124" height="68" rx="11" fill="#fff" stroke="#F59E0B" strokeWidth="2" />
                <rect x="228" y="86" width="7" height="68" rx="3" fill="#F59E0B" />
                <text x="246" y="106" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  Hop 1
                </text>
                <text x="246" y="124" fontSize="12" fontWeight="600" fill="#0F172A" fontFamily="ui-monospace,monospace">
                  0xC1a2…55d0
                </text>
                <text x="246" y="143" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  41 · Moderate
                </text>
                <rect x="428" y="86" width="124" height="68" rx="11" fill="#fff" stroke="#1769E0" strokeWidth="3" />
                <rect x="428" y="86" width="7" height="68" rx="3" fill="#DC2626" />
                <text x="446" y="106" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  Hop 2
                </text>
                <text x="446" y="124" fontSize="12" fontWeight="600" fill="#0F172A" fontFamily="ui-monospace,monospace">
                  0xE5f7…90b8
                </text>
                <text x="446" y="143" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  81 · Critical
                </text>
                <rect x="628" y="86" width="124" height="68" rx="11" fill="#fff" stroke="#EA580C" strokeWidth="2" />
                <rect x="628" y="86" width="7" height="68" rx="3" fill="#EA580C" />
                <text x="646" y="106" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  Hop 3
                </text>
                <text x="646" y="124" fontSize="12" fontWeight="600" fill="#0F172A" fontFamily="ui-monospace,monospace">
                  0x98b1…2c70
                </text>
                <text x="646" y="143" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  63 · High
                </text>
                <rect x="818" y="86" width="124" height="68" rx="11" fill="#fff" stroke="#DC2626" strokeWidth="2" />
                <rect x="818" y="86" width="7" height="68" rx="3" fill="#DC2626" />
                <text x="836" y="106" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  Destination
                </text>
                <text x="836" y="124" fontSize="12" fontWeight="600" fill="#0F172A" fontFamily="ui-monospace,monospace">
                  0x7a3f…9B21
                </text>
                <text x="836" y="143" fontSize="11.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  78 · Critical
                </text>
                <text x="40" y="280" fontSize="12" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  ── Observed transfer (confirmed on-chain) ╌╌ Heuristic path (inferred, not confirmed)
                </text>
              </svg>
            </div>
            <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
              <div className="card " style={{ flex: "2 1 560px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Path summary
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div className="tbl">
                  <table>
                    <thead>
                      <tr>
                        <th className="">
                          Hop
                        </th>
                        <th className="">
                          From
                        </th>
                        <th className="">
                          To
                        </th>
                        <th className="">
                          Amount
                        </th>
                        <th className="">
                          Time
                        </th>
                        <th className="">
                          Basis
                        </th>
                      </tr>
                    </thead>
                    <tbody>
<tr><td colSpan={6} className="mu">Hops come from the backend trace, which is not connected in this build.</td></tr>
</tbody>
                  </table>
                </div>
              </div>
              <div className="card " style={{ flex: "1 1 300px" }}>
                <div className="ct-h">
                  <div>
                    <h3>
                      Attribution method
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ padding: "12px", border: "1px solid #1769E0", borderRadius: "10px", background: "#F3F8FF" }}>
                    <b>
                      Proportional
                    </b>
                    <div className="mu sm">
                      Share of outflow matches share of inflow
                    </div>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid #E2E8F0", borderRadius: "10px", background: "#fff" }}>
                    <b>
                      FIFO
                    </b>
                    <div className="mu sm">
                      Oldest funds are spent first
                    </div>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid #E2E8F0", borderRadius: "10px", background: "#fff" }}>
                    <b>
                      Temporal
                    </b>
                    <div className="mu sm">
                      Closest-in-time transfers are linked
                    </div>
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
