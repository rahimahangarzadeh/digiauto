/* Calendar view - calendar + list */

function CalendarView({ activeCompany, selectedTraining, selectedInstruction, selectedDate, onTrainingSelected, extraAction = null }) {
  const [mode, setMode] = React.useState('month');
  const [monthCursor, setMonthCursor] = React.useState(new Date('2026-04-21'));
  const [showNewEvent, setShowNewEvent] = React.useState(false);
  const [calendarSort, setCalendarSort] = React.useState({ key:'date', dir:'asc' });
  const [calendarColumnMenu, setCalendarColumnMenu] = React.useState(null);
  const [calendarColumnFilters, setCalendarColumnFilters] = React.useState({});
  const [calendarFilterPanel, setCalendarFilterPanel] = React.useState(null);
  const [calendarFilterSearch, setCalendarFilterSearch] = React.useState('');
  const [calendarGroupBy, setCalendarGroupBy] = React.useState('');
  const [selectedCalendarRows, setSelectedCalendarRows] = React.useState(new Set());

  React.useEffect(() => {
    if (selectedTraining || selectedInstruction || selectedDate) {
      setShowNewEvent(true);
    }
  }, [selectedTraining, selectedInstruction, selectedDate]);

  React.useEffect(() => {
    const handleNavigateToEvent = (e) => {
      const eventId = e.detail?.eventId;
      if (eventId) {
        const event = window.SEED.events?.find(ev => ev.id === eventId);
        if (event) {
          const eventDate = new Date(event.date + 'T00:00:00');
          setMonthCursor(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
          setMode('month');
        }
      }
    };
    window.addEventListener('navigate-to-calendar-event', handleNavigateToEvent);
    return () => window.removeEventListener('navigate-to-calendar-event', handleNavigateToEvent);
  }, []);

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: new Date(year, month - 1, prevDays - firstWeekday + i + 1), other: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), other: false });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, cells.length - (firstWeekday + daysInMonth) + 1), other: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), other: true });
  }

  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const events = window.SEED.events || [];
  const today = new Date('2026-04-21');
  const calendarColumns = [
    { key:'date', label:'Datum' },
    { key:'time', label:'Uhrzeit' },
    { key:'title', label:'Schulung' },
    { key:'company', label:'Firma' },
    { key:'location', label:'Ort' },
    { key:'provider', label:'Anbieter' },
    { key:'trainer', label:'Referent' },
    { key:'participants', label:'Teilnehmer' },
    { key:'maxParticipants', label:'Max. TN' },
    { key:'status', label:'Status' },
    { key:'certificatesComplete', label:'Zertifikate vollst.' },
    { key:'documentsComplete', label:'Dokumente vollst.' },
    { key:'billingPaid', label:'Rechnung bezahlt' },
    { key:'responsible', label:'Verantwortlich' },
    { key:'actions', label:'Aktionen' },
  ];
  const calendarValue = (event, key) => {
    if (key === 'date') return window.fmtDE(event.date);
    if (key === 'provider') return window.provider(event.provider)?.name || '-';
    if (key === 'company') return event.company || 'Janning Tiefbau GmbH';
    if (key === 'trainer') return event.trainer || 'wird vom Anbieter gestellt';
    if (key === 'maxParticipants') return event.maxParticipants || 18;
    if (key === 'certificatesComplete') return event.certificatesComplete || (event.status === 'abgeschlossen' ? 'vollständig' : 'offen');
    if (key === 'documentsComplete') return event.documentsComplete || (event.documents?.length ? 'vollständig' : 'offen');
    if (key === 'billingPaid') return event.billingPaid || 'offen';
    if (key === 'responsible') return event.responsible || 'Rahim Ahangarzadeh';
    if (key === 'actions') return 'Aktionen';
    return event[key] ?? '';
  };
  const calendarSortValue = (event, key) => key === 'date' ? event.date : calendarValue(event, key);
  const toggleCalendarFilter = (key, value) => setCalendarColumnFilters(current => {
    const values = current[key] || [];
    return { ...current, [key]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
  });
  const openCalendarFilter = key => { setCalendarFilterPanel(key); setCalendarFilterSearch(''); setCalendarColumnMenu(null); };
  const clearCalendarFilter = key => setCalendarColumnFilters(current => ({ ...current, [key]:[] }));
  const visibleCalendarRows = [...events]
    .filter(event => Object.entries(calendarColumnFilters).every(([key, values]) => !values?.length || values.includes(String(calendarValue(event, key)))))
    .sort((a, b) => String(calendarSortValue(a, calendarSort.key)).localeCompare(String(calendarSortValue(b, calendarSort.key)), 'de', { numeric:true }) * (calendarSort.dir === 'asc' ? 1 : -1));
  const calendarFilterValues = key => Array.from(new Set(events.map(event => String(calendarValue(event, key))))).sort((a, b) => a.localeCompare(b, 'de', { numeric:true }));
  const visibleCalendarFilterValues = calendarFilterPanel
    ? calendarFilterValues(calendarFilterPanel).filter(value => value.toLowerCase().includes(calendarFilterSearch.toLowerCase()))
    : [];
  const calendarGroups = calendarGroupBy
    ? Array.from(visibleCalendarRows.reduce((map, row) => {
      const label = String(calendarValue(row, calendarGroupBy));
      map.set(label, [...(map.get(label) || []), row]);
      return map;
    }, new Map()).entries()).map(([label, rows]) => ({ label, rows }))
    : [{ label:null, rows:visibleCalendarRows }];
  const allVisibleCalendarSelected = visibleCalendarRows.length > 0 && visibleCalendarRows.every(row => selectedCalendarRows.has(row.id));
  const toggleCalendarRow = id => setSelectedCalendarRows(current => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAllCalendarRows = () => setSelectedCalendarRows(allVisibleCalendarSelected ? new Set() : new Set(visibleCalendarRows.map(row => row.id)));
  const closingRows = visibleCalendarRows.filter(row => ['durchgefuehrt','durchgeführt','abschluss_unvollstaendig','abgeschlossen'].includes(String(row.status).toLowerCase()) || row.id === 'ev1').slice(0, 4);
  const archiveRows = visibleCalendarRows.filter(row => ['archiviert','abgeschlossen'].includes(String(row.status).toLowerCase())).slice(0, 4);
  if (!archiveRows.length && visibleCalendarRows[0]) archiveRows.push({ ...visibleCalendarRows[0], status:'Archiviert', archivedAt:'12.06.2026', closedBy:'Rahim Ahangarzadeh' });

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Schulungskalender</h1>
          <div className="view__subtitle">Termine, Orte und Teilnehmerzahlen - Kalender und Liste.</div>
        </div>
        <div className="view__actions">
          {extraAction}
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-ivory)', border: '1px solid var(--border-1)', borderRadius: 8, padding: 3 }}>
            {[
              ['month', 'Kalender'],
              ['list', 'Liste'],
              ['closing', 'Abschluss'],
              ['archive', 'Archiv'],
            ].map(([m, label]) => (
              <button
                key={m}
                className={'chip' + (mode === m ? ' chip--active' : '')}
                onClick={() => setMode(m)}
                style={{ border: 0, background: mode === m ? 'var(--color-near-black)' : 'transparent', color: mode === m ? 'var(--color-ivory)' : 'var(--fg-2)' }}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNewEvent(true)} className="btn btn--primary"><Icon name="plus" size={14} />Termin</button>
        </div>
      </div>

      <div className="toolbar">
        <button className="icon-btn" onClick={() => setMonthCursor(new Date(year, month - 1, 1))}><Icon name="chevL" size={16} /></button>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, minWidth: 220 }}>
          {monthCursor.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
        </div>
        <button className="icon-btn" onClick={() => setMonthCursor(new Date(year, month + 1, 1))}><Icon name="chevR" size={16} /></button>
        <button className="chip" onClick={() => setMonthCursor(new Date('2026-04-21'))}>Heute</button>
      </div>

      {mode === 'month' && (
        <div className="cal-grid">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
            <div key={d} className="cal-grid__head">{d}</div>
          ))}
          {cells.map((c, i) => {
            const dayIso = iso(c.date);
            const dayEvents = events.filter(e => e.date === dayIso);
            const isToday = c.date.toDateString() === today.toDateString();
            return (
              <div key={i} className={'cal-cell' + (c.other ? ' cal-cell--other' : '') + (isToday ? ' cal-cell--today' : '')}>
                <div className="cal-cell__num">{c.date.getDate()}</div>
                {dayEvents.map(ev => (
                  <div key={ev.id} className={'cal-event cal-event--' + (ev.kind || 'default')}>
                    {(ev.time || '').split('-')[0]} · {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {mode === 'list' && (
        <React.Fragment>
          {selectedCalendarRows.size > 0 && <div className="training-bulk-bar">
            <strong>{selectedCalendarRows.size} ausgewählt</strong>
            <button type="button"><Icon name="download" size={14} />Export</button>
            <button type="button"><Icon name="edit" size={14} />Status ändern</button>
            <button type="button" className="is-danger"><Icon name="trash" size={14} />Löschen</button>
            <button type="button" className="is-clear" onClick={() => setSelectedCalendarRows(new Set())}><Icon name="x" size={14} /></button>
          </div>}
          <div className="training-list-table card">
            <table>
              <thead><tr>
                <th className="training-list-check"><input type="checkbox" checked={allVisibleCalendarSelected} onChange={toggleAllCalendarRows} /></th>
                {calendarColumns.map(column => <th key={column.key}>
                  <button type="button" className="training-th-button" onClick={() => setCalendarColumnMenu(calendarColumnMenu === column.key ? null : column.key)}>
                    {column.label}<span>{calendarSort.key === column.key ? (calendarSort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>
                  </button>
                  {calendarColumnMenu === column.key && <div className="training-column-menu">
                    <button type="button" onClick={() => { setCalendarSort({ key:column.key, dir:'asc' }); setCalendarColumnMenu(null); }}>A bis Z</button>
                    <button type="button" onClick={() => { setCalendarSort({ key:column.key, dir:'desc' }); setCalendarColumnMenu(null); }}>Z bis A</button>
                    <button type="button" className="is-filter" onClick={() => openCalendarFilter(column.key)}>Filtern nach</button>
                    <button type="button" onClick={() => { setCalendarGroupBy(calendarGroupBy === column.key ? '' : column.key); setCalendarSort({ key:column.key, dir:'asc' }); setCalendarColumnMenu(null); }}>Gruppieren nach "{column.label}"</button>
                  </div>}
                </th>)}
              </tr></thead>
              <tbody>
                {calendarGroups.map(group => <React.Fragment key={group.label || 'all'}>
                  {group.label && <tr className="training-group-row"><td colSpan={calendarColumns.length + 1}>{calendarColumns.find(column => column.key === calendarGroupBy)?.label}: {group.label} <span>{group.rows.length}</span></td></tr>}
                  {group.rows.map(ev => <tr key={ev.id} className={selectedCalendarRows.has(ev.id) ? 'is-selected' : ''}>
                    <td className="training-list-check" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedCalendarRows.has(ev.id)} onChange={() => toggleCalendarRow(ev.id)} /></td>
                    {calendarColumns.map(column => <td key={column.key}>
                      {column.key === 'title' ? <strong>{calendarValue(ev, column.key)}</strong>
                        : column.key === 'status' ? <span className="badge badge--planned">{calendarValue(ev, column.key)}</span>
                        : column.key === 'actions' ? <div className="training-row-actions"><button>Details</button><button>Bearbeiten</button><button>⋮</button></div>
                        : calendarValue(ev, column.key)}
                    </td>)}
                  </tr>)}
                </React.Fragment>)}
              </tbody>
            </table>
          </div>
        </React.Fragment>
      )}

      {mode === 'closing' && (
        <div className="training-list-table card calendar-completion-table">
          <div className="calendar-completion-head">
            <div>
              <h2>Abschluss</h2>
              <p>Durchgeführte Termine mit fehlenden Unterlagen oder Angaben.</p>
            </div>
            <button className="btn btn--primary">Termin abschließen</button>
          </div>
          <table>
            <thead><tr><th>Termin</th><th>Teilnehmer</th><th>Anwesenheit</th><th>Zertifikate</th><th>Rechnung</th><th>Status</th><th>Aktionen</th></tr></thead>
            <tbody>
              {(closingRows.length ? closingRows : visibleCalendarRows.slice(0, 2)).map((ev, index) => (
                <tr key={ev.id + '-closing'}>
                  <td><strong>{ev.title}</strong><div className="small muted">{window.fmtDE(ev.date)} · {calendarValue(ev, 'company')}</div></td>
                  <td>{ev.participants || 0} von {ev.maxParticipants || 18}</td>
                  <td><span className="docs-status is-ok">vollständig</span></td>
                  <td><span className={'docs-status ' + (index === 0 ? 'is-warning' : 'is-ok')}>{index === 0 ? '10 von 12' : 'vollständig'}</span></td>
                  <td><span className={'docs-status ' + (index === 1 ? 'is-warning' : 'is-ok')}>{index === 1 ? 'offen' : 'bezahlt'}</span></td>
                  <td><span className="docs-status is-warning">unvollständig</span></td>
                  <td><div className="training-row-actions"><button>Abschlusskontrolle</button><button>Zertifikate</button><button>Archivieren</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="calendar-checklist">
            {['Termin wurde durchgeführt', 'Teilnehmerliste vollständig', 'Anwesenheit dokumentiert', 'Ergebnisse eingetragen', 'Zertifikate hochgeladen', 'Gültigkeitsdaten eingetragen', 'nächste Wiederholung festgelegt', 'Sicherheitspass-Aufkleber dokumentiert', 'Rechnung erhalten', 'Rechnung bezahlt', 'Schulungsunterlagen gespeichert'].map((item, index) => (
              <label key={item}><input type="checkbox" defaultChecked={index < 4} /> {item}</label>
            ))}
          </div>
        </div>
      )}

      {mode === 'archive' && (
        <div className="training-list-table card calendar-completion-table">
          <div className="calendar-completion-head">
            <div>
              <h2>Archiv</h2>
              <p>Vollständig abgeschlossene Schulungstermine bleiben nachvollziehbar gespeichert.</p>
            </div>
            <button className="btn btn--ghost">Abschlussbericht PDF</button>
          </div>
          <table>
            <thead><tr><th>Abschlussdatum</th><th>Schulungsdatum</th><th>Schulung</th><th>Firma</th><th>Anbieter</th><th>Teilnehmer</th><th>Zertifikate</th><th>Rechnung</th><th>abgeschlossen von</th><th>archiviert am</th><th>Aktionen</th></tr></thead>
            <tbody>
              {archiveRows.map(ev => (
                <tr key={ev.id + '-archive'}>
                  <td>{ev.closedAt || '12.06.2026'}</td>
                  <td>{window.fmtDE(ev.date)}</td>
                  <td><strong>{ev.title}</strong></td>
                  <td>{calendarValue(ev, 'company')}</td>
                  <td>{calendarValue(ev, 'provider')}</td>
                  <td>{ev.participants || 0}</td>
                  <td>vollständig</td>
                  <td>bezahlt</td>
                  <td>{ev.closedBy || 'Rahim Ahangarzadeh'}</td>
                  <td>{ev.archivedAt || '13.06.2026'}</td>
                  <td><div className="training-row-actions"><button>Details</button><button>Dokumente</button><button>Wiederherstellen</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {calendarFilterPanel && <div className="training-filter-backdrop" onClick={() => setCalendarFilterPanel(null)}>
        <aside className="training-filter-panel" onClick={event => event.stopPropagation()}>
          <header>
            <h2>Filtern nach "{calendarColumns.find(column => column.key === calendarFilterPanel)?.label}"</h2>
            <button type="button" className="btn btn--ghost" onClick={() => setCalendarFilterPanel(null)}><Icon name="x" size={18} /></button>
          </header>
          <main>
            <input value={calendarFilterSearch} onChange={event => setCalendarFilterSearch(event.target.value)} placeholder="Text eingeben, um Filter zu finden" />
            <div>
              {visibleCalendarFilterValues.map(value => <label key={value}><input type="checkbox" checked={(calendarColumnFilters[calendarFilterPanel] || []).includes(value)} onChange={() => toggleCalendarFilter(calendarFilterPanel, value)} /><span>{value}</span></label>)}
            </div>
          </main>
          <footer>
            <button type="button" className="btn btn--primary" onClick={() => setCalendarFilterPanel(null)} disabled={!(calendarColumnFilters[calendarFilterPanel] || []).length}>Anwenden</button>
            <button type="button" className="btn btn--ghost" onClick={() => clearCalendarFilter(calendarFilterPanel)}>Auswahl aufheben</button>
          </footer>
        </aside>
      </div>}

      {showNewEvent && (
        <NewEventModal
          onClose={() => { setShowNewEvent(false); onTrainingSelected?.(); }}
          selectedTraining={selectedTraining}
          selectedInstruction={selectedInstruction}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

function NewEventModal({ onClose, selectedTraining, selectedInstruction, selectedDate, selectedProvider }) {
  const trainings = window.SEED.trainings || [];
  const providers = window.SEED.providers || [];
  const employees = (window.SEED.employees || []).filter(e => e.status === 'aktiv');
  const initialType = selectedInstruction ? 'unterweisung' : selectedTraining ? 'schulung' : 'schulung';
  const [form, setForm] = React.useState({
    type: initialType,
    training: selectedTraining || '',
    provider: selectedProvider?.id || '',
    customTitle: selectedInstruction?.title || '',
    location: selectedInstruction?.location || '',
    room: '',
    company: 'Janning Tiefbau GmbH',
    responsible: 'Rahim Ahangarzadeh',
    trainer: '',
    maxParticipants: 18,
    registrationDeadline: '',
    costPerPerson: '',
    totalCost: '',
    validity: '24 Monate',
    nextRepeat: '',
    repeatInterval: 'alle 2 Jahre',
    startDate: selectedDate || '',
    startTime: '',
    endDate: selectedDate || '',
    endTime: '',
    status: 'geplant',
    participants: selectedInstruction?.participantId ? [selectedInstruction.participantId] : [],
    participantStatus: {},
    participantRelease: {},
    hotel: 'nicht_erforderlich',
    academyConfirmed: 'nicht_erforderlich',
    billingReceived: 'nicht_erforderlich',
    billingPaid: 'nicht_erforderlich',
    certificatesReceived: 'nein',
    certificatesUploaded: 'nein',
    passportSticker: 'nein',
    completionNote: '',
    contactName: '',
    documents: [{ type:'Einladung', name:'Einladung.pdf' }],
    documentKind: 'Einladung',
    notes: selectedInstruction ? `${selectedInstruction.kind || 'Nachholtermin'} fuer ${selectedInstruction.title} (${selectedInstruction.number}) - ${selectedInstruction.participantName}` : '',
  });
  const [saved, setSaved] = React.useState(false);
  const [participantQuery, setParticipantQuery] = React.useState('');
  const [participantPickerOpen, setParticipantPickerOpen] = React.useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedTrainingObj = trainings.find(t => t.id === form.training);
  const selectedProviderId = form.provider || selectedTrainingObj?.provider || '';
  const typeLabels = {
    schulung: 'Schulung',
    fuehrerschein: 'Fuehrerscheinkontrolle',
    unterweisung: 'Unterweisung',
    untersuchung: 'Untersuchungsvorsorge',
    stellenbeschreibung: 'Stellenbeschreibung',
    anderes: 'Etwas anderes',
  };
  const selectedTypeLabel = typeLabels[form.type] || 'Termin';
  const title = form.type === 'schulung'
    ? (selectedTrainingObj?.name || 'Schulung')
    : form.type === 'anderes'
      ? (form.customTitle || 'Eigener Termin')
      : (selectedInstruction?.title || selectedTypeLabel);

  const inp = {
    width: '100%',
    padding: '9px 12px',
    fontSize: 13.5,
    border: '1px solid var(--border-1)',
    borderRadius: 8,
    background: 'var(--color-white)',
    color: 'var(--fg-1)',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 150ms',
  };

  const toggleParticipant = (empId) => {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(empId)
        ? f.participants.filter(id => id !== empId)
        : [...f.participants, empId],
      participantRelease: f.participants.includes(empId)
        ? Object.fromEntries(Object.entries(f.participantRelease || {}).filter(([id]) => id !== empId))
        : f.participantRelease,
      participantStatus: f.participants.includes(empId)
        ? Object.fromEntries(Object.entries(f.participantStatus || {}).filter(([id]) => id !== empId))
        : { ...(f.participantStatus || {}), [empId]:'Vorgemerkt' },
    }));
  };

  const setParticipantRelease = (empId, checked) => {
    setForm(f => ({ ...f, participantRelease: { ...(f.participantRelease || {}), [empId]: checked } }));
  };
  const setParticipantStatus = (empId, status) => {
    setForm(f => ({ ...f, participantStatus: { ...(f.participantStatus || {}), [empId]: status } }));
  };

  const addDocument = () => {
    const name = prompt('Name des Dokuments');
    if (!name) return;
    setForm(f => ({ ...f, documents: [...f.documents, { type:f.documentKind || 'sonstige Dokumente', name }] }));
  };

  const removeDocument = (idx) => {
    setForm(f => ({ ...f, documents: f.documents.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    if ((form.type === 'schulung' && !form.training) || (form.type === 'anderes' && !form.customTitle) || !form.startDate || !form.location || form.participants.length === 0) {
      alert('Bitte Termin, Datum, Ort und mindestens 1 Teilnehmer auswaehlen');
      return;
    }

    const eventId = 'ev' + ((window.SEED.events || []).length + 1);
    if (!window.SEED.events) window.SEED.events = [];
    window.SEED.events.push({
      id: eventId,
      title,
      training: form.training,
      kind: form.type,
      date: form.startDate,
      time: `${form.startTime || '08:00'}-${form.endTime || '16:00'}`,
      location: form.location,
      room: form.room,
      company: form.company,
      responsible: form.responsible,
      trainer: form.trainer || 'wird vom Anbieter gestellt',
      maxParticipants: form.maxParticipants,
      registrationDeadline: form.registrationDeadline,
      provider: selectedProviderId,
      participants: form.participants.length,
      status: form.status,
      freigabeFuerMitarbeiter: form.participantRelease,
      participantStatus: form.participantStatus,
      billingReceived: form.billingReceived,
      billingPaid: form.billingPaid,
      certificatesComplete: form.certificatesUploaded === 'ja' ? 'vollständig' : 'offen',
      documentsComplete: form.documents.length ? 'vollständig' : 'offen',
      documents: form.documents,
    });

    const selectedPeople = form.participants
      .map(id => (window.SEED.employees || []).find(e => e.id === id))
      .filter(Boolean);
    const releaseMap = Object.fromEntries(selectedPeople.map(emp => [emp.name, !!form.participantRelease?.[emp.id]]));
    const terminEntry = {
      id: 'cal-' + eventId + '-' + Date.now(),
      tab: form.status === 'abgeschlossen' ? 'erledigt' : 'aktuell',
      title,
      type: form.type,
      company: selectedPeople[0]?.company || 'Alle Firmen',
      participants: selectedPeople.map(emp => emp.name),
      start: `${form.startDate}T${form.startTime || '08:00'}`,
      end: `${form.endDate || form.startDate}T${form.endTime || '16:00'}`,
      location: form.location,
      status: form.status,
      release: releaseMap,
      hotel: form.hotel,
      academyConfirmed: form.academyConfirmed,
      billingPaid: form.billingPaid,
      billingReceived: form.billingReceived,
      maxParticipants: form.maxParticipants,
      responsible: form.responsible,
      contactName: form.contactName,
      documents: form.documents,
      notes: form.notes,
    };
    try {
      const stored = JSON.parse(localStorage.getItem('termine_list_entries') || '[]');
      localStorage.setItem('termine_list_entries', JSON.stringify([...stored, terminEntry]));
      window.dispatchEvent(new Event('termine-list-updated'));
    } catch {}

    form.participants.forEach(empId => {
      const emp = (window.SEED.employees || []).find(e => e.id === empId);
      if (!emp) return;
      if (!window.SEED.wartungsliste) window.SEED.wartungsliste = [];
      window.SEED.wartungsliste.push({
        id: 'wl' + Date.now() + Math.random(),
        mitarbeiter: emp.name,
        personalNr: emp.personalNr,
        firma: emp.company,
        schulung: title,
        datum: form.startDate,
        dokumenttyp: form.type,
        status: 'offen',
        faelligSeit: form.startDate,
        notiz: form.notes,
        freigabeFuerMitarbeiter: !!form.participantRelease?.[empId],
        hotelbuchung: form.hotel,
        akademieBestaetigt: form.academyConfirmed,
        rechnungBezahlt: form.billingPaid,
        rechnungErhalten: form.billingReceived,
        documents: form.documents,
      });
    });

    setSaved(true);
    setTimeout(onClose, 1400);
  };

  const triState = [
    ['ja', 'Ja'],
    ['nein', 'Nein'],
    ['nicht_erforderlich', 'Nicht erforderlich'],
  ];
  const companies = ['Janning Tiefbau GmbH', 'Janning Bohrtechnik GmbH', 'Janning Rohrbau GmbH', 'Janning Galabau GmbH', 'Janning Transporte GmbH', 'alle Firmen'];
  const responsibleOptions = ['Rahim Ahangarzadeh', 'Personalabteilung', 'Bauleiter', 'Vorarbeiter'];
  const participantStatuses = ['Vorgemerkt', 'Eingeladen', 'Angemeldet', 'Bestätigt', 'Warteliste', 'Teilgenommen', 'Nicht erschienen', 'Bestanden', 'Nicht bestanden'];
  const appointmentStatuses = ['Entwurf', 'Geplant', 'Anmeldung offen', 'Ausgebucht', 'Bestätigt', 'Durchgeführt', 'Abschluss unvollständig', 'Abschluss vollständig', 'Archiviert', 'Verschoben', 'Abgesagt'];
  const documentKinds = ['Einladung', 'Angebot', 'Auftragsbestätigung', 'Teilnehmerliste', 'Anwesenheitsliste', 'Schulungsunterlagen', 'Zertifikate', 'Rechnung', 'sonstige Dokumente'];

  const fieldLabel = (text, required) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 5 }}>
      {text} {required && <span style={{ color: 'var(--color-accent)' }}>*</span>}
    </label>
  );

  const selectedParticipants = form.participants
    .map(id => employees.find(emp => emp.id === id))
    .filter(Boolean);
  const availableParticipants = employees
    .filter(emp => !form.participants.includes(emp.id))
    .filter(emp => {
      const q = participantQuery.trim().toLowerCase();
      if (!q) return true;
      return `${emp.firstName} ${emp.lastName} ${emp.company} ${emp.position}`.toLowerCase().includes(q);
    })
    .slice(0, 8);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(20,20,19,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 34 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(980px, 96vw)', borderRadius: 16, background: 'var(--color-ivory)', boxShadow: '0 20px 80px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 180ms cubic-bezier(0.4,0,0.2,1)', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-near-black)', color: '#fff' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>Termin eintragen</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 }}>Termin planen, Teilnehmer freigeben und Dokumente anlegen</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {saved ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 46 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#eff5ed', border: '1px solid #cde1cf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>✓</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: '#3f7a4a', textAlign: 'center' }}>Termin erstellt und Wartungsliste aktualisiert</div>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center' }}>{form.participants.length} Teilnehmer wurden eingetragen.</div>
          </div>
        ) : (
          <div style={{ flex: 1, padding: '20px 24px' }}>
            {selectedInstruction && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#eff5ed', border: '1px solid #cde1cf' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#3f7a4a', marginBottom: 4 }}>{selectedInstruction.contextLabel || 'Unterweisung vorausgewaehlt'}</div>
                <div style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{selectedInstruction.title}</div>
                <div className="small muted" style={{ marginTop: 2 }}>{selectedInstruction.number} · {selectedInstruction.group} · {selectedInstruction.participantName}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ marginBottom: 16 }}>
                {fieldLabel('Termin', true)}
                <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="schulung">Schulung</option>
                  <option value="fuehrerschein">Fuehrerscheinkontrolle</option>
                  <option value="unterweisung">Unterweisung</option>
                  <option value="untersuchung">Untersuchungsvorsorge</option>
                  <option value="stellenbeschreibung">Stellenbeschreibung</option>
                  <option value="anderes">Etwas anderes</option>
                </select>
              </div>

              {form.type === 'schulung' ? (
                <div style={{ marginBottom: 16 }}>
                  {fieldLabel('Schulung aus Liste')}
                  <select value={form.training} onChange={e => set('training', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">-- Schulung auswaehlen --</option>
                    {trainings.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              ) : form.type === 'anderes' ? (
                <div style={{ marginBottom: 16 }}>
                  {fieldLabel('Bezeichnung', true)}
                  <input value={form.customTitle} onChange={e => set('customTitle', e.target.value)} placeholder="z. B. Baustellenbesprechung" style={inp} />
                </div>
              ) : (
                <div style={{ marginBottom: 16 }}>
                  {fieldLabel('Ausgewaehlter Bereich')}
                  <input value={selectedTypeLabel} readOnly style={{ ...inp, background: 'var(--color-parchment)' }} />
                </div>
              )}
            </div>

            {form.type === 'schulung' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  {fieldLabel('Firma')}
                  <select value={form.company} onChange={e => set('company', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {companies.map(company => <option key={company}>{company}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  {fieldLabel('Anbieter aus Liste')}
                  <select value={selectedProviderId} onChange={e => set('provider', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">-- Anbieter auswaehlen --</option>
                    {providers.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>{fieldLabel('Verantwortlich')}<select value={form.responsible} onChange={e => set('responsible', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{responsibleOptions.map(item => <option key={item}>{item}</option>)}</select></div>
              <div>{fieldLabel('Max. Teilnehmerzahl')}<input type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} style={inp} /></div>
              <div>{fieldLabel('Anmeldefrist')}<input type="date" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} style={inp} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                {fieldLabel('Beginn Datum', true)}
                <input type="date" value={form.startDate} onChange={e => { set('startDate', e.target.value); if (!form.endDate) set('endDate', e.target.value); }} style={inp} />
              </div>
              <div>
                {fieldLabel('Beginn Uhrzeit')}
                <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} style={inp} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                {fieldLabel('Ende Datum')}
                <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={inp} />
              </div>
              <div>
                {fieldLabel('Ende Uhrzeit')}
                <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} style={inp} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                {fieldLabel('Ort', true)}
                <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="z. B. Nordhorn, Schulungsraum B" style={inp} />
              </div>
              <div>
                {fieldLabel('Raum / Treffpunkt')}
                <input value={form.room} onChange={e => set('room', e.target.value)} placeholder="z. B. Schulungsraum B, Treffpunkt Lager" style={inp} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                {fieldLabel('Referent / Ausbilder')}
                <input value={form.trainer} onChange={e => set('trainer', e.target.value)} placeholder="z. B. Herr Mueller oder wird vom Anbieter gestellt" style={inp} />
              </div>
              <div>
                {fieldLabel('Status')}
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  {appointmentStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize: 13, fontWeight: 700, color: 'var(--fg-2)' }}>Teilnehmer <span style={{ color:'var(--color-accent)' }}>*</span></label>
                <span className="small muted">{form.participants.length} von {form.maxParticipants || 0} Teilnehmern ausgewaehlt</span>
              </div>

              <div style={{ border: '1px solid ' + (participantPickerOpen ? '#26324a' : 'var(--border-1)'), borderRadius: 2, background: 'var(--color-white)', overflow: 'hidden', marginBottom: 10, boxShadow: participantPickerOpen ? '0 0 0 1px #26324a' : 'none' }}>
                <div onClick={() => setParticipantPickerOpen(true)} style={{ minHeight: 42, padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', borderBottom: participantPickerOpen ? '1px solid #b9b9b9' : 0, cursor:'text' }}>
                  {selectedParticipants.map(emp => (
                    <span key={emp.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '3px 6px', borderRadius: 2, background: '#f4f4f4', border: '1px solid #d8d8d8', fontSize: 13, color: 'var(--fg-1)' }}>
                      {emp.lastName}, {emp.firstName}
                      <button type="button" onClick={() => toggleParticipant(emp.id)} title="Entfernen" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 16, lineHeight: 1 }}>x</button>
                    </span>
                  ))}
                  <input
                    value={participantQuery}
                    onFocus={() => setParticipantPickerOpen(true)}
                    onChange={e => { setParticipantQuery(e.target.value); setParticipantPickerOpen(true); }}
                    placeholder={selectedParticipants.length ? 'Eingeben, um zu filtern' : (participantPickerOpen ? 'Eingeben, um zu filtern' : '-')}
                    style={{ flex: '1 1 220px', minWidth: 180, border: 0, outline: 0, padding: '7px 2px', fontSize: 15, background: 'transparent', fontFamily: 'inherit' }}
                  />
                </div>
                {participantPickerOpen && <React.Fragment><div style={{ maxHeight: 190, overflowY: 'auto' }}>
                  {availableParticipants.map((emp, idx) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => { toggleParticipant(emp.id); setParticipantQuery(''); setParticipantPickerOpen(true); }}
                      style={{ width: '100%', display: 'block', padding: '8px 12px', fontSize: 14, textAlign: 'left', border: 0, borderBottom: '1px solid var(--border-1)', background: idx === 0 ? '#f3f3f3' : 'transparent', color: 'var(--fg-1)', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {emp.lastName}, {emp.firstName}
                      <span className="small muted" style={{ marginLeft: 8 }}>{emp.company} · {emp.position}</span>
                    </button>
                  ))}
                  {availableParticipants.length === 0 && (
                    <div className="small muted" style={{ padding: '10px 12px' }}>Keine weiteren Mitarbeiter gefunden.</div>
                  )}
                </div>
                <div style={{ display:'flex', gap:16, padding:'8px 12px', borderTop:'1px solid #d6d6d6' }}>
                  <button type="button" onClick={() => setParticipantPickerOpen(false)} style={{ border:0, background:'transparent', color:'#26324a', cursor:'pointer', fontSize:17, fontWeight:700 }}>OK</button>
                  <button type="button" onClick={() => { setParticipantQuery(''); setParticipantPickerOpen(false); }} style={{ border:0, background:'transparent', color:'#26324a', cursor:'pointer', fontSize:17, fontWeight:700 }}>X</button>
                </div></React.Fragment>}
              </div>

              {selectedParticipants.length > 0 && (
                <div style={{ border: '1px solid var(--border-1)', borderRadius: 8, background: 'var(--color-white)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 170px 180px', gap: 12, padding: '8px 10px', background: 'var(--color-parchment)', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                    <span>Ausgewaehlte Teilnehmer</span>
                    <span>Teilnehmerstatus</span>
                    <span>Freigabe fuer Mitarbeiter</span>
                  </div>
                  {selectedParticipants.map(emp => (
                    <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '1fr 170px 180px', gap: 12, alignItems: 'center', padding: '9px 10px', borderTop: '1px solid var(--border-1)' }}>
                      <div>
                        <strong>{emp.firstName} {emp.lastName}</strong>
                        <div className="small muted">{emp.company} · {emp.position}</div>
                      </div>
                      <select value={form.participantStatus?.[emp.id] || 'Vorgemerkt'} onChange={e => setParticipantStatus(emp.id, e.target.value)} style={{ ...inp, padding:'6px 8px' }}>
                        {participantStatuses.map(status => <option key={status}>{status}</option>)}
                      </select>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!form.participantRelease?.[emp.id]} onChange={e => setParticipantRelease(emp.id, e.target.checked)} style={{ accentColor: 'var(--color-green)' }} />
                        Freigeben
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                ['hotel', 'Hotelbuchung'],
                ['academyConfirmed', 'Anmeldung bestaetigt von Akademie'],
                ['billingReceived', 'Rechnung erhalten'],
                ['billingPaid', 'Rechnung bezahlt'],
              ].map(([key, label]) => (
                <div key={key} style={{ padding: 12, borderRadius: 10, background: 'var(--color-parchment)', border: '1px solid var(--border-1)' }}>
                  {fieldLabel(label)}
                  <select value={form[key]} onChange={e => set(key, e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {triState.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>{fieldLabel('Kosten pro Person')}<input value={form.costPerPerson} onChange={e => set('costPerPerson', e.target.value)} placeholder="z. B. 120 EUR" style={inp} /></div>
              <div>{fieldLabel('Gesamtkosten')}<input value={form.totalCost} onChange={e => set('totalCost', e.target.value)} placeholder="z. B. 1.440 EUR" style={inp} /></div>
              <div>{fieldLabel('Wiederholungsintervall')}<select value={form.repeatInterval} onChange={e => set('repeatInterval', e.target.value)} style={{ ...inp, cursor:'pointer' }}>{['jaehrlich','alle 2 Jahre','alle 3 Jahre','alle 4 Jahre','alle 5 Jahre','alle 10 Jahre'].map(item => <option key={item}>{item}</option>)}</select></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>{fieldLabel('Gueltigkeit des Nachweises')}<input value={form.validity} onChange={e => set('validity', e.target.value)} placeholder="z. B. 24 Monate" style={inp} /></div>
              <div>{fieldLabel('Naechste Wiederholung')}<input type="date" value={form.nextRepeat} onChange={e => set('nextRepeat', e.target.value)} style={inp} /></div>
            </div>

            {['Durchgefuehrt', 'Durchgeführt', 'Abschluss unvollstaendig', 'Abschluss unvollständig', 'Abschluss vollstaendig', 'Abschluss vollständig', 'Archiviert'].includes(form.status) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16, padding:12, border:'1px solid var(--border-1)', borderRadius:10, background:'var(--color-parchment)' }}>
                <div>{fieldLabel('Zertifikate erhalten')}<select value={form.certificatesReceived} onChange={e => set('certificatesReceived', e.target.value)} style={{ ...inp, cursor:'pointer' }}>{triState.map(([val, text]) => <option key={val} value={val}>{text}</option>)}</select></div>
                <div>{fieldLabel('Zertifikate hochgeladen')}<select value={form.certificatesUploaded} onChange={e => set('certificatesUploaded', e.target.value)} style={{ ...inp, cursor:'pointer' }}>{triState.map(([val, text]) => <option key={val} value={val}>{text}</option>)}</select></div>
                <div>{fieldLabel('Sicherheitspass-Aufkleber')}<select value={form.passportSticker} onChange={e => set('passportSticker', e.target.value)} style={{ ...inp, cursor:'pointer' }}>{triState.map(([val, text]) => <option key={val} value={val}>{text}</option>)}</select></div>
                <div style={{ gridColumn:'1/-1' }}>{fieldLabel('Bemerkung zur Durchfuehrung')}<input value={form.completionNote} onChange={e => set('completionNote', e.target.value)} style={inp} /></div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 16 }}>
              <div>
                {fieldLabel('Notiz')}
                <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Zusatzinfo..." style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: 20, padding: 12, borderRadius: 10, background: 'var(--color-white)', border: '1px solid var(--border-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--fg-3)' }}>Dokumente</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <select value={form.documentKind} onChange={e => set('documentKind', e.target.value)} style={{ ...inp, width:190, padding:'6px 8px' }}>
                    {documentKinds.map(kind => <option key={kind}>{kind}</option>)}
                  </select>
                  <button onClick={addDocument} type="button" className="btn btn--ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
                    <Icon name="plus" size={13} /> Dokument anlegen
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.documents.map((doc, idx) => (
                  <span key={doc + idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 999, background: '#c7eff0', color: '#08787b', fontWeight: 600, maxWidth: 230 }}>
                    <button type="button" title="Vorschau" style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0 }}><Icon name="eye" size={13} /></button>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeof doc === 'string' ? doc : `${doc.type}: ${doc.name}`}</span>
                    <button type="button" title="Entfernen" onClick={() => removeDocument(idx)} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1 }}>x</button>
                  </span>
                ))}
                {form.documents.length === 0 && <span className="small muted">Noch keine Dokumente angelegt.</span>}
              </div>
            </div>
          </div>
        )}

        {!saved && (
          <div style={{ position: 'sticky', bottom: 0, padding: '16px 24px', borderTop: '1px solid var(--border-1)', background: 'var(--color-ivory)', display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={handleSave} className="btn btn--primary" style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
              Termin erstellen
            </button>
            <button onClick={onClose} className="btn btn--ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CalendarView, NewEventModal });
