import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Dl, Note, Row } from '../../../components/ui';
import { W, useWallet } from '../shared';
import { download, sh } from '../../../lib/format';
import { TN, tierOf } from '../../../lib/risk';
import { act } from '../../../mocks/store';

// Wallet graph (design: WalletGraph.dc.html). One hop around the wallet, neutral colours (no risk colouring).
const TIERS = ['All tiers', 'Low', 'Moderate', 'High', 'Critical', 'Unknown'];
const MIN = [['0', 'Any'], ['100', '$100'], ['1000', '$1,000']];
const CX = 480, CY = 280, R = 200;

export function Graph() {
  const [p] = useWallet(); const nav = useNavigate();
  const [dir, setDir] = useState('Both');
  const [min, setMin] = useState('0');
  const [risk, setRisk] = useState('All tiers');
  const [sel, setSel] = useState(p.address);
  const svgRef = useRef(null);

  const cps = p.cps.filter((c) =>
    (dir === 'Both' || c.dir === dir || c.dir === 'Both')
    && c.vol >= Number(min)
    && (risk === 'All tiers' || TN[tierOf(c.risk)] === risk));
  const nodes = cps.map((c, i) => {
    const a = (2 * Math.PI * i) / Math.max(cps.length, 1) - Math.PI / 2;
    return { c, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  });

  const chosen = sel === p.address
    ? { address: p.address, label: p.label, tx: p.tx, vol: p.vol }
    : (() => { const c = cps.find((x) => x.a === sel); return c ? { address: c.a, label: c.label, tx: c.n, vol: c.vol } : null; })();

  const exportSvg = () => {
    if (svgRef.current) download(`wallet-graph-${sh(p.address)}.svg`, new XMLSerializer().serializeToString(svgRef.current), 'image/svg+xml');
  };

  return <W active="Graph">
    <Card title="Relationship graph" sub="Click a node for details. Dashed edges are possible, not confirmed, relationships.">
      <div className="tools">
        <label className="sel"><span>Direction</span>
          <select value={dir} onChange={(e) => setDir(e.target.value)} aria-label="Direction">
            {['Both', 'Inbound', 'Outbound'].map((o) => <option key={o} value={o}>{o}</option>)}
          </select></label>
        <label className="sel"><span>Min amount</span>
          <select value={min} onChange={(e) => setMin(e.target.value)} aria-label="Min amount">
            {MIN.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select></label>
        <label className="sel"><span>Risk</span>
          <select value={risk} onChange={(e) => setRisk(e.target.value)} aria-label="Risk tier">
            {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select></label>
        <Btn sm icon="dl" onClick={exportSvg}>Export image</Btn>
      </div>
      <svg ref={svgRef} viewBox="0 0 960 560" width="100%" role="img" aria-label="Wallet relationship graph centred on the selected wallet" style={{ display: 'block', background: '#F8FAFD', borderRadius: 4 }}>
        {nodes.map(({ c, x, y }) => (
          <line key={`e-${c.a}`} x1={CX} y1={CY} x2={x} y2={y} stroke="#94A3B8" strokeWidth="2"
            strokeDasharray={c.dir === 'Both' ? '7 6' : undefined} />
        ))}
        <circle cx={CX} cy={CY} r="34" fill="#1769E0" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{sh(p.address, 4, 4)}</text>
        {nodes.map(({ c, x, y }) => (
          <g key={c.a} onClick={() => setSel(c.a)} style={{ cursor: 'pointer' }} role="button" tabIndex={0}
            aria-label={`Select ${c.label !== 'Unknown' ? c.label : sh(c.a)}`}
            onKeyDown={(e) => { if (e.key === 'Enter') setSel(c.a); }}>
            <circle cx={x} cy={y} r="24" fill="#fff" stroke={sel === c.a ? '#1769E0' : '#CBD5E1'} strokeWidth={sel === c.a ? 3 : 2} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="#0F172A">{sh(c.a, 4, 4)}</text>
            <text x={x} y={y + 40} textAnchor="middle" fontSize="11" fill="#5B6B82">{c.label !== 'Unknown' ? c.label : `$${Math.round(c.vol / 1000)}K`}</text>
          </g>
        ))}
      </svg>
      {!cps.length && <div className="mu" style={{ marginTop: 12 }}>No counterparties match these filters.</div>}
      <div className="legend" style={{ marginTop: 10 }}><span>── Observed transfers</span><span>╌╌ Possible relationship</span></div>
    </Card>
    <Row>
      <Card title={`Selected node: ${chosen && chosen.label !== 'Unknown' ? chosen.label : 'Wallet'}`} style={{ flex: '2 1 420px' }}>
        {chosen ? <>
          <Dl w={170} items={[
            ['Address', sh(chosen.address, 6, 4)],
            ['Label', chosen.label || 'Unknown'],
            ['Transactions with target', String(chosen.tx ?? 0)],
            ['Volume', `$${Math.round(chosen.vol ?? 0).toLocaleString('en-US')}`],
          ]} />
          <div className="acts" style={{ marginTop: 12 }}>
            <Btn sm onClick={() => { act.openWallet(chosen.address); nav(pathOf('WalletOverview')); }}>Open profile</Btn>
            <Btn sm icon="graph" onClick={() => { act.setCtx({ trace: { start: chosen.address } }); nav(pathOf('TransactionTracing')); }}>Trace from here</Btn>
            <Btn sm icon="case" onClick={() => nav(pathOf('CaseCreate'))}>Add to case</Btn>
          </div>
        </> : <div className="mu">Select a node to see its details.</div>}
      </Card>
      <Card title="Graph guidance" style={{ flex: '1 1 300px' }}>
        <Note k="info" icon="info">The graph shows one hop around this wallet. Narrow the filters to focus on the relationships you need.</Note>
        <div style={{ height: 10 }} />
        <Note k="gray" icon="alert">Some relationships are possible, not confirmed. Verify before using as case evidence.</Note>
      </Card>
    </Row>
  </W>;
}

export default Graph;
