/* Mitarbeiterportal - stabile kompakte Ansicht fuer Employee Login */

function PortalView({ searchState, setSearchState }) {
  const [activeTab, setActiveTab] = React.useState('certs');
  const [certFilter, setCertFilter] = React.useState('all');
  const [certSort, setCertSort] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('portal_cert_sort')) || { key: null, dir: 'asc' }; }
    catch { return { key: null, dir: 'asc' }; }
  });
  const [portalTableSorts, setPortalTableSorts] = React.useState({});
  const [portalColumnFilters, setPortalColumnFilters] = React.useState({});
  const [portalGroupBy, setPortalGroupBy] = React.useState({});
  const [portalColumnMenu, setPortalColumnMenu] = React.useState(null);
  const [portalFilterPanel, setPortalFilterPanel] = React.useState(null);
  const [portalFilterSearch, setPortalFilterSearch] = React.useState('');
  const [selectedCertIds, setSelectedCertIds] = React.useState([]);
  const [selectedPortalIds, setSelectedPortalIds] = React.useState({ license: [], appointments: [], wartung: [], instructions: [], medical: [], jobs: [], sites: [], befaehigte: [] });
  const [selectedPortalSiteId, setSelectedPortalSiteId] = React.useState(null);
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
          type: item.type || 'F\u00fchrerschein',
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
        type: item.schulung || item.category || 'F\u00fchrerschein',
        origin: item.category || 'Nachweis',
        lastCheck: item.issuedAt ? window.fmtDE(item.issuedAt) : window.fmtDE(window.SEED.today),
        nextCheck: item.expiresAt ? window.fmtDE(item.expiresAt) : '-',
        expiresAt: item.expiresAt ? window.fmtDE(item.expiresAt) : '-',
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
    { id: 'm2', exam: 'G37 L\u00e4rmexposition', type: 'Pflichtvorsorge', last: '08.01.2025', next: '08.01.2028', provider: 'B.A.D. Gesundheitsvorsorge', status: 'valid', document: 'G37_Markus_Brinker.pdf' },
    { id: 'm3', exam: 'G25 Fahr-/Steuert\u00e4tigkeit', type: 'Pflichtvorsorge', last: '20.02.2025', next: '20.02.2026', provider: 'DEKRA Arbeitsmedizin', status: 'planned', document: '' },
    ...adminReleasedMedical,
    ...approvedPortalUploads
      .filter(item => item.type === 'untersuchung')
      .map(item => ({
        id: item.id,
        exam: item.schulung || 'Hochgeladene Untersuchung',
        type: item.category || 'Arbeitsmedizin',
        last: item.issuedAt ? window.fmtDE(item.issuedAt) : '-',
        next: item.expiresAt ? window.fmtDE(item.expiresAt) : '-',
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

  const wartungPortalRows = [
    ...wartungRows.map(entry => ({
      id: entry.id,
      title: entry.schulung || entry.title || 'Dokument',
      date: entry.datum || entry.date || entry.faelligSeit || '',
      type: entry.dokumenttyp || entry.type || 'zertifikat',
      status: 'in_pruefung',
      source: 'Wartungsliste',
      note: entry.notiz || 'Warte auf Bestaetigung Admin',
    })),
    { id: 'demo-wartung-scc017', title: 'SCC 017 Nachweis erneuern', date: '2026-06-12', type: 'zertifikat', status: 'in_pruefung', source: 'Demo', note: 'Warte auf Bestaetigung Admin.' },
    { id: 'demo-wartung-psaga', title: 'PSAgA Unterweisung unterschreiben', date: '2026-06-18', type: 'unterweisung', status: 'in_pruefung', source: 'Demo', note: 'Warte auf Bestaetigung Admin.' },
    { id: 'demo-wartung-g26', title: 'G26 Bescheinigung nachreichen', date: '2026-06-25', type: 'untersuchung', status: 'in_pruefung', source: 'Demo', note: 'Warte auf Bestaetigung Admin.' },
  ];

  const appointmentRows = [
    { id: 'demo-fs', title: 'F\u00fchrerscheinkontrolle', date: '21.04.2027', type: 'fuehrerschein', status: 'geplant', source: 'Kalender' },
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

  const selectedPortalSite = siteReleaseRows.find(site => site.id === selectedPortalSiteId) || null;

  const befaehigteReleaseRows = (() => {
    const demoRows = [
      { id: 'demo-bp-leitern', area: 'Leitern', authorization: 'Beauftragung zur Pruefung befaehigte Person', validFrom: '2025-02-01', validUntil: '2027-02-01', responsible: 'Sabine Janning', document: 'BP_Leitern_Markus_Brinker.pdf', note: 'Pruefung von Leitern und Tritten auf Baustellen.' },
      { id: 'demo-bp-kleinmaschinen', area: 'Kleinmaschinen / -geraete', authorization: 'Interne Geraetepruefung', validFrom: '2025-04-15', validUntil: '2027-04-15', responsible: 'QSGU', document: 'BP_Kleinmaschinen_Markus_Brinker.pdf', note: 'Ruettelplatten, Pumpen und Trennschleifer pruefen.' },
      { id: 'demo-bp-lastaufnahme', area: 'Lastaufnahmeeinrichtungen', authorization: 'Sichtpruefung und Dokumentation', validFrom: '2025-09-10', validUntil: '2027-09-10', responsible: 'Michael Janning', document: 'BP_Lastaufnahme_Markus_Brinker.pdf', note: 'Ketten, Hebebaender und Anschlagpunkte.' },
    ];
    try {
      const saved = JSON.parse(localStorage.getItem('befaehigte_personen_rows_v1') || '[]');
      if (!Array.isArray(saved)) return demoRows;
      const released = saved
        .filter(row => row.releasedToEmployee && row.employeeId === me.id)
        .map(row => ({
          id: row.id,
          area: Array.isArray(row.area) ? row.area.join(', ') : row.area,
          authorization: row.authorization || 'Beauftragung zur Pruefung befaehigte Person',
          validFrom: row.validFrom || '',
          validUntil: row.validUntil || '',
          responsible: row.responsible || 'QSGU',
          document: row.document || '',
          note: row.note || '',
        }));
      return released.length ? [...released, ...demoRows.filter(row => !released.some(item => item.area === row.area))] : demoRows;
    } catch {
      return demoRows;
    }
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
    if (!cert?.expiresAt || cert.status === 'missing') return '-';
    const days = daysUntilCertExpiry(cert.expiresAt);
    if (days === null) return '-';
    if (days < 0) return `vor ${Math.abs(days)} Tagen abgelaufen`;
    if (days === 0) return 'heute';
    if (days === 1) return 'morgen';
    return `in ${days} Tagen`;
  };
  React.useEffect(() => {
    localStorage.setItem('portal_cert_sort', JSON.stringify(certSort));
  }, [certSort]);

  const certHistory = (training, cert) => [
    { version: 'v1.0', uploaded: cert.issuedAt ? window.fmtDE(cert.issuedAt) : '12.01.2025', checked: cert.status === 'missing' ? 'Noch nicht gepr\u00fcft' : '17.01.2025', note: 'Erstnachweis hochgeladen' },
    { version: 'v1.1', uploaded: cert.expiresAt ? window.fmtDE(cert.expiresAt) : '21.04.2026', checked: cert.status === 'missing' ? 'Offen' : '22.04.2026', note: cert.status === 'warn' ? 'Ablaufdatum aktualisiert' : 'Admin-Pr\u00fcfung dokumentiert' },
  ];

  const sortValue = (item, key) => {
    if (key === 'name') return item.training.name || '';
    if (key === 'remaining') return item.cert.expiresAt ? new Date(item.cert.expiresAt).getTime() : 0;
    if (key === 'issuedAt') return item.cert.issuedAt ? new Date(item.cert.issuedAt).getTime() : 0;
    if (key === 'expiresAt') return item.cert.expiresAt ? new Date(item.cert.expiresAt).getTime() : 0;
    if (key === 'status') return ({ valid: 'G\u00fcltig', warn: 'L\u00e4uft bald ab', expired: 'Abgelaufen', missing: 'Fehlt' })[item.cert.status || 'missing'] || '';
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
    valid: 'G\u00fcltig',
    warn: 'L\u00e4uft bald ab',
    expired: 'Abgelaufen',
    missing: 'Fehlt',
    planned: 'Geplant',
    offen: 'Offen',
    erledigt: 'Erledigt',
    in_pruefung: 'Warte auf Bestaetigung',
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
    { id: 'license', label: 'F\u00fchrerschein', count: licenseRows.length },
    { id: 'instructions', label: 'Unterweisungen', count: myInstructions.length },
    { id: 'medical', label: 'Untersuchungsvorsorge', count: medicalRows.length },
    { id: 'jobs', label: 'Stellenbeschreibung', count: jobRows.length },
    { id: 'sites', label: 'Baustellen', count: siteReleaseRows.length },
    { id: 'befaehigte', label: 'Ger\u00e4tepr\u00fcfung', count: befaehigteReleaseRows.length },
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
      <span>{certSort.key === key ? (certSort.dir === 'asc' ? 'A-Z' : 'Z-A') : ''}</span>
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
    setBulkNotice(`${count} Dokument${count === 1 ? '' : 'e'} f\u00fcr Download vorbereitet.`);
  };

  const bulkMessageAdmin = () => {
    const selectedNames = myCerts
      .filter(item => selectedCertIds.includes(item.training.id))
      .map(item => item.training.name);
    setShowChat(true);
    setChatDraft(`Bitte folgende Dokumente pr\u00fcfen: ${selectedNames.join(', ')}`);
    setBulkNotice(`${selectedNames.length} Dokument${selectedNames.length === 1 ? '' : 'e'} in Nachricht an Admin \u00fcbernommen.`);
  };

  const portalTableColumns = {
    certs: [
      { key: 'name', label: 'Zertifikat / Schulung', value: row => row.training.name },
      { key: 'issuedAt', label: 'Ausstellungsdatum', value: row => row.cert.issuedAt ? window.fmtDE(row.cert.issuedAt) : '-' },
      { key: 'expiresAt', label: 'Ablaufdatum', value: row => row.cert.expiresAt ? window.fmtDE(row.cert.expiresAt) : '-' },
      { key: 'remaining', label: 'Restlaufzeit', value: row => certRemaining(row.cert) },
      { key: 'status', label: 'Status', value: row => statusLabel[row.cert.status || 'missing'] || row.cert.status || 'Fehlt' },
    ],
    license: [
      { key: 'type', label: 'Typ F\u00fchrerschein', value: row => row.type },
      { key: 'origin', label: 'F\u00fchrerschein Herkunft', value: row => row.origin },
      { key: 'lastCheck', label: 'Letzte F\u00fchrerscheinkontrolle', value: row => row.lastCheck },
      { key: 'nextCheck', label: 'N\u00e4chste F\u00fchrerscheinkontrolle', value: row => row.nextCheck },
      { key: 'expires', label: 'L\u00e4uft F\u00fchrerschein ab', value: row => row.expires },
      { key: 'status', label: 'Status', value: row => statusLabel[row.status] || row.status },
    ],
    sites: [
      { key: 'name', label: 'Baustelle / Projekt', value: row => row.name },
      { key: 'company', label: 'Firma', value: row => row.company },
      { key: 'projectNr', label: 'Projekt-Nr.', value: row => row.projectNr },
      { key: 'bauleiter', label: 'Bauleiter', value: row => row.bauleiter || '-' },
      { key: 'vorarbeiter', label: 'Vorarbeiter', value: row => row.vorarbeiter || '-' },
      { key: 'team', label: 'Team', value: row => String(row.employees.length) },
      { key: 'status', label: 'Status', value: () => 'Freigegeben' },
    ],
    befaehigte: [
      { key: 'area', label: 'Arbeitsmittel / Ger\u00e4te', value: row => row.area },
      { key: 'authorization', label: 'Beauftragung', value: row => row.authorization },
      { key: 'validFrom', label: 'G\u00fcltig ab', value: row => row.validFrom ? window.fmtDE(row.validFrom) : '-' },
      { key: 'validUntil', label: 'G\u00fcltig bis', value: row => row.validUntil ? window.fmtDE(row.validUntil) : '-' },
      { key: 'responsible', label: 'Verantwortlich', value: row => row.responsible },
      { key: 'note', label: 'Hinweis', value: row => row.note },
    ],
    appointments: [
      { key: 'title', label: 'Termin', value: row => row.title },
      { key: 'date', label: 'Datum', value: row => row.date.includes('-') ? window.fmtDE(row.date) : row.date },
      { key: 'source', label: 'Quelle', value: row => row.source },
      { key: 'type', label: 'Typ', value: row => row.type === 'fuehrerschein' ? 'F\u00fchrerschein' : row.type },
      { key: 'status', label: 'Status', value: row => statusLabel[row.status] || row.status },
    ],
    wartung: [
      { key: 'title', label: 'Dokument', value: row => row.title },
      { key: 'type', label: 'Typ', value: row => row.type === 'fuehrerschein' ? 'F\u00fchrerschein' : row.type },
      { key: 'date', label: 'Eingereicht / F\u00e4llig', value: row => row.date ? (row.date.includes('-') ? window.fmtDE(row.date) : row.date) : '-' },
      { key: 'status', label: 'Status', value: row => statusLabel[row.status] || 'Warte auf Best\u00e4tigung' },
      { key: 'source', label: 'Quelle', value: row => row.source },
      { key: 'note', label: 'Hinweis', value: row => row.note },
    ],
    instructions: [
      { key: 'title', label: 'Unterweisung', value: row => row.title },
      { key: 'group', label: 'Gruppe', value: row => row.group },
      { key: 'date', label: 'Datum', value: row => window.fmtDE(row.date) },
      { key: 'status', label: 'Status', value: row => row.participants.find(p => p.emp === me.id)?.signed ? 'Teilgenommen' : 'Fehlt' },
    ],
    medical: [
      { key: 'exam', label: 'Untersuchung', value: row => row.exam },
      { key: 'type', label: 'Art', value: row => row.type },
      { key: 'last', label: 'Letzte Untersuchung', value: row => row.last },
      { key: 'next', label: 'N\u00e4chste Untersuchung', value: row => row.next },
      { key: 'provider', label: 'Arzt / Anbieter', value: row => row.provider },
      { key: 'status', label: 'Status', value: row => statusLabel[row.status] || row.status },
    ],
    jobs: [
      { key: 'title', label: 'Stellenbeschreibung', value: row => row.title },
      { key: 'position', label: 'Position', value: row => row.position },
      { key: 'company', label: 'Firma', value: row => row.company },
      { key: 'issued', label: 'Ausgestellt am', value: row => row.issued },
      { key: 'version', label: 'Version / Stand', value: row => row.version },
      { key: 'status', label: 'Status', value: row => statusLabel[row.status] || row.status },
    ],
  };

  const portalColumnValue = (tab, row, key) => {
    const col = (portalTableColumns[tab] || []).find(item => item.key === key);
    return col ? String(col.value(row) ?? '-') : '';
  };

  const applyPortalTable = (tab, rows) => {
    const filters = portalColumnFilters[tab] || {};
    const sort = portalTableSorts[tab];
    const groupKey = portalGroupBy[tab];
    let output = rows.filter(row => Object.entries(filters).every(([key, values]) => !values?.length || values.includes(portalColumnValue(tab, row, key))));
    if (sort?.key) {
      output = [...output].sort((a, b) => {
        const result = portalColumnValue(tab, a, sort.key).localeCompare(portalColumnValue(tab, b, sort.key), 'de', { numeric: true, sensitivity: 'base' });
        return sort.dir === 'asc' ? result : -result;
      });
    }
    if (groupKey && (!sort || sort.key !== groupKey)) {
      output = [...output].sort((a, b) => portalColumnValue(tab, a, groupKey).localeCompare(portalColumnValue(tab, b, groupKey), 'de', { numeric: true, sensitivity: 'base' }));
    }
    return output;
  };

  const portalTableRows = {
    certs: applyPortalTable('certs', filteredCerts),
    license: applyPortalTable('license', licenseRows),
    appointments: applyPortalTable('appointments', appointmentRows),
    wartung: applyPortalTable('wartung', wartungPortalRows),
    instructions: applyPortalTable('instructions', myInstructions),
    medical: applyPortalTable('medical', medicalRows),
    jobs: applyPortalTable('jobs', jobRows),
    sites: applyPortalTable('sites', siteReleaseRows),
    befaehigte: applyPortalTable('befaehigte', befaehigteReleaseRows),
  };

  const portalRowIds = {
    license: portalTableRows.license.map(row => row.type),
    appointments: portalTableRows.appointments.map(row => row.id),
    wartung: portalTableRows.wartung.map(row => row.id),
    instructions: portalTableRows.instructions.map(item => item.id),
    medical: portalTableRows.medical.map(row => row.id),
    jobs: portalTableRows.jobs.map(row => row.id),
    sites: portalTableRows.sites.map(row => row.id),
    befaehigte: portalTableRows.befaehigte.map(row => row.id),
  };

  const portalSelectionLabel = (tab, id) => {
    if (tab === 'license') return licenseRows.find(row => row.type === id)?.type || id;
    if (tab === 'appointments') return appointmentRows.find(row => row.id === id)?.title || id;
    if (tab === 'wartung') return wartungPortalRows.find(row => row.id === id)?.title || id;
    if (tab === 'instructions') return myInstructions.find(item => item.id === id)?.title || id;
    if (tab === 'medical') return medicalRows.find(row => row.id === id)?.exam || id;
    if (tab === 'jobs') return jobRows.find(row => row.id === id)?.title || id;
    if (tab === 'sites') return siteReleaseRows.find(row => row.id === id)?.name || id;
    if (tab === 'befaehigte') return befaehigteReleaseRows.find(row => row.id === id)?.area || id;
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
    setBulkNotice(`${count} Dokument${count === 1 ? '' : 'e'} f\u00fcr Download vorbereitet.`);
  };

  const portalBulkMessageAdmin = (tab) => {
    const selectedNames = (selectedPortalIds[tab] || []).map(id => portalSelectionLabel(tab, id));
    setShowChat(true);
    setChatDraft(`Bitte folgende Eintr\u00e4ge pr\u00fcfen: ${selectedNames.join(', ')}`);
    setBulkNotice(`${selectedNames.length} Eintr\u00e4g${selectedNames.length === 1 ? '' : 'e'} in Nachricht an Admin \u00fcbernommen.`);
  };

  const PortalSelectionToolbar = ({ tab, count }) => {
    const selected = selectedPortalIds[tab] || [];
    return (
      <>
        <div className="portal-list-toolbar">
          <div><strong>{count}</strong> Eintr&auml;ge</div>
          {selected.length > 0 && (
            <div className="portal-bulk-actions">
              <span>{selected.length} ausgew&auml;hlt</span>
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
    return <input type="checkbox" checked={ids.length > 0 && ids.every(id => selected.includes(id))} onChange={() => toggleAllPortalRows(tab)} aria-label="Alle sichtbaren Eintr\u00e4ge ausw\u00e4hlen" />;
  };

  const PortalSelectCell = ({ tab, id, label }) => (
    <td data-label="Auswahl"><input type="checkbox" checked={(selectedPortalIds[tab] || []).includes(id)} onChange={() => togglePortalSelection(tab, id)} aria-label={`${label} ausw\u00e4hlen`} /></td>
  );

  const setPortalSort = (tab, key, dir) => {
    setPortalTableSorts(current => ({ ...current, [tab]: { key, dir } }));
    setPortalColumnMenu(null);
  };

  const openPortalFilter = (tab, key) => {
    setPortalFilterPanel({ tab, key });
    setPortalFilterSearch('');
    setPortalColumnMenu(null);
  };

  const togglePortalFilterValue = (tab, key, value) => {
    setPortalColumnFilters(current => {
      const tabFilters = current[tab] || {};
      const selected = tabFilters[key] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [tab]: { ...tabFilters, [key]: next } };
    });
  };

  const clearPortalFilter = (tab, key) => {
    setPortalColumnFilters(current => ({ ...current, [tab]: { ...(current[tab] || {}), [key]: [] } }));
  };

  const PortalColumnHeader = ({ tab, col }) => {
    const menuId = tab + ':' + col.key;
    const sort = portalTableSorts[tab];
    const active = sort?.key === col.key || (portalColumnFilters[tab]?.[col.key] || []).length > 0 || portalGroupBy[tab] === col.key;
    return (
      <th style={{ position:'relative', whiteSpace:'nowrap' }}>
        <button type="button" className={'portal-sort-head ' + (active ? 'is-active' : '')} onClick={() => setPortalColumnMenu(portalColumnMenu === menuId ? null : menuId)}>
          {col.label}
          <span>{sort?.key === col.key ? (sort.dir === 'asc' ? 'A-Z' : 'Z-A') : 'v'}</span>
        </button>
        {portalColumnMenu === menuId && (
          <div className="portal-column-menu">
            <button type="button" onClick={() => setPortalSort(tab, col.key, 'asc')}>A bis Z</button>
            <button type="button" onClick={() => setPortalSort(tab, col.key, 'desc')}>Z bis A</button>
            <button type="button" onClick={() => openPortalFilter(tab, col.key)}>Filtern nach</button>
            <button type="button" onClick={() => { setPortalGroupBy(current => ({ ...current, [tab]: current[tab] === col.key ? '' : col.key })); setPortalSort(tab, col.key, 'asc'); }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  const PortalTableTools = ({ tab, count }) => {
    const filters = portalColumnFilters[tab] || {};
    const hasFilters = Object.values(filters).some(values => values?.length);
    const sort = portalTableSorts[tab];
    const group = portalGroupBy[tab];
    if (!hasFilters && !sort?.key && !group) return null;
    return (
      <div className="portal-table-tools">
        {sort?.key && <button type="button" onClick={() => setPortalTableSorts(current => ({ ...current, [tab]: null }))}>Sortierung zur&uuml;cksetzen</button>}
        {group && <button type="button" onClick={() => setPortalGroupBy(current => ({ ...current, [tab]: '' }))}>Gruppierung aufheben</button>}
        {hasFilters && <button type="button" onClick={() => setPortalColumnFilters(current => ({ ...current, [tab]: {} }))}>Alle Filter l&ouml;schen</button>}
        <span>{count} sichtbar</span>
      </div>
    );
  };

  const PortalGroupRow = ({ tab, rows, row, index, colSpan }) => {
    const key = portalGroupBy[tab];
    if (!key) return null;
    const value = portalColumnValue(tab, row, key);
    const previous = index > 0 ? portalColumnValue(tab, rows[index - 1], key) : null;
    if (value === previous) return null;
    const label = (portalTableColumns[tab] || []).find(col => col.key === key)?.label || key;
    return <tr className="portal-group-row"><td colSpan={colSpan}>{label}: {value}</td></tr>;
  };

  const PortalFilterPanel = () => {
    if (!portalFilterPanel) return null;
    const { tab, key } = portalFilterPanel;
    const col = (portalTableColumns[tab] || []).find(item => item.key === key);
    const sourceRows = ({
      certs: filteredCerts,
      license: licenseRows,
      appointments: appointmentRows,
      wartung: wartungPortalRows,
      instructions: myInstructions,
      medical: medicalRows,
      jobs: jobRows,
      sites: siteReleaseRows,
      befaehigte: befaehigteReleaseRows,
    })[tab] || [];
    const values = Array.from(new Set(sourceRows.map(row => portalColumnValue(tab, row, key)))).sort((a, b) => a.localeCompare(b, 'de', { numeric: true, sensitivity: 'base' }));
    const visibleValues = values.filter(value => value.toLowerCase().includes(portalFilterSearch.toLowerCase()));
    const selected = portalColumnFilters[tab]?.[key] || [];
    return (
      <div className="portal-filter-backdrop" onClick={() => setPortalFilterPanel(null)}>
        <aside className="portal-filter-panel" onClick={event => event.stopPropagation()}>
          <div className="portal-filter-panel__head">
            <h2>Filtern nach "{col?.label || key}"</h2>
            <button type="button" className="icon-btn" onClick={() => setPortalFilterPanel(null)}><Icon name="x" size={18} /></button>
          </div>
          <input className="input" value={portalFilterSearch} onChange={event => setPortalFilterSearch(event.target.value)} placeholder="Text eingeben, um Filter zu finden" />
          <div className="portal-filter-panel__values">
            {visibleValues.map(value => (
              <label key={value}>
                <input type="checkbox" checked={selected.includes(value)} onChange={() => togglePortalFilterValue(tab, key, value)} />
                <span>{value || '-'}</span>
              </label>
            ))}
          </div>
          <div className="portal-filter-panel__actions">
            <button type="button" className="btn btn--primary" onClick={() => setPortalFilterPanel(null)}>Anwenden</button>
            <button type="button" className="btn btn--ghost" onClick={() => clearPortalFilter(tab, key)}>Auswahl aufheben</button>
          </div>
        </aside>
      </div>
    );
  };

  const uploadTypes = [
    { id: 'cert', label: 'Meine Zertifikate', icon: 'doc' },
    { id: 'instr', label: 'Meine Unterweisungen', icon: 'flag' },
    { id: 'medical', label: 'Meine Untersuchungsvorsorge', icon: 'shield' },
    { id: 'job', label: 'Meine Stellenbeschreibung', icon: 'doc' },
    { id: 'license', label: 'Mein F\u00fchrerschein', icon: 'cap' },
  ];

  const uploadLabels = {
    cert: ['Zertifikat / Schulung', 'Kategorie', 'Ausstellungsdatum', 'Ablaufdatum'],
    instr: ['Unterweisung', 'Kategorie', 'Datum', 'G\u00fcltig bis / Version vom'],
    medical: ['Untersuchung', 'Art', 'Untersuchungsdatum', 'N\u00e4chste Untersuchung'],
    job: ['Stellenbeschreibung', 'Position', 'Ausgestellt am', 'Version / Stand'],
    license: ['F\u00fchrerscheinklasse', 'Herkunft', 'Kontrolldatum', 'Ablaufdatum'],
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
      notiz: 'Upload vom Mitarbeiter - Warte auf Best\u00e4tigung Admin',
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
      title: 'Neuer Dokument-Upload wartet auf Best\u00e4tigung',
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
      setChatMessages(items => [...items, { id: 'a' + Date.now(), from: 'admin', text: 'Danke, ich pr\u00fcfe das und melde mich.', time }]);
    }, 800);
  };

  const deleteOwnMessage = (id) => {
    setChatMessages(items => items.map(item => item.id === id && item.from === 'me' && Date.now() < item.canDeleteUntil
      ? { ...item, text: 'Nachricht gel\u00f6scht', deleted: true }
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
              <p>{uploadType ? uploadTypes.find(t => t.id === uploadType)?.label : 'Dokumenttyp ausw&auml;hlen'}</p>
            </div>
            <button className="icon-btn" onClick={resetUpload}><Icon name="x" size={16} /></button>
          </div>

          {uploadDone ? (
            <div className="portal-modal__done">
              <div>OK</div>
              <h3>Upload eingereicht</h3>
              <p>Status: Warte auf Best&auml;tigung Admin. Nach Genehmigung erscheint das Dokument in deiner Liste.</p>
              <button className="btn btn--primary" onClick={resetUpload}>Schlie&szlig;en</button>
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
                  {['Sicherheit', 'SCC', 'DVGW', 'Fahrerlaubnis', 'Unterweisung', 'Arbeitsmedizin', 'Stellenbeschreibung', 'F\u00fchrerschein'].map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label><span>{labels[2]}</span><input type="date" value={uploadForm.issuedAt} onChange={e => setUploadForm(f => ({ ...f, issuedAt: e.target.value }))} /></label>
              <label><span>{labels[3]}</span><input type="date" value={uploadForm.expiresAt} onChange={e => setUploadForm(f => ({ ...f, expiresAt: e.target.value }))} /></label>
              <label><span>Datei hochladen (PDF / Bild)</span><input type="file" accept=".pdf,image/*" onChange={e => setUploadForm(f => ({ ...f, fileName: e.target.files?.[0]?.name || '' }))} /></label>
              <div className="portal-readonly-status"><span>Status</span><strong>Warte auf Best&auml;tigung Admin</strong></div>
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
            <p>Admin hat vollst&auml;ndigen Verlauf</p>
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
        {chatStatus !== 'active' && <div className="portal-chat__status">{chatStatus === 'archived' ? 'Chat archiviert' : 'Als erledigt markiert'} <button onClick={() => setChatStatus('active')}>Zur&uuml;cksetzen</button></div>}
        <div className="portal-chat__body">
          {chatMessages.map(item => (
            <div key={item.id} className={'portal-chat-msg ' + (item.from === 'me' ? 'is-me' : 'is-admin')}>
              <div>{item.text}</div>
              <span>{item.time}</span>
              {item.from === 'me' && !item.deleted && Date.now() < item.canDeleteUntil && <button onClick={() => deleteOwnMessage(item.id)}>L&ouml;schen</button>}
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
              <p>Kategorie: {certCategory(previewCert.training) || '-'}</p>
              <p>Ablaufdatum: {previewCert.cert.expiresAt ? window.fmtDE(previewCert.cert.expiresAt) : '-'}</p>
              <span>{statusLabel[previewCert.cert.status || 'missing']}</span>
            </div>
          </div>
          <div className="portal-history-list">
            <h3>Historie / Verlauf</h3>
            {history.map(item => (
              <div key={item.version}>
                <strong>{item.version}</strong>
                <span>Hochgeladen: {item.uploaded}</span>
                <span>Gepr&uuml;ft: {item.checked}</span>
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
      <div className="portal-section-kpis" role="tablist" aria-label="Mitarbeiterportal Bereiche">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={'portal-section-kpi ' + (activeTab === tab.id ? 'is-active' : '')}
            onClick={() => { setActiveTab(tab.id); if (tab.id === 'certs') setCertsFilter('all'); }}
          >
            <span className="portal-section-kpi__label">{tab.label}</span>
            <strong>{tab.count}</strong>
          </button>
        ))}
      </div>
      {activeTab === 'certs' && (
        <>
        <div className="portal-list-toolbar">
          <div>
            <strong>{portalTableRows.certs.length}</strong> Eintr&auml;ge
            {certFilter !== 'all' && <button type="button" onClick={() => setCertsFilter('all')}>Filter zur&uuml;cksetzen</button>}
          </div>
          {selectedCertIds.length > 0 && (
            <div className="portal-bulk-actions">
              <span>{selectedCertIds.length} ausgew&auml;hlt</span>
              <button type="button" className="job-small-btn" onClick={bulkDownload}><Icon name="download" size={12} />Download</button>
              <button type="button" className="job-small-btn" onClick={bulkMessageAdmin}><Icon name="mail" size={12} />Nachricht an Admin</button>
            </div>
          )}
        </div>
        <PortalTableTools tab="certs" count={portalTableRows.certs.length} />
        {bulkNotice && <div className="portal-inline-notice">{bulkNotice}</div>}
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}>
                <input type="checkbox" checked={filteredCerts.length > 0 && visibleSelectedCount === filteredCerts.length} onChange={toggleAllVisibleCerts} aria-label="Alle sichtbaren Zertifikate ausw\u00e4hlen" />
              </th>
              {portalTableColumns.certs.map(col => <PortalColumnHeader key={col.key} tab="certs" col={col} />)}
              <th style={{ textAlign: 'center' }}>Dokument</th>
              <th style={{ textAlign: 'center' }}>Versionen</th>
            </tr></thead>
            <tbody>
              {portalTableRows.certs.map(({ training, cert }, index) => (
                <React.Fragment key={training.id}>
                <PortalGroupRow tab="certs" rows={portalTableRows.certs} row={{ training, cert }} index={index} colSpan={8} />
                <tr className={[
                  selectedCertIds.includes(training.id) ? 'is-selected' : '',
                  certUrgency(cert) ? 'portal-cert-row--' + certUrgency(cert) : '',
                  cert.status === 'missing' && training.mandatory ? 'portal-cert-row--missing-required' : '',
                ].filter(Boolean).join(' ')}>
                  <td data-label="Auswahl"><input type="checkbox" checked={selectedCertIds.includes(training.id)} onChange={() => toggleCertSelection(training.id)} aria-label={`${training.name} ausw\u00e4hlen`} /></td>
                  <td style={{ fontWeight: 650 }}>
                    <div className="portal-cert-title">
                      <span>{training.name}</span>
                      {training.mandatory && <span className={'portal-required-badge ' + (cert.status === 'missing' ? 'is-missing' : '')}>Pflicht</span>}
                      {cert.approvedByAdmin && <span className="portal-required-badge">Freigegeben</span>}
                    </div>
                    {cert.status === 'missing' && training.mandatory && <div className="portal-missing-note">Pflicht-Zertifikat fehlt fuer diesen Mitarbeiter</div>}
                  </td>
                  <td>{cert.issuedAt ? window.fmtDE(cert.issuedAt) : '-'}</td>
                  <td>
                    <div className="portal-expiry-cell">
                      <span>{cert.expiresAt ? window.fmtDE(cert.expiresAt) : '-'}</span>
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
                        <small>Ablauf: {cert.expiresAt ? window.fmtDE(cert.expiresAt) : '-'}</small>
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
                            <span>Gepr&uuml;ft: {item.checked}</span>
                            <em>{item.note}</em>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
              {portalTableRows.certs.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--fg-3)', padding: 24 }}>Keine Zertifikate f&uuml;r diesen Filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'license' && (
        <>
        <PortalSelectionToolbar tab="license" count={portalTableRows.license.length} />
        <PortalTableTools tab="license" count={portalTableRows.license.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="license" /></th>
              {portalTableColumns.license.map(col => <PortalColumnHeader key={col.key} tab="license" col={col} />)}
              <th style={{ textAlign: 'center' }}>F&uuml;hrerschein ansehen</th>
              <th style={{ textAlign: 'center' }}>Kontrollformular ansehen</th>
            </tr></thead>
            <tbody>
              {portalTableRows.license.map((row, index) => (
                <React.Fragment key={row.type}>
                <PortalGroupRow tab="license" rows={portalTableRows.license} row={row} index={index} colSpan={9} />
                <tr className={(selectedPortalIds.license || []).includes(row.type) ? 'is-selected' : ''}>
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
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'sites' && (
        <>
        <PortalSelectionToolbar tab="sites" count={portalTableRows.sites.length} />
        <PortalTableTools tab="sites" count={portalTableRows.sites.length} />
        <div className={'job-layout portal-sites-layout' + (selectedPortalSite ? ' job-layout--detail-open portal-sites-layout--detail-open' : '')}>
          <div className="tbl-wrap job-table-wrap">
            <table className="tbl job-table portal-select-table portal-sites-table">
              <thead><tr>
                <th style={{ width: 44 }}><PortalSelectAll tab="sites" /></th>
                {portalTableColumns.sites.map(col => <PortalColumnHeader key={col.key} tab="sites" col={col} />)}
              </tr></thead>
              <tbody>
                {portalTableRows.sites.length ? portalTableRows.sites.map((site, index) => (
                  <React.Fragment key={site.id}>
                  <PortalGroupRow tab="sites" rows={portalTableRows.sites} row={site} index={index} colSpan={8} />
                  <tr className={'job-row' + (selectedPortalSite?.id === site.id ? ' job-row--active' : '')} onClick={() => setSelectedPortalSiteId(site.id)} style={{ cursor:'pointer' }}>
                    <PortalSelectCell tab="sites" id={site.id} label={site.name} />
                    <td><strong>{site.name}</strong><div className="small muted">{site.projectName || site.name}</div></td>
                    <td>{site.company}</td>
                    <td>{site.projectNr}</td>
                    <td>{site.bauleiter || '-'}</td>
                    <td>{site.vorarbeiter || '-'}</td>
                    <td>{site.employees.length}</td>
                    <td><span className="badge badge--valid"><span className="badge__dot" />Freigegeben</span></td>
                  </tr>
                  </React.Fragment>
                )) : (
                  <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--fg-2)', padding:28 }}>Keine Baustelle freigegeben. Sobald der Bauleiter dich freischaltet, erscheint sie hier.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedPortalSite && (
            <aside className="job-detail portal-sites-detail">
              <div className="job-detail__head">
                <div>
                  <div className="eyebrow">Baustelle</div>
                  <h2>{selectedPortalSite.name}</h2>
                  <p>{selectedPortalSite.projectNr} - {selectedPortalSite.company}</p>
                </div>
                <div className="job-detail__actions">
                  <button className="icon-btn" type="button" onClick={() => setSelectedPortalSiteId(null)} aria-label="Detail schliessen"><Icon name="x" size={16} /></button>
                </div>
              </div>

              <div className="job-sign-panel">
                <span className="badge badge--valid"><span className="badge__dot" />Freigegeben</span>
                <div className="bar"><div className="bar__fill bar__fill--valid" style={{ width:'100%' }} /></div>
                <small>Du darfst diese Baustelleninformationen im Mitarbeiterportal sehen.</small>
              </div>

              <section className="job-detail-section">
                <h3>Baustellen-Daten</h3>
                <div className="med-detail-grid">
                  <div><span>Projekt</span><strong>{selectedPortalSite.projectName || selectedPortalSite.name}</strong></div>
                  <div><span>Auftraggeber</span><strong>{selectedPortalSite.auftraggeber || '-'}</strong></div>
                  <div><span>Bauleiter</span><strong>{selectedPortalSite.bauleiter || '-'}</strong></div>
                  <div><span>Vorarbeiter</span><strong>{selectedPortalSite.vorarbeiter || '-'}</strong></div>
                  <div style={{ gridColumn:'1 / -1' }}><span>Adresse</span><strong>{selectedPortalSite.adresse || '-'}</strong></div>
                </div>
              </section>

              <section className="job-detail-section">
                <h3>Team</h3>
                <div style={{ display:'grid', gap:8 }}>
                  {selectedPortalSite.employees.map(emp => (
                    <div key={emp.id} style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border-1)' }}>
                      <span><strong>{emp.name}</strong><span className="small muted" style={{ display:'block' }}>{window.company(emp.company)?.short || emp.company} - {emp.position}</span></span>
                      {selectedPortalSite.firstAiders.some(item => item.id === emp.id) && <span className="badge badge--valid"><span className="badge__dot" />Ersthelfer</span>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="job-detail-section">
                <h3>Dokumente</h3>
                <div style={{ display:'grid', gap:8 }}>
                  {selectedPortalSite.documents.map(doc => (
                    <button key={doc} className="job-small-btn" style={{ justifyContent:'space-between' }}><span><Icon name="doc" size={12} /> {doc}</span><span>Anzeigen</span></button>
                  ))}
                </div>
              </section>
            </aside>
          )}
        </div>
        </>
      )}      {activeTab === 'befaehigte' && (
        <>
        <PortalSelectionToolbar tab="befaehigte" count={portalTableRows.befaehigte.length} />
        <PortalTableTools tab="befaehigte" count={portalTableRows.befaehigte.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="befaehigte" /></th>
              {portalTableColumns.befaehigte.map(col => <PortalColumnHeader key={col.key} tab="befaehigte" col={col} />)}
              <th style={{ textAlign: 'center' }}>Dokument</th>
            </tr></thead>
            <tbody>
              {portalTableRows.befaehigte.length ? portalTableRows.befaehigte.map((row, index) => (
                <React.Fragment key={row.id}>
                <PortalGroupRow tab="befaehigte" rows={portalTableRows.befaehigte} row={row} index={index} colSpan={8} />
                <tr className={(selectedPortalIds.befaehigte || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="befaehigte" id={row.id} label={row.area} />
                  <td style={{ fontWeight: 650 }}>{row.area}</td>
                  <td>{row.authorization}</td>
                  <td>{row.validFrom ? window.fmtDE(row.validFrom) : '-'}</td>
                  <td>{row.validUntil ? window.fmtDE(row.validUntil) : '-'}</td>
                  <td>{row.responsible}</td>
                  <td>{row.note}</td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="download" size={12} />PDF anzeigen</button></td>
                </tr>
                </React.Fragment>
              )) : (
                <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--fg-2)', padding:28 }}>Keine Ger&auml;tepr&uuml;fung freigegeben. Sobald eine bef&auml;higte Person freigegeben wird, erscheint sie hier.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'appointments' && (
        <>
        <PortalSelectionToolbar tab="appointments" count={portalTableRows.appointments.length} />
        <PortalTableTools tab="appointments" count={portalTableRows.appointments.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="appointments" /></th>
              {portalTableColumns.appointments.map(col => <PortalColumnHeader key={col.key} tab="appointments" col={col} />)}
              <th style={{ textAlign: 'center' }}>Aktion</th>
            </tr></thead>
            <tbody>
              {portalTableRows.appointments.map((row, index) => (
                <React.Fragment key={row.id}>
                <PortalGroupRow tab="appointments" rows={portalTableRows.appointments} row={row} index={index} colSpan={7} />
                <tr className={(selectedPortalIds.appointments || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="appointments" id={row.id} label={row.title} />
                  <td style={{ fontWeight: 650 }}>{row.title}</td>
                  <td>{row.date ? (row.date.includes('-') ? window.fmtDE(row.date) : row.date) : '-'}</td>
                  <td>{row.source}</td>
                  <td>{row.type === 'fuehrerschein' ? 'F\u00fchrerschein' : row.type}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{statusLabel[row.status] || row.status}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="cal" size={12} />Termin ansehen</button></td>
                </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'wartung' && (
        <>
        <PortalSelectionToolbar tab="wartung" count={portalTableRows.wartung.length} />
        <PortalTableTools tab="wartung" count={portalTableRows.wartung.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="wartung" /></th>
              {portalTableColumns.wartung.map(col => <PortalColumnHeader key={col.key} tab="wartung" col={col} />)}
              <th style={{ textAlign: 'center' }}>Aktion</th>
            </tr></thead>
            <tbody>
              {portalTableRows.wartung.length ? portalTableRows.wartung.map((row, index) => (
                <React.Fragment key={row.id}>
                <PortalGroupRow tab="wartung" rows={portalTableRows.wartung} row={row} index={index} colSpan={7} />
                <tr className={(selectedPortalIds.wartung || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="wartung" id={row.id} label={row.title} />
                  <td style={{ fontWeight: 650 }}>{row.title}</td>
                  <td>{row.type === 'fuehrerschein' ? 'F\u00fchrerschein' : row.type}</td>
                  <td>{row.date ? (row.date.includes('-') ? window.fmtDE(row.date) : row.date) : '-'}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{statusLabel[row.status] || 'Warte auf Best\u00e4tigung'}</StatusBadge></td>
                  <td>{row.note}</td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="eye" size={12} />Status ansehen</button></td>
                </tr>
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', color:'var(--fg-2)', padding:28 }}>
                    Keine offenen Uploads. Nach dem Hochladen erscheint dein Dokument hier bis zur Admin-Best&auml;tigung.
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
        <PortalSelectionToolbar tab="instructions" count={portalTableRows.instructions.length} />
        <PortalTableTools tab="instructions" count={portalTableRows.instructions.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="instructions" /></th>
              {portalTableColumns.instructions.map(col => <PortalColumnHeader key={col.key} tab="instructions" col={col} />)}
              <th style={{ textAlign: 'center' }}>Dokument</th>
            </tr></thead>
            <tbody>
              {portalTableRows.instructions.map((item, index) => {
                const mine = item.participants.find(p => p.emp === me.id);
                return (
                  <React.Fragment key={item.id}>
                  <PortalGroupRow tab="instructions" rows={portalTableRows.instructions} row={item} index={index} colSpan={6} />
                  <tr key={item.id} className={(selectedPortalIds.instructions || []).includes(item.id) ? 'is-selected' : ''}>
                    <PortalSelectCell tab="instructions" id={item.id} label={item.title} />
                    <td style={{ fontWeight: 650 }}>{item.title}</td>
                    <td>{item.group}</td>
                    <td>{window.fmtDE(item.date)}</td>
                    <td><StatusBadge status={mine?.signed ? 'valid' : 'missing'}>{mine?.signed ? 'Teilgenommen' : 'Fehlt'}</StatusBadge></td>
                    <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="download" size={12} />PDF anzeigen</button></td>
                  </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'medical' && (
        <>
        <PortalSelectionToolbar tab="medical" count={portalTableRows.medical.length} />
        <PortalTableTools tab="medical" count={portalTableRows.medical.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="medical" /></th>
              {portalTableColumns.medical.map(col => <PortalColumnHeader key={col.key} tab="medical" col={col} />)}
              <th style={{ textAlign: 'center' }}>Bescheinigung</th>
            </tr></thead>
            <tbody>
              {portalTableRows.medical.map((row, index) => (
                <React.Fragment key={row.id}>
                <PortalGroupRow tab="medical" rows={portalTableRows.medical} row={row} index={index} colSpan={8} />
                <tr className={(selectedPortalIds.medical || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="medical" id={row.id} label={row.exam} />
                  <td style={{ fontWeight: 650 }}>{row.exam}</td>
                  <td><span className={row.type === 'Pflichtvorsorge' ? 'med-type med-type--required' : 'med-type'}>{row.type}</span></td>
                  <td>{row.last}</td>
                  <td>{row.next}</td>
                  <td>{row.provider}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{statusLabel[row.status] || row.status}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="download" size={12} />PDF anzeigen</button></td>
                </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {activeTab === 'jobs' && (
        <>
        <PortalSelectionToolbar tab="jobs" count={portalTableRows.jobs.length} />
        <PortalTableTools tab="jobs" count={portalTableRows.jobs.length} />
        <div className="tbl-wrap">
          <table className="tbl portal-select-table">
            <thead><tr>
              <th style={{ width: 44 }}><PortalSelectAll tab="jobs" /></th>
              {portalTableColumns.jobs.map(col => <PortalColumnHeader key={col.key} tab="jobs" col={col} />)}
              <th style={{ textAlign: 'center' }}>Dokument</th>
            </tr></thead>
            <tbody>
              {portalTableRows.jobs.map((row, index) => (
                <React.Fragment key={row.id}>
                <PortalGroupRow tab="jobs" rows={portalTableRows.jobs} row={row} index={index} colSpan={9} />
                <tr className={(selectedPortalIds.jobs || []).includes(row.id) ? 'is-selected' : ''}>
                  <PortalSelectCell tab="jobs" id={row.id} label={row.title} />
                  <td style={{ fontWeight: 650 }}>{row.title}</td>
                  <td>{row.position}</td>
                  <td>{row.company}</td>
                  <td>{row.version}</td>
                  <td>{row.created}</td>
                  <td>{row.signed || '-'}</td>
                  <td><StatusBadge status={statusToBadge(row.status)}>{row.status === 'valid' || (row.signed && row.signed !== '-') ? 'Unterschrieben' : 'Offen'}</StatusBadge></td>
                  <td style={{ textAlign: 'center' }}><button className="job-small-btn"><Icon name="download" size={12} />PDF anzeigen</button></td>
                </tr>
                </React.Fragment>
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
        <button type="button" className="portal-fab portal-fab--main" onClick={() => setPortalActionsOpen(v => !v)} aria-label={portalActionsOpen ? 'Aktionen schlie\u00dfen' : 'Aktionen \u00f6ffnen'}>
          <Icon name={portalActionsOpen ? 'x' : 'plus'} size={24} stroke={2.4} />
        </button>
      </div>

      {showUpload && <UploadModal />}
      {showChat && <ChatModal />}
      {previewCert && <PreviewModal />}
      <PortalFilterPanel />
    </div>
  );
}

Object.assign(window, { PortalView });
