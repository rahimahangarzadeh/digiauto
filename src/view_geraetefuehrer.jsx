function GeraetefuehrerView() {
  const employees = window.SEED.employees.filter(e => e.status === 'aktiv');
  const deviceTypes = ['Minibagger', 'Bagger', 'Radlader', 'Hubarbeitsb\u00fchnen', 'Teleskopstapler', 'Personenkraftwagen', 'Lastkraftwagen', 'LKW-Ladekran', 'Stapler', 'Sonstig'];
  const names = employees.slice(0, 12);
  const make = (id, empIndex, type, kind, date, released, description, pending) => {
    const emp = names[empIndex % names.length];
    return {
      id,
      employeeId:emp.id,
      company:window.company(emp.company)?.name || emp.company,
      type,
      otherType:type === 'Sonstig' ? 'Verdichtungsgeraet' : '',
      kind,
      date,
      released,
      description,
      pending:!!pending,
    };
  };
  const initialRows = [
    make('gf-1', 0, 'Bagger', 'Ausbildung', '2026-01-12', true, 'Bagger bis 20 t, Baustelleneinsatz Tiefbau.'),
    make('gf-2', 1, 'Radlader', 'Einweisung', '2026-01-18', true, 'Einweisung Radlader Hof und Baustelle.'),
    make('gf-3', 2, 'Minibagger', 'Einweisung', '2026-02-04', true, 'Minibagger 2,5 t.'),
    make('gf-4', 3, 'Teleskopstapler', 'Ausbildung', '2026-02-19', true, 'Teleskopstapler mit Lastdiagramm.'),
    make('gf-5', 4, 'Personenkraftwagen', 'Einweisung', '2026-03-03', true, 'Firmenfahrzeug und Ladungssicherung.'),
    make('gf-6', 5, 'Lastkraftwagen', 'Ausbildung', '2026-03-12', true, 'LKW Baustellenverkehr.'),
    make('gf-7', 6, 'LKW-Ladekran', 'Ausbildung', '2026-04-09', true, 'Ladekran mit Anschlagmittel.'),
    make('gf-8', 7, 'Stapler', 'Ausbildung', '2026-04-22', true, 'Stapler Lager und Baustelle.'),
    make('gf-9', 8, 'Sonstig', 'Einweisung', '2026-05-07', true, 'Sonstiges Geraet: Ruettelplatte / Verdichter.'),
  ];
  const initialPending = [
    make('gfp-1', 9, 'Hubarbeitsb\u00fchnen', 'Einweisung', '2026-05-12', false, 'Einweisung muss durch Admin freigegeben werden.', true),
    make('gfp-2', 10, 'Bagger', 'Ausbildung', '2026-05-16', false, 'Baggernachweis hochgeladen, Pruefung offen.', true),
    make('gfp-3', 11, 'Stapler', 'Ausbildung', '2026-05-20', false, 'Staplerschein aus Schulung wartet auf Freigabe.', true),
  ];
  const normalizeRows = list => list.map(row => ({
    ...row,
    type: row.type === 'Hubarbeitsbuehne' ? 'Hubarbeitsb\u00fchnen' : row.type,
    description: row.description === 'Neue Geraetefuehrer-Freigabe.' ? 'Neue Ger\u00e4tef\u00fchrer-Freigabe.' : row.description,
  }));
  const [rows, setRows] = React.useState(() => {
    try { return normalizeRows(JSON.parse(localStorage.getItem('geraetefuehrer_rows_v1') || 'null') || initialRows); }
    catch { return initialRows; }
  });
  const [pendingRows, setPendingRows] = React.useState(() => {
    try { return normalizeRows(JSON.parse(localStorage.getItem('geraetefuehrer_pending_v1') || 'null') || initialPending); }
    catch { return initialPending; }
  });
  const [tab, setTab] = React.useState('current');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [sort, setSort] = React.useState({ col:'employee', dir:'asc' });
  const [filters, setFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [menuCol, setMenuCol] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [detail, setDetail] = React.useState(null);

  React.useEffect(() => {
    try {
      localStorage.setItem('geraetefuehrer_rows_v1', JSON.stringify(rows));
      localStorage.setItem('geraetefuehrer_pending_v1', JSON.stringify(pendingRows));
    } catch {}
    window.dispatchEvent(new Event('geraetefuehrer-pending-updated'));
  }, [rows, pendingRows]);

  const emp = id => employees.find(e => e.id === id) || employees[0];
  const fmt = iso => {
    if (!iso) return '-';
    const [y,m,d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };
  const activeRows = tab === 'pending' ? pendingRows : rows;
  const columns = [
    { key:'employee', label:'Mitarbeiter', value:r => emp(r.employeeId)?.name || '-' },
    { key:'company', label:'Firma', value:r => r.company },
    { key:'type', label:'Typ Ger\u00e4t', value:r => r.type === 'Sonstig' && r.otherType ? 'Sonstig - ' + r.otherType : r.type },
    { key:'kind', label:'Ausbildung / Einweisung', value:r => r.kind },
    { key:'date', label:'Datum', type:'date', value:r => r.date, display:r => fmt(r.date) },
    { key:'released', label:'Freigabe f\u00fcr Mitarbeiter', value:r => r.released ? 'Freigegeben' : 'Nicht freigegeben' },
    { key:'description', label:'Beschreibung', value:r => r.description },
  ];
  const colValue = (row, key) => columns.find(c => c.key === key)?.value(row) ?? row[key];
  const colLabel = key => columns.find(c => c.key === key)?.label || key;
  const filtered = activeRows
    .filter(row => Object.entries(filters).every(([col, values]) => values.includes(colValue(row, col))))
    .sort((a, b) => {
      const col = columns.find(c => c.key === sort.col);
      let av = colValue(a, sort.col);
      let bv = colValue(b, sort.col);
      if (col?.type === 'date') return sort.dir === 'asc' ? new Date(av) - new Date(bv) : new Date(bv) - new Date(av);
      const cmp = String(av || '').localeCompare(String(bv || ''), 'de');
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  const grouped = groupBy ? filtered.reduce((acc, row) => {
    const value = colValue(row, groupBy) || 'Leer';
    if (!acc[value]) acc[value] = [];
    acc[value].push(row);
    return acc;
  }, {}) : null;
  const filterValues = filterPanel
    ? Array.from(new Set(activeRows.map(row => colValue(row, filterPanel))))
        .filter(value => String(value || '').toLowerCase().includes(filterSearch.toLowerCase()))
        .sort((a,b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleIds = filtered.map(r => r.id);
  const allVisibleSelected = visibleIds.length && visibleIds.every(id => selectedIds.includes(id));
  const toggleRow = id => setSelectedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
  const setColumnSort = (col, dir) => { setSort({ col, dir }); setMenuCol(null); };
  const toggleFilterValue = (col, value) => {
    setFilters(current => {
      const selected = current[col] || [];
      const nextValues = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      const next = { ...current };
      if (nextValues.length) next[col] = nextValues;
      else delete next[col];
      return next;
    });
  };
  const clearFilterValue = (col, value) => {
    setFilters(current => {
      const nextValues = (current[col] || []).filter(item => item !== value);
      const next = { ...current };
      if (nextValues.length) next[col] = nextValues;
      else delete next[col];
      return next;
    });
  };
  const approvePending = (row) => {
    const approved = { ...row, released:true, pending:false, id:'gf-' + Date.now() };
    setRows(current => [approved, ...current]);
    setPendingRows(current => current.filter(item => item.id !== row.id));
    setSelectedIds(ids => ids.filter(id => id !== row.id));
  };
  const deleteRow = row => {
    if (tab === 'pending') setPendingRows(current => current.filter(item => item.id !== row.id));
    else setRows(current => current.filter(item => item.id !== row.id));
  };
  const deleteSelected = () => {
    if (tab === 'pending') setPendingRows(current => current.filter(row => !selectedIds.includes(row.id)));
    else setRows(current => current.filter(row => !selectedIds.includes(row.id)));
    setSelectedIds([]);
  };
  const saveDetail = () => {
    const selectedEmp = emp(detail.employeeId);
    const next = { ...detail, company:window.company(selectedEmp.company)?.name || selectedEmp.company };
    if (tab === 'pending') setPendingRows(current => current.map(row => row.id === next.id ? next : row));
    else setRows(current => current.map(row => row.id === next.id ? next : row));
    setDetail(null);
  };
  const addRow = () => {
    const first = employees[0];
    const next = {
      id:'gf-' + Date.now(),
      employeeId:first.id,
      company:window.company(first.company)?.name || first.company,
      type:'Bagger',
      otherType:'',
      kind:'Einweisung',
      date:'2026-05-28',
      released:true,
      description:'Neue Ger\u00e4tef\u00fchrer-Freigabe.',
      pending:false,
    };
    setRows(current => [next, ...current]);
    setTab('current');
    setDetail(next);
  };
  const kpis = [
    { label:'Aktuell', value:rows.length, color:'#3f7a4a', tab:'current' },
    { label:'Wartungsliste', value:pendingRows.length, color:'#c96442', tab:'pending' },
    { label:'Ausbildung', value:[...rows, ...pendingRows].filter(r => r.kind === 'Ausbildung').length, color:'#2d6fa3' },
    { label:'Einweisung', value:[...rows, ...pendingRows].filter(r => r.kind === 'Einweisung').length, color:'#8a6a1f' },
  ];
  const ColumnHeader = ({ col }) => {
    const active = sort.col === col.key || filters[col.key]?.length || groupBy === col.key;
    return (
      <th style={{ position:'relative', whiteSpace:'nowrap' }}>
        <button type="button" onClick={() => { setMenuCol(menuCol === col.key ? null : col.key); setFilterSearch(''); }}
          style={{ border:0, background:active ? 'var(--color-parchment)' : 'transparent', borderRadius:6, padding:'7px 8px', cursor:'pointer', font:'inherit', color:'inherit', display:'inline-flex', alignItems:'center', gap:5 }}>
          {col.label}{sort.col === col.key ? <span>{sort.dir === 'asc' ? '^' : 'v'}</span> : <span style={{ opacity:.55 }}>v</span>}
        </button>
        {menuCol === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:100, minWidth:260, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)', letterSpacing:0 }}>
            <button type="button" onClick={() => setColumnSort(col.key, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setColumnSort(col.key, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setFilterPanel(col.key); setFilterSearch(''); setMenuCol(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setGroupBy(groupBy === col.key ? '' : col.key); setColumnSort(col.key, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };
  const Row = ({ row }) => (
    <tr className={'job-row' + (selectedIds.includes(row.id) ? ' is-selected' : '')} onClick={() => setDetail({ ...row })}>
      <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>
      <td><strong>{emp(row.employeeId)?.name}</strong><div className="small muted">{emp(row.employeeId)?.position}</div></td>
      <td>{row.company}</td>
      <td>{row.type === 'Sonstig' && row.otherType ? 'Sonstig - ' + row.otherType : row.type}</td>
      <td>{row.kind}</td>
      <td>{fmt(row.date)}</td>
      <td onClick={e => e.stopPropagation()}>
        <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontWeight:700, color:row.released ? '#3f7a4a' : 'var(--fg-3)' }}>
          <input type="checkbox" checked={row.released} onChange={() => tab === 'pending' ? approvePending(row) : setRows(current => current.map(item => item.id === row.id ? { ...item, released:!item.released } : item))} />
          {row.released ? 'Freigegeben' : 'Nicht freigegeben'}
        </label>
      </td>
      <td style={{ minWidth:260, whiteSpace:'normal' }}>{row.description}</td>
      <td onClick={e => e.stopPropagation()} style={{ textAlign:'center' }}>
        <div style={{ display:'inline-flex', gap:6 }}>
          <button className="job-icon-btn" title="PDF sehen"><Icon name="eye" size={15} /></button>
          <button className="job-icon-btn" title="Bearbeiten" onClick={() => setDetail({ ...row })}><Icon name="edit" size={15} /></button>
          <button className="job-icon-btn" title="Loeschen" style={{ color:'#a13232' }} onClick={() => deleteRow(row)}><Icon name="trash" size={15} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <style>{`
        .gf-table { min-width:1380px; }
        .gf-filter-panel { position:fixed; right:0; top:64px; bottom:0; width:390px; z-index:120; background:white; box-shadow:-18px 0 50px rgba(0,0,0,.16); display:flex; flex-direction:column; }
        .gf-drawer { position:fixed; top:64px; right:0; bottom:0; width:min(700px, 96vw); z-index:120; background:var(--color-ivory); border-left:1px solid var(--border-1); box-shadow:-18px 0 42px rgba(0,0,0,.18); display:flex; flex-direction:column; }
        .gf-hero { background:#10100f; color:white; padding:24px; display:flex; gap:16px; align-items:flex-start; position:relative; }
        .gf-hero h2 { margin:0 0 6px; font-family:var(--font-serif); font-size:25px; font-weight:500; }
        .gf-close { position:absolute; top:18px; right:18px; border:0; background:transparent; color:rgba(255,255,255,.7); cursor:pointer; }
        .gf-tabs { display:flex; border-bottom:1px solid var(--border-1); background:var(--color-parchment); }
        .gf-tab { padding:13px 16px; border:0; border-right:1px solid var(--border-1); background:var(--color-ivory); font:inherit; font-weight:700; }
        .gf-body { overflow:auto; padding:20px 24px; display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .gf-body label { display:grid; gap:7px; margin:0; min-width:0; }
        .gf-body .form-label { font-size:11px; line-height:1; font-weight:800; color:var(--fg-3); text-transform:uppercase; }
        .gf-body .input { width:100%; min-height:44px; border:1px solid var(--border-1); border-radius:8px; background:white; padding:0 12px; font:inherit; box-sizing:border-box; }
        .gf-body textarea.input { min-height:96px; padding:10px 12px; resize:vertical; }
      `}</style>
      <div className="view__header">
        <div>
          <h1 className="view__title">{'Ger\u00e4tef\u00fchrer'}</h1>
          <div className="view__subtitle">{'Ausbildungen, Einweisungen, Ger\u00e4tetypen und Freigaben f\u00fcr Mitarbeiter.'}</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary" onClick={addRow}><Icon name="plus" size={14} />Eintrag erstellen</button>
        </div>
      </div>
      <div className="job-kpis" style={{ gridTemplateColumns:'repeat(4, minmax(150px, 1fr))' }}>
        {kpis.map(kpi => (
          <button key={kpi.label} type="button" className={'job-kpi' + (kpi.tab === tab ? ' job-kpi--active' : '')} onClick={() => kpi.tab && setTab(kpi.tab)} style={{ '--job-kpi-color': kpi.color }}>
            <span>{kpi.label}</span><strong>{kpi.value}</strong>
          </button>
        ))}
      </div>
      <div className="job-tabs" style={{ marginBottom:14 }}>
        <button className={tab === 'current' ? 'is-active' : ''} onClick={() => { setTab('current'); setSelectedIds([]); }}>Aktuell {rows.length}</button>
        <button className={tab === 'pending' ? 'is-active' : ''} onClick={() => { setTab('pending'); setSelectedIds([]); }}>Wartungsliste <span style={{ color:'var(--color-accent)' }}>{pendingRows.length}</span></button>
      </div>
      {Object.entries(filters).some(([, values]) => values.length) || groupBy ? (
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:12 }}>
          {Object.entries(filters).map(([col, values]) => values.map(value => (
            <span key={col + value} style={{ display:'inline-flex', gap:8, alignItems:'center', background:'var(--color-parchment)', borderRadius:999, padding:'6px 10px' }}>
              <span style={{ color:'var(--fg-2)' }}>{colLabel(col)}:</span>{String(value)}
              <button type="button" onClick={() => clearFilterValue(col, value)} style={{ border:0, background:'transparent', cursor:'pointer', padding:0 }}><Icon name="x" size={14} /></button>
            </span>
          )))}
          {groupBy && <span style={{ display:'inline-flex', gap:8, alignItems:'center', background:'var(--color-parchment)', borderRadius:999, padding:'6px 10px' }}>Gruppiert nach {colLabel(groupBy)}<button type="button" onClick={() => setGroupBy('')} style={{ border:0, background:'transparent', cursor:'pointer', padding:0 }}><Icon name="x" size={14} /></button></span>}
          <button type="button" className="btn btn--ghost" onClick={() => { setFilters({}); setGroupBy(''); }}>Alle Filter loeschen</button>
        </div>
      ) : null}
      {selectedIds.length > 0 && (
        <div className="job-bulkbar" style={{ marginBottom:12 }}>
          <strong>{selectedIds.length} ausgewaehlt</strong>
          <button className="btn btn--ghost"><Icon name="download" size={15} />PDF export</button>
          <button className="btn btn--danger" onClick={deleteSelected}><Icon name="x" size={15} />Loeschen</button>
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}><span className="muted small">{filtered.length} Eintraege</span></div>
      <div className="tbl-wrap">
        <table className="tbl job-table gf-table">
          <thead><tr>
            <th style={{ width:38 }}><input type="checkbox" checked={!!allVisibleSelected} onChange={() => setSelectedIds(allVisibleSelected ? [] : visibleIds)} /></th>
            {columns.map(col => <ColumnHeader key={col.key} col={col} />)}
            <th style={{ textAlign:'center' }}>Aktionen</th>
          </tr></thead>
          <tbody>
            {groupBy ? Object.entries(grouped).map(([group, items]) => (
              <React.Fragment key={group}>
                <tr><td colSpan={columns.length + 2} style={{ background:'var(--color-parchment)', fontWeight:800 }}>{colLabel(groupBy)}: {group} ({items.length})</td></tr>
                {items.map(row => <Row key={row.id} row={row} />)}
              </React.Fragment>
            )) : filtered.map(row => <Row key={row.id} row={row} />)}
          </tbody>
        </table>
      </div>
      {filterPanel && (
        <div className="gf-filter-panel">
          <div style={{ padding:22, borderBottom:'1px solid var(--border-1)', display:'flex', justifyContent:'space-between', gap:12 }}>
            <h2 style={{ margin:0, fontSize:24 }}>Filtern nach "{colLabel(filterPanel)}"</h2>
            <button className="icon-btn" onClick={() => setFilterPanel(null)}><Icon name="x" size={20} /></button>
          </div>
          <div style={{ padding:18, borderBottom:'1px solid var(--border-1)' }}><input className="input" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden" /></div>
          <div style={{ flex:1, overflow:'auto', padding:18, display:'grid', gap:10 }}>
            {filterValues.map(value => <label key={String(value)} style={{ display:'flex', gap:10, alignItems:'center', fontSize:15 }}><input type="checkbox" checked={(filters[filterPanel] || []).includes(value)} onChange={() => toggleFilterValue(filterPanel, value)} /><span>{String(value || 'Leer')}</span></label>)}
          </div>
          <div style={{ padding:18, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, borderTop:'1px solid var(--border-1)' }}>
            <button className="btn btn--primary" onClick={() => setFilterPanel(null)}>Anwenden</button>
            <button className="btn btn--ghost" onClick={() => setFilters(current => { const next = { ...current }; delete next[filterPanel]; return next; })}>Auswahl aufheben</button>
          </div>
        </div>
      )}
      {detail && (
        <>
          <div onClick={() => setDetail(null)} style={{ position:'fixed', top:64, left:0, right:0, bottom:0, background:'rgba(0,0,0,.18)', zIndex:119 }} />
          <aside className="gf-drawer">
            <div className="gf-hero">
              <button className="gf-close" onClick={() => setDetail(null)}><Icon name="x" size={22} /></button>
              <div className="avatar avatar--3">{emp(detail.employeeId)?.initials}</div>
              <div><h2>{emp(detail.employeeId)?.name}</h2><p style={{ margin:0, color:'rgba(255,255,255,.68)' }}>{detail.type} - {detail.kind}</p></div>
            </div>
            <div className="gf-tabs"><button className="gf-tab">Stammdaten</button></div>
            <div className="gf-body">
              <label><span className="form-label">Mitarbeiter</span><select className="input" value={detail.employeeId} onChange={e => {
                const nextEmp = emp(e.target.value);
                setDetail({ ...detail, employeeId:e.target.value, company:window.company(nextEmp.company)?.name || nextEmp.company });
              }}>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
              <label><span className="form-label">Firma</span><input className="input" value={detail.company} readOnly /></label>
              <label><span className="form-label">{'Typ Ger\u00e4t'}</span><select className="input" value={detail.type} onChange={e => setDetail({ ...detail, type:e.target.value })}>{deviceTypes.map(type => <option key={type}>{type}</option>)}</select></label>
              {detail.type === 'Sonstig' && <label><span className="form-label">{'Sonstiges Ger\u00e4t'}</span><input className="input" value={detail.otherType || ''} onChange={e => setDetail({ ...detail, otherType:e.target.value })} /></label>}
              <label><span className="form-label">Ausbildung oder Einweisung</span><select className="input" value={detail.kind} onChange={e => setDetail({ ...detail, kind:e.target.value })}><option>Ausbildung</option><option>Einweisung</option></select></label>
              <label><span className="form-label">Datum Ausbildung / Einweisung</span><input type="date" className="input" value={detail.date} onChange={e => setDetail({ ...detail, date:e.target.value })} /></label>
              <label style={{ gridColumn:'1 / -1' }}><span className="form-label">{'Freigabe f\u00fcr Mitarbeiter'}</span><span style={{ display:'flex', alignItems:'center', gap:10, minHeight:44 }}><input type="checkbox" checked={detail.released} onChange={e => setDetail({ ...detail, released:e.target.checked })} />{detail.released ? 'Freigegeben' : 'Nicht freigegeben'}</span></label>
              <label style={{ gridColumn:'1 / -1' }}><span className="form-label">Beschreibung</span><textarea className="input" value={detail.description} onChange={e => setDetail({ ...detail, description:e.target.value })} /></label>
              <div style={{ gridColumn:'1 / -1', display:'flex', justifyContent:'flex-end', gap:10, borderTop:'1px solid var(--border-1)', paddingTop:14 }}>
                <button className="btn btn--ghost" onClick={() => setDetail(null)}>Abbrechen</button>
                <button className="btn btn--primary" onClick={saveDetail}>Speichern</button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

Object.assign(window, { GeraetefuehrerView });
