import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Addr, Btn, Card, DataTable, Empty, Head, Kpis, Modal, SelectIn, SetRow, Stack, TextIn, Tier, Toggle, useToast } from '../../../components/ui';
import { csv, download, fd } from '../../../lib/format';
import { walletProfile } from '../../../lib/risk';
import { act, useStore } from '../../../mocks/store';

export function WatchDetail() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const w = s.watchlists.find((x) => x.id === s.ctx.watchlist) || s.watchlists[0]; const [a, setA] = useState(''); const [err, setErr] = useState(''); const [ed, setEd] = useState(false); const [v, setV] = useState({});
  if (!w) return <Empty title="No watchlists" />;
  const add = () => { const r = act.addToWatchlist(w.id, a.trim()); if (!r.ok) return setErr(r.error); setA(''); setErr(''); toast(`Added (score ${r.score})`); };
  return <><Head title={w.name} desc={`${w.scope} watchlist · ${w.wallets.length} wallets · ${w.rule === 'any' ? 'alert on any activity' : `alert at score ≥ ${w.thr}`}`} acts={<><Btn icon="edit" onClick={() => { setV({ name: w.name, thr: w.thr, rule: w.rule, email: w.email, app: w.app }); setEd(true); }}>Edit rules</Btn><Btn icon="dl" onClick={() => download(`${w.name}.csv`, csv(['Wallet', 'Added', 'By'], w.wallets.map((x) => [x.a, x.added, x.by])))}>Export</Btn></>} />
    <Kpis items={[['Wallets', w.wallets.length, 'On this list'], ['Rule', w.rule === 'any' ? 'Any' : `≥ ${w.thr}`, 'Alert trigger'], ['Open alerts', s.alerts.filter((x) => x.list === w.name && x.status !== 'Resolved').length, 'From this list', 'high'], ['Notifications', [w.app && 'In-app', w.email && 'Email'].filter(Boolean).join(' + ') || 'Off', '']]} />
    <Card title="Wallets" act={<><input className="in" style={{ width: 300, minHeight: 32 }} placeholder="0x… wallet address" value={a} onChange={(e) => { setA(e.target.value); setErr(''); }} aria-label="Wallet" /><Btn kind="pri" sm icon="plus" onClick={add}>Add wallet</Btn></>}>{err && <div className="hint err" role="alert">{err}</div>}
      <DataTable exportName="wallets" rows={w.wallets.map((x) => ({ ...x, p: walletProfile(x.a) }))} tools={false} size={10} cols={[{ h: 'Wallet', render: (x) => <Addr a={x.a} />, val: (x) => x.a }, { h: 'Score', render: (x) => x.p.score, val: (x) => x.p.score }, { h: 'Tier', render: (x) => <Tier score={x.p.score} /> }, { h: 'Added', render: (x) => fd(x.added) + ' by ' + x.by }, { h: 'Last alert', render: (x) => { const d = s.alerts.filter((a) => a.wallet.toLowerCase() === x.a.toLowerCase()).map((a) => a.at).sort().pop(); return d ? fd(d) : '—'; } },{ h: '', render: (x) => <><Btn sm onClick={() => { act.openWallet(x.a); nav(pathOf('WalletOverview')); }}>Open</Btn> <Btn sm kind="danger" onClick={() => { act.removeFromWatchlist(w.id, x.a); toast('Removed'); }}>Remove</Btn></> }]} /></Card>
    <Modal open={ed} title="Edit rules" onClose={() => setEd(false)} footer={<><Btn onClick={() => setEd(false)}>Cancel</Btn><Btn kind="pri" onClick={() => { const t = Number(v.thr); if (v.rule === 'score' && !(t >= 0 && t <= 100)) return toast('Threshold must be 0–100', 'bad'); act.updateWatchlist(w.id, { rule: v.rule, thr: v.rule === 'any' ? 0 : t, email: v.email, app: v.app }); toast('Rules saved'); setEd(false); }}>Save</Btn></>}><Stack gap={14}><SelectIn label="Alert rule" value={v.rule} onChange={(x) => setV({ ...v, rule: x })} options={[['score', 'Score at or above threshold'], ['any', 'Any activity']]} />{v.rule === 'score' && <TextIn label="Threshold" type="number" value={v.thr} onChange={(x) => setV({ ...v, thr: x })} />}<SetRow title="In-app"><Toggle on={v.app} onChange={(x) => setV({ ...v, app: x })} label="In-app" /></SetRow><SetRow title="Email"><Toggle on={v.email} onChange={(x) => setV({ ...v, email: x })} label="Email" /></SetRow></Stack></Modal></>;
}

export default WatchDetail;
