import { Icon } from './Icon';

export const Stepper = ({ steps, cur }) => <div className="step">{steps.map((t, i) => <div key={t} className={`s ${i < cur ? 'done' : i === cur ? 'cur' : ''}`}><em>{i < cur ? <Icon n="check" s={14} /> : i + 1}</em><span>{t}</span>{i < steps.length - 1 && <hr />}</div>)}</div>;
