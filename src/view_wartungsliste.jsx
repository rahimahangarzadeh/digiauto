/* Termine - zentrale Terminliste aus Kalender und Verwaltung */

function WartungslisteView() {
  const { useEffect, useMemo, useState } = React;

  const typeCfg = {
    schulung: { label: 'Schulung', color: '#2d6fa3' },
    fuehrerschein: { label: 'Fuehrerscheinkontrolle', color: '#2e6a70' },
    unterweisung: { label: 'Unterweisung', color: '#3f7a4a' },
    untersuchung: { label: 'Untersuchungsvorsorge', color: '#c96442' },
    stellenbeschreibung: { label: 'Stellenbeschreibung', color: '#6a4fb5' },
    anderes: { label: 'Etwas anderes', color: '#8a6a1f' },
  };

  const statusCfg = {
    geplant: { label: 'Geplant', color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc' },
    angemeldet: { label: 'Angemeldet', color: '#2d6fa3', bg: '#e8f1fb', border: '#bcd3ee' },
    bestaetigt: { label: 'Bestaetigt', color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf' },
    abgeschlossen: { label: 'Abgeschlossen', color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf' },
    abgesagt: { label: 'Abgesagt', color: '#a13232', bg: '#fde8e0', border: '#efb7aa' },
  };

  const defaultEntries = [
    { id:'t1', tab:'aktuell', title:'SCC 016 Auffrischung', type:'schulung', company:'Janning Tiefbau GmbH', participants:['Markus Brinker','Tobias Nowak'], start:'2026-05-22T08:00', end:'2026-05-22T16:00', location:'DEKRA Akademie Osnabrueck', status:'angemeldet', release:{'Markus Brinker':true,'Tobias Nowak':false}, hotel:'nein', academyConfirmed:'ja', billingPaid:'nein', contactName:'Hr. Brockmann', documents:['Einladung_SCC016.pdf'] },
    { id:'t2', tab:'aktuell', title:'Fuehrerscheinkontrolle Kolonne Nord', type:'fuehrerschein', company:'Janning Rohrbau GmbH', participants:['Dirk Juergens'], start:'2026-05-25T10:00', end:'2026-05-25T10:30', location:'Bauhof Nordhorn', status:'geplant', release:{'Dirk Juergens':true}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Sabine Janning', documents:['Kontrollformular.pdf'] },
    { id:'t3', tab:'aktuell', title:'Baustellenunterweisung Tiefbau', type:'unterweisung', company:'Janning Tiefbau GmbH', participants:['Mustafa Kempers','Ralf Kowalski'], start:'2026-05-28T07:30', end:'2026-05-28T08:15', location:'Baustelle Alex Barum', status:'geplant', release:{'Mustafa Kempers':false,'Ralf Kowalski':false}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Mustafa Kempers', documents:['Unterweisungsbogen.pdf'] },
    { id:'t4', tab:'aktuell', title:'G26 Atemschutz Untersuchung', type:'untersuchung', company:'Janning Galabau GmbH', participants:['Lukas Schroeder'], start:'2026-06-02T09:00', end:'2026-06-02T09:45', location:'Betriebsarzt ASD Meppen', status:'bestaetigt', release:{'Lukas Schroeder':true}, hotel:'nein', academyConfirmed:'ja', billingPaid:'nein', contactName:'ASD Meppen', documents:['Terminbestaetigung_G26.pdf'] },
    { id:'t5', tab:'aktuell', title:'Stellenbeschreibung Polier unterschreiben', type:'stellenbeschreibung', company:'Janning Tiefbau GmbH', participants:['Thomas Lange'], start:'2026-06-04T13:00', end:'2026-06-04T13:30', location:'Buero Verwaltung', status:'geplant', release:{'Thomas Lange':false}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Personalabteilung', documents:['Polier_Tiefbau_v1.2.pdf'] },
    { id:'t6', tab:'aktuell', title:'Baustellenbesprechung Sicherheitskoordination', type:'anderes', company:'Janning Transporte GmbH', participants:['Daniel Vogt','Maik Wiegmann'], start:'2026-06-08T11:00', end:'2026-06-08T12:00', location:'Teams / Baustelle Suedring', status:'geplant', release:{'Daniel Vogt':true,'Maik Wiegmann':true}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Bauleitung', documents:['Agenda.pdf'] },
    { id:'t7', tab:'erledigt', title:'Erste Hilfe Grundkurs', type:'schulung', company:'Janning Tiefbau GmbH', participants:['Markus Brinker'], start:'2026-04-10T08:00', end:'2026-04-10T16:00', location:'BiW Bildungszentrum Lingen', status:'abgeschlossen', release:{'Markus Brinker':true}, hotel:'nein', academyConfirmed:'ja', billingPaid:'ja', contactName:'Frau Moeller', documents:['Teilnahme_Erste_Hilfe.pdf'] },
    { id:'t8', tab:'erledigt', title:'Fuehrerscheinkontrolle April', type:'fuehrerschein', company:'Janning Bohrtechnik GmbH', participants:['Mehmet Brinker'], start:'2026-04-12T09:30', end:'2026-04-12T09:45', location:'Verwaltung', status:'abgeschlossen', release:{'Mehmet Brinker':true}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Sabine Janning', documents:['Fuehrerschein_Kontrolle_April.pdf'] },
    { id:'t9', tab:'erledigt', title:'Jahresunterweisung Tiefbau 2026', type:'unterweisung', company:'Janning Tiefbau GmbH', participants:['Tobias Nowak','Ralf Kowalski'], start:'2026-04-18T07:30', end:'2026-04-18T08:30', location:'Baustelle Tiefbau', status:'abgeschlossen', release:{'Tobias Nowak':true,'Ralf Kowalski':true}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Michael Janning', documents:['UW_Tiefbau_2026.pdf'] },
    { id:'t10', tab:'erledigt', title:'G37 Bildschirmarbeit', type:'untersuchung', company:'Verwaltung GmbH', participants:['Anna Fischer'], start:'2026-04-19T14:00', end:'2026-04-19T14:30', location:'Betriebsarzt ASD Meppen', status:'abgeschlossen', release:{'Anna Fischer':true}, hotel:'nein', academyConfirmed:'ja', billingPaid:'ja', contactName:'ASD Meppen', documents:['G37_Bescheinigung.pdf'] },
    { id:'t11', tab:'erledigt', title:'Stellenbeschreibung Lager unterschrieben', type:'stellenbeschreibung', company:'Logistik GmbH', participants:['Laura Schneider'], start:'2026-04-20T10:00', end:'2026-04-20T10:20', location:'Buero Logistik', status:'abgeschlossen', release:{'Laura Schneider':true}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Personalabteilung', documents:['Lager_Logistik_unterschrieben.pdf'] },
    { id:'t12', tab:'erledigt', title:'Projektstart Abstimmung', type:'anderes', company:'Janning Galabau GmbH', participants:['Lukas Schroeder','Frank Thole'], start:'2026-04-21T11:00', end:'2026-04-21T12:00', location:'Besprechungsraum B', status:'abgeschlossen', release:{'Lukas Schroeder':true,'Frank Thole':true}, hotel:'nicht_erforderlich', academyConfirmed:'nicht_erforderlich', billingPaid:'nicht_erforderlich', contactName:'Bauleiter', documents:['Protokoll_Projektstart.pdf'] },
  ];

  const readStored = () => {
    try { return JSON.parse(localStorage.getItem('termine_list_entries') || '[]'); }
    catch { return []; }
  };

  const [entries, setEntries] = useState(() => [...defaultEntries, ...readStored()]);
  const [activeTab, setActiveTab] = useState('aktuell');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sort, setSort] = useState({ col:'start', dir:'asc' });
  const [editing, setEditing] = useState(null);
  const [columnMenu, setColumnMenu] = useState(null);
  const [filterPanel, setFilterPanel] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [groupBy, setGroupBy] = useState('');

  useEffect(() => {
    const sync = () => setEntries([...defaultEntries, ...readStored()]);
    window.addEventListener('termine-list-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('termine-list-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    window.wartungsliste_entries = entries.map(e => ({
      id: e.id,
      emp: e.participants?.[0] || '',
      company: e.company,
      schulung: e.title,
      datum: fmtDate(e.start),
      type: e.type,
      status: e.tab === 'erledigt' ? 'erledigt' : e.status,
      freigegeben: Object.values(e.release || {}).some(Boolean) ? 'ja' : 'nicht',
    }));
  }, [entries]);

  const fmtDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('de-DE');
  };

  const fmtTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' });
  };

  const StatusBadge = ({ status }) => {
    const cfg = statusCfg[status] || statusCfg.geplant;
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:600, color:cfg.color, background:cfg.bg, border:'1px solid '+cfg.border }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.color }}></span>
        {cfg.label}
      </span>
    );
  };

  const TypeChip = ({ type }) => {
    const cfg = typeCfg[type] || typeCfg.anderes;
    return (
      <span style={{ display:'inline-flex', padding:'3px 9px', borderRadius:999, fontSize:12, fontWeight:600, color:cfg.color, background:cfg.color+'18', border:'1px solid '+cfg.color+'33' }}>
        {cfg.label}
      </span>
    );
  };

  const toggleSort = (col) => {
    setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
  };


  const getColumnValue = (row, col) => {
    if (col === 'type') return typeCfg[row.type]?.label || row.type || '';
    if (col === 'participants') return (row.participants || []).join(', ');
    if (col === 'start') return `${fmtDate(row.start)} ${fmtTime(row.start)}`.trim();
    if (col === 'end') return `${fmtDate(row.end)} ${fmtTime(row.end)}`.trim();
    if (col === 'status') return statusCfg[row.status]?.label || row.status || '';
    if (col === 'release') {
      const total = row.participants?.length || 0;
      const released = Object.values(row.release || {}).filter(Boolean).length;
      return `${released}/${total} freigegeben`;
    }
    if (col === 'documents') return (row.documents || []).join(', ');
    if (col === 'hotel') return row.hotel === 'nicht_erforderlich' ? 'Nicht erforderlich' : row.hotel || '';
    if (col === 'academyConfirmed') return row.academyConfirmed === 'nicht_erforderlich' ? 'Nicht erforderlich' : row.academyConfirmed || '';
    if (col === 'billingPaid') return row.billingPaid === 'nicht_erforderlich' ? 'Nicht erforderlich' : row.billingPaid || '';
    return row[col] || '';
  };

  const tabRows = entries.filter(e => activeTab === 'aktuell' ? e.tab !== 'erledigt' : e.tab === 'erledigt');
  const filteredRows = tabRows.filter(row => Object.entries(columnFilters).every(([col, selected]) => {
    if (!selected || selected.length === 0) return true;
    return selected.includes(getColumnValue(row, col));
  }));
  const sorted = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let va = a[sort.col];
      let vb = b[sort.col];
      if (sort.col === 'participants') {
        va = (a.participants || []).join(', ');
        vb = (b.participants || []).join(', ');
      } else if (sort.col === 'type' || sort.col === 'status' || sort.col === 'release' || sort.col === 'documents') {
        va = getColumnValue(a, sort.col);
        vb = getColumnValue(b, sort.col);
      }
      if (sort.col === 'start' || sort.col === 'end') {
        va = new Date(va || 0).getTime();
        vb = new Date(vb || 0).getTime();
      }
      const cmp = typeof va === 'number' ? va - vb : String(va || '').localeCompare(String(vb || ''), 'de');
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sort]);

  const countAktuell = entries.filter(e => e.tab !== 'erledigt').length;
  const countErledigt = entries.filter(e => e.tab === 'erledigt').length;
  const kpis = [
    ['geplant', 'Geplant'],
    ['angemeldet', 'Angemeldet'],
    ['bestaetigt', 'Bestaetigt'],
    ['abgeschlossen', 'Abgeschlossen'],
  ].map(([key, label]) => ({ key, label, count: entries.filter(e => e.status === key).length, color: statusCfg[key]?.color || '#3f7a4a' }));

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(prev => prev.size === sorted.length ? new Set() : new Set(sorted.map(e => e.id)));
  };

  const markDone = (ids) => {
    const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
    const updated = entries.map(e => idSet.has(e.id) ? { ...e, tab:'erledigt', status:'abgeschlossen' } : e);
    setEntries(updated);
    const stored = updated.filter(e => String(e.id).startsWith('cal-'));
    localStorage.setItem('termine_list_entries', JSON.stringify(stored));
    window.dispatchEvent(new Event('termine-list-updated'));
    setSelectedIds(new Set());
  };

  const persistStored = (list) => {
    localStorage.setItem('termine_list_entries', JSON.stringify(list.filter(e => String(e.id).startsWith('cal-'))));
    window.dispatchEvent(new Event('termine-list-updated'));
  };

  const saveEntry = (updated) => {
    const next = entries.map(e => e.id === updated.id ? updated : e);
    setEntries(next);
    persistStored(next);
    setEditing(null);
  };

  const removeRows = (ids) => {
    const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
    const updated = entries.filter(e => !idSet.has(e.id));
    setEntries(updated);
    localStorage.setItem('termine_list_entries', JSON.stringify(updated.filter(e => String(e.id).startsWith('cal-'))));
    window.dispatchEvent(new Event('termine-list-updated'));
    setSelectedIds(new Set());
  };

  const SortTh = ({ col, label }) => {
    const active = sort.col === col;
    return (
      <th onClick={() => toggleSort(col)} style={{ cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }}>
        {label} <span style={{ opacity: active ? 1 : 0.35 }}>{active ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
      </th>
    );
  };

  const termColumns = [
    { col:'title', label:'Termin' },
    { col:'type', label:'Terminart' },
    { col:'company', label:'Firma' },
    { col:'participants', label:'Teilnehmer' },
    { col:'start', label:'Beginn' },
    { col:'end', label:'Ende' },
    { col:'location', label:'Ort' },
    { col:'status', label:'Status' },
    { col:'release', label:'Freigabe fuer Mitarbeiter' },
    { col:'hotel', label:'Hotel' },
    { col:'academyConfirmed', label:'Akademie' },
    { col:'billingPaid', label:'Rechnung' },
    { col:'documents', label:'Dokumente' },
  ];
  const columnLabel = (col) => termColumns.find(c => c.col === col)?.label || col;
  const columnValues = (col) => Array.from(new Set(tabRows.map(row => getColumnValue(row, col)).filter(Boolean))).sort((a,b) => String(a).localeCompare(String(b), 'de'));
  const setColumnSort = (col, dir) => {
    setSort({ col, dir });
    setColumnMenu(null);
  };
  const toggleFilterValue = (col, value) => {
    setColumnFilters(prev => {
      const current = prev[col] || [];
      const nextValues = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      const next = { ...prev };
      if (nextValues.length) next[col] = nextValues;
      else delete next[col];
      return next;
    });
  };
  const clearFilter = (col) => setColumnFilters(prev => {
    const next = { ...prev };
    delete next[col];
    return next;
  });
  const groupedRows = groupBy
    ? Object.entries(sorted.reduce((acc, row) => {
        const key = getColumnValue(row, groupBy) || '-';
        acc[key] = acc[key] || [];
        acc[key].push(row);
        return acc;
      }, {}))
    : null;
  const displayRows = groupedRows
    ? groupedRows.flatMap(([label, rows]) => [{ __group:true, id:'group-' + label, label, count:rows.length }, ...rows])
    : sorted;

  const SortMenuTh = ({ col, label }) => {
    const active = sort.col === col;
    return (
      <th style={{ position:'relative', whiteSpace:'nowrap' }}>
        <button type="button" onClick={() => setColumnMenu(columnMenu === col ? null : col)}
          style={{ border:0, background:columnMenu === col ? '#f3f2f1' : 'transparent', padding:'8px 10px', margin:'-8px -10px', cursor:'pointer', font:'inherit', fontWeight:700, color:'inherit' }}>
          {label} <span style={{ opacity: active ? 1 : 0.6 }}>{active ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
        </button>
        {columnMenu === col && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:30, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 10px 28px rgba(0,0,0,0.18)', borderRadius:2, overflow:'hidden', color:'var(--fg-1)', fontWeight:400 }}>
            <button type="button" onClick={() => setColumnSort(col, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setColumnSort(col, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setFilterPanel(col); setColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setGroupBy(groupBy === col ? '' : col); setColumnSort(col, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{label}"</button>
          </div>
        )}
      </th>
    );
  };

  const ReleaseCell = ({ entry }) => {
    const total = entry.participants?.length || 0;
    const released = Object.values(entry.release || {}).filter(Boolean).length;
    return (
      <span style={{ fontSize:12, color: released === total && total ? '#3f7a4a' : 'var(--fg-2)', fontWeight:600 }}>
        {released}/{total} freigegeben
      </span>
    );
  };

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Termine</h1>
          <div className="view__subtitle">Alle geplanten und erledigten Termine aus Kalender, Schulungen und Verwaltung.</div>
        </div>
      </div>

      <div className="job-kpis" style={{ marginBottom:20 }}>
        {kpis.map(kpi => (
          <div key={kpi.key} className="job-kpi" style={{ '--job-kpi-color': kpi.color }}>
            <span>{kpi.label}</span>
            <strong>{kpi.count}</strong>
          </div>
        ))}
      </div>

      <div style={{ display:'inline-flex', gap:6, marginBottom:20, padding:4, background:'var(--color-parchment)', border:'1px solid var(--border-1)', borderRadius:10, boxShadow:'0 8px 22px rgba(20,20,19,0.06)' }}>
        <button onClick={() => { setActiveTab('aktuell'); setSelectedIds(new Set()); }} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:activeTab === 'aktuell' ? 700 : 500, color:activeTab === 'aktuell' ? 'var(--fg-1)' : 'var(--fg-2)', background:activeTab === 'aktuell' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (activeTab === 'aktuell' ? 'var(--border-1)' : 'transparent'), boxShadow:activeTab === 'aktuell' ? '0 6px 16px rgba(20,20,19,0.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Aktuell <span style={{ marginLeft:6, color:'var(--color-terracotta)', fontWeight:700 }}>{countAktuell}</span>
        </button>
        <button onClick={() => { setActiveTab('erledigt'); setSelectedIds(new Set()); }} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:activeTab === 'erledigt' ? 700 : 500, color:activeTab === 'erledigt' ? 'var(--fg-1)' : 'var(--fg-2)', background:activeTab === 'erledigt' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (activeTab === 'erledigt' ? 'var(--border-1)' : 'transparent'), boxShadow:activeTab === 'erledigt' ? '0 6px 16px rgba(20,20,19,0.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Erledigt <span style={{ marginLeft:6, color:'var(--color-terracotta)', fontWeight:700 }}>{countErledigt}</span>
        </button>
      </div>

      {(Object.keys(columnFilters).length > 0 || groupBy) && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:14 }}>
          {Object.entries(columnFilters).map(([col, values]) => values.map(value => (
            <button key={col + value} onClick={() => toggleFilterValue(col, value)}
              style={{ border:0, borderRadius:999, padding:'7px 12px', background:'#ecebe6', cursor:'pointer', font:'inherit', color:'var(--fg-2)' }}>
              {columnLabel(col)}: {value} ×
            </button>
          )))}
          {groupBy && (
            <button onClick={() => setGroupBy('')} style={{ border:0, borderRadius:999, padding:'7px 12px', background:'#ecebe6', cursor:'pointer', font:'inherit', color:'var(--fg-2)' }}>
              Gruppiert nach: {columnLabel(groupBy)} ×
            </button>
          )}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div style={{ padding:'12px 16px', background:'var(--color-accent)', borderRadius:10, marginBottom:16, display:'flex', gap:12, alignItems:'center', color:'white', flexWrap:'wrap' }}>
          <span style={{ fontSize:12, fontWeight:700 }}>{selectedIds.size} ausgewaehlt</span>
          <button onClick={() => markDone(Array.from(selectedIds))} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', color:'white', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600 }}>Als erledigt markieren</button>
          <button onClick={() => removeRows(Array.from(selectedIds))} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', color:'white', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600 }}>Loeschen</button>
        </div>
      )}

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:32, textAlign:'center' }}><input type="checkbox" checked={selectedIds.size === sorted.length && sorted.length > 0} onChange={selectAll} /></th>
              <SortMenuTh col="title" label="Termin" />
              <SortMenuTh col="type" label="Terminart" />
              <SortMenuTh col="company" label="Firma" />
              <SortMenuTh col="participants" label="Teilnehmer" />
              <SortMenuTh col="start" label="Beginn" />
              <SortMenuTh col="end" label="Ende" />
              <SortMenuTh col="location" label="Ort" />
              <SortMenuTh col="status" label="Status" />
              <SortMenuTh col="release" label="Freigabe fuer Mitarbeiter" />
              <SortMenuTh col="hotel" label="Hotel" />
              <SortMenuTh col="academyConfirmed" label="Akademie" />
              <SortMenuTh col="billingPaid" label="Rechnung" />
              <SortMenuTh col="documents" label="Dokumente" />
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map(row => row.__group ? (
              <tr key={row.id}>
                <td colSpan="15" style={{ background:'var(--color-parchment)', fontWeight:800, padding:'10px 14px' }}>
                  {columnLabel(groupBy)}: {row.label} <span className="small muted">({row.count})</span>
                </td>
              </tr>
            ) : (
              <tr key={row.id} onClick={() => setEditing(row)} style={{ background:selectedIds.has(row.id) ? 'var(--color-parchment)' : 'transparent', cursor:'pointer' }}>
                <td style={{ textAlign:'center' }} onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} /></td>
                <td style={{ fontWeight:700 }}>{row.title}</td>
                <td><TypeChip type={row.type} /></td>
                <td>{row.company}</td>
                <td>{(row.participants || []).join(', ')}</td>
                <td>{fmtDate(row.start)}<div className="small muted">{fmtTime(row.start)}</div></td>
                <td>{fmtDate(row.end)}<div className="small muted">{fmtTime(row.end)}</div></td>
                <td>{row.location}</td>
                <td><StatusBadge status={row.status} /></td>
                <td><ReleaseCell entry={row} /></td>
                <td>{row.hotel === 'nicht_erforderlich' ? 'Nicht erforderlich' : row.hotel}</td>
                <td>{row.academyConfirmed === 'nicht_erforderlich' ? 'Nicht erforderlich' : row.academyConfirmed}</td>
                <td>{row.billingPaid === 'nicht_erforderlich' ? 'Nicht erforderlich' : row.billingPaid}</td>
                <td>{(row.documents || []).map(doc => <span key={doc} className="chip" style={{ marginRight:4, marginBottom:4 }}>{doc}</span>)}</td>
                <td style={{ whiteSpace:'nowrap' }} onClick={e => e.stopPropagation()}>
                  {activeTab === 'aktuell' && <button className="icon-btn" title="Erledigt" onClick={() => markDone(row.id)}><Icon name="check" size={14} /></button>}
                  <button className="icon-btn" title="Vorschau"><Icon name="eye" size={14} /></button>
                  <button className="icon-btn" title="Bearbeiten" onClick={() => setEditing(row)}><Icon name="edit" size={14} /></button>
                  <button className="icon-btn" title="Loeschen" onClick={() => removeRows(row.id)}><Icon name="trash" size={14} /></button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan="15" style={{ textAlign:'center', padding:40, color:'var(--fg-3)' }}>Keine Termine in dieser Ansicht.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {filterPanel && (
        <div style={{ position:'fixed', inset:0, zIndex:3100, display:'flex', justifyContent:'flex-end', background:'rgba(20,20,19,0.18)' }} onClick={() => setFilterPanel(null)}>
          <aside onClick={e => e.stopPropagation()} style={{ width:430, maxWidth:'calc(100vw - 40px)', background:'white', height:'100vh', boxShadow:'-12px 0 35px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'26px 28px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-1)' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach „{columnLabel(filterPanel)}“</h2>
              <button onClick={() => setFilterPanel(null)} style={{ border:'2px solid var(--fg-1)', background:'white', borderRadius:4, fontSize:28, lineHeight:1, width:42, height:42, cursor:'pointer' }}>×</button>
            </div>
            <div style={{ padding:24, overflowY:'auto', flex:1 }}>
              {columnValues(filterPanel).map(value => (
                <label key={value} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:17, cursor:'pointer' }}>
                  <input type="checkbox" checked={(columnFilters[filterPanel] || []).includes(value)} onChange={() => toggleFilterValue(filterPanel, value)} style={{ width:18, height:18 }} />
                  {value}
                </label>
              ))}
            </div>
            <div style={{ padding:18, borderTop:'1px solid var(--border-1)', display:'flex', gap:12 }}>
              <button onClick={() => setFilterPanel(null)} className="btn btn--primary">Anwenden</button>
              <button onClick={() => clearFilter(filterPanel)} className="btn btn--ghost">Auswahl aufheben</button>
            </div>
          </aside>
        </div>
      )}
      {editing && (
        <TermineDetailPanel
          entry={editing}
          typeCfg={typeCfg}
          statusCfg={statusCfg}
          onClose={() => setEditing(null)}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}

function TermineDetailPanel({ entry, typeCfg, statusCfg, onClose, onSave }) {
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(entry)));
  const set = (key, value) => setDraft(d => ({ ...d, [key]: value }));
  const datePart = (value) => value ? String(value).slice(0, 10) : '';
  const timePart = (value) => value && String(value).includes('T') ? String(value).slice(11, 16) : '';
  const setDateTime = (key, part, value) => {
    const currentDate = datePart(draft[key]) || '2026-05-20';
    const currentTime = timePart(draft[key]) || '08:00';
    set(key, part === 'date' ? `${value}T${currentTime}` : `${currentDate}T${value}`);
  };
  const inp = {
    width:'100%', padding:'11px 12px', border:'1px solid var(--border-1)', borderRadius:8,
    background:'var(--color-white)', color:'var(--fg-1)', fontFamily:'inherit', fontSize:14, boxSizing:'border-box'
  };
  const label = (text) => <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:6 }}>{text}</label>;
  const first = (draft.title || 'T').slice(0, 1).toUpperCase();
  const type = typeCfg[draft.type] || typeCfg.anderes;
  const released = Object.values(draft.release || {}).filter(Boolean).length;

  const addDocument = () => {
    const name = prompt('Dokumentname');
    if (!name) return;
    set('documents', [...(draft.documents || []), name]);
  };
  const removeDocument = (idx) => set('documents', (draft.documents || []).filter((_, i) => i !== idx));
  const toggleRelease = (name, checked) => set('release', { ...(draft.release || {}), [name]: checked });

  return (
    <div style={{ position:'fixed', inset:0, zIndex:3200, background:'rgba(20,20,19,0.35)', display:'flex', justifyContent:'flex-end' }} onClick={onClose}>
      <aside onClick={e => e.stopPropagation()} style={{ width:720, maxWidth:'calc(100vw - 40px)', height:'100vh', background:'var(--color-ivory)', boxShadow:'-18px 0 50px rgba(0,0,0,0.22)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'26px 24px 20px', background:'var(--color-near-black)', color:'white', display:'flex', gap:18, alignItems:'flex-start' }}>
          <div style={{ width:58, height:58, borderRadius:'50%', background:type.color, display:'grid', placeItems:'center', fontWeight:800, fontSize:22 }}>{first}</div>
          <div style={{ flex:1 }}>
            <h2 style={{ margin:0, fontFamily:'var(--font-serif)', fontSize:26 }}>{draft.title}</h2>
            <div style={{ marginTop:6, color:'rgba(255,255,255,0.65)', fontWeight:600 }}>{type.label} · {draft.company}</div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <span className="badge badge--valid">{released}/{(draft.participants || []).length} freigegeben</span>
              <span style={{ background:'rgba(255,255,255,0.12)', color:'white', borderRadius:999, padding:'4px 10px', fontSize:12, fontWeight:700 }}>{statusCfg[draft.status]?.label || draft.status}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ border:0, background:'transparent', color:'rgba(255,255,255,0.7)', fontSize:28, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border-1)', fontWeight:800 }}>Termindaten</div>
        <div style={{ padding:24, overflowY:'auto', flex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>{label('Termin')}<input value={draft.title || ''} onChange={e => set('title', e.target.value)} style={inp} /></div>
            <div>{label('Terminart')}<select value={draft.type} onChange={e => set('type', e.target.value)} style={inp}>{Object.entries(typeCfg).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div>{label('Firma')}<input value={draft.company || ''} onChange={e => set('company', e.target.value)} style={inp} /></div>
            <div>{label('Ort')}<input value={draft.location || ''} onChange={e => set('location', e.target.value)} style={inp} /></div>
            <div>{label('Beginn Datum')}<input type="date" value={datePart(draft.start)} onChange={e => setDateTime('start', 'date', e.target.value)} style={inp} /></div>
            <div>{label('Beginn Uhrzeit')}<input type="time" value={timePart(draft.start)} onChange={e => setDateTime('start', 'time', e.target.value)} style={inp} /></div>
            <div>{label('Ende Datum')}<input type="date" value={datePart(draft.end)} onChange={e => setDateTime('end', 'date', e.target.value)} style={inp} /></div>
            <div>{label('Ende Uhrzeit')}<input type="time" value={timePart(draft.end)} onChange={e => setDateTime('end', 'time', e.target.value)} style={inp} /></div>
            <div>{label('Status')}<select value={draft.status} onChange={e => set('status', e.target.value)} style={inp}>{Object.entries(statusCfg).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div>{label('Name')}<input value={draft.contactName || ''} onChange={e => set('contactName', e.target.value)} style={inp} /></div>
            <div>{label('Hotelbuchung')}<select value={draft.hotel} onChange={e => set('hotel', e.target.value)} style={inp}><option value="ja">Ja</option><option value="nein">Nein</option><option value="nicht_erforderlich">Nicht erforderlich</option></select></div>
            <div>{label('Anmeldung bestaetigt von Akademie')}<select value={draft.academyConfirmed} onChange={e => set('academyConfirmed', e.target.value)} style={inp}><option value="ja">Ja</option><option value="nein">Nein</option><option value="nicht_erforderlich">Nicht erforderlich</option></select></div>
            <div>{label('Rechnung bezahlt')}<select value={draft.billingPaid} onChange={e => set('billingPaid', e.target.value)} style={inp}><option value="ja">Ja</option><option value="nein">Nein</option><option value="nicht_erforderlich">Nicht erforderlich</option></select></div>
          </div>

          <div style={{ marginTop:18 }}>
            {label('Teilnehmer und Freigabe')}
            <div style={{ border:'1px solid var(--border-1)', borderRadius:8, overflow:'hidden', background:'var(--color-white)' }}>
              {(draft.participants || []).map(name => (
                <label key={name} style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:12, padding:'10px 12px', borderTop:'1px solid var(--border-1)', cursor:'pointer' }}>
                  <span style={{ fontWeight:700 }}>{name}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700 }}>
                    <input type="checkbox" checked={!!draft.release?.[name]} onChange={e => toggleRelease(name, e.target.checked)} style={{ accentColor:'var(--color-green)' }} />
                    Freigabe fuer Mitarbeiter
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              {label('Dokumente')}
              <button className="btn btn--ghost" onClick={addDocument}><Icon name="plus" size={14} /> Dokument hinzufuegen</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {(draft.documents || []).map((doc, idx) => (
                <span key={doc + idx} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:999, background:'#c7eff0', color:'#08787b', fontWeight:700, maxWidth:260 }}>
                  <button title="Vorschau" style={{ border:0, background:'transparent', cursor:'pointer', color:'inherit' }}><Icon name="eye" size={13} /></button>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc}</span>
                  <button title="Loeschen" onClick={() => removeDocument(idx)} style={{ border:0, background:'transparent', cursor:'pointer', color:'inherit', fontSize:18, lineHeight:1 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border-1)', display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
          <button className="btn btn--primary" onClick={() => onSave(draft)}>Speichern</button>
        </div>
      </aside>
    </div>
  );
}

Object.assign(window, { WartungslisteView });
window.wartungsliste_entries = window.wartungsliste_entries || [];
