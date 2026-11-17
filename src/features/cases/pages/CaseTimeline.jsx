import { Card, Empty, Timeline } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { fdt } from '../../../lib/format';

export function CTimeline() {
  const [c, s] = useCase(); const au = s.audit.filter((a) => a.caseId === c.id).reverse();
  return <CW active="Timeline"><Card title="Case timeline">{au.length ? <Timeline items={au.map((a) => ({ t: a.action, who: a.actor, when: fdt(a.at), d: a.object }))} /> : <Empty title="No activity yet" />}</Card></CW>;
}

export default CTimeline;
