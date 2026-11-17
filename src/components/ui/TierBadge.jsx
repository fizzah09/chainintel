import { TN, tierOf } from '../../lib/risk';

export const Tier = ({ score, k }) => { const t = k || tierOf(score); return <span className={`tier ${t}`}>{TN[t]}</span>; };
