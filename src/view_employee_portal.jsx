/* Mitarbeiterportal - stabile kompakte Ansicht fuer Employee Login */

function PortalView({ searchState, setSearchState }) {
  const [activeTab, setActiveTab] = React.useState('certs');
  const [certFilter, setCertFilter] = React.useState('all');
  const [certSort, setCertSort] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('portal_cert_sort')) || { key: null, dir: 'asc' }; }
    catch { return { key: null, dir: 'asc' }; }
  });
  const [selectedCertIds, setSelectedCertIds] = React.useState([]);
  const [selectedPortalIds, setSelectedPortalIds] = React.useState({ license: [], appointments: [], wartung: [], instructions: [], medical: [], jobs: [], sites: [] });
  const [bulkNotice, setBulkNotice] = React.useState('');
  const [previewCert, setPreviewCert] = React.useState(null);
  const [openVersionId, setOpenVersionId] = React.useState(null);
  const [portalActionsOpen, setPortalActionsOpen] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);
  const [uploadType, setUploadType] = React.useState(null);
  const [uploadDone, setUploadDone] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState({
    title: '', category: 'Sicherheit', issuedAt: '', expiresAt: '', fileName: '',
  });
  const [showChat, setShowChat] = React.useState(false);
  const [chatStatus, setChatStatus] = React.useState('active');
  const [chatMenuOpen, setChatMenuOpen] = React.useState(false);
  const [chatDraft, setChatDraft] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState([
    { id: 'c1', from: 'admin', text: 'Hallo Markus, wenn du Fragen zu Dokumenten hast, schreib mir hier.', time: 'Mo. 09:14' },
  ]);
  const me = window.employee('e-me') || window.SEED.employees[0];
  const portalUploads = (() => {
    try { return JSON.parse(localStorage.getItem('portal_document_uploads') || '[]'); }
    catch { return []; }
  })();
  const approvedPortalUploads = portalUploads
    .filter(item => item.approved && (item.emp === me.name || item.personalNr === me.personalNr));
  const approvedUploadCerts = approvedPortalUploads
    .filter(item => item.type === 'zertifikat' || item.type === 'cert')
    .map(item => ({
      training: {
        id: item.id,
        name: item.schulung || 'Hochgeladenes Zertifikat',
        cat: item.category || 'Mitarbeiter-Upload',
        category: item.category || 'Mitarbeiter-Upload',
        mandatory: false,
      },
      cert: {
        status: 'valid',
        issuedAt: item.issuedAt || item.datum || window.SEED.today,
        expiresAt: item.expiresAt || item.datum || '',
        pdfUrl: item.pdfUrl || '',
        approvedAt: item.erledigtAm || '',
      },
    }));
  const adminReleasedCerts = (() => {
    try {
      return Object.values(JSON.parse(localStorage.getItem('employee_cert_releases') || '{}'))
        .filter(item => item.employeeId === me.id || item.personalNr === me.personalNr)
        .map(item => ({
          training: {
            id: item.trainingId,
            name: item.trainingName || item.trainingShort || 'Freigegebenes Zertifikat',
            short: item.trainingShort || item.trainingName || 'Zertifikat',
            cat: item.category || 'Freigabe Admin',
            category: item.category || 'Freigabe Admin',
            mandatory: !!item.mandatory,
          },
          cert: {
            status: item.status || 'valid',
            issuedAt: item.issuedAt || '',
            expiresAt: item.expiresAt || '',
            docNr: item.docNr || '',
            approvedAt: item.releasedAt || '',
            approvedByAdmin: true,
          },
        }));
    } catch {
      return [];
    }
  })();

  const baseCerts = [
    ...window.SEED.trainings.slice(0, 8).map(training => {
      const original = window.SEED.certs[me.id]?.[training.id] || { status: 'missing' };
      const cert = { ...original };
      if (training.id === 't-scc017') {
        cert.status = 'warn';
        cert.expiresAt = '2026-04-27';
      }
      return { training, cert };
    }),
    {
      training: window.SEED.trainings.find(t => t.id === 't-mvas99') || {
        id: 't-mvas99',
        name: 'MVAS 99',
        cat: 'Sicherheit / Verkehr',
        category: 'Sicherheit / Verkehr',
        mandatory: true,
      },
      cert: { status: 'missing', issuedAt: '', expiresAt: '', missingReason: 'Pflicht-Zertifikat fehlt fuer diesen Mitarbeiter' },
    },
    ...approvedUploadCerts,
  ];
  const myCerts = Array.from(new Map([...baseCerts, ...adminReleasedCerts].map(item => [item.training.id, item])).values());
  const adminReleasedInstructions = (() => {
    try {
      return Object.values(JSON.parse(localStorage.getItem('employee_instruction_releases') || '{}'))
        .filter(item => item.employeeId === me.id || item.personalNr === me.personalNr)
        .map(item => ({
          id: item.instructionId || item.id,
          title: item.title || 'Freigegebene Unterweisung',
          group: item.group || 'Freigabe Admin',
          date: item.date || window.SEED.today,
          document: item.document || 'Unterweisung.pdf',
          version: item.version || '',
          approvedByAdmin: true,
          participants: [{ emp: me.id, signed: true, date: item.date || window.SEED.today }],
        }));
    } catch {
      return [];
    }
  })();
  const baseInstructions = [
    ...window.SEED.instructions.filter(item => item.participants.some(p => p.emp === me.id)),
    ...approvedPortalUploads
      .filter(item => item.type === 'unterweisung')
      .map(item => ({
        id: item.id,
        title: item.schulung || 'Hochgeladene Unterweisung',
        group: item.category || 'Mitarbeiter-Upload',
        date: item.issuedAt || item.datum || window.SEED.today,
        participants: [{ emp: me.id, signed: true }],
      })),
  ];
  const myInstructions = Array.from(new Map([...baseInstructions, ...adminReleasedInstructions].map(item => [item.id, item])).values());

  const adminReleasedLicenses = (() => {
    try {
      return Object.values(JSON.parse(localStorage.getItem('employee_license_releases') || '{}'))
        .filter(item => (
          item.employeeId === me.id ||
          item.personalNr === me.personalNr ||
          item.employeeName === me.name
        ))
        .map(item => ({
          type: item.type || 'Führerschein',
          origin: item.origin || 'Deutsch',
          lastCheck: item.lastCheck || '-',
          nextCheck: item.nextCheck || '-',
          expiresAt: item.expiresAt || '-',
          status: item.status || 'valid',
          pdf: item.pdf || '',
          form: item.form || 'Kontrollformular.pdf',
        }));
    } catch (error) {
      return [];
    }
  })();

  const licenseRows = Array.from(new Map([
    {
      type: 'B, BE',
      origin: 'Deutsch',
      lastCheck: '21.04.2026',
      nextCheck: '21.04.2027',
      expiresAt: '14.09.2032',
      status: 'valid',
      pdf: 'FS_Markus_Brinker.pdf',
      form: 'Kontrollformular_Markus_Brinker.pdf',
    },
    {
      type: 'C, CE',
      origin: 'Europa',
      lastCheck: '12.03.2025',
      nextCheck: '12.03.2026',
      expiresAt: '12.03.2027',
      status: 'warn',
      pdf: 'FS_CE_Markus_Brinker.pdf',
      form: 'Kontrollformular_CE_Markus_Brinker.pdf',
    },
    ...approvedPortalUploads
      .filter(item => item.type === 'fuehrerschein')
      .map(item => ({
        type: item.schulung || item.category || 'Führerschein',
        origin: item.category || 'Nachweis',
        lastCheck: item.issuedAt ? window.fmtDE(item.issuedAt) : window.fmtDE(window.SEED.today),
        nextCheck: item.expiresAt ? window.fmtDE(item.expiresAt) : '—',
        expiresAt: item.expiresAt ? window.fmtDE(item.expiresAt) : '—',
        status: 'valid',
        pdf: item.pdfUrl || '',
        form: 'Kontrollformular_' + (item.id || 'Upload') + '.pdf',
      })),
    ...adminReleasedLicenses,
  ].map(row => [row.type + '|' + row.nextCheck + '|' + row.pdf, row])).values());

  const adminReleasedMedical = (() => {
    try {
      return Object.values(JSON.parse(localStorage.getItem('employee_medical_releases') || '{}'))
        .filter(item => (
          item.employeeId === me.id ||
          item.personalNr === me.personalNr ||
          item.employeeName === me.name
        ))
        .map(item => ({
          id: item.id,
          exam: item.exam || 'Untersuchung',
          type: item.type || 'Arbeitsmedizin',
          last: item.last || '-',
          next: item.next || '-',
          provider: item.provider || 'Admin-Freigabe',
          status: item.status || 'valid',
          document: item.document || '',
        }));
    } catch (error) {
      return [];
    }
  })();

  const medicalRows = Array.from(new Map([
    { id: 'm1', exam: 'G26 Atemschutz', type: 'Pflichtvorsorge', last: '14.03.2025', next: '14.03.2026', provider: 'Dr. Krause / Arbeitsmedizin Nordhorn', status: 'warn', document: 'G26_Markus_Brinker.pdf' },
    { id: 'm2', exam: 'G37 Lärmexposition', type: 'Pflichtvorsorge', last: '08.01.2025', next: '08.01.2028', provider: 'B.A.D. Gesundheitsvorsorge', status: 'valid', document: 'G37_Markus_Brinker.pdf' },
    { id: 'm3', exam: 'G25 Fahr-/Steuertätigkeit', type: 'Pflichtvorsorge', last: '20.02.2025', next: '20.02.2026', provider: 'DEKRA Arbeitsmedizin', status: 'planned', document: '' },
    ...adminReleasedMedical,
    ...approvedPortalUploads
      .filter(item => item.type === 'untersuchung')
      .map(item => ({
        id: item.id,
        exam: item.schulung || 'Hochgeladene Untersuchung',
        type: item.category || 'Arbeitsmedizin',
        last: item.issuedAt ? window.fmtDE(item.issuedAt) : '—',
        next: item.expiresAt ? window.fmtDE(item.expiresAt) : '—',
        provider: 'Mitarbeiter-Upload',
        status: 'valid',
        document: item.pdfUrl || '',
      })),
  ].map(row => [row.exam + '|' + row.next + '|' + row.provider, row])).values());

  const adminReleasedJobs = (() => {
    try {
      return Object.values(JSON.parse(localStorage.getItem('employee_job_releases') || '{}'))
        .filter(item => (
          item.employeeId === me.id ||
          item.personalNr === me.personalNr ||
          item.employeeName === me.name
        ))
        .map(item => ({
          id: item.id,
          title: item.title || 'Stellenbeschreibung',
          position: item.position || me.position || 'Mitarbeiter',
          company: item.company || window.company(me.company)?.name || me.company,
          version: item.version || 'v1.0',
          created: item.created || '-',
          signed: item.signed || '-',
          status: item.status || 'valid',
          document: item.document || '',
        }));
    } catch (error) {
      return [];
    }
  })();

  const jobRows = Array.from(new Map([
    { id: 'j1', title: 'Polier Tiefbau', position: 'Polier', company: 'Janning Tiefbau GmbH', version: 'v1.2', created: '01.03.2026', signed: '15.03.2026', status: 'valid', document: 'Polier_Tiefbau_v1.2.pdf' },
    { id: 'j2', title: 'Sicherheitsbeauftragter Tiefbau', position: 'SiBe', company: 'Janning Tiefbau GmbH', version: 'v2.0', created: '01.01.2025', signed: '01.01.2025', status: 'valid', document: 'SiBe_Tiefbau_v2.0.pdf' },
    ...adminReleasedJobs,
    ...approvedPortalUploads
      .filter(item => item.type === 'stellenbeschreibung')
      .map(item => ({
        id: item.id,
        title: item.schulung || 'Hochgeladene Stellenbeschreibung',
        position: item.category || me.position || 'Mitarbeiter',
        company: item.company || window.company(me.company)?.name || me.company,
        version: 'Upload',
        created: item.issuedAt ? window.fmtDE(item.issuedAt) : window.fmtDE(window.SEED.today),
        signed: item.erledigtAm || '',
        status: 'valid',
        document: item.pdfUrl || '',
      })),
  ].map(row => [row.title + '|' + row.version + '|' + row.company, row])).values());

  const wartungRows = Array.from(new Map([
    ...(window.SEED.wartungsliste || []),
    ...(window.wartungsliste_entries || []),
    ...portalUploads.filter(item => !item.approved),
  ].map(entry => [entry.id, entry])).values()).filter(entry => (
    entry.emp === me.name ||
    entry.mitarbeiter === me.name ||
    entry.personalNr === me.personalNr
  ));

  const wartungPortalRows = wartungRows.map(entry => ({
    id: entry.id,
    title: entry.schulung || entry.title || 'Dokument',
    date: entry.datum || entry.date || entry.faelligSeit || '',
    type: entry.dokumenttyp || entry.type || 'zertifikat',
    status: entry.status || 'offen',
    source: 'Wartungsliste',
    note: entry.notiz || 'Warte auf Bestätigung Admin',
  }));

  const appointmentRows = [
    { id: 'demo-fs', title: 'Führerscheinkontrolle', date: '21.04.2027', type: 'fuehrerschein', status: 'geplant', source: 'Kalender' },
  ];


  const siteReleaseRows = (() => {
    const fallbackSites = [
      {
        id: 'bs1',
        name: 'Baustelle Alex Barum',
        projectName: 'Kanalsanierung Nordhorn',
        projectNr: 'BAU-2026-014',
        company: 'Janning Tiefbau GmbH',
        bauleiter: 'Alexander Petersen',
        vorarbeiter: 'Markus Brinker',
        auftraggeber: 'Stadt Nordhorn',
        adresse: 'Lingener Strasse 42, 48529 Nordhorn',
        employeeIds: ['e-me', 'e-mustafa', 'e-dirk', 'e-tobias', 'e-ralf'],
        releasedEmployeeIds: ['e-me'],
        alarmPlan: { baustelle: 'Baustelle Alex Barum', stand: '01/26' },
      },
    ];
    let sites = fallbackSites;
    try {
      const saved = JSON.parse(localStorage.getItem('baustellen_employee_releases_v1') || '[]');
      if (Array.isArray(saved) && saved.length) sites = saved;
    } catch {}
    return sites
      .filter(site => (site.releasedEmployeeIds || []).includes(me.id))
      .map(site => {
        const employees = (site.employeeIds || []).map(id => window.employee(id)).filter(Boolean);
        const firstAiders = employees.filter(emp => {
          const cert = window.SEED.certs?.[emp.id]?.['t-erstehilfe'];
          return cert && cert.status === 'valid';
        });
        return {
          ...site,
          employees,
          firstAiders,
          documents: [
            'Alarmplan_' + (site.projectNr || site.id) + '.pdf',
            'Baustellenaushang.pdf',
            'Unterweisung-Baustelle.pdf',
            'Verkehrssicherung-Plan.pdf',
          ],
        };
      });
  })();
  const validCount = myCerts.filter(item => item.cert.status === 'valid').length;
  const warnCount = myCerts.filter(item => item.cert.status === 'warn').length;
  const expiredCount = myCerts.filter(item => item.cert.status === 'expired').length;
  const missingCount = myCerts.filter(item => (item.cert.status || 'missing') === 'missing').length;
  const daysUntilCertExpiry = (expiresAt) => {
    if (!expiresAt) return null;
    const start = new Date(window.SEED.today || '2026-04-21');
    const end = new Date(expiresAt);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };
  const certUrgency = (cert) => {
    if (!cert?.expiresAt || cert.status === 'missing') return cert.status === 'missing' ? 'missing-required' : '';
    const days = daysUntilCertExpiry(cert.expiresAt);
    if (days === null || days < 0) return '';
    if (days < 7) return 'critical';
    if (days < 30) return 'warning';
    return '';
  };
  const urgencyText = (cert) => {
    const urgency = certUrgency(cert);
    if (urgency === 'missing-required') return 'Fehlt';
    const days = daysUntilCertExpiry(cert.expiresAt);
    if (urgency === 'critical') return `Kritisch: nur ${days} Tage`;
    if (urgency === 'warning') return `Warnung: ${days} Tage`;
    return '';
  };
  const UrgencyBadge = ({ cert }) => {
    const urgency = certUrgency(cert);
    if (!urgency) return null;
    return <span className={'portal-urgency portal-urgency--' + urgency}>{urgency === 'critical' ? '!' : urgency === 'warning' ? '!' : 'Fehlt'} {urgencyText(cert)}</span>;
  };
  const certCategory = (training) => training.category || training.cat || '';
  const certRemaining = (cert) => {
    if (!cert?.expiresAt || cert.status === 'missing') return '—';
    const days = daysUntilCertExpiry(cert.expiresAt);
    if (days === null) return '—';
    if (days < 0) return `vor ${Math.abs(days)} Tagen abgelaufen`;
    if (days === 0) return 'heute';
    if (days === 1) return 'morgen';
    return `in ${days} Tagen`;
  };
  React.useEffect(() => {
    localStorage.setItem('portal_cert_sort', JSON.stringify(certSort));
  }, [certSort]);

  const certHistory = (training, cert) => [
    { version: 'v1.0', uploaded: cert.issuedAt ? window.fmtDE(cert.issuedAt) : '12.01.2025', checked: cert.status === 'missing' ? 'Noch nicht geprÃ¼ft' : '17.01.2025', note: 'Erstnachweis hochgeladen' },
    { version: 'v1.1', uploaded: cert.expiresAt ? window.fmtDE(cert.expiresAt) : '21.04.2026', checked: cert.status === 'missing' ? 'Offen' : '22.04.2026', note: cert.status === 'warn' ? 'Ablaufdatum aktualisiert' : 'Admin-PrÃ¼fung dokumentiert' },
  ];

  const sortValue = (item, key) => {
    if (key === 'name') return item.training.name || '';
    if (key === 'remaining') return item.cert.expiresAt ? new Date(item.cert.expiresAt).getTime() : 0;
    if (key === 'issuedAt') return item.cert.issuedAt ? new Date(item.cert.issuedAt).getTime() : 0;
    if (key === 'expiresAt') return item.cert.expiresAt ? new Date(item.cert.expiresAt).getTime() : 0;
    if (key === 'status') return ({ valid: 'GÃ¼ltig', warn: 'LÃ¤uft bald ab', expired: 'Abgelaufen', missing: 'Fehlt' })[item.cert.status || 'missing'] || '';
    return 0;
  };

  const filteredBaseCerts = certFilter === 'all'
    ? myCerts
    : myCerts.filter(item => (item.cert.status || 'missing') === certFilter);
  const filteredCerts = certSort.key
    ? [...filteredBaseCerts].sort((a, b) => {
        const av = sortValue(a, certSort.key);
        const bv = sortValue(b, certSort.key);
        const result = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'de');
        return certSort.dir === 'asc' ? result : -result;
      })
    : filteredBaseCerts;
  const allVisibleCertIds = filteredCerts.map(item => item.training.id);
  const visibleSelectedCount = allVisibleCertIds.filter(id => selectedCertIds.includes(id)).length;

  const statusLabel = {
    valid: 'Gültig',
    warn: 'Läuft bald ab',
    expired: 'Abgelaufen',
    missing: 'Fehlt',
    planned: 'Geplant',
    offen: 'Offen',
    erledigt: 'Erledigt',
    in_pruefung: 'In Prüfung',
  };

  const statusToBadge = (status) => {
    if (status === 'warn') return 'warn';
    if (status === 'expired') return 'expired';
    if (status === 'missing' || status === 'offen') return 'missing';
    if (status === 'geplant' || status === 'planned' || status === 'in_pruefung') return 'planned';
    return 'valid';
  };

  const tabs = [
    { id: 'certs', label: 'Zertifikate', count: myCerts.length },
    { id: 'license', label: 'Führerschein', count: licenseRows.length },
    { id: 'instructions', label: 'Unterweisungen', count: myInstructions.length },
    { id: 'medical', label: 'Untersuchungsvorsorge', count: medicalRows.length },
    { id: 'jobs', label: 'Stellenbeschreibung', count: jobRows.length },
    { id: 'sites', label: 'Baustellen', count: siteReleaseRows.length },
    { id: 'appointments', label: 'Termine', count: appointmentRows.length },
    { id: 'wartung', label: 'Wartungsliste', count: wartungPortalRows.length },
  ];

  const setCertsFilter = (filter) => {
    setActiveTab('certs');
    setCertFilter(filter);
    setSelectedCertIds([]);
    setBulkNotice('');
  };

  const setCertSortColumn = (key) => {
    setCertSort(current => current.key === key
      ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' });
  };

  const resetCertSort = () => {
    setCertSort({ key: null, dir: 'asc' });
    localStorage.removeItem('portal_cert_sort');
  };

  const sortLabel = (key, label) => (
    <button type="button" className={'portal-sort-head ' + (certSort.key === key ? 'is-active' : '')} onClick={() => setCertSortColumn(key)}>
      {label}
      <span>{certSort.key === key ? (certSort.dir === 'asc' ? '↑' : '↓') : ''}</span>
    </button>
  );

  const toggleCertSelection = (id) => {
    setSelectedCertIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
    setBulkNotice('');
  };

  const toggleAllVisibleCerts = () => {
    setSelectedCertIds(ids => {
      const visible = allVisibleCertIds;
      const allSelected = visible.length > 0 && visible.every(id => ids.includes(id));
      if (allSelected) return ids.filter(id => !visible.includes(id));
      return Array.from(new Set([...ids, ...visible]));
    });
    setBulkNotice('');
  };

  const bulkDownload = () => {
    const count = selectedCertIds.length;
    if (!count) return;
    setBulkNotice(`${count} Dokument${count === 1 ? '' : 'e'} für Download vorbereitet.`);
  };

  const bulkMessageAdmin = () => {
    const selectedNames = myCerts
      .filter(item => selectedCertIds.includes(item.training.id))
      .map(item => item.training.name);
    setShowChat(true);
    setChatDraft(`Bitte folgende Dokumente prüfen: ${selectedNames.join(', ')}`);
    setBulkNotice(`${selectedNames.length} Dokument${selectedNames.length === 1 ? '' : 'e'} in Nachricht an Admin übernommen.`);
  };

  const portalRowIds = {
    license: licenseRows.map(row => row.type),
    appointments: appointmentRows.map(row => row.id),
    wartung: wartungPortalRows.map(row => row.id),
    instructions: myInstructions.map(item => item.id),
    medical: medicalRows.map(row => row.id),
    jobs: jobRows.map(row => row.id),
    sites: siteReleaseRows.map(row => row.id),
  };

  const portalSelectionLabel = (tab, id) => {
    if (tab === 'license') return licenseRows.find(row => row.type === id)?.type || id;
    if (tab === 'appointments') return appointmentRows.find(row => row.id === id)?.title || id;
    if (tab === 'wartung') return wartungPortalRows.find(row => row.id === id)?.title || id;
    if (tab === 'instructions') return myInstructions.find(item => item.id === id)?.title || id;
    if (tab === 'medical') return medicalRows.find(row => row.id === id)?.exam || id;
    if (tab === 'jobs') return jobRows.find(row => row.id === id)?.title || id;
    if (tab === 'sites') return siteReleaseRows.find(row => row.id === id)?.name || id;
    return id;
  };

  const togglePortalSelection = (tab, id) => {
    setSelectedPortalIds(state => {
      const current = state[tab] || [];
      return { ...state, [tab]: current.includes(id) ? current.filter(item => item !== id) : [...current, id] };
    });
    setBulkNotice('');
  };

  const toggleAllPortalRows = (tab) => {
    const ids = portalRowIds[tab] || [];
    setSelectedPortalIds(state => {
      const current = state[tab] || [];
      const allSelected = ids.length > 0 && ids.every(id => current.includes(id));
      return { ...state, [tab]: allSelected ? current.filter(id => !ids.includes(id)) : Array.from(new Set([...current, ...ids])) };
    });
    setBulkNotice('');
  };

  const portalBulkDownload = (tab) => {
    const count = (selectedPortalIds[tab] || []).length;
    if (!count) return;
    setBulkNotice(`${count} Dokument${count === 1 ? '' : 'e'} für Download vorbereitet.`);
  };

  const portalBulkMessageAdmin = (tab) => {
    const selectedNames = (selectedPortalIds[tab] || []).map(id => portalSelectionLabel(tab, id));
    setShowChat(true);
    setChatDraft(`Bitte folgende Einträge prüfen: ${selectedNames.join(', ')}`);
    setBulkNotice(`${selectedNames.length} Einträg${selectedNames.length === 1 ? '' : 'e'} in Nachricht an Admin übernommen.`);
  };

  const PortalSelectionToolbar = ({ tab, count }) => {
    const selected = selectedPortalIds[tab] || [];
    return (
      <>
        <div className="portal-list-toolbar">
          <div><strong>{count}</strong> Einträge</div>
          {selected.length > 0 && (
            <div className="portal-bulk-actions">
              <span>{selected.length} ausgewählt</span>
              <button type="button" className="job-small-btn" onClick={() => portalBulkDownload(tab)}><Icon name="download" size={12} />Download</button>
              <button type="button" className="job-small-btn" onClick={() => portalBulkMessageAdmin(tab)}><Icon name="mail" size={12} />Nachricht an Admin</button>
            </div>
          )}
        </div>
        {bulkNotice && selected.length > 0 && <div className="portal-inline-notice">{bulkNotice}</div>}
      </>
    );
  };

  const PortalSelectAll = ({ tab }) => {
    const ids = portalRowIds[tab] || [];
    const selected = selectedPortalIds[tab] || [];
    return <input type="checkbox" checked={ids.length > 0 && ids.every(id => selected.includes(id))} onChange={() => toggleAllPortalRows(tab)} aria-label="Alle sichtbaren Einträge auswählen" />;
  };

  const PortalSelectCell = ({ tab, id, label }) => (
    <td data-label="Auswahl"><input type="checkbox" checked={(selectedPortalIds[tab] || []).includes(id)} onChange={() => togglePortalSelection(tab, id)} aria-label={`${label} auswählen`} /></td>
  );

  const uploadTypes = [
    { id: 'cert', label: 'Meine Zertifikate', icon: 'doc' },
    { id: 'instr', label: 'Meine Unterweisungen', icon: 'flag' },
    { id: 'medical', label: 'Meine Untersuchungsvorsorge', icon: 'shield' },
    { id: 'job', label: 'Meine Stellenbeschreibung', icon: 'doc' },
    { id: 'license', label: 'Mein Führerschein', icon: 'cap' },
  ];

  const uploadLabels = {
    cert: ['Zertifikat / Schulung', 'Kategorie', 'Ausstellungsdatum', 'Ablaufdatum'],
    instr: ['Unterweisung', 'Kategorie', 'Datum', 'Gültig bis / Version vom'],
    medical: ['Untersuchung', 'Art', 'Untersuchungsdatum', 'Nächste Untersuchung'],
    job: ['Stellenbeschreibung', 'Position', 'Ausgestellt am', 'Version / Stand'],
    license: ['Führerscheinklasse', 'Herkunft', 'Kontrolldatum', 'Ablaufdatum'],
  };

  const resetUpload = () => {
    setShowUpload(false);
    setUploadType(null);
    setUploadDone(false);
    setUploadForm({ title: '', category: 'Sicherheit', issuedAt: '', expiresAt: '', fileName: '' });
  };

  const submitUpload = () => {
    const selectedType = uploadTypes.find(t => t.id === uploadType);
    const typeMap = {
      cert: 'zertifikat',
      instr: 'unterweisung',
      medical: 'untersuchung',
      job: 'stellenbeschreibung',
      license: 'fuehrerschein',
    };
    const pending = {
      id: 'wl-portal-' + Date.now(),
      emp: me.name,
      personalNr: me.personalNr,
      company: window.company(me.company)?.name || me.company,
      schulung: uploadForm.title || selectedType?.label || 'Dokument',
      datum: uploadForm.expiresAt || uploadForm.issuedAt || window.SEED.today,
      type: typeMap[uploadType] || uploadType,
      dokumenttyp: typeMap[uploadType] || uploadType,
      category: uploadForm.category,
      issuedAt: uploadForm.issuedAt,
      expiresAt: uploadForm.expiresAt,
      status: 'in_pruefung',
      faelligSeit: window.SEED.today,
      notiz: 'Upload vom Mitarbeiter - Warte auf Bestätigung Admin',
      pdfUrl: uploadForm.fileName,
      createdAt: new Date().toISOString(),
      approved: false,
      source: 'portal-upload',
    };
    const uploads = (() => {
      try { return JSON.parse(localStorage.getItem('portal_document_uploads') || '[]'); }
      catch { return []; }
    })();
    localStorage.setItem('portal_document_uploads', JSON.stringify([pending, ...uploads]));
    if (!window.portalAdminNotifications) window.portalAdminNotifications = [];
    window.portalAdminNotifications.push({
      id: 'n-portal-' + Date.now(),
      type: 'upload',
      title: 'Neuer Dokument-Upload wartet auf Bestätigung',
      body: `${me.name} hat "${pending.schulung}" hochgeladen.`,
      createdAt: new Date(),
    });
    setUploadDone(true);
  };

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    const now = new Date();
    const time = `Heute ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const ownId = 'm' + Date.now();
    setChatMessages(items => [...items, { id: ownId, from: 'me', text: chatDraft.trim(), time, canDeleteUntil: Date.now() + 120000 }]);
    setChatDraft('');
    setTimeout(() => {
      setChatMessages(items => [...items, { id: 'a' + Date.now(), from: 'admin', text: 'Danke, ich prüfe das und melde mich.', time }]);
    }, 800);
  };

  const deleteOwnMessage = (id) => {
    setChatMessages(items => items.map(item => item.id === id && item.from === 'me' && Date.now() < item.canDeleteUntil
      ? { ...item, text: 'Nachricht gelöscht', deleted: true }
      : item));
  };

  const UploadModal = () => {
    const labels = uploadLabels[uploadType] || uploadLabels.cert;
    return (
      <div className="portal-modal-backdrop" onClick={resetUpload}>
        <div className="portal-modal" onClick={e => e.stopPropagation()}>
          <div className="portal-modal__head">
            <div>
              <h2>Dokument hochladen</h2>
              <p>{uploadType ? uploadTypes.find(t => t.id === uploadType)?.label : 'Dokumenttyp auswählen'}</p>
            </div>
            <button className="icon-btn" onClick={resetUpload}><Icon name="x" size={16} /></button>
          </div>

          {uploadDone ? (
            <div className="portal-modal__done">
              <div>✓</div>
              <h3>Upload eingereicht</h3>
              <p>Status: Warte auf Bestätigung Admin. Nach Genehmigung erscheint das Dokument in deiner Liste.</p>
              <button className="btn btn--primary" onClick={resetUpload}>Schließen</button>
            </div>
          ) : !uploadType ? (
            <div className="portal-doc-types">
              {uploadTypes.map(type => (
                <button key={type.id} type="button" onClick={() => setUploadType(type.id)}>
                  <Icon name={type.icon} size={18} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="portal-upload-form">
              <label><span>{labels[0]}</span><input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder={uploadType === 'cert' ? 'z. B. SCC Dok. 016' : labels[0]} /></label>
              <label><span>{labels[1]}</span>
                <select value={uploadForm.category} onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}>
                  {['Sicherheit', 'SCC', 'DVGW', 'Fahrerlaubnis', 'Unterweisung', 'Arbeitsmedizin', 'Stellenbeschreibung', 'Führerschein'].map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label><span>{labels[2]}</span><input type="date" value={uploadForm.issuedAt} onChange={e => setUploadForm(f => ({ ...f, issuedAt: e.target.value }))} /></label>
              <label><span>{labels[3]}</span><input type="date" value={uploadForm.expiresAt} onChange={e => setUploadForm(f => ({ ...f, expiresAt: e.target.value }))} /></label>
              <label><span>Datei hochladen (PDF / Bild)</span><input type="file" accept=".pdf,image/*" onChange={e => setUploadForm(f => ({ ...f, fileName: e.target.files?.[0]?.name || '' }))} /></label>
              <div className="portal-readonly-status"><span>Status</span><strong>Warte auf Bestätigung Admin</strong></div>
              <div className="portal-modal__actions">
                <button className="btn btn--primary" onClick={submitUpload} disabled={!uploadForm.title}>Absenden</button>
                <button className="btn btn--ghost" onClick={resetUpload}>Abbrechen</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ChatModal = () => {
    if (chatStatus === 'hidden') {
      return (
        <div className="portal-chat-hidden">
          <span>Chat ist ausgeblendet</span>
          <button className="btn btn--ghost" onClick={() => setChatStatus('active')}>Einblenden</button>
        </div>
      );
    }

    return (
      <div className="portal-chat">
        <div className="portal-chat__head">
          <div>
            <h2>Nachricht an Admin</h2>
            <p>Admin hat vollständigen Verlauf</p>
          </div>
          <div className="portal-chat__menu">
            <button className="icon-btn" onClick={() => setChatMenuOpen(v => !v)}><Icon name="settings" size={15} /></button>
            {chatMenuOpen && (
              <div>
                <button onClick={() => { setChatStatus('hidden'); setChatMenuOpen(false); }}>Chat ausblenden</button>
                <button onClick={() => { setChatStatus('archived'); setChatMenuOpen(false); }}>Chat archivieren</button>
                <button onClick={() => { setChatStatus('done'); setChatMenuOpen(false); }}>Als erledigt markieren</button>
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={() => setShowChat(false)}><Icon name="x" size={16} /></button>
        </div>
        {chatStatus !== 'active' && <div className="portal-chat__status">{chatStatus === 'archived' ? 'Chat archiviert' : 'Als erledigt markiert'} <button onClick={() => setChatStatus('active')}>Zurücksetzen</button></div>}
        <div className="portal-chat__body">
          {chatMessages.map(item => (
            <div key={item.id} className={'portal-chat-msg ' + (item.from === 'me' ? 'is-me' : 'is-admin')}>
              <div>{item.text}</div>
              <span>{item.time}</span>
              {item.from === 'me' && !item.deleted && Date.now() < item.canDeleteUntil && <button onClick={() => deleteOwnMessage(item.id)}>Löschen</button>}
            </div>
          ))}
        </div>
        <div className="portal-chat__input">
          <textarea rows={1} value={chatDraft} onChange={e => setChatDraft(e.target.value)} placeholder="Nachricht schreiben..." />
          <button className="btn btn--primary" onClick={sendChat} disabled={!chatDraft.trim()}>Senden</button>
        </div>
      </div>
    );
  };

  const PreviewModal = () => {
    if (!previewCert) return null;
    const history = certHistory(previewCert.training, previewCert.cert);
    return (
      <div className="portal-modal-backdrop" onClick={() => setPreviewCert(null)}>
        <div className="portal-modal portal-preview-modal" onClick={e => e.stopPropagation()}>
          <div className="portal-modal__head">
            <div>
              <h2>Dokument-Vorschau</h2>
              <p>{previewCert.training.name}</p>
            </div>
            <button className="icon-btn" onClick={() => setPreviewCert(null)}><Icon name="x" size={16} /></button>
          </div>
          <div className="portal-pdf-preview">
            <div className="portal-pdf-page">
              <div>Zertifikat</div>
              <h3>{previewCert.training.name}</h3>
              <p>Kategorie: {certCategory(previewCert.training) || '—'}</p>
              <p>Ablaufdatum: {previewCert.cert.expiresAt ? window.fmtDE(previewCert.cert.expiresAt) : '—'}</p>
              <span>{statusLabel[previewCert.cert.status || 'missing']}</span>
            </div>
          </div>
          <div className="portal-history-list">
            <h3>Historie / Verlauf</h3>
            {history.map(item => (
              <div key={item.version}>
                <strong>{item.version}</strong>
                <span>Hochgeladen: {item.uploaded}</span>
                <span>GeprÃ¼ft: {item.checked}</span>
                <p>{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="portal-hero">
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--fg-on-dark-2)' }}>Mein Portal</div>
          <div className="portal-hero__greet">Guten Morgen, {me.firstName}.</div>
          <div className="portal-hero__sub">Hier siehst du deine Schulungen, Zertifikate und Unterweisungen, an denen du teilgenommen hast.</div>
        </div>
        <div className="portal-hero__avatar">{me.initials}</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <button type="button" className={'portal-stat portal-stat--clickable ' + (activeTab === 'certs' && certFilter === 'valid' ? 'is-active' : '')} onClick={() => setCertsFilter('valid')}>
          <div className="kpi__label">Gültige Schulungen</div><div className="portal-stat__num">{validCount}</div>
        </button>
        <button type="button" className={'portal-stat portal-stat--clickable ' + (activeTab === 'certs' && certFilter === 'warn' ? 'is-active' : '')} onClick={() => setCertsFilter('warn')}>
          <div className="kpi__label">Laufen bald ab</div><div className="portal-stat__num">{warnCount}</div>
        </button>
        <button type="button" className={'portal-stat portal-stat--clickable ' + (activeTab === 'certs' && certFilter === 'expired' ? 'is-active' : '')} onClick={() => setCertsFilter('expired')}>
          <div className="kpi__label">Abgelaufen</div><div className="portal-stat__num">{expiredCount}</div>
        </button>
        <button type="button" className={'portal-stat portal-stat--clickable ' + (activeTab === 'certs' && certFilter === 'missing' ? 'is-active' : '')} onClick={() => setCertsFilter('missing')}>
          <div className="kpi__label">Fehlt</div><div className="portal-stat__num">{missingCount}</div>
        </button>
      </div>

      <div className="portal-tabs" role="tablist">
        {tabs.map(tab => (
          <button key={tab.id} type="button" className={activeTab === tab.id ? 'is-active' : ''} onClick={() => setActiveTab(tab.id)}>
            {tab.label} <span>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'certs' && (
        <>
        <div className="portal-list-toolbar">
          <div>
            <strong>{filteredCerts.length}</strong> Einträge
            {certFilter !== 'all' && <button type="button" onClick={() => setCertsFilter('all')}>Filter zurücksetzen</button>}
          </div>
          {selectedCertIds.length > 0 && (
            <div className="portal-bulk-actions">
              <span>{selectedCertIds.length} ausgewählt</span>
              <button type="button" className="job-small-btn" onClick={bulkDownload}><Icon name="download" size={12} />Download</button>
              <button type="button" className="job-small-btn" onClick={bulkMessageAdmin}><Icon name="mail" size={12} />Nachricht an Admin</button>
            </div>
          )}
        </div>
        {certSort.key && <div className="portal-sort-reset"><button type="button" onClick={resetCertSort}>Sortierung zurÃ¼cksetzen</button></div>}
        {bulkNotice && <div className="portal-inline-notice">{bulkNotice}</div>}
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}>
                <input type="checkbox" checked={filteredCerts.length > 0 && visibleSelectedCount === filteredCerts.length} onChange={toggleAllVisibleCerts} aria-label="Alle sichtbaren Zertifikate auswählen" />
              </th>
              <th>{sortLabel('name', 'Zertifikat / Schulung')}</th>
              <th>{sortLabel('issuedAt', 'Ausstellungsdatum')}</th>
              <th>{sortLabel('expiresAt', 'Ablaufdatum')}</th>
              <th>{sortLabel('remaining', 'Restlaufzeit')}</th>
              <th>{sortLabel('status', 'Status')}</th>
              <th style={{ textAlign: 'center' }}>Dokument</th>
              <th style={{ textAlign: 'center' }}>Versionen</th>
            </tr></thead>
            <tbody>
              {filteredCerts.map(({ training, cert }) => (
                <React.Fragment key={training.id}>
                <tr className={[
                  selectedCertIds.includes(training.id) ? 'is-selected' : '',
                  certUrgency(cert) ? 'portal-cert-row--' + certUrgency(cert) : '',
                  cert.status === 'missing' && training.mandatory ? 'portal-cert-row--missing-required' : '',
                ].filter(Boolean).join(' ')}>
                  <td data-label="Auswahl"><input type="checkbox" checked={selectedCertIds.includes(training.id)} onChange={() => toggleCertSelection(training.id)} aria-label={`${training.name} auswählen`} /></td>
                  <td style={{ fontWeight: 650 }}>
                    <div className="portal-cert-title">
                      <span>{training.name}</span>
                      {training.mandatory && <span className={'portal-required-badge ' + (cert.status === 'missing' ? 'is-missing' : '')}>Pflicht</span>}
                      {cert.approvedByAdmin && <span className="portal-required-badge">Freigegeben</span>}
                    </div>
                    {cert.status === 'missing' && training.mandatory && <div className="portal-missing-note">Pflicht-Zertifikat fehlt fuer diesen Mitarbeiter</div>}
                  </td>
                  <td>{cert.issuedAt ? window.fmtDE(cert.issuedAt) : '—'}</td>
                  <td>
                    <div className="portal-expiry-cell">
                      <span>{cert.expiresAt ? window.fmtDE(cert.expiresAt) : '—'}</span>
                      <UrgencyBadge cert={cert} />
                    </div>
                  </td>
                  <td>{certRemaining(cert)}</td>
                  <td><StatusBadge status={cert.status || 'missing'}>{statusLabel[cert.status || 'missing']}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="job-small-btn portal-preview-trigger" onClick={() => setPreviewCert({ training, cert })}>
                      <Icon name="eye" size={12} />PDF anzeigen
                      <span>
                        <strong>{training.name}</strong>
                        <small>Ablauf: {cert.expiresAt ? window.fmtDE(cert.expiresAt) : 'â€”'}</small>
                        <small>Status: {statusLabel[cert.status || 'missing']}</small>
                      </span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="job-small-btn" onClick={() => setOpenVersionId(openVersionId === training.id ? null : training.id)}><Icon name="history" size={12} />Versionen anzeigen</button>
                  </td>
                </tr>
                {openVersionId === training.id && (
                  <tr className="portal-version-row">
                    <td colSpan="8">
                      <div className="portal-version-list">
                        {certHistory(training, cert).map(item => (
                          <div key={item.version}>
                            <strong>{item.version}</strong>
                            <span>Hochgeladen: {item.uploaded}</span>
                            <span>GeprÃ¼ft: {item.checked}</span>
                            <em>{item.note}</em>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
              {filteredCerts.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--fg-3)', padding: 24 }}>Keine Zertifikate für diesen Filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'license' && (
        <>
        <PortalSelectionToolbar tab="license" count={licenseRows.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="license" /></th>
              <th>Typ Führerschein</th>
              <th>Führerschein Herkunft</th>
              <th>Letzte Führerscheinkontrolle</th>
              <th>Nächste Führerscheinkontrolle</th>
              <th>Läuft Führerschein ab</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Führerschein ansehen</th>
              <th style={{ textAlign: 'center' }}>Kontrollformular ansehen</th>
            </tr></thead>
            <tbody>
              {licenseRows.map(row => (
                <tr key={row.type} className={(selectedPortalIds.license || []).includes(row.type) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="license" id={row.type} label={row.type} />
                  <td><span className="license-class">{row.type}</span></td>
                  <td>{row.origin}</td>
                  <td>{row.lastCheck}</td>
                  <td>{row.nextCheck}</td>
                  <td>{row.expiresAt}</td>
                  <td><StatusBadge status={row.status}>{statusLabel[row.status]}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="eye" size={12} />PDF anzeigen</button></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="doc" size={12} />Formular anzeigen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'sites' && (
        <>
        <PortalSelectionToolbar tab="sites" count={siteReleaseRows.length} />
        {siteReleaseRows.length ? (
          <div style={{ display:'grid', gap:16 }}>
            {siteReleaseRows.map(site => (
              <div key={site.id} className="card card--pad" style={{ display:'grid', gap:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      <input type="checkbox" checked={(selectedPortalIds.sites || []).includes(site.id)} onChange={() => togglePortalSelection('sites', site.id)} aria-label={`${site.name} auswaehlen`} />
                      <h3 style={{ margin:0, fontFamily:'var(--font-serif)', fontSize:26, fontWeight:500 }}>{site.name}</h3>
                      <span className="badge badge--valid"><span className="badge__dot" />Freigegeben</span>
                    </div>
                    <div className="small muted" style={{ marginTop:6 }}>{site.projectNr} - {site.company}</div>
                  </div>
                  <button className="job-small-btn"><Icon name="eye" size={12} />Baustelle ansehen</button>
                </div>

                <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4, minmax(130px, 1fr))' }}>
                  <div className="kpi"><div className="kpi__label">Bauleiter</div><div className="kpi__value" style={{ fontSize:24 }}>{site.bauleiter || '-'}</div></div>
                  <div className="kpi"><div className="kpi__label">Vorarbeiter</div><div className="kpi__value" style={{ fontSize:24 }}>{site.vorarbeiter || '-'}</div></div>
                  <div className="kpi"><div className="kpi__label">Ersthelfer</div><div className="kpi__value" style={{ fontSize:24 }}>{site.firstAiders.map(emp => emp.name).join(', ') || 'nicht gesetzt'}</div></div>
                  <div className="kpi"><div className="kpi__label">Team</div><div className="kpi__value">{site.employees.length}</div><div className="kpi__delta">Mitarbeiter</div></div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:16 }}>
                  <div style={{ border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ padding:'10px 14px', background:'var(--color-parchment)', fontWeight:800, textTransform:'uppercase', fontSize:12, color:'var(--fg-3)' }}>Team auf der Baustelle</div>
                    {site.employees.map(emp => (
                      <div key={emp.id} style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'11px 14px', borderTop:'1px solid var(--border-1)' }}>
                        <div><strong>{emp.name}</strong><div className="small muted">{window.company(emp.company)?.short || emp.company} - {emp.position}</div></div>
                        {site.firstAiders.some(item => item.id === emp.id) && <span className="badge badge--valid"><span className="badge__dot" />Ersthelfer</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'grid', gap:12 }}>
                    <div style={{ border:'1px solid var(--border-1)', borderRadius:10, padding:14, background:'white' }}>
                      <div className="kpi__label">Baustellen-Daten</div>
                      <div style={{ marginTop:8 }}><strong>{site.projectName || site.name}</strong></div>
                      <div className="small muted">Auftraggeber: {site.auftraggeber || '-'}</div>
                      <div className="small muted">Adresse: {site.adresse || '-'}</div>
                    </div>
                    <div style={{ border:'1px solid var(--border-1)', borderRadius:10, padding:14, background:'white' }}>
                      <div className="kpi__label">Dokumente</div>
                      <div style={{ display:'grid', gap:8, marginTop:10 }}>
                        {site.documents.map(doc => (
                          <button key={doc} className="job-small-btn" style={{ justifyContent:'space-between' }}><span><Icon name="doc" size={12} /> {doc}</span><span>Anzeigen</span></button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card card--pad" style={{ color:'var(--fg-2)' }}>
            Keine Baustelle freigegeben. Sobald der Bauleiter dich freischaltet, siehst du hier Team, Ersthelfer, Alarmplan und Dokumente.
          </div>
        )}
        </>
      )}
      {activeTab === 'appointments' && (
        <>
        <PortalSelectionToolbar tab="appointments" count={appointmentRows.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="appointments" /></th>
              <th>Termin</th>
              <th>Datum</th>
              <th>Quelle</th>
              <th>Typ</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aktion</th>
            </tr></thead>
            <tbody>
              {appointmentRows.map(row => (
                <tr key={row.id} className={(selectedPortalIds.appointments || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="appointments" id={row.id} label={row.title} />
                  <td style={{ fontWeight: 650 }}>{row.title}</td>
                  <td>{row.date ? (row.date.includes('-') ? window.fmtDE(row.date) : row.date) : '—'}</td>
                  <td>{row.source}</td>
                  <td>{row.type === 'fuehrerschein' ? 'Führerschein' : row.type}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{statusLabel[row.status] || row.status}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="cal" size={12} />Termin ansehen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'wartung' && (
        <>
        <PortalSelectionToolbar tab="wartung" count={wartungPortalRows.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="wartung" /></th>
              <th>Dokument</th>
              <th>Typ</th>
              <th>Eingereicht / Fällig</th>
              <th>Status</th>
              <th>Hinweis</th>
              <th style={{ textAlign: 'center' }}>Aktion</th>
            </tr></thead>
            <tbody>
              {wartungPortalRows.length ? wartungPortalRows.map(row => (
                <tr key={row.id} className={(selectedPortalIds.wartung || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="wartung" id={row.id} label={row.title} />
                  <td style={{ fontWeight: 650 }}>{row.title}</td>
                  <td>{row.type === 'fuehrerschein' ? 'Führerschein' : row.type}</td>
                  <td>{row.date ? (row.date.includes('-') ? window.fmtDE(row.date) : row.date) : '—'}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{statusLabel[row.status] || 'Warte auf Bestätigung'}</StatusBadge></td>
                  <td>{row.note}</td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="eye" size={12} />Status ansehen</button></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', color:'var(--fg-2)', padding:28 }}>
                    Keine offenen Uploads. Nach dem Hochladen erscheint dein Dokument hier bis zur Admin-Bestätigung.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'instructions' && (
        <>
        <PortalSelectionToolbar tab="instructions" count={myInstructions.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="instructions" /></th>
              <th>Unterweisung</th>
              <th>Gruppe</th>
              <th>Datum</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Dokument</th>
            </tr></thead>
            <tbody>
              {myInstructions.map(item => {
                const mine = item.participants.find(p => p.emp === me.id);
                return (
                  <tr key={item.id} className={(selectedPortalIds.instructions || []).includes(item.id) ? 'is-selected' : ''}>
                    <PortalSelectCell tab="instructions" id={item.id} label={item.title} />
                    <td style={{ fontWeight: 650 }}>{item.title}</td>
                    <td>{item.group}</td>
                    <td>{window.fmtDE(item.date)}</td>
                    <td><StatusBadge status={mine?.signed ? 'valid' : 'missing'}>{mine?.signed ? 'Teilgenommen' : 'Fehlt'}</StatusBadge></td>
                    <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="download" size={12} />PDF anzeigen</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'medical' && (
        <>
        <PortalSelectionToolbar tab="medical" count={medicalRows.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="medical" /></th>
              <th>Untersuchung</th>
              <th>Art</th>
              <th>Letzte Untersuchung</th>
              <th>Nächste Untersuchung</th>
              <th>Arzt / Anbieter</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Bescheinigung</th>
            </tr></thead>
            <tbody>
              {medicalRows.map(row => (
                <tr key={row.id} className={(selectedPortalIds.medical || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="medical" id={row.id} label={row.exam} />
                  <td style={{ fontWeight: 650 }}>{row.exam}</td>
                  <td><span className={row.type === 'Pflichtvorsorge' ? 'med-type med-type--required' : 'med-type'}>{row.type}</span></td>
                  <td>{row.last}</td>
                  <td>{row.next}</td>
                  <td>{row.provider}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{statusLabel[row.status] || row.status}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="download" size={12} />PDF anzeigen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'jobs' && (
        <>
        <PortalSelectionToolbar tab="jobs" count={jobRows.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="jobs" /></th>
              <th>Stellenbeschreibung</th>
              <th>Position</th>
              <th>Firma</th>
              <th>Version</th>
              <th>Erstellt am</th>
              <th>Unterschrieben am</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Dokument</th>
            </tr></thead>
            <tbody>
              {jobRows.map(row => (
                <tr key={row.id} className={(selectedPortalIds.jobs || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="jobs" id={row.id} label={row.title} />
                  <td style={{ fontWeight: 650 }}>{row.title}</td>
                  <td>{row.position}</td>
                  <td>{row.company}</td>
                  <td>{row.version}</td>
                  <td>{row.created}</td>
                  <td>{row.signed || '—'}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{row.status === 'valid' || (row.signed && row.signed !== '-') ? 'Unterschrieben' : 'Offen'}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="download" size={12} />PDF anzeigen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <div className={'portal-floating-actions ' + (portalActionsOpen ? 'is-open' : '')}>
        {portalActionsOpen && (
          <>
            <div className="portal-fab-item">
              <span className="portal-fab-label">Dokument hochladen</span>
              <button type="button" className="portal-fab portal-fab--upload" onClick={() => { setShowUpload(true); setPortalActionsOpen(false); }} aria-label="Dokument hochladen">
                <Icon name="upload" size={22} />
              </button>
            </div>
            <div className="portal-fab-item">
              <span className="portal-fab-label">Nachricht an Admin</span>
              <button type="button" className="portal-fab portal-fab--chat" onClick={() => { setShowChat(true); setPortalActionsOpen(false); }} aria-label="Nachricht an Admin">
                <Icon name="mail" size={22} />
                <span>1</span>
              </button>
            </div>
          </>
        )}
        <button type="button" className="portal-fab portal-fab--main" onClick={() => setPortalActionsOpen(v => !v)} aria-label={portalActionsOpen ? 'Aktionen schließen' : 'Aktionen öffnen'}>
          <Icon name={portalActionsOpen ? 'x' : 'plus'} size={24} stroke={2.4} />
        </button>
      </div>

      {showUpload && <UploadModal />}
      {showChat && <ChatModal />}
      {previewCert && <PreviewModal />}
    </div>
  );
}

Object.assign(window, { PortalView });
