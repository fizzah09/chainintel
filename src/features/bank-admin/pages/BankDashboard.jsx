import { pathOf } from '../../../app/config/paths';
import { byStatus, open } from '../../../components/domain/workspace';
import { Bars, Btn, Card, Donut, DataTable, HBars, Head, Kpis, Person, Row, Status } from '../../../components/ui';
import { ROLE_NAMES } from '../../../mocks/seed';
import { STAGES, useStore } from '../../../mocks/store';

// BA-01: tenant overview. Users, suspended accounts, cases and tickets for this bank.
export function BaDash() {
  const s = useStore();
  const active = s.users.filter((u) => u.status === 'Active');
  const suspended = s.users.filter((u) => u.status === 'Disabled');
  const invited = s.users.filter((u) => u.status === 'Invited');
  const openCases = s.cases.filter(open);
  const wallets = new Set(s.alerts.map((a) => a.wallet).filter(Boolean));
  const myTickets = (s.complaints || []).filter((c) => c.by === s.session.name);
  const ticketsOpen = myTickets.filter((c) => c.status !== 'Resolved').length;
  const rows = s.users.map((u) => ({ ...u, openCases: s.cases.filter((c) => c.assignee === u.name && open(c)).length }));

  return <>
    <Head title="Bank dashboard" desc="Tenant usage, users and compliance activity for your organisation."
      acts={<Btn kind="pri" to={pathOf('RaiseComplaint')}>Raise complaint</Btn>} />
    <Kpis items={[
      ['Total users', s.users.length, `${active.length} active · ${invited.length} invited`],
      ['Active users', active.length, `of ${s.users.length} accounts`],
      ['Suspended users', suspended.length, 'Disabled accounts', suspended.length ? 'crit' : undefined],
      ['Open cases', openCases.length, `${wallets.size} wallets monitored`],
      ['Open tickets', ticketsOpen, `${myTickets.length} raised in total`, 'mod'],
    ]} />
    <Row>
      <Card title="Users by status" style={{ flex: '1 1 300px' }}>
        <Donut items={[['Active', active.length, '#16A34A'], ['Invited', invited.length, '#F59E0B'], ['Suspended', suspended.length, '#DC2626']]} center={String(s.users.length)} sub="users" />
      </Card>
      <Card title="Users by role" style={{ flex: '1 1 300px' }}>
        <HBars items={Object.keys(ROLE_NAMES).filter((r) => s.users.some((u) => u.role === r)).map((r) => [ROLE_NAMES[r], s.users.filter((u) => u.role === r).length, '#1769E0'])} />
      </Card>
      <Card title="Cases by stage" style={{ flex: '2 1 400px' }}>
        <Bars vals={byStatus(s.cases).map((x) => x[1])} labels={STAGES.map((x) => x.split(' ')[0])} />
      </Card>
    </Row>
    <Card title="Members" sub="Who is active and how many open cases each person holds." act={<Btn sm to={pathOf('BA_Users')}>All users</Btn>}>
      <DataTable tools={false} rows={rows} size={10} cols={[
        { h: 'Member', render: (u) => <Person n={u.name} sub={u.email} />, val: (u) => u.name },
        { h: 'Role', render: (u) => ROLE_NAMES[u.role] ?? u.role, val: (u) => ROLE_NAMES[u.role] ?? u.role },
        { h: 'Status', render: (u) => <Status s={u.status} />, val: (u) => u.status },
        { h: 'Open cases', render: (u) => u.openCases, val: (u) => u.openCases },
      ]} />
    </Card>
  </>;
}

export default BaDash;
