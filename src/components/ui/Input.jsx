import { Field } from './Field';

export const TextIn = ({ label, value, onChange, req, hint, err, placeholder, type = 'text', w, disabled, id }) => { const i = id || 'f' + label.replace(/\W/g, ''); return <Field label={label} req={req} hint={hint} err={err} w={w} id={i}><input id={i} className={`in ${err ? 'err' : ''} ${disabled ? 'dis' : ''}`} type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} aria-invalid={!!err} /></Field>; };
