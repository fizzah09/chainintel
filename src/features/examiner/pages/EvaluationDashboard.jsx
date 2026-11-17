import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Head, Kpis, Row, SetRow } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function ErDash() { const s = useStore(); return <><Head title="Examiner overview" desc="Read-only view of methodology, sources and validation." /><Kpis items={[['Methodology version', `v${s.cfg.version}`, 'Active'], ['Data sources', s.providers.filter((p) => p.on).length, `of ${s.providers.length} enabled`], ['Validation pass rate', '97.4%', 'Last run'], ['Audit entries', s.audit.length, 'Verifiable']]} /><Row><Card title="Quick links" style={{ flex: '1 1 400px' }}>{[['ER_Method', 'Risk methodology'], ['ER_Sources', 'Data sources'], ['ER_Validation', 'Validation results'], ['ER_System', 'System description']].map(([k, l]) => <SetRow key={k} title={l}><Btn sm to={pathOf(k)}>Open</Btn></SetRow>)}</Card></Row></>; }

export default ErDash;
