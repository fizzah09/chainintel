import { MonitoringPanel } from '../../../components/domain/MonitoringPanel';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Addr, Btn, Card, DataTable, Head, Kpis, Status, Tier, useToast } from '../../../components/ui';
import { AlertDetail } from './AlertDetail';
import { ago, csv, download } from '../../../lib/format';
import { CFG, TN } from '../../../lib/risk';
import { act, useStore } from '../../../mocks/store';

export function Alerts({ mine }) {
  const s = useStore(); const nav = useNavigate(); const toast = useToast();
  const k = (st) => s.alerts.filter((a) => a.status === st).length;
  return <><Head title="Alerts" desc="Wallets that matched a watchlist rule." acts={<Btn icon="dl" onClick={() => download('alerts.csv', csv(['ID', 'Wallet', 'Trigger', 'Score', 'Time', 'Status'], s.alerts.map((a) => [a.id, a.wallet, a.trigger, a.score, a.at, a.status])))}>Export</Btn>} /><MonitoringPanel />
    <Kpis items={[['Unacknowledged', k('Unacknowledged'), 'Needs attention', 'crit'], ['Acknowledged', k('Acknowledged'), 'In progress', 'mod'], ['Resolved', k('Resolved'), 'Closed out', 'low'], ['Total', s.alerts.length, 'All time']]} />
    <Card><DataTable exportName="alerts" search="Search alerts" searchText={(a) => a.id + a.wallet + a.trigger} rows={s.alerts} filters={[{ label: 'Status', options: ['Unacknowledged', 'Acknowledged', 'Resolved', 'False Positive'], test: (a, v) => a.status === v }, { label: 'Tier', options: ['Low', 'Moderate', 'High', 'Critical'], test: (a, v) => TN[CFG.thr && (a.score >= CFG.thr[2] ? 'crit' : a.score >= CFG.thr[1] ? 'high' : a.score >= CFG.thr[0] ? 'mod' : 'low')] === v }]}
      cols={[{ h: 'Alert', render: (a) => <button className="link mono" onClick={() => { act.setCtx({ alert: a.id }); nav(pathOf('AlertDetail')); }}>{a.id}</button>, val: (a) => a.id }, { h: 'Wallet', render: (a) => <Addr a={a.wallet} />, val: (a) => a.wallet }, { h: 'Trigger', render: (a) => a.trigger }, { h: 'Score', render: (a) => <><span className="mu">{a.from} →</span> <b>{a.score}</b></>, val: (a) => a.score }, { h: 'Tier', render: (a) => <Tier score={a.score} /> }, { h: 'Time', render: (a) => ago(a.at), val: (a) => a.at }, { h: 'Status', render: (a) => <Status s={a.status} />, val: (a) => a.status }, { h: '', render: (a) => a.status === 'Unacknowledged' && <Btn sm onClick={() => { act.alertStatus(a.id, 'Acknowledged'); toast('Acknowledged'); }}>Acknowledge</Btn> }]} defaultSort={{ i: 5, d: -1 }} /></Card></>;
}

export default Alerts;
