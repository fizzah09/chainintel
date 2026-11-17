import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { LiveTxCard } from '../../../components/domain/OnChain';
import { Addr, Btn, Card, Chip, DataTable, Dl, Gauge, Hash, Head, Icon, Row, Status, Tier, useToast } from '../../../components/ui';
import { AddToCase, DESC, METH } from '../shared';
import { fdt, isTx, num, sh } from '../../../lib/format';
import { attribute, txDetail } from '../../../lib/risk';
import { act, can, useStore } from '../../../mocks/store';

export function TxDetail() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const [m, setM] = useState('prop'); const [add, setAdd] = useState(false);
  const hash = isTx(s.ctx.tx) ? s.ctx.tx : s.ctx.tx;
  const tx = txDetail(hash); const attr = attribute(tx.ins, tx.amount, m); const sum = attr.reduce((a, b) => a + b.v, 0);
  return <><Head title="Transaction detail" acts={<><Btn icon="copy" onClick={() => { navigator.clipboard?.writeText(tx.hash); toast('Hash copied'); }}>Copy hash</Btn><Btn icon="case" disabled={!can(s, 'create_case')} onClick={() => setAdd(true)}>Add to case</Btn><a className="btn" href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer"><Icon n="link" s={16} />View on explorer</a></>} /><LiveTxCard hash={tx.hash} />
    <Card><div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}><div><div className="mono" style={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-all', whiteSpace: 'normal' }}>{tx.hash}</div><div className="mu" style={{ marginTop: 6, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Status s="Success" /><Chip k="blue">ERC-20 · USDT</Chip><Tier score={tx.risk} /><span>Block {num(tx.block)} · {fdt(tx.time)} UTC</span></div></div><div style={{ textAlign: 'right' }}><div className="mu sm">Value</div><div style={{ fontSize: 28, fontWeight: 700 }}>{num(tx.amount)} USDT</div></div></div></Card>
    <Row><Card title="Details" style={{ flex: '1 1 380px' }}><Dl items={[['From', <Addr a={tx.from} key="f" />], ['To', <Addr a={tx.to} key="t" />], ['Gas used', `${num(tx.gas)} · ${tx.gwei} gwei`], ['Fee', `${tx.fee} ETH`], ['Confirmations', num(tx.conf)], ['Nonce', tx.nonce]]} /></Card>
      <Card title="Risk assessment" style={{ flex: '1 1 380px' }}><div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}><Gauge score={tx.risk} size={170} /><div style={{ flex: 1, minWidth: 200 }}><p style={{ margin: '0 0 8px' }}><Tier score={tx.risk} /></p><div className="mu">Source wallet is linked to flagged counterparties within 2 hops. Amount is above the wallet 30-day median.</div><div style={{ marginTop: 12 }}><Btn sm to={pathOf('TransactionRisk')}>See why</Btn></div></div></div></Card></Row>
    <Card title="Source attribution" sub="Switch the attribution method to compare results."><div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }} role="tablist">{Object.entries(METH).map(([k, l]) => <button key={k} role="tab" aria-selected={m === k} className={`btn ${m === k ? 'pri' : ''}`} onClick={() => setM(k)}>{l}</button>)}</div>
      <DataTable tools={false} rows={attr} size={10} cols={[{ h: 'Source wallet', render: (r) => <Addr a={r.w} /> }, { h: 'Attributed amount', r: true, render: (r) => <b>{num(r.v, 2)} USDT</b> }, { h: 'Share', render: (r) => <div className="bar" style={{ width: 200 }}><i style={{ width: `${(r.v / tx.amount) * 100}%`, background: '#1769E0' }} /></div> }]} /><div className="mu sm" style={{ paddingTop: 12 }}>{DESC[m]} Total: {num(sum, 2)} USDT</div></Card>
    <AddToCase open={add} onClose={() => setAdd(false)} build={(cid) => { act.addEvidence({ caseId: cid, title: `Transaction ${sh(tx.hash, 8, 6)}`, type: 'Transaction set', content: tx.hash }); act.addSubject(cid, 'tx', tx.hash, 'Key'); }} /></>;
}

export default TxDetail;
