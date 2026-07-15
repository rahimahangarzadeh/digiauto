/* Full-page employee detail, training list and training record */

const EMPLOYEE_DETAIL_AREAS = [
  ['dashboard','Übersicht','dashboard'], ['master','Stammdaten','users'], ['trainings','Schulungen','cap'],
  ['instructions','Unterweisungen','flag'], ['jobs','Stellenbeschreibungen','doc'],
  ['medical','Arbeitsmedizinische Vorsorge','shield'], ['license','Führerscheinkontrolle','cal'],
  ['operators','Geräteführer','settings'], ['checks','Prüfberechtigungen','check'],
  ['sites','Baustellen','building'], ['appointments','Termine','clock'], ['infoMatrix','Informationslenkungsmatrix','doc'],
];

function EmployeeAdminDetail({ emp, onBack }) {
  const [area, setArea] = React.useState('dashboard');
  const [navCollapsed, setNavCollapsed] = React.useState(() => window.localStorage?.getItem('employee-detail-nav') === 'collapsed');
  const [record, setRecord] = React.useState(null);
  const [masterRecord, setMasterRecord] = React.useState(null);
  const [instructionRecord, setInstructionRecord] = React.useState(null);
  const [jobRecord, setJobRecord] = React.useState(null);
  const [medicalRecord, setMedicalRecord] = React.useState(null);
  const [licenseRecord, setLicenseRecord] = React.useState(null);
  const [operatorRecord, setOperatorRecord] = React.useState(null);
  const [equipmentCheckRecord, setEquipmentCheckRecord] = React.useState(null);
  const [siteRecord, setSiteRecord] = React.useState(null);
  const employeeChoices = React.useMemo(() => window.SEED.employees.filter(item => item.status === 'aktiv'), []);
  const [currentEmployeeId, setCurrentEmployeeId] = React.useState(emp.id);
  React.useEffect(() => setCurrentEmployeeId(emp.id), [emp.id]);
  const currentIndex = Math.max(0, employeeChoices.findIndex(item => item.id === currentEmployeeId));
  emp = employeeChoices[currentIndex] || emp;
  const company = window.company(emp.company);
  React.useEffect(() => {
    window.localStorage?.setItem('employee-detail-nav', navCollapsed ? 'collapsed' : 'open');
  }, [navCollapsed]);
  const openEmployee = (id, keepMasterOpen = false) => {
    const nextEmp = employeeChoices.find(item => item.id === id);
    if (!nextEmp) return;
    setCurrentEmployeeId(id);
    setRecord(null);
    setInstructionRecord(null);
    setJobRecord(null);
    setMedicalRecord(null);
    setLicenseRecord(null);
    setOperatorRecord(null);
    setEquipmentCheckRecord(null);
    setSiteRecord(null);
    if (keepMasterOpen) {
      setArea('master');
      setMasterRecord(employeeMasterRecord(nextEmp));
    } else {
      setMasterRecord(null);
      setArea('dashboard');
    }
  };
  const openArea = (id) => {
    setRecord(null);
    setInstructionRecord(null);
    setJobRecord(null);
    setMedicalRecord(null);
    setLicenseRecord(null);
    setOperatorRecord(null);
    setEquipmentCheckRecord(null);
    setSiteRecord(null);
    setArea(id);
    if (id === 'master') {
      setMasterRecord(employeeMasterRecord(emp));
    } else {
      setMasterRecord(null);
    }
  };
  const goEmployee = (offset, keepMasterOpen = false) => {
    if (!employeeChoices.length) return;
    const next = (currentIndex + offset + employeeChoices.length) % employeeChoices.length;
    openEmployee(employeeChoices[next].id, keepMasterOpen);
  };

  if (siteRecord) return <EmployeeSiteRecord emp={emp} record={siteRecord} onBack={() => setSiteRecord(null)} />;
  if (equipmentCheckRecord) return <EmployeeEquipmentCheckRecord emp={emp} record={equipmentCheckRecord} onBack={() => setEquipmentCheckRecord(null)} />;
  if (operatorRecord) return <EmployeeOperatorRecord emp={emp} record={operatorRecord} onBack={() => setOperatorRecord(null)} />;
  if (licenseRecord) return <EmployeeLicenseRecord emp={emp} record={licenseRecord} onBack={() => setLicenseRecord(null)} />;
  if (medicalRecord) return <EmployeeMedicalRecord emp={emp} record={medicalRecord} onBack={() => setMedicalRecord(null)} />;
  if (jobRecord) return <EmployeeJobRecord emp={emp} record={jobRecord} onBack={() => setJobRecord(null)} />;
  if (instructionRecord) return <EmployeeInstructionRecord emp={emp} record={instructionRecord} onBack={() => setInstructionRecord(null)} />;
  if (record) return <EmployeeTrainingRecord emp={emp} record={record} onBack={() => setRecord(null)} />;

  let detailContent;
  if (masterRecord) {
    detailContent = <main className="emp-detail-content"><EmployeeMasterRecord emp={emp} record={masterRecord} onBack={() => openArea('dashboard')} employeeChoices={employeeChoices} onSelectEmployee={id => openEmployee(id, true)} onPrevEmployee={() => goEmployee(-1, true)} onNextEmployee={() => goEmployee(1, true)} /></main>;
  } else if (area === 'instructions') {
    detailContent = <main className="emp-detail-content"><EmployeeInstructionArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setInstructionRecord} /></main>;
  } else if (area === 'jobs') {
    detailContent = <main className="emp-detail-content"><EmployeeJobArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setJobRecord} /></main>;
  } else if (area === 'medical') {
    detailContent = <main className="emp-detail-content"><EmployeeMedicalArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setMedicalRecord} /></main>;
  } else if (area === 'license') {
    detailContent = <main className="emp-detail-content"><EmployeeLicenseArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setLicenseRecord} /></main>;
  } else if (area === 'operators') {
    detailContent = <main className="emp-detail-content"><EmployeeOperatorArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setOperatorRecord} /></main>;
  } else if (area === 'checks') {
    detailContent = <main className="emp-detail-content"><EmployeeEquipmentCheckArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setEquipmentCheckRecord} /></main>;
  } else if (area === 'sites') {
    detailContent = <main className="emp-detail-content"><EmployeeSiteArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setSiteRecord} /></main>;
  } else if (area === 'appointments') {
    detailContent = <main className="emp-detail-content"><EmployeeAppointmentsArea emp={emp} onBack={() => openArea('dashboard')} /></main>;
  } else if (area === 'infoMatrix') {
    detailContent = <main className="emp-detail-content"><EmployeeInformationMatrixArea emp={emp} onBack={() => openArea('dashboard')} /></main>;
  } else if (area === 'trainings') {
    detailContent = <main className="emp-detail-content"><EmployeeTrainingArea emp={emp} onBack={() => openArea('dashboard')} onOpen={setRecord} /></main>;
  } else {
    detailContent = <><EmployeeOverviewCenter onOpenArea={openArea} onOpenMaster={() => openArea('master')} /><EmployeeOverviewAside onOpenArea={openArea} /></>;
  }

  return (
    <div className="emp-detail-dashboard">
      <div className="emp-detail-top">
        <div className="emp-detail-intro">
          <div><button className="emp-round-back" onClick={onBack} title="Zurück"><Icon name="chevL" size={18} stroke={2} /></button><h1>Mitarbeiter-Detail</h1></div>
          <p>Alle personenbezogenen Daten im Überblick</p>
        </div>
        <section className="emp-profile-card">
          <div className={'avatar avatar--' + emp.color}>{emp.initials}</div>
          <div className="emp-profile-card__main">
            <div className="emp-profile-card__name">
              <h1>{emp.firstName} {emp.lastName}</h1>
              <span className="emp-active"><i />Aktiv</span>
            </div>
            <dl>
              <div><dt>Position</dt><dd>{emp.position}</dd></div>
              <div><dt>Firma</dt><dd>{company?.name || '-'}</dd></div>
            </dl>
          </div>
          <div className="emp-master-hero-picker emp-master-hero-picker--detail">
            <label>
              <span>Mitarbeiter auswählen</span>
              <select value={emp.id} onChange={event => openEmployee(event.target.value)}>
                {employeeChoices.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div>
              <button type="button" onClick={() => goEmployee(-1)}><Icon name="chevL" size={15} />Vorheriger</button>
              <button type="button" onClick={() => goEmployee(1)}>Nächster<Icon name="chevR" size={15} /></button>
            </div>
          </div>
        </section>
      </div>

      <div className={`emp-detail-body ${navCollapsed ? 'is-nav-collapsed' : ''}`}>
        <EmployeeDetailNav area={area} collapsed={navCollapsed} onToggle={() => setNavCollapsed(value => !value)} onSelect={openArea} />
        {detailContent}
      </div>
    </div>
  );
}

function EmployeeDetailNav({ area, collapsed, onToggle, onSelect }) {
  const groups = [
    ['Übersicht', ['dashboard', 'master']],
    ['Qualifikationen', ['trainings', 'instructions', 'jobs', 'medical', 'license', 'operators', 'checks']],
    ['Einsatz', ['sites', 'appointments']],
    ['Dokumentation', ['infoMatrix']],
  ];
  const entries = Object.fromEntries(EMPLOYEE_DETAIL_AREAS.map(item => [item[0], item]));
  return (
    <nav className={`emp-section-nav emp-section-nav--collapsible ${collapsed ? 'is-collapsed' : ''}`} aria-label="Mitarbeiter Navigation">
      <button className="emp-nav-toggle" type="button" onClick={onToggle} title={collapsed ? 'Navigation ausklappen' : 'Navigation einklappen'}>
        <Icon name={collapsed ? 'chevR' : 'chevL'} size={15} />
        {!collapsed && <span>Navigation einklappen</span>}
      </button>
      {groups.map(([groupLabel, ids]) => (
        <div className="emp-nav-group" key={groupLabel}>
          {!collapsed && <strong>{groupLabel}</strong>}
          {ids.map(id => {
            const [, label, icon] = entries[id];
            return (
              <button key={id} title={label} aria-label={label} className={area === id ? 'is-active' : ''} onClick={() => onSelect(id)}>
                <Icon name={icon} size={16} /><span>{label}</span><Icon className="emp-nav-chevron" name="chevR" size={13} />
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function EmpPageTitle({ title, onBack, action }) {
  return (
    <header className="emp-page-title">
      <div><button className="emp-round-back" onClick={onBack} title="Zurück"><Icon name="chevL" size={18} stroke={2} /></button><h1>{title}</h1></div>
      {action}
    </header>
  );
}

function EmployeeOverviewCenter({ onOpenArea, onOpenMaster }) {
  const appointments = [
    ['15','OKT','Sicherheitsunterweisung','Präsenzschulung · 09:00 Uhr','Bestätigt','Schulungsraum B','Sabine Janning','Unterweisung','1 Tag vorher','instructions'],
    ['20','OKT','Geräteprüfung','Bagger-Zertifizierung · Ganztägig','Offen','Werkstatt','Dirk Jürgens','Geräteprüfung','Heute','checks'],
    ['02','NOV','Führerscheinkontrolle','Quartalsprüfung · Büro','Fällig','Büro','Fuhrpark','Kontrolle','3 Tage vorher','license'],
  ];
  const activities = [
    ['doc','Zertifikat „SCC 017“ hochgeladen','12.07.2026, 10:32 · geändert von Rahim Ahangarzadeh · Schulungen','trainings'],
    ['building','Baustelle zugewiesen','11.07.2026, 08:15 · geändert von Sabine Janning · Baustellen','sites'],
    ['phone','Profil aktualisiert','10.07.2026, 14:20 · geändert von Max Mustermann · Stammdaten','master'],
  ];
  const sites = [
    ['Baustelle Alex Barum','Baumaschinist / Ersthelfer','15.04.2026 - 28.06.2026','Aktiv'],
    ['Kanalsanierung Nordhorn','Mitarbeiter','01.07.2026 - 30.09.2026','Geplant'],
  ];
  return (
    <main className="emp-overview-center">
      <section className="emp-overview-card emp-appointments">
        <header><h2>Anstehende Termine</h2><button>Alle sehen</button></header>
        {appointments.map(item => <button type="button" className="emp-appointment-row" key={item[0]+item[2]} onClick={() => onOpenArea(item[9])}>
          <time><strong>{item[0]}</strong><span>{item[1]}</span></time>
          <div><strong>{item[2]}</strong><span>{item[3]}</span><small>{item[4]} · {item[5]} · {item[6]} · {item[7]} · Erinnerung: {item[8]}</small></div><Icon name="chevR" size={16} />
        </button>)}
      </section>
      <section className="emp-overview-card emp-recent">
        <header><h2>Letzte Aktivitäten</h2></header>
        <div className="emp-recent-list">
          {activities.map(item => <button type="button" key={item[1]} onClick={() => item[3] === 'master' ? onOpenMaster() : onOpenArea(item[3])}><span className="emp-recent-icon"><Icon name={item[0]} size={17} /></span><div><strong>{item[1]}</strong><small>{item[2]}</small></div><Icon name="chevR" size={14} /></button>)}
        </div>
        <button className="emp-show-all">Alle Aktivitäten anzeigen</button>
      </section>
      <section className="emp-overview-card emp-current-sites">
        <header><h2>Aktuelle Baustellen</h2><button type="button" onClick={() => onOpenArea('sites')}>Alle sehen</button></header>
        <div className="emp-current-site-list">
          {sites.map(site => (
            <button type="button" key={site[0]} onClick={() => onOpenArea('sites')}>
              <div><strong>{site[0]}</strong><span>{site[1]}</span></div>
              <small>{site[2]}</small>
              <em>{site[3]}</em>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function EmployeeOverviewAside({ onOpenArea }) {
  const needGroups = [
    { label:'Kritisch', tone:'critical', count:3, items:[['Abgelaufene Schulungen',1,'trainings'], ['Fällige Vorsorge',1,'medical'], ['Führerscheinkontrolle überfällig',1,'license']] },
    { label:'Bald fällig', tone:'soon', count:5, items:[['Ablaufende Schulungen',3,'trainings'], ['Prüfberechtigung bald fällig',1,'checks'], ['Stellenbeschreibung offen',1,'jobs']] },
    { label:'Offen', tone:'open', count:2, items:[['Fehlende Dokumente',1,'infoMatrix'], ['Offene Unterweisungen',2,'instructions']] },
  ];
  return (
    <aside className="emp-overview-aside">
      <section className="emp-action-required">
        <h2><Icon name="flag" size={19} />Handlungsbedarf</h2>
        <div className="emp-need-summary">
          {needGroups.map(group => <span key={group.label} className={'is-' + group.tone}>{group.label} <b>{group.count}</b></span>)}
        </div>
        {needGroups.map(group => (
          <div className={'emp-need-group is-' + group.tone} key={group.label}>
            <h3>{group.label}</h3>
            {group.items.map(item => <button type="button" key={item[0]} onClick={() => onOpenArea(item[2])}><span>{item[0]}</span><strong>{item[1]}</strong></button>)}
          </div>
        ))}
        <button>Alle offenen Punkte anzeigen <Icon name="chevR" size={14} /></button>
      </section>
      <section className="emp-side-stat">
        <h3><Icon name="flag" size={17} />Offene Unterweisungen</h3>
        <button type="button" onClick={() => onOpenArea('instructions')}><strong>2 offene Unterweisungen</strong><span>10 von 12 abgeschlossen</span><Icon name="chevR" size={15} /></button>
      </section>
      <section className="emp-next-check">
        <span><Icon name="cal" size={16} />Nächste Prüfung</span>
        <strong>In 4 Tagen</strong>
        <small>Arbeitsmedizinische Vorsorge G26<br />15.07.2026 · 09:00 Uhr</small>
        <button type="button" onClick={() => onOpenArea('appointments')}>Termin öffnen</button>
      </section>
    </aside>
  );
}

function EmployeeAreaPlaceholder({ area }) {
  const found = EMPLOYEE_DETAIL_AREAS.find(item => item[0] === area);
  return <div className="emp-placeholder"><Icon name={found?.[2] || 'doc'} size={24} /><h2>{found?.[1]}</h2><p>Dieser Bereich wird im nächsten Schritt ausgearbeitet.</p></div>;
}

function EmployeeInformationMatrixAreaLegacy({ emp, onBack }) {
  const [selected, setSelected] = React.useState(null);
  const rows = (window.companyInformationMatrixRows ? window.companyInformationMatrixRows() : [])
    .filter(row => row.company === emp.company && row.released);
  if (selected) return <EmployeeInformationMatrixDetail emp={emp} row={selected} onBack={() => setSelected(null)} />;
  return <div className="emp-full company-info-matrix-page">
    <EmpPageTitle title={`Informationslenkungsmatrix (${emp.firstName} ${emp.lastName})`} onBack={onBack} />
    <div className="company-site-kpis">
      <div className="company-site-kpi"><span>Freigegeben</span><strong>{rows.length}</strong><small>für Mitarbeiter sichtbar</small></div>
      <div className="company-site-kpi"><span>Vorlage</span><strong>SGU_036</strong><small>Version 001</small></div>
      <div className="company-site-kpi"><span>Firma</span><strong>{window.company(emp.company)?.short || '-'}</strong><small>{window.company(emp.company)?.name || '-'}</small></div>
      <div className="company-site-kpi"><span>Stand</span><strong>24.02.2026</strong><small>aus PDF</small></div>
    </div>
    <section className="card card--pad company-info-matrix-card">
      <div className="company-info-matrix-wrap">
        <table className="company-info-matrix-table">
          <thead><tr><th>Bezeichnung Dokument/ Nachweis</th><th>Standort</th><th>erstellt von</th><th>Freigabe</th><th>Archivierung</th><th>Aufbewahrungsfrist</th><th>Gesetz</th><th>Verantwortlich für Vernichtung</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.id} onClick={() => setSelected(row)}>
            <td><strong>{row.bezeichnung}</strong><small>{row.companyName}</small></td>
            <td>{row.standort}</td>
            <td>{row.erstelltVon}</td>
            <td>{row.freigabe}</td>
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

function EmployeeInformationMatrixDetailLegacy({ emp, row, onBack }) {
  return <div className="emp-full emp-master-detail company-info-matrix-detail">
    <EmpPageTitle title={`${row.bezeichnung} (${emp.firstName} ${emp.lastName})`} onBack={onBack} />
    <section className="emp-master-hero"><span className="emp-avatar">IL</span><div><div className="emp-master-hero__name"><h2>{row.bezeichnung}</h2><span className="emp-active"><i />Freigegeben</span></div><dl><div><dt>Firma</dt><dd>{row.companyName}</dd></div><div><dt>Stand</dt><dd>{row.stand}</dd></div><div><dt>Vorlage</dt><dd>{row.source}</dd></div></dl></div></section>
    <div className="emp-master-layout"><main className="emp-master-main">
      <MasterDataCard title="Dokument / Nachweis" icon="doc"><div className="emp-master-field-grid">
        <MasterDataField label="Bezeichnung Dokument/ Nachweis" icon="doc" value={row.bezeichnung} />
        <MasterDataField label="Standort" icon="pin" value={row.standort} />
        <MasterDataField label="erstellt von" icon="users" value={row.erstelltVon} />
        <MasterDataField label="Freigabe" icon="shield" value={row.freigabe} />
      </div></MasterDataCard>
      <MasterDataCard title="Lenkung und Archivierung" icon="history"><div className="emp-master-field-grid">
        <MasterDataField label="Archivierung" icon="building" value={row.archivierung} />
        <MasterDataField label="Aufbewahrungsfrist" icon="clock" value={row.aufbewahrung} />
        <MasterDataField label="Gesetz" icon="doc" value={row.gesetz} />
        <MasterDataField label="Verantwortlich fur Vernichtung" icon="users" value={row.vernichtung} />
      </div></MasterDataCard>
    </main><aside className="emp-master-aside">
      <MasterDataCard title="Mitarbeiterfreigabe" icon="check"><p className="emp-last-change">Dieser Eintrag ist für Mitarbeiter sichtbar.</p></MasterDataCard>
      <MasterDataCard title="Vorlage" icon="doc"><p className="emp-last-change"><strong>{row.source}</strong><br />Interne Nr.: SGU_036<br />Stand: {row.stand}</p></MasterDataCard>
    </aside></div>
  </div>;
}

function employeeInformationMatrixRows(emp) {
  const companyInfo = window.company(emp.company) || {};
  const companyName = companyInfo.name || emp.company;
  const seed = [
    {id:'info-offer',designation:'Angebote',category:'Angebot',location:'Büro Kalkulation',department:'Kalkulation',release:'Freigegeben',retention:'6 Jahre',retentionEnd:'31.12.2032',responsible:'Sabine Janning',status:'Freigegeben',document:'Angebote_Richtlinie.pdf',documentStatus:'vorhanden',createdBy:'Sabine Janning',checkedBy:'Christian Janning',approval:'Christian Janning',archiveType:'Digitalarchiv',retentionStart:'01.01.2026',legal:'HGB / AO',destroyResponsible:'Verwaltung',description:'Freigegebene Angebotsunterlagen und zugehörige Nachweise.',scope:'Kaufmännische Mitarbeiter',access:'Lesen und herunterladen',protection:'für Mitarbeiter freigegeben',storage:'SharePoint / Angebote / 2026',version:'v2.1',releaseDate:'15.05.2026',lastChange:'12.07.2026'},
    {id:'info-site',designation:'Baustellenaushänge',category:'Baustelle',location:'Projektordner Baustellen',department:'Bauleitung',release:'Freigegeben',retention:'10 Jahre',retentionEnd:'31.12.2036',responsible:'Alexander Petersen',status:'Freigegeben',document:'Baustellenaushang_BGBAU.pdf',documentStatus:'vorhanden',createdBy:'Rahim Ahangarzadeh',checkedBy:'Alexander Petersen',approval:'Christian Janning',archiveType:'Projektarchiv',retentionStart:'28.06.2026',legal:'BG BAU / SCC',destroyResponsible:'HSE',description:'Aushangunterlagen für freigegebene Baustellen.',scope:'Baustellenpersonal',access:'Nur freigegebene Baustellen',protection:'für Mitarbeiter freigegeben',storage:'SharePoint / Baustellen / Aushänge',version:'v1.4',releaseDate:'18.06.2026',lastChange:'10.07.2026'},
    {id:'info-license',designation:'Führerscheinkontrolle',category:'Fahrerlaubnis',location:'Fuhrpark / Personalakte',department:'Fuhrpark',release:'Nicht freigegeben',retention:'3 Jahre',retentionEnd:'31.12.2029',responsible:'Sabine Janning',status:'Nicht freigegeben',document:'SGU_007_Fuehrerscheinkontrolle.pdf',documentStatus:'vorhanden',createdBy:'Fuhrpark',checkedBy:'Sabine Janning',approval:'Michael Janning',archiveType:'Personalakte',retentionStart:'01.01.2026',legal:'StVG / StVO / StVZO',destroyResponsible:'Fuhrpark',description:'Nachweisformular für halbjährliche Führerscheinkontrollen.',scope:'Fahrzeugführer',access:'Status sichtbar',protection:'vertraulich',storage:'Personalakte / Fahrerlaubnis',version:'Rev. 2',releaseDate:'01.04.2026',lastChange:'08.07.2026'},
    {id:'info-instruction',designation:'Unterweisungsnachweise',category:'Unterweisung',location:'Schulungsarchiv',department:'HSE',release:'Freigegeben',retention:'5 Jahre',retentionEnd:'31.12.2031',responsible:'Rahim Ahangarzadeh',status:'Aufbewahrung läuft',document:'Unterweisungsnachweis_2026.pdf',documentStatus:'vorhanden',createdBy:'HSE',checkedBy:'Rahim Ahangarzadeh',approval:'Christian Janning',archiveType:'Digitalarchiv',retentionStart:'31.12.2026',legal:'ArbSchG / DGUV',destroyResponsible:'HSE',description:'Teilnahmenachweise und Bestätigungen zu Unterweisungen.',scope:'Alle Mitarbeiter',access:'Eigene Nachweise',protection:'für Mitarbeiter freigegeben',storage:'SharePoint / HSE / Unterweisungen',version:'v3.0',releaseDate:'12.02.2026',lastChange:'05.07.2026'},
    {id:'info-checks',designation:'Prüfprotokolle Arbeitsmittel',category:'Geräteprüfung',location:'Werkstatt / Prüfordner',department:'Werkstatt',release:'Nicht freigegeben',retention:'4 Jahre',retentionEnd:'31.12.2030',responsible:'Dirk Berg',status:'In Prüfung',document:'Pruefprotokoll_Arbeitsmittel.pdf',documentStatus:'fehlt',createdBy:'Werkstatt',checkedBy:'Dirk Berg',approval:'offen',archiveType:'Projektarchiv',retentionStart:'01.01.2026',legal:'BetrSichV / TRBS 1201',destroyResponsible:'Werkstatt',description:'Prüfprotokolle für Arbeitsmittel und Geräte.',scope:'Befähigte Personen',access:'Nach Freigabe',protection:'intern',storage:'Werkstatt / Prüfungen',version:'v0.9',releaseDate:'-',lastChange:'02.07.2026'},
    {id:'info-forms',designation:'Alte Formulare SGU',category:'Formular',location:'Archiv SGU',department:'Administration',release:'Freigegeben',retention:'10 Jahre',retentionEnd:'31.12.2030',responsible:'Christian Janning',status:'Archiviert',document:'SGU_Formulare_Archiv.zip',documentStatus:'vorhanden',createdBy:'Administration',checkedBy:'Christian Janning',approval:'Christian Janning',archiveType:'Langzeitarchiv',retentionStart:'31.12.2020',legal:'SCC / interne Vorgabe',destroyResponsible:'Administration',description:'Archivierte alte SGU-Formulare mit Leserechten.',scope:'Führungskräfte',access:'Lesen',protection:'intern',storage:'Archiv / SGU / Formulare',version:'Archiv 2020',releaseDate:'01.01.2021',lastChange:'24.06.2026'},
  ];
  return seed.map(item => ({
    ...item,
    id: `${emp.id}-${item.id}`,
    employeeId: emp.id,
    employeeName: `${emp.lastName}, ${emp.firstName}`,
    employeeLabel: `${emp.lastName}, ${emp.firstName} · PN ${emp.personalNr}`,
    company: emp.company,
    companyName,
    employeeDepartment: emp.department,
    employeePosition: emp.position,
  }));
}

function EmployeeInformationMatrixArea({ emp, onBack }) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeInfoMatrixView')||'cards');
  const [tab,setTab]=React.useState('Alle');
  const [menu,setMenu]=React.useState(null);
  const [sort,setSort]=React.useState({key:'designation',dir:'asc'});
  const [group,setGroup]=React.useState('');
  const [selected,setSelected]=React.useState(new Set());
  const [detail,setDetail]=React.useState(null);
  const [filterOpen,setFilterOpen]=React.useState(false);
  const [createOpen,setCreateOpen]=React.useState(false);
  const [createStep,setCreateStep]=React.useState(1);
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('all');
  const [filters,setFilters]=React.useState({employee:'',company:'all',department:'all',category:'all',documentType:'',location:'',release:'all',retention:'all',responsible:'',document:'all',archived:'all',releasedOnly:false,legal:''});
  const defaultHidden=React.useMemo(()=>new Set(['companyName','createdBy','checkedBy','approval','archiveType','retentionStart','legal','destroyResponsible','description']),[]);
  const [hiddenColumns,setHiddenColumns]=React.useState(defaultHidden);
  React.useEffect(()=>localStorage.setItem('employeeInfoMatrixView',viewMode),[viewMode]);
  const allEmployees=React.useMemo(()=>window.SEED.employees||[],[]);
  const currentEmployee=scope==='all'?emp:(allEmployees.find(item=>item.id===scope)||emp);
  const isAllView=scope==='all';
  const departments=React.useMemo(()=>Array.from(new Set(allEmployees.map(item=>item.department).filter(Boolean))).sort(),[allEmployees]);
  const positions=React.useMemo(()=>Array.from(new Set(allEmployees.map(item=>item.position).filter(Boolean))).sort(),[allEmployees]);
  const pickerEmployees=allEmployees.filter(item=>{
    const text=`${item.firstName} ${item.lastName} ${item.personalNr}`.toLowerCase();
    return (!employeeSearch||text.includes(employeeSearch.toLowerCase()))
      && (employeeCompanyFilter==='all'||item.company===employeeCompanyFilter)
      && (employeeDepartmentFilter==='all'||item.department===employeeDepartmentFilter)
      && (!employeePositionFilter||item.position.toLowerCase().includes(employeePositionFilter.toLowerCase()))
      && (employeeStatusFilter==='all'||item.status===employeeStatusFilter);
  });
  const activeEmployees=scope==='all'?allEmployees.filter(item=>item.status==='aktiv'):[currentEmployee];
  const baseRows=React.useMemo(()=>activeEmployees.flatMap(employeeInformationMatrixRows),[activeEmployees]);
  const categories=React.useMemo(()=>Array.from(new Set(baseRows.map(row=>row.category))).sort(),[baseRows]);
  const filteredRows=baseRows.filter(row=>{
    const matchesTab=tab==='Alle'||(tab==='Aufbewahrung läuft'?row.status==='Aufbewahrung läuft':row.status===tab);
    return matchesTab
      && (!filters.employee||row.employeeName.toLowerCase().includes(filters.employee.toLowerCase()))
      && (filters.company==='all'||row.company===filters.company)
      && (filters.department==='all'||row.employeeDepartment===filters.department||row.department===filters.department)
      && (filters.category==='all'||row.category===filters.category)
      && (!filters.documentType||row.designation.toLowerCase().includes(filters.documentType.toLowerCase()))
      && (!filters.location||row.location.toLowerCase().includes(filters.location.toLowerCase()))
      && (filters.release==='all'||row.release===filters.release)
      && (!filters.responsible||row.responsible.toLowerCase().includes(filters.responsible.toLowerCase()))
      && (filters.document==='all'||row.documentStatus===filters.document)
      && (filters.archived==='all'||(filters.archived==='yes')===(row.status==='Archiviert'))
      && (!filters.releasedOnly||row.release==='Freigegeben')
      && (!filters.legal||row.legal.toLowerCase().includes(filters.legal.toLowerCase()));
  });
  const rows=filteredRows.slice().sort((a,b)=>{
    const av=String(a[sort.key]??'');
    const bv=String(b[sort.key]??'');
    return sort.dir==='asc'?av.localeCompare(bv,'de'):bv.localeCompare(av,'de');
  });
  const tabs=[
    ['Alle',baseRows.length],
    ['Freigegeben',baseRows.filter(row=>row.status==='Freigegeben').length],
    ['Nicht freigegeben',baseRows.filter(row=>row.status==='Nicht freigegeben').length],
    ['Aufbewahrung läuft',baseRows.filter(row=>row.status==='Aufbewahrung läuft').length],
    ['Archiviert',baseRows.filter(row=>row.status==='Archiviert').length],
  ];
  const activeFilterCount=Object.entries(filters).filter(([key,value])=>key==='releasedOnly'?value:value&&value!=='all').length;
  const columns=React.useMemo(()=>{
    const all=[
      ...(isAllView?[['employeeName','Mitarbeiter / Zielgruppe']]:[]),
      ['designation','Bezeichnung'],
      ['category','Kategorie'],
      ['location','Standort'],
      ['release','Freigabe für Mitarbeiter'],
      ['retentionEnd','Aufbewahrung bis'],
      ['responsible','Verantwortlich'],
      ['status','Status'],
      ['document','Dokument'],
      ['companyName','Firma'],
      ['createdBy','erstellt von'],
      ['checkedBy','geprüft von'],
      ['approval','Freigabe'],
      ['archiveType','Archivierungsart'],
      ['retentionStart','Beginn der Frist'],
      ['legal','gesetzliche Grundlage'],
      ['destroyResponsible','verantwortlich für Vernichtung'],
      ['description','Beschreibung'],
      ['actions','Aktionen'],
    ];
    return all.filter(([key])=>key==='actions'||!hiddenColumns.has(key));
  },[hiddenColumns,isAllView]);
  const toggle=id=>setSelected(old=>{ const next=new Set(old); next.has(id)?next.delete(id):next.add(id); return next; });
  const clearFilter=key=>setFilters(old=>({...old,[key]:key==='releasedOnly'?false:['company','department','category','release','retention','document','archived'].includes(key)?'all':''}));
  const tone=status=>status==='Freigegeben'?'valid':status==='Aufbewahrung läuft'||status==='In Prüfung'?'warn':status==='Archiviert'?'planned':'missing';
  const cellValue=(row,key)=>{
    if(key==='employeeName') return <><strong>{row.employeeName}</strong><small>{row.employeePosition}</small></>;
    if(key==='designation') return <><strong>{row.designation}</strong><small>{row.description}</small></>;
    if(key==='release') return <span className={`badge badge--${row.release==='Freigegeben'?'valid':'warn'}`}>{row.release}</span>;
    if(key==='status') return <span className={`badge badge--${tone(row.status)}`}>{row.status}</span>;
    if(key==='document') return <button className="emp-link-chip" onClick={event=>event.stopPropagation()}><Icon name="doc" size={13}/>{row.documentStatus==='vorhanden'?row.document:'Dokument fehlt'}</button>;
    if(key==='actions') return <div className="emp-row-actions" onClick={event=>event.stopPropagation()}><button className="emp-row-menu-btn" onClick={()=>setMenu(menu===row.id?null:row.id)}>⋮</button>{menu===row.id&&<div className="emp-row-action-menu"><button onClick={()=>setDetail(row)}>Details anzeigen</button><button>Dokument öffnen</button><button>Dokument herunterladen</button><button>Speicherort anzeigen</button><button>Rückfrage an Admin senden</button><button>Bearbeiten</button><button>neue Version anlegen</button><button>Freigabe ändern</button><button>Archivieren</button></div>}</div>;
    return row[key] || '-';
  };
  if(detail) return <EmployeeInformationMatrixRecord emp={detail.employeeId===emp.id?emp:(allEmployees.find(item=>item.id===detail.employeeId)||emp)} row={detail} onBack={()=>setDetail(null)} />;
  return <div className="emp-full emp-info-matrix-area">
    <EmpPageTitle title={isAllView?'Informationslenkungsmatrix - alle Mitarbeiter':`Informationslenkungsmatrix (${currentEmployee.name})`} onBack={onBack} action={<div className="emp-training-toolbar"><button onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {isAllView?'Alle Mitarbeiter':currentEmployee.name}</button><div className="emp-view-toggle"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setViewMode('cards')}>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setViewMode('list')}>Liste</button></div><button onClick={()=>setFilterOpen(true)}><Icon name="filter" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button><button onClick={()=>setCreateOpen(true)}><Icon name="plus" size={14}/>Eintrag anlegen</button></div>}/>
    <div className="emp-info-tabs">{tabs.map(([label,count])=><button key={label} className={tab===label?'is-active':''} onClick={()=>setTab(label)}>{label}<span>{count}</span></button>)}</div>
    {activeFilterCount>0&&<div className="emp-active-filter-chips">{Object.entries(filters).filter(([key,value])=>key==='releasedOnly'?value:value&&value!=='all').map(([key,value])=><button key={key} onClick={()=>clearFilter(key)}>{key}: {String(value)} ×</button>)}</div>}
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>aktuelle Ansicht exportieren</button><button><Icon name="doc" size={14}/>sichtbare Spalten</button><button><Icon name="filter" size={14}/>gefilterte Einträge</button></div>}
    {viewMode==='cards'?<div className="emp-info-card-grid">{rows.map(row=><article key={row.id} className="emp-info-card" onClick={()=>setDetail(row)}><header><div><span>{row.category}</span><h3>{row.designation}</h3>{isAllView&&<small>{row.employeeName}</small>}</div><span className={`badge badge--${tone(row.status)}`}>{row.status}</span></header><dl><div><dt>Standort</dt><dd>{row.location}</dd></div><div><dt>Freigabe</dt><dd>{row.release}</dd></div><div><dt>Aufbewahrung</dt><dd>bis {row.retentionEnd}</dd></div><div><dt>Verantwortlich</dt><dd>{row.responsible}</dd></div><div><dt>Dokument</dt><dd>{row.documentStatus==='vorhanden'?row.document:'fehlt'}</dd></div></dl><footer><button>Details anzeigen</button><button>Dokument öffnen</button></footer></article>)}</div>:<div className="emp-table-wrap emp-info-table-wrap"><table className="emp-info-table emp-info-table--compact"><thead><tr><th className="emp-check emp-sticky-select"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>{columns.map(([key,label])=><th key={key} className={(key==='employeeName'?'emp-sticky-employee ':'')+(key==='designation'?'emp-sticky-title ':'')+(key==='actions'?'emp-sticky-actions':'')}><button onClick={()=>key!=='actions'&&setMenu(menu===key?null:key)}>{label}<span>{key!=='actions'?(sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'):''}</span></button>{menu===key&&key!=='actions'&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button><button onClick={()=>setHiddenColumns(new Set())}>Spalten verwalten</button><button onClick={()=>{setHiddenColumns(defaultHidden);setMenu(null);}}>Standardansicht wiederherstellen</button></div>}</th>)}</tr></thead><tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||String(rows[index-1][group])!==String(row[group]))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(row[group]||'-')}</td></tr>}<tr onClick={()=>setDetail(row)}><td className="emp-check emp-sticky-select" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>{columns.map(([key])=><td key={key} className={(key==='employeeName'?'emp-sticky-employee ':'')+(key==='designation'?'emp-sticky-title ':'')+(key==='actions'?'emp-sticky-actions ':'')+(key==='description'?'emp-ellipsis':'')}>{cellValue(row,key)}</td>)}</tr></React.Fragment>)}</tbody></table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Informationslenkungsmatrix</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><select value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}><option value="">Alle Positionen</option>{positions.map(item=><option key={item}>{item}</option>)}</select><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Ausgeschieden</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);setSelected(new Set());}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);setSelected(new Set());}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterOpen&&<div className="emp-training-filter-shell" onClick={()=>setFilterOpen(false)}><aside className="emp-training-filter-panel emp-info-filter-panel" onClick={event=>event.stopPropagation()}><header><div><span>Filter</span><h2>Informationslenkung filtern</h2></div><button onClick={()=>setFilterOpen(false)}>×</button></header><main><label>Mitarbeiter<input value={filters.employee} onChange={event=>setFilters({...filters,employee:event.target.value})}/></label><label>Firma<select value={filters.company} onChange={event=>setFilters({...filters,company:event.target.value})}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Abteilung<select value={filters.department} onChange={event=>setFilters({...filters,department:event.target.value})}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label>Kategorie<select value={filters.category} onChange={event=>setFilters({...filters,category:event.target.value})}><option value="all">Alle Kategorien</option>{categories.map(item=><option key={item}>{item}</option>)}</select></label><label>Dokumentart<input value={filters.documentType} onChange={event=>setFilters({...filters,documentType:event.target.value})}/></label><label>Standort<input value={filters.location} onChange={event=>setFilters({...filters,location:event.target.value})}/></label><label>Freigabestatus<select value={filters.release} onChange={event=>setFilters({...filters,release:event.target.value})}><option value="all">Alle</option><option>Freigegeben</option><option>Nicht freigegeben</option></select></label><label>Aufbewahrung bis<select value={filters.retention} onChange={event=>setFilters({...filters,retention:event.target.value})}><option value="all">Alle Fristen</option><option value="soon">Frist endet bald</option><option value="running">Aufbewahrung läuft</option></select></label><label>Verantwortlich<input value={filters.responsible} onChange={event=>setFilters({...filters,responsible:event.target.value})}/></label><label>Dokument<select value={filters.document} onChange={event=>setFilters({...filters,document:event.target.value})}><option value="all">Alle</option><option value="vorhanden">vorhanden</option><option value="fehlt">fehlt</option></select></label><label>Archiviert<select value={filters.archived} onChange={event=>setFilters({...filters,archived:event.target.value})}><option value="all">Alle</option><option value="yes">Archiviert</option><option value="no">Nicht archiviert</option></select></label><label>Gesetzliche Grundlage<input value={filters.legal} onChange={event=>setFilters({...filters,legal:event.target.value})}/></label><label className="emp-check-label"><input type="checkbox" checked={filters.releasedOnly} onChange={event=>setFilters({...filters,releasedOnly:event.target.checked})}/>nur für Mitarbeiter freigegebene Einträge</label></main><footer><button className="btn btn--primary" onClick={()=>setFilterOpen(false)}>Filter anwenden</button><button onClick={()=>setFilters({employee:'',company:'all',department:'all',category:'all',documentType:'',location:'',release:'all',retention:'all',responsible:'',document:'all',archived:'all',releasedOnly:false,legal:''})}>Filter zurücksetzen</button><button onClick={()=>setFilterOpen(false)}>Schließen</button></footer></aside></div>}
    {createOpen&&<div className="emp-create-backdrop" onClick={()=>setCreateOpen(false)}><section className="emp-create-modal emp-info-create-modal" onClick={event=>event.stopPropagation()}><header><div><span>Informationslenkungsmatrix</span><h2>Eintrag anlegen</h2><p>Schritt {createStep} von 5</p></div><button onClick={()=>setCreateOpen(false)}>×</button></header><div className="emp-create-steps">{['Grunddaten','Erstellung und Freigabe','Aufbewahrung','Dokumente','Zusammenfassung'].map((item,index)=><button key={item} className={createStep===index+1?'is-active':''} onClick={()=>setCreateStep(index+1)}>{index+1}. {item}</button>)}</div><div className="emp-create-body">{createStep===1&&<div className="emp-form-grid"><label>Bezeichnung Dokument / Nachweis *<input/></label><label>Kategorie *<select>{['Angebot','Baustelle','Fahrerlaubnis','Unterweisung','Geräteprüfung','Formular'].map(item=><option key={item}>{item}</option>)}</select></label><label>Firma *<select>{window.SEED.companies.map(company=><option key={company.id}>{company.name}</option>)}</select></label><label>Abteilung<input/></label><label>Standort *<input/></label><label className="is-wide">Beschreibung<textarea rows="3"/></label></div>}{createStep===2&&<div className="emp-form-grid"><label>erstellt von *<input/></label><label>geprüft von *<input/></label><label>Freigabe durch *<input/></label><label>Freigabe für Mitarbeiter *<select><option>Freigegeben</option><option>Nicht freigegeben</option><option>Teilweise freigegeben</option></select></label><label>Zielgruppe / Geltungsbereich *<input/></label><label>Zugriffsberechtigung *<input/></label><label>Schutzklasse *<select>{['intern','vertraulich','nur Führungskräfte','für Mitarbeiter freigegeben'].map(item=><option key={item}>{item}</option>)}</select></label></div>}{createStep===3&&<div className="emp-form-grid"><label>Archivierungsart *<input/></label><label>Aufbewahrungsfrist *<input/></label><label>Beginn der Frist *<input type="date"/></label><label>Ende der Frist<input type="date"/></label><label>gesetzliche Grundlage *<input/></label><label>verantwortlich für Vernichtung *<input/></label><label>Vernichtungsart *<input/></label></div>}{createStep===4&&<div className="emp-form-grid"><label>Hauptdokument *<input type="file"/></label><label>Freigabedokument<input type="file"/></label><label>Archivierungsnachweis<input type="file"/></label><label>Vernichtungsprotokoll<input type="file"/></label></div>}{createStep===5&&<div className="emp-create-summary"><strong>Zusammenfassung</strong><span>Dokumentart, Freigabe, Aufbewahrung und Dokumente werden als Entwurf vorbereitet.</span><span>Admin-Funktionen bleiben nur berechtigten Personen sichtbar.</span><span>Mitarbeiter sehen nur freigegebene Dokumentinformationen.</span></div>}</div><footer><button onClick={()=>setCreateOpen(false)}>Abbrechen</button><button>Als Entwurf speichern</button>{createStep>1&&<button onClick={()=>setCreateStep(step=>step-1)}>Zurück</button>}{createStep<5?<button className="btn btn--primary" onClick={()=>setCreateStep(step=>step+1)}>Weiter</button>:<button className="btn btn--primary" onClick={()=>setCreateOpen(false)}>Eintrag anlegen</button>}</footer></section></div>}
  </div>;
}

EmployeeInformationMatrixArea = function EmployeeInformationMatrixArea({ emp, onBack }) {
  const [scope, setScope] = React.useState(emp.id);
  const [viewMode, setViewMode] = React.useState(() => localStorage.getItem('employeeInfoMatrixView') || 'cards');
  const [selected, setSelected] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [sort, setSort] = React.useState({ key:'designation', dir:'asc' });
  const [groupBy, setGroupBy] = React.useState('');
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [kpiFilter, setKpiFilter] = React.useState('all');
  const allEmployees = React.useMemo(() => window.SEED.employees || [], []);
  const currentEmployee = scope === 'all' ? emp : (allEmployees.find(item => item.id === scope) || emp);
  const isAllView = scope === 'all';
  const activeEmployees = isAllView ? allEmployees.filter(item => item.status === 'aktiv') : [currentEmployee];
  const baseRows = React.useMemo(() => activeEmployees.flatMap(employeeInformationMatrixRows), [activeEmployees]);
  React.useEffect(() => localStorage.setItem('employeeInfoMatrixView', viewMode), [viewMode]);
  const infoCounts = {
    all: baseRows.length,
    released: baseRows.filter(row => row.release === 'Freigegeben').length,
    notReleased: baseRows.filter(row => row.release !== 'Freigegeben').length,
    destroy: baseRows.filter(row => row.documentStatus === 'fehlt' || row.status === 'In Prüfung').length,
    archived: baseRows.filter(row => row.status === 'Archiviert').length,
  };
  const rows = baseRows
    .filter(row => kpiFilter === 'all'
      || (kpiFilter === 'released' && row.release === 'Freigegeben')
      || (kpiFilter === 'notReleased' && row.release !== 'Freigegeben')
      || (kpiFilter === 'destroy' && (row.documentStatus === 'fehlt' || row.status === 'In Prüfung'))
      || (kpiFilter === 'archived' && row.status === 'Archiviert'))
    .slice()
    .sort((a, b) => {
      const av = String(a[sort.key] ?? '');
      const bv = String(b[sort.key] ?? '');
      return sort.dir === 'asc' ? av.localeCompare(bv, 'de') : bv.localeCompare(av, 'de');
    });
  const columns = [
    ...(isAllView ? [['employeeName', 'Mitarbeiter']] : []),
    ['designation', 'Bezeichnung Dokument/ Nachweis'],
    ['companyName', 'Firma'],
    ['category', 'Kategorie'],
    ['location', 'Standort'],
    ['createdBy', 'erstellt von'],
    ['checkedBy', 'geprüft von'],
    ['approval', 'Freigabe'],
    ['release', 'Freigabe für Mitarbeiter'],
    ['archiveType', 'Archivierung'],
    ['retention', 'Aufbewahrungsfrist'],
    ['retentionStart', 'gesetzt'],
    ['retentionEnd', 'Fristende'],
    ['legal', 'gesetzliche Grundlage'],
    ['destroyResponsible', 'Verantwortlich für Vernichtung'],
    ['status', 'Status'],
    ['document', 'Dokument'],
  ];
  const groupedRows = groupBy ? Object.entries(rows.reduce((acc, row) => {
    const key = String(row[groupBy] ?? '-');
    acc[key] = acc[key] || [];
    acc[key].push(row);
    return acc;
  }, {})) : [['', rows]];
  const allVisibleSelected = rows.length > 0 && rows.every(row => selectedIds.includes(row.id));
  const changeSort = (key, dir) => { setSort({ key, dir }); setColumnMenu(null); };
  const toggleSelected = id => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds(current => allVisibleSelected ? current.filter(id => !rows.some(row => row.id === id)) : Array.from(new Set([...current, ...rows.map(row => row.id)])));
  const statusTone = status => status === 'Freigegeben' ? 'valid' : status === 'Archiviert' ? 'planned' : status === 'Aufbewahrung läuft' || status === 'In Prüfung' ? 'warn' : 'missing';
  const menuFor = key => columnMenu === key && <div className="company-column-menu" onClick={event => event.stopPropagation()}>
    <button onClick={() => changeSort(key, 'asc')}>A bis Z</button>
    <button onClick={() => changeSort(key, 'desc')}>Z bis A</button>
    <button onClick={() => setColumnMenu(null)}>Filtern nach</button>
    <button onClick={() => { setGroupBy(key); setColumnMenu(null); }}>Gruppieren nach "{columns.find(column => column[0] === key)?.[1] || key}"</button>
    <button onClick={() => setGroupBy('')}>Gruppierung aufheben</button>
  </div>;
  if (selected) {
    const selectedEmp = allEmployees.find(item => item.id === selected.employeeId) || emp;
    return <EmployeeInformationMatrixRecord emp={selectedEmp} row={selected} onBack={() => setSelected(null)} />;
  }
  const titleActions = <div className="company-info-toolbar">
    <select value={scope} onChange={event => { setScope(event.target.value); setSelectedIds([]); }}>
      <option value={emp.id}>{emp.name}</option>
      <option value="all">Alle Mitarbeiter</option>
      {allEmployees.filter(item => item.id !== emp.id).map(item => <option key={item.id} value={item.id}>{item.lastName}, {item.firstName}</option>)}
    </select>
    <div className="segmented">
      <button className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}><Icon name="dashboard" size={14} />Kacheln</button>
      <button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><Icon name="matrix" size={14} />Liste</button>
    </div>
    <button className="btn btn--ghost"><Icon name="filter" size={14} />Filter</button>
    <button className="btn btn--ghost"><Icon name="download" size={14} />Excel</button>
    <button className="btn btn--primary"><Icon name="plus" size={14} />Eintrag anlegen</button>
  </div>;
  return <div className="emp-full company-info-matrix-page employee-info-matrix-page">
    <EmpPageTitle title={`Informationslenkungsmatrix (${isAllView ? 'Alle Mitarbeiter' : currentEmployee.name})`} onBack={onBack} action={titleActions} />
    <div className="company-site-kpis company-info-kpis">
      <button className={'company-site-kpi ' + (kpiFilter === 'all' ? 'is-active' : '')} onClick={() => setKpiFilter('all')}><span>Einträge gesamt</span><strong>{infoCounts.all}</strong><small>in Ansicht</small></button>
      <button className={'company-site-kpi ' + (kpiFilter === 'released' ? 'is-active' : '')} onClick={() => setKpiFilter('released')}><span>Freigegeben</span><strong>{infoCounts.released}</strong><small>Portal bereit</small></button>
      <button className={'company-site-kpi ' + (kpiFilter === 'notReleased' ? 'is-active' : '')} onClick={() => setKpiFilter('notReleased')}><span>Nicht freigegeben</span><strong>{infoCounts.notReleased}</strong><small>prüfen</small></button>
      <button className={'company-site-kpi ' + (kpiFilter === 'destroy' ? 'is-active' : '')} onClick={() => setKpiFilter('destroy')}><span>Zur Vernichtung</span><strong>{infoCounts.destroy}</strong><small>offen</small></button>
      <button className={'company-site-kpi ' + (kpiFilter === 'archived' ? 'is-active' : '')} onClick={() => setKpiFilter('archived')}><span>Archiviert</span><strong>{infoCounts.archived}</strong><small>Ablage</small></button>
    </div>
    {selectedIds.length > 0 && <div className="company-bulkbar"><strong>{selectedIds.length} Eintrag(e) ausgewählt</strong><button>Freigabestatus ändern</button><button>Verantwortliche ändern</button><button>PDF exportieren</button><button>Excel exportieren</button><button>Archivieren</button><button className="is-danger">Löschen</button></div>}
    {viewMode === 'cards' ? <div className="company-info-card-grid">
      {rows.map(row => <article key={row.id} className="company-info-entry-card" onClick={() => setSelected(row)}>
        <header><div><span>{row.category}</span><h3>{row.designation}</h3><p>{isAllView ? row.employeeName : row.companyName}</p></div><span className={`badge badge--${statusTone(row.status)}`}>{row.status}</span></header>
        <dl><div><dt>Standort</dt><dd>{row.location}</dd></div><div><dt>Fristende</dt><dd>{row.retentionEnd}</dd></div><div><dt>Verantwortlich</dt><dd>{row.responsible}</dd></div></dl>
        <footer><span>{row.release}</span><button onClick={event => { event.stopPropagation(); setSelected(row); }}>Bearbeiten</button></footer>
      </article>)}
    </div> : <section className="card company-info-matrix-card">
      <div className="company-info-matrix-wrap">
        <table className="company-info-matrix-table">
          <thead><tr><th><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} /></th>{columns.map(([key, label]) => <th key={key}><div className="company-list-th"><button onClick={() => setColumnMenu(columnMenu === key ? null : key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button>{menuFor(key)}</div></th>)}<th>Aktionen</th></tr></thead>
          <tbody>{groupedRows.flatMap(([group, items]) => [
            groupBy && <tr key={'group-' + group} className="company-group-row"><td colSpan={columns.length + 2}>{columns.find(column => column[0] === groupBy)?.[1]}: {group} <span>{items.length}</span></td></tr>,
            ...items.map(row => <tr key={row.id} onClick={() => setSelected(row)}>
              <td onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
              {columns.map(([key]) => {
                if (key === 'designation') return <td key={key}><strong>{row.designation}</strong><small>{row.description}</small></td>;
                if (key === 'employeeName') return <td key={key}><strong>{row.employeeName}</strong><small>{row.employeePosition}</small></td>;
                if (key === 'release') return <td key={key}><span className={'badge ' + (row.release === 'Freigegeben' ? 'badge--valid' : 'badge--missing')}><span className="badge__dot" />{row.release}</span></td>;
                if (key === 'status') return <td key={key}><span className={`badge badge--${statusTone(row.status)}`}>{row.status}</span></td>;
                if (key === 'document') return <td key={key}>{row.documentStatus === 'vorhanden' ? <button className="btn btn--ghost" onClick={event => event.stopPropagation()}><Icon name="doc" size={13} />{row.document}</button> : <span className="muted">fehlt</span>}</td>;
                return <td key={key}>{row[key] || '-'}</td>;
              })}
              <td onClick={event => event.stopPropagation()}><div className="company-row-actions"><button className="btn btn--ghost" onClick={() => setSelected(row)}><Icon name="eye" size={13} />Details</button><button className="btn btn--ghost"><Icon name="edit" size={13} />Bearbeiten</button></div></td>
            </tr>)
          ])}</tbody>
        </table>
      </div>
    </section>}
  </div>;
};

function EmployeeInformationMatrixRecord({ emp, row, onBack }) {
  return <div className="emp-full emp-info-record">
    <EmpPageTitle title={`${row.designation} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all"><Icon name="doc" size={15}/>Dokument öffnen</button><button className="emp-edit-all"><Icon name="download" size={15}/>Herunterladen</button></div>} />
    <div className="emp-info-record-grid">
      <MasterDataCard title="Dokumentinformationen" icon="doc"><div className="emp-master-field-grid"><MasterDataField label="Bezeichnung" icon="doc" value={row.designation}/><MasterDataField label="Kategorie" icon="doc" value={row.category}/><MasterDataField label="Firma" icon="building" value={row.companyName}/><MasterDataField label="Standort" icon="pin" value={row.location}/><MasterDataField label="Abteilung" icon="users" value={row.department}/><MasterDataField label="Beschreibung" icon="doc" value={row.description}/></div></MasterDataCard>
      <MasterDataCard title="Freigabe und Zugriff" icon="shield"><div className="emp-master-field-grid"><MasterDataField label="für Mitarbeiter freigegeben" icon="check" value={row.release}/><MasterDataField label="Geltungsbereich" icon="users" value={row.scope}/><MasterDataField label="Zugriffsberechtigung" icon="shield" value={row.access}/><MasterDataField label="Schutzklasse" icon="shield" value={row.protection}/><MasterDataField label="Speicherort" icon="pin" value={row.storage}/></div></MasterDataCard>
      <MasterDataCard title="Aufbewahrung" icon="history"><div className="emp-master-field-grid"><MasterDataField label="Aufbewahrungsfrist" icon="clock" value={row.retention}/><MasterDataField label="Fristende" icon="cal" value={row.retentionEnd}/><MasterDataField label="gesetzliche Grundlage" icon="doc" value={row.legal}/><MasterDataField label="Archivierungsart" icon="building" value={row.archiveType}/></div></MasterDataCard>
      <MasterDataCard title="Dokumente" icon="doc"><div className="emp-info-doc-list"><button><Icon name="doc" size={15}/>{row.document}<span>öffnen</span></button><button><Icon name="download" size={15}/>freigegebene Anlagen<span>herunterladen</span></button></div></MasterDataCard>
      <MasterDataCard title="Historie" icon="history"><div className="emp-master-field-grid"><MasterDataField label="letzte Änderung" icon="history" value={row.lastChange}/><MasterDataField label="neue Version" icon="doc" value={row.version}/><MasterDataField label="Freigabedatum" icon="cal" value={row.releaseDate}/></div></MasterDataCard>
    </div>
  </div>;
}

function employeeAppointmentRows(emp) {
  const names = window.SEED.employees.filter(item => item.status === 'aktiv').slice(0, 10);
  const rows = [
    {id:'apt-1',employeeId:emp.id,employeeName:emp.name,type:'Schulung',title:'Sicherheitsunterweisung',training:'Erste Hilfe',provider:'Interne Schulung (Janning)',company:window.company(emp.company)?.name || emp.company,date:'2026-10-15',start:'09:00',end:'10:30',place:'Aufenthaltsraum Nordhorn',responsible:'Rahim Ahangarzadeh',status:'Bestätigt',docs:'vollständig',certs:'vollständig',invoice:'-',archived:false,post:'-'},
    {id:'apt-2',employeeId:emp.id,employeeName:emp.name,type:'Geräteprüfung',title:'Geräteprüfung',training:'Bagger-Zertifizierung',provider:'DEKRA Akademie',company:window.company(emp.company)?.name || emp.company,date:'2026-10-20',start:'08:00',end:'16:00',place:'Bauhof Nordhorn',responsible:'Alexander Petersen',status:'Geplant',docs:'offen',certs:'-',invoice:'-',archived:false,post:'-'},
    {id:'apt-3',employeeId:emp.id,employeeName:emp.name,type:'Führerscheinkontrolle',title:'Führerscheinkontrolle',training:'Quartalsprüfung',provider:'Fuhrpark',company:window.company(emp.company)?.name || emp.company,date:'2026-11-02',start:'11:00',end:'11:15',place:'Büro',responsible:'Sabine Janning',status:'Nachbearbeitung offen',docs:'vollständig',certs:'offen',invoice:'offen',archived:false,post:'7 von 10'},
    {id:'apt-4',employeeId:emp.id,employeeName:emp.name,type:'Vorsorge',title:'Vorsorge G26',training:'Arbeitsmedizinische Vorsorge',provider:'Betriebsarzt Nordhorn',company:window.company(emp.company)?.name || emp.company,date:'2026-07-18',start:'08:30',end:'09:00',place:'Praxis Nordhorn',responsible:'Sabine Janning',status:'Vollständig',docs:'vollständig',certs:'vollständig',invoice:'bezahlt',archived:true,post:'10 von 10'},
  ];
  names.forEach((person, index) => rows.push({
    id:'apt-all-' + person.id,
    employeeId:person.id,
    employeeName:person.name,
    type:index % 3 === 0 ? 'Unterweisung' : index % 3 === 1 ? 'Schulung' : 'Geräteprüfung',
    title:index % 3 === 0 ? 'Brandschutzunterweisung' : index % 3 === 1 ? 'SCC 017 Führungskräfte' : 'Staplerprüfung',
    training:index % 3 === 0 ? 'Unterweisung' : index % 3 === 1 ? 'SCC' : 'Sicherheit / Verkehr',
    provider:index % 2 ? 'DEKRA Akademie' : 'Interne Schulung (Janning)',
    company:window.company(person.company)?.name || person.company,
    date:`2026-10-${String(22 + index).padStart(2, '0')}`,
    start:index % 2 ? '08:00' : '13:00',
    end:index % 2 ? '12:00' : '15:00',
    place:index % 2 ? 'Schulungsraum B' : 'Bauhof Nordhorn',
    responsible:index % 2 ? 'Rahim Ahangarzadeh' : 'Christian Janning',
    status:index % 4 === 0 ? 'Nachbearbeitung offen' : index % 4 === 1 ? 'Geplant' : index % 4 === 2 ? 'Durchgeführt' : 'Bestätigt',
    docs:index % 3 ? 'vollständig' : 'offen',
    certs:index % 4 ? 'vollständig' : 'offen',
    invoice:index % 2 ? 'bezahlt' : 'offen',
    archived:false,
    post:index % 4 === 0 ? '6 von 10' : '-',
  }));
  return rows;
}

function EmployeeAppointmentModalLegacy({ type, onClose }) {
  const isPost = type === 'post';
  const checklist = ['Teilnehmerliste vollständig', 'Anwesenheit dokumentiert', 'Ergebnisse eingetragen', 'Zertifikate vollständig', 'Gültigkeitsdaten eingetragen', 'nächste Wiederholung eingetragen', 'Sicherheitspass-Aufkleber dokumentiert', 'Rechnung erhalten', 'Rechnung bezahlt', 'Schulungsunterlagen gespeichert'];
  return <div className="emp-modal-backdrop" onMouseDown={onClose}>
    <section className="emp-appointment-modal" onMouseDown={event => event.stopPropagation()}>
      <header>
        <div><span>{isPost ? 'Termin nachbearbeiten' : 'Neuer Termin'}</span><h2>{isPost ? 'Nachbearbeitung prüfen' : 'Termin eintragen'}</h2></div>
        <button type="button" onClick={onClose}>×</button>
      </header>
      {isPost ? <React.Fragment>
        <div className="emp-appointment-progress"><strong>7 von 10 Punkten vollständig</strong><span>Es fehlen zwei Zertifikate und die Rechnung.</span></div>
        <div className="emp-appointment-checklist">
          {checklist.map((item, index) => <label key={item}><input type="checkbox" defaultChecked={index < 7} />{item}</label>)}
        </div>
        <footer><button type="button" onClick={onClose}>Abbrechen</button><button type="button" className="btn btn--primary">Abschließen und archivieren</button></footer>
      </React.Fragment> : <React.Fragment>
        <div className="emp-form-grid">
          <label><span>Terminart</span><select><option>Schulung</option><option>Unterweisung</option><option>arbeitsmedizinische Vorsorge</option><option>Führerscheinkontrolle</option><option>Geräteprüfung</option><option>Besprechung</option><option>sonstiger Termin</option></select></label>
          <label><span>Terminbezeichnung</span><input placeholder="z.B. Erste Hilfe Auffrischung" /></label>
          <label><span>Firma</span><select><option>Janning Tiefbau GmbH</option><option>Janning Galabau GmbH</option><option>Janning Rohrbau GmbH</option></select></label>
          <label><span>Teilnehmer</span><input placeholder="Mitarbeiter auswählen" /></label>
          <label><span>Datum</span><input type="date" /></label>
          <label><span>Beginn</span><input type="time" /></label>
          <label><span>Ende</span><input type="time" /></label>
          <label><span>Ort</span><input placeholder="Ort, Raum oder Treffpunkt" /></label>
          <label><span>Schulung aus Liste</span><select><option>Erste Hilfe (9 UE)</option><option>SCC 017 Führungskräfte</option><option>MVAS 99</option></select></label>
          <label><span>Anbieter oder Akademie</span><select><option>Interne Schulung (Janning)</option><option>DEKRA Akademie</option><option>BiW Bildungszentrum</option></select></label>
          <label><span>Referent / Prüfer</span><input /></label>
          <label><span>Status</span><select><option>Geplant</option><option>Bestätigt</option><option>Durchgeführt</option><option>Nachbearbeitung offen</option></select></label>
          <label><span>Dokumente</span><input placeholder="Datei hochladen" /></label>
          <label className="is-wide"><span>Notiz</span><textarea /></label>
        </div>
        <footer><button type="button" onClick={onClose}>Abbrechen</button><button type="button" className="btn btn--primary">Speichern</button></footer>
      </React.Fragment>}
    </section>
  </div>;
}

function EmployeeAppointmentModal({ type, onClose }) {
  const isPost=type==='post';
  const isDetail=type==='detail';
  const [step,setStep]=React.useState(1);
  const [appointmentType,setAppointmentType]=React.useState('Schulung');
  const checklist=['Teilnehmerliste vollständig','Anwesenheit dokumentiert','Ergebnis eingetragen','Zertifikate vollständig','Gültigkeitsdaten eingetragen','nächste Wiederholung festgelegt','Rechnung erhalten','Rechnung bezahlt','Dokumente vollständig'];
  const types=['Schulung','Unterweisung','Vorsorge','Führerscheinkontrolle','Geräteprüfung','Besprechung','sonstiger Termin'];
  return <div className="emp-modal-backdrop" onMouseDown={onClose}>
    <section className="emp-appointment-modal" onMouseDown={event=>event.stopPropagation()}>
      <header><div><span>{isPost?'Termin nachbearbeiten':isDetail?'Termin':'Neuer Termin'}</span><h2>{isPost?'Nachbearbeitung prüfen':isDetail?'Kurzansicht':'Termin eintragen'}</h2>{!isPost&&!isDetail&&<p>Schritt {step} von 5</p>}</div><button type="button" onClick={onClose}>×</button></header>
      {isDetail?<React.Fragment>
        <div className="emp-appointment-progress"><strong>Erste Hilfe Auffrischung</strong><span>15.10.2026 · 09:00-10:30 Uhr · Schulung</span></div>
        <div className="emp-form-grid"><label><span>Status</span><input value="Bestätigt" readOnly/></label><label><span>Verantwortlicher</span><input value="Rahim Ahangarzadeh" readOnly/></label><label><span>Dokumente</span><input value="vollständig" readOnly/></label><label><span>Anbieter</span><input value="Interne Schulung (Janning)" readOnly/></label></div>
        <footer><button type="button" onClick={onClose}>Schließen</button><button type="button" className="btn btn--primary">Vollständige Detailansicht</button></footer>
      </React.Fragment>:isPost?<React.Fragment>
        <div className="emp-appointment-progress"><strong>6 von 9 Punkten abgeschlossen</strong><span>Es fehlen noch Rechnung, Gültigkeitsdaten und Dokumente.</span></div>
        <div className="emp-appointment-checklist">{checklist.map((item,index)=><label key={item}><input type="checkbox" defaultChecked={index<6}/>{item}</label>)}</div>
        <footer><button type="button" onClick={onClose}>Abbrechen</button><button type="button" className="btn btn--primary">Abschließen und archivieren</button></footer>
      </React.Fragment>:<React.Fragment>
        <div className="emp-create-steps">{['Terminart','Grunddaten','Spezifisch','Dokumente','Zusammenfassung'].map((item,index)=><button key={item} className={step===index+1?'is-active':''} onClick={()=>setStep(index+1)}>{index+1}. {item}</button>)}</div>
        {step===1&&<div className="emp-appointment-type-grid">{types.map(item=><button key={item} className={appointmentType===item?'is-active':''} onClick={()=>setAppointmentType(item)}><Icon name={item==='Schulung'?'cap':item==='Führerscheinkontrolle'?'users':item==='Geräteprüfung'?'settings':item==='Vorsorge'?'shield':item==='Besprechung'?'users':'cal'} size={18}/>{item}</button>)}</div>}
        {step===2&&<div className="emp-form-grid"><label><span>Terminbezeichnung *</span><input placeholder="z.B. Erste Hilfe Auffrischung"/></label><label><span>Terminart *</span><input value={appointmentType} readOnly/></label><label><span>Mitarbeiter / Teilnehmer *</span><input placeholder="Mitarbeiter auswählen"/></label><label><span>Firma *</span><select><option>Janning Tiefbau GmbH</option><option>Janning Galabau GmbH</option><option>Janning Rohrbau GmbH</option></select></label><label><span>Datum *</span><input type="date"/></label><label><span>Beginn *</span><input type="time"/></label><label><span>Ende *</span><input type="time"/></label><label className="emp-checkline"><input type="checkbox"/>ganztägig</label><label><span>Ort *</span><input placeholder="Ort, Raum oder Treffpunkt"/></label><label><span>Verantwortlicher *</span><input defaultValue="Rahim Ahangarzadeh"/></label><label><span>Status *</span><select>{['Entwurf','Geplant','Bestätigt','Durchgeführt','Nachbearbeitung offen','Vollständig'].map(item=><option key={item}>{item}</option>)}</select></label><label className="is-wide"><span>Notiz</span><textarea/></label></div>}
        {step===3&&<div className="emp-form-grid">
          {appointmentType==='Schulung'&&<React.Fragment><label><span>Schulung aus Liste</span><select><option>Erste Hilfe (9 UE)</option><option>SCC 017 Führungskräfte</option><option>MVAS 99</option></select></label><label><span>Anbieter</span><select><option>Interne Schulung (Janning)</option><option>DEKRA Akademie</option><option>BiW Bildungszentrum</option></select></label><label><span>Referent</span><input/></label><label><span>maximale Teilnehmerzahl</span><input type="number"/></label><label><span>Anmeldefrist</span><input type="date"/></label><label><span>Kosten</span><input/></label><label className="emp-checkline"><input type="checkbox"/>Hotel erforderlich</label><label><span>Rechnung</span><select><option>offen</option><option>bezahlt</option><option>nicht erforderlich</option></select></label></React.Fragment>}
          {appointmentType==='Führerscheinkontrolle'&&<React.Fragment><label><span>Führerscheinklasse</span><input placeholder="B, BE, C, CE"/></label><label><span>kontrollierende Person</span><input/></label><label><span>Kontrollintervall</span><select><option>halbjährlich</option><option>jährlich</option></select></label><label><span>nächster Kontrolltermin</span><input type="date"/></label></React.Fragment>}
          {appointmentType==='Geräteprüfung'&&<React.Fragment><label><span>Gerät oder Gerätegruppe</span><input/></label><label><span>Prüfer</span><input/></label><label><span>Prüfart</span><input/></label><label><span>Prüfintervall</span><input/></label></React.Fragment>}
          {appointmentType==='Vorsorge'&&<React.Fragment><label><span>Vorsorgeart</span><input/></label><label><span>Untersuchungsstelle</span><input/></label><label><span>Terminbestätigung</span><select><option>offen</option><option>bestätigt</option></select></label><label><span>nächste Wiederholung</span><input type="date"/></label></React.Fragment>}
          {!['Schulung','Führerscheinkontrolle','Geräteprüfung','Vorsorge'].includes(appointmentType)&&<label className="is-wide"><span>Terminartspezifische Angaben</span><textarea placeholder="Besprechung, Unterweisung oder sonstige Angaben"/></label>}
        </div>}
        {step===4&&<div className="emp-form-grid"><label><span>Einladung</span><input type="file"/></label><label><span>Terminbestätigung</span><input type="file"/></label><label><span>Schulungsunterlagen</span><input type="file"/></label><label><span>Sonstige Dokumente</span><input type="file" multiple/></label><label className="emp-checkline"><input type="checkbox" defaultChecked/>Erinnerung aktivieren</label><label><span>Erinnerung</span><select><option>1 Tag vorher</option><option>3 Tage vorher</option><option>7 Tage vorher</option></select></label></div>}
        {step===5&&<div className="emp-create-summary"><strong>Zusammenfassung</strong><span>Terminart: {appointmentType}</span><span>Terminbezeichnung: Erste Hilfe Auffrischung</span><span>Datum: 15.10.2026, 09:00-10:30 Uhr</span><span>Status: Geplant</span><span>Dokumente: Einladung und Unterlagen vorgesehen</span></div>}
        <footer><button type="button" onClick={onClose}>Abbrechen</button><button type="button">Als Entwurf speichern</button>{step>1&&<button type="button" onClick={()=>setStep(step-1)}>Zurück</button>}{step<5?<button type="button" className="btn btn--primary" onClick={()=>setStep(step+1)}>Weiter</button>:<button type="button" className="btn btn--primary" onClick={onClose}>Termin erstellen</button>}</footer>
      </React.Fragment>}
    </section>
  </div>;
}

function EmployeeAppointmentsAreaLegacy({emp,onBack}) {
  const [mode, setMode] = React.useState('calendar');
  const [scope, setScope] = React.useState(emp.id);
  const [selected, setSelected] = React.useState(new Set());
  const [menu, setMenu] = React.useState(null);
  const [sort, setSort] = React.useState({key:'date', dir:'asc'});
  const [filter, setFilter] = React.useState('upcoming');
  const [modal, setModal] = React.useState(null);
  React.useEffect(() => setScope(emp.id), [emp.id]);
  const employees = React.useMemo(() => window.SEED.employees.filter(item => item.status === 'aktiv'), []);
  const baseRows = React.useMemo(() => employeeAppointmentRows(emp), [emp.id]);
  const isAll = scope === 'all' || scope === 'active' || scope === 'inactive';
  const scopedRows = baseRows.filter(row => {
    if (scope === 'all') return true;
    if (scope === 'active') return employees.some(item => item.id === row.employeeId);
    if (scope === 'inactive') return false;
    return row.employeeId === scope;
  });
  const visibleRows = scopedRows.filter(row => {
    if (mode === 'archive') return row.archived || row.status === 'Archiviert';
    if (filter === 'today') return row.date === '2026-10-15';
    if (filter === 'week') return row.date >= '2026-10-15' && row.date <= '2026-10-22';
    if (filter === 'month') return row.date.startsWith('2026-10');
    if (filter === 'past') return row.date < '2026-10-15';
    return !row.archived;
  }).sort((a,b) => {
    const left = String(a[sort.key] || '');
    const right = String(b[sort.key] || '');
    return sort.dir === 'asc' ? left.localeCompare(right, 'de') : right.localeCompare(left, 'de');
  });
  const columns = [
    ...(isAll ? [{key:'employeeName', label:'Mitarbeiter'}] : []),
    {key:'title', label:'Termin'}, {key:'type', label:'Terminart'}, {key:'date', label:'Datum'}, {key:'start', label:'Beginn'}, {key:'end', label:'Ende'},
    {key:'company', label:'Firma'}, {key:'training', label:'Schulung'}, {key:'provider', label:'Anbieter'}, {key:'status', label:'Status'},
    {key:'responsible', label:'Verantwortlicher'}, {key:'docs', label:'Dokumente'}, {key:'certs', label:'Zertifikate'}, {key:'invoice', label:'Rechnung'}, {key:'actions', label:'Aktionen'}
  ];
  const scopeLabel = scope === 'all' ? 'Alle Mitarbeiter' : scope === 'active' ? 'nur aktive Mitarbeiter' : scope === 'inactive' ? 'ausgeschiedene Mitarbeiter' : (employees.find(item => item.id === scope)?.name || emp.name);
  const title = isAll ? 'Termine - alle Mitarbeiter' : `Termine (${scopeLabel})`;
  const toggle = id => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const statusClass = status => /vollständig|bestätigt/i.test(status) ? 'valid' : /nachbearbeitung|durchgeführt/i.test(status) ? 'warn' : /abgesagt|archiv/i.test(status) ? 'archived' : 'planned';
  const renderCalendar = () => <div className="emp-personal-calendar">
    {['Mo','Di','Mi','Do','Fr','Sa','So'].map(day => <div key={day} className="emp-personal-calendar__head">{day}</div>)}
    {Array.from({length:35}, (_,index) => {
      const day = index + 1;
      const dayRows = visibleRows.filter(row => Number(row.date.slice(-2)) === day);
      return <div key={day} className="emp-personal-calendar__cell"><b>{day}</b>{dayRows.map(row => <button key={row.id} onClick={() => row.status === 'Nachbearbeitung offen' ? setModal('post') : null}>{row.start} · {row.title}</button>)}</div>;
    })}
  </div>;
  return <div className="emp-full emp-appointments-page">
    <div className="emp-page-title emp-appointment-title">
      <button className="emp-round-back" onClick={onBack}><Icon name="chevL" size={18}/></button>
      <h1>{title}</h1>
      <div className="emp-appointment-actions">
        <label><span>Ansicht:</span><select value={scope} onChange={event => setScope(event.target.value)}>
          <option value={emp.id}>{emp.name}</option>
          {employees.filter(item => item.id !== emp.id).slice(0, 8).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          <option value="all">Alle Mitarbeiter</option>
          <option value="active">nur aktive Mitarbeiter</option>
          <option value="inactive">ausgeschiedene Mitarbeiter</option>
        </select></label>
        <div className="emp-segmented">{[['calendar','Kalender'],['list','Liste'],['archive','Archiv']].map(([id,label]) => <button key={id} className={mode === id ? 'is-active' : ''} onClick={() => setMode(id)}>{label}</button>)}</div>
        <button className="btn btn--primary" onClick={() => setModal('new')}><Icon name="plus" size={14}/>Termin</button>
      </div>
    </div>
    <div className="emp-appointment-filterbar">
      {['Heute','Diese Woche','Dieser Monat','Kommende Termine','Vergangene Termine'].map((label,index) => {
        const id = ['today','week','month','upcoming','past'][index];
        return <button key={id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{label}</button>;
      })}
      {isAll && ['Mitarbeiter','Firma','Terminart','Schulung','Anbieter','Status','Zeitraum','Verantwortlicher','Dokumente vollständig','Zertifikate vollständig','Rechnung offen','archiviert'].map(label => <button key={label}>{label}</button>)}
    </div>
    {selected.size > 0 && <div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Export</button><button>Archivieren</button><button className="is-clear" onClick={() => setSelected(new Set())}>×</button></div>}
    {mode === 'calendar' && renderCalendar()}
    {(mode === 'list' || mode === 'archive') && <div className="emp-table-wrap">
      <table className="emp-appointments-table">
        <thead><tr><th className="emp-check"><input type="checkbox" checked={visibleRows.length > 0 && selected.size === visibleRows.length} onChange={event => setSelected(event.target.checked ? new Set(visibleRows.map(row => row.id)) : new Set())}/></th>{columns.map(column => <th key={column.key}>
          <button onClick={() => column.key !== 'actions' && setMenu(menu === column.key ? null : column.key)}>{column.label}<span>{column.key !== 'actions' ? (sort.key === column.key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄') : ''}</span></button>
          {menu === column.key && <div className="emp-column-menu"><button onClick={() => {setSort({key:column.key, dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={() => {setSort({key:column.key, dir:'desc'});setMenu(null);}}>Z bis A</button><button>Filtern nach</button><button>Gruppieren nach "{column.label}"</button></div>}
        </th>)}</tr></thead>
        <tbody>{visibleRows.map(row => <tr key={row.id} className={selected.has(row.id) ? 'is-selected' : ''}>
          <td className="emp-check" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} /></td>
          {columns.map(column => <td key={column.key}>{column.key === 'employeeName' ? row.employeeName.split(' ').reverse().join(', ') : column.key === 'title' ? <strong>{row.title}</strong> : column.key === 'date' ? window.fmtDE(row.date) : column.key === 'status' ? <span className={'emp-status is-' + statusClass(row.status)}>{row.status}</span> : column.key === 'actions' ? <div className="training-row-actions"><button>Details</button><button>Bearbeiten</button>{row.status === 'Nachbearbeitung offen' && <button onClick={() => setModal('post')}>Termin nachbearbeiten</button>}<button>⋮</button></div> : row[column.key]}</td>)}
        </tr>)}</tbody>
      </table>
    </div>}
    {modal && <EmployeeAppointmentModal type={modal} onClose={() => setModal(null)} />}
  </div>;
}

function EmployeeAppointmentsArea({emp,onBack}) {
  const [mode,setMode]=React.useState('calendar');
  const [scope,setScope]=React.useState(emp.id);
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('all');
  const [menu,setMenu]=React.useState(null);
  const [sort,setSort]=React.useState({key:'date',dir:'asc'});
  const [quickFilter,setQuickFilter]=React.useState('upcoming');
  const [filterOpen,setFilterOpen]=React.useState(false);
  const [modal,setModal]=React.useState(null);
  const [selected,setSelected]=React.useState(new Set());
  const [calendarView,setCalendarView]=React.useState('month');
  const [filters,setFilters]=React.useState({employee:'',company:'all',type:'all',status:'all',from:'',to:'',responsible:'',provider:'',training:'',docs:'all',certs:'all',invoice:'all',archived:false});
  React.useEffect(()=>setScope(emp.id),[emp.id]);
  const employees=React.useMemo(()=>window.SEED.employees,[]);
  const departments=React.useMemo(()=>[...new Set(employees.map(item=>item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de')),[employees]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return employees;
    if(scope==='active') return employees.filter(item=>item.status==='aktiv');
    if(scope==='inactive') return employees.filter(item=>item.status!=='aktiv');
    return employees.filter(item=>item.id===scope);
  },[scope,employees]);
  const isAll=scope==='all'||scope==='active'||scope==='inactive';
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const rows=React.useMemo(()=>activeEmployees.flatMap(employeeAppointmentRows),[activeEmployees]);
  const scopeLabel=scope==='all'?'Alle Mitarbeiter':scope==='active'?'nur aktive Mitarbeiter':scope==='inactive'?'ausgeschiedene Mitarbeiter':(currentEmployee?.name||emp.name);
  const title=isAll?'Termine - alle Mitarbeiter':`Termine (${scopeLabel})`;
  const activeFilterCount=Object.entries(filters).filter(([key,val])=>key==='archived'?val:val&&val!=='all').length;
  const statusClass=status=>/vollständig|bestätigt/i.test(status)?'valid':/nachbearbeitung|durchgeführt/i.test(status)?'warn':/abgesagt|archiv/i.test(status)?'archived':'planned';
  const typeClass=type=>String(type).toLowerCase().includes('schulung')?'training':String(type).toLowerCase().includes('unterweisung')?'instruction':String(type).toLowerCase().includes('führerschein')?'license':String(type).toLowerCase().includes('geräte')?'equipment':String(type).toLowerCase().includes('vorsorge')?'medical':String(type).toLowerCase().includes('besprechung')?'meeting':'other';
  const value=(row,key)=>key==='period'?`${row.date} ${row.start} ${row.end}`:row[key]||'';
  const visibleRows=rows.filter(row=>{
    if(mode==='archive') {
      if(!(row.archived||row.status==='Archiviert'||row.status==='Vollständig')) return false;
    } else if(!filters.archived && row.archived) return false;
    if(quickFilter==='today'&&row.date!=='2026-10-15') return false;
    if(quickFilter==='week'&&(row.date<'2026-10-15'||row.date>'2026-10-22')) return false;
    if(quickFilter==='month'&&!row.date.startsWith('2026-10')) return false;
    if(quickFilter==='past'&&row.date>='2026-10-15') return false;
    if(quickFilter==='upcoming'&&row.date<'2026-10-15') return false;
    if(filters.employee&&!String(row.employeeName||'').toLowerCase().includes(filters.employee.toLowerCase())) return false;
    if(filters.company!=='all'&&row.company!==(window.company(filters.company)?.name||filters.company)) return false;
    if(filters.type!=='all'&&row.type!==filters.type) return false;
    if(filters.status!=='all'&&row.status!==filters.status) return false;
    if(filters.from&&row.date<filters.from) return false;
    if(filters.to&&row.date>filters.to) return false;
    if(filters.responsible&&!String(row.responsible||'').toLowerCase().includes(filters.responsible.toLowerCase())) return false;
    if(filters.provider&&!String(row.provider||'').toLowerCase().includes(filters.provider.toLowerCase())) return false;
    if(filters.training&&!String(row.training||'').toLowerCase().includes(filters.training.toLowerCase())) return false;
    if(filters.docs!=='all'&&row.docs!==filters.docs) return false;
    if(filters.certs!=='all'&&row.certs!==filters.certs) return false;
    if(filters.invoice!=='all'&&row.invoice!==filters.invoice) return false;
    return true;
  }).sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const pickerEmployees=employees.filter(item=>{
    const term=employeeSearch.toLowerCase();
    if(term&&!`${item.firstName} ${item.lastName} ${item.personalNr}`.toLowerCase().includes(term)) return false;
    if(employeeCompanyFilter!=='all'&&item.company!==employeeCompanyFilter) return false;
    if(employeeDepartmentFilter!=='all'&&item.department!==employeeDepartmentFilter) return false;
    if(employeePositionFilter&&!String(item.position||'').toLowerCase().includes(employeePositionFilter.toLowerCase())) return false;
    if(employeeStatusFilter!=='all'&&(employeeStatusFilter==='aktiv'?item.status!=='aktiv':item.status==='aktiv')) return false;
    return true;
  });
  const toggle=id=>setSelected(old=>{const next=new Set(old);next.has(id)?next.delete(id):next.add(id);return next;});
  const columns=mode==='archive'?
    [...(isAll?[{key:'employeeName',label:'Mitarbeiter'}]:[]),{key:'title',label:'Termin'},{key:'type',label:'Terminart'},{key:'period',label:'Terminzeitraum'},{key:'post',label:'Abschlussdatum'},{key:'responsible',label:'abgeschlossen von'},{key:'docs',label:'Dokumente'},{key:'actions',label:'Aktionen'}]:
    [...(isAll?[{key:'employeeName',label:'Mitarbeiter'}]:[]),{key:'title',label:'Termin'},{key:'type',label:'Terminart'},{key:'period',label:'Datum und Uhrzeit'},{key:'status',label:'Status'},{key:'responsible',label:'Verantwortlicher'},{key:'docs',label:'Dokumentstatus'},{key:'actions',label:'Aktionen'}];
  const cellValue=(row,key)=>{
    if(key==='employeeName') return <div><strong>{row.employeeName.split(' ').reverse().join(', ')}</strong><small>PN {row.employeeId}</small></div>;
    if(key==='title') return <div><strong>{row.title}</strong><small>{row.training} · {row.provider}</small></div>;
    if(key==='type') return <span className={`emp-appointment-type is-${typeClass(row.type)}`}>{row.type}</span>;
    if(key==='period') return <div><strong>{window.fmtDE(row.date)}</strong><small>{row.start}-{row.end} Uhr</small></div>;
    if(key==='status') return <span className={'emp-status is-'+statusClass(row.status)}>{row.status}</span>;
    if(key==='docs') return <span className={'emp-doc-count '+(row.docs==='offen'?'is-missing':'')}><Icon name="doc" size={13}/>{row.docs}</span>;
    if(key==='post') return row.post==='-'?'12.10.2026':row.post;
    if(key==='actions') return <div className="emp-appointment-row-actions"><button onClick={event=>{event.stopPropagation();setModal(row.status==='Nachbearbeitung offen'?'post':'detail');}}>Öffnen</button><button onClick={event=>event.stopPropagation()}>⋮</button></div>;
    return row[key]||'-';
  };
  const renderCalendar=()=>calendarView==='agenda'?<div className="emp-appointment-agenda">{visibleRows.map(row=><button key={row.id} onClick={()=>setModal(row.status==='Nachbearbeitung offen'?'post':'detail')}><span className={`emp-appointment-dot is-${typeClass(row.type)}`}/><strong>{window.fmtDE(row.date)} · {row.start}</strong><span>{row.title}</span><small>{row.type} · {row.employeeName}</small></button>)}</div>:<React.Fragment><div className="emp-appointment-calendar-head"><button>‹</button><h2>Oktober 2026</h2><button>›</button></div><div className={'emp-personal-calendar emp-personal-calendar--'+calendarView}>{['Mo','Di','Mi','Do','Fr','Sa','So'].map(day=><div key={day} className="emp-personal-calendar__head">{day}</div>)}{Array.from({length:calendarView==='week'?7:35},(_,index)=>{const day=calendarView==='week'?15+index:index+1;const dayRows=visibleRows.filter(row=>Number(row.date.slice(-2))===day);return <div key={day} className="emp-personal-calendar__cell"><b>{day}</b>{dayRows.map(row=><button key={row.id} className={`is-${typeClass(row.type)}`} onClick={()=>setModal(row.status==='Nachbearbeitung offen'?'post':'detail')}><span>{row.type}</span>{row.start} · {row.title}</button>)}</div>;})}</div></React.Fragment>;
  const resetFilters=()=>setFilters({employee:'',company:'all',type:'all',status:'all',from:'',to:'',responsible:'',provider:'',training:'',docs:'all',certs:'all',invoice:'all',archived:false});
  return <div className="emp-full emp-appointments-page">
    <EmpPageTitle title={title} onBack={onBack} action={<div className="emp-appointment-actions"><button className="btn btn--ghost" onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {scopeLabel}</button><div className="emp-segmented">{[['calendar','Kalender'],['list','Liste'],['archive','Archiv']].map(([id,label])=><button key={id} className={mode===id?'is-active':''} onClick={()=>setMode(id)}>{label}</button>)}</div><button className="btn btn--ghost" onClick={()=>setFilterOpen(true)}><Icon name="filter" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button><button className="btn btn--primary" onClick={()=>setModal('new')}><Icon name="plus" size={14}/>Termin</button></div>}/>
    <div className="emp-appointment-filterbar">{['Heute','Diese Woche','Dieser Monat','Kommende Termine','Vergangene Termine'].map((label,index)=>{const id=['today','week','month','upcoming','past'][index];return <button key={id} className={quickFilter===id?'is-active':''} onClick={()=>setQuickFilter(id)}>{label}</button>;})}{mode==='calendar'&&<div className="emp-segmented emp-calendar-view-switch">{[['month','Monat'],['week','Woche'],['agenda','Agenda']].map(([id,label])=><button key={id} className={calendarView===id?'is-active':''} onClick={()=>setCalendarView(id)}>{label}</button>)}</div>}</div>
    {activeFilterCount>0&&<div className="emp-active-filter-chips">{filters.status!=='all'&&<button onClick={()=>setFilters(old=>({...old,status:'all'}))}>Status: {filters.status} ×</button>}{filters.type!=='all'&&<button onClick={()=>setFilters(old=>({...old,type:'all'}))}>Terminart: {filters.type} ×</button>}{(filters.from||filters.to)&&<button onClick={()=>setFilters(old=>({...old,from:'',to:''}))}>Zeitraum ×</button>}</div>}
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Export</button><button>Archivieren</button><button className="is-clear" onClick={()=>setSelected(new Set())}>×</button></div>}
    {mode==='calendar'&&renderCalendar()}
    {(mode==='list'||mode==='archive')&&<div className="emp-table-wrap emp-appointments-table-wrap"><table className="emp-appointments-table emp-appointments-table--compact"><thead><tr><th className="emp-check emp-sticky-select"><input type="checkbox" checked={visibleRows.length>0&&selected.size===visibleRows.length} onChange={event=>setSelected(event.target.checked?new Set(visibleRows.map(row=>row.id)):new Set())}/></th>{columns.map(column=><th key={column.key} className={column.key==='employeeName'?'emp-sticky-employee':column.key==='title'?'emp-sticky-title':column.key==='actions'?'emp-sticky-actions':''}><button onClick={()=>column.key!=='actions'&&setMenu(menu===column.key?null:column.key)}>{column.label}<span>{column.key!=='actions'?(sort.key===column.key?(sort.dir==='asc'?'↑':'↓'):'⌄'):''}</span></button>{menu===column.key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key:column.key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key:column.key,dir:'desc'});setMenu(null);}}>Z bis A</button><button>Filtern nach</button><button>Gruppieren nach "{column.label}"</button><button>Spalten verwalten</button></div>}</th>)}</tr></thead><tbody>{visibleRows.map(row=><tr key={row.id} className={selected.has(row.id)?'is-selected':''} onClick={()=>setModal(row.status==='Nachbearbeitung offen'?'post':'detail')}><td className="emp-check emp-sticky-select" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>{columns.map(column=><td key={column.key} className={column.key==='employeeName'?'emp-sticky-employee':column.key==='title'?'emp-sticky-title':column.key==='actions'?'emp-sticky-actions':''}>{cellValue(row,column.key)}</td>)}</tr>)}</tbody></table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Termine</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">nur aktive Mitarbeiter</option><option value="inaktiv">ausgeschiedene Mitarbeiter</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name||item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterOpen&&<div className="emp-filter-backdrop" onClick={()=>setFilterOpen(false)}><aside className="emp-filter-panel" onClick={event=>event.stopPropagation()}><header><div><span>Termine</span><h2>Filter</h2></div><button onClick={()=>setFilterOpen(false)}>×</button></header><div className="emp-filter-grid"><label>Mitarbeiter<input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))}/></label><label>Firma<select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Terminart<select value={filters.type} onChange={event=>setFilters(old=>({...old,type:event.target.value}))}><option value="all">Alle</option>{['Schulung','Unterweisung','arbeitsmedizinische Vorsorge','Führerscheinkontrolle','Geräteprüfung','Besprechung','sonstiger Termin'].map(item=><option key={item}>{item}</option>)}</select></label><label>Status<select value={filters.status} onChange={event=>setFilters(old=>({...old,status:event.target.value}))}><option value="all">Alle</option>{['Entwurf','Geplant','Bestätigt','Durchgeführt','Nachbearbeitung offen','Vollständig','Verschoben','Abgesagt','Archiviert'].map(item=><option key={item}>{item}</option>)}</select></label><label>Zeitraum von<input type="date" value={filters.from} onChange={event=>setFilters(old=>({...old,from:event.target.value}))}/></label><label>Zeitraum bis<input type="date" value={filters.to} onChange={event=>setFilters(old=>({...old,to:event.target.value}))}/></label><label>Verantwortlicher<input value={filters.responsible} onChange={event=>setFilters(old=>({...old,responsible:event.target.value}))}/></label><label>Anbieter<input value={filters.provider} onChange={event=>setFilters(old=>({...old,provider:event.target.value}))}/></label><label>Schulung<input value={filters.training} onChange={event=>setFilters(old=>({...old,training:event.target.value}))}/></label><label>Dokumente<select value={filters.docs} onChange={event=>setFilters(old=>({...old,docs:event.target.value}))}><option value="all">Alle</option><option value="vollständig">vollständig</option><option value="offen">offen</option></select></label><label>Zertifikate<select value={filters.certs} onChange={event=>setFilters(old=>({...old,certs:event.target.value}))}><option value="all">Alle</option><option value="vollständig">vollständig</option><option value="offen">offen</option></select></label><label>Rechnung<select value={filters.invoice} onChange={event=>setFilters(old=>({...old,invoice:event.target.value}))}><option value="all">Alle</option><option value="bezahlt">bezahlt</option><option value="offen">offen</option></select></label><label className="emp-checkline"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Termine anzeigen</label></div><footer><button onClick={resetFilters}>Zurücksetzen</button><button onClick={()=>setFilterOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterOpen(false)}>Anwenden</button></footer></aside></div>}
    {modal&&<EmployeeAppointmentModal type={modal} onClose={()=>setModal(null)}/>}
  </div>;
}

function employeeMasterRecord(emp) {
  const company = window.company(emp.company);
  const text = `${emp.position} ${emp.department}`.toLowerCase();
  const group = /azubi|auszubild/.test(text) ? 'Azubi' : /praktik/.test(text) ? 'Praktikant' : /kaufm|büro|verwaltung|angestellte/i.test(text) ? 'Angestellt' : 'Gewerblich';
  return {
    id:emp.id, firstName:emp.firstName, lastName:emp.lastName, pn:emp.personalNr,
    company:company?.name || '-', department:emp.department, position:emp.position,
    group, employmentType:'Festangestellt', workload:emp.workload || 'Vollzeit', weeklyHours:emp.workload === 'Teilzeit' ? '24 Std.' : '40 Std.',
    entry:window.fmtDE(emp.entry), probationUntil:'15.08.2026', exitDate:'-', manager:'Christian Janning', costCenter:'TB-410', site:'Nordhorn',
    phone:emp.phone, email:emp.email, address:emp.address, status:emp.status === 'aktiv' ? 'Aktiv' : 'Inaktiv',
    mobile:'+49 170 1234567', office:'Büro Nordhorn', privatePhone:'Nur berechtigt sichtbar', privateEmail:'Nur berechtigt sichtbar',
    emergencyContact:'Maria Beck · +49 170 9876543',
    description:`${emp.position} im Bereich ${emp.department}. Zugeordnet zur ${company?.name || 'Janning Group'}.`,
    profile:emp.initials, role:'Mitarbeiter', user:`${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}`, loginEmail:emp.email,
    accountStatus:'Aktiv', lastLogin:'12.07.2026, 08:41 Uhr', passwordChanged:'03.06.2026', twoFactor:'Aktiv',
  };
}

function EmployeeMasterArea({ emp, onBack, onOpen }) {
  const record = React.useMemo(() => employeeMasterRecord(emp), [emp.id]);
  const [selected, setSelected] = React.useState(false);
  const [sort, setSort] = React.useState({ key:'lastName', dir:'asc' });
  const [menu, setMenu] = React.useState(null);
  const [group, setGroup] = React.useState('');
  const [filter, setFilter] = React.useState('');
  const columns = [
    ['firstName','Vorname'],['lastName','Nachname'],['pn','PN'],['company','Firma'],['department','Abteilung'],
    ['position','Position'],['group','Gruppe'],['workload','Arbeitszeit'],['entry','Eintritt'],['phone','Tel'],
    ['email','Mail'],['address','Adresse'],['status','Status'],['description','Beschreibung'],['profile','Profilbild'],
    ['user','User'],['password','Passwort'],
  ];
  const filterLabel = columns.find(column => column[0] === filter)?.[1];

  return (
    <div className="emp-full">
      <EmpPageTitle title={`Stammdaten (${emp.name})`} onBack={onBack} />
      <div className="emp-training-tabs">
        <button className="is-active">Alle 1</button>
        {filter && <button className="emp-clear-group" onClick={() => setFilter('')}>Filter „{filterLabel}“ entfernen</button>}
        {group && <button className="emp-clear-group" onClick={() => setGroup('')}>Gruppierung aufheben</button>}
      </div>
      {selected && <div className="emp-bulk"><strong>1 ausgewählt</strong><button><Icon name="download" size={14} />Als Excel exportieren</button><button><Icon name="edit" size={14} />Status ändern</button><button className="is-danger"><Icon name="trash" size={14} />Löschen</button></div>}
      <div className="emp-table-wrap">
        <table className="emp-master-table">
          <thead><tr>
            <th className="emp-check"><input type="checkbox" checked={selected} onChange={event => setSelected(event.target.checked)} /></th>
            {columns.map(([key,label]) => <th key={key}>
              <button onClick={() => setMenu(menu === key ? null : key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button>
              {menu === key && <div className="emp-column-menu">
                <button onClick={() => {setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button>
                <button onClick={() => {setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button>
                <button onClick={() => {setFilter(key);setMenu(null);}}>Nach „{label}“ filtern</button>
                <button onClick={() => {setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button>
              </div>}
            </th>)}
          </tr></thead>
          <tbody>
            {group && <tr className="emp-group-row"><td colSpan="18">{columns.find(column => column[0] === group)?.[1]}: {record[group]}</td></tr>}
            <tr onClick={() => onOpen(record)}>
              <td className="emp-check" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selected} onChange={event => setSelected(event.target.checked)} /></td>
              <td><strong>{record.firstName}</strong></td><td><strong>{record.lastName}</strong></td><td>{record.pn}</td><td>{record.company}</td>
              <td>{record.department}</td><td>{record.position}</td><td>{record.group}</td><td>{record.workload}</td><td>{record.entry}</td>
              <td>{record.phone}</td><td>{record.email}</td><td>{record.address}</td><td><span className="emp-status is-valid">{record.status}</span></td>
              <td className="emp-ellipsis">{record.description}</td><td><span className="emp-master-avatar">{record.profile}</span></td><td>{record.user}</td><td>{record.password}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeMasterRecord({ emp, record, onBack, employeeChoices = [], onSelectEmployee, onPrevEmployee, onNextEmployee }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({...record});
  const [historyOpen, setHistoryOpen] = React.useState(false);
  React.useEffect(() => setForm({...record}), [record.id]);
  const choices = employeeChoices.length ? employeeChoices : [emp];
  const set = (key, value) => setForm(current => ({...current, [key]:value}));
  const inputFor = (key, options) => options
    ? <select value={form[key]} onChange={event => set(key,event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select>
    : <input type="text" value={form[key]} onChange={event => set(key,event.target.value)} />;
  return (
    <div className="emp-full emp-master-detail">
      <EmpPageTitle title={`Stammdaten (${emp.name})`} onBack={onBack} action={<button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Bearbeiten</button>} />

      <section className="emp-master-hero">
        <span className="emp-master-avatar is-hero">{form.profile}</span>
        <div>
          <div className="emp-master-hero__name"><h2>{form.firstName} {form.lastName}</h2><span className="emp-active"><i />{form.status}</span></div>
          <dl><div><dt>Position</dt><dd>{form.position}</dd></div><div><dt>Firma</dt><dd>{form.company}</dd></div></dl>
        </div>
        <div className="emp-master-hero-picker">
          <label>
            <span>Mitarbeiter auswählen</span>
            <select value={emp.id} onChange={event => onSelectEmployee && onSelectEmployee(event.target.value)}>
              {choices.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div>
            <button type="button" onClick={onPrevEmployee}><Icon name="chevL" size={15} />Vorheriger</button>
            <button type="button" onClick={onNextEmployee}>Nächster<Icon name="chevR" size={15} /></button>
          </div>
        </div>
      </section>

      <div className="emp-master-layout">
        <main className="emp-master-main">
          <MasterDataCard title="Beschäftigung" icon="building" className="emp-master-employment">
            <div className="emp-master-field-grid">
              <MasterDataField label="Personalnummer" icon="doc" editing={editing} value={form.pn}>{inputFor('pn')}</MasterDataField>
              <MasterDataField label="Vorname" icon="users" editing={editing} value={form.firstName}>{inputFor('firstName')}</MasterDataField>
              <MasterDataField label="Nachname" icon="users" editing={editing} value={form.lastName}>{inputFor('lastName')}</MasterDataField>
              <MasterDataField label="Firma" icon="building" editing={editing} value={form.company}>{inputFor('company')}</MasterDataField>
              <MasterDataField label="Abteilung" icon="doc" editing={editing} value={form.department}>{inputFor('department')}</MasterDataField>
              <MasterDataField label="Position" icon="users" editing={editing} value={form.position}>{inputFor('position')}</MasterDataField>
              <MasterDataField label="Mitarbeitergruppe" icon="users" editing={editing} value={form.group}>{inputFor('group',['Gewerblich','Angestellt','Azubi','Praktikant'])}</MasterDataField>
              <MasterDataField label="Beschäftigungsart" icon="doc" editing={editing} value={form.employmentType}>{inputFor('employmentType',['Festangestellt','Befristet','Aushilfe','Praktikum'])}</MasterDataField>
              <MasterDataField label="Vollzeit oder Teilzeit" icon="clock" editing={editing} value={form.workload}>{inputFor('workload',['Vollzeit','Teilzeit'])}</MasterDataField>
              <MasterDataField label="Wochenarbeitszeit" icon="clock" editing={editing} value={form.weeklyHours}>{inputFor('weeklyHours')}</MasterDataField>
              <MasterDataField label="Eintritt" icon="cal" editing={editing} value={form.entry}>{inputFor('entry')}</MasterDataField>
              <MasterDataField label="Probezeit bis" icon="cal" editing={editing} value={form.probationUntil}>{inputFor('probationUntil')}</MasterDataField>
              <MasterDataField label="Austrittsdatum" icon="cal" editing={editing} value={form.exitDate}>{inputFor('exitDate')}</MasterDataField>
              <MasterDataField label="Personalstatus" icon="shield" editing={editing} value={form.status}>{inputFor('status',['Aktiv','Probezeit','Elternzeit','Freigestellt','Gekündigt','Ausgeschieden','Archiviert'])}</MasterDataField>
              <MasterDataField label="Direkte Führungskraft" icon="users" editing={editing} value={form.manager}>{inputFor('manager')}</MasterDataField>
              <MasterDataField label="Kostenstelle" icon="doc" editing={editing} value={form.costCenter}>{inputFor('costCenter')}</MasterDataField>
              <MasterDataField label="Standort" icon="pin" editing={editing} value={form.site}>{inputFor('site')}</MasterDataField>
            </div>
          </MasterDataCard>

          <MasterDataCard title="Kontaktdaten" icon="users">
            <div className="emp-master-field-grid emp-master-contact-list">
              <MasterDataField label="Geschäftliche Telefonnummer" icon="phone" editing={editing} value={form.phone}>{inputFor('phone')}</MasterDataField>
              <MasterDataField label="Mobilnummer" icon="phone" editing={editing} value={form.mobile}>{inputFor('mobile')}</MasterDataField>
              <MasterDataField label="Geschäftliche E-Mail" icon="mail" editing={editing} value={form.email}>{inputFor('email')}</MasterDataField>
              <MasterDataField label="Standort / Büro" icon="building" editing={editing} value={form.office}>{inputFor('office')}</MasterDataField>
              <MasterDataField label="Private Telefonnummer" icon="phone" editing={editing} value={form.privatePhone}>{inputFor('privatePhone')}</MasterDataField>
              <MasterDataField label="Private E-Mail" icon="mail" editing={editing} value={form.privateEmail}>{inputFor('privateEmail')}</MasterDataField>
              <MasterDataField label="Private Adresse" icon="pin" editing={editing} value={form.address}>{inputFor('address')}</MasterDataField>
              <MasterDataField label="Notfallkontakt" icon="users" editing={editing} value={form.emergencyContact}>{inputFor('emergencyContact')}</MasterDataField>
            </div>
          </MasterDataCard>

          <MasterDataCard title="Systemzugang" icon="shield">
            <div className="emp-system-access emp-system-access--expanded">
              <MasterDataField label="Benutzername" editing={editing} value={form.user}>{inputFor('user')}</MasterDataField>
              <MasterDataField label="E-Mail für Anmeldung" editing={editing} value={form.loginEmail}>{inputFor('loginEmail')}</MasterDataField>
              <MasterDataField label="Rolle" editing={editing} value={form.role}>{inputFor('role',['Admin','Geschäftsführer','Verwaltung','Bauleiter','Mitarbeiter'])}</MasterDataField>
              <MasterDataField label="Konto aktiv / gesperrt" editing={editing} value={form.accountStatus}>{inputFor('accountStatus',['Aktiv','Gesperrt'])}</MasterDataField>
              <MasterDataField label="Letzter Login" editing={editing} value={form.lastLogin}>{inputFor('lastLogin')}</MasterDataField>
              <MasterDataField label="Passwort zuletzt geändert" editing={editing} value={form.passwordChanged}>{inputFor('passwordChanged')}</MasterDataField>
              <MasterDataField label="Zwei-Faktor-Authentifizierung" editing={editing} value={form.twoFactor}>{inputFor('twoFactor',['Aktiv','Nicht aktiv'])}</MasterDataField>
              {!editing && <div className="emp-access-actions">
                <button><Icon name="shield" size={14} />Passwort zurücksetzen</button>
                <button><Icon name="mail" size={14} />Anmeldelink senden</button>
                <button><Icon name="flag" size={14} />Konto sperren</button>
                <button><Icon name="users" size={14} />Rolle ändern</button>
              </div>}
            </div>
          </MasterDataCard>

          <MasterDataCard title="Beschreibung" icon="doc">
            {editing ? <textarea className="emp-master-description-input" rows="5" value={form.description} onChange={event => set('description',event.target.value)} /> : <p className="emp-master-description">{form.description}</p>}
          </MasterDataCard>
        </main>

        <aside className="emp-master-aside">
          <button type="button" className="emp-master-card emp-history-button" onClick={() => setHistoryOpen(current => !current)}>
            <header><Icon name="history" size={17} /><h3>Letzte Änderung</h3></header>
            <div className="emp-master-card__body"><p className="emp-last-change">03.06.2026, 10:32 Uhr<br />von Sabine Janning</p><small>Historie öffnen</small></div>
          </button>
          <MasterDataCard title="Schnellaktionen" icon="settings">
            <div className="emp-master-actions">
              <button><Icon name="plus" size={14} />Dokument hinzufügen<Icon name="chevR" size={13} /></button>
              <button><Icon name="cap" size={14} />Schulung hinzufügen<Icon name="chevR" size={13} /></button>
              <button><Icon name="flag" size={14} />Unterweisung hinzufügen<Icon name="chevR" size={13} /></button>
              <button><Icon name="check" size={14} />Qualifikation hinzufügen<Icon name="chevR" size={13} /></button>
              <button><Icon name="shield" size={14} />Vorsorge eintragen<Icon name="chevR" size={13} /></button>
              <button><Icon name="cal" size={14} />Führerscheinkontrolle eintragen<Icon name="chevR" size={13} /></button>
              <button><Icon name="settings" size={14} />Beauftragung erstellen<Icon name="chevR" size={13} /></button>
              <button><Icon name="building" size={14} />Baustelle zuordnen<Icon name="chevR" size={13} /></button>
              <button><Icon name="cal" size={14} />Termin erstellen<Icon name="chevR" size={13} /></button>
              <button><Icon name="history" size={14} />Austritt erfassen<Icon name="chevR" size={13} /></button>
            </div>
          </MasterDataCard>
          <MasterDataCard title="Profilbild" icon="doc">
            <div className="emp-master-photo"><span className="emp-master-avatar is-large">{form.profile}</span><div><strong>Profilbild des Mitarbeiters</strong><small>PNG oder JPG, maximal 5 MB</small><label><Icon name="upload" size={14} />Profilbild ändern<input type="file" accept="image/*" /></label><button>Profilbild entfernen</button><button>Initialen verwenden</button></div></div>
          </MasterDataCard>
        </aside>
      </div>
      {historyOpen && <section className="emp-history-panel">
        <header><h2>Änderungshistorie</h2><button onClick={() => setHistoryOpen(false)}>Schließen</button></header>
        {[
          ['03.06.2026, 10:32 Uhr','Telefon','+49 5921 2868','+49 5921 8801-23','Sabine Janning'],
          ['28.05.2026, 09:10 Uhr','Rolle','Mitarbeiter','Bauleiter','Rahim Ahangarzadeh'],
          ['12.05.2026, 14:44 Uhr','Status','Probezeit','Aktiv','Christian Janning'],
        ].map(row => <div key={row[0]}><strong>{row[1]}</strong><span>{row[0]} · {row[4]}</span><small>{row[2]} → {row[3]}</small></div>)}
      </section>}
      {editing && <div className="emp-master-savebar"><button className="btn btn--ghost" onClick={() => setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></div>}
    </div>
  );
}

function MasterDataCard({ title, icon, className='', children }) {
  return <section className={'emp-master-card ' + className}><header><Icon name={icon} size={17} /><h3>{title}</h3></header><div className="emp-master-card__body">{children}</div></section>;
}

function MasterDataField({ label, icon, editing, value, children }) {
  return <div className="emp-master-field">{icon && <Icon name={icon} size={15} />}<div><span>{label}</span>{editing ? children : <strong>{value}</strong>}</div></div>;
}

function employeeTrainingRecords(emp) {
  const certs = window.SEED.certs[emp.id] || {};
  return window.SEED.trainings.slice(0, 8).map((training, index) => {
    const cert = certs[training.id] || {};
    const status = index === 3 ? 'expired' : index === 1 ? 'warn' : (['expired','warn'].includes(cert.status) ? cert.status : 'valid');
    const provider = window.provider(cert.provider || training.provider);
    return {
      id:`${emp.id}-${training.id}`,
      trainingId:training.id,
      employeeId:emp.id,
      employee:emp,
      employeeName:`${emp.lastName}, ${emp.firstName}`,
      company:window.company(emp.company)?.name || emp.company,
      companyShort:window.company(emp.company)?.short || emp.company,
      department:emp.department,
      position:emp.position,
      name:training.name,
      category:training.cat,
      mandatory:training.mandatory ? 'Pflicht' : 'Optional',
      provider:provider?.name || '-',
      responsible:index % 2 ? 'Michael Janning' : 'Sabine Janning',
      issued:cert.issuedAt ? window.fmtDE(cert.issuedAt) : '21.05.2024',
      expires:cert.expiresAt ? window.fmtDE(cert.expiresAt) : '21.05.2027',
      days:status === 'expired' ? -21 : status === 'warn' ? 37 : 412 + index * 29,
      status, released:index !== 3, changed:index === 0 ? '03.06.2026 · Sabine Janning' : `${String(28-index).padStart(2,'0')}.05.2026 · Michael Janning`,
      description:training.desc,
      documents:index % 3 === 0 ? 2 : 1,
      documentMissing:index === 5,
      noExpiry:index === 6,
      planned:index === 1,
      history:index === 0 ? '2 frühere Nachweise' : '1 frühere Version',
      appointment:index === 1 ? 'Termin 22.04.2026 geplant' : '-',
    };
  });
}

function EmployeeTrainingArea({ emp, onBack, onOpen }) {
  const [scope, setScope] = React.useState(emp.id);
  const [employeePickerOpen, setEmployeePickerOpen] = React.useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [employeeSearch, setEmployeeSearch] = React.useState('');
  const [employeeCompanyFilter, setEmployeeCompanyFilter] = React.useState('all');
  const [employeeDepartmentFilter, setEmployeeDepartmentFilter] = React.useState('all');
  const [employeeGroupFilter, setEmployeeGroupFilter] = React.useState('all');
  const [employeeStatusFilter, setEmployeeStatusFilter] = React.useState('aktiv');
  const [rowActionMenu, setRowActionMenu] = React.useState(null);
  const [filters, setFilters] = React.useState({
    employee:'', company:'all', department:'all', position:'', training:'', status:'all',
    issuedFrom:'', expiresTo:'', expiryWindow:'all', document:'all', release:'all',
    planned:false, archived:false,
  });
  const sourceEmployees = React.useMemo(() => window.SEED.employees, []);
  const activeEmployees = React.useMemo(() => {
    if (scope === 'all') return sourceEmployees;
    if (scope === 'active') return sourceEmployees.filter(item => item.status === 'aktiv');
    if (scope === 'inactive') return sourceEmployees.filter(item => item.status !== 'aktiv');
    if (scope.startsWith('company:')) return sourceEmployees.filter(item => item.company === scope.replace('company:',''));
    return sourceEmployees.filter(item => item.id === scope);
  }, [scope, sourceEmployees]);
  const isAllView = scope === 'all' || scope === 'active' || scope === 'inactive' || scope.startsWith('company:');
  const currentEmployee = activeEmployees.length === 1 ? activeEmployees[0] : emp;
  const records = React.useMemo(() => activeEmployees.flatMap(employeeTrainingRecords), [activeEmployees]);
  const [selected, setSelected] = React.useState(new Set());
  const [sort, setSort] = React.useState({ key:'name', dir:'asc' });
  const [menu, setMenu] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [group, setGroup] = React.useState('');
  const [hiddenColumns, setHiddenColumns] = React.useState(new Set());
  const labels = { valid:'Gültig', warn:'Läuft bald ab', expired:'Abgelaufen', planned:'Geplant', archived:'Archiviert' };
  const departments = [...new Set(sourceEmployees.map(item => item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const groups = [...new Set(sourceEmployees.map(item => item.group || (item.position?.toLowerCase().includes('azubi') ? 'Azubi' : item.position?.toLowerCase().includes('kaufm') ? 'Angestellte' : 'Gewerbliche')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const currentScopeLabel = scope === 'all' ? 'Alle Mitarbeiter' : scope === 'active' ? 'Aktive Mitarbeiter' : scope === 'inactive' ? 'Inaktive Mitarbeiter' : scope.startsWith('company:') ? (window.company(scope.replace('company:',''))?.name || 'Firma') : (sourceEmployees.find(item => item.id === scope)?.name || emp.name);
  const activeFilterCount = [filters.employee, filters.company !== 'all', filters.department !== 'all', filters.position, filters.training, filters.status !== 'all', filters.issuedFrom, filters.expiresTo, filters.expiryWindow !== 'all', filters.document !== 'all', filters.release !== 'all', filters.planned, filters.archived].filter(Boolean).length;
  const resetFilters = () => setFilters({ employee:'', company:'all', department:'all', position:'', training:'', status:'all', issuedFrom:'', expiresTo:'', expiryWindow:'all', document:'all', release:'all', planned:false, archived:false });
  const value = (row, key) => key === 'status' ? labels[row.status] : row[key];
  const filterRow = row => {
    if (filter === 'all') return true;
    if (filter === 'documentMissing') return row.documentMissing;
    if (filter === 'noExpiry') return row.noExpiry;
    if (filter === 'archived') return row.status === 'archived';
    return row.status === filter;
  };
  const panelFilterRow = row => {
    const employeeText = `${row.employeeName} ${row.employee.personalNr || ''}`.toLowerCase();
    if (filters.employee && !employeeText.includes(filters.employee.toLowerCase())) return false;
    if (filters.company !== 'all' && row.employee.company !== filters.company) return false;
    if (filters.department !== 'all' && row.department !== filters.department) return false;
    if (filters.position && !row.position.toLowerCase().includes(filters.position.toLowerCase())) return false;
    if (filters.training && !row.name.toLowerCase().includes(filters.training.toLowerCase())) return false;
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    if (filters.expiryWindow !== 'all' && !row.noExpiry && row.days > Number(filters.expiryWindow)) return false;
    if (filters.document === 'missing' && !row.documentMissing) return false;
    if (filters.document === 'available' && row.documentMissing) return false;
    if (filters.release === 'released' && !row.released) return false;
    if (filters.release === 'blocked' && row.released) return false;
    if (filters.planned && !row.planned) return false;
    if (!filters.archived && row.status === 'archived') return false;
    return true;
  };
  let rows = records.filter(filterRow).filter(panelFilterRow);
  rows = [...rows].sort((a,b) => (sort.dir === 'asc' ? 1 : -1) * String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle = id => setSelected(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const baseColumns = [
    ...(isAllView ? [['employeeName','Mitarbeiter'],['companyShort','Firma'],['department','Abteilung'],['position','Position']] : []),
    ['name','Zertifikat / Schulung'],['issued','Ausstellungsdatum'],['expires','Ablaufdatum'],['days','Restlaufzeit'],['status','Status'],['released','Freigabe für Mitarbeiter'],['changed','Zuletzt geändert'],['description','Beschreibung'],['documents','Dokumente'],['actions','Aktionen']
  ];
  const columns = baseColumns.filter(([key]) => !hiddenColumns.has(key));
  const tabLabels = {
    all:`Alle ${records.length}`,
    valid:`Gültig ${records.filter(row => row.status === 'valid').length}`,
    warn:`Läuft bald ab ${records.filter(row => row.status === 'warn').length}`,
    expired:`Abgelaufen ${records.filter(row => row.status === 'expired').length}`,
    documentMissing:`Dokument fehlt ${records.filter(row => row.documentMissing).length}`,
    noExpiry:`Ohne Ablaufdatum ${records.filter(row => row.noExpiry).length}`,
    archived:`Archiviert ${records.filter(row => row.status === 'archived').length}`,
  };
  const pickerEmployees = sourceEmployees.filter(item => {
    const text = `${item.lastName}, ${item.firstName} ${item.personalNr}`.toLowerCase();
    const groupName = item.group || (item.position?.toLowerCase().includes('azubi') ? 'Azubi' : item.position?.toLowerCase().includes('kaufm') ? 'Angestellte' : 'Gewerbliche');
    if (employeeSearch && !text.includes(employeeSearch.toLowerCase())) return false;
    if (employeeCompanyFilter !== 'all' && item.company !== employeeCompanyFilter) return false;
    if (employeeDepartmentFilter !== 'all' && item.department !== employeeDepartmentFilter) return false;
    if (employeeGroupFilter !== 'all' && groupName !== employeeGroupFilter) return false;
    if (employeeStatusFilter !== 'all' && item.status !== employeeStatusFilter) return false;
    return true;
  }).slice().sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
  const columnValue = (row, key) => {
    if (key === 'days') return row.noExpiry ? 'ohne Ablaufdatum' : row.days < 0 ? `${Math.abs(row.days)} Tage überfällig` : `in ${row.days} Tagen`;
    if (key === 'status') return <span className={'emp-status is-' + row.status}>{labels[row.status]}</span>;
    if (key === 'released') return <span className="emp-release">{row.released ? <Icon name="check" size={17} stroke={2.4} /> : '-'}</span>;
    if (key === 'documents') return <span className={'emp-doc-count ' + (row.documentMissing ? 'is-missing' : '')}><Icon name="doc" size={13} />{row.documentMissing ? 'fehlt' : row.documents}</span>;
    if (key === 'actions') return <div className="emp-row-actions" onClick={event => event.stopPropagation()}><button className="emp-row-menu-btn" onClick={() => setRowActionMenu(rowActionMenu === row.id ? null : row.id)}>⋮</button>{rowActionMenu === row.id && <div className="emp-row-action-menu">{['Details anzeigen','Bearbeiten','Dokument öffnen', row.documentMissing ? 'Dokument hochladen' : 'Dokument ersetzen','Verlängerung planen','Neue Version erfassen','Freigabe ändern','Zum Schulungstermin hinzufügen','Archivieren','Löschen'].map(label => <button key={label} onClick={() => { if (label === 'Details anzeigen' || label === 'Bearbeiten') onOpen(row); setRowActionMenu(null); }}>{label}</button>)}</div>}</div>;
    if (key === 'employeeName') return <strong>{row.employeeName}</strong>;
    if (key === 'name') return <strong>{row.name}</strong>;
    return row[key];
  };

  return (
    <div className="emp-full">
      <EmpPageTitle title={isAllView ? 'Schulungen - alle Mitarbeiter' : `Schulungen (${currentEmployee.name})`} onBack={onBack} action={
        <div className="emp-training-toolbar">
          <button type="button" className="emp-current-picker-btn" onClick={() => setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {currentScopeLabel}</button>
          <button type="button" onClick={() => setScope(sourceEmployees[(sourceEmployees.findIndex(item => item.id === currentEmployee.id) - 1 + sourceEmployees.length) % sourceEmployees.length]?.id || emp.id)}><Icon name="chevL" size={14}/>Vorheriger Mitarbeiter</button>
          <button type="button" onClick={() => setScope(sourceEmployees[(sourceEmployees.findIndex(item => item.id === currentEmployee.id) + 1) % sourceEmployees.length]?.id || emp.id)}>Nächster Mitarbeiter<Icon name="chevR" size={14}/></button>
          <button type="button" onClick={() => setFilterPanelOpen(true)}><Icon name="settings" size={14}/>Filter{activeFilterCount ? ` (${activeFilterCount})` : ''}</button>
          <button type="button" onClick={() => setAssignOpen(true)}><Icon name="plus" size={14}/>Schulung zuordnen</button>
        </div>
      } />
      <div className="emp-training-tabs">
        {['all','valid','warn','expired','documentMissing','noExpiry','archived'].map(id => <button key={id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{tabLabels[id]}</button>)}
        {group && <button className="emp-clear-group" onClick={() => setGroup('')}>Gruppierung aufheben</button>}
        {hiddenColumns.size > 0 && <button className="emp-clear-group" onClick={() => setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}
      </div>
      {activeFilterCount > 0 && <div className="emp-active-filter-chips">
        {filters.company !== 'all' && <button onClick={() => setFilters(old => ({...old, company:'all'}))}>Firma: {window.company(filters.company)?.short || filters.company} ×</button>}
        {filters.status !== 'all' && <button onClick={() => setFilters(old => ({...old, status:'all'}))}>Status: {labels[filters.status]} ×</button>}
        {filters.document !== 'all' && <button onClick={() => setFilters(old => ({...old, document:'all'}))}>Dokument {filters.document === 'missing' ? 'fehlt' : 'vorhanden'} ×</button>}
        {filters.training && <button onClick={() => setFilters(old => ({...old, training:''}))}>Schulung: {filters.training} ×</button>}
      </div>}
      {selected.size > 0 && <div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14} />Dokumente herunterladen</button><button><Icon name="edit" size={14} />Freigabe ändern</button><button><Icon name="clock" size={14} />Verlängerung planen</button><button><Icon name="cal" size={14} />Schulungstermin erstellen</button><button><Icon name="users" size={14} />Verantwortliche Person</button><button className="is-danger"><Icon name="trash" size={14} />Archivieren</button></div>}
      <div className="emp-table-wrap"><table className="emp-training-table">
        <thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length > 0 && selected.size === rows.length} onChange={() => setSelected(selected.size === rows.length ? new Set() : new Set(rows.map(row => row.id)))} /></th>
          {columns.map(([key,label]) => <th key={key}><button onClick={() => setMenu(menu === key ? null : key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button>
            {menu === key && <div className="emp-column-menu"><button onClick={() => {setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={() => {setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={() => setMenu(null)}>Filtern nach</button><button onClick={() => {setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={() => {setHiddenColumns(old => new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button></div>}
          </th>)}</tr></thead>
        <tbody>{rows.map((row,index) => <React.Fragment key={row.id}>
          {group && (index === 0 || value(rows[index-1],group) !== value(row,group)) && <tr className="emp-group-row"><td colSpan={columns.length + 1}>{columns.find(col => col[0] === group)?.[1]}: {String(value(row,group))}</td></tr>}
          <tr className={row.status === 'expired' ? 'is-expired' : ''} onClick={() => onOpen(row)}>
            <td className="emp-check" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} /></td>
            {columns.map(([key]) => <td key={key} className={(key === 'description' ? 'emp-ellipsis ' : '') + (key === 'days' && row.days < 0 ? 'is-overdue' : '')}>{columnValue(row,key)}</td>)}
          </tr></React.Fragment>)}</tbody>
      </table></div>
      {employeePickerOpen && <div className="emp-picker-backdrop" onClick={() => setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event => event.stopPropagation()}><header><div><span>Mitarbeiterauswahl</span><h2>Mitarbeiter auswählen</h2></div><button onClick={() => setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event => setEmployeeSearch(event.target.value)} /><select value={employeeCompanyFilter} onChange={event => setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event => setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item => <option key={item}>{item}</option>)}</select><select value={employeeGroupFilter} onChange={event => setEmployeeGroupFilter(event.target.value)}><option value="all">Alle Gruppen</option>{groups.map(item => <option key={item}>{item}</option>)}</select><select value={employeeStatusFilter} onChange={event => setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Inaktiv</option></select><button type="button" onClick={() => { setScope('all'); setEmployeePickerOpen(false); setSelected(new Set()); }}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item => <tr key={item.id} onClick={() => { setScope(item.id); setEmployeePickerOpen(false); setSelected(new Set()); }}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
      {filterPanelOpen && <div className="emp-training-filter-shell" onClick={() => setFilterPanelOpen(false)}><aside className="emp-training-filter-panel" onClick={event => event.stopPropagation()}><header><div><span>Schulungen</span><h2>Filter</h2></div><button onClick={() => setFilterPanelOpen(false)}>×</button></header><main><label><span>Mitarbeiter</span><input value={filters.employee} onChange={event => setFilters(old => ({...old, employee:event.target.value}))} placeholder="Name oder PN" /></label><label><span>Firma</span><select value={filters.company} onChange={event => setFilters(old => ({...old, company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label><span>Abteilung</span><select value={filters.department} onChange={event => setFilters(old => ({...old, department:event.target.value}))}><option value="all">Alle Abteilungen</option>{departments.map(item => <option key={item}>{item}</option>)}</select></label><label><span>Position</span><input value={filters.position} onChange={event => setFilters(old => ({...old, position:event.target.value}))} /></label><label><span>Schulung / Zertifikat</span><input value={filters.training} onChange={event => setFilters(old => ({...old, training:event.target.value}))} /></label><label><span>Status</span><select value={filters.status} onChange={event => setFilters(old => ({...old, status:event.target.value}))}><option value="all">Alle</option><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option></select></label><label><span>Ausstellungsdatum ab</span><input type="date" value={filters.issuedFrom} onChange={event => setFilters(old => ({...old, issuedFrom:event.target.value}))} /></label><label><span>Ablaufdatum bis</span><input type="date" value={filters.expiresTo} onChange={event => setFilters(old => ({...old, expiresTo:event.target.value}))} /></label><label><span>Ablauf innerhalb von</span><select value={filters.expiryWindow} onChange={event => setFilters(old => ({...old, expiryWindow:event.target.value}))}><option value="all">Alle</option><option value="30">30 Tagen</option><option value="60">60 Tagen</option><option value="90">90 Tagen</option></select></label><label><span>Dokument</span><select value={filters.document} onChange={event => setFilters(old => ({...old, document:event.target.value}))}><option value="all">Alle</option><option value="available">Vorhanden</option><option value="missing">Fehlt</option></select></label><label><span>Freigabe</span><select value={filters.release} onChange={event => setFilters(old => ({...old, release:event.target.value}))}><option value="all">Alle</option><option value="released">Freigegeben</option><option value="blocked">Nicht freigegeben</option></select></label><label className="emp-checkline"><input type="checkbox" checked={filters.planned} onChange={event => setFilters(old => ({...old, planned:event.target.checked}))} />Verlängerung geplant</label><label className="emp-checkline"><input type="checkbox" checked={filters.archived} onChange={event => setFilters(old => ({...old, archived:event.target.checked}))} />Archivierte Einträge anzeigen</label></main><footer><button onClick={resetFilters}>Filter zurücksetzen</button><button onClick={() => setFilterPanelOpen(false)}>Filter schließen</button><button className="btn btn--primary" onClick={() => setFilterPanelOpen(false)}>Filter anwenden</button></footer></aside></div>}
      {assignOpen && <div className="emp-picker-backdrop" onClick={() => setAssignOpen(false)}><section className="emp-assign-modal" onClick={event => event.stopPropagation()}><header><div><span>Schulungen</span><h2>Schulung zuordnen</h2></div><button onClick={() => setAssignOpen(false)}>×</button></header><main><fieldset><legend>1. Mitarbeiter</legend><label><span>Auswahl</span><select defaultValue={scope}><option value={scope}>{currentScopeLabel}</option><option value="multi">Mehrere Mitarbeiter auswählen</option><option value="department">Ganze Abteilung auswählen</option><option value="group">Mitarbeitergruppe auswählen</option></select></label></fieldset><fieldset><legend>2. Schulung oder Zertifikat</legend><label><span>Schulung aus Liste</span><select><option>Erste Hilfe</option><option>Brandschutzhelfer</option><option>SCC 016</option><option>SCC 017</option><option>Gabelstaplerschein</option><option>PSA gegen Absturz</option></select></label><label><span>Neue Bezeichnung</span><input placeholder="Manuell eintragen" /></label><label><span>Kategorie</span><select><option>Sicherheit</option><option>SCC</option><option>DVGW</option><option>Fahrerlaubnis</option></select></label><label className="is-wide"><span>Beschreibung</span><textarea /></label></fieldset><fieldset><legend>3. Nachweisdaten</legend><label><span>Ausstellungsdatum</span><input type="date" /></label><label><span>Ablaufdatum</span><input type="date" /></label><label><span>Gültigkeitsdauer</span><input placeholder="z.B. 24 Monate" /></label><label><span>Zertifikatsnummer</span><input /></label><label><span>Ausstellende Stelle</span><input /></label><label><span>Status</span><select><option>Gültig</option><option>Läuft bald ab</option><option>Abgelaufen</option><option>Dokument fehlt</option></select></label><label className="emp-checkline"><input type="checkbox" defaultChecked />Freigabe für Mitarbeiter</label><label><span>Verantwortliche Person</span><input defaultValue="Sabine Janning" /></label></fieldset><fieldset><legend>4. Dokumente</legend><label><span>Zertifikat PDF</span><input type="file" /></label><label><span>Vorderseite</span><input type="file" /></label><label><span>Rückseite</span><input type="file" /></label><label><span>Weitere Anlage</span><input type="file" /></label><label className="is-wide"><span>Bemerkung</span><textarea /></label></fieldset></main><footer><button onClick={() => setAssignOpen(false)}>Abbrechen</button><button className="btn btn--primary" onClick={() => setAssignOpen(false)}>Schulung zuordnen</button></footer></section></div>}
    </div>
  );
}

function EmployeeTrainingRecord({ emp, record, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [docs, setDocs] = React.useState([`${record.name.replace(/\s+/g,'_')}_Zertifikat.pdf`,'Teilnahmebescheinigung_Janning_Tiefbau_GmbH.pdf'].slice(0,record.documents));
  const [form, setForm] = React.useState({...record, validity:'09.09.2026 – Nächste Schulung'});
  const set = (key,val) => setForm(old => ({...old,[key]:val}));
  const displayEmp = form.employee || emp;
  const statusName = form.status === 'valid' ? 'Gültig' : form.status === 'warn' ? 'Läuft bald ab' : 'Abgelaufen';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${displayEmp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>} />
    <section className="emp-training-record-card">
      <header className="emp-training-record-hero">
        <span className="emp-training-record-icon"><Icon name="cap" size={27} stroke={1.8}/></span>
        <div><span>Zertifikat / Schulung</span><h2>{form.name}</h2></div>
        <span className={'emp-status is-' + form.status}>{statusName}</span>
      </header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Mitarbeiter" icon="users" value={displayEmp.name}/>
        <TrainingRecordField label="Firma" icon="building" value={window.company(displayEmp.company)?.name || displayEmp.company}/>
        <TrainingRecordField label="Abteilung / Position" icon="flag" value={`${displayEmp.department} · ${displayEmp.position}`}/>
        <TrainingRecordField label="Zertifikat / Schulung" icon="cap" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Kategorie" icon="doc" editing={editing} value={form.category || '-'}><input value={form.category || ''} onChange={e=>set('category',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Pflicht / Optional" icon="shield" editing={editing} value={form.mandatory || '-'}><select value={form.mandatory || 'Pflicht'} onChange={e=>set('mandatory',e.target.value)}><option>Pflicht</option><option>Optional</option></select></TrainingRecordField>
        <TrainingRecordField label="Ausstellungsdatum" icon="cal" editing={editing} value={form.issued}><input value={form.issued} onChange={e=>set('issued',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ablaufdatum" icon="cal" editing={editing} value={form.expires}><input value={form.expires} onChange={e=>set('expires',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restlaufzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage überzogen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Anbieter" icon="building" editing={editing} value={form.provider || '-'}><input value={form.provider || ''} onChange={e=>set('provider',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Verantwortliche Person" icon="users" editing={editing} value={form.responsible || '-'}><input value={form.responsible || ''} onChange={e=>set('responsible',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültigkeit" icon="cal" editing={editing} value={form.validity} wide><input value={form.validity} onChange={e=>set('validity',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Frühere Nachweise" icon="history" value={form.history || '-'} />
        <TrainingRecordField label="Zugehöriger Schulungstermin" icon="cal" value={form.appointment || '-'} />
        <TrainingRecordField label="Änderungshistorie" icon="clock" value={form.changed || '-'} wide />
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="3" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc} title={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div>
          <label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div>
        </div>
      </div>
      {editing && <footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function TrainingRecordField({label,icon,editing=false,value,wide=false,children}) {
  return <div className={'emp-training-record-field'+(wide?' is-wide':'')}><Icon name={icon} size={20}/><div><label>{label}</label>{editing?children:<strong>{value}</strong>}</div></div>;
}

function employeeInstructionRecords(emp) {
  const personalStatuses = ['Bestätigt','Offen','Eingeladen','Teilgenommen','Nicht teilgenommen','Wiederholung erforderlich','Vorgemerkt'];
  return window.SEED.instructions.map((instruction, index) => {
    const participant = instruction.participants?.find(item => item.emp === emp.id);
    const personalStatus = participant?.signed ? 'Bestätigt' : personalStatuses[index % personalStatuses.length];
    const status = instruction.status === 'archiviert' ? 'archived' : ['Offen','Nicht teilgenommen','Wiederholung erforderlich'].includes(personalStatus) ? 'open' : 'done';
    return {
      id:`${emp.id}-${instruction.id}`,
      instructionId:instruction.id,
      employeeId:emp.id,
      employee:emp,
      employeeName:`${emp.lastName}, ${emp.firstName}`,
      employeeStatus:personalStatus,
      confirmation:personalStatus === 'Bestätigt' ? `bestätigt am ${participant?.date ? window.fmtDE(participant.date) : window.fmtDE(instruction.date)}` : index === 1 ? 'Unterschrift fehlt' : 'Nachweis offen',
      remark:status === 'open' ? 'Offen seit ' + window.fmtDE(instruction.date) : 'Teilnahme vollständig dokumentiert',
      company:window.company(instruction.company)?.name || '-',
      companyShort:window.company(emp.company)?.short || emp.company,
      department:emp.department,
      position:emp.position,
      date:window.fmtDE(instruction.date),
      instructor:instruction.instructor,
      group:instruction.group,
      participants:instruction.participants.length,
      status,
      released:index !== 1,
      releaseScope:index === 2 ? 'nur für Teilnehmer' : index === 3 ? 'nur für Führungskräfte' : (index !== 1 ? 'freigegeben' : 'nicht freigegeben'),
      version:instruction.version,
      history:instruction.history,
      description:instruction.description,
      explanation:instruction.explanation,
      document:instruction.document,
      documents:instruction.document ? 1 : 0,
      documentMissing:index === 4,
      name:instruction.title,
    };
  });
}

function EmployeeInstructionArea({ emp, onBack, onOpen }) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeInstructionView') || 'list');
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [filterPanelOpen,setFilterPanelOpen]=React.useState(false);
  const [createOpen,setCreateOpen]=React.useState(false);
  const [rowActionMenu,setRowActionMenu]=React.useState(null);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeGroupFilter,setEmployeeGroupFilter]=React.useState('all');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('aktiv');
  const [filters,setFilters]=React.useState({
    employee:'', company:'all', department:'all', position:'', name:'', instructor:'',
    participantStatus:'all', status:'all', dateFrom:'', dateTo:'', confirmation:'',
    document:'all', release:'all', archived:false,
  });
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope==='active') return sourceEmployees.filter(item=>item.status==='aktiv');
    if(scope==='inactive') return sourceEmployees.filter(item=>item.status!=='aktiv');
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope === 'all' || scope === 'active' || scope === 'inactive' || scope.startsWith('company:');
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const records = React.useMemo(() => activeEmployees.flatMap(employeeInstructionRecords), [activeEmployees]);
  const [selected, setSelected] = React.useState(new Set());
  const [sort, setSort] = React.useState({key:'name',dir:'asc'});
  const [menu, setMenu] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [group, setGroup] = React.useState('');
  const defaultHiddenColumns = React.useMemo(() => new Set(['company','group','released','history','description']), []);
  const [hiddenColumns,setHiddenColumns]=React.useState(defaultHiddenColumns);
  const labels = {done:'Durchgeführt',open:'Offen',archived:'Archiviert',documentMissing:'Dokument fehlt'};
  const departments=[...new Set(sourceEmployees.map(item=>item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const groups=[...new Set(sourceEmployees.map(item=>item.group || (item.position?.toLowerCase().includes('azubi')?'Azubi':item.position?.toLowerCase().includes('kaufm')?'Angestellte':'Gewerbliche')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const currentScopeLabel=scope==='all'?'Alle Mitarbeiter':scope==='active'?'Aktive Mitarbeiter':scope==='inactive'?'Inaktive Mitarbeiter':scope.startsWith('company:')?(window.company(scope.replace('company:',''))?.name || 'Firma'):(sourceEmployees.find(item=>item.id===scope)?.name || emp.name);
  const activeFilterCount=[filters.employee,filters.company!=='all',filters.department!=='all',filters.position,filters.name,filters.instructor,filters.participantStatus!=='all',filters.status!=='all',filters.dateFrom,filters.dateTo,filters.confirmation,filters.document!=='all',filters.release!=='all',filters.archived].filter(Boolean).length;
  const resetFilters=()=>setFilters({employee:'',company:'all',department:'all',position:'',name:'',instructor:'',participantStatus:'all',status:'all',dateFrom:'',dateTo:'',confirmation:'',document:'all',release:'all',archived:false});
  const value = (row,key) => key === 'status' ? labels[row.status] : key === 'history' ? row.version : row[key];
  const dateValue=row => {
    const parts = String(row.date || '').split('.');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
  };
  const filterRow=row=>{
    if(filter === 'documentMissing') return row.documentMissing;
    if(filter !== 'all' && row.status !== filter) return false;
    return true;
  };
  const panelFilterRow=row=>{
    const employeeText=`${row.employeeName} ${row.employee.personalNr || ''}`.toLowerCase();
    if(filters.employee && !employeeText.includes(filters.employee.toLowerCase())) return false;
    if(filters.company !== 'all' && row.employee.company !== filters.company) return false;
    if(filters.department !== 'all' && row.department !== filters.department) return false;
    if(filters.position && !row.position.toLowerCase().includes(filters.position.toLowerCase())) return false;
    if(filters.name && !row.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if(filters.instructor && !row.instructor.toLowerCase().includes(filters.instructor.toLowerCase())) return false;
    if(filters.participantStatus !== 'all' && row.employeeStatus !== filters.participantStatus) return false;
    if(filters.status !== 'all' && row.status !== filters.status) return false;
    if(filters.dateFrom && dateValue(row) && dateValue(row) < filters.dateFrom) return false;
    if(filters.dateTo && dateValue(row) && dateValue(row) > filters.dateTo) return false;
    if(filters.confirmation && !row.confirmation.toLowerCase().includes(filters.confirmation.toLowerCase())) return false;
    if(filters.document === 'missing' && !row.documentMissing) return false;
    if(filters.document === 'available' && row.documentMissing) return false;
    if(filters.release === 'released' && !row.released) return false;
    if(filters.release === 'blocked' && row.released) return false;
    if(!filters.archived && row.status === 'archived') return false;
    return true;
  };
  let rows = records.filter(filterRow).filter(panelFilterRow);
  rows = [...rows].sort((a,b) => (sort.dir === 'asc' ? 1 : -1) * String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle = id => setSelected(current => { const next=new Set(current); next.has(id)?next.delete(id):next.add(id); return next; });
  const baseColumns = [
    ...(isAllView ? [['employeeName','Mitarbeiter']] : []),
    ['name','Unterweisung'],['date','Datum'],['instructor','Unterweisender'],['employeeStatus','Teilnahmestatus'],['confirmation','Ergebnis / Bestätigung'],['status','Status'],['documents','Dokument'],['actions','Aktionen'],
    ['company','Firma'],['group','Gruppe / Abteilung'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key));
  const tabLabels={ all:`Alle ${records.length}`, done:`Durchgeführt ${records.filter(row=>row.status==='done').length}`, open:`Offen ${records.filter(row=>row.status==='open').length}`, documentMissing:`Dokument fehlt ${records.filter(row=>row.documentMissing).length}`, archived:`Archiviert ${records.filter(row=>row.status==='archived').length}` };
  const pickerEmployees=sourceEmployees.filter(item=>{
    const text=`${item.lastName}, ${item.firstName} ${item.personalNr}`.toLowerCase();
    const groupName=item.group || (item.position?.toLowerCase().includes('azubi')?'Azubi':item.position?.toLowerCase().includes('kaufm')?'Angestellte':'Gewerbliche');
    if(employeeSearch && !text.includes(employeeSearch.toLowerCase())) return false;
    if(employeeCompanyFilter !== 'all' && item.company !== employeeCompanyFilter) return false;
    if(employeeDepartmentFilter !== 'all' && item.department !== employeeDepartmentFilter) return false;
    if(employeePositionFilter && !item.position.toLowerCase().includes(employeePositionFilter.toLowerCase())) return false;
    if(employeeGroupFilter !== 'all' && groupName !== employeeGroupFilter) return false;
    if(employeeStatusFilter !== 'all' && item.status !== employeeStatusFilter) return false;
    return true;
  }).slice().sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
  const setMode=mode=>{setViewMode(mode);localStorage.setItem('employeeInstructionView',mode);};
  const cellValue=(row,key)=>{
    if(key==='status') return <span className={'emp-status is-'+row.status}>{labels[row.status]}</span>;
    if(key==='released') return <span className="emp-release" title={row.releaseScope}>{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='history') return <span className="emp-version-chip"><Icon name="history" size={13}/>{row.version}</span>;
    if(key==='documents') return <span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'fehlt':row.documents}</span>;
    if(key==='actions') return <div className="emp-row-actions" onClick={event=>event.stopPropagation()}><button className="emp-row-menu-btn" onClick={()=>setRowActionMenu(rowActionMenu===row.id?null:row.id)}>⋮</button>{rowActionMenu===row.id && <div className="emp-row-action-menu">{['Details anzeigen','Bearbeiten','Teilnehmer verwalten','Teilnahme bestätigen','Dokument öffnen','Dokument hochladen','Dokument ersetzen','Neue Version anlegen','Wiederholung planen','Freigabe ändern','Duplizieren','Archivieren','Löschen'].map(label=><button key={label} onClick={()=>{ if(label==='Details anzeigen' || label==='Bearbeiten') onOpen(row); setRowActionMenu(null); }}>{label}</button>)}</div>}</div>;
    if(key==='employeeName'||key==='name') return <strong>{row[key]}</strong>;
    return row[key];
  };

  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Unterweisungen - alle Mitarbeiter':`Unterweisungen (${currentEmployee.name})`} onBack={onBack} action={
      <div className="emp-training-toolbar">
        <button type="button" className="emp-current-picker-btn" onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {currentScopeLabel}</button>
        <button type="button" onClick={()=>setFilterPanelOpen(true)}><Icon name="settings" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button>
        <span className="emp-view-toggle"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setMode('cards')}><Icon name="dashboard" size={14}/>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setMode('list')}><Icon name="doc" size={14}/>Liste</button></span>
        <button type="button" onClick={()=>setCreateOpen(true)}><Icon name="plus" size={14}/>Unterweisung</button>
      </div>
    } />
    <div className="emp-training-tabs">
      {['all','done','open','documentMissing','archived'].map(id => <button key={id} className={filter===id?'is-active':''} onClick={() => setFilter(id)}>{tabLabels[id]}</button>)}
      {group && <button className="emp-clear-group" onClick={() => setGroup('')}>Gruppierung aufheben</button>}
      {hiddenColumns.size>0 && <button className="emp-clear-group" onClick={()=>setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}
    </div>
    {activeFilterCount>0 && <div className="emp-active-filter-chips">{filters.company!=='all' && <button onClick={()=>setFilters(old=>({...old,company:'all'}))}>Firma: {window.company(filters.company)?.short || filters.company} ×</button>}{filters.status!=='all' && <button onClick={()=>setFilters(old=>({...old,status:'all'}))}>Status: {labels[filters.status]} ×</button>}{filters.document!=='all' && <button onClick={()=>setFilters(old=>({...old,document:'all'}))}>Dokument {filters.document==='missing'?'fehlt':'vorhanden'} ×</button>}{filters.name && <button onClick={()=>setFilters(old=>({...old,name:''}))}>Unterweisung: {filters.name} ×</button>}</div>}
    {selected.size>0 && <div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="check" size={14}/>Als durchgeführt markieren</button><button><Icon name="edit" size={14}/>Teilnahme bestätigen</button><button><Icon name="shield" size={14}/>Freigabe ändern</button><button><Icon name="download" size={14}/>Dokumente herunterladen</button><button><Icon name="mail" size={14}/>Erinnerung senden</button><button><Icon name="clock" size={14}/>Wiederholung planen</button><button className="is-danger"><Icon name="trash" size={14}/>Archivieren</button></div>}
    {viewMode==='cards' && <div className="emp-instruction-card-grid">{rows.map(row=><article key={row.id} className={'emp-instruction-card is-'+row.status} onClick={()=>onOpen(row)}><header><div><span>{row.date}</span><h3>{row.name}</h3></div><button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button></header><p>{isAllView ? row.employeeName : row.company}</p><dl><div><dt>Unterweisender</dt><dd>{row.instructor}</dd></div><div><dt>Teilnahmestatus</dt><dd>{row.employeeStatus}</dd></div><div><dt>Status</dt><dd>{cellValue(row,'status')}</dd></div><div><dt>Dokument</dt><dd>{cellValue(row,'documents')}</dd></div></dl></article>)}</div>}
    {viewMode==='list' && <div className="emp-table-wrap"><table className="emp-instruction-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length>0 && selected.size===rows.length} onChange={() => setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>
        {columns.map(([key,label]) => <th key={key}><button onClick={() => setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>
          {menu===key && <div className="emp-column-menu"><button onClick={() => {setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={() => {setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={() => setMenu(null)}>Filtern nach</button><button onClick={() => {setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={() => {setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button><button onClick={() => setMenu(null)}>Spalten verwalten</button><button onClick={() => {setHiddenColumns(defaultHiddenColumns);setMenu(null);}}>Standardansicht wiederherstellen</button></div>}
        </th>)}</tr></thead>
      <tbody>{rows.map((row,index) => <React.Fragment key={row.id}>
        {group && (index===0 || value(rows[index-1],group)!==value(row,group)) && <tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='open'?'is-open':''} onClick={() => onOpen(row)}>
          <td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)}/></td>
          {columns.map(([key])=><td key={key} className={key==='description'?'emp-ellipsis':''}>{cellValue(row,key)}</td>)}
        </tr>
      </React.Fragment>)}</tbody>
    </table></div>}
    {employeePickerOpen && <div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Unterweisungen</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters emp-picker-filters--instructions"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeGroupFilter} onChange={event=>setEmployeeGroupFilter(event.target.value)}><option value="all">Alle Gruppen</option>{groups.map(item=><option key={item}>{item}</option>)}</select><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Inaktiv</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);setSelected(new Set());}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);setSelected(new Set());}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterPanelOpen && <div className="emp-training-filter-shell" onClick={()=>setFilterPanelOpen(false)}><aside className="emp-training-filter-panel" onClick={event=>event.stopPropagation()}><header><div><span>Unterweisungen</span><h2>Filter</h2></div><button onClick={()=>setFilterPanelOpen(false)}>×</button></header><main><label><span>Mitarbeiter</span><input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))} placeholder="Name oder PN"/></label><label><span>Firma</span><select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label><span>Abteilung</span><select value={filters.department} onChange={event=>setFilters(old=>({...old,department:event.target.value}))}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label><span>Position</span><input value={filters.position} onChange={event=>setFilters(old=>({...old,position:event.target.value}))}/></label><label><span>Name der Unterweisung</span><input value={filters.name} onChange={event=>setFilters(old=>({...old,name:event.target.value}))}/></label><label><span>Unterweisender</span><input value={filters.instructor} onChange={event=>setFilters(old=>({...old,instructor:event.target.value}))}/></label><label><span>Teilnahmestatus</span><select value={filters.participantStatus} onChange={event=>setFilters(old=>({...old,participantStatus:event.target.value}))}><option value="all">Alle</option>{['Eingeladen','Vorgemerkt','Teilgenommen','Bestätigt','Nicht teilgenommen','Wiederholung erforderlich','Offen'].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Status der Unterweisung</span><select value={filters.status} onChange={event=>setFilters(old=>({...old,status:event.target.value}))}><option value="all">Alle</option><option value="open">Offen</option><option value="done">Durchgeführt</option><option value="archived">Archiviert</option></select></label><label><span>Unterweisungsdatum von</span><input type="date" value={filters.dateFrom} onChange={event=>setFilters(old=>({...old,dateFrom:event.target.value}))}/></label><label><span>Unterweisungsdatum bis</span><input type="date" value={filters.dateTo} onChange={event=>setFilters(old=>({...old,dateTo:event.target.value}))}/></label><label><span>Ergebnis / Bestätigung</span><input value={filters.confirmation} onChange={event=>setFilters(old=>({...old,confirmation:event.target.value}))}/></label><label><span>Dokument</span><select value={filters.document} onChange={event=>setFilters(old=>({...old,document:event.target.value}))}><option value="all">Alle</option><option value="available">Vorhanden</option><option value="missing">Fehlt</option></select></label><label><span>Freigabe</span><select value={filters.release} onChange={event=>setFilters(old=>({...old,release:event.target.value}))}><option value="all">Alle</option><option value="released">Freigegeben</option><option value="blocked">Nicht freigegeben</option></select></label><label className="emp-checkline"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Einträge anzeigen</label></main><footer><button onClick={resetFilters}>Filter zurücksetzen</button><button onClick={()=>setFilterPanelOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterPanelOpen(false)}>Filter anwenden</button></footer></aside></div>}
    {createOpen && <div className="emp-picker-backdrop" onClick={()=>setCreateOpen(false)}><section className="emp-assign-modal emp-instruction-create-modal" onClick={event=>event.stopPropagation()}><header><div><span>Unterweisungen</span><h2>Unterweisung erstellen</h2></div><button onClick={()=>setCreateOpen(false)}>×</button></header><main><fieldset><legend>1. Grunddaten</legend><label><span>Name der Unterweisung *</span><input/></label><label><span>Firma *</span><select>{window.SEED.companies.map(company=><option key={company.id}>{company.name}</option>)}</select></label><label><span>Unterweisungsdatum *</span><input type="date"/></label><label><span>Unterweisender *</span><input/></label><label><span>Unterweisungsart *</span><select>{['Jahresunterweisung','Erstunterweisung','Baustellenunterweisung','projektbezogene Unterweisung','tätigkeitsbezogene Unterweisung','Betriebsanweisung','sonstige Unterweisung'].map(item=><option key={item}>{item}</option>)}</select></label><label className="is-wide"><span>Beschreibung</span><textarea/></label></fieldset><fieldset><legend>2. Teilnehmer</legend><label><span>Teilnehmer oder Gruppe *</span><select><option>Einzelne Mitarbeiter auswählen</option><option>Abteilung auswählen</option><option>Mitarbeitergruppe auswählen</option><option>Alle Mitarbeiter einer Firma</option></select></label><label><span>Abteilung / Gruppe</span><select><option>Alle</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label><span>Mindestteilnehmerzahl</span><input type="number"/></label><label><span>Maximale Teilnehmerzahl</span><input type="number"/></label><p className="emp-form-summary">12 Mitarbeiter wurden ausgewählt.</p></fieldset><fieldset><legend>3. Inhalte und Durchführung</legend><label><span>Thema / Inhalt *</span><input/></label><label><span>Version *</span><input defaultValue="1.0"/></label><label><span>Wiederholungsintervall</span><input/></label><label><span>Nächster Wiederholungstermin</span><input type="date"/></label><label><span>Ort</span><input/></label><label><span>Beginn</span><input type="time"/></label><label><span>Ende</span><input type="time"/></label><label className="is-wide"><span>Durchführung / Erklärung</span><textarea/></label></fieldset><fieldset><legend>4. Teilnahme und Bestätigung</legend><label><span>Teilnahmestatus *</span><select>{['Vorgemerkt','Eingeladen','Teilgenommen','Bestätigt','Nicht teilgenommen','Wiederholung erforderlich','Offen'].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Ergebnis / Bestätigung</span><select>{['Teilnahme bestätigt','Nachweis offen','bestanden','nicht bestanden','Wiederholung erforderlich'].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Bestätigungsdatum</span><input type="date"/></label><label className="emp-checkline"><input type="checkbox" defaultChecked/>Freigabe für Mitarbeiter *</label><label className="emp-checkline"><input type="checkbox"/>Unterschrift erforderlich</label><label className="emp-checkline"><input type="checkbox"/>Nachweis erforderlich</label></fieldset><fieldset><legend>5. Dokumente</legend><label><span>Unterweisungsdokument</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></label><label><span>Teilnehmernachweis</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></label><label><span>Präsentation</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></label><label><span>Betriebsanweisung</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></label><label className="is-wide"><span>Weitere Anlagen</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></label></fieldset><fieldset><legend>6. Zusammenfassung</legend><div className="emp-create-summary"><strong>Unterweisung</strong><span>Jahresunterweisung Tiefbau</span><strong>Teilnehmer</strong><span>12 Mitarbeiter</span><strong>Version</strong><span>1.0</span><strong>Freigabe</strong><span>für Mitarbeiter freigegeben</span></div></fieldset></main><footer><button onClick={()=>setCreateOpen(false)}>Abbrechen</button><button>Als Entwurf speichern</button><button className="btn btn--primary" onClick={()=>setCreateOpen(false)}>Unterweisung erstellen</button></footer></section></div>}
  </div>;
}

function EmployeeInstructionRecord({ emp, record, onBack }) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState(record.document?[record.document]:[]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const displayEmp=form.employee || emp;
  const statusName=form.status==='done'?'Durchgeführt':form.status==='open'?'Offen':'Archiviert';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${displayEmp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card">
      <header className="emp-training-record-hero">
        <span className="emp-training-record-icon emp-instruction-record-icon"><Icon name="flag" size={27} stroke={1.8}/></span>
        <div><span>Unterweisung</span><h2>{form.name}</h2></div>
        <span className={'emp-status is-'+form.status}>{statusName}</span>
      </header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Mitarbeiter" icon="users" value={displayEmp.name}/>
        <TrainingRecordField label="Firma" icon="building" value={window.company(displayEmp.company)?.name || displayEmp.company}/>
        <TrainingRecordField label="Abteilung / Position" icon="flag" value={`${displayEmp.department} · ${displayEmp.position}`}/>
        <TrainingRecordField label="Name Unterweisung" icon="flag" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Firma" icon="building" editing={editing} value={form.company}><input value={form.company} onChange={e=>set('company',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Durchgeführt" icon="cal" editing={editing} value={form.date}><input value={form.date} onChange={e=>set('date',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Unterweisender" icon="users" editing={editing} value={form.instructor}><input value={form.instructor} onChange={e=>set('instructor',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gruppe / Abteilung" icon="users" editing={editing} value={form.group}><input value={form.group} onChange={e=>set('group',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Zahl Teilnehmer" icon="users" editing={editing} value={form.participants}><input type="number" value={form.participants} onChange={e=>set('participants',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Persönlicher Teilnahmestatus" icon="check" editing={editing} value={form.employeeStatus || '-'}><select value={form.employeeStatus || 'Offen'} onChange={e=>set('employeeStatus',e.target.value)}><option>Vorgemerkt</option><option>Offen</option><option>Eingeladen</option><option>Teilgenommen</option><option>Bestätigt</option><option>Nicht teilgenommen</option><option>Wiederholung erforderlich</option><option>Archiviert</option></select></TrainingRecordField>
        <TrainingRecordField label="Ergebnis / Bestätigung" icon="doc" editing={editing} value={form.confirmation || '-'}><input value={form.confirmation || ''} onChange={e=>set('confirmation',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="done">Durchgeführt</option><option value="open">Offen</option><option value="archived">Archiviert</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Freigabeumfang" icon="shield" value={form.releaseScope || '-'}/>
        <TrainingRecordField label="Versionshistorie" icon="history" editing={editing} value={`${form.version} · ${form.history.length} Versionen`} wide><input value={form.version} onChange={e=>set('version',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Bemerkung" icon="doc" editing={editing} value={form.remark || '-'} wide><textarea rows="2" value={form.remark || ''} onChange={e=>set('remark',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="3" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Durchführung / Erklärung" icon="doc" editing={editing} value={form.explanation} wide><textarea rows="3" value={form.explanation} onChange={e=>set('explanation',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>
      {editing && <footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeJobRecords(emp) {
  return [
    {baseId:'job-1',name:`Stellenbeschreibung ${emp.position}`,functionName:emp.position,version:'v3.1',validFrom:'12.01.2026',created:'12.01.2026',handed:'13.01.2026',deadline:'27.01.2026',signed:'18.01.2026',status:'signed',released:true,history:3,description:`Aufgaben, Befugnisse und Verantwortlichkeiten für die Position ${emp.position}.`,document:`Stellenbeschreibung_${emp.position}_v3.1.pdf`},
    {baseId:'job-2',name:'Zusatzfunktion Sicherheitsbeauftragter',functionName:'Sicherheitsbeauftragter',version:'v1.2',validFrom:'08.03.2026',created:'08.03.2026',handed:'10.03.2026',deadline:'24.03.2026',signed:'-',status:'open',released:false,history:2,description:'Ergänzende Aufgaben im Arbeits- und Gesundheitsschutz.',document:'Zusatzfunktion_Sicherheitsbeauftragter_v1.2.pdf'},
    {baseId:'job-3',name:'Vertretungsregelung Bauleitung',functionName:'Vertretung Bauleitung',version:'v2.0',validFrom:'14.09.2025',created:'14.09.2025',handed:'16.09.2025',deadline:'30.09.2025',signed:'22.09.2025',status:'signed',released:true,history:4,description:'Regelung zur Vertretung und Freigabe bei Abwesenheit der Bauleitung.',document:'Vertretungsregelung_Bauleitung_v2.0.pdf'},
  ].map((row,index) => {
    const status = index === 1 && emp.status === 'aktiv' ? 'open' : row.status;
    return {
      ...row,
      id:`${emp.id}-${row.baseId}`,
      employeeId:emp.id,
      employee:emp,
      employeeName:`${emp.lastName}, ${emp.firstName}`,
      company:window.company(emp.company)?.name || emp.company,
      companyShort:window.company(emp.company)?.short || emp.company,
      department:emp.department,
      position:emp.position,
      status,
      signatureStatus:status === 'signed' ? 'Unterschrieben' : index === 1 ? 'Unterschrift seit 10 Tagen offen' : 'Zugeordnet',
      confirmation:status === 'signed' ? 'handschriftlich bestätigt' : 'Unterschriftsnachweis fehlt',
      newVersion:index === 1,
      overdue:index === 1,
      remark:status === 'signed' ? 'Persönliche Bestätigung liegt vor.' : 'Unterschrift noch offen.',
    };
  });
}

function EmployeeJobArea({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeJobView') || 'list');
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [filterPanelOpen,setFilterPanelOpen]=React.useState(false);
  const [createOpen,setCreateOpen]=React.useState(false);
  const [rowActionMenu,setRowActionMenu]=React.useState(null);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('aktiv');
  const [filters,setFilters]=React.useState({
    employee:'', company:'all', department:'all', position:'', name:'', functionName:'',
    version:'', status:'all', validFrom:'', handedFrom:'', handedTo:'', deadline:'',
    overdue:false, document:'all', newVersion:false, archived:false,
  });
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope==='active') return sourceEmployees.filter(item=>item.status==='aktiv');
    if(scope==='inactive') return sourceEmployees.filter(item=>item.status!=='aktiv');
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope==='all'||scope==='active'||scope==='inactive'||scope.startsWith('company:')||scope.startsWith('department:');
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeJobRecords),[activeEmployees]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'name',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const defaultHiddenColumns=React.useMemo(()=>new Set(['validFrom','created','released','history','description','company','deadline']),[]);
  const [hiddenColumns,setHiddenColumns]=React.useState(defaultHiddenColumns);
  const labels={signed:'Unterschrieben',open:'Unterschrift offen',newVersion:'Neue Version erforderlich',overdue:'Frist überschritten',archived:'Archiviert'};
  const departments=[...new Set(sourceEmployees.map(item=>item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const currentScopeLabel=scope==='all'?'Alle Mitarbeiter':scope==='active'?'Aktive Mitarbeiter':scope==='inactive'?'Inaktive Mitarbeiter':scope.startsWith('company:')?(window.company(scope.replace('company:',''))?.name || 'Firma'):scope.startsWith('department:')?`Abteilung: ${scope.replace('department:','')}`:(sourceEmployees.find(item=>item.id===scope)?.name || emp.name);
  const activeFilterCount=[filters.employee,filters.company!=='all',filters.department!=='all',filters.position,filters.name,filters.functionName,filters.version,filters.status!=='all',filters.validFrom,filters.handedFrom,filters.handedTo,filters.deadline,filters.overdue,filters.document!=='all',filters.newVersion,filters.archived].filter(Boolean).length;
  const resetFilters=()=>setFilters({employee:'',company:'all',department:'all',position:'',name:'',functionName:'',version:'',status:'all',validFrom:'',handedFrom:'',handedTo:'',deadline:'',overdue:false,document:'all',newVersion:false,archived:false});
  const dateValue=value=>{
    const parts=String(value||'').split('.');
    return parts.length===3?`${parts[2]}-${parts[1]}-${parts[0]}`:'';
  };
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.version:row[key];
  const filterRow=row=>{
    if(filter==='newVersion') return row.newVersion;
    if(filter==='overdue') return row.overdue;
    if(filter!=='all' && row.status!==filter) return false;
    return true;
  };
  const panelFilterRow=row=>{
    const employeeText=`${row.employeeName} ${row.employee.personalNr || ''}`.toLowerCase();
    if(filters.employee && !employeeText.includes(filters.employee.toLowerCase())) return false;
    if(filters.company!=='all' && row.employee.company!==filters.company) return false;
    if(filters.department!=='all' && row.department!==filters.department) return false;
    if(filters.position && !row.position.toLowerCase().includes(filters.position.toLowerCase())) return false;
    if(filters.name && !row.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if(filters.functionName && !row.functionName.toLowerCase().includes(filters.functionName.toLowerCase())) return false;
    if(filters.version && !row.version.toLowerCase().includes(filters.version.toLowerCase())) return false;
    if(filters.status!=='all' && row.status!==filters.status) return false;
    if(filters.validFrom && dateValue(row.validFrom) && dateValue(row.validFrom)<filters.validFrom) return false;
    if(filters.handedFrom && dateValue(row.handed) && dateValue(row.handed)<filters.handedFrom) return false;
    if(filters.handedTo && dateValue(row.handed) && dateValue(row.handed)>filters.handedTo) return false;
    if(filters.deadline && dateValue(row.deadline) && dateValue(row.deadline)>filters.deadline) return false;
    if(filters.overdue && !row.overdue) return false;
    if(filters.document==='missing' && row.document) return false;
    if(filters.document==='available' && !row.document) return false;
    if(filters.newVersion && !row.newVersion) return false;
    if(!filters.archived && row.status==='archived') return false;
    return true;
  };
  let rows=records.filter(filterRow).filter(panelFilterRow);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter']]:[]),
    ['name','Stellenbeschreibung'],['functionName','Position / Zusatzfunktion'],['version','Version'],['handed','Ausgehändigt am'],['signed','Unterschrieben am'],['signatureStatus','Unterschriftsstatus'],['document','Dokument'],['actions','Aktionen'],
    ['validFrom','Gültig ab'],['created','Erstellt am'],['deadline','Unterschriftsfrist'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['company','Firma']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key));
  const tabLabels={all:`Alle ${records.length}`,signed:`Unterschrieben ${records.filter(row=>row.status==='signed').length}`,open:`Unterschrift offen ${records.filter(row=>row.status==='open').length}`,newVersion:`Neue Version erforderlich ${records.filter(row=>row.newVersion).length}`,overdue:`Frist überschritten ${records.filter(row=>row.overdue).length}`,archived:'Archiviert'};
  const pickerEmployees=sourceEmployees.filter(item=>{
    const text=`${item.lastName}, ${item.firstName} ${item.personalNr}`.toLowerCase();
    if(employeeSearch && !text.includes(employeeSearch.toLowerCase())) return false;
    if(employeeCompanyFilter!=='all' && item.company!==employeeCompanyFilter) return false;
    if(employeeDepartmentFilter!=='all' && item.department!==employeeDepartmentFilter) return false;
    if(employeePositionFilter && !item.position.toLowerCase().includes(employeePositionFilter.toLowerCase())) return false;
    if(employeeStatusFilter!=='all' && item.status!==employeeStatusFilter) return false;
    return true;
  }).slice().sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
  const setMode=mode=>{setViewMode(mode);localStorage.setItem('employeeJobView',mode);};
  const cellValue=(row,key)=>{
    if(key==='employeeName'||key==='name') return <strong>{row[key]}</strong>;
    if(key==='version') return <span className="emp-version-chip">{row.version}</span>;
    if(key==='status'||key==='signatureStatus') return <span className={'emp-status is-'+row.status}>{key==='status'?labels[row.status]:row.signatureStatus}</span>;
    if(key==='released') return <span className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='history') return <span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Versionen</span>;
    if(key==='document') return <span className={'emp-doc-count '+(!row.document?'is-missing':'')}><Icon name="doc" size={13}/>{row.document?'1':'fehlt'}</span>;
    if(key==='actions') return <div className="emp-row-actions" onClick={event=>event.stopPropagation()}><button className="emp-row-menu-btn" onClick={()=>setRowActionMenu(rowActionMenu===row.id?null:row.id)}>⋮</button>{rowActionMenu===row.id&&<div className="emp-row-action-menu">{['Details anzeigen','Bearbeiten','PDF öffnen','PDF herunterladen','Unterschrift erfassen','Unterschriftsnachweis hochladen','Erinnerung senden','Neue Version zuordnen','Freigabe ändern','Duplizieren','Archivieren','Löschen'].map(label=><button key={label} onClick={()=>{if(label==='Details anzeigen'||label==='Bearbeiten') onOpen(row);setRowActionMenu(null);}}>{label}</button>)}</div>}</div>;
    return row[key];
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Stellenbeschreibungen - alle Mitarbeiter':`Stellenbeschreibungen (${currentEmployee.name})`} onBack={onBack} action={
      <div className="emp-training-toolbar">
        <button type="button" className="emp-current-picker-btn" onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {currentScopeLabel}</button>
        <button type="button" onClick={()=>setFilterPanelOpen(true)}><Icon name="settings" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button>
        <span className="emp-view-toggle"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setMode('cards')}><Icon name="dashboard" size={14}/>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setMode('list')}><Icon name="doc" size={14}/>Liste</button></span>
        <button type="button" onClick={()=>setCreateOpen(true)}><Icon name="plus" size={14}/>Stellenbeschreibung zuordnen</button>
      </div>
    }/>
    <div className="emp-training-tabs">{['all','signed','open','newVersion','overdue','archived'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}</div>
    {activeFilterCount>0&&<div className="emp-active-filter-chips">{filters.company!=='all'&&<button onClick={()=>setFilters(old=>({...old,company:'all'}))}>Firma: {window.company(filters.company)?.short || filters.company} ×</button>}{filters.status!=='all'&&<button onClick={()=>setFilters(old=>({...old,status:'all'}))}>Status: {labels[filters.status]} ×</button>}{filters.overdue&&<button onClick={()=>setFilters(old=>({...old,overdue:false}))}>Frist überschritten ×</button>}{filters.name&&<button onClick={()=>setFilters(old=>({...old,name:''}))}>Stellenbeschreibung: {filters.name} ×</button>}</div>}
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="mail" size={14}/>Erinnerung senden</button><button><Icon name="history" size={14}/>Neue Version zuordnen</button><button><Icon name="shield" size={14}/>Freigabe ändern</button><button><Icon name="download" size={14}/>Dokumente herunterladen</button><button><Icon name="users" size={14}/>Verantwortliche Person ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Archivieren</button></div>}
    {viewMode==='cards'&&<div className="emp-instruction-card-grid emp-job-card-grid">{rows.map(row=><article key={row.id} className={'emp-instruction-card emp-job-card is-'+row.status} onClick={()=>onOpen(row)}><header><div><span>{row.version} · gültig ab {row.validFrom}</span><h3>{row.name}</h3></div><button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button></header><p>{isAllView?row.employeeName:row.functionName}</p><dl><div><dt>Position</dt><dd>{row.functionName}</dd></div><div><dt>Unterschrift</dt><dd>{row.signatureStatus}</dd></div><div><dt>Frist</dt><dd>{row.deadline}</dd></div><div><dt>Dokument</dt><dd>{cellValue(row,'document')}</dd></div></dl></article>)}</div>}
    {viewMode==='list'&&<div className="emp-table-wrap"><table className="emp-job-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button><button onClick={()=>setMenu(null)}>Spalten verwalten</button><button onClick={()=>{setHiddenColumns(defaultHiddenColumns);setMenu(null);}}>Standardansicht wiederherstellen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='open'?'is-open':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          {columns.map(([key])=><td key={key} className={key==='description'?'emp-ellipsis':''}>{cellValue(row,key)}</td>)}
        </tr></React.Fragment>)}</tbody>
    </table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Stellenbeschreibungen</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Inaktiv</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);setSelected(new Set());}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);setSelected(new Set());}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterPanelOpen&&<div className="emp-training-filter-shell" onClick={()=>setFilterPanelOpen(false)}><aside className="emp-training-filter-panel" onClick={event=>event.stopPropagation()}><header><div><span>Stellenbeschreibungen</span><h2>Filter</h2></div><button onClick={()=>setFilterPanelOpen(false)}>×</button></header><main><label><span>Mitarbeiter</span><input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))}/></label><label><span>Firma</span><select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label><span>Abteilung</span><select value={filters.department} onChange={event=>setFilters(old=>({...old,department:event.target.value}))}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label><span>Position</span><input value={filters.position} onChange={event=>setFilters(old=>({...old,position:event.target.value}))}/></label><label><span>Stellenbeschreibung</span><input value={filters.name} onChange={event=>setFilters(old=>({...old,name:event.target.value}))}/></label><label><span>Zusatzfunktion</span><input value={filters.functionName} onChange={event=>setFilters(old=>({...old,functionName:event.target.value}))}/></label><label><span>Version</span><input value={filters.version} onChange={event=>setFilters(old=>({...old,version:event.target.value}))}/></label><label><span>Unterschriftsstatus</span><select value={filters.status} onChange={event=>setFilters(old=>({...old,status:event.target.value}))}><option value="all">Alle</option><option value="signed">Unterschrieben</option><option value="open">Unterschrift offen</option><option value="archived">Archiviert</option></select></label><label><span>Gültig ab</span><input type="date" value={filters.validFrom} onChange={event=>setFilters(old=>({...old,validFrom:event.target.value}))}/></label><label><span>Ausgehändigt von</span><input type="date" value={filters.handedFrom} onChange={event=>setFilters(old=>({...old,handedFrom:event.target.value}))}/></label><label><span>Ausgehändigt bis</span><input type="date" value={filters.handedTo} onChange={event=>setFilters(old=>({...old,handedTo:event.target.value}))}/></label><label><span>Unterschriftsfrist bis</span><input type="date" value={filters.deadline} onChange={event=>setFilters(old=>({...old,deadline:event.target.value}))}/></label><label><span>Dokument</span><select value={filters.document} onChange={event=>setFilters(old=>({...old,document:event.target.value}))}><option value="all">Alle</option><option value="available">Vorhanden</option><option value="missing">Fehlt</option></select></label><label className="emp-checkline"><input type="checkbox" checked={filters.overdue} onChange={event=>setFilters(old=>({...old,overdue:event.target.checked}))}/>Frist überschritten</label><label className="emp-checkline"><input type="checkbox" checked={filters.newVersion} onChange={event=>setFilters(old=>({...old,newVersion:event.target.checked}))}/>Neue Version erforderlich</label><label className="emp-checkline"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Einträge anzeigen</label></main><footer><button onClick={resetFilters}>Filter zurücksetzen</button><button onClick={()=>setFilterPanelOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterPanelOpen(false)}>Filter anwenden</button></footer></aside></div>}
    {createOpen&&<div className="emp-picker-backdrop" onClick={()=>setCreateOpen(false)}><section className="emp-assign-modal emp-job-create-modal" onClick={event=>event.stopPropagation()}><header><div><span>Stellenbeschreibungen</span><h2>Stellenbeschreibung zuordnen</h2></div><button onClick={()=>setCreateOpen(false)}>×</button></header><main><fieldset><legend>1. Mitarbeiter</legend><label><span>Mitarbeiter *</span><select><option>{currentScopeLabel}</option><option>Mehrere Mitarbeiter auswählen</option><option>Abteilung auswählen</option><option>Position auswählen</option><option>Alle passenden Mitarbeiter einer Firma</option></select></label><label><span>Firma</span><input defaultValue={window.company(currentEmployee.company)?.name || ''}/></label><label><span>Position</span><input defaultValue={currentEmployee.position}/></label><label><span>Zusatzfunktion</span><input/></label></fieldset><fieldset><legend>2. Stellenbeschreibung</legend><label><span>Vorlage *</span><select><option>Stellenbeschreibung Polier</option><option>Zusatzfunktion Sicherheitsbeauftragter</option><option>Vertretungsregelung Bauleitung</option></select></label><label><span>Version *</span><input defaultValue="v3.1"/></label><label><span>Gültig ab *</span><input type="date"/></label><label className="is-wide"><span>Beschreibung</span><textarea/></label><label className="is-wide"><span>Neue Vorlage hochladen</span><input type="file" accept=".pdf"/></label></fieldset><fieldset><legend>3. Aushändigung und Unterschrift</legend><label><span>Ausgehändigt am *</span><input type="date"/></label><label><span>Unterschriftsfrist *</span><input type="date"/></label><label><span>Art der Bestätigung *</span><select><option>digitale Bestätigung</option><option>handschriftliche Unterschrift</option><option>unterschriebene PDF hochladen</option><option>durch Administrator bestätigt</option></select></label><label><span>Verantwortliche Person *</span><input defaultValue="Sabine Janning"/></label><label className="emp-checkline"><input type="checkbox" defaultChecked/>Unterschrift erforderlich *</label><label className="emp-checkline"><input type="checkbox"/>Erinnerung aktivieren</label></fieldset><fieldset><legend>4. Freigabe</legend><label><span>Freigabe für Mitarbeiter *</span><select><option>freigegeben</option><option>nicht freigegeben</option><option>nur PDF sichtbar</option><option>PDF und Bestätigung sichtbar</option></select></label><label className="emp-checkline"><input type="checkbox" defaultChecked/>Mitarbeiter darf PDF öffnen</label><label className="emp-checkline"><input type="checkbox"/>Mitarbeiter darf PDF herunterladen</label><label className="is-wide"><span>Bemerkung</span><textarea/></label></fieldset><fieldset><legend>5. Dokumente</legend><label><span>Stellenbeschreibung als PDF</span><input type="file" accept=".pdf"/></label><label><span>Unterschriftsseite</span><input type="file" accept=".pdf,.jpg,.jpeg,.png"/></label><label><span>Ergänzende Anlage</span><input type="file" multiple/></label><label><span>Weitere Dokumente</span><input type="file" multiple/></label></fieldset><fieldset><legend>6. Zusammenfassung</legend><div className="emp-create-summary"><strong>Mitarbeiter</strong><span>{currentScopeLabel}</span><strong>Position</strong><span>{currentEmployee.position}</span><strong>Version</strong><span>v3.1</span><strong>Freigabe</strong><span>PDF und Bestätigung sichtbar</span></div></fieldset></main><footer><button onClick={()=>setCreateOpen(false)}>Abbrechen</button><button>Als Entwurf speichern</button><button className="btn btn--primary" onClick={()=>setCreateOpen(false)}>Stellenbeschreibung zuordnen</button></footer></section></div>}
  </div>;
}

function EmployeeJobRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const displayEmp=form.employee || emp;
  const statusName=form.status==='signed'?'Unterschrieben':'Unterschrift offen';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${displayEmp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-job-record-icon"><Icon name="doc" size={27}/></span><div><span>Stellenbeschreibung</span><h2>{form.name}</h2></div><span className={'emp-status is-'+form.status}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Mitarbeiter" icon="users" value={displayEmp.name}/>
        <TrainingRecordField label="Firma" icon="building" value={window.company(displayEmp.company)?.name || displayEmp.company}/>
        <TrainingRecordField label="Position" icon="flag" value={displayEmp.position}/>
        <TrainingRecordField label="Stellenbeschreibung" icon="doc" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Position / Zusatzfunktion" icon="flag" editing={editing} value={form.functionName || '-'}><input value={form.functionName || ''} onChange={e=>set('functionName',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Version" icon="history" editing={editing} value={form.version}><input value={form.version} onChange={e=>set('version',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültig ab" icon="cal" editing={editing} value={form.validFrom || '-'}><input value={form.validFrom || ''} onChange={e=>set('validFrom',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Erstellt am" icon="cal" editing={editing} value={form.created}><input value={form.created} onChange={e=>set('created',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ausgehändigt am" icon="cal" editing={editing} value={form.handed || '-'}><input value={form.handed || ''} onChange={e=>set('handed',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Unterschriftsfrist" icon="clock" editing={editing} value={form.deadline || '-'}><input value={form.deadline || ''} onChange={e=>set('deadline',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Unterschrieben am" icon="cal" editing={editing} value={form.signed}><input value={form.signed} onChange={e=>set('signed',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="signed">Unterschrieben</option><option value="open">Unterschrift offen</option></select></TrainingRecordField>
        <TrainingRecordField label="Persönliche Bestätigung" icon="check" editing={editing} value={form.confirmation || '-'}><input value={form.confirmation || ''} onChange={e=>set('confirmation',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`} wide/>
        <TrainingRecordField label="Bemerkung" icon="doc" editing={editing} value={form.remark || '-'} wide><textarea rows="2" value={form.remark || ''} onChange={e=>set('remark',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeMedicalRecords(emp) {
  return [
    {baseId:'med-1',name:'G26 Atemschutz',type:'Pflichtvorsorge',reason:'Atemschutzgeräte und staubbelastete Tätigkeiten',last:'14.03.2025',next:'14.03.2026',days:-82,status:'expired',released:true,releaseScope:'nur Bescheinigung sichtbar',clinic:'Betriebsarzt Nordhorn',responsible:'Sabine Janning',history:3,description:'Arbeitsmedizinische Vorsorge für Tätigkeiten mit Atemschutzgeräten.',document:'G26_Atemschutz_Bescheinigung.pdf'},
    {baseId:'med-2',name:'G37 Lärmexposition',type:'Angebotsvorsorge',reason:'Tätigkeiten in lärmbelasteten Arbeitsbereichen',last:'08.01.2025',next:'08.01.2028',days:583,status:'valid',released:true,releaseScope:'freigegeben',clinic:'Arbeitsmedizin Lingen',responsible:'Michael Janning',history:2,description:'Vorsorge bei Tätigkeiten in lärmbelasteten Arbeitsbereichen.',document:'G37_Laermexposition.pdf'},
    {baseId:'med-3',name:'G25 Fahr- und Steuertätigkeiten',type:'Eignungsuntersuchung',reason:'Fahr-, Steuer- und Überwachungstätigkeiten',last:'12.06.2024',next:'12.06.2026',days:8,status:'warn',released:false,releaseScope:'nicht freigegeben',clinic:'Betriebsarzt Nordhorn',responsible:'Christian Janning',history:4,description:'Eignungsuntersuchung für Fahr-, Steuer- und Überwachungstätigkeiten.',document:'G25_Fahrtaetigkeiten.pdf'},
  ].map((row,index)=>({
    ...row,
    id:`${emp.id}-${row.baseId}`,
    employeeId:emp.id,
    employee:emp,
    employeeName:`${emp.lastName}, ${emp.firstName}`,
    company:window.company(emp.company)?.name || emp.company,
    companyShort:window.company(emp.company)?.short || emp.company,
    department:emp.department,
    position:emp.position,
    documentMissing:index===1 && emp.status === 'aktiv',
    remark:row.status==='expired' ? `${Math.abs(row.days)} Tage überfällig - noch kein neuer Termin geplant.` : row.status==='warn' ? 'Termin bald fällig, Einladung vorbereiten.' : 'Bescheinigung liegt vor.',
    result:row.status==='valid' ? 'keine Bedenken' : row.status==='warn' ? 'Bescheinigung ausstehend' : 'Termin überfällig',
  }));
}

function EmployeeMedicalArea({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeMedicalView') || 'list');
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [filterPanelOpen,setFilterPanelOpen]=React.useState(false);
  const [createOpen,setCreateOpen]=React.useState(false);
  const [rowActionMenu,setRowActionMenu]=React.useState(null);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('aktiv');
  const [filters,setFilters]=React.useState({
    employee:'', company:'all', department:'all', position:'', name:'', type:'all',
    reason:'', clinic:'', responsible:'', status:'all', lastFrom:'', lastTo:'',
    nextFrom:'', nextTo:'', dueWindow:'all', document:'all', release:'all', archived:false,
  });
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope==='active') return sourceEmployees.filter(item=>item.status==='aktiv');
    if(scope==='inactive') return sourceEmployees.filter(item=>item.status!=='aktiv');
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope==='all'||scope==='active'||scope==='inactive'||scope.startsWith('company:')||scope.startsWith('department:');
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeMedicalRecords),[activeEmployees]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'name',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const defaultHiddenColumns=React.useMemo(()=>new Set(['reason','clinic','responsible','released','company','department','description','history']),[]);
  const [hiddenColumns,setHiddenColumns]=React.useState(defaultHiddenColumns);
  const labels={valid:'Gültig',planned:'Termin geplant',warn:'Bald fällig',expired:'Überfällig',missing:'Dokument fehlt',archived:'Archiviert'};
  const departments=[...new Set(sourceEmployees.map(item=>item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const currentScopeLabel=scope==='all'?'Alle Mitarbeiter':scope==='active'?'Aktive Mitarbeiter':scope==='inactive'?'Inaktive Mitarbeiter':scope.startsWith('company:')?(window.company(scope.replace('company:',''))?.name || 'Firma'):scope.startsWith('department:')?`Abteilung: ${scope.replace('department:','')}`:(sourceEmployees.find(item=>item.id===scope)?.name || emp.name);
  const activeFilterCount=[filters.employee,filters.company!=='all',filters.department!=='all',filters.position,filters.name,filters.type!=='all',filters.reason,filters.clinic,filters.responsible,filters.status!=='all',filters.lastFrom,filters.lastTo,filters.nextFrom,filters.nextTo,filters.dueWindow!=='all',filters.document!=='all',filters.release!=='all',filters.archived].filter(Boolean).length;
  const resetFilters=()=>setFilters({employee:'',company:'all',department:'all',position:'',name:'',type:'all',reason:'',clinic:'',responsible:'',status:'all',lastFrom:'',lastTo:'',nextFrom:'',nextTo:'',dueWindow:'all',document:'all',release:'all',archived:false});
  const dateValue=value=>{
    const parts=String(value||'').split('.');
    return parts.length===3?`${parts[2]}-${parts[1]}-${parts[0]}`:'';
  };
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  const filterRow=row=>{
    if(filter==='missing') return row.documentMissing;
    if(filter!=='all' && row.status!==filter) return false;
    return true;
  };
  const panelFilterRow=row=>{
    const employeeText=`${row.employeeName} ${row.employee.personalNr || ''}`.toLowerCase();
    if(filters.employee && !employeeText.includes(filters.employee.toLowerCase())) return false;
    if(filters.company!=='all' && row.employee.company!==filters.company) return false;
    if(filters.department!=='all' && row.department!==filters.department) return false;
    if(filters.position && !row.position.toLowerCase().includes(filters.position.toLowerCase())) return false;
    if(filters.name && !row.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if(filters.type!=='all' && row.type!==filters.type) return false;
    if(filters.reason && !row.reason.toLowerCase().includes(filters.reason.toLowerCase())) return false;
    if(filters.clinic && !row.clinic.toLowerCase().includes(filters.clinic.toLowerCase())) return false;
    if(filters.responsible && !row.responsible.toLowerCase().includes(filters.responsible.toLowerCase())) return false;
    if(filters.status!=='all' && row.status!==filters.status) return false;
    if(filters.lastFrom && dateValue(row.last) && dateValue(row.last)<filters.lastFrom) return false;
    if(filters.lastTo && dateValue(row.last) && dateValue(row.last)>filters.lastTo) return false;
    if(filters.nextFrom && dateValue(row.next) && dateValue(row.next)<filters.nextFrom) return false;
    if(filters.nextTo && dateValue(row.next) && dateValue(row.next)>filters.nextTo) return false;
    if(filters.dueWindow!=='all' && row.days>Number(filters.dueWindow)) return false;
    if(filters.document==='missing' && !row.documentMissing) return false;
    if(filters.document==='available' && row.documentMissing) return false;
    if(filters.release==='released' && !row.released) return false;
    if(filters.release==='blocked' && row.released) return false;
    if(!filters.archived && row.status==='archived') return false;
    return true;
  };
  let rows=records.filter(filterRow).filter(panelFilterRow);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter']]:[]),
    ['name','Vorsorge / Untersuchung'],['type','Art'],['last','Letzte Vorsorge'],['next','Nächster Termin'],['days','Restzeit'],['status','Status'],['document','Dokument'],['actions','Aktionen'],
    ['reason','Anlass / Tätigkeit'],['clinic','Untersuchungsstelle'],['responsible','Verantwortliche Person'],['released','Freigabe für Mitarbeiter'],['company','Firma'],['department','Abteilung'],['description','Beschreibung'],['history','Versionshistorie']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key));
  const tabLabels={all:`Alle ${records.length}`,valid:`Gültig ${records.filter(row=>row.status==='valid').length}`,planned:'Termin geplant',warn:`Bald fällig ${records.filter(row=>row.status==='warn').length}`,expired:`Überfällig ${records.filter(row=>row.status==='expired').length}`,missing:`Dokument fehlt ${records.filter(row=>row.documentMissing).length}`,archived:'Archiviert'};
  const pickerEmployees=sourceEmployees.filter(item=>{
    const text=`${item.lastName}, ${item.firstName} ${item.personalNr}`.toLowerCase();
    if(employeeSearch && !text.includes(employeeSearch.toLowerCase())) return false;
    if(employeeCompanyFilter!=='all' && item.company!==employeeCompanyFilter) return false;
    if(employeeDepartmentFilter!=='all' && item.department!==employeeDepartmentFilter) return false;
    if(employeePositionFilter && !item.position.toLowerCase().includes(employeePositionFilter.toLowerCase())) return false;
    if(employeeStatusFilter!=='all' && item.status!==employeeStatusFilter) return false;
    return true;
  }).slice().sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
  const setMode=mode=>{setViewMode(mode);localStorage.setItem('employeeMedicalView',mode);};
  const cellValue=(row,key)=>{
    if(key==='employeeName'||key==='name') return <strong>{row[key]}</strong>;
    if(key==='days') return row.days<0?`${Math.abs(row.days)} Tage überfällig`:`in ${row.days} Tagen`;
    if(key==='status') return <span className={'emp-status is-'+row.status}>{labels[row.status]}</span>;
    if(key==='released') return <span className="emp-release" title={row.releaseScope}>{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='document') return <span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'fehlt':1}</span>;
    if(key==='actions') return <div className="emp-row-actions" onClick={event=>event.stopPropagation()}><button className="emp-row-menu-btn" onClick={()=>setRowActionMenu(rowActionMenu===row.id?null:row.id)}>⋮</button>{rowActionMenu===row.id&&<div className="emp-row-action-menu">{['Details anzeigen','Bearbeiten','Termin planen','Termin verschieben','Als durchgeführt markieren','Bescheinigung hochladen','Dokument öffnen','Dokument ersetzen','Nächste Vorsorge festlegen','Freigabe ändern','Erinnerung senden','Archivieren','Löschen'].map(label=><button key={label} onClick={()=>{if(label==='Details anzeigen'||label==='Bearbeiten') onOpen(row);setRowActionMenu(null);}}>{label}</button>)}</div>}</div>;
    return row[key];
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Arbeitsmedizinische Vorsorge - alle Mitarbeiter':`Arbeitsmedizinische Vorsorge (${currentEmployee.name})`} onBack={onBack} action={
      <div className="emp-training-toolbar">
        <button type="button" className="emp-current-picker-btn" onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {currentScopeLabel}</button>
        <button type="button" onClick={()=>setFilterPanelOpen(true)}><Icon name="settings" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button>
        <span className="emp-view-toggle"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setMode('cards')}><Icon name="dashboard" size={14}/>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setMode('list')}><Icon name="doc" size={14}/>Liste</button></span>
        <button type="button" onClick={()=>setCreateOpen(true)}><Icon name="plus" size={14}/>Vorsorge hinzufügen</button>
      </div>
    }/>
    <div className="emp-training-tabs">{['all','valid','planned','warn','expired','missing','archived'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}</div>
    {activeFilterCount>0&&<div className="emp-active-filter-chips">{filters.company!=='all'&&<button onClick={()=>setFilters(old=>({...old,company:'all'}))}>Firma: {window.company(filters.company)?.short || filters.company} ×</button>}{filters.status!=='all'&&<button onClick={()=>setFilters(old=>({...old,status:'all'}))}>Status: {labels[filters.status]} ×</button>}{filters.document!=='all'&&<button onClick={()=>setFilters(old=>({...old,document:'all'}))}>Dokument {filters.document==='missing'?'fehlt':'vorhanden'} ×</button>}{filters.name&&<button onClick={()=>setFilters(old=>({...old,name:''}))}>Vorsorge: {filters.name} ×</button>}</div>}
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="cal" size={14}/>Termin planen</button><button><Icon name="mail" size={14}/>Erinnerung senden</button><button><Icon name="users" size={14}/>Verantwortliche Person ändern</button><button><Icon name="shield" size={14}/>Freigabe ändern</button><button><Icon name="download" size={14}/>Dokumente herunterladen</button><button className="is-danger"><Icon name="trash" size={14}/>Archivieren</button></div>}
    {viewMode==='cards'&&<div className="emp-instruction-card-grid emp-medical-card-grid">{rows.map(row=><article key={row.id} className={'emp-instruction-card emp-medical-card is-'+row.status} onClick={()=>onOpen(row)}><header><div><span>{row.type}</span><h3>{row.name}</h3></div><button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button></header><p>{isAllView?row.employeeName:row.reason}</p><dl><div><dt>Nächster Termin</dt><dd>{row.next}</dd></div><div><dt>Restzeit</dt><dd>{cellValue(row,'days')}</dd></div><div><dt>Status</dt><dd>{cellValue(row,'status')}</dd></div><div><dt>Dokument</dt><dd>{cellValue(row,'document')}</dd></div></dl></article>)}</div>}
    {viewMode==='list'&&<div className="emp-table-wrap"><table className="emp-medical-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button><button onClick={()=>setMenu(null)}>Spalten verwalten</button><button onClick={()=>{setHiddenColumns(defaultHiddenColumns);setMenu(null);}}>Standardansicht wiederherstellen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          {columns.map(([key])=><td key={key} className={(key==='remark'?'emp-ellipsis ':'')+(key==='days'&&row.days<0?'is-overdue':'')}>{cellValue(row,key)}</td>)}
        </tr></React.Fragment>)}</tbody>
    </table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Arbeitsmedizinische Vorsorge</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Ausgeschieden</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);setSelected(new Set());}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);setSelected(new Set());}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterPanelOpen&&<div className="emp-training-filter-shell" onClick={()=>setFilterPanelOpen(false)}><aside className="emp-training-filter-panel" onClick={event=>event.stopPropagation()}><header><div><span>Arbeitsmedizinische Vorsorge</span><h2>Filter</h2></div><button onClick={()=>setFilterPanelOpen(false)}>×</button></header><main><label><span>Mitarbeiter</span><input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))}/></label><label><span>Firma</span><select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label><span>Abteilung</span><select value={filters.department} onChange={event=>setFilters(old=>({...old,department:event.target.value}))}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label><span>Position</span><input value={filters.position} onChange={event=>setFilters(old=>({...old,position:event.target.value}))}/></label><label><span>Vorsorge oder Untersuchung</span><input value={filters.name} onChange={event=>setFilters(old=>({...old,name:event.target.value}))}/></label><label><span>Vorsorgeart</span><select value={filters.type} onChange={event=>setFilters(old=>({...old,type:event.target.value}))}><option value="all">Alle</option>{['Pflichtvorsorge','Angebotsvorsorge','Wunschvorsorge','Eignungsuntersuchung'].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Anlass oder Tätigkeit</span><input value={filters.reason} onChange={event=>setFilters(old=>({...old,reason:event.target.value}))}/></label><label><span>Untersuchungsstelle</span><input value={filters.clinic} onChange={event=>setFilters(old=>({...old,clinic:event.target.value}))}/></label><label><span>Verantwortliche Person</span><input value={filters.responsible} onChange={event=>setFilters(old=>({...old,responsible:event.target.value}))}/></label><label><span>Terminstatus</span><select value={filters.status} onChange={event=>setFilters(old=>({...old,status:event.target.value}))}><option value="all">Alle</option><option value="valid">Gültig</option><option value="planned">Termin geplant</option><option value="warn">Bald fällig</option><option value="expired">Überfällig</option><option value="missing">Dokument fehlt</option><option value="archived">Archiviert</option></select></label><label><span>Letzte Vorsorge von</span><input type="date" value={filters.lastFrom} onChange={event=>setFilters(old=>({...old,lastFrom:event.target.value}))}/></label><label><span>Letzte Vorsorge bis</span><input type="date" value={filters.lastTo} onChange={event=>setFilters(old=>({...old,lastTo:event.target.value}))}/></label><label><span>Nächster Termin von</span><input type="date" value={filters.nextFrom} onChange={event=>setFilters(old=>({...old,nextFrom:event.target.value}))}/></label><label><span>Nächster Termin bis</span><input type="date" value={filters.nextTo} onChange={event=>setFilters(old=>({...old,nextTo:event.target.value}))}/></label><label><span>Fällig innerhalb von</span><select value={filters.dueWindow} onChange={event=>setFilters(old=>({...old,dueWindow:event.target.value}))}><option value="all">Alle</option><option value="30">30 Tagen</option><option value="60">60 Tagen</option><option value="90">90 Tagen</option></select></label><label><span>Dokument</span><select value={filters.document} onChange={event=>setFilters(old=>({...old,document:event.target.value}))}><option value="all">Alle</option><option value="available">Vorhanden</option><option value="missing">Fehlt</option></select></label><label><span>Freigabe</span><select value={filters.release} onChange={event=>setFilters(old=>({...old,release:event.target.value}))}><option value="all">Alle</option><option value="released">Freigegeben</option><option value="blocked">Nicht freigegeben</option></select></label><label className="emp-checkline"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Einträge anzeigen</label></main><footer><button onClick={resetFilters}>Filter zurücksetzen</button><button onClick={()=>setFilterPanelOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterPanelOpen(false)}>Filter anwenden</button></footer></aside></div>}
    {createOpen&&<div className="emp-picker-backdrop" onClick={()=>setCreateOpen(false)}><section className="emp-assign-modal emp-medical-create-modal" onClick={event=>event.stopPropagation()}><header><div><span>Arbeitsmedizinische Vorsorge</span><h2>Vorsorge hinzufügen</h2></div><button onClick={()=>setCreateOpen(false)}>×</button></header><main><fieldset><legend>1. Mitarbeiter</legend><label><span>Mitarbeiter *</span><select><option>{currentScopeLabel}</option><option>Mehrere Mitarbeiter auswählen</option></select></label><label><span>Firma</span><input defaultValue={window.company(currentEmployee.company)?.name || ''}/></label><label><span>Abteilung / Position</span><input defaultValue={`${currentEmployee.department} · ${currentEmployee.position}`}/></label><label><span>Verantwortliche Person *</span><input defaultValue="Sabine Janning"/></label></fieldset><fieldset><legend>2. Vorsorgeangaben</legend><label><span>Vorsorge / Untersuchung *</span><input placeholder="z.B. G25 Fahr- und Steuertätigkeiten"/></label><label><span>Vorsorgeart *</span><select>{['Pflichtvorsorge','Angebotsvorsorge','Wunschvorsorge','Eignungsuntersuchung'].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Anlass / Tätigkeit *</span><input/></label><label><span>Untersuchungsstelle *</span><input/></label><label className="is-wide"><span>Beschreibung</span><textarea/></label></fieldset><fieldset><legend>3. Termine und Fristen</legend><label><span>Letzte Vorsorge</span><input type="date"/></label><label><span>Nächster Termin</span><input type="date"/></label><label><span>Wiederholungsintervall</span><input/></label><label><span>Terminstatus *</span><select>{['noch nicht geplant','geplant','bestätigt','bald fällig','überfällig','durchgeführt','abgesagt'].map(item=><option key={item}>{item}</option>)}</select></label><label className="emp-checkline"><input type="checkbox"/>Erinnerung aktivieren</label></fieldset><fieldset><legend>4. Ergebnis und Freigabe</legend><label><span>Ergebnis für Arbeitgeber</span><select>{['Bescheinigung ausstehend','keine Bedenken','Bedenken unter bestimmten Voraussetzungen','weitere Prüfung erforderlich','Bescheinigung liegt vor'].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Freigabeumfang *</span><select>{['nicht freigegeben','nur Termin sichtbar','Bescheinigung sichtbar','vollständig freigegeben'].map(item=><option key={item}>{item}</option>)}</select></label><label className="emp-checkline"><input type="checkbox" defaultChecked/>Freigabe für Mitarbeiter *</label><label className="is-wide"><span>Bemerkung</span><textarea placeholder="Keine Diagnosen oder medizinischen Details speichern."/></label></fieldset><fieldset><legend>5. Dokumente</legend><label><span>Vorsorgebescheinigung</span><input type="file" accept=".pdf,.jpg,.jpeg,.png"/></label><label><span>Terminbestätigung</span><input type="file" accept=".pdf,.jpg,.jpeg,.png"/></label><label><span>Einladung</span><input type="file" accept=".pdf,.jpg,.jpeg,.png"/></label><label><span>Weitere Unterlagen</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></label><p className="emp-form-summary">Dokumente werden als vertraulich gekennzeichnet.</p></fieldset><fieldset><legend>6. Zusammenfassung</legend><div className="emp-create-summary"><strong>Mitarbeiter</strong><span>{currentScopeLabel}</span><strong>Vorsorge</strong><span>G25 Fahr- und Steuertätigkeiten</span><strong>Untersuchungsstelle</strong><span>Betriebsarzt Nordhorn</span><strong>Freigabe</strong><span>nur Termin sichtbar</span></div></fieldset></main><footer><button onClick={()=>setCreateOpen(false)}>Abbrechen</button><button>Als Entwurf speichern</button><button className="btn btn--primary" onClick={()=>setCreateOpen(false)}>Vorsorge hinzufügen</button></footer></section></div>}
  </div>;
}

function EmployeeMedicalRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const displayEmp=form.employee || emp;
  const statusName=form.status==='valid'?'Gültig':form.status==='planned'?'Termin geplant':form.status==='warn'?'Termin bald fällig':form.status==='missing'?'Dokument fehlt':form.status==='archived'?'Archiviert':'Überfällig';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${displayEmp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-medical-record-icon"><Icon name="shield" size={27}/></span><div><span>Arbeitsmedizinische Vorsorge</span><h2>{form.name}</h2></div><span className={'emp-status is-'+form.status}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Mitarbeiter" icon="users" value={displayEmp.name}/>
        <TrainingRecordField label="Firma" icon="building" value={window.company(displayEmp.company)?.name || displayEmp.company}/>
        <TrainingRecordField label="Abteilung / Position" icon="flag" value={`${displayEmp.department} · ${displayEmp.position}`}/>
        <TrainingRecordField label="Vorsorge / Untersuchung" icon="shield" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Vorsorgeart" icon="doc" editing={editing} value={form.type}><select value={form.type} onChange={e=>set('type',e.target.value)}><option>Pflichtvorsorge</option><option>Angebotsvorsorge</option><option>Wunschvorsorge</option><option>Eignungsuntersuchung</option></select></TrainingRecordField>
        <TrainingRecordField label="Anlass / Tätigkeit" icon="doc" editing={editing} value={form.reason || '-'}><input value={form.reason || ''} onChange={e=>set('reason',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Letzte Vorsorge" icon="cal" editing={editing} value={form.last}><input value={form.last} onChange={e=>set('last',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Nächster Termin" icon="cal" editing={editing} value={form.next}><input value={form.next} onChange={e=>set('next',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage überfällig`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Terminstatus" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="planned">Termin geplant</option><option value="warn">Termin bald fällig</option><option value="expired">Termin überfällig</option><option value="missing">Dokument fehlt</option><option value="archived">Archiviert</option></select></TrainingRecordField>
        <TrainingRecordField label="Untersuchungsstelle" icon="building" editing={editing} value={form.clinic || '-'}><input value={form.clinic || ''} onChange={e=>set('clinic',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Verantwortliche Person" icon="users" editing={editing} value={form.responsible || '-'}><input value={form.responsible || ''} onChange={e=>set('responsible',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ergebnis für Arbeitgeber" icon="check" editing={editing} value={form.result || '-'}><select value={form.result || 'Bescheinigung liegt vor'} onChange={e=>set('result',e.target.value)}><option>keine Bedenken</option><option>Bedenken unter Voraussetzungen</option><option>weitere Prüfung erforderlich</option><option>Bescheinigung liegt vor</option><option>Bescheinigung ausstehend</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Freigabeumfang" icon="shield" value={form.releaseScope || '-'}/>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`}/>
        <TrainingRecordField label="Bemerkung" icon="doc" editing={editing} value={form.remark || '-'} wide><textarea rows="2" value={form.remark || ''} onChange={e=>set('remark',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeLicenseRecords(emp) {
  return [
    {baseId:'lic-1',licenseClass:'B, BE',origin:'Deutschland',number:'FS-2036-BE-018',issued:'10.03.2020',validFrom:'10.03.2020',last:'10.03.2025',next:'10.03.2026',controlStatus:'current',expires:'10.03.2030',days:1375,status:'valid',released:true,drivingPermit:'Freigegeben',responsible:'Sabine Janning',history:4,description:'Fahrerlaubnis für Pkw und Anhänger.',document:'Fuehrerschein_B_BE.pdf'},
    {baseId:'lic-2',licenseClass:'C, CE',origin:'EU',number:'FS-2036-CE-041',issued:'15.07.2021',validFrom:'15.07.2021',last:'15.01.2025',next:'15.01.2026',controlStatus:'due',expires:'15.07.2026',days:41,status:'warn',released:true,drivingPermit:'Prüfung erforderlich',responsible:'Rahim Ahangarzadeh',history:3,description:'Fahrerlaubnis für Lkw und Lastzüge.',document:'Fuehrerschein_C_CE.pdf'},
    {baseId:'lic-3',licenseClass:'L, T',origin:'Deutschland',number:'FS-2036-LT-009',issued:'18.04.2019',validFrom:'18.04.2019',last:'18.04.2024',next:'18.04.2025',controlStatus:'overdue',expires:'18.04.2026',days:-47,status:'expired',released:false,drivingPermit:'Gesperrt',responsible:'Christian Janning',history:2,description:'Fahrerlaubnis für land- und forstwirtschaftliche Zugmaschinen.',document:'Fuehrerschein_L_T.pdf'},
  ].map((row,index)=>({
    ...row,
    id:`${emp.id}-${row.baseId}`,
    employeeId:emp.id,
    employee:emp,
    employeeName:`${emp.lastName}, ${emp.firstName}`,
    company:window.company(emp.company)?.name || emp.company,
    companyShort:window.company(emp.company)?.short || emp.company,
    department:emp.department,
    position:emp.position,
    documentMissing:index===1 && emp.status === 'aktiv',
    controlMissing:index===2,
    remark:row.status==='expired' ? `Führerscheinklasse ${row.licenseClass} seit ${Math.abs(row.days)} Tagen abgelaufen.` : row.controlStatus==='due' ? 'Interne Kontrolle bald fällig.' : 'Kontrolle dokumentiert.',
  }));
}

function EmployeeLicenseAreaLegacy({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope==='active') return sourceEmployees.filter(item=>item.status==='aktiv');
    if(scope==='inactive') return sourceEmployees.filter(item=>item.status!=='aktiv');
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope!==emp.id;
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeLicenseRecords),[activeEmployees]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'licenseClass',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const [hiddenColumns,setHiddenColumns]=React.useState(new Set());
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen',missing:'Dokument fehlt',archived:'Archiviert'};
  const controlLabels={current:'Kontrolle aktuell',due:'Kontrolle bald fällig',overdue:'Kontrolle überfällig',planned:'Kontrolle geplant',done:'Kontrolle durchgeführt',missing:'Kontrollnachweis fehlt'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  let rows=filter==='all'?records:filter==='controlDue'?records.filter(row=>['due','overdue'].includes(row.controlStatus)):filter==='missing'?records.filter(row=>row.documentMissing||row.controlMissing):records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter'],['companyShort','Firma'],['department','Abteilung'],['position','Position']]:[]),
    ['licenseClass','Führerscheinklasse'],['origin','Herkunft / Ausstellungsland'],['number','Führerscheinnummer'],['last','Letzte Kontrolle'],['next','Nächste Kontrolle'],['controlStatus','Kontrollstatus'],['expires','Führerschein gültig bis'],['days','Restlaufzeit'],['status','Gültigkeitsstatus'],['released','Freigabe für Mitarbeiter'],['document','Dokument'],['description','Beschreibung'],['actions','Aktionen']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key));
  const tabLabels={all:`Alle ${records.length}`,valid:`Gültig ${records.filter(row=>row.status==='valid').length}`,warn:`Läuft bald ab ${records.filter(row=>row.status==='warn').length}`,expired:`Abgelaufen ${records.filter(row=>row.status==='expired').length}`,controlDue:`Kontrolle fällig ${records.filter(row=>['due','overdue'].includes(row.controlStatus)).length}`,missing:`Dokument fehlt ${records.filter(row=>row.documentMissing||row.controlMissing).length}`,archived:'Archiviert'};
  const kpi=[
    ['Führerscheine',records.length,'all'],
    ['Gültig',records.filter(row=>row.status==='valid').length,'valid'],
    ['Laufen bald ab',records.filter(row=>row.status==='warn').length,'warn'],
    ['Abgelaufen',records.filter(row=>row.status==='expired').length,'expired'],
    ['Kontrolle fällig',records.filter(row=>['due','overdue'].includes(row.controlStatus)).length,'controlDue'],
  ];
  const cellValue=(row,key)=>{
    if(key==='employeeName'||key==='licenseClass') return <strong>{row[key]}</strong>;
    if(key==='days') return row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`;
    if(key==='status') return <span className={'emp-status is-'+row.status}>{labels[row.status]}</span>;
    if(key==='controlStatus') return <span className={'emp-status is-'+(row.controlStatus==='current'||row.controlStatus==='done'?'valid':row.controlStatus==='due'||row.controlStatus==='planned'?'warn':'expired')}>{controlLabels[row.controlStatus]}</span>;
    if(key==='released') return <span className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='document') return <span className={'emp-doc-count '+(row.documentMissing||row.controlMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing||row.controlMissing?'fehlt':1}</span>;
    if(key==='actions') return <button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button>;
    return row[key];
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Führerscheine - alle Mitarbeiter':`Führerschein (${currentEmployee.name})`} onBack={onBack} action={
      <div className="emp-training-toolbar">
        <label>Mitarbeiter auswählen<select value={scope} onChange={event=>{setScope(event.target.value);setSelected(new Set());}}>
          <option value={emp.id}>{emp.name}</option>
          <option value="all">Alle Mitarbeiter</option>
          <option value="active">Nur aktive Mitarbeiter</option>
          <option value="inactive">Ausgeschiedene Mitarbeiter</option>
          {window.SEED.companies.map(company=><option key={company.id} value={`company:${company.id}`}>{company.name}</option>)}
          {window.SEED.departments.map(dept=><option key={dept} value={`department:${dept}`}>Abteilung: {dept}</option>)}
          {sourceEmployees.filter(item=>item.id!==emp.id).slice().sort((a,b)=>a.lastName.localeCompare(b.lastName,'de')).map(item=><option key={item.id} value={item.id}>{item.lastName}, {item.firstName}</option>)}
        </select></label>
        <button><Icon name="settings" size={14}/>Filter</button>
        <button><Icon name="plus" size={14}/>Führerschein hinzufügen</button>
      </div>
    }/>
    <div className="emp-training-kpis">{kpi.map(item=><button key={item[0]} className={filter===item[2]?'is-active':''} onClick={()=>setFilter(item[2])}><span>{item[0]}</span><strong>{item[1]}</strong><small>Klicken zum Filtern</small></button>)}</div>
    <div className="emp-training-tabs">{['all','valid','warn','expired','controlDue','missing','archived'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="check" size={14}/>Kontrolle durchführen</button><button><Icon name="cal" size={14}/>Kontrolltermin planen</button><button><Icon name="download" size={14}/>Dokumente herunterladen</button><button><Icon name="edit" size={14}/>Freigabe ändern</button><button><Icon name="mail" size={14}/>Erinnerung senden</button></div>}
    <div className="emp-table-wrap"><table className="emp-license-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          {columns.map(([key])=><td key={key} className={(key==='description'?'emp-ellipsis ':'')+(key==='days'&&row.days<0?'is-overdue':'')}>{cellValue(row,key)}</td>)}
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeLicenseArea({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeLicenseView') || 'list');
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('all');
  const [filterOpen,setFilterOpen]=React.useState(false);
  const [createOpen,setCreateOpen]=React.useState(false);
  const [createStep,setCreateStep]=React.useState(1);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'licenseClass',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [rowActionMenu,setRowActionMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const defaultHiddenColumns=React.useMemo(()=>new Set(['origin','last','days','released','responsible','description','history','companyShort','department','position']),[]);
  const [hiddenColumns,setHiddenColumns]=React.useState(defaultHiddenColumns);
  const [filters,setFilters]=React.useState({employee:'',company:'all',department:'all',position:'',licenseClass:'',origin:'all',controlStatus:'all',status:'all',nextFrom:'',nextTo:'',expiresUntil:'all',document:'all',released:'all',permit:'all',archived:false});
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const departments=React.useMemo(()=>Array.from(new Set(sourceEmployees.map(item=>item.department))).sort((a,b)=>a.localeCompare(b,'de')),[sourceEmployees]);
  React.useEffect(()=>localStorage.setItem('employeeLicenseView',viewMode),[viewMode]);
  const activeEmployees=React.useMemo(()=>scope==='all'?sourceEmployees:sourceEmployees.filter(item=>item.id===scope),[scope,sourceEmployees]);
  const isAllView=scope!==emp.id;
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeLicenseRecords),[activeEmployees]);
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen',missing:'Dokument fehlt',archived:'Archiviert'};
  const controlLabels={current:'Kontrolle aktuell',due:'Kontrolle bald fällig',overdue:'Kontrolle überfällig',planned:'Kontrolle geplant',done:'Kontrolle durchgeführt',missing:'Kontrollnachweis fehlt'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='controlStatus'?controlLabels[row.controlStatus]:key==='history'?row.history:row[key];
  const withinDate=(date,from,to)=>{const parsed=(date||'').split('.').reverse().join('-');return (!from||parsed>=from)&&(!to||parsed<=to);};
  let rows=filter==='all'?records:filter==='controlDue'?records.filter(row=>['due','overdue'].includes(row.controlStatus)):filter==='missing'?records.filter(row=>row.documentMissing||row.controlMissing):records.filter(row=>row.status===filter);
  rows=rows.filter(row=>{
    if(filters.employee&&!(row.employeeName.toLowerCase().includes(filters.employee.toLowerCase())||String(row.employee.personalNr||'').includes(filters.employee))) return false;
    if(filters.company!=='all'&&row.employee.company!==filters.company) return false;
    if(filters.department!=='all'&&row.department!==filters.department) return false;
    if(filters.position&&!(row.position||'').toLowerCase().includes(filters.position.toLowerCase())) return false;
    if(filters.licenseClass&&!(row.licenseClass||'').toLowerCase().includes(filters.licenseClass.toLowerCase())) return false;
    if(filters.origin!=='all'&&row.origin!==filters.origin) return false;
    if(filters.controlStatus!=='all'&&row.controlStatus!==filters.controlStatus) return false;
    if(filters.status!=='all'&&row.status!==filters.status) return false;
    if(!withinDate(row.next,filters.nextFrom,filters.nextTo)) return false;
    if(filters.expiresUntil!=='all'&&!(row.days>=0&&row.days<=Number(filters.expiresUntil))) return false;
    if(filters.document==='present'&&(row.documentMissing||row.controlMissing)) return false;
    if(filters.document==='missing'&&!(row.documentMissing||row.controlMissing)) return false;
    if(filters.released!=='all'&&String(row.released)!==filters.released) return false;
    if(filters.permit!=='all'&&row.drivingPermit!==filters.permit) return false;
    if(!filters.archived&&row.status==='archived') return false;
    return true;
  });
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const pickerEmployees=React.useMemo(()=>{
    const q=employeeSearch.trim().toLowerCase();
    return sourceEmployees.filter(item=>{
      if(q&&!`${item.lastName} ${item.firstName} ${item.personalNr}`.toLowerCase().includes(q)) return false;
      if(employeeCompanyFilter!=='all'&&item.company!==employeeCompanyFilter) return false;
      if(employeeDepartmentFilter!=='all'&&item.department!==employeeDepartmentFilter) return false;
      if(employeePositionFilter&&!(item.position||'').toLowerCase().includes(employeePositionFilter.toLowerCase())) return false;
      if(employeeStatusFilter!=='all'&&item.status!==employeeStatusFilter) return false;
      return true;
    }).sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
  },[sourceEmployees,employeeSearch,employeeCompanyFilter,employeeDepartmentFilter,employeePositionFilter,employeeStatusFilter]);
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter']]:[]),
    ['licenseClass','Führerscheinklasse'],['number','Führerscheinnummer'],['next','Nächste Kontrolle'],['controlStatus','Kontrollstatus'],['expires','Führerschein gültig bis'],['status','Gültigkeitsstatus'],['document','Dokument'],
    ['origin','Herkunft / Ausstellungsland'],['last','Letzte Kontrolle'],['days','Restlaufzeit'],['released','Freigabe für Mitarbeiter'],['responsible','Verantwortliche Person'],['companyShort','Firma'],['department','Abteilung'],['position','Position'],['history','Kontrollhistorie'],['description','Beschreibung'],['actions','Aktionen']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key));
  const tabLabels={all:`Alle ${records.length}`,valid:`Gültig ${records.filter(row=>row.status==='valid').length}`,warn:`Läuft bald ab ${records.filter(row=>row.status==='warn').length}`,expired:`Abgelaufen ${records.filter(row=>row.status==='expired').length}`,controlDue:`Kontrolle fällig ${records.filter(row=>['due','overdue'].includes(row.controlStatus)).length}`,missing:`Dokument fehlt ${records.filter(row=>row.documentMissing||row.controlMissing).length}`,archived:'Archiviert 0'};
  const activeFilterCount=Object.entries(filters).filter(([key,val])=>key==='archived'?val:val&&val!=='all').length;
  const cellValue=(row,key)=>{
    if(key==='employeeName'||key==='licenseClass') return <strong>{row[key]}</strong>;
    if(key==='days') return row.days<0?<span className="is-overdue">seit {Math.abs(row.days)} Tagen</span>:`in ${row.days} Tagen`;
    if(key==='status') return <span className={'emp-status is-'+row.status}>{labels[row.status]}</span>;
    if(key==='controlStatus') return <span className={'emp-status is-'+(row.controlStatus==='current'||row.controlStatus==='done'?'valid':row.controlStatus==='due'||row.controlStatus==='planned'?'warn':'expired')}>{controlLabels[row.controlStatus]}</span>;
    if(key==='released') return <span className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='document') return <span className={'emp-doc-count '+(row.documentMissing||row.controlMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing||row.controlMissing?'fehlt':1}</span>;
    if(key==='actions') return <div className="emp-row-actions"><button className="emp-row-menu-btn" onClick={event=>{event.stopPropagation();setRowActionMenu(rowActionMenu===row.id?null:row.id);}}>⋮</button>{rowActionMenu===row.id&&<div className="emp-row-menu"><button>Details anzeigen</button><button>Bearbeiten</button><button>Kontrolle durchführen</button><button>Kontrolltermin planen</button><button>Dokument ersetzen</button><button>Freigabe ändern</button><button>Archivieren</button><button>Löschen</button></div>}</div>;
    return row[key];
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Führerscheine - alle Mitarbeiter':`Führerschein (${currentEmployee.name})`} onBack={onBack} action={<div className="emp-training-toolbar"><button onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {isAllView?'Alle Mitarbeiter':currentEmployee.name}</button><div className="emp-view-toggle"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setViewMode('cards')}>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setViewMode('list')}>Liste</button></div><button onClick={()=>setFilterOpen(true)}><Icon name="settings" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button><button onClick={()=>setCreateOpen(true)}><Icon name="plus" size={14}/>Führerschein hinzufügen</button></div>}/>
    <div className="emp-training-tabs">{['all','valid','warn','expired','controlDue','missing','archived'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="cal" size={14}/>Kontrolltermine planen</button><button><Icon name="mail" size={14}/>Erinnerung senden</button><button><Icon name="users" size={14}/>Verantwortliche Person ändern</button><button><Icon name="download" size={14}/>Dokumente herunterladen</button><button><Icon name="edit" size={14}/>Fahrberechtigung ändern</button><button><Icon name="trash" size={14}/>Archivieren</button></div>}
    {viewMode==='cards'&&<div className="emp-license-card-grid">{rows.map(row=><button key={row.id} className={'emp-license-card is-'+row.status} onClick={()=>onOpen(row)}><header><div><strong>{row.licenseClass}</strong><span>{row.employeeName}</span></div><span className={'emp-status is-'+row.status}>{labels[row.status]}</span></header><div><span>Führerscheinnummer</span><b>{row.number}</b></div><div><span>Nächste Kontrolle</span><b>{row.next}</b></div><div><span>Gültig bis</span><b>{row.expires}</b></div><footer><span className={'emp-status is-'+(row.controlStatus==='current'?'valid':row.controlStatus==='due'?'warn':'expired')}>{controlLabels[row.controlStatus]}</span><span className={'emp-doc-count '+(row.documentMissing||row.controlMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing||row.controlMissing?'fehlt':'Dokument'}</span><span>⋮</span></footer></button>)}</div>}
    {viewMode==='list'&&<div className="emp-table-wrap"><table className="emp-license-table"><thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>{columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button><button onClick={()=>setMenu(null)}>Spalten verwalten</button><button onClick={()=>{setHiddenColumns(defaultHiddenColumns);setMenu(null);}}>Standardansicht wiederherstellen</button></div>}</th>)}</tr></thead><tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}<tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>{columns.map(([key])=><td key={key} className={(key==='description'?'emp-ellipsis ':'')+(key==='days'&&row.days<0?'is-overdue':'')}>{cellValue(row,key)}</td>)}</tr></React.Fragment>)}</tbody></table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Führerschein</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Ausgeschieden</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);setSelected(new Set());}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);setSelected(new Set());}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterOpen&&<aside className="emp-filter-drawer"><header><div><span>Führerschein</span><h2>Filter</h2></div><button onClick={()=>setFilterOpen(false)}>×</button></header><div className="emp-filter-grid"><label>Mitarbeiter<input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))}/></label><label>Firma<select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Abteilung<select value={filters.department} onChange={event=>setFilters(old=>({...old,department:event.target.value}))}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label>Position<input value={filters.position} onChange={event=>setFilters(old=>({...old,position:event.target.value}))}/></label><label>Führerscheinklasse<input value={filters.licenseClass} onChange={event=>setFilters(old=>({...old,licenseClass:event.target.value}))}/></label><label>Ausstellungsland<select value={filters.origin} onChange={event=>setFilters(old=>({...old,origin:event.target.value}))}><option value="all">Alle Länder</option><option>Deutschland</option><option>EU</option></select></label><label>Kontrollstatus<select value={filters.controlStatus} onChange={event=>setFilters(old=>({...old,controlStatus:event.target.value}))}><option value="all">Alle</option>{Object.entries(controlLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Gültigkeitsstatus<select value={filters.status} onChange={event=>setFilters(old=>({...old,status:event.target.value}))}><option value="all">Alle</option>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Nächste Kontrolle von<input type="date" value={filters.nextFrom} onChange={event=>setFilters(old=>({...old,nextFrom:event.target.value}))}/></label><label>Nächste Kontrolle bis<input type="date" value={filters.nextTo} onChange={event=>setFilters(old=>({...old,nextTo:event.target.value}))}/></label><label>Läuft innerhalb<select value={filters.expiresUntil} onChange={event=>setFilters(old=>({...old,expiresUntil:event.target.value}))}><option value="all">Alle Zeiten</option><option value="30">30 Tage</option><option value="60">60 Tage</option><option value="90">90 Tage</option></select></label><label>Dokument<select value={filters.document} onChange={event=>setFilters(old=>({...old,document:event.target.value}))}><option value="all">Alle</option><option value="present">vorhanden</option><option value="missing">fehlt</option></select></label><label>Freigabe<select value={filters.released} onChange={event=>setFilters(old=>({...old,released:event.target.value}))}><option value="all">Alle</option><option value="true">Freigegeben</option><option value="false">Nicht freigegeben</option></select></label><label>Fahrberechtigung<select value={filters.permit} onChange={event=>setFilters(old=>({...old,permit:event.target.value}))}><option value="all">Alle</option><option>Freigegeben</option><option>Prüfung erforderlich</option><option>Gesperrt</option></select></label><label className="emp-check-label"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Einträge anzeigen</label></div><footer><button onClick={()=>setFilters({employee:'',company:'all',department:'all',position:'',licenseClass:'',origin:'all',controlStatus:'all',status:'all',nextFrom:'',nextTo:'',expiresUntil:'all',document:'all',released:'all',permit:'all',archived:false})}>Filter zurücksetzen</button><button onClick={()=>setFilterOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterOpen(false)}>Filter anwenden</button></footer></aside>}
    {createOpen&&<div className="emp-create-backdrop" onClick={()=>setCreateOpen(false)}><section className="emp-create-modal" onClick={event=>event.stopPropagation()}><header><div><span>Führerschein</span><h2>Führerschein hinzufügen</h2><p>Schritt {createStep} von 6</p></div><button onClick={()=>setCreateOpen(false)}>×</button></header><div className="emp-create-steps">{['Mitarbeiter','Führerscheindaten','Kontrolle','Berechtigung','Dokumente','Zusammenfassung'].map((item,index)=><button key={item} className={createStep===index+1?'is-active':''} onClick={()=>setCreateStep(index+1)}>{index+1}. {item}</button>)}</div><div className="emp-create-body">{createStep===1&&<div className="emp-form-grid"><label>Mitarbeiter<select><option>{emp.name}</option><option>Mehrere Mitarbeiter auswählen</option></select></label><label>Verantwortliche Person<select><option>Sabine Janning</option><option>Rahim Ahangarzadeh</option></select></label><label>Firma<input value={window.company(emp.company)?.name || emp.company} readOnly/></label><label>Abteilung / Position<input value={`${emp.department} · ${emp.position}`} readOnly/></label></div>}{createStep===2&&<div className="emp-form-grid"><label>Führerscheinklasse<input placeholder="B, BE, C, CE"/></label><label>Führerscheinnummer<input placeholder="FS-2026-001"/></label><label>Ausstellungsland<select><option>Deutschland</option><option>EU</option></select></label><label>Ausstellungsdatum<input type="date"/></label><label>Gültig ab<input type="date"/></label><label>Führerschein gültig bis<input type="date"/></label><label className="emp-check-label"><input type="checkbox"/>Unbefristet</label></div>}{createStep===3&&<div className="emp-form-grid"><label>Letzte Kontrolle<input type="date"/></label><label>Nächste Kontrolle<input type="date"/></label><label>Kontrollintervall<select><option>halbjährlich</option><option>jährlich</option><option>benutzerdefiniert</option></select></label><label>Kontrollstatus<select><option>Kontrolle aktuell</option><option>Kontrolle bald fällig</option><option>Kontrolle überfällig</option><option>Kontrolle geplant</option></select></label><label>Kontrolliert von<input/></label><label className="emp-check-label"><input type="checkbox"/>Original vorgelegt</label></div>}{createStep===4&&<div className="emp-form-grid"><label>Fahrberechtigung im Unternehmen<select><option>Freigegeben</option><option>Eingeschränkt</option><option>Gesperrt</option><option>Prüfung erforderlich</option></select></label><label>Freigabe für Mitarbeiter<select><option>freigegeben</option><option>nicht freigegeben</option><option>nur Status sichtbar</option><option>Status und Dokument sichtbar</option></select></label><label className="is-wide">Bemerkung<textarea rows="3"/></label><label className="is-wide">Beschreibung<textarea rows="3"/></label></div>}{createStep===5&&<div className="emp-form-grid"><label>Führerschein-Vorderseite<input type="file"/></label><label>Führerschein-Rückseite<input type="file"/></label><label>Kontrollnachweis<input type="file"/></label><label>Weitere Dokumente<input type="file" multiple/></label><p className="emp-form-summary">Unterstützte Formate: PDF, JPG, PNG. Die Dateien enthalten persönliche Daten und sind nur für berechtigte Personen sichtbar.</p></div>}{createStep===6&&<div className="emp-create-summary"><strong>Zusammenfassung</strong><span>Mitarbeiter: {emp.name}</span><span>Führerscheinklassen: B, BE, C, CE</span><span>Nächste Kontrolle: 10.03.2026</span><span>Fahrberechtigung: Freigegeben</span><span>Freigabe: Status und Dokument sichtbar</span></div>}</div><footer><button onClick={()=>setCreateOpen(false)}>Abbrechen</button><button onClick={()=>setCreateOpen(false)}>Als Entwurf speichern</button>{createStep>1&&<button onClick={()=>setCreateStep(step=>step-1)}>Zurück</button>}{createStep<6?<button className="btn btn--primary" onClick={()=>setCreateStep(step=>step+1)}>Weiter</button>:<button className="btn btn--primary" onClick={()=>setCreateOpen(false)}>Führerschein hinzufügen</button>}</footer></section></div>}
  </div>;
}

function EmployeeLicenseRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const displayEmp=form.employee || emp;
  const statusName=form.status==='valid'?'Gültig':form.status==='warn'?'Läuft bald ab':form.status==='missing'?'Dokument fehlt':form.status==='archived'?'Archiviert':'Abgelaufen';
  const controlName={current:'Kontrolle aktuell',due:'Kontrolle bald fällig',overdue:'Kontrolle überfällig',planned:'Kontrolle geplant',done:'Kontrolle durchgeführt',missing:'Kontrollnachweis fehlt'}[form.controlStatus] || 'Kontrolle aktuell';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`Führerschein ${record.licenseClass} (${displayEmp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card">
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Mitarbeiter" icon="users" value={displayEmp.name}/>
        <TrainingRecordField label="Firma" icon="building" value={form.company || window.company(displayEmp.company)?.name || displayEmp.company}/>
        <TrainingRecordField label="Abteilung / Position" icon="group" value={`${form.department || displayEmp.department} · ${form.position || displayEmp.position}`}/>
        <TrainingRecordField label="Führerscheinklasse" icon="doc" editing={editing} value={form.licenseClass}><input value={form.licenseClass} onChange={e=>set('licenseClass',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Herkunft / Ausstellungsland" icon="pin" editing={editing} value={form.origin}><input value={form.origin} onChange={e=>set('origin',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Führerscheinnummer" icon="doc" editing={editing} value={form.number}><input value={form.number || ''} onChange={e=>set('number',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ausstellungsdatum" icon="cal" editing={editing} value={form.issued || '-'}><input value={form.issued || ''} onChange={e=>set('issued',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültig ab" icon="cal" editing={editing} value={form.validFrom || '-'}><input value={form.validFrom || ''} onChange={e=>set('validFrom',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Letzte Kontrolle" icon="cal" editing={editing} value={form.last}><input value={form.last} onChange={e=>set('last',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Nächste Kontrolle" icon="cal" editing={editing} value={form.next}><input value={form.next} onChange={e=>set('next',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Kontrollstatus" icon="check" editing={editing} value={controlName}><select value={form.controlStatus || 'current'} onChange={e=>set('controlStatus',e.target.value)}><option value="current">Kontrolle aktuell</option><option value="due">Kontrolle bald fällig</option><option value="overdue">Kontrolle überfällig</option><option value="planned">Kontrolle geplant</option><option value="done">Kontrolle durchgeführt</option><option value="missing">Kontrollnachweis fehlt</option></select></TrainingRecordField>
        <TrainingRecordField label="Führerschein gültig bis" icon="cal" editing={editing} value={form.expires}><input value={form.expires} onChange={e=>set('expires',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage abgelaufen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Gültigkeitsstatus" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option><option value="missing">Dokument fehlt</option><option value="archived">Archiviert</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigabe für Mitarbeiter" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Fahrberechtigung im Unternehmen" icon="shield" editing={editing} value={form.drivingPermit || '-'}><select value={form.drivingPermit || 'Freigegeben'} onChange={e=>set('drivingPermit',e.target.value)}><option>Freigegeben</option><option>Prüfung erforderlich</option><option>Gesperrt</option><option>Nur intern freigegeben</option></select></TrainingRecordField>
        <TrainingRecordField label="Verantwortliche Person" icon="users" editing={editing} value={form.responsible || '-'}><input value={form.responsible || ''} onChange={e=>set('responsible',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Kontrollhistorie" icon="history" value={`${form.history} Versionen`}/>
        <TrainingRecordField label="Bemerkung" icon="doc" editing={editing} value={form.remark || '-'} wide><textarea rows="2" value={form.remark || ''} onChange={e=>set('remark',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeOperatorRecords(emp) {
  return [
    {baseId:'op-1',device:'Bagger',manufacturer:'Hydraulikbagger bis 30 t',training:'Ausbildung Erdbaumaschinenführer',instruction:'Einweisung Baustelle / Betriebshof',authorization:'vorhanden',issued:'12.05.2024',validFrom:'12.05.2024',expires:'12.05.2027',nextInstruction:'12.05.2026',days:342,status:'valid',trainingStatus:'gültig',instructionStatus:'aktuell',authorizationStatus:'vorhanden',released:true,trainingCenter:'DEKRA Akademie',instructor:'Frau Möller',responsible:'Alexander Petersen',operationArea:'Baustellen Tiefbau',restriction:'bis 30 t',history:6,description:'Berechtigung zum Führen von Hydraulikbaggern bis 30 t.',document:'Geraetefuehrer_Bagger.pdf'},
    {baseId:'op-2',device:'Radlader',manufacturer:'Volvo L30 / RL-04',training:'Betriebliche Einweisung Radlader',instruction:'Einweisung bestimmtes Gerät',authorization:'vorhanden',issued:'08.08.2025',validFrom:'08.08.2025',expires:'08.08.2026',nextInstruction:'08.08.2026',days:65,status:'warn',trainingStatus:'gültig',instructionStatus:'fällig',authorizationStatus:'vorhanden',released:true,trainingCenter:'Interne Schulung',instructor:'Markus Brinker',responsible:'Michael Janning',operationArea:'Betriebshof und Baustellen',restriction:'nur RL-04',history:4,description:'Betriebliche Einweisung für Radlader auf Baustellen und Betriebshof.',document:'Einweisung_Radlader.pdf'},
    {baseId:'op-3',device:'Gabelstapler',manufacturer:'Flurförderzeuge',training:'Fahrausweis für Flurförderzeuge',instruction:'Jährliche Unterweisung fehlt',authorization:'abgelaufen',issued:'18.04.2023',validFrom:'18.04.2023',expires:'18.04.2026',nextInstruction:'18.04.2025',days:-47,status:'expired',trainingStatus:'abgelaufen',instructionStatus:'überfällig',authorizationStatus:'abgelaufen',released:false,trainingCenter:'TÜV Nord Akademie',instructor:'Herr Schneider',responsible:'Christian Janning',operationArea:'Lager und Betriebshof',restriction:'Einsatz derzeit gesperrt',history:5,description:'Fahrausweis und jährliche Unterweisung für Flurförderzeuge.',document:'Fahrausweis_Gabelstapler.pdf'},
  ].map((row,index)=>({
    ...row,
    id:`${emp.id}-${row.baseId}`,
    employeeId:emp.id,
    employee:emp,
    employeeName:`${emp.lastName}, ${emp.firstName}`,
    company:window.company(emp.company)?.name || emp.company,
    companyShort:window.company(emp.company)?.short || emp.company,
    department:emp.department,
    position:emp.position,
    documentMissing:index===1 && emp.status === 'aktiv',
    authorizationMissing:row.authorizationStatus==='abgelaufen' || row.authorizationStatus==='fehlt',
    warning:row.status==='expired' ? `${row.device}-Berechtigung seit ${Math.abs(row.days)} Tagen abgelaufen. Einsatz derzeit nicht freigegeben.` : row.instructionStatus==='fällig' ? 'Jährliche Unterweisung bald fällig.' : 'Nachweise vollständig dokumentiert.',
  }));
}

function EmployeeOperatorAreaLegacy({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope==='active') return sourceEmployees.filter(item=>item.status==='aktiv');
    if(scope==='inactive') return sourceEmployees.filter(item=>item.status!=='aktiv');
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope!==emp.id;
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeOperatorRecords),[activeEmployees]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'device',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const [hiddenColumns,setHiddenColumns]=React.useState(new Set());
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen',instructionDue:'Unterweisung fällig',authorizationMissing:'Beauftragung fehlt',documentMissing:'Dokument fehlt',blocked:'Gesperrt',archived:'Archiviert'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  let rows=filter==='all'?records:
    filter==='instructionDue'?records.filter(row=>['fällig','überfällig'].includes(row.instructionStatus)):
    filter==='authorizationMissing'?records.filter(row=>row.authorizationMissing):
    filter==='documentMissing'?records.filter(row=>row.documentMissing):
    records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter'],['companyShort','Firma'],['department','Abteilung'],['position','Position']]:[]),
    ['device','Gerätetyp'],['manufacturer','Hersteller / Gerätegruppe'],['training','Ausbildung'],['instruction','Betriebliche Einweisung'],['authorization','Schriftliche Beauftragung'],['issued','Ausstellungsdatum'],['expires','Ablaufdatum'],['nextInstruction','Nächste Unterweisung'],['days','Restlaufzeit'],['status','Gesamtstatus'],['operationArea','Einsatzbereich'],['restriction','Einschränkungen'],['released','Freigabe für Mitarbeiter'],['history','Nachweis- und Änderungshistorie'],['document','Dokumente'],['actions','Aktionen']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key));
  const tabLabels={all:`Alle ${records.length}`,valid:`Gültig ${records.filter(row=>row.status==='valid').length}`,warn:`Läuft bald ab ${records.filter(row=>row.status==='warn').length}`,expired:`Abgelaufen ${records.filter(row=>row.status==='expired').length}`,instructionDue:`Unterweisung fällig ${records.filter(row=>['fällig','überfällig'].includes(row.instructionStatus)).length}`,authorizationMissing:`Beauftragung fehlt ${records.filter(row=>row.authorizationMissing).length}`,documentMissing:`Dokument fehlt ${records.filter(row=>row.documentMissing).length}`,archived:'Archiviert'};
  const statusClass=status=>status==='valid'?'valid':status==='warn'||status==='instructionDue'||status==='documentMissing'?'warn':status==='archived'?'archived':'expired';
  const kpi=[
    ['Geräteberechtigungen',records.length,'all'],
    ['Gültig',records.filter(row=>row.status==='valid').length,'valid'],
    ['Laufen bald ab',records.filter(row=>row.status==='warn').length,'warn'],
    ['Unterweisung fällig',records.filter(row=>['fällig','überfällig'].includes(row.instructionStatus)).length,'instructionDue'],
    ['Beauftragung fehlt',records.filter(row=>row.authorizationMissing).length,'authorizationMissing'],
  ];
  const cellValue=(row,key)=>{
    if(key==='employeeName'||key==='device') return <strong>{row[key]}</strong>;
    if(key==='days') return row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`;
    if(key==='status') return <span className={'emp-status is-'+statusClass(row.status)}>{labels[row.status]}</span>;
    if(key==='authorization') return <span className={'emp-status is-'+(row.authorizationStatus==='vorhanden'?'valid':row.authorizationStatus==='widerrufen'||row.authorizationStatus==='abgelaufen'?'expired':'warn')}>{row.authorization}</span>;
    if(key==='released') return <span className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='history') return <span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Ereignisse</span>;
    if(key==='document') return <span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'fehlt':1}</span>;
    if(key==='actions') return <button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button>;
    return row[key];
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Geräteführer - alle Mitarbeiter':`Geräteführer (${currentEmployee.name})`} onBack={onBack} action={
      <div className="emp-training-toolbar">
        <label>Mitarbeiter auswählen<select value={scope} onChange={event=>{setScope(event.target.value);setSelected(new Set());}}>
          <option value={emp.id}>{emp.name}</option>
          <option value="all">Alle Mitarbeiter</option>
          <option value="active">Nur aktive Mitarbeiter</option>
          <option value="inactive">Ausgeschiedene Mitarbeiter</option>
          {window.SEED.companies.map(company=><option key={company.id} value={`company:${company.id}`}>{company.name}</option>)}
          {window.SEED.departments.map(dept=><option key={dept} value={`department:${dept}`}>Abteilung: {dept}</option>)}
          {sourceEmployees.filter(item=>item.id!==emp.id).slice().sort((a,b)=>a.lastName.localeCompare(b.lastName,'de')).map(item=><option key={item.id} value={item.id}>{item.lastName}, {item.firstName}</option>)}
        </select></label>
        <button><Icon name="settings" size={14}/>Filter</button>
        <button><Icon name="plus" size={14}/>Geräteberechtigung hinzufügen</button>
      </div>
    }/>
    <div className="emp-training-kpis">{kpi.map(item=><button key={item[0]} className={filter===item[2]?'is-active':''} onClick={()=>setFilter(item[2])}><span>{item[0]}</span><strong>{item[1]}</strong><small>Klicken zum Filtern</small></button>)}</div>
    <div className="emp-training-tabs">{['all','valid','warn','expired','instructionDue','authorizationMissing','documentMissing','archived'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="cal" size={14}/>Unterweisung planen</button><button><Icon name="check" size={14}/>Einweisung erfassen</button><button><Icon name="doc" size={14}/>Beauftragung erstellen</button><button><Icon name="users" size={14}/>Verantwortliche Person zuweisen</button><button><Icon name="edit" size={14}/>Freigabe ändern</button><button><Icon name="download" size={14}/>Dokumente herunterladen</button><button><Icon name="history" size={14}/>Archivieren</button></div>}
    <div className="emp-table-wrap"><table className="emp-operator-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          {columns.map(([key])=><td key={key} className={(key==='description'||key==='restriction'?'emp-ellipsis ':'')+(key==='days'&&row.days<0?'is-overdue':'')}>{cellValue(row,key)}</td>)}
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeOperatorArea({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeOperatorView')||'list');
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('all');
  const [filterOpen,setFilterOpen]=React.useState(false);
  const [createOpen,setCreateOpen]=React.useState(false);
  const [createStep,setCreateStep]=React.useState(1);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'device',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const defaultHiddenColumns=React.useMemo(()=>new Set(['manufacturer','issued','days','operationArea','restriction','trainingCenter','instructor','responsible','released','history','description','companyShort','department','position']),[]);
  const [hiddenColumns,setHiddenColumns]=React.useState(defaultHiddenColumns);
  const [filters,setFilters]=React.useState({employee:'',company:'all',department:'all',position:'',device:'',manufacturer:'',training:'',instruction:'all',authorization:'all',nextFrom:'',nextTo:'',expiresUntil:'all',status:'all',operationArea:'',document:'all',released:'all',archived:false});
  React.useEffect(()=>localStorage.setItem('employeeOperatorView',viewMode),[viewMode]);
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const departments=React.useMemo(()=>[...new Set(sourceEmployees.map(item=>item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de')), [sourceEmployees]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope!==emp.id;
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const currentScopeLabel=isAllView?'Alle Mitarbeiter':currentEmployee.name;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeOperatorRecords),[activeEmployees]);
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen',instructionDue:'Unterweisung fällig',authorizationMissing:'Beauftragung fehlt',documentMissing:'Dokument fehlt',archived:'Archiviert'};
  const statusClass=status=>status==='valid'?'valid':status==='warn'||status==='instructionDue'||status==='authorizationMissing'||status==='documentMissing'?'warn':status==='archived'?'archived':'expired';
  const value=(row,key)=>key==='status'?labels[row.status]:(key==='document'?row.documentMissing?'fehlt':'vorhanden':row[key]);
  const matchesDate=(dateText,from,to)=>{
    if(!from&&!to) return true;
    const parts=String(dateText||'').split('.');
    if(parts.length!==3) return true;
    const iso=`${parts[2]}-${parts[1]}-${parts[0]}`;
    return (!from||iso>=from)&&(!to||iso<=to);
  };
  const activeFilterCount=Object.entries(filters).filter(([key,val])=>key==='archived'?val:val&&val!=='all').length;
  let rows=records.filter(row=>{
    if(filter==='valid'&&row.status!=='valid') return false;
    if(filter==='warn'&&row.status!=='warn') return false;
    if(filter==='expired'&&row.status!=='expired') return false;
    if(filter==='instructionDue'&&!['fällig','überfällig'].includes(row.instructionStatus)) return false;
    if(filter==='authorizationMissing'&&!row.authorizationMissing) return false;
    if(filter==='documentMissing'&&!row.documentMissing) return false;
    if(filter==='archived') return false;
    if(filters.employee&&!(row.employeeName||'').toLowerCase().includes(filters.employee.toLowerCase())) return false;
    if(filters.company!=='all'&&row.employee.company!==filters.company) return false;
    if(filters.department!=='all'&&row.department!==filters.department) return false;
    if(filters.position&&!String(row.position||'').toLowerCase().includes(filters.position.toLowerCase())) return false;
    if(filters.device&&!String(row.device||'').toLowerCase().includes(filters.device.toLowerCase())) return false;
    if(filters.manufacturer&&!String(row.manufacturer||'').toLowerCase().includes(filters.manufacturer.toLowerCase())) return false;
    if(filters.training&&!String(row.training||'').toLowerCase().includes(filters.training.toLowerCase())) return false;
    if(filters.instruction!=='all'&&row.instructionStatus!==filters.instruction) return false;
    if(filters.authorization!=='all'&&row.authorizationStatus!==filters.authorization) return false;
    if(!matchesDate(row.nextInstruction,filters.nextFrom,filters.nextTo)) return false;
    if(filters.expiresUntil!=='all'&&row.days>Number(filters.expiresUntil)) return false;
    if(filters.status!=='all'&&row.status!==filters.status) return false;
    if(filters.operationArea&&!String(row.operationArea||'').toLowerCase().includes(filters.operationArea.toLowerCase())) return false;
    if(filters.document==='missing'&&!row.documentMissing) return false;
    if(filters.document==='present'&&row.documentMissing) return false;
    if(filters.released==='true'&&!row.released) return false;
    if(filters.released==='false'&&row.released) return false;
    return true;
  });
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)??'').localeCompare(String(value(b,sort.key)??''),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const pickerEmployees=sourceEmployees.filter(item=>{
    const text=`${item.firstName} ${item.lastName} ${item.personalNr}`.toLowerCase();
    if(employeeSearch&&!text.includes(employeeSearch.toLowerCase())) return false;
    if(employeeCompanyFilter!=='all'&&item.company!==employeeCompanyFilter) return false;
    if(employeeDepartmentFilter!=='all'&&item.department!==employeeDepartmentFilter) return false;
    if(employeePositionFilter&&!item.position.toLowerCase().includes(employeePositionFilter.toLowerCase())) return false;
    if(employeeStatusFilter!=='all'&&item.status!==employeeStatusFilter) return false;
    return true;
  }).sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter']]:[]),
    ['device','Gerätetyp'],['training','Ausbildung'],['instruction','Betriebliche Einweisung'],['authorization','Schriftliche Beauftragung'],['nextInstruction','Nächste Unterweisung'],['expires','Ablaufdatum'],['status','Gesamtstatus'],['document','Dokument'],['actions','Aktionen'],
    ['manufacturer','Hersteller / Gerätegruppe'],['issued','Ausstellungsdatum'],['days','Restlaufzeit'],['operationArea','Einsatzbereich'],['restriction','Einschränkungen'],['trainingCenter','Ausbildungsstelle'],['instructor','Ausbilder / Einweiser'],['responsible','Verantwortliche Führungskraft'],['released','Freigabe für Mitarbeiter'],['history','Nachweis- und Änderungshistorie'],['description','Beschreibung'],['companyShort','Firma'],['department','Abteilung'],['position','Position']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key)||key==='actions');
  const tabLabels={all:`Alle ${records.length}`,valid:`Gültig ${records.filter(row=>row.status==='valid').length}`,warn:`Läuft bald ab ${records.filter(row=>row.status==='warn').length}`,expired:`Abgelaufen ${records.filter(row=>row.status==='expired').length}`,instructionDue:`Unterweisung fällig ${records.filter(row=>['fällig','überfällig'].includes(row.instructionStatus)).length}`,authorizationMissing:`Beauftragung fehlt ${records.filter(row=>row.authorizationMissing).length}`,documentMissing:`Dokument fehlt ${records.filter(row=>row.documentMissing).length}`,archived:'Archiviert 0'};
  const cellValue=(row,key)=>{
    if(key==='employeeName') return <div><strong>{row.employeeName}</strong><small>PN {row.employee.personalNr}</small></div>;
    if(key==='device') return <strong>{row.device}</strong>;
    if(key==='instruction') return <div><strong>{row.instruction}</strong><small>{row.instructionStatus}</small></div>;
    if(key==='authorization') return <div><strong>{row.authorization}</strong><small>{row.authorizationStatus}</small></div>;
    if(key==='days') return row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`;
    if(key==='status') return <span className={'emp-status is-'+statusClass(row.status)}>{labels[row.status]}</span>;
    if(key==='document') return <span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'fehlt':'1 Datei'}</span>;
    if(key==='released') return <span className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='history') return <span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Ereignisse</span>;
    if(key==='actions') return <button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button>;
    return row[key]||'-';
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Geräteführer - alle Mitarbeiter':`Geräteführer (${currentEmployee.name})`} onBack={onBack} action={<div className="emp-training-toolbar"><button onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {currentScopeLabel}</button><div className="emp-view-toggle"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setViewMode('cards')}>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setViewMode('list')}>Liste</button></div><button onClick={()=>setFilterOpen(true)}><Icon name="settings" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button><button onClick={()=>setCreateOpen(true)}><Icon name="plus" size={14}/>Geräteberechtigung hinzufügen</button></div>}/>
    <div className="emp-training-tabs">{Object.keys(tabLabels).map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(defaultHiddenColumns)}>Standardansicht</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="cal" size={14}/>Unterweisung planen</button><button><Icon name="check" size={14}/>Einweisung erfassen</button><button><Icon name="doc" size={14}/>Beauftragung erstellen</button><button><Icon name="users" size={14}/>Verantwortliche Person zuweisen</button><button><Icon name="download" size={14}/>Export</button></div>}
    {viewMode==='cards'&&<div className="emp-license-card-grid emp-operator-card-grid">{rows.map(row=><button key={row.id} className={'emp-license-card emp-operator-card is-'+row.status} onClick={()=>onOpen(row)}><header><div><strong>{row.device}</strong><span>{row.employeeName}</span></div><span className={'emp-status is-'+statusClass(row.status)}>{labels[row.status]}</span></header><div><span>Ausbildung</span><b>{row.training}</b></div><div><span>Einweisung</span><b>{row.instructionStatus}</b></div><div><span>Beauftragung</span><b>{row.authorizationStatus}</b></div><footer><span>{row.nextInstruction}</span><span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'Dokument fehlt':'Dokument'}</span><span>⋮</span></footer></button>)}</div>}
    {viewMode==='list'&&<div className="emp-table-wrap emp-operator-table-wrap"><table className="emp-operator-table emp-operator-table--compact"><thead><tr><th className="emp-check emp-sticky-select"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>{columns.map(([key,label])=><th key={key} className={(key==='device'?'emp-sticky-device ':'')+(key==='actions'?'emp-sticky-actions':'')}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button>{key!=='actions'&&<button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button>}<button onClick={()=>{setHiddenColumns(defaultHiddenColumns);setMenu(null);}}>Standardansicht wiederherstellen</button></div>}</th>)}</tr></thead><tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}<tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check emp-sticky-select" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>{columns.map(([key])=><td key={key} className={(key==='device'?'emp-sticky-device ':'')+(key==='actions'?'emp-sticky-actions ':'')+(key==='description'||key==='restriction'?'emp-ellipsis ':'')+(key==='days'&&row.days<0?'is-overdue':'')}>{cellValue(row,key)}</td>)}</tr></React.Fragment>)}</tbody></table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Geräteführer</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Ausgeschieden</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);setSelected(new Set());}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);setSelected(new Set());}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterOpen&&<aside className="emp-filter-drawer"><header><div><span>Geräteführer</span><h2>Filter</h2></div><button onClick={()=>setFilterOpen(false)}>×</button></header><div className="emp-filter-grid"><label>Mitarbeiter<input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))}/></label><label>Firma<select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Abteilung<select value={filters.department} onChange={event=>setFilters(old=>({...old,department:event.target.value}))}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label>Position<input value={filters.position} onChange={event=>setFilters(old=>({...old,position:event.target.value}))}/></label><label>Gerätetyp<input value={filters.device} onChange={event=>setFilters(old=>({...old,device:event.target.value}))}/></label><label>Hersteller / Gerätegruppe<input value={filters.manufacturer} onChange={event=>setFilters(old=>({...old,manufacturer:event.target.value}))}/></label><label>Ausbildung<input value={filters.training} onChange={event=>setFilters(old=>({...old,training:event.target.value}))}/></label><label>Einweisungsstatus<select value={filters.instruction} onChange={event=>setFilters(old=>({...old,instruction:event.target.value}))}><option value="all">Alle</option><option>aktuell</option><option>fällig</option><option>überfällig</option></select></label><label>Beauftragungsstatus<select value={filters.authorization} onChange={event=>setFilters(old=>({...old,authorization:event.target.value}))}><option value="all">Alle</option><option>vorhanden</option><option>fehlt</option><option>abgelaufen</option><option>widerrufen</option></select></label><label>Nächste Unterweisung von<input type="date" value={filters.nextFrom} onChange={event=>setFilters(old=>({...old,nextFrom:event.target.value}))}/></label><label>Nächste Unterweisung bis<input type="date" value={filters.nextTo} onChange={event=>setFilters(old=>({...old,nextTo:event.target.value}))}/></label><label>Läuft innerhalb<select value={filters.expiresUntil} onChange={event=>setFilters(old=>({...old,expiresUntil:event.target.value}))}><option value="all">Alle Zeiten</option><option value="30">30 Tage</option><option value="60">60 Tage</option><option value="90">90 Tage</option></select></label><label>Gesamtstatus<select value={filters.status} onChange={event=>setFilters(old=>({...old,status:event.target.value}))}><option value="all">Alle</option>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Einsatzbereich<input value={filters.operationArea} onChange={event=>setFilters(old=>({...old,operationArea:event.target.value}))}/></label><label>Dokument<select value={filters.document} onChange={event=>setFilters(old=>({...old,document:event.target.value}))}><option value="all">Alle</option><option value="present">vorhanden</option><option value="missing">fehlt</option></select></label><label>Freigabe<select value={filters.released} onChange={event=>setFilters(old=>({...old,released:event.target.value}))}><option value="all">Alle</option><option value="true">Freigegeben</option><option value="false">Nicht freigegeben</option></select></label><label className="emp-check-label"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Einträge anzeigen</label></div><footer><button onClick={()=>setFilters({employee:'',company:'all',department:'all',position:'',device:'',manufacturer:'',training:'',instruction:'all',authorization:'all',nextFrom:'',nextTo:'',expiresUntil:'all',status:'all',operationArea:'',document:'all',released:'all',archived:false})}>Zurücksetzen</button><button onClick={()=>setFilterOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterOpen(false)}>Anwenden</button></footer></aside>}
    {createOpen&&<div className="emp-create-backdrop" onClick={()=>setCreateOpen(false)}><section className="emp-create-modal" onClick={event=>event.stopPropagation()}><header><div><span>Geräteführer</span><h2>Geräteberechtigung hinzufügen</h2><p>Schritt {createStep} von 6</p></div><button onClick={()=>setCreateOpen(false)}>×</button></header><div className="emp-create-steps">{['Mitarbeiter','Gerät und Ausbildung','Einweisung','Beauftragung','Freigabe und Dokumente','Zusammenfassung'].map((item,index)=><button key={item} className={createStep===index+1?'is-active':''} onClick={()=>setCreateStep(index+1)}>{index+1}. {item}</button>)}</div><div className="emp-create-body">{createStep===1&&<div className="emp-form-grid"><label>Mitarbeiter<select><option>{currentScopeLabel}</option><option>Mehrere Mitarbeiter auswählen</option><option>Alle Mitarbeiter einer Firma</option></select></label><label>Firma<input value={window.company(currentEmployee.company)?.name || currentEmployee.company} readOnly/></label><label>Abteilung / Position<input value={`${currentEmployee.department} · ${currentEmployee.position}`} readOnly/></label><label>Verantwortliche Person<select><option>Alexander Petersen</option><option>Sabine Janning</option><option>Rahim Ahangarzadeh</option></select></label></div>}{createStep===2&&<div className="emp-form-grid"><label>Gerätetyp<input placeholder="Bagger, Radlader, Stapler"/></label><label>Hersteller / Gerätegruppe<input placeholder="Volvo L30 / Hydraulikbagger"/></label><label>Ausbildung / Einweisung<input placeholder="Ausbildung Erdbaumaschinenführer"/></label><label>Ausbildungsstelle<input placeholder="DEKRA Akademie"/></label><label>Ausbilder / Einweiser<input/></label><label>Einsatzbereich<input placeholder="Baustellen Tiefbau"/></label></div>}{createStep===3&&<div className="emp-form-grid"><label>Betriebliche Einweisung<select><option>aktuell</option><option>fällig</option><option>überfällig</option></select></label><label>Nächste Unterweisung<input type="date"/></label><label>Unterweisungsintervall<select><option>jährlich</option><option>alle 2 Jahre</option><option>projektbezogen</option></select></label><label className="is-wide">Beschreibung<textarea rows="3"/></label></div>}{createStep===4&&<div className="emp-form-grid"><label>Schriftliche Beauftragung<select><option>vorhanden</option><option>fehlt</option><option>widerrufen</option><option>abgelaufen</option></select></label><label>Gültig ab<input type="date"/></label><label>Ablaufdatum<input type="date"/></label><label>Einschränkungen<input placeholder="z.B. nur RL-04"/></label></div>}{createStep===5&&<div className="emp-form-grid"><label>Freigabe für Mitarbeiter<select><option>freigegeben</option><option>nicht freigegeben</option><option>nur Status sichtbar</option><option>Status und Dokument sichtbar</option></select></label><label>Gesamtstatus<select><option>Gültig</option><option>Läuft bald ab</option><option>Abgelaufen</option><option>Unterweisung fällig</option><option>Beauftragung fehlt</option><option>Dokument fehlt</option></select></label><label>Ausbildungsnachweis<input type="file"/></label><label>Einweisungsnachweis<input type="file"/></label><label>Beauftragung<input type="file"/></label><label>Weitere Dokumente<input type="file" multiple/></label></div>}{createStep===6&&<div className="emp-create-summary"><strong>Zusammenfassung</strong><span>Mitarbeiter: {currentScopeLabel}</span><span>Gerät: Radlader / Bagger</span><span>Einweisung: jährlich</span><span>Beauftragung: schriftlich vorhanden</span><span>Freigabe: Status und Dokument sichtbar</span></div>}</div><footer><button onClick={()=>setCreateOpen(false)}>Abbrechen</button><button onClick={()=>setCreateOpen(false)}>Als Entwurf speichern</button>{createStep>1&&<button onClick={()=>setCreateStep(step=>step-1)}>Zurück</button>}{createStep<6?<button className="btn btn--primary" onClick={()=>setCreateStep(step=>step+1)}>Weiter</button>:<button className="btn btn--primary" onClick={()=>setCreateOpen(false)}>Geräteberechtigung hinzufügen</button>}</footer></section></div>}
  </div>;
}

function EmployeeOperatorRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const displayEmp=form.employee || emp;
  const statusName=form.status==='valid'?'Gültig':form.status==='warn'?'Läuft bald ab':form.status==='instructionDue'?'Unterweisung fällig':form.status==='authorizationMissing'?'Beauftragung fehlt':form.status==='documentMissing'?'Dokument fehlt':form.status==='blocked'?'Gesperrt':form.status==='archived'?'Archiviert':'Abgelaufen';
  const statusClass=form.status==='valid'?'valid':form.status==='warn'||form.status==='instructionDue'||form.status==='documentMissing'?'warn':form.status==='archived'?'archived':'expired';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.device} (${displayEmp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-operator-record-icon"><Icon name="settings" size={27}/></span><div><span>Geräteführer</span><h2>{form.device}</h2></div><span className={'emp-status is-'+statusClass}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Mitarbeiter" icon="users" value={displayEmp.name}/>
        <TrainingRecordField label="Firma" icon="building" value={form.company || window.company(displayEmp.company)?.name || displayEmp.company}/>
        <TrainingRecordField label="Abteilung / Position" icon="users" value={`${form.department || displayEmp.department} · ${form.position || displayEmp.position}`}/>
        <TrainingRecordField label="Gerätetyp" icon="settings" editing={editing} value={form.device}><input value={form.device} onChange={e=>set('device',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Hersteller oder Gerätegruppe" icon="settings" editing={editing} value={form.manufacturer || '-'}><input value={form.manufacturer || ''} onChange={e=>set('manufacturer',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ausbildung" icon="cap" editing={editing} value={form.training}><input value={form.training} onChange={e=>set('training',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Betriebliche Einweisung" icon="check" editing={editing} value={form.instruction || '-'}><input value={form.instruction || ''} onChange={e=>set('instruction',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Schriftliche Beauftragung" icon="doc" editing={editing} value={form.authorization || '-'}><select value={form.authorization || 'vorhanden'} onChange={e=>set('authorization',e.target.value)}><option>vorhanden</option><option>fehlt</option><option>widerrufen</option><option>abgelaufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Ausstellungsdatum" icon="cal" editing={editing} value={form.issued}><input value={form.issued} onChange={e=>set('issued',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültig ab" icon="cal" editing={editing} value={form.validFrom || '-'}><input value={form.validFrom || ''} onChange={e=>set('validFrom',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ablaufdatum" icon="cal" editing={editing} value={form.expires}><input value={form.expires} onChange={e=>set('expires',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Nächste Unterweisung" icon="cal" editing={editing} value={form.nextInstruction || '-'}><input value={form.nextInstruction || ''} onChange={e=>set('nextInstruction',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restlaufzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage abgelaufen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Ausbildungsstatus" icon="flag" editing={editing} value={form.trainingStatus || '-'}><input value={form.trainingStatus || ''} onChange={e=>set('trainingStatus',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Unterweisungsstatus" icon="flag" editing={editing} value={form.instructionStatus || '-'}><input value={form.instructionStatus || ''} onChange={e=>set('instructionStatus',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Beauftragungsstatus" icon="flag" editing={editing} value={form.authorizationStatus || '-'}><select value={form.authorizationStatus || 'vorhanden'} onChange={e=>set('authorizationStatus',e.target.value)}><option>vorhanden</option><option>fehlt</option><option>widerrufen</option><option>abgelaufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Gesamtstatus" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option><option value="instructionDue">Unterweisung fällig</option><option value="authorizationMissing">Beauftragung fehlt</option><option value="documentMissing">Dokument fehlt</option><option value="blocked">Gesperrt</option><option value="archived">Archiviert</option></select></TrainingRecordField>
        <TrainingRecordField label="Ausbildungsstelle" icon="building" editing={editing} value={form.trainingCenter || '-'}><input value={form.trainingCenter || ''} onChange={e=>set('trainingCenter',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ausbilder oder Einweiser" icon="users" editing={editing} value={form.instructor || '-'}><input value={form.instructor || ''} onChange={e=>set('instructor',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Verantwortliche Führungskraft" icon="users" editing={editing} value={form.responsible || '-'}><input value={form.responsible || ''} onChange={e=>set('responsible',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Einsatzbereich" icon="pin" editing={editing} value={form.operationArea || '-'}><input value={form.operationArea || ''} onChange={e=>set('operationArea',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Einschränkungen" icon="shield" editing={editing} value={form.restriction || '-'}><input value={form.restriction || ''} onChange={e=>set('restriction',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Freigabe für Mitarbeiter" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Nachweis- und Änderungshistorie" icon="history" value={`${form.history} Ereignisse`}/>
        <TrainingRecordField label="Warnung" icon="flag" value={form.warning || '-' } wide/>
        <TrainingRecordField label="Bemerkung" icon="doc" editing={editing} value={form.remark || '-'} wide><textarea rows="2" value={form.remark || ''} onChange={e=>set('remark',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeEquipmentCheckRecords(emp) {
  return [
    {baseId:'check-1',area:'Erdbaumaschinen',qualification:'Befähigte Person für Baumaschinenprüfung',appointment:'schriftliche Beauftragung vorhanden',legal:'BetrSichV / DGUV Regel 100-500',proof:'Baumaschinenprüfung Aufbaukurs',validFrom:'01.03.2025',validTo:'01.03.2028',days:636,inspectionScope:'Bagger, Radlader, Verdichtungsgeräte',restriction:'bis 30 t',commissioner:'Christian Janning',responsible:'Alexander Petersen',deputy:'Markus Brinker',status:'valid',released:true,history:5,assignedDevices:'12 Geräte zugeordnet · 2 Prüfungen in 30 Tagen fällig',lastReport:'05.07.2026',description:'Befähigung zur wiederkehrenden Prüfung von Baggern, Radladern und Verdichtungsgeräten.',document:'Befaehigung_Erdbaumaschinen.pdf'},
    {baseId:'check-2',area:'Leitern und Tritte',qualification:'Prüfung nach BetrSichV',appointment:'gültig bis 15.07.2026',legal:'BetrSichV / DGUV Information 208-016',proof:'Leitern-und-Tritte-Prüfung',validFrom:'15.07.2025',validTo:'15.07.2026',days:41,inspectionScope:'Leitern, Tritte, fahrbare Podeste',restriction:'nur eigene Standorte',commissioner:'Sabine Janning',responsible:'Michael Janning',deputy:'Dirk Jürgens',status:'warn',released:true,history:3,assignedDevices:'48 Arbeitsmittel zugeordnet · 6 offen',lastReport:'12.05.2026',description:'Beauftragung zur regelmäßigen Prüfung ortsveränderlicher Leitern und Tritte.',document:'Beauftragung_Leitern_Tritte.pdf'},
    {baseId:'check-3',area:'Elektrische Arbeitsmittel',qualification:'Befähigte Person nach DGUV Vorschrift 3',appointment:'Beauftragung abgelaufen',legal:'DGUV Vorschrift 3 / TRBS 1203',proof:'Qualifikationsnachweis fehlt',validFrom:'18.04.2023',validTo:'18.04.2026',days:-47,inspectionScope:'ortsveränderliche elektrische Arbeitsmittel',restriction:'keine neuen Prüfungen zuweisen',commissioner:'Christian Janning',responsible:'Rahim Ahangarzadeh',deputy:'-',status:'expired',released:false,history:4,assignedDevices:'31 Arbeitsmittel zugeordnet · 9 überfällig',lastReport:'18.03.2026',description:'Prüfung ortsveränderlicher elektrischer Arbeitsmittel nach DGUV Vorschrift 3.',document:'Befaehigung_DGUV_V3.pdf'},
  ].map((row,index)=>({
    ...row,
    id:`${emp.id}-${row.baseId}`,
    employeeId:emp.id,
    employee:emp,
    employeeName:`${emp.lastName}, ${emp.firstName}`,
    company:window.company(emp.company)?.name || emp.company,
    companyShort:window.company(emp.company)?.short || emp.company,
    department:emp.department,
    position:emp.position,
    documentMissing:index===2,
    appointmentMissing:row.appointment.toLowerCase().includes('abgelaufen') || row.appointment.toLowerCase().includes('fehlt'),
    warning:row.status==='expired' ? `Die Berechtigung für ${row.area} ist seit ${Math.abs(row.days)} Tagen abgelaufen. Neue Prüfungen dürfen dieser Person derzeit nicht zugewiesen werden.` : row.status==='warn' ? 'Beauftragung läuft bald ab, Verlängerung vorbereiten.' : 'Befähigung und Beauftragung liegen vor.',
  }));
}

function EmployeeEquipmentCheckAreaLegacy({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope==='active') return sourceEmployees.filter(item=>item.status==='aktiv');
    if(scope==='inactive') return sourceEmployees.filter(item=>item.status!=='aktiv');
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope!==emp.id;
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeEquipmentCheckRecords),[activeEmployees]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'area',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const [hiddenColumns,setHiddenColumns]=React.useState(new Set());
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen',appointmentMissing:'Beauftragung fehlt',documentMissing:'Dokument fehlt',renewal:'Verlängerung in Bearbeitung',revoked:'Widerrufen',blocked:'Gesperrt',archived:'Archiviert'};
  const statusClass=status=>status==='valid'?'valid':status==='warn'||status==='renewal'||status==='documentMissing'||status==='appointmentMissing'?'warn':status==='archived'?'archived':'expired';
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  let rows=filter==='all'?records:
    filter==='appointmentMissing'?records.filter(row=>row.appointmentMissing):
    filter==='documentMissing'?records.filter(row=>row.documentMissing):
    records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter'],['companyShort','Firma'],['department','Abteilung'],['position','Position']]:[]),
    ['area','Arbeitsmittelbereich'],['qualification','Fachliche Befähigung'],['appointment','Schriftliche Beauftragung'],['legal','Rechtsgrundlage'],['validFrom','Gültig ab'],['validTo','Gültig bis'],['days','Restlaufzeit'],['deputy','Stellvertretung'],['status','Status'],['released','Freigabe für Mitarbeiter'],['history','Befähigungs- und Beauftragungshistorie'],['document','Dokumente'],['description','Beschreibung'],['actions','Aktionen']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key));
  const tabLabels={all:`Alle ${records.length}`,valid:`Gültig ${records.filter(row=>row.status==='valid').length}`,warn:`Läuft bald ab ${records.filter(row=>row.status==='warn').length}`,expired:`Abgelaufen ${records.filter(row=>row.status==='expired').length}`,appointmentMissing:`Beauftragung fehlt ${records.filter(row=>row.appointmentMissing).length}`,documentMissing:`Dokument fehlt ${records.filter(row=>row.documentMissing).length}`,archived:'Archiviert'};
  const kpi=[
    ['Prüfberechtigungen',records.length,'all'],
    ['Gültig',records.filter(row=>row.status==='valid').length,'valid'],
    ['Laufen bald ab',records.filter(row=>row.status==='warn').length,'warn'],
    ['Abgelaufen',records.filter(row=>row.status==='expired').length,'expired'],
    ['Dokument fehlt',records.filter(row=>row.documentMissing).length,'documentMissing'],
  ];
  const cellValue=(row,key)=>{
    if(key==='employeeName'||key==='area') return <strong>{row[key]}</strong>;
    if(key==='days') return row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`;
    if(key==='status') return <span className={'emp-status is-'+statusClass(row.status)}>{labels[row.status]}</span>;
    if(key==='appointment') return <span className={'emp-status is-'+(row.appointmentMissing?'warn':'valid')}>{row.appointment}</span>;
    if(key==='released') return <span className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='history') return <span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Ereignisse</span>;
    if(key==='document') return <span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'fehlt':1}</span>;
    if(key==='actions') return <button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button>;
    return row[key];
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Prüfberechtigungen - alle Mitarbeiter':`Prüfberechtigungen (${currentEmployee.name})`} onBack={onBack} action={
      <div className="emp-training-toolbar">
        <label>Mitarbeiter auswählen<select value={scope} onChange={event=>{setScope(event.target.value);setSelected(new Set());}}>
          <option value={emp.id}>{emp.name}</option>
          <option value="all">Alle Mitarbeiter</option>
          <option value="active">Nur aktive Mitarbeiter</option>
          <option value="inactive">Ausgeschiedene Mitarbeiter</option>
          {window.SEED.companies.map(company=><option key={company.id} value={`company:${company.id}`}>{company.name}</option>)}
          {window.SEED.departments.map(dept=><option key={dept} value={`department:${dept}`}>Abteilung: {dept}</option>)}
          {sourceEmployees.filter(item=>item.id!==emp.id).slice().sort((a,b)=>a.lastName.localeCompare(b.lastName,'de')).map(item=><option key={item.id} value={item.id}>{item.lastName}, {item.firstName}</option>)}
        </select></label>
        <button><Icon name="settings" size={14}/>Filter</button>
        <button><Icon name="plus" size={14}/>Prüfberechtigung hinzufügen</button>
      </div>
    }/>
    <div className="emp-training-kpis">{kpi.map(item=><button key={item[0]} className={filter===item[2]?'is-active':''} onClick={()=>setFilter(item[2])}><span>{item[0]}</span><strong>{item[1]}</strong><small>Klicken zum Filtern</small></button>)}</div>
    <div className="emp-training-tabs">{['all','valid','warn','expired','appointmentMissing','documentMissing','archived'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(new Set())}>Alle Spalten anzeigen</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="doc" size={14}/>Beauftragung erstellen</button><button><Icon name="cal" size={14}/>Verlängern</button><button><Icon name="upload" size={14}/>Nachweis ersetzen</button><button><Icon name="users" size={14}/>Stellvertretung festlegen</button><button><Icon name="edit" size={14}/>Freigabe ändern</button><button><Icon name="history" size={14}/>Archivieren</button></div>}
    <div className="emp-table-wrap"><table className="emp-equipment-check-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          {columns.map(([key])=><td key={key} className={(key==='description'||key==='qualification'?'emp-ellipsis ':'')+(key==='days'&&row.days<0?'is-overdue':'')}>{cellValue(row,key)}</td>)}
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeEquipmentCheckArea({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeEquipmentCheckView')||'list');
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('all');
  const [filterOpen,setFilterOpen]=React.useState(false);
  const [createOpen,setCreateOpen]=React.useState(false);
  const [createStep,setCreateStep]=React.useState(1);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'area',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const defaultHiddenColumns=React.useMemo(()=>new Set(['legal','validFrom','days','released','inspectionScope','restriction','commissioner','responsible','lastReport','history','description','companyShort','department','position']),[]);
  const [hiddenColumns,setHiddenColumns]=React.useState(defaultHiddenColumns);
  const [filters,setFilters]=React.useState({employee:'',company:'all',department:'all',position:'',area:'',qualification:'',appointment:'all',legal:'',status:'all',validFrom:'',validTo:'',expiresUntil:'all',deputy:'all',document:'all',released:'all',openChecks:false,archived:false});
  React.useEffect(()=>localStorage.setItem('employeeEquipmentCheckView',viewMode),[viewMode]);
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const departments=React.useMemo(()=>[...new Set(sourceEmployees.map(item=>item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de')), [sourceEmployees]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope!==emp.id;
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const currentScopeLabel=isAllView?'Alle Mitarbeiter':currentEmployee.name;
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeEquipmentCheckRecords),[activeEmployees]);
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen',appointmentMissing:'Beauftragung fehlt',appointmentExpired:'Beauftragung abgelaufen',documentMissing:'Qualifikationsnachweis fehlt',deputyMissing:'Stellvertretung fehlt',revoked:'Widerrufen',blocked:'Gesperrt',archived:'Archiviert'};
  const statusClass=status=>status==='valid'?'valid':status==='warn'||status==='appointmentMissing'||status==='appointmentExpired'||status==='documentMissing'||status==='deputyMissing'?'warn':status==='archived'?'archived':'expired';
  const value=(row,key)=>key==='status'?labels[row.status]:(key==='document'?row.documentMissing?'fehlt':'vorhanden':row[key]);
  const matchesDate=(dateText,from,to)=>{
    if(!from&&!to) return true;
    const parts=String(dateText||'').split('.');
    if(parts.length!==3) return true;
    const iso=`${parts[2]}-${parts[1]}-${parts[0]}`;
    return (!from||iso>=from)&&(!to||iso<=to);
  };
  const activeFilterCount=Object.entries(filters).filter(([key,val])=>(key==='openChecks'||key==='archived')?val:val&&val!=='all').length;
  let rows=records.filter(row=>{
    if(filter==='valid'&&row.status!=='valid') return false;
    if(filter==='warn'&&row.status!=='warn') return false;
    if(filter==='expired'&&row.status!=='expired') return false;
    if(filter==='appointmentMissing'&&!row.appointmentMissing) return false;
    if(filter==='documentMissing'&&!row.documentMissing) return false;
    if(filter==='archived') return false;
    if(filters.employee&&!(row.employeeName||'').toLowerCase().includes(filters.employee.toLowerCase())) return false;
    if(filters.company!=='all'&&row.employee.company!==filters.company) return false;
    if(filters.department!=='all'&&row.department!==filters.department) return false;
    if(filters.position&&!String(row.position||'').toLowerCase().includes(filters.position.toLowerCase())) return false;
    if(filters.area&&!String(row.area||'').toLowerCase().includes(filters.area.toLowerCase())) return false;
    if(filters.qualification&&!String(row.qualification||'').toLowerCase().includes(filters.qualification.toLowerCase())) return false;
    if(filters.appointment!=='all'&&!String(row.appointment||'').toLowerCase().includes(filters.appointment.toLowerCase())) return false;
    if(filters.legal&&!String(row.legal||'').toLowerCase().includes(filters.legal.toLowerCase())) return false;
    if(filters.status!=='all'&&row.status!==filters.status) return false;
    if(!matchesDate(row.validTo,filters.validFrom,filters.validTo)) return false;
    if(filters.expiresUntil!=='all'&&row.days>Number(filters.expiresUntil)) return false;
    if(filters.deputy==='present'&&(!row.deputy||row.deputy==='-')) return false;
    if(filters.deputy==='missing'&&row.deputy&&row.deputy!=='-') return false;
    if(filters.document==='missing'&&!row.documentMissing) return false;
    if(filters.document==='present'&&row.documentMissing) return false;
    if(filters.released==='true'&&!row.released) return false;
    if(filters.released==='false'&&row.released) return false;
    if(filters.openChecks&&!String(row.assignedDevices||'').match(/[1-9]/)) return false;
    return true;
  });
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)??'').localeCompare(String(value(b,sort.key)??''),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const pickerEmployees=sourceEmployees.filter(item=>{
    const text=`${item.firstName} ${item.lastName} ${item.personalNr}`.toLowerCase();
    if(employeeSearch&&!text.includes(employeeSearch.toLowerCase())) return false;
    if(employeeCompanyFilter!=='all'&&item.company!==employeeCompanyFilter) return false;
    if(employeeDepartmentFilter!=='all'&&item.department!==employeeDepartmentFilter) return false;
    if(employeePositionFilter&&!item.position.toLowerCase().includes(employeePositionFilter.toLowerCase())) return false;
    if(employeeStatusFilter!=='all'&&item.status!==employeeStatusFilter) return false;
    return true;
  }).sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
  const baseColumns=[
    ...(isAllView?[['employeeName','Mitarbeiter']]:[]),
    ['area','Arbeitsmittelbereich'],['qualification','Fachliche Befähigung'],['appointment','Schriftliche Beauftragung'],['validTo','Gültig bis'],['status','Status'],['deputy','Stellvertretung'],['document','Dokument'],['actions','Aktionen'],
    ['legal','Rechtsgrundlage'],['validFrom','Gültig ab'],['days','Restlaufzeit'],['released','Freigabe für Mitarbeiter'],['inspectionScope','Prüfbereich'],['restriction','Einschränkungen'],['commissioner','Beauftragende Person'],['responsible','Verantwortliche Führungskraft'],['lastReport','Letzter Prüfbericht'],['history','Befähigungs- und Beauftragungshistorie'],['description','Beschreibung'],['companyShort','Firma'],['department','Abteilung'],['position','Position']
  ];
  const columns=baseColumns.filter(([key])=>!hiddenColumns.has(key)||key==='actions');
  const tabLabels={all:`Alle ${records.length}`,valid:`Gültig ${records.filter(row=>row.status==='valid').length}`,warn:`Läuft bald ab ${records.filter(row=>row.status==='warn').length}`,expired:`Abgelaufen ${records.filter(row=>row.status==='expired').length}`,appointmentMissing:`Beauftragung fehlt ${records.filter(row=>row.appointmentMissing).length}`,documentMissing:`Dokument fehlt ${records.filter(row=>row.documentMissing).length}`,archived:'Archiviert 0'};
  const cellValue=(row,key)=>{
    if(key==='employeeName') return <div><strong>{row.employeeName}</strong><small>PN {row.employee.personalNr}</small></div>;
    if(key==='area') return <strong>{row.area}</strong>;
    if(key==='qualification') return <div><strong>{row.qualification}</strong><small>{row.proof}</small></div>;
    if(key==='appointment') return <span className={'emp-status is-'+(row.appointmentMissing?'warn':'valid')}>{row.appointment}</span>;
    if(key==='days') return row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`;
    if(key==='status') return <div><span className={'emp-status is-'+statusClass(row.status)}>{labels[row.status]}</span><small>{row.days<0?`seit ${Math.abs(row.days)} Tagen`:`in ${row.days} Tagen`}</small></div>;
    if(key==='document') return <span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'fehlt':'1 Datei'}</span>;
    if(key==='released') return <span className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</span>;
    if(key==='history') return <span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Ereignisse</span>;
    if(key==='actions') return <button className="emp-row-menu-btn" onClick={event=>event.stopPropagation()}>⋮</button>;
    return row[key]||'-';
  };
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Prüfberechtigungen - alle Mitarbeiter':`Prüfberechtigungen (${currentEmployee.name})`} onBack={onBack} action={<div className="emp-training-toolbar"><button onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {currentScopeLabel}</button><div className="emp-view-toggle"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setViewMode('cards')}>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setViewMode('list')}>Liste</button></div><button onClick={()=>setFilterOpen(true)}><Icon name="settings" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button><button onClick={()=>setCreateOpen(true)}><Icon name="plus" size={14}/>Prüfberechtigung hinzufügen</button></div>}/>
    <div className="emp-training-tabs">{Object.keys(tabLabels).map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{tabLabels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}{hiddenColumns.size>0&&<button className="emp-clear-group" onClick={()=>setHiddenColumns(defaultHiddenColumns)}>Standardansicht</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="doc" size={14}/>Beauftragung erstellen</button><button><Icon name="cal" size={14}/>Verlängern</button><button><Icon name="users" size={14}/>Führungskraft ändern</button><button><Icon name="users" size={14}/>Stellvertretung zuweisen</button><button><Icon name="edit" size={14}/>Freigabe ändern</button><button><Icon name="download" size={14}/>Dokumente herunterladen</button><button><Icon name="history" size={14}/>Archivieren</button></div>}
    {viewMode==='cards'&&<div className="emp-license-card-grid emp-equipment-check-card-grid">{rows.map(row=><button key={row.id} className={'emp-license-card emp-equipment-check-card is-'+row.status} onClick={()=>onOpen(row)}><header><div><strong>{row.area}</strong><span>{row.employeeName}</span></div><span className={'emp-status is-'+statusClass(row.status)}>{labels[row.status]}</span></header><div><span>Fachliche Befähigung</span><b>{row.qualification}</b></div><div><span>Beauftragung</span><b>{row.appointment}</b></div><div><span>Gültig bis</span><b>{row.validTo}</b></div><footer><span>Vertretung: {row.deputy||'-'}</span><span className={'emp-doc-count '+(row.documentMissing?'is-missing':'')}><Icon name="doc" size={13}/>{row.documentMissing?'Dokument fehlt':'Dokument'}</span><span>⋮</span></footer></button>)}</div>}
    {viewMode==='list'&&<div className="emp-table-wrap emp-equipment-check-table-wrap"><table className="emp-equipment-check-table emp-equipment-check-table--compact"><thead><tr><th className="emp-check emp-sticky-select"><input type="checkbox" checked={rows.length>0&&selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(row=>row.id)))}/></th>{columns.map(([key,label])=><th key={key} className={(key==='area'?'emp-sticky-area ':'')+(key==='actions'?'emp-sticky-actions':'')}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach &quot;{label}&quot;</button>{key!=='actions'&&<button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button>}<button onClick={()=>setMenu(null)}>Spalten verwalten</button><button onClick={()=>{setHiddenColumns(defaultHiddenColumns);setMenu(null);}}>Standardansicht wiederherstellen</button></div>}</th>)}</tr></thead><tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length+1}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}<tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check emp-sticky-select" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>{columns.map(([key])=><td key={key} className={(key==='area'?'emp-sticky-area ':'')+(key==='actions'?'emp-sticky-actions ':'')+(key==='description'||key==='qualification'?'emp-ellipsis ':'')+(key==='days'&&row.days<0?'is-overdue':'')}>{cellValue(row,key)}</td>)}</tr></React.Fragment>)}</tbody></table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Prüfberechtigungen</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Ausgeschieden</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);setSelected(new Set());}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);setSelected(new Set());}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterOpen&&<aside className="emp-filter-drawer"><header><div><span>Prüfberechtigungen</span><h2>Filter</h2></div><button onClick={()=>setFilterOpen(false)}>×</button></header><div className="emp-filter-grid"><label>Mitarbeiter<input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))}/></label><label>Firma<select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Abteilung<select value={filters.department} onChange={event=>setFilters(old=>({...old,department:event.target.value}))}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label>Position<input value={filters.position} onChange={event=>setFilters(old=>({...old,position:event.target.value}))}/></label><label>Arbeitsmittelbereich<input value={filters.area} onChange={event=>setFilters(old=>({...old,area:event.target.value}))}/></label><label>Fachliche Befähigung<input value={filters.qualification} onChange={event=>setFilters(old=>({...old,qualification:event.target.value}))}/></label><label>Schriftliche Beauftragung<select value={filters.appointment} onChange={event=>setFilters(old=>({...old,appointment:event.target.value}))}><option value="all">Alle</option><option value="vorhanden">vorhanden</option><option value="fehlt">fehlt</option><option value="abgelaufen">abgelaufen</option><option value="widerrufen">widerrufen</option></select></label><label>Rechtsgrundlage<input value={filters.legal} onChange={event=>setFilters(old=>({...old,legal:event.target.value}))}/></label><label>Status<select value={filters.status} onChange={event=>setFilters(old=>({...old,status:event.target.value}))}><option value="all">Alle</option>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Gültig von<input type="date" value={filters.validFrom} onChange={event=>setFilters(old=>({...old,validFrom:event.target.value}))}/></label><label>Gültig bis<input type="date" value={filters.validTo} onChange={event=>setFilters(old=>({...old,validTo:event.target.value}))}/></label><label>Läuft innerhalb<select value={filters.expiresUntil} onChange={event=>setFilters(old=>({...old,expiresUntil:event.target.value}))}><option value="all">Alle Zeiten</option><option value="30">30 Tage</option><option value="60">60 Tage</option><option value="90">90 Tage</option></select></label><label>Stellvertretung<select value={filters.deputy} onChange={event=>setFilters(old=>({...old,deputy:event.target.value}))}><option value="all">Alle</option><option value="present">vorhanden</option><option value="missing">fehlt</option></select></label><label>Qualifikationsnachweis<select value={filters.document} onChange={event=>setFilters(old=>({...old,document:event.target.value}))}><option value="all">Alle</option><option value="present">vorhanden</option><option value="missing">fehlt</option></select></label><label>Freigabe<select value={filters.released} onChange={event=>setFilters(old=>({...old,released:event.target.value}))}><option value="all">Alle</option><option value="true">Freigegeben</option><option value="false">Nicht freigegeben</option></select></label><label className="emp-check-label"><input type="checkbox" checked={filters.openChecks} onChange={event=>setFilters(old=>({...old,openChecks:event.target.checked}))}/>Offene Prüfungen vorhanden</label><label className="emp-check-label"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Einträge anzeigen</label></div><footer><button onClick={()=>setFilters({employee:'',company:'all',department:'all',position:'',area:'',qualification:'',appointment:'all',legal:'',status:'all',validFrom:'',validTo:'',expiresUntil:'all',deputy:'all',document:'all',released:'all',openChecks:false,archived:false})}>Zurücksetzen</button><button onClick={()=>setFilterOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterOpen(false)}>Anwenden</button></footer></aside>}
    {createOpen&&<div className="emp-create-backdrop" onClick={()=>setCreateOpen(false)}><section className="emp-create-modal" onClick={event=>event.stopPropagation()}><header><div><span>Prüfberechtigungen</span><h2>Prüfberechtigung hinzufügen</h2><p>Schritt {createStep} von 6</p></div><button onClick={()=>setCreateOpen(false)}>×</button></header><div className="emp-create-steps">{['Mitarbeiter','Arbeitsmittelbereich','Gültigkeit','Beauftragung','Freigabe und Dokumente','Zusammenfassung'].map((item,index)=><button key={item} className={createStep===index+1?'is-active':''} onClick={()=>setCreateStep(index+1)}>{index+1}. {item}</button>)}</div><div className="emp-create-body">{createStep===1&&<div className="emp-form-grid"><label>Mitarbeiter<select><option>{currentScopeLabel}</option><option>Mehrere Mitarbeiter auswählen</option><option>Alle Mitarbeiter einer Firma</option></select></label><label>Firma<input value={window.company(currentEmployee.company)?.name || currentEmployee.company} readOnly/></label><label>Abteilung / Position<input value={`${currentEmployee.department} · ${currentEmployee.position}`} readOnly/></label><label>Verantwortliche Führungskraft<select><option>Alexander Petersen</option><option>Michael Janning</option><option>Rahim Ahangarzadeh</option></select></label></div>}{createStep===2&&<div className="emp-form-grid"><label>Arbeitsmittelbereich<select><option>elektrische Arbeitsmittel</option><option>Erdbaumaschinen</option><option>Leitern und Tritte</option><option>Gerüste</option><option>Anschlagmittel</option><option>Hebezeuge</option><option>Druckgeräte</option><option>Fahrzeuge</option><option>Verbaugeräte</option><option>persönliche Schutzausrüstung</option><option>sonstige Arbeitsmittel</option></select></label><label>Fachliche Befähigung<input placeholder="Befähigte Person nach TRBS 1203"/></label><label>Rechtsgrundlage<input placeholder="BetrSichV / DGUV / TRBS"/></label><label>Prüfbereich<input placeholder="zu prüfende Arbeitsmittel"/></label><label>Qualifikationsnachweis<input placeholder="Nachweisbezeichnung"/></label><label>Einschränkungen<input placeholder="optional"/></label></div>}{createStep===3&&<div className="emp-form-grid"><label>Gültig ab<input type="date"/></label><label>Gültig bis<input type="date"/></label><label className="emp-check-label"><input type="checkbox"/>Unbefristet</label><label>Status<select><option>gültig</option><option>läuft bald ab</option><option>abgelaufen</option><option>in Prüfung</option><option>gesperrt</option><option>widerrufen</option></select></label><label className="emp-check-label"><input type="checkbox" defaultChecked/>Erinnerung aktivieren</label></div>}{createStep===4&&<div className="emp-form-grid"><label>Schriftliche Beauftragung vorhanden<select><option>vorhanden</option><option>fehlt</option><option>abgelaufen</option><option>widerrufen</option><option>gesperrt</option></select></label><label>Beauftragung gültig ab<input type="date"/></label><label>Beauftragung gültig bis<input type="date"/></label><label>Beauftragende Person<input defaultValue="Christian Janning"/></label><label>Beauftragungsstatus<select><option>vorhanden</option><option>fehlt</option><option>abgelaufen</option><option>widerrufen</option><option>gesperrt</option></select></label><label>Stellvertretung<input placeholder="optional"/></label></div>}{createStep===5&&<div className="emp-form-grid"><label>Freigabe für Mitarbeiter<select><option>freigegeben</option><option>nicht freigegeben</option><option>nur Status sichtbar</option><option>Status und Dokument sichtbar</option></select></label><label>Qualifikationsnachweis<input type="file" accept=".pdf,.jpg,.jpeg,.png"/></label><label>Beauftragungsdokument<input type="file" accept=".pdf,.jpg,.jpeg,.png"/></label><label>Weitere Dokumente<input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></label><label className="is-wide">Bemerkung<textarea rows="3"/></label><label className="is-wide">Beschreibung<textarea rows="3"/></label></div>}{createStep===6&&<div className="emp-create-summary"><strong>Zusammenfassung</strong><span>Mitarbeiter: {currentScopeLabel}</span><span>Arbeitsmittelbereich: Erdbaumaschinen</span><span>Rechtsgrundlage: BetrSichV / TRBS 1203</span><span>Beauftragung: schriftlich vorhanden</span><span>Freigabe: Status und Dokument sichtbar</span></div>}</div><footer><button onClick={()=>setCreateOpen(false)}>Abbrechen</button><button onClick={()=>setCreateOpen(false)}>Als Entwurf speichern</button>{createStep>1&&<button onClick={()=>setCreateStep(step=>step-1)}>Zurück</button>}{createStep<6?<button className="btn btn--primary" onClick={()=>setCreateStep(step=>step+1)}>Weiter</button>:<button className="btn btn--primary" onClick={()=>setCreateOpen(false)}>Prüfberechtigung hinzufügen</button>}</footer></section></div>}
  </div>;
}

function EmployeeEquipmentCheckRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const displayEmp=form.employee || emp;
  const statusName=form.status==='valid'?'Gültig':form.status==='warn'?'Läuft bald ab':form.status==='appointmentMissing'?'Beauftragung fehlt':form.status==='documentMissing'?'Dokument fehlt':form.status==='renewal'?'Verlängerung in Bearbeitung':form.status==='revoked'?'Widerrufen':form.status==='blocked'?'Gesperrt':form.status==='archived'?'Archiviert':'Abgelaufen';
  const statusClass=form.status==='valid'?'valid':form.status==='warn'||form.status==='appointmentMissing'||form.status==='documentMissing'||form.status==='renewal'?'warn':form.status==='archived'?'archived':'expired';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.area} (${displayEmp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-equipment-check-record-icon"><Icon name="check" size={27}/></span><div><span>Prüfberechtigung</span><h2>{form.area}</h2></div><span className={'emp-status is-'+statusClass}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Mitarbeiter" icon="users" value={displayEmp.name}/>
        <TrainingRecordField label="Firma" icon="building" value={form.company || window.company(displayEmp.company)?.name || displayEmp.company}/>
        <TrainingRecordField label="Abteilung / Position" icon="users" value={`${form.department || displayEmp.department} · ${form.position || displayEmp.position}`}/>
        <TrainingRecordField label="Arbeitsmittelbereich" icon="settings" editing={editing} value={form.area}><input value={form.area} onChange={e=>set('area',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Fachliche Befähigung" icon="shield" editing={editing} value={form.qualification || '-'}><input value={form.qualification || ''} onChange={e=>set('qualification',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Schriftliche Beauftragung" icon="doc" editing={editing} value={form.appointment || '-'}><select value={form.appointment || 'schriftliche Beauftragung vorhanden'} onChange={e=>set('appointment',e.target.value)}><option>schriftliche Beauftragung vorhanden</option><option>Beauftragung fehlt</option><option>Beauftragung abgelaufen</option><option>Beauftragung widerrufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Rechtsgrundlage" icon="doc" editing={editing} value={form.legal || '-'}><input value={form.legal || ''} onChange={e=>set('legal',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Qualifikationsnachweis" icon="cap" editing={editing} value={form.proof || '-'}><input value={form.proof || ''} onChange={e=>set('proof',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültig ab" icon="cal" editing={editing} value={form.validFrom}><input value={form.validFrom} onChange={e=>set('validFrom',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültig bis" icon="cal" editing={editing} value={form.validTo}><input value={form.validTo} onChange={e=>set('validTo',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restlaufzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage abgelaufen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Prüfbereich" icon="settings" editing={editing} value={form.inspectionScope || '-'}><input value={form.inspectionScope || ''} onChange={e=>set('inspectionScope',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Einschränkungen" icon="shield" editing={editing} value={form.restriction || '-'}><input value={form.restriction || ''} onChange={e=>set('restriction',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Beauftragende Person" icon="users" editing={editing} value={form.commissioner || '-'}><input value={form.commissioner || ''} onChange={e=>set('commissioner',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Verantwortliche Führungskraft" icon="users" editing={editing} value={form.responsible || '-'}><input value={form.responsible || ''} onChange={e=>set('responsible',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Stellvertretung" icon="users" editing={editing} value={form.deputy || '-'}><input value={form.deputy || ''} onChange={e=>set('deputy',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option><option value="appointmentMissing">Beauftragung fehlt</option><option value="documentMissing">Qualifikationsnachweis fehlt</option><option value="renewal">Verlängerung in Bearbeitung</option><option value="revoked">Widerrufen</option><option value="blocked">Gesperrt</option><option value="archived">Archiviert</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigabe für Mitarbeiter" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Zugeordnete Geräte / offene Prüfungen" icon="settings" value={form.assignedDevices || '-'}/>
        <TrainingRecordField label="Letzter Prüfbericht" icon="doc" value={form.lastReport || '-'}/>
        <TrainingRecordField label="Befähigungs- und Beauftragungshistorie" icon="history" value={`${form.history} Ereignisse`}/>
        <TrainingRecordField label="Warnung" icon="flag" value={form.warning || '-'} wide/>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeSiteRecords(emp) {
  const companyName = window.company(emp.company)?.name || emp.company;
  return [
    {id:'site-1',name:'Baustelle Alex Barum',projectName:'Kanalsanierung Nordhorn',company:'Janning Tiefbau GmbH',projectNr:'BAU-2026-014',client:'Stadt Nordhorn',manager:'Alexander Petersen',foreman:'Markus Brinker',address:'Lingener Straße 42, 48529 Nordhorn',ownRole:'Baumaschinist / Ersthelfer',start:'15.04.2026',end:'28.06.2026',assignmentStatus:'Im Einsatz',assignmentNotice:'Einsatz endet in 7 Tagen',siteStatus:'Aktiv',accessStatus:'Vollständiger Baustellenbereich',released:true,documentSummary:'4 Dokumente · 1 neu · 1 Bestätigung offen',documents:['Alarmplan_BAU-2026-014.pdf','Baustellenaushang_BGBAU.pdf','GBU_Kanalsanierung.pdf','Unterweisung_Baustelle.pdf'],lastUpdate:'12.07.2026 · Alarmplan aktualisiert',contacts:'Bauleiter: Alexander Petersen · Vorarbeiter: Markus Brinker',firstAid:'Markus Brinker, Dirk Jürgens',riskAssessment:'3 Gefährdungsbeurteilungen freigegeben',instruction:'Projektbezogene Unterweisung abgeschlossen',description:'Kanalsanierung Nordhorn mit Tiefbau-, Rohrbau- und Wiederherstellungsarbeiten.',visibleFor:['all']},
    {id:'site-2',name:'Rohrgraben Suedring',projectName:'Hausanschlüsse Suedring',company:'Janning Rohrbau GmbH',projectNr:'BAU-2026-021',client:'Wasserverband Nordhorn',manager:'Stefan Mueller',foreman:'Thomas Wegener',address:'Südring 18, 48527 Nordhorn',ownRole:'Geräteführer',start:'20.05.2026',end:'10.07.2026',assignmentStatus:'Eingeplant',assignmentNotice:'Zugriff ab 20.05.2026',siteStatus:'Geplant',accessStatus:'Stammdaten und Dokumente',released:true,documentSummary:'2 Dokumente · Alarmplan freigegeben',documents:['Alarmplan_BAU-2026-021.pdf','Baustellenaushang_Suedring.pdf'],lastUpdate:'08.07.2026 · Baustellenaushang freigegeben',contacts:'Bauleiter: Stefan Mueller · Vorarbeiter: Thomas Wegener',firstAid:'Thomas Wegener',riskAssessment:'Gefährdungsbeurteilung noch nicht freigegeben',instruction:'Unterweisung geplant',description:'Hausanschlüsse und Rohrleitungsarbeiten am Südring.',visibleFor:['rohrbau','all']},
    {id:'site-3',name:'Bohrung Gewerbepark',projectName:'Horizontalbohrung Gewerbepark',company:'Janning Bohrtechnik GmbH',projectNr:'BAU-2026-028',client:'Gewerbepark Bentheim GmbH',manager:'Dirk Berg',foreman:'Mehmet Brinker',address:'Industriestraße 7, 48455 Bad Bentheim',ownRole:'Mitarbeiter',start:'03.02.2026',end:'30.04.2026',assignmentStatus:'Einsatz beendet',assignmentNotice:'Einsatzzeitraum abgelaufen',siteStatus:'Abgeschlossen',accessStatus:'Keine Freigabe',released:false,documentSummary:'-',documents:[],lastUpdate:'-',contacts:'-',firstAid:'-',riskAssessment:'-',instruction:'-',description:'Horizontalbohrung und Leitungsverlegung im Gewerbepark.',visibleFor:[]},
  ].filter(row => row.released && (row.visibleFor.includes('all') || row.visibleFor.includes(emp.company) || row.company === companyName)).map(row => ({
    ...row,
    id: `${emp.id}-${row.id}`,
    employee: emp,
    employeeName: `${emp.lastName}, ${emp.firstName}`,
    companyShort: window.company(emp.company)?.short || emp.company,
    releaseStatus: row.accessStatus || 'Freigegeben',
    newDocuments: String(row.documentSummary || '').toLowerCase().includes('neu'),
    instructionOpen: String(row.instruction || '').toLowerCase().includes('geplant') || String(row.instruction || '').toLowerCase().includes('offen'),
    updateBy: 'Sabine Janning',
  }));
}

function EmployeeSiteAreaLegacy({emp,onBack,onOpen}) {
  const records=React.useMemo(()=>employeeSiteRecords(emp),[emp]);
  const [sort,setSort]=React.useState({key:'name',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [group,setGroup]=React.useState('');
  const [tab,setTab]=React.useState('Alle');
  const statusTabs=['Alle','Aktiv','Geplant','Abgeschlossen','Archiviert'];
  const tabRecords=tab==='Alle'?records:records.filter(row=>row.siteStatus===tab);
  const value=(row,key)=>row[key] || '';
  const rows=[...tabRecords].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const columns=[['name','Baustelle / Projektname'],['company','Firma'],['projectNr','Projekt-Nr.'],['ownRole','Meine Rolle'],['start','Einsatzbeginn'],['end','Einsatzende'],['assignmentStatus','Mein Einsatzstatus'],['manager','Bauleiter'],['foreman','Vorarbeiter'],['address','Adresse'],['siteStatus','Baustellenstatus'],['accessStatus','Meine Zugriffsrechte'],['documentSummary','Dokumente'],['lastUpdate','Letzte Aktualisierung'],['actions','Aktionen']];
  const statusTone=status=>status==='Aktiv'?'valid':status==='Geplant'?'warn':'missing';
  const assignmentTone=status=>status==='Im Einsatz'?'valid':status==='Eingeplant'||status==='Vertretung'?'warn':'missing';
  const accessTone=status=>status==='Vollständiger Baustellenbereich'?'valid':status==='Stammdaten und Dokumente'||status==='Nur Dokumente'||status==='Nur Stammdaten'?'warn':'missing';
  return <div className="emp-full">
    <EmpPageTitle title={`Baustellen (${emp.name})`} onBack={onBack}/>
    <div className="emp-training-tabs">{statusTabs.map(item=><button key={item} className={tab===item?'is-active':''} onClick={()=>setTab(item)}>{item} {item==='Alle'?records.length:records.filter(row=>row.siteStatus===item).length}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    <div className="emp-table-wrap"><table className="emp-site-table">
      <thead><tr>{columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={()=>setMenu(null)}>Spaltenfilter öffnen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr onClick={()=>onOpen(row)}>
          <td><strong>{row.name}</strong><small>{row.projectName}</small></td><td>{row.company}</td><td>{row.projectNr}</td><td>{row.ownRole}</td><td>{row.start}</td><td>{row.end}</td><td><span className={`badge badge--${assignmentTone(row.assignmentStatus)}`}><span className="badge__dot" />{row.assignmentStatus}</span><small>{row.assignmentNotice}</small></td><td>{row.manager}</td><td>{row.foreman}</td><td>{row.address}</td><td><span className={`badge badge--${statusTone(row.siteStatus)}`}><span className="badge__dot" />{row.siteStatus}</span></td><td><span className={`badge badge--${accessTone(row.accessStatus)}`}><span className="badge__dot" />{row.accessStatus}</span></td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>{row.documentSummary}</span></td><td>{row.lastUpdate}</td><td><button className="mini-icon-btn" onClick={event=>{event.stopPropagation();onOpen(row);}} title="Baustelle öffnen" aria-label="Baustelle öffnen"><Icon name="eye" size={14}/></button></td>
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeSiteArea({emp,onBack,onOpen}) {
  const [scope,setScope]=React.useState(emp.id);
  const [viewMode,setViewMode]=React.useState(()=>localStorage.getItem('employeeSiteView') || 'list');
  const [employeePickerOpen,setEmployeePickerOpen]=React.useState(false);
  const [employeeSearch,setEmployeeSearch]=React.useState('');
  const [employeeCompanyFilter,setEmployeeCompanyFilter]=React.useState('all');
  const [employeeDepartmentFilter,setEmployeeDepartmentFilter]=React.useState('all');
  const [employeePositionFilter,setEmployeePositionFilter]=React.useState('');
  const [employeeStatusFilter,setEmployeeStatusFilter]=React.useState('all');
  const [filterOpen,setFilterOpen]=React.useState(false);
  const [filters,setFilters]=React.useState({employee:'',company:'all',project:'',projectNr:'',role:'',assignment:'all',startFrom:'',startTo:'',endFrom:'',endTo:'',manager:'',foreman:'',siteStatus:'all',access:'all',newDocs:false,instructionOpen:false,archived:false});
  const [sort,setSort]=React.useState({key:'name',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [group,setGroup]=React.useState('');
  const [tab,setTab]=React.useState('Alle');
  const [hiddenColumns,setHiddenColumns]=React.useState(new Set(['company','projectNr','foreman','lastUpdate']));
  const sourceEmployees=React.useMemo(()=>window.SEED.employees,[]);
  const departments=React.useMemo(()=>[...new Set(sourceEmployees.map(item=>item.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de')),[sourceEmployees]);
  const activeEmployees=React.useMemo(()=>{
    if(scope==='all') return sourceEmployees;
    if(scope.startsWith('company:')) return sourceEmployees.filter(item=>item.company===scope.replace('company:',''));
    if(scope.startsWith('department:')) return sourceEmployees.filter(item=>item.department===scope.replace('department:',''));
    return sourceEmployees.filter(item=>item.id===scope);
  },[scope,sourceEmployees]);
  const isAllView=scope!==emp.id;
  const currentEmployee=activeEmployees.length===1?activeEmployees[0]:emp;
  const currentScopeLabel=scope==='all'?'Alle Mitarbeiter':scope.startsWith('company:')?(window.company(scope.replace('company:',''))?.name || 'Firma'):scope.startsWith('department:')?`Abteilung: ${scope.replace('department:','')}`:(currentEmployee?.name || emp.name);
  const records=React.useMemo(()=>activeEmployees.flatMap(employeeSiteRecords),[activeEmployees]);
  React.useEffect(()=>localStorage.setItem('employeeSiteView',viewMode),[viewMode]);
  const statusTabs=['Alle','Aktiv','Geplant','Abgeschlossen','Einsatz beendet','Archiviert'];
  const parseDate=value=>{ const [day,month,year]=String(value||'').split('.'); return year&&month&&day?`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`:''; };
  const matchesDate=(value,from,to)=>{ const date=parseDate(value); if(from&&date<from) return false; if(to&&date>to) return false; return true; };
  const value=(row,key)=>{
    if(key==='period') return `${row.start} - ${row.end}`;
    if(key==='employeeName') return row.employeeName;
    if(key==='project') return `${row.name} ${row.projectName} ${row.address}`;
    return row[key] || '';
  };
  const filteredRecords=records.filter(row=>{
    if(tab!=='Alle' && tab!=='Einsatz beendet' && row.siteStatus!==tab) return false;
    if(tab==='Einsatz beendet' && row.assignmentStatus!=='Einsatz beendet') return false;
    if(filters.employee && !String(row.employeeName||'').toLowerCase().includes(filters.employee.toLowerCase())) return false;
    if(filters.company!=='all' && row.employee.company!==filters.company) return false;
    if(filters.project && !String(`${row.name} ${row.projectName}`).toLowerCase().includes(filters.project.toLowerCase())) return false;
    if(filters.projectNr && !String(row.projectNr).toLowerCase().includes(filters.projectNr.toLowerCase())) return false;
    if(filters.role && !String(row.ownRole).toLowerCase().includes(filters.role.toLowerCase())) return false;
    if(filters.assignment!=='all' && row.assignmentStatus!==filters.assignment) return false;
    if(!matchesDate(row.start,filters.startFrom,filters.startTo)) return false;
    if(!matchesDate(row.end,filters.endFrom,filters.endTo)) return false;
    if(filters.manager && !String(row.manager).toLowerCase().includes(filters.manager.toLowerCase())) return false;
    if(filters.foreman && !String(row.foreman).toLowerCase().includes(filters.foreman.toLowerCase())) return false;
    if(filters.siteStatus!=='all' && row.siteStatus!==filters.siteStatus) return false;
    if(filters.access!=='all' && row.accessStatus!==filters.access) return false;
    if(filters.newDocs && !row.newDocuments) return false;
    if(filters.instructionOpen && !row.instructionOpen) return false;
    if(!filters.archived && row.siteStatus==='Archiviert') return false;
    return true;
  });
  const rows=[...filteredRecords].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const columns=[
    ...(isAllView?[['employeeName','Mitarbeiter']]:[]),
    ['project','Baustelle / Projektname'],
    ['ownRole','Meine Rolle'],
    ['period','Einsatzzeitraum'],
    ['assignmentStatus','Mein Einsatzstatus'],
    ['manager','Bauleiter'],
    ['siteStatus','Baustellenstatus'],
    ['accessStatus','Zugriffsrechte'],
    ['documentSummary','Dokumente'],
    ['company','Firma'],
    ['projectNr','Projekt-Nr.'],
    ['foreman','Vorarbeiter'],
    ['lastUpdate','Letzte Aktualisierung'],
    ['actions','Aktionen'],
  ].filter(([key])=>!hiddenColumns.has(key) || key==='actions');
  const activeFilterCount=Object.entries(filters).filter(([key,val])=>key==='archived'||key==='newDocs'||key==='instructionOpen'?Boolean(val):val&&val!=='all').length;
  const labels={valid:'valid',warn:'warn',missing:'missing'};
  const statusTone=status=>status==='Aktiv'||status==='Freigegeben'||String(status).includes('Vollst')?'valid':status==='Geplant'||status==='Eingeplant'||String(status).includes('Dokumente')||String(status).includes('Stammdaten')?'warn':'missing';
  const cellValue=(row,key)=>{
    if(key==='employeeName') return <div><strong>{row.employeeName}</strong><small>PN {row.employee.personalNr}</small></div>;
    if(key==='project') return <div><strong>{row.name}</strong><small>{row.projectName} · {row.address}</small></div>;
    if(key==='period') return <span>{row.start} - {row.end}</span>;
    if(key==='assignmentStatus') return <div><span className={`badge badge--${statusTone(row.assignmentStatus)}`}><span className="badge__dot" />{row.assignmentStatus}</span><small>{row.assignmentNotice}</small></div>;
    if(key==='siteStatus'||key==='accessStatus') return <span className={`badge badge--${statusTone(row[key])}`}><span className="badge__dot" />{row[key]}</span>;
    if(key==='documentSummary') return <span className={'emp-doc-count ' + (row.newDocuments?'is-new':'')}><Icon name="doc" size={13}/>{row.documentSummary}</span>;
    if(key==='actions') return <button className="emp-row-menu-btn" onClick={event=>{event.stopPropagation();onOpen(row);}}>⋮</button>;
    return row[key] || '-';
  };
  const pickerEmployees=sourceEmployees.filter(item=>{
    const term=employeeSearch.toLowerCase();
    const companyMatch=employeeCompanyFilter==='all'||item.company===employeeCompanyFilter;
    const departmentMatch=employeeDepartmentFilter==='all'||item.department===employeeDepartmentFilter;
    const positionMatch=!employeePositionFilter||String(item.position||'').toLowerCase().includes(employeePositionFilter.toLowerCase());
    const statusMatch=employeeStatusFilter==='all'||(employeeStatusFilter==='aktiv'?item.active:item.active===false);
    const text=`${item.firstName} ${item.lastName} ${item.personalNr}`.toLowerCase();
    return companyMatch&&departmentMatch&&positionMatch&&statusMatch&&(!term||text.includes(term));
  });
  const resetFilters=()=>setFilters({employee:'',company:'all',project:'',projectNr:'',role:'',assignment:'all',startFrom:'',startTo:'',endFrom:'',endTo:'',manager:'',foreman:'',siteStatus:'all',access:'all',newDocs:false,instructionOpen:false,archived:false});
  return <div className="emp-full">
    <EmpPageTitle title={isAllView?'Baustellen - alle Mitarbeiter':`Baustellen (${currentEmployee.name})`} onBack={onBack} action={<div className="emp-appointment-actions"><button className="btn btn--ghost" onClick={()=>setEmployeePickerOpen(true)}><Icon name="users" size={14}/>Mitarbeiter: {currentScopeLabel}</button><div className="emp-segmented"><button className={viewMode==='cards'?'is-active':''} onClick={()=>setViewMode('cards')}>Kacheln</button><button className={viewMode==='list'?'is-active':''} onClick={()=>setViewMode('list')}>Liste</button></div><button className="btn btn--ghost" onClick={()=>setFilterOpen(true)}><Icon name="filter" size={14}/>Filter{activeFilterCount?` (${activeFilterCount})`:''}</button></div>}/>
    <div className="emp-training-tabs emp-site-tabs">{statusTabs.map(item=><button key={item} className={tab===item?'is-active':''} onClick={()=>setTab(item)}>{item} {item==='Alle'?records.length:item==='Einsatz beendet'?records.filter(row=>row.assignmentStatus==='Einsatz beendet').length:records.filter(row=>row.siteStatus===item).length}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    {activeFilterCount>0&&<div className="emp-active-filter-chips">{filters.project&&<button onClick={()=>setFilters(old=>({...old,project:''}))}>Projekt: {filters.project} ×</button>}{filters.role&&<button onClick={()=>setFilters(old=>({...old,role:''}))}>Rolle: {filters.role} ×</button>}{filters.assignment!=='all'&&<button onClick={()=>setFilters(old=>({...old,assignment:'all'}))}>Einsatz: {filters.assignment} ×</button>}{filters.siteStatus!=='all'&&<button onClick={()=>setFilters(old=>({...old,siteStatus:'all'}))}>Status: {filters.siteStatus} ×</button>}</div>}
    {viewMode==='cards'&&<div className="emp-site-card-grid">{rows.map(row=><button key={row.id} className="emp-site-card" onClick={()=>onOpen(row)}><header><div><strong>{row.name}</strong><span>{row.projectName}</span></div><span className={`badge badge--${statusTone(row.siteStatus)}`}><span className="badge__dot" />{row.siteStatus}</span></header><dl><div><dt>{isAllView?'Mitarbeiter':'Firma'}</dt><dd>{isAllView?row.employeeName:row.company}</dd></div><div><dt>Meine Rolle</dt><dd>{row.ownRole}</dd></div><div><dt>Einsatzzeitraum</dt><dd>{row.start} - {row.end}</dd></div><div><dt>Zugriffsrechte</dt><dd>{row.accessStatus}</dd></div></dl><footer><span>{row.documentSummary}</span><b>Baustelle öffnen</b></footer></button>)}</div>}
    {viewMode==='list'&&<div className="emp-table-wrap emp-site-table-wrap"><table className="emp-site-table emp-site-table--compact"><thead><tr>{columns.map(([key,label],index)=><th key={key} className={key==='employeeName'?'emp-sticky-employee':key==='project'?'emp-sticky-project':key==='actions'?'emp-sticky-actions':''}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&key!=='actions'&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>A bis Z</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Z bis A</button><button onClick={()=>setMenu(null)}>Filtern nach</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Gruppieren nach "{label}"</button><button onClick={()=>{setHiddenColumns(old=>new Set([...old,key]));setMenu(null);}}>Spalte ausblenden</button><button onClick={()=>{setHiddenColumns(new Set());setMenu(null);}}>Spalten verwalten</button><button onClick={()=>{setHiddenColumns(new Set(['company','projectNr','foreman','lastUpdate']));setMenu(null);}}>Standardansicht wiederherstellen</button></div>}</th>)}</tr></thead><tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan={columns.length}>{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}<tr onClick={()=>onOpen(row)}>{columns.map(([key])=><td key={key} className={key==='employeeName'?'emp-sticky-employee':key==='project'?'emp-sticky-project':key==='actions'?'emp-sticky-actions':''}>{cellValue(row,key)}</td>)}</tr></React.Fragment>)}</tbody></table></div>}
    {employeePickerOpen&&<div className="emp-picker-backdrop" onClick={()=>setEmployeePickerOpen(false)}><section className="emp-picker-modal" onClick={event=>event.stopPropagation()}><header><div><span>Baustellen</span><h2>Mitarbeiter auswählen</h2></div><button onClick={()=>setEmployeePickerOpen(false)}>×</button></header><div className="emp-picker-filters"><input placeholder="Name oder Personalnummer" value={employeeSearch} onChange={event=>setEmployeeSearch(event.target.value)}/><select value={employeeCompanyFilter} onChange={event=>setEmployeeCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={employeeDepartmentFilter} onChange={event=>setEmployeeDepartmentFilter(event.target.value)}><option value="all">Alle Abteilungen</option>{departments.map(item=><option key={item}>{item}</option>)}</select><input placeholder="Position" value={employeePositionFilter} onChange={event=>setEmployeePositionFilter(event.target.value)}/><select value={employeeStatusFilter} onChange={event=>setEmployeeStatusFilter(event.target.value)}><option value="all">Alle Status</option><option value="aktiv">Aktiv</option><option value="inaktiv">Ausgeschieden</option></select><button type="button" onClick={()=>{setScope('all');setEmployeePickerOpen(false);}}>Alle Mitarbeiter</button></div><div className="emp-picker-table"><table><thead><tr><th>Mitarbeiter</th><th>Firma</th><th>Abteilung</th><th>Position</th></tr></thead><tbody>{pickerEmployees.map(item=><tr key={item.id} onClick={()=>{setScope(item.id);setEmployeePickerOpen(false);}}><td><strong>{item.lastName}, {item.firstName}</strong><small>PN {item.personalNr}</small></td><td>{window.company(item.company)?.name || item.company}</td><td>{item.department}</td><td>{item.position}</td></tr>)}</tbody></table></div></section></div>}
    {filterOpen&&<div className="emp-filter-backdrop" onClick={()=>setFilterOpen(false)}><aside className="emp-filter-panel" onClick={event=>event.stopPropagation()}><header><div><span>Baustellen</span><h2>Filter</h2></div><button onClick={()=>setFilterOpen(false)}>×</button></header><div className="emp-filter-grid"><label>Mitarbeiter<input value={filters.employee} onChange={event=>setFilters(old=>({...old,employee:event.target.value}))}/></label><label>Firma<select value={filters.company} onChange={event=>setFilters(old=>({...old,company:event.target.value}))}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Baustelle / Projekt<input value={filters.project} onChange={event=>setFilters(old=>({...old,project:event.target.value}))}/></label><label>Projektnummer<input value={filters.projectNr} onChange={event=>setFilters(old=>({...old,projectNr:event.target.value}))}/></label><label>Eigene Rolle<input value={filters.role} onChange={event=>setFilters(old=>({...old,role:event.target.value}))}/></label><label>Eigener Einsatzstatus<select value={filters.assignment} onChange={event=>setFilters(old=>({...old,assignment:event.target.value}))}><option value="all">Alle</option><option>Im Einsatz</option><option>Eingeplant</option><option>Einsatz beendet</option><option>Vertretung</option><option>Zuordnung pausiert</option></select></label><label>Einsatzbeginn von<input type="date" value={filters.startFrom} onChange={event=>setFilters(old=>({...old,startFrom:event.target.value}))}/></label><label>Einsatzbeginn bis<input type="date" value={filters.startTo} onChange={event=>setFilters(old=>({...old,startTo:event.target.value}))}/></label><label>Einsatzende von<input type="date" value={filters.endFrom} onChange={event=>setFilters(old=>({...old,endFrom:event.target.value}))}/></label><label>Einsatzende bis<input type="date" value={filters.endTo} onChange={event=>setFilters(old=>({...old,endTo:event.target.value}))}/></label><label>Bauleiter<input value={filters.manager} onChange={event=>setFilters(old=>({...old,manager:event.target.value}))}/></label><label>Vorarbeiter<input value={filters.foreman} onChange={event=>setFilters(old=>({...old,foreman:event.target.value}))}/></label><label>Baustellenstatus<select value={filters.siteStatus} onChange={event=>setFilters(old=>({...old,siteStatus:event.target.value}))}><option value="all">Alle</option><option>Geplant</option><option>Aktiv</option><option>Pausiert</option><option>Abgeschlossen</option><option>Archiviert</option></select></label><label>Zugriffsrechte<select value={filters.access} onChange={event=>setFilters(old=>({...old,access:event.target.value}))}><option value="all">Alle</option><option>Vollständiger Baustellenbereich</option><option>Stammdaten und Dokumente</option><option>Nur Stammdaten</option><option>Nur Dokumente</option><option>Keine Freigabe</option></select></label><label className="emp-checkline"><input type="checkbox" checked={filters.newDocs} onChange={event=>setFilters(old=>({...old,newDocs:event.target.checked}))}/>Neue Dokumente vorhanden</label><label className="emp-checkline"><input type="checkbox" checked={filters.instructionOpen} onChange={event=>setFilters(old=>({...old,instructionOpen:event.target.checked}))}/>Unterweisung offen</label><label className="emp-checkline"><input type="checkbox" checked={filters.archived} onChange={event=>setFilters(old=>({...old,archived:event.target.checked}))}/>Archivierte Baustellen anzeigen</label></div><footer><button onClick={resetFilters}>Zurücksetzen</button><button onClick={()=>setFilterOpen(false)}>Schließen</button><button className="btn btn--primary" onClick={()=>setFilterOpen(false)}>Filter anwenden</button></footer></aside></div>}
  </div>;
}

function EmployeeSiteRecordLegacy({emp,record,onBack}) {
  const [form]=React.useState({...record});
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${emp.name})`} onBack={onBack}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-site-record-icon"><Icon name="building" size={27}/></span><div><span>Persönliche Baustellenansicht</span><h2>{form.name}</h2><small>{form.projectName}</small></div><span className="emp-status is-valid">{form.releaseStatus}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Baustelle / Projektname" icon="building" value={`${form.name} · ${form.projectName}`}/>
        <TrainingRecordField label="Firma" icon="building" value={form.company}/>
        <TrainingRecordField label="Projekt-Nr." icon="doc" value={form.projectNr}/>
        <TrainingRecordField label="Eigene Rolle" icon="users" value={form.ownRole}/>
        <TrainingRecordField label="Einsatzbeginn" icon="cal" value={form.start}/>
        <TrainingRecordField label="Einsatzende" icon="cal" value={form.end}/>
        <TrainingRecordField label="Mein Einsatzstatus" icon="flag" value={`${form.assignmentStatus} · ${form.assignmentNotice}`}/>
        <TrainingRecordField label="Baustellenstatus" icon="flag" value={form.siteStatus}/>
        <TrainingRecordField label="Meine Zugriffsrechte" icon="shield" value={form.accessStatus}/>
        <TrainingRecordField label="Adresse" icon="pin" value={form.address}/>
        <TrainingRecordField label="Ansprechpartner" icon="users" value={form.contacts} wide/>
        <TrainingRecordField label="Ersthelfer" icon="users" value={form.firstAid}/>
        <TrainingRecordField label="Alarmplan" icon="doc" value="freigegeben"/>
        <TrainingRecordField label="Baustellenaushang" icon="doc" value="freigegeben"/>
        <TrainingRecordField label="Gefährdungsbeurteilungen" icon="shield" value={form.riskAssessment}/>
        <TrainingRecordField label="Eigene Unterweisungen" icon="flag" value={form.instruction}/>
        <TrainingRecordField label="Letzte Aktualisierung" icon="history" value={form.lastUpdate}/>
        <TrainingRecordField label="Beschreibung" icon="doc" value={form.description} wide/>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Freigegebene Dokumente</label><div className="emp-file-list">{(form.documents||[]).map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span></span>)}</div></div></div>
      </div>
    </section>
  </div>;
}

function EmployeeSiteRecord({emp,record,onBack}) {
  const form={...record};
  const displayEmp=form.employee || emp;
  const fullAccess=String(form.accessStatus||'').includes('Vollst');
  const dataAccess=!String(form.accessStatus||'').includes('Nur Dokumente');
  const documentAccess=String(form.accessStatus||'').includes('Dokumente') || String(form.accessStatus||'').includes('Nur Dokumente') || fullAccess;
  const safetyAccess=fullAccess;
  const docRows=(form.documents||[]).map((doc,index)=>({name:doc,category:index===0?'Alarmplan':index===1?'Baustellenaushang':'Sicherheit',date:index===0?'12.07.2026':index===1?'08.07.2026':'05.07.2026',state:index===0&&form.newDocuments?'neu':'gelesen'}));
  const section=(title,subtitle,children,wide=false)=><section className={'emp-site-detail-card' + (wide?' is-wide':'')}><header><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div></header>{children}</section>;
  const info=(label,value,icon='doc')=><div className="emp-site-info-line"><Icon name={icon} size={16}/><span>{label}</span><strong>{value || '-'}</strong></div>;
  const actionInfo=(label,value,button,icon='doc')=><div className="emp-site-info-line emp-site-action-line"><Icon name={icon} size={16}/><span>{label}</span><strong>{value || '-'}</strong><button>{button}</button></div>;
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${form.name} (${displayEmp.name})`} onBack={onBack} action={<button className="btn btn--ghost"><Icon name="pin" size={14}/>Adresse anzeigen</button>}/>
    <section className="emp-site-personal-hero">
      <div className="emp-avatar">{displayEmp.initials}</div>
      <div><h2>{form.name}</h2><p>{form.projectName} · {form.company}</p><div><span className="badge badge--valid"><span className="badge__dot" />{form.releaseStatus}</span><span className="badge badge--warn"><span className="badge__dot" />{form.assignmentStatus}</span></div></div>
      <dl><div><dt>Meine Rolle</dt><dd>{form.ownRole}</dd></div><div><dt>Einsatzzeitraum</dt><dd>{form.start} - {form.end}</dd></div><div><dt>Dokumente</dt><dd>{form.documentSummary}</dd></div></dl>
    </section>
    <div className="emp-site-detail-grid">
      <div className="emp-site-alerts">
        {form.assignmentNotice&&<span>{form.assignmentNotice}</span>}
        {form.newDocuments&&<span>Neues Dokument verfügbar</span>}
        {form.instructionOpen&&<span>Neue Baustellenunterweisung erforderlich</span>}
      </div>
      {dataAccess&&section('Meine Zuordnung','Persönliche Einsatzdaten auf dieser Baustelle',<>
        {info('Mitarbeiter',`${displayEmp.lastName}, ${displayEmp.firstName}`,'users')}
        {info('Eigene Rolle',form.ownRole,'shield')}
        {info('Einsatzbeginn',form.start,'cal')}
        {info('Einsatzende',form.end,'cal')}
        {info('Einsatzstatus',`${form.assignmentStatus} · ${form.assignmentNotice}`,'flag')}
        {info('Zugriffsrechte',form.accessStatus,'shield')}
      </>)}
      {dataAccess&&section('Baustellendaten','Nur freigegebene Stammdaten',<>
        {info('Firma',form.company,'building')}
        {info('Projekt-Nr.',form.projectNr,'doc')}
        {info('Adresse',form.address,'pin')}
        {info('Bauleiter',form.manager,'users')}
        {info('Vorarbeiter',form.foreman,'users')}
        {info('Weitere Ansprechpartner',form.contacts,'users')}
      </>)}
      {safetyAccess&&section('Sicherheit','Freigegebene Sicherheitsinformationen',<>
        {actionInfo('Alarmplan','freigegeben','Öffnen','doc')}
        {actionInfo('Baustellenaushang','freigegeben','Öffnen','doc')}
        {actionInfo('Gefährdungsbeurteilungen',form.riskAssessment,'Anzeigen','shield')}
        {actionInfo('Eigene Unterweisungen',form.instruction,'Anzeigen','flag')}
        {info('Ersthelfer',form.firstAid,'users')}
      </>,true)}
      {documentAccess&&section('Dokumente','Für diesen Mitarbeiter freigegebene Dateien',<div className="emp-site-doc-table"><table><thead><tr><th>Dokumentname</th><th>Kategorie</th><th>Datum</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>{docRows.map(doc=><tr key={doc.name}><td><Icon name="doc" size={14}/><strong>{doc.name}</strong></td><td>{doc.category}</td><td>{doc.date}</td><td><span className={`badge badge--${doc.state==='neu'?'warn':'valid'}`}><span className="badge__dot" />{doc.state}</span></td><td><button>Öffnen</button><button>Herunterladen</button></td></tr>)}</tbody></table></div>,true)}
      {section('Aktualisierungen','Letzte freigegebene Änderungen',<>
        {info('Letzte Aktualisierung',form.lastUpdate,'history')}
        {info('Was wurde geändert',form.newDocuments?'Alarmplan wurde aktualisiert':'Baustellendaten freigegeben','doc')}
        {info('Geändert von',form.updateBy,'users')}
        {info('Neue Dokumente',form.newDocuments?'1 neues Dokument':'keine neuen Dokumente','doc')}
        {info('Beschreibung',form.description,'doc')}
      </>,true)}
    </div>
  </div>;
}

function EmpRecordField({ label, editing=false, value, wide=false, children }) {
  return <div className={'emp-record-field' + (wide ? ' is-wide' : '')}><label>{label}</label>{editing ? children : <div>{value}</div>}</div>;
}

Object.assign(window, { EmployeeAdminDetail });
