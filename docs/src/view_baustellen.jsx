function BaustellenView({ activeCompany = 'all', extraAction = null, onOpenSite = null }) {
  const allActiveEmployees = window.SEED.employees
    .filter(e => e.status === 'aktiv');
  const activeEmployees = allActiveEmployees
    .filter(e => activeCompany === 'all' || e.company === activeCompany);

  const companyEmployeeIds = (companyId, count, start = 0) => allActiveEmployees
    .filter(e => e.company === companyId)
    .map(e => e.id)
    .slice(start, start + count);
  const tiefbauIds = Array.from(new Set(['e-me', ...companyEmployeeIds('tiefbau', 10)])).slice(0, 10);
  const tiefbauShortIds = Array.from(new Set(['e-me', ...companyEmployeeIds('tiefbau', 3)])).slice(0, 3);
  const rohrbauIds = companyEmployeeIds('rohrbau', 9);
  const initialSites = [
    {
      id: 'bs-1',
      name: 'Baustelle Alex Barum',
      company: 'Janning Tiefbau GmbH',
      projectName: 'Kanalsanierung Nordhorn',
      projectNr: 'BAU-2026-014',
      bauleiter: 'Alexander Petersen',
      vorarbeiter: 'Markus Brinker',
      auftraggeber: 'Stadt Nordhorn',
      adresse: 'Lingener Strasse 42, 48529 Nordhorn',
      subcontractor: 'Nordhorn Verkehrssicherung GmbH',
      employeeIds: tiefbauIds,
      releasedEmployeeIds: ['e-me'],
      demoFulfilled: 6,
      demoMissing: 0,
      demoReady: true,
    },
    {
      id: 'bs-2',
      name: 'Baustelle Nordring',
      company: 'Janning Tiefbau GmbH',
      projectName: 'Hausanschluss Nordring',
      projectNr: 'BAU-2026-019',
      bauleiter: 'Alexander Petersen',
      vorarbeiter: 'Dirk Juergens',
      auftraggeber: 'Stadt Nordhorn',
      adresse: 'Nordring 12, 48529 Nordhorn',
      subcontractor: 'Emsland Kabelbau GmbH',
      employeeIds: tiefbauShortIds,
      releasedEmployeeIds: [],
      demoFulfilled: 4,
      demoMissing: 2,
      demoReady: false,
    },
    {
      id: 'bs-3',
      name: 'Rohrgraben Suedring',
      company: 'Janning Rohrbau GmbH',
      projectName: 'Hausanschluesse Suedring',
      projectNr: 'BAU-2026-021',
      bauleiter: 'Stefan Mueller',
      vorarbeiter: 'Thomas Wegener',
      auftraggeber: 'Wasserverband Nordhorn',
      adresse: 'Suedring 18, 48527 Nordhorn',
      subcontractor: 'Rohrservice Nord GmbH',
      employeeIds: rohrbauIds,
      releasedEmployeeIds: [],
      demoFulfilled: 6,
      demoMissing: 0,
      demoReady: true,
    },
  ];

  const [sites, setSites] = React.useState(initialSites);
  const [selectedSiteId, setSelectedSiteId] = React.useState(initialSites[0]?.id);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [sitePanelTab, setSitePanelTab] = React.useState('stammdaten');
  const [siteColumnMenu, setSiteColumnMenu] = React.useState(null);
  const [siteColumnFilters, setSiteColumnFilters] = React.useState({});
  const [siteFilterPanel, setSiteFilterPanel] = React.useState(null);
  const [siteFilterSearch, setSiteFilterSearch] = React.useState('');
  const [siteGroupBy, setSiteGroupBy] = React.useState('');
  const [siteSort, setSiteSort] = React.useState({ col:'nr', dir:'asc' });
  const [employeeCompanyFilter, setEmployeeCompanyFilter] = React.useState('all');
  const [editingDetails, setEditingDetails] = React.useState(true);
  const [editingStammdaten, setEditingStammdaten] = React.useState(false);
  const [editingRiskAssessment, setEditingRiskAssessment] = React.useState(false);
  const [teamEditOpen, setTeamEditOpen] = React.useState(false);
  const [siteDocuments, setSiteDocuments] = React.useState({
    'bs-1': [
      { id: 'doc-1', name: 'Baustellenaushang.pdf', size: '2.4 MB', date: '2026-05-20' },
      { id: 'doc-2', name: 'Unterweisung-Baustelle.pdf', size: '1.8 MB', date: '2026-05-18' },
      { id: 'doc-3', name: 'Verkehrssicherung-Plan.pdf', size: '3.1 MB', date: '2026-05-15' },
    ],
    'bs-2': [
      { id: 'doc-4', name: 'Rohrbau-Sicherheit.pdf', size: '2.1 MB', date: '2026-05-19' },
    ],
    'bs-3': [],
  });
  const [editingDocId, setEditingDocId] = React.useState(null);
  const [editingDocName, setEditingDocName] = React.useState('');
  const [employeeDetailId, setEmployeeDetailId] = React.useState(null);
  const [employeeDetailTab, setEmployeeDetailTab] = React.useState('schulungen');
  const [alarmModalOpen, setAlarmModalOpen] = React.useState(false);
  const [alarmPreviewOpen, setAlarmPreviewOpen] = React.useState(false);
  const [alarmPlans, setAlarmPlans] = React.useState({});
  const selectedSite = sites.find(site => site.id === selectedSiteId) || sites[0];
  const selectedEmployees = allActiveEmployees.filter(e => selectedSite?.employeeIds.includes(e.id));
  const filteredEmployees = activeEmployees.filter(e => employeeCompanyFilter === 'all' || e.company === employeeCompanyFilter);
  const detailEmployee = employeeDetailId ? allActiveEmployees.find(e => e.id === employeeDetailId) : null;
  React.useEffect(() => {
    try {
      localStorage.setItem('baustellen_employee_releases_v1', JSON.stringify(sites));
    } catch {}
  }, [sites]);

  const isSiteReleasedForEmployee = (site, employeeId) => (site.releasedEmployeeIds || []).includes(employeeId);
  const toggleSiteRelease = (employeeId) => {
    setSites(items => items.map(site => {
      if (site.id !== selectedSite.id) return site;
      const released = site.releasedEmployeeIds || [];
      const exists = released.includes(employeeId);
      return { ...site, releasedEmployeeIds: exists ? released.filter(id => id !== employeeId) : [...released, employeeId] };
    }));
  };

  const hasTraining = (employee, trainingId) => {
    const status = window.SEED.certs[employee.id]?.[trainingId]?.status;
    return status === 'valid' || status === 'warn';
  };
  const geraetefuehrerRows = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('geraetefuehrer_rows_v1') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  })();
  const fallbackGeraetefuehrerIds = activeEmployees.slice(0, 5).map(employee => employee.id);
  const hasGeraetefuehrer = (employee) => {
    const savedMatch = geraetefuehrerRows.some(row => row.employeeId === employee.id && row.released);
    return savedMatch || fallbackGeraetefuehrerIds.includes(employee.id);
  };
  const geraetefuehrerTypes = (employee) => {
    const savedTypes = geraetefuehrerRows
      .filter(row => row.employeeId === employee.id && row.released)
      .map(row => row.type === 'Sonstig' && row.otherType ? row.otherType : row.type)
      .filter(Boolean);
    if (savedTypes.length) return Array.from(new Set(savedTypes));
    if (!fallbackGeraetefuehrerIds.includes(employee.id)) return [];
    const fallbackTypes = ['Bagger', 'Radlader', 'Stapler', 'LKW-Ladekran', 'Minibagger'];
    const index = Math.max(0, fallbackGeraetefuehrerIds.indexOf(employee.id));
    return [fallbackTypes[index % fallbackTypes.length]];
  };

  const updateSite = (key, value) => {
    setSites(items => items.map(site => site.id === selectedSite.id ? { ...site, [key]: value } : site));
  };

  const addDocument = (siteId) => {
    const newDoc = {
      id: 'doc-' + Date.now(),
      name: 'Neues Dokument.pdf',
      size: '0 KB',
      date: window.SEED.today,
    };
    setSiteDocuments(prev => ({
      ...prev,
      [siteId]: [...(prev[siteId] || []), newDoc]
    }));
  };

  const deleteDocument = (siteId, docId) => {
    setSiteDocuments(prev => ({
      ...prev,
      [siteId]: (prev[siteId] || []).filter(doc => doc.id !== docId)
    }));
  };

  const updateDocument = (siteId, docId, newName) => {
    setSiteDocuments(prev => ({
      ...prev,
      [siteId]: (prev[siteId] || []).map(doc =>
        doc.id === docId ? { ...doc, name: newName } : doc
      )
    }));
  };

  const currentSiteDocuments = siteDocuments[selectedSite?.id] || [];
  const riskAssessmentBaseRows = [
    { nr: 1, name: 'Baustellenanmeldung BG BAU', document: 'BG-BAU-Anmeldung.pdf' },
    { nr: 2, name: 'Betriebs-Gefährdungsbeurteilung', document: 'Betriebs-Gefährdungsbeurteilung.pdf' },
    { nr: 3, name: 'Ergänzende Gefährdungsbeurteilung Baustelle', document: 'Ergänzende-GBU-Baustelle.pdf' },
    { nr: 4, name: 'Projektbezogene Unterweisung', document: 'Projektbezogene-Unterweisung.pdf' },
    { nr: 5, name: 'Erstunterweisung Baustellen', document: 'Erstunterweisung-Baustelle.pdf' },
  ];
  const riskAssessmentBySite = {
    'bs-1': [
      { notRequired: false, done: true, date: '2026-05-18', description: 'Baustellenanmeldung fuer Kanalsanierung Nordhorn vorbereitet.' },
      { notRequired: false, done: true, date: '2026-05-19', description: 'Betriebliche Grundgefährdungen fuer Tiefbauarbeiten geprueft.' },
      { notRequired: false, done: false, date: '2026-05-22', description: 'Ergänzung fuer Verkehrsbereich Lingener Strasse offen.' },
      { notRequired: false, done: true, date: '2026-05-20', description: 'Projektbezogene Unterweisung mit Team Alex Barum dokumentiert.' },
      { notRequired: false, done: true, date: '2026-05-20', description: 'Erstunterweisung fuer neue Baustellenbesetzung abgeschlossen.' },
    ],
    'bs-2': [
      { notRequired: false, done: true, date: '2026-05-21', description: 'Baustellenanmeldung Hausanschluesse Suedring angelegt.' },
      { notRequired: false, done: true, date: '2026-05-22', description: 'Rohrgraben, Verbau und Leitungsnaehe bewertet.' },
      { notRequired: false, done: true, date: '2026-05-23', description: 'Ergänzung fuer Hausanschluss-Arbeiten im Gehwegbereich.' },
      { notRequired: false, done: false, date: '2026-05-24', description: 'Unterweisung fuer Nachunternehmer noch zur Unterschrift.' },
      { notRequired: true, done: false, date: '', description: 'Keine Erstunterweisung erforderlich, bestehendes Team.' },
    ],
    'bs-3': [
      { notRequired: false, done: true, date: '2026-05-25', description: 'Baustellenanmeldung Horizontalbohrung Gewerbepark erstellt.' },
      { notRequired: false, done: false, date: '2026-05-26', description: 'Betriebs-Gefährdungsbeurteilung fuer Bohrtechnik in Pruefung.' },
      { notRequired: false, done: false, date: '2026-05-27', description: 'Ergänzung fuer Start-/Zielgrube und Spuelbohrung offen.' },
      { notRequired: false, done: true, date: '2026-05-26', description: 'Projektbezogene Unterweisung fuer Bohrtrupp begonnen.' },
      { notRequired: false, done: true, date: '2026-05-26', description: 'Erstunterweisung fuer Gewerbepark-Team dokumentiert.' },
    ],
  };
  const riskAssessmentRows = riskAssessmentBaseRows.map((row, index) => ({
    ...row,
    ...(riskAssessmentBySite[selectedSite?.id]?.[index] || {}),
  }));

  const toggleEmployee = (id) => {
    setSites(items => items.map(site => {
      if (site.id !== selectedSite.id) return site;
      const exists = site.employeeIds.includes(id);
      return { ...site, employeeIds: exists ? site.employeeIds.filter(item => item !== id) : [...site.employeeIds, id], releasedEmployeeIds: exists ? (site.releasedEmployeeIds || []).filter(item => item !== id) : (site.releasedEmployeeIds || []) };
    }));
  };

  const addSite = () => {
    const next = {
      id: 'bs-' + Date.now(),
      name: 'Neue Baustelle',
      company: window.company(activeCompany)?.name || 'Janning Tiefbau GmbH',
      projectName: 'Neues Projekt',
      projectNr: 'BAU-2026-000',
      bauleiter: 'Bauleiter',
      vorarbeiter: 'Vorarbeiter',
      auftraggeber: 'Auftraggeber',
      adresse: 'Adresse',
      subcontractor: '-',
      employeeIds: activeEmployees.slice(0, 6).map(e => e.id),
      releasedEmployeeIds: [],
    };
    setSites(items => [next, ...items]);
    setSelectedSiteId(next.id);
    setSitePanelTab('stammdaten');
    if (onOpenSite) {
      onOpenSite(next);
      return;
    }
    setDetailOpen(true);
  };

  const countWith = (trainingIds) => selectedEmployees.filter(emp => trainingIds.some(id => hasTraining(emp, id))).length;
  const countGeraetefuehrer = () => selectedEmployees.filter(emp => hasGeraetefuehrer(emp)).length;
  const total = selectedEmployees.length;
  const checks = [
    { id: 't-scc016', label: 'SCC 016', rule: '90% der Baustellenbesetzung', required: Math.ceil(total * 0.9), actual: countWith(['t-scc016']) },
    { id: 't-scc017', label: 'SCC 017 / 018', rule: 'mind. 1 Fuehrungskraft', required: total > 0 ? 1 : 0, actual: countWith(['t-scc017']) },
    { id: 't-erstehilfe', label: 'Erste Hilfe', rule: '10% der Baustellenbesetzung', required: Math.ceil(total * 0.1), actual: countWith(['t-erstehilfe']) },
    { id: 't-mvas99', label: 'MVAS 99', rule: 'mind. 1 Person', required: total > 0 ? 1 : 0, actual: countWith(['t-mvas99']) },
    { id: 't-gw129', label: 'GW 129', rule: 'mind. 1 Person', required: total > 0 ? 1 : 0, actual: countWith(['t-gw129']) },
    { id: 'geraetefuehrer', label: 'Ger\u00e4tef\u00fchrer', rule: 'mind. 1 freigegebene Person', required: total > 0 ? 1 : 0, actual: countGeraetefuehrer(), type: 'device' },
  ];
  const missingChecks = checks.filter(check => check.actual < check.required);
  const ready = total > 0 && missingChecks.length === 0;

  const siteStatus = (site) => {
    if (typeof site.demoMissing === 'number') {
      return { missing: site.demoMissing, ready: !!site.demoReady };
    }
    const employees = activeEmployees.filter(e => site.employeeIds.includes(e.id));
    const withTraining = (ids) => employees.filter(emp => ids.some(id => hasTraining(emp, id))).length;
    const siteChecks = [
      { required: Math.ceil(employees.length * 0.9), actual: withTraining(['t-scc016']) },
      { required: employees.length > 0 ? 1 : 0, actual: withTraining(['t-scc017']) },
      { required: Math.ceil(employees.length * 0.1), actual: withTraining(['t-erstehilfe']) },
      { required: employees.length > 0 ? 1 : 0, actual: withTraining(['t-mvas99']) },
      { required: employees.length > 0 ? 1 : 0, actual: withTraining(['t-gw129']) },
      { required: employees.length > 0 ? 1 : 0, actual: employees.filter(emp => hasGeraetefuehrer(emp)).length },
    ];
    const missing = siteChecks.filter(check => check.actual < check.required).length;
    return { missing, ready: employees.length > 0 && missing === 0 };
  };

  const planTraining = (trainingId) => {
    window.dispatchEvent(new CustomEvent('navigate-to-training', { detail: { trainingId } }));
  };

  const Field = ({ label, field, wide }) => (
    <label style={{ display:'grid', gap:6, gridColumn: wide ? '1 / -1' : 'auto' }}>
      <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>{label}</span>
      <input
        value={selectedSite[field]}
        onChange={event => updateSite(field, event.target.value)}
        style={{ minHeight:40, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 12px', background:'var(--color-white)', font:'inherit', color:'var(--fg-1)' }}
      />
    </label>
  );

  const statusCfg = {
    valid:   { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'G\u00fcltig' },
    warn:    { color:'#8a6a1f', bg:'#faf3de', border:'#ece0bc', label:'L\u00e4uft ab' },
    expired: { color:'#a13232', bg:'#fbecea', border:'#eac8c2', label:'Abgelaufen' },
    missing: { color:'#777',    bg:'#f4f4f2', border:'#ddd',    label:'Fehlt' },
    signed:  { color:'#3f7a4a', bg:'#eff5ed', border:'#cde1cf', label:'Unterschrieben' },
  };

  const MiniBadge = ({ status }) => {
    const cfg = statusCfg[status] || statusCfg.missing;
    return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, fontSize:12, fontWeight:700, color:cfg.color, background:cfg.bg, border:'1px solid '+cfg.border }}><span style={{ width:6, height:6, borderRadius:'50%', background:cfg.color }} />{cfg.label}</span>;
  };

  const DetailDocActions = () => (
    <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
      <button className="btn btn--ghost" style={{ minHeight:32, padding:'0 10px' }}><Icon name="doc" size={13} />Anzeigen</button>
      <button className="btn btn--ghost" style={{ minHeight:32, padding:'0 10px' }}><Icon name="download" size={13} />Download</button>
    </div>
  );
  const alarmLogo = 'assets/logos/janning-group-alarmplan.png';
  const alarmPhoneIcon = 'assets/icons/alarm-phone.svg';
  const alarmCrossIcon = 'assets/icons/alarm-cross.svg';
  const defaultAlarmPlan = (site) => ({
    nr: 'FB 7.2',
    firma: 'Janning Group',
    fragebogenDurch: 'Christian Janning',
    stand: '01/26',
    baustelle: site?.projectName || site?.name || '',
    auftraggeber: site?.auftraggeber || '',
    auftraggeberTel: '',
    auftragnehmer: 'Janning Group\nJ.-D.-Lauenstein-Str. 24 | 49767 Twist',
    auftragnehmerTel: '05936 89639-0',
    bauleiter: site?.bauleiter || '',
    bauleiterTel: '',
    ersthelfer: selectedEmployees[0]?.name || '',
    ersthelferTel: selectedEmployees[0]?.phone || '',
    sicherheit: 'Rahim Ahangarzadeh',
    sicherheitTel: '',
    arzt: '',
    arztTel: '',
    krankenhaus: '',
    krankenhausTel: '',
  });
  const currentAlarmPlan = alarmPlans[selectedSite?.id] || defaultAlarmPlan(selectedSite);
  const hasAlarmPlan = Boolean(alarmPlans[selectedSite?.id]);
  const updateAlarmPlan = (key, value) => {
    setAlarmPlans(items => ({ ...items, [selectedSite.id]: { ...currentAlarmPlan, [key]: value } }));
  };
  const createAlarmPlan = () => {
    setAlarmPlans(items => items[selectedSite.id] ? items : ({ ...items, [selectedSite.id]: defaultAlarmPlan(selectedSite) }));
    setAlarmModalOpen(true);
  };

  const alarmPlanHtml = (plan) => `<!doctype html><html><head><meta charset="utf-8"><title>Alarmplan ${plan.baustelle || ''}</title><style>
    @page { size: A4 portrait; margin: 6mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #202020; background: #fff; }
    .sheet { width: 198mm; height: 285mm; margin: 0 auto; border: 3px solid #2f7d32; overflow:hidden; }
    .grid { display: grid; border-bottom: 2px solid #2f7d32; }
    .top { grid-template-columns: 30% 40% 30%; height: 32mm; }
    .cell { border-right: 2px solid #2f7d32; padding: 3.5mm 4mm; }
    .cell:last-child { border-right: 0; }
    .title { display: grid; place-items: center; font-size: 21pt; font-weight: 700; letter-spacing: 9px; color: #d21e2b; }
    .logo { display: grid; place-items: center; text-align: center; }
    .logo img { max-width: 34mm; max-height: 25mm; object-fit: contain; }
    .formrow { display: grid; grid-template-columns: 30% 40% 4% 26%; border-bottom: 2px solid #2f7d32; height: 11mm; }
    .formrow.wide { grid-template-columns: 30% 70%; }
    .label { padding: 2.4mm 3mm; font-weight: 700; border-right: 2px solid #2f7d32; }
    .value { padding: 1.6mm 2mm; border-right: 2px solid #2f7d32; white-space: pre-line; font-size: 11pt; }
    .value:last-child { border-right: 0; }
    .box { min-height: 6mm; border: 1.4px solid #111; padding: 1mm 2mm; }
    .icon { display: grid; place-items: center; font-size: 12pt; font-weight: 700; border-right: 2px solid #2f7d32; }
    .centerband { text-align: center; color: #2f7d32; font-size: 15pt; font-weight: 700; line-height: 1.35; padding: 1.5mm 0; border-bottom: 2px solid #2f7d32; }
    .notruf { text-align: center; color: #d21e2b; font-size: 15pt; font-weight: 800; letter-spacing: 1px; padding: 1.6mm 0; border-bottom: 3px solid #2f7d32; }
    .action { display: grid; grid-template-columns: 30% 40% 30%; height: 23mm; border-bottom: 2px solid #2f7d32; }
    .action > div { border-right: 2px solid #2f7d32; padding: 3mm 4mm; }
    .action > div:first-child { display: flex; align-items: center; }
    .action > div:last-child { border-right: 0; display:block; line-height:1.25; font-size:11.5pt; overflow-wrap:break-word; }
    .symbol { display:grid; place-items:center; }
    .symbol img { width:18mm; height:18mm; object-fit:contain; }
    .footer { padding: 3mm 4mm; font-size: 9.5pt; line-height: 1.35; }
    .small { font-size: 10.5pt; line-height: 1.35; }
    @media screen { body { background:#eee; padding: 12px; } .sheet { background:white; box-shadow:0 8px 30px rgba(0,0,0,.15); } }
  </style></head><body><div class="sheet">
    <div class="grid top"><div class="cell small"><b>Nr:</b> ${plan.nr}<br><b>Firma:</b> ${plan.firma}<br><br>Fragebogen durch: ${plan.fragebogenDurch}<br>Stand: ${plan.stand}</div><div class="cell title">ALARMPLAN</div><div class="cell logo"><img src="${alarmLogo}"></div></div>
    <div class="formrow wide"><div class="label">Baustelle:</div><div class="value"><div class="box">${plan.baustelle}</div></div></div>
    <div class="formrow"><div class="label">Auftraggeber:</div><div class="value"><div class="box">${plan.auftraggeber}</div></div><div class="icon">Tel.</div><div class="value"><div class="box">${plan.auftraggeberTel}</div></div></div>
    <div class="formrow"><div class="label">Auftragnehmer:</div><div class="value"><b>${plan.auftragnehmer}</b></div><div class="icon">Tel.</div><div class="value">${plan.auftragnehmerTel}</div></div>
    <div class="formrow"><div class="label">Bauleiter Fa. Janning:</div><div class="value"><div class="box">${plan.bauleiter}</div></div><div class="icon">Tel.</div><div class="value"><div class="box">${plan.bauleiterTel}</div></div></div>
    <div class="formrow"><div class="label">Ersthelfer:</div><div class="value"><div class="box">${plan.ersthelfer}</div></div><div class="icon">Tel.</div><div class="value"><div class="box">${plan.ersthelferTel}</div></div></div>
    <div class="formrow"><div class="label">Fachkraft fuer Arbeitssicherheit:</div><div class="value"><div class="box">${plan.sicherheit}</div></div><div class="icon">Tel.</div><div class="value"><div class="box">${plan.sicherheitTel}</div></div></div>
    <div class="formrow"><div class="label">Naechster Durchgangsarzt:</div><div class="value"><div class="box">${plan.arzt}</div></div><div class="icon">Tel.</div><div class="value"><div class="box">${plan.arztTel}</div></div></div>
    <div class="formrow"><div class="label">Naechstes Krankenhaus:</div><div class="value"><div class="box">${plan.krankenhaus}</div></div><div class="icon">Tel.</div><div class="value"><div class="box">${plan.krankenhausTel}</div></div></div>
    <div class="centerband">Verhalten bei Unfaellen<br>Ruhe bewahren</div><div class="notruf">NOTRUF: 112</div>
    <div class="action"><div>1. Unfall melden</div><div class="symbol"><img src="${alarmPhoneIcon}"></div><div><b>WO</b> geschah es?<br><b>WAS</b> geschah?<br><b>WIE</b> viele Verletzte?<br><b>WELCHE</b> Arten von Verletzungen?<br><b>WARTEN</b> auf Rueckfragen!</div></div>
    <div class="action"><div>2. Erste Hilfe</div><div class="symbol"><img src="${alarmCrossIcon}"></div><div>Absichern des Unfallortes.<br>Versorgung der Verletzten.<br>Anweisung beachten.</div></div>
    <div class="action"><div>3. Weitere Massnahmen</div><div></div><div>Krankenwagen oder Feuerwehr einweisen.<br>Schaulustige abweisen.</div></div>
    <div class="footer">Jeder Arbeitsunfall ist zu melden! Alle Arbeitsunfaelle sind in das Verbandbuch einzutragen. Bei schweren oder toedlichen Arbeitsunfaellen, sofortige Meldung an:<br><br>&nbsp;&nbsp;&nbsp;- unmittelbaren Vorgesetzten, Bau-/Projektleitung, Geschaeftsfuehrung<br>&nbsp;&nbsp;&nbsp;- Fachkraft fuer Arbeitssicherheit<br>&nbsp;&nbsp;&nbsp;- Berufsgenossenschaft, Gewerbeaufsicht, Polizei</div>
  </div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;

  const openAlarmPdf = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(alarmPlanHtml(currentAlarmPlan));
    win.document.close();
  };

  const AlarmPlanDocument = ({ plan }) => (
    <div style={{ width:'210mm', height:'297mm', background:'white', color:'#202020', padding:'6mm', fontFamily:'Arial, sans-serif', transformOrigin:'top left' }}>
      <div style={{ border:'3px solid #2f7d32' }}>
        <div style={{ display:'grid', gridTemplateColumns:'30% 40% 30%', borderBottom:'2px solid #2f7d32', height:'32mm' }}>
          <div style={{ padding:'3.5mm 4mm', borderRight:'2px solid #2f7d32', fontSize:13 }}><b>Nr:</b> {plan.nr}<br/><b>Firma:</b> {plan.firma}<br/><br/>Fragebogen durch: {plan.fragebogenDurch}<br/>Stand: {plan.stand}</div>
          <div style={{ display:'grid', placeItems:'center', borderRight:'2px solid #2f7d32', color:'#d21e2b', fontWeight:800, letterSpacing:9, fontSize:32 }}>ALARMPLAN</div>
          <div style={{ display:'grid', placeItems:'center', textAlign:'center' }}><img src={alarmLogo} alt="Janning Group" style={{ maxWidth:'34mm', maxHeight:'25mm', objectFit:'contain' }} /></div>
        </div>
        {[
          ['Baustelle:', plan.baustelle, ''], ['Auftraggeber:', plan.auftraggeber, plan.auftraggeberTel], ['Auftragnehmer:', plan.auftragnehmer, plan.auftragnehmerTel], ['Bauleiter Fa. Janning:', plan.bauleiter, plan.bauleiterTel], ['Ersthelfer:', plan.ersthelfer, plan.ersthelferTel], ['Fachkraft fuer Arbeitssicherheit:', plan.sicherheit, plan.sicherheitTel], ['Naechster Durchgangsarzt:', plan.arzt, plan.arztTel], ['Naechstes Krankenhaus:', plan.krankenhaus, plan.krankenhausTel]
        ].map((row, idx) => <div key={row[0]} style={{ display:'grid', gridTemplateColumns: idx === 0 ? '30% 70%' : '30% 40% 4% 26%', borderBottom:'2px solid #2f7d32', height:'11mm' }}><div style={{ padding:'3mm', fontWeight:800, borderRight:'2px solid #2f7d32' }}>{row[0]}</div><div style={{ padding:'2.2mm', borderRight:idx === 0 ? 0 : '2px solid #2f7d32', whiteSpace:'pre-line' }}><div style={{ minHeight:'6mm', border: idx === 2 ? 0 : '1.4px solid #111', padding:'1.5mm 2mm' }}>{row[1]}</div></div>{idx !== 0 && <><div style={{ display:'grid', placeItems:'center', borderRight:'2px solid #2f7d32', fontWeight:800 }}>Tel.</div><div style={{ padding:'2.2mm' }}><div style={{ minHeight:'6mm', border: idx === 2 ? 0 : '1.4px solid #111', padding:'1.5mm 2mm' }}>{row[2]}</div></div></>}</div>)}
        <div style={{ textAlign:'center', color:'#2f7d32', fontSize:22, fontWeight:800, lineHeight:1.5, padding:'2mm 0', borderBottom:'2px solid #2f7d32' }}>Verhalten bei Unfaellen<br/>Ruhe bewahren</div>
        <div style={{ textAlign:'center', color:'#d21e2b', fontSize:22, fontWeight:900, padding:'1.5mm 0', borderBottom:'3px solid #2f7d32' }}>NOTRUF: 112</div>
        {[
          ['1. Unfall melden', 'phone', <><b>WO</b> geschah es?<br/><b>WAS</b> geschah?<br/><b>WIE</b> viele Verletzte?<br/><b>WELCHE</b> Arten von Verletzungen?<br/><b>WARTEN</b> auf Rueckfragen!</>],
          ['2. Erste Hilfe', 'cross', <>Absichern des Unfallortes.<br/>Versorgung der Verletzten.<br/>Anweisung beachten.</>],
          ['3. Weitere Massnahmen', '', <>Krankenwagen oder Feuerwehr einweisen.<br/>Schaulustige abweisen.</>]
        ].map(row => <div key={row[0]} style={{ display:'grid', gridTemplateColumns:'30% 40% 30%', height:'23mm', borderBottom:'2px solid #2f7d32' }}><div style={{ padding:'5mm 4mm', borderRight:'2px solid #2f7d32', display:'flex', alignItems:'center' }}>{row[0]}</div><div style={{ borderRight:'2px solid #2f7d32', display:'grid', placeItems:'center' }}>{row[1] && <img src={row[1] === 'phone' ? alarmPhoneIcon : alarmCrossIcon} alt="" style={{ width:'18mm', height:'18mm', objectFit:'contain' }} />}</div><div style={{ padding:'3mm 4mm', display:'block', lineHeight:1.25, fontSize:15, overflowWrap:'break-word' }}>{row[2]}</div></div>)}
        <div style={{ padding:'3mm 4mm', fontSize:13, lineHeight:1.32 }}>Jeder Arbeitsunfall ist zu melden! Alle Arbeitsunfaelle sind in das Verbandbuch einzutragen. Bei schweren oder toedlichen Arbeitsunfaellen, sofortige Meldung an:<br/><br/>&nbsp;&nbsp;&nbsp;- unmittelbaren Vorgesetzten, Bau-/Projektleitung, Geschaeftsfuehrung<br/>&nbsp;&nbsp;&nbsp;- Fachkraft fuer Arbeitssicherheit<br/>&nbsp;&nbsp;&nbsp;- Berufsgenossenschaft, Gewerbeaufsicht, Polizei</div>
      </div>
    </div>
  );

  const EmployeeDetailPopup = ({ employee }) => {
    if (!employee) return null;
    const company = window.company(employee.company);
    const certs = window.SEED.certs[employee.id] || {};
    const myInstructions = window.SEED.instructions.filter(item => item.participants.some(p => p.emp === employee.id));
    const health = [
      { name:'G26 Atemschutz', last:'14.03.2025', next:'14.03.2026', status:'valid' },
      { name:'G37 L\u00e4rmexposition', last:'08.01.2025', next:'08.01.2028', status:'valid' },
      { name:'G37 Bildschirmarbeit', last:'12.06.2024', next:'12.06.2027', status:'valid' },
    ];
    const license = [
      { class:'B', desc:'PKW bis 3,5 t', last:'10.03.2025', next:'10.03.2027', status:'valid' },
      { class:'BE', desc:'PKW mit Anh\u00e4nger', last:'10.03.2025', next:'10.03.2027', status:'valid' },
      { class:'C', desc:'LKW \u00fcber 3,5 t', last:'15.01.2024', next:'15.01.2026', status:'expired' },
    ];
    const jobs = [{ name:'Polier Tiefbau', version:'v1.2', status:'signed', date:'15.03.2026' }];
    const devices = geraetefuehrerRows.filter(row => row.employeeId === employee.id && row.released);
    const deviceRows = devices.length ? devices : (hasGeraetefuehrer(employee) ? [
      { id:'fallback-device-1', type:'Bagger', kind:'Ausbildung', date:'2026-01-12', description:'Freigegebene Ger\u00e4tef\u00fchrer-Ausbildung.' },
      { id:'fallback-device-2', type:'Radlader', kind:'Einweisung', date:'2026-02-18', description:'Einweisung f\u00fcr Baustelleneinsatz.' },
    ] : []);
    const tabs = [
      { id:'schulungen', label:'Schulungen', count:window.SEED.trainings.length },
      { id:'unterweisungen', label:'Unterweisungen', count:myInstructions.length },
      { id:'untersuchung', label:'Untersuchungsvorsorge', count:health.length },
      { id:'stellen', label:'Stellenbeschreibung', count:jobs.length },
      { id:'fuehrerschein', label:'F\u00fchrerschein', count:license.length },
      { id:'geraetefuehrer', label:'Ger\u00e4tef\u00fchrer', count:deviceRows.length },
    ];
    const Table = ({ heads, children }) => (
      <div style={{ border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden', background:'white' }}>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${heads.length}, minmax(0, 1fr))`, gap:12, padding:'10px 14px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)' }}>
          {heads.map(head => <div key={head} style={{ fontSize:11, fontWeight:800, color:'var(--fg-3)', textTransform:'uppercase' }}>{head}</div>)}
        </div>
        {children}
      </div>
    );
    const Row = ({ cols }) => (
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols.length}, minmax(0, 1fr))`, gap:12, alignItems:'center', padding:'12px 14px', borderBottom:'1px solid var(--border-1)' }}>
        {cols.map((col, idx) => <div key={idx} style={{ minWidth:0 }}>{col}</div>)}
      </div>
    );

    return (
      <div onClick={() => setEmployeeDetailId(null)} style={{ position:'fixed', inset:0, zIndex:2600, background:'rgba(0,0,0,.42)', display:'flex', alignItems:'stretch', justifyContent:'center', padding:0 }}>
        <div onClick={event => event.stopPropagation()} style={{ width:'min(1180px, 96vw)', maxHeight:'92vh', margin:'4vh auto', overflow:'hidden', borderRadius:14, background:'var(--color-ivory)', boxShadow:'0 26px 80px rgba(0,0,0,.34)', display:'flex', flexDirection:'column' }}>
          <div style={{ background:'var(--color-near-black)', color:'white', padding:'24px 26px', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:18, alignItems:'center' }}>
            <div className={'avatar avatar--' + employee.color} style={{ width:54, height:54, fontSize:18 }}>{employee.initials}</div>
            <div>
              <h2 style={{ margin:0, fontFamily:'var(--font-serif)', fontSize:27, fontWeight:500 }}>{employee.name}</h2>
              <div style={{ marginTop:6, color:'rgba(255,255,255,.68)', display:'flex', gap:12, flexWrap:'wrap' }}>
                <span>PN {employee.personalNr}</span><span>·</span><span>{employee.position}</span><span>·</span><span>{company?.name}</span><span>·</span><span>{employee.department}</span>
              </div>
            </div>
            <div style={{ textAlign:'right', color:'rgba(255,255,255,.68)', fontSize:13 }}>
              <button onClick={() => setEmployeeDetailId(null)} style={{ border:0, background:'transparent', color:'rgba(255,255,255,.75)', fontSize:24, cursor:'pointer', marginBottom:10 }}>×</button>
              <div>{employee.email}</div><div>{employee.phone}</div>
            </div>
          </div>
          <div style={{ display:'flex', overflowX:'auto', borderBottom:'1px solid var(--border-1)', background:'var(--color-parchment)' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setEmployeeDetailTab(tab.id)} style={{ border:0, background:employeeDetailTab === tab.id ? 'var(--color-ivory)' : 'transparent', padding:'13px 18px', font:'inherit', fontWeight:800, color:employeeDetailTab === tab.id ? 'var(--fg-1)' : 'var(--fg-3)', display:'flex', gap:8, whiteSpace:'nowrap', cursor:'pointer' }}>
                {tab.label}<span style={{ borderRadius:99, padding:'1px 7px', background:'var(--color-warm-sand)', fontSize:11 }}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div style={{ padding:22, overflow:'auto' }}>
            {employeeDetailTab === 'schulungen' && <Table heads={['Schulung / Zertifikat','Status','Ablaufdatum','Dokumente']}>{window.SEED.trainings.map(training => {
              const cert = certs[training.id];
              return <Row key={training.id} cols={[<><strong>{training.name}</strong><div className="small muted">{training.cat}</div></>, <MiniBadge status={cert?.status || 'missing'} />, cert?.expiresAt ? window.fmtDE(cert.expiresAt) : '—', cert ? <DetailDocActions /> : <span className="small muted">Kein Dokument</span>]} />;
            })}</Table>}
            {employeeDetailTab === 'unterweisungen' && <Table heads={['Unterweisung','Datum','Status','Dokumente']}>{myInstructions.map(item => {
              const participant = item.participants.find(p => p.emp === employee.id);
              return <Row key={item.id} cols={[item.title, participant?.date ? window.fmtDE(participant.date) : '—', <MiniBadge status={participant?.signed ? 'signed' : 'warn'} />, <DetailDocActions />]} />;
            })}</Table>}
            {employeeDetailTab === 'untersuchung' && <Table heads={['Untersuchung','Letzte Pr\u00fcfung','N\u00e4chste Pr\u00fcfung','Status']}>{health.map(item => <Row key={item.name} cols={[item.name, item.last, item.next, <MiniBadge status={item.status} />]} />)}</Table>}
            {employeeDetailTab === 'stellen' && <Table heads={['Stellenbeschreibung','Version','Status','Dokumente']}>{jobs.map(item => <Row key={item.name} cols={[item.name, item.version, <MiniBadge status={item.status} />, <DetailDocActions />]} />)}</Table>}
            {employeeDetailTab === 'fuehrerschein' && <Table heads={['Klasse','Beschreibung','N\u00e4chste Kontrolle','Status']}>{license.map(item => <Row key={item.class} cols={[item.class, item.desc, item.next, <MiniBadge status={item.status} />]} />)}</Table>}
            {employeeDetailTab === 'geraetefuehrer' && <Table heads={['Typ Ger\u00e4t','Ausbildung / Einweisung','Datum','Beschreibung']}>{deviceRows.map(item => <Row key={item.id} cols={[item.type, item.kind, item.date ? window.fmtDE(item.date) : '—', item.description || 'Freigegeben']} />)}</Table>}
          </div>
        </div>
      </div>
    );
  };

  if (!selectedSite) return null;

  const openSitePanel = (site) => {
    setSelectedSiteId(site.id);
    setSitePanelTab('stammdaten');
    if (onOpenSite) {
      onOpenSite(site);
      return;
    }
    setDetailOpen(true);
  };

  const sitePanelTabs = [
    { id:'stammdaten', label:'Stammdaten' },
    { id:'personal', label:'Personal' },
    { id:'pruefung', label:'Personal-Pruefung' },
    { id:'fehlend', label:'Fehlende Schulungen' },
    { id:'gefaehrdung', label:'Gefährdungsbeurteilung' },
    { id:'alarmplan', label:'Alarmplan' },
    { id:'dokumente', label:'Dokumente' },
  ];

  const statusBadgeFor = (site) => {
    const status = siteStatus(site);
    if (status.ready) return <span className="badge badge--valid"><span className="badge__dot" />Personal reicht</span>;
    return <span className="badge badge--warn"><span className="badge__dot" />{status.missing} fehlen</span>;
  };

  const siteColumns = [
    { key:'nr', label:'Nr.' },
    { key:'name', label:'Baustelle / Projektname' },
    { key:'company', label:'Firma' },
    { key:'subcontractor', label:'Nachunternehmer' },
    { key:'projectNr', label:'Projekt-Nr.' },
    { key:'bauleiter', label:'Bauleiter' },
    { key:'vorarbeiter', label:'Vorarbeiter' },
    { key:'auftraggeber', label:'Auftraggeber' },
    { key:'adresse', label:'Adresse' },
    { key:'employees', label:'Mitarbeiter' },
    { key:'pflicht', label:'Pflichtpunkte' },
    { key:'missing', label:'Fehlende Schulungen' },
    { key:'status', label:'Status' },
  ];
  const siteColumnLabel = (key) => siteColumns.find(col => col.key === key)?.label || key;
  const siteMetrics = (site) => {
    const employees = activeEmployees.filter(e => site.employeeIds.includes(e.id));
    if (typeof site.demoFulfilled === 'number' || typeof site.demoMissing === 'number') {
      const status = siteStatus(site);
      return { employees, siteTotal: employees.length, siteChecks: [], fulfilled: site.demoFulfilled ?? Math.max(0, 6 - status.missing), status };
    }
    const siteTotal = employees.length;
    const siteWith = (ids) => employees.filter(emp => ids.some(id => hasTraining(emp, id))).length;
    const siteChecks = [
      { required: Math.ceil(siteTotal * 0.9), actual: siteWith(['t-scc016']) },
      { required: siteTotal > 0 ? 1 : 0, actual: siteWith(['t-scc017']) },
      { required: Math.ceil(siteTotal * 0.1), actual: siteWith(['t-erstehilfe']) },
      { required: siteTotal > 0 ? 1 : 0, actual: siteWith(['t-mvas99']) },
      { required: siteTotal > 0 ? 1 : 0, actual: siteWith(['t-gw129']) },
      { required: siteTotal > 0 ? 1 : 0, actual: employees.filter(emp => hasGeraetefuehrer(emp)).length },
    ];
    const fulfilled = siteChecks.filter(check => check.actual >= check.required).length;
    const status = siteStatus(site);
    return { employees, siteTotal, siteChecks, fulfilled, status };
  };
  const siteColumnValue = (site, key, index = 0) => {
    const m = siteMetrics(site);
    if (key === 'nr') return String(index + 1);
    if (key === 'name') return site.name;
    if (key === 'company') return site.company;
    if (key === 'subcontractor') return site.subcontractor || '-';
    if (key === 'projectNr') return site.projectNr;
    if (key === 'bauleiter') return site.bauleiter;
    if (key === 'vorarbeiter') return site.vorarbeiter;
    if (key === 'auftraggeber') return site.auftraggeber;
    if (key === 'adresse') return site.adresse;
    if (key === 'employees') return String(site.employeeIds.length);
    if (key === 'pflicht') return `${m.fulfilled}/6`;
    if (key === 'missing') return String(m.status.missing);
    if (key === 'status') return m.status.ready ? 'Personal reicht' : 'Personal fehlt';
    return '';
  };
  const setSiteColumnSort = (col, dir) => { setSiteSort({ col, dir }); setSiteColumnMenu(null); };
  const openSiteColumnFilter = (col) => { setSiteFilterPanel(col); setSiteFilterSearch(''); setSiteColumnMenu(null); };
  const toggleSiteFilterValue = (col, value) => {
    setSiteColumnFilters(current => {
      const selected = current[col] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [col]: next };
    });
  };
  const clearSiteFilter = (col) => setSiteColumnFilters(current => ({ ...current, [col]: [] }));
  const scopedSites = sites
    .filter(site => activeCompany === 'all' || site.company === window.company(activeCompany)?.name);
  const listedSites = scopedSites
    .map((site, index) => ({ site, index }))
    .filter(item => Object.entries(siteColumnFilters).every(([col, values]) => !values?.length || values.includes(siteColumnValue(item.site, col, item.index))))
    .sort((a, b) => {
      const va = siteColumnValue(a.site, siteSort.col, a.index);
      const vb = siteColumnValue(b.site, siteSort.col, b.index);
      const cmp = String(va).localeCompare(String(vb), 'de', { numeric:true });
      return siteSort.dir === 'asc' ? cmp : -cmp;
    });
  const siteFilterValues = siteFilterPanel ? Array.from(new Set(scopedSites.map((site, index) => siteColumnValue(site, siteFilterPanel, index)))).sort((a,b) => String(a).localeCompare(String(b), 'de', { numeric:true })) : [];
  const visibleSiteFilterValues = siteFilterValues.filter(value => String(value).toLowerCase().includes(siteFilterSearch.toLowerCase()));
  const totalSiteEmployees = listedSites.reduce((sum, item) => sum + item.site.employeeIds.length, 0);
  const totalMissingTrainings = listedSites.reduce((sum, item) => sum + siteMetrics(item.site).status.missing, 0);
  const readySites = listedSites.filter(item => siteMetrics(item.site).status.ready).length;
  const totalRequiredPoints = listedSites.length * 6;
  const fulfilledRequiredPoints = listedSites.reduce((sum, item) => sum + siteMetrics(item.site).fulfilled, 0);
  const SiteColumnHeader = ({ col }) => {
    const active = siteSort.col === col.key || (siteColumnFilters[col.key] || []).length > 0 || siteGroupBy === col.key;
    return (
      <th style={{ position:'relative', userSelect:'none' }}>
        <button type="button" onClick={() => setSiteColumnMenu(siteColumnMenu === col.key ? null : col.key)} style={{ display:'inline-flex', alignItems:'center', gap:5, border:0, background:'transparent', font:'inherit', fontWeight: active ? 800 : 700, color: active ? 'var(--fg-1)' : 'var(--fg-3)', cursor:'pointer', padding:0 }}>
          <span>{col.label}</span><span style={{ fontSize:10 }}>{siteSort.col === col.key ? (siteSort.dir === 'asc' ? 'A-Z' : 'Z-A') : 'v'}</span>
        </button>
        {siteColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:60, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 10px 24px rgba(0,0,0,0.16)', borderRadius:4, overflow:'hidden', textTransform:'none', letterSpacing:0, color:'var(--fg-1)', fontWeight:400 }}>
            <button type="button" onClick={() => setSiteColumnSort(col.key, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setSiteColumnSort(col.key, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => openSiteColumnFilter(col.key)} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setSiteGroupBy(siteGroupBy === col.key ? '' : col.key); setSiteColumnSort(col.key, 'asc'); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Baustellen</h1>
          <div className="view__subtitle">Baustellen melden, Personal auswaehlen und Pflichtqualifikationen pruefen.</div>
        </div>
        <div className="view__actions">
          {extraAction}
          <button className="btn btn--primary" onClick={addSite}><Icon name="plus" size={14} />Baustelle erstellen</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Baustellen', value: listedSites.length, delta:'aktiv in Ansicht', color: null },
          { label:'Mitarbeiter', value: totalSiteEmployees, delta:'eingeplant', color: null },
          { label:'Pflichtpunkte', value: fulfilledRequiredPoints + '/' + totalRequiredPoints, delta:'erfuellt', color: totalMissingTrainings ? '#8a6a1f' : '#3f7a4a' },
          { label:'Fehlende Schulungen', value: totalMissingTrainings, delta: readySites + ' baustellen bereit', color: totalMissingTrainings ? '#a13232' : '#3f7a4a' },
        ].map((k, i) => (
          <div key={i} style={{
            padding:'10px 14px',
            background: 'var(--color-ivory)',
            border: '1px solid var(--border-1)',
            borderRadius:10,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 16,
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.048)',
            transition:'all 150ms ease',
          }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{k.label}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'center', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:500, color: k.color || 'var(--fg-1)', lineHeight:1 }}>{k.value}</div>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--fg-3)', textAlign:'right' }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {Object.entries(siteColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', margin:'0 0 12px 0' }}>
          {Object.entries(siteColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:999, background:'var(--color-parchment)', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{siteColumnLabel(col)}:</span>
              {value}
              <button type="button" onClick={() => toggleSiteFilterValue(col, value)} style={{ border:0, background:'transparent', cursor:'pointer', padding:0, display:'inline-flex' }}><Icon name="x" size={14} /></button>
            </span>
          )))}
          <button type="button" onClick={() => setSiteColumnFilters({})} style={{ border:0, background:'transparent', color:'var(--color-accent)', cursor:'pointer', fontSize:13, textDecoration:'underline' }}>Filter zuruecksetzen</button>
        </div>
      )}

      <section className="tbl-wrap baustellen-table-wrap">
        <table className="tbl job-table baustellen-table" style={{ minWidth:1520, width:'100%' }}>
          <thead>
            <tr>
              {siteColumns.map(col => <SiteColumnHeader key={col.key} col={col} />)}
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>{listedSites.map(({ site, index }, visibleIndex) => {
              const metrics = siteMetrics(site);
              const status = metrics.status;
              const groupValue = siteGroupBy ? siteColumnValue(site, siteGroupBy, index) : '';
              const previousGroup = siteGroupBy && visibleIndex > 0 ? siteColumnValue(listedSites[visibleIndex - 1].site, siteGroupBy, listedSites[visibleIndex - 1].index) : null;
              return [
                siteGroupBy && groupValue !== previousGroup ? <tr key={site.id + '-group'}><td colSpan={siteColumns.length + 1} style={{ padding:'9px 14px', background:'var(--color-parchment)', color:'var(--fg-2)', fontWeight:700, fontSize:12 }}>{siteColumnLabel(siteGroupBy)}: {groupValue}</td></tr> : null,
                <tr key={site.id} onClick={() => openSitePanel(site)} style={{ cursor:'pointer', background: detailOpen && site.id === selectedSite.id ? 'rgba(201,100,66,0.06)' : undefined }}>
                  <td>{index + 1}</td>
                  <td><strong>{site.name}</strong><div className="small muted">{site.projectName}</div></td>
                  <td>{site.company}</td>
                  <td>{site.subcontractor || '-'}</td>
                  <td>{site.projectNr}</td>
                  <td>{site.bauleiter}</td>
                  <td>{site.vorarbeiter}</td>
                  <td>{site.auftraggeber}</td>
                  <td>{site.adresse}</td>
                  <td>{site.employeeIds.length}</td>
                  <td><strong>{metrics.fulfilled}/6</strong></td>
                  <td style={{ color: status.missing ? '#a13232' : '#3f7a4a', fontWeight:700 }}>{status.missing}</td>
                  <td>{statusBadgeFor(site)}</td>
                  <td onClick={event => event.stopPropagation()}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button title="Vorschau" className="icon-btn" onClick={() => openSitePanel(site)}><Icon name="eye" size={15} /></button>
                      <button title="Bearbeiten" className="icon-btn" onClick={() => openSitePanel(site)}><Icon name="edit" size={15} /></button>
                      <button title="Loeschen" className="icon-btn" style={{ color:'#a13232' }}><Icon name="trash" size={15} /></button>
                    </div>
                  </td>
                </tr>
              ];
            })}</tbody>
        </table>
      </section>

      {detailOpen && selectedSite && (
        <div onClick={() => setDetailOpen(false)} style={{ position:'fixed', inset:0, zIndex:2400, background:'rgba(0,0,0,.32)', display:'flex', justifyContent:'flex-end' }}>
          <aside onClick={event => event.stopPropagation()} style={{ width:'min(1176px, 96vw)', background:'var(--color-ivory)', boxShadow:'-24px 0 70px rgba(0,0,0,.28)', display:'flex', flexDirection:'column' }}>
            <div style={{ background:'var(--color-near-black)', color:'white', padding:'24px 28px', display:'grid', gridTemplateColumns:'1fr auto', gap:18, alignItems:'start' }}>
              <div>
                <h2 style={{ margin:0, fontFamily:'var(--font-serif)', fontWeight:500, fontSize:30 }}>{selectedSite.name}</h2>
                <div style={{ color:'rgba(255,255,255,.68)', marginTop:8 }}>{selectedSite.projectName} - {selectedSite.projectNr}</div>
                <div style={{ color:'rgba(255,255,255,.58)', marginTop:5 }}>{selectedSite.company} - {selectedSite.adresse} - Bauleiter: {selectedSite.bauleiter}</div>
                <div style={{ marginTop:14 }}>{ready ? <span className="badge badge--valid"><span className="badge__dot" />Personal reicht</span> : <span className="badge badge--expired"><span className="badge__dot" />Personal fehlt</span>}</div>
              </div>
              <button onClick={() => setDetailOpen(false)} style={{ border:0, background:'transparent', color:'rgba(255,255,255,.72)', fontSize:26, cursor:'pointer' }}>x</button>
            </div>

            <div style={{ display:'flex', overflowX:'auto', borderBottom:'1px solid var(--border-1)', background:'var(--color-parchment)' }}>
              {sitePanelTabs.map(tab => (
                <button key={tab.id} onClick={() => setSitePanelTab(tab.id)} style={{ border:0, background:sitePanelTab === tab.id ? 'var(--color-ivory)' : 'transparent', padding:'14px 18px', font:'inherit', fontWeight:800, color:sitePanelTab === tab.id ? 'var(--fg-1)' : 'var(--fg-3)', cursor:'pointer', whiteSpace:'nowrap' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding:24, overflow:'auto', flex:1 }}>
              {sitePanelTab === 'stammdaten' && (
                <div style={{ display:'grid', gap:18 }}>
                  <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4, minmax(140px, 1fr))' }}>
                    <div className="kpi"><div className="kpi__label">Mitarbeiter</div><div className="kpi__value">{total}</div><div className="kpi__delta">ausgewaehlt</div></div>
                    <div className="kpi"><div className="kpi__label">Pflichtpunkte</div><div className="kpi__value" style={{ color: ready ? '#3f7a4a' : '#8a6a1f' }}>{checks.length - missingChecks.length}/{checks.length}</div><div className="kpi__delta">erfuellt</div></div>
                    <div className="kpi"><div className="kpi__label">Fehlende Schulungen</div><div className="kpi__value" style={{ color: missingChecks.length ? '#a13232' : '#3f7a4a' }}>{missingChecks.length}</div><div className="kpi__delta">nachplanen</div></div>
                    <div className="kpi"><div className="kpi__label">Status</div><div className="kpi__value" style={{ color: ready ? '#3f7a4a' : '#a13232' }}>{ready ? 'OK' : 'Nein'}</div><div className="kpi__delta">einsatzbereit</div></div>
                  </div>
                  <div className="card card--pad">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:14 }}>
                      <div className="card__title">Baustellen-Details</div>
                      {!editingStammdaten && <button className="btn btn--ghost" onClick={() => setEditingStammdaten(true)}><Icon name="edit" size={14} />Bearbeite Stammdaten</button>}
                    </div>
                    {!editingStammdaten ? (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:12 }}>
                        <div style={{ display:'grid', gap:6 }}>
                          <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Projektname</span>
                          <span style={{ color:'var(--fg-1)' }}>{selectedSite.projectName}</span>
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Projekt-Nr.</span>
                          <span style={{ color:'var(--fg-1)' }}>{selectedSite.projectNr}</span>
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Bauleiter</span>
                          <span style={{ color:'var(--fg-1)' }}>{selectedSite.bauleiter}</span>
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Vorarbeiter</span>
                          <span style={{ color:'var(--fg-1)' }}>{selectedSite.vorarbeiter}</span>
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Auftraggeber</span>
                          <span style={{ color:'var(--fg-1)' }}>{selectedSite.auftraggeber}</span>
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Firma</span>
                          <span style={{ color:'var(--fg-1)' }}>{selectedSite.company}</span>
                        </div>
                        <div style={{ display:'grid', gap:6, gridColumn:'1 / -1' }}>
                          <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Adresse</span>
                          <span style={{ color:'var(--fg-1)' }}>{selectedSite.adresse}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:12, marginBottom:14 }}>
                          <Field label="Projektname" field="projectName" />
                          <Field label="Projekt-Nr." field="projectNr" />
                          <Field label="Bauleiter" field="bauleiter" />
                          <Field label="Vorarbeiter" field="vorarbeiter" />
                          <Field label="Auftraggeber" field="auftraggeber" />
                          <Field label="Firma" field="company" />
                          <Field label="Adresse" field="adresse" wide />
                        </div>
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                          <button className="btn btn--ghost" onClick={() => setEditingStammdaten(false)}>Abbrechen</button>
                          <button className="btn btn--primary" onClick={() => setEditingStammdaten(false)}><Icon name="check" size={14} />Speichern</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {sitePanelTab === 'personal' && (
                <div className="card card--pad">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:12 }}>
                    <div><div className="card__title">Mitarbeiter der Baustelle</div><div className="card__sub">{selectedSite.employeeIds.length} Mitarbeiter im Projekt</div></div>
                    <button className="btn btn--ghost" onClick={() => setTeamEditOpen(true)}><Icon name="edit" size={14} />Liste bearbeiten</button>
                  </div>
                  <div style={{ border:'1px solid var(--border-1)', borderRadius:10, overflow:'auto', background:'var(--color-ivory)' }}>
                    <div style={{ minWidth:900 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'minmax(220px, 1.4fr) repeat(5, minmax(88px, .65fr)) minmax(180px, 1.2fr) minmax(150px, .9fr)', gap:10, alignItems:'center', padding:'10px 16px', background:'var(--color-parchment)', borderBottom:'1px solid var(--border-1)', color:'var(--fg-3)', fontSize:11, fontWeight:800, textTransform:'uppercase' }}>
                        <span>Mitarbeiter</span><span>SCC 016</span><span>SCC 017 / 018</span><span>Erste Hilfe</span><span>MVAS 99</span><span>GW 129</span><span>Geraetefuehrer</span><span>Freigabe Portal</span>
                      </div>
                      {selectedEmployees.map(emp => {
                        const deviceTypes = geraetefuehrerTypes(emp);
                        const CheckCell = ({ ok }) => <span style={{ fontSize:18, color:ok ? '#3f7a4a' : 'var(--fg-3)', fontWeight:800 }}>{ok ? String.fromCodePoint(0x2705) : '-'}</span>;
                        return (
                          <button key={emp.id} type="button" onClick={() => { setEmployeeDetailId(emp.id); setEmployeeDetailTab('schulungen'); }} style={{ width:'100%', display:'grid', gridTemplateColumns:'minmax(220px, 1.4fr) repeat(5, minmax(88px, .65fr)) minmax(180px, 1.2fr) minmax(150px, .9fr)', gap:10, alignItems:'center', textAlign:'left', border:0, borderBottom:'1px solid var(--border-1)', background:'transparent', padding:'13px 16px', cursor:'pointer', font:'inherit' }}>
                            <span><strong>{emp.name}</strong><span className="small muted" style={{ display:'block' }}>{window.company(emp.company)?.short || emp.company} - {emp.position}</span></span>
                            <CheckCell ok={hasTraining(emp, 't-scc016')} />
                            <CheckCell ok={hasTraining(emp, 't-scc017')} />
                            <CheckCell ok={hasTraining(emp, 't-erstehilfe')} />
                            <CheckCell ok={hasTraining(emp, 't-mvas99')} />
                            <CheckCell ok={hasTraining(emp, 't-gw129')} />
                            <span style={{ display:'inline-flex', flexWrap:'wrap', gap:6 }}>{deviceTypes.length ? deviceTypes.map(type => <span key={type} className="badge"><span className="badge__dot" />{type}</span>) : <span className="small muted">-</span>}</span>
                            <span onClick={event => event.stopPropagation()}><label style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer' }}><input type="checkbox" checked={isSiteReleasedForEmployee(selectedSite, emp.id)} onChange={() => toggleSiteRelease(emp.id)} /> <span className={isSiteReleasedForEmployee(selectedSite, emp.id) ? 'badge badge--valid' : 'badge'}><span className="badge__dot" />{isSiteReleasedForEmployee(selectedSite, emp.id) ? 'Freigegeben' : 'Nicht frei'}</span></label></span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {sitePanelTab === 'pruefung' && (
                <div className="card card--pad">
                  <div className="card__title">Personal-Pruefung</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(150px, 1fr))', gap:12, marginTop:14 }}>
                    {checks.map(check => {
                      const ok = check.actual >= check.required;
                      return <div key={check.id} style={{ border:'1px solid var(--border-1)', borderRadius:8, padding:14, background: ok ? '#eff5ed' : '#fdf3e0' }}><strong>{check.label}</strong><div className="small muted" style={{ minHeight:32 }}>{check.rule}</div><div style={{ fontFamily:'var(--font-serif)', fontSize:28, color: ok ? '#3f7a4a' : '#8a6a1f' }}>{check.actual}/{check.required}</div>{!ok && check.type !== 'device' && <button className="btn btn--ghost" style={{ marginTop:8, width:'100%', justifyContent:'center' }} onClick={() => planTraining(check.id)}>Anmelden</button>}</div>;
                    })}
                  </div>
                </div>
              )}

              {sitePanelTab === 'fehlend' && (
                <div className="card card--pad">
                  <div className="card__title">Fehlende Schulungen</div>
                  <div style={{ display:'grid', gap:10, marginTop:14 }}>
                    {missingChecks.length === 0 ? <div className="small muted">Keine fehlenden Schulungen.</div> : missingChecks.map(check => <div key={check.id} style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', padding:12, border:'1px solid var(--border-1)', borderRadius:8, background:'#fdf3e0' }}><div><strong>{check.label}</strong><div className="small muted">{check.rule} - {check.actual}/{check.required}</div></div>{check.type !== 'device' && <button className="btn btn--ghost" onClick={() => planTraining(check.id)}>zur Schulung anmelden</button>}</div>)}
                  </div>
                </div>
              )}

              {sitePanelTab === 'gefaehrdung' && (
                <div className="card card--pad">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, marginBottom:14 }}>
                    <div>
                      <div className="card__title">Gefährdungsbeurteilung</div>
                      <div className="card__sub">{selectedSite.name} - {selectedSite.projectName}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', justifyContent:'flex-end' }}>
                      <span className="badge badge--accent"><span className="badge__dot" />Beispiel ausgefüllt</span>
                      <button className={editingRiskAssessment ? 'btn btn--primary' : 'btn btn--ghost'} onClick={() => setEditingRiskAssessment(value => !value)}>
                        <Icon name={editingRiskAssessment ? 'check' : 'edit'} size={14} />{editingRiskAssessment ? 'Speichern' : 'Bearbeiten'}
                      </button>
                    </div>
                  </div>
                  <div className="site-risk-table-wrap">
                    <table className="tbl site-risk-table">
                      <thead>
                        <tr>
                          <th>Nr.</th>
                          <th>Name</th>
                          <th>Nicht erforderlich</th>
                          <th>Erledigt</th>
                          <th>Datum</th>
                          <th>Beschreibung</th>
                          <th>Dokument (PDF)</th>
                        </tr>
                      </thead>
                      <tbody>{riskAssessmentRows.map(row => (
                          <tr key={row.nr}>
                            <td className="num">{row.nr}</td>
                            <td><strong>{row.name}</strong></td>
                            <td><input type="checkbox" checked={!!row.notRequired} readOnly disabled={!editingRiskAssessment} /></td>
                            <td><input type="checkbox" checked={!!row.done} readOnly disabled={!editingRiskAssessment} /></td>
                            <td>{editingRiskAssessment ? <input className="site-risk-input" type="date" defaultValue={row.date || ''} /> : (row.date ? window.fmtDE(row.date) : '-')}</td>
                            <td>{editingRiskAssessment ? <textarea className="site-risk-textarea" defaultValue={row.description} /> : row.description}</td>
                            <td>
                              <button className="btn btn--ghost" style={{ minHeight:32, padding:'0 10px' }}>
                                <Icon name="doc" size={13} />{row.document}
                              </button>
                            </td>
                          </tr>
                        ))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {sitePanelTab === 'alarmplan' && (
                <div className="card card--pad">
                  <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center' }}>
                    <div>
                      <div className="card__title">Alarmplan</div>
                      <div className="card__sub">A4-PDF fuer die ausgewaehlte Baustelle.</div>
                    </div>
                    {hasAlarmPlan ? <span className="badge badge--valid"><span className="badge__dot" />Alarmplan vorhanden</span> : <span className="badge badge--warn"><span className="badge__dot" />Noch nicht erstellt</span>}
                  </div>
                  <div style={{ marginTop:16, border:'1px solid var(--border-1)', borderRadius:10, background:'white', padding:16, display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center' }}>
                    <div>
                      <strong>Alarmplan {selectedSite.projectNr}.pdf</strong>
                      <div className="small muted">{currentAlarmPlan.baustelle || selectedSite.name} - A4 Druckvorlage nach Janning-Vorlage</div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end' }}>
                      {!hasAlarmPlan && <button className="btn btn--primary" onClick={createAlarmPlan}>+ Alarmplan erstellen</button>}
                      {hasAlarmPlan && <>
                        <button className="btn btn--ghost" onClick={() => setAlarmModalOpen(true)}><Icon name="edit" size={14} />Bearbeiten</button>
                        <button className="btn btn--ghost" onClick={() => setAlarmPreviewOpen(true)}><Icon name="eye" size={14} />Vorschau</button>
                        <button className="btn btn--primary" onClick={openAlarmPdf}><Icon name="download" size={14} />PDF anzeigen</button>
                      </>}
                    </div>
                  </div>
                  {hasAlarmPlan && <div style={{ marginTop:18, overflow:'auto', maxHeight:520, border:'1px solid var(--border-1)', borderRadius:10, background:'#ececec', padding:16 }}><div style={{ transform:'scale(.48)', transformOrigin:'top left', width:'210mm', height:'297mm' }}><AlarmPlanDocument plan={currentAlarmPlan} /></div></div>}
                </div>
              )}
              {sitePanelTab === 'dokumente' && (
                <div className="card card--pad">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:14 }}>
                    <div className="card__title">Dokumente</div>
                    <button className="btn btn--ghost" onClick={() => addDocument(selectedSite.id)}><Icon name="plus" size={14} />Hochladen</button>
                  </div>
                  <div style={{ display:'grid', gap:8 }}>
                    {currentSiteDocuments.length === 0 ? (
                      <div style={{ padding:24, textAlign:'center', color:'var(--fg-3)' }}>Keine Dokumente vorhanden</div>
                    ) : (
                      currentSiteDocuments.map(doc => (
                        <div key={doc.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto auto', gap:12, alignItems:'center', padding:12, border:'1px solid var(--border-1)', borderRadius:8, background:'white' }}>
                          <Icon name="doc" size={16} />
                          {editingDocId === doc.id ? (
                            <input
                              type="text"
                              value={editingDocName}
                              onChange={e => setEditingDocName(e.target.value)}
                              onBlur={() => {
                                if (editingDocName.trim()) {
                                  updateDocument(selectedSite.id, doc.id, editingDocName);
                                }
                                setEditingDocId(null);
                                setEditingDocName('');
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  if (editingDocName.trim()) {
                                    updateDocument(selectedSite.id, doc.id, editingDocName);
                                  }
                                  setEditingDocId(null);
                                  setEditingDocName('');
                                }
                              }}
                              autoFocus
                              style={{ minHeight:32, border:'1px solid var(--color-accent)', borderRadius:6, padding:'0 8px', font:'inherit', color:'var(--fg-1)' }}
                            />
                          ) : (
                            <div>
                              <strong>{doc.name}</strong>
                              <div className="small muted">{doc.size} · {window.fmtDE(doc.date)}</div>
                            </div>
                          )}
                          <button className="btn btn--ghost" style={{ minHeight:32, padding:'0 10px' }} title="Download"><Icon name="download" size={14} /></button>
                          <button className="btn btn--ghost" style={{ minHeight:32, padding:'0 10px' }} onClick={() => { setEditingDocId(doc.id); setEditingDocName(doc.name); }} title="Umbenennen"><Icon name="edit" size={14} /></button>
                          <button className="btn btn--ghost is-danger" style={{ minHeight:32, padding:'0 10px' }} onClick={() => deleteDocument(selectedSite.id, doc.id)} title="Löschen"><Icon name="trash" size={14} /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding:16, borderTop:'1px solid var(--border-1)', display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="btn btn--ghost" onClick={() => setDetailOpen(false)}>Schliessen</button>
              <button className="btn btn--primary" onClick={() => setDetailOpen(false)}>Speichern</button>
            </div>
          </aside>
        </div>
      )}

      {alarmModalOpen && (
        <div onClick={() => setAlarmModalOpen(false)} style={{ position:'fixed', inset:0, zIndex:2550, background:'rgba(0,0,0,.36)', display:'flex', justifyContent:'flex-end' }}>
          <aside onClick={event => event.stopPropagation()} style={{ width:'min(760px, 96vw)', background:'var(--color-ivory)', boxShadow:'-24px 0 70px rgba(0,0,0,.28)', display:'flex', flexDirection:'column' }}>
            <div style={{ background:'var(--color-near-black)', color:'white', padding:'22px 24px', display:'flex', justifyContent:'space-between', gap:16, alignItems:'flex-start' }}>
              <div>
                <h2 style={{ margin:0, fontFamily:'var(--font-serif)', fontWeight:500, fontSize:22 }}>Alarmplan erstellen</h2>
                <div style={{ color:'rgba(255,255,255,.68)', marginTop:6, fontSize:13 }}>{selectedSite.projectNr} - {selectedSite.company}</div>
              </div>
              <button onClick={() => setAlarmModalOpen(false)} style={{ border:0, background:'transparent', color:'rgba(255,255,255,.72)', fontSize:20, cursor:'pointer', flex:0 }}>x</button>
            </div>
            <div style={{ padding:24, overflow:'auto', flex:1 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:14 }}>
                {[
                  ['nr','Nr.'], ['firma','Firma'], ['fragebogenDurch','Fragebogen durch'], ['stand','Stand'], ['baustelle','Baustelle'], ['auftraggeber','Auftraggeber'], ['auftraggeberTel','Telefon Auftraggeber'], ['auftragnehmerTel','Telefon Auftragnehmer'], ['bauleiter','Bauleiter Fa. Janning'], ['bauleiterTel','Telefon Bauleiter'], ['ersthelfer','Ersthelfer'], ['ersthelferTel','Telefon Ersthelfer'], ['sicherheit','Fachkraft fuer Arbeitssicherheit'], ['sicherheitTel','Telefon Fachkraft'], ['arzt','Naechster Durchgangsarzt'], ['arztTel','Telefon Durchgangsarzt'], ['krankenhaus','Naechstes Krankenhaus'], ['krankenhausTel','Telefon Krankenhaus']
                ].map(([key,label]) => (
                  <label key={key} style={{ display:'grid', gap:6, gridColumn: key === 'baustelle' ? '1 / -1' : 'auto' }}>
                    <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>{label}</span>
                    <input value={currentAlarmPlan[key] || ''} onChange={event => updateAlarmPlan(key, event.target.value)} style={{ minHeight:42, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 12px', background:'white', font:'inherit', color:'var(--fg-1)' }} />
                  </label>
                ))}
                <label style={{ display:'grid', gap:6, gridColumn:'1 / -1' }}>
                  <span style={{ fontSize:11, color:'var(--fg-3)', textTransform:'uppercase', fontWeight:700 }}>Auftragnehmer</span>
                  <textarea value={currentAlarmPlan.auftragnehmer || ''} onChange={event => updateAlarmPlan('auftragnehmer', event.target.value)} rows={3} style={{ border:'1px solid var(--border-1)', borderRadius:8, padding:'10px 12px', background:'white', font:'inherit', color:'var(--fg-1)', resize:'vertical' }} />
                </label>
              </div>
            </div>
            <div style={{ padding:16, borderTop:'1px solid var(--border-1)', display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="btn btn--ghost" onClick={() => setAlarmModalOpen(false)}>Abbrechen</button>
              <button className="btn btn--ghost" onClick={() => setAlarmPreviewOpen(true)}><Icon name="eye" size={14} />Vorschau</button>
              <button className="btn btn--primary" onClick={() => setAlarmModalOpen(false)}>Speichern</button>
            </div>
          </aside>
        </div>
      )}

      {alarmPreviewOpen && (
        <div onClick={() => setAlarmPreviewOpen(false)} style={{ position:'fixed', inset:0, zIndex:2600, background:'rgba(0,0,0,.42)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={event => event.stopPropagation()} style={{ width:'min(920px, 96vw)', maxHeight:'94vh', background:'var(--color-ivory)', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,.36)' }}>
            <div style={{ background:'var(--color-near-black)', color:'white', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <div><strong>Alarmplan Vorschau</strong><div className="small" style={{ color:'rgba(255,255,255,.68)' }}>{selectedSite.projectNr} - A4</div></div>
              <div style={{ display:'flex', gap:8 }}><button className="btn btn--primary" onClick={openAlarmPdf}>PDF anzeigen / Drucken</button><button onClick={() => setAlarmPreviewOpen(false)} style={{ border:0, background:'transparent', color:'white', fontSize:24, cursor:'pointer' }}>x</button></div>
            </div>
            <div style={{ overflow:'auto', background:'#e6e6e6', padding:18 }}>
              <div style={{ transform:'scale(.82)', transformOrigin:'top center', width:'210mm', minHeight:'297mm', margin:'0 auto' }}><AlarmPlanDocument plan={currentAlarmPlan} /></div>
            </div>
          </div>
        </div>
      )}
      {siteFilterPanel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.18)', zIndex:2450, display:'flex', justifyContent:'flex-end' }} onClick={() => setSiteFilterPanel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width:420, maxWidth:'96vw', height:'100%', background:'white', boxShadow:'-12px 0 30px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'24px 24px 16px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach "{siteColumnLabel(siteFilterPanel)}"</h2>
              <button type="button" onClick={() => setSiteFilterPanel(null)} className="btn btn--ghost" style={{ width:42, height:42, padding:0 }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding:24, overflowY:'auto', flex:1 }}>
              <input value={siteFilterSearch} onChange={e => setSiteFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden" style={{ width:'100%', padding:'12px 14px', border:'1px solid var(--border-2)', font:'inherit', marginBottom:18 }} />
              <div style={{ display:'grid', gap:12 }}>
                {visibleSiteFilterValues.map(value => (
                  <label key={value} style={{ display:'flex', alignItems:'center', gap:12, fontSize:18, cursor:'pointer' }}>
                    <input type="checkbox" checked={(siteColumnFilters[siteFilterPanel] || []).includes(value)} onChange={() => toggleSiteFilterValue(siteFilterPanel, value)} style={{ width:20, height:20 }} />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding:16, borderTop:'1px solid var(--border-1)', display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn--primary" onClick={() => setSiteFilterPanel(null)} disabled={!(siteColumnFilters[siteFilterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => clearSiteFilter(siteFilterPanel)}>Auswahl aufheben</button>
            </div>
          </div>
        </div>
      )}
      {teamEditOpen && (
        <div onClick={() => setTeamEditOpen(false)} style={{ position:'fixed', inset:0, zIndex:2500, background:'rgba(0,0,0,.34)', display:'flex', justifyContent:'flex-end' }}>
          <aside onClick={event => event.stopPropagation()} style={{ width:'min(620px, 96vw)', background:'var(--color-ivory)', boxShadow:'-20px 0 60px rgba(0,0,0,.24)', display:'flex', flexDirection:'column' }}>
            <div style={{ background:'var(--color-near-black)', color:'white', padding:'22px 24px', display:'flex', justifyContent:'space-between', gap:16, alignItems:'flex-start' }}>
              <div><h2 style={{ margin:0, fontFamily:'var(--font-serif)', fontWeight:500 }}>Mitarbeiterliste bearbeiten</h2><div style={{ color:'rgba(255,255,255,.68)', marginTop:6 }}>{selectedSite.name}</div></div>
              <button onClick={() => setTeamEditOpen(false)} style={{ border:0, background:'transparent', color:'rgba(255,255,255,.72)', fontSize:24, cursor:'pointer' }}>x</button>
            </div>
            <div style={{ padding:18, borderBottom:'1px solid var(--border-1)', display:'flex', gap:10 }}>
              <label className="select" style={{ minHeight:42, flex:1 }}><span className="select__label">Firma</span><select value={employeeCompanyFilter} onChange={event => setEmployeeCompanyFilter(event.target.value)} style={{ border:0, background:'transparent', font:'inherit', color:'var(--fg-1)', outline:'none', cursor:'pointer' }}><option value="all">Alle Firmen</option>{window.SEED.companies.map(company => <option key={company.id} value={company.id}>{company.short}</option>)}</select></label>
              <button className="btn btn--ghost" onClick={() => updateSite('employeeIds', activeEmployees.map(e => e.id))}>Alle waehlen</button>
            </div>
            <div style={{ overflow:'auto', padding:18, display:'grid', gap:8 }}>
              {filteredEmployees.map(emp => {
                const checked = selectedSite.employeeIds.includes(emp.id);
                const released = isSiteReleasedForEmployee(selectedSite, emp.id);
                return (
                  <div key={emp.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:12, alignItems:'center', border:'1px solid var(--border-1)', borderRadius:8, background:checked ? '#eff5ed' : 'white', padding:'11px 12px' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleEmployee(emp.id)} style={{ cursor:'pointer' }} />
                    <span>
                      <strong>{emp.name}</strong>
                      <span className="small muted" style={{ display:'block' }}>{window.company(emp.company)?.short || emp.company} - {emp.position}</span>
                    </span>
                    <span className={'badge ' + (checked ? 'badge--valid' : '')} style={{ cursor:'default' }}>
                      <span className="badge__dot" />{checked ? 'im Projekt' : 'nicht gewaehlt'}
                    </span>
                    {checked && (
                      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'4px 8px', borderRadius:6, background:released ? 'rgba(63, 122, 74, 0.1)' : 'rgba(0,0,0,0.04)', border:'1px solid ' + (released ? '#3f7a4a' : 'var(--border-1)') }}>
                        <input type="checkbox" checked={released} onChange={() => toggleSiteRelease(emp.id)} style={{ cursor:'pointer' }} />
                        <span style={{ fontSize:'13px', fontWeight:500, color:released ? '#3f7a4a' : 'var(--fg-2)' }}>Freigabe</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ padding:18, borderTop:'1px solid var(--border-1)', display:'flex', justifyContent:'flex-end', gap:10 }}><button className="btn btn--ghost" onClick={() => setTeamEditOpen(false)}>Abbrechen</button><button className="btn btn--primary" onClick={() => setTeamEditOpen(false)}>Speichern</button></div>
          </aside>
        </div>
      )}
      {detailEmployee && <EmployeeDetailPopup employee={detailEmployee} />}
    </div>
  );
}

Object.assign(window, { BaustellenView });
