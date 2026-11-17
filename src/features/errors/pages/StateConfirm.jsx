import { useState } from 'react';
import { Btn, Card, Confirm, Head, useToast } from '../../../components/ui';

export function StateConfirm() { const [o, setO] = useState(true); const toast = useToast(); return <><Head title="Users and roles" desc="Destructive actions always ask for confirmation." /><Card><Btn kind="danger" icon="trash" onClick={() => setO(true)}>Disable Old User</Btn></Card><Confirm open={o} title="Disable Old User?" text="They will be signed out and can no longer access Chain Intel. Their cases will be unassigned. You can re-enable the account later." ok="Disable user" danger onOk={() => toast('User disabled')} onClose={() => setO(false)} /></>; }

export default StateConfirm;
