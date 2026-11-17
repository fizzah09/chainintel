import { MonitoringPanel } from '../../../components/domain/MonitoringPanel';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Chip, Confirm, DataTable, Head, useToast } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function WatchList() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const [del, setDel] = useState(null);
  return <><Head title="Watchlists" desc="Groups of wallets monitored against alert rules." acts={<Btn kind="pri" icon="plus" to={pathOf('WatchlistCreate')}>New watchlist</Btn>} /><MonitoringPanel />
    <Card><DataTable exportName="watchlists" search="Search watchlists" searchText={(w) => w.name + w.owner} rows={s.watchlists} filters={[{ label: 'Scope', options: ['Personal', 'Tenant', 'Platform'], test: (w, v) => w.scope === v }]}
      cols={[{ h: 'Name', render: (w) => <button className="link" onClick={() => { act.setCtx({ watchlist: w.id }); nav(pathOf('WatchlistDetail')); }}>{w.name}</button>, val: (w) => w.name }, { h: 'Scope', render: (w) => <Chip k="gray">{w.scope}</Chip>, val: (w) => w.scope }, { h: 'Wallets', render: (w) => w.wallets.length, val: (w) => w.wallets.length }, { h: 'Rule', render: (w) => (w.rule === 'any' ? 'Any activity' : `Score ≥ ${w.thr}`) }, { h: 'Owner', render: (w) => w.owner, val: (w) => w.owner }, { h: 'Updated', render: (w) => fd(w.updated), val: (w) => w.updated }, { h: '', render: (w) => <Btn sm kind="danger" disabled={w.scope === 'Platform' && s.session.role !== 'pa'} onClick={() => setDel(w)}>Delete</Btn> }]} defaultSort={{ i: 5, d: -1 }} /></Card>
    <Confirm open={!!del} danger title="Delete watchlist?" text={`"${del?.name}" and its ${del?.wallets.length} wallets will be removed. Existing alerts are kept.`} ok="Delete" onOk={() => { act.deleteWatchlist(del.id); toast('Watchlist deleted'); }} onClose={() => setDel(null)} /></>;
}

export default WatchList;
