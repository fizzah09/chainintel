import { Btn, Card, Chip, DataTable, Empty, useToast } from '../../../components/ui';
import { W, useWallet } from '../shared';
import { fd } from '../../../lib/format';
import { act } from '../../../mocks/store';

export function WWatch() {
  const [p, s] = useWallet(); const toast = useToast();
  const mine = (w) => w.wallets.find((x) => x.a.toLowerCase() === p.address.toLowerCase());
  const rows = s.watchlists.filter((w) => mine(w));
  return <W active="Watchlists">
    <Card title="Watchlist membership">
      {rows.length
        ? <DataTable tools={false} rows={rows} cols={[
            { h: 'Watchlist', render: (w) => <b>{w.name}</b> },
            { h: 'Scope', render: (w) => <Chip k={w.scope === 'Personal' ? 'gray' : 'blue'}>{w.scope}</Chip> },
            { h: 'Added by', render: (w) => mine(w)?.by },
            { h: 'Added', render: (w) => fd(mine(w)?.added) },
            { h: 'Alert rule', render: (w) => (w.rule === 'any' ? 'Any activity' : `Score ≥ ${w.thr}`) },
            { h: '', render: (w) => <Btn sm kind="danger" onClick={() => { act.removeFromWatchlist(w.id, mine(w).a); toast('Removed from watchlist'); }}>Remove</Btn> },
          ]} />
        : <Empty icon="tag" title="Not on any watchlist" desc="Use Add to watchlist in the header to start monitoring this wallet." />}
    </Card>
  </W>;
}

export default WWatch;
