/* Calendar view - month + list */

function CalendarView({ activeCompany, selectedTraining, selectedInstruction, selectedDate, onTrainingSelected }) {
  const [mode, setMode] = React.useState('month');
  const [monthCursor, setMonthCursor] = React.useState(new Date('2026-04-21'));
  const [showNewEvent, setShowNewEvent] = React.useState(false);

  React.useEffect(() => {
    if (selectedTraining || selectedInstruction || selectedDate) {
      setShowNewEvent(true);
    }
  }, [selectedTraining, selectedInstruction, selectedDate]);

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

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Schulungskalender</h1>
          <div className="view__subtitle">Termine, Orte und Teilnehmerzahlen - Monat, Woche, Liste.</div>
        </div>
        <div className="view__actions">
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-ivory)', border: '1px solid var(--border-1)', borderRadius: 8, padding: 3 }}>
            {['month', 'week', 'list'].map(m => (
              <button
                key={m}
                className={'chip' + (mode === m ? ' chip--active' : '')}
                onClick={() => setMode(m)}
                style={{ border: 0, background: mode === m ? 'var(--color-near-black)' : 'transparent', color: mode === m ? 'var(--color-ivory)' : 'var(--fg-2)' }}
              >
                {m === 'month' ? 'Monat' : m === 'week' ? 'Woche' : 'Liste'}
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
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Uhrzeit</th>
                <th>Termin</th>
                <th>Ort</th>
                <th>Anbieter</th>
                <th>TN</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...events].sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
                <tr key={ev.id}>
                  <td className="num">{window.fmtDE(ev.date)}</td>
                  <td className="small muted">{ev.time}</td>
                  <td><div style={{ fontWeight: 500 }}>{ev.title}</div></td>
                  <td className="small">{ev.location}</td>
                  <td className="small muted">{window.provider(ev.provider)?.name || '-'}</td>
                  <td className="num">{ev.participants}</td>
                  <td><span className="badge badge--planned">{ev.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'week' && (
        <div className="card card--pad">
          <Empty title="Wochenansicht" sub="In diesem Prototyp als Platzhalter - Monats- und Listenansicht sind ausgebaut." />
        </div>
      )}

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

function NewEventModal({ onClose, selectedTraining, selectedInstruction, selectedDate }) {
  const trainings = window.SEED.trainings || [];
  const employees = (window.SEED.employees || []).filter(e => e.status === 'aktiv');
  const initialType = selectedInstruction ? 'unterweisung' : selectedTraining ? 'schulung' : 'schulung';
  const [form, setForm] = React.useState({
    type: initialType,
    training: selectedTraining || '',
    customTitle: selectedInstruction?.title || '',
    location: selectedInstruction?.location || '',
    startDate: selectedDate || '',
    startTime: '',
    endDate: selectedDate || '',
    endTime: '',
    status: 'geplant',
    participants: selectedInstruction?.participantId ? [selectedInstruction.participantId] : [],
    participantRelease: {},
    hotel: 'nicht_erforderlich',
    academyConfirmed: 'nicht_erforderlich',
    billingPaid: 'nicht_erforderlich',
    contactName: '',
    documents: ['Einladung.pdf'],
    notes: selectedInstruction ? `${selectedInstruction.kind || 'Nachholtermin'} fuer ${selectedInstruction.title} (${selectedInstruction.number}) - ${selectedInstruction.participantName}` : '',
  });
  const [saved, setSaved] = React.useState(false);
  const [participantQuery, setParticipantQuery] = React.useState('');
  const [participantPickerOpen, setParticipantPickerOpen] = React.useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedTrainingObj = trainings.find(t => t.id === form.training);
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
    }));
  };

  const setParticipantRelease = (empId, checked) => {
    setForm(f => ({ ...f, participantRelease: { ...(f.participantRelease || {}), [empId]: checked } }));
  };

  const addDocument = () => {
    const name = prompt('Name des Dokuments');
    if (!name) return;
    setForm(f => ({ ...f, documents: [...f.documents, name] }));
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
      provider: selectedTrainingObj?.provider,
      participants: form.participants.length,
      status: form.status,
      freigabeFuerMitarbeiter: form.participantRelease,
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
      <div onClick={e => e.stopPropagation()} style={{ width: 760, borderRadius: 16, background: 'var(--color-ivory)', boxShadow: '0 20px 80px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 180ms cubic-bezier(0.4,0,0.2,1)', maxHeight: '88vh', overflowY: 'auto' }}>
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
                {fieldLabel('Status')}
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="geplant">Geplant</option>
                  <option value="angemeldet">Angemeldet</option>
                  <option value="bestaetigt">Bestaetigt</option>
                  <option value="abgeschlossen">Abgeschlossen</option>
                  <option value="abgesagt">Abgesagt</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize: 13, fontWeight: 700, color: 'var(--fg-2)' }}>Teilnehmer <span style={{ color:'var(--color-accent)' }}>*</span></label>
                <span className="small muted">{form.participants.length} ausgewaehlt</span>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, padding: '8px 10px', background: 'var(--color-parchment)', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                    <span>Ausgewaehlte Teilnehmer</span>
                    <span>Freigabe fuer Mitarbeiter</span>
                  </div>
                  {selectedParticipants.map(emp => (
                    <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, alignItems: 'center', padding: '9px 10px', borderTop: '1px solid var(--border-1)' }}>
                      <div>
                        <strong>{emp.firstName} {emp.lastName}</strong>
                        <div className="small muted">{emp.company} · {emp.position}</div>
                      </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                {fieldLabel('Name')}
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Akademie, Ansprechpartner, Hotel oder Rechnung" style={inp} />
              </div>
              <div>
                {fieldLabel('Notiz')}
                <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Zusatzinfo..." style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: 20, padding: 12, borderRadius: 10, background: 'var(--color-white)', border: '1px solid var(--border-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--fg-3)' }}>Dokumente</label>
                <button onClick={addDocument} type="button" className="btn btn--ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
                  <Icon name="plus" size={13} /> Dokument anlegen
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.documents.map((doc, idx) => (
                  <span key={doc + idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 999, background: '#c7eff0', color: '#08787b', fontWeight: 600, maxWidth: 230 }}>
                    <button type="button" title="Vorschau" style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0 }}><Icon name="eye" size={13} /></button>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc}</span>
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
