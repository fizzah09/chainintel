import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Chip, Empty, Head, Icon } from '../../../components/ui';
import { ago } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function Notifications() {
  const s = useStore(); const nav = useNavigate(); const [tab, setTab] = useState('All');
  const ico = { alert: ['alert', '#991B1B', '#FEE2E2'], case: ['case', '#124FB5', '#E8F0FD'], review: ['scale', '#5B21B6', '#EDE9FE'], watch: ['tag', '#92400E', '#FEF3C7'], report: ['report', '#166534', '#DCFCE7'], system: ['server', '#475569', '#E2E8F0'] };
  const list = s.notifications.filter((n) => tab === 'All' || (tab === 'Unread' ? !n.read : n.kind === tab.toLowerCase().replace(/s$/, '')));
  const un = s.notifications.filter((n) => !n.read).length;
  return <><Head title="Notifications" desc="Alerts, assignments, review requests and system messages for your account." acts={<Btn icon="check" onClick={() => act.notifyAll()}>Mark all as read</Btn>} />
    <Card style={{ padding: '8px 20px' }}><div className="tabs">{[['All', s.notifications.length], ['Unread', un], ['Alerts', 0], ['Cases', 0], ['Reviews', 0], ['System', 0]].map(([t, n]) => <a key={t} href="#" className={tab === t ? 'on' : ''} onClick={(e) => { e.preventDefault(); setTab(t); }}>{t}{n ? ` ${n}` : ''}</a>)}</div>
      {!list.length && <Empty icon="bell" title="You are all caught up" desc="New alerts and assignments will appear here." />}
      {list.map((n) => { const [i, c, bg] = ico[n.kind] || ico.system; return <div key={n.id} style={{ display: 'flex', gap: 14, padding: '16px 4px', borderBottom: '1px solid #EDF1F6', alignItems: 'flex-start', background: n.read ? '#fff' : '#F8FBFF', cursor: 'pointer' }} onClick={() => { act.notifyRead(n.id); nav(n.to.startsWith('/') ? n.to : pathOf(n.to)); }}><span className="ib" style={{ flex: 'none', color: c, borderColor: 'transparent', background: bg }}><Icon n={i} /></span><div style={{ flex: 1 }}><b>{n.title}</b> {!n.read && <Chip k="blue">New</Chip>}<div className="mu">{n.desc}</div></div><div className="mu sm" style={{ whiteSpace: 'nowrap' }}>{ago(n.at)}</div></div>; })}</Card></>;
}

export default Notifications;
