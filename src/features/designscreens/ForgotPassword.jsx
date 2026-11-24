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
          </div>
          <div style={{ color: "#7E94B6", fontSize: "12.5px" }}>
            Ethereum Mainnet · Tenant isolated · Role-based access
          </div>
        </div>
        <div style={{ flex: "1 1 480px", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", background: "#fff" }}>
          <main style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <DLink href="/login" className="mu" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              ← Back to sign in
            </DLink>
            <div>
              <h2 style={{ fontSize: "26px" }}>
                Reset your password
              </h2>
              <p className="mu" style={{ margin: "6px 0 0" }}>
                We send a 6-digit code to your work email. Enter it with your new password.
              </p>
            </div>
            <div className="step" aria-label="Steps">
              <div className="s done">
                <em>
                  1
                </em>
                Email
                <hr />
              </div>
              <div className="s cur">
                <em>
                  2
                </em>
                Code and new password
              </div>
            </div>
            <div className="fld">
              <label htmlFor="fp-email">
                Work email
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input id="fp-email" className="in" type="email" defaultValue="sara.ali@examplebank.com" style={{ flex: "1" }} />
                <a href="#" className="btn">
                  Resend code
                </a>
              </div>
              <div className="hint">
                Code sent. It expires in 10 minutes.
              </div>
            </div>
            <div className="fld">
              <span style={{ fontWeight: "600", fontSize: "13px" }}>
                6-digit code
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <label style={{ position: "absolute", left: "-9999px" }} htmlFor="otp1">
                  Digit 1
                </label>
                <input id="otp1" className="in" type="text" inputMode="numeric" maxLength="1" defaultValue="4" style={{ width: "48px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: "600", justifyContent: "center", padding: "0" }} />
                <label style={{ position: "absolute", left: "-9999px" }} htmlFor="otp2">
                  Digit 2
                </label>
                <input id="otp2" className="in" type="text" inputMode="numeric" maxLength="1" defaultValue="8" style={{ width: "48px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: "600", justifyContent: "center", padding: "0" }} />
                <label style={{ position: "absolute", left: "-9999px" }} htmlFor="otp3">
                  Digit 3
                </label>
                <input id="otp3" className="in" type="text" inputMode="numeric" maxLength="1" defaultValue="2" style={{ width: "48px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: "600", justifyContent: "center", padding: "0" }} />
                <label style={{ position: "absolute", left: "-9999px" }} htmlFor="otp4">
                  Digit 4
                </label>
                <input id="otp4" className="in" type="text" inputMode="numeric" maxLength="1" defaultValue="9" style={{ width: "48px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: "600", justifyContent: "center", padding: "0" }} />
                <label style={{ position: "absolute", left: "-9999px" }} htmlFor="otp5">
                  Digit 5
                </label>
                <input id="otp5" className="in" type="text" inputMode="numeric" maxLength="1" style={{ width: "48px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: "600", padding: "0" }} />
                <label style={{ position: "absolute", left: "-9999px" }} htmlFor="otp6">
                  Digit 6
                </label>
                <input id="otp6" className="in" type="text" inputMode="numeric" maxLength="1" style={{ width: "48px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: "600", padding: "0" }} />
              </div>
            </div>
            <div className="fld">
              <label htmlFor="fp-new">
                New password
              </label>
              <input id="fp-new" className="in" type="password" placeholder="At least 12 characters" />
            </div>
            <div className="fld">
              <label htmlFor="fp-conf">
                Confirm new password
              </label>
              <input id="fp-conf" className="in" type="password" placeholder="Type it again" />
            </div>
            <DLink href="/login" className="btn pri" style={{ width: "100%", minHeight: "46px", fontSize: "14.5px" }}>
              Reset password
            </DLink>
            <p className="mu sm" style={{ margin: "0", textAlign: "center" }}>
              After 5 wrong codes the account is locked for 15 minutes.
            </p>
          </main>
        </div>
      </div>
    </>
  );
}
