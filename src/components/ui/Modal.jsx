import { Btn } from './Button';

export function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open) return null;
  return <div className="overlay" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal" style={wide ? { maxWidth: 680 } : undefined}><h2 style={{ fontSize: 20 }}>{title}</h2>{children && <div style={{ marginTop: 12 }}>{children}</div>}{footer && <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10, marginTop: children ? 20 : 16 }}>{footer}</div>}</div></div>;
}

export const Confirm = ({ open, title, text, ok = 'Confirm', danger, onOk, onClose }) => <Modal open={open} title={title} onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind={danger ? 'dg' : 'pri'} onClick={() => { onOk(); onClose(); }}>{ok}</Btn></>}><p className="mu" style={{ margin: 0 }}>{text}</p></Modal>;
