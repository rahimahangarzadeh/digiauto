/* ── MatrixCell — einfache Zellenansicht mit Ablaufdatum ── */
function MatrixCell({ cert, emp, training }) {
  const status = cert?.status || 'missing';

  const statusCfg = {
    valid:   { color:'#5f9268', bg:'#eff5ed', border:'#cde1cf' },
    warn:    { color:'#c89b3f', bg:'#fdf3e0', border:'#e8d4a6' },
    expired: { color:'#b26060', bg:'#fbecea', border:'#e8c4be' },
    missing: { color:'#999',    bg:'#f4f4f2', border:'#ddd' },
    planned: { color:'#2d6fa3', bg:'#e8f1fb', border:'#bcd3ee' },
  };

  const cfg = statusCfg[status] || statusCfg.missing;

  // Format date: "21.03.2026" from "2026-03-21"
  const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  };

  const displayDate = cert?.expiresAt ? formatDateShort(cert.expiresAt) : '—';

  return (
    <div
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width:80, minHeight:38, borderRadius:6,
        background: cfg.bg, border:'1px solid '+cfg.border,
        color: cfg.color, fontSize:11.5, fontWeight:600,
        cursor:'default', transition:'all 150ms', userSelect:'none',
        padding:'4px 6px',
      }}>
      {displayDate}
    </div>
  );
}

/* ── MatrixCellWithMenu — Status-Schnellwechsel ── */
function MatrixCellWithMenu({ cert, emp, training, isMenuOpen, onToggleMenu, onStatusChange, onScheduleFollowUp }) {
  const menuRef = React.useRef(null);
  const status = cert?.status || 'missing';

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onToggleMenu();
      }
    };
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen, onToggleMenu]);

  const handleStatusChange = (newStatus) => {
    window.SEED.certs[emp.id][training.id].status = newStatus;
    onToggleMenu();
    onStatusChange?.();
  };

  const statusCfg = {
    valid:   { color:'#5f9268', bg:'#eff5ed', border:'#cde1cf', label:'✔ Teilgenommen', icon:'✔' },
    warn:    { color:'#c89b3f', bg:'#fdf3e0', border:'#e8d4a6', label:'Läuft ab', icon:'⏳' },
    expired: { color:'#b26060', bg:'#fbecea', border:'#e8c4be', label:'❌ Nicht teilgenommen', icon:'❌' },
    missing: { color:'#999',    bg:'#f4f4f2', border:'#ddd',    label:'Fehlt', icon:'?' },
    planned: { color:'#2d6fa3', bg:'#e8f1fb', border:'#bcd3ee', label:'⏳ Nachholen', icon:'⏳' },
  };

  const cfg = statusCfg[status] || statusCfg.missing;

  // Format date: "21.03.2026" from "2026-03-21"
  const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  };

  const displayDate = cert?.expiresAt ? formatDateShort(cert.expiresAt) : '—';

  return (
    <div ref={menuRef} style={{ position:'relative', display:'inline-block' }}>
      <div
        onClick={onToggleMenu}
        onMouseEnter={(e) => !isMenuOpen && (e.currentTarget.style.outline='2px solid '+cfg.color)}
        onMouseLeave={(e) => !isMenuOpen && (e.currentTarget.style.outline='none')}
        style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:80, minHeight:38, borderRadius:6,
          background: cfg.bg, border:'1px solid '+cfg.border,
          color: cfg.color, fontSize:11.5, fontWeight:600,
          cursor:'pointer', transition:'all 150ms', userSelect:'none',
          padding:'4px 6px',
        }}>
        {displayDate}
      </div>

      {isMenuOpen && (
        <div style={{
          position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
          marginTop:6, background:'var(--color-ivory)', border:'1px solid var(--border-1)',
          borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:1000,
          minWidth:180, overflow:'hidden',
          animation:'qaSlideUp 120ms cubic-bezier(0.4,0,0.2,1)',
        }}>
          <style>{`@keyframes qaSlideUp { from { transform:translateY(-8px) translateX(-50%); opacity:0 } to { transform:translateY(0) translateX(-50%); opacity:1 } }`}</style>
          
          {[
            { val:'valid',   label:'✔ Teilgenommen',    emoji:'✔' },
            { val:'expired', label:'❌ Nicht teilgenommen', emoji:'❌' },
            { val:'planned', label:'⏳ Nachholen',       emoji:'⏳' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => handleStatusChange(opt.val)}
              style={{
                display:'flex', alignItems:'center', gap:10, width:'100%',
                padding:'10px 14px', border:'none', background:'transparent',
                color:'var(--fg-1)', fontSize:13, cursor:'pointer',
                fontFamily:'inherit', fontWeight:500,
                borderBottom: opt.val !== 'planned' ? '1px solid var(--border-1)' : 'none',
                transition:'background 120ms',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background='var(--color-parchment)'}
              onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
            >
              <span style={{ fontSize:16 }}>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}

          {/* Divider + "Nachholen planen" button for status="planned" */}
          {status === 'planned' && (
            <>
              <div style={{ height:'1px', background:'var(--border-1)' }}></div>
              <button
                onClick={() => {
                  onToggleMenu();
                  // Navigate to calendar + pre-select training
                  window.dispatchEvent(new CustomEvent('navigate-to-calendar', { detail: { trainingId: training.id } }));
                }}
                style={{
                  display:'flex', alignItems:'center', gap:8, width:'100%',
                  padding:'10px 14px', border:'none', background:'transparent',
                  color:'var(--color-accent)', fontSize:13, cursor:'pointer',
                  fontFamily:'inherit', fontWeight:600,
                  transition:'background 120ms',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background='rgba(201,100,66,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
              >
                <span style={{ fontSize:14 }}>📅</span>
                <span>Termin planen</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* Qualifikationsmatrix — Matrix + Mitarbeiter-Detailansicht */

function MatrixView({ activeCompany, onEmployeeOpen, extraAction = null }) {
  const [filterDept, setFilterDept] = React.useState('all');
  const [filterPosition, setFilterPosition] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [cellModal, setCellModal] = React.useState(null);
  const [selectedEmp, setSelectedEmp] = React.useState(null);
  const [selectedRows, setSelectedRows] = React.useState(new Set()); // Zeilen-Auswahl für Bulk-Aktionen
  const [matrixColumnMenu, setMatrixColumnMenu] = React.useState(null);
  const [matrixColumnFilters, setMatrixColumnFilters] = React.useState({});
  const [matrixFilterPanel, setMatrixFilterPanel] = React.useState(null);
  const [matrixFilterSearch, setMatrixFilterSearch] = React.useState('');
  const [matrixGroupBy, setMatrixGroupBy] = React.useState('');
  const detailRef = React.useRef(null);

  React.useEffect(() => {
    const selectEmployee = (empId) => {
      const emp = window.SEED.employees.find(e => e.id === empId);
      if (!emp) return;
      setFilterDept('all');
      setFilterPosition('all');
      setFilterStatus('all');
      setSelectedEmp(emp);
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    };

    if (window.__pendingMatrixEmpId) {
      selectEmployee(window.__pendingMatrixEmpId);
      window.__pendingMatrixEmpId = null;
    }

    const handler = (e) => {
      if (e.detail?.empId) selectEmployee(e.detail.empId);
    };
    window.addEventListener('navigate-to-matrix-employee', handler);
    return () => window.removeEventListener('navigate-to-matrix-employee', handler);
  }, []);

  React.useEffect(() => {
    const selectPosition = (position) => {
      if (!position) return;
      setSelectedEmp(null);
      setFilterDept('all');
      setFilterPosition(position);
      setFilterStatus('all');
      setTimeout(() => {
        document.querySelector('.matrix-scroll')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    };

    if (window.__pendingMatrixPosition) {
      selectPosition(window.__pendingMatrixPosition);
      window.__pendingMatrixPosition = null;
    }

    const handler = (e) => {
      if (e.detail?.position) selectPosition(e.detail.position);
    };
    window.addEventListener('navigate-to-matrix-position', handler);
    return () => window.removeEventListener('navigate-to-matrix-position', handler);
  }, []);

  const toggleRowSelect = (empId) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(empId)) next.delete(empId);
      else next.add(empId);
      return next;
    });
  };

  const selectAllRows = (emps) => {
    if (selectedRows.size === emps.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(emps.map(e => e.id)));
  };

  const clearSelection = () => setSelectedRows(new Set());

  // Sortierung mit localStorage-Persistenz
  const [sort, setSort] = React.useState(() => {
    try { const s = localStorage.getItem('matrix_sort'); return s ? JSON.parse(s) : { col: 'name', dir: 'asc' }; }
    catch { return { col: 'name', dir: 'asc' }; }
  });
  const toggleSort = (col) => {
    setSort(prev => {
      const next = { col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' };
      localStorage.setItem('matrix_sort', JSON.stringify(next));
      return next;
    });
  };
  const resetSort = () => {
    const def = { col: 'name', dir: 'asc' };
    setSort(def);
    localStorage.setItem('matrix_sort', JSON.stringify(def));
  };

  // Spalten-Reihenfolge fuer Matrix
  const MATRIX_COLS = [
    't-erstehilfe', 't-scc016', 't-scc017',
    't-gw129', 't-gw330', 't-staplerschein',
    't-mvas99', 't-unterweisung',
  ];
  const matrixTrainings = MATRIX_COLS.map(id => window.SEED.trainings.find(t => t.id === id)).filter(Boolean);

  const statusText = (status) => ({ valid:'Gueltig', warn:'Laeuft ab', expired:'Abgelaufen', missing:'Fehlt', planned:'Geplant' }[status || 'missing'] || 'Fehlt');
  const matrixColumns = [
    { key:'name', label:'Mitarbeiter' },
    { key:'companyDept', label:'Firma - Abt.' },
    ...matrixTrainings.map(t => ({ key:t.id, label:t.short, training:t })),
  ];
  const matrixColumnLabel = (key) => matrixColumns.find(col => col.key === key)?.label || key;
  const matrixColumnValue = (e, key) => {
    if (key === 'name') return e.name || `${e.lastName}, ${e.firstName}`;
    if (key === 'companyDept') return `${window.company(e.company)?.short || ''} - ${e.department || ''}`;
    const t = matrixTrainings.find(item => item.id === key);
    if (t) return statusText(window.SEED.certs[e.id]?.[t.id]?.status || 'missing');
    return '';
  };
  const matrixSortValue = (e, key) => {
    if (key === 'name') return `${e.lastName} ${e.firstName}`;
    if (key === 'companyDept') return matrixColumnValue(e, key);
    const t = matrixTrainings.find(item => item.id === key);
    if (t) {
      const cert = window.SEED.certs[e.id]?.[t.id];
      return cert?.expiresAt || statusText(cert?.status || 'missing');
    }
    return matrixColumnValue(e, key);
  };
  const setMatrixSort = (col, dir) => {
    const next = { col, dir };
    setSort(next);
    localStorage.setItem('matrix_sort', JSON.stringify(next));
    setMatrixColumnMenu(null);
  };
  const openMatrixFilter = (col) => {
    setMatrixFilterPanel(col);
    setMatrixFilterSearch('');
    setMatrixColumnMenu(null);
  };
  const toggleMatrixFilterValue = (col, value) => {
    setMatrixColumnFilters(current => {
      const selected = current[col] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [col]: next };
    });
  };
  const clearMatrixFilter = (col) => setMatrixColumnFilters(current => ({ ...current, [col]: [] }));

  let emps = window.SEED.employees.filter(e => e.status === 'aktiv');
  if (activeCompany !== 'all') emps = emps.filter(e => e.company === activeCompany);
  if (filterDept !== 'all') emps = emps.filter(e => e.department === filterDept);
  if (filterPosition !== 'all') emps = emps.filter(e => e.position === filterPosition);
  if (filterStatus !== 'all') {
    emps = emps.filter(e => matrixTrainings.some(t => {
      const s = window.SEED.certs[e.id]?.[t.id]?.status || 'missing';
      return s === filterStatus;
    }));
  }
  emps = emps.filter(e => Object.entries(matrixColumnFilters).every(([col, values]) => !values?.length || values.includes(matrixColumnValue(e, col))));
  emps = [...emps].sort((a, b) => {
    const va = matrixSortValue(a, sort.col);
    const vb = matrixSortValue(b, sort.col);
    const cmp = String(va).localeCompare(String(vb), 'de', { numeric:true });
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const MatrixColumnHeader = ({ col, className }) => {
    const active = sort.col === col.key || (matrixColumnFilters[col.key] || []).length > 0 || matrixGroupBy === col.key;
    return (
      <th className={className} style={{ position:'relative', userSelect:'none' }}>
        <button type="button" onClick={() => setMatrixColumnMenu(matrixColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:5, border:0, background:'transparent', font:'inherit', fontWeight: active ? 800 : 700, color: active ? 'var(--fg-1)' : 'var(--fg-3)', cursor:'pointer', padding:0 }}>
          <span>{col.label}</span>
          <span style={{ fontSize:10, color: active ? 'var(--fg-1)' : 'var(--fg-3)' }}>{sort.col === col.key ? (sort.dir === 'asc' ? 'A-Z' : 'Z-A') : 'v'}</span>
        </button>
        {matrixColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:50, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 10px 24px rgba(0,0,0,0.16)', borderRadius:4, overflow:'hidden', textTransform:'none', letterSpacing:0, color:'var(--fg-1)', fontWeight:400 }}>
            <button type="button" onClick={() => setMatrixSort(col.key, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setMatrixSort(col.key, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => openMatrixFilter(col.key)} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setMatrixGroupBy(matrixGroupBy === col.key ? '' : col.key); setMatrixSort(col.key, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };
  let totals = { valid:0, warn:0, expired:0, missing:0, planned:0 };
  emps.forEach(e => matrixTrainings.forEach(t => {
    const s = window.SEED.certs[e.id]?.[t.id]?.status || 'missing';
    totals[s] = (totals[s] || 0) + 1;
  }));
  const totalCells = emps.length * matrixTrainings.length || 1;
  const coverage = Math.round(((totals.valid + totals.warn) / totalCells) * 100);

  const matrixFilterValues = matrixFilterPanel
    ? Array.from(new Set(window.SEED.employees.filter(e => e.status === 'aktiv').map(e => matrixColumnValue(e, matrixFilterPanel)))).sort((a, b) => String(a).localeCompare(String(b), 'de', { numeric:true }))
    : [];
  const visibleMatrixFilterValues = matrixFilterValues.filter(value => String(value).toLowerCase().includes(matrixFilterSearch.toLowerCase()));

  const handleRowClick = (e) => {
    if (onEmployeeOpen) {
      onEmployeeOpen(e);
      return;
    }
    setSelectedEmp(prev => prev?.id === e.id ? null : e);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="view__header">
        <div />
        <div className="view__actions">
          <button className="btn btn--ghost"><Icon name="filter" size={14} /> Ansicht</button>
          <button className="btn btn--ghost"><Icon name="download" size={14} /> Excel</button>
          {extraAction}
        </div>
      </div>

      {/* ── KPIs (klickbar als Filter) ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:16 }}>
        {[
          { label:'Abdeckung', value: coverage + ' %', color: null,          status: null },
          { label:'Gültig',    value: totals.valid,   color:'#5f9268',       status:'valid' },
          { label:'Läuft ab',  value: totals.warn,    color:'#c89b3f',       status:'warn' },
          { label:'Abgelaufen',value: totals.expired, color:'#b26060',       status:'expired' },
          { label:'Fehlt',     value: totals.missing, color:'var(--fg-3)',   status:'missing' },
        ].map(k => {
          const isActive = filterStatus === k.status && k.status !== null;
          return (
            <div
              key={k.label}
              onClick={() => k.status && setFilterStatus(filterStatus === k.status ? 'all' : k.status)}
              style={{
                padding:'10px 14px',
                background: isActive ? (k.color === '#5f9268' ? '#eff5ed' : k.color === '#c89b3f' ? '#fdf3e0' : k.color === '#b26060' ? '#fbecea' : '#f0f0f0') : 'var(--color-ivory)',
                border: '1px solid ' + (isActive ? k.color : 'var(--border-1)'),
                borderRadius:10,
                cursor: k.status ? 'pointer' : 'default',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 16,
                alignItems: 'center',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 5px rgba(0,0,0,0.048)',
                transition:'all 150ms cubic-bezier(0.4,0,0.2,1)',
              }}>
              {/* Left: Label */}
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color: isActive ? k.color : 'var(--fg-3)' }}>
                {k.label}
              </div>

              {/* Middle: Value */}
              <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'center', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:500, color: isActive ? k.color : (k.color || 'var(--fg-1)'), lineHeight:1 }}>{k.value}</div>
              </div>

              {/* Right: Action Text */}
              {k.status && (
                <div style={{ fontSize:11, fontWeight:600, color: isActive ? k.color : 'var(--fg-3)', textAlign:'right' }}>
                  {isActive ? 'Klicken zum\nZurücksetzen' : 'Klicken zum\nFiltern'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toolbar + aktive Filter */}
      <div className="toolbar">
        {filterPosition !== 'all' && (
          <button onClick={() => setFilterPosition('all')} className="btn btn--ghost" style={{ fontSize:12, padding:'5px 10px' }}>
            Position: {filterPosition} entfernen
          </button>
        )}

        {sort.col !== 'name' || sort.dir !== 'asc' ? (
          <button onClick={resetSort} className="btn btn--ghost" style={{ fontSize:12, padding:'5px 10px' }}>
            Sortierung zuruecksetzen
          </button>
        ) : null}
        {selectedEmp && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 12px', background:'var(--color-warm-sand)', borderRadius:8, fontSize:12.5 }}>
            <div className={'avatar avatar--' + selectedEmp.color} style={{ width:20, height:20, fontSize:9 }}>{selectedEmp.initials}</div>
            <span style={{ fontWeight:500 }}>{selectedEmp.name}</span>
            <span style={{ color:'var(--fg-3)' }}>ausgewaehlt</span>
            <button onClick={() => setSelectedEmp(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:0, marginLeft:2 }}>
              <Icon name="x" size={13} />
            </button>
          </div>
        )}
        <div className="legend" style={{ marginLeft:'auto' }}>
          {[['#5f9268','Gueltig'],['#c89b3f','Laeuft ab'],['#b26060','Abgelaufen'],['#3a588a','Geplant'],['var(--color-border-warm)','Fehlt']].map(([c,l]) => (
            <span key={l} className="legend__item"><span className="legend__dot" style={{ background:c }} />{l}</span>
          ))}
        </div>
      </div>

      {Object.entries(matrixColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', margin:'0 0 12px 0' }}>
          {Object.entries(matrixColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:999, background:'var(--color-parchment)', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{matrixColumnLabel(col)}:</span>
              {value}
              <button type="button" onClick={() => toggleMatrixFilterValue(col, value)} style={{ border:0, background:'transparent', cursor:'pointer', padding:0, display:'inline-flex' }}><Icon name="x" size={14} /></button>
            </span>
          )))}
          <button type="button" onClick={() => setMatrixColumnFilters({})}
            style={{ border:0, background:'transparent', color:'var(--color-accent)', cursor:'pointer', fontSize:13, textDecoration:'underline' }}>
            Filter zuruecksetzen
          </button>
        </div>
      )}
      {/* ── BEREICH 1: Matrix ── */}
      <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.7, textTransform:'uppercase', color:'var(--color-accent)', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
        <span>Bereich 1</span>
        <span style={{ fontWeight:400, color:'var(--fg-3)', textTransform:'none', letterSpacing:0 }}>— Matrix-Ansicht · Klick auf Zeile für Details</span>
      </div>

      {/* ── Action Bar (nur wenn Zeilen ausgewählt) ── */}
      {selectedRows.size > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap:12, padding:'12px 16px', marginBottom:14,
          background:'rgba(201,100,66,0.06)', border:'1px solid var(--color-accent)',
          borderRadius:10, animation:'qaSlideDown 200ms cubic-bezier(0.4,0,0.2,1)',
        }}>
          <style>{`@keyframes qaSlideDown { from { transform:translateY(-12px); opacity:0 } to { transform:none; opacity:1 } }`}</style>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--color-accent)' }}>
            {selectedRows.size} Zeile{selectedRows.size !== 1 ? 'n' : ''} ausgewählt
          </div>
          <div style={{ flex:1 }}></div>
          <button className="btn btn--ghost" style={{ fontSize:12, padding:'6px 12px' }} title="Alle Zertifikate der ausgewählten Mitarbeiter als PDF exportieren">
            <Icon name="download" size={13} /> PDF Export
          </button>
          <button className="btn btn--ghost" style={{ fontSize:12, padding:'6px 12px' }} title="Versenden (z.B. E-Mail)">
            <Icon name="mail" size={13} /> Versenden
          </button>
          <button className="btn btn--ghost" style={{ fontSize:12, padding:'6px 12px' }} title="Status ändern">
            <Icon name="edit" size={13} /> Status ändern
          </button>
          <button
            className="btn btn--ghost"
            onClick={clearSelection}
            style={{ fontSize:12, padding:'6px 12px', color:'var(--fg-3)' }}
            title="Auswahl löschen">
            ✕
          </button>
        </div>
      )}

      <div className="matrix-scroll" style={{ marginBottom: 28 }}>
        <table className="matrix">
          <thead>
            <tr>
              <th style={{ width:48, textAlign:'center', padding:'8px 0' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size === emps.length && emps.length > 0}
                  onChange={() => selectAllRows(emps)}
                  style={{ cursor:'pointer', width:18, height:18 }}
                  title="Alle Zeilen auswählen"
                />
              </th>
              <MatrixColumnHeader col={matrixColumns.find(col => col.key === 'name')} className="matrix__corner" />
              <MatrixColumnHeader col={matrixColumns.find(col => col.key === 'companyDept')} className="matrix__corner-2" />
              {matrixTrainings.map(t => (
                <MatrixColumnHeader key={t.id} col={matrixColumns.find(col => col.key === t.id)} />
              ))}
            </tr>
          </thead>
          <tbody>
            {emps.map((e, index) => {
              const isSelected = selectedEmp?.id === e.id;
              const isRowSelected = selectedRows.has(e.id);
              const groupValue = matrixGroupBy ? matrixColumnValue(e, matrixGroupBy) : '';
              const previousGroup = matrixGroupBy && index > 0 ? matrixColumnValue(emps[index - 1], matrixGroupBy) : null;
              return (
                <React.Fragment key={e.id}>
                  {matrixGroupBy && groupValue !== previousGroup && (
                    <tr>
                      <td colSpan={matrixTrainings.length + 3} style={{ padding:'9px 14px', background:'var(--color-parchment)', color:'var(--fg-2)', fontWeight:700, fontSize:12, borderTop:'1px solid var(--border-1)', borderBottom:'1px solid var(--border-1)' }}>
                        {matrixColumnLabel(matrixGroupBy)}: {groupValue}
                      </td>
                    </tr>
                  )}
                <tr
                  key={e.id}
                  onClick={() => handleRowClick(e)}
                  style={{
                    cursor: 'pointer',
                    background: isRowSelected ? 'rgba(201,100,66,0.1)' : (isSelected ? 'rgba(201,100,66,0.06)' : undefined),
                    outline: isSelected ? '2px solid var(--color-accent)' : undefined,
                    outlineOffset: -2,
                    transition: 'background 150ms',
                  }}>
                  <td style={{ textAlign:'center', padding:'8px 0', width:48, background: isRowSelected ? 'rgba(201,100,66,0.1)' : (isSelected ? 'rgba(201,100,66,0.06)' : undefined) }}>
                    <input
                      type="checkbox"
                      checked={isRowSelected}
                      onChange={(ev) => {
                        ev.stopPropagation();
                        toggleRowSelect(e.id);
                      }}
                      onClick={(ev) => ev.stopPropagation()}
                      style={{ cursor:'pointer', width:18, height:18 }}
                    />
                  </td>
                  <td className="matrix__name" style={{ background: isRowSelected ? 'rgba(201,100,66,0.1)' : (isSelected ? 'rgba(201,100,66,0.06)' : undefined) }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className={'avatar avatar--' + e.color} style={{ width:28, height:28, fontSize:11 }}>{e.initials}</div>
                      <div>
                        <div className="matrix__person">{e.lastName}, {e.firstName}</div>
                        <div className="matrix__personal-id">PN {e.personalNr} · {e.position}</div>
                      </div>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft:4 }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="matrix__dept" style={{ background: isRowSelected ? 'rgba(201,100,66,0.1)' : (isSelected ? 'rgba(201,100,66,0.06)' : undefined) }}>
                    <div style={{ fontSize:12 }}>{window.company(e.company)?.short}</div>
                    <div style={{ fontSize:11, color:'var(--fg-3)' }}>{e.department}</div>
                  </td>
                  {matrixTrainings.map(t => {
                    const cert = window.SEED.certs[e.id]?.[t.id];
                    const status = cert?.status || 'missing';
                    
                    return (
                      <td key={t.id}
                        onClick={() => status === 'missing' && setCellModal({ emp: e, training: t, mode: 'register' })}
                        style={{ cursor: status === 'missing' ? 'pointer' : 'default', position:'relative' }}>
                        {status === 'missing' ? (
                          <div style={{
                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                            width:62, minHeight:38, borderRadius:6,
                            border:'1.5px dashed var(--color-border-warm)',
                            color:'var(--fg-3)', fontSize:16, transition:'all 150ms',
                          }}
                          onMouseEnter={el => { el.style.borderColor='var(--color-accent)'; el.style.color='var(--color-accent)'; el.style.background='rgba(201,100,66,0.05)'; }}
                          onMouseLeave={el => { el.style.borderColor='var(--color-border-warm)'; el.style.color='var(--fg-3)'; el.style.background='transparent'; }}>
                            +
                          </div>
                        ) : (
                          <MatrixCell cert={cert} emp={e} training={t} />
                        )}
                      </td>
                    );
                  })}
                </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── BEREICH 2: Detail-Ansicht ── */}
      {!onEmployeeOpen && <div ref={detailRef}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.7, textTransform:'uppercase', color: selectedEmp ? 'var(--color-accent)' : 'var(--fg-3)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <span>Bereich 2</span>
          <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:'var(--fg-3)' }}>
            {selectedEmp ? `— Detailansicht: ${selectedEmp.name}` : '— Mitarbeiter in Matrix anklicken'}
          </span>
        </div>

        {!selectedEmp ? (
          <div style={{
            background:'var(--color-ivory)', border:'1px dashed var(--border-2)',
            borderRadius:14, padding:'48px 24px', textAlign:'center',
            color:'var(--fg-3)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity:0.4, marginBottom:12 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--fg-2)', marginBottom:4 }}>Kein Mitarbeiter ausgewählt</div>
            <div style={{ fontSize:12.5 }}>Klicke auf eine Zeile in der Matrix oben, um die Detailansicht zu öffnen.</div>
          </div>
        ) : (
          <EmpDetail emp={selectedEmp} />
        )}
      </div>}
      {matrixFilterPanel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.18)', zIndex:1200, display:'flex', justifyContent:'flex-end' }} onClick={() => setMatrixFilterPanel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width:420, maxWidth:'96vw', height:'100%', background:'white', boxShadow:'-12px 0 30px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'24px 24px 16px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach "{matrixColumnLabel(matrixFilterPanel)}"</h2>
              <button type="button" onClick={() => setMatrixFilterPanel(null)} className="btn btn--ghost" style={{ width:42, height:42, padding:0 }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding:24, overflowY:'auto', flex:1 }}>
              <input value={matrixFilterSearch} onChange={e => setMatrixFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden" style={{ width:'100%', padding:'12px 14px', border:'1px solid var(--border-2)', font:'inherit', marginBottom:18 }} />
              <div style={{ display:'grid', gap:12 }}>
                {visibleMatrixFilterValues.map(value => (
                  <label key={value} style={{ display:'flex', alignItems:'center', gap:12, fontSize:18, cursor:'pointer' }}>
                    <input type="checkbox" checked={(matrixColumnFilters[matrixFilterPanel] || []).includes(value)} onChange={() => toggleMatrixFilterValue(matrixFilterPanel, value)} style={{ width:20, height:20 }} />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding:16, borderTop:'1px solid var(--border-1)', display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn--primary" onClick={() => setMatrixFilterPanel(null)} disabled={!(matrixColumnFilters[matrixFilterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => clearMatrixFilter(matrixFilterPanel)}>Auswahl aufheben</button>
            </div>
          </div>
        </div>
      )}
      {cellModal && <CellActionModal modal={cellModal} onClose={() => setCellModal(null)} />}
    </div>
  );
}

/* ── Mitarbeiter-Detailansicht ── */
function EmpDetail({ emp }) {
  const [activeTab, setActiveTab] = React.useState('schulungen');
  const [uploadTarget, setUploadTarget] = React.useState(null); // { section, name }
  const [uploadDone, setUploadDone] = React.useState({});

  const company = window.company(emp.company);
  const certs = window.SEED.certs[emp.id] || {};
  const myInstructions = window.SEED.instructions.filter(u => u.participants.some(p => p.emp === emp.id));

  // Mock health + license + jobdesc data
  const healthChecks = [
    { id:'h1', name:'G26 Atemschutz',          lastCheck:'14.03.2025', nextCheck:'14.03.2026', status:'valid' },
    { id:'h2', name:'G37 Lärmexposition',       lastCheck:'08.01.2025', nextCheck:'08.01.2028', status:'valid' },
    { id:'h3', name:'G37 Bildschirmarbeit',     lastCheck:'12.06.2024', nextCheck:'12.06.2027', status:'valid' },
  ];
  const licenseChecks = [
    { id:'l1', class:'B',  desc:'PKW bis 3,5 t',             status:'valid',   lastCheck:'10.03.2025', nextCheck:'10.03.2027' },
    { id:'l2', class:'BE', desc:'PKW mit Anhänger',          status:'valid',   lastCheck:'10.03.2025', nextCheck:'10.03.2027' },
    { id:'l3', class:'C',  desc:'LKW über 3,5 t',           status:'expired', lastCheck:'15.01.2024', nextCheck:'15.01.2026' },
  ];
  const jobDescs = [
    { id:'j1', name:'Polier Tiefbau', version:'v1.2', status:'signed', signed:'15.03.2026' },
  ];
  const allGeraetefuehrerRows = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('geraetefuehrer_rows_v1') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  })();
  const fallbackGeraetefuehrer = [
    { id:'gf-matrix-1', employeeId:emp.id, type:'Bagger', kind:'Ausbildung', date:'2026-01-12', released:true, description:'Bagger bis 20 t, Baustelleneinsatz.' },
    { id:'gf-matrix-2', employeeId:emp.id, type:'Radlader', kind:'Einweisung', date:'2026-02-18', released:true, description:'Einweisung Radlader und Sichtpruefung.' },
  ];
  const geraetefuehrerRows = allGeraetefuehrerRows.filter(row => row.employeeId === emp.id && row.released);
  const myGeraetefuehrer = geraetefuehrerRows.length ? geraetefuehrerRows : fallbackGeraetefuehrer;

  const tabs = [
    { id:'schulungen',     label:'Schulungen',          count: window.SEED.trainings.length },
    { id:'unterweisungen', label:'Unterweisungen',      count: myInstructions.length },
    { id:'untersuchung',   label:'Untersuchungsvorsorge', count: healthChecks.length },
    { id:'stellenbeschr',  label:'Stellenbeschreibung', count: jobDescs.length },
    { id:'fuehrerschein',  label:'Führerschein',        count: licenseChecks.length },
    { id:'geraetefuehrer', label:'Ger\u00e4tef\u00fchrer',        count: myGeraetefuehrer.length },
  ];

  const statusCfg = {
    valid:   { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Gültig' },
    warn:    { color:'#8a6a1f', bg:'#faf3de', border:'#ece0bc', label:'Läuft ab' },
    expired: { color:'#a13232', bg:'#fbecea', border:'#eac8c2', label:'Abgelaufen' },
    missing: { color:'#999',    bg:'#f4f4f2', border:'#ddd',    label:'Fehlt' },
    planned: { color:'#2d6fa3', bg:'#e8f1fb', border:'#bcd3ee', label:'Geplant' },
    signed:  { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Unterschrieben' },
  };

  const SBadge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.missing;
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:500, background:s.bg, border:'1px solid '+s.border, color:s.color }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:s.color }} />{s.label}
      </span>
    );
  };

  const DocActions = ({ id, name }) => {
    return (
      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
        <button className="btn btn--ghost" style={{ fontSize:12, padding:'4px 10px' }}>
          <Icon name="doc" size={12} /> Anzeigen
        </button>
        <button className="btn btn--ghost" style={{ fontSize:12, padding:'4px 10px' }}>
          <Icon name="download" size={12} /> Download
        </button>
      </div>
    );
  };

  // Upload mini-modal
  const UploadMini = () => (
    <div onClick={() => setUploadTarget(null)} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(2px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--color-ivory)', borderRadius:16, padding:28, width:380, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500, marginBottom:4 }}>Dokument hochladen</div>
        <div style={{ fontSize:12.5, color:'var(--fg-3)', marginBottom:18 }}>Für: {uploadTarget?.name}</div>
        <div style={{
          border:'1.5px dashed var(--border-2)', borderRadius:10, padding:'28px 16px',
          textAlign:'center', color:'var(--fg-3)', background:'var(--color-parchment)',
          marginBottom:16,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:8 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div style={{ fontSize:13, fontWeight:500, color:'var(--fg-2)' }}>Datei hierher ziehen</div>
          <div style={{ fontSize:11.5, marginTop:4 }}>oder</div>
          <button className="btn btn--ghost" style={{ marginTop:8, fontSize:12 }}>Datei auswählen</button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button
            className="btn btn--primary"
            style={{ flex:1 }}
            onClick={() => {
              setUploadDone(d => ({ ...d, [uploadTarget.id]: true }));
              setUploadTarget(null);
            }}>
            Hochladen
          </button>
          <button className="btn btn--ghost" style={{ flex:1 }} onClick={() => setUploadTarget(null)}>Abbrechen</button>
        </div>
      </div>
    </div>
  );

  const Section = ({ title, icon, children }) => (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:12, fontWeight:700, letterSpacing:0.6, textTransform:'uppercase', color:'var(--color-accent)', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
        {icon && <span>{icon}</span>}{title}
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value, actions, highlight }) => (
    <div style={{
      display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr auto',
      gap:12, alignItems:'center',
      padding:'11px 16px',
      borderBottom:'1px solid var(--border-1)',
      background: highlight ? 'rgba(161,50,50,0.03)' : undefined,
    }}>
      <div style={{ fontSize:13.5, fontWeight:500 }}>{label}</div>
      <div>{value}</div>
      <div style={{ fontSize:12, color:'var(--fg-3)' }}></div>
      <div>{actions}</div>
    </div>
  );

  return (
    <div style={{ background:'var(--color-ivory)', border:'1px solid var(--border-1)', borderRadius:16, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'qaSlideUp 240ms cubic-bezier(0.4,0,0.2,1)' }}>
      <style>{`@keyframes qaSlideUp { from { transform:translateY(16px); opacity:0 } to { transform:none; opacity:1 } }`}</style>

      {/* ── Emp header ── */}
      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:20, alignItems:'center', padding:'20px 24px', background:'var(--color-near-black)', color:'var(--fg-on-dark-1)' }}>
        <div className={'avatar avatar--' + emp.color} style={{ width:52, height:52, fontSize:18 }}>{emp.initials}</div>
        <div>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:500 }}>{emp.name}</div>
          <div style={{ fontSize:13, color:'var(--fg-on-dark-2)', marginTop:3, display:'flex', gap:14 }}>
            <span>PN {emp.personalNr}</span>
            <span>·</span>
            <span>{emp.position}</span>
            <span>·</span>
            <span>{company?.name}</span>
            <span>·</span>
            <span>{emp.department}</span>
          </div>
        </div>
        <div style={{ fontSize:11.5, color:'var(--fg-on-dark-2)', textAlign:'right' }}>
          <div style={{ marginBottom:3 }}>{emp.email}</div>
          <div>{emp.phone}</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border-1)', overflowX:'auto', background:'var(--color-parchment)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding:'11px 18px', border:'none', background:'transparent',
            fontFamily:'inherit', fontSize:13.5, fontWeight:500, cursor:'pointer',
            color: activeTab === t.id ? 'var(--fg-1)' : 'var(--fg-3)',
            borderBottom: activeTab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
            whiteSpace:'nowrap', transition:'color 150ms',
            display:'flex', alignItems:'center', gap:6,
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ fontSize:10.5, fontWeight:700, padding:'1px 6px', borderRadius:99, background: activeTab===t.id ? 'rgba(201,100,66,0.12)' : 'var(--color-warm-sand)', color: activeTab===t.id ? 'var(--color-accent)' : 'var(--fg-3)' }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding:'22px 24px' }}>

        {/* Schulungen */}
        {activeTab === 'schulungen' && (
          <Section title="Schulungen & Zertifikate">
            <div style={{ background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr auto', gap:12, padding:'9px 16px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
                {['Schulung / Zertifikat','Status','Ablaufdatum','Dokumente'].map(h => (
                  <div key={h} style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{h}</div>
                ))}
              </div>
              {window.SEED.trainings.map(t => {
                const c = certs[t.id];
                const status = c?.status || 'missing';
                return (
                  <div key={t.id} style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr auto', gap:12, alignItems:'center', padding:'11px 16px', borderBottom:'1px solid var(--border-1)', background: status==='expired' ? 'rgba(161,50,50,0.03)' : undefined }}>
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:500 }}>
                        {t.name}
                        {t.mandatory && <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:99, background:'rgba(201,100,66,0.1)', color:'var(--color-accent)', marginLeft:7 }}>Pflicht</span>}
                      </div>
                      <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:1 }}>{t.cat}</div>
                    </div>
                    <div><SBadge status={status} /></div>
                    <div style={{ fontSize:13, color:'var(--fg-2)' }}>{c?.expiresAt ? window.fmtDE(c.expiresAt) : '—'}</div>
                    <div>{status !== 'missing' ? <DocActions id={'t-'+t.id+'-'+emp.id} name={t.name} /> : <span style={{ fontSize:12, color:'var(--fg-3)' }}>Kein Dokument</span>}</div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Unterweisungen */}
        {activeTab === 'unterweisungen' && (
          <Section title="Unterweisungen">
            {myInstructions.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--fg-3)' }}>Keine Unterweisungen gefunden.</div>
            ) : (
              <div style={{ background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1.5fr 0.8fr 0.8fr 0.8fr auto', gap:12, padding:'9px 16px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
                  {['Unterweisung','Version','Datum','Status','Dokumente'].map(h => (
                    <div key={h} style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{h}</div>
                  ))}
                </div>
                {myInstructions.map(u => {
                  const my = u.participants.find(p => p.emp === emp.id);
                  return (
                    <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1.5fr 0.8fr 0.8fr 0.8fr auto', gap:12, alignItems:'center', padding:'11px 16px', borderBottom:'1px solid var(--border-1)' }}>
                      <div style={{ fontSize:13.5, fontWeight:500 }}>{u.title}</div>
                      <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{u.version}</div>
                      <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{my?.date ? window.fmtDE(my.date) : '—'}</div>
                      <div><SBadge status={my?.signed ? 'signed' : 'warn'} /></div>
                      <div><DocActions id={'u-'+u.id+'-'+emp.id} name={u.title} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* Untersuchungsvorsorge */}
        {activeTab === 'untersuchung' && (
          <Section title="Untersuchungsvorsorge">
            <div style={{ background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr auto', gap:12, padding:'9px 16px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
                {['Untersuchung','Letzte Prüfung','Nächste Prüfung','Status','Dokumente'].map(h => (
                  <div key={h} style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{h}</div>
                ))}
              </div>
              {healthChecks.map(h => (
                <div key={h.id} style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr auto', gap:12, alignItems:'center', padding:'11px 16px', borderBottom:'1px solid var(--border-1)' }}>
                  <div style={{ fontSize:13.5, fontWeight:500 }}>{h.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{h.lastCheck}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{h.nextCheck}</div>
                  <div><SBadge status={h.status} /></div>
                  <div><DocActions id={'h-'+h.id+'-'+emp.id} name={h.name} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Stellenbeschreibung */}
        {activeTab === 'stellenbeschr' && (
          <Section title="Stellenbeschreibungen">
            <div style={{ background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1.5fr 0.8fr 0.8fr 1fr auto', gap:12, padding:'9px 16px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
                {['Position','Version','Status','Unterschrieben am','Dokumente'].map(h => (
                  <div key={h} style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{h}</div>
                ))}
              </div>
              {jobDescs.map(j => (
                <div key={j.id} style={{ display:'grid', gridTemplateColumns:'1.5fr 0.8fr 0.8fr 1fr auto', gap:12, alignItems:'center', padding:'11px 16px', borderBottom:'1px solid var(--border-1)' }}>
                  <div style={{ fontSize:13.5, fontWeight:500 }}>{j.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{j.version}</div>
                  <div><SBadge status={j.status} /></div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{j.signed}</div>
                  <div><DocActions id={'j-'+j.id+'-'+emp.id} name={j.name} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Führerschein */}
        {activeTab === 'fuehrerschein' && (
          <Section title="Führerscheinkontrolle">
            <div style={{ background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'0.5fr 1.5fr 1fr 1fr 1fr auto', gap:12, padding:'9px 16px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
                {['Klasse','Beschreibung','Letzte Kontrolle','Nächste Kontrolle','Status','Dokumente'].map(h => (
                  <div key={h} style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{h}</div>
                ))}
              </div>
              {licenseChecks.map(l => (
                <div key={l.id} style={{ display:'grid', gridTemplateColumns:'0.5fr 1.5fr 1fr 1fr 1fr auto', gap:12, alignItems:'center', padding:'11px 16px', borderBottom:'1px solid var(--border-1)', background: l.status==='expired' ? 'rgba(161,50,50,0.03)' : undefined }}>
                  <div style={{ width:32, height:32, borderRadius:7, background:'var(--color-near-black)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-serif)', fontSize:13, fontWeight:600 }}>{l.class}</div>
                  <div style={{ fontSize:13, color:'var(--fg-2)' }}>{l.desc}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{l.lastCheck}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{l.nextCheck}</div>
                  <div><SBadge status={l.status} /></div>
                  <div><DocActions id={'l-'+l.id+'-'+emp.id} name={'Klasse '+l.class} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Geraetefuehrer */}
        {activeTab === 'geraetefuehrer' && (
          <Section title={'Ger\u00e4tef\u00fchrer'}>
            <div style={{ background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1.7fr auto', gap:12, padding:'9px 16px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
                {['Typ Ger\u00e4t','Ausbildung / Einweisung','Datum','Beschreibung','Dokumente'].map(h => (
                  <div key={h} style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{h}</div>
                ))}
              </div>
              {myGeraetefuehrer.map(g => (
                <div key={g.id} style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1.7fr auto', gap:12, alignItems:'center', padding:'11px 16px', borderBottom:'1px solid var(--border-1)' }}>
                  <div style={{ fontSize:13.5, fontWeight:500 }}>{g.type === 'Sonstig' && g.otherType ? 'Sonstig - ' + g.otherType : g.type}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{g.kind}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{g.date ? window.fmtDE(g.date) : '�'}</div>
                  <div style={{ fontSize:12.5, color:'var(--fg-2)' }}>{g.description || 'Freigegeben fuer Mitarbeiter'}</div>
                  <div><DocActions id={'gf-'+g.id+'-'+emp.id} name={g.type || 'Geraetefuehrer'} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
      {uploadTarget && <UploadMini />}
    </div>
  );
}

/* ── CellActionModal — Schulung anmelden / Verlängerung planen ── */
function CellActionModal({ modal, onClose }) {
  const [form, setForm] = React.useState({ datum:'', ort:'', notiz:'' });
  const [done, setDone] = React.useState(false);
  const isRenewal = modal.mode === 'renewal';

  const inputStyle = { width:'100%', padding:'9px 12px', fontSize:14, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', color:'var(--fg-1)', outline:'none', fontFamily:'inherit', boxSizing:'border-box' };

  const submit = () => { setDone(true); setTimeout(onClose, 2000); };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.45)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:440, background:'var(--color-ivory)', borderRadius:18, boxShadow:'0 24px 64px rgba(0,0,0,0.22)', overflow:'hidden', animation:'qaSlideUp 220ms cubic-bezier(0.34,1.56,0.64,1)' }}>
        <style>{`@keyframes qaSlideUp { from { transform:translateY(20px) scale(0.97); opacity:0 } to { transform:none; opacity:1 } }`}</style>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 20px', borderBottom:'1px solid var(--border-1)', background: isRenewal ? '#fbecea' : 'rgba(201,100,66,0.06)' }}>
          <div style={{ fontSize:22 }}>{isRenewal ? '🔄' : '📚'}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500, color: isRenewal ? '#a13232' : 'var(--fg-1)' }}>
              {isRenewal ? 'Verlängerung planen' : 'Schulung anmelden'}
            </div>
            <div style={{ fontSize:12, color:'var(--fg-3)', marginTop:2 }}>Anfrage wird an Admin gesendet</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {done ? (
          <div style={{ padding:'40px 24px', textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'#eff5ed', border:'1px solid #cde1cf', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:12 }}>✓</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500, color:'#3f7a4a' }}>
              {isRenewal ? 'Verlängerung wurde angefragt' : 'Schulung wurde angefragt'}
            </div>
            <div style={{ fontSize:12.5, color:'var(--fg-3)', marginTop:6 }}>Admin wird benachrichtigt.</div>
          </div>
        ) : (
          <div style={{ padding:'20px 20px 22px' }}>
            {/* Prefilled fields */}
            {[
              { label:'Mitarbeiter', value: modal.emp.name, readonly: true },
              { label:'Schulung',    value: modal.training.name, readonly: true },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:4 }}>{f.label}</label>
                <div style={{ ...inputStyle, background:'var(--color-parchment)', color:'var(--fg-2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span>{f.value}</span>
                  <span style={{ fontSize:10, color:'var(--fg-3)' }}>automatisch</span>
                </div>
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:4 }}>Datum</label>
                <input type="date" value={form.datum} onChange={e => setForm(f=>({...f, datum:e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:4 }}>Ort</label>
                <input type="text" placeholder="z. B. Nordhorn" value={form.ort} onChange={e => setForm(f=>({...f, ort:e.target.value}))} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:4 }}>Notiz (optional)</label>
              <textarea value={form.notiz} onChange={e => setForm(f=>({...f, notiz:e.target.value}))} placeholder="Zusätzliche Hinweise…" style={{ ...inputStyle, minHeight:60, resize:'vertical', lineHeight:1.5 }} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={submit} style={{ flex:1, padding:'11px 0', fontSize:14, fontWeight:600, background: isRenewal ? '#a13232' : 'var(--color-near-black)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit' }}>
                Anfrage senden
              </button>
              <button onClick={onClose} style={{ flex:1, padding:'11px 0', fontSize:14, fontWeight:500, background:'transparent', color:'var(--fg-2)', border:'1px solid var(--border-1)', borderRadius:10, cursor:'pointer', fontFamily:'inherit' }}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { MatrixView });
