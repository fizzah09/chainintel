import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Head, SelectIn, Stack, TextIn, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

// SA-03: create a tenant. This release creates the tenant directly; the Bank Admin invitation email is not connected yet.
export function SaTenantCreate() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast();
  const [v, setV] = useState({ name: '', plan: 'Professional' });
  const [err, setErr] = useState('');

  const create = () => {
    const n = v.name.trim();
    if (n.length < 3) return setErr('Enter at least 3 characters.');
    if (s.tenants.some((t) => t.name.toLowerCase() === n.toLowerCase())) return setErr('A tenant with this name exists.');
    act.createTenant({ name: n, plan: v.plan });
    toast('Tenant created');
    nav(pathOf('SA_Tenants'));
  };

  return <>
    <Head title="New tenant" desc="Create a bank tenant. The Bank Admin invitation step is not connected in this release." />
    <Card style={{ maxWidth: 620 }}>
      <Stack gap={14}>
        <TextIn label="Organisation name" req value={v.name} onChange={(x) => { setV({ ...v, name: x }); setErr(''); }} err={err} />
        <SelectIn label="Plan" value={v.plan} onChange={(x) => setV({ ...v, plan: x })} options={['Evaluation', 'Professional', 'Enterprise']} />
      </Stack>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <Btn onClick={() => nav(pathOf('SA_Tenants'))}>Cancel</Btn>
        <Btn kind="pri" onClick={create}>Create tenant</Btn>
      </div>
    </Card>
  </>;
}

export default SaTenantCreate;
