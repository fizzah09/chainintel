import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { AuthButton } from '../layouts/AuthLayout';
import { Note, SelectIn, TextIn } from '../../../components/ui';
import { act } from '../../../mocks/store';
import { ACCOUNTS, ROLE_NAMES } from '../../../mocks/seed';

// Invite-only: there is no sign-up and no wallet sign-in. Accounts are created by a Bank Admin or Super Admin.
export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    const r = act.login(email, pw);
    setBusy(false);
    if (!r.ok) { setErr({ [r.field]: r.error }); return; }
    nav('/mfa');
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
        <div>
          <h2 style={{ fontSize: 28 }}>Sign in</h2>
          <p className="mu" style={{ margin: '6px 0 0' }}>Use your bank-issued credentials to continue.</p>
        </div>
        {err.form && <Note k="bad" icon="alert">{err.form}</Note>}
        <TextIn label="Work email" req value={email} onChange={(v) => { setEmail(v); setErr({}); }} err={err.email} placeholder="name@yourbank.com" />
        <TextIn label="Password" req type="password" value={pw} onChange={(v) => { setPw(v); setErr({}); }} err={err.password} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Link to="/forgot-password" style={{ color: 'var(--pri)', fontWeight: 600 }}>Forgot password?</Link></div>
        <AuthButton type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</AuthButton>
        <Note k="info" icon="lock">Invite-only access for authorised bank staff. All sign-ins are logged.</Note>
        <details className="demo">
          <summary>Demo accounts</summary>
          <div style={{ marginTop: 10 }}>
            <SelectIn label="Fill in a demo account" value={email} onChange={(v) => { setEmail(v); setPw(pw || 'demo-pass-1'); setErr({}); }} options={[['', 'Choose a role…'], ...ACCOUNTS.map((a) => [a.email, `${ROLE_NAMES[a.role]} · ${a.name}`])]} hint="Prototype only. Any password of 6+ characters works until you reset it." />
          </div>
        </details>
      </form>
    </AuthLayout>
  );
}
