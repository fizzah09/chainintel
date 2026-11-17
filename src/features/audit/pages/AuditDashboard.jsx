import { pathOf } from '../../../app/config/paths';
import { byStatus } from '../../../components/domain/workspace';
import { Bars, Btn, Card, Head, Kpis } from '../../../components/ui';
import { STAGES, useStore } from '../../../mocks/store';

export function AudDash() { const s = useStore(); return <><Head title="Audit dashboard" desc="Read-only overview for audit and assurance." acts={<Btn kind="pri" to={pathOf('CaseAuditTrail')}>Audit trail</Btn>} /><Kpis items={[['Cases', s.cases.length, 'In scope'], ['Evidence items', s.evidence.length, `${s.evidence.filter((e) => e.status === 'Verified').length} verified`], ['Reviews', s.reviews.length, 'Recorded'], ['Audit entries', s.audit.length, 'Hash-chained']]} /><Card title="Cases by stage"><Bars vals={byStatus(s.cases).map((x) => x[1])} labels={STAGES.map((x) => x.split(' ')[0])} /></Card></>; }

export default AudDash;
