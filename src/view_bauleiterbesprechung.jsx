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
        { id:'t1', text:'MVAS-Beschilderung fuer Kanalsanierung pruefen', owner:['e-me'], due:'2026-05-11', status:'offen' },
        { id:'t2', text:'SCC 017 fuer Bauleiter-Team nachplanen', owner:['e1002'], due:'2026-05-18', status:'offen' },
        { id:'t3', text:'Materialliste Schachtbau freigeben', owner:['e1003'], due:'2026-05-06', status:'erledigt' },
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
        { id:'t4', text:'MVAS-Beschilderung fuer Kanalsanierung pruefen', owner:['e-me'], due:'2026-05-18', status:'erledigt', carried:true },
        { id:'t5', text:'SCC 017 fuer Bauleiter-Team nachplanen', owner:['e1002'], due:'2026-05-24', status:'offen', carried:true },
        { id:'t6', text:'Ersatzpersonal fuer Rohrbau KW 22 klaeren', owner:['e1004'], due:'2026-05-22', status:'offen' },
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
        { id:'t7', text:'SCC 017 fuer Bauleiter-Team nachplanen', owner:['e1002'], due:'2026-06-07', status:'offen', carried:true },
        { id:'t8', text:'Ersatzpersonal fuer Rohrbau KW 22 klaeren', owner:['e1004'], due:'2026-06-03', status:'offen', carried:true },
        { id:'t9', text:'BGBAU-Aushang fuer neue Baustelle hochladen', owner:['e1006'], due:'2026-06-05', status:'offen' },
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
  const updateSelected = (patch) => {
    if (!selected) return;
    setMeetings(items => items.map(item => item.id === selected.id ? { ...item, ...patch } : item));
  };
  const updateTask = (taskId, patch) => {
    if (!selected) return;
    updateSelected({ tasks:selected.tasks.map(task => task.id === taskId ? { ...task, ...patch } : task) });
  };
  const addTask = () => {
    if (!selected) return;
    const text = window.prompt('Neue Aufgabe / offener Punkt');
    if (!text) return;
    updateSelected({
      tasks:[...selected.tasks, { id:'t' + Date.now(), text, owner:[], due:selected.nextDate || selected.deadline, status:'offen' }],
    });
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
      responsible:selected.responsible,
      tasks:carried,
      assigned:selected.assigned,
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
    const toggle = (id) => onChange(selectedValues.includes(id) ? selectedValues.filter(item => item !== id) : [...selectedValues, id]);
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
        .meeting-people-list { max-height:132px; overflow:auto; display:grid; }
        .meeting-person-option { display:flex; align-items:flex-start; gap:9px; padding:8px 10px; border-bottom:1px solid var(--border-1); cursor:pointer; }
        .meeting-person-option:hover { background:var(--color-warm-sand); }
        .meeting-person-option small { display:block; color:var(--fg-3); margin-top:2px; }
      `}</style>
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

      <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4, minmax(150px, 1fr))', marginBottom:18 }}>
        <div className="kpi"><div className="kpi__label">Besprechungen</div><div className="kpi__value">{meetings.length}</div><div className="kpi__delta">gesamt</div></div>
        <div className="kpi"><div className="kpi__label">Offene Punkte</div><div className="kpi__value" style={{ color:'#a13232' }}>{meetings.reduce((sum, item) => sum + openTasks(item).length, 0)}</div><div className="kpi__delta">nicht erledigt</div></div>
        <div className="kpi"><div className="kpi__label">Naechster Termin</div><div className="kpi__value" style={{ fontSize:28 }}>{fmt(meetings[0]?.nextDate)}</div><div className="kpi__delta">aus letzter Besprechung</div></div>
        <div className="kpi"><div className="kpi__label">Teilnehmer</div><div className="kpi__value">{people.length}</div><div className="kpi__delta">aus Mitarbeiterliste</div></div>
      </div>

      <div>
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
                <th>Verantwortlich</th>
                <th>Aufgaben</th>
                <th>Zustaendige Person</th>
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
                  <td>{names(meeting.responsible)}</td>
                  <td><span className={'badge ' + (openTasks(meeting).length ? 'badge--warn' : 'badge--valid')}><span className="badge__dot" />{openTasks(meeting).length} offen</span></td>
                  <td>{names(meeting.assigned)}</td>
                  <td>{fmt(meeting.deadline)}</td>
                  <td>{meeting.conclusions}</td>
                  <td>{fmt(meeting.nextDate)}</td>
                  <td>{meeting.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {selected && <>
        <div className="meeting-drawer-backdrop" onClick={() => setSelectedId(null)} />
        <aside className="meeting-drawer">
          <div className="meeting-drawer__hero">
            <button className="meeting-drawer__close" onClick={() => setSelectedId(null)} title="Schliessen"><Icon name="x" size={22} /></button>
            <div className="avatar avatar--3">{String(selected.nr).padStart(2, '0')}</div>
            <div>
              <h2>Bauleiterbesprechung {selected.nr}</h2>
              <p>{fmt(selected.date)} - {selected.start || selected.time} bis {selected.end || '-'}</p>
              <span className={'badge ' + (openTasks(selected).length ? 'badge--warn' : 'badge--valid')}><span className="badge__dot" />{openTasks(selected).length ? openTasks(selected).length + ' offene Punkte' : 'alles erledigt'}</span>
            </div>
          </div>
          <div className="meeting-drawer__body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Datum" type="date" value={selected.date} onChange={value => updateSelected({ date:value })} />
              <Field label="Beginn" type="time" value={selected.start || selected.time || ''} onChange={value => updateSelected({ start:value })} />
              <Field label="Ende" type="time" value={selected.end || ''} onChange={value => updateSelected({ end:value })} />
              <MultiPeople label="Teilnehmer" value={selected.participants} onChange={value => updateSelected({ participants:value })} />
              <MultiPeople label="Besprechungsleiter" value={selected.leaders} onChange={value => updateSelected({ leaders:value })} />
              <Field label="Tagungsordnungspunkt" value={selected.agenda} onChange={value => updateSelected({ agenda:value })} wide textarea />
              <MultiPeople label="Verantwortlich" value={selected.responsible} onChange={value => updateSelected({ responsible:value })} />
              <MultiPeople label="Zustaendige Person" value={selected.assigned} onChange={value => updateSelected({ assigned:value })} />
              <Field label="Termin" type="date" value={selected.deadline} onChange={value => updateSelected({ deadline:value })} />
              <Field label="Naechster Termin" type="date" value={selected.nextDate} onChange={value => updateSelected({ nextDate:value })} />
              <Field label="Schlussfolgerungen" value={selected.conclusions} onChange={value => updateSelected({ conclusions:value })} wide textarea />
              <Field label="Beschreibung" value={selected.description} onChange={value => updateSelected({ description:value })} wide textarea />
            </div>

            <div style={{ marginTop:18, borderTop:'1px solid var(--border-1)', paddingTop:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <strong>Aufgaben / offene Punkte</strong>
                <button className="btn btn--ghost" onClick={addTask}><Icon name="plus" size={14} />Aufgabe</button>
              </div>
              <div style={{ display:'grid', gap:8 }}>
                {selected.tasks.map(task => (
                  <div key={task.id} style={{ border:'1px solid var(--border-1)', borderRadius:10, padding:10, background:task.carried ? '#fff8e4' : 'var(--color-white)' }}>
                    <label style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <input type="checkbox" checked={task.status === 'erledigt'} onChange={event => updateTask(task.id, { status:event.target.checked ? 'erledigt' : 'offen' })} />
                      <span style={{ display:'grid', gap:4 }}>
                        <strong>{task.text}</strong>
                        <span className="small muted">{task.carried ? 'Aus vorherigem Termin uebernommen - ' : ''}Zustaendig: {names(task.owner)} - Termin: {fmt(task.due)}</span>
                      </span>
                    </label>
                  </div>
                ))}
                {!selected.tasks.length && <div className="small muted">Keine Aufgaben hinterlegt.</div>}
              </div>
            </div>
          </div>
        </aside>
        </>}
      </div>
    </div>
  );
}

Object.assign(window, { BauleiterbesprechungView });
