import { Card, Dl, Head } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function ErSystem() { const s = useStore(); return <><Head title="System description" /><Card style={{ maxWidth: 800 }}><Dl w={180} items={[['Network', 'Ethereum mainnet'], ['Scoring', `Weighted model v${s.cfg.version}`], ['Trace limits', `${s.settings.traceHops} hops · ${s.settings.traceNodes} nodes · ${s.settings.traceEdges} edges · ${s.settings.tracePeriod} days`], ['Audit', 'Append-only, hash-chained (verifiable)'], ['Access', 'Role-based, MFA required'], ['Retention', s.settings.retention]]} /></Card></>; }

export default ErSystem;
