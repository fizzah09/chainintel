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
            <div>
              <h2 style={{ fontSize: "26px" }}>
                Sign in
              </h2>
              <p className="mu" style={{ margin: "6px 0 0" }}>
                Use your bank-issued credentials to continue.
              </p>
            </div>
            <div className="fld">
              <label htmlFor="login-email">
                Work email
              </label>
              <input id="login-email" className="in" type="email" placeholder="name@yourbank.com" autoComplete="username" />
            </div>
            <div className="fld">
              <label htmlFor="login-pass">
                Password
              </label>
              <input id="login-pass" className="in" type="password" placeholder="Enter your password" autoComplete="current-password" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-8px" }}>
              <DLink href="/forgot-password" style={{ color: "var(--pri)", fontWeight: "600" }}>
                Forgot password?
              </DLink>
            </div>
            <DLink href="/mfa" className="btn pri" style={{ width: "100%", minHeight: "46px", fontSize: "14.5px" }}>
              Sign in
            </DLink>
            <p className="mu sm" style={{ margin: "0", textAlign: "center" }}>
              Invite-only access for authorised bank staff. All sign-ins are logged.
            </p>
          </main>
        </div>
      </div>
    </>
  );
}
