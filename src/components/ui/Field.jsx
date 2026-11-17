
// forms
export const Field = ({ label, req, hint, err, children, w = '1 1 240px', id }) => <div className="fld" style={{ flex: w }}><label htmlFor={id}>{label}{req && <i> *</i>}</label>{children}{err ? <div className="hint err" role="alert">{err}</div> : hint ? <div className="hint">{hint}</div> : null}</div>;
