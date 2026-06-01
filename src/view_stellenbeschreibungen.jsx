/* Stellenbeschreibungen - Admin-Verwaltung */

function StellenbeschreibungenView() {
  const { useState } = React;

  const statusCfg = {
    offen: { color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc', label: 'Offen' },
    versendet: { color: '#2d6fa3', bg: '#e8f1fb', border: '#bcd3ee', label: 'Versendet' },
    unterschrieben: { color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf', label: 'Unterschrieben' },
    abgelehnt: { color: '#a13232', bg: '#fbecea', border: '#eac8c2', label: 'Abgelehnt' },
  };

  const Badge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.offen;
    return (
      <span className="job-status" style={{ background: s.bg, borderColor: s.border, color: s.color }}>
        <span style={{ background: s.color }} />
        {s.label}
      </span>
    );
  };

  const [entries, setEntries] = useState([
    {
      id: 's1', emp: 'Markus Brinker', position: 'Polier', company: 'Tiefbau GmbH', title: 'Polier Tiefbau', version: 'v1.2',
      created: '01.03.2026', signed: '15.03.2026', status: 'unterschrieben', document: 'Polier_Tiefbau_v1.2.pdf',
      description: 'Verantwortlich fuer die operative Leitung der Kolonne im Tiefbau, Baustellenkoordination, Tagesplanung und sichere Umsetzung der Arbeitsverfahren.',
      tasks: ['Baustelle taeglich koordinieren', 'Mitarbeiter einweisen', 'Material und Maschinen abstimmen', 'Qualitaet und Arbeitssicherheit pruefen'],
      requirements: ['Mehrjaehrige Erfahrung im Tiefbau', 'Fuehrungserfahrung', 'Kenntnisse in Arbeitssicherheit und Dokumentation'],
      versions: [
        { version: 'v1.2', date: '01.03.2026', note: 'Abschnitt Arbeitssicherheit und digitale Dokumentation ergaenzt.' },
        { version: 'v1.1', date: '10.01.2026', note: 'Aufgaben der Kolonnenfuehrung praezisiert.' },
        { version: 'v1.0', date: '15.11.2025', note: 'Erstfassung erstellt.' },
      ],
    },
    {
      id: 's2', emp: 'Thomas Wegener', position: 'MaschinenfÃ¼hrer', company: 'Rohrbau GmbH', title: 'MaschinenfÃ¼hrer Rohrbau', version: 'v1.0',
      created: '10.03.2026', signed: '', status: 'versendet', document: 'Maschinenfuehrer_Rohrbau_v1.0.pdf',
      description: 'Bedienung und Pflege von Baumaschinen im Rohrbau, inklusive sicherer Arbeitsvorbereitung und Abstimmung mit der Bauleitung.',
      tasks: ['Maschinen bedienen', 'Taegliche Sichtpruefung dokumentieren', 'Arbeitsbereich sichern', 'Stoerungen melden'],
      requirements: ['Maschinenerfahrung', 'Gueltige Unterweisungen', 'Sorgfaeltige Arbeitsweise'],
      versions: [{ version: 'v1.0', date: '10.03.2026', note: 'Erstfassung versendet.' }],
    },
    {
      id: 's3', emp: 'Anna Fischer', position: 'Sachbearbeiterin', company: 'Verwaltung GmbH', title: 'Sachbearbeitung BÃ¼ro', version: 'v2.1',
      created: '20.02.2026', signed: '', status: 'offen', document: 'Sachbearbeitung_Buero_v2.1.pdf',
      description: 'Administrative Bearbeitung von Personal-, Schulungs- und Dokumentationsprozessen im Buero.',
      tasks: ['Dokumente pflegen', 'Termine koordinieren', 'Rueckfragen bearbeiten', 'Auswertungen vorbereiten'],
      requirements: ['Office-Kenntnisse', 'Strukturierte Arbeitsweise', 'Vertraulichkeit'],
      versions: [
        { version: 'v2.1', date: '20.02.2026', note: 'Datenschutz- und Ablagehinweise ergaenzt.' },
        { version: 'v2.0', date: '01.02.2026', note: 'Aufgabenbereich Schulungsverwaltung erweitert.' },
      ],
    },
    {
      id: 's4', emp: 'Stefan MÃ¼ller', position: 'Bauleiter', company: 'Tiefbau GmbH', title: 'Bauleiter Tiefbau', version: 'v1.1',
      created: '15.01.2026', signed: '', status: 'abgelehnt', document: 'Bauleiter_Tiefbau_v1.1.pdf',
      description: 'Technische und kaufmaennische Verantwortung fuer Tiefbauprojekte inklusive Planung, Steuerung und Abnahme.',
      tasks: ['Projektablauf steuern', 'Nachunternehmer koordinieren', 'Kosten ueberwachen', 'Abnahmen vorbereiten'],
      requirements: ['Technische Ausbildung', 'Baustellenerfahrung', 'Kommunikationsstaerke'],
      versions: [
        { version: 'v1.1', date: '15.01.2026', note: 'Kosten- und Nachtragsverantwortung angepasst.' },
        { version: 'v1.0', date: '01.12.2025', note: 'Erstfassung erstellt.' },
      ],
    },
    {
      id: 's5', emp: 'Laura Schneider', position: 'Lageristin', company: 'Logistik GmbH', title: 'Lager & Logistik', version: 'v1.0',
      created: '05.04.2026', signed: '', status: 'offen', document: 'Lager_Logistik_v1.0.pdf',
      description: 'Organisation von Materialausgabe, Lagerbestand und Ruecknahme fuer Baustellen und Werkstatt.',
      tasks: ['Material ausgeben', 'Bestaende pruefen', 'Lagerplaetze pflegen', 'Rueckgaben dokumentieren'],
      requirements: ['Lagererfahrung', 'Staplerschein wuenschenswert', 'Ordnung und Genauigkeit'],
      versions: [{ version: 'v1.0', date: '05.04.2026', note: 'Erstfassung erstellt.' }],
    },
    {
      id: 's6', emp: 'Klaus Richter', position: 'Sicherheitsbeauftr.', company: 'Tiefbau GmbH', title: 'SiBe Tiefbau', version: 'v2.0',
      created: '01.01.2025', signed: '01.01.2025', status: 'unterschrieben', document: 'SiBe_Tiefbau_v2.0.pdf',
      description: 'Unterstuetzung bei Arbeitsschutz, Begehungen, Gefaehrdungsmeldungen und Kommunikation sicherheitsrelevanter Themen.',
      tasks: ['Begehungen begleiten', 'Maengel melden', 'Unterweisungen unterstuetzen', 'Schutzmassnahmen beobachten'],
      requirements: ['SiBe-Bestellung', 'Arbeitsschutzkenntnisse', 'Aufmerksame Kommunikation'],
      versions: [
        { version: 'v2.0', date: '01.01.2025', note: 'Rolle an neue interne Sicherheitsprozesse angepasst.' },
        { version: 'v1.0', date: '01.08.2024', note: 'Erstfassung erstellt.' },
      ],
    },
  ]);

  const [showNew, setShowNew] = useState(false);
  const [jobView, setJobView] = useState('current');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editId, setEditId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ emp: '', position: '', company: '', title: '', version: 'v1.0' });
  const [detailVersion, setDetailVersion] = useState(null);
  const [jobSort, setJobSort] = useState({ col: 'created', dir: 'desc' });
  const [jobColumnMenu, setJobColumnMenu] = useState(null);
  const [jobFilterPanel, setJobFilterPanel] = useState(null);
  const [jobFilterSearch, setJobFilterSearch] = useState('');
  const [jobColumnFilters, setJobColumnFilters] = useState({});
  const [jobGroupBy, setJobGroupBy] = useState('');
  const [employeeReleases, setEmployeeReleases] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('employee_job_releases') || '{}');
    } catch (error) {
      return {};
    }
  });
  const [pendingApprovals, setPendingApprovals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('job_pending_approvals') || '{}');
    } catch (error) {
      return {};
    }
  });

  const pendingJobsAll = [
    {
      id: 'job-pending-1',
      emp: 'Mustafa Kempers',
      position: 'Bauleiter',
      company: 'Tiefbau GmbH',
      title: 'Bauleiter Tiefbau Projektabwicklung',
      version: 'v1.0',
      created: '12.05.2026',
      signed: '16.05.2026',
      status: 'unterschrieben',
      document: 'Bauleiter_Tiefbau_Projektabwicklung_v1.0.pdf',
      description: 'Neue Stellenbeschreibung fuer Bauleiter mit Schwerpunkt Projektsteuerung, Baustellendokumentation und Sicherheitskoordination.',
      tasks: ['Projekttermine steuern', 'Kolonnen abstimmen', 'Nachweise pruefen', 'Bauakte aktuell halten'],
      requirements: ['Bauleitungserfahrung', 'Sicherer Umgang mit Nachweisen', 'Kommunikation mit Auftraggebern'],
      versions: [{ version: 'v1.0', date: '12.05.2026', note: 'Vom Bauleiter eingereicht und wartet auf Freigabe.' }],
    },
    {
      id: 'job-pending-2',
      emp: 'Dirk Juergens',
      position: 'Vorarbeiter',
      company: 'Rohrbau GmbH',
      title: 'Vorarbeiter Rohrbau Kolonne',
      version: 'v1.0',
      created: '14.05.2026',
      signed: '17.05.2026',
      status: 'unterschrieben',
      document: 'Vorarbeiter_Rohrbau_Kolonne_v1.0.pdf',
      description: 'Stellenbeschreibung fuer Vorarbeiter im Rohrbau mit Schwerpunkt Kolonnenfuehrung und Tageskoordination.',
      tasks: ['Kolonne einteilen', 'Tagesleistung dokumentieren', 'Sicherheitsregeln kontrollieren'],
      requirements: ['Rohrbauerfahrung', 'Kommunikationsstaerke', 'Sicherer Umgang mit Baustellendokumentation'],
      versions: [{ version: 'v1.0', date: '14.05.2026', note: 'Neue Stellenbeschreibung durch Bauleiter angefragt.' }],
    },
  ];
  const pendingJobs = pendingJobsAll.filter(e => !pendingApprovals[e.id]);
  const currentEntries = [...entries, ...pendingJobsAll.filter(e => pendingApprovals[e.id])];
  const activeEntries = jobView === 'wartung' ? pendingJobs : currentEntries;
  const baseFiltered = filterStatus === 'all' ? activeEntries : activeEntries.filter(e => e.status === filterStatus);
  const selected = selectedId ? [...currentEntries, ...pendingJobs].find(e => e.id === selectedId) : null;
  const activeVersion = detailVersion || selected?.versions?.[0];

  const counts = Object.fromEntries(
    Object.keys(statusCfg).map(k => [k, currentEntries.filter(e => e.status === k).length])
  );

  const jobColumns = [
    { key: 'emp', label: 'Mitarbeiter' },
    { key: 'position', label: 'Position' },
    { key: 'company', label: 'Firma' },
    { key: 'title', label: 'Stellenbeschreibung' },
    { key: 'version', label: 'Version' },
    { key: 'created', label: 'Erstellt am' },
    { key: 'signed', label: 'Unterschrieben am' },
    { key: 'status', label: 'Status' },
  ];
  const jobColumnLabel = (key) => jobColumns.find(col => col.key === key)?.label || key;
  const parseDEDate = (value) => {
    const [day, month, year] = String(value || '').split('.');
    return year ? new Date(`${year}-${month}-${day}`).getTime() : 0;
  };
  const jobColumnValue = (entry, key) => {
    if (key === 'status') return statusCfg[entry.status]?.label || entry.status;
    return entry[key] || '';
  };
  const jobSortValue = (entry, key) => ['created', 'signed'].includes(key) ? parseDEDate(entry[key]) : jobColumnValue(entry, key);
  const toggleJobColumnFilterValue = (col, value) => {
    setJobColumnFilters(current => {
      const selectedValues = current[col] || [];
      const next = selectedValues.includes(value) ? selectedValues.filter(item => item !== value) : [...selectedValues, value];
      return { ...current, [col]: next };
    });
  };
  const filtered = baseFiltered.filter(entry => {
    for (const [col, values] of Object.entries(jobColumnFilters)) {
      if (values?.length && !values.includes(jobColumnValue(entry, col))) return false;
    }
    return true;
  }).sort((a, b) => {
    const av = jobSortValue(a, jobSort.col);
    const bv = jobSortValue(b, jobSort.col);
    const result = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'de');
    return jobSort.dir === 'asc' ? result : -result;
  });
  const jobFilterValues = jobFilterPanel
    ? Array.from(new Set(activeEntries.map(entry => jobColumnValue(entry, jobFilterPanel)))).sort((a, b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleJobFilterValues = jobFilterValues.filter(value => String(value).toLowerCase().includes(jobFilterSearch.toLowerCase()));
  const JobColumnHeader = ({ col }) => {
    const active = jobSort.col === col.key || (jobColumnFilters[col.key] || []).length > 0 || jobGroupBy === col.key;
    return (
      <th style={{ position: 'relative' }}>
        <button type="button" onClick={() => setJobColumnMenu(jobColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:0, padding:0, cursor:'pointer', font:'inherit', textTransform:'inherit', color:active ? 'var(--fg-1)' : 'inherit', fontWeight:active ? 700 : undefined }}>
          {col.label}
          <span style={{ fontSize: 10 }}>{jobSort.col === col.key ? (jobSort.dir === 'asc' ? '\u2191' : '\u2193') : '\u2304'}</span>
        </button>
        {jobColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)' }}>
            <button type="button" onClick={() => { setJobSort({ col: col.key, dir:'asc' }); setJobColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => { setJobSort({ col: col.key, dir:'desc' }); setJobColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setJobFilterPanel(col.key); setJobFilterSearch(''); setJobColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setJobGroupBy(jobGroupBy === col.key ? '' : col.key); setJobSort({ col: col.key, dir:'asc' }); setJobColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  React.useEffect(() => {
    setDetailVersion(null);
  }, [selectedId]);

  const save = () => {
    const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (editId) {
      setEntries(es => es.map(e => e.id === editId ? { ...e, ...form } : e));
    } else {
      const entry = {
        id: 's' + Date.now(),
        ...form,
        created: today,
        signed: '',
        status: 'offen',
        document: form.title.replace(/\s+/g, '_') + '_v1.0.pdf',
        description: 'Neue Stellenbeschreibung mit Aufgaben, Verantwortlichkeiten und Anforderungen.',
        tasks: ['Aufgaben erfassen', 'Verantwortlichkeiten pruefen', 'Dokument freigeben'],
        requirements: ['Fachliche Eignung', 'Unterweisung nach Bedarf'],
        versions: [{ version: form.version || 'v1.0', date: today, note: 'Neue Stellenbeschreibung erstellt.' }],
      };
      setEntries(es => [...es, entry]);
      setSelectedId(entry.id);
    }
    setShowNew(false);
    setEditId(null);
    setForm({ emp: '', position: '', company: '', title: '', version: 'v1.0' });
  };

  const startEdit = (entry) => {
    setForm({ emp: entry.emp, position: entry.position, company: entry.company, title: entry.title, version: entry.version });
    setEditId(entry.id);
    setShowNew(true);
  };

  const toggleSelected = (id) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  };
  const visibleIds = filtered.map(entry => entry.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const toggleAllVisible = () => {
    setSelectedIds(ids => {
      if (allVisibleSelected) return ids.filter(id => !visibleIds.includes(id));
      return Array.from(new Set([...ids, ...visibleIds]));
    });
  };

  const setBulkStatus = (status) => {
    setEntries(es => es.map(e => selectedIds.includes(e.id) ? { ...e, status, signed: status === 'unterschrieben' ? (e.signed || '03.05.2026') : e.signed } : e));
  };

  const deleteSelected = () => {
    setEntries(es => es.filter(e => !selectedIds.includes(e.id)));
    setSelectedIds([]);
  };

  const findEmployeeForEntry = (entry) => {
    const employees = window.SEED?.employees || [];
    const needle = String(entry.emp || '').toLowerCase();
    return employees.find(emp => String(emp.name || '').toLowerCase() === needle) ||
      employees.find(emp => String(emp.name || '').toLowerCase().includes(needle));
  };

  const isReleaseAllowed = (entry) => entry.status === 'unterschrieben';

  const toggleEmployeeRelease = (entry) => {
    if (!isReleaseAllowed(entry)) return;
    const employee = findEmployeeForEntry(entry);
    const next = { ...employeeReleases };
    if (next[entry.id]) {
      delete next[entry.id];
    } else {
      next[entry.id] = {
        id: entry.id,
        employeeId: employee?.id || '',
        employeeName: entry.emp,
        personalNr: employee?.personalNr || '',
        title: entry.title,
        position: entry.position,
        company: entry.company,
        version: entry.version,
        created: entry.created,
        signed: entry.signed,
        status: 'valid',
        document: entry.document,
        releasedAt: new Date().toISOString(),
        releasedBy: 'Admin',
      };
    }
    setEmployeeReleases(next);
    localStorage.setItem('employee_job_releases', JSON.stringify(next));
    if (entry.id?.startsWith('job-pending-') && !employeeReleases[entry.id]) {
      const nextApprovals = { ...pendingApprovals, [entry.id]: true };
      setPendingApprovals(nextApprovals);
      localStorage.setItem('job_pending_approvals', JSON.stringify(nextApprovals));
      window.dispatchEvent(new Event('job-pending-updated'));
      if (jobView === 'wartung') setJobView('current');
    }
  };

  const statusRatio = selected ? (selected.status === 'unterschrieben' ? 100 : selected.status === 'versendet' ? 60 : selected.status === 'abgelehnt' ? 20 : 35) : 0;

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Stellenbeschreibungen</h1>
          <div className="view__subtitle">Verwaltung aller Stellenbeschreibungen - Zuweisung, Versionierung und Unterschrift-Status</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary" onClick={() => { setShowNew(true); setEditId(null); setForm({ emp: '', position: '', company: '', title: '', version: 'v1.0' }); }}>
            + Neue Stellenbeschreibung
          </button>
        </div>
      </div>

      <div className="job-kpis jobdesc-kpis">
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
        <button type="button" onClick={() => setJobView('current')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:jobView === 'current' ? 700 : 500, color:jobView === 'current' ? 'var(--fg-1)' : 'var(--fg-2)', background:jobView === 'current' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (jobView === 'current' ? 'var(--border-1)' : 'transparent'), boxShadow:jobView === 'current' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Aktuell <span style={{ color:'var(--color-accent)' }}>{currentEntries.length}</span>
        </button>
        <button type="button" onClick={() => setJobView('wartung')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:jobView === 'wartung' ? 700 : 500, color:jobView === 'wartung' ? 'var(--fg-1)' : 'var(--fg-2)', background:jobView === 'wartung' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (jobView === 'wartung' ? 'var(--border-1)' : 'transparent'), boxShadow:jobView === 'wartung' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Wartungsliste <span style={{ color:'var(--color-accent)' }}>{pendingJobs.length}</span>
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px' }}>
        {jobGroupBy && <button type="button" onClick={() => setJobGroupBy('')} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Gruppierung aufheben</button>}
        {(jobSort.col !== 'created' || jobSort.dir !== 'desc') && <button type="button" onClick={() => setJobSort({ col:'created', dir:'desc' })} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Sortierung zurücksetzen</button>}
        <span className="muted small" style={{ marginLeft:'auto' }}>{filtered.length} {jobView === 'wartung' ? 'Einträge in Wartung' : 'Stellenbeschreibungen'}</span>
      </div>

      {Object.entries(jobColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px', padding:'10px 0' }}>
          {Object.entries(jobColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:999, background:'#efede8', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{jobColumnLabel(col)}:</span>
              <strong style={{ fontWeight:500 }}>{value || 'Leer'}</strong>
              <button type="button" onClick={() => toggleJobColumnFilterValue(col, value)} style={{ border:0, background:'transparent', cursor:'pointer', color:'var(--fg-2)', padding:0, lineHeight:1, display:'inline-flex' }}>
                <Icon name="x" size={14} />
              </button>
            </span>
          )))}
          <button type="button" onClick={() => setJobColumnFilters({})} style={{ border:'1px solid var(--border-1)', background:'white', borderRadius:999, padding:'6px 10px', cursor:'pointer', font:'inherit', fontSize:13, color:'var(--fg-2)' }}>
            Alle Filter löschen
          </button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="job-bulkbar">
          <strong>{selectedIds.length} ausgewählt</strong>
          <button type="button"><Icon name="download" size={14} />PDF export</button>
          <select onChange={(e) => e.target.value && setBulkStatus(e.target.value)} defaultValue="">
            <option value="">Status ändern</option>
            {Object.entries(statusCfg).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
          </select>
          <button type="button" className="is-danger" onClick={deleteSelected}><Icon name="x" size={14} />Löschen</button>
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
              {jobColumns.map(col => <JobColumnHeader key={col.key} col={col} />)}
              <th style={{ textAlign: 'center' }}>Freigabe für Mitarbeiter</th>
              <th style={{ textAlign: 'center' }}>Aktionen</th>
              <th style={{ textAlign: 'center' }}>Versionen</th>
            </tr></thead>
            <tbody>
              {filtered.map((e, index) => {
                const groupValue = jobGroupBy ? jobColumnValue(e, jobGroupBy) : '';
                const previous = jobGroupBy && index > 0 ? jobColumnValue(filtered[index - 1], jobGroupBy) : null;
                return (
                <React.Fragment key={e.id}>
                {jobGroupBy && groupValue !== previous && (
                  <tr>
                    <td colSpan={12} style={{ background:'var(--color-parchment)', color:'var(--fg-1)', fontWeight:700, padding:'10px 14px' }}>
                      {jobColumnLabel(jobGroupBy)}: {groupValue || 'Leer'}
                    </td>
                  </tr>
                )}
                <tr className={e.id === selected?.id ? 'job-row job-row--active' : 'job-row'} onClick={() => setSelectedId(e.id)}>
                  <td onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(e.id)} onChange={() => toggleSelected(e.id)} />
                  </td>
                  <td style={{ fontWeight: 500 }}>{e.emp}</td>
                  <td style={{ color: 'var(--fg-2)' }}>{e.position}</td>
                  <td style={{ color: 'var(--fg-2)' }}>{e.company}</td>
                  <td>{e.title}</td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--fg-2)' }}>{e.version}</span></td>
                  <td>{e.created}</td>
                  <td>{e.signed || <span style={{ color: 'var(--fg-3)' }}>-</span>}</td>
                  <td><Badge status={e.status} /></td>
                  <td style={{ textAlign: 'center' }} onClick={(event) => event.stopPropagation()}>
                    <label className={'release-toggle' + (!isReleaseAllowed(e) ? ' is-disabled' : '')} title={isReleaseAllowed(e) ? 'Für Mitarbeiter freigeben' : 'Nur bei Status Unterschrieben möglich'}>
                      <input
                        type="checkbox"
                        checked={!!employeeReleases[e.id]}
                        disabled={!isReleaseAllowed(e)}
                        onChange={() => toggleEmployeeRelease(e)}
                      />
                      <span>{employeeReleases[e.id] ? 'Freigegeben' : 'Freigeben'}</span>
                    </label>
                  </td>
                  <td style={{ textAlign: 'center' }} onClick={(event) => event.stopPropagation()}>
                    <div style={{ display:'inline-flex', gap:8 }}>
                      <button className="job-icon-btn" title="Vorschau" onClick={() => setSelectedId(e.id)}><Icon name="eye" size={15} /></button>
                      <button className="job-icon-btn" title="Bearbeiten" onClick={() => startEdit(e)}><Icon name="edit" size={15} /></button>
                      <button className="job-icon-btn" title="Löschen" style={{ color:'#a13232' }} onClick={() => setEntries(es => es.filter(item => item.id !== e.id))}><Icon name="trash" size={15} /></button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn" onClick={(event) => { event.stopPropagation(); setSelectedId(e.id); }}>{e.versions?.length || 1} Versionen</button></td>
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
                <h2>{selected.title}</h2>
                <p>{selected.emp} - {selected.position} - {selected.company}</p>
              </div>
              <div className="job-detail__actions">
                <Badge status={selected.status} />
                <button className="icon-btn" type="button" onClick={() => setSelectedId(null)} aria-label="Detail schließen">
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>

            <div className="job-sign-panel">
              <div>
                <span>Unterschriftenstatus</span>
                <strong>{selected.signed || 'Noch offen'}</strong>
              </div>
              <div className="bar">
                <div className="bar__fill bar__fill--valid" style={{ width: statusRatio + '%' }} />
              </div>
            </div>

            <section className="job-detail-section">
              <h3>Komplette Stellenbeschreibung</h3>
              <p>{selected.description}</p>
              <div className="job-detail-grid">
                <div>
                  <h4>Aufgaben</h4>
                  <ul>{selected.tasks.map(task => <li key={task}>{task}</li>)}</ul>
                </div>
                <div>
                  <h4>Anforderungen</h4>
                  <ul>{selected.requirements.map(req => <li key={req}>{req}</li>)}</ul>
                </div>
              </div>
            </section>

            <section className="job-detail-section">
              <h3>Versionen</h3>
              <div className="job-version-list">
                {selected.versions.map(v => (
                  <button key={v.version} className={activeVersion?.version === v.version ? 'is-active' : ''} onClick={() => setDetailVersion(v)}>
                    <span>{v.version}</span>
                    <small>{v.date}</small>
                  </button>
                ))}
              </div>
              {activeVersion && <div className="job-version-note">{activeVersion.note}</div>}
            </section>

            <section className="job-detail-section">
              <h3>Dokument Vorschau</h3>
              <div className="job-doc-preview">
                <div className="job-doc-page">
                  <div className="job-doc-line job-doc-line--wide"></div>
                  <div className="job-doc-line"></div>
                  <div className="job-doc-line"></div>
                  <div className="job-doc-line job-doc-line--short"></div>
                </div>
                <div>
                  <strong>{selected.document}</strong>
                  <span>PDF - {selected.version}</span>
                  <button className="btn btn--ghost" type="button"><Icon name="download" size={14} />PDF öffnen</button>
                </div>
              </div>
            </section>
          </aside>
        )}
      </div>

      {jobFilterPanel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.16)', display:'flex', justifyContent:'flex-end' }} onClick={() => setJobFilterPanel(null)}>
          <aside style={{ width:390, maxWidth:'92vw', height:'100%', background:'white', boxShadow:'-18px 0 42px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 14px' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach „{jobColumnLabel(jobFilterPanel)}“</h2>
              <button type="button" className="icon-btn" onClick={() => setJobFilterPanel(null)}><Icon name="x" size={22} /></button>
            </div>
            <div style={{ padding:'10px 28px 16px' }}>
              <input value={jobFilterSearch} onChange={e => setJobFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden"
                style={{ width:'100%', boxSizing:'border-box', padding:'12px 10px', border:'1px solid var(--fg-2)', font:'inherit', fontSize:16 }} />
            </div>
            <div style={{ overflowY:'auto', padding:'8px 28px', flex:1 }}>
              {visibleJobFilterValues.map(value => (
                <label key={value} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:16, color:'var(--fg-1)' }}>
                  <input type="checkbox" checked={(jobColumnFilters[jobFilterPanel] || []).includes(value)} onChange={() => toggleJobColumnFilterValue(jobFilterPanel, value)}
                    style={{ width:20, height:20, accentColor:'var(--color-accent)' }} />
                  {value || 'Leer'}
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, padding:'16px 28px 22px', borderTop:'1px solid var(--border-1)' }}>
              <button type="button" className="btn btn--primary" onClick={() => setJobFilterPanel(null)} disabled={!(jobColumnFilters[jobFilterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => setJobColumnFilters(current => ({ ...current, [jobFilterPanel]: [] }))}>Auswahl aufheben</button>
            </div>
          </aside>
        </div>
      )}

      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowNew(false)}>
          <div style={{ background: 'var(--color-ivory)', borderRadius: 16, width: 480, padding: 28,
            boxShadow: '0 12px 40px rgba(0,0,0,0.16)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontFamily: 'var(--font-serif)', fontWeight: 500 }}>
              {editId ? 'Stellenbeschreibung bearbeiten' : 'Neue Stellenbeschreibung'}
            </h2>
            {[
              ['emp', 'Mitarbeiter'],
              ['position', 'Position'],
              ['company', 'Firma'],
              ['title', 'Titel der Stellenbeschreibung'],
              ['version', 'Version'],
            ].map(([key, label]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-3)', marginBottom: 4 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-1)',
                    borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'white' }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-3)', marginBottom: 4 }}>PDF hochladen</label>
              <div style={{ border: '2px dashed var(--border-1)', borderRadius: 8, padding: '18px',
                textAlign: 'center', fontSize: 13, color: 'var(--fg-3)', cursor: 'pointer' }}>
                Datei hier ablegen oder klicken
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--ghost" onClick={() => setShowNew(false)} style={{ flex: 1 }}>Abbrechen</button>
              <button className="btn btn--primary" onClick={save} style={{ flex: 1 }}>{editId ? 'Speichern' : 'Erstellen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { StellenbeschreibungenView });

