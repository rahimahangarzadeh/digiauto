/* Company list and company-scoped detail workspace */

const COMPANY_DETAIL_AREAS = [
  ['overview','Übersicht','dashboard'], ['master','Stammdaten','building'],
  ['matrix','Qualifikationsmatrix','matrix'], ['evaluation','Firmen-Auswertung','shield'],
  ['sites','Baustellen','building'], ['bgbau','Baustellenaushang','doc'],
  ['supervisors','Fachaufsichten','shield'], ['accidents','Unfallstatistik','matrix'],
  ['organization','Organigramm','users'], ['certification','Zertifizierungsübersicht','doc'],
];

const COMPANY_META = {
  tiefbau:{manager:'Michael Janning',address:'Lingener Straße 42, 48529 Nordhorn',phone:'+49 5921 8801-0',description:'Tiefbau, Kanalsanierung und Infrastrukturprojekte.',status:'Aktiv'},
  bohrtechnik:{manager:'Andreas Janning',address:'Gewerbepark 8, 48531 Nordhorn',phone:'+49 5921 8802-0',description:'Horizontalbohrungen und grabenlose Verlegetechnik.',status:'Aktiv'},
  rohrbau:{manager:'Stefan Janning',address:'Südring 18, 48527 Nordhorn',phone:'+49 5921 8803-0',description:'Rohrleitungsbau für Gas-, Wasser- und Versorgungsnetze.',status:'Aktiv'},
  galabau:{manager:'Thomas Janning',address:'Mühlenstraße 37, 48599 Gronau',phone:'+49 2562 8804-0',description:'Garten-, Landschafts- und Außenanlagenbau.',status:'In Vorbereitung'},
  transporte:{manager:'Michael Janning',address:'Am Hafen 12, 49808 Lingen',phone:'+49 591 8805-0',description:'Baustellenlogistik, Transporte und Materialversorgung.',status:'Inaktiv'},
};

function CompanyHubView() {
  const [selectedCompany,setSelectedCompany] = React.useState(null);
  const [sort,setSort] = React.useState({key:'name',dir:'asc'});
  const [columnMenu,setColumnMenu] = React.useState(null);
  const [filterPanel,setFilterPanel] = React.useState(null);
  const [filterSearch,setFilterSearch] = React.useState('');
  const [columnFilters,setColumnFilters] = React.useState({});
  const [groupBy,setGroupBy] = React.useState('');
  const [kpiFilter,setKpiFilter] = React.useState('all');
  if (selectedCompany) return <CompanyDetail company={selectedCompany} onBack={() => setSelectedCompany(null)} />;

  const columns = [
    {key:'name',label:'Name Firma'}, {key:'employees',label:'Anzahl Mitarbeiter'},
    {key:'manager',label:'Geschäftsführer'}, {key:'address',label:'Adresse'},
    {key:'phone',label:'Tel'}, {key:'description',label:'Beschreibung'}, {key:'logo',label:'Logo'}, {key:'status',label:'Status'},
  ];
  const columnLabel = key => columns.find(column => column.key === key)?.label || key;
  const columnValue = (company,key) => key === 'logo' ? company.short : company[key];
  const allRows = window.SEED.companies.map(company => ({...company,...COMPANY_META[company.id],employees:window.SEED.employees.filter(employee => employee.company === company.id).length}));
  const averageEmployees = Math.round(allRows.reduce((sum,company) => sum + company.employees,0) / allRows.length);
  const kpis = [
    {key:'all',label:'Firmen Anzahl',value:allRows.length,color:'#4a4a48'},
    {key:'active',label:'Aktiv',value:allRows.filter(company => company.status === 'Aktiv').length,color:'#3f7a4a'},
    {key:'preparing',label:'In Vorbereitung',value:allRows.filter(company => company.status === 'In Vorbereitung').length,color:'#b07a19'},
    {key:'inactive',label:'Inaktiv',value:allRows.filter(company => company.status === 'Inaktiv').length,color:'#a13232'},
  ];
  let rows = allRows.filter(company => Object.entries(columnFilters).every(([key,values]) => !values?.length || values.includes(String(columnValue(company,key)))));
  if (kpiFilter === 'active') rows = rows.filter(company => company.status === 'Aktiv');
  if (kpiFilter === 'preparing') rows = rows.filter(company => company.status === 'In Vorbereitung');
  if (kpiFilter === 'inactive') rows = rows.filter(company => company.status === 'Inaktiv');
  rows = [...rows].sort((a,b) => String(columnValue(a,sort.key)).localeCompare(String(columnValue(b,sort.key)),'de',{numeric:true}) * (sort.dir === 'asc' ? 1 : -1));
  const setCompanySort = (key,dir) => {setSort({key,dir});setColumnMenu(null);};
  const toggleFilter = (key,value) => setColumnFilters(current => {const values=current[key]||[];return {...current,[key]:values.includes(value)?values.filter(item=>item!==value):[...values,value]};});
  const filterValues = filterPanel ? Array.from(new Set(allRows.map(company => String(columnValue(company,filterPanel))))).sort((a,b)=>a.localeCompare(b,'de',{numeric:true})) : [];
  const visibleFilterValues = filterValues.filter(value => value.toLowerCase().includes(filterSearch.toLowerCase()));

  const CompanyColumnHeader = ({column}) => {
    const active = sort.key === column.key || (columnFilters[column.key] || []).length > 0 || groupBy === column.key;
    return <th style={{position:'relative',whiteSpace:'nowrap'}}><button type="button" onClick={() => setColumnMenu(columnMenu === column.key ? null : column.key)} style={{color:active?'var(--fg-1)':undefined,fontWeight:active?700:undefined}}>{column.label}<span>{sort.key===column.key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>
      {columnMenu === column.key && <div className="company-column-menu"><button onClick={() => setCompanySort(column.key,'asc')}>A bis Z</button><button onClick={() => setCompanySort(column.key,'desc')}>Z bis A</button><button onClick={() => {setFilterPanel(column.key);setFilterSearch('');setColumnMenu(null);}}>Filtern nach</button><button onClick={() => {setGroupBy(groupBy===column.key?'':column.key);setCompanySort(column.key,'asc');}}>Gruppieren nach „{column.label}“</button></div>}</th>;
  };

  return <div className="company-hub">
    <header className="view__header"><div><h1 className="view__title">Firma</h1><div className="view__subtitle">Firmen der Janning-Gruppe verwalten und im Detail ansehen.</div></div><div className="view__actions"><button className="btn btn--ghost"><Icon name="download" size={14}/>Exportieren</button><button className="btn btn--primary"><Icon name="plus" size={14}/>Firma</button></div></header>
    <div className="job-kpis">{kpis.map(kpi => <button key={kpi.key} className={'job-kpi'+(kpiFilter===kpi.key?' job-kpi--active':'')} style={{'--job-kpi-color':kpi.color}} onClick={() => setKpiFilter(kpi.key)}><span>{kpi.label}</span><strong>{kpi.value}</strong></button>)}</div>
    <div className="toolbar"><div style={{display:'flex',alignItems:'center',gap:8}}>{(sort.key!=='name'||sort.dir!=='asc')&&<button className="btn btn--ghost" onClick={()=>setSort({key:'name',dir:'asc'})}>Sortierung zurücksetzen</button>}{groupBy&&<button className="btn btn--ghost" onClick={()=>setGroupBy('')}>Gruppierung aufheben</button>}{kpiFilter!=='all'&&<button className="btn btn--ghost" onClick={()=>setKpiFilter('all')}>KPI-Filter aufheben</button>}</div><div className="muted small" style={{marginLeft:'auto'}}>{rows.length} Firmen</div></div>
    {Object.entries(columnFilters).some(([,values])=>values?.length)&&<div className="company-filter-chips">{Object.entries(columnFilters).flatMap(([key,values])=>(values||[]).map(value=><span key={key+value}><small>{columnLabel(key)}:</small><strong>{value}</strong><button onClick={()=>toggleFilter(key,value)}><Icon name="x" size={13}/></button></span>))}<button className="btn btn--ghost" onClick={()=>setColumnFilters({})}>Alle Filter löschen</button></div>}
    <div className="tbl-wrap company-list-table"><table className="tbl"><thead><tr>{columns.map(column=><CompanyColumnHeader key={column.key} column={column}/>)}</tr></thead><tbody>{rows.map((company,index)=>{const groupValue=groupBy?String(columnValue(company,groupBy)):'';const previous=groupBy&&index>0?String(columnValue(rows[index-1],groupBy)):null;return <React.Fragment key={company.id}>{groupBy&&groupValue!==previous&&<tr className="company-group-row"><td colSpan={columns.length}>{columnLabel(groupBy)}: {groupValue}</td></tr>}<tr onClick={()=>setSelectedCompany(company)}><td><div className="company-name-cell"><div><strong>{company.name}</strong><small>{company.short}</small></div></div></td><td className="num"><span className="company-count">{company.employees}</span></td><td>{company.manager}</td><td>{company.address}</td><td>{company.phone}</td><td>{company.description}</td><td><img className="company-row-logo" src={company.logo} alt={company.short}/></td><td><span className={'badge '+(company.status==='Aktiv'?'badge--valid':company.status==='In Vorbereitung'?'badge--warn':'badge--expired')}><span className="badge__dot"/>{company.status}</span></td></tr></React.Fragment>;})}</tbody></table></div>
    {filterPanel&&<div className="company-filter-backdrop" onClick={()=>setFilterPanel(null)}><section className="company-filter-panel" onClick={event=>event.stopPropagation()}><header><strong>{columnLabel(filterPanel)} filtern</strong><button onClick={()=>setFilterPanel(null)}><Icon name="x" size={15}/></button></header><label><Icon name="search" size={15}/><input autoFocus value={filterSearch} onChange={event=>setFilterSearch(event.target.value)} placeholder="Suchen..."/></label><div>{visibleFilterValues.map(value=><label key={value}><input type="checkbox" checked={(columnFilters[filterPanel]||[]).includes(value)} onChange={()=>toggleFilter(filterPanel,value)}/><span>{value}</span></label>)}</div><footer><button className="btn btn--ghost" onClick={()=>setColumnFilters(current=>({...current,[filterPanel]:[]}))}>Zurücksetzen</button><button className="btn btn--primary" onClick={()=>setFilterPanel(null)}>Anwenden</button></footer></section></div>}
  </div>;
}

function CompanyDetail({company,onBack}) {
  const [area,setArea] = React.useState('overview');
  if (area === 'master') return <CompanyMasterRecord company={company} record={companyMasterRecord(company)} onBack={() => setArea('overview')} />;
  if (area === 'matrix') return <CompanyMatrixPage company={company} onBack={() => setArea('overview')} />;
  if (area === 'evaluation') return <CompanyEvaluationPage company={company} onBack={() => setArea('overview')} />;
  return <div className="company-detail"><header className="company-detail__top"><div className="company-detail__intro"><button className="emp-round-back" onClick={onBack} title="Zurück"><Icon name="chevL" size={18} stroke={2}/></button><div><h1>Firma-Detail</h1><p>Alle firmenspezifischen Daten im Überblick</p></div></div><section className="company-detail__profile"><img src={company.logo} alt={company.short}/><div><h2>{company.name}</h2><dl><div><dt>Geschäftsführer</dt><dd>{company.manager}</dd></div><div><dt>Mitarbeiter</dt><dd>{company.employees}</dd></div><div><dt>Telefon</dt><dd>{company.phone}</dd></div></dl></div></section></header><div className="company-detail__body"><nav className="emp-section-nav">{COMPANY_DETAIL_AREAS.map(([id,label,icon])=><button key={id} className={area===id?'is-active':''} onClick={()=>setArea(id)}><Icon name={icon} size={16}/><span>{label}</span><Icon name="chevR" size={13}/></button>)}</nav><main className="company-detail__content">{area==='overview'?<DashboardView activeCompany={company.id} setNav={()=>{}} hideSummary/>:area==='master'?<CompanyMasterArea company={company}/>:<CompanyAreaPlaceholder company={company} area={area}/>}</main></div></div>;
}

function CompanyMatrixPage({company,onBack}) {
  const [selectedEmployee,setSelectedEmployee] = React.useState(null);
  const [showAllCompanies,setShowAllCompanies] = React.useState(false);
  if (selectedEmployee && window.EmployeeAdminDetail) return <EmployeeAdminDetail emp={selectedEmployee} onBack={() => setSelectedEmployee(null)} />;
  if (showAllCompanies) return <div className="emp-full company-matrix-page">
    <CompanyPageTitle title="Qualifikationsmatrix (Alle Firmen)" onBack={() => setShowAllCompanies(false)} />
    <MatrixView activeCompany="all" />
  </div>;
  return <div className="emp-full company-matrix-page">
    <CompanyPageTitle title={`Qualifikationsmatrix (${company.name})`} onBack={onBack} />
    <MatrixView activeCompany={company.id} onEmployeeOpen={setSelectedEmployee} extraAction={<button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14}/>Alle Firmen</button>} />
  </div>;
}

function CompanyEvaluationPage({company,onBack}) {
  const [showAllCompanies,setShowAllCompanies] = React.useState(false);
  if (showAllCompanies) return <div className="emp-full company-evaluation-page">
    <CompanyPageTitle title="Firmen-Auswertung (Alle Firmen)" onBack={() => setShowAllCompanies(false)} />
    <EvaluationView activeCompany="all" />
  </div>;
  return <div className="emp-full company-evaluation-page">
    <CompanyPageTitle title={`Firmen-Auswertung (${company.name})`} onBack={onBack} />
    <EvaluationView activeCompany={company.id} extraAction={<button className="btn btn--ghost" onClick={() => setShowAllCompanies(true)}><Icon name="building" size={14}/>Alle Firmen</button>} />
  </div>;
}

function companyMasterRecord(company) {
  return {
    name:company.name,
    employees:company.employees,
    manager:company.manager,
    address:company.address,
    phone:company.phone,
    logo:company.logo,
    status:company.status,
    description:company.description,
    changed:'05.06.2026, 09:40 Uhr - von Sabine Janning',
  };
}

function CompanyMasterArea({company}) {
  const data = companyMasterRecord(company);
  return <CompanyMasterRecord company={company} record={data} />;
}

function CompanyMasterRecord({company,record,onBack}) {
  const [editing,setEditing] = React.useState(false);
  const [form,setForm] = React.useState(record);
  const set = (key,value) => setForm(current => ({...current,[key]:value}));
  return <div className="emp-full emp-master-detail company-master-detail">
    <CompanyPageTitle title={`Stammdaten (${company.name})`} onBack={onBack} action={<button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button>} />
    <section className="emp-master-hero">
      <span className="company-master-hero-logo"><img src={form.logo} alt={company.short}/></span>
      <div><div className="emp-master-hero__name"><h2>{form.name}</h2><span className="emp-active"><i />{form.status}</span></div><dl><div><dt>Geschäftsführer</dt><dd>{form.manager}</dd></div><div><dt>Mitarbeiter</dt><dd>{form.employees}</dd></div></dl></div>
      <button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button>
    </section>
    <div className="emp-master-layout">
      <main className="emp-master-main">
        <CompanyMasterDataCard title="Firmendaten" icon="building">
          <div className="emp-master-field-grid">
            <CompanyMasterField label="Name Firma" icon="building" value={form.name} editing={editing}><input value={form.name} onChange={event => set('name',event.target.value)}/></CompanyMasterField>
            <CompanyMasterField label="Anzahl Mitarbeiter" icon="users" value={form.employees} editing={editing}><input value={form.employees} onChange={event => set('employees',event.target.value)}/></CompanyMasterField>
            <CompanyMasterField label="Geschäftsführer" icon="users" value={form.manager} editing={editing}><input value={form.manager} onChange={event => set('manager',event.target.value)}/></CompanyMasterField>
            <CompanyMasterField label="Status" icon="shield" value={form.status} editing={editing}><select value={form.status} onChange={event => set('status',event.target.value)}><option>Aktiv</option><option>In Vorbereitung</option><option>Inaktiv</option></select></CompanyMasterField>
          </div>
        </CompanyMasterDataCard>
        <CompanyMasterDataCard title="Kontakt" icon="phone">
          <div className="emp-master-contact-list">
            <CompanyMasterField label="Adresse" icon="pin" value={form.address} editing={editing}><input value={form.address} onChange={event => set('address',event.target.value)}/></CompanyMasterField>
            <CompanyMasterField label="Tel" icon="phone" value={form.phone} editing={editing}><input value={form.phone} onChange={event => set('phone',event.target.value)}/></CompanyMasterField>
          </div>
        </CompanyMasterDataCard>
        <CompanyMasterDataCard title="Beschreibung" icon="doc">
          {editing ? <textarea className="emp-master-description-input" value={form.description} onChange={event => set('description',event.target.value)} /> : <p className="emp-master-description">{form.description}</p>}
        </CompanyMasterDataCard>
      </main>
      <aside className="emp-master-aside">
        <CompanyMasterDataCard title="Geändert" icon="history"><p className="emp-last-change">{form.changed}</p></CompanyMasterDataCard>
        <CompanyMasterDataCard title="Logo" icon="doc"><div className="company-master-photo"><img src={form.logo} alt={company.short}/><div><strong>Firmenlogo</strong><small>PNG oder JPG</small><label><Icon name="upload" size={14}/>Logo ändern<input type="file" accept="image/*"/></label></div></div></CompanyMasterDataCard>
      </aside>
    </div>
    {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
  </div>;
}

function CompanyPageTitle({title,onBack,action}) {
  return <header className="emp-page-title"><div>{onBack && <button className="emp-round-back" onClick={onBack} title="Zurück"><Icon name="chevL" size={18} stroke={2}/></button>}<h1>{title}</h1></div>{action}</header>;
}

function CompanyMasterDataCard({title,icon,children}) {
  return <section className="emp-master-card"><header><Icon name={icon} size={17}/><h3>{title}</h3></header><div className="emp-master-card__body">{children}</div></section>;
}

function CompanyMasterField({label,icon,value,editing,children}) {
  return <div className="emp-master-field">{icon && <Icon name={icon} size={15}/>}<div><span>{label}</span>{editing ? children : <strong>{value}</strong>}</div></div>;
}

function CompanyAreaPlaceholder({company,area}) {
  const found=COMPANY_DETAIL_AREAS.find(item=>item[0]===area);
  return <section className="company-area-placeholder"><Icon name={found?.[2]||'doc'} size={26}/><h2>{found?.[1]}</h2><p>Der Bereich für {company.name} wird im nächsten Schritt aufgebaut.</p></section>;
}

window.CompanyHubView=CompanyHubView;
