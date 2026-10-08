/* Employees, Trainings, Providers, Companies, Certs - list-style views */

function EmployeesView({ activeCompany }) {
  const [dept, setDept] = React.useState('all');
  const [selected, setSelected] = React.useState(new Set()); // Mehrfach-Auswahl
  const [empColumnMenu, setEmpColumnMenu] = React.useState(null);
  const [empFilterPanel, setEmpFilterPanel] = React.useState(null);
  const [empFilterSearch, setEmpFilterSearch] = React.useState('');
  const [empColumnFilters, setEmpColumnFilters] = React.useState({});
  const [empGroupBy, setEmpGroupBy] = React.useState('');
  const [empKpiFilter, setEmpKpiFilter] = React.useState('all');
  const [empActionMenu, setEmpActionMenu] = React.useState(null);
  const [empColumnManagerOpen, setEmpColumnManagerOpen] = React.useState(false);
  const [empImportOpen, setEmpImportOpen] = React.useState(false);
  const [empExportOpen, setEmpExportOpen] = React.useState(false);
  const [empViewMode, setEmpViewMode] = React.useState(() => {
    try { return localStorage.getItem('emp_view_mode_v1') || 'cards'; } catch (error) { return 'cards'; }
  });
  const setEmployeeViewMode = (mode) => {
    setEmpViewMode(mode);
    try { localStorage.setItem('emp_view_mode_v1', mode); } catch (error) {}
  };
  const defaultEmpVisibleColumns = ['name','pn','firma','dept','pos','entry','status'];
  const [empVisibleColumns, setEmpVisibleColumns] = React.useState(() => {
    try {
      const saved = localStorage.getItem('emp_visible_columns_compact_v1');
      return saved ? JSON.parse(saved) : defaultEmpVisibleColumns;
    } catch (error) {
      return defaultEmpVisibleColumns;
    }
  });

  // Sortierung mit localStorage
  const [sort, setSort] = React.useState(() => {
    try { const s = localStorage.getItem('emp_sort'); return s ? JSON.parse(s) : { col: 'name', dir: 'asc' }; }
    catch (error) { return { col: 'name', dir: 'asc' }; }
  });
  const toggleSort = (col) => {
    setSort(prev => {
      const next = { col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' };
      localStorage.setItem('emp_sort', JSON.stringify(next));
      return next;
    });
  };
  const resetSort = () => {
    const def = { col: 'name', dir: 'asc' };
    setSort(def);
    localStorage.setItem('emp_sort', JSON.stringify(def));
  };

  const empColumns = [
    { key: 'name', label: 'Name' },
    { key: 'pn', label: 'Personalnummer' },
    { key: 'firma', label: 'Firma' },
    { key: 'dept', label: 'Abteilung' },
    { key: 'pos', label: 'Position' },
    { key: 'group', label: 'Gruppe' },
    { key: 'employmentType', label: 'Beschäftigungsart' },
    { key: 'workload', label: 'Arbeitszeit' },
    { key: 'weeklyHours', label: 'Wochenarbeitszeit' },
    { key: 'entry', label: 'Eintritt' },
    { key: 'exitDate', label: 'Austrittsdatum' },
    { key: 'manager', label: 'Direkte Führungskraft' },
    { key: 'site', label: 'Standort' },
    { key: 'account', label: 'Benutzerkonto' },
    { key: 'phone', label: 'Telefon' },
    { key: 'email', label: 'E-Mail' },
    { key: 'address', label: 'Adresse' },
    { key: 'status', label: 'Status' },
  ];
  const persistEmpVisibleColumns = (next) => {
    setEmpVisibleColumns(next);
    try { localStorage.setItem('emp_visible_columns_compact_v1', JSON.stringify(next)); } catch (error) {}
  };
  const isEmpColumnVisible = (key) => empVisibleColumns.includes(key);
  const visibleEmpColumns = empColumns.filter(col => isEmpColumnVisible(col.key));
  const employeeTableColSpan = 1 + visibleEmpColumns.length + 1;
  const hideEmpColumn = (key) => {
    persistEmpVisibleColumns(empVisibleColumns.filter(col => col !== key));
    setEmpColumnMenu(null);
  };
  const showAllEmpColumns = () => persistEmpVisibleColumns(empColumns.map(col => col.key));
  const resetEmpColumns = () => persistEmpVisibleColumns(defaultEmpVisibleColumns);
  const empColumnLabel = (key) => empColumns.find(col => col.key === key)?.label || key;
  const empColumnValue = (e, key) => {
    if (key === 'name') return `${e.lastName}, ${e.firstName}`;
    if (key === 'pn') return e.personalNr;
    if (key === 'firma') return window.company(e.company)?.short || e.company;
    if (key === 'dept') return e.department;
    if (key === 'pos') return e.position;
    if (key === 'group') return employeeGroup(e);
    if (key === 'employmentType') return employeeEmploymentType(e);
    if (key === 'workload') return employeeWorkload(e);
    if (key === 'weeklyHours') return employeeWeeklyHours(e);
    if (key === 'entry') return window.fmtDE(e.entry);
    if (key === 'exitDate') return employeeExitDate(e);
    if (key === 'manager') return employeeManager(e);
    if (key === 'site') return employeeSite(e);
    if (key === 'account') return employeeAccountStatus(e);
    if (key === 'phone') return e.phone || '';
    if (key === 'email') return e.email || '';
    if (key === 'address') return e.address || '';
    if (key === 'status') return e.status === 'aktiv' ? 'Aktiv' : 'Inaktiv';
    return '';
  };
  const setEmpSort = (col, dir) => {
    const next = { col, dir };
    setSort(next);
    localStorage.setItem('emp_sort', JSON.stringify(next));
    setEmpColumnMenu(null);
  };
  const openEmpFilter = (col) => {
    setEmpFilterPanel(col);
    setEmpFilterSearch('');
    setEmpColumnMenu(null);
  };
  const toggleEmpFilterValue = (col, value) => {
    setEmpColumnFilters(current => {
      const selected = current[col] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [col]: next };
    });
  };
  const clearEmpFilter = (col) => setEmpColumnFilters(current => ({ ...current, [col]: [] }));
  const isWhiteCollar = (e) => /kaufm|büro|verwaltung|angestellte/i.test(`${e.position} ${e.department}`);
  const employeeGroup = (e) => {
    const text = `${e.position} ${e.department}`.toLowerCase();
    if (/azubi|auszubild/.test(text)) return 'Azubi';
    if (/praktik/.test(text)) return 'Praktikant';
    return isWhiteCollar(e) ? 'Angestellt' : 'Gewerblich';
  };
  const employeeWorkload = (e) => e.workload || (/teilzeit/i.test(`${e.position} ${e.department}`) ? 'Teilzeit' : 'Vollzeit');
  const employeeEmploymentType = (e) => {
    const text = `${e.position} ${e.department}`.toLowerCase();
    if (/azubi|auszubild/.test(text)) return 'Ausbildung';
    if (/praktik/.test(text)) return 'Praktikum';
    return 'Festangestellt';
  };
  const employeeWeeklyHours = (e) => employeeWorkload(e) === 'Teilzeit' ? '24 h' : '40 h';
  const employeeManager = (e) => {
    const text = `${e.position} ${e.department}`.toLowerCase();
    if (/kaufm|büro|verwaltung|angestellte/.test(text)) return 'Sabine Janning';
    if (/bauleiter|polier|baumaschinist/.test(text)) return 'Alexander Petersen';
    return 'Christian Janning';
  };
  const employeeSite = (e) => {
    const companyName = window.company(e.company)?.name || '';
    if (/Gronau/i.test(e.address || '') || /Galabau/i.test(companyName)) return 'Gronau';
    if (/Lingen/i.test(e.address || '') || /Transporte/i.test(companyName)) return 'Lingen';
    return 'Nordhorn';
  };
  const employeeExitDate = (e) => e.status === 'aktiv' ? '-' : '30.06.2026';
  const employeeAccountStatus = (e) => e.status === 'aktiv' ? 'Aktiv' : 'Gesperrt';

  const scopedEmps = activeCompany === 'all' ? window.SEED.employees : window.SEED.employees.filter(e => e.company === activeCompany);
  const empKpis = [
    { key: 'active', label: 'Aktiv', value: scopedEmps.filter(e => e.status === 'aktiv').length, color: '#3f7a4a' },
    { key: 'inactive', label: 'Inaktiv', value: scopedEmps.filter(e => e.status !== 'aktiv').length, color: '#6b6256' },
    { key: 'white', label: 'Angestellte', value: scopedEmps.filter(isWhiteCollar).length, color: '#2d6fa3' },
    { key: 'blue', label: 'Gewerbliche', value: scopedEmps.filter(e => !isWhiteCollar(e)).length, color: '#8a6a1f' },
  ];

  let emps = window.SEED.employees;
  if (activeCompany !== 'all') emps = emps.filter(e => e.company === activeCompany);
  if (dept !== 'all') emps = emps.filter(e => e.department === dept);
  if (empKpiFilter === 'active') emps = emps.filter(e => e.status === 'aktiv');
  if (empKpiFilter === 'inactive') emps = emps.filter(e => e.status !== 'aktiv');
  if (empKpiFilter === 'white') emps = emps.filter(isWhiteCollar);
  if (empKpiFilter === 'blue') emps = emps.filter(e => !isWhiteCollar(e));
  emps = emps.filter(e => Object.entries(empColumnFilters).every(([col, values]) => !values?.length || values.includes(empColumnValue(e, col))));

  // Sortierung anwenden
  emps = [...emps].sort((a, b) => {
    const va = empColumnValue(a, sort.col) || a.lastName;
    const vb = empColumnValue(b, sort.col) || b.lastName;
    const cmp = String(va).localeCompare(String(vb), 'de', { numeric:true });
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const [showNewEmp, setShowNewEmp] = React.useState(false);
  const [selectedEmp, setSelectedEmp] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [registerEmp, setRegisterEmp] = React.useState(null);
  const [messageEmp, setMessageEmp] = React.useState(null);
  const [employeeMessageThreads, setEmployeeMessageThreads] = React.useState({});
  const [hoveredRow, setHoveredRow] = React.useState(null);
  const initialEmployeeMessages = {
    'e-me': [
      { from: 'employee', time: 'Heute 08:42', text: 'Hallo Admin, ich habe eine Frage zu meinem SCC 016 Zertifikat. Ist das noch fuer die Baustelle Nordhorn gueltig?' },
      { from: 'employee', time: 'Heute 09:05', text: 'Und kannst du bitte pruefen, ob ich fuer die naechste Erste Hilfe Schulung angemeldet werden muss?' },
    ],
    e1001: [
      { from: 'employee', time: 'Gestern 15:18', text: 'Mein Fuehrerschein-Dokument wurde aktualisiert. Bitte einmal kontrollieren.' },
      { from: 'employee', time: 'Gestern 15:26', text: 'Falls etwas fehlt, sag mir bitte kurz Bescheid.' },
    ],
  };
  const defaultEmployeeMessages = (emp) => [
    { from: 'employee', time: 'Heute 08:42', text: `Hallo Admin, ich habe eine Frage zu meinen Unterlagen. Kannst du bitte bei ${emp.name} kurz pruefen?` },
    { from: 'employee', time: 'Heute 09:15', text: 'Ich brauche eine kurze Rueckmeldung, ob fuer mich noch eine Schulung oder ein Nachweis fehlt.' },
  ];
  const messagesForEmployee = (emp) => employeeMessageThreads[emp.id] || initialEmployeeMessages[emp.id] || defaultEmployeeMessages(emp);
  const unreadForEmployee = (emp) => messagesForEmployee(emp).filter(m => m.from === 'employee').length;
  const sendEmployeeReply = (emp, text) => {
    const body = text.trim();
    if (!body) return;
    const now = new Date();
    const time = `Heute ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setEmployeeMessageThreads(prev => {
      const current = prev[emp.id] || initialEmployeeMessages[emp.id] || defaultEmployeeMessages(emp);
      return {
        ...prev,
        [emp.id]: [...current, { from: 'admin', time, text: body }],
      };
    });
  };

  // Mehrfach-Auswahl Handler
  const toggleRow = (empId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(empId) ? next.delete(empId) : next.add(empId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === emps.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(emps.map(e => e.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  const empFilterValues = empFilterPanel
    ? Array.from(new Set(scopedEmps.map(e => empColumnValue(e, empFilterPanel)))).sort((a, b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleEmpFilterValues = empFilterValues.filter(value => String(value).toLowerCase().includes(empFilterSearch.toLowerCase()));

  const EmpColumnHeader = ({ col, sticky = false }) => {
    const active = sort.col === col.key || (empColumnFilters[col.key] || []).length > 0 || empGroupBy === col.key;
    return (
      <th className={sticky ? 'employee-sticky-name' : ''} style={{ whiteSpace:'nowrap' }}>
        <button type="button" onClick={() => setEmpColumnMenu(empColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:0, padding:0, cursor:'pointer', font:'inherit', textTransform:'inherit', color: active ? 'var(--fg-1)' : 'inherit', fontWeight: active ? 700 : undefined }}>
          {col.label}
          <span style={{ fontSize:10 }}>{sort.col === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
        </button>
        {empColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)' }}>
            <button type="button" onClick={() => setEmpSort(col.key, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z sortieren</button>
            <button type="button" onClick={() => setEmpSort(col.key, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A sortieren</button>
            <button type="button" onClick={() => openEmpFilter(col.key)} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setEmpGroupBy(empGroupBy === col.key ? '' : col.key); setEmpSort(col.key, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
            <button type="button" onClick={() => hideEmpColumn(col.key)} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'white', cursor:'pointer', font:'inherit' }}>Spalte ausblenden</button>
            <button type="button" onClick={() => { setEmpColumnManagerOpen(true); setEmpColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit', fontWeight:700 }}>Spalten verwalten</button>
          </div>
        )}
      </th>
    );
  };

  const renderEmployeeActions = (e, source = 'list') => {
    const menuKey = `${source}-${e.id}`;
    return (
      <div className="employee-actions-menu-wrap" onClick={ev => ev.stopPropagation()}>
        <button type="button" className="employee-row-menu-btn" title="Aktionen öffnen" onClick={() => setEmpActionMenu(empActionMenu === menuKey ? null : menuKey)}>⋮</button>
        {empActionMenu === menuKey && (
          <div className="employee-row-menu">
            <button type="button" onClick={() => { setSelectedEmp(e); setEmpActionMenu(null); }}>Details anzeigen</button>
            <button type="button" onClick={() => { setSelectedEmp(e); setEmpActionMenu(null); }}>Stammdaten bearbeiten</button>
            <button type="button" onClick={() => { setSelectedEmp(e); setEmpActionMenu(null); }}>Schulungen anzeigen</button>
            <button type="button" onClick={() => { setSelectedEmp(e); setEmpActionMenu(null); }}>Unterweisungen anzeigen</button>
            <button type="button" onClick={() => { setSelectedEmp(e); window.__empDocTab = true; setEmpActionMenu(null); }}>Dokumente anzeigen</button>
            <button type="button" onClick={() => { setMessageEmp(e); setEmpActionMenu(null); }}>Nachricht senden ({unreadForEmployee(e)})</button>
            <button type="button" onClick={() => { setRegisterEmp(e); setEmpActionMenu(null); }}>Termin erstellen</button>
            <button type="button" onClick={() => setEmpActionMenu(null)}>Benutzerkonto verwalten</button>
            <button type="button" onClick={() => setEmpActionMenu(null)}>Archivieren</button>
          </div>
        )}
      </div>
    );
  };

  const renderEmployeeCell = (e, key) => {
    if (key === 'name') {
      return (
        <td className="employee-sticky-name">
          <div className="employee-name-cell">
            <div className={'avatar avatar--' + e.color}>{e.initials}</div>
            <div>
              <strong>{e.lastName}, {e.firstName}</strong>
              <small>{e.position} · {e.email}</small>
            </div>
          </div>
        </td>
      );
    }
    if (key === 'pn') return <td className="num">{e.personalNr}</td>;
    if (key === 'firma') return <td>{window.company(e.company)?.short || e.company}</td>;
    if (key === 'dept') return <td>{e.department}</td>;
    if (key === 'pos') return <td>{e.position}</td>;
    if (key === 'group') return <td>{employeeGroup(e)}</td>;
    if (key === 'employmentType') return <td>{employeeEmploymentType(e)}</td>;
    if (key === 'workload') return <td>{employeeWorkload(e)}</td>;
    if (key === 'weeklyHours') return <td>{employeeWeeklyHours(e)}</td>;
    if (key === 'entry') return <td className="num">{window.fmtDE(e.entry)}</td>;
    if (key === 'exitDate') return <td className="num">{employeeExitDate(e)}</td>;
    if (key === 'manager') return <td>{employeeManager(e)}</td>;
    if (key === 'site') return <td>{employeeSite(e)}</td>;
    if (key === 'account') return <td><span className={employeeAccountStatus(e) === 'Aktiv' ? 'badge badge--valid' : 'badge'}><span className="badge__dot" />{employeeAccountStatus(e)}</span></td>;
    if (key === 'phone') return <td>{e.phone}</td>;
    if (key === 'email') return <td>{e.email}</td>;
    if (key === 'address') return <td>{e.address}</td>;
    if (key === 'status') {
      return (
        <td>
          {e.status === 'aktiv'
            ? <span className="badge badge--valid"><span className="badge__dot" />Aktiv</span>
            : <span className="badge"><span className="badge__dot" />Inaktiv</span>}
        </td>
      );
    }
    return <td>{empColumnValue(e, key)}</td>;
  };

  if (selectedEmp && window.EmployeeAdminDetail) {
    return <EmployeeAdminDetail emp={selectedEmp} onBack={() => setSelectedEmp(null)} />;
  }

  return (
    <div>
      <div className="company-list-head">
        <div className="company-list-title">
          <h1>Mitarbeiter</h1>
          <p>Alle Personen der Gruppe - nach Firma, Abteilung und Status.</p>
        </div>

        <div className="company-list-kpis">
          {empKpis.map(kpi => (
            <button key={kpi.key} className={empKpiFilter === kpi.key ? 'is-active' : ''}
              style={{ '--company-kpi-color': kpi.color }}
              onClick={() => setEmpKpiFilter(empKpiFilter === kpi.key ? 'all' : kpi.key)}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
            </button>
          ))}
        </div>

        <div className="company-list-actions">
          <button className="btn btn--ghost" onClick={() => setEmpImportOpen(true)}><Icon name="upload" size={14} />Import</button>
          <div className="employee-export-wrap">
            <button className="btn btn--ghost" onClick={() => setEmpExportOpen(empExportOpen ? false : true)}><Icon name="download" size={14} />Export</button>
            {empExportOpen && (
              <div className="employee-export-menu">
                <button type="button">Aktuelle Ansicht als Excel</button>
                <button type="button">Aktuelle Ansicht als CSV</button>
                <button type="button">Ausgewählte Mitarbeiter als Excel</button>
                <button type="button">Alle Mitarbeiter als Excel</button>
                <button type="button">Mitarbeiterstammblatt als PDF</button>
                <button type="button">Alle verfügbaren Spalten exportieren</button>
              </div>
            )}
          </div>
          <button className="btn btn--primary" onClick={() => setShowNewEmp(true)}><Icon name="plus" size={14} />Mitarbeiter</button>
        </div>
      </div>

      <div className="toolbar">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {(sort.col !== 'name' || sort.dir !== 'asc') && (
            <button onClick={resetSort} className="btn btn--ghost" style={{ fontSize:12, padding:'5px 10px' }}>Sortierung zurücksetzen</button>
          )}
          {empGroupBy && <button type="button" onClick={() => setEmpGroupBy('')} className="btn btn--ghost" style={{ fontSize:12, padding:'5px 10px' }}>Gruppierung aufheben</button>}
          {empKpiFilter !== 'all' && <button type="button" onClick={() => setEmpKpiFilter('all')} className="btn btn--ghost" style={{ fontSize:12, padding:'5px 10px' }}>KPI-Filter aufheben</button>}
        </div>
        <div className="employee-view-toggle">
          <button type="button" className={empViewMode === 'cards' ? 'is-active' : ''} onClick={() => setEmployeeViewMode('cards')}><Icon name="dashboard" size={15} />Kacheln</button>
          <button type="button" className={empViewMode === 'list' ? 'is-active' : ''} onClick={() => setEmployeeViewMode('list')}><Icon name="matrix" size={15} />Liste</button>
        </div>
        <div className="muted small">{emps.length} Personen</div>
      </div>

      {Object.entries(empColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px', padding:'10px 0' }}>
          {Object.entries(empColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:999, background:'#efede8', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{empColumnLabel(col)}:</span>
              <strong style={{ fontWeight:500 }}>{value}</strong>
              <button type="button" onClick={() => toggleEmpFilterValue(col, value)}
                style={{ border:0, background:'transparent', cursor:'pointer', color:'var(--fg-2)', padding:0, lineHeight:1, display:'inline-flex' }}
                aria-label={`${value} Filter entfernen`}>
                <Icon name="x" size={14} />
              </button>
            </span>
          )))}
          <button type="button" onClick={() => setEmpColumnFilters({})}
            style={{ border:'1px solid var(--border-1)', background:'white', borderRadius:999, padding:'6px 10px', cursor:'pointer', font:'inherit', fontSize:13, color:'var(--fg-2)' }}>
            Alle Filter löschen
          </button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="job-bulkbar">
          <strong>{selected.size} ausgewählt</strong>
          <button type="button"><Icon name="building" size={14} />Firma ändern</button>
          <select defaultValue="">
            <option value="">Status ändern</option>
            <option value="aktiv">Aktiv</option>
            <option value="inaktiv">Inaktiv</option>
          </select>
          <button type="button" onClick={() => setMessageEmp(emps.find(emp => selected.has(emp.id)) || null)}><Icon name="mail" size={14} />Nachricht senden</button>
          <button type="button"><Icon name="history" size={14} />Archivieren</button>
        </div>
      )}

      {empViewMode === 'cards' ? (
        <section className="employee-card-grid">
          {emps.map(e => (
            <article key={e.id} className="employee-card" onClick={() => setSelectedEmp(e)}>
              <header>
                <div className={'avatar avatar--' + e.color}>{e.initials}</div>
                <div>
                  <h3>{e.lastName}, {e.firstName}</h3>
                  <p>PN {e.personalNr}</p>
                </div>
                {e.status === 'aktiv'
                  ? <span className="badge badge--valid"><span className="badge__dot" />Aktiv</span>
                  : <span className="badge"><span className="badge__dot" />Inaktiv</span>}
              </header>
              <dl>
                <div><dt>Firma</dt><dd>{window.company(e.company)?.name || e.company}</dd></div>
                <div><dt>Abteilung</dt><dd>{e.department}</dd></div>
                <div><dt>Position</dt><dd>{e.position}</dd></div>
                <div><dt>E-Mail</dt><dd>{e.email}</dd></div>
              </dl>
              <footer>
                <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedEmp(e); }}><Icon name="eye" size={15} />Öffnen</button>
                {renderEmployeeActions(e, 'card')}
              </footer>
            </article>
          ))}
        </section>
      ) : (
        <div className="tbl-wrap employee-table-wrap employee-table-wrap--compact">
          <table className="tbl employee-table employee-table--compact">
            <thead>
              <tr>
                <th className="employee-sticky-select">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === emps.length}
                    onChange={toggleAll}
                    style={{ cursor:'pointer', width:18, height:18, accentColor:'var(--color-accent)' }}
                  />
                </th>
                {visibleEmpColumns.map(col => <EmpColumnHeader key={col.key} col={col} sticky={col.key === 'name'} />)}
                <th className="employee-sticky-actions">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {emps.map((e, index) => {
                const isChecked = selected.has(e.id);
                const groupValue = empGroupBy ? empColumnValue(e, empGroupBy) : '';
                const previous = empGroupBy && index > 0 ? empColumnValue(emps[index - 1], empGroupBy) : null;
                return (
                  <React.Fragment key={e.id}>
                    {empGroupBy && groupValue !== previous && (
                      <tr>
                        <td colSpan={employeeTableColSpan} className="employee-group-row">
                          {empColumnLabel(empGroupBy)}: {groupValue}
                        </td>
                      </tr>
                    )}
                    <tr onClick={() => setSelectedEmp(e)} className={isChecked ? 'is-selected' : ''}>
                      <td className="employee-sticky-select" onClick={ev => { ev.stopPropagation(); toggleRow(e.id); }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRow(e.id)}
                          onClick={ev => ev.stopPropagation()}
                          style={{ cursor:'pointer', width:18, height:18, accentColor:'var(--color-accent)' }}
                        />
                      </td>
                      {visibleEmpColumns.map(col => <React.Fragment key={col.key}>{renderEmployeeCell(e, col.key)}</React.Fragment>)}
                      <td className="employee-sticky-actions">{renderEmployeeActions(e, 'list')}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
	      {empFilterPanel && (
	        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.16)', display:'flex', justifyContent:'flex-end' }} onClick={() => setEmpFilterPanel(null)}>
	          <aside style={{ width:390, maxWidth:'92vw', height:'100%', background:'white', boxShadow:'-18px 0 42px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
	            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 14px' }}>
	              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach „{empColumnLabel(empFilterPanel)}“</h2>
	              <button type="button" className="icon-btn" onClick={() => setEmpFilterPanel(null)}><Icon name="x" size={22} /></button>
	            </div>
	            <div style={{ padding:'10px 28px 16px' }}>
	              <input value={empFilterSearch} onChange={e => setEmpFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden"
	                style={{ width:'100%', boxSizing:'border-box', padding:'12px 10px', border:'1px solid var(--fg-2)', font:'inherit', fontSize:16 }} />
	            </div>
	            <div style={{ overflowY:'auto', padding:'8px 28px', flex:1 }}>
	              {visibleEmpFilterValues.map(value => (
	                <label key={value} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:16, color:'var(--fg-1)' }}>
	                  <input type="checkbox" checked={(empColumnFilters[empFilterPanel] || []).includes(value)} onChange={() => toggleEmpFilterValue(empFilterPanel, value)}
	                    style={{ width:20, height:20, accentColor:'var(--color-accent)' }} />
	                  {value}
	                </label>
	              ))}
	            </div>
	            <div style={{ display:'flex', gap:12, padding:'16px 28px 22px', borderTop:'1px solid var(--border-1)' }}>
	              <button type="button" className="btn btn--primary" onClick={() => setEmpFilterPanel(null)} disabled={!(empColumnFilters[empFilterPanel] || []).length}>Anwenden</button>
	              <button type="button" className="btn btn--ghost" onClick={() => clearEmpFilter(empFilterPanel)}>Auswahl aufheben</button>
	            </div>
	          </aside>
	        </div>
	      )}
      {empColumnManagerOpen && (
        <EmployeeColumnManagerModal
          columns={empColumns}
          visibleColumns={empVisibleColumns}
          onToggle={(key) => {
            const next = empVisibleColumns.includes(key)
              ? empVisibleColumns.filter(col => col !== key)
              : [...empVisibleColumns, key];
            persistEmpVisibleColumns(next);
          }}
          onShowAll={showAllEmpColumns}
          onReset={resetEmpColumns}
          onClose={() => setEmpColumnManagerOpen(false)}
        />
      )}
      {empImportOpen && <EmployeeImportModal onClose={() => setEmpImportOpen(false)} />}
	      {showNewEmp && <NewEmployeeModal onClose={() => setShowNewEmp(false)} />}
      {messageEmp && <EmployeeMessagePanel emp={messageEmp} messages={messagesForEmployee(messageEmp)} onClose={() => setMessageEmp(null)} onSend={(text) => sendEmployeeReply(messageEmp, text)} />}
      {deleteConfirm && <DeleteConfirmModal emp={deleteConfirm} count={deleteConfirm === 'bulk' ? selected.size : 1} onClose={() => setDeleteConfirm(null)} onConfirm={() => { setDeleteConfirm(null); clearSelection(); }} />}
      {registerEmp && <RegisterTrainingModal emp={registerEmp} bulkCount={registerEmp === 'bulk' ? selected.size : 0} onClose={() => setRegisterEmp(null)} onConfirm={() => { setRegisterEmp(null); clearSelection(); }} />}
    </div>
  );
}

/* â”€â”€ Contact icon with hover tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function ContactIconCell({ icon, tooltip, href }) {
  const [hov, setHov] = React.useState(false);
  const Tag = href ? 'a' : 'div';
  return (
    <div style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
      <Tag
        href={href}
        onClick={e => e.stopPropagation()}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:28, height:28, borderRadius:7,
          color: hov ? 'var(--color-accent)' : 'var(--fg-3)',
          background: hov ? 'rgba(201,100,66,0.09)' : 'transparent',
          transition:'background 110ms, color 110ms',
          textDecoration:'none',
          cursor: href ? 'pointer' : 'default',
        }}
      >{icon}</Tag>
      {hov && tooltip && (
        <div style={{
          position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)',
          background:'var(--color-near-black)', color:'#fff',
          fontSize:11.5, whiteSpace:'nowrap', padding:'4px 9px', borderRadius:6,
          pointerEvents:'none', zIndex:9999,
          boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
        }}>{tooltip}</div>
      )}
    </div>
  );
}

function PhoneIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function MailIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polyline points="2,4 12,13 22,4"/>
    </svg>
  );
}

function LocationIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function EmployeeColumnManagerModal({ columns, visibleColumns, onToggle, onShowAll, onReset, onClose }) {
  return (
    <div className="employee-manage-backdrop" onClick={onClose}>
      <section className="employee-manage-modal" onClick={e => e.stopPropagation()}>
        <header>
          <div>
            <span>Mitarbeiterliste</span>
            <h2>Spalten verwalten</h2>
          </div>
          <button type="button" onClick={onClose}><Icon name="x" size={18} /></button>
        </header>
        <div className="employee-column-list">
          {columns.map(col => (
            <label key={col.key}>
              <input type="checkbox" checked={visibleColumns.includes(col.key)} onChange={() => onToggle(col.key)} />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
        <footer>
          <button type="button" className="btn btn--ghost" onClick={onShowAll}>Alle Spalten einblenden</button>
          <button type="button" className="btn btn--ghost" onClick={onReset}>Standardansicht wiederherstellen</button>
          <button type="button" className="btn btn--primary" onClick={onClose}>Übernehmen</button>
        </footer>
      </section>
    </div>
  );
}

function EmployeeImportModal({ onClose }) {
  const [step, setStep] = React.useState(0);
  const [uploaded, setUploaded] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const steps = ['Datei hochladen','Spalten zuordnen','Daten prüfen','Vorhandene Mitarbeiter','Import durchführen'];
  const requiredFields = ['Personalnummer','Vorname','Nachname','Firma','Abteilung','Position','Mitarbeitergruppe','Beschäftigungsart','Arbeitszeit','Eintrittsdatum','Personalstatus'];
  const mappings = [
    ['Personal-Nr.', 'Personalnummer'],
    ['Vorname', 'Vorname'],
    ['Nachname', 'Nachname'],
    ['Firma', 'Firma'],
    ['Abteilung', 'Abteilung'],
    ['Position', 'Position'],
    ['Eintritt', 'Eintrittsdatum'],
  ];

  return (
    <div className="employee-manage-backdrop" onClick={onClose}>
      <section className="employee-import-modal" onClick={e => e.stopPropagation()}>
        <header>
          <div>
            <span>Mitarbeiterimport</span>
            <h2>Import</h2>
          </div>
          <button type="button" onClick={onClose}><Icon name="x" size={18} /></button>
        </header>
        <nav>
          {steps.map((label, index) => (
            <button key={label} type="button" className={index === step ? 'is-active' : index < step ? 'is-done' : ''} onClick={() => setStep(index)}>
              <span>{index + 1}</span>{label}
            </button>
          ))}
        </nav>
        <div className="employee-import-body">
          {done ? (
            <div className="employee-import-success">
              <div><Icon name="check" size={26} /></div>
              <h3>30 Mitarbeiter wurden erfolgreich importiert.</h3>
              <p>3 Datensätze wurden aktualisiert. 2 Datensätze konnten nicht importiert werden.</p>
              <div>
                <button type="button" className="btn btn--ghost"><Icon name="download" size={14} />Fehlerprotokoll</button>
                <button type="button" className="btn btn--ghost"><Icon name="download" size={14} />Importbericht Excel</button>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div>
                  <div className="employee-import-drop" onClick={() => setUploaded(true)}>
                    <Icon name="upload" size={28} />
                    <strong>{uploaded ? 'Mitarbeiterliste_Juli_2026.xlsx' : 'Datei auswählen oder per Drag-and-drop hochladen'}</strong>
                    <span>Excel oder CSV · maximale Dateigröße 10 MB</span>
                  </div>
                  <div className="employee-import-meta">
                    <button type="button" className="btn btn--ghost"><Icon name="download" size={14} />Beispieldatei herunterladen</button>
                    <details>
                      <summary>Unterstützte Spalten anzeigen</summary>
                      <p>{requiredFields.join(', ')}</p>
                    </details>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div>
                  <p className="employee-import-note">Pflichtfelder müssen vollständig zugeordnet sein.</p>
                  <div className="employee-import-map">
                    <div>Spalte aus Excel</div><div>Feld im Programm</div>
                    {mappings.map(([excel, field]) => (
                      <React.Fragment key={excel}>
                        <strong>{excel}</strong>
                        <select defaultValue={field}>
                          {requiredFields.map(req => <option key={req}>{req}</option>)}
                          <option>Telefon</option><option>E-Mail</option><option>Adresse</option>
                        </select>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <div className="employee-import-stats">
                    <div><strong>35</strong><span>Datensätze erkannt</span></div>
                    <div><strong>30</strong><span>können importiert werden</span></div>
                    <div><strong>3</strong><span>Warnungen</span></div>
                    <div><strong>2</strong><span>Fehler</span></div>
                  </div>
                  <ul className="employee-import-checks">
                    <li>Doppelte Personalnummern erkannt</li>
                    <li>Unbekannte Firma in 1 Datensatz</li>
                    <li>2 ungültige E-Mail-Adressen</li>
                    <li>Datumswerte geprüft</li>
                  </ul>
                </div>
              )}
              {step === 3 && (
                <div className="employee-import-options">
                  {['Vorhandene Mitarbeiter nicht verändern','Vorhandene Mitarbeiter aktualisieren','Nur neue Mitarbeiter importieren','Doppelte Datensätze überspringen'].map((label, index) => (
                    <label key={label}>
                      <input type="radio" name="emp-import-mode" defaultChecked={index === 1} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              )}
              {step === 4 && (
                <div className="employee-import-confirm">
                  <h3>Import bereit</h3>
                  <p>Die aktuelle Zuordnung, Prüfung und Konfliktregel wird für den Import verwendet.</p>
                  <div className="employee-import-stats">
                    <div><strong>30</strong><span>neu</span></div>
                    <div><strong>3</strong><span>aktualisieren</span></div>
                    <div><strong>2</strong><span>überspringen</span></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {!done && (
          <footer>
            <button type="button" className="btn btn--ghost" onClick={step === 0 ? onClose : () => setStep(step - 1)}>{step === 0 ? 'Abbrechen' : 'Zurück'}</button>
            {step < 4 ? (
              <button type="button" className="btn btn--primary" disabled={step === 0 && !uploaded} onClick={() => setStep(step + 1)}>{step === 0 ? 'Datei prüfen' : 'Weiter'}</button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setDone(true)}>Mitarbeiter importieren</button>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}

function MessageQuickBtn({ count, onClick }) {
  return (
    <span style={{ position:'relative', display:'inline-flex' }}>
      <QuickBtn title="Nachrichten" onClick={onClick}>
        <MailIcon size={14} />
      </QuickBtn>
      {count > 0 && (
        <span style={{
          position:'absolute', top:1, right:1, transform:'translate(34%,-34%)',
          minWidth:16, height:16, padding:'0 4px',
          borderRadius:999, background:'var(--color-accent)', color:'#fff',
          fontSize:10, fontWeight:800, lineHeight:'16px', textAlign:'center',
          border:'2px solid var(--color-ivory)', pointerEvents:'none',
        }}>{count}</span>
      )}
    </span>
  );
}

function Avatar({ name }) {
  const initials = String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'MA';

  return (
    <div style={{
      width:48, height:48, borderRadius:999,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--color-accent)', color:'#fff',
      fontWeight:800, flex:'0 0 auto',
    }}>{initials}</div>
  );
}

function EmployeeMessagePanel({ emp, messages, onClose, onSend }) {
  const [draft, setDraft] = React.useState('');
  const unread = messages.filter(msg => msg.from === 'employee').length;
  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <>
      <div onClick={onClose} style={{
        position:'fixed', inset:0, zIndex:3000,
        background:'rgba(18,18,17,0.28)', backdropFilter:'blur(1px)',
      }} />
      <aside onClick={ev => ev.stopPropagation()} style={{
        position:'fixed', top:0, right:0, bottom:0, zIndex:3100,
        width:430, maxWidth:'calc(100vw - 22px)', background:'var(--color-ivory)',
        boxShadow:'-14px 0 44px rgba(0,0,0,0.18)',
        display:'flex', flexDirection:'column',
      }}>
        <header style={{
          padding:'22px 24px', background:'var(--color-near-black)', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:14,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            <Avatar name={emp.name} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:'Georgia, serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{emp.name}</div>
              <div style={{ color:'rgba(255,255,255,0.72)', fontSize:13, marginTop:3 }}>PN {emp.pn} · {emp.firma} · {emp.abteilung}</div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6, marginTop:10,
                borderRadius:999, padding:'4px 9px', background:'rgba(201,100,66,0.22)',
                color:'#fff', fontWeight:800, fontSize:12,
              }}>{unread} Nachrichten vom Mitarbeiter</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            border:'none', background:'transparent', color:'#fff', fontSize:28,
            lineHeight:1, cursor:'pointer', opacity:.75,
          }}>×</button>
        </header>

        <div style={{ padding:'18px 22px 10px', borderBottom:'1px solid var(--line)' }}>
          <div style={{ fontWeight:800, textTransform:'uppercase', fontSize:12, letterSpacing:.4 }}>Nachrichtenverlauf</div>
          <div style={{ color:'var(--fg-3)', marginTop:5, fontSize:13 }}>Nur Nachrichten vom Mitarbeiter an Admin, keine Upload-Warteliste.</div>
        </div>

        <div style={{
          flex:1, overflowY:'auto', padding:'18px 22px',
          display:'flex', flexDirection:'column', gap:12,
        }}>
          {messages.map((msg, idx) => {
            const isAdmin = msg.from === 'admin';
            return (
              <div key={idx} style={{
                alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                maxWidth:'84%',
                display:'flex', flexDirection:'column',
                alignItems: isAdmin ? 'flex-end' : 'flex-start',
              }}>
                <div style={{ color:'var(--fg-3)', fontSize:11.5, margin:'0 4px 4px' }}>{isAdmin ? 'Admin' : emp.name} · {msg.time}</div>
                <div style={{
                  border:'1px solid var(--line)', borderRadius:14,
                  borderTopRightRadius: isAdmin ? 4 : 14,
                  borderTopLeftRadius: isAdmin ? 14 : 4,
                  background: isAdmin ? '#f5dfd4' : '#fff',
                  color:'var(--fg)', padding:'10px 12px', lineHeight:1.45,
                  boxShadow:'0 5px 14px rgba(0,0,0,0.04)',
                }}>{msg.text}</div>
              </div>
            );
          })}
        </div>

        <footer style={{ padding:16, borderTop:'1px solid var(--line)', background:'#fff' }}>
          <label style={{ display:'block', color:'var(--fg-3)', fontSize:12, fontWeight:800, textTransform:'uppercase', marginBottom:7 }}>Antwort als Admin</label>
          <textarea
            value={draft}
            onChange={ev => setDraft(ev.target.value)}
            onKeyDown={ev => {
              if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') submit();
            }}
            placeholder="Nachricht eingeben..."
            rows={3}
            style={{
              width:'100%', resize:'vertical', minHeight:78, border:'1px solid var(--line)',
              borderRadius:10, padding:'10px 12px', font:'inherit', outline:'none',
              background:'var(--color-ivory)',
            }}
          />
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:10 }}>
            <button className="btn" onClick={onClose}>Abbrechen</button>
            <button className="btn btn-primary" onClick={submit}>Antworten</button>
          </div>
        </footer>
      </aside>
    </>
  );
}

/* â”€â”€ Quick Action helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function QuickBtn({ title, onClick, danger, children }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width:28, height:28, borderRadius:7, border:'none', cursor:'pointer',
        background: hov ? (danger ? 'rgba(161,50,50,0.09)' : 'rgba(201,100,66,0.09)') : 'transparent',
        color: hov ? (danger ? '#a13232' : 'var(--color-accent)') : 'var(--fg-3)',
        transition:'background 110ms, color 110ms',
        padding:0,
      }}
    >{children}</button>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function SchulungIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

/* â”€â”€ Delete Confirm Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function DeleteConfirmModal({ emp, count = 1, onClose, onConfirm }) {
  const [done, setDone] = React.useState(false);
  const isBulk = count > 1;

  const handleDelete = () => {
    setDone(true);
    setTimeout(() => { onConfirm?.(); onClose(); }, 1800);
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.45)', backdropFilter:'blur(2px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:400, borderRadius:16, background:'var(--color-ivory)',
        boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
        padding:'28px 28px 24px',
        animation:'fadeInScale 180ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        {done ? (
          <div style={{ textAlign:'center', padding:'12px 0' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'#eff5ed', border:'1px solid #cde1cf', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:22 }}>âœ“</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:17, color:'#3f7a4a' }}>
              {isBulk ? `${count} Mitarbeiter gelÃ¶scht` : 'Mitarbeiter gelÃ¶scht'}
            </div>
          </div>
        ) : (
          <>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'#fbecea', border:'1px solid #eac8c2', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <TrashIcon />
            </div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:19, fontWeight:500, marginBottom:8 }}>
              {isBulk ? `${count} Mitarbeiter lÃ¶schen?` : 'Mitarbeiter lÃ¶schen?'}
            </div>
            <div style={{ fontSize:13.5, color:'var(--fg-2)', lineHeight:1.5, marginBottom:24 }}>
              {isBulk
                ? `${count} Mitarbeiter werden dauerhaft aus dem System entfernt. Diese Aktion kann nicht rÃ¼ckgÃ¤ngig gemacht werden.`
                : <>
                  <strong>{emp.name}</strong> (PN {emp.personalNr}) wird dauerhaft aus dem System entfernt. Diese Aktion kann nicht rÃ¼ckgÃ¤ngig gemacht werden.
                </>
              }
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleDelete} style={{
                flex:1, padding:'10px 0', borderRadius:8, border:'none', cursor:'pointer',
                background:'#a13232', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:600,
              }}>LÃ¶schen</button>
              <button onClick={onClose} className="btn btn--ghost" style={{ flex:1, justifyContent:'center', fontSize:14 }}>Abbrechen</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* â”€â”€ Register Training Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function RegisterTrainingModal({ emp, bulkCount = 0, onClose, onConfirm }) {
  const [selected, setSelected] = React.useState('');
  const [date, setDate] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const isBulk = bulkCount > 0;

  const inp = {
    width:'100%', padding:'9px 12px', fontSize:13.5,
    border:'1px solid var(--border-1)', borderRadius:8,
    background:'var(--color-white)', color:'var(--fg-1)',
    outline:'none', fontFamily:'inherit', boxSizing:'border-box',
    transition:'border-color 150ms',
  };

  const handleSave = () => {
    if (!selected || !date) return;
    setSaved(true);
    setTimeout(() => { onConfirm?.(); onClose(); }, 1800);
  };

  const trainings = window.SEED.trainings;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.45)', backdropFilter:'blur(2px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:440, borderRadius:16, background:'var(--color-ivory)',
        boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
        overflow:'hidden',
        animation:'fadeInScale 180ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{ background:'var(--color-near-black)', color:'#fff', padding:'20px 22px 16px', display:'flex', alignItems:'center', gap:14 }}>
          {isBulk ? (
            <div style={{ width:40, height:40, borderRadius:8, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>ðŸ‘¥</div>
          ) : (
            <div className={'avatar avatar--' + emp.color} style={{ width:40, height:40, fontSize:14, flexShrink:0 }}>{emp.initials}</div>
          )}
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500 }}>Schulung anmelden</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 }}>
              {isBulk ? `${bulkCount} Mitarbeiter` : `${emp.name} Â· PN ${emp.personalNr}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {saved ? (
          <div style={{ padding:'36px 28px', textAlign:'center' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'#eff5ed', border:'1px solid #cde1cf', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:22 }}>âœ“</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:17, color:'#3f7a4a' }}>
              {isBulk ? `${bulkCount} Mitarbeiter angemeldet` : 'Schulung angemeldet'}
            </div>
            <div style={{ fontSize:13, color:'var(--fg-3)', marginTop:6 }}>
              {isBulk
                ? `${bulkCount} Mitarbeiter wurden fÃ¼r die Schulung eingetragen.`
                : `${emp.firstName} wurde fÃ¼r die Schulung eingetragen.`
              }
            </div>
          </div>
        ) : (
          <div style={{ padding:'22px 24px 24px' }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>
                Schulung <span style={{ color:'var(--color-accent)' }}>*</span>
              </label>
              <select value={selected} onChange={e => setSelected(e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--color-accent)'}
                onBlur={e=>e.target.style.borderColor='var(--border-1)'}
                style={{...inp, cursor:'pointer'}}>
                <option value="">â€” auswÃ¤hlen â€”</option>
                {trainings.map(t => (
                  <option key={t.id} value={t.id}>{t.name}{t.mandatory ? ' â˜…' : ''}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>
                Termin <span style={{ color:'var(--color-accent)' }}>*</span>
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--color-accent)'}
                onBlur={e=>e.target.style.borderColor='var(--border-1)'}
                style={inp} />
            </div>
            {selected && (
              <div style={{ marginBottom:20, padding:'11px 14px', borderRadius:10, background:'rgba(201,100,66,0.05)', border:'1px solid rgba(201,100,66,0.18)', fontSize:12.5, color:'var(--fg-2)', lineHeight:1.5 }}>
                {(() => {
                  const t = trainings.find(t => t.id === selected);
                  return t ? <>
                    <strong>{t.name}</strong> Â· GÃ¼ltigkeit: {t.months} Monate
                    {t.mandatory && <span style={{ marginLeft:8, fontSize:11, padding:'1px 6px', borderRadius:99, background:'rgba(201,100,66,0.12)', color:'var(--color-accent)', fontWeight:600 }}>Pflicht</span>}
                  </> : null;
                })()}
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleSave} disabled={!selected || !date} className="btn btn--primary" style={{
                flex:1, justifyContent:'center', fontSize:14,
                opacity: (!selected || !date) ? 0.45 : 1,
              }}>
                Anmelden
              </button>
              <button onClick={onClose} className="btn btn--ghost" style={{ flex:1, justifyContent:'center', fontSize:14 }}>Abbrechen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmpSidePanel({ emp, onClose, initialTab = 'stammdaten' }) {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const company = window.company(emp.company);
  const certs = window.SEED.certs[emp.id] || {};
  const myInstructions = window.SEED.instructions.filter(u => u.participants.some(p => p.emp === emp.id));
  function employeeGroupForPanel(item) {
    const text = `${item.position} ${item.department}`.toLowerCase();
    if (/azubi|auszubild/.test(text)) return 'Azubi';
    if (/praktik/.test(text)) return 'Praktikant';
    return /kaufm|büro|verwaltung|angestellte/i.test(`${item.position} ${item.department}`) ? 'Angestellt' : 'Gewerblich';
  }
  function employeeWorkloadForPanel(item) {
    return item.workload || (/teilzeit/i.test(`${item.position} ${item.department}`) ? 'Teilzeit' : 'Vollzeit');
  }
  const [form, setForm] = React.useState({
    firstName: emp.firstName || '',
    lastName: emp.lastName || '',
    personalNr: emp.personalNr || '',
    company: company?.name || '',
    department: emp.department || '',
    position: emp.position || '',
    entry: window.fmtDE(emp.entry) || '',
    email: emp.email || '',
    phone: emp.phone || '',
    status: emp.status === 'aktiv' ? 'Aktiv' : 'Inaktiv',
    employeeGroup: employeeGroupForPanel(emp),
    workload: employeeWorkloadForPanel(emp),
    password: '********',
  });
  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const MATRIX_COLS = ['t-erstehilfe','t-scc016','t-scc017','t-gw129','t-gw330','t-staplerschein','t-mvas99','t-unterweisung'];
  const matrixTrainings = MATRIX_COLS.map(id => window.SEED.trainings.find(t => t.id === id)).filter(Boolean);

  const statusCfg = {
    valid:   { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Gültig' },
    warn:    { color:'#8a6a1f', bg:'#faf3de', border:'#ece0bc', label:'Läuft bald ab' },
    expired: { color:'#a13232', bg:'#fbecea', border:'#eac8c2', label:'Abgelaufen' },
    missing: { color:'#a13232', bg:'#fbecea', border:'#eac8c2', label:'Fehlt' },
    planned: { color:'#2d6fa3', bg:'#e8f1fb', border:'#bcd3ee', label:'Geplant' },
    signed:  { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Unterschrieben' },
    done:    { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Erledigt' },
  };
  const SBadge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.missing;
    return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:600, background:s.bg, border:'1px solid '+s.border, color:s.color, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.color }} />{s.label}
    </span>;
  };
  const DownloadBtn = ({ label='Download' }) => (
    <button className="btn btn--ghost" style={{ fontSize:12, padding:'5px 9px', whiteSpace:'nowrap' }}>
      <Icon name="download" size={12} />{label}
    </button>
  );
  const SimpleTable = ({ columns, rows }) => (
    <div style={{ border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden', background:'var(--color-white)' }}>
      <div style={{ display:'grid', gridTemplateColumns:columns.map(c => c.w || '1fr').join(' '), gap:10, padding:'9px 12px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
        {columns.map(c => <div key={c.key} style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.4, color:'var(--fg-3)', textTransform:'uppercase' }}>{c.label}</div>)}
      </div>
      {rows.map((row, idx) => (
        <div key={row.id || idx} style={{ display:'grid', gridTemplateColumns:columns.map(c => c.w || '1fr').join(' '), gap:10, alignItems:'center', padding:'11px 12px', borderBottom:idx === rows.length - 1 ? 'none' : '1px solid var(--border-1)' }}>
          {columns.map(c => <div key={c.key} style={{ minWidth:0, fontSize:12.5 }}>{row[c.key]}</div>)}
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id:'stammdaten', label:'Stammdaten' },
    { id:'zertifikate', label:'Zertifikate' },
    { id:'unterweisungen', label:'Unterweisungen' },
    { id:'fuehrerschein', label:'Führerschein' },
    { id:'untersuchung', label:'Untersuchung' },
  ];

  const healthChecks = [
    { id:'h1', name:'G26 Atemschutz', lastCheck:'14.03.2025', nextCheck:'14.03.2026', status:'warn', doc:'Bescheinigung' },
    { id:'h2', name:'G37 Lärmexposition', lastCheck:'08.01.2025', nextCheck:'08.01.2028', status:'valid', doc:'Bescheinigung' },
    { id:'h3', name:'G37 Bildschirmarbeit', lastCheck:'12.06.2024', nextCheck:'12.06.2027', status:'valid', doc:'Bescheinigung' },
  ];
  const licenseRows = [
    { id:'l1', type:'B, BE', origin:'Deutsch', last:'10.03.2025', next:'10.03.2026', expires:'-', status:'valid' },
    { id:'l2', type:'C, CE', origin:'Europa', last:'15.01.2025', next:'15.01.2026', expires:'15.01.2030', status:'warn' },
  ];
  const fieldInput = { width:'100%', boxSizing:'border-box', border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', padding:'8px 10px', font:'inherit', fontSize:13, color:'var(--fg-1)' };
  const selectInput = { ...fieldInput, cursor:'pointer' };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.35)', backdropFilter:'blur(1px)' }} />
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, zIndex:3100,
        width: 620, maxWidth:'calc(100vw - 24px)', background:'var(--color-ivory)',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.16)',
        display:'flex', flexDirection:'column',
        animation:'slideInRight 220ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ background:'var(--color-near-black)', color:'#fff', padding:'20px 22px 16px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
            <div className={'avatar avatar--'+emp.color} style={{ width:52, height:52, fontSize:18, flexShrink:0 }}>{emp.initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500 }}>{emp.name}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.58)', marginTop:3 }}>
                PN {emp.personalNr} · {emp.position} · {company?.short}
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.6)', padding:4, flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <SBadge status={emp.status === 'aktiv' ? 'valid' : 'expired'} />
            <span style={{ fontSize:11, padding:'3px 9px', borderRadius:99, background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)' }}>{emp.department}</span>
          </div>
        </div>

        <div style={{ display:'flex', borderBottom:'1px solid var(--border-1)', background:'var(--color-parchment)', flexShrink:0, overflowX:'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding:'11px 14px', border:'none', background:activeTab===t.id ? 'var(--color-ivory)' : 'transparent',
              fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer',
              color: activeTab===t.id ? 'var(--fg-1)' : 'var(--fg-3)',
              borderBottom: activeTab===t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              whiteSpace:'nowrap',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
          {activeTab === 'stammdaten' && (
            <div style={{ display:'grid', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  ['firstName','Vorname'], ['lastName','Nachname'], ['personalNr','Personalnummer'],
                  ['company','Firma'], ['department','Abteilung'], ['position','Position'],
                  ['employeeGroup','Mitarbeitergruppe','select',['Gewerblich','Angestellt','Azubi','Praktikant']],
                  ['workload','Arbeitszeit','select',['Vollzeit','Teilzeit']],
                  ['status','Status','select',['Aktiv','Inaktiv']],
                  ['entry','Eintritt'], ['email','E-Mail'], ['phone','Telefon'], ['password','Passwort'],
                ].map(([key, label, type, options]) => (
                  <label key={key} style={{ display:'grid', gap:5 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' }}>{label}</span>
                    {type === 'select'
                      ? <select value={form[key]} onChange={e => setField(key, e.target.value)} style={selectInput}>
                          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      : <input type={key === 'password' ? 'password' : 'text'} value={form[key]} onChange={e => setField(key, e.target.value)} style={fieldInput} />}
                  </label>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8, borderTop:'1px solid var(--border-1)', paddingTop:14 }}>
                <button className="btn btn--ghost">Abbrechen</button>
                <button className="btn btn--primary">Speichern</button>
              </div>
            </div>
          )}

          {activeTab === 'zertifikate' && (
            <SimpleTable
              columns={[{key:'name',label:'Zertifikat',w:'1.4fr'},{key:'status',label:'Status',w:'0.8fr'},{key:'action',label:'Download',w:'auto'}]}
              rows={matrixTrainings.map(t => {
                const c = certs[t.id];
                const status = c?.status || 'missing';
                return { id:t.id, name:<strong>{t.name}</strong>, status:<SBadge status={status} />, action:c ? <DownloadBtn /> : <span style={{ color:'var(--fg-3)' }}>-</span> };
              })}
            />
          )}

          {activeTab === 'unterweisungen' && (
            <SimpleTable
              columns={[{key:'name',label:'Unterweisung',w:'1.4fr'},{key:'status',label:'Status',w:'0.8fr'},{key:'action',label:'Download',w:'auto'}]}
              rows={(myInstructions.length ? myInstructions : [{ id:'empty', title:'Keine Unterweisung', participants:[] }]).map(u => {
                const my = u.participants?.find(p => p.emp === emp.id);
                return { id:u.id, name:<strong>{u.title}</strong>, status:<SBadge status={my?.signed ? 'signed' : (u.id === 'empty' ? 'missing' : 'warn')} />, action:u.id === 'empty' ? <span style={{ color:'var(--fg-3)' }}>-</span> : <DownloadBtn label="PDF" /> };
              })}
            />
          )}

          {activeTab === 'fuehrerschein' && (
            <SimpleTable
              columns={[{key:'type',label:'Klasse',w:'0.7fr'},{key:'origin',label:'Herkunft',w:'0.9fr'},{key:'next',label:'Nächste Kontrolle',w:'1fr'},{key:'status',label:'Status',w:'0.8fr'},{key:'action',label:'Download',w:'auto'}]}
              rows={licenseRows.map(l => ({ id:l.id, type:<strong>{l.type}</strong>, origin:l.origin, next:l.next, status:<SBadge status={l.status} />, action:<DownloadBtn label="PDF" /> }))}
            />
          )}

          {activeTab === 'untersuchung' && (
            <SimpleTable
              columns={[{key:'name',label:'Untersuchung',w:'1.2fr'},{key:'last',label:'Letzte',w:'0.8fr'},{key:'next',label:'Nächste',w:'0.8fr'},{key:'status',label:'Status',w:'0.8fr'},{key:'action',label:'Download',w:'auto'}]}
              rows={healthChecks.map(h => ({ id:h.id, name:<strong>{h.name}</strong>, last:h.lastCheck, next:h.nextCheck, status:<SBadge status={h.status} />, action:<DownloadBtn label="PDF" /> }))}
            />
          )}
        </div>
      </div>
    </>
  );
}

function NewEmployeeModal({ onClose }) {
  const [step, setStep] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [form, setForm] = React.useState({
    vorname:'', nachname:'', pn:'', firma:'c1', abteilung:'', position:'',
    gruppe:'Gewerblich', beschaeftigung:'Festangestellt', arbeitszeit:'Vollzeit', wochenstunden:'40',
    eintritt:'2026-07-14', status:'Aktiv', fuehrungskraft:'Christian Janning', standort:'Nordhorn',
    telefon:'', email:'', adresse:'',
    kontoErstellen:true, benutzername:'', rolle:'Mitarbeiter', zugriffFirma:'c1', kontostatus:'Aktiv',
    loginLink:true, profilbild:'', beschreibung:'',
  });

  const steps = ['Persönliche Daten','Beschäftigung','Kontaktdaten','Systemzugang','Abschluss'];
  const positions = ['Polier','Bauleiter','Facharbeiter','Baumaschinist','KFZ-Mechaniker','QGIS-Expertin','Kaufm. Angestellte:r','Auszubildende:r','Fahrer'];
  const managers = ['Christian Janning','Sabine Janning','Alexander Petersen','Michael Janning','Thomas Janning'];
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const requiredByStep = [
    ['vorname','nachname','pn'],
    ['firma','abteilung','position','gruppe','beschaeftigung','arbeitszeit','wochenstunden','eintritt','status','fuehrungskraft','standort'],
    [],
    form.kontoErstellen ? ['email','benutzername','rolle','zugriffFirma','kontostatus'] : [],
    [],
  ];
  const canContinue = requiredByStep[step].every(key => String(form[key] || '').trim());
  const next = () => {
    if (step < steps.length - 1 && canContinue) setStep(step + 1);
  };
  const create = () => {
    if (!confirm) return;
    setSaved(true);
  };

  const Field = ({ label, required, children }) => (
    <label className="employee-wizard-field">
      <span>{label}{required && <b>*</b>}</span>
      {children}
    </label>
  );
  const Input = ({ value, onChange, placeholder, type='text' }) => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} />
  );
  const Select = ({ value, onChange, children }) => (
    <select value={value} onChange={e => onChange(e.target.value)}>{children}</select>
  );

  if (saved) {
    return (
      <div className="employee-wizard-backdrop" onClick={onClose}>
        <div className="employee-wizard employee-wizard--success" onClick={e => e.stopPropagation()}>
          <button type="button" className="employee-wizard-close" onClick={onClose}><Icon name="x" size={18} /></button>
          <div className="employee-wizard-success-icon"><Icon name="check" size={28} /></div>
          <h2>Mitarbeiter erstellt</h2>
          <p>{form.vorname || 'Neuer'} {form.nachname || 'Mitarbeiter'} wurde als Entwurf angelegt. Der Login-Link kann anschließend versendet werden.</p>
          <div className="employee-wizard-next-actions">
            <button type="button" className="btn btn--primary" onClick={onClose}>Zur Mitarbeiterliste</button>
            <button type="button" className="btn btn--ghost">Profil öffnen</button>
            <button type="button" className="btn btn--ghost">Weitere Person anlegen</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-wizard-backdrop" onClick={onClose}>
      <section className="employee-wizard" onClick={e => e.stopPropagation()}>
        <header className="employee-wizard-head">
          <div>
            <span>Neuer Mitarbeiter</span>
            <h2>Mitarbeiter erstellen</h2>
          </div>
          <button type="button" className="employee-wizard-close" onClick={onClose}><Icon name="x" size={18} /></button>
        </header>

        <nav className="employee-wizard-steps">
          {steps.map((label, index) => (
            <button key={label} type="button" className={index === step ? 'is-active' : index < step ? 'is-done' : ''} onClick={() => setStep(index)}>
              <span>{index + 1}</span>{label}
            </button>
          ))}
        </nav>

        <div className="employee-wizard-body">
          {step === 0 && (
            <div className="employee-wizard-grid">
              <Field label="Vorname" required><Input value={form.vorname} onChange={v => set('vorname', v)} /></Field>
              <Field label="Nachname" required><Input value={form.nachname} onChange={v => set('nachname', v)} /></Field>
              <Field label="Personalnummer" required><Input value={form.pn} onChange={v => set('pn', v)} placeholder="z. B. 2044" /></Field>
              <Field label="Profilbild"><Input value={form.profilbild} onChange={v => set('profilbild', v)} placeholder="Datei auswählen" /></Field>
              <Field label="Beschreibung"><textarea value={form.beschreibung} onChange={e => set('beschreibung', e.target.value)} /></Field>
            </div>
          )}

          {step === 1 && (
            <div className="employee-wizard-grid">
              <Field label="Firma" required>
                <Select value={form.firma} onChange={v => { set('firma', v); set('zugriffFirma', v); }}>
                  {window.SEED.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Abteilung" required>
                <Select value={form.abteilung} onChange={v => set('abteilung', v)}>
                  <option value="">Bitte auswählen</option>
                  {window.SEED.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Position" required>
                <Select value={form.position} onChange={v => set('position', v)}>
                  <option value="">Bitte auswählen</option>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </Field>
              <Field label="Mitarbeitergruppe" required>
                <Select value={form.gruppe} onChange={v => set('gruppe', v)}>
                  <option>Angestellte</option><option>Gewerbliche Mitarbeiter</option><option>Azubis</option><option>Geschäftsführer</option>
                </Select>
              </Field>
              <Field label="Beschäftigungsart" required>
                <Select value={form.beschaeftigung} onChange={v => set('beschaeftigung', v)}>
                  <option>Festangestellt</option><option>Befristet</option><option>Ausbildung</option><option>Praktikum</option><option>Aushilfe</option>
                </Select>
              </Field>
              <Field label="Vollzeit / Teilzeit" required>
                <Select value={form.arbeitszeit} onChange={v => set('arbeitszeit', v)}>
                  <option>Vollzeit</option><option>Teilzeit</option><option>Minijob</option>
                </Select>
              </Field>
              <Field label="Wochenarbeitszeit" required><Input value={form.wochenstunden} onChange={v => set('wochenstunden', v)} placeholder="40" /></Field>
              <Field label="Eintrittsdatum" required><Input type="date" value={form.eintritt} onChange={v => set('eintritt', v)} /></Field>
              <Field label="Personalstatus" required>
                <Select value={form.status} onChange={v => set('status', v)}><option>Aktiv</option><option>Inaktiv</option><option>In Vorbereitung</option><option>Archiviert</option></Select>
              </Field>
              <Field label="Direkte Führungskraft" required>
                <Select value={form.fuehrungskraft} onChange={v => set('fuehrungskraft', v)}>
                  {managers.map(m => <option key={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Standort" required>
                <Select value={form.standort} onChange={v => set('standort', v)}>
                  <option>Nordhorn</option><option>Gronau</option><option>Lingen</option><option>Meppen</option><option>Baustelle</option>
                </Select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="employee-wizard-grid">
              <Field label="Telefon"><Input value={form.telefon} onChange={v => set('telefon', v)} placeholder="+49 ..." /></Field>
              <Field label="Geschäftliche E-Mail"><Input value={form.email} onChange={v => set('email', v)} placeholder="vorname.nachname@janning-gruppe.de" /></Field>
              <Field label="Adresse"><textarea value={form.adresse} onChange={e => set('adresse', e.target.value)} /></Field>
            </div>
          )}

          {step === 3 && (
            <div className="employee-wizard-grid">
              <label className="employee-wizard-switch">
                <input type="checkbox" checked={form.kontoErstellen} onChange={e => set('kontoErstellen', e.target.checked)} />
                <span>Benutzerkonto erstellen</span>
              </label>
              {form.kontoErstellen && (
                <>
                  <Field label="Geschäftliche E-Mail" required><Input value={form.email} onChange={v => set('email', v)} /></Field>
                  <Field label="Benutzername" required><Input value={form.benutzername} onChange={v => set('benutzername', v)} placeholder="vorname.nachname" /></Field>
                  <Field label="Benutzerrolle" required>
                    <Select value={form.rolle} onChange={v => set('rolle', v)}>
                      <option>Mitarbeiter</option><option>Bauleiter</option><option>Verwaltung</option><option>Geschäftsführer</option><option>Admin</option>
                    </Select>
                  </Field>
                  <Field label="Zugriff auf Firma" required>
                    <Select value={form.zugriffFirma} onChange={v => set('zugriffFirma', v)}>
                      {window.SEED.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Kontostatus" required>
                    <Select value={form.kontostatus} onChange={v => set('kontostatus', v)}><option>Aktiv</option><option>Gesperrt</option><option>Einladung ausstehend</option></Select>
                  </Field>
                  <label className="employee-wizard-switch">
                    <input type="checkbox" checked={form.loginLink} onChange={e => set('loginLink', e.target.checked)} />
                    <span>Login-Link nach Erstellung senden. Kein Passwort durch Admin vergeben.</span>
                  </label>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="employee-wizard-summary">
              <h3>Zusammenfassung</h3>
              <dl>
                <div><dt>Name</dt><dd>{form.vorname || '-'} {form.nachname || ''}</dd></div>
                <div><dt>Personalnummer</dt><dd>{form.pn || '-'}</dd></div>
                <div><dt>Firma</dt><dd>{window.company(form.firma)?.name || '-'}</dd></div>
                <div><dt>Position</dt><dd>{form.position || '-'}</dd></div>
                <div><dt>Gruppe</dt><dd>{form.gruppe}</dd></div>
                <div><dt>Systemzugang</dt><dd>{form.kontoErstellen ? `${form.rolle}, ${form.kontostatus}` : 'Kein Konto'}</dd></div>
              </dl>
              <label className="employee-wizard-confirm">
                <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} />
                <span>Ich habe die Angaben geprüft und möchte den Mitarbeiter erstellen.</span>
              </label>
            </div>
          )}
        </div>

        <footer className="employee-wizard-foot">
          <button type="button" className="btn btn--ghost" onClick={step === 0 ? onClose : () => setStep(step - 1)}>{step === 0 ? 'Abbrechen' : 'Zurück'}</button>
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn--primary" disabled={!canContinue} onClick={next}>Weiter</button>
          ) : (
            <button type="button" className="btn btn--primary" disabled={!confirm} onClick={create}>Mitarbeiter erstellen</button>
          )}
        </footer>
      </section>
    </div>
  );
}

function TrainingsView({ initialTrainingId = null, onDetailChange = null } = {}) {
  const [selectedTraining, setSelectedTraining] = React.useState(null);
  const [categoryFilter, setCategoryFilter] = React.useState('Alle');
  const [statusFilter, setStatusFilter] = React.useState('alle'); // alle, fehlt, warnt, abgelaufen
  const [mandatoryFilter, setMandatoryFilter] = React.useState('alle'); // alle, pflicht, optional
  const [bulkSelectedEmps, setBulkSelectedEmps] = React.useState(new Set());
  const [trainingCreateOpen, setTrainingCreateOpen] = React.useState(false);
  const [trainingViewMode, setTrainingViewMode] = React.useState('cards');
  const [trainingSort, setTrainingSort] = React.useState({ key:'name', dir:'asc' });
  const [trainingColumnMenu, setTrainingColumnMenu] = React.useState(null);
  const [trainingColumnFilters, setTrainingColumnFilters] = React.useState({});
  const [trainingFilterPanel, setTrainingFilterPanel] = React.useState(null);
  const [trainingFilterSearch, setTrainingFilterSearch] = React.useState('');
  const [trainingGroupBy, setTrainingGroupBy] = React.useState('');
  const [selectedTrainingRows, setSelectedTrainingRows] = React.useState(new Set());
  const [trainingPlanTarget, setTrainingPlanTarget] = React.useState(null);

  React.useEffect(() => {
    if (initialTrainingId) {
      const initialTraining = window.SEED.trainings.find(t => t.id === initialTrainingId);
      if (initialTraining) {
        setSelectedTraining(initialTraining);
      }
    }
  }, [initialTrainingId]);

  React.useEffect(() => {
    if (window.__pendingTrainingId) {
      const pendingTraining = window.SEED.trainings.find(t => t.id === window.__pendingTrainingId);
      if (pendingTraining) setSelectedTraining(pendingTraining);
      window.__pendingTrainingId = null;
    }
    const handler = (e) => {
      const training = window.SEED.trainings.find(t => t.id === e.detail?.trainingId);
      if (training) setSelectedTraining(training);
    };
    window.addEventListener('navigate-to-training', handler);
    return () => window.removeEventListener('navigate-to-training', handler);
  }, []);

  React.useEffect(() => {
    if (onDetailChange) onDetailChange(!!selectedTraining);
  }, [selectedTraining, onDetailChange]);

  // Get all unique categories
  const categories = ['Alle', ...new Set(window.SEED.trainings.map(t => t.cat))];

  // Calculate status for each training
  const getTrainingStats = (trainId) => {
    const stats = { valid: 0, warn: 0, expired: 0, missing: 0 };
    window.SEED.employees.forEach(emp => {
      const cert = window.SEED.certs[emp.id]?.[trainId];
      const status = cert?.status || 'missing';
      stats[status === 'valid' ? 'valid' : status === 'warn' ? 'warn' : status === 'expired' ? 'expired' : 'missing']++;
    });
    return stats;
  };

  // Filter trainings
  let filtered = window.SEED.trainings;
  if (categoryFilter !== 'Alle') {
    filtered = filtered.filter(t => t.cat === categoryFilter);
  }
  if (mandatoryFilter === 'pflicht') {
    filtered = filtered.filter(t => t.mandatory);
  } else if (mandatoryFilter === 'optional') {
    filtered = filtered.filter(t => !t.mandatory);
  }
  const trainingColumns = [
    { key:'name', label:'Schulung' },
    { key:'cat', label:'Kategorie' },
    { key:'repeat', label:'Wiederholung' },
    { key:'status', label:'Status' },
    { key:'provider', label:'Anbieter' },
    { key:'desc', label:'Beschreibung' },
  ];
  const trainingValue = (training, key) => {
    const provider = window.provider(training.provider);
    if (key === 'repeat') return training.months ? (training.months === 12 ? 'Jährlich' : `alle ${Math.round(training.months / 12)} Jahre`) : '-';
    if (key === 'status') return training.mandatory ? 'Pflicht' : 'Optional';
    if (key === 'provider') return provider?.short || '-';
    return training[key] || '';
  };
  const toggleTrainingFilter = (key, value) => setTrainingColumnFilters(current => {
    const values = current[key] || [];
    return { ...current, [key]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
  });
  const openTrainingFilter = key => { setTrainingFilterPanel(key); setTrainingFilterSearch(''); setTrainingColumnMenu(null); };
  const clearTrainingFilter = key => setTrainingColumnFilters(current => ({ ...current, [key]:[] }));
  const visibleTrainingRows = [...filtered]
    .filter(training => Object.entries(trainingColumnFilters).every(([key, values]) => !values?.length || values.includes(String(trainingValue(training, key)))))
    .sort((a, b) => String(trainingValue(a, trainingSort.key)).localeCompare(String(trainingValue(b, trainingSort.key)), 'de', { numeric:true }) * (trainingSort.dir === 'asc' ? 1 : -1));
  const trainingFilterValues = key => Array.from(new Set(filtered.map(training => String(trainingValue(training, key))))).sort((a, b) => a.localeCompare(b, 'de', { numeric:true }));
  const visibleTrainingFilterValues = trainingFilterPanel
    ? trainingFilterValues(trainingFilterPanel).filter(value => value.toLowerCase().includes(trainingFilterSearch.toLowerCase()))
    : [];
  const trainingGroups = trainingGroupBy
    ? Array.from(visibleTrainingRows.reduce((map, row) => {
      const label = String(trainingValue(row, trainingGroupBy));
      map.set(label, [...(map.get(label) || []), row]);
      return map;
    }, new Map()).entries()).map(([label, rows]) => ({ label, rows }))
    : [{ label:null, rows:visibleTrainingRows }];
  const allVisibleTrainingSelected = visibleTrainingRows.length > 0 && visibleTrainingRows.every(row => selectedTrainingRows.has(row.id));
  const toggleTrainingRow = id => setSelectedTrainingRows(current => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAllTrainingRows = () => setSelectedTrainingRows(allVisibleTrainingSelected ? new Set() : new Set(visibleTrainingRows.map(row => row.id)));
  const CalendarEventModal = window.NewEventModal;

  if (selectedTraining) {
    return (
      <TrainingDetailPage
        training={selectedTraining}
        onBack={() => setSelectedTraining(null)}
        stats={getTrainingStats(selectedTraining.id)}
      />
    );
  }

  return (
    <div>
      <div className="training-control-row">
        <label><span>Kategorie</span><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></label>
        <label><span>Status</span><select value={mandatoryFilter} onChange={e => setMandatoryFilter(e.target.value)}><option value="alle">Alle</option><option value="pflicht">Pflicht</option><option value="optional">Optional</option></select></label>
        <label><span>Gruppieren</span><select value={trainingGroupBy} onChange={e => setTrainingGroupBy(e.target.value)}><option value="">Keine Gruppierung</option>{trainingColumns.map(column => <option key={column.key} value={column.key}>{column.label}</option>)}</select></label>
        <div className="training-control-row__spacer" />
        <div className="training-view-toggle" aria-label="Ansicht wechseln">
          <button type="button" className={trainingViewMode === 'cards' ? 'is-active' : ''} onClick={() => setTrainingViewMode('cards')}><Icon name="dashboard" size={15} />Kacheln</button>
          <button type="button" className={trainingViewMode === 'list' ? 'is-active' : ''} onClick={() => setTrainingViewMode('list')}><Icon name="matrix" size={15} />Liste</button>
        </div>
        <button className="btn btn--primary" onClick={() => setTrainingCreateOpen(true)}><Icon name="plus" size={14} />Schulung</button>
      </div>

      {/* Cards Grid */}
      {trainingViewMode === 'cards' ? <div className="grid-2" style={{gap:16}}>
        {filtered.map(t => {
          const stats = getTrainingStats(t.id);
          const total = stats.valid + stats.warn + stats.expired + stats.missing;
          const p = window.provider(t.provider);
          const isSelected = selectedTraining?.id === t.id;

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTraining(t)}
              className="card"
              style={{
                padding:20, display:'flex', flexDirection:'column', gap:12,
                cursor:'pointer', transition:'all 140ms',
                outline: isSelected ? '2px solid var(--color-accent)' : 'none',
                outlineOffset: isSelected ? -2 : 0,
                background: isSelected ? 'rgba(201,100,66,0.04)' : undefined,
              }}
            >
              {/* Header */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10.5, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:4}}>{t.cat}</div>
                  <div style={{fontFamily:'var(--font-serif)', fontSize:18, fontWeight:500, lineHeight:1.2}}>{t.name}</div>
                </div>
                {t.mandatory && <span className="badge badge--accent">Pflicht</span>}
              </div>

              {/* Description */}
              <div className="small muted" style={{lineHeight:1.5, minHeight:32}}>{t.desc}</div>

              {/* Stats Bar */}
              <div style={{
                display:'flex', gap:4, height:6, borderRadius:99, background:'var(--border-1)', overflow:'hidden', marginTop:4
              }}>
                {stats.valid > 0 && <div style={{ flex: stats.valid / total, background:'#3f7a4a' }} />}
                {stats.warn > 0 && <div style={{ flex: stats.warn / total, background:'#c89b3f' }} />}
                {stats.expired > 0 && <div style={{ flex: stats.expired / total, background:'#a13232' }} />}
                {stats.missing > 0 && <div style={{ flex: stats.missing / total, background:'#ddd' }} />}
              </div>

              {/* Legend */}
              <div style={{ display:'flex', gap:8, fontSize:11, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#3f7a4a' }} />
                  <span>{stats.valid} gültig</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#c89b3f' }} />
                  <span>{stats.warn} läuft ab</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#a13232' }} />
                  <span>{stats.expired} abgelaufen</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#ddd' }} />
                  <span>{stats.missing} fehlt</span>
                </div>
              </div>

              <div className="divider" style={{margin:'4px 0'}} />

              {/* Quick Info */}
              <div className="kv-grid" style={{gap:'10px 16px', fontSize:12}}>
                <div className="kv"><div className="kv__label">Gültigkeit</div><div className="kv__value">{t.months} Mo.</div></div>
                <div className="kv"><div className="kv__label">Anbieter</div><div className="kv__value">{p?.short || '-'}</div></div>
              </div>

              {/* Action Buttons */}
              <div style={{ display:'flex', gap:6, marginTop:6 }}>
                <button
                  className="btn btn--primary"
                  onClick={(event) => { event.stopPropagation(); setTrainingPlanTarget(t); }}
                  style={{ flex:1, fontSize:12, padding:'8px 10px', justifyContent:'center' }}
                >
                  <Icon name="cal" size={13} />Termin planen
                </button>
              </div>
            </div>
          );
        })}
      </div> : <React.Fragment>
        {selectedTrainingRows.size > 0 && <div className="training-bulk-bar">
          <strong>{selectedTrainingRows.size} ausgewählt</strong>
          <button type="button"><Icon name="download" size={14} />Export</button>
          <button type="button"><Icon name="edit" size={14} />Status ändern</button>
          <button type="button" className="is-danger"><Icon name="trash" size={14} />Löschen</button>
          <button type="button" className="is-clear" onClick={() => setSelectedTrainingRows(new Set())}><Icon name="x" size={14} /></button>
        </div>}
        <div className="training-list-table card">
          <table>
            <thead><tr>
              <th className="training-list-check"><input type="checkbox" checked={allVisibleTrainingSelected} onChange={toggleAllTrainingRows} /></th>
              {trainingColumns.map(column => <th key={column.key}>
                <button type="button" className="training-th-button" onClick={() => setTrainingColumnMenu(trainingColumnMenu === column.key ? null : column.key)}>
                  {column.label}<span>{trainingSort.key === column.key ? (trainingSort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
                </button>
                {trainingColumnMenu === column.key && <div className="training-column-menu">
                  <button type="button" onClick={() => { setTrainingSort({ key:column.key, dir:'asc' }); setTrainingColumnMenu(null); }}>A bis Z</button>
                  <button type="button" onClick={() => { setTrainingSort({ key:column.key, dir:'desc' }); setTrainingColumnMenu(null); }}>Z bis A</button>
                  <button type="button" className="is-filter" onClick={() => openTrainingFilter(column.key)}>Filtern nach</button>
                  <button type="button" onClick={() => { setTrainingGroupBy(trainingGroupBy === column.key ? '' : column.key); setTrainingSort({ key:column.key, dir:'asc' }); setTrainingColumnMenu(null); }}>Gruppieren nach "{column.label}"</button>
                </div>}
              </th>)}
            </tr></thead>
            <tbody>
              {trainingGroups.map(group => <React.Fragment key={group.label || 'all'}>
                {group.label && <tr className="training-group-row"><td colSpan={trainingColumns.length + 1}>{trainingColumns.find(column => column.key === trainingGroupBy)?.label}: {group.label} <span>{group.rows.length}</span></td></tr>}
                {group.rows.map(t => <tr key={t.id} className={selectedTrainingRows.has(t.id) ? 'is-selected' : ''} onClick={() => setSelectedTraining(t)}>
                  <td className="training-list-check" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedTrainingRows.has(t.id)} onChange={() => toggleTrainingRow(t.id)} /></td>
                  {trainingColumns.map(column => <td key={column.key}>{column.key === 'name' ? <strong>{trainingValue(t, column.key)}</strong> : column.key === 'status' ? (t.mandatory ? <span className="badge badge--accent">Pflicht</span> : <span className="badge">Optional</span>) : trainingValue(t, column.key)}</td>)}
                </tr>)}
              </React.Fragment>)}
            </tbody>
          </table>
        </div>
      </React.Fragment>}

      {trainingFilterPanel && <div className="training-filter-backdrop" onClick={() => setTrainingFilterPanel(null)}>
        <aside className="training-filter-panel" onClick={event => event.stopPropagation()}>
          <header>
            <h2>Filtern nach "{trainingColumns.find(column => column.key === trainingFilterPanel)?.label}"</h2>
            <button type="button" className="btn btn--ghost" onClick={() => setTrainingFilterPanel(null)}><Icon name="x" size={18} /></button>
          </header>
          <main>
            <input value={trainingFilterSearch} onChange={event => setTrainingFilterSearch(event.target.value)} placeholder="Text eingeben, um Filter zu finden" />
            <div>
              {visibleTrainingFilterValues.map(value => <label key={value}><input type="checkbox" checked={(trainingColumnFilters[trainingFilterPanel] || []).includes(value)} onChange={() => toggleTrainingFilter(trainingFilterPanel, value)} /><span>{value}</span></label>)}
            </div>
          </main>
          <footer>
            <button type="button" className="btn btn--primary" onClick={() => setTrainingFilterPanel(null)} disabled={!(trainingColumnFilters[trainingFilterPanel] || []).length}>Anwenden</button>
            <button type="button" className="btn btn--ghost" onClick={() => clearTrainingFilter(trainingFilterPanel)}>Auswahl aufheben</button>
          </footer>
        </aside>
      </div>}
      {trainingPlanTarget && CalendarEventModal && (
        <CalendarEventModal
          onClose={() => setTrainingPlanTarget(null)}
          selectedTraining={trainingPlanTarget.id}
        />
      )}
      {trainingCreateOpen && <TrainingCreateModal onClose={() => setTrainingCreateOpen(false)} />}
    </div>
  );
}

function TrainingCreateModal({ onClose }) {
  const categories = ['Sicherheit', 'SCC', 'DVGW', 'Fahrerlaubnis', 'Unterweisung', 'Sicherheit / Verkehr'];
  const providers = window.SEED.providers || [];
  return <div className="training-create-backdrop" onClick={onClose}>
    <section className="training-create-modal" onClick={event => event.stopPropagation()}>
      <header>
        <div>
          <span>Neue Schulung</span>
          <h2>Schulung anlegen</h2>
        </div>
        <button type="button" onClick={onClose} title="Schliessen"><Icon name="x" size={16} /></button>
      </header>
      <div className="training-create-form">
        <label><span>Name Schulung</span><input placeholder="z.B. Erste Hilfe Auffrischung" /></label>
        <label><span>Kategorie</span><select defaultValue="Sicherheit">{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
        <label><span>Status</span><select defaultValue="pflicht"><option value="pflicht">Pflicht</option><option value="optional">Optional</option></select></label>
        <label><span>Wiederholung</span><select defaultValue="1">{Array.from({ length:10 }, (_, index) => index + 1).map(year => <option key={year} value={year}>{year === 1 ? 'Jährlich' : `alle ${year} Jahre`}</option>)}</select></label>
        <label><span>Anbieter</span><select defaultValue=""><option value="">Anbieter auswählen</option>{providers.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label>
        <label className="is-wide"><span>Beschreibung</span><textarea placeholder="Kurze Beschreibung der Schulung..." /></label>
      </div>
      <footer>
        <button className="btn btn--ghost" type="button" onClick={onClose}>Abbrechen</button>
        <button className="btn btn--primary" type="button" onClick={onClose}>Speichern</button>
      </footer>
    </section>
  </div>;
}

function TrainingDetailPage({ training, onBack, stats, employees }) {
  const p = window.provider(training.provider);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedEnrollId, setSelectedEnrollId] = React.useState(null);
  const [enrollNotice, setEnrollNotice] = React.useState('');
  const [participantSort, setParticipantSort] = React.useState({ col:'status', dir:'asc' });
  const [participantMenu, setParticipantMenu] = React.useState(null);
  const [participantFilterPanel, setParticipantFilterPanel] = React.useState(null);
  const [participantFilterSearch, setParticipantFilterSearch] = React.useState('');
  const [participantFilters, setParticipantFilters] = React.useState({});
  const [participantGroupBy, setParticipantGroupBy] = React.useState('');
  const panelEmployees = employees || window.SEED.employees;

  const statusCfg = {
    valid:   { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Gültig' },
    warn:    { color:'#8a6a1f', bg:'#faf3de', border:'#ece0bc', label:'Läuft ab' },
    expired: { color:'#a13232', bg:'#fbecea', border:'#eac8c2', label:'Abgelaufen' },
    missing: { color:'#6b6256', bg:'#f4f4f2', border:'#ddd', label:'Fehlt' },
  };

  const empList = panelEmployees.map(emp => ({
    emp,
    cert: window.SEED.certs[emp.id]?.[training.id],
    status: window.SEED.certs[emp.id]?.[training.id]?.status || 'missing'
  })).sort((a, b) => {
    const order = { valid: 0, warn: 1, expired: 2, missing: 3 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const baseParticipantList = statusFilter === 'all' ? empList : empList.filter(item => item.status === statusFilter);
  const participantColumns = [
    { key:'employee', label:'Mitarbeiter', value:item => item.emp.name },
    { key:'company', label:'Firma', value:item => window.company(item.emp.company)?.short || item.emp.company },
    { key:'position', label:'Position', value:item => item.emp.position },
    { key:'pn', label:'PN', value:item => 'PN ' + item.emp.personalNr },
    { key:'status', label:'Status', value:item => statusCfg[item.status]?.label || item.status },
    { key:'document', label:'Dokument', value:item => item.cert?.file || '-' },
  ];
  const participantColumn = key => participantColumns.find(col => col.key === key);
  const participantValue = (item, key) => participantColumn(key)?.value(item) ?? '';
  const filteredEmpList = [...baseParticipantList]
    .filter(item => Object.entries(participantFilters).every(([key, values]) => !values?.length || values.includes(participantValue(item, key))))
    .sort((a, b) => {
      const va = participantValue(a, participantSort.col);
      const vb = participantValue(b, participantSort.col);
      const cmp = String(va).localeCompare(String(vb), 'de', { numeric:true });
      return participantSort.dir === 'asc' ? cmp : -cmp;
    });
  const selectedEnroll = filteredEmpList.find(item => item.emp.id === selectedEnrollId);
  const canEnrollSelected = selectedEnroll && ['warn', 'expired', 'missing'].includes(selectedEnroll.status);
  const repeatText = training.months ? (training.months === 12 ? 'jährlich' : `alle ${Math.round(training.months / 12)} Jahre`) : '-';

  const selectTrainingStatus = (status) => {
    setStatusFilter(statusFilter === status ? 'all' : status);
    setSelectedEnrollId(null);
    setEnrollNotice('');
  };

  const chooseParticipant = (item) => {
    if (!['warn', 'expired', 'missing'].includes(item.status)) return;
    setSelectedEnrollId(item.emp.id);
    setEnrollNotice('');
  };

  const enrollSelected = () => {
    if (!canEnrollSelected) return;
    setEnrollNotice(`${selectedEnroll.emp.name} wurde fuer ${training.short} zur Anmeldung vorgemerkt.`);
  };

  const StatusBadge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.missing;
    return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px', borderRadius:999, fontSize:10.5, fontWeight:700, background:s.bg, border:'1px solid '+s.border, color:s.color }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.color }} />{s.label}
    </span>;
  };
  const participantFilterValues = key => Array.from(new Set(baseParticipantList.map(item => participantValue(item, key)))).sort((a, b) => String(a).localeCompare(String(b), 'de', { numeric:true }));
  const toggleParticipantFilter = (key, value) => {
    setParticipantFilters(current => {
      const selected = current[key] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      const copy = { ...current };
      if (next.length) copy[key] = next; else delete copy[key];
      return copy;
    });
  };
  const groupedParticipantRows = participantGroupBy
    ? participantFilterValues(participantGroupBy).map(value => ({ value, rows: filteredEmpList.filter(item => participantValue(item, participantGroupBy) === value) })).filter(group => group.rows.length)
    : [{ value:'', rows:filteredEmpList }];
  const ParticipantHeader = ({ col }) => {
    const active = participantSort.col === col.key || participantFilters[col.key]?.length || participantGroupBy === col.key;
    return <th style={{ position:'relative' }}>
      <button type="button" onClick={() => setParticipantMenu(participantMenu === col.key ? null : col.key)} style={{ display:'inline-flex', alignItems:'center', gap:5, border:0, background:'transparent', color:active ? 'var(--fg-1)' : 'var(--fg-3)', font:'inherit', fontWeight:active ? 800 : 700, cursor:'pointer', padding:0 }}>
        <span>{col.label}</span>
        <span style={{ fontSize:10 }}>{participantSort.col === col.key ? (participantSort.dir === 'asc' ? 'A-Z' : 'Z-A') : 'v'}</span>
      </button>
      {participantMenu === col.key && <div style={{ position:'absolute', top:'100%', left:0, zIndex:80, minWidth:250, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 14px 34px rgba(0,0,0,.16)', borderRadius:4, overflow:'hidden', textTransform:'none', letterSpacing:0, color:'var(--fg-1)', fontWeight:400 }}>
        <button type="button" onClick={() => { setParticipantSort({ col:col.key, dir:'asc' }); setParticipantMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
        <button type="button" onClick={() => { setParticipantSort({ col:col.key, dir:'desc' }); setParticipantMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
        <button type="button" onClick={() => { setParticipantFilterPanel(col.key); setParticipantFilterSearch(''); setParticipantMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
        <button type="button" onClick={() => { setParticipantGroupBy(participantGroupBy === col.key ? '' : col.key); setParticipantSort({ col:col.key, dir:'asc' }); setParticipantMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
      </div>}
    </th>;
  };

  const FieldCard = ({ icon, label, value }) => (
    <div style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 16px', border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)' }}>
      <Icon name={icon} size={18} />
      <div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.35, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:4 }}>{label}</div>
        <strong style={{ fontSize:14.5 }}>{value}</strong>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 0 14px', marginBottom:16, borderBottom:'1px solid var(--border-1)' }}>
        <button onClick={onBack} title="Zurueck" style={{ width:34, height:34, borderRadius:999, border:'1px solid var(--border-1)', background:'var(--color-white)', display:'grid', placeItems:'center', cursor:'pointer', color:'var(--fg-1)' }}><Icon name="chevL" size={16} /></button>
        <h1 style={{ margin:0, fontFamily:'var(--font-serif)', fontSize:24, fontWeight:500, lineHeight:1.15 }}>{training.name}</h1>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button className="btn btn--ghost" style={{ padding:'7px 10px', fontSize:12 }}><Icon name="edit" size={13} />Alle bearbeiten</button>
          <button className="btn btn--ghost is-danger" style={{ padding:'7px 10px', fontSize:12 }}><Icon name="trash" size={13} />Löschen</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(0, 1fr))', gap:10, marginBottom:14 }}>
        <FieldCard icon="cap" label="Zertifikat / Schulung" value={training.name} />
        <FieldCard icon="cal" label="Gültigkeit" value={`${training.months} Monate`} />
        <FieldCard icon="history" label="Wiederholung" value={repeatText} />
        <FieldCard icon="shield" label="Status" value={training.mandatory ? 'Pflicht' : 'Optional'} />
        <FieldCard icon="doc" label="Beschreibung" value={training.desc} />
      </div>

      <section className="card" style={{ padding:18, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <Icon name="building" size={18} />
          <h2 style={{ margin:0, fontFamily:'var(--font-serif)', fontSize:18 }}>Anbieter</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(0, 1fr))', gap:10 }}>
          <FieldCard icon="building" label="Name Anbieter" value={p?.name || '-'} />
          <FieldCard icon="users" label="Kontakt" value={p?.contact || '-'} />
          <FieldCard icon="phone" label="Telefon" value={p?.phone || '-'} />
          <FieldCard icon="mail" label="E-Mail" value={p?.email || '-'} />
          <FieldCard icon="pin" label="Adresse" value={p?.address || '-'} />
        </div>
      </section>

      <section className="card" style={{ padding:18, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 }}>
          <div>
            <h2 style={{ margin:'0 0 3px', fontFamily:'var(--font-serif)', fontSize:18 }}>Status ({panelEmployees.length} Mitarbeiter)</h2>
            <p className="muted small" style={{ margin:0 }}>Klicken zum Filtern nach Status.</p>
          </div>
          {statusFilter !== 'all' && <button type="button" className="btn btn--ghost" onClick={() => selectTrainingStatus(statusFilter)}>Alle anzeigen</button>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            ['valid', 'Gültig', stats.valid],
            ['warn', 'Läuft ab', stats.warn],
            ['expired', 'Abgelaufen', stats.expired],
            ['missing', 'Fehlt', stats.missing],
          ].map(([key, label, value]) => {
            const cfg = statusCfg[key];
            return <button key={key} type="button" onClick={() => selectTrainingStatus(key)} style={{ textAlign:'left', padding:'12px 14px', borderRadius:9, background:cfg.bg, border:'1px solid '+cfg.border, boxShadow: statusFilter === key ? 'inset 0 0 0 2px '+cfg.color : 'none', cursor:'pointer', font:'inherit' }}>
              <div style={{ fontSize:10, fontWeight:700, color:cfg.color, textTransform:'uppercase', marginBottom:6 }}>{label}</div>
              <strong style={{ fontFamily:'var(--font-serif)', fontSize:24, color:cfg.color }}>{value}</strong>
            </button>;
          })}
        </div>
      </section>

      <section className="card" style={{ padding:18 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 }}>
          <div>
            <h2 style={{ margin:'0 0 3px', fontFamily:'var(--font-serif)', fontSize:18 }}>Teilnehmer</h2>
            <p className="muted small" style={{ margin:0 }}>{filteredEmpList.length} Einträge</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn--primary" disabled={!canEnrollSelected} onClick={enrollSelected} style={{ opacity:canEnrollSelected ? 1 : 0.45, padding:'7px 10px', fontSize:12 }}>
              {canEnrollSelected ? `${selectedEnroll.emp.firstName} anmelden` : 'Teilnehmer wählen'}
            </button>
            <button className="btn btn--ghost" style={{ padding:'7px 10px', fontSize:12 }}>Bearbeiten</button>
          </div>
        </div>
        {(Object.keys(participantFilters).length > 0 || participantGroupBy) && (
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:12 }}>
            {Object.entries(participantFilters).map(([key, values]) => values.map(value => (
              <span key={key + value} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 9px', borderRadius:999, background:'var(--color-parchment)', color:'var(--fg-1)', fontSize:12 }}>
                <span style={{ color:'var(--fg-3)' }}>{participantColumn(key)?.label}:</span>{String(value)}
                <button type="button" onClick={() => toggleParticipantFilter(key, value)} style={{ border:0, background:'transparent', padding:0, cursor:'pointer', display:'inline-flex' }}><Icon name="x" size={13} /></button>
              </span>
            )))}
            {participantGroupBy && <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 9px', borderRadius:999, background:'var(--color-parchment)', color:'var(--fg-1)', fontSize:12 }}>Gruppiert nach {participantColumn(participantGroupBy)?.label}<button type="button" onClick={() => setParticipantGroupBy('')} style={{ border:0, background:'transparent', padding:0, cursor:'pointer', display:'inline-flex' }}><Icon name="x" size={13} /></button></span>}
            <button type="button" className="btn btn--ghost" onClick={() => { setParticipantFilters({}); setParticipantGroupBy(''); }} style={{ padding:'6px 9px', fontSize:12 }}>Zurücksetzen</button>
          </div>
        )}
        <div className="training-list-table">
          <table>
            <thead>
              <tr>
                {participantColumns.map(col => <ParticipantHeader key={col.key} col={col} />)}
              </tr>
            </thead>
            <tbody>
              {groupedParticipantRows.map(group => <React.Fragment key={group.value || 'all'}>
                {participantGroupBy && <tr><td colSpan={participantColumns.length} style={{ background:'var(--color-parchment)', color:'var(--fg-2)', fontSize:12, fontWeight:800, padding:'9px 14px' }}>{participantColumn(participantGroupBy)?.label}: {group.value}</td></tr>}
                {group.rows.map(item => {
                  const canEnroll = ['warn', 'expired', 'missing'].includes(item.status);
                  const selected = selectedEnrollId === item.emp.id;
                  return <tr key={item.emp.id} onClick={() => chooseParticipant(item)} style={{ cursor:canEnroll ? 'pointer' : 'default', background:selected ? 'var(--color-parchment)' : undefined }}>
                    <td><strong>{item.emp.name}</strong><div className="small muted">{item.emp.email}</div></td>
                    <td>{window.company(item.emp.company)?.short || item.emp.company}</td>
                    <td>{item.emp.position}</td>
                    <td>PN {item.emp.personalNr}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.cert?.file || '-'}</td>
                  </tr>;
                })}
              </React.Fragment>)}
            </tbody>
          </table>
        </div>
        {enrollNotice && (
          <div style={{ marginTop:12, padding:'10px 12px', borderRadius:8, background:'#eff5ed', border:'1px solid #cde1cf', color:'#3f7a4a', fontWeight:700 }}>
            {enrollNotice}
          </div>
        )}
        {participantFilterPanel && (
          <div style={{ position:'fixed', inset:0, zIndex:3200, background:'rgba(0,0,0,.14)', display:'flex', justifyContent:'flex-end' }} onClick={() => setParticipantFilterPanel(null)}>
            <aside style={{ width:360, maxWidth:'92vw', height:'100%', background:'var(--color-white)', boxShadow:'-18px 0 42px rgba(0,0,0,.18)', display:'flex', flexDirection:'column' }} onClick={event => event.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'22px 24px 12px' }}>
                <h2 style={{ margin:0, fontFamily:'var(--font-serif)', fontSize:22, fontWeight:500 }}>Filtern nach {participantColumn(participantFilterPanel)?.label}</h2>
                <button type="button" className="icon-btn" onClick={() => setParticipantFilterPanel(null)}><Icon name="x" size={18} /></button>
              </div>
              <div style={{ padding:'8px 24px 14px' }}>
                <input value={participantFilterSearch} onChange={event => setParticipantFilterSearch(event.target.value)} placeholder="Filter suchen..." style={{ width:'100%', boxSizing:'border-box', height:38, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 11px', font:'inherit' }} />
              </div>
              <div style={{ flex:1, overflow:'auto', padding:'4px 24px 16px' }}>
                {participantFilterValues(participantFilterPanel).filter(value => String(value).toLowerCase().includes(participantFilterSearch.toLowerCase())).map(value => (
                  <label key={String(value)} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', cursor:'pointer', color:'var(--fg-1)', fontSize:14 }}>
                    <input type="checkbox" checked={(participantFilters[participantFilterPanel] || []).includes(value)} onChange={() => toggleParticipantFilter(participantFilterPanel, value)} style={{ width:16, height:16, accentColor:'var(--color-accent)' }} />
                    <span>{String(value)}</span>
                  </label>
                ))}
              </div>
              <footer style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'14px 24px', borderTop:'1px solid var(--border-1)' }}>
                <button type="button" className="btn btn--ghost" onClick={() => { setParticipantFilters(current => { const copy = { ...current }; delete copy[participantFilterPanel]; return copy; }); }}>Zurücksetzen</button>
                <button type="button" className="btn btn--primary" onClick={() => setParticipantFilterPanel(null)}>Anwenden</button>
              </footer>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}

function TrainingDetailPanel({ training, onClose, stats, employees }) {
  const p = window.provider(training.provider);
  const total = stats.valid + stats.warn + stats.expired + stats.missing;
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedEnrollId, setSelectedEnrollId] = React.useState(null);
  const [enrollNotice, setEnrollNotice] = React.useState('');
  const panelEmployees = employees || window.SEED.employees;

  // Get employees with this training
  const empList = panelEmployees.map(emp => ({
    emp,
    cert: window.SEED.certs[emp.id]?.[training.id],
    status: window.SEED.certs[emp.id]?.[training.id]?.status || 'missing'
  })).sort((a, b) => {
    const order = { valid: 0, warn: 1, expired: 2, missing: 3 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const filteredEmpList = statusFilter === 'all' ? empList : empList.filter(item => item.status === statusFilter);
  const topEmps = filteredEmpList.slice(0, 10);
  const hasMore = filteredEmpList.length > 10;
  const selectedEnroll = filteredEmpList.find(item => item.emp.id === selectedEnrollId);
  const canEnrollSelected = selectedEnroll && ['warn', 'expired', 'missing'].includes(selectedEnroll.status);

  const statusCfg = {
    valid:   { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Gültig' },
    warn:    { color:'#8a6a1f', bg:'#faf3de', border:'#ece0bc', label:'Läuft ab' },
    expired: { color:'#a13232', bg:'#fbecea', border:'#eac8c2', label:'Abgelaufen' },
    missing: { color:'#999',    bg:'#f4f4f2', border:'#ddd',    label:'Fehlt' },
  };

  const SBadge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.missing;
    return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:500, background:s.bg, border:'1px solid '+s.border, color:s.color }}>
      <span style={{ width:4, height:4, borderRadius:'50%', background:s.color }} />{s.label}
    </span>;
  };

  const selectTrainingStatus = (status) => {
    setStatusFilter(statusFilter === status ? 'all' : status);
    setSelectedEnrollId(null);
    setEnrollNotice('');
  };

  const chooseParticipant = (item) => {
    if (!['warn', 'expired', 'missing'].includes(item.status)) return;
    setSelectedEnrollId(item.emp.id);
    setEnrollNotice('');
  };

  const enrollSelected = () => {
    if (!canEnrollSelected) return;
    setEnrollNotice(`${selectedEnroll.emp.name} wurde fuer ${training.short} zur Anmeldung vorgemerkt.`);
  };

  const panel = (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:4200, background:'rgba(20,20,19,0.35)', backdropFilter:'blur(1px)' }} />
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, zIndex:4210,
        width: 500, background:'var(--color-ivory)',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.16)',
        display:'flex', flexDirection:'column',
        animation:'slideInRight 220ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{ background:'var(--color-near-black)', color:'#fff', padding:'20px 22px 16px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:14 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:500, lineHeight:1.2 }}>{training.name}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)', marginTop:4 }}>
                {training.short} · {training.cat}
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {training.mandatory && <span style={{ fontSize:11, padding:'2px 9px', borderRadius:99, background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.9)', fontWeight:600 }}>Pflichtschulung</span>}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
          {/* Details */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--color-accent)', marginBottom:12, paddingBottom:6, borderBottom:'1px solid var(--border-1)' }}>Details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', marginBottom:4 }}>Gültigkeit</div>
                <div style={{ fontSize:14, fontWeight:500 }}>{training.months} Monate</div>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', marginBottom:4 }}>Wiederholung</div>
                <div style={{ fontSize:14, fontWeight:500 }}>alle {training.months} Monate</div>
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', marginBottom:4 }}>Beschreibung</div>
              <div style={{ fontSize:13, color:'var(--fg-2)', lineHeight:1.5 }}>{training.desc}</div>
            </div>
          </div>

          {/* Anbieter */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--color-accent)', marginBottom:12, paddingBottom:6, borderBottom:'1px solid var(--border-1)' }}>Anbieter</div>
            <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--color-white)', border:'1px solid var(--border-1)' }}>
              <div style={{ fontWeight:500, fontSize:13.5, marginBottom:6 }}>{p?.name}</div>
              <div style={{ fontSize:11, color:'var(--fg-3)', display:'flex', flexDirection:'column', gap:3 }}>
                <div>Adresse: {p?.address}</div>
                <div>Kontakt: {p?.contact}</div>
                <div>Telefon: {p?.phone}</div>
                <div>E-Mail: {p?.email}</div>
              </div>
            </div>
          </div>

          {/* Status Übersicht */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--color-accent)', marginBottom:12, paddingBottom:6, borderBottom:'1px solid var(--border-1)' }}>Status ({panelEmployees.length} Mitarbeiter)</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button type="button" onClick={() => selectTrainingStatus('valid')} style={{ textAlign:'left', padding:'12px 14px', borderRadius:10, background:'#eff5ed', border:'1px solid #cde1cf', boxShadow: statusFilter === 'valid' ? 'inset 0 0 0 2px #3f7a4a' : 'none', cursor:'pointer', font:'inherit' }}>
                <div style={{ fontSize:10, fontWeight:600, color:'#3f7a4a', textTransform:'uppercase', marginBottom:4 }}>Gültig</div>
                <div style={{ fontSize:18, fontWeight:600, color:'#3f7a4a' }}>{stats.valid}</div>
              </button>
              <button type="button" onClick={() => selectTrainingStatus('warn')} style={{ textAlign:'left', padding:'12px 14px', borderRadius:10, background:'#faf3de', border:'1px solid #ece0bc', boxShadow: statusFilter === 'warn' ? 'inset 0 0 0 2px #8a6a1f' : 'none', cursor:'pointer', font:'inherit' }}>
                <div style={{ fontSize:10, fontWeight:600, color:'#8a6a1f', textTransform:'uppercase', marginBottom:4 }}>Läuft ab</div>
                <div style={{ fontSize:18, fontWeight:600, color:'#8a6a1f' }}>{stats.warn}</div>
              </button>
              <button type="button" onClick={() => selectTrainingStatus('expired')} style={{ textAlign:'left', padding:'12px 14px', borderRadius:10, background:'#fbecea', border:'1px solid #eac8c2', boxShadow: statusFilter === 'expired' ? 'inset 0 0 0 2px #a13232' : 'none', cursor:'pointer', font:'inherit' }}>
                <div style={{ fontSize:10, fontWeight:600, color:'#a13232', textTransform:'uppercase', marginBottom:4 }}>Abgelaufen</div>
                <div style={{ fontSize:18, fontWeight:600, color:'#a13232' }}>{stats.expired}</div>
              </button>
              <button type="button" onClick={() => selectTrainingStatus('missing')} style={{ textAlign:'left', padding:'12px 14px', borderRadius:10, background:'#f4f4f2', border:'1px solid #ddd', boxShadow: statusFilter === 'missing' ? 'inset 0 0 0 2px #666' : 'none', cursor:'pointer', font:'inherit' }}>
                <div style={{ fontSize:10, fontWeight:600, color:'#666', textTransform:'uppercase', marginBottom:4 }}>Fehlt</div>
                <div style={{ fontSize:18, fontWeight:600, color:'#666' }}>{stats.missing}</div>
              </button>
            </div>
          </div>

          {/* Teilnehmer Liste */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, marginBottom:10, paddingBottom:6, borderBottom:'1px solid var(--border-1)' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--color-accent)' }}>
                Teilnehmer ({statusFilter === 'all' ? 'Top 10' : statusCfg[statusFilter].label})
              </div>
              {statusFilter !== 'all' && (
                <button type="button" onClick={() => selectTrainingStatus(statusFilter)} className="job-small-btn">Alle anzeigen</button>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {topEmps.map((item, i) => {
                const canEnroll = ['warn', 'expired', 'missing'].includes(item.status);
                const selected = selectedEnrollId === item.emp.id;
                return (
                <button
                  key={i}
                  type="button"
                  onClick={() => chooseParticipant(item)}
                  disabled={!canEnroll}
                  title={canEnroll ? `${item.emp.name} fuer ${training.short} anmelden` : 'Gueltige Teilnehmer koennen nicht angemeldet werden'}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, background:selected ? 'var(--color-parchment)' : 'var(--color-white)', border:'1px solid ' + (selected ? 'var(--fg-1)' : 'var(--border-1)'), fontSize:12, textAlign:'left', font:'inherit', cursor:canEnroll ? 'pointer' : 'default', opacity: canEnroll ? 1 : 0.78 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0 }}>
                    <div className={'avatar avatar--' + item.emp.color} style={{ width:24, height:24, fontSize:9, flexShrink:0 }}>{item.emp.initials}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.emp.name}</div>
                      <div style={{ fontSize:10, color:'var(--fg-3)' }}>PN {item.emp.personalNr}</div>
                    </div>
                  </div>
                  <SBadge status={item.status} />
                </button>
              );})}
              {hasMore && (
                <button className="btn btn--ghost" style={{ fontSize:11, padding:'6px 8px', marginTop:6 }}>
                  Alle {filteredEmpList.length} anzeigen
                </button>
              )}
            </div>
            {enrollNotice && (
              <div style={{ marginTop:10, padding:'9px 10px', borderRadius:8, background:'#eff5ed', border:'1px solid #cde1cf', color:'#3f7a4a', fontSize:12, fontWeight:600 }}>
                {enrollNotice}
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div style={{ padding:'12px 22px', borderTop:'1px solid var(--border-1)', background:'var(--color-ivory)', display:'flex', gap:8, flexShrink:0 }}>
          <button
            className="btn btn--primary"
            disabled={!canEnrollSelected}
            onClick={enrollSelected}
            style={{ flex:1, justifyContent:'center', fontSize:13, padding:'8px 0', opacity: canEnrollSelected ? 1 : 0.45, cursor: canEnrollSelected ? 'pointer' : 'not-allowed' }}
          >
            {canEnrollSelected ? `${selectedEnroll.emp.firstName} anmelden` : 'Teilnehmer waehlen'}
          </button>
          <button className="btn btn--ghost" style={{ flex:1, justifyContent:'center', fontSize:13, padding:'8px 0' }}>
            Bearbeiten
          </button>
        </div>
      </div>
    </>
  );
  if (window.ReactDOM && ReactDOM.createPortal && document.body) {
    return ReactDOM.createPortal(panel, document.body);
  }
  return panel;
}

function ProvidersViewOld() {
  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Akademien & Anbieter</h1>
          <div className="view__subtitle">Ansprechpartner und Schulungen je Anbieter.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary"><Icon name="plus" size={14} />Anbieter</button>
        </div>
      </div>
      <div className="grid-2" style={{gap:16}}>
        {window.SEED.providers.map(p => {
          const trs = window.SEED.trainings.filter(t => t.provider === p.id);
          return (
            <div key={p.id} className="card card--pad">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500}}>{p.name}</div>
                  <div className="small muted" style={{marginTop:2}}>{p.address}</div>
                </div>
                <a className="subtle small" href="#" onClick={e=>e.preventDefault()}>{p.site} â†—</a>
              </div>
              <div className="divider" />
              <div className="kv-grid">
                <div className="kv"><div className="kv__label">Ansprechpartner</div><div className="kv__value">{p.contact}</div></div>
                <div className="kv"><div className="kv__label">Telefon</div><div className="kv__value">{p.phone}</div></div>
                <div className="kv"><div className="kv__label">E-Mail</div><div className="kv__value">{p.email}</div></div>
                <div className="kv"><div className="kv__label">Schulungen</div><div className="kv__value">{trs.length}</div></div>
              </div>
              <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:14}}>
                {trs.map(t => <span key={t.id} className="badge">{t.short}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProvidersView() {
  const [selectedId, setSelectedId] = React.useState(null);
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [providerFilter, setProviderFilter] = React.useState('all');
  const [favorites, setFavorites] = React.useState(() => new Set(['dekra', 'intern']));
  const [ratings, setRatings] = React.useState({ biw: 4, dekra: 5, dvgw: 4, tuv: 3, 'bg-bau': 4, intern: 5 });
  const [providerViewMode, setProviderViewMode] = React.useState('cards');
  const [providerSort, setProviderSort] = React.useState({ key:'name', dir:'asc' });
  const [providerColumnMenu, setProviderColumnMenu] = React.useState(null);
  const [providerColumnFilters, setProviderColumnFilters] = React.useState({});
  const [providerFilterPanel, setProviderFilterPanel] = React.useState(null);
  const [providerFilterSearch, setProviderFilterSearch] = React.useState('');
  const [providerGroupBy, setProviderGroupBy] = React.useState('');
  const [selectedProviderRows, setSelectedProviderRows] = React.useState(new Set());
  const [providerCreateOpen, setProviderCreateOpen] = React.useState(false);
  const [providerPlanTarget, setProviderPlanTarget] = React.useState(null);

  const usageFor = (providerId) => {
    const trainings = window.SEED.trainings.filter(t => t.provider === providerId);
    const events = window.SEED.events.filter(e => e.provider === providerId);
    const participants = events.reduce((sum, e) => sum + (e.participants || 0), 0);
    return { trainings, events, participants };
  };

  const openTraining = (trainingId) => {
    window.dispatchEvent(new CustomEvent('navigate-to-training', { detail: { trainingId } }));
  };

  const planProvider = (provider) => {
    setProviderPlanTarget(provider);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const providerColumns = [
    { key:'name', label:'Anbieter' },
    { key:'address', label:'Adresse' },
    { key:'contact', label:'Kontakt' },
    { key:'phone', label:'Telefon' },
    { key:'email', label:'E-Mail' },
    { key:'trainings', label:'Schulungen' },
    { key:'participants', label:'Teilnehmer' },
    { key:'rating', label:'Bewertung' },
  ];
  const providerValue = (provider, key) => {
    const usage = usageFor(provider.id);
    if (key === 'trainings') return usage.trainings.length;
    if (key === 'participants') return usage.participants;
    if (key === 'rating') return ratings[provider.id] || 0;
    return provider[key] || '';
  };
  const toggleProviderFilter = (key, value) => setProviderColumnFilters(current => {
    const values = current[key] || [];
    return { ...current, [key]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
  });
  const openProviderFilter = key => { setProviderFilterPanel(key); setProviderFilterSearch(''); setProviderColumnMenu(null); };
  const clearProviderFilter = key => setProviderColumnFilters(current => ({ ...current, [key]:[] }));
  const filteredProviders = [...window.SEED.providers]
    .filter(provider => Object.entries(providerColumnFilters).every(([key, values]) => !values?.length || values.includes(String(providerValue(provider, key)))))
    .sort((a, b) => String(providerValue(a, providerSort.key)).localeCompare(String(providerValue(b, providerSort.key)), 'de', { numeric:true }) * (providerSort.dir === 'asc' ? 1 : -1));
  const providerFilterValues = key => Array.from(new Set(window.SEED.providers.map(provider => String(providerValue(provider, key))))).sort((a, b) => a.localeCompare(b, 'de', { numeric:true }));
  const visibleProviderFilterValues = providerFilterPanel
    ? providerFilterValues(providerFilterPanel).filter(value => value.toLowerCase().includes(providerFilterSearch.toLowerCase()))
    : [];
  const providerGroups = providerGroupBy
    ? Array.from(filteredProviders.reduce((map, row) => {
      const label = String(providerValue(row, providerGroupBy));
      map.set(label, [...(map.get(label) || []), row]);
      return map;
    }, new Map()).entries()).map(([label, rows]) => ({ label, rows }))
    : [{ label:null, rows:filteredProviders }];
  const allVisibleProvidersSelected = filteredProviders.length > 0 && filteredProviders.every(row => selectedProviderRows.has(row.id));
  const toggleProviderRow = id => setSelectedProviderRows(current => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAllProviderRows = () => setSelectedProviderRows(allVisibleProvidersSelected ? new Set() : new Set(filteredProviders.map(row => row.id)));

  const selected = selectedId ? window.SEED.providers.find(p => p.id === selectedId) : null;
  const selectedUsage = selected ? usageFor(selected.id) : null;
  const selectedDocs = selected ? [
    { type: 'Vertrag', name: `Rahmenvertrag_${selected.id}.pdf` },
    { type: 'Angebot', name: `Angebot_Schulungen_${selected.id}.pdf` },
    { type: 'Zertifikat', name: `Anbieterfreigabe_${selected.id}.pdf` },
  ] : [];
  const starFilled = String.fromCharCode(9733);
  const starEmpty = String.fromCharCode(9734);
  const CalendarEventModal = window.NewEventModal;

  return (
    <div>
      <div className="training-control-row">
        <label><span>Gruppieren</span><select value={providerGroupBy} onChange={e => setProviderGroupBy(e.target.value)}><option value="">Keine Gruppierung</option>{providerColumns.map(column => <option key={column.key} value={column.key}>{column.label}</option>)}</select></label>
        <div className="training-control-row__spacer" />
        <div className="training-view-toggle" aria-label="Ansicht wechseln">
          <button type="button" className={providerViewMode === 'cards' ? 'is-active' : ''} onClick={() => setProviderViewMode('cards')}><Icon name="dashboard" size={15} />Kacheln</button>
          <button type="button" className={providerViewMode === 'list' ? 'is-active' : ''} onClick={() => setProviderViewMode('list')}><Icon name="matrix" size={15} />Liste</button>
        </div>
        <button className="btn btn--primary" onClick={() => setProviderCreateOpen(true)}><Icon name="plus" size={14} />Anbieter</button>
      </div>

      {providerViewMode === 'cards' ? <div className={'provider-layout' + (selected ? ' provider-layout--detail-open' : '')}>
        <div className="provider-grid">
          {filteredProviders.map(p => {
            const usage = usageFor(p.id);
            const rating = ratings[p.id] || 0;
            const isFavorite = favorites.has(p.id);
            return (
              <article key={p.id} className={'provider-card' + (selected?.id === p.id ? ' provider-card--active' : '')} onClick={() => setSelectedId(p.id)}>
                <div className="provider-card__head">
                  <div>
                    <h2>{p.name}</h2>
                    <p>{p.address}</p>
                  </div>
                  <button className={'provider-fav' + (isFavorite ? ' is-active' : '')} type="button" onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}>
                    {isFavorite ? starFilled : starEmpty}
                  </button>
                </div>

                <div className="provider-rating" onClick={(e) => e.stopPropagation()}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" className={star <= rating ? 'is-active' : ''} onClick={() => setRatings(r => ({ ...r, [p.id]: star }))}>{starFilled}</button>
                  ))}
                </div>

                <div className="provider-usage">
                  <div><strong>{usage.events.length}</strong><span>Schulungen durchgefuehrt</span></div>
                  <div><strong>{usage.participants}</strong><span>Teilnehmer gesamt</span></div>
                </div>

                <div className="provider-contact">
                  <span>{p.contact}</span>
                  <span>{p.phone}</span>
                  <span>{p.email}</span>
                </div>

                <div className="provider-training-list">
                  {usage.trainings.map(t => (
                    <button key={t.id} type="button" onClick={(e) => { e.stopPropagation(); openTraining(t.id); }}>
                      {t.short}
                    </button>
                  ))}
                </div>

                <div className="provider-actions" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => alert('Bearbeiten: ' + p.name)}><Icon name="doc" size={13} />Bearbeiten</button>
                  <button type="button" onClick={() => alert('Anrufen: ' + p.phone)}><Icon name="phone" size={13} />Anrufen</button>
                  <button type="button" onClick={() => alert('Mail an: ' + p.email)}><Icon name="mail" size={13} />Mail</button>
                  <button type="button" className="is-primary" onClick={() => planProvider(p)}><Icon name="cal" size={13} />Termin planen</button>
                </div>
              </article>
            );
          })}
        </div>

        {selected && (
          <aside className="provider-detail">
            <div className="provider-detail__head">
              <div>
                <div className="eyebrow">Anbieter Detail</div>
                <h2>{selected.name}</h2>
                <p>{selected.address} - {selected.site}</p>
              </div>
              <button className="icon-btn" type="button" onClick={() => setSelectedId(null)} aria-label="Detail schliessen"><Icon name="x" size={16} /></button>
            </div>

            <section className="provider-detail-section">
              <h3>Ansprechpartner</h3>
              <div className="provider-detail-kv">
                <div><span>Name</span><strong>{selected.contact}</strong></div>
                <div><span>Telefon</span><strong>{selected.phone}</strong></div>
                <div><span>E-Mail</span><strong>{selected.email}</strong></div>
              </div>
            </section>

            <section className="provider-detail-section">
              <h3>Schulungen dieses Anbieters</h3>
              <div className="provider-detail-list">
                {selectedUsage.trainings.map(t => (
                  <button key={t.id} type="button" onClick={() => openTraining(t.id)}>
                    <strong>{t.short}</strong>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="provider-detail-section">
              <h3>Nutzung & Historie</h3>
              <div className="provider-detail-kv">
                <div><span>Durchgefuehrt</span><strong>{selectedUsage.events.length}</strong></div>
                <div><span>Teilnehmer</span><strong>{selectedUsage.participants}</strong></div>
              </div>
              <div className="provider-upcoming">
                {selectedUsage.events.slice(0, 4).map(ev => (
                  <div key={ev.id}><span>{window.fmtDE(ev.date)}</span><strong>{ev.title}</strong></div>
                ))}
                {selectedUsage.events.length === 0 && <div><span>Keine Termine</span><strong>Noch nicht genutzt</strong></div>}
              </div>
            </section>

            <section className="provider-detail-section">
              <h3>Kommende Termine</h3>
              <div className="provider-upcoming">
                {selectedUsage.events.filter(ev => ev.date >= window.SEED.today).map(ev => (
                  <div key={ev.id}><span>{window.fmtDE(ev.date)} - {ev.time}</span><strong>{ev.title}</strong></div>
                ))}
                {selectedUsage.events.filter(ev => ev.date >= window.SEED.today).length === 0 && <div><span>Keine kommenden Termine</span><strong>Termin planen</strong></div>}
              </div>
            </section>

            <section className="provider-detail-section">
              <h3>Dokumente</h3>
              <div className="provider-docs">
                {selectedDocs.map(doc => (
                  <button key={doc.name} type="button"><Icon name="doc" size={14} /><span>{doc.type}</span><strong>{doc.name}</strong></button>
                ))}
              </div>
            </section>

            <button className="btn btn--primary provider-detail-plan" type="button" onClick={() => planProvider(selected)}>
              <Icon name="cal" size={14} />Termin planen
            </button>
          </aside>
        )}
      </div> : <React.Fragment>
        {selectedProviderRows.size > 0 && <div className="training-bulk-bar">
          <strong>{selectedProviderRows.size} ausgewählt</strong>
          <button type="button"><Icon name="download" size={14} />Export</button>
          <button type="button"><Icon name="edit" size={14} />Status ändern</button>
          <button type="button" className="is-danger"><Icon name="trash" size={14} />Löschen</button>
          <button type="button" className="is-clear" onClick={() => setSelectedProviderRows(new Set())}><Icon name="x" size={14} /></button>
        </div>}
        <div className="training-list-table card">
          <table>
            <thead><tr>
              <th className="training-list-check"><input type="checkbox" checked={allVisibleProvidersSelected} onChange={toggleAllProviderRows} /></th>
              {providerColumns.map(column => <th key={column.key}>
                <button type="button" className="training-th-button" onClick={() => setProviderColumnMenu(providerColumnMenu === column.key ? null : column.key)}>
                  {column.label}<span>{providerSort.key === column.key ? (providerSort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
                </button>
                {providerColumnMenu === column.key && <div className="training-column-menu">
                  <button type="button" onClick={() => { setProviderSort({ key:column.key, dir:'asc' }); setProviderColumnMenu(null); }}>A bis Z</button>
                  <button type="button" onClick={() => { setProviderSort({ key:column.key, dir:'desc' }); setProviderColumnMenu(null); }}>Z bis A</button>
                  <button type="button" className="is-filter" onClick={() => openProviderFilter(column.key)}>Filtern nach</button>
                  <button type="button" onClick={() => { setProviderGroupBy(providerGroupBy === column.key ? '' : column.key); setProviderSort({ key:column.key, dir:'asc' }); setProviderColumnMenu(null); }}>Gruppieren nach "{column.label}"</button>
                </div>}
              </th>)}
            </tr></thead>
            <tbody>
              {providerGroups.map(group => <React.Fragment key={group.label || 'all'}>
                {group.label && <tr className="training-group-row"><td colSpan={providerColumns.length + 1}>{providerColumns.find(column => column.key === providerGroupBy)?.label}: {group.label} <span>{group.rows.length}</span></td></tr>}
                {group.rows.map(provider => <tr key={provider.id} className={selectedProviderRows.has(provider.id) ? 'is-selected' : ''} onClick={() => setSelectedId(provider.id)}>
                  <td className="training-list-check" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedProviderRows.has(provider.id)} onChange={() => toggleProviderRow(provider.id)} /></td>
                  {providerColumns.map(column => <td key={column.key}>{column.key === 'name' ? <strong>{providerValue(provider, column.key)}</strong> : providerValue(provider, column.key)}</td>)}
                </tr>)}
              </React.Fragment>)}
            </tbody>
          </table>
        </div>
      </React.Fragment>}
      {providerFilterPanel && <div className="training-filter-backdrop" onClick={() => setProviderFilterPanel(null)}>
        <aside className="training-filter-panel" onClick={event => event.stopPropagation()}>
          <header>
            <h2>Filtern nach "{providerColumns.find(column => column.key === providerFilterPanel)?.label}"</h2>
            <button type="button" className="btn btn--ghost" onClick={() => setProviderFilterPanel(null)}><Icon name="x" size={18} /></button>
          </header>
          <main>
            <input value={providerFilterSearch} onChange={event => setProviderFilterSearch(event.target.value)} placeholder="Text eingeben, um Filter zu finden" />
            <div>
              {visibleProviderFilterValues.map(value => <label key={value}><input type="checkbox" checked={(providerColumnFilters[providerFilterPanel] || []).includes(value)} onChange={() => toggleProviderFilter(providerFilterPanel, value)} /><span>{value}</span></label>)}
            </div>
          </main>
          <footer>
            <button type="button" className="btn btn--primary" onClick={() => setProviderFilterPanel(null)} disabled={!(providerColumnFilters[providerFilterPanel] || []).length}>Anwenden</button>
            <button type="button" className="btn btn--ghost" onClick={() => clearProviderFilter(providerFilterPanel)}>Auswahl aufheben</button>
          </footer>
        </aside>
      </div>}
      {providerCreateOpen && <ProviderCreateModal onClose={() => setProviderCreateOpen(false)} />}
      {providerPlanTarget && CalendarEventModal && (
        <CalendarEventModal
          onClose={() => setProviderPlanTarget(null)}
          selectedProvider={providerPlanTarget}
        />
      )}
    </div>
  );
}

function ProviderCreateModal({ onClose }) {
  const categories = ['Sicherheit', 'SCC', 'DVGW', 'Fahrerlaubnis', 'Unterweisung', 'Sicherheit / Verkehr'];
  return <div className="training-create-backdrop" onClick={onClose}>
    <section className="training-create-modal" onClick={event => event.stopPropagation()}>
      <header>
        <div>
          <span>Neuer Anbieter</span>
          <h2>Anbieter anlegen</h2>
        </div>
        <button type="button" onClick={onClose} title="Schliessen"><Icon name="x" size={16} /></button>
      </header>
      <div className="training-create-form">
        <label><span>Name Anbieter</span><input placeholder="z.B. DEKRA Akademie" /></label>
        <label><span>Sterne</span><select defaultValue="5">{[1,2,3,4,5].map(star => <option key={star} value={star}>{star} Stern{star > 1 ? 'e' : ''}</option>)}</select></label>
        <label><span>Ansprechpartner</span><input placeholder="Name Ansprechpartner" /></label>
        <label><span>Telefon</span><input placeholder="+49 ..." /></label>
        <label><span>E-Mail</span><input placeholder="mail@anbieter.de" /></label>
        <label><span>Adresse</span><input placeholder="Straße, PLZ Ort" /></label>
        <label><span>Kategorie</span><select defaultValue="Sicherheit">{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
        <label><span>Status</span><select defaultValue="aktiv"><option value="aktiv">Aktiv</option><option value="vorbereitung">In Vorbereitung</option><option value="inaktiv">Inaktiv</option></select></label>
        <label className="is-wide"><span>Beschreibung</span><textarea placeholder="Kurze Beschreibung des Anbieters..." /></label>
      </div>
      <footer>
        <button className="btn btn--ghost" type="button" onClick={onClose}>Abbrechen</button>
        <button className="btn btn--primary" type="button" onClick={onClose}>Speichern</button>
      </footer>
    </section>
  </div>;
}

function CompaniesViewOld() {
  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Firmen der Gruppe</h1>
          <div className="view__subtitle">Fuenf Gesellschaften unter dem Dach der Janning-Gruppe.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary"><Icon name="plus" size={14} />Firma</button>
        </div>
      </div>

      <div className="grid-3" style={{gap:16}}>
        {window.SEED.companies.map(c => {
          const emps = window.SEED.employees.filter(e => e.company === c.id);
          const active = emps.filter(e => e.status === 'aktiv').length;
          let valid=0, total=0;
          emps.forEach(e => window.SEED.trainings.forEach(t => {
            const s = window.SEED.certs[e.id]?.[t.id]?.status || 'missing';
            total++;
            if (s==='valid' || s==='warn') valid++;
          }));
          const pct = total ? Math.round(valid*100/total) : 0;
          return (
            <div key={c.id} className="card" style={{padding:24}}>
              <div style={{height:80, background:'var(--color-parchment)', borderRadius:8, display:'grid', placeItems:'center', marginBottom:16, border:'1px solid var(--border-1)'}}>
                <img src={c.logo} alt={c.name} style={{maxHeight:50, maxWidth:'75%', objectFit:'contain'}} />
              </div>
              <div style={{fontFamily:'var(--font-serif)', fontSize:19, fontWeight:500}}>{c.name}</div>
              <div className="kv-grid" style={{marginTop:14}}>
                <div className="kv"><div className="kv__label">Mitarbeiter</div><div className="kv__value">{active} <span className="small muted">/ {emps.length}</span></div></div>
                <div className="kv"><div className="kv__label">Abdeckung</div><div className="kv__value">{pct} %</div></div>
              </div>
              <div className="bar" style={{marginTop:12}}><div className={'bar__fill ' + (pct>=85?'bar__fill--valid':pct>=60?'bar__fill--warn':'bar__fill--expired')} style={{width: pct+'%'}} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompaniesView() {
  const [selectedId, setSelectedId] = React.useState(null);

  const companyStats = (company) => {
    const emps = window.SEED.employees.filter(e => e.company === company.id);
    const active = emps.filter(e => e.status === 'aktiv');
    let valid = 0, total = 0, expired = 0, missing = 0;
    active.forEach(emp => window.SEED.trainings.forEach(t => {
      const status = window.SEED.certs[emp.id]?.[t.id]?.status || 'missing';
      total += 1;
      if (status === 'valid' || status === 'warn') valid += 1;
      if (status === 'expired') expired += 1;
      if (status === 'missing') missing += 1;
    }));
    const openInstructions = window.SEED.instructions
      .filter(u => u.company === company.id)
      .reduce((sum, u) => sum + u.participants.filter(p => !p.signed).length, 0);
    const departments = [...new Set(active.map(e => e.department))].sort();
    const pct = total ? Math.round(valid * 100 / total) : 0;
    return { emps, active, valid, total, expired, missing, openInstructions, departments, pct };
  };

  const goMatrix = (companyId) => {
    window.dispatchEvent(new CustomEvent('navigate-to-company-view', { detail: { companyId, target: 'matrix' } }));
  };

  const goEvaluation = (companyId) => {
    window.dispatchEvent(new CustomEvent('navigate-to-company-view', { detail: { companyId, target: 'auswertung' } }));
  };

  const selectedCompany = selectedId ? window.SEED.companies.find(c => c.id === selectedId) : null;
  const selectedStats = selectedCompany ? companyStats(selectedCompany) : null;

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Firmen der Gruppe</h1>
          <div className="view__subtitle">Fuenf Gesellschaften unter dem Dach der Janning-Gruppe.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary"><Icon name="plus" size={14} />Firma</button>
        </div>
      </div>

      <div className={'company-layout' + (selectedCompany ? ' company-layout--detail-open' : '')}>
        <div className="company-grid">
          {window.SEED.companies.map(c => {
            const stats = companyStats(c);
            return (
              <article key={c.id} className={'company-card' + (selectedId === c.id ? ' company-card--active' : '')} onClick={() => setSelectedId(c.id)}>
                <div className="company-logo-panel">
                  <img src={c.logo} alt={c.name} />
                </div>
                <h2>{c.name}</h2>
                <div className="company-card__metrics">
                  <div>
                    <span>Mitarbeiter</span>
                    <strong>{stats.active.length} <small>/ {stats.emps.length}</small></strong>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); goMatrix(c.id); }}>
                    <span>Abdeckung</span>
                    <strong>{stats.pct} %</strong>
                  </button>
                </div>
                <div className="bar" style={{ marginTop: 12 }}>
                  <div className={'bar__fill ' + (stats.pct >= 85 ? 'bar__fill--valid' : stats.pct >= 60 ? 'bar__fill--warn' : 'bar__fill--expired')} style={{ width: stats.pct + '%' }} />
                </div>
                <div className="company-problems">
                  <div className={stats.expired ? 'is-warning' : ''}>{stats.expired} abgelaufene Zertifikate</div>
                  <div className={stats.missing ? 'is-warning' : ''}>{stats.missing} fehlende Schulungen</div>
                  <div className={stats.openInstructions ? 'is-warning' : ''}>{stats.openInstructions} offene Unterweisungen</div>
                </div>
                <div className="company-actions" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => setSelectedId(c.id)}><Icon name="eye" size={13} />Details</button>
                  <button type="button" onClick={() => goEvaluation(c.id)}><Icon name="matrix" size={13} />Auswertung</button>
                  <button type="button"><Icon name="download" size={13} />Export</button>
                </div>
              </article>
            );
          })}
        </div>

        {selectedCompany && (
          <aside className="company-detail">
            <div className="company-detail__head">
              <div>
                <div className="eyebrow">Firmen-Dashboard</div>
                <h2>{selectedCompany.name}</h2>
                <p>{selectedStats.active.length} aktive Mitarbeiter Â· {selectedStats.departments.length} Abteilungen</p>
              </div>
              <button className="icon-btn" type="button" onClick={() => setSelectedId(null)} aria-label="Detail schlieÃŸen"><Icon name="x" size={16} /></button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
              {[
                { label:'Mitarbeiter', value: selectedStats.active.length, action: null },
                { label:'Abteilungen', value: selectedStats.departments.length, action: null },
                { label:'Qualifikation', value: selectedStats.pct + '%', action: () => goMatrix(selectedCompany.id) },
                { label:'Offene Unterweisungen', value: selectedStats.openInstructions, action: null },
              ].map((k, i) => (
                <div key={i} style={{
                  padding:'10px 14px',
                  background: 'var(--color-ivory)',
                  border: '1px solid var(--border-1)',
                  borderRadius:10,
                  cursor: k.action ? 'pointer' : 'default',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.048)',
                  transition:'all 150ms ease',
                }} onClick={k.action} onMouseEnter={e => { if (k.action) { e.currentTarget.style.background = 'var(--color-white)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }} onMouseLeave={e => { if (k.action) { e.currentTarget.style.background = 'var(--color-ivory)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.048)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{k.label}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'center', textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:500, color:'var(--fg-1)', lineHeight:1 }}>{k.value}</div>
                  </div>
                  {k.action && <div style={{ fontSize:11, fontWeight:600, color:'var(--fg-3)', textAlign:'right' }}>Klicken</div>}
                </div>
              ))}
            </div>

            <section className="company-detail-section">
              <h3>Abteilungen</h3>
              <div className="company-chip-list">
                {selectedStats.departments.map(dept => <span key={dept}>{dept}</span>)}
              </div>
            </section>

            <section className="company-detail-section">
              <h3>Qualifikationsstatus</h3>
              <div className="bar"><div className={'bar__fill ' + (selectedStats.pct >= 85 ? 'bar__fill--valid' : selectedStats.pct >= 60 ? 'bar__fill--warn' : 'bar__fill--expired')} style={{ width: selectedStats.pct + '%' }} /></div>
              <div className="company-status-grid">
                <div><span>GÃ¼ltig / warnend</span><strong>{selectedStats.valid}</strong></div>
                <div><span>Abgelaufen</span><strong>{selectedStats.expired}</strong></div>
                <div><span>Fehlend</span><strong>{selectedStats.missing}</strong></div>
              </div>
            </section>

            <section className="company-detail-section">
              <h3>Offene Schulungen</h3>
              <div className="company-open-list">
                {window.SEED.trainings.slice(0, 5).map(t => {
                  const missingCount = selectedStats.active.filter(e => (window.SEED.certs[e.id]?.[t.id]?.status || 'missing') === 'missing').length;
                  return missingCount ? <div key={t.id}><span>{t.short}</span><strong>{missingCount} fehlen</strong></div> : null;
                })}
              </div>
            </section>

            <section className="company-detail-section">
              <h3>Probleme</h3>
              <div className="company-problem-list">
                <div>{selectedStats.expired} abgelaufene Zertifikate</div>
                <div>{selectedStats.missing} fehlende Schulungen</div>
                <div>{selectedStats.openInstructions} offene Unterweisungen</div>
              </div>
            </section>

            <button className="btn btn--primary company-detail-plan" type="button" onClick={() => goMatrix(selectedCompany.id)}>
              <Icon name="matrix" size={14} />Qualifikationsmatrix Ã¶ffnen
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}

function CertsView({ activeCompany }) {
  const [certView, setCertView] = React.useState('current');
  const [q, setQ] = React.useState('');
  const [certStatusFilter, setCertStatusFilter] = React.useState('all');
  const [certSelectedIds, setCertSelectedIds] = React.useState(new Set());
  const [certPdfModal, setCertPdfModal] = React.useState(null);
  const [certSort, setCertSort] = React.useState({ col: 'expiresAt', dir: 'desc' });
  const [certColumnMenu, setCertColumnMenu] = React.useState(null);
  const [certFilterPanel, setCertFilterPanel] = React.useState(null);
  const [certFilterSearch, setCertFilterSearch] = React.useState('');
  const [certColumnFilters, setCertColumnFilters] = React.useState({});
  const [certGroupBy, setCertGroupBy] = React.useState('');
  const [selectedCertRecord, setSelectedCertRecord] = React.useState(null);
  const [certOverrides, setCertOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('cert_edit_overrides') || '{}'); }
    catch { return {}; }
  });
  const [releasedCerts, setReleasedCerts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('employee_cert_releases') || '{}'); }
    catch { return {}; }
  });
  const [pendingCertUploads, setPendingCertUploads] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cert_pending_uploads') || 'null');
      if (saved) return saved;
    } catch {}
    const employeeById = id => window.SEED.employees.find(e => e.id === id) || window.SEED.employees[0];
    return [
      { id:'pending-cert-1', emp: employeeById('e-me'), trainingName:'SCC Dok. 016', issuedAt:'2026-04-12', expiresAt:'2029-04-12', status:'in_pruefung', approved:false, docNr:'UP-2026-001' },
      { id:'pending-cert-2', emp: employeeById('e-7'), trainingName:'Erste Hilfe (9 UE)', issuedAt:'2026-04-18', expiresAt:'2028-04-18', status:'in_pruefung', approved:false, docNr:'UP-2026-002' },
      { id:'pending-cert-3', emp: employeeById('e-12'), trainingName:'MVAS 99', issuedAt:'2026-05-02', expiresAt:'2029-05-02', status:'hochgeladen', approved:false, docNr:'UP-2026-003' },
    ];
  });

  const calcStatus = (expiresAt) => {
    if (!expiresAt) return 'missing';
    const now = new Date('2026-04-21');
    const exp = new Date(expiresAt);
    const daysLeft = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 30) return 'warn';
    return 'valid';
  };

  const formatRemaining = (expiresAt) => {
    if (!expiresAt) return 'â€”';
    const now = new Date('2026-04-21');
    const exp = new Date(expiresAt);
    const days = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
    if (days < 0) return `vor ${Math.abs(days)} Tagen abgelaufen`;
    if (days === 0) return 'heute ablaufen!';
    if (days === 1) return 'morgen ablaufen';
    return `in ${days} Tagen`;
  };

  const formatIssuedDate = (cert) => {
    if (cert.validFrom) return window.fmtDE(cert.validFrom);
    if (!cert.expiresAt) return '21.04.2026';
    const issued = new Date(cert.expiresAt);
    issued.setFullYear(issued.getFullYear() - 3);
    return window.fmtDE(issued.toISOString().slice(0, 10));
  };

  const issuedISO = (cert) => {
    if (cert.validFrom) return cert.validFrom;
    if (cert.issuedAt) return cert.issuedAt;
    if (!cert.expiresAt) return '2026-04-21';
    const issued = new Date(cert.expiresAt);
    issued.setFullYear(issued.getFullYear() - 3);
    return issued.toISOString().slice(0, 10);
  };

  const savePendingCertUploads = (next) => {
    setPendingCertUploads(next);
    localStorage.setItem('cert_pending_uploads', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('cert-pending-updated'));
  };

  const trainingFromPending = (item) => ({
    id: item.id,
    name: item.trainingName,
    short: item.trainingName,
    cat: 'Mitarbeiter-Upload',
    mandatory: false,
  });

  const certFromPending = (item) => ({
    validFrom: item.issuedAt,
    issuedAt: item.issuedAt,
    expiresAt: item.expiresAt,
    status: calcStatus(item.expiresAt),
    docNr: item.docNr,
  });

  const applyCertOverride = (id, cert) => {
    const override = certOverrides[id];
    if (!override) return cert;
    return {
      ...cert,
      validFrom: override.issuedAt || cert.validFrom,
      issuedAt: override.issuedAt || cert.issuedAt,
      expiresAt: override.expiresAt || cert.expiresAt,
      docNr: override.docNr || cert.docNr,
      documentName: override.documentName || cert.documentName,
      documentNames: override.documentNames || cert.documentNames,
      manualStatus: override.status || cert.manualStatus,
    };
  };

  const rows = [];
  window.SEED.employees.forEach(e => {
    if (activeCompany !== 'all' && e.company !== activeCompany) return;
    window.SEED.trainings.forEach(t => {
      const c = window.SEED.certs[e.id]?.[t.id];
      if (!c || c.status === 'missing' || c.status === 'planned') return;
      const id = e.id + '_' + t.id;
      const override = certOverrides[id];
      rows.push({
        id,
        emp: e,
        training: override?.trainingName ? { ...t, name: override.trainingName, short: override.trainingName, cat: override.category || t.cat } : t,
        cert: applyCertOverride(id, c)
      });
    });
  });
  pendingCertUploads.filter(item => item.approved).forEach(item => {
    rows.push({ id: item.id, emp: item.emp, training: trainingFromPending(item), cert: applyCertOverride(item.id, certFromPending(item)), fromPendingUpload: true });
  });
  rows.sort((a,b)=>(b.cert.expiresAt||'').localeCompare(a.cert.expiresAt||''));

  const certCounts = { valid: 0, warn: 0, expired: 0, missing: 0 };
  window.SEED.employees.forEach(e => {
    if (activeCompany !== 'all' && e.company !== activeCompany) return;
    window.SEED.trainings.forEach(t => {
      const c = window.SEED.certs[e.id]?.[t.id];
      const status = (!c || c.status === 'missing' || c.status === 'planned') ? 'missing' : calcStatus(c.expiresAt);
      certCounts[status] = (certCounts[status] || 0) + 1;
    });
  });

  const certKpis = {
    valid: { label: 'Gültig', color: '#3f7a4a' },
    warn: { label: 'Läuft bald ab', color: '#8a6a1f' },
    expired: { label: 'Abgelaufen', color: '#a13232' },
    missing: { label: 'Fehlt', color: '#6b6256' },
  };

  const certColumns = [
    { key: 'employee', label: 'Mitarbeiter' },
    { key: 'training', label: 'Zertifikat / Schulung' },
    { key: 'issuedAt', label: 'Ausstellungsdatum' },
    { key: 'expiresAt', label: 'Ablaufdatum' },
    { key: 'remaining', label: 'Restlaufzeit' },
    { key: 'status', label: 'Status' },
  ];

  const certColumnLabel = (key) => certColumns.find(col => col.key === key)?.label || key;
  const certStatusLabel = (status) => ({ valid: 'Gültig', warn: 'Läuft bald ab', expired: 'Abgelaufen', missing: 'Fehlt' })[status] || status;
  const certColumnValue = (r, key) => {
    if (key === 'employee') return r.emp.name;
    if (key === 'training') return r.training.short || r.training.name;
    if (key === 'issuedAt') return formatIssuedDate(r.cert);
    if (key === 'expiresAt') return window.fmtDE(r.cert.expiresAt) || '—';
    if (key === 'remaining') return formatRemaining(r.cert.expiresAt);
    if (key === 'status') return certStatusLabel(r.cert.manualStatus || calcStatus(r.cert.expiresAt));
    return '';
  };
  const certSortValue = (r, key) => {
    if (key === 'issuedAt') {
      if (r.cert.validFrom) return new Date(r.cert.validFrom).getTime();
      const issued = new Date(r.cert.expiresAt || '2029-04-21');
      issued.setFullYear(issued.getFullYear() - 3);
      return issued.getTime();
    }
    if (key === 'expiresAt') return r.cert.expiresAt ? new Date(r.cert.expiresAt).getTime() : 0;
    if (key === 'remaining') return r.cert.expiresAt ? new Date(r.cert.expiresAt).getTime() : 0;
    return certColumnValue(r, key);
  };
  const setColumnSort = (col, dir) => {
    setCertSort({ col, dir });
    setCertColumnMenu(null);
  };
  const openColumnFilter = (col) => {
    setCertFilterPanel(col);
    setCertFilterSearch('');
    setCertColumnMenu(null);
  };
  const toggleColumnFilterValue = (col, value) => {
    setCertColumnFilters(current => {
      const selected = current[col] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [col]: next };
    });
  };
  const clearColumnFilter = (col) => {
    setCertColumnFilters(current => ({ ...current, [col]: [] }));
  };
  const saveReleasedCerts = (next) => {
    setReleasedCerts(next);
    localStorage.setItem('employee_cert_releases', JSON.stringify(next));
    window.dispatchEvent(new Event('employee-cert-releases-updated'));
  };
  const saveCertOverrides = (next) => {
    setCertOverrides(next);
    localStorage.setItem('cert_edit_overrides', JSON.stringify(next));
  };
  const toggleEmployeeRelease = (row) => {
    const next = { ...releasedCerts };
    if (next[row.id]) {
      delete next[row.id];
    } else {
      next[row.id] = {
        id: row.id,
        employeeId: row.emp.id,
        employeeName: row.emp.name,
        personalNr: row.emp.personalNr,
        trainingId: row.training.id,
        trainingName: row.training.name,
        trainingShort: row.training.short,
        category: row.training.cat,
        mandatory: row.training.mandatory,
        issuedAt: row.cert.validFrom || row.cert.issuedAt || '',
        expiresAt: row.cert.expiresAt || '',
        status: calcStatus(row.cert.expiresAt),
        docNr: row.cert.docNr || '',
        releasedAt: new Date().toISOString(),
        releasedBy: 'Admin',
      };
    }
    saveReleasedCerts(next);
  };

  const togglePendingCertRelease = (item) => {
    const nextPending = pendingCertUploads.map(upload => upload.id === item.id ? { ...upload, approved: !upload.approved } : upload);
    savePendingCertUploads(nextPending);
    const nextReleased = { ...releasedCerts };
    if (!item.approved) {
      nextReleased[item.id] = {
        id: item.id,
        employeeId: item.emp.id,
        employeeName: item.emp.name,
        personalNr: item.emp.personalNr,
        trainingId: item.id,
        trainingName: item.trainingName,
        trainingShort: item.trainingName,
        category: 'Mitarbeiter-Upload',
        mandatory: false,
        issuedAt: item.issuedAt,
        expiresAt: item.expiresAt,
        status: calcStatus(item.expiresAt),
        docNr: item.docNr,
        releasedAt: new Date().toISOString(),
        releasedBy: 'Admin',
      };
    } else {
      delete nextReleased[item.id];
    }
    saveReleasedCerts(nextReleased);
  };

  const openCurrentCertEditor = (row) => {
    setSelectedCertRecord({
      kind: 'current',
      id: row.id,
      emp: row.emp,
      trainingName: row.training.name,
      trainingShort: row.training.short,
      category: row.training.cat || 'Nachweis',
      issuedAt: issuedISO(row.cert),
      expiresAt: row.cert.expiresAt || '',
      docNr: row.cert.docNr || '',
      documentName: (row.cert.docNr || row.training.short || row.training.name) + '.pdf',
      documentNames: row.cert.documentNames || [row.cert.documentName || ((row.cert.docNr || row.training.short || row.training.name) + '.pdf')],
      status: row.cert.manualStatus || calcStatus(row.cert.expiresAt),
      released: !!releasedCerts[row.id],
      row,
    });
  };

  const openPendingCertEditor = (item) => {
    setSelectedCertRecord({
      kind: 'pending',
      id: item.id,
      emp: item.emp,
      trainingName: item.trainingName,
      trainingShort: item.trainingName,
      category: 'Mitarbeiter-Upload',
      issuedAt: item.issuedAt,
      expiresAt: item.expiresAt,
      docNr: item.docNr,
      documentName: item.documentName || (item.docNr || item.trainingName) + '.pdf',
      documentNames: item.documentNames || [item.documentName || ((item.docNr || item.trainingName) + '.pdf')],
      status: item.status || 'in_pruefung',
      released: !!item.approved,
      item,
    });
  };

  const saveCertEditor = (form) => {
    if (!selectedCertRecord) return;
    const primaryDocumentName = form.documentNames?.[0] || '';
    if (selectedCertRecord.kind === 'pending') {
      const nextPending = pendingCertUploads.map(upload => upload.id === selectedCertRecord.id ? {
        ...upload,
        trainingName: form.trainingName,
        issuedAt: form.issuedAt,
        expiresAt: form.expiresAt,
        docNr: form.docNr,
        documentName: primaryDocumentName,
        documentNames: form.documentNames || [],
        status: form.status,
        approved: form.released,
      } : upload);
      savePendingCertUploads(nextPending);
      const nextReleased = { ...releasedCerts };
      if (form.released) {
        nextReleased[selectedCertRecord.id] = {
          id: selectedCertRecord.id,
          employeeId: selectedCertRecord.emp.id,
          employeeName: selectedCertRecord.emp.name,
          personalNr: selectedCertRecord.emp.personalNr,
          trainingId: selectedCertRecord.id,
          trainingName: form.trainingName,
          trainingShort: form.trainingName,
          category: 'Mitarbeiter-Upload',
          mandatory: false,
          issuedAt: form.issuedAt,
          expiresAt: form.expiresAt,
          status: calcStatus(form.expiresAt),
          docNr: form.docNr,
          documentName: primaryDocumentName,
          documentNames: form.documentNames || [],
          releasedAt: new Date().toISOString(),
          releasedBy: 'Admin',
        };
      } else {
        delete nextReleased[selectedCertRecord.id];
      }
      saveReleasedCerts(nextReleased);
    } else {
      saveCertOverrides({
        ...certOverrides,
        [selectedCertRecord.id]: {
          trainingName: form.trainingName,
          category: form.category,
          issuedAt: form.issuedAt,
          expiresAt: form.expiresAt,
          docNr: form.docNr,
          documentName: primaryDocumentName,
          documentNames: form.documentNames || [],
          status: form.status,
        },
      });
      const nextReleased = { ...releasedCerts };
      if (form.released) {
        nextReleased[selectedCertRecord.id] = {
          id: selectedCertRecord.id,
          employeeId: selectedCertRecord.emp.id,
          employeeName: selectedCertRecord.emp.name,
          personalNr: selectedCertRecord.emp.personalNr,
          trainingId: selectedCertRecord.row.training.id,
          trainingName: form.trainingName,
          trainingShort: form.trainingName,
          category: selectedCertRecord.category,
          mandatory: selectedCertRecord.row.training.mandatory,
          issuedAt: form.issuedAt,
          expiresAt: form.expiresAt,
          status: calcStatus(form.expiresAt),
          docNr: form.docNr,
          documentName: primaryDocumentName,
          documentNames: form.documentNames || [],
          releasedAt: new Date().toISOString(),
          releasedBy: 'Admin',
        };
      } else {
        delete nextReleased[selectedCertRecord.id];
      }
      saveReleasedCerts(nextReleased);
    }
    setSelectedCertRecord(null);
  };
  
  const filtered = rows.filter(r => {
    if (q) {
      const query = q.toLowerCase();
      if (!(r.emp.name + ' ' + r.training.name + ' ' + r.cert.docNr).toLowerCase().includes(query)) return false;
    }
    if (certStatusFilter !== 'all') {
      const status = r.cert.manualStatus || calcStatus(r.cert.expiresAt);
      if (status !== certStatusFilter) return false;
    }
    for (const [col, values] of Object.entries(certColumnFilters)) {
      if (values?.length && !values.includes(certColumnValue(r, col))) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = certSortValue(a, certSort.col);
    const bv = certSortValue(b, certSort.col);
    const result = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'de');
    return certSort.dir === 'asc' ? result : -result;
  });

  const visibleRows = sorted.slice(0, 100);
  const filterValues = certFilterPanel
    ? Array.from(new Set(rows.map(r => certColumnValue(r, certFilterPanel)))).sort((a, b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleFilterValues = filterValues.filter(value => String(value).toLowerCase().includes(certFilterSearch.toLowerCase()));

  const ColumnHeader = ({ col }) => {
    const active = certSort.col === col.key || (certColumnFilters[col.key] || []).length > 0 || certGroupBy === col.key;
    return (
      <th style={{ position:'relative' }}>
        <button type="button" onClick={() => setCertColumnMenu(certColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:0, padding:0, cursor:'pointer', font:'inherit', textTransform:'inherit', color: active ? 'var(--fg-1)' : 'inherit', fontWeight: active ? 700 : undefined }}>
          {col.label}
          <span style={{ fontSize:10 }}>{certSort.col === col.key ? (certSort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
        </button>
        {certColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)' }}>
            <button type="button" onClick={() => setColumnSort(col.key, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setColumnSort(col.key, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => openColumnFilter(col.key)} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setCertGroupBy(certGroupBy === col.key ? '' : col.key); setCertSort({ col: col.key, dir: 'asc' }); setCertColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  const StatusBadge = ({ status }) => {
    const cfg = {
      valid: { label: 'Gültig', color: '#3f7a4a', bg: '#eff5ed' },
      warn: { label: 'Läuft ab', color: '#8a6a1f', bg: '#fdf3e0' },
      expired: { label: 'Abgelaufen', color: '#a13232', bg: '#fbeaea' },
    };
    const s = cfg[status] || cfg.valid;
    return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:999, fontSize:11, fontWeight:600, background:s.bg, color:s.color }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:s.color }}></span>
      {s.label}
    </span>;
  };

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Zertifikate & Dokumente</h1>
          <div className="view__subtitle">Alle erfassten Nachweise mit Status, Restlaufzeit und Quick Actions.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost"><Icon name="upload" size={14} />Upload</button>
          <button className="btn btn--primary"><Icon name="plus" size={14} />Zertifikat</button>
        </div>
      </div>

      <div className="job-kpis">
        {Object.entries(certKpis).map(([key, cfg]) => (
          <button key={key} className={'job-kpi' + (certStatusFilter === key ? ' job-kpi--active' : '')}
            style={{ '--job-kpi-color': cfg.color }}
            onClick={() => setCertStatusFilter(certStatusFilter === key ? 'all' : key)}>
            <span>{cfg.label}</span>
            <strong>{certCounts[key]}</strong>
          </button>
        ))}
      </div>

      <div style={{ display:'inline-flex', gap:6, margin:'0 0 20px', padding:4, background:'var(--color-parchment)', border:'1px solid var(--border-1)', borderRadius:10, boxShadow:'0 8px 22px rgba(20,20,19,.06)' }}>
        <button type="button" onClick={() => setCertView('current')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:certView === 'current' ? 700 : 500, color:certView === 'current' ? 'var(--fg-1)' : 'var(--fg-2)', background:certView === 'current' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (certView === 'current' ? 'var(--border-1)' : 'transparent'), boxShadow:certView === 'current' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Aktuell <span style={{ color:'var(--color-accent)' }}>{rows.length}</span>
        </button>
        <button type="button" onClick={() => setCertView('wartung')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:certView === 'wartung' ? 700 : 500, color:certView === 'wartung' ? 'var(--fg-1)' : 'var(--fg-2)', background:certView === 'wartung' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (certView === 'wartung' ? 'var(--border-1)' : 'transparent'), boxShadow:certView === 'wartung' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Wartungsliste <span style={{ color:'var(--color-accent)' }}>{pendingCertUploads.filter(item => !item.approved).length}</span>
        </button>
      </div>

      {certView === 'current' ? (
      <>
      <div className="toolbar" style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        {certGroupBy && <button type="button" onClick={() => setCertGroupBy('')} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Gruppierung aufheben</button>}
        <span className="muted small" style={{marginLeft:'auto'}}>{sorted.length} Nachweise</span>
      </div>

      {Object.entries(certColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px', padding:'10px 0' }}>
          {Object.entries(certColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:999, background:'#efede8', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{certColumnLabel(col)}:</span>
              <strong style={{ fontWeight:500 }}>{value}</strong>
              <button type="button" onClick={() => toggleColumnFilterValue(col, value)}
                style={{ border:0, background:'transparent', cursor:'pointer', color:'var(--fg-2)', padding:0, lineHeight:1, display:'inline-flex' }}
                aria-label={`${value} Filter entfernen`}>
                <Icon name="x" size={14} />
              </button>
            </span>
          )))}
          <button type="button" onClick={() => setCertColumnFilters({})}
            style={{ border:'1px solid var(--border-1)', background:'white', borderRadius:999, padding:'6px 10px', cursor:'pointer', font:'inherit', fontSize:13, color:'var(--fg-2)' }}>
            Alle Filter löschen
          </button>
        </div>
      )}

      {certSelectedIds.size > 0 && (
        <div className="job-bulkbar">
          <strong>{certSelectedIds.size} ausgewählt</strong>
          <button type="button"><Icon name="download" size={14} />PDF export</button>
          <select defaultValue="">
            <option value="">Status ändern</option>
            <option value="valid">Gültig</option>
            <option value="warn">Läuft bald ab</option>
            <option value="expired">Abgelaufen</option>
            <option value="missing">Fehlt</option>
          </select>
          <button type="button" className="is-danger" onClick={() => setCertSelectedIds(new Set())}><Icon name="x" size={14} />Löschen</button>
        </div>
      )}

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:32 }}><input type="checkbox" onChange={e => {
                if (e.target.checked) setCertSelectedIds(new Set(sorted.map(f => f.id)));
                else setCertSelectedIds(new Set());
              }} style={{ cursor:'pointer', accentColor:'var(--color-accent)' }} /></th>
              {certColumns.map(col => <ColumnHeader key={col.key} col={col} />)}
              <th style={{ textAlign:'center' }}>Freigabe für Mitarbeiter</th><th style={{ textAlign:'center' }}>Aktionen</th><th style={{ textAlign:'center' }}>Versionen</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r, index) => {
              const status = r.cert.manualStatus || calcStatus(r.cert.expiresAt);
              const isSelected = certSelectedIds.has(r.id);
              const groupValue = certGroupBy ? certColumnValue(r, certGroupBy) : '';
              const previous = certGroupBy && index > 0 ? certColumnValue(visibleRows[index - 1], certGroupBy) : null;
              return (
                <React.Fragment key={r.id}>
                {certGroupBy && groupValue !== previous && (
                  <tr>
                    <td colSpan={10} style={{ background:'var(--color-parchment)', color:'var(--fg-1)', fontWeight:700, padding:'10px 14px' }}>
                      {certColumnLabel(certGroupBy)}: {groupValue}
                    </td>
                  </tr>
                )}
                <tr style={{ background: isSelected ? 'var(--color-parchment)' : undefined }}>
                  <td style={{ textAlign:'center' }}><input type="checkbox" checked={isSelected} onChange={e => {
                    const s = new Set(certSelectedIds);
                    if (e.target.checked) s.add(r.id);
                    else s.delete(r.id);
                    setCertSelectedIds(s);
                  }} style={{ cursor:'pointer', accentColor:'var(--color-accent)' }} /></td>
                  <td onClick={() => openCurrentCertEditor(r)} title="Nachweis bearbeiten" style={{ cursor:'pointer' }}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div className={'avatar avatar--' + r.emp.color} style={{width:26, height:26, fontSize:11}}>{r.emp.initials}</div>
                      <div>
                        <div style={{fontWeight:500}}>{r.emp.name}</div>
                        <div className="small muted">{window.company(r.emp.company)?.short} Â· {r.emp.department}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.training.short}</td>
                  <td className="num">{formatIssuedDate(r.cert)}</td>
                  <td className="num" style={{ fontWeight: (status==='warn'||status==='expired') ? 600 : undefined, color: status==='warn'?'#8a6a1f':status==='expired'?'#a13232':undefined }}>{window.fmtDE(r.cert.expiresAt)}</td>
                  <td style={{ whiteSpace:'nowrap', fontSize:12, color: status==='expired'?'#a13232':status==='warn'?'#8a6a1f':'var(--fg-2)' }}>{formatRemaining(r.cert.expiresAt)}</td>
                  <td><StatusBadge status={status} /></td>
                  <td style={{ textAlign:'center', whiteSpace:'nowrap' }}>
                    <label style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:12, color: releasedCerts[r.id] ? '#3f7a4a' : 'var(--fg-3)', fontWeight:600 }}>
                      <input type="checkbox" checked={!!releasedCerts[r.id]} onChange={() => toggleEmployeeRelease(r)} style={{ width:18, height:18, accentColor:'#3f7a4a', cursor:'pointer' }} />
                      {releasedCerts[r.id] ? 'Freigegeben' : 'Nicht freigegeben'}
                    </label>
                  </td>
                  <td style={{ textAlign:'center', whiteSpace:'nowrap' }}>
                    <button onClick={() => setCertPdfModal({ title: r.training.name, training: r.training.short })} title="Vorschau" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-2)', padding:'4px' }}><Icon name="eye" size={14} /></button>
                    <button title="Bearbeiten" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-2)', padding:'4px' }}><Icon name="edit" size={14} /></button>
                    <button title="Löschen" style={{ background:'none', border:'none', cursor:'pointer', color:'#a13232', padding:'4px' }}><Icon name="trash" size={14} /></button>
                  </td>
                  <td style={{ textAlign:'center', whiteSpace:'nowrap' }}>
                    <button title="Versionen anzeigen" style={{ background:'none', border:'1px solid var(--border-1)', borderRadius:6, cursor:'pointer', color:'var(--fg-2)', fontSize:12, padding:'4px 8px', fontFamily:'inherit' }}>Versionen</button>
                  </td>
                </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      </>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <ColumnHeader col={{ key:'employee', label:'Mitarbeiter' }} />
                <ColumnHeader col={{ key:'training', label:'Zertifikat / Schulung' }} />
                <ColumnHeader col={{ key:'issuedAt', label:'Ausstellungsdatum' }} />
                <ColumnHeader col={{ key:'expiresAt', label:'Ablaufdatum' }} />
                <ColumnHeader col={{ key:'remaining', label:'Restlaufzeit' }} />
                <ColumnHeader col={{ key:'status', label:'Status' }} />
                <th style={{ textAlign:'center' }}>Freigabe für Mitarbeiter</th>
                <th style={{ textAlign:'center' }}>Aktionen</th>
                <th style={{ textAlign:'center' }}>Versionen</th>
              </tr>
            </thead>
            <tbody>
              {pendingCertUploads.filter(item => !item.approved).map(item => {
                const status = calcStatus(item.expiresAt);
                return (
                  <tr key={item.id}>
                    <td onClick={() => openPendingCertEditor(item)} title="Nachweis bearbeiten" style={{ cursor:'pointer' }}>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div className={'avatar avatar--' + item.emp.color} style={{width:26, height:26, fontSize:11}}>{item.emp.initials}</div>
                        <div>
                          <div style={{fontWeight:500}}>{item.emp.name}</div>
                          <div className="small muted">{window.company(item.emp.company)?.short} · {item.emp.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.trainingName}</td>
                    <td className="num">{window.fmtDE(item.issuedAt)}</td>
                    <td className="num" style={{ fontWeight: status === 'warn' || status === 'expired' ? 600 : undefined }}>{window.fmtDE(item.expiresAt)}</td>
                    <td style={{ whiteSpace:'nowrap', fontSize:12 }}>{formatRemaining(item.expiresAt)}</td>
                    <td><StatusBadge status={status} /></td>
                    <td style={{ textAlign:'center' }}>
                      <label className="release-toggle" title="Für Mitarbeiter freigeben">
                        <input type="checkbox" checked={false} onChange={() => togglePendingCertRelease(item)} />
                        <span>Freigeben</span>
                      </label>
                    </td>
                    <td style={{ textAlign:'center', whiteSpace:'nowrap' }}>
                      <button onClick={() => setCertPdfModal({ title: item.trainingName, training: item.trainingName })} title="Vorschau" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-2)', padding:'4px' }}><Icon name="eye" size={14} /></button>
                      <button title="Bearbeiten" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-2)', padding:'4px' }}><Icon name="edit" size={14} /></button>
                      <button title="Löschen" onClick={() => savePendingCertUploads(pendingCertUploads.filter(upload => upload.id !== item.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'#a13232', padding:'4px' }}><Icon name="trash" size={14} /></button>
                    </td>
                    <td style={{ textAlign:'center' }}><button style={{ background:'none', border:'1px solid var(--border-1)', borderRadius:6, cursor:'pointer', color:'var(--fg-2)', fontSize:12, padding:'4px 8px', fontFamily:'inherit' }}>Versionen</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {certFilterPanel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.16)', display:'flex', justifyContent:'flex-end' }} onClick={() => setCertFilterPanel(null)}>
          <aside style={{ width:390, maxWidth:'92vw', height:'100%', background:'white', boxShadow:'-18px 0 42px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 14px' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach „{certColumnLabel(certFilterPanel)}“</h2>
              <button type="button" className="icon-btn" onClick={() => setCertFilterPanel(null)}><Icon name="x" size={22} /></button>
            </div>
            <div style={{ padding:'10px 28px 16px' }}>
              <input value={certFilterSearch} onChange={e => setCertFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden"
                style={{ width:'100%', boxSizing:'border-box', padding:'12px 10px', border:'1px solid var(--fg-2)', font:'inherit', fontSize:16 }} />
            </div>
            <div style={{ overflowY:'auto', padding:'8px 28px', flex:1 }}>
              {visibleFilterValues.map(value => (
                <label key={value} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:16, color:'var(--fg-1)' }}>
                  <input type="checkbox" checked={(certColumnFilters[certFilterPanel] || []).includes(value)} onChange={() => toggleColumnFilterValue(certFilterPanel, value)}
                    style={{ width:20, height:20, accentColor:'var(--color-accent)' }} />
                  {value}
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, padding:'16px 28px 22px', borderTop:'1px solid var(--border-1)' }}>
              <button type="button" className="btn btn--primary" onClick={() => setCertFilterPanel(null)} disabled={!(certColumnFilters[certFilterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => clearColumnFilter(certFilterPanel)}>Auswahl aufheben</button>
            </div>
          </aside>
        </div>
      )}

      {certPdfModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={() => setCertPdfModal(null)}>
          <div style={{ background:'white', borderRadius:12, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxWidth:600, maxHeight:'90vh', overflow:'auto', padding:32 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', color:'#999', marginBottom:6 }}>Janning-Gruppe Â· Zertifikat</div>
              <div style={{ fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#1a1a1a', lineHeight:1.3 }}>{certPdfModal.title}</div>
              <div style={{ fontSize:12, color:'#666', marginTop:6 }}>{certPdfModal.training}</div>
            </div>
            <div style={{ background:'#f5f5f5', padding:40, borderRadius:8, textAlign:'center', color:'#999', marginBottom:20 }}>ðŸ“„ PDF-Vorschau (Beispiel)</div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setCertPdfModal(null)} style={{ flex:1, padding:'10px 16px', border:'1px solid var(--border-1)', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'inherit', background:'transparent' }}>SchlieÃŸen</button>
              <button style={{ flex:1, padding:'10px 16px', background:'var(--color-accent)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500 }}>ðŸ“¥ Herunterladen</button>
            </div>
          </div>
        </div>
      )}
      {selectedCertRecord && (
        <CertEditPanel
          record={selectedCertRecord}
          onClose={() => setSelectedCertRecord(null)}
          onSave={saveCertEditor}
          formatRemaining={formatRemaining}
        />
      )}
    </div>
  );
}

function CertEditPanel({ record, onClose, onSave, formatRemaining }) {
  const [form, setForm] = React.useState({
    employeeName: record.emp.name,
    personalNr: record.emp.personalNr,
    company: window.company(record.emp.company)?.name || '',
    department: record.emp.department || '',
    position: record.emp.position || '',
    trainingName: record.trainingName || '',
    category: record.category || '',
    issuedAt: record.issuedAt || '',
    expiresAt: record.expiresAt || '',
    docNr: record.docNr || '',
    documentName: record.documentName || (record.docNr || record.trainingName || 'Dokument') + '.pdf',
    documentNames: record.documentNames?.length ? record.documentNames : [record.documentName || (record.docNr || record.trainingName || 'Dokument') + '.pdf'],
    status: record.status || 'valid',
    released: !!record.released,
  });
  const [newDocName, setNewDocName] = React.useState('');
  const previewDocument = (name) => {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'info', message: `Vorschau geöffnet: ${name}` } }));
  };
  const addDocument = () => {
    const name = newDocName.trim() || `Anlage-${(form.documentNames || []).length + 1}.pdf`;
    setField('documentNames', [...(form.documentNames || []), name]);
    setNewDocName('');
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: `Anlage hinzugefügt: ${name}` } }));
  };
  const removeDocument = (name) => {
    setField('documentNames', (form.documentNames || []).filter(doc => doc !== name));
  };
  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const statusLabels = {
    valid: 'Gültig',
    warn: 'Läuft bald ab',
    expired: 'Abgelaufen',
    missing: 'Fehlt',
    in_pruefung: 'In Prüfung',
    hochgeladen: 'Hochgeladen',
  };
  const fieldInput = { width:'100%', boxSizing:'border-box', border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', padding:'8px 10px', font:'inherit', fontSize:13, color:'var(--fg-1)' };
  const fieldLabel = { display:'grid', gap:5 };
  const labelText = { fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.35)', backdropFilter:'blur(1px)' }} />
      <aside style={{
        position:'fixed', top:0, right:0, bottom:0, zIndex:3100,
        width:620, maxWidth:'calc(100vw - 24px)', background:'var(--color-ivory)',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.16)',
        display:'flex', flexDirection:'column',
        animation:'slideInRight 220ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ background:'var(--color-near-black)', color:'#fff', padding:'20px 22px 16px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className={'avatar avatar--' + record.emp.color} style={{ width:52, height:52, fontSize:18, flexShrink:0 }}>{record.emp.initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500 }}>{form.employeeName}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.62)', marginTop:3 }}>
                {form.trainingName} · PN {form.personalNr}
              </div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10, borderRadius:999, padding:'4px 9px', background:'rgba(255,255,255,0.12)', color:'#fff', fontWeight:700, fontSize:11 }}>
                {record.kind === 'pending' ? 'Wartungsliste' : 'Aktueller Nachweis'}
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.6)', padding:4, flexShrink:0 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        <div style={{ borderBottom:'1px solid var(--border-1)', background:'var(--color-parchment)', padding:'12px 18px', fontWeight:700 }}>
          Zertifikat bearbeiten
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <label style={fieldLabel}>
              <span style={labelText}>Mitarbeiter</span>
              <input value={form.employeeName} onChange={e => setField('employeeName', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Personalnummer</span>
              <input value={form.personalNr} onChange={e => setField('personalNr', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Firma</span>
              <input value={form.company} onChange={e => setField('company', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Position</span>
              <input value={form.position} onChange={e => setField('position', e.target.value)} style={fieldInput} />
            </label>
            <label style={{ ...fieldLabel, gridColumn:'1 / -1' }}>
              <span style={labelText}>Zertifikat / Schulung</span>
              <input value={form.trainingName} onChange={e => setField('trainingName', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Kategorie</span>
              <input value={form.category} onChange={e => setField('category', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Dokumentnummer</span>
              <input value={form.docNr} onChange={e => setField('docNr', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Ausstellungsdatum</span>
              <input type="date" value={form.issuedAt} onChange={e => setField('issuedAt', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Ablaufdatum</span>
              <input type="date" value={form.expiresAt} onChange={e => setField('expiresAt', e.target.value)} style={fieldInput} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Restlaufzeit</span>
              <input readOnly value={formatRemaining(form.expiresAt)} style={{ ...fieldInput, background:'var(--color-parchment)' }} />
            </label>
            <label style={fieldLabel}>
              <span style={labelText}>Status</span>
              <select value={form.status} onChange={e => setField('status', e.target.value)} style={{ ...fieldInput, cursor:'pointer' }}>
                {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <div style={{ gridColumn:'1 / -1', display:'grid', gap:8 }}>
              <span style={{ ...labelText, display:'inline-flex', alignItems:'center', gap:8 }}>
                <Icon name="link" size={14} />Dokument
              </span>
              <div style={{ padding:'10px 0 0', borderTop:'1px solid var(--border-1)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', alignContent:'flex-start', gap:8, flexWrap:'wrap', minHeight:82 }}>
                  {(form.documentNames || []).map(name => (
                    <span key={name} title="Klicken für Vorschau" onClick={() => previewDocument(name)}
                      style={{
                        display:'inline-flex', alignItems:'center', maxWidth:280, height:34,
                        borderRadius:999, background:'#bfecee', color:'#007980',
                        padding:'0 8px 0 14px', fontSize:15, cursor:'pointer',
                      }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
                      <button type="button" title="Anlage löschen" onClick={(ev) => { ev.stopPropagation(); removeDocument(name); }}
                        style={{ width:28, height:28, marginLeft:6, border:0, borderRadius:'50%', background:'transparent', color:'#007980', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon name="x" size={16} />
                      </button>
                    </span>
                  ))}
                  {!(form.documentNames || []).length && <span className="muted small">Keine Anlage hinterlegt.</span>}
                </div>
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <input value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Anlage hinzufügen"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDocument(); } }}
                    style={{ ...fieldInput, flex:1, borderRadius:0, borderColor:'#b7b1a8', color:'#007980' }} />
                  <button type="button" className="btn btn--ghost" onClick={addDocument}>Hinzufügen</button>
                </div>
              </div>
            </div>
            <label style={{ gridColumn:'1 / -1', display:'flex', alignItems:'center', gap:10, marginTop:4, padding:'12px 14px', border:'1px solid var(--border-1)', borderRadius:10, background:'var(--color-white)', cursor:'pointer' }}>
              <input type="checkbox" checked={form.released} onChange={e => setField('released', e.target.checked)} style={{ width:18, height:18, accentColor:'#3f7a4a' }} />
              <span style={{ fontWeight:700 }}>Freigabe für Mitarbeiter</span>
              <span className="muted small">Nach Freigabe sieht der Mitarbeiter den Nachweis im Portal.</span>
            </label>
          </div>
        </div>

        <div style={{ padding:'14px 22px 18px', borderTop:'1px solid var(--border-1)', background:'var(--color-ivory)', display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
          <button className="btn btn--primary" onClick={() => onSave(form)}>Speichern</button>
        </div>
      </aside>
    </>
  );
}

function InstructionsView({ activeCompany }) {
  const [selectedInstr, setSelectedInstr] = React.useState(null);
  const [participantPanel, setParticipantPanel] = React.useState(null); // { instr, participant }

  // Mock data: Unterweisungen
  const instructions = [
    {
      id: 'uw1',
      code: 'UW-2026-014',
      version: 'v3.2',
      title: 'Jahresunterweisung Tiefbau 2026',
      date: '2026-04-29',
      location: 'Tiefbau',
      instructor: 'Michael Janning',
      group: 'Poliere + Maschinisten',
      description: 'Pflichtunterweisung nach Â§12 ArbSchG. Themen: Absturz, PSA, Verkehrssicherung, Baustellenordnung, Gefahrstoffe.',
      explanation: 'Gemeinsame Durchsprache anhand PrÃ¤sentation, anschlieÃŸend Fragerunde und Unterschrift.',
      status: 'aktiv',
      participants: [
        { name: 'Markus Brinker', role: 'Polier', date: '2026-04-29', signed: true, notes: '' },
        { name: 'Mustafa Kempers', role: 'Bauteiter', date: '2026-04-29', signed: true, notes: '' },
        { name: 'Oliver Lammers', role: 'Ausbildender', date: '2026-04-29', signed: true, notes: '' },
        { name: 'Dirk JÃ¼rgens', role: 'Krank', date: null, signed: false, notes: 'Nachholen erforderlich' },
        { name: 'Ralf Kowalski', role: 'Urlaub', date: null, signed: false, notes: 'Nachholen erforderlich' },
        { name: 'Lukas SchrÃ¶der', role: 'AuswÃ¤rtig', date: null, signed: false, notes: 'Nachholen erforderlich' },
      ]
    },
    {
      id: 'uw2',
      code: 'UW-2026-015',
      version: 'v1.4',
      title: 'Umgang mit Erdbaumaschinen',
      date: '2026-03-12',
      location: 'Tiefbau',
      instructor: 'Michael Janning',
      group: 'MaschinenfÃ¼hrer',
      description: 'Sicherheit bei Bedienung von Baggern und Walzen.',
      explanation: 'Praktische Einweisung vor Ort.',
      status: 'aktiv',
      participants: [
        { name: 'Klaus Richter', role: 'MaschinenfÃ¼hrer', date: '2026-03-12', signed: true, notes: '' },
        { name: 'Stefan MÃ¼ller', role: 'MaschinenfÃ¼hrer', date: '2026-03-12', signed: true, notes: '' },
      ]
    },
  ];

  const selected = instructions.find(i => i.id === selectedInstr) || instructions[0];
  if (selectedInstr === null && instructions.length > 0) setSelectedInstr(instructions[0].id);

  const signed = selected.participants.filter(p => p.signed).length;
  const total = selected.participants.length;
  const pct = Math.round((signed / total) * 100);

  return (
    <div style={{ display:'flex', height:'calc(100vh - 200px)', gap:0 }}>
      {/* Left: List */}
      <div style={{ width:'40%', borderRight:'1px solid var(--border-1)', overflowY:'auto', padding:'20px' }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:16, color:'var(--fg-1)' }}>
          {instructions.length} EINTRÃ„GE
        </div>
        {instructions.map(u => (
          <button key={u.id} onClick={() => setSelectedInstr(u.id)}
            style={{ width:'100%', padding:'14px', marginBottom:12, borderRadius:10, border:'1px solid var(--border-1)', background: selectedInstr === u.id ? 'var(--color-parchment)' : 'white', cursor:'pointer', textAlign:'left', transition:'all 150ms' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--fg-1)' }}>{u.title}</div>
            <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:4 }}>{u.code} Â· {u.version}</div>
            <div style={{ fontSize:11, color:'var(--fg-2)', marginTop:4 }}>{u.location} Â· {window.fmtDE(u.date)}</div>
            <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center' }}>
              <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', background:'#eff5ed', color:'#3f7a4a', borderRadius:4 }}>Aktiv</span>
              <span style={{ fontSize:10, color:'var(--fg-3)' }}>{u.participants.length} TN</span>
            </div>
          </button>
        ))}
      </div>

      {/* Right: Detail */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, color:'var(--fg-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{selected.code} Â· {selected.version}</div>
          <h1 style={{ margin:'0 0 16px 0', fontSize:28, fontWeight:700, lineHeight:1.2 }}>{selected.title}</h1>
          <div style={{ display:'flex', gap:32, fontSize:13, color:'var(--fg-2)' }}>
            <div><strong>DURCHGEFÃœHRT</strong><br />{window.fmtDE(selected.date)}</div>
            <div><strong>UNTERWEISENDER</strong><br />{selected.instructor}</div>
            <div><strong>GRUPPE / ABTEILUNG</strong><br />{selected.group}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom:32 }}>
          <h3 style={{ margin:'0 0 12px 0', fontSize:13, fontWeight:600, color:'var(--fg-1)' }}>ÃœBERSETZUNG</h3>
          <div style={{ fontSize:12, color:'var(--fg-2)', lineHeight:1.6, background:'#f9f9f9', padding:'16px', borderRadius:8 }}>
            {selected.description}
          </div>
        </div>

        <div style={{ marginBottom:32 }}>
          <h3 style={{ margin:'0 0 12px 0', fontSize:13, fontWeight:600, color:'var(--fg-1)' }}>ERKLÃ„RUNG</h3>
          <div style={{ fontSize:12, color:'var(--fg-2)', lineHeight:1.6 }}>
            {selected.explanation}
          </div>
        </div>

        {/* Participants */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ margin:0, fontSize:13, fontWeight:600, color:'var(--fg-1)' }}>TEILNEHMERLISTE</h3>
            <div style={{ fontSize:11, color:'var(--fg-3)' }}>{signed} von {total} unterschrieben</div>
          </div>

          {/* Progress bar */}
          <div style={{ height:8, background:'#e8e8e8', borderRadius:999, marginBottom:16, overflow:'hidden' }}>
            <div style={{ height:'100%', background: pct === 100 ? '#3f7a4a' : '#8a6a1f', width: pct + '%' }} />
          </div>

          {/* Participant table */}
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'12px 20px' }}>
            {selected.participants.map((p, i) => (
              <React.Fragment key={i}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background: p.signed ? '#eff5ed' : '#fdf3e0', display:'flex', alignItems:'center', justifyContent:'center', color: p.signed ? '#3f7a4a' : '#8a6a1f', fontWeight:600, fontSize:11 }}>
                    {p.name.split(' ')[0][0]}{p.name.split(' ')[1][0]}
                  </div>
                  <div>
                    <button onClick={() => setParticipantPanel({ instr: selected, participant: p })}
                      style={{ background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--color-accent)' }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--fg-3)' }}>{p.role}</div>
                    </button>
                  </div>
                </div>
                <div style={{ fontSize:12, color: p.signed ? 'var(--fg-2)' : 'var(--fg-3)' }}>
                  {p.signed ? (
                    <>
                      <span style={{ fontWeight:600, color:'#3f7a4a' }}>âœ“</span> {window.fmtDE(p.date)}
                    </>
                  ) : (
                    <span style={{ fontWeight:600, color:'#8a6a1f' }}>â€”</span>
                  )}
                </div>
                <div style={{ fontSize:11, color:'var(--fg-3)', textAlign:'right' }}>
                  {!p.signed && 'Nachholen'}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Participant Detail Panel */}
      {participantPanel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={() => setParticipantPanel(null)}>
          <div style={{ background:'white', borderRadius:12, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxWidth:450, width:'100%', padding:32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ margin:0, fontSize:18, fontWeight:600 }}>{participantPanel.participant.name}</h2>
              <button onClick={() => setParticipantPanel(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--fg-3)' }}>âœ•</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Signed Status */}
              <div style={{ padding:'14px', background: participantPanel.participant.signed ? '#eff5ed' : '#fdf3e0', borderRadius:8, borderLeft:`4px solid ${participantPanel.participant.signed ? '#3f7a4a' : '#8a6a1f'}` }}>
                <div style={{ fontSize:11, fontWeight:600, color: participantPanel.participant.signed ? '#3f7a4a' : '#8a6a1f', textTransform:'uppercase', letterSpacing:0.5 }}>
                  {participantPanel.participant.signed ? 'âœ… Hat unterschrieben' : 'â³ Noch nicht unterschrieben'}
                </div>
                {participantPanel.participant.date && (
                  <div style={{ fontSize:12, color:'var(--fg-2)', marginTop:4 }}>
                    am {window.fmtDE(participantPanel.participant.date)}
                  </div>
                )}
              </div>

              {/* Last Training */}
              <div>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:8, color:'var(--fg-1)' }}>Letzte Unterweisung</div>
                <div style={{ fontSize:12, color:'var(--fg-2)' }}>
                  {participantPanel.instr.title}<br />
                  <span style={{ color:'var(--fg-3)', fontSize:11 }}>{window.fmtDE(participantPanel.instr.date)}</span>
                </div>
              </div>

              {/* Notes */}
              {participantPanel.participant.notes && (
                <div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:6, color:'var(--fg-1)' }}>Notizen</div>
                  <div style={{ fontSize:12, color:'var(--fg-2)', padding:'8px 12px', background:'var(--color-parchment)', borderRadius:6 }}>
                    {participantPanel.participant.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display:'flex', gap:10, marginTop:12 }}>
                <button style={{ flex:1, padding:'10px 16px', background:'var(--color-accent)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500 }}>
                  ðŸ“„ Dokument Ã¶ffnen
                </button>
                <button style={{ flex:1, padding:'10px 16px', background: participantPanel.participant.signed ? '#eff5ed' : '#fdf3e0', color: participantPanel.participant.signed ? '#3f7a4a' : '#8a6a1f', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500 }}>
                  âœï¸ Status Ã¤ndern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { EmployeesView, TrainingsView, TrainingDetailPanel, ProvidersView, CompaniesView, CertsView, InstructionsView });
