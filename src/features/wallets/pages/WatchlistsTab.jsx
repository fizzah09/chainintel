import { Btn, Card, Chip, DataTable, Empty, useToast } from '../../../components/ui';
import { W, useWallet } from '../shared';
import { act } from '../../../mocks/store';

export function WWatch() {
  const [p, s] = useWallet(); const toast = useToast();
  const rows = s.watchlists.filter((w) => w.wallets.some((x) => x.a.toLowerCase() === p.address.toLowerCase()));
  return <W active="Watchlists"><Card title="Watchlist membership">{rows.length ? <DataTable tools={false} rows={rows} cols={[{ h: 'Watchlist', render: (w) => <b>{w.name}</b> }, { h: 'Scope', render: (w) => <Chip k="blue">{w.scope}</Chip> }, { h: 'Added by', render: (w) => w.wallets.find((x) => x.a.toLowerCase() === p.address.toLowerCase())?.by }, { h: 'Alert rule', render: (w) => (w.rule === 'any' ? 'Any activity' : `Score ≥ ${w.thr}`) }, { h: '', render: (w) => <Btn sm kind="danger" onClick={() => { act.removeFromWatchlist(w.id, w.wallets.find((x) => x.a.toLowerCase() === p.address.toLowerCase()).a); toast('Removed from watchlist'); }}>Remove</Btn> }]} /> : <Empty icon="tag" title="Not on any watchlist" desc="Use Add to watchlist in the header to start monitoring this wallet." />}</Card></W>;
}

export default WWatch;
