import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthLayout, { AuthButton, BackLink } from '../layouts/AuthLayout';
import { Icon, Note, OtpInput } from '../../../components/ui';
import { useStore, act } from '../../../mocks/store';
import { homeOf } from '../../../app/config/paths';
import { maskEmail } from '../../../lib/format';

const RESEND_SECONDS = 30;

// Second factor: a 6-digit code sent to the user's work email. 5 wrong codes end the sign-in.
export default function Mfa() {
  const s = useStore(); const nav = useNavigate();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [err, setErr] = useState('');
  const [left, setLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  if (!s.session.mfa) return <Navigate to="/login" replace />;

  const verify = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setErr('Enter the 6-digit code.'); return; }
    const r = act.verifyMfa(code);
    if (!r.ok) {
      if (r.restart) { nav('/login', { replace: true }); return; }
      setErr(r.error); setOtp(Array(6).fill('')); return;
    }
    nav(homeOf(s.session.role), { replace: true });
  };
  const resend = () => { act.resendMfa(); setLeft(RESEND_SECONDS); setOtp(Array(6).fill('')); setErr(''); };
  const back = () => { act.logout(); nav('/login'); };

  return (
    <AuthLayout>
      <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
        <BackLink onClick={back}><Icon n="left" s={16} />Use a different account</BackLink>
        <div>
          <h2 style={{ fontSize: 28 }}>Check your email</h2>
          <p className="mu" style={{ margin: '6px 0 0' }}>We sent a 6-digit code to <b style={{ color: 'var(--tx)' }}>{maskEmail(s.session.email)}</b>. It expires in 10 minutes.</p>
        </div>
        <Note k="info" icon="help">Demo code: <b className="mono">123456</b></Note>
        {err && <Note k="bad" icon="alert">{err}</Note>}
        <OtpInput value={otp} onChange={(v) => { setOtp(v); setErr(''); }} invalid={!!err} />
        <div className="mu sm" style={{ textAlign: 'center' }}>
          {left > 0 ? <>Resend code in <span className="mono">00:{String(left).padStart(2, '0')}</span></> : <button type="button" className="link" onClick={resend}>Resend code</button>}
        </div>
        <AuthButton type="submit">Verify and continue</AuthButton>
      </form>
    </AuthLayout>
  );
}
