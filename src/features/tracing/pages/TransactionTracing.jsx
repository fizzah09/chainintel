import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Addr, Btn, Card, Chip, DataTable, FlowGraph, Head, Note, Row, SelectIn, Stack, TextIn, useToast } from '../../../components/ui';
import { AddToCase, DEF, METHODS, getCase } from '../shared';
import { download, fdt, isAddr, isTx, num, sh } from '../../../lib/format';
import { LIM, PERIODS, TG, trace as traceSync } from '../../../lib/risk';
import { useTrace } from '../../../lib/apiHooks';
import { act, can, useStore } from '../../../mocks/store';

/** Map M5 backend trace result to the shape FlowGraph / DataTable expect. */
function adaptBackendTrace(r) {
  if (!r) return null;

  // Build node map for edge rendering
  const nodeMap = {};
  for (const n of r.nodes ?? []) nodeMap[n.address] = n;

  const edges = (r.edges ?? []).map((e) => ({
    from: e.from_address ?? e.from,
    to: e.to_address ?? e.to,
    usd: e.usd_value ?? e.usd ?? 0,
    basis: e.basis ?? 'Observed',
    time: e.block_time ?? e.time ?? '',
    amt: e.usd_value ?? e.usd ?? 0,
    sym: 'USD',
  }));

  const hops = edges.map((e) => ({
    from: e.from,
    to: e.to,
    amt: e.usd,
    time: e.time,
    basis: e.basis,
  }));

  const nodes = (r.nodes ?? []).map((n) => ({
    id: n.address,
    address: n.address,
    label: n.label ?? '',
    score: n.risk_score ?? 0,
    hop: n.hop ?? 0,
    entity: n.entity_type ?? 'Unknown',
  }));

  const chain = r.path ?? (r.nodes ?? []).map((n) => n.address);

  return {
    nodes,
    edges,
    hops,
    chain,
    shown: nodes.length,
    total: r.total_nodes ?? nodes.length,
    edges: edges.length,
    truncated: r.truncated ?? false,
    // keep raw for export
    _raw: r,
  };
}

export function Tracing({ forceHops }) {
  const s = useStore(); const nav = useNavigate(); const toast = useToast();
  const saved = s.ctx.trace || {};
  const [f, setF] = useState({ ...DEF, start: saved.start || TG, ...saved, ...(forceHops ? { hops: String(forceHops) } : {}) });
  const [err, setErr] = useState('');
  const [run, setRun] = useState(f);
  const [sel, setSel] = useState(null);
  const [add, setAdd] = useState(false);
  const [backendResult, setBackendResult] = useState(null);

  const { runTrace, loading: tracing, error: traceErr } = useTrace();
  const set = (k) => (v) => setF({ ...f, [k]: v });

  // Synchronous mock trace — used as fallback
  const mockT = useMemo(() => traceSync(run.start, run), [run]);

  // The displayed trace — backend result when available, otherwise mock
  const t = backendResult ?? mockT;

  const go = async () => {
    if (!isAddr(f.start) && !isTx(f.start)) { setErr('Enter a valid wallet address or transaction hash.'); return; }
    setErr('');
    const params = { ...f };
    setRun(params);
    act.setCtx({ trace: { ...f } });
    act.openWallet(isAddr(f.start) ? f.start : s.ctx.wallet);

    // Try backend M5 trace
    const dirMap = { 'Forward': 'forward', 'Backward': 'backward', 'Forward and backward': 'both' };
    const periodDays = PERIODS[f.period] ?? 90;
    const apiResult = await runTrace(
      f.start,
      1,
      {
        hops: parseInt(f.hops, 10) || 3,
        direction: dirMap[f.dir] ?? 'forward',
        period_days: periodDays,
        min_usd: parseFloat(f.min) || 0,
        method: (f.method || 'Proportional').toLowerCase(),
      },
      s.session,
    );

    if (apiResult) {
      setBackendResult(adaptBackendTrace(apiResult));
    } else {
      // Backend unavailable or empty — keep mock trace (already updated via setRun)
      setBackendResult(null);
    }
  };

  return <><Head title="Transaction tracing" desc="Follow funds across wallets using temporal, FIFO or proportional attribution." acts={<><Btn icon="dl" onClick={() => download('trace.json', JSON.stringify({ params: run, result: t }, null, 2), 'application/json')}>Save trace</Btn><Btn kind="pri" icon="case" disabled={!can(s, 'create_case')} onClick={() => setAdd(true)}>Add to case</Btn></>} />
    <Card><form onSubmit={(e) => { e.preventDefault(); go(); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>
      <TextIn label="Start wallet or transaction hash" req value={f.start} onChange={set('start')} err={err} w="2 1 320px" /><SelectIn label="Direction" value={f.dir} onChange={set('dir')} options={['Forward', 'Backward', 'Forward and backward']} w="1 1 170px" /><SelectIn label="Hops" value={f.hops} onChange={set('hops')} options={['1', '2', '3', '4', '5']} w="0 1 90px" />
      <SelectIn label="Period" value={f.period} onChange={set('period')} options={Object.keys(PERIODS)} w="1 1 150px" /><SelectIn label="Min amount" value={f.min} onChange={set('min')} options={[['0', 'Any'], ['100', '100 USDT'], ['1000', '1,000 USDT']]} w="1 1 130px" /><SelectIn label="Attribution" value={f.method} onChange={set('method')} options={METHODS.map((m) => m[0])} w="1 1 150px" />
      <div style={{ paddingTop: 24 }}><Btn kind="pri" icon="play" type="submit" disabled={!can(s, 'run_trace') || tracing}>{tracing ? 'Tracing…' : 'Run trace'}</Btn></div></form></Card>
    {traceErr && <Note k="warn" icon="alert">Backend trace failed ({traceErr}). Showing simulated graph.</Note>}
    {t.truncated && <Note icon="alert"><b>Showing {t.shown} of {t.total} nodes.</b> The graph was truncated at the default limit ({LIM.nodes} nodes, {LIM.edges} edges). Reduce hops or period, or raise the minimum amount.</Note>}
    <Card title="Trace result" sub={`Path: ${t.chain.map((a) => sh(a, 4, 4)).join(' → ')}`}><div className="tools" style={{ marginBottom: 12 }}><Chip k="blue">{run.hops} hops</Chip><Chip k="gray">{t.shown} nodes</Chip><Chip k="gray">{t.edges} edges</Chip><Chip k={t.truncated ? 'warn' : 'ok'}>{t.truncated ? 'Limit reached' : `Within limits (${LIM.nodes} nodes · ${LIM.edges} edges)`}</Chip>{backendResult && <Chip k="ok">Live data</Chip>}</div><FlowGraph t={t} sel={sel} onSel={setSel} /></Card>
    <Row><Card title="Path summary" style={{ flex: '2 1 560px' }}><DataTable tools={false} size={8} rows={t.hops.map((h, i) => ({ ...h, i }))} cols={[{ h: 'Hop', render: (h) => h.i + 1 }, { h: 'From', render: (h) => <Addr a={h.from} /> }, { h: 'To', render: (h) => <Addr a={h.to} /> }, { h: 'Amount', render: (h) => `${num(h.amt)} USDT` }, { h: 'Time', render: (h) => fdt(h.time) }, { h: 'Basis', render: (h) => <Chip k={h.basis === 'Observed' ? 'ok' : 'gray'}>{h.basis}</Chip> }]} /></Card>
      <Card title="Attribution method" style={{ flex: '1 1 300px' }}><Stack gap={10}>{METHODS.map(([m, d]) => <button key={m} type="button" onClick={() => setF({ ...f, method: m })} style={{ textAlign: 'left', padding: 12, border: `1px solid ${f.method === m ? '#1769E0' : '#E2E8F0'}`, borderRadius: 4, background: f.method === m ? '#F3F8FF' : '#fff', cursor: 'pointer' }}><b>{m}</b><div className="mu sm">{d}</div></button>)}</Stack></Card></Row>
    <AddToCase open={add} onClose={() => setAdd(false)} build={(cid) => { act.addEvidence({ caseId: cid, title: `Trace result (${run.hops} hops) from ${sh(run.start)}`, type: 'Graph image', content: JSON.stringify(t.hops) }); t.chain.slice(0, 3).forEach((a) => { const c = getCase(cid); if (!c.subjects.some((x) => x.ref.toLowerCase() === a.toLowerCase())) act.addSubject(cid, 'wallet', a, 'Related'); }); }} /></>;
}

export default Tracing;
