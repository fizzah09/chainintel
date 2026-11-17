import { useMemo, useState } from 'react';
import { Empty } from '../ui/EmptyState';
import { Icon } from '../ui/Icon';
import { csv, download } from '../../lib/format';

// data table
export function DataTable({ cols, rows, search, searchText, filters = [], size = 8, exportName, empty = 'Nothing matches your filters.', tools = true, defaultSort }) {
  const [q, setQ] = useState(''); const [f, setF] = useState({}); const [page, setPage] = useState(1); const [sort, setSort] = useState(defaultSort || null); const [hide, setHide] = useState({}); const [menu, setMenu] = useState(false);
  const data = useMemo(() => {
    let r = rows.filter((x) => (!q || (searchText ? searchText(x) : JSON.stringify(x)).toLowerCase().includes(q.toLowerCase())) && filters.every((fl) => !f[fl.label] || f[fl.label] === 'All' || fl.test(x, f[fl.label])));
    if (sort) { const c = cols[sort.i]; r = [...r].sort((a, b) => { const va = c.val ? c.val(a) : '', vb = c.val ? c.val(b) : ''; return (va > vb ? 1 : va < vb ? -1 : 0) * sort.d; }); }
    return r;
  }, [rows, q, f, sort]);
  const pages = Math.max(1, Math.ceil(data.length / size)); const p = Math.min(page, pages);
  const slice = data.slice((p - 1) * size, p * size);
  const vis = cols.map((c, i) => [c, i]).filter(([, i]) => !hide[i]);
  const exp = () => download(`${exportName || 'export'}.csv`, csv(cols.filter((c) => c.val).map((c) => c.h), data.map((r) => cols.filter((c) => c.val).map((c) => c.val(r)))));
  return <div>
    {tools && <div className="tools">
      {search && <label className="s"><Icon n="search" s={15} /><input placeholder={search} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label={search} /></label>}
      {filters.map((fl) => <label className="sel" key={fl.label}><span>{fl.label}</span><select value={f[fl.label] || 'All'} onChange={(e) => { setF({ ...f, [fl.label]: e.target.value }); setPage(1); }}>{['All', ...fl.options].map((o) => <option key={o}>{o}</option>)}</select></label>)}
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, position: 'relative' }}>
        <button className="sel" onClick={() => setMenu(!menu)}><Icon n="sliders" s={15} />Columns</button>
        {menu && <div className="menu">{cols.map((c, i) => <label key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 8px', cursor: 'pointer' }}><input type="checkbox" checked={!hide[i]} onChange={() => setHide({ ...hide, [i]: !hide[i] })} />{c.h || 'Actions'}</label>)}</div>}
        {exportName && <button className="sel" onClick={exp}><Icon n="dl" s={15} />Export</button>}
      </span></div>}
    <div className="tbl"><table><thead><tr>{vis.map(([c, i]) => <th key={i} className={`${c.r ? 'r' : ''} ${c.val ? 'sortable' : ''}`} onClick={() => c.val && setSort(sort?.i === i ? { i, d: -sort.d } : { i, d: 1 })} aria-sort={sort?.i === i ? (sort.d === 1 ? 'ascending' : 'descending') : undefined}>{c.h}{sort?.i === i && (sort.d === 1 ? ' ↑' : ' ↓')}</th>)}</tr></thead>
      <tbody>{slice.map((r, ri) => <tr key={ri}>{vis.map(([c, i]) => <td key={i} className={c.r ? 'r' : ''}>{c.render ? c.render(r) : r[c.k]}</td>)}</tr>)}</tbody></table></div>
    {!slice.length && <Empty title="No results" desc={empty} />}
    <div className="pager"><span>{data.length ? `Showing ${(p - 1) * size + 1}–${Math.min(p * size, data.length)} of ${data.length}` : 'Showing 0 of 0'}</span><div><b role="button" tabIndex={0} aria-label="Previous page" onClick={() => setPage(Math.max(1, p - 1))}><Icon n="left" s={14} /></b>{Array.from({ length: Math.min(pages, 5) }, (_, i) => <b key={i} role="button" tabIndex={0} className={p === i + 1 ? 'on' : ''} onClick={() => setPage(i + 1)}>{i + 1}</b>)}<b role="button" tabIndex={0} aria-label="Next page" onClick={() => setPage(Math.min(pages, p + 1))}><Icon n="right" s={14} /></b></div></div>
  </div>;
}
