import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout, { AuthButton, BackLink } from '../layouts/AuthLayout';
import { Icon, Note, OtpInput, Stepper, TextIn } from '../../../components/ui';
import { act } from '../../../mocks/store';

const RESEND_SECONDS = 30;
const STEPS = ['Email', 'Code', 'New password'];

// Password reset by email OTP: email -> 6-digit code -> new password. No reset links.
export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // email | otp | reset | done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [token, setToken] = useState(null);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [left, setLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (step !== 'otp' || left <= 0) return undefined;
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [step, left]);

  const clearCode = () => setOtp(Array(6).fill(''));

  const sendCode = (e) => {
    e.preventDefault();
    const r = act.requestPasswordReset(email);
    if (!r.ok) { setErr(r.error); return; }
    setErr(''); clearCode(); setLeft(RESEND_SECONDS); setStep('otp');
  };
  const verifyCode = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setErr('Enter the 6-digit code.'); return; }
    const r = act.verifyPasswordReset(email, code);
    if (!r.ok) { setErr(r.error); clearCode(); if (r.restart) setStep('email'); return; }
    setErr(''); setToken(r.resetToken); setStep('reset');
  };
  const savePassword = (e) => {
    e.preventDefault();
    if (pw !== pw2) { setErr('Passwords do not match.'); return; }
    const r = act.resetPassword(email, token, pw);
    if (!r.ok) { setErr(r.error); if (/expired/.test(r.error)) setStep('email'); return; }
    setErr(''); setStep('done');
  };
  const resend = () => { act.requestPasswordReset(email); setLeft(RESEND_SECONDS); clearCode(); setErr(''); };

  const cur = { email: 0, otp: 1, reset: 2, done: 3 }[step];
  return (
    <AuthLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {step === 'email' && <Link to="/login" className="mu" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon n="left" s={16} />Back to sign in</Link>}
        {step === 'otp' && <BackLink onClick={() => { setStep('email'); setErr(''); clearCode(); }}><Icon n="left" s={16} />Change email</BackLink>}
        {step !== 'done' && <Stepper steps={STEPS} cur={cur} />}

        {step === 'email' && (
          <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
            <div>
              <h2 style={{ fontSize: 28 }}>Reset your password</h2>
              <p className="mu" style={{ margin: '6px 0 0' }}>Enter your work email. If it matches an account, we send a 6-digit code valid for 10 minutes.</p>
            </div>
            <TextIn label="Work email" req value={email} onChange={(v) => { setEmail(v); setErr(''); }} err={err} placeholder="analyst@examplebank.com" />
            <AuthButton type="submit">Send code</AuthButton>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
            <div>
              <h2 style={{ fontSize: 28 }}>Enter the code</h2>
              <p className="mu" style={{ margin: '6px 0 0' }}>If <b style={{ color: 'var(--tx)', wordBreak: 'break-all' }}>{email.trim()}</b> has an account, a 6-digit code is on its way.</p>
            </div>
            <Note k="info" icon="help">Demo code: <b className="mono">123456</b></Note>
            {err && <Note k="bad" icon="alert">{err}</Note>}
            <OtpInput value={otp} onChange={(v) => { setOtp(v); setErr(''); }} invalid={!!err} />
            <div className="mu sm" style={{ textAlign: 'center' }}>
              {left > 0 ? <>Resend code in <span className="mono">00:{String(left).padStart(2, '0')}</span></> : <button type="button" className="link" onClick={resend}>Resend code</button>}
            </div>
            <AuthButton type="submit">Verify code</AuthButton>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
            <div>
              <h2 style={{ fontSize: 28 }}>Set a new password</h2>
              <p className="mu" style={{ margin: '6px 0 0' }}>For <b style={{ color: 'var(--tx)', wordBreak: 'break-all' }}>{email.trim()}</b>. This session expires in 5 minutes.</p>
            </div>
            {err && <Note k="bad" icon="alert">{err}</Note>}
            <TextIn label="New password" req type="password" value={pw} onChange={(v) => { setPw(v); setErr(''); }} hint="At least 8 characters, with a letter and a number." />
            <TextIn label="Confirm new password" req type="password" value={pw2} onChange={(v) => { setPw2(v); setErr(''); }} err={pw2 && pw !== pw2 ? 'Passwords do not match.' : ''} />
            <AuthButton type="submit">Reset password</AuthButton>
          </form>
        )}

        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ color: 'var(--low)' }}><Icon n="check" s={36} /></div>
            <div>
              <h2 style={{ fontSize: 28 }}>Password updated</h2>
              <p className="mu" style={{ margin: '6px 0 0' }}>Sign in with your new password. Other sessions for this account have been signed out.</p>
            </div>
            <Link to="/login" className="btn pri" style={{ minHeight: 42 }}>Back to sign in</Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
