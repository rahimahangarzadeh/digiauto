/* Zertifizierungsübersicht - firm certifications (ISO, SCC, etc.) */

function CertOverviewView({ activeCompany }) {
  const initialCertData = {
    tiefbau: [
      { id: 'iso9001', name: 'DIN EN ISO 9001:2015', validUntil: '2028-06-07' },
      { id: 'iso14001', name: 'DIN EN ISO 14001:2015', validUntil: '2028-01-12' },
      { id: 'scc', name: 'SCC** SICHERHEIT CERTIFICAT CONTRACTORS - SCC-VAC 2007', validUntil: '2026-05-28' },
      { id: 'dvgw', name: 'DVGW GW 301: Grundsätze', validUntil: '2026-10-19' },
      { id: 'awsv', name: 'Paragraph 62 AwSV', validUntil: '2026-03-31' },
      { id: 'ral', name: 'RAL', validUntil: '2026-10-22' },
      { id: 'wasser', name: 'below: Eintragung in das Installateurverzeichnis für Wasser', validUntil: '2028-02-27' },
      { id: 'handwerk', name: 'Handwerkskammer: Elektrotechniker', validUntil: null },
      { id: 'fw601', name: 'FW 601', validUntil: '2031-08-04' },
    ],
    bohrtechnik: [
      { id: 'iso9001', name: 'DIN EN ISO 9001:2015', validUntil: '2027-09-15' },
      { id: 'iso45001', name: 'ISO 45001:2018 OHSAS', validUntil: '2027-03-22' },
      { id: 'scc', name: 'SCC Safety Certificate', validUntil: '2026-11-30' },
      { id: 'ral', name: 'RAL Bohrarbeiten', validUntil: '2025-12-10' },
    ],
    rohrbau: [
      { id: 'iso9001', name: 'DIN EN ISO 9001:2015', validUntil: '2028-04-18' },
      { id: 'iso3834', name: 'EN ISO 3834 Schweißaufsicht', validUntil: '2027-07-12' },
      { id: 'dvgw', name: 'DVGW Rohrbau', validUntil: '2026-06-05' },
    ],
    galabau: [
      { id: 'iso9001', name: 'DIN EN ISO 9001:2015', validUntil: '2029-01-20' },
      { id: 'ral', name: 'RAL Gütesicherung', validUntil: '2027-03-15' },
    ],
    transporte: [
      { id: 'iso9001', name: 'DIN EN ISO 9001:2015', validUntil: '2027-11-08' },
      { id: 'adr', name: 'ADR Gefahrgutbeförderung', validUntil: '2026-09-30' },
      { id: 'iso39001', name: 'ISO 39001 Straßenverkehrssicherheit', validUntil: '2028-05-14' },
    ]
  };

  const initialAuditData = {
    tiefbau: [
      { id: 'audit-1', date: '2026-05-21', time: '08:00', title: 'GW 301' },
      { id: 'audit-2', date: '2026-05-31', time: '08:00', title: 'ᴍ62 AwsV' },
      { id: 'audit-3', date: '2026-09-30', time: '08:00', title: 'RAL' },
      { id: 'audit-4', date: '2026-11-02', time: '08:00', title: 'ISO 14001' },
      { id: 'audit-5', date: '2026-11-02', time: '08:00', title: 'SCL' },
      { id: 'audit-6', date: '2027-02-28', time: '08:00', title: 'ISO 3834' },
      { id: 'audit-7', date: '2027-02-28', time: '08:00', title: 'AD2000-HPO' },
      { id: 'audit-8', date: '2027-02-28', time: '08:00', title: 'PED-3-1' },
    ],
    bohrtechnik: [
      { id: 'audit-b1', date: '2026-06-15', time: '09:00', title: 'ISO 45001' },
      { id: 'audit-b2', date: '2026-07-20', time: '10:00', title: 'SCC Audit' },
    ],
    rohrbau: [
      { id: 'audit-r1', date: '2026-07-01', time: '08:00', title: 'EN ISO 3834' },
      { id: 'audit-r2', date: '2026-08-15', time: '14:00', title: 'DVGW Inspektion' },
    ],
    galabau: [
      { id: 'audit-g1', date: '2026-06-10', time: '11:00', title: 'RAL Überprüfung' },
    ],
    transporte: [
      { id: 'audit-t1', date: '2026-05-25', time: '08:00', title: 'ADR Schulung' },
      { id: 'audit-t2', date: '2026-10-12', time: '13:00', title: 'ISO 39001 Review' },
    ]
  };

  const [companies, setCompanies] = React.useState(() => window.SEED.companies.map((company) => ({ ...company })));
  const [certsByCompany, setCertsByCompany] = React.useState(initialCertData);
  const [auditsByCompany, setAuditsByCompany] = React.useState(initialAuditData);
  const availableCompanies = activeCompany === 'all'
    ? companies
    : companies.filter((company) => company.id === activeCompany);

  const [selectedCompanyId, setSelectedCompanyId] = React.useState(
    availableCompanies[0] ? availableCompanies[0].id : null
  );
  const [sortBy, setSortBy] = React.useState('date');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [dialog, setDialog] = React.useState(null);
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (!availableCompanies.some((company) => company.id === selectedCompanyId)) {
      setSelectedCompanyId(availableCompanies[0] ? availableCompanies[0].id : null);
    }
  }, [activeCompany, companies.length]);

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date(window.SEED.today);
    const date = new Date(dateStr);
    return Math.round((date - today) / (1000 * 60 * 60 * 24));
  };

  const getStatus = (cert) => {
    const days = daysUntil(cert.validUntil);
    if (days === null) return { key: 'unlimited', label: 'Unbefristet', tone: 'neutral', rank: 3 };
    if (days < 0) return { key: 'expired', label: 'Abgelaufen', tone: 'danger', rank: 0 };
    if (days <= 60) return { key: 'warning', label: 'Läuft bald ab', tone: 'warning', rank: 1 };
    return { key: 'valid', label: 'Gültig', tone: 'success', rank: 2 };
  };

  const enrichCert = (cert) => {
    const days = daysUntil(cert.validUntil);
    return { ...cert, days, status: getStatus(cert) };
  };

  const getCompanyCerts = (companyId) => (certsByCompany[companyId] || []).map(enrichCert);

  const getSummary = (companyId) => {
    const certs = getCompanyCerts(companyId);
    return certs.reduce((acc, cert) => {
      acc.total += 1;
      acc[cert.status.key] = (acc[cert.status.key] || 0) + 1;
      return acc;
    }, { total: 0, valid: 0, warning: 0, expired: 0, unlimited: 0 });
  };

  const selectedCompany = availableCompanies.find((company) => company.id === selectedCompanyId) || availableCompanies[0];
  const selectedSummary = selectedCompany ? getSummary(selectedCompany.id) : null;
  const selectedEmployees = selectedCompany
    ? window.SEED.employees.filter((employee) => employee.company === selectedCompany.id && employee.status !== 'inaktiv')
    : [];
  const selectedStaffSummary = selectedEmployees.reduce((acc, employee) => {
    const department = employee.department || '';
    const isApprentice = department === 'Auszubildende';
    const isOffice = department === 'Büro' || department === 'BÃ¼ro' || department === 'Bauleitung';
    const isPartTime = Number(employee.personalNr || '0') % 5 === 0;

    acc.total += 1;
    if (isApprentice) acc.azubi += 1;
    else if (isOffice) acc.angestellte += 1;
    else acc.gewerbliche += 1;

    if (isPartTime) acc.teilzeit += 1;
    else acc.vollzeit += 1;

    return acc;
  }, { total: 0, angestellte: 0, gewerbliche: 0, azubi: 0, vollzeit: 0, teilzeit: 0 });

  const filteredCerts = selectedCompany
    ? getCompanyCerts(selectedCompany.id)
        .filter((cert) => statusFilter === 'all' || cert.status.key === statusFilter)
        .sort((a, b) => {
          if (sortBy === 'status') return a.status.rank - b.status.rank || (a.days ?? 99999) - (b.days ?? 99999);
          return (a.days ?? 99999) - (b.days ?? 99999);
        })
    : [];

  const slugify = (text) => text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'neu';

  const openCompanyDialog = (mode, company) => {
    setDialog({ type: 'company', mode, companyId: company?.id });
    setForm({
      name: company?.name || '',
      short: company?.short || '',
    });
  };

  const openCertDialog = (mode, cert) => {
    if (!selectedCompany) return;
    setDialog({ type: 'cert', mode, companyId: selectedCompany.id, certId: cert?.id });
    setForm({
      name: cert?.name || '',
      validUntil: cert?.validUntil || '',
    });
  };

  const closeDialog = () => {
    setDialog(null);
    setForm({});
  };

  const saveDialog = (event) => {
    event.preventDefault();

    if (dialog?.type === 'company') {
      const name = (form.name || '').trim();
      if (!name) return;
      const short = (form.short || name).trim();

      if (dialog.mode === 'edit') {
        setCompanies((current) => current.map((company) => (
          company.id === dialog.companyId ? { ...company, name, short } : company
        )));
      } else {
        const id = `${slugify(short)}-${Date.now()}`;
        const newCompany = { id, name, short, logo: '', tone: '#4a4a48' };
        setCompanies((current) => [...current, newCompany]);
        setCertsByCompany((current) => ({ ...current, [id]: [] }));
        setSelectedCompanyId(id);
      }
    }

    if (dialog?.type === 'cert') {
      const name = (form.name || '').trim();
      if (!name) return;
      const validUntil = form.validUntil || null;

      setCertsByCompany((current) => {
        const certs = current[dialog.companyId] || [];
        if (dialog.mode === 'edit') {
          return {
            ...current,
            [dialog.companyId]: certs.map((cert) => (
              cert.id === dialog.certId ? { ...cert, name, validUntil } : cert
            )),
          };
        }

        return {
          ...current,
          [dialog.companyId]: [
            ...certs,
            { id: `${slugify(name)}-${Date.now()}`, name, validUntil },
          ],
        };
      });
    }

    closeDialog();
  };

  const deleteCompany = (companyId) => {
    const nextCompanies = companies.filter((company) => company.id !== companyId);
    setCompanies(nextCompanies);
    setCertsByCompany((current) => {
      const next = { ...current };
      delete next[companyId];
      return next;
    });
    if (selectedCompanyId === companyId) {
      setSelectedCompanyId(nextCompanies[0] ? nextCompanies[0].id : null);
    }
  };

  const deleteCert = (companyId, certId) => {
    setCertsByCompany((current) => ({
      ...current,
      [companyId]: (current[companyId] || []).filter((cert) => cert.id !== certId),
    }));
  };

  const dateText = (cert) => cert.validUntil ? window.fmtDE(cert.validUntil) : 'Kein Ablaufdatum';
  const detailText = (cert) => {
    if (cert.days === null) return 'Dauerhaft gültig';
    if (cert.days < 0) return `${Math.abs(cert.days)} Tage überzogen`;
    if (cert.days === 0) return 'Läuft heute ab';
    return `in ${cert.days} Tagen`;
  };

  const getAllAudits = () => {
    const allAudits = [];
    Object.values(auditsByCompany).forEach(audits => {
      allAudits.push(...audits);
    });
    return allAudits.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const formatAuditDate = (dateStr) => {
    return window.fmtDE(dateStr);
  };

  const calculateCountdown = (dateStr, timeStr) => {
    const now = new Date(window.SEED.today);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const auditDate = new Date(dateStr + 'T' + timeStr + ':00');

    let diff = Math.floor((auditDate - now) / 1000);
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / 86400);
    const hours_remaining = Math.floor((diff % 86400) / 3600);
    const minutes_remaining = Math.floor((diff % 3600) / 60);
    const seconds_remaining = diff % 60;

    return { days, hours: hours_remaining, minutes: minutes_remaining, seconds: seconds_remaining };
  };

  const allAudits = getAllAudits();

  return (
    <div className="cert-overview">
      <div className="view__header cert-overview__header">
        <div>
          <h1 className="view__title">Zertifizierungsübersicht</h1>
          <div className="view__subtitle">
            Erst Firma auswählen, dann Zertifikate und Ablaufstatus prüfen.
          </div>
        </div>
      </div>

      <div className="cert-layout">
        <section className="cert-company-list" aria-label="Firmen">
          <div className="cert-section-head">
            <div>
              <div className="eyebrow">Firmenliste</div>
              <h2>Alle Firmen</h2>
            </div>
            <div className="cert-head-actions">
              <span>{availableCompanies.length}</span>
              {activeCompany === 'all' && (
                <button className="cert-mini-btn cert-mini-btn--primary" type="button" onClick={() => openCompanyDialog('add')}>
                  <Icon name="plus" size={14} /> Firma
                </button>
              )}
            </div>
          </div>

          <div className="cert-company-stack">
            {availableCompanies.map((company) => {
              const summary = getSummary(company.id);
              const isSelected = company.id === selectedCompany?.id;

              return (
                <div
                  key={company.id}
                  role="button"
                  tabIndex="0"
                  className={`cert-company-row ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedCompanyId(company.id)}
                  onKeyDown={(event) => event.key === 'Enter' && setSelectedCompanyId(company.id)}
                >
                  <div className="cert-company-row__main">
                    <div className="cert-company-row__name">{company.name}</div>
                    <div className="cert-company-row__meta">
                      {summary.total} Zertifikat{summary.total !== 1 ? 'e' : ''}
                    </div>
                  </div>
                  <div className="cert-company-row__summary" aria-label="Status-Zusammenfassung">
                    <span className="cert-dot cert-dot--success" title="Gültig" />{summary.valid}
                    <span className="cert-dot cert-dot--warning" title="Läuft bald ab" />{summary.warning}
                    <span className="cert-dot cert-dot--danger" title="Abgelaufen" />{summary.expired}
                  </div>
                  <div className="cert-row-actions" onClick={(event) => event.stopPropagation()}>
                    <button type="button" onClick={() => openCompanyDialog('edit', company)}>Bearbeiten</button>
                    <button type="button" className="is-danger" onClick={() => deleteCompany(company.id)}>Löschen</button>
                  </div>
                  <Icon name="chevR" size={16} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="cert-detail" aria-label="Zertifikate der Firma">
          {selectedCompany ? (
            <>
              <div className="cert-detail__top">
                <div>
                  <div className="eyebrow">Ausgewählte Firma</div>
                  <h2>{selectedCompany.name}</h2>
                  <div className="cert-detail__summary">
                    <span>{selectedSummary.total} Zertifikate</span>
                    <span>{selectedSummary.valid} gültig</span>
                    <span>{selectedSummary.warning} läuft ab</span>
                    <span>{selectedSummary.expired} abgelaufen</span>
                  </div>
                  <div className="cert-staff-stats" aria-label="Mitarbeiterübersicht">
                    <div className="cert-staff-stat">
                      <span>Mitarbeiter</span>
                      <strong>{selectedStaffSummary.total}</strong>
                    </div>
                    <div className="cert-staff-stat">
                      <span>Angestellte</span>
                      <strong>{selectedStaffSummary.angestellte}</strong>
                    </div>
                    <div className="cert-staff-stat">
                      <span>Gewerbliche</span>
                      <strong>{selectedStaffSummary.gewerbliche}</strong>
                    </div>
                    <div className="cert-staff-stat">
                      <span>Azubi</span>
                      <strong>{selectedStaffSummary.azubi}</strong>
                    </div>
                    <div className="cert-staff-stat">
                      <span>Vollzeit</span>
                      <strong>{selectedStaffSummary.vollzeit}</strong>
                    </div>
                    <div className="cert-staff-stat">
                      <span>Teilzeit</span>
                      <strong>{selectedStaffSummary.teilzeit}</strong>
                    </div>
                  </div>
                </div>
                <div className="cert-export-actions">
                  <button className="cert-action-btn cert-action-btn--primary" type="button" onClick={() => openCertDialog('add')}>
                    <Icon name="plus" size={14} />
                    <span>Zertifikat</span>
                  </button>
                  <button className="cert-action-btn" type="button">
                    <Icon name="download" size={14} />
                    <span>Excel</span>
                  </button>
                  <button className="cert-action-btn" type="button">
                    <Icon name="download" size={14} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              <div className="cert-toolbar">
                <label>
                  <span>Sortierung</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="date">nach Ablaufdatum</option>
                    <option value="status">nach Status</option>
                  </select>
                </label>
                <label>
                  <span>Filter</span>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="all">Alle anzeigen</option>
                    <option value="valid">Nur gültig</option>
                    <option value="warning">Nur läuft bald ab</option>
                    <option value="expired">Nur abgelaufen</option>
                    <option value="unlimited">Nur unbefristet</option>
                  </select>
                </label>
              </div>

              <div className="cert-list">
                {filteredCerts.map((cert) => (
                  <article key={cert.id} className="cert-item">
                    <div className="cert-item__main">
                      <h3>{cert.name}</h3>
                      <div>Gültig bis: {dateText(cert)}</div>
                    </div>
                    <div className="cert-item__status">
                      <span className={`cert-status cert-status--${cert.status.tone}`}>
                        {cert.status.label}
                      </span>
                      <span>{detailText(cert)}</span>
                    </div>
                    <div className="cert-row-actions cert-row-actions--cert">
                      <button type="button" onClick={() => openCertDialog('edit', cert)}>Bearbeiten</button>
                      <button type="button" className="is-danger" onClick={() => deleteCert(selectedCompany.id, cert.id)}>Löschen</button>
                    </div>
                  </article>
                ))}

                {filteredCerts.length === 0 && (
                  <div className="cert-empty">
                    Keine Zertifikate für diesen Filter.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cert-empty">Keine Firma ausgewählt.</div>
          )}
        </section>

        <section className="cert-audits" aria-label="Audits">
          <div className="cert-section-head">
            <div>
              <div className="eyebrow">Audits</div>
              <h2>Auditsliste</h2>
            </div>
            <div className="cert-head-actions">
              <span>{allAudits.length}</span>
            </div>
          </div>

          <div className="cert-audit-stack">
            {allAudits.map((audit) => {
              const countdown = calculateCountdown(audit.date, audit.time);
              return (
                <div key={audit.id} className="cert-audit-item">
                  <div className="cert-audit-item__left">
                    <div className="cert-audit-date">{formatAuditDate(audit.date)}</div>
                    <div className="cert-audit-time">{audit.time} Uhr</div>
                    <div className="cert-audit-countdown">
                      {countdown.days}d | {String(countdown.hours).padStart(2, '0')}h | {String(countdown.minutes).padStart(2, '0')}m | {String(countdown.seconds).padStart(2, '0')}s
                    </div>
                  </div>
                  <div className="cert-audit-item__title">
                    {audit.title}
                  </div>
                </div>
              );
            })}

            {allAudits.length === 0 && (
              <div className="cert-empty">
                Keine Audits vorhanden.
              </div>
            )}
          </div>
        </section>
      </div>

      {dialog && (
        <div className="cert-dialog-backdrop" role="presentation" onMouseDown={closeDialog}>
          <form className="cert-dialog" onSubmit={saveDialog} onMouseDown={(event) => event.stopPropagation()}>
            <div className="cert-dialog__head">
              <div>
                <div className="eyebrow">{dialog.mode === 'edit' ? 'Bearbeiten' : 'Hinzufügen'}</div>
                <h2>{dialog.type === 'company' ? 'Firma' : 'Zertifikat'}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeDialog} aria-label="Schließen">
                <Icon name="x" size={18} />
              </button>
            </div>

            {dialog.type === 'company' ? (
              <>
                <label className="cert-field">
                  <span>Firmenname</span>
                  <input value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Janning Beispiel GmbH" autoFocus />
                </label>
                <label className="cert-field">
                  <span>Kurzname</span>
                  <input value={form.short || ''} onChange={(event) => setForm({ ...form, short: event.target.value })} placeholder="Beispiel" />
                </label>
              </>
            ) : (
              <>
                <label className="cert-field">
                  <span>Zertifikatsname</span>
                  <input value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="DIN EN ISO 9001:2015" autoFocus />
                </label>
                <label className="cert-field">
                  <span>Gültig bis</span>
                  <input type="date" value={form.validUntil || ''} onChange={(event) => setForm({ ...form, validUntil: event.target.value })} />
                </label>
              </>
            )}

            <div className="cert-dialog__actions">
              <button className="btn btn--ghost" type="button" onClick={closeDialog}>Abbrechen</button>
              <button className="btn btn--primary" type="submit">
                <Icon name="check" size={14} /> Speichern
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CertOverviewView });
