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
            <DLink href="/trace">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 7h12l-3-3M17 17H5l3 3" />
              </svg>
              <span>
                Transaction Tracing
              </span>
            </DLink>
            <DLink href="/design/CaseRelGraph" className="on">
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
                Cases
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <span>
                CASE-2026-00128
              </span>
              {" "}
              <span style={{ color: "#A3B0C2" }}>
                /
              </span>
              {" "}
              <b>
                Graph
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
            <div className="card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="mono mu">
                      CASE-2026-00128
                    </span>
                    <span className="chip pur">
                      Under Review
                    </span>
                    <span className="chip bad">
                      Critical
                    </span>
                  </div>
                  <h1 style={{ fontSize: "22px", marginTop: "6px" }}>
                    Suspected layering via mixer
                  </h1>
                  <div className="mu" style={{ marginTop: "6px", display: "flex", gap: "18px", flexWrap: "wrap" }}>
                    <span>
                      Assignee: Sara Ali
                    </span>
                    <span>
                      Opened 02 Nov 2026
                    </span>
                    <span>
                      Due 09 Nov 2026
                    </span>
                    <span>
                      Subjects: 3
                    </span>
                  </div>
                </div>
                <div className="acts">
                  <DLink href="/reports/new" className="btn ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 3h8l5 5v13H6z" />
                      <path d="M14 3v5h5M9 13h7M9 17h7" />
                    </svg>
                    Generate report
                  </DLink>
                  <DLink href="/design/CaseReview" className="btn pri">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
                    </svg>
                    Submit for review
                  </DLink>
                </div>
              </div>
              <div style={{ marginTop: "20px" }}>
                <div className="step">
                  <div className="s done">
                    <em>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </em>
                    <span>
                      Open
                    </span>
                    <hr />
                  </div>
                  <div className="s done">
                    <em>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </em>
                    <span>
                      Assigned
                    </span>
                    <hr />
                  </div>
                  <div className="s done">
                    <em>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </em>
                    <span>
                      Evidence Collection
                    </span>
                    <hr />
                  </div>
                  <div className="s done">
                    <em>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </em>
                    <span>
                      Analysis
                    </span>
                    <hr />
                  </div>
                  <div className="s cur">
                    <em>
                      5
                    </em>
                    <span>
                      Under Review
                    </span>
                    <hr />
                  </div>
                  <div className="s ">
                    <em>
                      6
                    </em>
                    <span>
                      Decision
                    </span>
                    <hr />
                  </div>
                  <div className="s ">
                    <em>
                      7
                    </em>
                    <span>
                      Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="tabs">
              <DLink href="/design/CaseDetails">
                Overview
              </DLink>
              <DLink href="/design/CaseSubjects">
                Subjects
              </DLink>
              <DLink href="/design/CaseEvidence">
                Evidence
              </DLink>
              <DLink href="/design/CaseFindings">
                Findings
              </DLink>
              <DLink href="/design/CaseRelGraph" className="on">
                Graph
              </DLink>
              <DLink href="/design/CaseTasks">
                Tasks
              </DLink>
              <DLink href="/design/CaseNotes">
                Notes
              </DLink>
              <DLink href="/design/CaseComms">
                Communication
              </DLink>
              <DLink href="/design/CaseReview">
                Review
              </DLink>
              <DLink href="/design/CaseTimeline">
                Timeline
              </DLink>
            </div>
            <div className="card " style={{  }}>
              <div className="ct-h">
                <div>
                  <h3>
                    Investigation graph
                  </h3>
                  <p>
                    Wallets, transactions, findings and evidence linked to this case
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} />
              </div>
              <div className="tools" style={{ marginBottom: "12px" }}>
                <span className="sel">
                  <span>
                    Show
                  </span>
                  All object types
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="sel">
                  <span>
                    Layout
                  </span>
                  Force-directed
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span style={{ marginLeft: "auto" }}>
                  <a href="#" className="btn sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add node
                  </a>
                  <a href="#" className="btn sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />
                    </svg>
                    Export
                  </a>
                </span>
              </div>
              <svg viewBox="0 0 960 480" width="100%" role="img" aria-label="Case investigation graph connecting wallets, transactions, findings and evidence" style={{ display: "block", background: "#F8FAFD", borderRadius: "10px" }}>
                <defs>
                  <pattern id="gd3" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="1.5" r="1.1" fill="#DCE4EE" />
                  </pattern>
                </defs>
                <rect width="960" height="480" fill="url(#gd3)" />
                <line x1="230" y1="120" x2="350" y2="230" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="350" y1="230" x2="470" y2="230" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="230" y1="340" x2="350" y2="230" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="470" y1="230" x2="600" y2="160" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="600" y1="160" x2="720" y2="110" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="470" y1="230" x2="600" y2="300" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="600" y1="300" x2="730" y2="350" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="470" y1="70" x2="470" y2="230" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="470" y1="410" x2="230" y2="340" stroke="#94A3B8" strokeWidth="1.8" />
                <line x1="110" y1="230" x2="230" y2="120" stroke="#94A3B8" strokeWidth="1.8" strokeDasharray="5 5" />
                <line x1="850" y1="230" x2="720" y2="110" stroke="#94A3B8" strokeWidth="1.8" strokeDasharray="5 5" />
                <line x1="360" y1="440" x2="470" y2="410" stroke="#94A3B8" strokeWidth="1.8" strokeDasharray="5 5" />
                <line x1="110" y1="230" x2="470" y2="70" stroke="#94A3B8" strokeWidth="1.8" strokeDasharray="5 5" />
                <circle cx="470" cy="230" r="36" fill="none" stroke="#1769E0" strokeWidth="2.5" strokeDasharray="4 4" />
                <circle cx="470" cy="230" r="28" fill="#fff" stroke="#DC2626" strokeWidth="3" />
                <circle cx="470" cy="230" r="11.76" fill="#DC2626" opacity=".16" />
                <text x="470" y="276" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  Primary wallet
                </text>
                <text x="470" y="291" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  0x7a3f…9B21
                </text>
                <circle cx="230" cy="120" r="22" fill="#fff" stroke="#EA580C" strokeWidth="3" />
                <circle cx="230" cy="120" r="9.24" fill="#EA580C" opacity=".16" />
                <text x="230" y="160" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  Wallet B
                </text>
                <text x="230" y="175" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  0xB7c4…0e21
                </text>
                <circle cx="230" cy="340" r="22" fill="#fff" stroke="#DC2626" strokeWidth="3" />
                <circle cx="230" cy="340" r="9.24" fill="#DC2626" opacity=".16" />
                <text x="230" y="380" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  Wallet E
                </text>
                <text x="230" y="395" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  0xE5f7…90b8
                </text>
                <circle cx="720" cy="110" r="22" fill="#fff" stroke="#EA580C" strokeWidth="3" />
                <circle cx="720" cy="110" r="9.24" fill="#EA580C" opacity=".16" />
                <text x="720" y="150" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  Wallet G
                </text>
                <text x="720" y="165" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  0x98b1…2c70
                </text>
                <circle cx="730" cy="350" r="22" fill="#fff" stroke="#F59E0B" strokeWidth="3" />
                <circle cx="730" cy="350" r="9.24" fill="#F59E0B" opacity=".16" />
                <text x="730" y="390" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily="Inter,sans-serif">
                  Wallet C
                </text>
                <text x="730" y="405" textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily="Inter,sans-serif">
                  0xC1a2…55d0
                </text>
                <rect x="336" y="216" width="28" height="28" rx="5" transform="rotate(45 350 230)" fill="#fff" stroke="#475569" strokeWidth="2.4" />
                <text x="350" y="264" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="ui-monospace,monospace">
                  0xca61…e274
                </text>
                <rect x="586" y="146" width="28" height="28" rx="5" transform="rotate(45 600 160)" fill="#fff" stroke="#475569" strokeWidth="2.4" />
                <text x="600" y="194" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="ui-monospace,monospace">
                  0x37a6…c306
                </text>
                <rect x="586" y="286" width="28" height="28" rx="5" transform="rotate(45 600 300)" fill="#fff" stroke="#475569" strokeWidth="2.4" />
                <text x="600" y="334" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="ui-monospace,monospace">
                  0x599e…d43b
                </text>
                <polygon points="489.1,81.0 470.0,92.0 450.9,81.0 450.9,59.0 470.0,48.0 489.1,59.0" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2.4" />
                <text x="470" y="110" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#9A3412" fontFamily="Inter,sans-serif">
                  FND-0012
                </text>
                <polygon points="489.1,421.0 470.0,432.0 450.9,421.0 450.9,399.0 470.0,388.0 489.1,399.0" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2.4" />
                <text x="470" y="450" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#9A3412" fontFamily="Inter,sans-serif">
                  FND-0013
                </text>
                <rect x="93" y="210" width="34" height="40" rx="5" fill="#EFF6FF" stroke="#1769E0" strokeWidth="2.2" />
                <path d="M102 224h16M102 232h16M102 240h9" stroke="#1769E0" strokeWidth="1.8" />
                <text x="110" y="268" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#124FB5" fontFamily="Inter,sans-serif">
                  EVD-000185
                </text>
                <rect x="833" y="210" width="34" height="40" rx="5" fill="#EFF6FF" stroke="#1769E0" strokeWidth="2.2" />
                <path d="M842 224h16M842 232h16M842 240h9" stroke="#1769E0" strokeWidth="1.8" />
                <text x="850" y="268" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#124FB5" fontFamily="Inter,sans-serif">
                  EVD-000186
                </text>
                <rect x="343" y="420" width="34" height="40" rx="5" fill="#EFF6FF" stroke="#1769E0" strokeWidth="2.2" />
                <path d="M352 434h16M352 442h16M352 450h9" stroke="#1769E0" strokeWidth="1.8" />
                <text x="360" y="478" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#124FB5" fontFamily="Inter,sans-serif">
                  EVD-000187
                </text>
              </svg>
              <div style={{ marginTop: "10px" }}>
                <div className="legend">
                  <span>
                    <i style={{ background: "#DC2626" }} />
                    Wallet
                  </span>
                  <span>
                    <i style={{ background: "#475569" }} />
                    Transaction
                  </span>
                  <span>
                    <i style={{ background: "#EA580C" }} />
                    Finding
                  </span>
                  <span>
                    <i style={{ background: "#1769E0" }} />
                    Evidence
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
