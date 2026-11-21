import { Card, Check, Head, useToast } from '../../../components/ui';
import { PERMS, PERM_ROLES, ROLE_NAMES } from '../../../mocks/seed';
import { act, useStore } from '../../../mocks/store';

export function BaPerms() {
  const s = useStore(); const toast = useToast();
  return <>
    <Head title="Permission matrix" desc="What each role can do. Roles are fixed in the app, so this matrix is for reference only." />
    <Card>
      <div className="tbl">
        <table className="mat">
          <thead><tr><th>Permission</th>{PERM_ROLES.map((r) => <th key={r}>{ROLE_NAMES[r]}</th>)}</tr></thead>
          <tbody>{PERMS.map(([k, l]) => (
            <tr key={k}>
              <td><b>{l}</b></td>
              {PERM_ROLES.map((r) => <td key={r}><Check on={s.perms[k][r]} onChange={(v) => { act.setPerm(k, r, v); toast('Permission updated'); }} label={`${l} for ${ROLE_NAMES[r]}`} /></td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  </>;
}

export default BaPerms;
