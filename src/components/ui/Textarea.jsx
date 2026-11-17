import { Field } from './Field';

export const TextArea = ({ label, value, onChange, req, hint, err, placeholder, w }) => { const i = 'f' + label.replace(/\W/g, ''); return <Field label={label} req={req} hint={hint} err={err} w={w} id={i}><textarea id={i} className={`in ${err ? 'err' : ''}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></Field>; };
