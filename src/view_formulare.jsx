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
  const [viewMode, setViewMode] = React.useState('cards');
  const [companyFilter, setCompanyFilter] = React.useState(activeCompany);
  const [kpiFilter, setKpiFilter] = React.useState('total');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [sort, setSort] = React.useState({ key:'nr', dir:'asc' });
  const [groupBy, setGroupBy] = React.useState('');
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [formDialog, setFormDialog] = React.useState(null);
  const [versionDialog, setVersionDialog] = React.useState(null);
  const [detail, setDetail] = React.useState(null);

  React.useEffect(() => setCompanyFilter(activeCompany), [activeCompany]);

  const enriched = rows.map(row => ({
    ...row,
    companyName: companyName(row.company),
    warning: warningFor(row),
  }));
  const baseScoped = enriched.filter(row => companyFilter === 'all' || row.company === companyFilter);
  const scoped = baseScoped.filter(row => {
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
    ['nr', 'Nummer'],
    ['internal', 'interne Nummer'],
    ['name', 'Formularname'],
    ['companyName', 'Firma'],
    ['version', 'Version'],
    ['language', 'Sprache'],
    ['validFrom', 'gueltig ab'],
    ['updated', 'letzte Aktualisierung'],
    ['nextCheck', 'naechste Pruefung'],
    ['responsible', 'verantwortliche Person'],
    ['reviewer', 'Pruefer'],
    ['approver', 'Freigeber'],
    ['status', 'Status'],
    ['pages', 'Seitenanzahl'],
    ['pdf', 'PDF-Datei'],
    ['description', 'Beschreibung'],
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
  const statusBadge = status => <span className={'badge ' + statusClass(status)}><span className="badge__dot" />{status}</span>;
  const menuFor = key => columnMenu === key && <div className="company-column-menu form-pdf-column-menu" onClick={event => event.stopPropagation()}>
    <button onClick={() => setColumnSort(key, 'asc')}>A bis Z</button>
    <button onClick={() => setColumnSort(key, 'desc')}>Z bis A</button>
    <button onClick={() => setColumnMenu(null)}>Filtern nach</button>
    <button onClick={() => { setGroupBy(key); setColumnMenu(null); }}>Gruppieren nach "{columns.find(column => column[0] === key)?.[1] || key}"</button>
    <button onClick={() => setGroupBy('')}>Gruppierung aufheben</button>
  </div>;
  const counts = {
    total: baseScoped.length,
    active: baseScoped.filter(row => row.status === 'Freigegeben').length,
    review: baseScoped.filter(row => row.status === 'In Pruefung').length,
    due: baseScoped.filter(row => row.warning.includes('faellig')).length,
    overdue: baseScoped.filter(row => row.warning.includes('ueberfaellig')).length,
    drafts: baseScoped.filter(row => row.status === 'Entwurf').length,
    archived: baseScoped.filter(row => row.status === 'Archiviert').length,
  };

  if (detail) return <>
    <FormDetailPage row={detail} onBack={() => setDetail(null)} onEdit={() => setFormDialog(detail)} onVersion={() => setVersionDialog(detail)} statusBadge={statusBadge} fmt={fmt} />
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
      <button className="btn btn--ghost"><Icon name="filter" size={14} />Filter</button>
      <button className="btn btn--ghost"><Icon name="download" size={14} />Export</button>
      <button className="btn btn--primary" onClick={() => setFormDialog({})}><Icon name="plus" size={14} />Formular erstellen</button>
    </div>;

  return <div className="form-pdf-page">
    {onBack
      ? <CompanyPageTitle title={title} onBack={onBack} action={actions} />
      : <div className="view__header form-pdf-header"><div><h1 className="view__title">{title}</h1></div>{actions}</div>}

    <div className="form-pdf-kpis">
      <button className={kpiFilter === 'total' ? 'is-active' : ''} onClick={() => setKpiFilter('total')}><span>Formulare gesamt</span><strong>{counts.total}</strong></button>
      <button className={kpiFilter === 'active' ? 'is-active' : ''} onClick={() => setKpiFilter('active')}><span>Aktiv</span><strong>{counts.active}</strong></button>
      <button className={kpiFilter === 'review' ? 'is-active' : ''} onClick={() => setKpiFilter('review')}><span>In Pruefung</span><strong>{counts.review}</strong></button>
      <button className={kpiFilter === 'due' ? 'is-active' : ''} onClick={() => setKpiFilter('due')}><span>Pruefung faellig</span><strong>{counts.due}</strong></button>
      <button className={kpiFilter === 'overdue' ? 'is-active' : ''} onClick={() => setKpiFilter('overdue')}><span>Ueberfaellig</span><strong>{counts.overdue}</strong></button>
      <button className={kpiFilter === 'drafts' ? 'is-active' : ''} onClick={() => setKpiFilter('drafts')}><span>Entwuerfe</span><strong>{counts.drafts}</strong></button>
      <button className={kpiFilter === 'archived' ? 'is-active' : ''} onClick={() => setKpiFilter('archived')}><span>Archiviert</span><strong>{counts.archived}</strong></button>
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
            <td>{row.nr}</td>
            <td><strong>{row.internal}</strong></td>
            <td><strong>{row.name}</strong><small>{row.warning}</small></td>
            <td>{row.companyName}</td>
            <td>{row.version}</td>
            <td>{row.language}</td>
            <td>{fmt(row.validFrom)}</td>
            <td>{fmt(row.updated)}</td>
            <td>{fmt(row.nextCheck)}</td>
            <td>{row.responsible}</td>
            <td>{row.reviewer}</td>
            <td>{row.approver}</td>
            <td>{statusBadge(row.status)}</td>
            <td>{row.pages}</td>
            <td>{row.pdf ? <button className="btn btn--ghost" onClick={event => event.stopPropagation()}><Icon name="doc" size={13} />{row.pdf}</button> : <span className="muted">fehlt</span>}</td>
            <td>{row.description}</td>
            <td onClick={event => event.stopPropagation()}><FormActions row={row} onOpen={() => setDetail(row)} onEdit={() => setFormDialog(row)} onVersion={() => setVersionDialog(row)} /></td>
          </tr>)
        ])}</tbody>
      </table>
    </div>}

    {formDialog && <FormCreateDialog row={formDialog.id ? formDialog : null} companies={companies} onClose={() => setFormDialog(null)} />}
    {versionDialog && <FormVersionDialog row={versionDialog} onClose={() => setVersionDialog(null)} />}
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

function FormCreateDialog({ row, companies, onClose }) {
  const [form, setForm] = React.useState(row || { name:'', internal:'', version:'001', company:'tiefbau', type:'PDF-Formular', language:'Deutsch', description:'', pages:1, validFrom:'2026-07-13', updated:'2026-07-13', nextCheck:'2027-07-13', interval:'jaehrlich', responsible:'', reviewer:'', approver:'', status:'Entwurf', pdf:'', notes:'' });
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <FormDialogShell title={row ? 'Formular bearbeiten' : 'Formular erstellen'} subtitle="PDF-Formular verwalten" onClose={onClose}>
    <FormField label="Formularname"><input value={form.name} onChange={event => set('name', event.target.value)} /></FormField>
    <FormField label="interne Nummer"><input value={form.internal} onChange={event => set('internal', event.target.value)} /></FormField>
    <FormField label="Version"><input value={form.version} onChange={event => set('version', event.target.value)} /></FormField>
    <FormField label="Firma"><select value={form.company} onChange={event => set('company', event.target.value)}>{companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
    <FormField label="Formularart"><input value={form.type} onChange={event => set('type', event.target.value)} /></FormField>
    <FormField label="Sprache"><select value={form.language} onChange={event => set('language', event.target.value)}><option>Deutsch</option><option>Englisch</option><option>12 Sprache</option></select></FormField>
    <FormField label="Seitenanzahl"><input type="number" value={form.pages} onChange={event => set('pages', event.target.value)} /></FormField>
    <FormField label="gueltig ab"><input type="date" value={form.validFrom} onChange={event => set('validFrom', event.target.value)} /></FormField>
    <FormField label="letzte Aktualisierung"><input type="date" value={form.updated} onChange={event => set('updated', event.target.value)} /></FormField>
    <FormField label="naechste Pruefung"><input type="date" value={form.nextCheck} onChange={event => set('nextCheck', event.target.value)} /></FormField>
    <FormField label="Pruefintervall"><select value={form.interval} onChange={event => set('interval', event.target.value)}><option>halbjaehrlich</option><option>jaehrlich</option><option>alle 2 Jahre</option><option>alle 3 Jahre</option></select></FormField>
    <FormField label="verantwortliche Person"><input value={form.responsible} onChange={event => set('responsible', event.target.value)} /></FormField>
    <FormField label="Pruefer"><input value={form.reviewer} onChange={event => set('reviewer', event.target.value)} /></FormField>
    <FormField label="Freigeber"><input value={form.approver} onChange={event => set('approver', event.target.value)} /></FormField>
    <FormField label="Status"><select value={form.status} onChange={event => set('status', event.target.value)}><option>Entwurf</option><option>In Pruefung</option><option>Freigegeben</option><option>Ueberfaellig</option><option>Archiviert</option></select></FormField>
    <FormField label="PDF-Datei hochladen"><button type="button" className="info-upload"><Icon name="upload" size={15} />PDF-Datei hochladen</button></FormField>
    <FormField label="Beschreibung" wide><textarea value={form.description} onChange={event => set('description', event.target.value)} /></FormField>
    <FormField label="Bemerkungen" wide><textarea value={form.notes} onChange={event => set('notes', event.target.value)} /></FormField>
    <footer><button className="btn btn--ghost" onClick={onClose}>Abbrechen</button><button className="btn btn--primary" onClick={onClose}>Speichern</button></footer>
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

function FormDetailPage({ row, onBack, onEdit, onVersion, statusBadge, fmt }) {
  return <div className="emp-full form-detail-page">
    <CompanyPageTitle title={`${row.name}`} onBack={onBack} action={<div style={{ display:'flex', gap:8 }}><button className="emp-edit-all" onClick={onEdit}><Icon name="edit" size={15} />Bearbeiten</button><button className="btn btn--ghost" onClick={onVersion}><Icon name="history" size={14} />neue Version</button><button className="btn btn--ghost"><Icon name="download" size={14} />PDF herunterladen</button></div>} />
    <section className="form-detail-hero"><div><span>{row.internal}</span><h2>{row.name}</h2><p>{row.description}</p></div>{statusBadge(row.status)}</section>
    <div className="cert-detail-grid">
      <FormInfoCard title="Stammdaten" rows={[['interne Nummer', row.internal], ['Firma', row.companyName], ['Formularart', row.type], ['Sprache', row.language], ['Seitenanzahl', row.pages]]} />
      <FormInfoCard title="Aktuelle Version" rows={[['Version', row.version], ['gueltig ab', fmt(row.validFrom)], ['letzte Aktualisierung', fmt(row.updated)], ['naechste Pruefung', fmt(row.nextCheck)], ['Pruefintervall', row.interval]]} />
      <FormInfoCard title="Verantwortlichkeiten" rows={[['verantwortliche Person', row.responsible], ['Pruefer', row.reviewer], ['Freigeber', row.approver], ['Status', row.status]]} />
      <FormInfoCard title="PDF-Dateien" rows={[['Aktuelle PDF', row.pdf || 'fehlt'], ['Vorschau', 'PDF-Vorschau oeffnen'], ['Export', 'PDF herunterladen']]} />
      <FormInfoCard title="Aeltere Versionen" rows={[['Version 001', 'erstellt 2024-04-01'], ['Version 002', 'aktuelle Freigabe']]} />
      <FormInfoCard title="Aenderungshistorie" rows={[['Erstellt', 'Rahim Ahangarzadeh'], ['Geprueft', row.reviewer], ['Freigegeben', row.approver]]} />
      <FormInfoCard title="Bemerkungen" rows={[['Notiz', row.notes || '-']]} />
    </div>
  </div>;
}

function FormInfoCard({ title, rows }) {
  return <section className="cert-info-card"><h3>{title}</h3>{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>;
}

Object.assign(window, { FormulareView });
