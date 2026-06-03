function ChatbotView({ activeCompany }) {
  const employees = window.SEED.employees.filter(employee =>
    activeCompany === 'all' ? true : employee.company === activeCompany
  );
  const defaultEmployee = employees.find(employee => employee.id === 'e-me') || employees[0];
  const [query, setQuery] = React.useState(defaultEmployee?.name || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState(defaultEmployee?.id || '');

  const findEmployee = (value) => {
    const needle = value.trim().toLowerCase();
    if (!needle) return defaultEmployee;
    return employees.find(employee => employee.name.toLowerCase().includes(needle)) || defaultEmployee;
  };

  const selectedEmployee = employees.find(employee => employee.id === selectedEmployeeId) || findEmployee(query);
  const certRows = window.SEED.trainings.slice(0, 6).map(training => {
    const cert = window.SEED.certs[selectedEmployee?.id]?.[training.id];
    return {
      label: training.short,
      status: cert?.status || 'missing',
      date: cert?.expiresAt ? window.fmtDE(cert.expiresAt) : '-',
    };
  });
  const validCerts = certRows.filter(row => row.status === 'valid' || row.status === 'warn').length;
  const warnCerts = certRows.filter(row => row.status === 'warn').length;
  const missingCerts = certRows.filter(row => row.status === 'missing' || row.status === 'expired').length;
  const firstName = selectedEmployee?.name?.split(' ')[0] || 'Mitarbeiter';
  const companyName = window.company(selectedEmployee?.company)?.name || selectedEmployee?.company || '-';

  const sections = [
    { label: 'Zertifikate', value: validCerts + '/' + certRows.length, tone: missingCerts ? 'warn' : 'valid', hint: warnCerts ? warnCerts + ' laufen bald ab' : 'aktuell' },
    { label: 'Unterweisungen', value: '4/5', tone: 'warn', hint: '1 offen' },
    { label: 'Stellenbeschreibungen', value: '2', tone: 'valid', hint: 'freigegeben' },
    { label: 'Untersuchungsvorsorge', value: '3', tone: 'valid', hint: 'keine Frist offen' },
    { label: 'Führerscheinkontrolle', value: '1', tone: 'valid', hint: 'gültig bis 21.04.2027' },
    { label: 'Geräteführer', value: '3', tone: 'valid', hint: 'Bagger, Radlader, Stapler' },
    { label: 'Termine', value: '2', tone: 'neutral', hint: 'nächster Termin 04.05.2026' },
  ];

  const suggestions = [
    'Markus Brinker',
    'Dirk Jürgens',
    'Tobias Nowak',
    'Alexander Petersen',
  ].filter(name => employees.some(employee => employee.name === name));

  const submitSearch = () => {
    const employee = findEmployee(query);
    if (employee) setSelectedEmployeeId(employee.id);
  };

  return (
    <div className="chatbot-page">
      <div className="view__header">
        <div>
          <h1 className="view__title">CRS Chatbot</h1>
          <div className="view__subtitle">Mitarbeiter suchen und CRS-Informationen aus Zertifikaten, Unterweisungen, Dokumenten und Terminen sehen.</div>
        </div>
      </div>

      <div className="chatbot-layout">
        <section className="chatbot-chat card card--pad">
          <div className="chatbot-message chatbot-message--bot">
            <div className="chatbot-avatar">CRS</div>
            <div>
              <strong>Hallo, ich bin der CRS Chatbot.</strong>
              <p>Gib Vorname und Nachname ein. Ich zeige dir die wichtigsten Informationen zum Mitarbeiter.</p>
            </div>
          </div>

          <div className="chatbot-message chatbot-message--user">
            <div>
              <strong>{selectedEmployee?.name}</strong>
              <p>Welche Informationen gibt es zu diesem Mitarbeiter?</p>
            </div>
          </div>

          <div className="chatbot-result">
            <div className="chatbot-result__head">
              <div className="avatar avatar--2">{selectedEmployee?.initials || 'MA'}</div>
              <div>
                <h2>{selectedEmployee?.name}</h2>
                <p>{selectedEmployee?.position} - {companyName}</p>
              </div>
            </div>

            <div className="chatbot-section-grid">
              {sections.map(section => (
                <div key={section.label} className={'chatbot-section-card chatbot-section-card--' + section.tone}>
                  <span>{section.label}</span>
                  <strong>{section.value}</strong>
                  <small>{section.hint}</small>
                </div>
              ))}
            </div>

            <div className="chatbot-mini-table">
              <div>Zertifikat</div>
              <div>Status</div>
              <div>Ablaufdatum</div>
              {certRows.map(row => (
                <React.Fragment key={row.label}>
                  <span>{row.label}</span>
                  <span className={'chatbot-status chatbot-status--' + row.status}>{row.status === 'valid' ? 'Gültig' : row.status === 'warn' ? 'Läuft bald ab' : row.status === 'expired' ? 'Abgelaufen' : 'Fehlt'}</span>
                  <span>{row.date}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="chatbot-inputbar">
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && submitSearch()} placeholder="Vorname Nachname eingeben..." />
            <button className="btn btn--primary" onClick={submitSearch}><Icon name="search" size={14} />Suchen</button>
          </div>
        </section>

        <aside className="chatbot-side card card--pad">
          <div className="card__title">Schnellsuche</div>
          <div className="card__sub">Beispiele für Mitarbeiternamen</div>
          <div className="chatbot-chip-list">
            {suggestions.map(name => (
              <button key={name} onClick={() => { setQuery(name); const employee = findEmployee(name); if (employee) setSelectedEmployeeId(employee.id); }}>{name}</button>
            ))}
          </div>

          <div className="chatbot-side-block">
            <div className="card__title">CRS Bereiche</div>
            {sections.map(section => (
              <div key={section.label} className="chatbot-side-row">
                <span>{section.label}</span>
                <strong>{section.value}</strong>
              </div>
            ))}
          </div>

          <div className="chatbot-note">
            <strong>Beispielantwort</strong>
            <p>{firstName} hat {validCerts} gültige Zertifikate, {missingCerts} offene/abgelaufene Nachweise und 2 geplante Termine.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { ChatbotView });
