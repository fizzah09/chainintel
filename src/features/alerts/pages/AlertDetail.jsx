import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Addr, Btn, Card, Dl, Hash, Head, Row, Status, Tier, useToast } from '../../../components/ui';
import { fdt } from '../../../lib/format';
import { CFG, walletProfile } from '../../../lib/risk';
import { act, can, useStore } from '../../../mocks/store';

export function AlertDetail() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const a = s.alerts.find((x) => x.id === s.ctx.alert) || s.alerts[0]; const p = walletProfile(a.wallet);
  const mk = () => { act.setWizard({ title: `Alert ${a.id}: ${a.trigger}`, subjects: [{ kind: 'wallet', ref: a.wallet, role: 'Primary' }], source: `Alert ${a.id}`, desc: `${a.trigger}. Score moved ${a.from} → ${a.score}.`, priority: a.score >= CFG.thr[2] ? 'Critical' : 'High' }); nav(pathOf('CaseCreate')); };
  return <><Head title={a.id} desc={a.trigger} badge={<Status s={a.status} />} acts={<><Btn disabled={a.status !== 'Unacknowledged'} onClick={() => { act.alertStatus(a.id, 'Acknowledged'); toast('Acknowledged'); }}>Acknowledge</Btn><Btn onClick={() => { act.alertStatus(a.id, 'False Positive'); toast('Marked false positive'); }}>False positive</Btn><Btn onClick={() => { act.alertStatus(a.id, 'Resolved'); toast('Resolved'); }} disabled={a.status === 'Resolved'}>Resolve</Btn><Btn kind="pri" icon="case" onClick={mk} disabled={!can(s, 'create_case')}>Create case</Btn></>} />
    <Row><Card title="Alert details" style={{ flex: '1 1 420px' }}><Dl items={[['Wallet', <Addr a={a.wallet} key="w" />], ['Trigger', a.trigger], ['Score change', `${a.from} → ${a.score}`], ['Tier', <Tier score={a.score} key="t" />], ['Watchlist', a.list], ['Raised', fdt(a.at) + ' UTC'], ['Transaction', <Hash h={a.tx} key="h" />]]} /><div style={{ marginTop: 14, display: 'flex', gap: 10 }}><Btn sm onClick={() => { act.openWallet(a.wallet); nav(pathOf('WalletOverview')); }}>Open wallet</Btn><Btn sm onClick={() => { act.setCtx({ tx: a.tx, wallet: a.wallet }); nav(pathOf('TransactionDetail')); }}>View transaction</Btn></div></Card>
      <Card title="Why this fired" style={{ flex: '1 1 420px' }}>{(a.reasons || []).map((x) => <div key={x} className="ev" style={{ marginBottom: 8 }}><b>{x}</b></div>)}{p.report.factors.slice(0, 4).map((f) => <div key={f.id} className="ev" style={{ marginBottom: 8 }}><b>{f.name} · +{f.points}</b><div className="mu sm">{f.summary}</div></div>)}</Card></Row></>;
}

export default AlertDetail;
