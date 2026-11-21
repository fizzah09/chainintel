import { MonitoringPanel } from '../../../components/domain/MonitoringPanel';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Addr, Btn, Card, DataTable, Head, Kpis, Status, Tier, useToast } from '../../../components/ui';
import { AlertDetail } from './AlertDetail';
import { ago, csv, download } from '../../../lib/format';
import { CFG, TN } from '../../../lib/risk';
import { useAlerts } from '../../../lib/apiHooks';
import { mapAlerts } from '../../../lib/apiAdapters';
import * as api from '../../../lib/api';
import { act, useStore } from '../../../mocks/store';

export function Alerts({ mine }) {
  const s = useStore(); const nav = useNavigate(); const toast = useToast();

  // Real data from M7 API
  const { data: apiAlerts, refetch } = useAlerts({}, s.session);
  const realAlerts = apiAlerts ? mapAlerts(apiAlerts) : null;

  // Fall back to mock when backend unavailable
  const alerts = realAlerts ?? s.alerts;

  const k = (st) => alerts.filter((a) => a.status === st).length;

  const acknowledge = async (a) => {
    if (a._apiId) {
      try {
        await api.alerts.resolve(a._apiId, { resolution: 'Acknowledged' }, s.session);
        refetch();
        toast('Acknowledged');
      } catch {
        // Fall back to mock action
        act.alertStatus(a.id, 'Acknowledged');
        toast('Acknowledged');
      }
    } else {
      act.alertStatus(a.id, 'Acknowledged');
      toast('Acknowledged');
    }
  };

  return <><Head title="Alerts" desc="Risk, watchlist and system alerts triggered in the last 7 days." acts={<><Btn to={pathOf('WatchlistList')}>Alert rules</Btn><Btn icon="dl" onClick={() => download('alerts.csv', csv(['ID', 'Wallet', 'Trigger', 'Score', 'Time', 'Status'], alerts.map((a) => [a.id, a.wallet, a.trigger, a.score, a.at, a.status])))}>Export</Btn></>} /><MonitoringPanel />
    <Kpis items={[['Total alerts', alerts.length, 'Last 7 days'], ['Critical', alerts.filter((a) => a.score >= CFG.thr[2]).length, 'Needs action', 'crit'], ['Unacknowledged', k('Unacknowledged'), 'Needs attention', 'mod']]} />
    <Card title="Alert queue"><DataTable exportName="alerts" search="Search alerts" searchText={(a) => a.id + a.wallet + a.trigger} rows={alerts} filters={[{ label: 'Status', options: ['Unacknowledged', 'Acknowledged', 'Resolved', 'False Positive'], test: (a, v) => a.status === v }, { label: 'Tier', options: ['Low', 'Moderate', 'High', 'Critical'], test: (a, v) => TN[CFG.thr && (a.score >= CFG.thr[2] ? 'crit' : a.score >= CFG.thr[1] ? 'high' : a.score >= CFG.thr[0] ? 'mod' : 'low')] === v }]}
      cols={[{ h: 'Alert', render: (a) => <button className="link mono" onClick={() => { act.setCtx({ alert: a.id }); nav(pathOf('AlertDetail')); }}>{a.id}</button>, val: (a) => a.id }, { h: 'Wallet', render: (a) => <Addr a={a.wallet} />, val: (a) => a.wallet }, { h: 'Trigger', render: (a) => a.trigger }, { h: 'Tier', render: (a) => <Tier score={a.score} /> }, { h: 'Raised', render: (a) => ago(a.at), val: (a) => a.at }, { h: 'Status', render: (a) => <Status s={a.status} />, val: (a) => a.status }, { h: '', render: (a) => a.status === 'Unacknowledged' && <Btn sm onClick={() => acknowledge(a)}>Acknowledge</Btn> }]} defaultSort={{ i: 5, d: -1 }} /></Card></>;
}

export default Alerts;
