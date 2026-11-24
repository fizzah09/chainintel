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
            <DLink href="/review">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
              <span>
                Review Dashboard
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
            <DLink href="/review/queue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5"/></svg>
              <span>
                Review Queue
              </span>
            </DLink>
            <DLink href="/design/CaseReview">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v16M6 20h12M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/></svg>
              <span>
                Case Review
              </span>
            </DLink>
          </div>
          <div className="nh">
            Oversight
          </div>
          <div className="nav">
          </div>
          <div className="nh">
            Manage
          </div>
          <div className="nav">
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
          <main className="content">
            <div className="scrim">
              <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ar-t">
                <h2 id="ar-t" style={{ fontSize: "20px" }}>
                  Assign for review
                </h2>
                <p className="mu" style={{ margin: "6px 0 16px" }}>
                  CASE-2026-00128 · Suspected layering via mixer. The case moves to
                  <b>
                    Under review
                  </b>
                  .
                </p>
                <div className="fld">
                  <span style={{ fontWeight: "600", fontSize: "13px" }}>
                    Choose reviewer
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", border: "1px solid var(--ln)", borderRadius: "10px", cursor: "pointer" }}>
                      <input type="radio" name="rv" defaultChecked="" />
                      <span className="av" style={{ width: "30px", height: "30px", fontSize: "11px" }}>
                        NH
                      </span>
                      <span style={{ flex: "1" }}>
                        <b style={{ display: "block", fontWeight: "600" }}>
                          Nadia Hussain
                        </b>
                        <span className="mu sm">
                          Reviewer
                        </span>
                      </span>
                      <span className="mu sm">
                        2 in review
                      </span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", border: "1px solid var(--ln)", borderRadius: "10px", cursor: "pointer" }}>
                      <input type="radio" name="rv" />
                      <span className="av" style={{ width: "30px", height: "30px", fontSize: "11px" }}>
                        FA
                      </span>
                      <span style={{ flex: "1" }}>
                        <b style={{ display: "block", fontWeight: "600" }}>
                          Faisal Ahmed
                        </b>
                        <span className="mu sm">
                          Reviewer
                        </span>
                      </span>
                      <span className="mu sm">
                        4 in review
                      </span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", border: "1px solid var(--ln)", borderRadius: "10px", cursor: "pointer" }}>
                      <input type="radio" name="rv" />
                      <span className="av" style={{ width: "30px", height: "30px", fontSize: "11px" }}>
                        AK
                      </span>
                      <span style={{ flex: "1" }}>
                        <b style={{ display: "block", fontWeight: "600" }}>
                          Ahmed Khan (you)
                        </b>
                        <span className="mu sm">
                          Compliance Manager
                        </span>
                      </span>
                      <span className="mu sm">
                        1 in review
                      </span>
                    </label>
                  </div>
                </div>
                <div className="fld" style={{ marginTop: "14px" }}>
                  <label htmlFor="ar-due">
                    Review due
                  </label>
                  <input id="ar-due" className="in" type="date" defaultValue="2026-11-09" />
                </div>
                <div className="fld" style={{ marginTop: "14px" }}>
                  <label htmlFor="ar-note">
                    Note for reviewer (optional)
                  </label>
                  <textarea id="ar-note" className="in ta" placeholder="Anything the reviewer should check first" />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                  <DLink href="/compliance/review-queue" className="btn">
                    Cancel
                  </DLink>
                  <DLink href="/compliance/review-queue" className="btn pri">
                    Assign and put under review
                  </DLink>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
