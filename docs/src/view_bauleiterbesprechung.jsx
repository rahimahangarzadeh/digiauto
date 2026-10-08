function BauleiterbesprechungView() {
  const people = window.SEED.employees
    .filter(emp => emp.status === 'aktiv')
    .slice(0, 18)
    .map(emp => ({ id:emp.id, name:emp.name, role:emp.position, company:window.company(emp.company)?.short || emp.company }));

  const initialMeetings = [
    {
      id:'bl-1',
      nr:1,
      date:'2026-05-04',
      start:'08:00',
      end:'09:30',
      participants:['e-me','e1001','e1002','e1003'],
      leaders:['e1001'],
      agenda:'Baustellenstart Kanalsanierung, Personalplanung, Verkehrssicherung',
      responsible:['e1001','e-me'],
      tasks:[
        { id:'t1', text:'MVAS-Beschilderung für Kanalsanierung prüfen', description:'Verkehrssicherung vor Baustellenstart prüfen und Nachweis ablegen.', owner:['e-me','e1002','e1001'], mainOwner:'e-me', due:'2026-05-11', priority:'Hoch', status:'offen', agenda:'Verkehrssicherung', comment:'Beschilderungsplan mit Polier abstimmen.', file:'MVAS_Pruefung_Kanalsanierung.pdf' },
        { id:'t2', text:'SCC 017 für Bauleiter-Team nachplanen', owner:['e1002','e1004'], mainOwner:'e1002', due:'2026-05-18', priority:'Normal', status:'rueckfrage', agenda:'Personalplanung' },
        { id:'t3', text:'Materialliste Schachtbau freigeben', owner:['e1003'], mainOwner:'e1003', due:'2026-05-06', priority:'Normal', status:'erledigt', completedAt:'2026-05-06', completedBy:'e1003' },
      ],
      assigned:['e-me','e1002'],
      deadline:'2026-05-11',
      conclusions:'Baustelle kann starten, Schulungsbedarf fuer Fuehrungskraefte bleibt offen.',
      nextDate:'2026-05-18',
      description:'Regeltermin Bauleitung Tiefbau mit Fokus Baustellenstart und Nachweise.',
    },
    {
      id:'bl-2',
      nr:2,
      date:'2026-05-18',
      start:'08:00',
      end:'09:15',
      participants:['e-me','e1001','e1002','e1004','e1005'],
      leaders:['e1001'],
      agenda:'Offene Punkte aus 04.05.2026, Nachschulung SCC, Personal Engpass Rohrbau',
      responsible:['e1001','e1004'],
      tasks:[
        { id:'t4', text:'MVAS-Beschilderung für Kanalsanierung prüfen', owner:['e-me','e1002'], mainOwner:'e-me', due:'2026-05-18', priority:'Hoch', status:'erledigt', completedAt:'2026-05-18', completedBy:'e-me', carried:true },
        { id:'t5', text:'SCC 017 für Bauleiter-Team nachplanen', owner:['e1002'], mainOwner:'e1002', due:'2026-05-24', priority:'Normal', status:'offen', carried:true },
        { id:'t6', text:'Ersatzpersonal für Rohrbau KW 22 klären', owner:['e1004','e1005'], mainOwner:'e1004', due:'2026-05-22', priority:'Kritisch', status:'in_bearbeitung' },
      ],
      assigned:['e1002','e1004'],
      deadline:'2026-05-24',
      conclusions:'MVAS ist erledigt. SCC 017 und Personalersatz werden in den naechsten Termin uebernommen.',
      nextDate:'2026-06-01',
      description:'Folgetermin mit automatisch uebernommenen offenen Punkten.',
    },
    {
      id:'bl-3',
      nr:3,
      date:'2026-06-01',
      start:'08:00',
      end:'09:00',
      participants:['e-me','e1001','e1002','e1004','e1006'],
      leaders:['e1001','e1006'],
      agenda:'Offene Punkte aus 18.05.2026, Einsatzplanung Juni, BGBAU Aushang',
      responsible:['e1002','e1004','e1006'],
      tasks:[
        { id:'t7', text:'SCC 017 für Bauleiter-Team nachplanen', owner:['e1002'], mainOwner:'e1002', due:'2026-06-07', priority:'Normal', status:'offen', carried:true },
        { id:'t8', text:'Ersatzpersonal für Rohrbau KW 22 klären', owner:['e1004'], mainOwner:'e1004', due:'2026-06-03', priority:'Hoch', status:'verschoben', carried:true },
        { id:'t9', text:'BGBAU-Aushang für neue Baustelle hochladen', owner:['e1006','e-me'], mainOwner:'e1006', due:'2026-06-05', priority:'Normal', status:'offen' },
      ],
      assigned:['e1002','e1004','e1006'],
      deadline:'2026-06-07',
      conclusions:'Offene Punkte sind fuer naechste Runde markiert, sobald nicht erledigt.',
      nextDate:'2026-06-15',
      description:'Planungstermin fuer Juni mit offenen Punkten aus dem letzten Termin.',
    },
  ];

  const [meetings, setMeetings] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('bauleiter_meetings_v1') || 'null') || initialMeetings; }
    catch { return initialMeetings; }
  });
  const [selectedId, setSelectedId] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('list');
  const [calendarView, setCalendarView] = React.useState('month');
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [taskView, setTaskView] = React.useState('table');
  const [taskStatusFilter, setTaskStatusFilter] = React.useState('all');
  const selected = meetings.find(item => item.id === selectedId) || null;

  React.useEffect(() => {
    try { localStorage.setItem('bauleiter_meetings_v1', JSON.stringify(meetings)); } catch {}
  }, [meetings]);

  const fmt = (iso) => {
    if (!iso) return '-';
    const [y,m,d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };
  const personName = (id) => people.find(p => p.id === id)?.name || id;
  const names = (ids) => (ids || []).map(personName).join(', ') || '-';
  const openTasks = (meeting) => (meeting.tasks || []).filter(task => task.status !== 'erledigt');
  const taskStatuses = ['offen', 'in_bearbeitung', 'rueckfrage', 'erledigt', 'ueberfaellig', 'verschoben'];
  const taskPriorities = ['Niedrig', 'Normal', 'Hoch', 'Kritisch'];
  const taskStatusLabel = status => ({
    offen:'Offen',
    in_bearbeitung:'In Bearbeitung',
    rueckfrage:'Rückfrage',
    erledigt:'Erledigt',
    ueberfaellig:'Überfällig',
    verschoben:'Verschoben',
  }[status] || status || 'Offen');
  const taskMainOwner = task => task.mainOwner || task.owner?.[0] || '';
  const taskSupporters = task => task.supporters || task.owner?.filter(id => id !== taskMainOwner(task)) || [];
  const isTaskOverdue = task => task.due && task.due < window.SEED.today && (task.status || 'offen') !== 'erledigt';
  const visibleTasks = selected ? (selected.tasks || []).filter(task => taskStatusFilter === 'all' || (taskStatusFilter === 'ueberfaellig' ? isTaskOverdue(task) : (task.status || 'offen') === taskStatusFilter)) : [];
  const calendarBaseDate = meetings[0]?.date || window.SEED.today;
  const calendarBase = new Date(calendarBaseDate + 'T00:00:00');
  const calendarIso = date => date.toISOString().slice(0, 10);
  const meetingsForDate = iso => meetings.filter(meeting => meeting.date === iso);
  const monthStart = new Date(calendarBase);
  monthStart.setDate(1);
  const monthGridStart = new Date(monthStart);
  monthGridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const monthDays = Array.from({ length:42 }, (_, index) => {
    const date = new Date(monthGridStart);
    date.setDate(monthGridStart.getDate() + index);
    const iso = calendarIso(date);
    return { date, iso, items:meetingsForDate(iso), inMonth:date.getMonth() === monthStart.getMonth() };
  });
  const weekStart = new Date(calendarBase);
  weekStart.setDate(calendarBase.getDate() - calendarBase.getDay());
  const weekDays = Array.from({ length:7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const iso = calendarIso(date);
    return { date, iso, items:meetingsForDate(iso) };
  });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const year = monthStart.getFullYear();
  const miniMonthDays = monthIndex => {
    const start = new Date(year, monthIndex, 1);
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - start.getDay());
    return Array.from({ length:42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const iso = calendarIso(date);
      return { date, iso, inMonth:date.getMonth() === monthIndex, hasItem:meetingsForDate(iso).length > 0 };
    });
  };
  const yearMonths = Array.from({ length:12 }, (_, index) => ({
    month:index,
    label:new Date(year, index, 1).toLocaleDateString('de-DE', { month:'long' }),
  }));
  const calendarTitle = calendarView === 'day'
    ? calendarBase.toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })
    : calendarView === 'week'
      ? `${weekStart.toLocaleDateString('de-DE', { day:'2-digit', month:'short' })} - ${weekEnd.toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric' })}`
      : calendarView === 'year'
        ? String(year)
        : monthStart.toLocaleDateString('de-DE', { month:'long', year:'numeric' });
  const renderMeetingEvent = meeting => (
    <button key={meeting.id} type="button" className="meeting-cal__event" onClick={() => setSelectedId(meeting.id)}>
      <strong>Bauleiterbesprechung {meeting.nr}</strong>
      <small>{meeting.start || meeting.time || '08:00'} - {meeting.end || '09:00'} · {names(meeting.leaders)}</small>
    </button>
  );
  const updateSelected = (patch) => {
    if (!selected) return;
    setMeetings(items => items.map(item => item.id === selected.id ? { ...item, ...patch } : item));
  };
  const updateTask = (taskId, patch) => {
    if (!selected) return;
    updateSelected({ tasks:selected.tasks.map(task => task.id === taskId ? { ...task, ...patch } : task) });
  };
  const addTask = (task) => {
    if (!selected) return;
    updateSelected({
      tasks:[...selected.tasks, { id:'t' + Date.now(), ...task }],
    });
    setTaskDialogOpen(false);
  };
  const createNextMeeting = () => {
    if (!selected) {
      window.alert('Bitte zuerst eine Bauleiterbesprechung aus der Liste auswaehlen.');
      return;
    }
    const carried = openTasks(selected).map(task => ({
      ...task,
      id:'t' + Date.now() + '-' + task.id,
      due:selected.nextDate || task.due,
      carried:true,
    }));
    const next = {
      id:'bl-' + Date.now(),
      nr:Math.max(...meetings.map(item => item.nr)) + 1,
      date:selected.nextDate || '',
      start:selected.start || selected.time || '08:00',
      end:selected.end || '09:00',
      participants:selected.participants,
      leaders:selected.leaders,
      agenda:'Offene Punkte aus ' + fmt(selected.date),
      tasks:carried,
      deadline:selected.nextDate || '',
      conclusions:'',
      nextDate:'',
      description:'Automatisch aus offenen Punkten der vorherigen Bauleiterbesprechung erstellt.',
    };
    setMeetings(items => [...items, next]);
    setSelectedId(next.id);
  };
  const MultiPeople = ({ label, value, onChange }) => {
    const selectedValues = value || [];
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const toggle = (id) => onChange(selectedValues.includes(id) ? selectedValues.filter(item => item !== id) : [...selectedValues, id]);
    const formatPerson = person => {
      const parts = person.name.split(' ');
      const last = parts.pop() || person.name;
      const first = parts.join(' ');
      return first ? `${last}, ${first}` : last;
    };
    const filteredPeople = [...people]
      .sort((a, b) => formatPerson(a).localeCompare(formatPerson(b), 'de'))
      .filter(person => formatPerson(person).toLowerCase().includes(query.toLowerCase()) || person.name.toLowerCase().includes(query.toLowerCase()));
    return (
      <div style={{ display:'grid', gap:6 }}>
        <span className="form-label">{label}</span>
        <div className="meeting-people-box">
          <div className="meeting-people-chips">
            {selectedValues.slice(0, 3).map(id => (
              <span key={id} className="meeting-chip">{personName(id)}</span>
            ))}
            {selectedValues.length > 3 && <span className="meeting-chip">+{selectedValues.length - 3}</span>}
            {!selectedValues.length && <span className="small muted">Keine Auswahl</span>}
          </div>
          <div className="meeting-sp-select">
            <div className="meeting-sp-select__head">↕ Vorname, Name</div>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              onFocus={() => setOpen(true)}
              placeholder="Option auswählen"
              className="meeting-sp-select__input"
            />
            {open && (
              <div className="meeting-sp-select__menu">
                {filteredPeople.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    className={'meeting-sp-select__option' + (selectedValues.includes(person.id) ? ' is-selected' : '')}
                    onMouseDown={event => {
                      event.preventDefault();
                      toggle(person.id);
                    }}
                  >
                    {formatPerson(person)}
                  </button>
                ))}
                {!filteredPeople.length && <div className="meeting-sp-select__empty">Keine Person gefunden</div>}
              </div>
            )}
          </div>
          {open && <button type="button" className="meeting-sp-select__close" onClick={() => { setOpen(false); setQuery(''); }}>Auswahl schließen</button>}
          <div className="meeting-people-list">
            {people.slice(0, 10).map(person => (
              <label key={person.id} className="meeting-person-option">
                <input type="checkbox" checked={selectedValues.includes(person.id)} onChange={() => toggle(person.id)} />
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.role} · {person.company}</small>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const Field = ({ label, value, onChange, type = 'text', wide, textarea }) => (
    <label style={{ display:'grid', gap:6, gridColumn:wide ? '1 / -1' : 'auto' }}>
      <span className="form-label">{label}</span>
      {textarea ? (
        <textarea value={value || ''} onChange={event => onChange(event.target.value)} rows={3} style={{ border:'1px solid var(--border-1)', borderRadius:8, padding:10, background:'var(--color-white)', font:'inherit', resize:'vertical' }} />
      ) : (
        <input type={type} value={value || ''} onChange={event => onChange(event.target.value)} style={{ minHeight:40, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 12px', background:'var(--color-white)', font:'inherit' }} />
      )}
    </label>
  );
  const TaskCreateDialog = ({ onClose, onSave }) => {
    const [draft, setDraft] = React.useState({
      text:'MVAS-Beschilderung für Kanalsanierung prüfen',
      description:'',
      owner:['e-me','e1002','e1001'],
      mainOwner:'e-me',
      due:selected?.nextDate || selected?.deadline || '',
      priority:'Hoch',
      status:'offen',
      agenda:selected?.agenda || '',
      comment:'',
      file:'',
    });
    const set = (key, value) => setDraft(current => ({ ...current, [key]:value }));
    return <div className="meeting-task-dialog-backdrop" onClick={onClose}>
      <section className="meeting-task-dialog" onClick={event => event.stopPropagation()}>
        <header><div><span>Aufgabenverwaltung</span><h2>Neue Aufgabe</h2></div><button onClick={onClose}><Icon name="x" size={18} /></button></header>
        <div className="meeting-task-dialog__grid">
          <Field label="Aufgabenbezeichnung" value={draft.text} onChange={value => set('text', value)} wide />
          <Field label="Beschreibung" value={draft.description} onChange={value => set('description', value)} wide textarea />
          <MultiPeople label="Zuständige Personen" value={draft.owner} onChange={value => set('owner', value)} />
          <label style={{ display:'grid', gap:6 }}>
            <span className="form-label">Hauptverantwortlicher</span>
            <select value={draft.mainOwner} onChange={event => set('mainOwner', event.target.value)} style={{ minHeight:40, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 12px', background:'var(--color-white)', font:'inherit' }}>
              <option value="">Bitte auswählen</option>
              {draft.owner.map(id => <option key={id} value={id}>{personName(id)}</option>)}
            </select>
          </label>
          <Field label="Fälligkeitsdatum" type="date" value={draft.due} onChange={value => set('due', value)} />
          <label style={{ display:'grid', gap:6 }}>
            <span className="form-label">Priorität</span>
            <select value={draft.priority} onChange={event => set('priority', event.target.value)} style={{ minHeight:40, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 12px', background:'var(--color-white)', font:'inherit' }}>{taskPriorities.map(priority => <option key={priority}>{priority}</option>)}</select>
          </label>
          <label style={{ display:'grid', gap:6 }}>
            <span className="form-label">Status</span>
            <select value={draft.status} onChange={event => set('status', event.target.value)} style={{ minHeight:40, border:'1px solid var(--border-1)', borderRadius:8, padding:'0 12px', background:'var(--color-white)', font:'inherit' }}>{taskStatuses.map(status => <option key={status} value={status}>{taskStatusLabel(status)}</option>)}</select>
          </label>
          <Field label="Zugehöriger Tagesordnungspunkt" value={draft.agenda} onChange={value => set('agenda', value)} />
          <Field label="Kommentar" value={draft.comment} onChange={value => set('comment', value)} wide textarea />
          <label className="meeting-task-upload"><span className="form-label">Datei oder Nachweis hochladen</span><div><Icon name="upload" size={16} /><strong>{draft.file || 'Datei hochladen'}</strong><small>PDF, JPG oder PNG</small><input type="file" onChange={event => set('file', event.target.files?.[0]?.name || '')} /></div></label>
        </div>
        <footer><button className="btn btn--ghost" onClick={onClose}>Abbrechen</button><button className="btn btn--primary" onClick={() => onSave({ ...draft, mainOwner:draft.mainOwner || draft.owner[0] || '', completedAt:draft.status === 'erledigt' ? window.SEED.today : '', completedBy:draft.status === 'erledigt' ? 'e-me' : '' })}>Aufgabe speichern</button></footer>
      </section>
    </div>;
  };

  return (
    <div>
      <style>{`
        .meeting-drawer {
          position:fixed;
          top:64px;
          right:0;
          width:min(680px, 96vw);
          height:calc(100vh - 64px);
          background:var(--color-ivory);
          border-left:1px solid var(--border-1);
          box-shadow:-18px 0 42px rgba(0,0,0,.18);
          z-index:90;
          display:flex;
          flex-direction:column;
        }
        .meeting-drawer__hero {
          background:#10100f;
          color:#fff;
          padding:22px 24px;
          display:flex;
          gap:16px;
          align-items:flex-start;
          position:relative;
        }
        .meeting-drawer__hero h2 { margin:0 0 6px; font-family:var(--font-serif); font-size:26px; font-weight:500; }
        .meeting-drawer__hero p { margin:0 0 12px; color:rgba(255,255,255,.7); }
        .meeting-drawer__close { position:absolute; top:18px; right:18px; border:0; background:transparent; color:rgba(255,255,255,.75); cursor:pointer; padding:6px; }
        .meeting-drawer__close:hover { color:#fff; }
        .meeting-drawer__body { overflow:auto; padding:18px 24px 24px; }
        .meeting-drawer-backdrop { position:fixed; top:64px; right:0; bottom:0; left:0; background:rgba(0,0,0,.18); z-index:89; }
        .meeting-people-box { border:1px solid var(--border-1); border-radius:9px; background:var(--color-white); overflow:hidden; }
        .meeting-people-chips { min-height:42px; display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:8px 10px; border-bottom:1px solid var(--border-1); }
        .meeting-chip { max-width:170px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-radius:999px; background:#e9f5f0; color:#2f6f45; padding:4px 9px; font-size:12px; font-weight:700; }
        .meeting-people-list { display:none; }
        .meeting-person-option { display:flex; align-items:flex-start; gap:9px; padding:8px 10px; border-bottom:1px solid var(--border-1); cursor:pointer; }
        .meeting-person-option:hover { background:var(--color-warm-sand); }
        .meeting-person-option small { display:block; color:var(--fg-3); margin-top:2px; }
        .meeting-sp-select { position:relative; background:#fff; }
        .meeting-sp-select__head { min-height:28px; display:flex; align-items:center; padding:0 10px; border-bottom:1px solid #0f766e; color:#444; font-size:13px; font-weight:600; }
        .meeting-sp-select__input { width:100%; box-sizing:border-box; min-height:36px; border:0; border-bottom:2px solid #008272; padding:0 10px; outline:none; font:inherit; font-size:15px; background:#fff; }
        .meeting-sp-select__menu { max-height:260px; overflow:auto; background:#fff; box-shadow:0 10px 24px rgba(0,0,0,.12); border:1px solid #d8d8d8; border-top:0; z-index:20; position:relative; }
        .meeting-sp-select__option { width:100%; min-height:34px; border:0; background:#fff; color:#444; text-align:left; padding:0 12px; font:inherit; font-size:15px; cursor:pointer; display:block; }
        .meeting-sp-select__option:hover, .meeting-sp-select__option.is-selected { background:#f0efee; }
        .meeting-sp-select__empty { padding:10px 12px; color:var(--fg-3); font-size:13px; }
        .meeting-sp-select__close { border:0; background:transparent; color:var(--color-accent); font:inherit; font-size:12px; font-weight:700; padding:8px 10px; cursor:pointer; text-align:left; }
        .meeting-viewbar { display:flex; justify-content:flex-end; gap:8px; align-items:center; margin:0 0 14px; }
        .meeting-viewbar__seg, .meeting-cal__mode { display:inline-flex; align-items:center; gap:2px; padding:3px; border:1px solid var(--border-1); border-radius:9px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .meeting-viewbar button, .meeting-cal__mode button { min-height:30px; border:0; border-radius:7px; padding:0 12px; background:transparent; color:var(--fg-2); cursor:pointer; font:inherit; font-size:12px; font-weight:750; display:inline-flex; align-items:center; gap:6px; }
        .meeting-viewbar button.is-active { background:var(--color-near-black); color:#fff; }
        .meeting-cal__mode button.is-active { background:#0b57d0; color:#fff; }
        .meeting-cal { border:1px solid var(--border-1); border-radius:10px; overflow:hidden; background:#fff; }
        .meeting-cal__head { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 18px; border-bottom:1px solid #dfe5ee; background:#fff; }
        .meeting-cal__head h3 { margin:0; font-family:Arial, sans-serif; font-size:22px; font-weight:500; color:#1f2933; }
        .meeting-cal__weekdays, .meeting-cal__grid { display:grid; grid-template-columns:repeat(7, minmax(0,1fr)); }
        .meeting-cal__weekdays div { min-height:38px; display:flex; align-items:center; justify-content:center; background:#fff; color:#1f2933; font-size:13px; font-weight:600; text-transform:uppercase; border-right:1px solid #dfe5ee; }
        .meeting-cal__day { min-height:150px; border-top:1px solid #dfe5ee; border-right:1px solid #dfe5ee; padding:10px; background:#fff; }
        .meeting-cal__day.is-muted { color:#8b97a5; }
        .meeting-cal__date { display:flex; justify-content:center; align-items:center; margin-bottom:8px; color:#111827; font-size:16px; font-weight:600; }
        .meeting-cal__date.is-today span { background:#0b57d0; color:#fff; border-radius:999px; min-width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; }
        .meeting-cal__events { display:grid; gap:5px; }
        .meeting-cal__event { width:100%; border:1px solid #dfe5ee; border-left:4px solid var(--color-accent); border-radius:7px; background:#fff4ec; padding:6px 7px; text-align:left; color:var(--fg-1); cursor:pointer; font:inherit; font-size:11px; line-height:1.25; }
        .meeting-cal__event strong, .meeting-cal__event small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .meeting-cal__event small { margin-top:2px; color:var(--fg-3); }
        .meeting-cal__agenda { display:grid; gap:8px; padding:14px; min-height:260px; }
        .meeting-cal__empty { padding:24px; color:var(--fg-3); text-align:center; border:1px dashed var(--border-1); border-radius:10px; background:#faf9f5; }
        .meeting-week { display:grid; grid-template-columns:86px repeat(7, minmax(0,1fr)); background:#fff; }
        .meeting-week__corner { border-right:1px solid #dfe5ee; border-bottom:1px solid #dfe5ee; color:#1f2933; font-size:13px; padding-top:66px; }
        .meeting-week__dayhead { min-height:92px; border-right:1px solid #dfe5ee; border-bottom:1px solid #b8c0cc; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#1f2933; }
        .meeting-week__dayname { font-size:14px; font-weight:600; text-transform:uppercase; }
        .meeting-week__daynum { font-size:30px; line-height:1; font-weight:400; min-width:48px; height:48px; border-radius:999px; display:flex; align-items:center; justify-content:center; }
        .meeting-week__dayhead.is-today .meeting-week__dayname { color:#0b57d0; }
        .meeting-week__dayhead.is-today .meeting-week__daynum { background:#0b57d0; color:#fff; }
        .meeting-week__time { min-height:64px; border-right:1px solid #dfe5ee; border-bottom:1px solid #dfe5ee; color:#1f2933; font-size:13px; padding:8px 10px 0 0; text-align:right; }
        .meeting-week__cell { min-height:64px; border-right:1px solid #dfe5ee; border-bottom:1px solid #dfe5ee; padding:6px; }
        .meeting-week__pill { border:0; border-radius:999px; background:#0b57d0; color:#fff; padding:4px 8px; font:inherit; font-size:11px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; }
        .meeting-year { display:grid; grid-template-columns:repeat(4, minmax(230px,1fr)); gap:54px 64px; padding:34px 44px 48px; background:#fff; }
        .meeting-year__month h4 { margin:0 0 18px; font-family:Arial, sans-serif; font-size:22px; font-weight:500; color:#1f2933; }
        .meeting-mini { display:grid; grid-template-columns:repeat(7, 32px); grid-auto-rows:32px; gap:4px 10px; align-items:center; }
        .meeting-mini__weekday { color:#1f2933; font-size:15px; text-align:center; font-weight:500; }
        .meeting-mini__day { border:0; background:transparent; color:#111827; font:inherit; font-size:14px; font-weight:500; border-radius:999px; cursor:pointer; display:flex; align-items:center; justify-content:center; position:relative; }
        .meeting-mini__day.is-muted { color:#1f2933; opacity:.85; }
        .meeting-mini__day.is-today { background:#0b57d0; color:#fff; }
        .meeting-mini__day.has-item::after { content:""; position:absolute; bottom:2px; width:4px; height:4px; border-radius:999px; background:#0b57d0; }
        .meeting-mini__day.is-today.has-item::after { background:#fff; }
        .meeting-detail-page { display:grid; gap:18px; }
        .meeting-detail-top { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-bottom:14px; border-bottom:1px solid var(--border-1); }
        .meeting-detail-title { display:flex; align-items:center; gap:12px; }
        .meeting-detail-title h1 { margin:0; font-family:var(--font-serif); font-size:26px; font-weight:500; }
        .meeting-detail-body { display:grid; grid-template-columns:1.15fr .85fr; gap:18px; align-items:start; }
        .meeting-detail-card { border:1px solid var(--border-1); border-radius:10px; background:var(--color-ivory); padding:18px; }
        .meeting-detail-form { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px; }
        .meeting-detail-tasks { display:grid; gap:8px; }
        .meeting-task-toolbar { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px; }
        .meeting-task-toolbar h2 { margin:0; font-family:var(--font-serif); font-size:22px; font-weight:500; }
        .meeting-task-tools { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .meeting-task-tools select { min-height:34px; border:1px solid var(--border-1); border-radius:7px; background:#fff; padding:0 10px; font:inherit; font-size:12px; }
        .meeting-task-view { display:inline-flex; gap:2px; border:1px solid var(--border-1); border-radius:8px; background:#fff; padding:3px; }
        .meeting-task-view button { min-height:28px; border:0; border-radius:6px; background:transparent; padding:0 9px; font:inherit; font-size:11px; font-weight:750; cursor:pointer; }
        .meeting-task-view button.is-active { background:#111; color:#fff; }
        .meeting-task-table-wrap { overflow:auto; border:1px solid var(--border-1); border-radius:8px; background:#fff; }
        .meeting-task-table { width:100%; min-width:820px; border-collapse:collapse; }
        .meeting-task-table th { height:38px; background:#f7f6f2; border-bottom:1px solid var(--border-1); padding:0 10px; text-align:left; color:var(--fg-3); font-size:10px; text-transform:uppercase; letter-spacing:.04em; }
        .meeting-task-table td { border-bottom:1px solid var(--border-1); padding:10px; color:var(--fg-2); font-size:12px; vertical-align:top; }
        .meeting-task-table tr:last-child td { border-bottom:0; }
        .meeting-task-table strong { color:var(--fg-1); }
        .meeting-task-table small { display:block; margin-top:3px; color:var(--fg-3); }
        .meeting-task-table tr.is-overdue td { background:#fff3f1; }
        .meeting-task-status { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:4px 9px; font-size:11px; font-weight:800; white-space:nowrap; }
        .meeting-task-status::before { content:""; width:6px; height:6px; border-radius:50%; background:currentColor; }
        .meeting-task-status.is-offen { background:#fff7df; color:#9a6b12; }
        .meeting-task-status.is-in_bearbeitung { background:#e9f1ff; color:#2259a8; }
        .meeting-task-status.is-rueckfrage { background:#f1e9ff; color:#6841a5; }
        .meeting-task-status.is-erledigt { background:#e7f5ed; color:#2f7a45; }
        .meeting-task-status.is-ueberfaellig { background:#fde7e4; color:#a13232; }
        .meeting-task-status.is-verschoben { background:#efede8; color:#6d6760; }
        .meeting-task-cards { display:grid; gap:10px; }
        .meeting-task-card { border:1px solid var(--border-1); border-radius:10px; background:#fff; padding:12px; display:grid; gap:9px; }
        .meeting-task-card.is-carried { background:#fff8e4; }
        .meeting-task-card.is-overdue { border-color:#efcbc5; background:#fff3f1; }
        .meeting-task-card header { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
        .meeting-task-card h3 { margin:0; font-size:14px; }
        .meeting-task-meta { display:flex; flex-wrap:wrap; gap:8px; color:var(--fg-3); font-size:11px; }
        .meeting-task-dialog-backdrop { position:fixed; inset:0; z-index:2500; display:grid; place-items:center; background:rgba(24,22,20,.36); padding:22px; }
        .meeting-task-dialog { width:min(820px,96vw); max-height:92vh; display:grid; grid-template-rows:auto minmax(0,1fr) auto; overflow:hidden; border:1px solid var(--border-1); border-radius:10px; background:#fbfaf6; box-shadow:0 24px 80px rgba(20,18,16,.22); }
        .meeting-task-dialog > header { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding:22px 24px 16px; border-bottom:1px solid var(--border-1); background:#111; color:#fff; }
        .meeting-task-dialog > header span { color:#b8c1c9; font-size:11px; font-weight:750; text-transform:uppercase; letter-spacing:.04em; }
        .meeting-task-dialog > header h2 { margin:6px 0 0; font-family:var(--font-serif); font-size:29px; font-weight:500; }
        .meeting-task-dialog > header button { width:34px; height:34px; border:0; border-radius:50%; background:transparent; color:#fff; cursor:pointer; }
        .meeting-task-dialog__grid { min-height:0; overflow:auto; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; padding:20px 24px; }
        .meeting-task-dialog__grid label[style*="1 / -1"], .meeting-task-upload { grid-column:1 / -1; }
        .meeting-task-upload { display:grid; gap:6px; }
        .meeting-task-upload > div { min-height:68px; position:relative; display:grid; grid-template-columns:34px minmax(0,1fr); align-items:center; gap:10px; border:1px dashed #d8c7c1; border-radius:8px; background:#fff; padding:12px; cursor:pointer; }
        .meeting-task-upload small { display:block; margin-top:3px; color:var(--fg-3); font-size:11px; font-weight:500; }
        .meeting-task-upload input { position:absolute; inset:0; opacity:0; cursor:pointer; }
        .meeting-task-dialog > footer { display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--border-1); background:#fff; }
        @media(max-width:980px){ .meeting-detail-body{grid-template-columns:1fr}.meeting-task-dialog__grid{grid-template-columns:1fr} }
      `}</style>
      {selected ? (
        <div className="meeting-detail-page">
          <div className="meeting-detail-top">
            <div className="meeting-detail-title">
              <button className="back-btn" onClick={() => setSelectedId(null)} aria-label="Zurueck zur Liste">←</button>
              <h1>{fmt(selected.date)} - {selected.start || selected.time} bis {selected.end || '-'}</h1>
            </div>
            <button className="btn btn--primary" onClick={() => setSelectedId(null)}>Speichern</button>
          </div>

          <div className="meeting-detail-body">
            <section className="meeting-detail-card">
              <div className="meeting-detail-form">
                <Field label="Datum" type="date" value={selected.date} onChange={value => updateSelected({ date:value })} />
                <Field label="Beginn" type="time" value={selected.start || selected.time || ''} onChange={value => updateSelected({ start:value })} />
                <Field label="Ende" type="time" value={selected.end || ''} onChange={value => updateSelected({ end:value })} />
                <Field label="Naechster Termin" type="date" value={selected.nextDate} onChange={value => updateSelected({ nextDate:value })} />
                <MultiPeople label="Teilnehmer" value={selected.participants} onChange={value => updateSelected({ participants:value })} />
                <MultiPeople label="Besprechungsleiter" value={selected.leaders} onChange={value => updateSelected({ leaders:value })} />
                <Field label="Tagungsordnungspunkt" value={selected.agenda} onChange={value => updateSelected({ agenda:value })} wide textarea />
                <Field label="Beschreibung" value={selected.description} onChange={value => updateSelected({ description:value })} wide textarea />
              </div>
            </section>

            <section className="meeting-detail-card">
              <div className="meeting-task-toolbar">
                <h2>Aufgaben / offene Punkte</h2>
                <div className="meeting-task-tools">
                  <select value={taskStatusFilter} onChange={event => setTaskStatusFilter(event.target.value)}>
                    <option value="all">Alle Status</option>
                    {taskStatuses.map(status => <option key={status} value={status}>{taskStatusLabel(status)}</option>)}
                  </select>
                  <div className="meeting-task-view">
                    <button className={taskView === 'table' ? 'is-active' : ''} onClick={() => setTaskView('table')}>Tabelle</button>
                    <button className={taskView === 'cards' ? 'is-active' : ''} onClick={() => setTaskView('cards')}>Karten</button>
                  </div>
                  <button className="btn btn--ghost" onClick={() => setTaskDialogOpen(true)}><Icon name="plus" size={14} />Aufgabe</button>
                </div>
              </div>
              {taskView === 'table' ? <div className="meeting-task-table-wrap"><table className="meeting-task-table">
                <thead><tr><th>Status</th><th>Aufgabe</th><th>Hauptverantwortlicher</th><th>Weitere Personen</th><th>Termin</th><th>Priorität</th></tr></thead>
                <tbody>{visibleTasks.map(task => {
                  const status = task.status || 'offen';
                  const isOverdue = isTaskOverdue(task);
                  return <tr key={task.id} className={isOverdue ? 'is-overdue' : ''}>
                    <td><label style={{ display:'flex', alignItems:'center', gap:8 }}><input type="checkbox" checked={status === 'erledigt'} onChange={event => updateTask(task.id, { status:event.target.checked ? 'erledigt' : 'offen', completedAt:event.target.checked ? window.SEED.today : '', completedBy:event.target.checked ? 'e-me' : '' })} /><span className={'meeting-task-status is-' + (isOverdue ? 'ueberfaellig' : status)}>{isOverdue ? 'Überfällig' : taskStatusLabel(status)}</span></label></td>
                    <td><strong>{task.text}</strong><small>{task.description || task.comment || (task.carried ? 'Aus vorherigem Termin übernommen' : '')}</small></td>
                    <td>{personName(taskMainOwner(task))}</td>
                    <td>{names(taskSupporters(task))}</td>
                    <td>{fmt(task.due)}</td>
                    <td>{task.priority || 'Normal'}</td>
                  </tr>;
                })}</tbody>
              </table></div> : <div className="meeting-task-cards">
                {visibleTasks.map(task => {
                  const status = task.status || 'offen';
                  const isOverdue = isTaskOverdue(task);
                  return <article key={task.id} className={'meeting-task-card' + (task.carried ? ' is-carried' : '') + (isOverdue ? ' is-overdue' : '')}>
                    <header><h3>{task.text}</h3><span className={'meeting-task-status is-' + (isOverdue ? 'ueberfaellig' : status)}>{isOverdue ? 'Überfällig' : taskStatusLabel(status)}</span></header>
                    <div className="meeting-task-meta"><span>Haupt: {personName(taskMainOwner(task))}</span><span>Weitere: {names(taskSupporters(task))}</span><span>Termin: {fmt(task.due)}</span><span>Priorität: {task.priority || 'Normal'}</span></div>
                    {(task.description || task.comment) && <p className="small muted">{task.description || task.comment}</p>}
                  </article>;
                })}
              </div>}
              {!visibleTasks.length && <div className="meeting-cal__empty">Keine Aufgaben in dieser Ansicht.</div>}
            </section>
          </div>
          {taskDialogOpen && <TaskCreateDialog onClose={() => setTaskDialogOpen(false)} onSave={addTask} />}
        </div>
      ) : (
      <>
      <div className="view__header">
        <div>
          <h1 className="view__title">Bauleiterbesprechung</h1>
          <div className="view__subtitle">Besprechungen, offene Punkte, Aufgaben und automatische Uebernahme in den naechsten Termin.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost" onClick={createNextMeeting}><Icon name="history" size={14} />Folgetermin aus offenen Punkten</button>
          <button className="btn btn--primary" onClick={() => {
            const next = { ...initialMeetings[0], id:'bl-' + Date.now(), nr:Math.max(...meetings.map(item => item.nr)) + 1, date:'', start:'08:00', end:'09:00', agenda:'', tasks:[], conclusions:'', nextDate:'', description:'' };
            setMeetings(items => [next, ...items]);
            setSelectedId(next.id);
          }}><Icon name="plus" size={14} />Besprechung erstellen</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Besprechungen', value: meetings.length, delta:'gesamt', color: null },
          { label:'Offene Punkte', value: meetings.reduce((sum, item) => sum + openTasks(item).length, 0), delta:'nicht erledigt', color: '#a13232' },
          { label:'Naechster Termin', value: fmt(meetings[0]?.nextDate), delta:'aus letzter Besprechung', color: null },
          { label:'Teilnehmer', value: people.length, delta:'aus Mitarbeiterliste', color: null },
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

      <div className="meeting-viewbar">
        <div className="meeting-viewbar__seg" aria-label="Ansicht wechseln">
          <button type="button" className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><Icon name="matrix" size={13} />Liste</button>
          <button type="button" className={viewMode === 'calendar' ? 'is-active' : ''} onClick={() => setViewMode('calendar')}><Icon name="cal" size={13} />Kalender</button>
        </div>
        {viewMode === 'calendar' && <div className="meeting-cal__mode" aria-label="Kalenderansicht wechseln">
          {[
            ['day','Tag'],
            ['week','Woche'],
            ['month','Monat'],
            ['year','Jahr'],
          ].map(([key, label]) => <button key={key} type="button" className={calendarView === key ? 'is-active' : ''} onClick={() => setCalendarView(key)}>{label}</button>)}
        </div>}
      </div>

      <div>
        {viewMode === 'calendar' ? <section className="meeting-cal">
          <div className="meeting-cal__head"><h3>{calendarTitle}</h3></div>
          {calendarView === 'day' && <div className="meeting-cal__agenda">
            {meetingsForDate(calendarBaseDate).length ? meetingsForDate(calendarBaseDate).map(renderMeetingEvent) : <div className="meeting-cal__empty">Keine Bauleiterbesprechung an diesem Tag.</div>}
          </div>}
          {calendarView === 'week' && <div className="meeting-week">
            <div className="meeting-week__corner">GMT+02</div>
            {weekDays.map(day => {
              const isToday = day.iso === window.SEED.today;
              const dayName = day.date.toLocaleDateString('de-DE', { weekday:'short' }).replace('.', '').toUpperCase();
              return <div key={day.iso} className={'meeting-week__dayhead' + (isToday ? ' is-today' : '')}><div className="meeting-week__dayname">{dayName}</div><div className="meeting-week__daynum">{day.date.getDate()}</div></div>;
            })}
            {['7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM'].map((hour, hourIndex) => (
              <React.Fragment key={hour}>
                <div className="meeting-week__time">{hour}</div>
                {weekDays.map(day => <div key={day.iso + hour} className="meeting-week__cell">{hourIndex === 1 && day.items.slice(0,2).map(meeting => <button key={meeting.id} type="button" className="meeting-week__pill" onClick={() => setSelectedId(meeting.id)}>BL {meeting.nr}</button>)}</div>)}
              </React.Fragment>
            ))}
          </div>}
          {calendarView === 'month' && <>
            <div className="meeting-cal__weekdays">{['SO','MO','DI','MI','DO','FR','SA'].map(day => <div key={day}>{day}</div>)}</div>
            <div className="meeting-cal__grid">
              {monthDays.map(day => {
                const isToday = day.iso === window.SEED.today;
                const isFirst = day.date.getDate() === 1;
                return <div key={day.iso} className={'meeting-cal__day' + (!day.inMonth ? ' is-muted' : '')}>
                  <div className={'meeting-cal__date' + (isToday ? ' is-today' : '')}><span>{isFirst ? day.date.toLocaleDateString('de-DE', { day:'numeric', month:'short' }) : day.date.getDate()}</span></div>
                  <div className="meeting-cal__events">{day.items.slice(0,2).map(renderMeetingEvent)}{day.items.length > 2 && <small>+ {day.items.length - 2} weitere</small>}</div>
                </div>;
              })}
            </div>
          </>}
          {calendarView === 'year' && <div className="meeting-year">
            {yearMonths.map(month => <div key={month.month} className="meeting-year__month">
              <h4>{month.label}</h4>
              <div className="meeting-mini">
                {['S','M','D','M','D','F','S'].map((day, index) => <div key={day + index} className="meeting-mini__weekday">{day}</div>)}
                {miniMonthDays(month.month).map(day => {
                  const isToday = day.iso === window.SEED.today;
                  return <button key={day.iso} type="button" className={'meeting-mini__day' + (!day.inMonth ? ' is-muted' : '') + (isToday ? ' is-today' : '') + (day.hasItem ? ' has-item' : '')} onClick={() => { const first = meetingsForDate(day.iso)[0]; if (first) setSelectedId(first.id); }}>{day.date.getDate()}</button>;
                })}
              </div>
            </div>)}
          </div>}
        </section> : <>
        <section className="tbl-wrap">
          <table className="tbl job-table">
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Datum</th>
                <th>Beginn</th>
                <th>Ende</th>
                <th>Teilnehmer</th>
                <th>Besprechungsleiter</th>
                <th>Tagungsordnungspunkt</th>
                <th>Aufgaben</th>
                <th>Termin</th>
                <th>Schlussfolgerungen</th>
                <th>Naechster Termin</th>
                <th>Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(meeting => (
                <tr key={meeting.id} className="job-row" onClick={() => setSelectedId(meeting.id)} style={{ cursor:'pointer', background:meeting.id === selected?.id ? 'var(--color-parchment)' : undefined }}>
                  <td><strong>{meeting.nr}</strong></td>
                  <td>{fmt(meeting.date)}</td>
                  <td>{meeting.start || meeting.time}</td>
                  <td>{meeting.end || '-'}</td>
                  <td>{meeting.participants.length} TN</td>
                  <td>{names(meeting.leaders)}</td>
                  <td>{meeting.agenda}</td>
                  <td><span className={'badge ' + (openTasks(meeting).length ? 'badge--warn' : 'badge--valid')}><span className="badge__dot" />{openTasks(meeting).length} offen</span></td>
                  <td>{fmt(meeting.deadline)}</td>
                  <td>{meeting.conclusions}</td>
                  <td>{fmt(meeting.nextDate)}</td>
                  <td>{meeting.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        </>}

      </div>
      </>
      )}
    </div>
  );
}

Object.assign(window, { BauleiterbesprechungView });
