function NormenmatrixView() {
  const initialRows = (window.NORMENMATRIX_ROWS || []).map((row, index) => ({
    ...row,
    nr: index + 1,
    status: row.status || 'Aktuell',
  }));

  const [rows, setRows] = React.useState(initialRows);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [sort, setSort] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('normenmatrix_sort') || '{"col":"nr","dir":"asc"}'); }
    catch { return { col:'nr', dir:'asc' }; }
  });
  const [filters, setFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [menuCol, setMenuCol] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [detailRow, setDetailRow] = React.useState(null);
  const [detailTab, setDetailTab] = React.useState('stammdaten');

  const statusCfg = {
    Aktuell: { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf' },
    'Pruefung faellig': { color:'#9a741f', bg:'#fff7dd', border:'#ead89b' },
    Veraltet: { color:'#ad3434', bg:'#fdebea', border:'#efc2bd' },
  };

  const columns = [
    { key:'nr', label:'Nr.', type:'number', value:r => r.nr },
    { key:'bereich', label:'Bereich', value:r => r.bereich },
    { key:'norm', label:'Norm / Regelwerk', value:r => r.norm },
    { key:'zweck', label:'Zweck / Beschreibung', value:r => r.zweck },
    { key:'version', label:'Ausgabedatum / Version', value:r => r.version },
    { key:'lastCheck', label:'Letzte Pruefung', type:'date', value:r => r.lastCheck, display:r => fmtDate(r.lastCheck) },
    { key:'status', label:'Status', value:r => r.status },
    { key:'document', label:'Dokument', value:r => r.document },
    { key:'link', label:'Link', value:r => r.link || '-' },
    { key:'provider', label:'Anbieter', value:r => r.provider },
    { key:'notes', label:'Bemerkungen', value:r => r.notes || '-' },
  ];

  const fmtDate = (value) => {
    if (!value) return '-';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return window.fmtDE ? window.fmtDE(value) : value;
    return value;
  };
  const colLabel = key => columns.find(col => col.key === key)?.label || key;
  const colValue = (row, key) => {
    const col = columns.find(item => item.key === key);
    return col ? col.value(row) : row[key];
  };
  const setColumnSort = (col, dir) => {
    const next = { col, dir };
    setSort(next);
    try { localStorage.setItem('normenmatrix_sort', JSON.stringify(next)); } catch {}
    setMenuCol(null);
  };
  const toggleFilterValue = (col, value) => {
    setFilters(current => {
      const selected = current[col] || [];
      const nextValues = selected.includes(value)
        ? selected.filter(item => item !== value)
        : [...selected, value];
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
  const clearColumnFilter = col => {
    setFilters(current => {
      const next = { ...current };
      delete next[col];
      return next;
    });
  };

  const filtered = rows
    .filter(row => Object.entries(filters).every(([col, values]) => values.includes(colValue(row, col))))
    .sort((a, b) => {
      const col = columns.find(item => item.key === sort.col);
      let av = colValue(a, sort.col);
      let bv = colValue(b, sort.col);
      if (col?.type === 'number') return sort.dir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
      if (col?.type === 'date') {
        av = new Date(av || '1900-01-01');
        bv = new Date(bv || '1900-01-01');
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av || '').localeCompare(String(bv || ''), 'de');
      return sort.dir === 'asc' ? cmp : -cmp;
    });

  const filterValues = filterPanel
    ? Array.from(new Set(rows.map(row => colValue(row, filterPanel))))
        .filter(value => String(value || '').toLowerCase().includes(filterSearch.toLowerCase()))
        .sort((a, b) => String(a || '').localeCompare(String(b || ''), 'de'))
    : [];
  const visibleIds = filtered.map(row => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const selectedRows = rows.filter(row => selectedIds.includes(row.id));
  const groupedRows = groupBy
    ? filtered.reduce((acc, row) => {
        const value = colValue(row, groupBy) || 'Leer';
        if (!acc[value]) acc[value] = [];
        acc[value].push(row);
        return acc;
      }, {})
    : null;

  const toggleRow = id => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds(allVisibleSelected ? [] : visibleIds);
  const deleteSelected = () => {
    setRows(current => current.filter(row => !selectedIds.includes(row.id)));
    setSelectedIds([]);
  };
  const updateSelectedStatus = status => {
    if (!status) return;
    setRows(current => current.map(row => selectedIds.includes(row.id) ? { ...row, status } : row));
    setSelectedIds([]);
  };
  const openDetail = (row) => {
    setDetailRow(row);
    setDetailTab('stammdaten');
  };
  const saveDetail = () => {
    setRows(current => current.map(row => row.id === detailRow.id ? detailRow : row));
    setDetailRow(null);
  };

  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});
  const kpis = [
    { label:'Gesamt', value:rows.length, color:'#2d6fa3' },
    { label:'Aktuell', value:counts.Aktuell || 0, color:'#3f7a4a' },
    { label:'Pruefung faellig', value:counts['Pruefung faellig'] || 0, color:'#9a741f' },
    { label:'Veraltet', value:counts.Veraltet || 0, color:'#ad3434' },
  ];

  const StatusBadge = ({ status }) => {
    const cfg = statusCfg[status] || statusCfg.Aktuell;
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 9px', borderRadius:999, border:'1px solid '+cfg.border, background:cfg.bg, color:cfg.color, fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
        <span style={{ width:6, height:6, borderRadius:99, background:cfg.color }} />{status}
      </span>
    );
  };

  const ColumnHeader = ({ col }) => {
    const active = sort.col === col.key || (filters[col.key] || []).length || groupBy === col.key;
    return (
      <th style={{ position:'relative', whiteSpace:'nowrap' }}>
        <button type="button" onClick={() => { setMenuCol(menuCol === col.key ? null : col.key); setFilterSearch(''); }}
          style={{ border:0, background:active ? 'var(--color-parchment)' : 'transparent', borderRadius:6, padding:'7px 8px', cursor:'pointer', font:'inherit', color:'inherit', display:'inline-flex', alignItems:'center', gap:5 }}>
          {col.label}
          {sort.col === col.key ? <span>{sort.dir === 'asc' ? '^' : 'v'}</span> : <span style={{ opacity:.55 }}>v</span>}
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
    <tr className={'job-row' + (detailRow?.id === row.id ? ' job-row--active' : '') + (selectedIds.includes(row.id) ? ' is-selected' : '')} onClick={() => openDetail(row)}>
      <td onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>
      <td>{row.nr}</td>
      <td>{row.bereich}</td>
      <td><strong>{row.norm}</strong></td>
      <td style={{ minWidth:280, whiteSpace:'normal', lineHeight:1.35 }}>{row.zweck || '-'}</td>
      <td>{row.version || '-'}</td>
      <td>{fmtDate(row.lastCheck)}</td>
      <td><StatusBadge status={row.status} /></td>
      <td><button className="job-small-btn" onClick={event => event.stopPropagation()}><Icon name="eye" size={14} />Vorschau</button></td>
      <td>{row.link ? <a href={row.link} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} style={{ color:'var(--color-accent)', fontWeight:700 }}>Link</a> : '-'}</td>
      <td>{row.provider || '-'}</td>
      <td style={{ minWidth:220, whiteSpace:'normal' }}>{row.notes || '-'}</td>
      <td onClick={event => event.stopPropagation()}>
        <div style={{ display:'flex', gap:5 }}>
          <button className="job-icon-btn" title="Vorschau"><Icon name="eye" size={15} /></button>
          <button className="job-icon-btn" title="Bearbeiten" onClick={() => openDetail(row)}><Icon name="edit" size={15} /></button>
          <button className="job-icon-btn" title="Loeschen" style={{ color:'#a13232' }} onClick={() => setRows(current => current.filter(item => item.id !== row.id))}><Icon name="trash" size={15} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <style>{`
        .norm-table-wrap { overflow:auto; }
        .norm-table { min-width:1850px; }
        .norm-table td { vertical-align:top; }
        .norm-table tr.job-row--active td { background:var(--color-parchment); }
        .norm-table tr.is-selected td { background:#fff4ec; }
        .norm-filter-panel { position:fixed; right:0; top:0; bottom:0; width:390px; z-index:3600; background:white; box-shadow:-18px 0 50px rgba(0,0,0,.16); display:flex; flex-direction:column; }
      `}</style>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:18 }}>
        <div>
          <h1 style={{ margin:'0 0 6px', fontSize:36 }}>Normenmatrix</h1>
          <p className="muted" style={{ margin:0 }}>Normen, Regelwerke, Pruefstatus, Dokumente und Anbieter aus FBAG_049.</p>
        </div>
        <button className="btn btn--primary"><Icon name="plus" size={16} />Norm hinzufuegen</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {kpis.map(kpi => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => kpi.label === 'Gesamt' ? setFilters({}) : setFilters({ status:[kpi.label] })}
            style={{
              padding:'10px 14px',
              background: 'var(--color-ivory)',
              border: '1px solid var(--border-1)',
              borderRadius:10,
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 16,
              alignItems: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.048)',
              transition:'all 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-white)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--color-ivory)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.048)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{kpi.label}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'center', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:500, color: kpi.color, lineHeight:1 }}>{kpi.value}</div>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--fg-3)', textAlign:'right' }}>Klicken</div>
          </button>
        ))}
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
          <select className="input" defaultValue="" onChange={event => updateSelectedStatus(event.target.value)} style={{ width:190 }}>
            <option value="">Status aendern</option>
            <option value="Aktuell">Aktuell</option>
            <option value="Pruefung faellig">Pruefung faellig</option>
            <option value="Veraltet">Veraltet</option>
          </select>
          <button className="btn btn--danger" onClick={deleteSelected}><Icon name="x" size={15} />Loeschen</button>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
        <span className="muted small">{filtered.length} von {rows.length} Eintraegen</span>
      </div>

      <div className="job-layout">
        <div className="tbl-wrap job-table-wrap norm-table-wrap">
          <table className="tbl job-table norm-table">
            <thead>
              <tr>
                <th style={{ width:38, textAlign:'center' }}><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} /></th>
                {columns.map(col => <ColumnHeader key={col.key} col={col} />)}
                <th style={{ textAlign:'center' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {groupBy ? Object.entries(groupedRows).map(([group, items]) => (
                <React.Fragment key={group}>
                  <tr><td colSpan={columns.length + 2} style={{ background:'var(--color-parchment)', fontWeight:800 }}>{colLabel(groupBy)}: {group} ({items.length})</td></tr>
                  {items.map(row => <Row key={row.id} row={row} />)}
                </React.Fragment>
              )) : filtered.map(row => <Row key={row.id} row={row} />)}
            </tbody>
          </table>
        </div>

      </div>

      {filterPanel && (
        <div className="norm-filter-panel">
          <div style={{ padding:22, borderBottom:'1px solid var(--border-1)', display:'flex', justifyContent:'space-between', gap:12 }}>
            <h2 style={{ margin:0, fontSize:24 }}>Filtern nach "{colLabel(filterPanel)}"</h2>
            <button className="icon-btn" onClick={() => setFilterPanel(null)}><Icon name="x" size={20} /></button>
          </div>
          <div style={{ padding:18, borderBottom:'1px solid var(--border-1)' }}>
            <input className="input" value={filterSearch} onChange={event => setFilterSearch(event.target.value)} placeholder="Text eingeben, um Filter zu finden" />
          </div>
          <div style={{ flex:1, overflow:'auto', padding:18, display:'grid', gap:10 }}>
            {filterValues.map(value => (
              <label key={String(value)} style={{ display:'flex', gap:10, alignItems:'center', fontSize:15 }}>
                <input type="checkbox" checked={(filters[filterPanel] || []).includes(value)} onChange={() => toggleFilterValue(filterPanel, value)} />
                <span>{String(value || 'Leer')}</span>
              </label>
            ))}
          </div>
          <div style={{ padding:18, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, borderTop:'1px solid var(--border-1)' }}>
            <button className="btn btn--primary" onClick={() => setFilterPanel(null)}>Anwenden</button>
            <button className="btn btn--ghost" onClick={() => clearColumnFilter(filterPanel)}>Auswahl aufheben</button>
          </div>
        </div>
      )}

      {detailRow && (
        <>
          <div onClick={() => setDetailRow(null)} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.35)', backdropFilter:'blur(1px)' }} />
          <div style={{
            position:'fixed', top:0, right:0, bottom:0, zIndex:3100,
            width:700, maxWidth:'calc(100vw - 24px)', background:'var(--color-ivory)',
            boxShadow:'-8px 0 40px rgba(0,0,0,0.16)',
            display:'flex', flexDirection:'column',
            animation:'slideInRight 220ms cubic-bezier(0.4,0,0.2,1)',
          }}>
            <div style={{ background:'var(--color-near-black)', color:'#fff', padding:'20px 22px 16px', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                <div className="avatar" style={{ width:58, height:58, fontSize:18, flexShrink:0, background:'var(--color-terracotta)' }}>
                  {String(detailRow.norm || 'N').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:500, lineHeight:1.15 }}>{detailRow.norm}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.58)', marginTop:5 }}>
                    Nr. {detailRow.nr} - {detailRow.bereich} - {detailRow.provider || 'Kein Anbieter'}
                  </div>
                </div>
                <button onClick={() => setDetailRow(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.6)', padding:4, flexShrink:0 }}>
                  <Icon name="x" size={20} />
                </button>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <StatusBadge status={detailRow.status} />
                <span style={{ fontSize:11, padding:'4px 10px', borderRadius:99, background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)' }}>{detailRow.version || 'Keine Version'}</span>
              </div>
            </div>

            <div style={{ display:'flex', borderBottom:'1px solid var(--border-1)', background:'var(--color-parchment)', flexShrink:0, overflowX:'auto' }}>
              {[
                ['stammdaten', 'Stammdaten'],
                ['beschreibung', 'Beschreibung'],
                ['dokumente', 'Dokumente'],
                ['bemerkungen', 'Bemerkungen'],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setDetailTab(id)} style={{
                  padding:'12px 16px', border:'none', background:detailTab === id ? 'var(--color-ivory)' : 'transparent',
                  fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer',
                  color: detailTab === id ? 'var(--fg-1)' : 'var(--fg-3)',
                  borderBottom: detailTab === id ? '2px solid var(--color-accent)' : '2px solid transparent',
                  whiteSpace:'nowrap',
                }}>{label}</button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
              {detailTab === 'stammdaten' && (
                <div style={{ display:'grid', gap:14 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[
                      ['nr', 'Nr.'],
                      ['bereich', 'Bereich'],
                      ['norm', 'Norm / Regelwerk'],
                      ['version', 'Ausgabedatum / Version'],
                      ['lastCheck', 'Letzte Pruefung'],
                      ['provider', 'Anbieter'],
                      ['link', 'Link'],
                      ['document', 'Dokument'],
                    ].map(([key, label]) => (
                      <label key={key} style={{ display:'grid', gap:5 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' }}>{label}</span>
                        <input className="input" value={detailRow[key] || ''} onChange={event => setDetailRow({ ...detailRow, [key]: key === 'nr' ? Number(event.target.value) : event.target.value })} />
                      </label>
                    ))}
                    <label style={{ display:'grid', gap:5 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' }}>Status</span>
                      <select className="input" value={detailRow.status} onChange={event => setDetailRow({ ...detailRow, status:event.target.value })}>
                        <option>Aktuell</option>
                        <option>Pruefung faellig</option>
                        <option>Veraltet</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {detailTab === 'beschreibung' && (
                <label style={{ display:'grid', gap:5 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' }}>Zweck / Beschreibung</span>
                  <textarea className="input" value={detailRow.zweck || ''} onChange={event => setDetailRow({ ...detailRow, zweck:event.target.value })} style={{ minHeight:220, resize:'vertical' }} />
                </label>
              )}

              {detailTab === 'dokumente' && (
                <div style={{ display:'grid', gap:14 }}>
                  <div style={{ border:'1px solid var(--border-1)', borderRadius:10, background:'var(--color-white)', padding:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <Icon name="doc" size={18} />
                      <strong>Dokument</strong>
                    </div>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, borderRadius:999, background:'#d7f1f0', color:'#087878', padding:'8px 12px', maxWidth:'100%' }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{detailRow.document || 'Kein Dokument'}</span>
                      <button type="button" onClick={() => setDetailRow({ ...detailRow, document:'' })} style={{ border:0, background:'transparent', color:'#087878', cursor:'pointer', padding:0 }}><Icon name="x" size={15} /></button>
                    </div>
                    <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap' }}>
                      <button className="btn btn--ghost"><Icon name="eye" size={14} />Vorschau</button>
                      <button className="btn btn--ghost"><Icon name="download" size={14} />Download</button>
                      <button className="btn btn--ghost"><Icon name="upload" size={14} />Anlage hinzufuegen</button>
                    </div>
                  </div>
                  <label style={{ display:'grid', gap:5 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' }}>Link</span>
                    <input className="input" value={detailRow.link || ''} onChange={event => setDetailRow({ ...detailRow, link:event.target.value })} />
                  </label>
                </div>
              )}

              {detailTab === 'bemerkungen' && (
                <label style={{ display:'grid', gap:5 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' }}>Bemerkungen</span>
                  <textarea className="input" value={detailRow.notes || ''} onChange={event => setDetailRow({ ...detailRow, notes:event.target.value })} style={{ minHeight:220, resize:'vertical' }} />
                </label>
              )}
            </div>

            <div style={{ padding:'16px 22px', borderTop:'1px solid var(--border-1)', display:'flex', justifyContent:'flex-end', gap:10, background:'var(--color-ivory)' }}>
              <button className="btn btn--ghost" onClick={() => setDetailRow(null)}>Abbrechen</button>
              <button className="btn btn--primary" onClick={saveDetail}>Speichern</button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

Object.assign(window, { NormenmatrixView });
