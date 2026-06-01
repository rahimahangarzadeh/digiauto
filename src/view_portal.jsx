/* Mein Portal — Employee portal with hero, stats, 4 tabs, floating action buttons */

function PortalView({ searchState, setSearchState }) {
  const me = window.employee('e-me');
  const ss = searchState || { query: '', areas: [], status: [], dateFrom: '', dateTo: '' };
  const setSearch = setSearchState || (() => {});

  // ── real data ──────────────────────────────────────────────────────────────
  const myCerts = window.SEED.trainings.map((t) => ({
    training: t,
    cert: window.SEED.certs[me.id]?.[t.id],
  })).filter((x) => x.cert && x.cert.status !== 'missing');

  const myInstructions = window.SEED.instructions.filter((u) =>
    u.participants.some((p) => p.emp === me.id)
  );

  // ── mock health & job data (not yet in SEED) ───────────────────────────────
  const healthChecks = [
    { id: 'h1', name: 'Atemschutzgeräte',            type: 'G26 Atemschutz',          lastCheck: '14.03.2025', nextCheck: '14.03.2026', status: 'valid' },
    { id: 'h2', name: 'Arbeitsmedizin. Vorsorge',    type: 'G37 Lärmexposition',       lastCheck: '08.01.2025', nextCheck: '08.01.2028', status: 'valid' },
    { id: 'h3', name: 'Augenuntersuchung',            type: 'G37 Bildschirmarbeit',     lastCheck: '12.06.2024', nextCheck: '12.06.2027', status: 'valid' },
  ];
  const jobDescriptions = [
    { id: 'j1', name: 'Polier Tiefbau',         position: 'Polier',     company: 'Tiefbau GmbH', version: 'v1.2', status: 'signed', signed: '15.03.2026' },
    { id: 'j2', name: 'Sicherheitsbeauftragter', position: 'Stv. SiBe', company: 'Tiefbau GmbH', version: 'v2.0', status: 'signed', signed: '01.01.2025' },
  ];

  // Führerscheinkontrolle — nur Admin-freigegebene Einträge sichtbar
  const licenseChecks = [
    { id: 'l1', class: 'B',  desc: 'PKW bis 3,5 t',              lastCheck: '10.03.2025', nextCheck: '10.03.2027', status: 'valid',   adminApproved: true,  doc: 'Fuehrerschein_B_Vorderseite.pdf' },
    { id: 'l2', class: 'BE', desc: 'PKW mit Anhänger',           lastCheck: '10.03.2025', nextCheck: '10.03.2027', status: 'valid',   adminApproved: true,  doc: 'Fuehrerschein_BE_Kopie.pdf' },
    { id: 'l3', class: 'C',  desc: 'LKW über 3,5 t',            lastCheck: '15.01.2024', nextCheck: '15.01.2026', status: 'expired', adminApproved: true,  doc: 'Fuehrerschein_C.pdf' },
    { id: 'l4', class: 'CE', desc: 'LKW mit Anhänger (Züge)',   lastCheck: '15.01.2024', nextCheck: '15.07.2026', status: 'warn',    adminApproved: true,  doc: 'Fuehrerschein_CE.pdf' },
    { id: 'l5', class: 'T',  desc: 'Land-/forstwirtschaftl. Fahrzeuge', lastCheck: '', nextCheck: '', status: 'missing', adminApproved: false, doc: null },
  ];

  // ── stats ──────────────────────────────────────────────────────────────────
  const myBaustellen = React.useMemo(() => {
    const fallback = [{
      id: 'bs-1',
      name: 'Baustelle Alex Barum',
      company: 'Janning Tiefbau GmbH',
      projectName: 'Kanalsanierung Nordhorn',
      projectNr: 'BAU-2026-014',
      bauleiter: 'Alexander Petersen',
      vorarbeiter: 'Markus Brinker',
      auftraggeber: 'Stadt Nordhorn',
      adresse: 'Lingener Strasse 42, 48529 Nordhorn',
      employeeIds: ['e-me','e-2','e-3','e-4','e-5'],
      releasedEmployeeIds: ['e-me'],
    }];
    let sites = fallback;
    try {
      const saved = JSON.parse(localStorage.getItem('baustellen_employee_releases_v1') || '[]');
      if (Array.isArray(saved) && saved.length) sites = saved;
    } catch {}
    return sites.filter(site => (site.releasedEmployeeIds || []).includes(me.id));
  }, [me.id]);
  const missingMandatory = window.SEED.trainings
    .filter(t => t.mandatory && !window.SEED.certs[me.id]?.[t.id])
    .map(t => ({ training: t, cert: { status: 'missing' } }));

  const validCount   = myCerts.filter((x) => x.cert.status === 'valid').length;
  const warnCount    = myCerts.filter((x) => x.cert.status === 'warn').length;
  const expiredCount = myCerts.filter((x) => x.cert.status === 'expired').length;
  const missingCount = missingMandatory.length;

  // ── tabs ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState('certificates');
  const [certFilter, setCertFilter] = React.useState(null); // null | 'valid' | 'warn' | 'expired'

  // Meine Wartung — gefilterte Einträge aus der globalen Wartungsliste
  const myMaintenanceItems = React.useMemo(() => {
    if (!window.wartungsliste_entries) return [];
    return window.wartungsliste_entries.filter(e => e.emp === me.firstName && e.freigegeben === 'ja');
  }, [me.firstName]);

  const tabs = [
    { id: 'certificates', label: 'Zertifikate',       count: myCerts.length + missingMandatory.length },
    { id: 'instructions', label: 'Unterweisungen',    count: myInstructions.length },
    { id: 'health',       label: 'Untersuchung',      count: healthChecks.length },
    { id: 'jobdesc',      label: 'Stellenbeschr.',    count: jobDescriptions.length },
    { id: 'license',      label: 'Führerschein',      count: licenseChecks.filter(l => l.adminApproved).length },
    { id: 'maintenance',  label: 'Meine Wartung',     count: myMaintenanceItems.length },
    { id: 'appointments', label: 'Termine',           count: null },
  ];

  // ── floating button modals ─────────────────────────────────────────────────
  const [showMessage, setShowMessage] = React.useState(false);
  const [showUpload,  setShowUpload]  = React.useState(false);
  const [msgText,     setMsgText]     = React.useState('');
  const [messages, setMessages] = React.useState([
    { from: 'admin', text: 'Hallo ' + me.firstName + ', schreib mir einfach, wenn du Fragen hast.', time: 'Mo. 09:14' },
  ]);
  const [draft, setDraft] = React.useState('');
  const [chatBezug, setChatBezug] = React.useState('');
  const [uploadStep, setUploadStep] = React.useState(1);
  const [uploadFile, setUploadFile] = React.useState(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [dragOver, setDragOver] = React.useState(false);
  const [unread, setUnread] = React.useState(1);
  const chatEndRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const openMessage = () => { setShowMessage(true); setUnread(0); };

  const sendMessage = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const ts = `Heute ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const bezugLabel = chatBezug ? ` [Bezug: ${chatBezug}]` : '';
    setMessages((m) => [...m, { from: 'me', text: draft.trim(), time: ts, bezug: chatBezug || null }]);
    setDraft('');
    setChatBezug('');
    setTimeout(() => setMessages((m) => [...m, { from: 'admin', typing: true }]), 900);
    setTimeout(() => {
      setMessages((m) => {
        const copy = m.filter((x) => !x.typing);
        const now2 = new Date();
        const ts2 = `Heute ${String(now2.getHours()).padStart(2,'0')}:${String(now2.getMinutes()).padStart(2,'0')}`;
        return [...copy, { from: 'admin', text: 'Danke — ich schaue mir das an und melde mich.', time: ts2 }];
      });
    }, 2600);
  };

  React.useEffect(() => {
    if (showMessage && chatEndRef.current) {
      chatEndRef.current.parentElement?.scrollTo({ top: 99999, behavior: 'smooth' });
    }
  }, [messages, showMessage]);

  const handleFileDrop = (f) => { if (f) { setUploadFile(f); setUploadStep(2); } };
  const simulateUpload = () => {
    setUploadStep(3);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 20 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setUploadStep(4), 400); }
      setUploadProgress(Math.min(p, 100));
    }, 180);
  };

  // ── status badge helper ────────────────────────────────────────────────────
  const statusCfg = {
    valid:   { color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf', label: 'Gültig' },
    warn:    { color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc', label: 'Läuft ab' },
    expired: { color: '#a13232', bg: '#fbecea', border: '#eac8c2', label: 'Abgelaufen' },
    signed:  { color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf', label: 'Unterschrieben' },
    planned: { color: '#2d6fa3', bg: '#e8f1fb', border: '#bcd3ee', label: 'Geplant' },
    missing: { color: '#a13232', bg: '#fbecea', border: '#eac8c2', label: 'Fehlt' },
  };
  const Badge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.valid;
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px',
        borderRadius:999, fontSize:11.5, fontWeight:500, background:s.bg,
        border:'1px solid '+s.border, color:s.color, whiteSpace:'nowrap' }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:s.color, flexShrink:0 }}></span>
        {s.label}
      </span>
    );
  };

  const PdfBtn = ({ label = 'PDF anzeigen', title = '', category = '' }) => {
    const [hover, setHover] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(false);
    const ref = React.useRef(null);

    // Fake PDF preview content
    const PreviewPopup = () => (
      <div style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:3000,
        display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      }} onClick={() => setShowPreview(false)}>
        <div style={{ background:'white', borderRadius:12, width:520, maxHeight:'80vh', overflow:'hidden',
          boxShadow:'0 16px 48px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column' }}
          onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontWeight:600, fontSize:14 }}>{title || label}</div>
              <div style={{ fontSize:11, color:'#999', marginTop:2 }}>{category} · PDF · Vorschau</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ padding:'5px 12px', fontSize:12, border:'1px solid #ddd', borderRadius:6, background:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                <Icon name="download" size={12} /> Download
              </button>
              <button onClick={() => setShowPreview(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#999' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>
          {/* Fake PDF page */}
          <div style={{ flex:1, overflowY:'auto', background:'#f5f5f5', padding:20, display:'flex', justifyContent:'center' }}>
            <div style={{ width:420, background:'white', boxShadow:'0 2px 12px rgba(0,0,0,0.1)', borderRadius:4, padding:'36px 40px', minHeight:540 }}>
              {/* PDF mock content */}
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', color:'#999', marginBottom:6 }}>Janning-Gruppe · Zertifikat</div>
                <div style={{ fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#1a1a1a', lineHeight:1.3 }}>{title || 'Zertifikat'}</div>
                <div style={{ fontSize:12, color:'#666', marginTop:6 }}>{category}</div>
              </div>
              <div style={{ borderTop:'2px solid #c96442', paddingTop:20, marginBottom:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  {[['Mitarbeiter','Markus Brinker'],['Personal-Nr.','2041'],['Firma','Janning Tiefbau GmbH'],['Abteilung','Poliere']].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:0.8, color:'#999', marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:13, fontWeight:500, color:'#1a1a1a' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:'#f9f9f7', borderRadius:6, padding:'12px 14px', marginBottom:20, fontSize:12, color:'#444', lineHeight:1.6 }}>
                Hiermit wird bestätigt, dass der oben genannte Mitarbeiter die erforderliche Schulung erfolgreich absolviert hat und alle Anforderungen erfüllt.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:11, color:'#666' }}>
                {[['Ausgestellt am','21.04.2026'],['Gültig bis','21.04.2027'],['Aussteller','BiW Bildungszentrum'],['Unterschrift','Michael Janning']].map(([k,v]) => (
                  <div key={k} style={{ borderTop:'1px solid #eee', paddingTop:8 }}>
                    <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:0.6, color:'#bbb', marginBottom:3 }}>{k}</div>
                    <div style={{ fontWeight:500, color:'#333' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:28, borderTop:'1px solid #eee', paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:9, color:'#ccc', letterSpacing:0.5 }}>JANNING-GRUPPE · SCHULUNGSMATRIX · SEITE 1/1</div>
                <div style={{ width:48, height:48, borderRadius:4, background:'#f0ece6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#c96442' }}>J</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <>
        <button
          ref={ref}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => setShowPreview(true)}
          style={{ display:'inline-flex', alignItems:'center', gap:5, background: hover ? 'var(--color-parchment)' : 'none',
            border:'1px solid var(--border-1)', borderRadius:6, padding:'4px 10px', cursor:'pointer',
            fontSize:12, color: hover ? 'var(--color-accent)' : 'var(--fg-2)', fontFamily:'inherit',
            transition:'all 120ms', position:'relative' }}>
          <Icon name="doc" size={12} />
          {label}
        </button>
        {showPreview && <PreviewPopup />}
      </>
    );
  };

  // ── tab content ────────────────────────────────────────────────────────────

  // Sortierung für Zertifikate-Tabelle
  const [certSort, setCertSort] = React.useState({ col: 'status', dir: 'asc' });

  const daysUntilExpiry = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date('2026-04-30');
    const exp = new Date(dateStr);
    return Math.round((exp - today) / 86400000);
  };

  const ExpiryUrgency = ({ expiresAt, status }) => {
    if (status === 'expired') return null;
    const days = daysUntilExpiry(expiresAt);
    if (days === null) return null;
    if (days <= 7 && days >= 0) return (
      <span style={{
        display:'inline-flex', alignItems:'center', gap:4, marginLeft:6,
        background:'#fbeaea', border:'1px solid #eac8c2', color:'#a13232',
        borderRadius:999, padding:'2px 7px', fontSize:11, fontWeight:700,
        animation:'urgentBlink 1s ease-in-out infinite',
      }}>
        🔴 {days === 0 ? 'Heute!' : `noch ${days} Tag${days === 1 ? '' : 'e'}`}
      </span>
    );
    if (days <= 30 && days >= 0) return (
      <span style={{
        display:'inline-flex', alignItems:'center', gap:4, marginLeft:6,
        background:'#fdf3e0', border:'1px solid #ece0bc', color:'#8a6a1f',
        borderRadius:999, padding:'2px 7px', fontSize:11, fontWeight:600,
      }}>
        ⚠️ noch {days} Tage
      </span>
    );
    return null;
  };

  const sortCerts = (list) => {
    return [...list].sort((a, b) => {
      const { col, dir } = certSort;
      let va, vb;
      if (col === 'name')       { va = a.training.name; vb = b.training.name; }
      else if (col === 'cat')   { va = a.training.cat;  vb = b.training.cat; }
      else if (col === 'from')  { va = a.cert.validFrom || ''; vb = b.cert.validFrom || ''; }
      else if (col === 'until') { va = a.cert.expiresAt || ''; vb = b.cert.expiresAt || ''; }
      else {
        // status: sort by urgency
        const o = { missing: 0, expired: 1, warn: 2, valid: 3, planned: 4 };
        va = o[a.cert.status] ?? 9;
        vb = o[b.cert.status] ?? 9;
        return dir === 'asc' ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb), 'de');
      return dir === 'asc' ? cmp : -cmp;
    });
  };

  const SortTh = ({ col, label, style: thStyle }) => {
    const active = certSort.col === col;
    const toggle = () => setCertSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
    return (
      <th style={{ cursor:'pointer', userSelect:'none', whiteSpace:'nowrap', ...thStyle }} onClick={toggle}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
          {label}
          <span style={{ fontSize:10, opacity: active ? 1 : 0.3, color: active ? 'var(--color-accent)' : 'inherit' }}>
            {active ? (certSort.dir === 'asc' ? '▲' : '▼') : '⇅'}
          </span>
        </span>
      </th>
    );
  };

  const [expandedCert, setExpandedCert] = React.useState(null);

  // Mock Verlauf-Daten pro Zertifikat
  const certHistory = {
    't-baggerf':      [{ v:'v1', uploaded:'15.10.2025', uploadedBy:'Markus Brinker', checked:'18.10.2025', checkedBy:'Sabine Janning', status:'Abgelaufen',  note:'Auffrischung erforderlich' }],
    't-erstehilfe':   [{ v:'v2', uploaded:'22.05.2025', uploadedBy:'Markus Brinker', checked:'24.05.2025', checkedBy:'Sabine Janning', status:'Genehmigt',   note:'' },
                       { v:'v1', uploaded:'12.05.2023', uploadedBy:'Markus Brinker', checked:'14.05.2023', checkedBy:'Michael Janning', status:'Genehmigt',  note:'Erstzertifikat' }],
    't-scc016':       [{ v:'v1', uploaded:'21.01.2024', uploadedBy:'Markus Brinker', checked:'23.01.2024', checkedBy:'Sabine Janning', status:'Genehmigt',   note:'' }],
    't-scc017':       [{ v:'v1', uploaded:'21.09.2023', uploadedBy:'Markus Brinker', checked:'25.09.2023', checkedBy:'Sabine Janning', status:'Genehmigt',   note:'' }],
    't-gw330':        [{ v:'v1', uploaded:'20.08.2025', uploadedBy:'Markus Brinker', checked:'22.08.2025', checkedBy:'Michael Janning', status:'Genehmigt',  note:'' }],
    't-brand':        [{ v:'v2', uploaded:'11.11.2024', uploadedBy:'Markus Brinker', checked:'12.11.2024', checkedBy:'Sabine Janning', status:'Genehmigt',   note:'' },
                       { v:'v1', uploaded:'10.11.2021', uploadedBy:'Markus Brinker', checked:'11.11.2021', checkedBy:'Michael Janning', status:'Genehmigt',  note:'Erstschulung' }],
    't-unterweisung': [{ v:'v1', uploaded:'21.04.2026', uploadedBy:'Markus Brinker', checked:'22.04.2026', checkedBy:'Sabine Janning', status:'Genehmigt',   note:'Unterschrieben vor Ort' }],
  };

  const [certSelectedIds, setCertSelectedIds] = React.useState(new Set());
  const [certGroupBy, setCertGroupBy] = React.useState(null); // 'schulung', 'firma', null
  const [certPdfModal, setCertPdfModal] = React.useState(null); // { title, cat, trainId }

  // Status berechnen: Gültig / Läuft ab / Abgelaufen
  const calcStatus = (expiresAt) => {
    if (!expiresAt) return 'missing';
    const now = new Date('2026-04-21');
    const exp = new Date(expiresAt);
    const daysLeft = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 30) return 'warn';
    return 'valid';
  };

  // Auto-Wartungsliste-Eintrag erstellen bei Ablaufen/Warnung
  const createMaintenanceItem = (trainName, status) => {
    if (!window.wartungsliste_entries) return;
    const now = new Date('2026-04-21');
    const today = now.toLocaleDateString('de-DE');
    
    // Checke ob schon ein Eintrag existiert
    const exists = window.wartungsliste_entries.some(e => 
      e.schulung === trainName && (e.status === 'offen' || e.status === 'in_pruefung')
    );
    if (exists) return;
    
    const newEntry = {
      id: 'w' + Math.random().toString(36).substr(2, 9),
      emp: window.currentUser?.name || 'Mitarbeiter',
      company: window.currentUser?.company || 'Unbekannt',
      schulung: trainName,
      datum: today,
      type: 'zertifikat',
      status: 'offen',
      faelligSeit: today,
      erledigtAm: '',
      erledigtVon: '',
      notiz: status === 'expired' ? '❌ Zertifikat abgelaufen' : '⏳ Zertifikat läuft bald ab',
      freigegeben: 'nein'
    };
    
    window.wartungsliste_entries.push(newEntry);
    if (window.toastManager) {
      window.toastManager.show(
        `📋 Wartungseintrag erstellt: "${trainName}" (${status === 'expired' ? 'Abgelaufen' : 'Läuft ab'})`,
        'info',
        5000
      );
    }
  };

  // Restlaufzeit anzeigen
  const formatRemaining = (expiresAt) => {
    if (!expiresAt) return '—';
    const now = new Date('2026-04-21');
    const exp = new Date(expiresAt);
    const days = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
    if (days < 0) return `vor ${Math.abs(days)} Tagen abgelaufen`;
    if (days === 0) return 'heute ablaufen!';
    if (days === 1) return 'morgen ablaufen';
    return `in ${days} Tagen`;
  };

  const renderCertificates = () => {
    const activeStatuses = [
      ...(certFilter ? [certFilter] : []),
      ...ss.status,
    ].filter((v, i, a) => a.indexOf(v) === i);

    const baseCerts = [
      ...myCerts.filter(({ training: t, cert: c }) => {
        const status = calcStatus(c.expiresAt);
        if (activeStatuses.length > 0 && !activeStatuses.includes(status)) return false;
        if (ss.query) {
          const q = ss.query.toLowerCase();
          if (!t.name.toLowerCase().includes(q) && !t.cat.toLowerCase().includes(q)) return false;
        }
        if (ss.dateFrom && c.expiresAt && c.expiresAt < ss.dateFrom) return false;
        if (ss.dateTo   && c.expiresAt && c.expiresAt > ss.dateTo)   return false;
        return true;
      }),
      // Fehlende Pflicht-Zertifikate anhängen
      ...missingMandatory.filter(({ training: t }) => {
        if (activeStatuses.length > 0 && !activeStatuses.includes('missing')) return false;
        if (ss.query) {
          const q = ss.query.toLowerCase();
          if (!t.name.toLowerCase().includes(q) && !t.cat.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    ];
    const filtered = sortCerts(baseCerts);
    return (
    <div>
      <style>{`@keyframes urgentBlink { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
      
      {/* Filter Bar */}
      <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6 }}>
          {['valid', 'warn', 'expired'].map(k => (
            <button key={k} onClick={() => setCertFilter(certFilter === k ? null : k)}
              style={{ padding:'6px 12px', borderRadius:999, fontSize:12, fontFamily:'inherit',
                border:'1px solid var(--border-1)', cursor:'pointer',
                background: certFilter===k ? (k==='valid'?'#eff5ed':k==='warn'?'#fdf3e0':'#fbeaea') : 'transparent',
                color: certFilter===k ? (k==='valid'?'#3f7a4a':k==='warn'?'#8a6a1f':'#a13232') : 'var(--fg-2)',
                fontWeight: certFilter===k ? 600 : 400 }}>
              {k==='valid'?'🟢 Gültig':k==='warn'?'🟡 Läuft ab':'🔴 Abgelaufen'}
            </button>
          ))}
        </div>
        
        {/* Grouping */}
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--fg-3)' }}>Gruppieren:</span>
          <select value={certGroupBy || ''} onChange={e => setCertGroupBy(e.target.value || null)}
            style={{ padding:'6px 8px', borderRadius:6, border:'1px solid var(--border-1)', fontSize:12, fontFamily:'inherit', background:'white', cursor:'pointer' }}>
            <option value="">Keine</option>
            <option value="schulung">Nach Schulung</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {certSelectedIds.size > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:16, padding:'12px 14px', background:'var(--color-parchment)', borderRadius:8, alignItems:'center' }}>
          <span style={{ fontSize:12, fontWeight:500, color:'var(--fg-1)' }}>{certSelectedIds.size} ausgewählt</span>
          <button style={{ padding:'5px 12px', borderRadius:6, background:'var(--color-accent)', color:'white', border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500 }}>
            📤 Exportieren
          </button>
          <button style={{ padding:'5px 12px', borderRadius:6, background:'#3f7a4a', color:'white', border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500 }}>
            🔄 Verlängern
          </button>
          <button onClick={() => setCertSelectedIds(new Set())} style={{ marginLeft:'auto', padding:'5px 12px', borderRadius:6, background:'transparent', border:'1px solid var(--border-1)', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
            Abbrechen
          </button>
        </div>
      )}

      <div className="tbl-wrap">
        {filtered.length === 0 ? (
          <div style={{ padding:'32px 0', textAlign:'center', color:'var(--fg-3)' }}>
            <Icon name="search" size={22} />
            <div className="small muted" style={{ marginTop:8 }}>Keine Zertifikate gefunden</div>
          </div>
        ) : (
        <table className="tbl">
          <thead><tr>
            <th style={{ width:32 }}>
              <input type="checkbox" onChange={e => {
                if (e.target.checked) setCertSelectedIds(new Set(filtered.map(f => f.training.id)));
                else setCertSelectedIds(new Set());
              }} style={{ cursor:'pointer' }} />
            </th>
            <th>Schulung / Zertifikat</th>
            <th>Kategorie</th>
            <th>Ausgestellt</th>
            <th>Ablaufdatum</th>
            <th>Restlaufzeit</th>
            <th>Status</th>
            <th style={{ textAlign:'center' }}>Aktionen</th>
          </tr></thead>
          <tbody>
            {filtered.map(({ training: t, cert: c }) => {
              const status = calcStatus(c.expiresAt);
              const days = c.expiresAt ? Math.floor((new Date(c.expiresAt) - new Date('2026-04-21')) / (1000 * 60 * 60 * 24)) : null;
              const isSelected = certSelectedIds.has(t.id);
              
              const StatusBadge = () => {
                const cfg = {
                  valid: { icon: '🟢', label: 'Gültig', color: '#3f7a4a', bg: '#eff5ed' },
                  warn: { icon: '🟡', label: 'Läuft ab', color: '#8a6a1f', bg: '#fdf3e0' },
                  expired: { icon: '🔴', label: 'Abgelaufen', color: '#a13232', bg: '#fbeaea' },
                  missing: { icon: '❌', label: 'Fehlt', color: '#a13232', bg: '#fbeaea' },
                };
                const s = cfg[status] || cfg.valid;
                return (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:999, fontSize:11, fontWeight:600, background:s.bg, color:s.color }}>
                    {s.icon} {s.label}
                  </span>
                );
              };
              
              return (
                <tr key={t.id} style={{ background: isSelected ? 'var(--color-parchment)' : undefined }}>
                  <td style={{ textAlign:'center' }}>
                    <input type="checkbox" checked={isSelected} onChange={e => {
                      const s = new Set(certSelectedIds);
                      if (e.target.checked) s.add(t.id);
                      else s.delete(t.id);
                      setCertSelectedIds(s);
                    }} style={{ cursor:'pointer' }} />
                  </td>
                  <td style={{ fontWeight:500 }}>{t.name}{t.mandatory && <span className="badge badge--accent" style={{ fontSize:9, marginLeft:6 }}>Pflicht</span>}</td>
                  <td style={{ color:'var(--fg-2)', fontSize:12 }}>{t.cat}</td>
                  <td style={{ whiteSpace:'nowrap', fontSize:12 }}>{c.validFrom ? window.fmtDE(c.validFrom) : '—'}</td>
                  <td style={{ whiteSpace:'nowrap', fontSize:12, fontWeight: (status==='warn'||status==='expired') ? 600 : undefined, color: status==='warn'?'#8a6a1f':status==='expired'?'#a13232':undefined }}>
                    {c.expiresAt ? window.fmtDE(c.expiresAt) : '—'}
                  </td>
                  <td style={{ whiteSpace:'nowrap', fontSize:12 }}>
                    <span style={{ color: status==='expired'?'#a13232':status==='warn'?'#8a6a1f':'var(--fg-2)' }}>
                      {formatRemaining(c.expiresAt)}
                    </span>
                  </td>
                  <td><StatusBadge /></td>
                  <td style={{ textAlign:'center', whiteSpace:'nowrap' }}>
                    <button onClick={() => setCertPdfModal({ title: t.name, cat: t.cat, trainId: t.id })} title="Vorschau" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-2)', fontSize:14, padding:'4px' }}>👁</button>
                    <button onClick={() => {}} title="Bearbeiten" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-2)', fontSize:14, padding:'4px' }}>✏️</button>
                    <button onClick={() => {
                      if (status === 'warn' || status === 'expired') {
                        createMaintenanceItem(t.name, status);
                      }
                    }} title={status === 'warn' || status === 'expired' ? 'Zur Wartungsliste' : 'Noch nicht nötig'} style={{ background:'none', border:'none', cursor: (status === 'warn' || status === 'expired') ? 'pointer' : 'not-allowed', color: (status === 'warn' || status === 'expired') ? 'var(--fg-2)' : 'var(--fg-4)', fontSize:14, padding:'4px', opacity: (status === 'warn' || status === 'expired') ? 1 : 0.4 }}>📋</button>
                    <button onClick={() => {}} title="Löschen" style={{ background:'none', border:'none', cursor:'pointer', color:'#a13232', fontSize:14, padding:'4px' }}>🗑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>

      {/* PDF Modal */}
      {certPdfModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={() => setCertPdfModal(null)}>
          <div style={{ background:'white', borderRadius:12, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxWidth:600, maxHeight:'90vh', overflow:'auto', padding:32 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', color:'#999', marginBottom:6 }}>Janning-Gruppe · Zertifikat</div>
              <div style={{ fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#1a1a1a', lineHeight:1.3 }}>{certPdfModal.title}</div>
              <div style={{ fontSize:12, color:'#666', marginTop:6 }}>{certPdfModal.cat}</div>
            </div>
            <div style={{ background:'#f5f5f5', padding:40, borderRadius:8, textAlign:'center', color:'#999', marginBottom:20 }}>
              📄 PDF-Vorschau (Beispiel)
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setCertPdfModal(null)} style={{ flex:1, padding:'10px 16px', border:'1px solid var(--border-1)', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'inherit', background:'transparent' }}>Schließen</button>
              <button style={{ flex:1, padding:'10px 16px', background:'var(--color-accent)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500 }}>📥 Herunterladen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInstructions = () => (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr>
          <th>Unterweisung</th>
          <th>Version</th>
          <th>Datum</th>
          <th>Status</th>
          <th>Unterschrieben am</th>
          <th style={{ textAlign:'center' }}>PDF anzeigen</th>
        </tr></thead>
        <tbody>
          {myInstructions.map((u) => {
            const my = u.participants.find((p) => p.emp === me.id);
            const status = my?.signed ? 'signed' : 'warn';
            return (
              <tr key={u.id}>
                <td style={{ fontWeight:500 }}>{u.title}</td>
                <td style={{ color:'var(--fg-2)' }}>{u.version}</td>
                <td>{my?.date ? window.fmtDE(my.date) : '—'}</td>
                <td><Badge status={status} /></td>
                <td>{my?.signed ? window.fmtDE(my.date) : '—'}</td>
                <td style={{ textAlign:'center' }}><PdfBtn /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderHealth = () => (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr>
          <th>Untersuchung / Vorsorge</th>
          <th>Art</th>
          <th>Letzte Untersuchung</th>
          <th>Nächster Termin</th>
          <th>Status</th>
          <th style={{ textAlign:'center' }}>Bescheinigung anzeigen</th>
        </tr></thead>
        <tbody>
          {healthChecks.map((h) => (
            <tr key={h.id}>
              <td style={{ fontWeight:500 }}>{h.name}</td>
              <td style={{ color:'var(--fg-2)' }}>{h.type}</td>
              <td>{h.lastCheck}</td>
              <td>{h.nextCheck}</td>
              <td><Badge status={h.status} /></td>
              <td style={{ textAlign:'center' }}><PdfBtn label="Bescheinigung" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderJobDesc = () => (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr>
          <th>Stellenbeschreibung</th>
          <th>Position</th>
          <th>Firma</th>
          <th>Version</th>
          <th>Status</th>
          <th>Unterschrieben am</th>
          <th style={{ textAlign:'center' }}>Dokument anzeigen</th>
        </tr></thead>
        <tbody>
          {jobDescriptions.map((j) => (
            <tr key={j.id}>
              <td style={{ fontWeight:500 }}>{j.name}</td>
              <td style={{ color:'var(--fg-2)' }}>{j.position}</td>
              <td style={{ color:'var(--fg-2)' }}>{j.company}</td>
              <td>{j.version}</td>
              <td><Badge status={j.status} /></td>
              <td>{j.signed}</td>
              <td style={{ textAlign:'center' }}><PdfBtn label="Dokument" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBaustellen = () => {
    const employeeById = (id) => window.employee(id);
    if (myBaustellen.length === 0) {
      return (
        <div style={{ textAlign:'center', padding:42, color:'var(--fg-3)' }}>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:24, color:'var(--fg-1)', marginBottom:8 }}>Keine Baustelle freigegeben</div>
          <div className="small muted">Sobald der Bauleiter dich fuer eine Baustelle freigibt, siehst du hier Team, Alarmplan und Dokumente.</div>
        </div>
      );
    }
    return (
      <div style={{ display:'grid', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--color-warm-sand)', borderRadius:8, fontSize:13, color:'var(--fg-2)' }}>
          <Icon name="building" size={14} /> Freigegebene Baustelleninformationen vom Bauleiter.
        </div>
        {myBaustellen.map(site => {
          const team = (site.employeeIds || []).map(employeeById).filter(Boolean);
          const firstAid = team.find(emp => emp.name === site.vorarbeiter) || team[0];
          return (
            <div key={site.id} className="card card--pad" style={{ display:'grid', gap:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' }}>
                <div>
                  <div className="card__title">{site.name}</div>
                  <div className="card__sub">{site.projectNr} - {site.company}</div>
                </div>
                <span className="badge badge--valid"><span className="badge__dot" />Freigegeben</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:10 }}>
                <div className="kpi" style={{ padding:12 }}><div className="kpi__label">Bauleiter</div><div style={{ fontWeight:700 }}>{site.bauleiter}</div></div>
                <div className="kpi" style={{ padding:12 }}><div className="kpi__label">Vorarbeiter</div><div style={{ fontWeight:700 }}>{site.vorarbeiter}</div></div>
                <div className="kpi" style={{ padding:12 }}><div className="kpi__label">Ersthelfer</div><div style={{ fontWeight:700 }}>{firstAid?.name || '-'}</div></div>
                <div className="kpi" style={{ padding:12 }}><div className="kpi__label">Team</div><div style={{ fontWeight:700 }}>{team.length} Personen</div></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ border:'1px solid var(--border-1)', borderRadius:10, background:'white', overflow:'hidden' }}>
                  <div style={{ padding:'10px 12px', background:'var(--color-parchment)', fontWeight:800 }}>Baustellen-Daten</div>
                  <div style={{ padding:12, display:'grid', gap:8, fontSize:13 }}>
                    <div><strong>Projekt:</strong> {site.projectName}</div>
                    <div><strong>Auftraggeber:</strong> {site.auftraggeber}</div>
                    <div><strong>Adresse:</strong> {site.adresse}</div>
                  </div>
                </div>
                <div style={{ border:'1px solid var(--border-1)', borderRadius:10, background:'white', overflow:'hidden' }}>
                  <div style={{ padding:'10px 12px', background:'var(--color-parchment)', fontWeight:800 }}>Team</div>
                  <div style={{ padding:12, display:'grid', gap:8, maxHeight:190, overflow:'auto' }}>
                    {team.map(emp => <div key={emp.id} style={{ display:'flex', justifyContent:'space-between', gap:10, borderBottom:'1px solid var(--border-1)', paddingBottom:7 }}><span><strong>{emp.name}</strong><span className="small muted" style={{ display:'block' }}>{emp.position}</span></span><span className="small muted">{window.company(emp.company)?.short || emp.company}</span></div>)}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button className="btn btn--primary"><Icon name="doc" size={14} />Alarmplan PDF anzeigen</button>
                {['Baustellenaushang.pdf','Unterweisung-Baustelle.pdf','Verkehrssicherung-Plan.pdf'].map(doc => <button key={doc} className="btn btn--ghost"><Icon name="doc" size={14} />{doc}</button>)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const renderAppointments = () => {
    // Kombinierte Termine aus allen Bereichen — in echtem System vom Admin befüllt
    const appointments = [
      { id: 'a1', date: '2026-05-12', time: '08:00', title: 'Erste Hilfe Auffrischung', type: 'Schulung',      location: 'BiW Bildungszentrum, Lingen',   status: 'geplant',        note: '' },
      { id: 'a2', date: '2026-05-28', time: '09:00', title: 'SCC Dok. 017',             type: 'Schulung',      location: 'DEKRA Akademie, Osnabrück',     status: 'geplant',        note: '' },
      { id: 'a3', date: '2026-04-22', time: '07:30', title: 'Jahresunterweisung 2026',  type: 'Unterweisung',  location: 'Janning Tiefbau, Nordhorn',     status: 'teilgenommen',   note: 'Unterschrieben 22.04.2026' },
      { id: 'a4', date: '2026-06-10', time: '10:00', title: 'G26 Atemschutz',           type: 'Untersuchung',  location: 'Betriebsarzt Dr. Kemper',       status: 'geplant',        note: '' },
      { id: 'a5', date: '2026-03-15', time: '08:00', title: 'Brandschutzhelfer',        type: 'Schulung',      location: 'Intern · Nordhorn',             status: 'teilgenommen',   note: 'Zertifikat ausgestellt' },
      { id: 'a6', date: '2026-07-01', time: '09:00', title: 'Führerscheinkontrolle C',  type: 'Führerschein',  location: 'Fuhrpark Janning, Nordhorn',    status: 'geplant',        note: '' },
      { id: 'a7', date: '2026-02-10', time: '14:00', title: 'PSA gegen Absturz',        type: 'Schulung',      location: 'BG BAU, Berlin',                status: 'nicht teilgenommen', note: 'Krank gemeldet' },
    ].sort((a, b) => a.date.localeCompare(b.date));

    const statusCfgA = {
      'geplant':            { color: '#2d6fa3', bg: '#e8f1fb', border: '#bcd3ee', label: 'Geplant' },
      'teilgenommen':       { color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf', label: 'Teilgenommen' },
      'nicht teilgenommen': { color: '#a13232', bg: '#fbecea', border: '#eac8c2', label: 'Nicht teilgenommen' },
      'nachholen':          { color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc', label: 'Nachholen' },
    };

    const typeCfg = {
      'Schulung':    { bg: '#e8f0fd', color: '#1f5fa8' },
      'Unterweisung':{ bg: '#fdf3e0', color: '#8a6a1f' },
      'Untersuchung':{ bg: '#f3eef8', color: '#6b4fa8' },
      'Führerschein':{ bg: '#e8f5eb', color: '#3f7a4a' },
    };

    const ApptBadge = ({ status }) => {
      const s = statusCfgA[status] || statusCfgA['geplant'];
      return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px',
          borderRadius:999, fontSize:11.5, fontWeight:500, background:s.bg,
          border:'1px solid '+s.border, color:s.color, whiteSpace:'nowrap' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:s.color, flexShrink:0 }}></span>
          {s.label}
        </span>
      );
    };

    const TypeChip = ({ type }) => {
      const t = typeCfg[type] || { bg:'#f0f0f0', color:'#666' };
      return (
        <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:600, background:t.bg, color:t.color }}>{type}</span>
      );
    };

    const upcoming = appointments.filter(a => a.status === 'geplant');
    const past     = appointments.filter(a => a.status !== 'geplant');

    const AppTable = ({ rows, emptyMsg }) => rows.length === 0 ? (
      <div className="small muted" style={{ padding:'12px 0', textAlign:'center' }}>{emptyMsg}</div>
    ) : (
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>Termin</th>
            <th>Titel</th>
            <th>Typ</th>
            <th>Ort</th>
            <th>Status</th>
            <th>Aktion</th>
          </tr></thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight:600, fontFamily:'var(--font-serif)', fontSize:15 }}>
                    {new Date(a.date).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' })}
                  </div>
                  <div className="small muted">{a.time} Uhr</div>
                </td>
                <td>
                  <div style={{ fontWeight:500 }}>{a.title}</div>
                  {a.note && <div className="small muted" style={{ marginTop:2 }}>{a.note}</div>}
                </td>
                <td><TypeChip type={a.type} /></td>
                <td><span className="small muted">{a.location}</span></td>
                <td><ApptBadge status={a.status} /></td>
                <td>
                  <button className="btn btn--ghost" style={{ fontSize:12, padding:'4px 10px' }}>
                    <Icon name="doc" size={13} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    return (
      <div>
        {/* Info Banner */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--color-warm-sand)', borderRadius:8, marginBottom:20, fontSize:13, color:'var(--fg-2)' }}>
          <Icon name="cal" size={14} />
          Termine werden automatisch angezeigt, sobald der Admin dich im Schulungskalender als Teilnehmer einträgt.
        </div>

        {/* Upcoming */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:0.6, textTransform:'uppercase', color:'var(--color-accent)', marginBottom:12 }}>
            Bevorstehende Termine — {upcoming.length}
          </div>
          <AppTable rows={upcoming} emptyMsg="Keine bevorstehenden Termine." />
        </div>

        {/* Past */}
        <div>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:0.6, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:12 }}>
            Vergangene Termine — {past.length}
          </div>
          <AppTable rows={past} emptyMsg="Keine vergangenen Termine." />
        </div>
      </div>
    );
  };

  const renderLicense = () => {
    const approved = licenseChecks.filter(l => l.adminApproved);
    const licStatusCfg = {
      valid:   { color: '#3f7a4a', bg: '#eff5ed', border: '#cde1cf', label: 'Gültig',           dot: '#3f7a4a' },
      warn:    { color: '#8a6a1f', bg: '#faf3de', border: '#ece0bc', label: 'Läuft bald ab',    dot: '#8a6a1f' },
      expired: { color: '#a13232', bg: '#fbecea', border: '#eac8c2', label: 'Abgelaufen',        dot: '#a13232' },
      missing: { color: '#888',    bg: '#f4f4f2', border: '#ddd',    label: 'Kein Nachweis',     dot: '#aaa' },
    };
    const LicBadge = ({ status }) => {
      const s = licStatusCfg[status] || licStatusCfg.missing;
      return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px',
          borderRadius:999, fontSize:11.5, fontWeight:500, background:s.bg,
          border:'1px solid '+s.border, color:s.color, whiteSpace:'nowrap' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }}></span>
          {s.label}
        </span>
      );
    };
    return (
      <div>
        {/* Info-Banner */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--color-warm-sand)', borderRadius:8, marginBottom:16, fontSize:13, color:'var(--fg-2)' }}>
          <Icon name="shield" size={14} />
          Nur vom Admin freigegebene Führerscheinklassen werden angezeigt. Nicht freigegebene Einträge sind ausgeblendet.
        </div>

        {approved.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--fg-3)' }}>
            <div className="small muted">Keine freigegebenen Führerscheindaten vorhanden.</div>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>
                <th>Führerscheinklasse</th>
                <th>Letzte Kontrolle</th>
                <th>Nächste Kontrolle</th>
                <th>Status</th>
                <th>Dokument</th>
              </tr></thead>
              <tbody>
                {approved.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:'#2a2a28', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-serif)', fontSize:14, fontWeight:600, flexShrink:0 }}>{l.class}</div>
                        <div>
                          <div style={{ fontWeight:500 }}>Klasse {l.class}</div>
                          <div className="small muted">{l.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="num">{l.lastCheck || '—'}</td>
                    <td className="num">{l.nextCheck || '—'}</td>
                    <td><LicBadge status={l.status} /></td>
                    <td>
                      {l.doc ? (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn--ghost" style={{ fontSize:12, padding:'4px 10px' }}>
                            <Icon name="doc" size={13} /> Ansehen
                          </button>
                          <button className="btn btn--ghost" style={{ fontSize:12, padding:'4px 10px' }}>
                            <Icon name="download" size={13} /> Download
                          </button>
                        </div>
                      ) : (
                        <span className="small muted">Kein Dokument</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'certificates': return renderCertificates();
      case 'instructions': return renderInstructions();
      case 'health':       return renderHealth();
      case 'jobdesc':      return renderJobDesc();
      case 'license':      return renderLicense();
      case 'maintenance':  return renderMaintenance();
      case 'appointments': return renderAppointments();
      default: return null;
    }
  };

  const renderMaintenance = () => {
    const items = myMaintenanceItems;
    const typeCfg = {
      zertifikat:        { color: '#2d6fa3', label: 'Zertifikat' },
      unterweisung:      { color: '#3f7a4a', label: 'Unterweisung' },
      stellenbeschreibung: { color: '#6a4fb5', label: 'Stellenbeschreibung' },
      untersuchung:      { color: '#c96442', label: 'Untersuchung' },
    };
    const TypeChip = ({ type }) => {
      const t = typeCfg[type] || { color:'var(--fg-2)', label: type };
      return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px',
          borderRadius:999, fontSize:11, fontWeight:500,
          background: t.color + '18', color: t.color, border:'1px solid '+t.color+'33', whiteSpace:'nowrap' }}>
          {t.label}
        </span>
      );
    };

    if (items.length === 0) {
      return (
        <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--fg-3)' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>Keine freigegebenen Wartungen</div>
          <div style={{ fontSize:13 }}>Sobald der Admin Wartungseinträge freigegeben hat, erscheinen sie hier.</div>
        </div>
      );
    }

    return (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
        {items.map(item => (
          <div key={item.id} style={{
            background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:12, padding:16,
            boxShadow:'0 1px 3px rgba(0,0,0,0.08)', transition:'all 200ms'
          }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--fg-1)' }}>{item.schulung}</div>
                <div style={{ fontSize:12, color:'var(--fg-3)', marginTop:2 }}>{item.company}</div>
              </div>
              <TypeChip type={item.type} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:12, marginBottom:12, paddingTop:12, borderTop:'1px solid var(--border-1)' }}>
              <div>
                <div style={{ color:'var(--fg-3)', fontSize:10, marginBottom:2 }}>Termin</div>
                <div style={{ fontWeight:500, color:'var(--fg-1)' }}>{item.datum}</div>
              </div>
              <div>
                <div style={{ color:'var(--fg-3)', fontSize:10, marginBottom:2 }}>Freigegeben am</div>
                <div style={{ fontWeight:500, color:'var(--fg-1)' }}>{item.erledigtAm}</div>
              </div>
            </div>
            {item.notiz && (
              <div style={{ background:'var(--color-parchment)', padding:10, borderRadius:8, marginBottom:12, fontSize:12, color:'var(--fg-2)' }}>
                <strong>Notiz:</strong> {item.notiz}
              </div>
            )}
            <button style={{
              width:'100%', padding:'8px 12px', background:'var(--color-accent)', color:'white',
              border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit'
            }}>
              📥 Document herunterladen
            </button>
          </div>
        ))}
      </div>
    );
  };

  // ── chat status ─────────────────────────────────────────────────────────────
  const [chatStatus, setChatStatus] = React.useState('active');
  const [showChatMenu, setShowChatMenu] = React.useState(false);

  // ── modals ─────────────────────────────────────────────────────────────────
  const MessageModal = () => {
    const [deletable, setDeletable] = React.useState({});
    const markDeletable = (idx) => {
      setDeletable(d => ({ ...d, [idx]: true }));
      setTimeout(() => setDeletable(d => { const c = {...d}; delete c[idx]; return c; }), 120000);
    };
    const deleteMsg = (idx) => {
      setMessages(ms => ms.map((m, i) => i === idx ? { ...m, deleted: true } : m));
    };

    if (chatStatus === 'hidden') return (
      <div style={{ position:'fixed', bottom:96, right:24, zIndex:1000 }}>
        <div style={{ background:'var(--color-ivory)', borderRadius:12, padding:'12px 16px', boxShadow:'0 4px 20px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:13, color:'var(--fg-2)' }}>Chat ist ausgeblendet</span>
          <button className="btn btn--ghost" style={{ fontSize:12, padding:'3px 10px' }} onClick={() => setChatStatus('active')}>Einblenden</button>
          <button onClick={() => setShowMessage(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)' }}><Icon name="x" size={14} /></button>
        </div>
      </div>
    );

    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex',
        alignItems:'flex-end', justifyContent:'flex-end', zIndex:1000, padding:'0 24px 96px 0' }}
        onClick={() => setShowChatMenu(false)}>
        <div style={{ width:360, background:'var(--color-ivory)', borderRadius:16,
          boxShadow:'0 12px 40px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column', maxHeight:520 }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderBottom:'1px solid var(--border-1)', position:'relative' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--color-terracotta)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:500, fontSize:13 }}>Nachricht an Admin</div>
              <div style={{ fontSize:11, color:'var(--fg-3)' }}>
                Sabine Janning · Support
                {chatStatus === 'archived' && <span style={{ marginLeft:6, color:'#8a6a1f', fontWeight:600 }}>· Archiviert</span>}
                {chatStatus === 'done'     && <span style={{ marginLeft:6, color:'#3f7a4a', fontWeight:600 }}>· Erledigt</span>}
              </div>
            </div>
            {/* ⋮ Menu */}
            <div style={{ position:'relative' }}>
              <button onClick={() => setShowChatMenu(m => !m)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:'4px 6px', borderRadius:4 }}
                title="Chat-Optionen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              {showChatMenu && (
                <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', background:'var(--color-white)', border:'1px solid var(--border-1)', borderRadius:10, boxShadow:'0 6px 20px rgba(0,0,0,0.12)', zIndex:10, minWidth:210, padding:4 }}
                  onClick={e => e.stopPropagation()}>
                  {[
                    { id:'hidden',   icon:'eye',     label:'Chat ausblenden',        sub:'Nur für dich sichtbar' },
                    { id:'archived', icon:'history', label:'Chat archivieren',        sub:'Bleibt im Verlauf' },
                    { id:'done',     icon:'check',   label:'Als erledigt markieren',  sub:'Admin behält Zugriff' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => { setChatStatus(opt.id); setShowChatMenu(false); }}
                      style={{ display:'flex', alignItems:'flex-start', gap:10, width:'100%', padding:'9px 12px',
                        background: chatStatus===opt.id ? 'var(--color-parchment)' : 'transparent',
                        border:'none', borderRadius:8, cursor:'pointer', textAlign:'left' }}>
                      <div style={{ marginTop:1, color:'var(--fg-2)' }}><Icon name={opt.icon} size={14} /></div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'var(--fg-1)' }}>{opt.label}</div>
                        <div style={{ fontSize:11, color:'var(--fg-3)' }}>{opt.sub}</div>
                      </div>
                      {chatStatus===opt.id && <div style={{ marginLeft:'auto', color:'var(--color-accent)' }}><Icon name="check" size={13} /></div>}
                    </button>
                  ))}
                  <div style={{ borderTop:'1px solid var(--border-1)', margin:'4px 0' }} />
                  <div style={{ padding:'6px 12px 4px', fontSize:10.5, color:'var(--fg-3)', display:'flex', alignItems:'center', gap:5 }}>
                    <Icon name="shield" size={11} /> Admin hat immer Zugriff auf den vollständigen Verlauf
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => { setShowMessage(false); setShowChatMenu(false); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:4, borderRadius:4 }}>
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Status banner */}
          {chatStatus !== 'active' && (
            <div style={{ padding:'8px 14px', background: chatStatus==='done' ? '#eff5ed' : '#fdf3e0', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
              <span style={{ fontSize:12, color: chatStatus==='done' ? '#3f7a4a' : '#8a6a1f', fontWeight:500 }}>
                {chatStatus==='archived' ? '📁 Chat archiviert' : '✅ Als erledigt markiert'}
              </span>
              <button style={{ fontSize:11, background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', textDecoration:'underline' }} onClick={() => setChatStatus('active')}>Zurücksetzen</button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', justifyContent: msg.from==='me' ? 'flex-end' : 'flex-start' }}>
                {msg.typing ? (
                  <div style={{ background:'var(--color-parchment)', borderRadius:'12px 12px 12px 2px', padding:'8px 14px', fontSize:13, color:'var(--fg-3)' }}>…</div>
                ) : msg.deleted ? (
                  <div style={{ borderRadius:'12px 12px 2px 12px', padding:'7px 12px', fontSize:12, color:'var(--fg-3)', fontStyle:'italic', border:'1px dashed var(--border-1)' }}>Nachricht gelöscht</div>
                ) : (
                  <div style={{ maxWidth:'82%' }}
                    onMouseEnter={() => msg.from==='me' && markDeletable(i)}>
                    {msg.bezug && (
                      <div style={{ marginBottom:3, display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:6, fontSize:10.5, fontWeight:600, background:'#e8f0fd', color:'#1f5fa8', border:'1px solid #c5d8f5' }}>
                        <Icon name="doc" size={10} /> {msg.bezug}
                      </div>
                    )}
                    <div style={{
                      background: msg.from==='me' ? 'var(--color-terracotta)' : 'var(--color-parchment)',
                      color: msg.from==='me' ? 'white' : 'var(--fg-1)',
                      borderRadius: msg.from==='me' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding:'8px 12px', fontSize:13, lineHeight:1.45,
                    }}>{msg.text}</div>
                    <div style={{ fontSize:10.5, color:'var(--fg-3)', marginTop:3, display:'flex', alignItems:'center', gap:6, justifyContent: msg.from==='me' ? 'flex-end' : 'flex-start' }}>
                      <span>{msg.time}</span>
                      {msg.from==='me' && deletable[i] && (
                        <button onClick={() => deleteMsg(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a13232', fontSize:10.5, padding:0, textDecoration:'underline' }}>
                          Löschen
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Bezug-Selektor */}
          <div style={{ padding:'8px 12px 0', borderTop:'1px solid var(--border-1)' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:4 }}>Bezug (optional)</div>
            <select
              value={chatBezug}
              onChange={e => setChatBezug(e.target.value)}
              style={{ width:'100%', padding:'6px 10px', fontSize:12.5, border:'1px solid var(--border-1)', borderRadius:7, background:'var(--color-parchment)', fontFamily:'inherit', color: chatBezug ? 'var(--fg-1)' : 'var(--fg-3)', cursor:'pointer' }}>
              <option value="">— Kein Bezug —</option>
              <optgroup label="Zertifikate">
                {myCerts.map(({ training: t }) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </optgroup>
              <optgroup label="Allgemein">
                <option value="Jahresunterweisung">Jahresunterweisung</option>
                <option value="Führerscheinkontrolle">Führerscheinkontrolle</option>
                <option value="Untersuchungsvorsorge">Untersuchungsvorsorge</option>
                <option value="Sonstiges">Sonstiges</option>
              </optgroup>
            </select>
          </div>

          {/* Input */}
          <div style={{ display:'flex', gap:8, padding:'8px 12px 10px', alignItems:'flex-end' }}>
            <textarea rows={1} placeholder="Nachricht schreiben…" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{ flex:1, resize:'none', border:'1px solid var(--border-1)', borderRadius:8, padding:'8px 10px', fontSize:13, fontFamily:'inherit', background:'white', outline:'none' }} />
            <button onClick={sendMessage} disabled={!draft.trim()}
              style={{ width:34, height:34, borderRadius:'50%', border:'none', cursor:'pointer',
                background: draft.trim() ? 'var(--color-terracotta)' : 'var(--border-1)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 150ms' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UploadModal = () => {
    const [uStep, setUStep] = React.useState('type');   // type → form → uploading → done
    const [docType, setDocType] = React.useState(null);
    const [uFiles, setUFiles] = React.useState([]);
    const addFiles = (fileList) => {
      const arr = Array.from(fileList);
      setUFiles(prev => {
        const existing = prev.map(f => f.name);
        return [...prev, ...arr.filter(f => !existing.includes(f.name))];
      });
    };
    const [uDrag, setUDrag] = React.useState(false);
    const uFileRef = React.useRef(null);
    const [uProgress, setUProgress] = React.useState(0);
    const [form, setForm] = React.useState({ titel: '', kategorie: '', ausstellungsdatum: '', ablaufdatum: '' });

    const closeAll = () => { setShowUpload(false); };

    const docTypes = [
      { id: 'cert',    label: 'Meine Zertifikate',         icon: 'doc',     color: '#1f5fa8', bg: '#e8f0fd' },
      { id: 'instr',   label: 'Meine Unterweisungen',      icon: 'flag',    color: '#8a6a1f', bg: '#fdf3e0' },
      { id: 'health',  label: 'Meine Untersuchungsvorsorge', icon: 'shield', color: '#6b4fa8', bg: '#f3eef8' },
      { id: 'job',     label: 'Meine Stellenbeschreibung', icon: 'doc',     color: '#3f7a4a', bg: '#eff5ed' },
      { id: 'license', label: 'Mein Führerschein',         icon: 'cap',     color: '#a13232', bg: '#fbeaea' },
    ];

    const kategorien = {
      cert:    ['Sicherheit', 'SCC', 'DVGW', 'Fahrerlaubnis', 'Unterweisung', 'Sonstiges'],
      instr:   ['Jahresunterweisung', 'Brandschutz', 'Arbeitssicherheit', 'Sonstiges'],
      health:  ['G26 Atemschutz', 'G37 Lärm', 'G37 Bildschirm', 'Eignungsuntersuchung', 'Sonstiges'],
      job:     ['Stellenbeschreibung', 'Arbeitsvertrag', 'Sonstiges'],
      license: ['Klasse B', 'Klasse BE', 'Klasse C', 'Klasse CE', 'Klasse T', 'Sonstiges'],
    };

    const simulateUpl = () => {
      setUStep('uploading');
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random() * 22 + 6;
        if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setUStep('done'), 400); }
        setUProgress(Math.min(p, 100));
      }, 160);
    };

    const sel = docTypes.find(d => d.id === docType);

    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex',
        alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
        onClick={closeAll}>
        <div style={{ width: uStep === 'type' ? 460 : 480, background:'var(--color-ivory)', borderRadius:16,
          boxShadow:'0 12px 40px rgba(0,0,0,0.2)', overflow:'hidden', maxHeight:'90vh', display:'flex', flexDirection:'column' }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'16px 20px', borderBottom:'1px solid var(--border-1)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {uStep === 'form' && (
                <button onClick={() => setUStep('type')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:4, display:'flex' }}>
                  <Icon name="chevL" size={16} />
                </button>
              )}
              <div>
                <div style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500 }}>
                  {uStep === 'type' ? 'Dokument hochladen' : uStep === 'form' ? sel?.label : uStep === 'uploading' ? 'Wird übermittelt…' : 'Eingereicht'}
                </div>
                {uStep === 'form' && <div className="small muted" style={{ marginTop:1 }}>Formular ausfüllen</div>}
              </div>
            </div>
            <button onClick={closeAll} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:4 }}>
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Step indicator */}
          {(uStep === 'type' || uStep === 'form') && (
            <div style={{ display:'flex', padding:'10px 20px', gap:6, borderBottom:'1px solid var(--border-1)', flexShrink:0 }}>
              {['type','form'].map((s, i) => (
                <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {i > 0 && <div style={{ width:20, height:1, background:'var(--border-1)' }}></div>}
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                      background: uStep === s ? 'var(--color-accent)' : (uStep === 'form' && s === 'type') ? '#3f7a4a' : 'var(--border-1)',
                      color: (uStep === s || (uStep === 'form' && s === 'type')) ? '#fff' : 'var(--fg-3)' }}>
                      {(uStep === 'form' && s === 'type') ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize:12, color: uStep === s ? 'var(--fg-1)' : 'var(--fg-3)', fontWeight: uStep === s ? 600 : 400 }}>
                      {s === 'type' ? 'Dokumenttyp' : 'Formular & Datei'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <div style={{ padding:'20px', overflowY:'auto', flex:1 }}>

            {/* STEP 1: Typ-Auswahl */}
            {uStep === 'type' && (
              <div>
                <div className="small muted" style={{ marginBottom:14 }}>Welchen Dokumenttyp möchtest du hochladen?</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {docTypes.map(d => (
                    <button key={d.id} onClick={() => { setDocType(d.id); setUStep('form'); }}
                      style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
                        background: docType === d.id ? d.bg : 'var(--color-white)',
                        border: `1.5px solid ${docType === d.id ? d.color : 'var(--border-1)'}`,
                        borderRadius:10, cursor:'pointer', textAlign:'left', transition:'all 120ms',
                        width:'100%' }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:d.bg, color:d.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon name={d.icon} size={18} />
                      </div>
                      <div style={{ fontWeight:500, fontSize:14, color:'var(--fg-1)' }}>{d.label}</div>
                      <div style={{ marginLeft:'auto', color:'var(--fg-3)' }}><Icon name="chevR" size={14} /></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Formular */}
            {uStep === 'form' && (
              <div>
                {/* Typ-Badge */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, padding:'8px 12px', background:sel?.bg, borderRadius:8 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:sel?.bg, color:sel?.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name={sel?.icon} size={14} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:sel?.color }}>{sel?.label}</span>
                </div>

                {/* Felder */}
                <label style={{ display:'block', marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>
                    {docType === 'license' ? 'Führerscheinklasse' : 'Titel / Bezeichnung'}
                  </div>
                  <input value={form.titel} onChange={e => setForm({...form, titel: e.target.value})}
                    placeholder={docType === 'license' ? 'z. B. Klasse C' : 'z. B. SCC Dok. 016'}
                    style={{ width:'100%', padding:'9px 12px', fontSize:14, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', boxSizing:'border-box' }} />
                </label>

                <label style={{ display:'block', marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>Kategorie</div>
                  <select value={form.kategorie} onChange={e => setForm({...form, kategorie: e.target.value})}
                    style={{ width:'100%', padding:'9px 12px', fontSize:14, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', boxSizing:'border-box' }}>
                    <option value="">— bitte wählen —</option>
                    {(kategorien[docType] || []).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </label>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <label>
                    <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>Ausstellungsdatum</div>
                    <input type="date" value={form.ausstellungsdatum} onChange={e => setForm({...form, ausstellungsdatum: e.target.value})}
                      style={{ width:'100%', padding:'9px 12px', fontSize:14, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', boxSizing:'border-box' }} />
                  </label>
                  <label>
                    <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>Ablaufdatum</div>
                    <input type="date" value={form.ablaufdatum} onChange={e => setForm({...form, ablaufdatum: e.target.value})}
                      style={{ width:'100%', padding:'9px 12px', fontSize:14, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', boxSizing:'border-box' }} />
                  </label>
                </div>

                {/* File drop */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>Datei hochladen</div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setUDrag(true); }}
                    onDragLeave={() => setUDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setUDrag(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
                    onClick={() => uFileRef.current?.click()}
                    style={{ border:`2px dashed ${uDrag ? 'var(--color-terracotta)' : 'var(--border-1)'}`,
                      borderRadius:10, padding: uFiles.length ? '12px 16px' : '24px 16px', textAlign:'center', cursor:'pointer',
                      background: uDrag ? 'rgba(201,100,66,0.04)' : 'var(--color-parchment)', transition:'all 150ms' }}>
                    <input ref={uFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{ display:'none' }}
                      onChange={e => { if (e.target.files?.length) addFiles(e.target.files); }} />
                    {uFiles.length > 0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%' }}>
                        {uFiles.map((f, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--color-white)', borderRadius:6, padding:'6px 10px' }}>
                            <Icon name="doc" size={14} />
                            <div style={{ flex:1, textAlign:'left', fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                            <span className="small muted" style={{ fontSize:11, flexShrink:0 }}>{(f.size/1024).toFixed(0)} KB</span>
                            <button onClick={e => { e.stopPropagation(); setUFiles(prev => prev.filter((_,j)=>j!==i)); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', flexShrink:0 }}><Icon name="x" size={12} /></button>
                          </div>
                        ))}
                        <button onClick={e => { e.stopPropagation(); uFileRef.current?.click(); }}
                          style={{ fontSize:11, color:'var(--color-accent)', background:'none', border:'1px dashed var(--border-1)', borderRadius:6, padding:'5px', cursor:'pointer', marginTop:2 }}>
                          + Weitere Dateien hinzufügen
                        </button>
                      </div>
                    ) : (
                      <>
                        <Icon name="upload" size={22} />
                        <div style={{ fontWeight:500, marginTop:6, fontSize:13 }}>Datei hierher ziehen oder klicken</div>
                        <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:2 }}>PDF, JPG, PNG · max. 10 MB</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Status — read only */}
                <div style={{ padding:'10px 14px', background:'var(--color-warm-sand)', borderRadius:8, display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11.5, fontWeight:500, background:'#fdf3e0', border:'1px solid #ece0bc', color:'#8a6a1f' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#8a6a1f' }}></span>
                    Warte auf Bestätigung Admin
                  </span>
                  <span className="small muted">— wird automatisch gesetzt</span>
                </div>
              </div>
            )}

            {/* STEP 3: Uploading */}
            {uStep === 'uploading' && (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontWeight:500, marginBottom:16, fontSize:14 }}>Dokument wird übermittelt…</div>
                <div style={{ height:6, background:'var(--border-1)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'var(--color-terracotta)', borderRadius:99, width:uProgress+'%', transition:'width 150ms' }}></div>
                </div>
                <div style={{ marginTop:8, fontSize:12, color:'var(--fg-3)' }}>{Math.round(uProgress)}%</div>
              </div>
            )}

            {/* STEP 4: Done */}
            {uStep === 'done' && (
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#eff5ed', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Icon name="check" size={26} />
                </div>
                <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500, marginBottom:6 }}>Eingereicht!</div>
                <div style={{ fontSize:13, color:'var(--fg-2)', lineHeight:1.6, marginBottom:20 }}>
                  Dein{uFiles.length > 1 ? 'e ' + uFiles.length + ' Dokumente wurden' : ' Dokument wurde'} an den Admin weitergeleitet.<br />
                  Nach Genehmigung erscheint es automatisch in deiner Liste.
                </div>
                <div style={{ padding:'10px 14px', background:'var(--color-warm-sand)', borderRadius:8, fontSize:12, color:'var(--fg-2)', marginBottom:20 }}>
                  <strong>Status:</strong> Warte auf Bestätigung Admin
                </div>
                <button className="btn btn--primary" onClick={closeAll} style={{ width:'100%' }}>Schließen</button>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          {uStep === 'form' && (
            <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border-1)', display:'flex', gap:10, flexShrink:0 }}>
              <button className="btn btn--ghost" onClick={() => setUStep('type')} style={{ flex:1 }}>Zurück</button>
              <button className="btn btn--primary" onClick={simulateUpl}
                disabled={!form.titel || uFiles.length === 0}
                style={{ flex:2, opacity: (!form.titel || uFiles.length === 0) ? 0.5 : 1 }}>
                <Icon name="upload" size={14} /> Absenden
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hero banner */}
      <div className="portal-hero" style={{
        background: 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 60%, #2e1f18 100%)',
        padding: '14px 28px', minHeight: 'auto', height: '88px', overflow: 'hidden',
        borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
      }}>
        <div>
          <div style={{ fontSize:10.5, letterSpacing:0.8, textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:3 }}>Mein Portal</div>
          <div className="portal-hero__greet" style={{ color: '#fff', textShadow:'0 1px 8px rgba(0,0,0,0.3)' }}>Hallo, {me.firstName}.</div>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(145deg, #c96442 0%, #8a3a1a 100%)',
          boxShadow: '0 0 0 2.5px rgba(201,100,66,0.35), 0 4px 16px rgba(201,100,66,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700,
          letterSpacing: 0.5,
        }}>{me.initials}</div>
      </div>

      {/* Alert bar */}


      {/* Stats row — kompakt/flach */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Gültige Schulungen', val: validCount,            color:'var(--fg-1)',  filter:'valid'    },
          { label:'Laufen bald ab',     val: warnCount,             color:'#8a6a1f',      filter:'warn'     },
          { label:'Abgelaufen',         val: expiredCount,          color:'#a13232',      filter:'expired'  },
          { label:'Fehlt (Pflicht)',     val: missingCount,          color:'#a13232',      filter:'missing'  },
        ].map(({ label, val, color, filter }) => (
          <button key={label}
            onClick={() => { if (filter) { setActiveTab('certificates'); setCertFilter(filter); } else { setActiveTab('instructions'); } }}
            style={{ textAlign:'left', background:'var(--color-white)', border:'1px solid var(--border-1)',
              borderRadius:10, padding:'10px 16px', cursor:'pointer', fontFamily:'inherit',
              transition:'box-shadow 120ms, border-color 120ms',
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor='var(--color-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border-1)'; }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.6, textTransform:'uppercase', color:'var(--fg-3)' }}>{label}</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:500, color, lineHeight:1 }}>{val}</div>
          </button>
        ))}
      </div>

      {/* Active filter tags */}
      {(() => {
        const AREA_LABELS = { certificates:'Zertifikate', instructions:'Unterweisungen', health:'Untersuchungsvorsorge', jobdesc:'Stellenbeschreibung', license:'Führerschein', sites:'Baustellen' };
        const STATUS_LABELS = { valid:'Gültig', warn:'Läuft bald ab', expired:'Abgelaufen' };
        const tags = [
          ...ss.areas.map(a => ({ key:'area:'+a, label: AREA_LABELS[a] || a, onRemove: () => setSearch(s => ({...s, areas: s.areas.filter(x=>x!==a)})) })),
          ...ss.status.map(st => ({ key:'status:'+st, label:'Status: '+(STATUS_LABELS[st]||st), onRemove: () => setSearch(s => ({...s, status: s.status.filter(x=>x!==st)})) })),
          ...(ss.dateFrom ? [{ key:'from', label:'Ab: '+ss.dateFrom, onRemove: () => setSearch(s => ({...s, dateFrom:''})) }] : []),
          ...(ss.dateTo   ? [{ key:'to',   label:'Bis: '+ss.dateTo,  onRemove: () => setSearch(s => ({...s, dateTo:''})) }] : []),
          ...(ss.query    ? [{ key:'q',    label:'Suche: "'+ss.query+'"', onRemove: () => setSearch(s => ({...s, query:''})) }] : []),
        ];
        if (tags.length === 0) return null;
        return (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14, alignItems:'center' }}>
            <span style={{ fontSize:11, color:'var(--fg-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Filter:</span>
            {tags.map(tag => (
              <span key={tag.key} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500, background:'var(--color-parchment)', border:'1px solid var(--border-1)', color:'var(--fg-1)' }}>
                {tag.label}
                <button onClick={tag.onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:0, lineHeight:1, display:'flex', alignItems:'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            ))}
            <button onClick={() => setSearch({ query:'', areas:[], status:[], dateFrom:'', dateTo:'' })}
              style={{ fontSize:11, background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', textDecoration:'underline', fontFamily:'inherit', marginLeft:4 }}>
              Alle zurücksetzen
            </button>
          </div>
        );
      })()}

      {/* Tab bar — ausgeblendete Bereiche wenn Filter aktiv */}
      {(() => {
        const visibleTabs = ss.areas.length > 0 ? tabs.filter(t => ss.areas.includes(t.id) || t.id === 'appointments') : tabs;
        // Ensure activeTab is visible
        if (ss.areas.length > 0 && !visibleTabs.find(t => t.id === activeTab)) {
          // Switch to first visible area tab
          const first = visibleTabs[0];
          if (first) setTimeout(() => setActiveTab(first.id), 0);
        }
        return (
          <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border-1)', marginBottom:20, overflowX:'auto', WebkitOverflowScrolling:'touch', scrollbarWidth:'none', msOverflowStyle:'none', flexWrap:'nowrap' }}>
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCertFilter(null); }}
                style={{
                  padding:'10px 18px', border:'none', background:'transparent',
                  color: activeTab===tab.id ? 'var(--fg-1)' : 'var(--fg-3)',
                  fontSize:13.5, fontWeight: activeTab===tab.id ? 600 : 400, cursor:'pointer',
                  borderBottom: activeTab===tab.id ? '2px solid var(--color-terracotta)' : '2px solid transparent',
                  marginBottom:'-1px', fontFamily:'inherit', whiteSpace:'nowrap', transition:'all 120ms',
                }}>
                {tab.label}
                <span style={{ marginLeft:5, fontSize:11, color:'var(--fg-3)', fontWeight:400, background:'var(--color-parchment)', padding:'1px 6px', borderRadius:99 }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        );
      })()}

      {/* Tab content */}
      <div style={{ marginBottom:80 }}>
        {renderTabContent()}
      </div>

      {/* Speed-Dial FAB */}
      {(() => {
        const [fabOpen, setFabOpen] = React.useState(false);
        const [showTrainingReq, setShowTrainingReq] = React.useState(false);
        const [trainingReqSent, setTrainingReqSent] = React.useState(false);
        const [reqForm, setReqForm] = React.useState({ schulung: '', grund: '', wunschtermin: '' });

        const actions = [
          { label: 'Dokument hochladen', icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          ), color:'var(--color-near-black)', shadow:'rgba(0,0,0,0.2)', action: () => { setShowUpload(true); setFabOpen(false); } },
          { label: 'Nachricht an Admin', icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ), color:'var(--color-terracotta)', shadow:'rgba(201,100,66,0.35)', action: () => { openMessage(); setFabOpen(false); }, badge: unread > 0 ? unread : null },
          { label: 'Schulung anfragen', icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          ), color:'#2d6fa3', shadow:'rgba(45,111,163,0.35)', action: () => { setShowTrainingReq(true); setFabOpen(false); } },
        ];

        return (
          <>
            <style>{`@keyframes fabIn { from{opacity:0;transform:translateY(10px) scale(0.85)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
            <div style={{ position:'fixed', bottom:28, right:28, zIndex:300, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
              {/* Sub-actions */}
              {fabOpen && actions.map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, animation:`fabIn 150ms ${i*40}ms both` }}>
                  <span style={{ background:'var(--color-near-black)', color:'#fff', fontSize:11.5, fontWeight:600, padding:'4px 10px', borderRadius:20, whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(0,0,0,0.18)', pointerEvents:'none' }}>{a.label}</span>
                  <button onClick={a.action} style={{ width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer', background:a.color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${a.shadow}`, transition:'transform 120ms', position:'relative', flexShrink:0 }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                    {a.icon}
                    {a.badge && <span style={{ position:'absolute', top:-3, right:-3, width:16, height:16, borderRadius:'50%', background:'#e03030', color:'white', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--color-ivory)' }}>{a.badge}</span>}
                  </button>
                </div>
              ))}
              {/* Main FAB */}
              <button onClick={() => setFabOpen(o => !o)}
                style={{ width:54, height:54, borderRadius:'50%', border:'none', cursor:'pointer',
                  background: fabOpen ? 'var(--color-near-black)' : 'var(--color-terracotta)', color:'white',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 18px rgba(0,0,0,0.25)', transition:'all 200ms', flexShrink:0 }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.07)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                {fabOpen
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
                {!fabOpen && unread > 0 && (
                  <span style={{ position:'absolute', top:-2, right:-2, width:17, height:17, borderRadius:'50%', background:'#e03030', color:'white', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--color-ivory)' }}>{unread}</span>
                )}
              </button>
            </div>

            {/* Schulung-Anfragen Modal */}
            {showTrainingReq && (
              <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:16 }}
                onClick={() => setShowTrainingReq(false)}>
                <div style={{ width:440, background:'var(--color-ivory)', borderRadius:16, boxShadow:'0 12px 40px rgba(0,0,0,0.2)', overflow:'hidden' }}
                  onClick={e => e.stopPropagation()}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border-1)', background:'#e8f1fb' }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500, color:'#1f5fa8' }}>Schulung anfragen</div>
                      <div className="small muted" style={{ marginTop:1 }}>Anfrage geht direkt an Sabine Janning</div>
                    </div>
                    <button onClick={() => setShowTrainingReq(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)' }}><Icon name="x" size={16} /></button>
                  </div>
                  {trainingReqSent ? (
                    <div style={{ padding:'40px 24px', textAlign:'center' }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
                      <div style={{ fontFamily:'var(--font-serif)', fontSize:18, fontWeight:500, marginBottom:6 }}>Anfrage gesendet!</div>
                      <div className="small muted">Sabine Janning wird sich bei dir melden.</div>
                      <button onClick={() => { setShowTrainingReq(false); setTrainingReqSent(false); setReqForm({ schulung:'', grund:'', wunschtermin:'' }); }}
                        className="btn btn--primary" style={{ marginTop:20 }}>Schließen</button>
                    </div>
                  ) : (
                    <div style={{ padding:'20px 24px' }}>
                      <label style={{ display:'block', marginBottom:14 }}>
                        <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>Schulung / Kurs</div>
                        <input value={reqForm.schulung} onChange={e => setReqForm(f => ({...f, schulung: e.target.value}))}
                          placeholder="z. B. SCC Dok. 016 Auffrischung"
                          style={{ width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', boxSizing:'border-box', fontFamily:'inherit' }} />
                      </label>
                      <label style={{ display:'block', marginBottom:14 }}>
                        <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>Begründung / Hinweis</div>
                        <textarea rows={3} value={reqForm.grund} onChange={e => setReqForm(f => ({...f, grund: e.target.value}))}
                          placeholder="Warum wird diese Schulung benötigt?"
                          style={{ width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', resize:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
                      </label>
                      <label style={{ display:'block', marginBottom:20 }}>
                        <div style={{ fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)', marginBottom:5 }}>Wunschtermin (optional)</div>
                        <input type="date" value={reqForm.wunschtermin} onChange={e => setReqForm(f => ({...f, wunschtermin: e.target.value}))}
                          style={{ width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', boxSizing:'border-box', fontFamily:'inherit' }} />
                      </label>
                      <div style={{ display:'flex', gap:10 }}>
                        <button className="btn btn--primary" style={{ flex:1 }} disabled={!reqForm.schulung.trim()} onClick={() => setTrainingReqSent(true)}>
                          Anfrage senden
                        </button>
                        <button className="btn btn--ghost" style={{ flex:1 }} onClick={() => setShowTrainingReq(false)}>Abbrechen</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Modals */}
      {showMessage && <MessageModal />}
      {showUpload  && <UploadModal />}
    </div>
  );
}

Object.assign(window, { PortalView });
