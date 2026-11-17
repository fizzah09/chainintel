import { Icon } from './Icon';

export const Check = ({ on, onChange, label, disabled }) => <button type="button" role="checkbox" aria-checked={!!on} aria-label={label} disabled={disabled} className={`cb ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>{on && <Icon n="check" s={13} />}</button>;
