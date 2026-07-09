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

  // Sortierung mit localStorage
  const [sort, setSort] = React.useState(() => {
    try { const s = localStorage.getItem('emp_sort'); return s ? JSON.parse(s) : { col: 'name', dir: 'asc' }; }
    catch { return { col: 'name', dir: 'asc' }; }
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
    { key: 'pn', label: 'PN' },
    { key: 'firma', label: 'Firma' },
    { key: 'dept', label: 'Abteilung' },
    { key: 'pos', label: 'Position' },
    { key: 'group', label: 'Gruppe' },
    { key: 'workload', label: 'Arbeitszeit' },
    { key: 'entry', label: 'Eintritt' },
    { key: 'status', label: 'Status' },
  ];
  const empColumnLabel = (key) => empColumns.find(col => col.key === key)?.label || key;
  const empColumnValue = (e, key) => {
    if (key === 'name') return `${e.lastName}, ${e.firstName}`;
    if (key === 'pn') return e.personalNr;
    if (key === 'firma') return window.company(e.company)?.short || e.company;
    if (key === 'dept') return e.department;
    if (key === 'pos') return e.position;
    if (key === 'group') return employeeGroup(e);
    if (key === 'workload') return employeeWorkload(e);
    if (key === 'entry') return window.fmtDE(e.entry);
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
    let va, vb;
    if      (sort.col === 'name')   { va = a.lastName;    vb = b.lastName; }
    else if (sort.col === 'pn')     { va = a.personalNr;  vb = b.personalNr; }
    else if (sort.col === 'firma')  { va = window.company(a.company)?.short || ''; vb = window.company(b.company)?.short || ''; }
    else if (sort.col === 'dept')   { va = a.department;  vb = b.department; }
    else if (sort.col === 'pos')    { va = a.position;    vb = b.position; }
    else if (sort.col === 'group')  { va = employeeGroup(a); vb = employeeGroup(b); }
    else if (sort.col === 'workload') { va = employeeWorkload(a); vb = employeeWorkload(b); }
    else if (sort.col === 'entry')  { va = a.entry;       vb = b.entry; }
    else if (sort.col === 'status') { va = a.status;      vb = b.status; }
    else                            { va = a.lastName;    vb = b.lastName; }
    const cmp = String(va).localeCompare(String(vb), 'de');
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

  const EmpColumnHeader = ({ col }) => {
    const active = sort.col === col.key || (empColumnFilters[col.key] || []).length > 0 || empGroupBy === col.key;
    return (
      <th style={{ position:'relative', whiteSpace:'nowrap' }}>
        <button type="button" onClick={() => setEmpColumnMenu(empColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:0, padding:0, cursor:'pointer', font:'inherit', textTransform:'inherit', color: active ? 'var(--fg-1)' : 'inherit', fontWeight: active ? 700 : undefined }}>
          {col.label}
          <span style={{ fontSize:10 }}>{sort.col === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
        </button>
        {empColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)' }}>
            <button type="button" onClick={() => setEmpSort(col.key, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setEmpSort(col.key, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => openEmpFilter(col.key)} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setEmpGroupBy(empGroupBy === col.key ? '' : col.key); setEmpSort(col.key, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
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
          <button className="btn btn--ghost"><Icon name="upload" size={14} />Import</button>
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
        <div className="muted small" style={{marginLeft:'auto'}}>{emps.length} Personen</div>
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
          <button type="button"><Icon name="download" size={14} />PDF export</button>
          <select defaultValue="">
            <option value="">Status ändern</option>
            <option value="aktiv">Aktiv</option>
            <option value="inaktiv">Inaktiv</option>
          </select>
          <button type="button" className="is-danger" onClick={() => setDeleteConfirm('bulk')}><Icon name="x" size={14} />Löschen</button>
        </div>
      )}

	      <div className="tbl-wrap">
	        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign:'center', padding:'0 8px' }}>
                <input
	                  type="checkbox"
	                  checked={selected.size > 0 && selected.size === emps.length}
	                  onChange={toggleAll}
                  style={{ cursor:'pointer', width:18, height:18, accentColor:'var(--color-accent)' }}
                />
              </th>
              {empColumns.slice(0, 8).map(col => <EmpColumnHeader key={col.key} col={col} />)}
              <th style={{ width: 60, textAlign:'center' }}>
                <span title="Telefon" style={{ cursor:'default' }}>
                  <PhoneIcon size={13} />
                </span>
              </th>
              <th style={{ width: 60, textAlign:'center' }}>
                <span title="E-Mail" style={{ cursor:'default' }}>
                  <MailIcon size={13} />
                </span>
              </th>
              <th style={{ width: 60, textAlign:'center' }}>
                <span title="Adresse" style={{ cursor:'default' }}>
                  <LocationIcon size={13} />
                </span>
              </th>
              <EmpColumnHeader col={empColumns.find(col => col.key === 'status')} />
              <th style={{ width: 130, textAlign:'center' }}>Aktionen</th>
              <th style={{ width: 120, textAlign:'center' }}>Versionen</th>
            </tr>
          </thead>
          <tbody>
            {emps.map((e, index) => {
              const isSelected = selectedEmp?.id === e.id;
              const isHovered  = hoveredRow === e.id;
              const isChecked = selected.has(e.id);
              const groupValue = empGroupBy ? empColumnValue(e, empGroupBy) : '';
              const previous = empGroupBy && index > 0 ? empColumnValue(emps[index - 1], empGroupBy) : null;
              return (
              <React.Fragment key={e.id}>
              {empGroupBy && groupValue !== previous && (
                <tr>
                  <td colSpan={15} style={{ background:'var(--color-parchment)', color:'var(--fg-1)', fontWeight:700, padding:'10px 14px' }}>
                    {empColumnLabel(empGroupBy)}: {groupValue}
                  </td>
                </tr>
              )}
              <tr key={e.id}
                onMouseEnter={() => setHoveredRow(e.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => setSelectedEmp(isSelected ? null : e)}
                style={{ cursor:'pointer', background: isSelected ? 'rgba(201,100,66,0.06)' : (isChecked ? 'rgba(201,100,66,0.03)' : undefined), outline: isSelected ? '2px solid var(--color-accent)' : undefined, outlineOffset:-2 }}>
                <td onClick={ev => { ev.stopPropagation(); toggleRow(e.id); }} style={{ textAlign:'center', padding:'0 8px' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleRow(e.id)}
                    onClick={ev => ev.stopPropagation()}
                    style={{ cursor:'pointer', width:18, height:18, accentColor:'var(--color-accent)' }}
                  />
                </td>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div className={'avatar avatar--' + e.color} style={{width:30, height:30, fontSize:11}}>{e.initials}</div>
                    <div>
                      <div style={{fontWeight:500}}>{e.lastName}, {e.firstName}</div>
                      <div className="small muted">{e.email}</div>
                    </div>
                  </div>
                </td>
                <td className="num">{e.personalNr}</td>
                <td><CompanyChip id={e.company} size={22} /></td>
                <td>{e.department}</td>
                <td>{e.position}</td>
                <td>{employeeGroup(e)}</td>
                <td>{employeeWorkload(e)}</td>
                <td className="num">{window.fmtDE(e.entry)}</td>
                <td style={{ textAlign:'center', padding:'0 4px' }}>
                  <ContactIconCell icon={<PhoneIcon size={13} />} tooltip={e.phone} href={'tel:' + e.phone} />
                </td>
                <td style={{ textAlign:'center', padding:'0 4px' }}>
                  <ContactIconCell icon={<MailIcon size={13} />} tooltip={e.email} href={'mailto:' + e.email} />
                </td>
                <td style={{ textAlign:'center', padding:'0 4px' }}>
                  <ContactIconCell icon={<LocationIcon size={13} />} tooltip={e.address} href={undefined} />
                </td>
                <td>
                  {e.status === 'aktiv'
                    ? <span className="badge badge--valid"><span className="badge__dot" />Aktiv</span>
                    : <span className="badge"><span className="badge__dot" />Inaktiv</span>}
                </td>
                {/* Quick Actions */}
	                <td onClick={ev => ev.stopPropagation()} style={{ padding:'0 10px', whiteSpace:'nowrap' }}>
	                  <div style={{
	                    display:'flex', alignItems:'center', gap:2,
	                    opacity: 1,
	                    transition:'opacity 120ms',
	                    pointerEvents: 'auto',
	                  }}>
                    <QuickBtn title="Bearbeiten" onClick={() => setSelectedEmp(e)}>
                      <PencilIcon />
                    </QuickBtn>
                    <QuickBtn title="Dokumente" onClick={() => { setSelectedEmp(e); /* opens docs tab via state */ window.__empDocTab = true; }}>
                      <DocIcon />
                    </QuickBtn>
                    <QuickBtn title="Schulung anmelden" onClick={() => setRegisterEmp(e)}>
                      <SchulungIcon />
                    </QuickBtn>
                    <MessageQuickBtn count={unreadForEmployee(e)} onClick={() => setMessageEmp(e)} />
	                    <QuickBtn title="Löschen" danger onClick={() => setDeleteConfirm(e)}>
	                      <TrashIcon />
	                    </QuickBtn>
	                  </div>
	                </td>
	                <td onClick={ev => ev.stopPropagation()} style={{ textAlign:'center', whiteSpace:'nowrap' }}>
	                  <button type="button" className="job-small-btn">Versionen</button>
	                </td>
	              </tr>
              </React.Fragment>
              );
            })}
          </tbody>
	        </table>
	      </div>
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
  const [form, setForm] = React.useState({
    vorname:'', nachname:'', pn:'', firma:'', abteilung:'', position:'',
    eintritt:'', telefon:'', email:'', adresse:'',
    passwort:'', rolle:'mitarbeiter', status:'aktiv', foto:null,
  });
  const [errors, setErrors] = React.useState({});
  const [saved, setSaved] = React.useState(false);
  const [photoPreview, setPhotoPreview] = React.useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.vorname.trim())   e.vorname  = 'Pflichtfeld';
    if (!form.nachname.trim())  e.nachname = 'Pflichtfeld';
    if (!form.pn.trim())        e.pn       = 'Pflichtfeld';
    if (!form.firma)            e.firma    = 'Pflichtfeld';
    if (!form.email.trim())     e.email    = 'Pflichtfeld';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'UngÃ¼ltige E-Mail';
    if (!form.passwort)         e.passwort = 'Pflichtfeld';
    else if (form.passwort.length < 8) e.passwort = 'Mindestens 8 Zeichen';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setSaved(true);
    setTimeout(onClose, 2000);
  };

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoPreview(URL.createObjectURL(f));
      set('foto', f.name);
    }
  };

  const inp = {
    width:'100%', padding:'9px 12px', fontSize:13.5,
    border:'1px solid var(--border-1)', borderRadius:8,
    background:'var(--color-white)', color:'var(--fg-1)',
    outline:'none', fontFamily:'inherit', boxSizing:'border-box',
    transition:'border-color 150ms',
  };
  const inpErr = { ...inp, borderColor:'#eac8c2', background:'#fdfafa' };

  const Field = ({ label, required, err, children }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color: err ? '#a13232' : 'var(--fg-3)', marginBottom:4 }}>
        {label}{required && <span style={{ color:'var(--color-accent)', marginLeft:3 }}>*</span>}
      </label>
      {children}
      {err && <div style={{ fontSize:11, color:'#a13232', marginTop:3 }}>{err}</div>}
    </div>
  );

  const SectionHead = ({ children }) => (
    <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.7, textTransform:'uppercase', color:'var(--color-accent)', marginBottom:12, marginTop:20, paddingBottom:6, borderBottom:'1px solid var(--border-1)' }}>{children}</div>
  );

  const positions = ['Polier','Bauleiter','Facharbeiter','Baumaschinist','KFZ-Mechaniker','Auszubildender','BÃ¼roangestellter','Fahrer','SchweiÃŸer'];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.5)', backdropFilter:'blur(3px)', display:'flex', alignItems:'flex-start', justifyContent:'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, height:'100vh', background:'var(--color-ivory)',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.18)',
        display:'flex', flexDirection:'column',
        animation:'slideInRight 220ms cubic-bezier(0.4,0,0.2,1)',
        overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border-1)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--color-near-black)', color:'#fff' }}>
          <div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500 }}>Neuer Mitarbeiter</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 }}>Pflichtfelder mit * markiert</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.6)', padding:4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {saved ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:40 }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'#eff5ed', border:'1px solid #cde1cf', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>âœ“</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500, color:'#3f7a4a', textAlign:'center' }}>Mitarbeiter wurde gespeichert</div>
            <div style={{ fontSize:13, color:'var(--fg-3)' }}>{form.vorname} {form.nachname} wurde erfolgreich angelegt.</div>
          </div>
        ) : (
          <div style={{ flex:1, padding:'20px 24px 100px', overflowY:'auto' }}>

            {/* Foto */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:8 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background: photoPreview ? 'transparent' : 'var(--color-warm-sand)', border:'2px dashed var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, cursor:'pointer' }}
                onClick={() => document.getElementById('emp-foto-input').click()}>
                {photoPreview
                  ? <img src={photoPreview} alt="Foto" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                }
              </div>
              <div>
                <button onClick={() => document.getElementById('emp-foto-input').click()} className="btn btn--ghost" style={{ fontSize:12 }}>
                  <Icon name="upload" size={12} /> Foto hochladen
                </button>
                <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:4 }}>JPG, PNG Â· max 5 MB</div>
              </div>
              <input id="emp-foto-input" type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
            </div>

            {/* PersÃ¶nliche Daten */}
            <SectionHead>ðŸ‘¤ PersÃ¶nliche Daten</SectionHead>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Vorname" required err={errors.vorname}>
                <input value={form.vorname} onChange={e=>set('vorname',e.target.value)} style={errors.vorname ? inpErr : inp}
                  onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor=errors.vorname?'#eac8c2':'var(--border-1)'} />
              </Field>
              <Field label="Nachname" required err={errors.nachname}>
                <input value={form.nachname} onChange={e=>set('nachname',e.target.value)} style={errors.nachname ? inpErr : inp}
                  onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor=errors.nachname?'#eac8c2':'var(--border-1)'} />
              </Field>
            </div>
            <Field label="Personalnummer (PN)" required err={errors.pn}>
              <input value={form.pn} onChange={e=>set('pn',e.target.value)} placeholder="z. B. 2039" style={errors.pn ? inpErr : inp}
                onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor=errors.pn?'#eac8c2':'var(--border-1)'} />
            </Field>

            {/* Unternehmensdaten */}
            <SectionHead>ðŸ¢ Unternehmensdaten</SectionHead>
            <Field label="Firma" required err={errors.firma}>
              <select value={form.firma} onChange={e=>set('firma',e.target.value)} style={errors.firma ? {...inpErr, cursor:'pointer'} : {...inp, cursor:'pointer'}}>
                <option value="">â€” auswÃ¤hlen â€”</option>
                {window.SEED.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Abteilung">
                <select value={form.abteilung} onChange={e=>set('abteilung',e.target.value)} style={{...inp, cursor:'pointer'}}>
                  <option value="">â€” auswÃ¤hlen â€”</option>
                  {window.SEED.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Position">
                <select value={form.position} onChange={e=>set('position',e.target.value)} style={{...inp, cursor:'pointer'}}>
                  <option value="">â€” auswÃ¤hlen â€”</option>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Eintrittsdatum">
              <input type="date" value={form.eintritt} onChange={e=>set('eintritt',e.target.value)} style={inp}
                onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor='var(--border-1)'} />
            </Field>

            {/* Kontakt */}
            <SectionHead>ðŸ“ž Kontakt</SectionHead>
            <Field label="E-Mail" required err={errors.email}>
              <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="vorname.nachname@janning-gruppe.de" style={errors.email ? inpErr : inp}
                onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor=errors.email?'#eac8c2':'var(--border-1)'} />
            </Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Telefon">
                <input type="tel" value={form.telefon} onChange={e=>set('telefon',e.target.value)} placeholder="+49 5921 â€¦" style={inp}
                  onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor='var(--border-1)'} />
              </Field>
              <Field label="Adresse">
                <input value={form.adresse} onChange={e=>set('adresse',e.target.value)} placeholder="StraÃŸe, PLZ Ort" style={inp}
                  onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor='var(--border-1)'} />
              </Field>
            </div>

            {/* Zugang & Status */}
            <SectionHead>ðŸ” Zugang &amp; Status</SectionHead>
            <Field label="Passwort" required err={errors.passwort}>
              <input type="password" value={form.passwort} onChange={e=>set('passwort',e.target.value)} placeholder="Mindestens 8 Zeichen" style={errors.passwort ? inpErr : inp}
                onFocus={e=>e.target.style.borderColor='var(--color-accent)'} onBlur={e=>e.target.style.borderColor=errors.passwort?'#eac8c2':'var(--border-1)'} />
              {form.passwort && (
                <div style={{ marginTop:5, display:'flex', gap:4 }}>
                  {[...Array(4)].map((_,i) => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:99, background: form.passwort.length >= (i+1)*2 ? (form.passwort.length >= 8 ? '#5f9268' : '#c89b3f') : 'var(--color-warm-sand)' }} />
                  ))}
                  <span style={{ fontSize:10.5, color: form.passwort.length >= 8 ? '#3f7a4a' : '#8a6a1f', marginLeft:6, whiteSpace:'nowrap' }}>
                    {form.passwort.length >= 8 ? 'Stark' : 'Zu kurz'}
                  </span>
                </div>
              )}
            </Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Rolle">
                <select value={form.rolle} onChange={e=>set('rolle',e.target.value)} style={{...inp, cursor:'pointer'}}>
                  <option value="mitarbeiter">Mitarbeiter</option>
                  <option value="bauleiter">Bauleiter</option>
                  <option value="geschaeftsfuehrer">GeschÃ¤ftsfÃ¼hrer</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Status">
                <div style={{ display:'flex', gap:8, paddingTop:4 }}>
                  {[['aktiv','Aktiv','#3f7a4a','#eff5ed'],['inaktiv','Inaktiv','#a13232','#fbecea']].map(([val,label,color,bg]) => (
                    <button key={val} onClick={() => set('status', val)} style={{
                      flex:1, padding:'8px 0', fontSize:13, fontWeight:500, borderRadius:8,
                      border:'1px solid '+(form.status===val ? color : 'var(--border-1)'),
                      background: form.status===val ? bg : 'transparent',
                      color: form.status===val ? color : 'var(--fg-2)',
                      cursor:'pointer', fontFamily:'inherit', transition:'all 120ms',
                    }}>{label}</button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* Footer */}
        {!saved && (
          <div style={{ position:'sticky', bottom:0, padding:'16px 24px', borderTop:'1px solid var(--border-1)', background:'var(--color-ivory)', display:'flex', gap:10, flexShrink:0 }}>
            <button onClick={submit} className="btn btn--primary" style={{ flex:1, justifyContent:'center', fontSize:14 }}>
              Speichern
            </button>
            <button onClick={onClose} className="btn btn--ghost" style={{ flex:1, justifyContent:'center', fontSize:14 }}>
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrainingsView({ initialTrainingId = null } = {}) {
  const [selectedTraining, setSelectedTraining] = React.useState(null);
  const [categoryFilter, setCategoryFilter] = React.useState('Alle');
  const [statusFilter, setStatusFilter] = React.useState('alle'); // alle, fehlt, warnt, abgelaufen
  const [mandatoryFilter, setMandatoryFilter] = React.useState('alle'); // alle, pflicht, optional
  const [bulkSelectedEmps, setBulkSelectedEmps] = React.useState(new Set());
  const [trainingCreateOpen, setTrainingCreateOpen] = React.useState(false);
  const [trainingViewMode, setTrainingViewMode] = React.useState('cards');

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

  return (
    <div>
      <div className="view__header">
        <div />
        <div className="view__actions">
          <button className="btn btn--primary" onClick={() => setTrainingCreateOpen(true)}><Icon name="plus" size={14} />Schulung</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', marginBottom:16, flexWrap:'wrap', borderBottom:'1px solid var(--border-1)', paddingBottom:12 }}>
        {/* Kategorie Tabs */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding:'12px 18px',
                fontSize:14,
                fontWeight:600,
                letterSpacing:0.3,
                borderRadius:10,
                border: '1px solid var(--border-1)',
                background: categoryFilter === cat ? 'var(--color-white)' : 'var(--color-ivory)',
                color: categoryFilter === cat ? 'var(--color-accent)' : 'var(--fg-2)',
                cursor:'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.048)',
                transition:'all 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-white)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = categoryFilter === cat ? 'var(--color-white)' : 'var(--color-ivory)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.048)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Pflicht Filter */}
        <div className="select" style={{ marginLeft:'auto' }}>
          <select value={mandatoryFilter} onChange={e => setMandatoryFilter(e.target.value)} style={{ border:0, background:'transparent', font:'inherit', outline:'none', cursor:'pointer', fontSize:12 }}>
            <option value="alle">Alle Schulungen</option>
            <option value="pflicht">Nur Pflicht</option>
            <option value="optional">Nur Optional</option>
          </select>
        </div>
        <div className="training-view-toggle" aria-label="Ansicht wechseln">
          <button type="button" className={trainingViewMode === 'cards' ? 'is-active' : ''} onClick={() => setTrainingViewMode('cards')}><Icon name="dashboard" size={15} />Kacheln</button>
          <button type="button" className={trainingViewMode === 'list' ? 'is-active' : ''} onClick={() => setTrainingViewMode('list')}><Icon name="matrix" size={15} />Liste</button>
        </div>
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
                <button className="btn btn--ghost" style={{ flex:1, fontSize:11, padding:'6px 8px' }}>
                  Teilnehmer
                </button>
                <button className="btn btn--ghost" style={{ flex:1, fontSize:11, padding:'6px 8px' }}>
                  Anmelden
                </button>
              </div>
            </div>
          );
        })}
      </div> : <div className="training-list-table card">
        <table>
          <thead><tr><th>Schulung</th><th>Kategorie</th><th>Wiederholung</th><th>Status</th><th>Anbieter</th><th>Beschreibung</th></tr></thead>
          <tbody>
            {filtered.map(t => {
              const p = window.provider(t.provider);
              return <tr key={t.id} onClick={() => setSelectedTraining(t)}>
                <td><strong>{t.name}</strong></td>
                <td>{t.cat}</td>
                <td>{t.months ? (t.months === 12 ? 'Jährlich' : `alle ${Math.round(t.months / 12)} Jahre`) : '-'}</td>
                <td>{t.mandatory ? <span className="badge badge--accent">Pflicht</span> : <span className="badge">Optional</span>}</td>
                <td>{p?.short || '-'}</td>
                <td>{t.desc}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>}

      {/* Detail Panel */}
      {selectedTraining && (
        <TrainingDetailPanel
          training={selectedTraining}
          onClose={() => setSelectedTraining(null)}
          stats={getTrainingStats(selectedTraining.id)}
        />
      )}
      {trainingCreateOpen && <TrainingCreateModal onClose={() => setTrainingCreateOpen(false)} />}
    </div>
  );
}

function TrainingCreateModal({ onClose }) {
  const categories = ['Sicherheit', 'SCC', 'DVGW', 'Fahrerlaubnis', 'Unterweisung', 'Sicherheit / Verkehr'];
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
        <label><span>Name Anbieter</span><input placeholder="z.B. BiW Bildungszentrum" /></label>
        <label><span>Adresse</span><input placeholder="Adresse des Anbieters" /></label>
        <label><span>Kontakt</span><input placeholder="Ansprechpartner" /></label>
        <label><span>Telefon</span><input placeholder="+49 ..." /></label>
        <label><span>E-Mail</span><input placeholder="mail@anbieter.de" /></label>
        <label className="is-wide"><span>Beschreibung</span><textarea placeholder="Kurze Beschreibung der Schulung..." /></label>
      </div>
      <footer>
        <button className="btn btn--ghost" type="button" onClick={onClose}>Abbrechen</button>
        <button className="btn btn--primary" type="button" onClick={onClose}>Speichern</button>
      </footer>
    </section>
  </div>;
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
    const firstTraining = window.SEED.trainings.find(t => t.provider === provider.id);
    if (!firstTraining) return;
    window.dispatchEvent(new CustomEvent('navigate-to-calendar', {
      detail: {
        trainingId: firstTraining.id,
        instruction: {
          id: provider.id,
          title: firstTraining.name,
          number: provider.name,
          group: provider.address,
          participantName: provider.contact,
          contextLabel: 'Anbieter vorausgewaehlt',
          kind: 'Terminplanung',
          location: provider.address,
        },
      },
    }));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const locations = [...new Set(window.SEED.providers.map(p => p.address))].sort();
  const types = [...new Set(window.SEED.trainings.map(t => t.cat))].sort();
  const filteredProviders = window.SEED.providers
    .filter(p => locationFilter === 'all' || p.address === locationFilter)
    .filter(p => providerFilter === 'all' || p.id === providerFilter)
    .filter(p => typeFilter === 'all' || window.SEED.trainings.some(t => t.provider === p.id && t.cat === typeFilter))
    .sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || (ratings[b.id] || 0) - (ratings[a.id] || 0));

  const selected = selectedId ? window.SEED.providers.find(p => p.id === selectedId) : null;
  const selectedUsage = selected ? usageFor(selected.id) : null;
  const selectedDocs = selected ? [
    { type: 'Vertrag', name: `Rahmenvertrag_${selected.id}.pdf` },
    { type: 'Angebot', name: `Angebot_Schulungen_${selected.id}.pdf` },
    { type: 'Zertifikat', name: `Anbieterfreigabe_${selected.id}.pdf` },
  ] : [];
  const starFilled = String.fromCharCode(9733);
  const starEmpty = String.fromCharCode(9734);

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Akademien & Anbieter</h1>
          <div className="view__subtitle">Ansprechpartner, Schulungen, Nutzung und Dokumente je Anbieter.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary"><Icon name="plus" size={14} />Anbieter</button>
        </div>
      </div>

      <div className="provider-filters">
        <label><span>Ort</span><select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}><option value="all">Alle Orte</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></label>
        <label><span>Schulungstyp</span><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="all">Alle Typen</option>{types.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
        <label><span>Anbieter</span><select value={providerFilter} onChange={e => setProviderFilter(e.target.value)}><option value="all">Alle Anbieter</option>{window.SEED.providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      </div>

      <div className={'provider-layout' + (selected ? ' provider-layout--detail-open' : '')}>
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
      </div>
    </div>
  );
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

