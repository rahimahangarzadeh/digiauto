/* Full-page employee detail, training list and training record */

const EMPLOYEE_DETAIL_AREAS = [
  ['dashboard','Übersicht','dashboard'], ['master','Stammdaten','users'], ['trainings','Schulungen','cap'],
  ['instructions','Unterweisungen','flag'], ['jobs','Stellenbeschreibungen','doc'],
  ['medical','Untersuchungsvorsorge','shield'], ['license','Führerscheinkontrolle','cal'],
  ['operators','Geräteführer','settings'], ['checks','Geräteprüfung','check'],
  ['sites','Baustellen','building'], ['appointments','Termine','clock'],
];

function EmployeeAdminDetail({ emp, onBack }) {
  const [area, setArea] = React.useState('dashboard');
  const [record, setRecord] = React.useState(null);
  const [masterRecord, setMasterRecord] = React.useState(null);
  const [instructionRecord, setInstructionRecord] = React.useState(null);
  const [jobRecord, setJobRecord] = React.useState(null);
  const [medicalRecord, setMedicalRecord] = React.useState(null);
  const [licenseRecord, setLicenseRecord] = React.useState(null);
  const [operatorRecord, setOperatorRecord] = React.useState(null);
  const [equipmentCheckRecord, setEquipmentCheckRecord] = React.useState(null);
  const [siteRecord, setSiteRecord] = React.useState(null);
  const company = window.company(emp.company);

  if (siteRecord) return <EmployeeSiteRecord emp={emp} record={siteRecord} onBack={() => setSiteRecord(null)} />;
  if (equipmentCheckRecord) return <EmployeeEquipmentCheckRecord emp={emp} record={equipmentCheckRecord} onBack={() => setEquipmentCheckRecord(null)} />;
  if (operatorRecord) return <EmployeeOperatorRecord emp={emp} record={operatorRecord} onBack={() => setOperatorRecord(null)} />;
  if (licenseRecord) return <EmployeeLicenseRecord emp={emp} record={licenseRecord} onBack={() => setLicenseRecord(null)} />;
  if (medicalRecord) return <EmployeeMedicalRecord emp={emp} record={medicalRecord} onBack={() => setMedicalRecord(null)} />;
  if (jobRecord) return <EmployeeJobRecord emp={emp} record={jobRecord} onBack={() => setJobRecord(null)} />;
  if (instructionRecord) return <EmployeeInstructionRecord emp={emp} record={instructionRecord} onBack={() => setInstructionRecord(null)} />;
  if (masterRecord) return <EmployeeMasterRecord emp={emp} record={masterRecord} onBack={() => setMasterRecord(null)} />;
  if (record) return <EmployeeTrainingRecord emp={emp} record={record} onBack={() => setRecord(null)} />;
  if (area === 'instructions') return <EmployeeInstructionArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setInstructionRecord} />;
  if (area === 'jobs') return <EmployeeJobArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setJobRecord} />;
  if (area === 'medical') return <EmployeeMedicalArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setMedicalRecord} />;
  if (area === 'license') return <EmployeeLicenseArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setLicenseRecord} />;
  if (area === 'operators') return <EmployeeOperatorArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setOperatorRecord} />;
  if (area === 'checks') return <EmployeeEquipmentCheckArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setEquipmentCheckRecord} />;
  if (area === 'sites') return <EmployeeSiteArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setSiteRecord} />;
  if (area === 'appointments') return <EmployeeAppointmentsArea emp={emp} onBack={() => setArea('dashboard')} />;
  if (area === 'trainings') return <EmployeeTrainingArea emp={emp} onBack={() => setArea('dashboard')} onOpen={setRecord} />;

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
        </section>
        <div className="emp-quick-actions">
          <button onClick={() => setArea('trainings')}><Icon name="cap" size={20} />Schulung hinzufügen</button>
          <button onClick={() => setArea('appointments')}><Icon name="cal" size={20} />Termin erstellen</button>
        </div>
      </div>

      <div className="emp-detail-body">
        <nav className="emp-section-nav">
          {EMPLOYEE_DETAIL_AREAS.map(([id, label, icon]) => (
            <button key={id} className={area === id ? 'is-active' : ''} onClick={() => id === 'master' ? setMasterRecord(employeeMasterRecord(emp)) : setArea(id)}>
              <Icon name={icon} size={16} /><span>{label}</span><Icon name="chevR" size={13} />
            </button>
          ))}
        </nav>
        {area === 'dashboard'
          ? <><EmployeeOverviewCenter /><EmployeeOverviewAside /></>
          : <main className="emp-workspace__content emp-workspace__content--wide"><EmployeeAreaPlaceholder area={area} /></main>}
      </div>
    </div>
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

function EmployeeOverviewCenter() {
  const appointments = [
    ['15','OKT','Sicherheitsunterweisung','Präsenzschulung · 09:00 Uhr'],
    ['20','OKT','Geräteprüfung','Bagger-Zertifizierung · Ganztägig'],
    ['02','NOV','Führerscheinkontrolle','Quartalsprüfung · Büro'],
  ];
  const activities = [
    ['doc','Zertifikat hochgeladen','Vor 2 Stunden · Erweitertes Zertifikat'],
    ['building','Baustelle zugewiesen','Gestern · Wohnpark „Grüne Aue“'],
    ['phone','Profil aktualisiert','Vor 3 Tagen · Telefonnummer geändert'],
  ];
  return (
    <main className="emp-overview-center">
      <section className="emp-overview-card emp-appointments">
        <header><h2>Anstehende Termine</h2><button>Alle sehen</button></header>
        {appointments.map(item => <div className="emp-appointment-row" key={item[0]+item[2]}>
          <time><strong>{item[0]}</strong><span>{item[1]}</span></time>
          <div><strong>{item[2]}</strong><span>{item[3]}</span></div><Icon name="chevR" size={16} />
        </div>)}
      </section>
      <section className="emp-overview-card emp-recent">
        <header><h2>Letzte Aktivitäten</h2></header>
        <div className="emp-recent-list">
          {activities.map(item => <div key={item[1]}><span className="emp-recent-icon"><Icon name={item[0]} size={17} /></span><div><strong>{item[1]}</strong><small>{item[2]}</small></div></div>)}
        </div>
        <button className="emp-show-all">Alle Aktivitäten anzeigen</button>
      </section>
    </main>
  );
}

function EmployeeOverviewAside() {
  return (
    <aside className="emp-overview-aside">
      <section className="emp-action-required">
        <h2><Icon name="flag" size={19} />Handlungsbedarf</h2>
        <div><span>Ablaufende Zertifikate</span><strong>3</strong></div>
        <div><span>Fehlendes Dokument</span><strong>1</strong></div>
        <button>Jetzt bearbeiten <Icon name="chevR" size={14} /></button>
      </section>
      <section className="emp-side-stat">
        <h3><Icon name="flag" size={17} />Offene Unterweisungen</h3>
        <div><strong>2</strong><span>von 12</span><Icon name="chevR" size={15} /></div>
      </section>
      <section className="emp-next-check">
        <span><Icon name="cal" size={16} />Nächste Prüfung</span>
        <strong>4 Tage</strong>
        <small>Vorsorgeuntersuchung G26</small>
        <Icon name="cal" size={86} />
      </section>
    </aside>
  );
}

function EmployeeAreaPlaceholder({ area }) {
  const found = EMPLOYEE_DETAIL_AREAS.find(item => item[0] === area);
  return <div className="emp-placeholder"><Icon name={found?.[2] || 'doc'} size={24} /><h2>{found?.[1]}</h2><p>Dieser Bereich wird im nächsten Schritt ausgearbeitet.</p></div>;
}

function EmployeeAppointmentsArea({emp,onBack}) {
  return <div className="emp-full emp-appointments-page">
    <EmpPageTitle title={`Termine (${emp.name})`} onBack={onBack}/>
    <section className="emp-calendar-shell">
      <CalendarView activeCompany={emp.company} selectedTraining={null} selectedInstruction={null} selectedDate="" onTrainingSelected={() => {}} />
    </section>
  </div>;
}

function employeeMasterRecord(emp) {
  const company = window.company(emp.company);
  const text = `${emp.position} ${emp.department}`.toLowerCase();
  const group = /azubi|auszubild/.test(text) ? 'Azubi' : /praktik/.test(text) ? 'Praktikant' : /kaufm|büro|verwaltung|angestellte/i.test(text) ? 'Angestellt' : 'Gewerblich';
  return {
    id:emp.id, firstName:emp.firstName, lastName:emp.lastName, pn:emp.personalNr,
    company:company?.name || '-', department:emp.department, position:emp.position,
    group, workload:emp.workload || 'Vollzeit', entry:window.fmtDE(emp.entry),
    phone:emp.phone, email:emp.email, address:emp.address, status:emp.status === 'aktiv' ? 'Aktiv' : 'Inaktiv',
    description:`${emp.position} im Bereich ${emp.department}. Zugeordnet zur ${company?.name || 'Janning Group'}.`,
    profile:emp.initials, role:'Mitarbeiter', user:emp.email, password:'••••••••••',
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

function EmployeeMasterRecord({ emp, record, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({...record});
  const set = (key, value) => setForm(current => ({...current, [key]:value}));
  const inputFor = (key, options) => options
    ? <select value={form[key]} onChange={event => set(key,event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select>
    : <input type={key === 'password' ? 'password' : 'text'} value={form[key]} onChange={event => set(key,event.target.value)} />;
  return (
    <div className="emp-full emp-master-detail">
      <EmpPageTitle title={`Stammdaten (${emp.name})`} onBack={onBack} action={<button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Alle bearbeiten</button>} />

      <section className="emp-master-hero">
        <span className="emp-master-avatar is-hero">{form.profile}</span>
        <div>
          <div className="emp-master-hero__name"><h2>{form.firstName} {form.lastName}</h2><span className="emp-active"><i />{form.status}</span></div>
          <dl><div><dt>Position</dt><dd>{form.position}</dd></div><div><dt>Firma</dt><dd>{form.company}</dd></div></dl>
        </div>
        <button className="emp-master-edit" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Alle bearbeiten</button>
      </section>

      <div className="emp-master-layout">
        <main className="emp-master-main">
          <MasterDataCard title="Beschäftigung" icon="building" className="emp-master-employment">
            <div className="emp-master-field-grid">
              <MasterDataField label="Personalnummer" icon="doc" editing={editing} value={form.pn}>{inputFor('pn')}</MasterDataField>
              <MasterDataField label="Firma" icon="building" editing={editing} value={form.company}>{inputFor('company')}</MasterDataField>
              <MasterDataField label="Abteilung" icon="doc" editing={editing} value={form.department}>{inputFor('department')}</MasterDataField>
              <MasterDataField label="Position" icon="users" editing={editing} value={form.position}>{inputFor('position')}</MasterDataField>
              <MasterDataField label="Gruppe" icon="users" editing={editing} value={form.group}>{inputFor('group',['Gewerblich','Angestellt','Azubi','Praktikant'])}</MasterDataField>
              <MasterDataField label="Arbeitszeit" icon="clock" editing={editing} value={form.workload}>{inputFor('workload',['Vollzeit','Teilzeit'])}</MasterDataField>
              <MasterDataField label="Eintritt" icon="cal" editing={editing} value={form.entry}>{inputFor('entry')}</MasterDataField>
            </div>
          </MasterDataCard>

          <MasterDataCard title="Kontaktdaten" icon="users">
            <div className="emp-master-contact-list">
              <MasterDataField label="Telefon" icon="phone" editing={editing} value={form.phone}>{inputFor('phone')}</MasterDataField>
              <MasterDataField label="E-Mail" icon="mail" editing={editing} value={form.email}>{inputFor('email')}</MasterDataField>
              <MasterDataField label="Adresse" icon="pin" editing={editing} value={form.address}>{inputFor('address')}</MasterDataField>
            </div>
          </MasterDataCard>

          <MasterDataCard title="Systemzugang" icon="shield">
            <div className="emp-system-access">
              <MasterDataField label="Rolle" editing={editing} value={form.role}>{inputFor('role',['Admin','Geschäftsführer','Verwaltung','Bauleiter','Mitarbeiter'])}</MasterDataField>
              <MasterDataField label="Benutzerkonto" editing={editing} value={form.user}>{inputFor('user')}</MasterDataField>
              <MasterDataField label="Passwort" editing={editing} value={form.password}>{inputFor('password')}</MasterDataField>
              {!editing && <button><Icon name="shield" size={14} />Passwort ändern</button>}
            </div>
          </MasterDataCard>

          <MasterDataCard title="Beschreibung" icon="doc">
            {editing ? <textarea className="emp-master-description-input" rows="5" value={form.description} onChange={event => set('description',event.target.value)} /> : <p className="emp-master-description">{form.description}</p>}
          </MasterDataCard>
        </main>

        <aside className="emp-master-aside">
          <MasterDataCard title="Letzte Änderung" icon="history"><p className="emp-last-change">03.06.2026, 10:32 Uhr<br />von Sabine Janning</p></MasterDataCard>
          <MasterDataCard title="Schnellaktionen" icon="settings">
            <div className="emp-master-actions">
              <button><Icon name="plus" size={14} />Dokument hinzufügen<Icon name="chevR" size={13} /></button>
              <button><Icon name="cap" size={14} />Schulung hinzufügen<Icon name="chevR" size={13} /></button>
              <button><Icon name="flag" size={14} />Unterweisung hinzufügen<Icon name="chevR" size={13} /></button>
              <button><Icon name="cal" size={14} />Termin erstellen<Icon name="chevR" size={13} /></button>
            </div>
          </MasterDataCard>
          <MasterDataCard title="Profilbild" icon="doc">
            <div className="emp-master-photo"><span className="emp-master-avatar is-large">{form.profile}</span><div><strong>Profilbild des Mitarbeiters</strong><small>PNG oder JPG, maximal 5 MB</small><label><Icon name="upload" size={14} />Profilbild ändern<input type="file" accept="image/*" /></label></div></div>
          </MasterDataCard>
        </aside>
      </div>
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
    return {
      id:training.id, name:training.name, issued:cert.issuedAt ? window.fmtDE(cert.issuedAt) : '21.05.2024',
      expires:cert.expiresAt ? window.fmtDE(cert.expiresAt) : '21.05.2027',
      days:status === 'expired' ? -21 : status === 'warn' ? 37 : 412 + index * 29,
      status, released:index !== 3, changed:index === 0 ? '03.06.2026 · Sabine Janning' : `${String(28-index).padStart(2,'0')}.05.2026 · Michael Janning`,
      description:training.desc, documents:index % 3 === 0 ? 2 : 1,
    };
  });
}

function EmployeeTrainingArea({ emp, onBack, onOpen }) {
  const records = React.useMemo(() => employeeTrainingRecords(emp), [emp.id]);
  const [selected, setSelected] = React.useState(new Set());
  const [sort, setSort] = React.useState({ key:'name', dir:'asc' });
  const [menu, setMenu] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [group, setGroup] = React.useState('');
  const labels = { valid:'Gültig', warn:'Läuft bald ab', expired:'Abgelaufen' };
  const value = (row, key) => key === 'status' ? labels[row.status] : row[key];
  let rows = filter === 'all' ? records : records.filter(row => row.status === filter);
  rows = [...rows].sort((a,b) => (sort.dir === 'asc' ? 1 : -1) * String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle = id => setSelected(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const columns = [['name','Zertifikat / Schulung'],['issued','Ausstellungsdatum'],['expires','Ablaufdatum'],['days','Restlaufzeit'],['status','Status'],['released','Freigabe für Mitarbeiter'],['changed','Geändert'],['description','Beschreibung'],['documents','Dokumente']];

  return (
    <div className="emp-full">
      <EmpPageTitle title={`Schulungen (${emp.name})`} onBack={onBack} />
      <div className="emp-training-tabs">
        {['all','valid','warn','expired'].map(id => <button key={id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{id === 'all' ? `Alle ${records.length}` : labels[id]}</button>)}
        {group && <button className="emp-clear-group" onClick={() => setGroup('')}>Gruppierung aufheben</button>}
      </div>
      {selected.size > 0 && <div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14} />Als Excel exportieren</button><button><Icon name="edit" size={14} />Status ändern</button><button className="is-danger"><Icon name="trash" size={14} />Löschen</button></div>}
      <div className="emp-table-wrap"><table className="emp-training-table">
        <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size === records.length} onChange={() => setSelected(selected.size === records.length ? new Set() : new Set(records.map(row => row.id)))} /></th>
          {columns.map(([key,label]) => <th key={key}><button onClick={() => setMenu(menu === key ? null : key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button>
            {menu === key && <div className="emp-column-menu"><button onClick={() => {setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={() => {setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={() => {setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={() => setMenu(null)}>Spaltenfilter öffnen</button></div>}
          </th>)}</tr></thead>
        <tbody>{rows.map((row,index) => <React.Fragment key={row.id}>
          {group && (index === 0 || value(rows[index-1],group) !== value(row,group)) && <tr className="emp-group-row"><td colSpan="10">{columns.find(col => col[0] === group)?.[1]}: {String(value(row,group))}</td></tr>}
          <tr className={row.status === 'expired' ? 'is-expired' : ''} onClick={() => onOpen(row)}>
            <td className="emp-check" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} /></td>
            <td><strong>{row.name}</strong></td><td>{row.issued}</td><td>{row.expires}</td><td className={row.days < 0 ? 'is-overdue' : ''}>{row.days < 0 ? `${Math.abs(row.days)} Tage überzogen` : `in ${row.days} Tagen`}</td>
            <td><span className={'emp-status is-' + row.status}>{labels[row.status]}</span></td><td className="emp-release">{row.released ? <Icon name="check" size={17} stroke={2.4} /> : '-'}</td><td>{row.changed}</td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13} />{row.documents}</span></td>
          </tr></React.Fragment>)}</tbody>
      </table></div>
    </div>
  );
}

function EmployeeTrainingRecord({ emp, record, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const [docs, setDocs] = React.useState([`${record.name.replace(/\s+/g,'_')}_Zertifikat.pdf`,'Teilnahmebescheinigung_Janning_Tiefbau_GmbH.pdf'].slice(0,record.documents));
  const [form, setForm] = React.useState({...record, validity:'09.09.2026 – Nächste Schulung'});
  const set = (key,val) => setForm(old => ({...old,[key]:val}));
  const statusName = form.status === 'valid' ? 'Gültig' : form.status === 'warn' ? 'Läuft bald ab' : 'Abgelaufen';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>} />
    <section className="emp-training-record-card">
      <header className="emp-training-record-hero">
        <span className="emp-training-record-icon"><Icon name="cap" size={27} stroke={1.8}/></span>
        <div><span>Zertifikat / Schulung</span><h2>{form.name}</h2></div>
        <span className={'emp-status is-' + form.status}>{statusName}</span>
      </header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Zertifikat / Schulung" icon="cap" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ausstellungsdatum" icon="cal" editing={editing} value={form.issued}><input value={form.issued} onChange={e=>set('issued',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ablaufdatum" icon="cal" editing={editing} value={form.expires}><input value={form.expires} onChange={e=>set('expires',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restlaufzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage überzogen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Gültigkeit" icon="cal" editing={editing} value={form.validity} wide><input value={form.validity} onChange={e=>set('validity',e.target.value)}/></TrainingRecordField>
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

function employeeInstructionRecords() {
  return window.SEED.instructions.map((instruction, index) => ({
    id:instruction.id,
    name:instruction.title,
    company:window.company(instruction.company)?.name || '-',
    date:window.fmtDE(instruction.date),
    instructor:instruction.instructor,
    group:instruction.group,
    participants:instruction.participants.length,
    status:instruction.status === 'archiviert' ? 'archived' : index === 1 ? 'open' : 'done',
    released:index !== 1,
    version:instruction.version,
    history:instruction.history,
    description:instruction.description,
    explanation:instruction.explanation,
    document:instruction.document,
    documents:instruction.document ? 1 : 0,
  }));
}

function EmployeeInstructionArea({ emp, onBack, onOpen }) {
  const records = React.useMemo(() => employeeInstructionRecords(), []);
  const [selected, setSelected] = React.useState(new Set());
  const [sort, setSort] = React.useState({key:'name',dir:'asc'});
  const [menu, setMenu] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [group, setGroup] = React.useState('');
  const labels = {done:'Durchgeführt',open:'Offen',archived:'Archiviert'};
  const value = (row,key) => key === 'status' ? labels[row.status] : key === 'history' ? row.version : row[key];
  let rows = filter === 'all' ? records : records.filter(row => row.status === filter);
  rows = [...rows].sort((a,b) => (sort.dir === 'asc' ? 1 : -1) * String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle = id => setSelected(current => { const next=new Set(current); next.has(id)?next.delete(id):next.add(id); return next; });
  const columns = [['name','Name Unterweisung'],['company','Firma'],['date','Durchgeführt'],['instructor','Unterweisender'],['group','Gruppe / Abteilung'],['participants','Zahl Teilnehmer'],['status','Status'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['documents','Dokument']];

  return <div className="emp-full">
    <EmpPageTitle title={`Unterweisungen (${emp.name})`} onBack={onBack} />
    <div className="emp-training-tabs">
      {['all','done','open','archived'].map(id => <button key={id} className={filter===id?'is-active':''} onClick={() => setFilter(id)}>{id==='all'?`Alle ${records.length}`:labels[id]}</button>)}
      {group && <button className="emp-clear-group" onClick={() => setGroup('')}>Gruppierung aufheben</button>}
    </div>
    {selected.size>0 && <div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Als Excel exportieren</button><button><Icon name="edit" size={14}/>Status ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Löschen</button></div>}
    <div className="emp-table-wrap"><table className="emp-instruction-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size===records.length} onChange={() => setSelected(selected.size===records.length?new Set():new Set(records.map(row=>row.id)))}/></th>
        {columns.map(([key,label]) => <th key={key}><button onClick={() => setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>
          {menu===key && <div className="emp-column-menu"><button onClick={() => {setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={() => {setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={() => {setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={() => setMenu(null)}>Spaltenfilter öffnen</button></div>}
        </th>)}</tr></thead>
      <tbody>{rows.map((row,index) => <React.Fragment key={row.id}>
        {group && (index===0 || value(rows[index-1],group)!==value(row,group)) && <tr className="emp-group-row"><td colSpan="12">{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='open'?'is-open':''} onClick={() => onOpen(row)}>
          <td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)}/></td>
          <td><strong>{row.name}</strong></td><td>{row.company}</td><td>{row.date}</td><td>{row.instructor}</td><td>{row.group}</td><td>{row.participants}</td>
          <td><span className={'emp-status is-'+row.status}>{labels[row.status]}</span></td><td className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</td>
          <td><span className="emp-version-chip"><Icon name="history" size={13}/>{row.version}</span></td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>{row.documents}</span></td>
        </tr>
      </React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeInstructionRecord({ emp, record, onBack }) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState(record.document?[record.document]:[]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const statusName=form.status==='done'?'Durchgeführt':form.status==='open'?'Offen':'Archiviert';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card">
      <header className="emp-training-record-hero">
        <span className="emp-training-record-icon emp-instruction-record-icon"><Icon name="flag" size={27} stroke={1.8}/></span>
        <div><span>Unterweisung</span><h2>{form.name}</h2></div>
        <span className={'emp-status is-'+form.status}>{statusName}</span>
      </header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Name Unterweisung" icon="flag" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Firma" icon="building" editing={editing} value={form.company}><input value={form.company} onChange={e=>set('company',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Durchgeführt" icon="cal" editing={editing} value={form.date}><input value={form.date} onChange={e=>set('date',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Unterweisender" icon="users" editing={editing} value={form.instructor}><input value={form.instructor} onChange={e=>set('instructor',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gruppe / Abteilung" icon="users" editing={editing} value={form.group}><input value={form.group} onChange={e=>set('group',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Zahl Teilnehmer" icon="users" editing={editing} value={form.participants}><input type="number" value={form.participants} onChange={e=>set('participants',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="done">Durchgeführt</option><option value="open">Offen</option><option value="archived">Archiviert</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" editing={editing} value={`${form.version} · ${form.history.length} Versionen`} wide><input value={form.version} onChange={e=>set('version',e.target.value)}/></TrainingRecordField>
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
    {id:'job-1',name:`Stellenbeschreibung ${emp.position}`,version:'v3.1',created:'12.01.2026',signed:'18.01.2026',status:'signed',released:true,history:3,description:`Aufgaben, Befugnisse und Verantwortlichkeiten für die Position ${emp.position}.`,document:`Stellenbeschreibung_${emp.position}_v3.1.pdf`},
    {id:'job-2',name:'Zusatzfunktion Sicherheitsbeauftragter',version:'v1.2',created:'08.03.2026',signed:'-',status:'open',released:false,history:2,description:'Ergänzende Aufgaben im Arbeits- und Gesundheitsschutz.',document:'Zusatzfunktion_Sicherheitsbeauftragter_v1.2.pdf'},
    {id:'job-3',name:'Vertretungsregelung Bauleitung',version:'v2.0',created:'14.09.2025',signed:'22.09.2025',status:'signed',released:true,history:4,description:'Regelung zur Vertretung und Freigabe bei Abwesenheit der Bauleitung.',document:'Vertretungsregelung_Bauleitung_v2.0.pdf'},
  ];
}

function EmployeeJobArea({emp,onBack,onOpen}) {
  const records=React.useMemo(()=>employeeJobRecords(emp),[emp.id]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'name',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const labels={signed:'Unterschrieben',open:'Unterschrift offen'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.version:row[key];
  let rows=filter==='all'?records:records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const columns=[['name','Stellenbeschreibung'],['version','Version'],['created','Erstellt am'],['signed','Unterschrieben am'],['status','Status'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['document','Dokument']];
  return <div className="emp-full">
    <EmpPageTitle title={`Stellenbeschreibungen (${emp.name})`} onBack={onBack}/>
    <div className="emp-training-tabs">{['all','signed','open'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{id==='all'?`Alle ${records.length}`:labels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Als Excel exportieren</button><button><Icon name="edit" size={14}/>Status ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Löschen</button></div>}
    <div className="emp-table-wrap"><table className="emp-job-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size===records.length} onChange={()=>setSelected(selected.size===records.length?new Set():new Set(records.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={()=>setMenu(null)}>Spaltenfilter öffnen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan="10">{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='open'?'is-open':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          <td><strong>{row.name}</strong></td><td><span className="emp-version-chip">{row.version}</span></td><td>{row.created}</td><td>{row.signed}</td><td><span className={'emp-status is-'+row.status}>{labels[row.status]}</span></td><td className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</td><td><span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Versionen</span></td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>1</span></td>
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeJobRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const statusName=form.status==='signed'?'Unterschrieben':'Unterschrift offen';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-job-record-icon"><Icon name="doc" size={27}/></span><div><span>Stellenbeschreibung</span><h2>{form.name}</h2></div><span className={'emp-status is-'+form.status}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Stellenbeschreibung" icon="doc" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Version" icon="history" editing={editing} value={form.version}><input value={form.version} onChange={e=>set('version',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Erstellt am" icon="cal" editing={editing} value={form.created}><input value={form.created} onChange={e=>set('created',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Unterschrieben am" icon="cal" editing={editing} value={form.signed}><input value={form.signed} onChange={e=>set('signed',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="signed">Unterschrieben</option><option value="open">Unterschrift offen</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`} wide/>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeMedicalRecords() {
  return [
    {id:'med-1',name:'G26 Atemschutz',type:'Pflichtvorsorge',last:'14.03.2025',next:'14.03.2026',days:-82,status:'expired',released:true,history:3,description:'Arbeitsmedizinische Vorsorge für Tätigkeiten mit Atemschutzgeräten.',document:'G26_Atemschutz_Bescheinigung.pdf'},
    {id:'med-2',name:'G37 Lärmexposition',type:'Angebotsvorsorge',last:'08.01.2025',next:'08.01.2028',days:583,status:'valid',released:true,history:2,description:'Vorsorge bei Tätigkeiten in lärmbelasteten Arbeitsbereichen.',document:'G37_Laermexposition.pdf'},
    {id:'med-3',name:'G25 Fahr- und Steuertätigkeiten',type:'Eignungsuntersuchung',last:'12.06.2024',next:'12.06.2026',days:8,status:'warn',released:false,history:4,description:'Eignungsuntersuchung für Fahr-, Steuer- und Überwachungstätigkeiten.',document:'G25_Fahrtaetigkeiten.pdf'},
  ];
}

function EmployeeMedicalArea({emp,onBack,onOpen}) {
  const records=React.useMemo(()=>employeeMedicalRecords(),[]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'name',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const labels={valid:'Gültig',warn:'Termin bald fällig',expired:'Überfällig'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  let rows=filter==='all'?records:records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const columns=[['name','Untersuchung'],['type','Art'],['last','Letzte Untersuchung'],['next','Nächster Termin'],['days','Restzeit'],['status','Status'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['document','Dokument']];
  return <div className="emp-full">
    <EmpPageTitle title={`Untersuchungsvorsorge (${emp.name})`} onBack={onBack}/>
    <div className="emp-training-tabs">{['all','valid','warn','expired'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{id==='all'?`Alle ${records.length}`:labels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Als Excel exportieren</button><button><Icon name="edit" size={14}/>Status ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Löschen</button></div>}
    <div className="emp-table-wrap"><table className="emp-medical-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size===records.length} onChange={()=>setSelected(selected.size===records.length?new Set():new Set(records.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={()=>setMenu(null)}>Spaltenfilter öffnen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan="11">{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          <td><strong>{row.name}</strong></td><td>{row.type}</td><td>{row.last}</td><td>{row.next}</td><td className={row.days<0?'is-overdue':''}>{row.days<0?`${Math.abs(row.days)} Tage überfällig`:`in ${row.days} Tagen`}</td><td><span className={'emp-status is-'+row.status}>{labels[row.status]}</span></td><td className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</td><td><span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Versionen</span></td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>1</span></td>
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeMedicalRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const statusName=form.status==='valid'?'Gültig':form.status==='warn'?'Termin bald fällig':'Überfällig';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-medical-record-icon"><Icon name="shield" size={27}/></span><div><span>Untersuchungsvorsorge</span><h2>{form.name}</h2></div><span className={'emp-status is-'+form.status}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Untersuchung" icon="shield" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Art" icon="doc" editing={editing} value={form.type}><input value={form.type} onChange={e=>set('type',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Letzte Untersuchung" icon="cal" editing={editing} value={form.last}><input value={form.last} onChange={e=>set('last',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Nächster Termin" icon="cal" editing={editing} value={form.next}><input value={form.next} onChange={e=>set('next',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage überfällig`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Termin bald fällig</option><option value="expired">Überfällig</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`}/>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeLicenseRecords() {
  return [
    {id:'lic-1',licenseClass:'B, BE',origin:'Deutschland',last:'10.03.2025',next:'10.03.2026',expires:'10.03.2030',days:1375,status:'valid',released:true,history:4,description:'Fahrerlaubnis für Pkw und Anhänger.',document:'Fuehrerschein_B_BE.pdf'},
    {id:'lic-2',licenseClass:'C, CE',origin:'EU',last:'15.01.2025',next:'15.01.2026',expires:'15.07.2026',days:41,status:'warn',released:true,history:3,description:'Fahrerlaubnis für Lkw und Lastzüge.',document:'Fuehrerschein_C_CE.pdf'},
    {id:'lic-3',licenseClass:'L, T',origin:'Deutschland',last:'18.04.2024',next:'18.04.2025',expires:'18.04.2026',days:-47,status:'expired',released:false,history:2,description:'Fahrerlaubnis für land- und forstwirtschaftliche Zugmaschinen.',document:'Fuehrerschein_L_T.pdf'},
  ];
}

function EmployeeLicenseArea({emp,onBack,onOpen}) {
  const records=React.useMemo(()=>employeeLicenseRecords(),[]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'licenseClass',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  let rows=filter==='all'?records:records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const columns=[['licenseClass','Führerscheinklasse'],['origin','Herkunft'],['last','Letzte Kontrolle'],['next','Nächste Kontrolle'],['expires','Führerschein läuft ab'],['days','Restzeit'],['status','Status'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['document','Dokument']];
  return <div className="emp-full">
    <EmpPageTitle title={`Führerschein (${emp.name})`} onBack={onBack}/>
    <div className="emp-training-tabs">{['all','valid','warn','expired'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{id==='all'?`Alle ${records.length}`:labels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Als Excel exportieren</button><button><Icon name="edit" size={14}/>Status ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Löschen</button></div>}
    <div className="emp-table-wrap"><table className="emp-license-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size===records.length} onChange={()=>setSelected(selected.size===records.length?new Set():new Set(records.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={()=>setMenu(null)}>Spaltenfilter öffnen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan="12">{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          <td><strong>{row.licenseClass}</strong></td><td>{row.origin}</td><td>{row.last}</td><td>{row.next}</td><td>{row.expires}</td><td className={row.days<0?'is-overdue':''}>{row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`}</td><td><span className={'emp-status is-'+row.status}>{labels[row.status]}</span></td><td className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</td><td><span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Versionen</span></td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>1</span></td>
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeLicenseRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const statusName=form.status==='valid'?'Gültig':form.status==='warn'?'Läuft bald ab':'Abgelaufen';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`Führerschein ${record.licenseClass} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-license-record-icon"><Icon name="cal" size={27}/></span><div><span>Führerschein</span><h2>Klasse {form.licenseClass}</h2></div><span className={'emp-status is-'+form.status}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Führerscheinklasse" icon="doc" editing={editing} value={form.licenseClass}><input value={form.licenseClass} onChange={e=>set('licenseClass',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Herkunft" icon="pin" editing={editing} value={form.origin}><input value={form.origin} onChange={e=>set('origin',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Letzte Kontrolle" icon="cal" editing={editing} value={form.last}><input value={form.last} onChange={e=>set('last',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Nächste Kontrolle" icon="cal" editing={editing} value={form.next}><input value={form.next} onChange={e=>set('next',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Führerschein läuft ab" icon="cal" editing={editing} value={form.expires}><input value={form.expires} onChange={e=>set('expires',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage abgelaufen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`} wide/>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeOperatorRecords() {
  return [
    {id:'op-1',device:'Bagger',training:'Ausbildung Erdbaumaschinenführer',issued:'12.05.2024',expires:'12.05.2027',days:342,status:'valid',released:true,history:3,description:'Berechtigung zum Führen von Hydraulikbaggern bis 30 t.',document:'Geraetefuehrer_Bagger.pdf'},
    {id:'op-2',device:'Radlader',training:'Betriebliche Einweisung Radlader',issued:'08.08.2025',expires:'08.08.2026',days:65,status:'warn',released:true,history:2,description:'Betriebliche Einweisung für Radlader auf Baustellen und Betriebshof.',document:'Einweisung_Radlader.pdf'},
    {id:'op-3',device:'Gabelstapler',training:'Fahrausweis Flurförderzeuge',issued:'18.04.2023',expires:'18.04.2026',days:-47,status:'expired',released:false,history:4,description:'Fahrausweis und jährliche Unterweisung für Flurförderzeuge.',document:'Fahrausweis_Gabelstapler.pdf'},
  ];
}

function EmployeeOperatorArea({emp,onBack,onOpen}) {
  const records=React.useMemo(()=>employeeOperatorRecords(),[]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'device',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  let rows=filter==='all'?records:records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const columns=[['device','Typ Gerät'],['training','Ausbildung / Einweisung'],['issued','Ausstellungsdatum'],['expires','Ablaufdatum'],['days','Restlaufzeit'],['status','Status'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['document','Dokument']];
  return <div className="emp-full">
    <EmpPageTitle title={`Geräteführer (${emp.name})`} onBack={onBack}/>
    <div className="emp-training-tabs">{['all','valid','warn','expired'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{id==='all'?`Alle ${records.length}`:labels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Als Excel exportieren</button><button><Icon name="edit" size={14}/>Status ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Löschen</button></div>}
    <div className="emp-table-wrap"><table className="emp-operator-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size===records.length} onChange={()=>setSelected(selected.size===records.length?new Set():new Set(records.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={()=>setMenu(null)}>Spaltenfilter öffnen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan="11">{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          <td><strong>{row.device}</strong></td><td>{row.training}</td><td>{row.issued}</td><td>{row.expires}</td><td className={row.days<0?'is-overdue':''}>{row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`}</td><td><span className={'emp-status is-'+row.status}>{labels[row.status]}</span></td><td className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</td><td><span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Versionen</span></td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>1</span></td>
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeOperatorRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const statusName=form.status==='valid'?'Gültig':form.status==='warn'?'Läuft bald ab':'Abgelaufen';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.device} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-operator-record-icon"><Icon name="settings" size={27}/></span><div><span>Geräteführer</span><h2>{form.device}</h2></div><span className={'emp-status is-'+form.status}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Typ Gerät" icon="settings" editing={editing} value={form.device}><input value={form.device} onChange={e=>set('device',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ausbildung / Einweisung" icon="cap" editing={editing} value={form.training}><input value={form.training} onChange={e=>set('training',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ausstellungsdatum" icon="cal" editing={editing} value={form.issued}><input value={form.issued} onChange={e=>set('issued',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Ablaufdatum" icon="cal" editing={editing} value={form.expires}><input value={form.expires} onChange={e=>set('expires',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restlaufzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage abgelaufen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`}/>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeEquipmentCheckRecords() {
  return [
    {id:'check-1',area:'Erdbaumaschinen',authorization:'Befähigte Person für Baumaschinenprüfung',validFrom:'01.03.2025',validTo:'01.03.2028',days:636,status:'valid',released:true,history:3,description:'Befähigung zur wiederkehrenden Prüfung von Baggern, Radladern und Verdichtungsgeräten.',document:'Befaehigung_Erdbaumaschinen.pdf'},
    {id:'check-2',area:'Leitern und Tritte',authorization:'Beauftragung zur Prüfung von Leitern und Tritten',validFrom:'15.07.2025',validTo:'15.07.2026',days:41,status:'warn',released:true,history:2,description:'Beauftragung zur regelmäßigen Prüfung ortsveränderlicher Leitern und Tritte.',document:'Beauftragung_Leitern_Tritte.pdf'},
    {id:'check-3',area:'Elektrische Arbeitsmittel',authorization:'Befähigte Person nach DGUV Vorschrift 3',validFrom:'18.04.2023',validTo:'18.04.2026',days:-47,status:'expired',released:false,history:4,description:'Prüfung ortsveränderlicher elektrischer Arbeitsmittel nach DGUV Vorschrift 3.',document:'Befaehigung_DGUV_V3.pdf'},
  ];
}

function EmployeeEquipmentCheckArea({emp,onBack,onOpen}) {
  const records=React.useMemo(()=>employeeEquipmentCheckRecords(),[]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'area',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [group,setGroup]=React.useState('');
  const labels={valid:'Gültig',warn:'Läuft bald ab',expired:'Abgelaufen'};
  const value=(row,key)=>key==='status'?labels[row.status]:key==='history'?row.history:row[key];
  let rows=filter==='all'?records:records.filter(row=>row.status===filter);
  rows=[...rows].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const columns=[['area','Arbeitsmittel-Bereiche'],['authorization','Befähigung / Beauftragung'],['validFrom','Gültig ab'],['validTo','Gültig bis'],['days','Restlaufzeit'],['status','Status'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['document','Dokument']];
  return <div className="emp-full">
    <EmpPageTitle title={`Geräteprüfung (${emp.name})`} onBack={onBack}/>
    <div className="emp-training-tabs">{['all','valid','warn','expired'].map(id=><button key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{id==='all'?`Alle ${records.length}`:labels[id]}</button>)}{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Als Excel exportieren</button><button><Icon name="edit" size={14}/>Status ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Löschen</button></div>}
    <div className="emp-table-wrap"><table className="emp-equipment-check-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size===records.length} onChange={()=>setSelected(selected.size===records.length?new Set():new Set(records.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={()=>setMenu(null)}>Spaltenfilter öffnen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan="11">{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr className={row.status==='expired'?'is-expired':row.status==='warn'?'is-warn':''} onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          <td><strong>{row.area}</strong></td><td>{row.authorization}</td><td>{row.validFrom}</td><td>{row.validTo}</td><td className={row.days<0?'is-overdue':''}>{row.days<0?`${Math.abs(row.days)} Tage abgelaufen`:`in ${row.days} Tagen`}</td><td><span className={'emp-status is-'+row.status}>{labels[row.status]}</span></td><td className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</td><td><span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Versionen</span></td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>1</span></td>
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeEquipmentCheckRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const statusName=form.status==='valid'?'Gültig':form.status==='warn'?'Läuft bald ab':'Abgelaufen';
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.area} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-equipment-check-record-icon"><Icon name="check" size={27}/></span><div><span>Geräteprüfung</span><h2>{form.area}</h2></div><span className={'emp-status is-'+form.status}>{statusName}</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Arbeitsmittel-Bereiche" icon="settings" editing={editing} value={form.area}><input value={form.area} onChange={e=>set('area',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Befähigung / Beauftragung" icon="shield" editing={editing} value={form.authorization}><input value={form.authorization} onChange={e=>set('authorization',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültig ab" icon="cal" editing={editing} value={form.validFrom}><input value={form.validFrom} onChange={e=>set('validFrom',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Gültig bis" icon="cal" editing={editing} value={form.validTo}><input value={form.validTo} onChange={e=>set('validTo',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Restlaufzeit" icon="clock" value={form.days<0?`${Math.abs(form.days)} Tage abgelaufen`:`in ${form.days} Tagen`}/>
        <TrainingRecordField label="Status" icon="flag" editing={editing} value={statusName}><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option></select></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`}/>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function employeeSiteRecords() {
  return [
    {id:'site-1',name:'Baustelle Alex Barum',company:'Janning Tiefbau GmbH',projectNr:'BAU-2026-014',client:'Stadt Nordhorn',manager:'Alexander Petersen',foreman:'Markus Brinker',address:'Lingener Straße 42, 48529 Nordhorn',employees:10,firstAiders:'Markus Brinker, Tobias Nowak, Ralf Kowalski',released:true,history:4,description:'Kanalsanierung Nordhorn mit Tiefbau-, Rohrbau- und Wiederherstellungsarbeiten.',document:'Baustelle_Alex_Barum.pdf'},
    {id:'site-2',name:'Rohrgraben Suedring',company:'Janning Rohrbau GmbH',projectNr:'BAU-2026-021',client:'Wasserverband Nordhorn',manager:'Stefan Mueller',foreman:'Thomas Wegener',address:'Südring 18, 48527 Nordhorn',employees:8,firstAiders:'Thomas Wegener, Dirk Jürgens',released:true,history:3,description:'Hausanschlüsse und Rohrleitungsarbeiten am Südring.',document:'Rohrgraben_Suedring.pdf'},
    {id:'site-3',name:'Bohrung Gewerbepark',company:'Janning Bohrtechnik GmbH',projectNr:'BAU-2026-028',client:'Gewerbepark Bentheim GmbH',manager:'Dirk Berg',foreman:'Mehmet Brinker',address:'Industriestraße 7, 48455 Bad Bentheim',employees:6,firstAiders:'Mehmet Brinker',released:false,history:2,description:'Horizontalbohrung und Leitungsverlegung im Gewerbepark.',document:'Bohrung_Gewerbepark.pdf'},
  ];
}

function EmployeeSiteArea({emp,onBack,onOpen}) {
  const records=React.useMemo(()=>employeeSiteRecords(),[]);
  const [selected,setSelected]=React.useState(new Set());
  const [sort,setSort]=React.useState({key:'name',dir:'asc'});
  const [menu,setMenu]=React.useState(null);
  const [group,setGroup]=React.useState('');
  const value=(row,key)=>key==='history'?row.history:row[key];
  const rows=[...records].sort((a,b)=>(sort.dir==='asc'?1:-1)*String(value(a,sort.key)).localeCompare(String(value(b,sort.key)),'de',{numeric:true}));
  const toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next;});
  const columns=[['name','Baustelle / Projektname'],['company','Firma'],['projectNr','Projekt-Nr.'],['client','Auftraggeber'],['manager','Bauleiter'],['foreman','Vorarbeiter'],['address','Adresse'],['employees','Anzahl Mitarbeiter'],['firstAiders','Name Ersthelfer'],['released','Freigabe für Mitarbeiter'],['history','Versionshistorie'],['description','Beschreibung'],['document','Dokument']];
  return <div className="emp-full">
    <EmpPageTitle title={`Baustellen (${emp.name})`} onBack={onBack}/>
    <div className="emp-training-tabs"><button className="is-active">Alle {records.length}</button>{group&&<button className="emp-clear-group" onClick={()=>setGroup('')}>Gruppierung aufheben</button>}</div>
    {selected.size>0&&<div className="emp-bulk"><strong>{selected.size} ausgewählt</strong><button><Icon name="download" size={14}/>Als Excel exportieren</button><button><Icon name="edit" size={14}/>Freigabe ändern</button><button className="is-danger"><Icon name="trash" size={14}/>Löschen</button></div>}
    <div className="emp-table-wrap"><table className="emp-site-table">
      <thead><tr><th className="emp-check"><input type="checkbox" checked={selected.size===records.length} onChange={()=>setSelected(selected.size===records.length?new Set():new Set(records.map(row=>row.id)))}/></th>
        {columns.map(([key,label])=><th key={key}><button onClick={()=>setMenu(menu===key?null:key)}>{label}<span>{sort.key===key?(sort.dir==='asc'?'↑':'↓'):'⌄'}</span></button>{menu===key&&<div className="emp-column-menu"><button onClick={()=>{setSort({key,dir:'asc'});setMenu(null);}}>Aufsteigend sortieren</button><button onClick={()=>{setSort({key,dir:'desc'});setMenu(null);}}>Absteigend sortieren</button><button onClick={()=>{setGroup(key);setMenu(null);}}>Nach „{label}“ gruppieren</button><button onClick={()=>setMenu(null)}>Spaltenfilter öffnen</button></div>}</th>)}
      </tr></thead>
      <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>{group&&(index===0||value(rows[index-1],group)!==value(row,group))&&<tr className="emp-group-row"><td colSpan="14">{columns.find(col=>col[0]===group)?.[1]}: {String(value(row,group))}</td></tr>}
        <tr onClick={()=>onOpen(row)}><td className="emp-check" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggle(row.id)}/></td>
          <td><strong>{row.name}</strong></td><td>{row.company}</td><td>{row.projectNr}</td><td>{row.client}</td><td>{row.manager}</td><td>{row.foreman}</td><td>{row.address}</td><td>{row.employees}</td><td className="emp-ellipsis">{row.firstAiders}</td><td className="emp-release">{row.released?<Icon name="check" size={17} stroke={2.4}/>: '-'}</td><td><span className="emp-version-chip"><Icon name="history" size={13}/>{row.history} Versionen</span></td><td className="emp-ellipsis">{row.description}</td><td><span className="emp-doc-count"><Icon name="doc" size={13}/>1</span></td>
        </tr></React.Fragment>)}</tbody>
    </table></div>
  </div>;
}

function EmployeeSiteRecord({emp,record,onBack}) {
  const [editing,setEditing]=React.useState(false);
  const [docs,setDocs]=React.useState([record.document]);
  const [form,setForm]=React.useState({...record});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  return <div className="emp-full emp-training-record-page">
    <EmpPageTitle title={`${record.name} (${emp.name})`} onBack={onBack} action={<div className="emp-training-record-actions"><button className="emp-edit-all" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/>Alle bearbeiten</button><button className="emp-delete-record"><Icon name="trash" size={15}/>Löschen</button></div>}/>
    <section className="emp-training-record-card"><header className="emp-training-record-hero"><span className="emp-training-record-icon emp-site-record-icon"><Icon name="building" size={27}/></span><div><span>Baustelle / Projekt</span><h2>{form.name}</h2></div><span className="emp-status is-valid">Aktiv</span></header>
      <div className="emp-training-record-grid">
        <TrainingRecordField label="Baustelle / Projektname" icon="building" editing={editing} value={form.name}><input value={form.name} onChange={e=>set('name',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Firma" icon="building" editing={editing} value={form.company}><input value={form.company} onChange={e=>set('company',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Projekt-Nr." icon="doc" editing={editing} value={form.projectNr}><input value={form.projectNr} onChange={e=>set('projectNr',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Auftraggeber" icon="users" editing={editing} value={form.client}><input value={form.client} onChange={e=>set('client',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Bauleiter" icon="users" editing={editing} value={form.manager}><input value={form.manager} onChange={e=>set('manager',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Vorarbeiter" icon="users" editing={editing} value={form.foreman}><input value={form.foreman} onChange={e=>set('foreman',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Adresse" icon="pin" editing={editing} value={form.address}><input value={form.address} onChange={e=>set('address',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Anzahl Mitarbeiter" icon="users" editing={editing} value={form.employees}><input type="number" value={form.employees} onChange={e=>set('employees',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Name Ersthelfer" icon="shield" editing={editing} value={form.firstAiders} wide><textarea rows="3" value={form.firstAiders} onChange={e=>set('firstAiders',e.target.value)}/></TrainingRecordField>
        <TrainingRecordField label="Freigegeben durch Arbeitgeber" icon="users" editing={editing} value={form.released?'Freigegeben':'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e=>set('released',e.target.checked)}/>Freigegeben</label></TrainingRecordField>
        <TrainingRecordField label="Versionshistorie" icon="history" value={`${form.history} Versionen`}/>
        <TrainingRecordField label="Beschreibung" icon="doc" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e=>set('description',e.target.value)}/></TrainingRecordField>
        <div className="emp-training-record-field is-wide emp-training-record-docs"><Icon name="link" size={20}/><div><label>Dokumente</label><div className="emp-file-list">{docs.map(doc=><span className="emp-file-chip" key={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={()=>setDocs(list=>list.filter(item=>item!==doc))}><Icon name="x" size={13}/></button></span>)}</div><label className="emp-training-add-file"><Icon name="plus" size={15}/>Dokument hinzufügen<input type="file" multiple onChange={e=>setDocs(old=>[...old,...Array.from(e.target.files||[]).map(file=>file.name)])}/></label></div></div>
      </div>{editing&&<footer className="emp-training-record-footer"><button className="btn btn--ghost" onClick={()=>setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={()=>setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function EmpRecordField({ label, editing=false, value, wide=false, children }) {
  return <div className={'emp-record-field' + (wide ? ' is-wide' : '')}><label>{label}</label>{editing ? children : <div>{value}</div>}</div>;
}

Object.assign(window, { EmployeeAdminDetail });
