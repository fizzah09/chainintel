import { useEffect, useRef } from 'react';

/** Six single-digit boxes with paste, arrow-key and backspace support. `value` is an array of digits. */
export function OtpInput({ length = 6, value, onChange, disabled = false, autoFocus = true, invalid = false }) {
  const refs = useRef([]);
  const digits = value || Array(length).fill('');

  useEffect(() => { if (autoFocus) refs.current[0]?.focus(); }, [autoFocus]);

  const set = (i, d) => { const next = [...digits]; next[i] = d; onChange(next); };
  const change = (i, v) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length > 1) return paste(clean, i);
    set(i, clean);
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  };
  const key = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const paste = (text, from = 0) => {
    const got = text.replace(/\D/g, '').slice(0, length - from);
    if (!got) return;
    const next = [...digits];
    got.split('').forEach((c, j) => { next[from + j] = c; });
    onChange(next);
    refs.current[Math.min(from + got.length, length - 1)]?.focus();
  };

  return (
    <div className="otp" role="group" aria-label="One-time code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={d}
          onChange={(e) => change(i, e.target.value)}
          onKeyDown={(e) => key(i, e)}
          onPaste={(e) => { e.preventDefault(); paste(e.clipboardData.getData('text'), 0); }}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          className={invalid ? 'err' : ''}
        />
      ))}
    </div>
  );
}

export default OtpInput;
