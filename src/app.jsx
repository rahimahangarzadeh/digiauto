/* Root App - routes between views, manages role/company/tweaks state */

const { useState, useEffect } = React;

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('jq_loggedin') === '1');
  const [role, setRole] = useState(() => localStorage.getItem('jq_role') || 'admin');
  const [nav, setNav] = useState(() => localStorage.getItem('jq_nav') || 'dashboard');
  const [activeCompany, setActiveCompany] = useState(() => localStorage.getItem('jq_company') || 'all');
  const [tweaks, setTweaks] = useState(() => ({ role: localStorage.getItem('jq_role') || 'admin', density: 'comfortable', cellStyle: 'dot-date' }));
  const [searchState, setSearchState] = useState({ query: '', areas: [], status: [], dateFrom: '', dateTo: '' });
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedTrainingForCalendar, setSelectedTrainingForCalendar] = useState(null);
  const [selectedInstructionForCalendar, setSelectedInstructionForCalendar] = useState(null);
  const [selectedDateForCalendar, setSelectedDateForCalendar] = useState('');
  const [notificationTick, setNotificationTick] = useState(0);

  useEffect(() => { localStorage.setItem('jq_role', role); }, [role]);
  useEffect(() => { localStorage.setItem('jq_nav', nav); }, [nav]);
  useEffect(() => { localStorage.setItem('jq_company', activeCompany); }, [activeCompany]);
  useEffect(() => { localStorage.setItem('jq_loggedin', loggedIn ? '1' : '0'); }, [loggedIn]);

  useEffect(() => {
    const refreshNotifications = () => setNotificationTick(t => t + 1);
    window.addEventListener('cert-pending-updated', refreshNotifications);
    window.addEventListener('instruction-pending-updated', refreshNotifications);
    window.addEventListener('job-pending-updated', refreshNotifications);
    window.addEventListener('medical-pending-updated', refreshNotifications);
    window.addEventListener('license-pending-updated', refreshNotifications);
    window.addEventListener('geraetefuehrer-pending-updated', refreshNotifications);
    window.addEventListener('storage', refreshNotifications);
    return () => {
      window.removeEventListener('cert-pending-updated', refreshNotifications);
      window.removeEventListener('instruction-pending-updated', refreshNotifications);
      window.removeEventListener('job-pending-updated', refreshNotifications);
      window.removeEventListener('medical-pending-updated', refreshNotifications);
      window.removeEventListener('license-pending-updated', refreshNotifications);
      window.removeEventListener('geraetefuehrer-pending-updated', refreshNotifications);
      window.removeEventListener('storage', refreshNotifications);
    };
  }, []);

  // Sync role tweak
  useEffect(() => {
    setRole(tweaks.role);
    if (tweaks.role === 'employee') {
      if (!['portal', 'message_center'].includes(nav)) setNav('portal');
      return;
    }
    if (nav === 'messages') setNav('dashboard');
    if (nav && nav.indexOf('zert') === 0 && nav !== 'zertuebersicht') { setNav('zertuebersicht'); return; }
    if (['doc_bgbau', 'doc_audits', 'doc_references', 'doc_accidents', 'doc_risk'].includes(nav)) setNav('doc_drive');
    if (tweaks.role === 'admin') {
      if (nav === 'bgbau') return;
      const allowed = ['company_hub', 'dashboard', 'chatbot', 'matrix', 'auswertung', 'baustellen', 'bauleiterbesprechung', 'bgbau', 'normenmatrix', 'formulare', 'trainings', 'befaehigte_personen', 'fachaufsichten', 'unfallstatistik', 'organigramm', 'zertuebersicht', 'doc_home', 'doc_drive'];
      if (!allowed.includes(nav)) setNav('dashboard');
    }
  }, [tweaks.role, nav]);

  // Tweaks host handshake
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Listen for navigation to calendar from Matrix (when user clicks "Termin planen")
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.trainingId) {
        setSelectedTrainingForCalendar(e.detail.trainingId);
        setSelectedInstructionForCalendar(e.detail.instruction || null);
        setSelectedDateForCalendar(e.detail.date || '');
        setNav('calendar');
      }
    };
    window.addEventListener('navigate-to-calendar', handler);
    return () => window.removeEventListener('navigate-to-calendar', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.trainingId) window.__pendingTrainingId = e.detail.trainingId;
      setNav('trainings');
    };
    window.addEventListener('navigate-to-training', handler);
    return () => window.removeEventListener('navigate-to-training', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.companyId) setActiveCompany(e.detail.companyId);
      setNav(e.detail?.target || 'matrix');
    };
    window.addEventListener('navigate-to-company-view', handler);
    return () => window.removeEventListener('navigate-to-company-view', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.companyId) setActiveCompany(e.detail.companyId);
      if (e.detail?.empId) window.__pendingMatrixEmpId = e.detail.empId;
      setNav('matrix');
    };
    window.addEventListener('navigate-to-matrix-employee', handler);
    return () => window.removeEventListener('navigate-to-matrix-employee', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.companyId) setActiveCompany(e.detail.companyId);
      if (e.detail?.position) window.__pendingMatrixPosition = e.detail.position;
      setNav('matrix');
    };
    window.addEventListener('navigate-to-matrix-position', handler);
    return () => window.removeEventListener('navigate-to-matrix-position', handler);
  }, []);

  window.__logout = () => { setLoggedIn(false); };

  if (!loggedIn) {
    return <Login onLogin={(r) => { setRole(r); setTweaks({...tweaks, role: r}); setLoggedIn(true); setNav(r === 'employee' ? 'portal' : 'dashboard'); }} />;
  }

  // Notifications count for nav
  const pendingCertUploadsCount = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cert_pending_uploads') || 'null');
      if (Array.isArray(saved)) return saved.filter(item => !item.approved).length;
    } catch {}
    return 3;
  })();
  const pendingInstructionCount = (() => {
    try {
      const approvals = JSON.parse(localStorage.getItem('instruction_pending_approvals') || '{}');
      return Math.max(0, 4 - Object.keys(approvals).filter(id => approvals[id]).length);
    } catch {}
    return 4;
  })();
  const pendingJobCount = (() => {
    try {
      const approvals = JSON.parse(localStorage.getItem('job_pending_approvals') || '{}');
      return Math.max(0, 2 - Object.keys(approvals).filter(id => approvals[id]).length);
    } catch {}
    return 2;
  })();
  const pendingMedicalCount = (() => {
    try {
      const approvals = JSON.parse(localStorage.getItem('medical_pending_approvals') || '{}');
      return Math.max(0, 1 - Object.keys(approvals).filter(id => approvals[id]).length);
    } catch {}
    return 1;
  })();
  const pendingLicenseCount = (() => {
    try {
      const approvals = JSON.parse(localStorage.getItem('license_pending_approvals') || '{}');
      return Math.max(0, 1 - Object.keys(approvals).filter(id => approvals[id]).length);
    } catch {}
    return 1;
  })();
  const pendingGeraetefuehrerCount = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('geraetefuehrer_pending_v1') || 'null');
      if (Array.isArray(saved)) return saved.filter(item => !item.released).length;
    } catch {}
    return 3;
  })();
  const notifications = {
    certs: pendingCertUploadsCount,
    instr: pendingInstructionCount,
    stellen: pendingJobCount,
    medical: pendingMedicalCount,
    license: pendingLicenseCount,
    geraetefuehrer: pendingGeraetefuehrerCount,
  };

  const titles = {
    company_hub:'Firma', dashboard:'Dashboard', chatbot:'Chatbot', matrix:'Qualifikationsmatrix', employees:'Mitarbeiter', message_center:'Nachrichtenzentrale',
    trainings:'Schulungen', calendar:'Kalender', certs:'Zertifikate',
    instr:'Unterweisungen', providers:'Akademien', companies:'Firmen',
    auswertung:'Firmen-Auswertung', baustellen:'Baustellen', bauleiterbesprechung:'Bauleiterbesprechung', bgbau:'Baustellenaushang BGBAU', normenmatrix:'Normenmatrix', formulare:'Formulare', organigramm:'Organigramm', zertuebersicht:'Zertifizierungs\u00fcbersicht',
    portal:'Portal', 'portal-certs':'Zertifikate', 'portal-fuehrerschein':'F\u00fchrerschein', 'portal-unterweisungen':'Unterweisungen', 'portal-untersuchung':'Untersuchungsvorsorge', 'portal-stellenbeschr':'Stellenbeschreibung', 'portal-baustellen':'Baustellen', 'portal-geraetefuehrer':'Ger\u00e4tepr\u00fcfung', 'portal-termine':'Termine', 'portal-wartung':'Wartungsliste', stellenbeschreibungen:'Stellenbeschreibungen',
    untersuchungsvorsorge:'Untersuchungsvorsorge', fuehrerscheinkontrolle:'F\u00fchrerscheinkontrolle', geraetefuehrer:'Ger\u00e4tef\u00fchrer', befaehigte_personen:'Bef\u00e4higte Personen', fachaufsichten:'Fachaufsichten', unfallstatistik:'Unfallstatistik',
    wartungsliste:'Termine',
    doc_home:'Startseite', doc_drive:'Meine Ablage'
  };

  titles.bgbau = 'Baustellenaushang BGBAU';
  const breadcrumbs = ['Janning Gruppe', titles[nav] || ''];

  let view = null;
  switch (nav) {
    case 'company_hub': view = <CompanyHubView />; break;
    case 'dashboard': view = <DashboardView activeCompany={activeCompany} setActiveCompany={setActiveCompany} setNav={setNav} />; break;
    case 'chatbot': view = <ChatbotView activeCompany={activeCompany} />; break;
    case 'matrix':    view = <MatrixView activeCompany={activeCompany} />; break;
    case 'employees': view = <EmployeesView activeCompany={activeCompany} />; break;
    case 'message_center': view = <MessageCenterView />; break;
    case 'trainings': view = <TrainingsView />; break;
    case 'calendar':  view = <CalendarView activeCompany={activeCompany} selectedTraining={selectedTrainingForCalendar} selectedInstruction={selectedInstructionForCalendar} selectedDate={selectedDateForCalendar} onTrainingSelected={() => { setSelectedTrainingForCalendar(null); setSelectedInstructionForCalendar(null); setSelectedDateForCalendar(''); }} />; break;
    case 'certs':     view = <CertsView activeCompany={activeCompany} />; break;
    case 'instr':     view = <InstructionsView activeCompany={activeCompany} />; break;
    case 'providers': view = <ProvidersView />; break;
    case 'companies': view = <CompaniesView />; break;
    case 'auswertung':view = <EvaluationView />; break;
    case 'baustellen':view = <BaustellenView activeCompany={activeCompany} />; break;
    case 'bauleiterbesprechung':view = <BauleiterbesprechungView />; break;
    case 'bgbau':     view = <BGBauAushangView activeCompany={activeCompany} />; break;
    case 'normenmatrix': view = <NormenmatrixView />; break;
    case 'formulare': view = <FormulareView />; break;
    case 'doc_home':
      view = <DocumentsView mode="home" />;
      break;
    case 'doc_drive':
      view = <DocumentsView mode="drive" />;
      break;
    case 'organigramm':view = <OrganigrammView activeCompany={activeCompany} />; break;
    case 'zertuebersicht':view = <CertOverviewView activeCompany={activeCompany} />; break;
    case 'portal':
      view = role === 'employee' && window.EmployeeAdminDetail
        ? <EmployeeAdminDetail emp={window.employee('e-me')} onBack={() => {}} />
        : (window.PortalView ? React.createElement(window.PortalView, { searchState, setSearchState, nav }) : <Empty title="Mein Portal lÃ¤dt" sub="Bitte kurz erneut Ã¶ffnen." />);
      break;
    case 'portal-certs':
    case 'portal-fuehrerschein':
    case 'portal-unterweisungen':
    case 'portal-untersuchung':
    case 'portal-stellenbeschr':
    case 'portal-baustellen':
    case 'portal-geraetefuehrer':
    case 'portal-termine':
    case 'portal-wartung':
      view = window.PortalView ? React.createElement(window.PortalView, { searchState, setSearchState, nav }) : <Empty title="Mein Portal lädt" sub="Bitte kurz erneut öffnen." />;
      break;
    case 'stellenbeschreibungen': view = <StellenbeschreibungenView />; break;
    case 'untersuchungsvorsorge': view = <UntersuchungsvorsorgeView />; break;
    case 'fuehrerscheinkontrolle': view = window.FuehrerscheinkontrolleView ? <window.FuehrerscheinkontrolleView /> : <Empty title="Führerscheinkontrolle lädt" sub="Bitte kurz erneut öffnen." />; break;
    case 'geraetefuehrer': view = <GeraetefuehrerView />; break;
    case 'befaehigte_personen': view = <BefaehigtePersonenView activeCompany={activeCompany} />; break;
    case 'fachaufsichten': view = <FachaufsichtenView activeCompany={activeCompany} />; break;
    case 'unfallstatistik': view = <UnfallstatistikView activeCompany={activeCompany} />; break;
    case 'wartungsliste': view = <WartungslisteView />; break;
    default:          view = <DashboardView activeCompany={activeCompany} />;
  }

  return (
    <div className="app-shell">
      <Sidebar nav={nav} setNav={setNav} role={role} activeCompany={activeCompany} setActiveCompany={setActiveCompany} notifications={notifications} mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />
      <main className="main">
        <Topbar title={titles[nav]} breadcrumbs={breadcrumbs} actions={null} searchState={searchState} setSearchState={setSearchState} onMobileMenuOpen={() => setMobileNavOpen(true)} />
        <div className="view">{view}</div>
      </main>
      <TweaksPanel open={tweaksOpen} tweaks={tweaks} setTweaks={setTweaks} />
      <QuickActions role={role} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
