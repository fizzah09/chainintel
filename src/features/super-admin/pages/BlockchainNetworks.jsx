import { useState } from 'react';
import { Card, DataTable, Head, Status, Toggle, useToast } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function SaNetworks() { const s = useStore(); const toast = useToast(); const rows = [['Ethereum', 'Mainnet', true], ['Polygon', 'Planned', false], ['Arbitrum', 'Planned', false], ['Tron', 'Out of scope v1', false]]; const [on, setOn] = useState({ Ethereum: true }); return <><Head title="Networks" desc="Ethereum is the only supported network in this release." /><Card><DataTable tools={false} rows={rows} cols={[{ h: 'Network', render: (r) => <b>{r[0]}</b> }, { h: 'Status', render: (r) => r[1] }, { h: 'Enabled', render: (r) => <Toggle on={!!on[r[0]]} disabled={!r[2]} onChange={(v) => { setOn({ ...on, [r[0]]: v }); toast(v ? 'Network enabled' : 'Network disabled'); }} label={r[0]} /> }]} /></Card></>; }

export default SaNetworks;
