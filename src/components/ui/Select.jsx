import { Field } from './Field';

export const SelectIn = ({ label, value, onChange, options, req, hint, err, w }) => { const i = 'f' + label.replace(/\W/g, ''); return <Field label={label} req={req} hint={hint} err={err} w={w} id={i}><select id={i} className={`in ${err ? 'err' : ''}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>{options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o[0]} value={o[0]}>{o[1]}</option>))}</select></Field>; };
