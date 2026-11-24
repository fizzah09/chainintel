import { DLink } from '../design/DLink';

export default function Screen() {
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100vh" }}>
        <div style={{ flex: "1 1 420px", background: "var(--navy)", color: "#fff", padding: "56px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "640px" }}>
          <div className="brand" style={{ padding: "0" }}>
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <rect width="40" height="40" rx="11" fill="#1769E0" />
              <circle cx="12" cy="20" r="3.2" fill="#fff" />
              <circle cx="27" cy="11.5" r="3.2" fill="#fff" />
              <circle cx="27" cy="28.5" r="3.2" fill="#fff" />
              <path d="M14.7 18.5l9.6-5.5M14.7 21.5l9.6 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <b style={{ fontSize: "21px" }}>
              Chain Intel
            </b>
          </div>
          <div>
            <h1 style={{ fontSize: "36px", lineHeight: "1.15", maxWidth: "15ch" }}>
              Blockchain wallet intelligence for regulated banks
            </h1>
            <p style={{ color: "#A9BBD6", maxWidth: "46ch", marginTop: "16px", fontSize: "15px" }}>
              Monitor wallets, trace transactions, score risk with explainable evidence and run investigations with a complete audit trail.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "28px", flexWrap: "wrap" }}>
              <span className="chip" style={{ background: "#1B3560", color: "#DCE8FA" }}>
                Explainable risk score
              </span>
              <span className="chip" style={{ background: "#1B3560", color: "#DCE8FA" }}>
                Evidence-first cases
              </span>
              <span className="chip" style={{ background: "#1B3560", color: "#DCE8FA" }}>
                Immutable audit log
              </span>
            </div>
          </div>
          <div style={{ color: "#7E94B6", fontSize: "12.5px" }}>
            Ethereum Mainnet · Tenant isolated · Role-based access
          </div>
        </div>
        <div style={{ flex: "1 1 480px", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", background: "#fff" }}>
          <main style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <h2 style={{ fontSize: "26px" }}>
                Two-step verification
              </h2>
              <p className="mu" style={{ margin: "6px 0 0" }}>
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div className="in" style={{ width: "52px", height: "58px", justifyContent: "center", fontSize: "22px", fontWeight: "650" }}>
                4
              </div>
              <div className="in" style={{ width: "52px", height: "58px", justifyContent: "center", fontSize: "22px", fontWeight: "650" }}>
                8
              </div>
              <div className="in" style={{ width: "52px", height: "58px", justifyContent: "center", fontSize: "22px", fontWeight: "650" }}>
                2
              </div>
              <div className="in" style={{ width: "52px", height: "58px", justifyContent: "center", fontSize: "22px", fontWeight: "650", borderColor: "var(--pri)", boxShadow: "0 0 0 3px #DBE8FC" }}>
                {" "}
              </div>
              <div className="in" style={{ width: "52px", height: "58px", justifyContent: "center", fontSize: "22px", fontWeight: "650" }}>
                1
              </div>
              <div className="in" style={{ width: "52px", height: "58px", justifyContent: "center", fontSize: "22px", fontWeight: "650" }}>
                {" "}
              </div>
              <div className="in" style={{ width: "52px", height: "58px", justifyContent: "center", fontSize: "22px", fontWeight: "650" }}>
                {" "}
              </div>
            </div>
            <div className="hint">
              Code expires in 00:24 ·
              <a style={{ color: "var(--pri)", fontWeight: "600" }} href="#">
                Resend
              </a>
            </div>
            <DLink href="/dashboard" className="btn pri" style={{ width: "100%", minHeight: "46px", fontSize: "14.5px" }}>
              Verify and continue
            </DLink>
            <a href="#" style={{ textAlign: "center", color: "var(--pri)", fontWeight: "600" }}>
              Use a recovery code
            </a>
          </main>
        </div>
      </div>
    </>
  );
}
