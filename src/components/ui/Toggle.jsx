
export const Toggle = ({ on, onChange, label, disabled }) => <button type="button" role="switch" aria-checked={!!on} aria-label={label} disabled={disabled} className={`tg ${on ? 'on' : ''}`} onClick={() => onChange(!on)}><i /></button>;
