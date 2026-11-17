import { Logo } from '../../../components/ui';

const LEDGER = [['#48211', 'Evidence EVD-000186 attached', '9f3c…a71e'], ['#48212', 'Finding FND-0014 added', '2b80…c4d9'], ['#48213', 'Case submitted for review', 'e61a…07f2']];

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth-l">
        <div className="brand"><Logo s={28} inv /><b style={{ fontSize: 21 }}>Chain Intel</b></div>
        <div>
          <div className="eyebrow" style={{ color: '#93A8C8', marginBottom: 14 }}>Wallet intelligence for regulated banks</div>
          <h1>Every score explained. Every action on the record.</h1>
          <p>Monitor wallets, trace funds, and run investigations where each step is written to a tamper-evident audit trail.</p>
        </div>
        <div className="ledger" aria-hidden="true">
          {LEDGER.flatMap((r, i) => [<span key={i + 'a'}>{r[0]}</span>, <b key={i + 'b'}>{r[1]}</b>, <span key={i + 'c'}>{r[2]}</span>])}
        </div>
      </div>
      <div className="auth-r"><main>{children}</main></div>
    </div>
  );
}

export const AuthButton = ({ children, ...p }) => <button className="btn pri" style={{ width: '100%', minHeight: 42, fontSize: 14 }} {...p}>{children}</button>;
export const BackLink = ({ children, ...p }) => <button type="button" className="link" style={{ textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--mu)', fontWeight: 500 }} {...p}>{children}</button>;
