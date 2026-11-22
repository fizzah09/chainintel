import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Head, SelectIn, SetRow, TextArea, TextIn, Toggle, useToast } from '../../../components/ui';
import { isAddr } from '../../../lib/format';
import { CFG } from '../../../lib/risk';
import { act, useStore } from '../../../mocks/store';

export function WatchCreate() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const [v, setV] = useState({ name: '', scope: 'Personal', desc: '', rule: 'score', thr: 75, email: false, app: true, seed: '' }); const [err, setErr] = useState({});
  const set = (k) => (x) => { setV({ ...v, [k]: x }); setErr({}); };
  const save = () => {
    const e = {}; if (v.name.trim().length < 3) e.name = 'Enter a name of at least 3 characters.'; else if (s.watchlists.some((w) => w.name.toLowerCase() === v.name.trim().toLowerCase())) e.name = 'A watchlist with this name already exists.';
    const thr = Number(v.thr); if (v.rule === 'score' && (!(thr >= 0 && thr <= 100))) e.thr = 'Threshold must be between 0 and 100.';
    const seeds = v.seed.split(/[\s,]+/).filter(Boolean); if (seeds.some((x) => !isAddr(x))) e.seed = 'One or more addresses are invalid.';
    if (Object.keys(e).length) return setErr(e);
    const id = act.createWatchlist({ name: v.name.trim(), scope: v.scope, desc: v.desc, rule: v.rule, thr: v.rule === 'any' ? 0 : thr, email: v.email, app: v.app });
    seeds.forEach((a) => act.addToWatchlist(id, a)); act.setCtx({ watchlist: id }); toast('Watchlist created'); nav(pathOf('WatchlistDetail'));
  };
  return <><Head title="Create watchlist" desc="Define what to watch and when to alert." /><Card style={{ maxWidth: 860 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}><TextIn label="Name" req value={v.name} onChange={set('name')} err={err.name} w="2 1 340px" /><SelectIn label="Scope" value={v.scope} onChange={set('scope')} options={['Personal', 'Tenant', ...(s.session.role === 'pa' ? ['Platform'] : [])]} /></div><div style={{ height: 14 }} />
    <TextArea label="Description" value={v.desc} onChange={set('desc')} /><div style={{ height: 14 }} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}><SelectIn label="Alert when" value={v.rule} onChange={set('rule')} options={[['score', 'Score at or above threshold'], ['any', 'Any activity']]} />{v.rule === 'score' && <TextIn label="Threshold" type="number" value={v.thr} onChange={set('thr')} err={err.thr} hint={`Critical starts at ${CFG.thr[2]}`} />}</div><div style={{ height: 14 }} />
    <SetRow title="In-app notification"><Toggle on={v.app} onChange={set('app')} label="In-app" /></SetRow><div style={{ height: 14 }} />
    <TextArea label="Initial wallets (optional)" value={v.seed} onChange={set('seed')} err={err.seed} hint="Paste addresses separated by spaces, commas or new lines." />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}><Btn onClick={() => nav(pathOf('WatchlistList'))}>Cancel</Btn><Btn kind="pri" icon="check" onClick={save}>Create watchlist</Btn></div></Card></>;
}

export default WatchCreate;
