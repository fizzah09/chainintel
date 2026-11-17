import { useState } from 'react';
import { Btn, Modal, SelectIn, useToast } from '../../components/ui';
import { getState, useStore } from '../../mocks/store';

export const DEF = { dir: 'Forward and backward', hops: '3', period: '30 days', min: '100', method: 'Proportional' };

export const METHODS = [['Proportional', 'Share of outflow matches share of inflow'], ['FIFO', 'Oldest funds are spent first'], ['Temporal', 'Closest-in-time transfers are linked']];

export function AddToCase({ open, onClose, build }) {
  const s = useStore(); const toast = useToast(); const open_ = s.cases.filter((c) => c.status !== 'Closed'); const [cid, setCid] = useState(open_[0]?.id);
  return <Modal open={open} title="Add to case" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="pri" disabled={!cid} onClick={() => { build(cid); toast(`Added to ${cid}`); onClose(); }}>Add</Btn></>}><SelectIn label="Case" value={cid} onChange={setCid} options={open_.map((c) => [c.id, `${c.id} · ${c.title}`])} /></Modal>;
}

export const getCase = (id) => getState().cases.find((c) => c.id === id);

export const METH = { prop: 'Proportional', fifo: 'FIFO', time: 'Temporal' };

export const DESC = { prop: 'Each source receives a share of the outflow equal to its share of the inflows.', fifo: 'Earliest inflows are consumed first.', time: 'Inflows closest in time to the outflow are linked first.' };
