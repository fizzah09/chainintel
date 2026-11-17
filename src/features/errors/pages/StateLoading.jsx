import { Card, Head, Kpis } from '../../../components/ui';

export function StateLoading() { return <><Head title="Loading wallet…" /><Kpis items={[1, 2, 3, 4].map(() => ['', '', ''])} /><Card>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="sk" style={{ margin: '16px 0' }} />)}</Card></>; }

export default StateLoading;
