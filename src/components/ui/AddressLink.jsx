import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../app/config/paths';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { Tier } from './TierBadge';
import { useToast } from '../../context/ToastContext';
import { sh } from '../../lib/format';
import { labelOf } from '../../lib/risk';
import { act } from '../../mocks/store';

// links
export function Addr({ a, label, risk, full }) {
  const nav = useNavigate(); const toast = useToast();
  const lb = label !== undefined ? label : labelOf(a);
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
    <button className="link mono" onClick={() => { act.openWallet(a); nav(pathOf('WalletOverview')); }}>{full ? a : sh(a)}</button>
    <button className="link" style={{ color: '#8A99AE' }} aria-label="Copy address" onClick={() => { navigator.clipboard?.writeText(a); toast('Address copied'); }}><Icon n="copy" s={13} /></button>
    {lb && lb !== 'Unknown' && <Chip k="gray">{lb}</Chip>}{risk != null && <Tier score={risk} />}</span>;
}

export function Hash({ h, full }) {
  const nav = useNavigate(); const toast = useToast();
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><button className="link mono" onClick={() => { act.setCtx({ tx: h }); nav(pathOf('TransactionDetail')); }}>{full ? h : sh(h, 8, 6)}</button><button className="link" style={{ color: '#8A99AE' }} aria-label="Copy hash" onClick={() => { navigator.clipboard?.writeText(h); toast('Hash copied'); }}><Icon n="copy" s={13} /></button></span>;
}
