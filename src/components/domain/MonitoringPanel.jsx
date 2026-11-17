import { useEffect, useState } from 'react';
import { Btn, Card, Chip, Dl, Toggle, useToast } from '../ui';
import { useStore, act } from '../../mocks/store';
import { liveAvailable } from '../../engine';
import { fdt } from '../../lib/format';

/**
 * Runs the monitoring job over every watchlist wallet. In simulated mode each run advances the
 * monitoring clock by a day, so new activity appears and alerts can fire.
 */
export function MonitoringPanel() {
  const s = useStore(); const toast = useToast();
  const [auto, setAuto] = useState(false);
  const m = s.monitor; const last = m.runs[0];
  const wallets = new Set(s.watchlists.flatMap((w) => w.wallets.map((x) => x.a.toLowerCase()))).size;
  const run = (days) => { const r = act.runMonitoring(days); toast(r.alerts ? `${r.alerts} new alert${r.alerts > 1 ? 's' : ''} from ${r.wallets} wallets` : `No changes across ${r.wallets} wallets${r.baseline ? ' (baseline recorded)' : ''}`, r.alerts ? 'bad' : 'ok'); };
  useEffect(() => {
    if (!auto) return undefined;
    const t = setInterval(() => act.runMonitoring(1), 30000);
    return () => clearInterval(t);
  }, [auto]);
  return (
    <Card title="Monitoring" sub="Re-scores every watched wallet and alerts on changes" act={<><Btn sm icon="refresh" onClick={() => run(1)}>Run now (+1 day)</Btn><Btn sm onClick={() => run(7)}>Run 7 days</Btn></>}>
      <Dl w={170} items={[
        ['Data', liveAvailable() ? <Chip k="ok" key="d">Live</Chip> : <Chip k="gray" key="d">Simulated history</Chip>],
        ['Monitoring clock', fdt(m.clock) + ' UTC'],
        ['Wallets watched', wallets],
        ['Last run', last ? `${fdt(last.ranAt)} · ${last.wallets} wallets · ${last.alerts} alert${last.alerts === 1 ? '' : 's'}` : 'Not run yet'],
        ['Auto-run every 30 s', <Toggle key="t" on={auto} onChange={setAuto} label="Auto-run" />],
      ]} />
      <div className="mu sm" style={{ marginTop: 8 }}>Alerts fire on: new sanctions, mixer, scam or ransomware exposure; a higher risk tier; a list threshold crossed; a new high behavioural anomaly; a model probability jump of 20 points or more.</div>
    </Card>
  );
}
