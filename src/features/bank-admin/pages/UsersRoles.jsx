import { useState } from 'react';
import { pathOf } from '../../../app/config/paths';
import { open } from '../../../components/domain/workspace';
import { Btn, Card, Confirm, DataTable, Head, Person, Status, useToast } from '../../../components/ui';
import { ROLE_OPTS } from '../shared';
import { fd } from '../../../lib/format';
import { ROLE_NAMES } from '../../../mocks/seed';
import { act, useStore } from '../../../mocks/store';

export function BaUsers() {
  const s = useStore(); const toast = useToast(); const [conf, setConf] = useState(null);
  const rows = s.users.map((u) => ({ ...u, openCases: s.cases.filter((c) => c.assignee === u.name && open(c)).length }));

  return <>
    <Head title="Users and roles" desc="Invite users, assign roles and manage access for your bank."
      acts={<><Btn to={pathOf('BA_Permissions')}>Permission matrix</Btn><Btn kind="pri" icon="plus" to={pathOf('BA_Invite')}>Invite user</Btn></>} />
    <Card>
      <DataTable exportName="users" search="Search users" searchText={(u) => u.name + u.email} rows={rows} filters={[
        { label: 'Role', options: ROLE_OPTS.map((x) => x[1]), test: (u, v) => ROLE_NAMES[u.role] === v },
        { label: 'Status', options: ['Active', 'Invited', 'Disabled'], test: (u, v) => u.status === v },
      ]} cols={[
        { h: 'User', render: (u) => <Person n={u.name} sub={u.email} />, val: (u) => u.name },
        { h: 'Role', render: (u) => <select className="in" style={{ minHeight: 32 }} aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => { act.userPatch(u.id, { role: e.target.value }, 'Changed role'); toast('Role updated'); }}>{ROLE_OPTS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select> },
        { h: 'Open cases', render: (u) => u.openCases, val: (u) => u.openCases },
        { h: 'Status', render: (u) => <Status s={u.status} />, val: (u) => u.status },
        { h: 'Last active', render: (u) => (u.last ? fd(u.last) : '—') },
        { h: '', render: (u) => u.status === 'Disabled'
          ? <Btn sm onClick={() => { act.userPatch(u.id, { status: 'Active' }, 'Enabled user'); toast('User enabled'); }}>Enable</Btn>
          : <Btn sm kind="danger" disabled={u.name === s.session.name} onClick={() => setConf(u)}>Disable</Btn> },
      ]} />
    </Card>
    <Confirm open={!!conf} danger title="Disable user?" text={`${conf?.name} will lose access immediately. Their cases stay assigned until reassigned.`} ok="Disable" onOk={() => { act.userPatch(conf.id, { status: 'Disabled' }, 'Disabled user'); toast('User disabled'); }} onClose={() => setConf(null)} />
  </>;
}

export default BaUsers;
