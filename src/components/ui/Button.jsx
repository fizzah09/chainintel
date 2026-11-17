import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export const Btn = ({ children, kind = '', icon, to, onClick, disabled, sm, type = 'button', title }) => {
  const cls = `btn ${kind} ${sm ? 'sm' : ''} ${disabled ? 'dis' : ''}`;
  const inner = <>{icon && <Icon n={icon} s={16} />}{children}</>;
  if (to && !disabled) return <Link to={to} className={cls}>{inner}</Link>;
  return <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title}>{inner}</button>;
};
