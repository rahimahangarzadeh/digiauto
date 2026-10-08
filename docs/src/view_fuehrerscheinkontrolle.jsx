/* Fuehrerscheinkontrolle - gesetzliche Kontrolle fuer Fahrerlaubnisse */

function FuehrerscheinkontrolleView() {
  const { useState } = React;

  const statusCfg = {
    valid: { color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf', label: 'Gueltig', kpi: 'Gueltig' },
    warn: { color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc', label: 'Laeuft bald ab', kpi: 'Laeuft bald ab' },
    expired: { color: '#a13232', bg: '#fbecea', border: '#eac8c2', label: 'Abgelaufen', kpi: 'Abgelaufen' },
    missing: { color: '#6b6256', bg: '#f3f0ea', border: '#ded8cd', label: 'Kein Nachweis', kpi: 'Fehlt' },
  };

  const emp = (index) => window.SEED.employees[index] || window.SEED.employees[0];
  const companyName = (employee) => window.company(employee.company)?.name || employee.company;
  const companyShort = (employee) => window.company(employee.company)?.short || employee.company;

  const initialEntries = [
    { id: 'f1', employee: emp(0), classes: 'B, BE', origin: 'Deutsch', lastCheck: '15.04.2026', nextCheck: '15.04.2027', expiresAt: '15.04.2031', status: 'valid', front: 'FS_Markus_Brinker_vorne.jpg', back: 'FS_Markus_Brinker_rueckseite.jpg' },
    { id: 'f2', employee: emp(3), classes: 'C, CE', origin: 'Deutsch', lastCheck: '10.05.2025', nextCheck: '10.05.2026', expiresAt: '10.05.2030', status: 'warn', front: 'FS_Thomas_Wegener_vorne.jpg', back: 'FS_Thomas_Wegener_rueckseite.jpg' },
    { id: 'f3', employee: emp(4), classes: 'B', origin: 'Europa', lastCheck: '12.03.2025', nextCheck: '12.03.2026', expiresAt: '12.03.2030', status: 'expired', front: 'FS_Stefan_Mueller_vorne.jpg', back: '' },
    { id: 'f4', employee: emp(7), classes: 'BE, C1', origin: 'Deutsch', lastCheck: '21.04.2026', nextCheck: '21.04.2027', expiresAt: '21.04.2031', status: 'valid', front: 'FS_Daniel_Wolf_vorne.jpg', back: 'FS_Daniel_Wolf_rueckseite.jpg' },
    { id: 'f5', employee: emp(11), classes: 'B, T', origin: 'Deutsch', lastCheck: '', nextCheck: '', expiresAt: '', status: 'missing', front: '', back: '' },
    { id: 'f6', employee: emp(15), classes: 'C, CE', origin: 'Ausser Europa', lastCheck: '01.02.2025', nextCheck: '01.02.2026', expiresAt: '01.02.2030', status: 'expired', front: 'FS_Mustafa_Kempers_vorne.jpg', back: '' },
    { id: 'f7', employee: emp(20), classes: 'B, BE', origin: 'Deutsch', lastCheck: '28.04.2026', nextCheck: '28.04.2027', expiresAt: '28.04.2031', status: 'valid', front: 'FS_Oliver_Lammers_vorne.jpg', back: 'FS_Oliver_Lammers_rueckseite.jpg' },
    { id: 'f8', employee: emp(25), classes: 'C1, C', origin: 'Deutsch', lastCheck: '18.05.2025', nextCheck: '18.05.2026', expiresAt: '18.05.2030', status: 'warn', front: 'FS_Ralf_Kowalski_vorne.jpg', back: 'FS_Ralf_Kowalski_rueckseite.jpg' },
  ];

  const [entries, setEntries] = useState(initialEntries);
  const [licenseView, setLicenseView] = useState('current');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [licenseSort, setLicenseSort] = useState({ col: 'nextCheck', dir: 'asc' });
  const [licenseColumnMenu, setLicenseColumnMenu] = useState(null);
  const [licenseFilterPanel, setLicenseFilterPanel] = useState(null);
  const [licenseFilterSearch, setLicenseFilterSearch] = useState('');
  const [licenseColumnFilters, setLicenseColumnFilters] = useState({});
  const [licenseGroupBy, setLicenseGroupBy] = useState('');
  const [employeeReleases, setEmployeeReleases] = useState(() => {
    try { return JSON.parse(localStorage.getItem('employee_license_releases') || '{}'); }
    catch { return {}; }
  });
  const [pendingApprovals, setPendingApprovals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('license_pending_approvals') || '{}'); }
    catch { return {}; }
  });

  const pendingLicenseAll = [{
    id: 'license-pending-1',
    employee: emp(6),
    classes: 'B, BE, C1',
    origin: 'Deutsch',
    lastCheck: '16.05.2026',
    nextCheck: '16.05.2027',
    expiresAt: '16.05.2031',
    status: 'valid',
    front: 'FS_Pending_Vorderseite.jpg',
    back: 'FS_Pending_Rueckseite.jpg',
  }];
  const pendingLicenses = pendingLicenseAll.filter(entry => !pendingApprovals[entry.id]);
  const currentEntries = [...entries, ...pendingLicenseAll.filter(entry => pendingApprovals[entry.id])];
  const activeEntries = licenseView === 'wartung' ? pendingLicenses : currentEntries;
  const counts = Object.fromEntries(Object.keys(statusCfg).map(key => [key, currentEntries.filter(entry => entry.status === key).length]));
  const expiredCount = counts.expired || 0;

  const parseDE = (value) => {
    if (!value) return null;
    const [d, m, y] = value.split('.');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  const formatDE = (date) => {
    if (!date) return '';
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  };
  const toIsoDE = (value) => {
    const date = parseDE(value);
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const addMonthsDE = (value, months) => {
    const base = parseDE(value) || new Date(window.SEED.today);
    const next = new Date(base);
    next.setMonth(next.getMonth() + months);
    return formatDE(next);
  };
  const restText = (entry) => {
    if (entry.status === 'missing') return 'kein Nachweis';
    const date = parseDE(entry.nextCheck);
    if (!date) return 'kein Datum';
    const days = Math.round((date - new Date(window.SEED.today)) / (1000 * 60 * 60 * 24));
    if (days < 0) return `abgelaufen seit ${Math.abs(days)} Tagen`;
    return `in ${days} Tagen`;
  };

  const Badge = ({ status }) => {
    const cfg = statusCfg[status] || statusCfg.missing;
    return (
      <span className="job-status" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
        <span style={{ background: cfg.color }} />
        {cfg.label}
      </span>
    );
  };

  const licenseColumns = [
    { key: 'employee', label: 'Mitarbeiter' },
    { key: 'company', label: 'Firma' },
    { key: 'classes', label: 'Fuehrerscheinklasse' },
    { key: 'origin', label: 'Herkunft' },
    { key: 'lastCheck', label: 'Letzte Kontrolle' },
    { key: 'nextCheck', label: 'Naechste Kontrolle' },
    { key: 'expiresAt', label: 'Fuehrerschein laeuft ab' },
    { key: 'rest', label: 'Restzeit' },
    { key: 'status', label: 'Status' },
  ];
  const licenseColumnLabel = (key) => licenseColumns.find(col => col.key === key)?.label || key;
  const licenseColumnValue = (entry, key) => {
    if (key === 'employee') return entry.employee.name;
    if (key === 'company') return companyShort(entry.employee);
    if (key === 'status') return statusCfg[entry.status]?.label || entry.status;
    if (key === 'rest') return restText(entry);
    return entry[key] || '';
  };
  const licenseSortValue = (entry, key) => ['lastCheck', 'nextCheck', 'expiresAt'].includes(key)
    ? (parseDE(entry[key])?.getTime() || 0)
    : licenseColumnValue(entry, key);
  const toggleLicenseColumnFilterValue = (col, value) => {
    setLicenseColumnFilters(current => {
      const selected = current[col] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [col]: next };
    });
  };
  const baseFiltered = filterStatus === 'all' ? activeEntries : activeEntries.filter(entry => entry.status === filterStatus);
  const filtered = baseFiltered.filter(entry => {
    for (const [col, values] of Object.entries(licenseColumnFilters)) {
      if (values?.length && !values.includes(licenseColumnValue(entry, col))) return false;
    }
    return true;
  }).sort((a, b) => {
    const av = licenseSortValue(a, licenseSort.col);
    const bv = licenseSortValue(b, licenseSort.col);
    const result = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'de');
    return licenseSort.dir === 'asc' ? result : -result;
  });
  const selected = selectedId ? [...currentEntries, ...pendingLicenses].find(entry => entry.id === selectedId) : null;
  const licenseFilterValues = licenseFilterPanel
    ? Array.from(new Set(activeEntries.map(entry => licenseColumnValue(entry, licenseFilterPanel)))).sort((a, b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleLicenseFilterValues = licenseFilterValues.filter(value => String(value).toLowerCase().includes(licenseFilterSearch.toLowerCase()));

  const LicenseColumnHeader = ({ col }) => {
    const active = licenseSort.col === col.key || (licenseColumnFilters[col.key] || []).length > 0 || licenseGroupBy === col.key;
    return (
      <th style={{ position: 'relative' }}>
        <button type="button" onClick={() => setLicenseColumnMenu(licenseColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:0, padding:0, cursor:'pointer', font:'inherit', textTransform:'inherit', color:active ? 'var(--fg-1)' : 'inherit', fontWeight:active ? 700 : undefined }}>
          {col.label}
          <span style={{ fontSize:10 }}>{licenseSort.col === col.key ? (licenseSort.dir === 'asc' ? '\u2191' : '\u2193') : '\u2304'}</span>
        </button>
        {licenseColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)' }}>
            <button type="button" onClick={() => { setLicenseSort({ col: col.key, dir:'asc' }); setLicenseColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => { setLicenseSort({ col: col.key, dir:'desc' }); setLicenseColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setLicenseFilterPanel(col.key); setLicenseFilterSearch(''); setLicenseColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setLicenseGroupBy(licenseGroupBy === col.key ? '' : col.key); setLicenseSort({ col: col.key, dir:'asc' }); setLicenseColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  const isReleaseAllowed = (entry) => entry.status !== 'missing' && (!!entry.front || !!entry.back);
  const toggleEmployeeRelease = (entry) => {
    if (!isReleaseAllowed(entry)) return;
    const next = { ...employeeReleases };
    const release = !next[entry.id];
    if (release) {
      next[entry.id] = {
        id: entry.id,
        employeeId: entry.employee.id,
        employeeName: entry.employee.name,
        personalNr: entry.employee.personalNr,
        type: entry.classes,
        origin: entry.origin || 'Deutsch',
        lastCheck: entry.lastCheck,
        nextCheck: entry.nextCheck,
        expiresAt: entry.expiresAt || entry.nextCheck,
        status: entry.status,
        pdf: entry.front || entry.back || '',
        form: `Kontrollformular_${entry.employee.name.replace(/\s+/g, '_')}.pdf`,
        releasedAt: new Date().toISOString(),
        releasedBy: 'Admin',
      };
    } else {
      delete next[entry.id];
    }
    setEmployeeReleases(next);
    localStorage.setItem('employee_license_releases', JSON.stringify(next));
    if (entry.id?.startsWith('license-pending-') && release) {
      const nextApprovals = { ...pendingApprovals, [entry.id]: true };
      setPendingApprovals(nextApprovals);
      localStorage.setItem('license_pending_approvals', JSON.stringify(nextApprovals));
      window.dispatchEvent(new Event('license-pending-updated'));
      if (licenseView === 'wartung') setLicenseView('current');
    }
  };
  const uploadDoc = (id, side = 'front') => {
    setEntries(list => list.map(entry => {
      if (entry.id !== id) return entry;
      const today = window.fmtDE(window.SEED.today);
      const fileName = `FS_${entry.employee.name.replace(/\s+/g, '_')}_${side === 'front' ? 'vorne' : 'rueckseite'}.jpg`;
      return { ...entry, status: 'valid', lastCheck: today, nextCheck: addMonthsDE(today, 12), [side]: entry[side] || fileName };
    }));
  };
  const planControl = (entry) => {
    window.dispatchEvent(new CustomEvent('navigate-to-calendar', {
      detail: {
        trainingId: 't-unterweisung',
        date: entry.nextCheck ? toIsoDE(entry.nextCheck) : window.SEED.today,
        instruction: {
          id: entry.id,
          title: 'Fuehrerscheinkontrolle',
          number: entry.classes,
          group: companyName(entry.employee),
          participantId: entry.employee.id,
          participantName: entry.employee.name,
          contextLabel: 'Fuehrerscheinkontrolle vorausgewaehlt',
          kind: 'Gesetzliche Pflichtkontrolle',
          docType: 'fuehrerschein',
          location: 'Janning Gruppe Verwaltung',
        },
      },
    }));
  };
  const toggleSelected = (id) => setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const visibleIds = filtered.map(entry => entry.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const toggleAllVisible = () => {
    setSelectedIds(ids => {
      if (allVisibleSelected) return ids.filter(id => !visibleIds.includes(id));
      return Array.from(new Set([...ids, ...visibleIds]));
    });
  };
  const setBulkStatus = (status) => setEntries(list => list.map(entry => selectedIds.includes(entry.id) ? { ...entry, status } : entry));
  const deleteSelected = () => {
    setEntries(list => list.filter(entry => !selectedIds.includes(entry.id)));
    setSelectedIds([]);
  };

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Fuehrerscheinkontrolle</h1>
          <div className="view__subtitle">Gesetzliche Kontrolle von Fahrerlaubnissen, Nachweisen und Kontrollterminen.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary"><Icon name="plus" size={14} />Neue Kontrolle</button>
        </div>
      </div>

      {expiredCount > 0 && (
        <div className="license-alert">
          <strong>Warnung</strong>
          <span>{expiredCount} Fuehrerscheine abgelaufen</span>
        </div>
      )}

      <div className="job-kpis license-kpis">
        {Object.entries(statusCfg).map(([key, cfg]) => (
          <button key={key} className={'job-kpi' + (filterStatus === key ? ' job-kpi--active' : '')}
            style={{ '--job-kpi-color': cfg.color }}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}>
            <span>{cfg.kpi}</span>
            <strong>{counts[key]}</strong>
          </button>
        ))}
      </div>

      <div style={{ display:'inline-flex', gap:4, background:'#f4f2ec', border:'1px solid var(--border-1)', borderRadius:10, padding:4, margin:'0 0 14px', boxShadow:'0 12px 30px rgba(20,20,19,.08)' }}>
        <button type="button" onClick={() => setLicenseView('current')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:licenseView === 'current' ? 700 : 500, color:licenseView === 'current' ? 'var(--fg-1)' : 'var(--fg-2)', background:licenseView === 'current' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (licenseView === 'current' ? 'var(--border-1)' : 'transparent'), boxShadow:licenseView === 'current' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Aktuell <span style={{ color:'var(--color-accent)' }}>{currentEntries.length}</span>
        </button>
        <button type="button" onClick={() => setLicenseView('wartung')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:licenseView === 'wartung' ? 700 : 500, color:licenseView === 'wartung' ? 'var(--fg-1)' : 'var(--fg-2)', background:licenseView === 'wartung' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (licenseView === 'wartung' ? 'var(--border-1)' : 'transparent'), boxShadow:licenseView === 'wartung' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Wartungsliste <span style={{ color:'var(--color-accent)' }}>{pendingLicenses.length}</span>
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px' }}>
        {licenseGroupBy && <button type="button" onClick={() => setLicenseGroupBy('')} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Gruppierung aufheben</button>}
        {(licenseSort.col !== 'nextCheck' || licenseSort.dir !== 'asc') && <button type="button" onClick={() => setLicenseSort({ col:'nextCheck', dir:'asc' })} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Sortierung zuruecksetzen</button>}
        <span className="muted small" style={{ marginLeft:'auto' }}>{filtered.length} {licenseView === 'wartung' ? 'Eintraege in Wartung' : 'Kontrollen'}</span>
      </div>

      {Object.entries(licenseColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px', padding:'10px 0' }}>
          {Object.entries(licenseColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:999, background:'#efede8', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{licenseColumnLabel(col)}:</span>
              <strong style={{ fontWeight:500 }}>{value || 'Leer'}</strong>
              <button type="button" onClick={() => toggleLicenseColumnFilterValue(col, value)} style={{ border:0, background:'transparent', cursor:'pointer', color:'var(--fg-2)', padding:0, lineHeight:1, display:'inline-flex' }}><Icon name="x" size={14} /></button>
            </span>
          )))}
          <button type="button" onClick={() => setLicenseColumnFilters({})} style={{ border:'1px solid var(--border-1)', background:'white', borderRadius:999, padding:'6px 10px', cursor:'pointer', font:'inherit', fontSize:13, color:'var(--fg-2)' }}>Alle Filter loeschen</button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="job-bulkbar">
          <strong>{selectedIds.length} ausgewaehlt</strong>
          <button type="button"><Icon name="download" size={14} />PDF export</button>
          <select onChange={(e) => e.target.value && setBulkStatus(e.target.value)} defaultValue="">
            <option value="">Status aendern</option>
            {Object.entries(statusCfg).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
          </select>
          <button type="button" className="is-danger" onClick={deleteSelected}><Icon name="x" size={14} />Loeschen</button>
        </div>
      )}

      <div className={'job-layout' + (selected ? ' job-layout--detail-open' : '')}>
        <div className="tbl-wrap job-table-wrap">
          <table className="tbl job-table">
            <thead><tr>
              <th style={{ width:38, textAlign:'center' }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  title={allVisibleSelected ? 'Auswahl aufheben' : 'Alle sichtbaren auswählen'}
                />
              </th>
              {licenseColumns.map(col => <LicenseColumnHeader key={col.key} col={col} />)}
              <th style={{ textAlign:'center' }}>Freigabe fuer Mitarbeiter</th>
              <th style={{ textAlign:'center' }}>Aktionen</th>
            </tr></thead>
            <tbody>
              {filtered.map((entry, index) => {
                const groupValue = licenseGroupBy ? licenseColumnValue(entry, licenseGroupBy) : '';
                const previous = licenseGroupBy && index > 0 ? licenseColumnValue(filtered[index - 1], licenseGroupBy) : null;
                return (
                <React.Fragment key={entry.id}>
                  {licenseGroupBy && groupValue !== previous && (
                    <tr><td colSpan={12} style={{ background:'var(--color-parchment)', color:'var(--fg-1)', fontWeight:700, padding:'10px 14px' }}>{licenseColumnLabel(licenseGroupBy)}: {groupValue || 'Leer'}</td></tr>
                  )}
                  <tr className={entry.id === selected?.id ? 'job-row job-row--active' : 'job-row'} onClick={() => setSelectedId(entry.id)}>
                    <td onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(entry.id)} onChange={() => toggleSelected(entry.id)} /></td>
                    <td style={{ fontWeight:600 }}>{entry.employee.name}</td>
                    <td style={{ color:'var(--fg-2)' }}>{companyShort(entry.employee)}</td>
                    <td><span className="license-class">{entry.classes}</span></td>
                    <td>{entry.origin || 'Deutsch'}</td>
                    <td>{entry.lastCheck || <span style={{ color:'var(--fg-3)' }}>kein Nachweis</span>}</td>
                    <td><strong className={'license-due license-due--' + entry.status}>{entry.nextCheck || 'offen'}</strong></td>
                    <td>{entry.expiresAt || '-'}</td>
                    <td><span className="license-rest">{restText(entry)}</span></td>
                    <td><Badge status={entry.status} /></td>
                    <td style={{ textAlign:'center' }} onClick={(event) => event.stopPropagation()}>
                      <label className={'release-toggle' + (!isReleaseAllowed(entry) ? ' is-disabled' : '')} title={isReleaseAllowed(entry) ? 'Fuer Mitarbeiter freigeben' : 'Nur mit vorhandenem Fuehrerschein-Nachweis moeglich'}>
                        <input type="checkbox" checked={!!employeeReleases[entry.id]} disabled={!isReleaseAllowed(entry)} onChange={() => toggleEmployeeRelease(entry)} />
                        <span>{employeeReleases[entry.id] ? 'Freigegeben' : 'Freigeben'}</span>
                      </label>
                    </td>
                    <td style={{ textAlign:'center' }} onClick={(event) => event.stopPropagation()}>
                      <div style={{ display:'inline-flex', gap:8 }}>
                        <button className="job-icon-btn" title="Vorschau" onClick={() => setSelectedId(entry.id)}><Icon name="eye" size={15} /></button>
                        <button className="job-icon-btn" title="Upload" onClick={() => uploadDoc(entry.id, 'front')}><Icon name="upload" size={15} /></button>
                        <button className="job-icon-btn" title="Kontrolle planen" onClick={() => planControl(entry)}><Icon name="cal" size={15} /></button>
                        <button className="job-icon-btn" title="Loeschen" style={{ color:'#a13232' }} onClick={() => setEntries(list => list.filter(item => item.id !== entry.id))}><Icon name="trash" size={15} /></button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );})}
            </tbody>
          </table>
        </div>

        {selected && (
          <aside className="job-detail">
            <div className="job-detail__head">
              <div>
                <div className="eyebrow">Fuehrerschein</div>
                <h2>{selected.employee.name}</h2>
                <p>{companyName(selected.employee)} - Klasse {selected.classes}</p>
              </div>
              <div className="job-detail__actions">
                <Badge status={selected.status} />
                <button className="icon-btn" type="button" onClick={() => setSelectedId(null)} aria-label="Detail schliessen"><Icon name="x" size={16} /></button>
              </div>
            </div>

            <section className="job-detail-section">
              <h3>Kontrolldaten</h3>
              <div className="med-detail-grid">
                <div><span>Mitarbeiter</span><strong>{selected.employee.name}</strong></div>
                <div><span>Firma</span><strong>{companyName(selected.employee)}</strong></div>
                <div><span>Fuehrerscheinklasse</span><strong>{selected.classes}</strong></div>
                <div><span>Herkunft</span><strong>{selected.origin || 'Deutsch'}</strong></div>
                <div><span>Letzte Kontrolle</span><strong>{selected.lastCheck || 'kein Nachweis'}</strong></div>
                <div><span>Naechste Kontrolle</span><strong>{selected.nextCheck || 'offen'}</strong></div>
                <div><span>Laeuft ab</span><strong>{selected.expiresAt || 'offen'}</strong></div>
                <div><span>Restzeit</span><strong>{restText(selected)}</strong></div>
              </div>
            </section>

            <section className="job-detail-section">
              <h3>Foto / Scan speichern</h3>
              <div className="license-doc-grid">
                <div className="license-doc-card">
                  <div className="license-doc-preview"><Icon name="doc" size={24} /></div>
                  <span>Vorderseite</span>
                  <strong>{selected.front || 'Noch nicht hochgeladen'}</strong>
                  <button className="btn btn--ghost" type="button" onClick={() => uploadDoc(selected.id, 'front')}><Icon name="upload" size={14} />Vorderseite hochladen</button>
                </div>
                <div className="license-doc-card">
                  <div className="license-doc-preview"><Icon name="doc" size={24} /></div>
                  <span>Rueckseite</span>
                  <strong>{selected.back || 'Noch nicht hochgeladen'}</strong>
                  <button className="btn btn--ghost" type="button" onClick={() => uploadDoc(selected.id, 'back')}><Icon name="upload" size={14} />Rueckseite hochladen</button>
                </div>
              </div>
            </section>

            <button className="btn btn--primary med-detail-plan" type="button" onClick={() => planControl(selected)}>
              <Icon name="cal" size={14} />Kontrolle planen
            </button>
          </aside>
        )}
      </div>

      {licenseFilterPanel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.16)', display:'flex', justifyContent:'flex-end' }} onClick={() => setLicenseFilterPanel(null)}>
          <aside style={{ width:390, maxWidth:'92vw', height:'100%', background:'white', boxShadow:'-18px 0 42px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 14px' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach "{licenseColumnLabel(licenseFilterPanel)}"</h2>
              <button type="button" className="icon-btn" onClick={() => setLicenseFilterPanel(null)}><Icon name="x" size={22} /></button>
            </div>
            <div style={{ padding:'10px 28px 16px' }}>
              <input value={licenseFilterSearch} onChange={e => setLicenseFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden" style={{ width:'100%', boxSizing:'border-box', padding:'12px 10px', border:'1px solid var(--fg-2)', font:'inherit', fontSize:16 }} />
            </div>
            <div style={{ overflowY:'auto', padding:'8px 28px', flex:1 }}>
              {visibleLicenseFilterValues.map(value => (
                <label key={value} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:16, color:'var(--fg-1)' }}>
                  <input type="checkbox" checked={(licenseColumnFilters[licenseFilterPanel] || []).includes(value)} onChange={() => toggleLicenseColumnFilterValue(licenseFilterPanel, value)} style={{ width:20, height:20, accentColor:'var(--color-accent)' }} />
                  {value || 'Leer'}
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, padding:'16px 28px 22px', borderTop:'1px solid var(--border-1)' }}>
              <button type="button" className="btn btn--primary" onClick={() => setLicenseFilterPanel(null)} disabled={!(licenseColumnFilters[licenseFilterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => setLicenseColumnFilters(current => ({ ...current, [licenseFilterPanel]: [] }))}>Auswahl aufheben</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { FuehrerscheinkontrolleView });
