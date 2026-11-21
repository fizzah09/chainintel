import { Logo } from '../../../components/ui';

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth-l">
        <div className="brand"><Logo s={28} inv /><b style={{ fontSize: 21 }}>Chain Intel</b></div>
        <div>
          <h1>Blockchain wallet intelligence for regulated banks</h1>
          <p>Monitor wallets, trace transactions, score risk with explainable evidence and run investigations with a complete audit trail.</p>
        </div>
        <div style={{ color: '#7E94B6', fontSize: 12.5 }}>Ethereum Mainnet · Tenant isolated · Role-based access</div>
      </div>
      <div className="auth-r"><main>{children}</main></div>
    </div>
  );
}

export const AuthButton = ({ children, ...p }) => <button className="btn pri" style={{ width: '100%', minHeight: 42, fontSize: 14 }} {...p}>{children}</button>;
export const BackLink = ({ children, ...p }) => <button type="button" className="link" style={{ textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--mu)', fontWeight: 500 }} {...p}>{children}</button>;
