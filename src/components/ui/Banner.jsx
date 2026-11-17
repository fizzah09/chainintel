import { Icon } from './Icon';

export const Note = ({ k = '', icon = 'alert', children }) => <div className={`note ${k}`}><Icon n={icon} s={18} /><div>{children}</div></div>;
