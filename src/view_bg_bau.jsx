function BGBauAushangView({ activeCompany }) {
  const statusCfg = {
    geplant: { label: 'Geplant', color: '#2d6fa3', bg: '#e8f1fb', border: '#bcd3ee' },
    aktiv: { label: 'Aktiv', color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf' },
    pause: { label: 'Pause', color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc' },
    fertig: { label: 'Projekt fertig', color: '#6f6a60', bg: '#f2f1ee', border: '#ddd8cf' },
  };

  const baseEmployees = window.SEED.employees.filter(e => e.status === 'aktiv');
  const initialRows = [
    { id:'bgbau-1', nr:'BG-2026-001', company:'tiefbau', project:'Kanalsanierung Nordhorn', address:'Lingener Strasse 42, 48529 Nordhorn', start:'2026-04-15', end:'2026-06-28', status:'aktiv', responsible:'e-me', employeeIds: baseEmployees.slice(0, 12).map(e => e.id), doc:'BGBAU_Kanalsanierung_Nordhorn.pdf' },
    { id:'bgbau-2', nr:'BG-2026-002', company:'rohrbau', project:'Hausanschluesse Suedring', address:'Suedring 18, 48527 Nordhorn', start:'2026-05-20', end:'2026-07-10', status:'geplant', responsible: baseEmployees[6]?.id || 'e-me', employeeIds: baseEmployees.slice(5, 14).map(e => e.id), doc:'BGBAU_Suedring.pdf' },
    { id:'bgbau-3', nr:'BG-2026-003', company:'bohrtechnik', project:'Horizontalbohrung Gewerbepark', address:'Industriestrasse 7, 48455 Bad Bentheim', start:'2026-02-03', end:'2026-04-30', status:'fertig', responsible: baseEmployees[12]?.id || 'e-me', employeeIds: baseEmployees.slice(10, 18).map(e => e.id), doc:'BGBAU_Gewerbepark.pdf' },
    { id:'bgbau-4', nr:'BG-2026-004', company:'galabau', project:'Aussenanlagen Kita Mitte', address:'Schulstrasse 9, 48529 Nordhorn', start:'2026-05-05', end:'2026-05-30', status:'aktiv', responsible: baseEmployees[18]?.id || 'e-me', employeeIds: baseEmployees.slice(16, 23).map(e => e.id), doc:'BGBAU_Kita_Mitte.pdf' },
    { id:'bgbau-5', nr:'BG-2026-005', company:'transporte', project:'Logistik Baustofflager', address:'Am Hafen 3, 49808 Lingen', start:'2026-03-12', end:'2026-06-02', status:'pause', responsible: baseEmployees[22]?.id || 'e-me', employeeIds: baseEmployees.slice(22, 28).map(e => e.id), doc:'BGBAU_Baustofflager.pdf' },
    { id:'bgbau-6', nr:'BG-2026-006', company:'tiefbau', project:'Fernwaerme Innenstadt', address:'Marktstrasse 12, 48529 Nordhorn', start:'2026-01-20', end:'2026-03-25', status:'fertig', responsible: baseEmployees[3]?.id || 'e-me', employeeIds: baseEmployees.slice(2, 9).map(e => e.id), doc:'BGBAU_Fernwaerme.pdf' },
  ];

  const [rows, setRows] = React.useState(initialRows);
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [sort, setSort] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('bgbau_sort') || '{"col":"start","dir":"desc"}'); }
    catch { return { col:'start', dir:'desc' }; }
  });
  const [filters, setFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [menuCol, setMenuCol] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [previewRow, setPreviewRow] = React.useState(null);
  const [editRow, setEditRow] = React.useState(null);

  const today = new Date();
  const companyName = id => window.company(id)?.name || id;
  const companyShort = id => window.company(id)?.short || id;
  const employeeName = id => window.SEED.employees.find(e => e.id === id)?.name || '-';
  const fmtDate = date => window.fmtDE ? window.fmtDE(date) : date;
  const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  const durationLabel = row => {
    const end = new Date(row.end + 'T00:00:00');
    const start = new Date(row.start + 'T00:00:00');
    const diffEnd = Math.round((end - today) / 86400000);
    const diffStart = Math.max(0, Math.round((today - start) / 86400000));
    if (diffEnd < 0) return `seit ${Math.abs(diffEnd)} Tagen beendet`;
    if (row.status === 'aktiv') return `laeuft seit ${diffStart} Tagen`;
    return `endet in ${diffEnd} Tagen`;
  };

  const columns = [
    { id:'nr', label:'Nr.', value:r => r.nr },
    { id:'company', label:'Firma', value:r => companyShort(r.company) },
    { id:'project', label:'Projektname', value:r => r.project },
    { id:'address', label:'Adresse', value:r => r.address },
    { id:'start', label:'Beginn', value:r => r.start, display:r => fmtDate(r.start), type:'date' },
    { id:'end', label:'Ende', value:r => r.end, display:r => fmtDate(r.end), type:'date' },
    { id:'duration', label:'Dauer', value:r => durationLabel(r) },
    { id:'status', label:'Status', value:r => statusCfg[r.status]?.label || r.status },
    { id:'responsible', label:'Verantwortlich', value:r => employeeName(r.responsible) },
    { id:'employees', label:'Anzahl Mitarbeiter', value:r => r.employeeIds.length, type:'number' },
  ];

  const columnById = id => columns.find(c => c.id === id);
  const uniqueValues = col => [...new Set(rows.map(r => columnById(col)?.value(r)))].filter(v => v !== undefined && v !== null).sort((a,b) => String(a).localeCompare(String(b), 'de'));
  const setColumnSort = (col, dir) => {
    const next = { col, dir };
    setSort(next);
    localStorage.setItem('bgbau_sort', JSON.stringify(next));
    setMenuCol(null);
  };

  const toggleFilterValue = (col, value) => {
    setFilters(prev => {
      const current = new Set(prev[col] || []);
      current.has(value) ? current.delete(value) : current.add(value);
      const next = { ...prev, [col]: Array.from(current) };
      if (!next[col].length) delete next[col];
      return next;
    });
  };
  const clearFilterValue = (col, value) => setFilters(prev => {
    const nextVals = (prev[col] || []).filter(v => v !== value);
    const next = { ...prev };
    if (nextVals.length) next[col] = nextVals; else delete next[col];
    return next;
  });
  const resetFilters = () => { setFilters({}); setGroupBy(''); setMenuCol(null); };

  let visible = rows.filter(r => activeCompany === 'all' || r.company === activeCompany);
  visible = visible.filter(r => Object.entries(filters).every(([col, vals]) => vals.includes(columnById(col)?.value(r))));
  visible = [...visible].sort((a,b) => {
    const col = columnById(sort.col);
    let va = col?.value(a), vb = col?.value(b);
    if (col?.type === 'number') return sort.dir === 'asc' ? va - vb : vb - va;
    if (col?.type === 'date') { va = new Date(va); vb = new Date(vb); return sort.dir === 'asc' ? va - vb : vb - va; }
    const cmp = String(va).localeCompare(String(vb), 'de');
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const grouped = groupBy
    ? uniqueValues(groupBy).map(value => ({ value, items: visible.filter(r => columnById(groupBy)?.value(r) === value) })).filter(g => g.items.length)
    : [{ value:'', items: visible }];
  const projectGroups = groupBy
    ? grouped.map(group => ({ value: group.value, label: `${columnById(groupBy)?.label}: ${group.value}`, items: group.items }))
    : [...new Set(visible.map(row => row.company))].map(company => ({
      value: company,
      label: companyName(company),
      items: visible.filter(row => row.company === company),
    })).filter(group => group.items.length);
  const timelineItems = projectGroups.flatMap(group => [{ type:'group', id:'group-' + group.value, group }, ...group.items.map(row => ({ type:'task', id:row.id, row }))]);
  const allDates = visible.flatMap(row => [new Date(row.start + 'T00:00:00'), new Date(row.end + 'T00:00:00')]);
  const timelineStart = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
  const timelineEnd = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();
  timelineStart.setDate(timelineStart.getDate() - timelineStart.getDay() + 1);
  timelineEnd.setDate(timelineEnd.getDate() + (7 - timelineEnd.getDay()));
  const totalDays = Math.max(1, Math.round((timelineEnd - timelineStart) / 86400000));
  const weeks = [];
  for (let d = new Date(timelineStart); d <= timelineEnd; d.setDate(d.getDate() + 7)) {
    weeks.push(new Date(d));
  }
  const dayOffset = value => Math.max(0, Math.round((new Date(value + 'T00:00:00') - timelineStart) / 86400000));
  const barStyle = row => {
    const left = (dayOffset(row.start) / totalDays) * 100;
    const width = Math.max(1.8, ((dayOffset(row.end) - dayOffset(row.start) + 1) / totalDays) * 100);
    return { left: left + '%', width: width + '%', background: statusCfg[row.status]?.color || '#6f6a60' };
  };
  const groupRange = group => {
    const starts = group.items.map(row => new Date(row.start + 'T00:00:00').getTime());
    const ends = group.items.map(row => new Date(row.end + 'T00:00:00').getTime());
    const start = new Date(Math.min(...starts));
    const end = new Date(Math.max(...ends));
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      duration: Math.max(1, Math.round((end - start) / 86400000) + 1),
    };
  };

  const statusCounts = Object.fromEntries(Object.keys(statusCfg).map(status => [status, rows.filter(r => r.status === status).length]));
  const toggleRow = id => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => setSelectedIds(prev => prev.size === visible.length ? new Set() : new Set(visible.map(r => r.id)));
  const deleteSelected = () => { setRows(prev => prev.filter(r => !selectedIds.has(r.id))); setSelectedIds(new Set()); };
  const updateSelectedStatus = status => {
    if (!status) return;
    setRows(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status } : r));
    setSelectedIds(new Set());
  };
  const deleteRow = id => {
    setRows(prev => prev.filter(r => r.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };
  const saveEdit = patch => {
    setRows(prev => prev.map(r => r.id === patch.id ? patch : r));
    setEditRow(null);
  };

  const Badge = ({ status }) => {
    const cfg = statusCfg[status] || statusCfg.aktiv;
    return <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 9px', borderRadius:999, border:'1px solid '+cfg.border, background:cfg.bg, color:cfg.color, fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}><span style={{ width:6, height:6, borderRadius:99, background:cfg.color }} />{cfg.label}</span>;
  };

  const HeaderCell = ({ col }) => {
    const activeSort = sort.col === col.id;
    const hasFilter = filters[col.id]?.length;
    return (
      <th style={{ position:'relative' }}>
        <button type="button" onClick={() => { setMenuCol(menuCol === col.id ? null : col.id); setFilterSearch(''); }} style={{ border:0, background: menuCol === col.id || hasFilter ? 'var(--color-parchment)' : 'transparent', borderRadius:6, padding:'7px 8px', cursor:'pointer', font:'inherit', color:'inherit', display:'inline-flex', alignItems:'center', gap:5 }}>
          {col.label}
          {activeSort && <span>{sort.dir === 'asc' ? '^' : 'v'}</span>}
          {hasFilter ? <span style={{ color:'var(--color-accent)' }}>filter</span> : <span style={{ opacity:.45 }}>v</span>}
        </button>
        {menuCol === col.id && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:80, minWidth:250, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)', letterSpacing:0 }}>
            <button type="button" onClick={() => setColumnSort(col.id, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setColumnSort(col.id, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setFilterPanel(col.id); setFilterSearch(''); setMenuCol(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setGroupBy(groupBy === col.id ? '' : col.id); setColumnSort(col.id, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  const ProjectHeaderCell = ({ col }) => {
    const activeSort = sort.col === col.id;
    const hasFilter = filters[col.id]?.length;
    return (
      <div style={{ position:'relative' }}>
        <button type="button" onClick={() => { setMenuCol(menuCol === col.id ? null : col.id); setFilterSearch(''); }} style={{ border:0, background: menuCol === col.id || hasFilter ? '#e9f2e5' : 'transparent', borderRadius:4, padding:'6px 4px', cursor:'pointer', font:'inherit', color:'inherit', display:'inline-flex', alignItems:'center', gap:5, maxWidth:'100%' }}>
          <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{col.label}</span>
          {activeSort && <span>{sort.dir === 'asc' ? '^' : 'v'}</span>}
          {hasFilter ? <span style={{ color:'var(--color-accent)' }}>filter</span> : <span style={{ opacity:.55 }}>v</span>}
        </button>
        {menuCol === col.id && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:80, minWidth:250, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)', letterSpacing:0 }}>
            <button type="button" onClick={() => setColumnSort(col.id, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setColumnSort(col.id, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setFilterPanel(col.id); setFilterSearch(''); setMenuCol(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setGroupBy(groupBy === col.id ? '' : col.id); setColumnSort(col.id, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </div>
    );
  };

  const rowCells = row => (
    <>
      <td><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRow(row.id)} /></td>
      <td>{row.nr}</td>
      <td>{companyName(row.company)}</td>
      <td><strong>{row.project}</strong></td>
      <td>{row.address}</td>
      <td>{fmtDate(row.start)}</td>
      <td>{fmtDate(row.end)}</td>
      <td>{durationLabel(row)}</td>
      <td><Badge status={row.status} /></td>
      <td>{employeeName(row.responsible)}</td>
      <td>{row.employeeIds.length}</td>
      <td>
        <div style={{ display:'flex', gap:4 }}>
          <button className="icon-btn" title="Bearbeiten" onClick={() => setEditRow(row)}><Icon name="edit" size={15} /></button>
          <button className="icon-btn" title="Loeschen" onClick={() => deleteRow(row.id)}><Icon name="trash" size={15} /></button>
        </div>
      </td>
      <td><button className="btn btn--ghost" onClick={() => setPreviewRow(row)}><Icon name="doc" size={14} />PDF</button></td>
    </>
  );

  return (
    <div>
      <style>{`
        .bgbau-project-shell { border:1px solid var(--border-1); border-radius:10px; overflow:auto; background:white; box-shadow:0 1px 0 rgba(0,0,0,.04); }
        .bgbau-project { min-width:1620px; display:grid; grid-template-columns: 760px minmax(820px, 1fr); }
        .bgbau-left, .bgbau-right { position:relative; }
        .bgbau-left { border-right:2px solid #9f9f9a; background:#fff; overflow:hidden; z-index:2; }
        .bgbau-right { background:#fff; overflow:hidden; }
        .bgbau-grid-head, .bgbau-grid-row { display:grid; grid-template-columns: 34px 230px 66px 92px 92px 116px 130px; align-items:center; }
        .bgbau-grid-head { position:sticky; top:0; z-index:5; min-height:38px; background:#f3f7f1; color:#3f7a4a; border-bottom:1px solid #b8d2b2; font-size:12px; font-weight:800; }
        .bgbau-grid-head > div, .bgbau-grid-row > div { min-width:0; padding:8px 10px; border-right:1px solid #ecebe5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .bgbau-grid-row { min-height:42px; border-bottom:1px solid #ecebe5; font-size:13px; }
        .bgbau-grid-row.is-group { background:#f4f4f0; font-weight:800; }
        .bgbau-grid-row.is-selected { background:#fff4ec; }
        .bgbau-grid-row:hover { background:#fbf8f1; }
        .bgbau-task-name { display:flex; align-items:center; gap:7px; }
        .bgbau-task-name strong { min-width:0; overflow:hidden; text-overflow:ellipsis; }
        .bgbau-task-indent { width:18px; display:inline-block; }
        .bgbau-status-dot { width:8px; height:8px; border-radius:99px; display:inline-block; }
        .bgbau-timeline-head { position:sticky; top:0; z-index:4; display:grid; min-height:38px; background:#f8f8f6; border-bottom:1px solid #d9d9d4; }
        .bgbau-week { min-width:0; padding:4px 8px; border-right:1px solid #e2e2dd; font-size:11px; color:#777; line-height:1.25; overflow:hidden; white-space:nowrap; }
        .bgbau-timeline-row { position:relative; min-height:42px; border-bottom:1px solid #ecebe5; background-image:linear-gradient(to right, rgba(0,0,0,.045) 1px, transparent 1px); }
        .bgbau-timeline-row.is-group { background-color:#f4f4f0; }
        .bgbau-bar { position:absolute; top:13px; height:13px; border-radius:2px; box-shadow:inset 0 -1px 0 rgba(0,0,0,.14); opacity:.82; cursor:pointer; }
        .bgbau-bar::after { content:""; position:absolute; right:-5px; top:3px; width:7px; height:7px; transform:rotate(45deg); background:inherit; }
        .bgbau-summary { position:absolute; top:15px; height:2px; background:#555; }
        .bgbau-summary::before, .bgbau-summary::after { content:""; position:absolute; top:0; width:2px; height:12px; background:#555; }
        .bgbau-summary::before { left:0; }
        .bgbau-summary::after { right:0; }
        .bgbau-today { position:absolute; top:38px; bottom:0; width:2px; background:#d06443; z-index:3; opacity:.75; }
        .bgbau-table th { text-align:left; padding:10px 12px; font-size:11px; text-transform:uppercase; color:var(--fg-3); background:var(--color-parchment); border-bottom:1px solid var(--border-1); white-space:nowrap; }
        .bgbau-table td { padding:12px; border-bottom:1px solid var(--border-1); vertical-align:middle; }
        .bgbau-table tr:hover td { background:rgba(201,100,66,.035); }
        .column-menu-row { display:block; width:100%; border:0; background:transparent; text-align:left; padding:9px 8px; border-radius:6px; cursor:pointer; font:inherit; }
        .column-menu-row:hover { background:var(--color-parchment); }
      `}</style>

      <div className="view__header">
        <div>
          <h1 className="view__title">Baustellenaushang BG BAU</h1>
          <div className="view__subtitle">Aushang-Dokumente je Baustelle mit Status, Verantwortlichen und PDF-Vorschau.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary"><Icon name="plus" size={14} />Aushang anlegen</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4, minmax(160px, 1fr))', marginBottom:16 }}>
        {[
          ['aktiv','Aktiv'], ['geplant','Geplant'], ['pause','Pause'], ['fertig','Projekt fertig'],
        ].map(([key, label]) => <button key={key} onClick={() => setFilters({ status:[statusCfg[key].label] })} className="kpi" style={{ textAlign:'left', cursor:'pointer', border:'1px solid var(--border-1)' }}><div className="kpi__label">{label}</div><div className="kpi__value" style={{ color:statusCfg[key].color }}>{statusCounts[key]}</div></button>)}
      </div>

      {Object.keys(filters).length > 0 || groupBy ? (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {Object.entries(filters).map(([col, vals]) => vals.map(value => (
            <span key={col + value} style={{ display:'inline-flex', gap:8, alignItems:'center', background:'var(--color-parchment)', borderRadius:999, padding:'6px 10px' }}>{columnById(col)?.label}: {String(value)} <button style={{ border:0, background:'transparent', cursor:'pointer' }} onClick={() => clearFilterValue(col, value)}>x</button></span>
          )))}
          {groupBy && <span style={{ display:'inline-flex', gap:8, alignItems:'center', background:'var(--color-parchment)', borderRadius:999, padding:'6px 10px' }}>Gruppiert nach {columnById(groupBy)?.label}<button style={{ border:0, background:'transparent', cursor:'pointer' }} onClick={() => setGroupBy('')}>x</button></span>}
          <button className="btn btn--ghost" onClick={resetFilters}>Filter zuruecksetzen</button>
        </div>
      ) : null}

      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', marginBottom:12, background:'rgba(201,100,66,.06)', border:'1px solid var(--color-accent)', borderRadius:10 }}>
          <strong>{selectedIds.size} ausgewaehlt</strong>
          <select onChange={e => updateSelectedStatus(e.target.value)} defaultValue="" style={{ minHeight:36, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 10px' }}>
            <option value="">Status aendern</option>
            {Object.entries(statusCfg).map(([key,cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
          </select>
          <button className="btn btn--ghost" onClick={deleteSelected}><Icon name="trash" size={14} />Loeschen</button>
          <button className="btn btn--ghost" onClick={() => setSelectedIds(new Set())}>Auswahl aufheben</button>
        </div>
      )}

      <div className="bgbau-project-shell">
        <div className="bgbau-project">
          <div className="bgbau-left">
            <div className="bgbau-grid-head">
              <div><input type="checkbox" checked={selectedIds.size === visible.length && visible.length > 0} onChange={toggleAll} /></div>
              <ProjectHeaderCell col={columnById('project')} />
              <ProjectHeaderCell col={columnById('duration')} />
              <ProjectHeaderCell col={columnById('start')} />
              <ProjectHeaderCell col={columnById('end')} />
              <ProjectHeaderCell col={columnById('status')} />
              <ProjectHeaderCell col={columnById('responsible')} />
            </div>
            {timelineItems.map(item => {
              if (item.type === 'group') {
                const range = groupRange(item.group);
                return (
                  <div key={item.id} className="bgbau-grid-row is-group">
                    <div></div>
                    <div className="bgbau-task-name"><span>▾</span><strong>{item.group.label}</strong></div>
                    <div>{range.duration} T</div>
                    <div>{fmtDate(range.start)}</div>
                    <div>{fmtDate(range.end)}</div>
                    <div>{item.group.items.length} Projekte</div>
                    <div></div>
                  </div>
                );
              }
              const row = item.row;
              return (
                <div key={row.id} className={'bgbau-grid-row' + (selectedIds.has(row.id) ? ' is-selected' : '')} onClick={() => setPreviewRow(row)}>
                  <div onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRow(row.id)} /></div>
                  <div className="bgbau-task-name"><span className="bgbau-task-indent"></span><span className="bgbau-status-dot" style={{ background: statusCfg[row.status]?.color }}></span><strong title={row.project}>{row.project}</strong></div>
                  <div>{Math.max(1, daysBetween(row.start, row.end) + 1)} T</div>
                  <div>{fmtDate(row.start)}</div>
                  <div>{fmtDate(row.end)}</div>
                  <div><Badge status={row.status} /></div>
                  <div title={employeeName(row.responsible)}>{employeeName(row.responsible)}</div>
                </div>
              );
            })}
          </div>
          <div className="bgbau-right" style={{ '--week-count': weeks.length }}>
            <div className="bgbau-timeline-head" style={{ gridTemplateColumns:`repeat(${weeks.length}, minmax(92px, 1fr))` }}>
              {weeks.map(week => (
                <div key={week.toISOString()} className="bgbau-week">
                  <strong>{fmtDate(week.toISOString().slice(0,10))}</strong><br />
                  M D M D F S S
                </div>
              ))}
            </div>
            {new Date(window.SEED.today) >= timelineStart && new Date(window.SEED.today) <= timelineEnd && (
              <div className="bgbau-today" style={{ left: ((new Date(window.SEED.today) - timelineStart) / 86400000 / totalDays * 100) + '%' }} />
            )}
            {timelineItems.map(item => {
              if (item.type === 'group') {
                const range = groupRange(item.group);
                const left = (dayOffset(range.start) / totalDays) * 100;
                const width = Math.max(2, ((dayOffset(range.end) - dayOffset(range.start) + 1) / totalDays) * 100);
                return <div key={item.id} className="bgbau-timeline-row is-group"><div className="bgbau-summary" style={{ left:left + '%', width:width + '%' }} /></div>;
              }
              const row = item.row;
              return (
                <div key={row.id} className="bgbau-timeline-row">
                  <button type="button" className="bgbau-bar" title={`${row.project}: ${fmtDate(row.start)} - ${fmtDate(row.end)}`} style={barStyle(row)} onClick={() => setPreviewRow(row)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:12 }}>
        <button className="btn btn--ghost" disabled={!previewRow} onClick={() => previewRow && setEditRow(previewRow)}><Icon name="edit" size={14} />Bearbeiten</button>
        <button className="btn btn--ghost" disabled={!previewRow} onClick={() => previewRow && deleteRow(previewRow.id)}><Icon name="trash" size={14} />Löschen</button>
        <button className="btn btn--ghost" disabled={!previewRow} onClick={() => previewRow && setPreviewRow(previewRow)}><Icon name="doc" size={14} />PDF-Vorschau</button>
      </div>

      {filterPanel && (
        <div style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(0,0,0,0.16)', display:'flex', justifyContent:'flex-end' }} onClick={() => setFilterPanel(null)}>
          <aside style={{ width:390, maxWidth:'92vw', height:'100%', background:'white', boxShadow:'-18px 0 42px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 14px' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach "{columnById(filterPanel)?.label}"</h2>
              <button type="button" className="icon-btn" onClick={() => setFilterPanel(null)}><Icon name="x" size={22} /></button>
            </div>
            <div style={{ padding:'10px 28px 16px' }}>
              <input
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Text eingeben, um Filter zu finden"
                style={{ width:'100%', boxSizing:'border-box', padding:'12px 10px', border:'1px solid var(--fg-2)', font:'inherit', fontSize:16 }}
              />
            </div>
            <div style={{ overflowY:'auto', padding:'8px 28px', flex:1 }}>
              {uniqueValues(filterPanel).filter(value => String(value).toLowerCase().includes(filterSearch.toLowerCase())).map(value => (
                <label key={String(value)} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:16, color:'var(--fg-1)' }}>
                  <input
                    type="checkbox"
                    checked={(filters[filterPanel] || []).includes(value)}
                    onChange={() => toggleFilterValue(filterPanel, value)}
                    style={{ width:20, height:20, accentColor:'var(--color-accent)' }}
                  />
                  {String(value)}
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, padding:'16px 28px 22px', borderTop:'1px solid var(--border-1)' }}>
              <button type="button" className="btn btn--primary" onClick={() => setFilterPanel(null)} disabled={!(filters[filterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => {
                setFilters(prev => {
                  const next = { ...prev };
                  delete next[filterPanel];
                  return next;
                });
              }}>Auswahl aufheben</button>
            </div>
          </aside>
        </div>
      )}

      {previewRow && <BGBauPreview row={previewRow} companyName={companyName} employeeName={employeeName} fmtDate={fmtDate} durationLabel={durationLabel} onClose={() => setPreviewRow(null)} />}
      {editRow && <BGBauEditPanel row={editRow} employees={window.SEED.employees} companies={window.SEED.companies} onClose={() => setEditRow(null)} onSave={saveEdit} />}
    </div>
  );
}

function BGBauPreview({ row, companyName, employeeName, fmtDate, durationLabel, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(18,18,17,.25)' }} />
      <aside style={{ position:'fixed', top:0, right:0, bottom:0, width:520, maxWidth:'calc(100vw - 18px)', zIndex:3100, background:'var(--color-ivory)', boxShadow:'-14px 0 40px rgba(0,0,0,.18)', padding:22, overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div><div className="eyebrow">PDF Vorschau</div><h2 style={{ margin:0, fontFamily:'var(--font-serif)' }}>{row.doc}</h2></div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ background:'#fff', border:'1px solid var(--border-1)', boxShadow:'0 8px 24px rgba(0,0,0,.08)', minHeight:650, padding:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'2px solid #111', paddingBottom:12 }}>
            <strong>BG BAU Baustellenaushang</strong>
            <span>{row.nr}</span>
          </div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:32, margin:'26px 0 8px' }}>{row.project}</h1>
          <p style={{ color:'var(--fg-3)', marginBottom:26 }}>{companyName(row.company)}</p>
          {[
            ['Adresse', row.address],
            ['Beginn', fmtDate(row.start)],
            ['Ende', fmtDate(row.end)],
            ['Dauer', durationLabel(row)],
            ['Verantwortlich', employeeName(row.responsible)],
            ['Anzahl Mitarbeiter', row.employeeIds.length],
          ].map(([label, value]) => (
            <div key={label} style={{ display:'grid', gridTemplateColumns:'170px 1fr', borderTop:'1px solid var(--border-1)', padding:'12px 0' }}>
              <strong>{label}</strong><span>{value}</span>
            </div>
          ))}
          <div style={{ marginTop:30, padding:16, border:'1px solid #111' }}>
            <strong>Hinweis</strong>
            <p style={{ margin:'8px 0 0' }}>Dieser Aushang ist auf der Baustelle sichtbar bereitzuhalten. Verantwortliche Person prueft Aktualitaet und Vollstaendigkeit.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function BGBauEditPanel({ row, employees, companies, onClose, onSave }) {
  const [form, setForm] = React.useState(row);
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const input = { minHeight:40, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 12px', font:'inherit', background:'#fff' };
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(18,18,17,.25)' }} />
      <aside style={{ position:'fixed', top:0, right:0, bottom:0, width:460, maxWidth:'calc(100vw - 18px)', zIndex:3100, background:'var(--color-ivory)', boxShadow:'-14px 0 40px rgba(0,0,0,.18)', padding:22, overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <h2 style={{ margin:0, fontFamily:'var(--font-serif)' }}>Aushang bearbeiten</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ display:'grid', gap:12 }}>
          <label>Nr.<input value={form.nr} onChange={e => set('nr', e.target.value)} style={input} /></label>
          <label>Firma<select value={form.company} onChange={e => set('company', e.target.value)} style={input}>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Projektname<input value={form.project} onChange={e => set('project', e.target.value)} style={input} /></label>
          <label>Adresse<input value={form.address} onChange={e => set('address', e.target.value)} style={input} /></label>
          <label>Beginn<input type="date" value={form.start} onChange={e => set('start', e.target.value)} style={input} /></label>
          <label>Ende<input type="date" value={form.end} onChange={e => set('end', e.target.value)} style={input} /></label>
          <label>Status<select value={form.status} onChange={e => set('status', e.target.value)} style={input}><option value="geplant">Geplant</option><option value="aktiv">Aktiv</option><option value="pause">Pause</option><option value="fertig">Projekt fertig</option></select></label>
          <label>Verantwortlich<select value={form.responsible} onChange={e => set('responsible', e.target.value)} style={input}>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:12 }}>
            <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
            <button className="btn btn--primary" onClick={() => onSave(form)}>Speichern</button>
          </div>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { BGBauAushangView });
