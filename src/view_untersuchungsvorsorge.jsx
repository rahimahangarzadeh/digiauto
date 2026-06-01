/* Untersuchungsvorsorge - Arbeitsmedizinische Verwaltung */

function UntersuchungsvorsorgeView() {
  const { useState } = React;

  const statusCfg = {
    erledigt: { color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf', label: 'Erledigt' },
    geplant: { color: '#2d6fa3', bg: '#e8f1fb', border: '#bcd3ee', label: 'Geplant' },
    faellig: { color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc', label: 'Faellig' },
    ueberfaellig: { color: '#a13232', bg: '#fbecea', border: '#eac8c2', label: 'Ueberfaellig' },
  };

  const Badge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.faellig;
    return (
      <span className="job-status" style={{ background: s.bg, borderColor: s.border, color: s.color }}>
        <span style={{ background: s.color }} />
        {s.label}
      </span>
    );
  };

  const [entries, setEntries] = useState([
    { id: 'u1', emp: 'Markus Brinker', company: 'Tiefbau GmbH', exam: 'G26 Atemschutz', art: 'Pflichtvorsorge', lastExam: '14.03.2025', nextExam: '14.03.2026', status: 'faellig', doctor: 'Dr. Krause / Arbeitsmedizin Nordhorn', document: 'G26_Markus_Brinker.pdf' },
    { id: 'u2', emp: 'Markus Brinker', company: 'Tiefbau GmbH', exam: 'G37 Laermexposition', art: 'Pflichtvorsorge', lastExam: '08.01.2025', nextExam: '08.01.2028', status: 'erledigt', doctor: 'B.A.D. Gesundheitsvorsorge', document: 'G37_Markus_Brinker.pdf' },
    { id: 'u3', emp: 'Thomas Wegener', company: 'Rohrbau GmbH', exam: 'G25 Fahr-/Steuertaetigkeit', art: 'Pflichtvorsorge', lastExam: '20.02.2025', nextExam: '20.02.2026', status: 'geplant', doctor: 'DEKRA Arbeitsmedizin', document: 'G25_Thomas_Wegener.pdf' },
    { id: 'u4', emp: 'Stefan Mueller', company: 'Tiefbau GmbH', exam: 'G41 Absturzgefahr', art: 'Pflichtvorsorge', lastExam: '01.01.2024', nextExam: '01.01.2025', status: 'ueberfaellig', doctor: 'Dr. Krause / Arbeitsmedizin Nordhorn', document: 'G41_Stefan_Mueller.pdf' },
    { id: 'u5', emp: 'Anna Fischer', company: 'Verwaltung GmbH', exam: 'G37 Bildschirmarbeit', art: 'Angebotsvorsorge', lastExam: '12.06.2024', nextExam: '12.06.2027', status: 'erledigt', doctor: 'Betriebsarzt Janning Gruppe', document: 'G37_Anna_Fischer.pdf' },
    { id: 'u6', emp: 'Laura Schneider', company: 'Logistik GmbH', exam: 'G25 Fahr-/Steuertaetigkeit', art: 'Pflichtvorsorge', lastExam: '', nextExam: '15.05.2026', status: 'geplant', doctor: 'DEKRA Arbeitsmedizin', document: '' },
  ]);

  const [showNew, setShowNew] = useState(false);
  const [medicalView, setMedicalView] = useState('current');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ emp: '', company: '', exam: '', art: 'Pflichtvorsorge', lastExam: '', nextExam: '' });
  const [medicalSort, setMedicalSort] = useState({ col: 'nextExam', dir: 'asc' });
  const [medicalColumnMenu, setMedicalColumnMenu] = useState(null);
  const [medicalFilterPanel, setMedicalFilterPanel] = useState(null);
  const [medicalFilterSearch, setMedicalFilterSearch] = useState('');
  const [medicalColumnFilters, setMedicalColumnFilters] = useState({});
  const [medicalGroupBy, setMedicalGroupBy] = useState('');
  const [employeeReleases, setEmployeeReleases] = useState(() => {
    try { return JSON.parse(localStorage.getItem('employee_medical_releases') || '{}'); }
    catch { return {}; }
  });
  const [pendingApprovals, setPendingApprovals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medical_pending_approvals') || '{}'); }
    catch { return {}; }
  });

  const pendingMedicalAll = [{
    id: 'medical-pending-1',
    emp: 'Mustafa Kempers',
    company: 'Tiefbau GmbH',
    exam: 'G26 Atemschutz',
    art: 'Pflichtvorsorge',
    lastExam: '10.05.2026',
    nextExam: '10.05.2027',
    status: 'erledigt',
    doctor: 'Arbeitsmedizin Nordhorn',
    document: 'G26_Mustafa_Kempers_2026.pdf',
  }];
  const pendingMedical = pendingMedicalAll.filter(entry => !pendingApprovals[entry.id]);
  const currentEntries = [...entries, ...pendingMedicalAll.filter(entry => pendingApprovals[entry.id])];
  const activeEntries = medicalView === 'wartung' ? pendingMedical : currentEntries;
  const counts = Object.fromEntries(Object.keys(statusCfg).map(k => [k, currentEntries.filter(e => e.status === k).length]));

  const parseDE = (value) => {
    if (!value) return null;
    const [d, m, y] = value.split('.');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  const toIsoDE = (value) => {
    const date = parseDE(value);
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const restText = (entry) => {
    const date = parseDE(entry.nextExam);
    if (!date) return 'kein Datum';
    const today = new Date(window.SEED.today);
    const days = Math.round((date - today) / (1000 * 60 * 60 * 24));
    if (days < 0) return `ueberfaellig seit ${Math.abs(days)} Tagen`;
    if (days === 0) return 'heute faellig';
    return `in ${days} Tagen`;
  };

  const medicalColumns = [
    { key: 'emp', label: 'Mitarbeiter' },
    { key: 'company', label: 'Firma' },
    { key: 'exam', label: 'Untersuchung' },
    { key: 'art', label: 'Art' },
    { key: 'lastExam', label: 'Letzte Untersuchung' },
    { key: 'nextExam', label: 'Naechster Termin' },
    { key: 'rest', label: 'Restzeit' },
    { key: 'status', label: 'Status' },
  ];
  const medicalColumnLabel = (key) => medicalColumns.find(col => col.key === key)?.label || key;
  const medicalColumnValue = (entry, key) => {
    if (key === 'status') return statusCfg[entry.status]?.label || entry.status;
    if (key === 'rest') return restText(entry);
    return entry[key] || '';
  };
  const medicalSortValue = (entry, key) => ['lastExam', 'nextExam'].includes(key)
    ? (parseDE(entry[key])?.getTime() || 0)
    : medicalColumnValue(entry, key);
  const toggleMedicalColumnFilterValue = (col, value) => {
    setMedicalColumnFilters(current => {
      const selected = current[col] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [col]: next };
    });
  };
  const baseFiltered = filterStatus === 'all' ? activeEntries : activeEntries.filter(entry => entry.status === filterStatus);
  const filtered = baseFiltered.filter(entry => {
    for (const [col, values] of Object.entries(medicalColumnFilters)) {
      if (values?.length && !values.includes(medicalColumnValue(entry, col))) return false;
    }
    return true;
  }).sort((a, b) => {
    const av = medicalSortValue(a, medicalSort.col);
    const bv = medicalSortValue(b, medicalSort.col);
    const result = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'de');
    return medicalSort.dir === 'asc' ? result : -result;
  });
  const selected = selectedId ? [...currentEntries, ...pendingMedical].find(entry => entry.id === selectedId) : null;
  const medicalFilterValues = medicalFilterPanel
    ? Array.from(new Set(activeEntries.map(entry => medicalColumnValue(entry, medicalFilterPanel)))).sort((a, b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleMedicalFilterValues = medicalFilterValues.filter(value => String(value).toLowerCase().includes(medicalFilterSearch.toLowerCase()));

  const MedicalColumnHeader = ({ col }) => {
    const active = medicalSort.col === col.key || (medicalColumnFilters[col.key] || []).length > 0 || medicalGroupBy === col.key;
    return (
      <th style={{ position: 'relative' }}>
        <button type="button" onClick={() => setMedicalColumnMenu(medicalColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:0, padding:0, cursor:'pointer', font:'inherit', textTransform:'inherit', color:active ? 'var(--fg-1)' : 'inherit', fontWeight:active ? 700 : undefined }}>
          {col.label}
          <span style={{ fontSize:10 }}>{medicalSort.col === col.key ? (medicalSort.dir === 'asc' ? '\u2191' : '\u2193') : '\u2304'}</span>
        </button>
        {medicalColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)' }}>
            <button type="button" onClick={() => { setMedicalSort({ col: col.key, dir:'asc' }); setMedicalColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => { setMedicalSort({ col: col.key, dir:'desc' }); setMedicalColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setMedicalFilterPanel(col.key); setMedicalFilterSearch(''); setMedicalColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setMedicalGroupBy(medicalGroupBy === col.key ? '' : col.key); setMedicalSort({ col: col.key, dir:'asc' }); setMedicalColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  const planAppointment = (entry) => {
    window.dispatchEvent(new CustomEvent('navigate-to-calendar', {
      detail: {
        trainingId: 't-unterweisung',
        date: toIsoDE(entry.nextExam),
        instruction: {
          id: entry.id,
          title: entry.exam,
          number: entry.art,
          group: entry.company,
          participantId: window.SEED.employees.find((employee) => employee.name === entry.emp)?.id,
          participantName: entry.emp,
          contextLabel: 'Untersuchung vorausgewaehlt',
          kind: 'Arbeitsmedizinischer Termin',
          location: entry.doctor,
        },
      },
    }));
  };
  const save = () => {
    setEntries(es => [...es, { id: 'u' + Date.now(), ...form, status: 'geplant', doctor: 'Arbeitsmedizinischer Dienst', document: '' }]);
    setShowNew(false);
    setForm({ emp: '', company: '', exam: '', art: 'Pflichtvorsorge', lastExam: '', nextExam: '' });
  };
  const uploadDoc = (id) => {
    setEntries(es => es.map(entry => entry.id === id ? { ...entry, status: 'erledigt', document: entry.document || `${entry.exam.replace(/\s+/g, '_')}_${entry.emp.replace(/\s+/g, '_')}.pdf` } : entry));
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
  const setBulkStatus = (status) => setEntries(es => es.map(entry => selectedIds.includes(entry.id) ? { ...entry, status } : entry));
  const deleteSelected = () => {
    setEntries(es => es.filter(entry => !selectedIds.includes(entry.id)));
    setSelectedIds([]);
  };
  const findEmployeeForEntry = (entry) => {
    const employees = window.SEED?.employees || [];
    const needle = String(entry.emp || '').toLowerCase();
    return employees.find(emp => String(emp.name || '').toLowerCase() === needle) ||
      employees.find(emp => String(emp.name || '').toLowerCase().includes(needle));
  };
  const isReleaseAllowed = (entry) => entry.status === 'erledigt' && !!entry.document;
  const toggleEmployeeRelease = (entry) => {
    if (!isReleaseAllowed(entry)) return;
    const employee = findEmployeeForEntry(entry);
    const next = { ...employeeReleases };
    const release = !next[entry.id];
    if (release) {
      next[entry.id] = {
        id: entry.id,
        employeeId: employee?.id || '',
        employeeName: entry.emp,
        personalNr: employee?.personalNr || '',
        exam: entry.exam,
        type: entry.art,
        last: entry.lastExam,
        next: entry.nextExam,
        provider: entry.doctor,
        status: 'valid',
        document: entry.document,
        releasedAt: new Date().toISOString(),
        releasedBy: 'Admin',
      };
    } else {
      delete next[entry.id];
    }
    setEmployeeReleases(next);
    localStorage.setItem('employee_medical_releases', JSON.stringify(next));
    if (entry.id?.startsWith('medical-pending-') && release) {
      const nextApprovals = { ...pendingApprovals, [entry.id]: true };
      setPendingApprovals(nextApprovals);
      localStorage.setItem('medical_pending_approvals', JSON.stringify(nextApprovals));
      window.dispatchEvent(new Event('medical-pending-updated'));
      if (medicalView === 'wartung') setMedicalView('current');
    }
  };
  const selectedRest = selected ? restText(selected) : '';

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Untersuchungsvorsorge</h1>
          <div className="view__subtitle">Arbeitsmedizinische Untersuchungen - G-Vorsorgen, Termine und Bescheinigungen</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary" onClick={() => setShowNew(true)}>+ Neue Untersuchung</button>
        </div>
      </div>

      <div className="job-kpis medical-kpis">
        {Object.entries(statusCfg).map(([key, cfg]) => (
          <button key={key} className={'job-kpi' + (filterStatus === key ? ' job-kpi--active' : '')}
            style={{ '--job-kpi-color': cfg.color }}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}>
            <span>{cfg.label}</span>
            <strong>{counts[key]}</strong>
          </button>
        ))}
      </div>

      <div style={{ display:'inline-flex', gap:4, background:'#f4f2ec', border:'1px solid var(--border-1)', borderRadius:10, padding:4, margin:'0 0 14px', boxShadow:'0 12px 30px rgba(20,20,19,.08)' }}>
        <button type="button" onClick={() => setMedicalView('current')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:medicalView === 'current' ? 700 : 500, color:medicalView === 'current' ? 'var(--fg-1)' : 'var(--fg-2)', background:medicalView === 'current' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (medicalView === 'current' ? 'var(--border-1)' : 'transparent'), boxShadow:medicalView === 'current' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Aktuell <span style={{ color:'var(--color-accent)' }}>{currentEntries.length}</span>
        </button>
        <button type="button" onClick={() => setMedicalView('wartung')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:medicalView === 'wartung' ? 700 : 500, color:medicalView === 'wartung' ? 'var(--fg-1)' : 'var(--fg-2)', background:medicalView === 'wartung' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (medicalView === 'wartung' ? 'var(--border-1)' : 'transparent'), boxShadow:medicalView === 'wartung' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Wartungsliste <span style={{ color:'var(--color-accent)' }}>{pendingMedical.length}</span>
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px' }}>
        {medicalGroupBy && <button type="button" onClick={() => setMedicalGroupBy('')} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Gruppierung aufheben</button>}
        {(medicalSort.col !== 'nextExam' || medicalSort.dir !== 'asc') && <button type="button" onClick={() => setMedicalSort({ col:'nextExam', dir:'asc' })} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Sortierung zuruecksetzen</button>}
        <span className="muted small" style={{ marginLeft:'auto' }}>{filtered.length} {medicalView === 'wartung' ? 'Eintraege in Wartung' : 'Untersuchungen'}</span>
      </div>

      {Object.entries(medicalColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px', padding:'10px 0' }}>
          {Object.entries(medicalColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:999, background:'#efede8', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{medicalColumnLabel(col)}:</span>
              <strong style={{ fontWeight:500 }}>{value || 'Leer'}</strong>
              <button type="button" onClick={() => toggleMedicalColumnFilterValue(col, value)} style={{ border:0, background:'transparent', cursor:'pointer', color:'var(--fg-2)', padding:0, lineHeight:1, display:'inline-flex' }}>
                <Icon name="x" size={14} />
              </button>
            </span>
          )))}
          <button type="button" onClick={() => setMedicalColumnFilters({})} style={{ border:'1px solid var(--border-1)', background:'white', borderRadius:999, padding:'6px 10px', cursor:'pointer', font:'inherit', fontSize:13, color:'var(--fg-2)' }}>
            Alle Filter loeschen
          </button>
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
              <th style={{ width: 38, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  title={allVisibleSelected ? 'Auswahl aufheben' : 'Alle sichtbaren auswählen'}
                />
              </th>
              {medicalColumns.map(col => <MedicalColumnHeader key={col.key} col={col} />)}
              <th style={{ textAlign: 'center' }}>Freigabe fuer Mitarbeiter</th>
              <th style={{ textAlign: 'center' }}>Aktionen</th>
            </tr></thead>
            <tbody>
              {filtered.map((entry, index) => {
                const groupValue = medicalGroupBy ? medicalColumnValue(entry, medicalGroupBy) : '';
                const previous = medicalGroupBy && index > 0 ? medicalColumnValue(filtered[index - 1], medicalGroupBy) : null;
                return (
                <React.Fragment key={entry.id}>
                {medicalGroupBy && groupValue !== previous && (
                  <tr><td colSpan={11} style={{ background:'var(--color-parchment)', color:'var(--fg-1)', fontWeight:700, padding:'10px 14px' }}>{medicalColumnLabel(medicalGroupBy)}: {groupValue || 'Leer'}</td></tr>
                )}
                <tr className={entry.id === selected?.id ? 'job-row job-row--active' : 'job-row'} onClick={() => setSelectedId(entry.id)}>
                  <td onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(entry.id)} onChange={() => toggleSelected(entry.id)} /></td>
                  <td style={{ fontWeight: 500 }}>{entry.emp}</td>
                  <td style={{ color: 'var(--fg-2)' }}>{entry.company}</td>
                  <td>{entry.exam}</td>
                  <td><span className={entry.art === 'Pflichtvorsorge' ? 'med-type med-type--required' : 'med-type'}>{entry.art}</span></td>
                  <td>{entry.lastExam || <span style={{ color: 'var(--fg-3)' }}>-</span>}</td>
                  <td style={{ fontWeight: entry.status === 'ueberfaellig' ? 600 : 400, color: entry.status === 'ueberfaellig' ? '#a13232' : 'inherit' }}>{entry.nextExam}</td>
                  <td><span className={'med-rest med-rest--' + entry.status}>{restText(entry)}</span></td>
                  <td><Badge status={entry.status} /></td>
                  <td style={{ textAlign: 'center' }} onClick={(event) => event.stopPropagation()}>
                    <label className={'release-toggle' + (!isReleaseAllowed(entry) ? ' is-disabled' : '')} title={isReleaseAllowed(entry) ? 'Fuer Mitarbeiter freigeben' : 'Nur bei Status Erledigt mit Bescheinigung moeglich'}>
                      <input type="checkbox" checked={!!employeeReleases[entry.id]} disabled={!isReleaseAllowed(entry)} onChange={() => toggleEmployeeRelease(entry)} />
                      <span>{employeeReleases[entry.id] ? 'Freigegeben' : 'Freigeben'}</span>
                    </label>
                  </td>
                  <td style={{ textAlign: 'center' }} onClick={(event) => event.stopPropagation()}>
                    <div style={{ display:'inline-flex', gap:8 }}>
                      <button className="job-icon-btn" title="Vorschau" onClick={() => setSelectedId(entry.id)}><Icon name="eye" size={15} /></button>
                      <button className="job-icon-btn" title="Upload" onClick={() => uploadDoc(entry.id)}><Icon name="upload" size={15} /></button>
                      <button className="job-icon-btn" title="Termin planen" onClick={() => planAppointment(entry)}><Icon name="cal" size={15} /></button>
                      <button className="job-icon-btn" title="Loeschen" style={{ color:'#a13232' }} onClick={() => setEntries(es => es.filter(item => item.id !== entry.id))}><Icon name="trash" size={15} /></button>
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
                <div className="eyebrow">Detail</div>
                <h2>{selected.exam}</h2>
                <p>{selected.emp} - {selected.company}</p>
              </div>
              <div className="job-detail__actions">
                <Badge status={selected.status} />
                <button className="icon-btn" type="button" onClick={() => setSelectedId(null)} aria-label="Detail schliessen"><Icon name="x" size={16} /></button>
              </div>
            </div>

            <div className="job-sign-panel">
              <div><span>Restzeit</span><strong>{selectedRest}</strong></div>
              <div className="bar"><div className="bar__fill bar__fill--valid" style={{ width: selected.status === 'erledigt' ? '100%' : selected.status === 'geplant' ? '60%' : selected.status === 'faellig' ? '35%' : '12%' }} /></div>
            </div>

            <section className="job-detail-section">
              <h3>Untersuchungsdaten</h3>
              <div className="med-detail-grid">
                <div><span>Mitarbeiter</span><strong>{selected.emp}</strong></div>
                <div><span>Untersuchung</span><strong>{selected.exam}</strong></div>
                <div><span>Letzte Untersuchung</span><strong>{selected.lastExam || '-'}</strong></div>
                <div><span>Naechste Untersuchung</span><strong>{selected.nextExam}</strong></div>
                <div><span>Arzt / Anbieter</span><strong>{selected.doctor}</strong></div>
                <div><span>Art</span><strong>{selected.art}</strong></div>
              </div>
            </section>

            <section className="job-detail-section">
              <h3>Dokument / Bescheinigung</h3>
              <div className="job-doc-preview">
                <div className="job-doc-page">
                  <div className="job-doc-line job-doc-line--wide"></div>
                  <div className="job-doc-line"></div>
                  <div className="job-doc-line job-doc-line--short"></div>
                </div>
                <div>
                  <strong>{selected.document || 'Noch keine Bescheinigung hochgeladen'}</strong>
                  <span>PDF/JPG/PNG - Vorschau</span>
                  <button className="btn btn--ghost" type="button" onClick={() => uploadDoc(selected.id)}><Icon name="upload" size={14} />Bescheinigung hochladen</button>
                </div>
              </div>
            </section>
          </aside>
        )}
      </div>

      {medicalFilterPanel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.16)', display:'flex', justifyContent:'flex-end' }} onClick={() => setMedicalFilterPanel(null)}>
          <aside style={{ width:390, maxWidth:'92vw', height:'100%', background:'white', boxShadow:'-18px 0 42px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 14px' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach "{medicalColumnLabel(medicalFilterPanel)}"</h2>
              <button type="button" className="icon-btn" onClick={() => setMedicalFilterPanel(null)}><Icon name="x" size={22} /></button>
            </div>
            <div style={{ padding:'10px 28px 16px' }}>
              <input value={medicalFilterSearch} onChange={e => setMedicalFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden" style={{ width:'100%', boxSizing:'border-box', padding:'12px 10px', border:'1px solid var(--fg-2)', font:'inherit', fontSize:16 }} />
            </div>
            <div style={{ overflowY:'auto', padding:'8px 28px', flex:1 }}>
              {visibleMedicalFilterValues.map(value => (
                <label key={value} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:16, color:'var(--fg-1)' }}>
                  <input type="checkbox" checked={(medicalColumnFilters[medicalFilterPanel] || []).includes(value)} onChange={() => toggleMedicalColumnFilterValue(medicalFilterPanel, value)} style={{ width:20, height:20, accentColor:'var(--color-accent)' }} />
                  {value || 'Leer'}
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, padding:'16px 28px 22px', borderTop:'1px solid var(--border-1)' }}>
              <button type="button" className="btn btn--primary" onClick={() => setMedicalFilterPanel(null)} disabled={!(medicalColumnFilters[medicalFilterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => setMedicalColumnFilters(current => ({ ...current, [medicalFilterPanel]: [] }))}>Auswahl aufheben</button>
            </div>
          </aside>
        </div>
      )}

      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowNew(false)}>
          <div style={{ background: 'var(--color-ivory)', borderRadius: 16, width: 480, padding: 28, boxShadow: '0 12px 40px rgba(0,0,0,0.16)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Neue Untersuchung anlegen</h2>
            {[['emp', 'Mitarbeiter'], ['company', 'Firma'], ['exam', 'Untersuchung (z.B. G26, G37)'], ['nextExam', 'Naechster Termin (TT.MM.JJJJ)']].map(([key, label]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-3)', marginBottom: 4 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-1)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'white' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--ghost" onClick={() => setShowNew(false)} style={{ flex: 1 }}>Abbrechen</button>
              <button className="btn btn--primary" onClick={save} style={{ flex: 1 }}>Erstellen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { UntersuchungsvorsorgeView });
