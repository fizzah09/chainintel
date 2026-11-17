import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Head, Icon } from '../../../components/ui';

export function StateError() { const nav = useNavigate(); return <><Head title="Wallet analysis" /><Card><div style={{ textAlign: 'center', padding: '56px 20px' }}><div style={{ color: '#B91C1C' }}><Icon n="alert" s={40} /></div><h3 style={{ marginTop: 12, fontSize: 18 }}>We could not load this wallet</h3><p className="mu" style={{ maxWidth: '48ch', margin: '6px auto 18px' }}>The data provider did not respond. Cached data is not available for this address.</p><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><Btn kind="pri" icon="refresh" onClick={() => nav(pathOf('WalletOverview'))}>Try again</Btn><Btn to={pathOf('GlobalSearch')}>Contact support</Btn></div><div className="hint" style={{ marginTop: 14 }}>Reference: ERR-PROV-504</div></div></Card></>; }

export default StateError;
