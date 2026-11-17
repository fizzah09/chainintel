import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Dl, Empty, Note, Row, SelectIn, Stack, Tier, WalletGraph, useToast } from '../../../components/ui';
import { Risk } from './RiskTab';
import { Transactions } from './TransactionsTab';
import { W, useWallet } from '../shared';
import { download, sh, usd } from '../../../lib/format';
import { TN, tierOf } from '../../../lib/risk';
import { act } from '../../../mocks/store';

export function Graph() {
  const [p] = useWallet(); const toast = useToast(); const [sel, setSel] = useState(p.cps[0]?.a); const [dir, setDir] = useState('Both'); const [risk, setRisk] = useState('All tiers'); const [min, setMin] = useState('0'); const ref = useRef();
  const nodes = p.cps.filter((c) => (dir === 'Both' || (dir === 'Inbound' ? c.dir !== 'Outbound' : c.dir !== 'Inbound')) && (risk === 'All tiers' || TN[tierOf(c.risk)] === risk) && c.vol >= Number(min)).map((c) => ({ ...c, label: c.label, risk: c.risk, vol: c.vol }));
  const cur = nodes.find((n) => n.a === sel) || nodes[0]; const nav = useNavigate();
  const exp = () => { const svg = ref.current?.querySelector('svg'); if (svg) download('wallet-graph.svg', new XMLSerializer().serializeToString(svg), 'image/svg+xml'); };
  return <W active="Graph"><Card title="Relationship graph" sub="Click a node for details. Dashed edges are possible, not confirmed, relationships."><div className="tools"><SelectIn label="Direction" value={dir} onChange={setDir} options={['Both', 'Inbound', 'Outbound']} w="0 1 160px" /><SelectIn label="Risk" value={risk} onChange={setRisk} options={['All tiers', 'Low', 'Moderate', 'High', 'Critical']} w="0 1 160px" /><SelectIn label="Min volume" value={min} onChange={setMin} options={[['0', 'Any'], ['50000', '$50K'], ['100000', '$100K']]} w="0 1 160px" /><span style={{ marginLeft: 'auto' }}><Btn sm icon="dl" onClick={exp}>Export image</Btn></span></div>
    <div ref={ref}>{nodes.length ? <WalletGraph center={p} nodes={nodes} sel={cur?.a} onSel={setSel} /> : <Empty icon="graph" title="No nodes match these filters" desc="Relax the filters to see counterparties." />}</div></Card>
    <Row>{cur && <Card title={`Selected node: ${cur.label === 'Unknown' ? sh(cur.a) : cur.label}`} style={{ flex: '1 1 380px' }}><Dl w={170} items={[['Address', <span className="mono" key="a">{sh(cur.a)}</span>], ['Risk', <Tier score={cur.risk} key="r" />], ['Label', cur.label], ['Transactions with wallet', `${cur.n} · ${usd(cur.vol)}`]]} /><div style={{ display: 'flex', gap: 10, marginTop: 14 }}><Btn sm onClick={() => { act.openWallet(cur.a); nav(pathOf('WalletOverview')); }}>Open profile</Btn><Btn sm icon="graph" onClick={() => { act.setCtx({ trace: { start: cur.a } }); nav(pathOf('TransactionTracing')); }}>Trace from here</Btn></div></Card>}
      <Card title="Graph guidance" style={{ flex: '1 1 380px' }}><Stack gap={10}><Note k="info" icon="help">Graphs are capped at 100 nodes and 250 edges by default. Narrow the filters to see more detail.</Note><Note>Some relationships are possible, not confirmed. Verify before using as case evidence.</Note></Stack></Card></Row></W>;
}

export default Graph;
