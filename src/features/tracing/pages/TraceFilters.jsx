import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Dl, Head, Note, Row, SelectIn, useToast } from '../../../components/ui';
import { DEF } from '../shared';
import { PERIODS } from '../../../lib/risk';
import { act, useStore } from '../../../mocks/store';

export function TraceFilters() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const sv = s.ctx.trace || {}; const [f, setF] = useState({ ...DEF, start: '', ...sv });
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return <><Head title="Trace filters" desc="Control how much of the graph is retrieved and displayed." />
    <Row><Card title="Filters" style={{ flex: '1 1 440px' }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}><SelectIn label="Direction" value={f.dir} onChange={set('dir')} options={['Forward', 'Backward', 'Forward and backward']} /><SelectIn label="Hops" value={f.hops} onChange={set('hops')} options={['1', '2', '3', '4', '5']} /></div><div style={{ height: 14 }} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}><SelectIn label="Period" value={f.period} onChange={set('period')} options={Object.keys(PERIODS)} /><SelectIn label="Minimum amount" value={f.min} onChange={set('min')} options={[['0', 'Any'], ['100', '100 USDT'], ['1000', '1,000 USDT']]} /></div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}><Btn kind="pri" onClick={() => { act.setCtx({ trace: f }); nav(pathOf('TransactionTracing')); }}>Apply filters</Btn><Btn onClick={() => setF({ ...DEF, start: f.start })}>Reset</Btn></div></Card>
      <Card title="Default limits" style={{ flex: '1 1 360px' }}><Dl w={110} items={[['Hops', <b key="h">{s.settings.traceHops}</b>], ['Nodes', <b key="n">{s.settings.traceNodes}</b>], ['Edges', <b key="e">{s.settings.traceEdges}</b>], ['Period', <b key="p">{s.settings.tracePeriod} days</b>]]} /><div style={{ marginTop: 14 }}><Note k="info" icon="help">Platform Admin can change these defaults. Larger limits can slow rendering.</Note></div></Card></Row></>;
}

export default TraceFilters;
