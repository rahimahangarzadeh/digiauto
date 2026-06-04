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
  const company = window.company(emp.company);

  if (masterRecord) return <EmployeeMasterRecord emp={emp} record={masterRecord} onBack={() => setMasterRecord(null)} />;
  if (record) return <EmployeeTrainingRecord emp={emp} record={record} onBack={() => setRecord(null)} />;
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
  const [form, setForm] = React.useState({...record});
  const set = (key,val) => setForm(old => ({...old,[key]:val}));
  const statusName = form.status === 'valid' ? 'Gültig' : form.status === 'warn' ? 'Läuft bald ab' : 'Abgelaufen';
  return <div className="emp-full">
    <EmpPageTitle title={`${record.name} (${emp.name})`} onBack={onBack} action={<button className="emp-edit-all" onClick={() => setEditing(true)}><Icon name="edit" size={15} />Alle bearbeiten</button>} />
    <section className="emp-record-card">
      <header><div><span>Zertifikat / Schulung</span><h2>{record.name}</h2></div><span className={'emp-status is-' + form.status}>{statusName}</span></header>
      <div className="emp-record-form">
        <EmpRecordField label="Zertifikat / Schulung" editing={editing} value={form.name}><input value={form.name} onChange={e => set('name',e.target.value)} /></EmpRecordField>
        <EmpRecordField label="Ausstellungsdatum" editing={editing} value={form.issued}><input value={form.issued} onChange={e => set('issued',e.target.value)} /></EmpRecordField>
        <EmpRecordField label="Ablaufdatum" editing={editing} value={form.expires}><input value={form.expires} onChange={e => set('expires',e.target.value)} /></EmpRecordField>
        <EmpRecordField label="Restlaufzeit" value={form.days < 0 ? `${Math.abs(form.days)} Tage überzogen` : `in ${form.days} Tagen`} />
        <EmpRecordField label="Status" editing={editing} value={statusName}><select value={form.status} onChange={e => set('status',e.target.value)}><option value="valid">Gültig</option><option value="warn">Läuft bald ab</option><option value="expired">Abgelaufen</option></select></EmpRecordField>
        <EmpRecordField label="Freigabe für Mitarbeiter" editing={editing} value={form.released ? 'Freigegeben' : 'Nicht freigegeben'}><label className="emp-check-label"><input type="checkbox" checked={form.released} onChange={e => set('released',e.target.checked)} />Freigegeben</label></EmpRecordField>
        <EmpRecordField label="Geändert" value={form.changed} />
        <EmpRecordField label="Beschreibung" editing={editing} value={form.description} wide><textarea rows="4" value={form.description} onChange={e => set('description',e.target.value)} /></EmpRecordField>
        <div className="emp-record-field is-wide"><label>Dokumente</label><div className="emp-file-list">{docs.map(doc => <span className="emp-file-chip" key={doc} title={doc}><Icon name="doc" size={14}/><span>{doc}</span><button onClick={() => setDocs(list => list.filter(item => item !== doc))}><Icon name="x" size={13}/></button></span>)}</div>
          <label className="emp-add-file"><Icon name="plus" size={15}/>Anlagen hinzufügen<input type="file" multiple onChange={e => setDocs(old => [...old,...Array.from(e.target.files || []).map(file => file.name)])}/></label>
        </div>
      </div>
      {editing && <footer><button className="btn btn--ghost" onClick={() => setEditing(false)}>Abbrechen</button><button className="btn btn--primary" onClick={() => setEditing(false)}>Speichern</button></footer>}
    </section>
  </div>;
}

function EmpRecordField({ label, editing=false, value, wide=false, children }) {
  return <div className={'emp-record-field' + (wide ? ' is-wide' : '')}><label>{label}</label>{editing ? children : <div>{value}</div>}</div>;
}

Object.assign(window, { EmployeeAdminDetail });
