function FormulareView({ activeCompany = 'all', extraAction = null, title = 'Formulare', onBack = null }) {
  const companies = window.SEED?.companies || [];
  const companyName = id => companies.find(item => item.id === id)?.name || id;
  const today = new Date(window.SEED?.today || '2026-04-21');
  const fmt = iso => {
    if (!iso) return '-';
    const [y, m, d] = String(iso).split('-');
    return d && m && y ? `${d}.${m}.${y}` : iso;
  };
  const daysUntil = iso => Math.round((new Date(iso) - today) / 86400000);
  const warningFor = row => {
    if (!row.pdf) return 'PDF-Datei fehlt';
    if (!row.responsible) return 'verantwortliche Person fehlt';
    if (row.status !== 'Freigegeben') return 'Freigabe fehlt';
    const days = daysUntil(row.nextCheck);
    if (days < 0) return 'Pruefung ueberfaellig';
    if (days <= 7) return 'Pruefung in 7 Tagen faellig';
    if (days <= 30) return 'Pruefung in 30 Tagen faellig';
    if (days <= 90) return 'Pruefung in 90 Tagen faellig';
    return 'Keine Warnung';
  };

  const initialRows = [
    { id:'form-364', nr:364, internal:'QMS_068', name:'Personalauswahl und Schulungen', company:'tiefbau', version:'002', language:'Deutsch', validFrom:'2024-04-01', updated:'2026-02-09', nextCheck:'2026-06-01', interval:'jaehrlich', responsible:'Rahim Ahangarzadeh', reviewer:'Sabine Janning', approver:'Christian Janning', status:'Freigegeben', pages:2, type:'QM-Formular', description:'PDF-Formular fuer Personalauswahl und Schulungsplanung.', pdf:'QMS_068_Personalauswahl.pdf', notes:'Freigegebene PDF-Version im Portal.' },
    { id:'form-365', nr:365, internal:'QMS_069', name:'SGU-Jahresplanung', company:'tiefbau', version:'004', language:'Deutsch', validFrom:'2022-02-01', updated:'2026-02-02', nextCheck:'2026-06-01', interval:'jaehrlich', responsible:'Rahim Ahangarzadeh', reviewer:'QSGU', approver:'Christian Janning', status:'Freigegeben', pages:1, type:'SGU', description:'Planung der SGU-Aktivitaeten je Jahr.', pdf:'QMS_069_SGU_Jahresplanung.pdf', notes:'SCC-relevant.' },
    { id:'form-366', nr:366, internal:'QMS_070', name:'Zertifizierungsuebersicht der Janning Group', company:'bohrtechnik', version:'001', language:'Deutsch', validFrom:'2026-02-27', updated:'2026-02-27', nextCheck:'2026-08-27', interval:'halbjaehrlich', responsible:'Sabine Janning', reviewer:'Rahim Ahangarzadeh', approver:'Christian Janning', status:'In Pruefung', pages:1, type:'Uebersicht', description:'PDF-Uebersicht fuer Zertifikate und Audits.', pdf:'QMS_070_Zertifizierungsuebersicht.pdf', notes:'Neue Version in Pruefung.' },
    { id:'form-367', nr:367, internal:'QMS_071', name:'Bauleiterbesprechung - Gespraechsprotokoll', company:'tiefbau', version:'001', language:'Deutsch', validFrom:'2026-02-02', updated:'2026-02-02', nextCheck:'2026-06-01', interval:'jaehrlich', responsible:'Daniel Bert', reviewer:'Rahim Ahangarzadeh', approver:'Christian Janning', status:'Freigegeben', pages:1, type:'Protokoll', description:'PDF-Vorlage fuer Bauleiterbesprechungen.', pdf:'QMS_071_Bauleiterbesprechung.pdf', notes:'Nur als PDF verwalten.' },
    { id:'form-368', nr:368, internal:'QMS_072', name:'QSGU-Ziele und Aktionsplan', company:'galabau', version:'001', language:'Deutsch', validFrom:'2023-02-02', updated:'2026-02-24', nextCheck:'2026-06-01', interval:'jaehrlich', responsible:'Rahim Ahangarzadeh', reviewer:'Sabine Janning', approver:'Thomas Janning', status:'Freigegeben', pages:2, type:'QSGU', description:'Ziele, Massnahmen und Aktionsplan.', pdf:'QMS_072_QSGU_Ziele.pdf', notes:'Aushangfaehige PDF.' },
    { id:'form-369', nr:369, internal:'SGU_007', name:'Fuehrerscheinkontrolle', company:'transporte', version:'002', language:'Deutsch', validFrom:'2026-03-01', updated:'2026-03-01', nextCheck:'2026-05-01', interval:'jaehrlich', responsible:'Michael Janning', reviewer:'Fuhrpark', approver:'Christian Janning', status:'Pruefung faellig', pages:3, type:'Nachweisformular', description:'PDF-Nachweisdokument fuer Fuehrerscheinkontrolle.', pdf:'SGU_007_Fuehrerscheinkontrolle.pdf', notes:'Pruefung faellig.' },
    { id:'form-370', nr:370, internal:'SGU_036', name:'Informationslenkungsmatrix', company:'tiefbau', version:'001', language:'Deutsch', validFrom:'2026-02-24', updated:'2026-02-24', nextCheck:'2027-02-24', interval:'jaehrlich', responsible:'Rahim Ahangarzadeh', reviewer:'Sabine Janning', approver:'Christian Janning', status:'Freigegeben', pages:2, type:'Matrix', description:'PDF-Vorlage fuer Informationslenkung und Aufbewahrung.', pdf:'SGU_036_Informationslenkungsmatrix.pdf', notes:'Grundlage fuer Informationslenkungsmatrix.' },
    { id:'form-371', nr:371, internal:'FB_7.2', name:'Alarmplan Baustelle', company:'rohrbau', version:'001', language:'Deutsch', validFrom:'2026-01-01', updated:'2026-01-01', nextCheck:'2026-07-01', interval:'halbjaehrlich', responsible:'Alexander Petersen', reviewer:'QSGU', approver:'Stefan Janning', status:'Entwurf', pages:1, type:'Baustelle', description:'A4-PDF fuer Alarmplan auf Baustellen.', pdf:'', notes:'PDF-Datei fehlt.' },
  ];

  const [rows, setRows] = React.useState(initialRows);
  const [viewMode, setViewMode] = React.useState(() => window.localStorage?.getItem('formulare-view-mode') || 'cards');
  const [companyFilter, setCompanyFilter] = React.useState(activeCompany);
  const [kpiFilter, setKpiFilter] = React.useState('total');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [sort, setSort] = React.useState({ key:'nr', dir:'asc' });
  const [groupBy, setGroupBy] = React.useState('');
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [formDialog, setFormDialog] = React.useState(null);
  const [versionDialog, setVersionDialog] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({ name:'', internal:'', status:'all', version:'', language:'all', responsible:'', reviewer:'', approver:'', due:'all', pdf:'all', archived:false });

  React.useEffect(() => setCompanyFilter(activeCompany), [activeCompany]);
  React.useEffect(() => window.localStorage?.setItem('formulare-view-mode', viewMode), [viewMode]);

  const enriched = rows.map(row => ({
    ...row,
    companyName: companyName(row.company),
    warning: warningFor(row),
  }));
  const baseScoped = enriched.filter(row => companyFilter === 'all' || row.company === companyFilter);
  const filteredBase = baseScoped.filter(row => {
    const dueDays = daysUntil(row.nextCheck);
    return (!filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase()))
      && (!filters.internal || row.internal.toLowerCase().includes(filters.internal.toLowerCase()))
      && (filters.status === 'all' || row.status === filters.status)
      && (!filters.version || row.version.toLowerCase().includes(filters.version.toLowerCase()))
      && (filters.language === 'all' || row.language === filters.language)
      && (!filters.responsible || row.responsible.toLowerCase().includes(filters.responsible.toLowerCase()))
      && (!filters.reviewer || row.reviewer.toLowerCase().includes(filters.reviewer.toLowerCase()))
      && (!filters.approver || row.approver.toLowerCase().includes(filters.approver.toLowerCase()))
      && (filters.due === 'all' || (filters.due === '30' && dueDays <= 30) || (filters.due === '60' && dueDays <= 60) || (filters.due === '90' && dueDays <= 90))
      && (filters.pdf === 'all' || (filters.pdf === 'yes' && row.pdf) || (filters.pdf === 'no' && !row.pdf))
      && (filters.archived || kpiFilter === 'archived' || row.status !== 'Archiviert');
  });
  const scoped = filteredBase.filter(row => {
    if (kpiFilter === 'total') return true;
    if (kpiFilter === 'active') return row.status === 'Freigegeben';
    if (kpiFilter === 'review') return row.status === 'In Pruefung';
    if (kpiFilter === 'due') return row.warning.includes('faellig');
    if (kpiFilter === 'overdue') return row.warning.includes('ueberfaellig');
    if (kpiFilter === 'drafts') return row.status === 'Entwurf';
    if (kpiFilter === 'archived') return row.status === 'Archiviert';
    return true;
  });
  const columns = [
    ['name', 'Formularname'],
    ['internal', 'interne Nummer'],
    ['version', 'Version'],
    ['validFrom', 'gültig ab'],
    ['nextCheck', 'nächste Prüfung'],
    ['responsible', 'verantwortliche Person'],
    ['status', 'Status'],
    ['pdf', 'PDF-Datei'],
  ];
  const valueOf = (row, key) => row[key] || '';
  const sorted = [...scoped].sort((a, b) => {
    const av = valueOf(a, sort.key);
    const bv = valueOf(b, sort.key);
    const cmp = sort.key === 'nr' || sort.key === 'pages'
      ? Number(av) - Number(bv)
      : String(av).localeCompare(String(bv), 'de', { numeric:true });
    return sort.dir === 'asc' ? cmp : -cmp;
  });
  const groupedRows = groupBy ? Object.entries(sorted.reduce((acc, row) => {
    const key = String(valueOf(row, groupBy) || 'Leer');
    acc[key] = acc[key] || [];
    acc[key].push(row);
    return acc;
  }, {})) : [['', sorted]];

  const allSelected = sorted.length > 0 && sorted.every(row => selectedIds.includes(row.id));
  const toggleRow = id => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds(current => allSelected ? current.filter(id => !sorted.some(row => row.id === id)) : Array.from(new Set([...current, ...sorted.map(row => row.id)])));
  const setColumnSort = (key, dir) => { setSort({ key, dir }); setColumnMenu(null); };
  const statusClass = status => status === 'Freigegeben' ? 'badge--valid' : status === 'In Pruefung' || status === 'Pruefung faellig' ? 'badge--warn' : status === 'Ueberfaellig' || status === 'Entwurf' ? 'badge--expired' : '';
  const statusText = status => ({ 'In Pruefung':'In Prüfung', 'Pruefung faellig':'Prüfung fällig', 'Ueberfaellig':'Überfällig' }[status] || status);
  const statusBadge = status => <span className={'badge ' + statusClass(status)}><span className="badge__dot" />{statusText(status)}</span>;
  const menuFor = key => columnMenu === key && <div className="company-column-menu form-pdf-column-menu" onClick={event => event.stopPropagation()}>
    <button onClick={() => setColumnSort(key, 'asc')}>A bis Z</button>
    <button onClick={() => setColumnSort(key, 'desc')}>Z bis A</button>
    <button onClick={() => setColumnMenu(null)}>Filtern nach</button>
    <button onClick={() => { setGroupBy(key); setColumnMenu(null); }}>Gruppieren nach "{columns.find(column => column[0] === key)?.[1] || key}"</button>
    <button onClick={() => setColumnMenu(null)}>Spalte ausblenden</button>
    <button onClick={() => setColumnMenu(null)}>Spalten verwalten</button>
    <button onClick={() => { setGroupBy(''); setColumnMenu(null); }}>Standardansicht wiederherstellen</button>
    <button onClick={() => setGroupBy('')}>Gruppierung aufheben</button>
  </div>;
  const counts = {
    total: filteredBase.length,
    active: filteredBase.filter(row => row.status === 'Freigegeben').length,
    review: filteredBase.filter(row => row.status === 'In Pruefung').length,
    due: filteredBase.filter(row => row.warning.includes('faellig')).length,
    overdue: filteredBase.filter(row => row.warning.includes('ueberfaellig')).length,
    drafts: filteredBase.filter(row => row.status === 'Entwurf').length,
    archived: filteredBase.filter(row => row.status === 'Archiviert').length,
  };
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key === 'archived' ? value : value && value !== 'all').length;
  const tabs = [
    ['total', 'Alle', counts.total],
    ['active', 'Aktiv', counts.active],
    ['review', 'In Prüfung', counts.review],
    ['due', 'Prüfung fällig', counts.due],
    ['overdue', 'Überfällig', counts.overdue],
    ['drafts', 'Entwurf', counts.drafts],
    ['archived', 'Archiviert', counts.archived],
  ];

  if (detail) return <>
    <FormDetailPage row={detail} onBack={() => setDetail(null)} onAdd={() => setFormDialog({})} onEdit={() => setFormDialog(detail)} onVersion={() => setVersionDialog(detail)} statusBadge={statusBadge} fmt={fmt} />
    {formDialog && <FormCreateDialog row={formDialog.id ? formDialog : null} companies={companies} onClose={() => setFormDialog(null)} />}
    {versionDialog && <FormVersionDialog row={versionDialog} onClose={() => setVersionDialog(null)} />}
  </>;

  const actions = <div className="form-pdf-toolbar">
      {extraAction}
      <select value={companyFilter} onChange={event => setCompanyFilter(event.target.value)}>
        <option value="all">Alle Firmen</option>
        {companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <div className="segmented">
        <button className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}><Icon name="dashboard" size={14} />Kacheln</button>
        <button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><Icon name="matrix" size={14} />Liste</button>
      </div>
      <button className="btn btn--ghost" onClick={() => setFilterOpen(true)}><Icon name="filter" size={14} />Filter{activeFilterCount ? ` (${activeFilterCount})` : ''}</button>
      <button className="btn btn--ghost"><Icon name="download" size={14} />Export</button>
      <button className="btn btn--primary" onClick={() => setFormDialog({})}><Icon name="plus" size={14} />PDF-Formular hinzufügen</button>
    </div>;

  return <div className="form-pdf-page">
    {onBack
      ? <CompanyPageTitle title={title} onBack={onBack} action={actions} />
      : <div className="view__header form-pdf-header"><div><h1 className="view__title">{title}</h1></div>{actions}</div>}

    <div className="form-pdf-tabs">
      {tabs.map(([key, label, count]) => <button key={key} className={kpiFilter === key ? 'is-active' : ''} onClick={() => setKpiFilter(key)}>{label}<span>{count}</span></button>)}
    </div>

    {selectedIds.length > 0 && <div className="company-bulkbar form-pdf-bulkbar">
      <strong>{selectedIds.length} Formular(e) ausgewaehlt</strong>
      <button>Status aendern</button>
      <button>Verantwortliche zuweisen</button>
      <button>Pruefungstermin aendern</button>
      <button>zur Pruefung senden</button>
      <button>freigeben</button>
      <button>PDF herunterladen</button>
      <button>archivieren</button>
      <button className="is-danger">loeschen</button>
    </div>}

    {viewMode === 'cards' ? <div className="form-pdf-card-grid">
      {sorted.map(row => <article key={row.id} className="form-pdf-card" onClick={() => setDetail(row)}>
        <header><div><span>{row.internal}</span><h3>{row.name}</h3><p>{row.companyName}</p></div>{statusBadge(row.status)}</header>
        <dl>
          <div><dt>Version</dt><dd>{row.version}</dd></div>
          <div><dt>naechste Pruefung</dt><dd>{fmt(row.nextCheck)}</dd></div>
          <div><dt>verantwortlich</dt><dd>{row.responsible || '-'}</dd></div>
        </dl>
        <p className={row.warning === 'Keine Warnung' ? 'is-ok' : 'is-warn'}>{row.warning}</p>
        <footer><button onClick={event => { event.stopPropagation(); setDetail(row); }}><Icon name="eye" size={15} />Details</button><button onClick={event => { event.stopPropagation(); setFormDialog(row); }}><Icon name="edit" size={15} />Bearbeiten</button></footer>
      </article>)}
    </div> : <div className="form-pdf-table-wrap">
      <table className="form-pdf-table">
        <thead><tr><th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>{columns.map(([key, label]) => <th key={key}><div className="company-list-th"><button onClick={() => setColumnMenu(columnMenu === key ? null : key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button>{menuFor(key)}</div></th>)}<th>Aktionen</th></tr></thead>
        <tbody>{groupedRows.flatMap(([group, items]) => [
          groupBy && <tr key={'group-' + group} className="company-group-row"><td colSpan={columns.length + 2}>{columns.find(column => column[0] === groupBy)?.[1]}: {group} <span>{items.length}</span></td></tr>,
          ...items.map(row => <tr key={row.id} onClick={() => setDetail(row)}>
            <td onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>
            <td className="form-name-cell"><strong>{row.name}</strong><small>{row.internal} · {row.language} · {row.pages} Seiten</small></td>
            <td><strong>{row.internal}</strong></td>
            <td>{row.version}</td>
            <td>{fmt(row.validFrom)}</td>
            <td>{fmt(row.nextCheck)}</td>
            <td>{row.responsible}</td>
            <td>{statusBadge(row.status)}</td>
            <td>{row.pdf ? <button className="btn btn--ghost" onClick={event => event.stopPropagation()}><Icon name="doc" size={13} />{row.pdf}</button> : <span className="muted">fehlt</span>}</td>
            <td onClick={event => event.stopPropagation()}><FormActions row={row} onOpen={() => setDetail(row)} onEdit={() => setFormDialog(row)} onVersion={() => setVersionDialog(row)} /></td>
          </tr>)
        ])}</tbody>
      </table>
    </div>}

    {formDialog && <FormCreateDialog row={formDialog.id ? formDialog : null} companies={companies} onClose={() => setFormDialog(null)} />}
    {versionDialog && <FormVersionDialog row={versionDialog} onClose={() => setVersionDialog(null)} />}
    {filterOpen && <FormFilterPanel filters={filters} setFilters={setFilters} companies={companies} onClose={() => setFilterOpen(false)} />}
  </div>;
}

function FormActions({ row, onOpen, onEdit, onVersion }) {
  const [open, setOpen] = React.useState(false);
  return <div className="info-actions">
    <button className="icon-button" onClick={() => setOpen(!open)}>⋮</button>
    {open && <div className="company-column-menu info-actions-menu">
      <button onClick={onOpen}>Details anzeigen</button>
      <button>PDF-Vorschau oeffnen</button>
      <button onClick={onEdit}>Bearbeiten</button>
      <button>PDF herunterladen</button>
      <button onClick={onVersion}>neue Version anlegen</button>
      <button>zur Pruefung senden</button>
      <button>freigeben</button>
      <button>Freigabe zurueckziehen</button>
      <button>Duplizieren</button>
      <button>Archivieren</button>
      <button className="is-danger">Loeschen</button>
    </div>}
  </div>;
}

function FormFilterPanel({ filters, setFilters, onClose }) {
  const set = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const reset = () => setFilters({ name:'', internal:'', status:'all', version:'', language:'all', responsible:'', reviewer:'', approver:'', due:'all', pdf:'all', archived:false });
  return <div className="form-filter-backdrop" onClick={onClose}>
    <aside className="form-filter-panel" onClick={event => event.stopPropagation()}>
      <header><div><span>Filter</span><h2>PDF-Formulare filtern</h2></div><button onClick={onClose}><Icon name="x" size={18} /></button></header>
      <main>
        <FormField label="Formularname"><input value={filters.name} onChange={event => set('name', event.target.value)} /></FormField>
        <FormField label="interne Nummer"><input value={filters.internal} onChange={event => set('internal', event.target.value)} /></FormField>
        <FormField label="Status"><select value={filters.status} onChange={event => set('status', event.target.value)}><option value="all">Alle Status</option><option value="Entwurf">Entwurf</option><option value="In Pruefung">In Prüfung</option><option value="Freigegeben">Freigegeben</option><option value="Pruefung faellig">Prüfung fällig</option><option value="Ueberfaellig">Überfällig</option><option value="Ersetzt">Ersetzt</option><option value="Archiviert">Archiviert</option></select></FormField>
        <FormField label="Version"><input value={filters.version} onChange={event => set('version', event.target.value)} /></FormField>
        <FormField label="Sprache"><select value={filters.language} onChange={event => set('language', event.target.value)}><option value="all">Alle Sprachen</option><option>Deutsch</option><option>Englisch</option><option>Mehrsprachig</option></select></FormField>
        <FormField label="verantwortliche Person"><input value={filters.responsible} onChange={event => set('responsible', event.target.value)} /></FormField>
        <FormField label="Prüfer"><input value={filters.reviewer} onChange={event => set('reviewer', event.target.value)} /></FormField>
        <FormField label="Freigeber"><input value={filters.approver} onChange={event => set('approver', event.target.value)} /></FormField>
        <FormField label="Prüfung fällig"><select value={filters.due} onChange={event => set('due', event.target.value)}><option value="all">Alle Zeiträume</option><option value="30">innerhalb von 30 Tagen</option><option value="60">innerhalb von 60 Tagen</option><option value="90">innerhalb von 90 Tagen</option></select></FormField>
        <FormField label="PDF-Datei"><select value={filters.pdf} onChange={event => set('pdf', event.target.value)}><option value="all">Alle</option><option value="yes">PDF vorhanden</option><option value="no">PDF fehlt</option></select></FormField>
        <label className="form-check"><input type="checkbox" checked={filters.archived} onChange={event => set('archived', event.target.checked)} />archivierte Formulare anzeigen</label>
      </main>
      <footer><button className="btn btn--ghost" onClick={reset}>Zurücksetzen</button><button className="btn btn--primary" onClick={onClose}>Anwenden</button></footer>
    </aside>
  </div>;
}

function FormCreateDialog({ row, companies, onClose }) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState(row || { name:'', internal:'', version:'001', company:'tiefbau', type:'PDF-Formular', language:'Deutsch', description:'', pages:1, validFrom:'2026-07-13', updated:'2026-07-13', nextCheck:'2027-07-13', interval:'jaehrlich', responsible:'', reviewer:'', approver:'', status:'Entwurf', pdf:'', notes:'' });
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const steps = ['Grunddaten', 'Version und Gueltigkeit', 'Verantwortlichkeiten', 'PDF-Datei', 'Zusammenfassung'];
  return <FormDialogShell title={row ? 'PDF-Formular bearbeiten' : 'PDF-Formular hinzufügen'} subtitle={`Schritt ${step} von 5`} onClose={onClose}>
    <div className="form-dialog-steps">{steps.map((item, index) => <button key={item} className={step === index + 1 ? 'is-active' : ''} onClick={() => setStep(index + 1)}>{index + 1}. {item}</button>)}</div>
    {step === 1 && <React.Fragment>
      <FormField label="Firma *"><select value={form.company} onChange={event => set('company', event.target.value)}>{companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
      <FormField label="Formularname *"><input value={form.name} onChange={event => set('name', event.target.value)} /></FormField>
      <FormField label="interne Nummer *"><input value={form.internal} onChange={event => set('internal', event.target.value)} /></FormField>
      <FormField label="Formulartyp *"><select value={form.type} onChange={event => set('type', event.target.value)}><option>QM-Formular</option><option>SGU-Formular</option><option>Checkliste</option><option>Nachweis</option><option>Protokoll</option><option>Antrag</option><option>Vorlage</option><option>sonstiges PDF-Formular</option></select></FormField>
      <FormField label="Sprache *"><select value={form.language} onChange={event => set('language', event.target.value)}><option>Deutsch</option><option>Englisch</option><option>Mehrsprachig</option></select></FormField>
      <FormField label="Beschreibung" wide><textarea value={form.description} onChange={event => set('description', event.target.value)} /></FormField>
    </React.Fragment>}
    {step === 2 && <React.Fragment>
      <FormField label="Version *"><input value={form.version} onChange={event => set('version', event.target.value)} /></FormField>
      <FormField label="gültig ab *"><input type="date" value={form.validFrom} onChange={event => set('validFrom', event.target.value)} /></FormField>
      <FormField label="letzte Aktualisierung *"><input type="date" value={form.updated} onChange={event => set('updated', event.target.value)} /></FormField>
      <FormField label="nächste Prüfung *"><input type="date" value={form.nextCheck} onChange={event => set('nextCheck', event.target.value)} /></FormField>
      <FormField label="Prüfintervall *"><select value={form.interval} onChange={event => set('interval', event.target.value)}><option>halbjährlich</option><option>jährlich</option><option>zweijährlich</option><option>benutzerdefiniert</option></select></FormField>
      <FormField label="Status *"><select value={form.status} onChange={event => set('status', event.target.value)}><option value="Entwurf">Entwurf</option><option value="In Pruefung">In Prüfung</option><option value="Freigegeben">Freigegeben</option><option value="Pruefung faellig">Prüfung fällig</option><option value="Ueberfaellig">Überfällig</option><option value="Ersetzt">Ersetzt</option><option value="Archiviert">Archiviert</option></select></FormField>
    </React.Fragment>}
    {step === 3 && <React.Fragment>
      <FormField label="verantwortliche Person *"><input value={form.responsible} onChange={event => set('responsible', event.target.value)} /></FormField>
      <FormField label="Prüfer *"><input value={form.reviewer} onChange={event => set('reviewer', event.target.value)} /></FormField>
      <FormField label="Freigeber *"><input value={form.approver} onChange={event => set('approver', event.target.value)} /></FormField>
      <FormField label="Vertretung"><input /></FormField>
      <label className="form-check"><input type="checkbox" />Erinnerung aktivieren</label>
    </React.Fragment>}
    {step === 4 && <React.Fragment>
      <FormField label="PDF-Datei *" wide><button type="button" className="info-upload"><Icon name="upload" size={15} />PDF-Datei hochladen</button></FormField>
      <div className="form-upload-preview">
        <Icon name="doc" size={24} />
        <strong>{form.pdf || 'Noch keine PDF-Datei ausgewählt'}</strong>
        <span>Dateigroesse, Seitenanzahl, Upload-Datum und Vorschau werden nach dem Upload angezeigt.</span>
      </div>
      <FormField label="Seitenanzahl"><input type="number" value={form.pages} onChange={event => set('pages', event.target.value)} /></FormField>
      <FormField label="Bemerkung" wide><textarea value={form.notes} onChange={event => set('notes', event.target.value)} /></FormField>
    </React.Fragment>}
    {step === 5 && <div className="form-create-summary">
      {[['Firma', companies.find(item => item.id === form.company)?.name], ['Formularname', form.name || '-'], ['interne Nummer', form.internal || '-'], ['Version', form.version], ['gültig ab', form.validFrom], ['nächste Prüfung', form.nextCheck], ['verantwortliche Person', form.responsible || '-'], ['Prüfer', form.reviewer || '-'], ['Freigeber', form.approver || '-'], ['PDF-Datei', form.pdf || 'noch nicht hochgeladen']].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </div>}
    <footer>
      <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
      <button className="btn btn--ghost" onClick={onClose}>Als Entwurf speichern</button>
      {step > 1 && <button className="btn btn--ghost" onClick={() => setStep(current => current - 1)}>Zurück</button>}
      {step < 5 ? <button className="btn btn--primary" onClick={() => setStep(current => current + 1)}>Weiter</button> : <button className="btn btn--primary" onClick={onClose}>PDF-Formular hinzufügen</button>}
    </footer>
  </FormDialogShell>;
}

function FormVersionDialog({ row, onClose }) {
  return <FormDialogShell title="Neue Version anlegen" subtitle={row.name} onClose={onClose} small>
    <FormField label="bisherige Version"><input value={row.version} readOnly /></FormField>
    <FormField label="neue Version"><input defaultValue="003" /></FormField>
    <FormField label="Aenderungsdatum"><input type="date" defaultValue="2026-07-13" /></FormField>
    <FormField label="geaendert von"><input defaultValue="Rahim Ahangarzadeh" /></FormField>
    <FormField label="gueltig ab"><input type="date" defaultValue="2026-07-13" /></FormField>
    <FormField label="Status"><select defaultValue="Entwurf"><option>Entwurf</option><option>In Pruefung</option><option>Freigegeben</option></select></FormField>
    <FormField label="neue PDF-Datei"><button type="button" className="info-upload"><Icon name="upload" size={15} />PDF hochladen</button></FormField>
    <FormField label="Aenderungsgrund" wide><textarea /></FormField>
    <footer><button className="btn btn--ghost" onClick={onClose}>Abbrechen</button><button className="btn btn--primary" onClick={onClose}>Version speichern</button></footer>
  </FormDialogShell>;
}

function FormDialogShell({ title, subtitle, onClose, children, small }) {
  return <div className="form-dialog-backdrop">
    <div className={'form-dialog ' + (small ? 'form-dialog--small' : '')}>
      <header><div><span>{subtitle}</span><h2>{title}</h2></div><button onClick={onClose}><Icon name="x" size={18} /></button></header>
      <main>{children}</main>
    </div>
  </div>;
}

function FormField({ label, children, wide }) {
  return <label className={wide ? 'is-wide' : ''}><span>{label}</span>{children}</label>;
}

function FormDetailPage({ row, onBack, onAdd, onEdit, onVersion, statusBadge, fmt }) {
  const warning = row.warning || 'Keine Warnung';
  const statusValue = { 'In Pruefung':'In Prüfung', 'Pruefung faellig':'Prüfung fällig', 'Ueberfaellig':'Überfällig' }[row.status] || row.status;
  return <div className="emp-full form-detail-page">
    <CompanyPageTitle title={row.name} onBack={onBack} action={<div className="form-detail-actions">
      <button className="btn btn--primary" onClick={onAdd}><Icon name="plus" size={14} />PDF-Formular hinzufügen</button>
      <button className="emp-edit-all" onClick={onEdit}><Icon name="edit" size={15} />Bearbeiten</button>
      <button className="btn btn--ghost"><Icon name="upload" size={14} />Dokument hinzufügen</button>
      <button className="btn btn--ghost" onClick={onVersion}><Icon name="history" size={14} />Neue Version</button>
      <button className="btn btn--ghost"><Icon name="archive" size={14} />Archivieren</button>
      <button className="btn btn--danger-fill"><Icon name="trash" size={14} />Löschen</button>
    </div>} />
    <section className="form-detail-hero">
      <div>
        {statusBadge(row.status)}
        <span>{row.internal}</span>
        <h2>{row.name}</h2>
        <p>{row.description}</p>
      </div>
      <aside>
        <span>{warning === 'Keine Warnung' ? 'Keine Warnung' : 'Hinweis'}</span>
        <strong>{warning}</strong>
        <small>Nächste Prüfung: {fmt(row.nextCheck)}</small>
      </aside>
    </section>
    <div className="form-detail-grid">
      <FormInfoCard title="Stammdaten" rows={[['interne Nummer', row.internal], ['Firma', row.companyName], ['Formularart', row.type], ['Sprache', row.language], ['Seitenanzahl', `${row.pages} Seiten`]]} />
      <FormInfoCard title="Aktuelle Version" rows={[['Version', row.version], ['gültig ab', fmt(row.validFrom)], ['letzte Aktualisierung', fmt(row.updated)], ['nächste Prüfung', fmt(row.nextCheck)], ['Prüfintervall', row.interval]]} />
      <FormInfoCard title="Verantwortlichkeiten" rows={[['verantwortliche Person', row.responsible], ['Prüfer', row.reviewer], ['Freigeber', row.approver], ['Status', statusValue]]} />
      <section className="form-detail-card">
        <h3>PDF-Dateien</h3>
        <div className="qualified-doc-box">
          {row.pdf ? <div className="qualified-doc-chip"><Icon name="doc" size={14} /><span>{row.pdf}</span><button><Icon name="x" size={13} /></button></div> : <div className="qualified-doc-empty"><Icon name="doc" size={14} />Keine PDF-Datei hinterlegt</div>}
          <button className="qualified-doc-upload"><Icon name="upload" size={14} />Dokument hinzufügen</button>
        </div>
        <div className="form-detail-card-actions">
          <button className="btn btn--ghost">PDF-Vorschau öffnen</button>
          <button className="btn btn--ghost">PDF herunterladen</button>
        </div>
      </section>
      <FormInfoCard title="Ältere Versionen" rows={[['Version 001', 'erstellt 01.04.2024'], [`Version ${row.version}`, 'aktuelle Freigabe']]} />
      <FormInfoCard title="Änderungshistorie" rows={[['Erstellt von', 'Rahim Ahangarzadeh'], ['Geprüft von', row.reviewer], ['Freigegeben von', row.approver], ['Letzte Änderung', fmt(row.updated)]]} />
      <FormInfoCard title="Bemerkungen" wide rows={[['Notiz', row.notes || '-']]} />
    </div>
  </div>;
}

function FormInfoCard({ title, rows, wide }) {
  return <section className={'form-detail-card ' + (wide ? 'is-wide' : '')}><h3>{title}</h3>{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>;
}

Object.assign(window, { FormulareView });
