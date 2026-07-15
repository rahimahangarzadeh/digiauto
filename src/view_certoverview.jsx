/* Zertifizierungsübersicht - Zertifikate, Audits und Verlängerungen */

function CertOverviewView({ activeCompany = 'all', extraAction = null }) {
  const companies = React.useMemo(() => (window.SEED?.companies || []).map(company => ({ ...company })), []);
  const employees = window.SEED?.employees || [];
  const today = new Date(window.SEED?.today || '2026-04-21');

  const baseCerts = React.useMemo(() => ([
    cert('c-scc', 'SCC** Sicherheits Certificat Contractors', 'tiefbau', 'SCC-2026-014', 'SCC-VAC 2007', 'Tiefbau, Kanalbau und Baustellenleitung', '2025-05-28', '2025-05-28', '2026-05-28', 'DEKRA Certification GmbH', 'Sabine Janning', '60 Tage', ['SCC_Zertifikat_2025.pdf'], 'Verlängerung in Vorbereitung', 'Audit geplant'),
    cert('c-gw301', 'DVGW GW 301', 'tiefbau', 'GW301-2026-018', 'GW 301', 'Rohrnetzbauten Gas/Wasser', '2025-10-19', '2025-10-19', '2026-10-19', 'DVGW Cert GmbH', 'Christian Janning', '90 Tage', ['GW301_Nachweis.pdf'], 'Noch nicht begonnen', 'Audit erforderlich'),
    cert('c-awsv', 'Paragraph 62 AwSV', 'tiefbau', 'AWSV-2024-009', 'AwSV', 'Arbeiten an wassergefährdenden Stoffen', '2024-03-31', '2024-03-31', '2026-03-31', 'TÜV Nord', 'Rahim Ahangarzadeh', '30 Tage', ['AwSV_Prüfung.pdf'], 'Noch nicht begonnen', 'Abgelaufen'),
    cert('c-iso9001-b', 'DIN EN ISO 9001:2015', 'bohrtechnik', 'ISO-B-091', 'ISO 9001', 'Horizontalbohrungen und grabenlose Verlegetechnik', '2025-09-15', '2025-09-15', '2027-09-15', 'TÜV Rheinland', 'Andreas Janning', '90 Tage', ['ISO9001_Bohrtechnik.pdf'], 'Abgeschlossen', 'Freigegeben'),
    cert('c-iso45001-b', 'ISO 45001:2018', 'bohrtechnik', 'ISO45-B-044', 'ISO 45001', 'Arbeitsschutzmanagement', '2025-03-22', '2025-03-22', '2027-03-22', 'TÜV Rheinland', 'Annika Tholen', '90 Tage', [], 'In Vorbereitung', 'Dokument fehlt'),
    cert('c-iso3834-r', 'EN ISO 3834', 'rohrbau', 'ISO3834-R-203', 'EN ISO 3834', 'Schweißtechnische Qualitätsanforderungen', '2025-07-12', '2025-07-12', '2027-07-12', 'GSI SLV', 'Stefan Janning', '90 Tage', ['ISO3834_Rohrbau.pdf'], 'Abgeschlossen', 'Freigegeben'),
    cert('c-ral-g', 'RAL Gütesicherung', 'galabau', 'RAL-G-076', 'RAL', 'Außenanlagen und Landschaftsbau', '2025-03-15', '2025-03-15', '2027-03-15', 'RAL Gütegemeinschaft', 'Thomas Janning', '60 Tage', ['RAL_Galabau.pdf'], 'Unterlagen eingereicht', 'Freigegeben'),
    cert('c-adr-t', 'ADR Gefahrgutbeförderung', 'transporte', 'ADR-T-022', 'ADR', 'Transport und Gefahrgutlogistik', '2025-09-30', '2025-09-30', '2026-09-30', 'IHK Osnabrück', 'Michael Janning', '60 Tage', ['ADR_Transport.pdf'], 'Audit geplant', 'Freigegeben'),
  ]), []);

  const baseAudits = React.useMemo(() => ([
    audit('a-gw301', 'GW 301 Überwachungsaudit', 'tiefbau', 'c-gw301', 'GW 301', 'Überwachungsaudit', '2026-05-21', '08:00', '13:00', 'Herr Brockmann', 'DVGW Cert GmbH', 'Nordhorn', 'Christian Janning', 'Bestätigt'),
    audit('a-adr', 'ADR Schulung / Audit', 'transporte', 'c-adr-t', 'ADR', 'internes Audit', '2026-05-25', '08:00', '12:00', 'Frau Müller', 'IHK Osnabrück', 'Lingen', 'Michael Janning', 'In Vorbereitung'),
    audit('a-awsv', 'm62 AwSV', 'tiefbau', 'c-awsv', 'AwSV', 'Wiederholungsaudit', '2026-05-31', '08:00', '11:00', 'Herr Schmitz', 'TÜV Nord', 'Nordhorn', 'Rahim Ahangarzadeh', 'Geplant'),
    audit('a-ral', 'RAL Überprüfung', 'galabau', 'c-ral-g', 'RAL', 'Überwachungsaudit', '2026-06-10', '11:00', '15:00', 'Frau Peters', 'RAL Gütegemeinschaft', 'Gronau', 'Thomas Janning', 'Geplant'),
    audit('a-iso45', 'ISO 45001 Review', 'bohrtechnik', 'c-iso45001-b', 'ISO 45001', 'Rezertifizierung', '2026-06-15', '09:00', '14:30', 'Herr Kramer', 'TÜV Rheinland', 'Nordhorn', 'Annika Tholen', 'Bestätigt'),
  ]), []);

  const [showAudits, setShowAudits] = React.useState(false);
  const [certs, setCerts] = React.useState(baseCerts);
  const [audits, setAudits] = React.useState(baseAudits);
  const [selectedCertIds, setSelectedCertIds] = React.useState([]);
  const [selectedCert, setSelectedCert] = React.useState(null);
  const [selectedAudit, setSelectedAudit] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [certMenu, setCertMenu] = React.useState(null);
  const [companyMenu, setCompanyMenu] = React.useState(null);
  const [auditMenu, setAuditMenu] = React.useState(null);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [sortBy, setSortBy] = React.useState({ key: 'validUntil', direction: 'asc' });
  const [groupBy, setGroupBy] = React.useState('');
  const [hiddenCols, setHiddenCols] = React.useState([]);
  const [filters, setFilters] = React.useState({
    firma: activeCompany === 'all'  ? 'all' : activeCompany,
    status: 'all',
    rule: 'all',
    owner: 'all',
    issuer: 'all',
    year: 'all',
    due: 'all',
    docs: 'all',
    audit: 'all',
    renewal: 'all',
    measures: 'all',
    archive: 'active',
  });


  React.useEffect(() => {
    setFilters(current => ({ ...current, firma: activeCompany === 'all'  ? 'all' : activeCompany }));
    setSelectedCertIds([]);
  }, [activeCompany]);

  const scopedCompanies = activeCompany === 'all'  ? companies : companies.filter(company => company.id === activeCompany);
  const companyMap = Object.fromEntries(companies.map(company => [company.id, company]));
  const certMap = Object.fromEntries(certs.map(item => [item.id, item]));

  const enrichedCerts = certs.map(item => enrichCert(item, today, companyMap));
  const visibleCerts = enrichedCerts
    .filter(item => scopedCompanies.some(company => company.id === item.companyId))
    .filter(item => filters.firma === 'all' || item.companyId === filters.firma)
    .filter(item => filters.status === 'all' || item.statusKey === filters.status)
    .filter(item => filters.rule === 'all' || item.rule === filters.rule)
    .filter(item => filters.owner === 'all' || item.owner === filters.owner)
    .filter(item => filters.issuer === 'all' || item.issuer === filters.issuer)
    .filter(item => filters.year === 'all' || String(new Date(item.validUntil).getFullYear()) === filters.year)
    .filter(item => filters.due === 'all' || (filters.due === '30' && item.days <= 30 && item.days >= 0) || (filters.due === '60' && item.days <= 60 && item.days >= 0) || (filters.due === '90' && item.days <= 90 && item.days >= 0))
    .filter(item => filters.docs === 'all' || (filters.docs === 'missing'  ? item.documents.length === 0 : item.documents.length > 0))
    .filter(item => filters.audit === 'all' || (filters.audit === 'required'  ? item.auditNote.includes('erforderlich') || item.auditNote.includes('Abgelaufen') : !item.auditNote.includes('erforderlich')))
    .filter(item => filters.renewal === 'all' || (filters.renewal === 'open'  ? !['Abgeschlossen', 'Zertifikat erhalten', 'Verlängert'].includes(item.renewalStatus) : item.renewalStatus === filters.renewal))
    .filter(item => filters.measures === 'all' || (filters.measures === 'open'  ? item.measures.length > 0 : item.measures.length === 0))
    .filter(item => filters.archive === 'all' || (filters.archive === 'archived'  ? item.statusKey === 'archived' : item.statusKey !== 'archived'))
    .sort((a, b) => compareValues(a, b, sortBy));

  const groupedCerts = groupBy  ? groupItems(visibleCerts, groupBy) : [['Alle Zertifikate', visibleCerts]];
  const visibleAudits = audits
    .map(item => ({ ...item, companyName: companyMap[item.companyId]?.name || item.companyId, certificateName: certMap[item.certificateId]?.name || 'Nicht verknüpft' }))
    .filter(item => scopedCompanies.some(company => company.id === item.companyId))
    .filter(item => filters.firma === 'all' || item.companyId === filters.firma)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const kpis = getCertificateKpis(visibleCerts, visibleAudits);
  const selectedCompanyCards = scopedCompanies.map(company => {
    const companyCerts = enrichedCerts.filter(item => item.companyId === company.id);
    return { ...company, total: companyCerts.length, valid: companyCerts.filter(item => item.statusKey === 'valid').length, soon: companyCerts.filter(item => item.statusKey === 'soon').length, expired: companyCerts.filter(item => item.statusKey === 'expired').length };
  });

  const openCertDialog = (mode, item = null) => {
    const target = item || {};
    setDialog({ type: 'cert', mode, id: target.id });
    setForm({
      name: target.name || '',
      companyId: target.companyId || scopedCompanies[0]?.id || companies[0]?.id || '',
      number: target.number || '',
      rule: target.rule || 'SCC',
      scope: target.scope || '',
      issuedAt: target.issuedAt || '',
      validFrom: target.validFrom || '',
      validUntil: target.validUntil || '',
      issuer: target.issuer || '',
      owner: target.owner || '',
      status: target.manualStatus || 'Automatisch',
      reminder: target.reminder || '60 Tage',
      file: target.documents?.[0] || '',
      documents: target.documents?.slice(1).join(', ') || '',
      note: target.note || '',
    });
  };

  const applyKpiFilter = (kpi) => {
    setFilters(current => ({
      ...current,
      status: 'all',
      due: 'all',
      docs: 'all',
      audit: 'all',
      renewal: 'all',
      measures: 'all',
      archive: 'active',
      ...(kpi.filter || {}),
    }));
    setSelectedCertIds([]);
  };

  const openAuditDialog = (mode, item = null) => {
    const target = item || {};
    setDialog({ type: 'audit', mode, id: target.id });
    setForm({
      title: target.title || '',
      companyId: target.companyId || scopedCompanies[0]?.id || companies[0]?.id || '',
      certificateId: target.certificateId || visibleCerts[0]?.id || '',
      rule: target.rule || 'SCC',
      type: target.type || 'Überwachungsaudit',
      date: target.date || '',
      start: target.start || '',
      end: target.end || '',
      auditor: target.auditor || '',
      organization: target.organization || '',
      location: target.location || '',
      contact: target.contact || '',
      status: target.status || 'Geplant',
      requiredDocs: target.requiredDocs || '',
      result: target.result || '',
      deviations: target.deviations || '',
      measures: target.measures || '',
      report: target.report || '',
      note: target.note || '',
    });
  };

  const openRenewalDialog = (item) => {
    setDialog({ type: 'renewal', id: item.id });
    setForm({
      required: 'Ja',
      owner: item.owner,
      status: item.renewalStatus,
      requestDate: '2026-04-29',
      plannedAudit: '2026-05-21',
      organization: item.issuer,
      documents: 'Zertifikatsdatei, Auditbericht, Maßnahmenliste',
      deadline: item.validUntil,
      note: 'Verlängerung rechtzeitig vorbereiten.',
    });
  };

  const saveDialog = (event) => {
    event.preventDefault();
    if (dialog.type === 'cert') {
      const docs = [form.file, ...(form.documents || '').split(',')].map(value => value.trim()).filter(Boolean);
      const next = {
        id: dialog.id || `cert-${Date.now()}`,
        name: form.name,
        companyId: form.companyId,
        number: form.number,
        rule: form.rule,
        scope: form.scope,
        issuedAt: form.issuedAt,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        issuer: form.issuer,
        owner: form.owner,
        manualStatus: form.status,
        reminder: form.reminder,
        documents: docs,
        renewalStatus: 'Noch nicht begonnen',
        auditNote: 'Audit erforderlich',
        note: form.note,
        history: ['Erstellt von Sabine Janning', 'Status automatisch berechnet'],
        comments: ['Bitte Ablaufwarnung aktiv halten.'],
        measures: ['Verlängerung prüfen'],
      };
      setCerts(current => dialog.mode === 'edit'  ? current.map(item => item.id === dialog.id  ? { ...item, ...next, id: item.id } : item) : [...current, next]);
    }
    if (dialog.type === 'audit') {
      const next = { id: dialog.id || `audit-${Date.now()}`, ...form };
      setAudits(current => dialog.mode === 'edit'  ? current.map(item => item.id === dialog.id  ? { ...item, ...next, id: item.id } : item) : [...current, next]);
    }
    setDialog(null);
    setForm({});
  };

  if (selectedCert) {
    const item = enrichedCerts.find(certItem => certItem.id === selectedCert);
    if (item) {
      return <CertificateDetailPage item={item} audits={visibleAudits.filter(auditItem => auditItem.certificateId === item.id)} onBack={() => setSelectedCert(null)} onEdit={() => openCertDialog('edit', item)} onRenew={() => openRenewalDialog(item)} />;
    }
  }

  if (selectedAudit) {
    const item = visibleAudits.find(auditItem => auditItem.id === selectedAudit);
    if (item) {
      return <AuditDetailPage item={item} onBack={() => setSelectedAudit(null)} onEdit={() => openAuditDialog('edit', item)} />;
    }
  }

  return <div className="cert-admin">
    <div className="cert-admin-head">
      <div className="cert-admin-title">
        <h1>Zertifizierungsübersicht</h1>
        <p>Zertifikate, Audits, Verlängerungen und Dokumente zentral verwalten.</p>
      </div>
      <div className="cert-admin-actions">
        {extraAction}
        <button className={`btn btn--ghost ${showAudits ? 'is-active' : ''}`} onClick={() => setShowAudits(current => !current)} type="button"><Icon name="calendar" size={15} />Auditliste</button>
        <button className="btn btn--ghost" onClick={() => setFilterOpen(true)} type="button"><Icon name="filter" size={15} />Filter</button>
        <button className="btn btn--ghost" type="button"><Icon name="download" size={15} />Excel</button>
        <button className="btn btn--ghost" type="button"><Icon name="download" size={15} />PDF</button>
        <button className="btn btn--primary" onClick={() => openCertDialog('add')} type="button"><Icon name="plus" size={15} />Zertifikat</button>
      </div>
    </div>

    <section className="cert-kpis cert-kpis--six">
      {kpis.map(kpi => <button key={kpi.label} type="button" className="cert-kpi-card" onClick={() => applyKpiFilter(kpi)}>
        <span>{kpi.label}</span>
        <strong className={kpi.tone  ? `tone-${kpi.tone}` : ''}>{kpi.value}</strong>
        <small>{kpi.hint}</small>
      </button>)}
    </section>

    {selectedCertIds.length > 0 && <div className="cert-bulkbar">
      <strong>{selectedCertIds.length} ausgewählt</strong>
      <button type="button"><Icon name="download" size={14} />PDF exportieren</button>
      <button type="button"><Icon name="download" size={14} />Excel exportieren</button>
      <button type="button"><Icon name="users" size={14} />Person zuweisen</button>
      <button type="button"><Icon name="bell" size={14} />Erinnerung einstellen</button>
      <button type="button"><Icon name="history" size={14} />Archivieren</button>
      <button type="button" className="is-danger"><Icon name="trash" size={14} />Löschen</button>
      <button type="button" className="icon-btn" onClick={() => setSelectedCertIds([])}><Icon name="x" size={15} /></button>
    </div>}

    <div className={`cert-admin-layout cert-admin-layout--certs ${showAudits ? 'has-audits' : ''}`}>
      <main className="cert-main-panel">
        <CertificateTable
          groups={groupedCerts}
          selectedIds={selectedCertIds}
          setSelectedIds={setSelectedCertIds}
          onOpen={setSelectedCert}
          onEdit={openCertDialog}
          columnMenu={columnMenu}
          setColumnMenu={setColumnMenu}
          sortBy={sortBy}
          setSortBy={setSortBy}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          hiddenCols={hiddenCols}
          setHiddenCols={setHiddenCols}
        />
      </main>

      {showAudits && <aside className="cert-audit-panel">
        <div className="cert-panel-head">
          <div>
            <span className="eyebrow">Audits</span>
            <h2>Auditliste</h2>
          </div>
          <div className="audit-actions">
            <button type="button" className="btn btn--ghost btn--compact"><Icon name="filter" size={14} />Auditfilter</button>
            <button type="button" className="btn btn--primary btn--compact" onClick={() => openAuditDialog('add')}><Icon name="plus" size={14} />Audit</button>
          </div>
        </div>
        <div className="cert-audit-list">
          {visibleAudits.map(item => <article key={item.id} className="cert-audit-card" onClick={() => setSelectedAudit(item.id)}>
            <button className="dots-btn" type="button" onClick={(event) => { event.stopPropagation(); setAuditMenu(auditMenu === item.id  ? null : item.id); }}>⋮</button>
            {auditMenu === item.id && <Menu onClose={() => setAuditMenu(null)} items={['Details anzeigen', 'Bearbeiten', 'Termin ändern', 'Zertifikat verknüpfen', 'Teilnehmer hinzufügen', 'Dokument hochladen', 'Maßnahmen erstellen', 'als erledigt markieren', 'archivieren', 'löschen']} />}
            <div>
              <strong>{window.fmtDE(item.date)}</strong>
              <span>{item.start} - {item.end} Uhr</span>
              <small>{daysCountdown(item.date, today)}d | 06h | 00m | 00s</small>
            </div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.companyName}</p>
              <span className="cert-status-pill cert-status-pill--neutral">{item.status}</span>
            </div>
          </article>)}
        </div>
      </aside>}
    </div>

    {filterOpen && <FilterDialog filters={filters} setFilters={setFilters} companies={scopedCompanies} certs={enrichedCerts} onClose={() => setFilterOpen(false)} />}
    {dialog?.type === 'cert' && <CertificateDialog form={form} setForm={setForm} companies={scopedCompanies} employees={employees} onClose={() => setDialog(null)} onSubmit={saveDialog} />}
    {dialog?.type === 'audit' && <AuditDialog form={form} setForm={setForm} companies={scopedCompanies} certs={visibleCerts} onClose={() => setDialog(null)} onSubmit={saveDialog} />}
    {dialog?.type === 'renewal' && <RenewalDialog form={form} setForm={setForm} onClose={() => setDialog(null)} onSubmit={(event) => { event.preventDefault(); setDialog(null); }} />}
  </div>;
}

function cert(id, name, companyId, number, rule, scope, issuedAt, validFrom, validUntil, issuer, owner, reminder, documents, renewalStatus, auditNote) {
  return { id, name, companyId, number, rule, scope, issuedAt, validFrom, validUntil, issuer, owner, reminder, documents, renewalStatus, auditNote, note: 'Zertifikat wird zentral überwacht.', history: ['Angelegt von Sabine Janning', 'Ablaufdatum geprüft', 'Dokument hochgeladen'], comments: ['Verantwortliche Person wurde informiert.'], measures: auditNote === 'Abgelaufen'  ? ['Verlängerung starten', 'Audit terminieren'] : ['Frist überwachen'] };
}

function audit(id, title, companyId, certificateId, rule, type, date, start, end, auditor, organization, location, contact, status) {
  return { id, title, companyId, certificateId, rule, type, date, start, end, auditor, organization, location, contact, status, requiredDocs: 'Zertifikat, Auditbericht, Maßnahmenliste', result: 'offen', deviations: 'keine erfasst', measures: 'Maßnahmen nach Audit dokumentieren', report: 'Auditbericht.pdf', note: 'Termin ist mit der Prüforganisation abgestimmt.' };
}

function enrichCert(item, today, companyMap) {
  const hasValidDate = !!item.validUntil && !Number.isNaN(new Date(item.validUntil).getTime());
  const days = hasValidDate  ? Math.round((new Date(item.validUntil) - today) / 86400000) : 9999;
  let statusKey = 'valid';
  let status = 'Gültig';
  if (item.manualStatus && !['Automatisch', 'Gültig'].includes(item.manualStatus)) {
    status = item.manualStatus;
    statusKey = item.manualStatus === 'Archiviert'  ? 'archived' : item.manualStatus === 'Zur Prüfung'  ? 'review' : item.manualStatus === 'In Bearbeitung'  ? 'progress' : item.manualStatus === 'Abgelaufen'  ? 'expired' : item.manualStatus === 'Läuft bald ab'  ? 'soon' : 'valid';
  } else if (days < 0) {
    statusKey = 'expired';
    status = 'Abgelaufen';
  } else if (days <= 60) {
    statusKey = 'soon';
    status = 'Läuft bald ab';
  }
  const restlaufzeit = hasValidDate  ? (days < 0  ? `${Math.abs(days)} Tage überzogen` : `in ${days} Tagen`) : 'kein Ablaufdatum';
  const warning = item.documents.length === 0  ? 'Dokument fehlt' : !hasValidDate  ? 'Ablaufdatum fehlt' : days <= 7  ? 'läuft in 7 Tagen ab' : days <= 30  ? 'läuft in 30 Tagen ab' : days <= 60  ? 'läuft in 60 Tagen ab' : days <= 90  ? 'läuft in 90 Tagen ab' : 'Keine Warnung';
  return { ...item, days, status, statusKey, restlaufzeit, warning, companyName: companyMap[item.companyId]?.name || item.companyId };
}

function compareValues(a, b, sortBy) {
  const factor = sortBy.direction === 'desc'  ? -1 : 1;
  if (sortBy.key === 'validUntil') return factor * (new Date(a.validUntil) - new Date(b.validUntil));
  return factor * String(a[sortBy.key] || '').localeCompare(String(b[sortBy.key] || ''), 'de');
}

function groupItems(items, key) {
  const groups = new Map();
  items.forEach(item => {
    const label = item[key] || 'Ohne Angabe';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(item);
  });
  return Array.from(groups.entries());
}

function getCertificateKpis(certs, audits) {
  return [
    { label: 'Zertifikate gesamt', value: certs.length, hint: 'im Filter', filter: {} },
    { label: 'Gültig', value: certs.filter(item => item.statusKey === 'valid').length, tone: 'success', hint: 'ohne Handlungsbedarf', filter: { status: 'valid' } },
    { label: 'Laufen bald ab', value: certs.filter(item => item.statusKey === 'soon').length, tone: 'warning', hint: '60 Tage', filter: { status: 'soon' } },
    { label: 'Abgelaufen', value: certs.filter(item => item.statusKey === 'expired').length, tone: 'danger', hint: 'verlängern', filter: { status: 'expired' } },
    { label: 'Verlängerungen offen', value: certs.filter(item => !['Abgeschlossen', 'Zertifikat erhalten', 'Verlängert'].includes(item.renewalStatus)).length, tone: 'warning', hint: 'Workflow offen', filter: { renewal: 'open' } },
    { label: 'Maßnahmen offen', value: certs.reduce((sum, item) => sum + item.measures.length, 0), tone: 'danger', hint: 'aus Audits', filter: { measures: 'open' } },
  ];
}
function daysCountdown(date, today) {
  return Math.max(0, Math.round((new Date(date) - today) / 86400000));
}

function CertificateCard({ item, onOpen, onEdit, onRenew, openMenu, setMenu }) {
  return <article className={`cert-manage-card cert-state-${item.statusKey}`} onClick={onOpen}>
    <button className="dots-btn" type="button" onClick={(event) => { event.stopPropagation(); setMenu(); }}>⋮</button>
    {openMenu && <Menu items={['Details anzeigen', 'Bearbeiten', 'Dokument öffnen', 'neue Version hochladen', 'Verlängerung erfassen', 'Audit verknüpfen', 'Duplizieren', 'Archivieren', 'Löschen']} />}
    <div className="cert-card-top">
      <span className={`cert-status-pill cert-status-pill--${item.statusKey}`}>{item.status}</span>
      <small>{item.companyName}</small>
    </div>
    <h3>{item.name}</h3>
    <p>{item.rule} · {item.scope}</p>
    <div className="cert-card-meta">
      <span><b>Nr.</b>{item.number}</span>
      <span><b>Gültig bis</b>{window.fmtDE(item.validUntil)}</span>
      <span><b>Restlaufzeit</b>{item.restlaufzeit}</span>
      <span><b>Zuständig</b>{item.owner}</span>
    </div>
    <div className="cert-card-warning">{item.warning}</div>
    <div className="cert-card-actions" onClick={event => event.stopPropagation()}>
      <button type="button" onClick={onOpen}><Icon name="eye" size={14} />Details</button>
      <button type="button" onClick={onEdit}><Icon name="edit" size={14} />Bearbeiten</button>
      <button type="button" onClick={onRenew}><Icon name="history" size={14} />Verlängerung</button>
    </div>
  </article>;
}

function CertificateTable({ groups, selectedIds, setSelectedIds, onOpen, onEdit, columnMenu, setColumnMenu, sortBy, setSortBy, groupBy, setGroupBy, hiddenCols, setHiddenCols }) {
  const [rowMenu, setRowMenu] = React.useState(null);
  const columns = [
    ['name', 'Zertifikat'], ['companyName', 'Firma'], ['number', 'Nr.'], ['rule', 'Regelwerk'], ['validUntil', 'Gültig bis'], ['status', 'Status'], ['owner', 'Zuständig'], ['renewalStatus', 'Verlängerung'], ['documents', 'Dokumente'], ['actions', ''],
  ];
  const columnWidths = { name: 320, companyName: 190, number: 150, rule: 130, validUntil: 118, status: 142, owner: 160, renewalStatus: 190, documents: 118, actions: 68 };
  const flat = groups.flatMap(([, items]) => items);
  const visibleColumns = columns.filter(([key]) => !hiddenCols.includes(key));
  const toggleAll = (checked) => setSelectedIds(checked  ? flat.map(item => item.id) : []);
  const toggle = (id) => setSelectedIds(selectedIds.includes(id)  ? selectedIds.filter(item => item !== id) : [...selectedIds, id]);
  const renderValue = (item, key) => {
    if (key === 'name') return <button className="table-primary-link" type="button" onClick={(event) => { event.stopPropagation(); onOpen(item.id); }}><strong>{item.name}</strong><small>{item.scope}</small></button>;
    if (key === 'companyName') return <span className="cert-company-cell">{item.companyName}</span>;
    if (key === 'number') return <span className="cert-number-cell">{item.number}</span>;
    if (key === 'validUntil') return window.fmtDE(item.validUntil);
    if (key === 'status') return <div className="cert-status-stack"><span className={`cert-status-pill cert-status-pill--${item.statusKey}`}>{item.status}</span><small>{item.days < 0  ? `seit ${Math.abs(item.days)} Tagen` : item.restlaufzeit}</small></div>;
    if (key === 'owner') return <span className="cert-owner-cell">{item.owner}</span>;
    if (key === 'renewalStatus') return <span className="cert-renewal-cell">{item.renewalStatus}</span>;
    if (key === 'documents') return item.documents.length  ? <span className="cert-doc-chip">{item.documents.length} Datei</span> : <span className="cert-doc-chip cert-doc-chip--missing">fehlt</span>;
    if (key === 'actions') return <div className="table-action-menu"><button className="dots-btn dots-btn--table" type="button" onClick={(event) => { event.stopPropagation(); setRowMenu(rowMenu === item.id  ? null : item.id); }}>⋮</button>{rowMenu === item.id && <Menu items={['Details anzeigen', 'Bearbeiten', 'Zertifikat öffnen', 'Dokumente verwalten', 'Verlängerung starten', 'Audit planen', 'Maßnahme hinzufügen', 'Archivieren', 'Löschen']} />}</div>;
    return item[key] || '-';
  };
  return <div className="cert-table-shell">
    <div className="cert-table-wrap">
      <table className="admin-table cert-admin-table cert-admin-table--compact">
        <colgroup>
          <col style={{ width: 46 }} />
          {visibleColumns.map(([key]) => <col key={key} style={{ width: columnWidths[key] || 140 }} />)}
        </colgroup>
        <thead><tr>
          <th className="sticky-select"><input type="checkbox" checked={flat.length > 0 && selectedIds.length === flat.length} onChange={event => toggleAll(event.target.checked)} /></th>
          {visibleColumns.map(([key, label]) => <th key={key} className={key === 'name'  ? 'sticky-name' : key === 'actions'  ? 'sticky-actions' : ''}>
            <button className="column-head-btn" type="button" onClick={() => setColumnMenu(columnMenu === key  ? null : key)}>{label}{label && <span>▾</span>}</button>
            {columnMenu === key && <ColumnMenu label={label} colKey={key} sortBy={sortBy} setSortBy={setSortBy} groupBy={groupBy} setGroupBy={setGroupBy} hiddenCols={hiddenCols} setHiddenCols={setHiddenCols} />}
          </th>)}
        </tr></thead>
        {groups.map(([label, items]) => <tbody key={label}>
          {groups.length > 1 && <tr className="group-row"><td colSpan={visibleColumns.length + 1}>{label} · {items.length}</td></tr>}
          {items.map(item => <tr key={item.id} className={item.statusKey === 'expired'  ? 'is-danger-row' : ''} onClick={() => onOpen(item.id)}>
            <td className="sticky-select" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} /></td>
            {visibleColumns.map(([key]) => <td key={key} className={key === 'name'  ? 'sticky-name' : key === 'actions'  ? 'sticky-actions' : ''} onClick={key === 'actions'  ? event => event.stopPropagation() : undefined}>{renderValue(item, key)}</td>)}
          </tr>)}
        </tbody>)}
      </table>
    </div>
  </div>;
}
function ColumnMenu({ label, colKey, sortBy, setSortBy, groupBy, setGroupBy, hiddenCols, setHiddenCols }) {
  const isHidden = hiddenCols.includes(colKey);
  return <div className="column-menu">
    <button type="button" onClick={() => setSortBy({ key: colKey, direction: 'asc' })}>A bis Z</button>
    <button type="button" onClick={() => setSortBy({ key: colKey, direction: 'desc' })}>Z bis A</button>
    <button type="button">Filtern nach</button>
    <button type="button" onClick={() => setGroupBy(groupBy === colKey  ? '' : colKey)}>Gruppieren nach "{label}"</button>
    <button type="button" onClick={() => setHiddenCols(isHidden  ? hiddenCols.filter(item => item !== colKey) : [...hiddenCols, colKey])}>{isHidden  ? 'Spalte einblenden' : 'Spalte ausblenden'}</button>
    <button type="button">Spalten verwalten</button>
    <button type="button" onClick={() => setHiddenCols([])}>Standardansicht wiederherstellen</button>
  </div>;
}
function Menu({ items }) {
  return <div className="cert-context-menu">{items.map(item => <button key={item} type="button">{item}</button>)}</div>;
}

function FilterDialog({ filters, setFilters, companies, certs, onClose }) {
  const unique = key => Array.from(new Set(certs.map(item => item[key]).filter(Boolean)));
  const set = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const reset = () => setFilters({ firma: 'all', status: 'all', rule: 'all', owner: 'all', issuer: 'all', year: 'all', due: 'all', docs: 'all', audit: 'all', renewal: 'all', measures: 'all', archive: 'active' });
  return <div className="cert-modal-backdrop" onMouseDown={onClose}>
    <aside className="cert-filter-drawer" onMouseDown={event => event.stopPropagation()}>
      <div className="cert-modal-card__head"><div><span className="eyebrow">Zertifizierungsübersicht</span><h2>Filter</h2></div><button className="icon-btn" type="button" onClick={onClose}><Icon name="x" size={18} /></button></div>
      <div className="filter-grid filter-grid--single">
        <label>Firma<select value={filters.firma} onChange={event => set('firma', event.target.value)}><option value="all">Alle Firmen</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
        <label>Zertifikat<input placeholder="Zertifikatsname suchen" /></label>
        <label>Regelwerk<select value={filters.rule} onChange={event => set('rule', event.target.value)}><option value="all">Alle Regelwerke</option>{unique('rule').map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Geltungsbereich<select><option>Alle Geltungsbereiche</option>{unique('scope').map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Status<select value={filters.status} onChange={event => set('status', event.target.value)}><option value="all">Alle Status</option><option value="valid">Gültig</option><option value="soon">Läuft bald ab</option><option value="expired">Abgelaufen</option><option value="progress">In Prüfung</option><option value="archived">Archiviert</option></select></label>
        <label>Zuständige Person<select value={filters.owner} onChange={event => set('owner', event.target.value)}><option value="all">Alle Personen</option>{unique('owner').map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Ausstellende Stelle<select value={filters.issuer} onChange={event => set('issuer', event.target.value)}><option value="all">Alle Stellen</option>{unique('issuer').map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Gültig bis<select value={filters.year} onChange={event => set('year', event.target.value)}><option value="all">Alle Jahre</option>{unique('validUntil').map(value => String(new Date(value).getFullYear())).filter((v, i, arr) => arr.indexOf(v) === i).map(year => <option key={year}>{year}</option>)}</select></label>
        <label>Läuft innerhalb<select value={filters.due} onChange={event => set('due', event.target.value)}><option value="all">Alle Fristen</option><option value="30">30 Tage</option><option value="60">60 Tage</option><option value="90">90 Tage</option></select></label>
        <label>Verlängerungsstatus<select value={filters.renewal} onChange={event => set('renewal', event.target.value)}><option value="all">Alle</option><option value="open">Offene Verlängerungen</option><option>Nicht erforderlich</option><option>Noch nicht begonnen</option><option>Unterlagen werden vorbereitet</option><option>Audit geplant</option><option>Verlängert</option></select></label>
        <label>Audit<select value={filters.audit} onChange={event => set('audit', event.target.value)}><option value="all">Alle</option><option value="required">Audit geplant / erforderlich</option><option value="ok">kein Audit offen</option></select></label>
        <label>Dokument<select value={filters.docs} onChange={event => set('docs', event.target.value)}><option value="all">Alle</option><option value="present">Dokument vorhanden</option><option value="missing">Dokument fehlt</option></select></label>
        <label>Maßnahmen<select value={filters.measures} onChange={event => set('measures', event.target.value)}><option value="all">Alle</option><option value="open">Maßnahmen offen</option><option value="none">Keine offenen Maßnahmen</option></select></label>
        <label>Archiv<select value={filters.archive} onChange={event => set('archive', event.target.value)}><option value="active">Aktive Zertifikate</option><option value="archived">Archivierte Zertifikate</option><option value="all">Alle</option></select></label>
      </div>
      <div className="modal-actions"><button className="btn btn--ghost" type="button" onClick={reset}>Filter zurücksetzen</button><button className="btn btn--primary" type="button" onClick={onClose}>Filter anwenden</button></div>
    </aside>
  </div>;
}
function CertificateDialog({ form, setForm, companies, employees, onClose, onSubmit }) {
  const [step, setStep] = React.useState(1);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const steps = ['Grunddaten', 'Gültigkeit', 'Zuständigkeit', 'Verlängerung und Audit', 'Dokumente', 'Zusammenfassung'];
  const next = () => setStep(current => Math.min(6, current + 1));
  const prev = () => setStep(current => Math.max(1, current - 1));
  return <Modal title="Zertifikat anlegen" eyebrow={`Schritt ${step} von 6`} onClose={onClose} onSubmit={step === 6  ? onSubmit : (event) => { event.preventDefault(); next(); }} submitLabel={step === 6  ? 'Zertifikat anlegen' : 'Weiter'} secondaryAction={step > 1  ? <button className="btn btn--ghost" type="button" onClick={prev}>Zurück</button> : null}>
    <div className="cert-stepper">{steps.map((label, index) => <button key={label} type="button" className={step === index + 1  ? 'is-active' : step > index + 1  ? 'is-done' : ''} onClick={() => setStep(index + 1)}><span>{index + 1}</span>{label}</button>)}</div>
    {step === 1 && <div className="form-grid form-grid--three">
      <Field label="Firma"><select value={form.companyId} onChange={event => set('companyId', event.target.value)}>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></Field>
      <Field label="Zertifikatsname"><input value={form.name} onChange={event => set('name', event.target.value)} /></Field>
      <Field label="Zertifikatsnummer"><input value={form.number} onChange={event => set('number', event.target.value)} /></Field>
      <Field label="Regelwerk / Norm"><input value={form.rule} onChange={event => set('rule', event.target.value)} /></Field>
      <Field label="Geltungsbereich"><input value={form.scope} onChange={event => set('scope', event.target.value)} /></Field>
      <Field label="Ausstellende Stelle"><input value={form.issuer} onChange={event => set('issuer', event.target.value)} /></Field>
      <Field label="Beschreibung"><textarea value={form.note} onChange={event => set('note', event.target.value)} /></Field>
    </div>}
    {step === 2 && <div className="form-grid form-grid--three">
      <Field label="Ausstellungsdatum"><input type="date" value={form.issuedAt} onChange={event => set('issuedAt', event.target.value)} /></Field>
      <Field label="Gültig ab"><input type="date" value={form.validFrom} onChange={event => set('validFrom', event.target.value)} /></Field>
      <Field label="Gültig bis"><input type="date" value={form.validUntil} onChange={event => set('validUntil', event.target.value)} /></Field>
      <Field label="Unbefristet"><select value={form.unlimited || 'Nein'} onChange={event => set('unlimited', event.target.value)}><option>Nein</option><option>Ja</option></select></Field>
      <Field label="Status"><select value={form.status} onChange={event => set('status', event.target.value)}>{['Automatisch', 'Gültig', 'Läuft bald ab', 'Abgelaufen', 'In Bearbeitung', 'Zur Prüfung', 'Archiviert'].map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Warnfrist"><select value={form.reminder} onChange={event => set('reminder', event.target.value)}>{['30 Tage', '60 Tage', '90 Tage', 'Benutzerdefiniert'].map(value => <option key={value}>{value}</option>)}</select></Field>
    </div>}
    {step === 3 && <div className="form-grid form-grid--three">
      <Field label="Verantwortliche Person"><select value={form.owner} onChange={event => set('owner', event.target.value)}><option value="">Bitte auswählen</option>{employees.slice(0, 30).map(emp => <option key={emp.id}>{emp.first} {emp.last}</option>)}</select></Field>
      <Field label="Vertretung"><select value={form.deputy || ''} onChange={event => set('deputy', event.target.value)}><option value="">Bitte auswählen</option>{employees.slice(0, 30).map(emp => <option key={emp.id}>{emp.first} {emp.last}</option>)}</select></Field>
      <Field label="Benachrichtigung aktiv"><select value={form.notify || 'Ja'} onChange={event => set('notify', event.target.value)}><option>Ja</option><option>Nein</option></select></Field>
      <Field label="Erste Erinnerung"><select value={form.firstReminder || '90 Tage vorher'} onChange={event => set('firstReminder', event.target.value)}><option>90 Tage vorher</option><option>60 Tage vorher</option><option>30 Tage vorher</option></select></Field>
      <Field label="Eskalation an"><input value={form.escalation || ''} onChange={event => set('escalation', event.target.value)} /></Field>
    </div>}
    {step === 4 && <div className="form-grid form-grid--three">
      <Field label="Verlängerung erforderlich"><select value={form.renewalRequired || 'Ja'} onChange={event => set('renewalRequired', event.target.value)}><option>Ja</option><option>Nein</option></select></Field>
      <Field label="Nächster Verlängerungstermin"><input type="date" value={form.renewalDate || ''} onChange={event => set('renewalDate', event.target.value)} /></Field>
      <Field label="Prüforganisation"><input value={form.auditOrg || form.issuer || ''} onChange={event => set('auditOrg', event.target.value)} /></Field>
      <Field label="Audit erforderlich"><select value={form.auditRequired || 'Ja'} onChange={event => set('auditRequired', event.target.value)}><option>Ja</option><option>Nein</option></select></Field>
      <Field label="Auditart"><select value={form.auditType || 'Überwachungsaudit'} onChange={event => set('auditType', event.target.value)}>{['Erstzertifizierung', 'Überwachungsaudit', 'Wiederholungsaudit', 'Rezertifizierung', 'internes Audit', 'Kundenaudit'].map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Geplantes Auditdatum"><input type="date" value={form.auditDate || ''} onChange={event => set('auditDate', event.target.value)} /></Field>
    </div>}
    {step === 5 && <div className="form-grid form-grid--three">
      <Field label="Zertifikat als PDF"><input value={form.file} onChange={event => set('file', event.target.value)} placeholder="Zertifikat.pdf" /></Field>
      <Field label="Auditbericht"><input value={form.auditReport || ''} onChange={event => set('auditReport', event.target.value)} placeholder="Auditbericht.pdf" /></Field>
      <Field label="Antragsunterlagen"><input value={form.applicationDocs || ''} onChange={event => set('applicationDocs', event.target.value)} /></Field>
      <Field label="Prüfbericht"><input value={form.checkReport || ''} onChange={event => set('checkReport', event.target.value)} /></Field>
      <Field label="Weitere Anlagen"><input value={form.documents} onChange={event => set('documents', event.target.value)} placeholder="Dateien mit Komma trennen" /></Field>
    </div>}
    {step === 6 && <div className="cert-summary-box">
      {[['Firma', companies.find(company => company.id === form.companyId)?.name || '-'], ['Zertifikat', form.name || '-'], ['Nummer', form.number || '-'], ['Regelwerk', form.rule || '-'], ['Geltungsbereich', form.scope || '-'], ['Gültigkeit', `${form.validFrom || '-'} bis ${form.validUntil || '-'}`], ['Zuständig', form.owner || '-'], ['Warnfrist', form.reminder || '-'], ['Verlängerung', form.renewalRequired || 'Ja'], ['Audit', form.auditRequired || 'Ja'], ['Dokumente', [form.file, form.documents].filter(Boolean).join(', ') || '-']].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </div>}
  </Modal>;
}
function AuditDialog({ form, setForm, companies, certs, onClose, onSubmit }) {
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <Modal title="Audit anlegen" eyebrow="Auditverwaltung" onClose={onClose} onSubmit={onSubmit}>
    <div className="form-grid form-grid--three">
      {['title:Auditbezeichnung', 'rule:Norm oder Regelwerk', 'auditor:Auditor', 'organization:Prüforganisation', 'location:Ort', 'contact:Ansprechpartner', 'requiredDocs:Benötigte Dokumente', 'result:Ergebnis', 'deviations:Abweichungen', 'measures:Maßnahmen', 'report:Auditbericht hochladen'].map(pair => {
        const [key, label] = pair.split(':');
        return <Field key={key} label={label}><input value={form[key]} onChange={event => set(key, event.target.value)} /></Field>;
      })}
      <Field label="Firma"><select value={form.companyId} onChange={event => set('companyId', event.target.value)}>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></Field>
      <Field label="Zugehöriges Zertifikat"><select value={form.certificateId} onChange={event => set('certificateId', event.target.value)}>{certs.map(certItem => <option key={certItem.id} value={certItem.id}>{certItem.name}</option>)}</select></Field>
      <Field label="Auditart"><select value={form.type} onChange={event => set('type', event.target.value)}>{['Erstzertifizierung', 'Überwachungsaudit', 'Wiederholungsaudit', 'Rezertifizierung', 'internes Audit', 'Kundenaudit'].map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Datum"><input type="date" value={form.date} onChange={event => set('date', event.target.value)} /></Field>
      <Field label="Beginn"><input type="time" value={form.start} onChange={event => set('start', event.target.value)} /></Field>
      <Field label="Ende"><input type="time" value={form.end} onChange={event => set('end', event.target.value)} /></Field>
      <Field label="Status"><select value={form.status} onChange={event => set('status', event.target.value)}>{['Geplant', 'In Vorbereitung', 'Bestätigt', 'Durchgeführt', 'Bericht ausstehend', 'Abgeschlossen', 'Verschoben', 'Abgesagt'].map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Bemerkung"><textarea value={form.note} onChange={event => set('note', event.target.value)} /></Field>
    </div>
  </Modal>;
}

function RenewalDialog({ form, setForm, onClose, onSubmit }) {
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <Modal title="Verlängerung starten" eyebrow="Zertifikatsverlängerung" onClose={onClose} onSubmit={onSubmit}>
    <div className="form-grid form-grid--three">
      <Field label="Verlängerung erforderlich"><select value={form.required} onChange={event => set('required', event.target.value)}><option>Ja</option><option>Nein</option></select></Field>
      <Field label="Zuständige Person"><input value={form.owner} onChange={event => set('owner', event.target.value)} /></Field>
      <Field label="Bearbeitungsstatus"><select value={form.status} onChange={event => set('status', event.target.value)}>{['Noch nicht begonnen', 'In Vorbereitung', 'Unterlagen eingereicht', 'Audit geplant', 'Audit durchgeführt', 'Zertifikat erhalten', 'Abgeschlossen'].map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Antragsdatum"><input type="date" value={form.requestDate} onChange={event => set('requestDate', event.target.value)} /></Field>
      <Field label="Geplantes Audit"><input type="date" value={form.plannedAudit} onChange={event => set('plannedAudit', event.target.value)} /></Field>
      <Field label="Prüforganisation"><input value={form.organization} onChange={event => set('organization', event.target.value)} /></Field>
      <Field label="Erforderliche Unterlagen"><input value={form.documents} onChange={event => set('documents', event.target.value)} /></Field>
      <Field label="Frist"><input type="date" value={form.deadline} onChange={event => set('deadline', event.target.value)} /></Field>
      <Field label="Bemerkung"><textarea value={form.note} onChange={event => set('note', event.target.value)} /></Field>
    </div>
  </Modal>;
}

function CertificateDetailPage({ item, audits, onBack, onEdit, onRenew }) {
  return <div className="cert-detail-page">
    <div className="emp-page-title"><button className="round-back" onClick={onBack}><Icon name="chevL" size={18} /></button><h1>{item.name}</h1><div className="page-actions"><button className="btn btn--ghost" onClick={onEdit}><Icon name="edit" size={14} />Bearbeiten</button><button className="btn btn--primary" onClick={onRenew}><Icon name="history" size={14} />Verlängerung starten</button></div></div>
    <div className="cert-detail-grid">
      <InfoCard title="Stammdaten" rows={[['Firma', item.companyName], ['Zertifikatsnummer', item.number], ['Regelwerk', item.rule], ['Geltungsbereich', item.scope], ['Ausstellende Stelle', item.issuer]]} />
      <InfoCard title="Gültigkeit" rows={[['Ausstellungsdatum', window.fmtDE(item.issuedAt)], ['Gültig ab', window.fmtDE(item.validFrom)], ['Gültig bis', window.fmtDE(item.validUntil)], ['Restlaufzeit', item.restlaufzeit], ['Status', item.status], ['Warnung', item.warning]]} />
      <InfoCard title="Zuständige Personen" rows={[['Verantwortlich', item.owner], ['Benachrichtigung', `vor ${item.reminder}`], ['Vertretung', 'Sabine Janning']]} />
      <InfoCard title="Dokumente" rows={item.documents.length  ? item.documents.map((doc, index) => [`Dokument ${index + 1}`, doc]) : [['Dokument', 'fehlt']]} />
      <InfoCard title="Auditverlauf" rows={audits.length  ? audits.map(auditItem => [auditItem.title, `${window.fmtDE(auditItem.date)} · ${auditItem.status}`]) : [['Audit', 'kein Audit verknüpft']]} />
      <InfoCard title="Verlängerungsstatus" rows={[['Status', item.renewalStatus], ['Nächste Verlängerung', item.validUntil], ['Prüforganisation', item.issuer]]} />
      <InfoCard title="Offene Maßnahmen" rows={item.measures.map((measure, index) => [`Maßnahme ${index + 1}`, measure])} />
      <InfoCard title="Historie" rows={item.history.map((entry, index) => [`Eintrag ${index + 1}`, entry])} />
      <InfoCard title="Kommentare" rows={item.comments.map((entry, index) => [`Kommentar ${index + 1}`, entry])} />
    </div>
  </div>;
}

function AuditDetailPage({ item, onBack, onEdit }) {
  return <div className="cert-detail-page">
    <div className="emp-page-title"><button className="round-back" onClick={onBack}><Icon name="chevL" size={18} /></button><h1>{item.title}</h1><div className="page-actions"><button className="btn btn--ghost" onClick={onEdit}><Icon name="edit" size={14} />Bearbeiten</button><button className="btn btn--primary"><Icon name="check" size={14} />Als erledigt markieren</button></div></div>
    <div className="cert-detail-grid">
      <InfoCard title="Auditdaten" rows={[['Firma', item.companyName], ['Zertifikat', item.certificateName], ['Regelwerk', item.rule], ['Auditart', item.type], ['Status', item.status]]} />
      <InfoCard title="Termin" rows={[['Datum', window.fmtDE(item.date)], ['Beginn', item.start], ['Ende', item.end], ['Ort', item.location]]} />
      <InfoCard title="Beteiligte" rows={[['Auditor', item.auditor], ['Prüforganisation', item.organization], ['Ansprechpartner', item.contact]]} />
      <InfoCard title="Dokumentation" rows={[['Benötigte Dokumente', item.requiredDocs], ['Auditbericht', item.report], ['Ergebnis', item.result], ['Abweichungen', item.deviations], ['Maßnahmen', item.measures], ['Bemerkung', item.note]]} />
    </div>
  </div>;
}

function InfoCard({ title, rows }) {
  return <section className="info-card"><h2>{title}</h2>{rows.map(([label, value]) => <div key={`${title}-${label}`} className="info-row"><span>{label}</span><strong>{value}</strong></div>)}</section>;
}

function Field({ label, children }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

function Modal({ title, eyebrow, children, onClose, onSubmit, submitLabel = 'Speichern', secondaryAction = null }) {
  return <div className="cert-modal-backdrop" onMouseDown={onClose}>
    <form className="cert-modal-card cert-modal-card--wide" onMouseDown={event => event.stopPropagation()} onSubmit={onSubmit}>
      <div className="cert-modal-card__head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-btn" type="button" onClick={onClose}><Icon name="x" size={18} /></button></div>
      {children}
      <div className="modal-actions">{secondaryAction}<button className="btn btn--ghost" type="button" onClick={onClose}>Abbrechen</button><button className="btn btn--primary" type="submit">{submitLabel}</button></div>
    </form>
  </div>;
}

Object.assign(window, { CertOverviewView });
