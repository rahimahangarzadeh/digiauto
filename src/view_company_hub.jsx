/* Company list and company-scoped detail workspace */

const COMPANY_DETAIL_AREAS = [
  ['overview', 'Übersicht', 'dashboard'], ['master', 'Stammdaten', 'building'],
  ['matrix', 'Qualifikationsmatrix', 'matrix'], ['evaluation', 'Firmen-Auswertung', 'shield'],
  ['sites', 'Baustellen', 'building'], ['subcontractors', 'Nachunternehmer', 'users'], ['meetings', 'Bauleiterbesprechung', 'users'], ['bgbau', 'Baustellenaushang', 'doc'],
  ['supervisors', 'Fachaufsichten', 'shield'], ['accidents', 'Unfallstatistik', 'matrix'],
  ['organization', 'Organigramm', 'users'], ['certification', 'Zertifizierungsübersicht', 'doc'],
  ['norms', 'Normenmatrix', 'matrix'], ['infoMatrix', 'Informationslenkungsmatrix', 'doc'], ['forms', 'Formulare', 'doc'],
  ['calendar', 'Schulungskalender', 'cal'], ['authorized', 'Befähigte Personen', 'shield'],
  ['documents', 'Dokumente', 'doc'], ['drive', 'Meine Ablage', 'building'],
];

const COMPANY_META = {
  tiefbau: { manager:'Christian Janning und Alex Braun', address:'Lingener StraÃŸe 42, 48529 Nordhorn', phone:'+49 5921 8801-0', description:'Tiefbau, Kanalsanierung und Infrastrukturprojekte.', status:'Aktiv' },
  bohrtechnik: { manager:'Christian Janning', address:'Gewerbepark 8, 48531 Nordhorn', phone:'+49 5921 8802-0', description:'Horizontalbohrungen und grabenlose Verlegetechnik.', status:'Aktiv' },
  rohrbau: { manager:'Christian Janning und Bastian Bothe', address:'SÃ¼dring 18, 48527 Nordhorn', phone:'+49 5921 8803-0', description:'Rohrleitungsbau fÃ¼r Gas-, Wasser- und Versorgungsnetze.', status:'Aktiv' },
  galabau: { manager:'Christian Janning', address:'MÃ¼hlenstraÃŸe 37, 48599 Gronau', phone:'+49 2562 8804-0', description:'Garten-, Landschafts- und AuÃŸenanlagenbau.', status:'In Vorbereitung' },
  transporte: { manager:'Christian Janning', address:'Am Hafen 12, 49808 Lingen', phone:'+49 591 8805-0', description:'Baustellenlogistik, Transporte und Materialversorgung.', status:'Inaktiv' },
};

function companyRows() {
  return window.SEED.companies.map(company => ({
    ...company,
    ...COMPANY_META[company.id],
    employees: window.SEED.employees.filter(employee => employee.company === company.id).length,
  }));
}

function CompanyHubView() {
  const [selectedCompany, setSelectedCompany] = React.useState(null);
  const [sort, setSort] = React.useState({ key:'name', dir:'asc' });
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [kpiFilter, setKpiFilter] = React.useState('all');
  if (selectedCompany) return <CompanyDetail company={selectedCompany} onBack={() => setSelectedCompany(null)} />;

  const columns = [
    { key:'name', label:'Name Firma' }, { key:'employees', label:'Anzahl Mitarbeiter' },
    { key:'manager', label:'GeschÃ¤ftsfÃ¼hrer' }, { key:'address', label:'Adresse' },
    { key:'phone', label:'Tel' }, { key:'description', label:'Beschreibung' },
    { key:'logo', label:'Logo' }, { key:'status', label:'Status' },
  ];
  const columnLabel = key => columns.find(column => column.key === key)?.label || key;
  const columnValue = (company, key) => key === 'logo' ? company.short : company[key];
  const allRows = companyRows();
  const kpis = [
    { key:'all', label:'Firmen Anzahl', value:allRows.length, color:'#4a4a48' },
    { key:'active', label:'Aktiv', value:allRows.filter(company => company.status === 'Aktiv').length, color:'#3f7a4a' },
    { key:'preparing', label:'In Vorbereitung', value:allRows.filter(company => company.status === 'In Vorbereitung').length, color:'#b07a19' },
    { key:'inactive', label:'Inaktiv', value:allRows.filter(company => company.status === 'Inaktiv').length, color:'#a13232' },
  ];

  let rows = allRows.filter(company => Object.entries(columnFilters).every(([key, values]) => !values?.length || values.includes(String(columnValue(company, key)))));
  if (kpiFilter === 'active') rows = rows.filter(company => company.status === 'Aktiv');
  if (kpiFilter === 'preparing') rows = rows.filter(company => company.status === 'In Vorbereitung');
  if (kpiFilter === 'inactive') rows = rows.filter(company => company.status === 'Inaktiv');
  rows = [...rows].sort((a, b) => String(columnValue(a, sort.key)).localeCompare(String(columnValue(b, sort.key)), 'de', { numeric:true }) * (sort.dir === 'asc' ? 1 : -1));

  const setCompanySort = (key, dir) => { setSort({ key, dir }); setColumnMenu(null); };
  const toggleFilter = (key, value) => setColumnFilters(current => {
    const values = current[key] || [];
    return { ...current, [key]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
  });
  const filterValues = filterPanel ? Array.from(new Set(allRows.map(company => String(columnValue(company, filterPanel))))).sort((a, b) => a.localeCompare(b, 'de', { numeric:true })) : [];
  const visibleFilterValues = filterValues.filter(value => value.toLowerCase().includes(filterSearch.toLowerCase()));

  const sortLabel = sort.key === 'name' ? 'Name (A-Z)' : columnLabel(sort.key);
  const kpiIcon = { all:'building', active:'check', preparing:'clock', inactive:'x' };
  const statusTone = company => company.status === 'Aktiv' ? 'valid' : company.status === 'In Vorbereitung' ? 'warn' : 'expired';

  return <div className="company-hub">
    <header className="company-list-head">
      <div className="company-list-title"><h1>Firma</h1><p>Firmen der Janning-Gruppe verwalten und im Detail ansehen.</p></div>
      <div className="company-list-kpis">{kpis.map(kpi => <button key={kpi.key} className={kpiFilter === kpi.key ? 'is-active' : ''} style={{ '--company-kpi-color':kpi.color }} onClick={() => setKpiFilter(kpi.key)}><Icon name={kpiIcon[kpi.key]} size={24} /><span>{kpi.label}</span><strong>{kpi.value}</strong></button>)}</div>
      <div className="company-list-actions"><button className="btn btn--ghost"><Icon name="download" size={14} />Exportieren</button><button className="btn btn--primary"><Icon name="plus" size={14} />Firma</button></div>
    </header>
    <div className="company-viewbar">
      <button className="company-sort-button"><Icon name="filter" size={16} />Sortieren: <strong>{sortLabel}</strong><Icon name="chev" size={14} /></button>
      <div className="company-view-toggle"><button className="is-active" title="Kartenansicht"><Icon name="dashboard" size={18} /></button><button title="Listenansicht"><Icon name="matrix" size={18} /></button></div>
    </div>
    {(sort.key !== 'name' || sort.dir !== 'asc' || groupBy || kpiFilter !== 'all') && <div className="company-list-resetbar">
      {(sort.key !== 'name' || sort.dir !== 'asc') && <button className="btn btn--ghost" onClick={() => setSort({ key:'name', dir:'asc' })}>Sortierung zurÃ¼cksetzen</button>}
      {groupBy && <button className="btn btn--ghost" onClick={() => setGroupBy('')}>Gruppierung aufheben</button>}
      {kpiFilter !== 'all' && <button className="btn btn--ghost" onClick={() => setKpiFilter('all')}>KPI-Filter aufheben</button>}
    </div>}
    {Object.entries(columnFilters).some(([, values]) => values?.length) && <div className="company-filter-chips">{Object.entries(columnFilters).flatMap(([key, values]) => (values || []).map(value => <span key={key + value}><small>{columnLabel(key)}:</small><strong>{value}</strong><button onClick={() => toggleFilter(key, value)}><Icon name="x" size={13} /></button></span>))}<button className="btn btn--ghost" onClick={() => setColumnFilters({})}>Alle Filter lÃ¶schen</button></div>}
    <section className="company-card-grid">
      {rows.map(company => <article key={company.id} className="company-card">
        <div className="company-card__top">
          <img src={company.logo} alt={company.short} />
          <div>
            <h2>{company.name}</h2>
            <p>{company.short}</p>
          </div>
          <span className={'company-status company-status--' + statusTone(company)}><i />{company.status}</span>
        </div>
        <div className="company-card__meta">
          <span><Icon name="users" size={18} /><strong>{company.employees}</strong>Mitarbeiter</span>
          <span><Icon name="users" size={18} /><em>Geschäftsführer</em><strong>{company.manager}</strong></span>
        </div>
        <button className="company-card__open" onClick={() => setSelectedCompany(company)}><Icon name="eye" size={22} />Öffnen</button>
      </article>)}
    </section>
    {filterPanel && <div className="company-filter-backdrop" onClick={() => setFilterPanel(null)}><section className="company-filter-panel" onClick={event => event.stopPropagation()}><header><strong>{columnLabel(filterPanel)} filtern</strong><button onClick={() => setFilterPanel(null)}><Icon name="x" size={15} /></button></header><label><Icon name="search" size={15} /><input autoFocus value={filterSearch} onChange={event => setFilterSearch(event.target.value)} placeholder="Suchen..." /></label><div>{visibleFilterValues.map(value => <label key={value}><input type="checkbox" checked={(columnFilters[filterPanel] || []).includes(value)} onChange={() => toggleFilter(filterPanel, value)} /><span>{value}</span></label>)}</div><footer><button className="btn btn--ghost" onClick={() => setColumnFilters(current => ({ ...current, [filterPanel]:[] }))}>ZurÃ¼cksetzen</button><button className="btn btn--primary" onClick={() => setFilterPanel(null)}>Anwenden</button></footer></section></div>}
  </div>;
}

function CompanyDetail({ company, onBack }) {
  const [area, setArea] = React.useState('overview');
  if (area === 'master') return <CompanyMasterRecord company={company} record={companyMasterRecord(company)} onBack={() => setArea('overview')} />;
  if (area === 'matrix') return <CompanyMatrixPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'evaluation') return <CompanyEvaluationPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'sites') return <CompanySitesPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'subcontractors') return <CompanySubcontractorsPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'meetings') return <CompanyMeetingsPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'bgbau') return <CompanyBGBauPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'supervisors') return <CompanySupervisorsPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'accidents') return <CompanyAccidentsPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'organization') return <CompanyOrganizationPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'certification') return <CompanyCertificationPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'norms') return <CompanyNormsPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'infoMatrix') return <CompanyInformationMatrixPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'forms') return <CompanyFormsPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'calendar') return <CompanyCalendarPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'authorized') return <CompanyAuthorizedPeoplePage company={company} onBack={() => setArea('overview')} />;
  if (area === 'documents') return <CompanyDocumentsPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'drive') return <CompanyDrivePage company={company} onBack={() => setArea('overview')} />;
  const openCompanyAreaFromDashboard = (nav) => {
    if (nav === 'matrix') setArea('matrix');
    if (nav === 'calendar') setArea('calendar');
  };
  return <div className="company-detail"><header className="company-detail__top"><div className="company-detail__intro"><button className="emp-round-back" onClick={onBack} title="ZurÃ¼ck"><Icon name="chevL" size={18} stroke={2} /></button><div><h1>Firma-Detail</h1><p>Alle firmenspezifischen Daten im Ãœberblick</p></div></div><section className="company-detail__profile"><img src={company.logo} alt={company.short} /><div><h2>{company.name}</h2><dl><div><dt>GeschÃ¤ftsfÃ¼hrer</dt><dd>{company.manager}</dd></div><div><dt>Mitarbeiter</dt><dd>{company.employees}</dd></div><div><dt>Telefon</dt><dd>{company.phone}</dd></div></dl></div></section></header><div className="company-detail__body"><nav className="emp-section-nav">{COMPANY_DETAIL_AREAS.map(([id, label, icon]) => <button key={id} className={area === id ? 'is-active' : ''} onClick={() => setArea(id)}><Icon name={icon} size={16} /><span>{label}</span><Icon name="chevR" size={13} /></button>)}</nav><main className="company-detail__content">{area === 'overview' ? <DashboardView activeCompany={company.id} setNav={openCompanyAreaFromDashboard} hideSummary /> : <CompanyAreaPlaceholder company={company} area={area} />}</main></div></div>;
}

function CompanyMatrixPage({ company, onBack }) {
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  if (selectedEmployee && window.EmployeeAdminDetail) return <EmployeeAdminDetail emp={selectedEmployee} onBack={() => setSelectedEmployee(null)} />;
  if (showAllCompanies) return <div className="emp-full company-matrix-page"><CompanyPageTitle title="Qualifikationsmatrix (Alle Firmen)" onBack={() => setShowAllCompanies(false)} /><MatrixView activeCompany="all" /></div>;
  return <div className="emp-full company-matrix-page"><CompanyPageTitle title={`Qualifikationsmatrix (${company.name})`} onBack={onBack} /><MatrixView activeCompany={company.id} onEmployeeOpen={setSelectedEmployee} extraAction={<button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>} /></div>;
}

function CompanyEvaluationPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  if (showAllCompanies) return <div className="emp-full company-evaluation-page"><CompanyPageTitle title="Firmen-Auswertung (Alle Firmen)" onBack={() => setShowAllCompanies(false)} /><EvaluationView activeCompany="all" /></div>;
  return <div className="emp-full company-evaluation-page"><CompanyPageTitle title={`Firmen-Auswertung (${company.name})`} onBack={onBack} /><EvaluationView activeCompany={company.id} extraAction={<button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>} /></div>;
}

function CompanySitesPage({ company, onBack }) {
  const [selectedSite, setSelectedSite] = React.useState(null);
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  if (selectedSite) return <CompanySiteDetailPage site={selectedSite} onBack={() => setSelectedSite(null)} />;
  if (showAllCompanies) return <div className="emp-full company-sites-page"><CompanyPageTitle title="Baustellen (Alle Firmen)" onBack={() => setShowAllCompanies(false)} /><BaustellenView activeCompany="all" onOpenSite={setSelectedSite} /></div>;
  return <div className="emp-full company-sites-page"><CompanyPageTitle title={`Baustellen (${company.name})`} onBack={onBack} /><BaustellenView activeCompany={company.id} onOpenSite={setSelectedSite} extraAction={<button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>} /></div>;
}

function companySubcontractorRows() {
  const rows = [
    { id:'sub-1', company:'tiefbau', firma:'Nordhorn Verkehrssicherung GmbH', contact:'Thomas Lange', trade:'Verkehrssicherung', phone:'+49 5921 4048-0', email:'t.lange@nordhorn-vs.de', address:'Bentheimer Strasse 18, 48529 Nordhorn', status:'Freigegeben', hse:true, hseDate:'12.05.2026', rating:true, ratingDate:'28.05.2026', history:'v2.1 - 3 Versionen', description:'Absicherung, Beschilderung und Verkehrslenkung fuer innerstaedtische Baustellen.', documents:['HSE_Nordhorn-Verkehrssicherung_2026.pdf', 'Unterweisung_Baustelle.pdf'] },
    { id:'sub-2', company:'tiefbau', firma:'Emsland Pflastertechnik GmbH', contact:'Piotr Nowak', trade:'Pflasterarbeiten', phone:'+49 591 77442-0', email:'info@emsland-pflaster.de', address:'Am Bauhof 7, 49808 Lingen', status:'In Pruefung', hse:false, hseDate:'-', rating:false, ratingDate:'-', history:'v1.0 - 1 Version', description:'Wiederherstellung von Gehwegen, Pflasterflaechen und Zufahrten.', documents:['Angebot_Pflastertechnik.pdf'] },
    { id:'sub-3', company:'tiefbau', firma:'Meyer Kabelzug Service', contact:'Daniel Meyer', trade:'Kabelzug / Leerrohr', phone:'+49 2562 30091-0', email:'dm@meyer-kabelzug.de', address:'Industrieweg 4, 48599 Gronau', status:'Freigegeben', hse:true, hseDate:'03.06.2026', rating:true, ratingDate:'04.06.2026', history:'v1.4 - 2 Versionen', description:'Kabelzug, Leerrohrpruefung und Unterstuetzung bei Tiefbauanschluessen.', documents:['HSE_Meyer-Kabelzug_2026.pdf'] },
    { id:'sub-4', company:'rohrbau', firma:'Suedring Schweissservice GmbH', contact:'Bastian Bothe', trade:'Schweissarbeiten PE / Stahl', phone:'+49 5921 55290-0', email:'bb@suedring-schweiss.de', address:'Suedring 42, 48527 Nordhorn', status:'Freigegeben', hse:true, hseDate:'18.04.2026', rating:true, ratingDate:'20.04.2026', history:'v3.0 - 5 Versionen', description:'Schweissaufsicht und Ausfuehrung fuer Rohrleitungsbau.', documents:['HSE_Schweissservice_2026.pdf', 'Schweissernachweise.pdf'] },
    { id:'sub-5', company:'bohrtechnik', firma:'Bentheim Bohrspuelung KG', contact:'Hichem Aoune', trade:'Bohrspuelung / Entsorgung', phone:'+49 5922 88110-0', email:'service@bohrspuelung-bentheim.de', address:'Gewerbepark 22, 48455 Bad Bentheim', status:'Gesperrt', hse:false, hseDate:'-', rating:false, ratingDate:'-', history:'v1.2 - 2 Versionen', description:'Bohrspuelung, Transport und Entsorgung. HSE-Nachweis fehlt aktuell.', documents:['Entsorgungsnachweis.pdf'] },
  ];
  return rows.map(row => ({ ...row, companyName: window.company(row.company)?.name || row.company }));
}

function CompanySubcontractorsPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [sort, setSort] = React.useState({ key:'firma', dir:'asc' });
  const columns = [
    ['firma', 'Firma'], ['contact', 'Ansprechpartner'], ['trade', 'Gewerk / Leistung'],
    ['contactLinks', 'Kontakt'], ['status', 'Status'],
    ['hse', 'HSE-Anforderungen'], ['hseDate', 'HSE-Anforderungen unterschrieben am'],
    ['rating', 'Bewertung von Nachunternehmern'], ['ratingDate', 'Bewertung unterschrieben am'],
    ['history', 'Versionshistorie'], ['description', 'Beschreibung'], ['documents', 'Dokumente'],
  ];
  const rows = companySubcontractorRows()
    .filter(row => showAllCompanies || row.company === company.id)
    .sort((a, b) => String(a[sort.key] || '').localeCompare(String(b[sort.key] || ''), 'de', { numeric:true }) * (sort.dir === 'asc' ? 1 : -1));
  const changeSort = key => setSort(current => current.key === key ? { key, dir:current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir:'asc' });
  if (selected) return <CompanySubcontractorDetail row={selected} onBack={() => setSelected(null)} />;
  return <div className="emp-full company-subcontractors-page">
    <CompanyPageTitle title={`Nachunternehmer (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <div className="company-site-kpis">
      <div className="company-site-kpi"><span>Nachunternehmer</span><strong>{rows.length}</strong><small>in Ansicht</small></div>
      <div className="company-site-kpi"><span>Freigegeben</span><strong style={{ color:'#3f7a4a' }}>{rows.filter(row => row.status === 'Freigegeben').length}</strong><small>einsatzbereit</small></div>
      <div className="company-site-kpi"><span>HSE vorhanden</span><strong>{rows.filter(row => row.hse).length}</strong><small>mit Dokument</small></div>
      <div className="company-site-kpi"><span>Offen</span><strong style={{ color:'#a13232' }}>{rows.filter(row => !row.hse || row.status !== 'Freigegeben').length}</strong><small>zu pruefen</small></div>
    </div>
    <section className="card card--pad company-subcontractor-card">
      <div className="company-site-card-head"><div /><button className="btn btn--primary"><Icon name="plus" size={14} />Nachunternehmer anlegen</button></div>
      <div className="company-subcontractor-wrap">
        <table className="company-subcontractor-table">
          <thead><tr>{columns.map(([key, label]) => <th key={key}><button onClick={() => changeSort(key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button></th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.id} onClick={() => setSelected(row)}>
            <td><strong>{row.firma}</strong><small>{row.companyName}</small></td>
            <td>{row.contact}</td><td>{row.trade}</td><td><span className="company-contact-stickers"><button title={row.phone}><Icon name="phone" size={14} /></button><button title={row.email}><Icon name="mail" size={14} /></button><button title={row.address}><Icon name="pin" size={14} /></button></span></td>
            <td><span className={'badge ' + (row.status === 'Freigegeben' ? 'badge--valid' : 'badge--warn')}><span className="badge__dot" />{row.status}</span></td>
            <td><span className={'badge ' + (row.hse ? 'badge--valid' : 'badge--warn')}><span className="badge__dot" />{row.hse ? 'Ja - Nachweis gespeichert' : 'Nein - Dokument fehlt'}</span></td>
            <td>{row.hseDate}</td><td><span className={'badge ' + (row.rating ? 'badge--valid' : 'badge--warn')}><span className="badge__dot" />{row.rating ? 'Ja' : 'Nein'}</span></td><td>{row.ratingDate}</td><td>{row.history}</td><td>{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13} />{row.documents.length}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </div>;
}

function CompanySubcontractorDetail({ row, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState(row);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const Field = ({ label, keyName, icon = 'doc', wide }) => <CompanyMasterField label={label} icon={icon} value={Array.isArray(form[keyName]) ? form[keyName].join(', ') : form[keyName]} editing={editing}>{wide ? <textarea value={form[keyName]} onChange={event => set(keyName, event.target.value)} /> : <input value={form[keyName]} onChange={event => set(keyName, event.target.value)} />}</CompanyMasterField>;
  return <div className="emp-full emp-master-detail company-subcontractor-detail">
    <CompanyPageTitle title={`Nachunternehmer (${form.firma})`} onBack={onBack} action={<div style={{ display:'flex', gap:8 }}><button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button><button className="btn btn--ghost"><Icon name="trash" size={14} />Loeschen</button></div>} />
    <section className="emp-master-hero"><span className="emp-avatar">NU</span><div><div className="emp-master-hero__name"><h2>{form.firma}</h2><span className={'emp-active ' + (!form.hse ? 'is-warn' : '')}><i />{form.hse ? 'HSE vorhanden' : 'HSE fehlt'}</span></div><dl><div><dt>Firma</dt><dd>{form.companyName}</dd></div><div><dt>Gewerk</dt><dd>{form.trade}</dd></div><div><dt>Status</dt><dd>{form.status}</dd></div></dl></div><button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button></section>
    <div className="emp-master-layout"><main className="emp-master-main">
      <CompanyMasterDataCard title="Nachunternehmer" icon="building"><div className="emp-master-field-grid">
        <Field label="Firma" keyName="firma" icon="building" />
        <Field label="Ansprechpartner" keyName="contact" icon="users" />
        <Field label="Gewerk / Leistung" keyName="trade" icon="doc" />
        <Field label="Status" keyName="status" icon="shield" />
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Kontakt" icon="phone"><div className="emp-master-field-grid">
        <Field label="Telefon" keyName="phone" icon="phone" />
        <Field label="E-Mail" keyName="email" icon="mail" />
        <Field label="Adresse" keyName="address" icon="pin" />
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="HSE-Anforderungen" icon="shield"><div className="emp-master-field-grid">
        <CompanyMasterField label="HSE-Anforderungen" icon="check" value={form.hse ? 'Ja - Nachweis als Dokument gespeichert' : 'Nein - Dokument fehlt'} editing={editing}><select value={form.hse ? 'ja' : 'nein'} onChange={event => set('hse', event.target.value === 'ja')}><option value="ja">Ja - mit Beweis als Dokument speichern</option><option value="nein">Nein</option></select></CompanyMasterField>
        <Field label="HSE-Anforderungen unterschrieben am" keyName="hseDate" icon="cal" />
        <CompanyMasterField label="Bewertung von Nachunternehmern" icon="check" value={form.rating ? 'Ja' : 'Nein'} editing={editing}><select value={form.rating ? 'ja' : 'nein'} onChange={event => set('rating', event.target.value === 'ja')}><option value="ja">Ja</option><option value="nein">Nein</option></select></CompanyMasterField>
        <Field label="Bewertung von Nachunternehmern unterschrieben am" keyName="ratingDate" icon="cal" />
        <Field label="Versionshistorie" keyName="history" icon="history" />
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Beschreibung" icon="doc">{editing ? <textarea className="emp-master-description-input" value={form.description} onChange={event => set('description', event.target.value)} /> : <p className="emp-master-description">{form.description}</p>}</CompanyMasterDataCard>
    </main><aside className="emp-master-aside">
      <CompanyMasterDataCard title="Dokumente" icon="doc"><div className="company-file-chip-list">{form.documents.map(doc => <span key={doc} className="company-file-chip"><Icon name="doc" size={14} />{doc}<button>x</button></span>)}{editing && <button className="btn btn--ghost"><Icon name="plus" size={14} />Anlagen hinzufuegen</button>}</div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Geaendert" icon="history"><p className="emp-last-change">09.06.2026, 13:10 Uhr - von Sabine Janning</p></CompanyMasterDataCard>
    </aside></div>
    {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => { setForm(row); setEditing(false); }}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
  </div>;
}

function CompanyMeetingsPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  return <div className="emp-full company-meetings-page">
    <CompanyPageTitle title={`Bauleiterbesprechung (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <BauleiterbesprechungView activeCompany={showAllCompanies ? 'all' : company.id} />
  </div>;
}

function companySupervisorRows() {
  const rows = [
    { id:'fa-1', company:'tiefbau', name:'Stahlschweissaufsicht', area:'Stahlbau', responsible:'Thorsten Schmitz', people:[{ name:'Thorsten Schmitz', certificates:['FW601', 'FW446', 'GW 301'] }], status:'Aktiv', release:'Freigegeben', changed:'05.06.2026 - Sabine Janning', description:'Ueberwachung und Kontrolle von Schweissarbeiten im Stahlbau', document:'Fachaufsicht_Stahlschweissaufsicht.pdf' },
    { id:'fa-2', company:'tiefbau', name:'Fachaufsicht Fernwaerme & GW', area:'Fernwaerme', responsible:'Christian Janning', people:[{ name:'Christian Janning', certificates:['GW 301', 'FW601'] }], status:'Aktiv', release:'Freigegeben', changed:'04.06.2026 - Sabine Janning', description:'Fachaufsicht fuer Fernwaerme- und Sachkundige-Arbeiten', document:'Fachaufsicht_Fernwaerme_GW.pdf' },
    { id:'fa-3', company:'rohrbau', name:'Kunststoffschweissaufsicht', area:'Rohrbau', responsible:'Christian Janning', people:[{ name:'Christian Janning', certificates:['GW 301', 'GW 331 (M)', 'FW601'] }], status:'Aktiv', release:'Freigegeben', changed:'03.06.2026 - Christian Janning', description:'Ueberwachung von Kunststoffschweissarbeiten und PE-HD Verbindungen', document:'Fachaufsicht_Kunststoff.pdf' },
    { id:'fa-4', company:'rohrbau', name:'Beauftragter nach WHG/AwSV', area:'WHG / AwSV', responsible:'Christian Janning', people:[{ name:'Christian Janning', certificates:['WHG', 'AwSV'] }], status:'Aktiv', release:'Freigegeben', changed:'31.05.2026 - Sabine Janning', description:'Wasserhaushalts- und Abwasserbestimmungen', document:'Fachaufsicht_WHG_AwSV.pdf' },
    { id:'fa-5', company:'bohrtechnik', name:'Asbest-Sachkundige', area:'Asbest', responsible:'Thorsten Isensee', people:[{ name:'Thorsten Isensee', certificates:['Asbest I', 'Asbest II'] }, { name:'Stefan Boguta', certificates:['Asbest I', 'Asbest II'] }, { name:'Hichem Aoune', certificates:['Asbest I'] }], status:'Aktiv', release:'Freigegeben', changed:'29.05.2026 - Andreas Janning', description:'Sachkundige fuer Asbest-Arbeiten und -entsorgung', document:'Fachaufsicht_Asbest.pdf' },
    { id:'fa-6', company:'galabau', name:'AutoCAD Spezialisten', area:'Planung', responsible:'Daniel Fehren', people:[{ name:'Daniel Fehren', certificates:['AutoCAD 2024', 'BIM'] }], status:'Aktiv', release:'Freigegeben', changed:'28.05.2026 - Sabine Janning', description:'Konstruktion und technische Zeichnungen', document:'Fachaufsicht_AutoCAD.pdf' },
    { id:'fa-7', company:'galabau', name:'QGIS-Experten', area:'Vermessung', responsible:'Annika Tholen', people:[{ name:'Annika Tholen', certificates:['QGIS Advanced', 'GPS'] }, { name:'Emmelie Gebbeken', certificates:['QGIS Basis', 'Vermessung'] }, { name:'Simone Wilmes', certificates:['QGIS Advanced'] }, { name:'Britta Kuhl', certificates:['QGIS Basis'] }, { name:'Nadine Sommer', certificates:['QGIS Basis'] }, { name:'Monika Schmitz', certificates:['QGIS Advanced'] }], status:'Aktiv', release:'Freigegeben', changed:'27.05.2026 - Sabine Janning', description:'Geographische Informationssysteme und Vermessung', document:'Fachaufsicht_QGIS.pdf' },
    { id:'fa-8', company:'tiefbau', name:'Schweisser', area:'Schweissen', responsible:'Alexander Bartel', people:[{ name:'Alexander Bartel', certificates:['DIN EN 9606 - 111', 'DIN EN 9606 - 135'] }, { name:'Sergej Litke', certificates:['DIN EN 9606 - 111', 'DIN EN 9606 - 131'] }], status:'Aktiv', release:'Freigegeben', changed:'26.05.2026 - Sabine Janning', description:'Qualifizierte Schweisser nach DIN EN 9606', document:'Fachaufsicht_Schweisser.pdf' },
    { id:'fa-9', company:'bohrtechnik', name:'Elektriker', area:'Elektro', responsible:'Paul Krahn', people:[{ name:'Paul Krahn', certificates:['E-Fachkraft', 'Elektropruefung'] }, { name:'Tobias Bruns', certificates:['E-Fachkraft', 'DGUV V3'] }, { name:'Jane Wenke', certificates:['E-Fachkraft', 'Installation'] }], status:'Aktiv', release:'Freigegeben', changed:'25.05.2026 - Andreas Janning', description:'Qualifizierte Elektrofachkraefte und -fuehrer', document:'Fachaufsicht_Elektriker.pdf' },
  ];
  return rows.map(row => ({ ...row, companyName: window.company(row.company)?.name || row.company, certificates: row.people.flatMap(person => person.certificates).join(', ') }));
}

function CompanySupervisorsPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const rows = companySupervisorRows().filter(row => showAllCompanies || row.company === company.id);
  if (selected) return <CompanySupervisorDetail row={selected} onBack={() => setSelected(null)} />;
  const activeCount = rows.filter(row => row.status === 'Aktiv').length;
  const preparingCount = rows.filter(row => row.status !== 'Aktiv').length;
  return <div className="emp-full company-supervisors-page">
    <CompanyPageTitle title={`Fachaufsichten (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={showAllCompanies ? <button className="btn btn--ghost" onClick={() => setShowAllCompanies(false)}><Icon name="building" size={14} />{company.name}</button> : <button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>} />
    <div className="company-site-kpis">
      <div className="company-site-kpi"><span>Fachaufsichten</span><strong>{rows.length}</strong><small>in Ansicht</small></div>
      <div className="company-site-kpi"><span>Aktiv</span><strong style={{ color:'#3f7a4a' }}>{activeCount}</strong><small>freigegeben</small></div>
      <div className="company-site-kpi"><span>In Vorbereitung</span><strong style={{ color:'#8a6a1f' }}>{preparingCount}</strong><small>offen</small></div>
      <div className="company-site-kpi"><span>Dokumente</span><strong>{rows.length}</strong><small>hinterlegt</small></div>
    </div>
    <div className="fachaufsichten-grid company-supervisors-grid">
      {rows.map(row => <article key={row.id} className="fachaufsicht-card company-supervisor-card" onClick={() => setSelected(row)}>
        <div className="card-header"><h3 className="card-title">{row.name}</h3><span className={'badge ' + (row.status === 'Aktiv' ? 'badge--valid' : 'badge--warn')}>{row.status}</span></div>
        <p className="card-description">{row.description}</p>
        <div className="card-content"><div className="verantwortliche-list">
          {row.people.map(person => <div key={person.name} className="person-item"><div className="person-name"><strong>{person.name}</strong></div><div className="zertifikate-tags">{person.certificates.map(cert => <span key={cert} className="tag">{cert}</span>)}</div></div>)}
        </div></div>
        <div className="card-footer"><span className="person-count">{row.people.length} {row.people.length === 1 ? 'Person' : 'Personen'}</span><span className="click-hint">→</span></div>
      </article>)}
    </div>
  </div>;
}

function CompanyAccidentsPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const AccidentView = window.UnfallstatistikView;
  if (selected) return <CompanyAccidentDetail row={selected} onBack={() => setSelected(null)} />;
  return <div className="emp-full company-accidents-page">
    <CompanyPageTitle title={`Unfallstatistik (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} />
    <AccidentView
      activeCompany={showAllCompanies ? 'all' : company.id}
      onOpenFirma={setSelected}
      extraAction={showAllCompanies
        ? <button className="btn btn--ghost" onClick={() => setShowAllCompanies(false)}><Icon name="building" size={14} />{company.name}</button>
        : <button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>}
    />
  </div>;
}

function CompanyAccidentDetail({ row, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState(row);
  const setYear = (jahr, key, value) => setForm(current => ({ ...current, jahreData: current.jahreData.map(item => item.jahr === jahr ? { ...item, [key]: value } : item) }));
  const current = form.jahreData[form.jahreData.length - 1];
  return <div className="emp-full emp-master-detail company-accident-detail">
    <CompanyPageTitle title={`Unfallstatistik bearbeiten (${form.firma})`} onBack={onBack} action={<div style={{ display:'flex', gap:8 }}><button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button><button className="btn btn--ghost"><Icon name="trash" size={14} />Loeschen</button></div>} />
    <section className="emp-master-hero"><span className="emp-avatar">UH</span><div><div className="emp-master-hero__name"><h2>{form.firma}</h2><span className="emp-active"><i />{form.intern}</span></div><dl><div><dt>UH-Quote 2025</dt><dd>{current.uh.toFixed(1)}</dd></div><div><dt>Unfaelle 2025</dt><dd>{current.unfaelle}</dd></div><div><dt>Arbeitsstunden</dt><dd>{current.stunden.toLocaleString('de-DE')}</dd></div></dl></div><button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button></section>
    <div className="emp-master-layout"><main className="emp-master-main">
      <CompanyMasterDataCard title="Firmendaten" icon="building"><div className="emp-master-field-grid">
        <CompanyMasterField label="Firma" icon="building" value={form.firma} editing={editing}><input value={form.firma} onChange={event => setForm(current => ({ ...current, firma:event.target.value }))} /></CompanyMasterField>
        <CompanyMasterField label="Interne Nummer" icon="doc" value={form.intern} editing={editing}><input value={form.intern} onChange={event => setForm(current => ({ ...current, intern:event.target.value }))} /></CompanyMasterField>
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Jahreswerte" icon="matrix"><div className="unfallstatistik-tabelle company-accident-edit-table"><table><thead><tr><th>Jahr</th><th>Unfaelle</th><th>Arbeitsstunden</th><th>UH-Quote</th><th>Dokument</th></tr></thead><tbody>{form.jahreData.map(item => <tr key={item.jahr}><td className="jahr-cell">{item.jahr}</td><td>{editing ? <input type="number" value={item.unfaelle} onChange={event => setYear(item.jahr, 'unfaelle', Number(event.target.value))} /> : item.unfaelle}</td><td>{editing ? <input type="number" value={item.stunden} onChange={event => setYear(item.jahr, 'stunden', Number(event.target.value))} /> : item.stunden.toLocaleString('de-DE')}</td><td>{editing ? <input type="number" step="0.1" value={item.uh} onChange={event => setYear(item.jahr, 'uh', Number(event.target.value))} /> : (item.uh === 0 ? '-' : item.uh.toFixed(2))}</td><td><button className="btn btn--ghost"><Icon name="doc" size={13} />PDF</button></td></tr>)}</tbody></table></div></CompanyMasterDataCard>
    </main><aside className="emp-master-aside"><CompanyMasterDataCard title="Erklaerung" icon="shield"><p className="emp-master-description">UH = Anzahl der Arbeitsunfaelle mal 1.000.000 geteilt durch geleistete Arbeitsstunden.</p></CompanyMasterDataCard><CompanyMasterDataCard title="Geaendert" icon="history"><p className="emp-last-change">08.06.2026, 10:15 Uhr - von Sabine Janning</p></CompanyMasterDataCard></aside></div>
    {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => { setForm(row); setEditing(false); }}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
  </div>;
}

function CompanyOrganizationPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const OrgView = window.OrganigrammView;
  if (selected) return <CompanyOrganizationDetail row={selected} onBack={() => setSelected(null)} />;
  return <div className="emp-full company-organization-page">
    <CompanyPageTitle title={`Organigramm (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} />
    <OrgView
      activeCompany={showAllCompanies ? 'all' : company.id}
      onOpenDoc={setSelected}
      extraAction={showAllCompanies
        ? <button className="btn btn--ghost" onClick={() => setShowAllCompanies(false)}><Icon name="building" size={14} />{company.name}</button>
        : <button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>}
    />
  </div>;
}

function CompanyOrganizationDetail({ row, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState(row);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <div className="emp-full emp-master-detail company-organization-detail">
    <CompanyPageTitle title={`Organigramm bearbeiten (${form.company})`} onBack={onBack} action={<div style={{ display:'flex', gap:8 }}><button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button><button className="btn btn--ghost"><Icon name="trash" size={14} />Loeschen</button></div>} />
    <section className="emp-master-hero"><span className="emp-avatar">OR</span><div><div className="emp-master-hero__name"><h2>{form.name}</h2><span className="emp-active"><i />{form.status}</span></div><dl><div><dt>Firma</dt><dd>{form.company}</dd></div><div><dt>Dokument</dt><dd>{form.documentNo}</dd></div><div><dt>Version</dt><dd>{form.version}</dd></div></dl></div><button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button></section>
    <div className="emp-master-layout"><main className="emp-master-main">
      <CompanyMasterDataCard title="Organigramm-Daten" icon="users"><div className="emp-master-field-grid">
        <CompanyMasterField label="Name Organigramm" icon="doc" value={form.name} editing={editing}><input value={form.name} onChange={event => set('name', event.target.value)} /></CompanyMasterField>
        <CompanyMasterField label="Firmenname" icon="building" value={form.company} editing={editing}><input value={form.company} onChange={event => set('company', event.target.value)} /></CompanyMasterField>
        <CompanyMasterField label="Dokumentennummer" icon="doc" value={form.documentNo} editing={editing}><input value={form.documentNo} onChange={event => set('documentNo', event.target.value)} /></CompanyMasterField>
        <CompanyMasterField label="Versionsnummer" icon="history" value={form.version} editing={editing}><input value={form.version} onChange={event => set('version', event.target.value)} /></CompanyMasterField>
        <CompanyMasterField label="Datum der Erstellung" icon="calendar" value={form.createdAt} editing={editing}><input value={form.createdAt} onChange={event => set('createdAt', event.target.value)} /></CompanyMasterField>
        <CompanyMasterField label="Ersteller" icon="users" value={form.createdBy} editing={editing}><input value={form.createdBy} onChange={event => set('createdBy', event.target.value)} /></CompanyMasterField>
        <CompanyMasterField label="Status" icon="shield" value={form.status} editing={editing}><select value={form.status} onChange={event => set('status', event.target.value)}><option>Freigegeben</option><option>In Pruefung</option><option>Entwurf</option></select></CompanyMasterField>
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Geltungsbereich" icon="matrix">{editing ? <textarea className="emp-master-description-input" value={form.scope} onChange={event => set('scope', event.target.value)} /> : <p className="emp-master-description">{form.scope}</p>}</CompanyMasterDataCard>
    </main><aside className="emp-master-aside"><CompanyMasterDataCard title="PDF-Vorschau" icon="eye"><div className="company-org-preview"><strong>Organigramm</strong><span>{form.documentNo} - Version {form.version}</span><h3>{form.company}</h3><p>{form.scope}</p></div><button className="btn btn--ghost" style={{ marginTop:12 }}><Icon name="download" size={14} />PDF exportieren</button></CompanyMasterDataCard></aside></div>
    {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => { setForm(row); setEditing(false); }}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
  </div>;
}

function CompanyCertificationPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const CertView = window.CertOverviewView;
  return <div className="emp-full company-certification-page">
    <CompanyPageTitle title={`Zertifizierungsuebersicht (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} />
    <CertView
      activeCompany={showAllCompanies ? 'all' : company.id}
      extraAction={showAllCompanies
        ? <button className="btn btn--ghost" onClick={() => setShowAllCompanies(false)}><Icon name="building" size={14} />{company.name}</button>
        : <button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>}
    />
  </div>;
}

function CompanyNormsPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  return <div className="emp-full company-norms-page">
    <CompanyPageTitle title={`Normenmatrix (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <NormenmatrixView />
  </div>;
}

function companyInformationMatrixRows() {
  const baseRows = [
    { id:'ilm-1', company:'tiefbau', bezeichnung:'Lieferscheine', standort:'Buro / Lager', erstelltVon:'Lieferant', freigabe:'Einkauf / Lager', released:true, archivierung:'digital im Portal', aufbewahrung:'10 Jahre', gesetz:'§147 AO, §257 HGB', vernichtung:'Mario Kostring / Daniel Brouwer' },
    { id:'ilm-2', company:'tiefbau', bezeichnung:'Bestellscheine', standort:'Buro', erstelltVon:'Einkauf', freigabe:'GF', released:false, archivierung:'digital im Portal', aufbewahrung:'10 Jahre', gesetz:'§147 AO, §257 HGB', vernichtung:'Mario Kostring' },
    { id:'ilm-3', company:'tiefbau', bezeichnung:'Dienstleistungsvertrage', standort:'Buro', erstelltVon:'GF', freigabe:'GF', released:false, archivierung:'digital + Ordner Vertrag', aufbewahrung:'10 Jahre', gesetz:'§147 AO, §257 HGB', vernichtung:'Christian Janning / Bastian Bothe / Alexander Braun' },
    { id:'ilm-4', company:'tiefbau', bezeichnung:'Angebote', standort:'Buro Kalkulation', erstelltVon:'Kalkulation', freigabe:'GF', released:true, archivierung:'digital', aufbewahrung:'6 Jahre', gesetz:'§147 Abs. 3 AO, §257 Abs. 2 HGB', vernichtung:'Kathrin Janning' },
    { id:'ilm-5', company:'tiefbau', bezeichnung:'Auftrage (Kunden)', standort:'Buro', erstelltVon:'Kalkulation / Bauleitung', freigabe:'GF', released:true, archivierung:'digital + Ordner', aufbewahrung:'10 Jahre', gesetz:'§147 AO', vernichtung:'Kathrin Janning' },
    { id:'ilm-6', company:'bohrtechnik', bezeichnung:'Normvorschriften (DVGW, DIN, TRGS)', standort:'Buro / Portal', erstelltVon:'externe Normstellen', freigabe:'UM-Beauftragter', released:true, archivierung:'digital', aufbewahrung:'gultige Version', gesetz:'ISO 9001 / ISO 14001', vernichtung:'Rahim Ahangarzadeh' },
    { id:'ilm-7', company:'rohrbau', bezeichnung:'Prufvorschriften', standort:'Buro / Portal', erstelltVon:'Hersteller / Behorden', freigabe:'SiGeKo / UM', released:true, archivierung:'digital', aufbewahrung:'gultige Version', gesetz:'ISO 9001 / SCC', vernichtung:'SiGeKo' },
    { id:'ilm-8', company:'galabau', bezeichnung:'Qualitatsmanagementunterlagen', standort:'Portal QSGU', erstelltVon:'Geschaftsfuhrung', freigabe:'Geschaftsfuhrung', released:true, archivierung:'digital', aufbewahrung:'gultige Version', gesetz:'ISO 9001 / SCC / ISO 14001', vernichtung:'Rahim Ahangarzadeh' },
    { id:'ilm-9', company:'transporte', bezeichnung:'Gefahrstoffverzeichnis', standort:'Portal', erstelltVon:'Gefahrstoffbeauftragter', freigabe:'GF', released:false, archivierung:'digital', aufbewahrung:'gultige Version', gesetz:'GefStoffV §6 + TRGS 400', vernichtung:'Mario Kostring' },
    { id:'ilm-10', company:'tiefbau', bezeichnung:'Betriebsanweisungen', standort:'Portal', erstelltVon:'QSGU / Gefahrstoffbeauftragter', freigabe:'QSGU / Geschaftsfuhrung', released:true, archivierung:'digital', aufbewahrung:'bis neue Version + mindestens 10 Jahre', gesetz:'ISO 9001 / SCC / GefStoffV', vernichtung:'Rahim Ahangarzadeh / Mario Kostring' },
  ];
  return baseRows.map(row => ({ ...row, companyName: window.company(row.company)?.name || row.company, source:'SGU_036.pdf', stand:'24.02.2026', version:'001' }));
}

function CompanyInformationMatrixPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [sort, setSort] = React.useState({ key:'bezeichnung', dir:'asc' });
  const columns = [
    ['bezeichnung', 'Bezeichnung Dokument/ Nachweis'],
    ['standort', 'Standort'],
    ['erstelltVon', 'erstellt von'],
    ['freigabe', 'Freigabe'],
    ['released', 'Freigabe für Mitarbeiter'],
    ['archivierung', 'Archivierung'],
    ['aufbewahrung', 'Aufbewahrungsfrist'],
    ['gesetz', 'Gesetz'],
    ['vernichtung', 'Verantwortlich fur Vernichtung'],
  ];
  const rows = companyInformationMatrixRows()
    .filter(row => showAllCompanies || row.company === company.id)
    .sort((a, b) => String(a[sort.key] || '').localeCompare(String(b[sort.key] || ''), 'de', { numeric:true }) * (sort.dir === 'asc' ? 1 : -1));
  const changeSort = key => setSort(current => current.key === key ? { key, dir:current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir:'asc' });
  if (selected) return <CompanyInformationMatrixDetail row={selected} onBack={() => setSelected(null)} />;
  return <div className="emp-full company-info-matrix-page">
    <CompanyPageTitle title={`Informationslenkungsmatrix (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <div className="company-site-kpis">
      <div className="company-site-kpi"><span>Eintrage</span><strong>{rows.length}</strong><small>in Ansicht</small></div>
      <div className="company-site-kpi"><span>Vorlage</span><strong>SGU_036</strong><small>Version 001</small></div>
      <div className="company-site-kpi"><span>Stand</span><strong>24.02.2026</strong><small>aus PDF</small></div>
      <div className="company-site-kpi"><span>Archivierung</span><strong>{rows.filter(row => row.archivierung.toLowerCase().includes('digital')).length}</strong><small>digital</small></div>
    </div>
    <section className="card card--pad company-info-matrix-card">
      <div className="company-site-card-head">
        <div />
        <button className="btn btn--primary"><Icon name="plus" size={14} />Eintrag anlegen</button>
      </div>
      <div className="company-info-matrix-wrap">
        <table className="company-info-matrix-table">
          <thead><tr>{columns.map(([key, label]) => <th key={key}><button onClick={() => changeSort(key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button></th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.id} onClick={() => setSelected(row)}>
            <td><strong>{row.bezeichnung}</strong><small>{row.companyName}</small></td>
            <td>{row.standort}</td>
            <td>{row.erstelltVon}</td>
            <td>{row.freigabe}</td>
            <td><span className={'badge ' + (row.released ? 'badge--valid' : '')}><span className="badge__dot" />{row.released ? 'Freigegeben' : 'Nicht frei'}</span></td>
            <td>{row.archivierung}</td>
            <td>{row.aufbewahrung}</td>
            <td>{row.gesetz}</td>
            <td>{row.vernichtung}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </div>;
}

function CompanyInformationMatrixDetail({ row, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState(row);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const Field = ({ label, keyName, icon = 'doc', wide }) => <CompanyMasterField label={label} icon={icon} value={form[keyName]} editing={editing}>{wide ? <textarea value={form[keyName]} onChange={event => set(keyName, event.target.value)} /> : <input value={form[keyName]} onChange={event => set(keyName, event.target.value)} />}</CompanyMasterField>;
  return <div className="emp-full emp-master-detail company-info-matrix-detail">
    <CompanyPageTitle title={`Informationslenkungsmatrix (${form.bezeichnung})`} onBack={onBack} action={<div style={{ display:'flex', gap:8 }}><button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button><button className="btn btn--ghost"><Icon name="trash" size={14} />Loschen</button></div>} />
    <section className="emp-master-hero"><span className="emp-avatar">IL</span><div><div className="emp-master-hero__name"><h2>{form.bezeichnung}</h2><span className="emp-active"><i />SGU_036</span></div><dl><div><dt>Firma</dt><dd>{form.companyName}</dd></div><div><dt>Stand</dt><dd>{form.stand}</dd></div><div><dt>Version</dt><dd>{form.version}</dd></div></dl></div><button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button></section>
    <div className="emp-master-layout"><main className="emp-master-main">
      <CompanyMasterDataCard title="Dokument / Nachweis" icon="doc"><div className="emp-master-field-grid">
        <Field label="Bezeichnung Dokument/ Nachweis" keyName="bezeichnung" icon="doc" />
        <Field label="Standort" keyName="standort" icon="pin" />
        <Field label="erstellt von" keyName="erstelltVon" icon="users" />
        <Field label="Freigabe" keyName="freigabe" icon="shield" />
        <CompanyMasterField label="Freigabe für Mitarbeiter" icon="check" value={form.released ? 'Freigegeben' : 'Nicht frei'} editing={editing}><select value={form.released ? 'ja' : 'nein'} onChange={event => set('released', event.target.value === 'ja')}><option value="ja">Freigegeben</option><option value="nein">Nicht frei</option></select></CompanyMasterField>
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Lenkung und Archivierung" icon="history"><div className="emp-master-field-grid">
        <Field label="Archivierung" keyName="archivierung" icon="building" />
        <Field label="Aufbewahrungsfrist" keyName="aufbewahrung" icon="clock" />
        <Field label="Gesetz" keyName="gesetz" icon="doc" />
        <Field label="Verantwortlich fur Vernichtung" keyName="vernichtung" icon="users" />
      </div></CompanyMasterDataCard>
    </main><aside className="emp-master-aside">
      <CompanyMasterDataCard title="Vorlage" icon="doc"><p className="emp-last-change"><strong>{form.source}</strong><br />Interne Nr.: SGU_036<br />Stand: {form.stand}</p></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Geandert" icon="history"><p className="emp-last-change">09.06.2026, 11:20 Uhr - von Rahim Ahangarzadeh</p></CompanyMasterDataCard>
    </aside></div>
    {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => { setForm(row); setEditing(false); }}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
  </div>;
}

function CompanyFormsPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  return <div className="emp-full company-forms-page">
    <CompanyPageTitle title={`Formulare (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <FormulareView />
  </div>;
}

function CompanyCalendarPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const [calendarSubView, setCalendarSubView] = React.useState('calendar');
  if (calendarSubView === 'trainings') return <div className="emp-full company-calendar-page">
    <CompanyPageTitle title="Schulungen & Qualifikationen" onBack={() => setCalendarSubView('calendar')} />
    <TrainingsView />
  </div>;
  if (calendarSubView === 'providers') return <div className="emp-full company-calendar-page">
    <CompanyPageTitle title="Akademien & Anbieter" onBack={() => setCalendarSubView('calendar')} />
    <ProvidersView />
  </div>;
  return <div className="emp-full company-calendar-page">
    <CompanyPageTitle title={`Schulungskalender (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} />
    <CalendarView
      activeCompany={showAllCompanies ? 'all' : company.id}
      extraAction={<React.Fragment>
        <button className="btn btn--ghost" onClick={() => setCalendarSubView('trainings')}><Icon name="cap" size={14} />Schulungen</button>
        <button className="btn btn--ghost" onClick={() => setCalendarSubView('providers')}><Icon name="building" size={14} />Akademien & Anbieter</button>
        {showAllCompanies
          ? <button className="btn btn--ghost" onClick={() => setShowAllCompanies(false)}><Icon name="building" size={14} />{company.name}</button>
          : <button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>}
      </React.Fragment>}
    />
  </div>;
}

function CompanyAuthorizedPeoplePage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  return <div className="emp-full company-authorized-page">
    <CompanyPageTitle title={`Befähigte Personen (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <BefaehigtePersonenView
      activeCompany={showAllCompanies ? 'all' : company.id}
    />
  </div>;
}

function CompanyDocumentsPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  return <div className="emp-full company-documents-page">
    <CompanyPageTitle title={`Dokumente (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <DocumentsView mode="home" />
  </div>;
}

function CompanyDrivePage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  return <div className="emp-full company-drive-page">
    <CompanyPageTitle title={`Meine Ablage (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} action={<CompanyAllFirmsButton showAllCompanies={showAllCompanies} setShowAllCompanies={setShowAllCompanies} company={company} />} />
    <DocumentsView mode="drive" />
  </div>;
}

function CompanyAllFirmsButton({ showAllCompanies, setShowAllCompanies, company }) {
  return showAllCompanies
    ? <button className="btn btn--ghost" onClick={() => setShowAllCompanies(false)}><Icon name="building" size={14} />{company.name}</button>
    : <button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>;
}

function CompanySupervisorDetail({ row, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState(row);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const Field = ({ label, value, children }) => <div className="emp-master-field"><Icon name="doc" size={15} /><div><span>{label}</span>{editing ? children : <strong>{value}</strong>}</div></div>;
  return <div className="emp-full emp-master-detail company-supervisor-detail">
    <CompanyPageTitle title={`Fachaufsicht bearbeiten (${form.name})`} onBack={onBack} action={<div style={{ display:'flex', gap:8 }}><button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button><button className="btn btn--ghost"><Icon name="trash" size={14} />Loeschen</button></div>} />
    <section className="emp-master-hero"><span className="emp-avatar">FA</span><div><div className="emp-master-hero__name"><h2>{form.name}</h2><span className="emp-active"><i />{form.status}</span></div><dl><div><dt>Firma</dt><dd>{form.companyName}</dd></div><div><dt>Verantwortlich</dt><dd>{form.responsible}</dd></div></dl></div><button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button></section>
    <div className="emp-master-layout"><main className="emp-master-main">
      <CompanyMasterDataCard title="Fachaufsicht" icon="shield"><div className="emp-master-field-grid">
        <Field label="Name" value={form.name}><input value={form.name} onChange={event => set('name', event.target.value)} /></Field>
        <Field label="Firma" value={form.companyName}><input value={form.companyName} onChange={event => set('companyName', event.target.value)} /></Field>
        <Field label="Bereich" value={form.area}><input value={form.area} onChange={event => set('area', event.target.value)} /></Field>
        <Field label="Status" value={form.status}><select value={form.status} onChange={event => set('status', event.target.value)}><option>Aktiv</option><option>In Vorbereitung</option><option>Inaktiv</option></select></Field>
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Verantwortung" icon="users"><div className="emp-master-field-grid">
        <Field label="Verantwortlich" value={form.responsible}><input value={form.responsible} onChange={event => set('responsible', event.target.value)} /></Field>
        <Field label="Zertifikate" value={form.certificates}><input value={form.certificates} onChange={event => set('certificates', event.target.value)} /></Field>
        <Field label="Freigabe" value={form.release}><select value={form.release} onChange={event => set('release', event.target.value)}><option>Freigegeben</option><option>Nicht frei</option></select></Field>
        <Field label="Dokument" value={form.document}><input value={form.document} onChange={event => set('document', event.target.value)} /></Field>
      </div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Beschreibung" icon="doc">{editing ? <textarea className="emp-master-description-input" value={form.description} onChange={event => set('description', event.target.value)} /> : <p className="emp-master-description">{form.description}</p>}</CompanyMasterDataCard>
    </main><aside className="emp-master-aside"><CompanyMasterDataCard title="Geaendert" icon="history"><p className="emp-last-change">{form.changed}</p></CompanyMasterDataCard><CompanyMasterDataCard title="Dokument" icon="doc"><button className="btn btn--ghost"><Icon name="doc" size={14} />{form.document}</button></CompanyMasterDataCard></aside></div>
    {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => { setForm(row); setEditing(false); }}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
  </div>;
}

function CompanySiteDetailPage({ site, onBack }) {
  const tabs = ['Stammdaten', 'Personal', 'Personal-Pruefung', 'Fehlende Schulungen', 'Gefaehrdungsbeurteilung', 'Alarmplan', 'Dokumente'];
  const [tab, setTab] = React.useState('Stammdaten');
  const [alarmMode, setAlarmMode] = React.useState('empty');
  const [alarmPreviewOpen, setAlarmPreviewOpen] = React.useState(false);
  const missing = typeof site.demoMissing === 'number' ? site.demoMissing : 0;
  const fulfilledCount = typeof site.demoFulfilled === 'number' ? site.demoFulfilled : (missing ? 4 : 6);
  const fulfilled = fulfilledCount + '/6';
  const ready = missing === 0;
  const siteEmployees = (window.SEED?.employees || []).filter(employee => (site.employeeIds || []).includes(employee.id));
  const siteCompanyId = (window.SEED?.companies || []).find(company => company.name === site.company)?.id || ((site.company || '').toLowerCase().includes('rohrbau') ? 'rohrbau' : 'tiefbau');
  const siteSubcontractors = companySubcontractorRows()
    .filter(row => row.company === siteCompanyId)
    .slice(0, site.id === 'bs-2' ? 1 : 2);
  const checkRows = [
    { label:'SCC 016', rule:'90% der Baustellenbesetzung', value:ready ? 'erfuellt' : 'offen' },
    { label:'SCC 017 / 018', rule:'mind. 1 Fuehrungskraft', value:'erfuellt' },
    { label:'Erste Hilfe', rule:'10% der Baustellenbesetzung', value:ready ? 'erfuellt' : 'offen' },
    { label:'MVAS 99', rule:'mind. 1 Person', value:'erfuellt' },
    { label:'GW 129', rule:'mind. 1 Person', value:'erfuellt' },
    { label:'Geraetefuehrer', rule:'mind. 1 freigegebene Person', value:'erfuellt' },
  ];
  const missingRows = checkRows.filter(row => row.value === 'offen');
  const docs = [
    { name:'Baustellenaushang.pdf', date:'20.05.2026', status:'freigegeben' },
    { name:'Unterweisung-Baustelle.pdf', date:'18.05.2026', status:'in Pruefung' },
    { name:'Verkehrssicherung-Plan.pdf', date:'15.05.2026', status:'freigegeben' },
  ];
  const alarmPlan = {
    nr:'FB 7.2',
    firma:'Janning Group',
    fragebogen:'Christian Janning',
    stand:'01/26',
    baustelle:site.projectName,
    auftraggeber:site.auftraggeber,
    telefonAuftraggeber:'',
    auftragnehmer:'Janning Group\nJ.-D.-Lauenstein-Str. 24 | 49767 Twist',
    telefonAuftragnehmer:'05936 89639-0',
    bauleiter:site.bauleiter,
    telefonBauleiter:'',
    ersthelfer:siteEmployees[0]?.name || 'Markus Brinker',
    telefonErsthelfer:'+49 5921 1004',
    sicherheit:'Rahim Ahangarzadeh',
    telefonSicherheit:'',
    durchgangsarzt:'',
    telefonDurchgangsarzt:'',
    krankenhaus:'',
    telefonKrankenhaus:'',
  };
  const renderTab = () => {
    if (tab === 'Stammdaten') return <section className="card card--pad company-site-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:18 }}>
        <div className="card__title">Baustellen-Details</div>
        <button className="btn btn--ghost"><Icon name="edit" size={14} />Bearbeite Stammdaten</button>
      </div>
      <div className="company-site-fields">
        <CompanyMasterField label="Projektname" icon="building" value={site.projectName} />
        <CompanyMasterField label="Projekt-Nr." icon="doc" value={site.projectNr} />
        <CompanyMasterField label="Bauleiter" icon="users" value={site.bauleiter} />
        <CompanyMasterField label="Vorarbeiter" icon="users" value={site.vorarbeiter} />
        <CompanyMasterField label="Auftraggeber" icon="building" value={site.auftraggeber} />
        <CompanyMasterField label="Firma" icon="building" value={site.company} />
        <CompanyMasterField label="Adresse" icon="pin" value={site.adresse} />
        <div className="emp-master-field company-site-sub-field"><Icon name="users" size={15} /><div><span>Nachunternehmer</span><div className="company-site-sub-chips">{siteSubcontractors.map(sub => <span key={sub.id} className="company-site-sub-chip"><strong>{sub.firma}</strong><small>{sub.trade}</small><em className={sub.hse ? 'is-ok' : 'is-open'}>{sub.hse ? 'HSE unterschrieben' : 'HSE fehlt'}</em></span>)}</div></div></div>
      </div>
    </section>;
    if (tab === 'Personal') return <section className="card card--pad company-site-card company-site-personal-card">
      <div className="company-site-card-head"><div><div className="card__title">Mitarbeiter der Baustelle</div><div className="card__sub">{siteEmployees.length} Mitarbeiter im Projekt</div></div><button className="btn btn--ghost"><Icon name="edit" size={14} />Liste bearbeiten</button></div>
      <div className="company-site-personal-wrap">
        <table className="company-site-personal-table">
          <thead><tr><th>Mitarbeiter</th><th>SCC 016</th><th>SCC 017 / 018</th><th>Erste Hilfe</th><th>MVAS 99</th><th>GW 129</th><th>Geraetefuehrer</th><th>Freigabe Portal</th></tr></thead>
          <tbody>{siteEmployees.map((employee, index) => {
            const allOk = ready || index < Math.max(2, siteEmployees.length - 1);
            const deviceTypes = ['Bagger', 'Minibagger', 'Teleskopstapler', 'Personenkraftwagen'];
            const Check = ({ ok }) => ok ? <span className="company-site-check">âœ“</span> : <span className="company-site-dash">-</span>;
            const released = index === 0;
            return <tr key={employee.id}>
              <td><strong>{employee.name}</strong><small>{window.company(employee.company)?.short || employee.company} - {employee.position}</small></td>
              <td><Check ok={allOk || index % 2 === 0} /></td>
              <td><Check ok={allOk || index % 3 !== 0} /></td>
              <td><Check ok={allOk || index % 2 !== 0} /></td>
              <td><Check ok={allOk || index % 4 !== 0} /></td>
              <td><Check ok={allOk || index % 3 === 0} /></td>
              <td>{index < 4 ? <span className="badge"><span className="badge__dot" />{deviceTypes[index % deviceTypes.length]}</span> : <span className="company-site-dash">-</span>}</td>
              <td><label className="company-site-release"><input type="checkbox" checked={released} readOnly /><span className={'badge ' + (released ? 'badge--valid' : '')}><span className="badge__dot" />{released ? 'Freigegeben' : 'Nicht frei'}</span></label></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </section>;
    if (tab === 'Personal-Pruefung') return <section className="card card--pad company-site-card">
      <div className="card__title">Personal-Pruefung</div>
      <div className="company-site-check-grid">{checkRows.map(row => <div key={row.label} className={row.value === 'erfuellt' ? 'is-ok' : 'is-open'}><strong>{row.label}</strong><small>{row.rule}</small><span>{row.value}</span></div>)}</div>
    </section>;
    if (tab === 'Fehlende Schulungen') return <section className="card card--pad company-site-card">
      <div className="company-site-card-head"><div><div className="card__title">Fehlende Schulungen</div><div className="card__sub">{missingRows.length ? 'Personal muss nachgeplant werden.' : 'Keine fehlenden Schulungen.'}</div></div>{missingRows.length > 0 && <button className="btn btn--primary"><Icon name="plus" size={14} />Schulung planen</button>}</div>
      <div className="company-site-missing">{missingRows.length ? missingRows.map(row => <div key={row.label}><div><strong>{row.label}</strong><small>{row.rule}</small></div><span className="badge badge--warn"><span className="badge__dot" />offen</span></div>) : <div className="company-site-empty">Alle Pflichtpunkte sind erfuellt.</div>}</div>
    </section>;
    if (tab === 'Gefaehrdungsbeurteilung') {
      const riskRows = [
        { nr:1, name:'Baustellenanmeldung BG BAU', notRequired:false, done:true, date:'18.05.2026', description:'Baustellenanmeldung fuer ' + site.projectName + ' vorbereitet.', document:'BG-BAU-Anmeldung.pdf' },
        { nr:2, name:'Betriebs-Gefaehrdungsbeurteilung', notRequired:false, done:true, date:'19.05.2026', description:'Betriebliche Grundgefaehrdungen fuer Tiefbauarbeiten geprueft.', document:'Betriebs-Gefaehrdungsbeurteilung.pdf' },
        { nr:3, name:'Ergaenzende Gefaehrdungsbeurteilung Baustelle', notRequired:false, done:ready, date:'22.05.2026', description:ready ? 'Ergaenzung fuer Verkehrsbereich dokumentiert.' : 'Ergaenzung fuer Verkehrsbereich noch offen.', document:'Ergaenzende-GBU-Baustelle.pdf' },
        { nr:4, name:'Projektbezogene Unterweisung', notRequired:false, done:true, date:'20.05.2026', description:'Projektbezogene Unterweisung mit dem Baustellenteam dokumentiert.', document:'Projektbezogene-Unterweisung.pdf' },
        { nr:5, name:'Erstunterweisung Baustellen', notRequired:false, done:true, date:'20.05.2026', description:'Erstunterweisung fuer neue Baustellenbesetzung abgeschlossen.', document:'Erstunterweisung-Baustelle.pdf' },
      ];
      return <section className="card card--pad company-site-card company-site-risk-card">
        <div className="company-site-card-head">
          <div><div className="card__title">Gefaehrdungsbeurteilung</div><div className="card__sub">{site.name} - {site.projectName}</div></div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}><span className="badge badge--accent"><span className="badge__dot" />Beispiel ausgefuellt</span><button className="btn btn--ghost"><Icon name="edit" size={14} />Bearbeiten</button></div>
        </div>
        <div className="company-site-risk-wrap">
          <table className="tbl company-site-risk-table">
            <thead><tr><th>Nr.</th><th>Name</th><th>Nicht erforderlich</th><th>Erledigt</th><th>Datum</th><th>Beschreibung</th><th>Dokument (PDF)</th></tr></thead>
            <tbody>{riskRows.map(row => <tr key={row.nr}>
              <td className="num">{row.nr}</td>
              <td><strong>{row.name}</strong></td>
              <td><input type="checkbox" checked={row.notRequired} readOnly /></td>
              <td><input type="checkbox" checked={row.done} readOnly /></td>
              <td>{row.date}</td>
              <td>{row.description}</td>
              <td><button className="btn btn--ghost company-site-doc-chip"><Icon name="doc" size={13} />{row.document}</button></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>;
    }
    if (tab === 'Alarmplan') {
      const alarmFields = [
        ['nr','Nr.', alarmPlan.nr], ['firma','Firma', alarmPlan.firma],
        ['fragebogen','Fragebogen durch', alarmPlan.fragebogen], ['stand','Stand', alarmPlan.stand],
        ['baustelle','Baustelle', alarmPlan.baustelle, true], ['auftraggeber','Auftraggeber', alarmPlan.auftraggeber],
        ['telefonAuftraggeber','Telefon Auftraggeber', alarmPlan.telefonAuftraggeber],
        ['telefonAuftragnehmer','Telefon Auftragnehmer', alarmPlan.telefonAuftragnehmer],
        ['bauleiter','Bauleiter Fa. Janning', alarmPlan.bauleiter], ['telefonBauleiter','Telefon Bauleiter', alarmPlan.telefonBauleiter],
        ['ersthelfer','Ersthelfer', alarmPlan.ersthelfer], ['telefonErsthelfer','Telefon Ersthelfer', alarmPlan.telefonErsthelfer],
        ['sicherheit','Fachkraft fuer Arbeitssicherheit', alarmPlan.sicherheit], ['telefonSicherheit','Telefon Fachkraft', alarmPlan.telefonSicherheit],
        ['durchgangsarzt','Naechster Durchgangsarzt', alarmPlan.durchgangsarzt], ['telefonDurchgangsarzt','Telefon Durchgangsarzt', alarmPlan.telefonDurchgangsarzt],
        ['krankenhaus','Naechstes Krankenhaus', alarmPlan.krankenhaus], ['telefonKrankenhaus','Telefon Krankenhaus', alarmPlan.telefonKrankenhaus],
      ];
      if (alarmMode === 'empty') return <section className="card card--pad company-site-card company-site-alarm-card">
        <div className="company-site-card-head"><div><div className="card__title">Alarmplan</div><div className="card__sub">A4-PDF fuer die ausgewaehlte Baustelle.</div></div><span className="badge badge--warn"><span className="badge__dot" />Noch nicht erstellt</span></div>
        <div className="company-site-alarm-empty">
          <div><strong>Alarmplan {site.projectNr}.pdf</strong><small>{site.projectName} - A4 Druckvorlage nach Janning-Vorlage</small></div>
          <button className="btn btn--primary" onClick={() => setAlarmMode('edit')}><Icon name="plus" size={14} />Alarmplan erstellen</button>
        </div>
      </section>;
      if (alarmMode === 'edit') return <section className="card card--pad company-site-card company-site-alarm-card">
        <div className="company-site-card-head"><div><div className="card__title">Alarmplan erstellen</div><div className="card__sub">{site.projectNr} - {site.company}</div></div></div>
        <div className="company-site-alarm-form">
          {alarmFields.map(([key, label, value, wide]) => <label key={key} className={wide ? 'is-wide' : ''}><span>{label}</span><input value={value || ''} readOnly /></label>)}
          <label className="is-wide"><span>Auftragnehmer</span><textarea value={alarmPlan.auftragnehmer} readOnly rows={3} /></label>
        </div>
        <div className="company-site-form-actions"><button className="btn btn--ghost" onClick={() => setAlarmMode('empty')}>Abbrechen</button><button className="btn btn--ghost" onClick={() => setAlarmPreviewOpen(true)}><Icon name="eye" size={14} />Vorschau</button><button className="btn btn--primary" onClick={() => setAlarmMode('ready')}>Speichern</button></div>
      </section>;
      return <section className="card card--pad company-site-card company-site-alarm-card">
        <div className="company-site-card-head"><div><div className="card__title">Alarmplan</div><div className="card__sub">A4-PDF fuer die ausgewaehlte Baustelle.</div></div><span className="badge badge--valid"><span className="badge__dot" />Alarmplan vorhanden</span></div>
        <div className="company-site-alarm-empty">
          <div><strong>Alarmplan {site.projectNr}.pdf</strong><small>{site.projectName} - A4 Druckvorlage nach Janning-Vorlage</small></div>
          <div style={{ display:'flex', gap:8 }}><button className="btn btn--ghost" onClick={() => setAlarmMode('edit')}><Icon name="edit" size={14} />Bearbeiten</button><button className="btn btn--ghost" onClick={() => setAlarmPreviewOpen(true)}><Icon name="eye" size={14} />Vorschau</button><button className="btn btn--primary"><Icon name="download" size={14} />PDF anzeigen</button></div>
        </div>
      </section>;
    }
    if (false && tab === 'Alarmplan') return <section className="card card--pad company-site-card company-site-alarm-card">
      <div className="company-site-card-head">
        <div><div className="card__title">Alarmplan</div><div className="card__sub">Aushang und Notfallkontakte fuer die Baustelle.</div></div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}><span className="badge badge--valid"><span className="badge__dot" />vorhanden</span><button className="btn btn--ghost"><Icon name="edit" size={14} />Bearbeiten</button><button className="btn btn--primary"><Icon name="download" size={14} />PDF anzeigen</button></div>
      </div>
      <div className="company-site-alarm-layout">
        <div className="company-site-alarm-preview">
          <div className="company-site-alarm-sheet">
            <header><strong>ALARMPLAN</strong><span>{site.projectNr}</span></header>
            <div><b>Baustelle</b><p>{site.projectName}</p></div>
            <div><b>Adresse</b><p>{site.adresse}</p></div>
            <div><b>Bauleiter</b><p>{site.bauleiter}</p></div>
            <div><b>Ersthelfer</b><p>{siteEmployees.slice(0, 2).map(employee => employee.name).join(', ') || 'Markus Brinker'}</p></div>
            <footer>Notruf 112 Â· Rettungspunkt vor Ort</footer>
          </div>
        </div>
        <div className="company-site-alarm-info">
          <div><span>Dokument</span><strong>Alarmplan_{site.projectNr}.pdf</strong></div>
          <div><span>Stand</span><strong>05.06.2026</strong></div>
          <div><span>Freigabe</span><strong>Sabine Janning</strong></div>
          <div><span>Status</span><strong style={{ color:'#3f7a4a' }}>Freigegeben</strong></div>
        </div>
      </div>
    </section>;
    return <section className="card card--pad company-site-card">
      <div className="company-site-card-head"><div><div className="card__title">Dokumente</div><div className="card__sub">Baustellenunterlagen und Freigaben</div></div><button className="btn btn--ghost"><Icon name="plus" size={14} />Dokument hochladen</button></div>
      <div className="company-site-doc-table-wrap">
        <table className="company-site-doc-table">
          <thead><tr><th>Dokument</th><th>Kategorie</th><th>Datum</th><th>Status</th><th>Freigabe</th><th>Aktionen</th></tr></thead>
          <tbody>{[
            { ...docs[0], category:'BG BAU', release:'Mitarbeiter sichtbar' },
            { ...docs[1], category:'Unterweisung', release:'intern' },
            { ...docs[2], category:'Verkehrssicherung', release:'Mitarbeiter sichtbar' },
            { name:'Alarmplan_' + site.projectNr + '.pdf', date:'05.06.2026', status:'freigegeben', category:'Alarmplan', release:'Mitarbeiter sichtbar' },
          ].map(doc => <tr key={doc.name}>
            <td><Icon name="doc" size={15} /><div><strong>{doc.name}</strong><small>PDF Â· Beispielanhang</small></div></td>
            <td>{doc.category}</td>
            <td>{doc.date}</td>
            <td><span className={'badge ' + (doc.status === 'freigegeben' ? 'badge--valid' : 'badge--warn')}><span className="badge__dot" />{doc.status}</span></td>
            <td>{doc.release}</td>
            <td><div className="company-site-doc-actions"><button className="icon-btn"><Icon name="eye" size={14} /></button><button className="icon-btn"><Icon name="download" size={14} /></button><button className="icon-btn"><Icon name="edit" size={14} /></button></div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>;
  };
  return <div className="emp-full company-site-detail-page">
    <header className="company-site-topline">
      <div className="company-site-titleline">
        <button className="emp-round-back" onClick={onBack} title="Zurueck"><Icon name="chevL" size={18} stroke={2} /></button>
        <h1>{site.name}</h1>
        <span className={'badge ' + (ready ? 'badge--valid' : 'badge--warn')}><span className="badge__dot" />{ready ? 'Personal reicht' : missing + ' fehlen'}</span>
        <p>{site.company} - {site.adresse} - Bauleiter: {site.bauleiter}</p>
      </div>
      <button className="btn btn--primary is-danger"><Icon name="trash" size={14} />Loeschen</button>
    </header>
    <nav className="company-site-tabs">{tabs.map(item => <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}</nav>
    <div className="company-site-kpis">
      <div className="company-site-kpi"><span>Mitarbeiter</span><strong>{site.employeeIds?.length || 0}</strong><small>ausgewaehlt</small></div>
      <div className="company-site-kpi"><span>Pflichtpunkte</span><strong style={{ color:ready ? '#3f7a4a' : '#8a6a1f' }}>{fulfilled}</strong><small>erfuellt</small></div>
      <div className="company-site-kpi"><span>Fehlende Schulungen</span><strong style={{ color:missing ? '#a13232' : '#3f7a4a' }}>{missing}</strong><small>nachplanen</small></div>
      <div className="company-site-kpi"><span>Status</span><strong style={{ color:ready ? '#3f7a4a' : '#a13232' }}>{ready ? 'OK' : 'Offen'}</strong><small>einsatzbereit</small></div>
    </div>
    {renderTab()}
    {alarmPreviewOpen && <div className="company-site-alarm-modal" onClick={() => setAlarmPreviewOpen(false)}>
      <div className="company-site-alarm-modal__box" onClick={event => event.stopPropagation()}>
        <header><div><strong>Alarmplan Vorschau</strong><small>{site.projectNr} - A4</small></div><div><button className="btn btn--primary">PDF anzeigen / Drucken</button><button className="company-site-modal-close" onClick={() => setAlarmPreviewOpen(false)}>x</button></div></header>
        <div className="company-site-alarm-modal__body">
          <div className="company-site-alarm-a4">
            <section className="alarm-a4-top"><div><b>Nr:</b> {alarmPlan.nr}<br /><b>Firma:</b> {alarmPlan.firma}<br /><br />Fragebogen durch: {alarmPlan.fragebogen}<br />Stand: {alarmPlan.stand}</div><h2>ALARMPLAN</h2><div><img src="assets/logos/janning-group-alarmplan.png" alt="Janning Group" /></div></section>
            <section className="alarm-a4-row"><b>Baustelle:</b><span>{alarmPlan.baustelle}</span><b></b></section>
            <section className="alarm-a4-row"><b>Auftraggeber:</b><span>{alarmPlan.auftraggeber}</span><b>Tel.</b><span>{alarmPlan.telefonAuftraggeber}</span></section>
            <section className="alarm-a4-row"><b>Auftragnehmer:</b><span>{alarmPlan.auftragnehmer}</span><b>Tel.</b><span>{alarmPlan.telefonAuftragnehmer}</span></section>
            <section className="alarm-a4-row"><b>Bauleiter Fa. Janning:</b><span>{alarmPlan.bauleiter}</span><b>Tel.</b><span>{alarmPlan.telefonBauleiter}</span></section>
            <section className="alarm-a4-row"><b>Ersthelfer:</b><span>{alarmPlan.ersthelfer}</span><b>Tel.</b><span>{alarmPlan.telefonErsthelfer}</span></section>
            <section className="alarm-a4-row"><b>Fachkraft fuer Arbeitssicherheit:</b><span>{alarmPlan.sicherheit}</span><b>Tel.</b><span>{alarmPlan.telefonSicherheit}</span></section>
            <section className="alarm-a4-row"><b>Naechster Durchgangsarzt:</b><span>{alarmPlan.durchgangsarzt}</span><b>Tel.</b><span>{alarmPlan.telefonDurchgangsarzt}</span></section>
            <section className="alarm-a4-row"><b>Naechstes Krankenhaus:</b><span>{alarmPlan.krankenhaus}</span><b>Tel.</b><span>{alarmPlan.telefonKrankenhaus}</span></section>
            <section className="alarm-a4-band">Verhalten bei Unfaellen<br />Ruhe bewahren</section>
            <section className="alarm-a4-notruf">NOTRUF: 112</section>
            <section className="alarm-a4-steps"><div>1. Unfall melden</div><div className="alarm-a4-phone"><img src="assets/icons/alarm-phone.svg" alt="" /></div><div><b>WO</b> geschah es?<br /><b>WAS</b> geschah?<br /><b>WIE</b> viele Verletzte?</div><div>2. Erste Hilfe</div><div>Verletzungen versorgen und Verletzten betreuen.</div><div>3. Weitere Massnahmen</div><div>Krankenwagen oder Feuerwehr einweisen.</div></section>
            <footer>Jeder Arbeitsunfall ist zu melden. Bei schweren oder toedlichen Arbeitsunfaellen sofortige Meldung an Vorgesetzte und Fachkraft fuer Arbeitssicherheit.</footer>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}

function companyBGBauRows() {
  const employees = window.SEED?.employees || [];
  return [
    { id:'bgbau-1', nr:'BG-2026-001', company:'tiefbau', project:'Kanalsanierung Nordhorn', address:'Lingener Strasse 42, 48529 Nordhorn', start:'2026-04-15', end:'2026-06-28', status:'Aktiv', responsible:'Alexander Petersen', employees:12, doc:'BGBAU_Kanalsanierung_Nordhorn.pdf', description:'Aushang fuer Kanalsanierung Nordhorn mit Notfall- und Ansprechpartnerdaten.' },
    { id:'bgbau-2', nr:'BG-2026-006', company:'tiefbau', project:'Hausanschluss Nordring', address:'Nordring 12, 48529 Nordhorn', start:'2026-05-18', end:'2026-06-20', status:'In Pruefung', responsible:'Alexander Petersen', employees:3, doc:'BGBAU_Hausanschluss_Nordring.pdf', description:'Aushang fuer kleinere Tiefbau-Baustelle, Personalpruefung noch offen.' },
    { id:'bgbau-3', nr:'BG-2026-002', company:'rohrbau', project:'Hausanschluesse Suedring', address:'Suedring 18, 48527 Nordhorn', start:'2026-05-20', end:'2026-07-10', status:'Aktiv', responsible:'Stefan Mueller', employees:9, doc:'BGBAU_Suedring.pdf', description:'Aushang fuer Rohrbauarbeiten Suedring.' },
  ].map(row => ({ ...row, companyName: window.company(row.company)?.name || row.company, employeeList: employees.filter(employee => employee.company === row.company).slice(0, row.employees) }));
}

function CompanyBGBauPage({ company, onBack }) {
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);
  const BGBauView = window.BGBauAushangView;
  return <div className="emp-full company-bgbau-page company-bgbau-page--native">
    <CompanyPageTitle title={`Baustellenaushang (${showAllCompanies ? 'Alle Firmen' : company.name})`} onBack={onBack} />
    <BGBauView
      activeCompany={showAllCompanies ? 'all' : company.id}
      title="Baustellenaushang"
      extraAction={<React.Fragment>
        {showAllCompanies
          ? <button className="btn btn--ghost" onClick={() => setShowAllCompanies(false)}><Icon name="building" size={14} />{company.name}</button>
          : <button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14} />Alle Firmen</button>}
      </React.Fragment>}
    />
  </div>;
}

function companyMasterRecord(company) {
  return { name:company.name, employees:company.employees, manager:company.manager, address:company.address, phone:company.phone, logo:company.logo, status:company.status, description:company.description, changed:'05.06.2026, 09:40 Uhr - von Sabine Janning' };
}

function CompanyMasterArea({ company }) {
  return <CompanyMasterRecord company={company} record={companyMasterRecord(company)} />;
}

function CompanyMasterRecord({ company, record, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState(record);
  const set = (key, value) => setForm(current => ({ ...current, [key]:value }));
  return <div className="emp-full emp-master-detail company-master-detail">
    <CompanyPageTitle title={`Stammdaten (${company.name})`} onBack={onBack} action={<button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Alle bearbeiten</button>} />
    <section className="emp-master-hero"><span className="company-master-hero-logo"><img src={form.logo} alt={company.short} /></span><div><div className="emp-master-hero__name"><h2>{form.name}</h2><span className="emp-active"><i />{form.status}</span></div><dl><div><dt>GeschÃ¤ftsfÃ¼hrer</dt><dd>{form.manager}</dd></div><div><dt>Mitarbeiter</dt><dd>{form.employees}</dd></div></dl></div><button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Alle bearbeiten</button></section>
    <div className="emp-master-layout"><main className="emp-master-main">
      <CompanyMasterDataCard title="Firmendaten" icon="building"><div className="emp-master-field-grid"><CompanyMasterField label="Name Firma" icon="building" value={form.name} editing={editing}><input value={form.name} onChange={event => set('name', event.target.value)} /></CompanyMasterField><CompanyMasterField label="Anzahl Mitarbeiter" icon="users" value={form.employees} editing={editing}><input value={form.employees} onChange={event => set('employees', event.target.value)} /></CompanyMasterField><CompanyMasterField label="GeschÃ¤ftsfÃ¼hrer" icon="users" value={form.manager} editing={editing}><input value={form.manager} onChange={event => set('manager', event.target.value)} /></CompanyMasterField><CompanyMasterField label="Status" icon="shield" value={form.status} editing={editing}><select value={form.status} onChange={event => set('status', event.target.value)}><option>Aktiv</option><option>In Vorbereitung</option><option>Inaktiv</option></select></CompanyMasterField></div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Kontakt" icon="phone"><div className="emp-master-contact-list"><CompanyMasterField label="Adresse" icon="pin" value={form.address} editing={editing}><input value={form.address} onChange={event => set('address', event.target.value)} /></CompanyMasterField><CompanyMasterField label="Tel" icon="phone" value={form.phone} editing={editing}><input value={form.phone} onChange={event => set('phone', event.target.value)} /></CompanyMasterField></div></CompanyMasterDataCard>
      <CompanyMasterDataCard title="Beschreibung" icon="doc">{editing ? <textarea className="emp-master-description-input" value={form.description} onChange={event => set('description', event.target.value)} /> : <p className="emp-master-description">{form.description}</p>}</CompanyMasterDataCard>
    </main><aside className="emp-master-aside"><CompanyMasterDataCard title="GeÃ¤ndert" icon="history"><p className="emp-last-change">{form.changed}</p></CompanyMasterDataCard><CompanyMasterDataCard title="Logo" icon="doc"><div className="company-master-photo"><img src={form.logo} alt={company.short} /><div><strong>Firmenlogo</strong><small>PNG oder JPG</small><label><Icon name="upload" size={14} />Logo Ã¤ndern<input type="file" accept="image/*" /></label></div></div></CompanyMasterDataCard></aside></div>
    {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
  </div>;
}

function CompanyPageTitle({ title, onBack, action }) {
  return <header className="emp-page-title"><div>{onBack && <button className="emp-round-back" onClick={onBack} title="ZurÃ¼ck"><Icon name="chevL" size={18} stroke={2} /></button>}<h1>{title}</h1></div>{action}</header>;
}

function CompanyMasterDataCard({ title, icon, children }) {
  return <section className="emp-master-card"><header><Icon name={icon} size={17} /><h3>{title}</h3></header><div className="emp-master-card__body">{children}</div></section>;
}

function CompanyMasterField({ label, icon, value, editing, children }) {
  return <div className="emp-master-field">{icon && <Icon name={icon} size={15} />}<div><span>{label}</span>{editing ? children : <strong>{value}</strong>}</div></div>;
}

function CompanyAreaPlaceholder({ company, area }) {
  const found = COMPANY_DETAIL_AREAS.find(item => item[0] === area);
  return <section className="company-area-placeholder"><Icon name={found?.[2] || 'doc'} size={26} /><h2>{found?.[1]}</h2><p>Der Bereich fÃ¼r {company.name} wird im nÃ¤chsten Schritt aufgebaut.</p></section>;
}

window.CompanyHubView = CompanyHubView;
window.companyInformationMatrixRows = companyInformationMatrixRows;
