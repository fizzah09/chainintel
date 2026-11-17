import { useState } from 'react';
import { Btn, Card, Head, Row, TextIn, useToast } from '../../../components/ui';
import { isAddr } from '../../../lib/format';

export function StateToast() { const toast = useToast(); const [v, setV] = useState('0x12G4'); return <><Head title="Feedback patterns" desc="Toasts, inline validation and banners." /><Row><Card title="Toasts" style={{ flex: '1 1 400px' }}><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Btn onClick={() => toast('Case submitted for review.')}>Success toast</Btn><Btn onClick={() => toast('Evidence could not be uploaded. File is larger than 25 MB.', 'bad')}>Error toast</Btn></div></Card><Card title="Inline validation" style={{ flex: '1 1 400px' }}><TextIn label="Wallet address" req value={v} onChange={setV} err={isAddr(v) ? '' : 'Enter a valid Ethereum address (0x followed by 40 hex characters).'} /></Card></Row></>; }

export default StateToast;
