function FormulareView() {
  const prefixes = [
    ['AA', 'Arbeitsanweisung'],
    ['BA', 'Betriebsanweisung'],
    ['BL', 'Bauleiter'],
    ['DVGW', 'Deutscher Verein des Gas- und Wasserfaches e. V'],
    ['FASI', 'Fachkraft fuer Arbeitssicherheit'],
    ['GF', 'Geschaeftsfuehrung'],
    ['LMRA', 'Letzte Minute Risiko Analyse'],
    ['QM', 'Qualitaetsmanagement'],
    ['QMB', 'Qualitaetsmanagement-Beauftragte'],
    ['QMH', 'Qualitaets-Management-Handbuch'],
    ['QMS', 'Qualitaets-Management-System'],
    ['SCC', 'Sicherheits Certifikat Contraktoren'],
    ['SGU', 'Sicherheit, Gesundheit, Umweltschutz'],
    ['SHB', 'Schweisstechnik-Handbuch'],
    ['VAS', 'Verfahrensanweisung Arbeitssicherheit'],
    ['FBAG', 'Formblatt / Formular - Allgemein'],
    ['FBL', 'Formblatt / Formular - Lager'],
    ['FBBL', 'Formblatt / Formular - Baustelle'],
    ['FBG', 'Formblatt / Formular - Geraet'],
  ];

  const initialRows = [
    { nr:364, prefix:'QMS', suffix:'068', version:'002', validFrom:'2024-04-01', updated:'2026-02-09', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Personalauswahl und Schulungen', page:2, description:'Formular' },
    { nr:365, prefix:'QMS', suffix:'069', version:'004', validFrom:'2022-02-01', updated:'2026-02-02', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'SGU-Jahresplanung', page:1, description:'Formular' },
    { nr:366, prefix:'QMS', suffix:'070', version:'001', validFrom:'2026-02-27', updated:'2026-02-27', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Zertifizierungsuebersicht der Janning Group', page:1, description:'Organigramm' },
    { nr:367, prefix:'QMS', suffix:'071', version:'001', validFrom:'2026-02-02', updated:'2026-02-02', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Bauleiterbesprechung - Gespraechsprotokoll', page:1, description:'Formular' },
    { nr:368, prefix:'QMS', suffix:'072', version:'001', validFrom:'2023-02-02', updated:'2026-02-24', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'QSGU-Ziele und Aktionsplan', page:2, description:'Formular' },
    { nr:369, prefix:'QMS', suffix:'073', version:'001', validFrom:'2026-03-01', updated:'2026-03-01', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'12 Sprache', name:'meldeblock_verbandbuch', page:1, description:'Online Formulare' },
    { nr:370, prefix:'QMS', suffix:'074', version:'001', validFrom:'2026-03-01', updated:'2026-03-01', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'12 Sprache', name:'Firmenwagen Problemmeldung', page:1, description:'Online Formulare' },
    { nr:371, prefix:'QMS', suffix:'075', version:'001', validFrom:'2026-03-01', updated:'2026-03-01', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'12 Sprache', name:'Unfallbericht Autos', page:1, description:'Online Formulare' },
    { nr:372, prefix:'QMS', suffix:'076', version:'001', validFrom:'2026-04-16', updated:'2026-04-16', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'BEM Checkliste', page:1, description:'BEM' },
    { nr:373, prefix:'QMS', suffix:'077', version:'001', validFrom:'2026-04-16', updated:'2026-04-16', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Angebot eines Betrieblichen Eingliederungsmanagements (BEM)', page:1, description:'BEM' },
    { nr:374, prefix:'QMS', suffix:'078', version:'001', validFrom:'2026-04-16', updated:'2026-04-16', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Rueckmeldung zum Angebot des Betrieblichen Eingliederungsmanagements (BEM)', page:1, description:'BEM' },
    { nr:375, prefix:'QMS', suffix:'079', version:'001', validFrom:'2026-04-04', updated:'2026-04-04', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Freiwillige Vorsorge-/Unterweisung', page:1, description:'Online Formulare' },
    { nr:376, prefix:'QMS', suffix:'080', version:'001', validFrom:'2026-05-12', updated:'2026-05-12', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Sicherheits- und Geraetecheck vor Arbeitsbeginn', page:1, description:'Online Formulare' },
    { nr:377, prefix:'SGU', suffix:'001', version:'001', validFrom:'2022-05-01', updated:'2026-01-06', nextCheck:'2026-01-06', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Arbeitsmedizinische Untersuchung', page:1, description:'Checkliste' },
    { nr:378, prefix:'SGU', suffix:'002', version:'001', validFrom:'2022-05-01', updated:'2026-01-06', nextCheck:'2026-01-06', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Dokumentation der Erste-Hilfe-Leistungen', page:1, description:'Erste Hilfe Dokument' },
  ].map(row => ({ ...row, id:'form-' + row.nr }));

  const [rows, setRows] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('formulare_rows_v1') || 'null') || initialRows; }
    catch { return initialRows; }
  });
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [sort, setSort] = React.useState({ col:'nr', dir:'asc' });
  const [filters, setFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [menuCol, setMenuCol] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [detail, setDetail] = React.useState(null);

  React.useEffect(() => {
    try { localStorage.setItem('formulare_rows_v1', JSON.stringify(rows)); } catch {}
  }, [rows]);

  const internalNr = row => `${row.prefix}_${row.suffix}`;
  const fmt = iso => {
    if (!iso) return '-';
    const [y,m,d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };
  const columns = [
    { key:'nr', label:'Nr.', type:'number', value:r => r.nr },
    { key:'internal', label:'Interne Nr', value:r => internalNr(r) },
    { key:'version', label:'Version', value:r => r.version },
    { key:'validFrom', label:'Gueltig ab', type:'date', value:r => r.validFrom, display:r => fmt(r.validFrom) },
    { key:'updated', label:'Letzte Aktualisierung', type:'date', value:r => r.updated, display:r => fmt(r.updated) },
    { key:'nextCheck', label:'Naechste Pruefung', type:'date', value:r => r.nextCheck, display:r => fmt(r.nextCheck) },
    { key:'responsible', label:'Verantwortlicher', value:r => r.responsible },
    { key:'status', label:'Status', value:r => r.status },
    { key:'language', label:'Sprache', value:r => r.language },
    { key:'name', label:'Name Formulare', value:r => r.name },
    { key:'page', label:'Seite', type:'number', value:r => r.page },
    { key:'description', label:'Beschreibung', value:r => r.description },
  ];
  const colValue = (row, key) => columns.find(col => col.key === key)?.value(row) ?? row[key];
  const colLabel = key => columns.find(col => col.key === key)?.label || key;
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
  const filtered = rows
    .filter(row => Object.entries(filters).every(([col, values]) => values.includes(colValue(row, col))))
    .sort((a, b) => {
      const col = columns.find(item => item.key === sort.col);
      let av = colValue(a, sort.col);
      let bv = colValue(b, sort.col);
      if (col?.type === 'number') return sort.dir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
      if (col?.type === 'date') return sort.dir === 'asc' ? new Date(av) - new Date(bv) : new Date(bv) - new Date(av);
      const cmp = String(av || '').localeCompare(String(bv || ''), 'de');
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  const grouped = groupBy
    ? filtered.reduce((acc, row) => {
        const value = colValue(row, groupBy) || 'Leer';
        if (!acc[value]) acc[value] = [];
        acc[value].push(row);
        return acc;
      }, {})
    : null;
  const filterValues = filterPanel
    ? Array.from(new Set(rows.map(row => colValue(row, filterPanel))))
        .filter(value => String(value || '').toLowerCase().includes(filterSearch.toLowerCase()))
        .sort((a,b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleIds = filtered.map(row => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const toggleRow = id => setSelectedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
  const deleteSelected = () => { setRows(current => current.filter(row => !selectedIds.includes(row.id))); setSelectedIds([]); };
  const saveDetail = () => {
    setRows(current => current.map(row => row.id === detail.id ? detail : row));
    setDetail(null);
  };
  const statusCounts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});
  const kpis = [
    { label:'Gesamt', value:rows.length, color:'#2d6fa3' },
    { label:'Aktiv', value:statusCounts.aktiv || 0, color:'#3f7a4a' },
    { label:'Pruefung faellig', value:rows.filter(row => new Date(row.nextCheck) <= new Date('2026-06-01')).length, color:'#9a741f' },
    { label:'Online Formulare', value:rows.filter(row => row.description === 'Online Formulare').length, color:'#2d6fa3' },
  ];
  const setKpiFilter = label => {
    if (label === 'Gesamt') setFilters({});
    if (label === 'Aktiv') setFilters({ status:['aktiv'] });
    if (label === 'Online Formulare') setFilters({ description:['Online Formulare'] });
    if (label === 'Pruefung faellig') setFilters({ nextCheck:['2026-06-01', '2026-01-06'] });
  };
  const StatusBadge = ({ status }) => (
    <span className="badge badge--valid"><span className="badge__dot" />{status}</span>
  );
  const ColumnHeader = ({ col }) => {
    const active = sort.col === col.key || filters[col.key]?.length || groupBy === col.key;
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
    <tr className={'job-row' + (selectedIds.includes(row.id) ? ' is-selected' : '')} onClick={() => setDetail({ ...row })}>
      <td onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>
      {columns.map(col => (
        <td key={col.key} style={col.key === 'name' ? { minWidth:280, whiteSpace:'normal' } : null}>
          {col.key === 'status' ? <StatusBadge status={row.status} /> : (col.display ? col.display(row) : col.value(row))}
        </td>
      ))}
      <td onClick={event => event.stopPropagation()} style={{ textAlign:'center' }}>
        <div style={{ display:'inline-flex', gap:6 }}>
          <button className="job-icon-btn" title="PDF anschauen"><Icon name="eye" size={15} /></button>
          <button className="job-icon-btn" title="Bearbeiten" onClick={() => setDetail({ ...row })}><Icon name="edit" size={15} /></button>
          <button className="job-icon-btn" title="Loeschen" style={{ color:'#a13232' }} onClick={() => setRows(current => current.filter(item => item.id !== row.id))}><Icon name="trash" size={15} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <style>{`
        .form-table-wrap { overflow:auto; }
        .form-table { min-width:1780px; }
        .form-table tr.is-selected td { background:#fff4ec; }
        .form-filter-panel { position:fixed; right:0; top:64px; bottom:0; width:390px; z-index:120; background:white; box-shadow:-18px 0 50px rgba(0,0,0,.16); display:flex; flex-direction:column; }
        .form-drawer { position:fixed; top:64px; right:0; bottom:0; width:min(720px, 96vw); z-index:120; background:var(--color-ivory); border-left:1px solid var(--border-1); box-shadow:-18px 0 42px rgba(0,0,0,.18); display:flex; flex-direction:column; }
        .form-drawer__hero { background:#10100f; color:white; padding:24px; display:flex; gap:16px; align-items:flex-start; position:relative; }
        .form-drawer__hero h2 { margin:0 0 6px; font-family:var(--font-serif); font-size:25px; font-weight:500; line-height:1.15; max-width:560px; }
        .form-drawer__hero p { margin:0; color:rgba(255,255,255,.68); }
        .form-drawer__close { position:absolute; top:18px; right:18px; border:0; background:transparent; color:rgba(255,255,255,.7); cursor:pointer; }
        .form-drawer__tabbar { display:flex; border-bottom:1px solid var(--border-1); background:var(--color-parchment); }
        .form-drawer__tab { padding:13px 16px; border:0; border-right:1px solid var(--border-1); background:var(--color-ivory); font:inherit; font-weight:700; color:var(--fg-1); }
        .form-drawer__body { overflow:auto; padding:20px 24px 24px; display:grid; gap:14px; grid-template-columns:1fr 1fr; align-content:start; }
        .form-drawer__body label { min-width:0; display:grid; gap:7px; margin:0; }
        .form-drawer__body .form-label { font-size:11px; line-height:1; font-weight:800; letter-spacing:.02em; color:var(--fg-3); text-transform:uppercase; }
        .form-drawer__body .input { width:100%; min-height:44px; border:1px solid var(--border-1); border-radius:8px; background:var(--color-white); padding:0 12px; font:inherit; color:var(--fg-1); box-sizing:border-box; }
        .form-drawer__body textarea.input { min-height:92px; padding:10px 12px; resize:vertical; line-height:1.35; }
        .form-drawer__footer { grid-column:1 / -1; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--border-1); padding-top:14px; margin-top:4px; }
      `}</style>

      <div className="view__header">
        <div>
          <h1 className="view__title">Formulare</h1>
          <div className="view__subtitle">QM-Formulare, Versionen, Prueffristen und Verantwortliche.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary" onClick={() => {
            const next = { id:'form-' + Date.now(), nr:Math.max(...rows.map(r => r.nr)) + 1, prefix:'QMS', suffix:'081', version:'001', validFrom:'2026-05-28', updated:'2026-05-28', nextCheck:'2026-06-01', responsible:'Rahim Ahangarzadeh', status:'aktiv', language:'Deutsch', name:'Neues Formular', page:1, description:'Formular' };
            setRows(current => [next, ...current]);
            setDetail(next);
          }}><Icon name="plus" size={14} />Formular erstellen</button>
        </div>
      </div>

      <div className="job-kpis" style={{ gridTemplateColumns:'repeat(4, minmax(150px, 1fr))' }}>
        {kpis.map(kpi => (
          <button key={kpi.label} type="button" className="job-kpi" onClick={() => setKpiFilter(kpi.label)} style={{ '--job-kpi-color': kpi.color }}>
            <span>{kpi.label}</span><strong>{kpi.value}</strong>
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
          <select className="input" defaultValue="" onChange={event => {
            const value = event.target.value;
            if (!value) return;
            setRows(current => current.map(row => selectedIds.includes(row.id) ? { ...row, status:value } : row));
            setSelectedIds([]);
          }} style={{ width:180 }}>
            <option value="">Status aendern</option>
            <option value="aktiv">aktiv</option>
            <option value="archiv">archiv</option>
          </select>
          <button className="btn btn--danger" onClick={deleteSelected}><Icon name="x" size={15} />Loeschen</button>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
        <span className="muted small">{filtered.length} von {rows.length} Formularen</span>
      </div>

      <div className="tbl-wrap form-table-wrap">
        <table className="tbl job-table form-table">
          <thead>
            <tr>
              <th style={{ width:38 }}><input type="checkbox" checked={allVisibleSelected} onChange={() => setSelectedIds(allVisibleSelected ? [] : visibleIds)} /></th>
              {columns.map(col => <ColumnHeader key={col.key} col={col} />)}
              <th style={{ textAlign:'center' }}>Aktionen</th>
            </tr>
          </thead>
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
        <div className="form-filter-panel">
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
            <button className="btn btn--ghost" onClick={() => setFilters(current => { const next = { ...current }; delete next[filterPanel]; return next; })}>Auswahl aufheben</button>
          </div>
        </div>
      )}

      {detail && (
        <>
          <div onClick={() => setDetail(null)} style={{ position:'fixed', top:64, left:0, right:0, bottom:0, background:'rgba(0,0,0,.18)', zIndex:119 }} />
          <aside className="form-drawer">
            <div className="form-drawer__hero">
              <button className="form-drawer__close" onClick={() => setDetail(null)}><Icon name="x" size={22} /></button>
              <div className="avatar avatar--3">{detail.prefix}</div>
              <div>
                <h2>{detail.name}</h2>
                <p>{internalNr(detail)} - Version {detail.version}</p>
                <div style={{ marginTop:12 }}><StatusBadge status={detail.status} /></div>
              </div>
            </div>
            <div className="form-drawer__tabbar">
              <button className="form-drawer__tab">Stammdaten</button>
            </div>
            <div className="form-drawer__body">
              <label><span className="form-label">Nr.</span><input className="input" value={detail.nr} onChange={e => setDetail({ ...detail, nr:Number(e.target.value) })} /></label>
              <label><span className="form-label">Interne Nr</span><div style={{ display:'grid', gridTemplateColumns:'1fr 90px', gap:8 }}>
                <select className="input" value={detail.prefix} onChange={e => setDetail({ ...detail, prefix:e.target.value })}>
                  {prefixes.map(([abbr, text]) => <option key={abbr} value={abbr}>{abbr} - {text}</option>)}
                </select>
                <input className="input" value={detail.suffix} onChange={e => setDetail({ ...detail, suffix:e.target.value })} />
              </div></label>
              <label><span className="form-label">Version</span><input className="input" value={detail.version} onChange={e => setDetail({ ...detail, version:e.target.value })} /></label>
              <label><span className="form-label">Gueltig ab</span><input type="date" className="input" value={detail.validFrom} onChange={e => setDetail({ ...detail, validFrom:e.target.value })} /></label>
              <label><span className="form-label">Letzte Aktualisierung</span><input type="date" className="input" value={detail.updated} onChange={e => setDetail({ ...detail, updated:e.target.value })} /></label>
              <label><span className="form-label">Naechste Pruefung</span><input type="date" className="input" value={detail.nextCheck} onChange={e => setDetail({ ...detail, nextCheck:e.target.value })} /></label>
              <label><span className="form-label">Verantwortlicher</span><input className="input" value={detail.responsible} onChange={e => setDetail({ ...detail, responsible:e.target.value })} /></label>
              <label><span className="form-label">Status</span><select className="input" value={detail.status} onChange={e => setDetail({ ...detail, status:e.target.value })}><option>aktiv</option><option>archiv</option></select></label>
              <label><span className="form-label">Sprache</span><input className="input" value={detail.language} onChange={e => setDetail({ ...detail, language:e.target.value })} /></label>
              <label><span className="form-label">Seite</span><input className="input" value={detail.page} onChange={e => setDetail({ ...detail, page:Number(e.target.value) })} /></label>
              <label style={{ gridColumn:'1 / -1' }}><span className="form-label">Name Formulare</span><input className="input" value={detail.name} onChange={e => setDetail({ ...detail, name:e.target.value })} /></label>
              <label style={{ gridColumn:'1 / -1' }}><span className="form-label">Beschreibung</span><textarea className="input" rows={3} value={detail.description} onChange={e => setDetail({ ...detail, description:e.target.value })} /></label>
              <div className="form-drawer__footer">
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

Object.assign(window, { FormulareView });
