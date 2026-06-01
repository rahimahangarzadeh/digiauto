/* QuickActions - Chatbot Nachricht an Admin */

function QuickActions({ role }) {
  if (role !== 'admin') return null;

  const initialMessages = [
    { id:'m1', from:'admin', text:'Hallo, wenn du Fragen zu Dokumenten, Schulungen oder Stellenanzeigen hast, schreib mir hier.', time:'Mo. 09:14' },
  ];
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_chat_messages') || 'null') || initialMessages; }
    catch { return initialMessages; }
  });
  const [text, setText] = React.useState('');
  const [activeForm, setActiveForm] = React.useState(null);
  const [schulungForm, setSchulungForm] = React.useState({ training:'', employees:[], date:'', location:'', note:'' });
  const [stelleForm, setStelleForm] = React.useState({ position:'', company:'', count:'1', startDate:'', description:'' });
  const chatBodyRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const scrollToBottom = () => {
      const body = chatBodyRef.current;
      if (!body) return;
      body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
    };
    const first = window.setTimeout(scrollToBottom, 80);
    const afterResize = window.setTimeout(scrollToBottom, 240);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(afterResize);
    };
  }, [activeForm, messages.length, open]);

  const saveMessages = (next) => {
    setMessages(next);
    try { localStorage.setItem('admin_chat_messages', JSON.stringify(next)); } catch {}
  };

  const sendMessage = (messageText, type = 'nachricht') => {
    const clean = String(messageText || '').trim();
    if (!clean) return;
    const msg = {
      id: 'msg-' + Date.now(),
      from: 'user',
      type,
      text: clean,
      time: new Date().toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' }),
    };
    const next = [...messages, msg];
    saveMessages(next);
    setText('');
    try {
      const current = JSON.parse(localStorage.getItem('admin_requests') || '[]');
      localStorage.setItem('admin_requests', JSON.stringify([{ ...msg, status:'neu', fromRole:'Geschaeftsfuehrer / Verwaltung / Bauleiter' }, ...current]));
      window.dispatchEvent(new Event('admin-requests-updated'));
    } catch {}
  };

  const input = { width:'100%', padding:'9px 10px', border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', color:'var(--fg-1)', fontFamily:'inherit', fontSize:13, boxSizing:'border-box' };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom:10 }}>
      <label style={{ display:'block', fontSize:10.5, fontWeight:800, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:0.4, marginBottom:4 }}>{label}</label>
      {children}
    </div>
  );
  const selectedEmployees = Array.isArray(schulungForm.employees)
    ? schulungForm.employees
    : (schulungForm.employee ? [schulungForm.employee] : []);
  const addTrainingEmployee = (name) => {
    if (!name || selectedEmployees.includes(name)) return;
    setSchulungForm(f => ({ ...f, employees:[...selectedEmployees, name] }));
  };
  const removeTrainingEmployee = (name) => {
    setSchulungForm(f => ({ ...f, employees:selectedEmployees.filter(employee => employee !== name) }));
  };
  const sendTrainingForm = () => {
    const names = selectedEmployees.length ? selectedEmployees.join(', ') : '-';
    const msg = `Schulung anmelden: ${schulungForm.training || '-'} fuer ${names} am ${schulungForm.date || '-'}, Ort/Baustelle: ${schulungForm.location || '-'}. ${schulungForm.note ? 'Bemerkung: ' + schulungForm.note : ''}`;
    sendMessage(msg, 'schulung');
    setActiveForm(null);
  };
  const sendJobForm = () => {
    const msg = `Stellenanzeige erstellen: Position ${stelleForm.position || '-'}, Firma/Baustelle: ${stelleForm.company || '-'}, Anzahl Personen: ${stelleForm.count || '-'}, Startdatum: ${stelleForm.startDate || '-'}. ${stelleForm.description ? 'Beschreibung: ' + stelleForm.description : ''}`;
    sendMessage(msg, 'stelle');
    setActiveForm(null);
  };

  return (
    <React.Fragment>
      <div style={{ position:'fixed', bottom:28, right:28, zIndex:900, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'var(--color-near-black)', color:'#fff', fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.18)' }}>
          Nachricht an Admin
        </div>
        <button
          onClick={() => setOpen(true)}
          title="Nachricht an Admin"
          style={{ width:56, height:56, borderRadius:'50%', background:'var(--color-terracotta)', border:0, color:'#fff', display:'grid', placeItems:'center', cursor:'pointer', boxShadow:'0 6px 20px rgba(201,100,66,0.32)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        </button>
      </div>

      {open && (
        <div style={{
          position:'fixed',
          right:28,
          bottom:96,
          zIndex:3000,
          width:activeForm ? 760 : 420,
          maxWidth:'calc(100vw - 32px)',
          height:activeForm ? 720 : 520,
          maxHeight:'calc(100vh - 120px)',
          background:'var(--color-ivory)',
          border:'1px solid var(--border-1)',
          borderRadius:16,
          boxShadow:'0 22px 70px rgba(0,0,0,0.24)',
          display:'flex',
          flexDirection:'column',
          overflow:'hidden',
          transition:'width 180ms ease, height 180ms ease',
        }}>
          <div style={{ padding:'18px 22px 16px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', background:'var(--color-ivory)' }}>
            <div>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:24, lineHeight:1.1 }}>Nachricht an Admin</div>
              <div style={{ fontSize:13, color:'var(--fg-3)', marginTop:5 }}>Admin hat vollstaendigen Verlauf</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button title="Einstellungen" style={{ border:0, background:'transparent', color:'var(--fg-3)', cursor:'pointer', padding:4 }}><Icon name="settings" size={18} /></button>
              <button onClick={() => setOpen(false)} title="Schliessen" style={{ border:0, background:'transparent', color:'var(--fg-3)', cursor:'pointer', padding:4, fontSize:22, lineHeight:1 }}>×</button>
            </div>
          </div>

          <div style={{ padding:'16px 16px 10px', display:'flex', gap:8, flexWrap:'wrap', borderBottom:'1px solid var(--border-1)' }}>
            <button onClick={() => setActiveForm(activeForm === 'schulung' ? null : 'schulung')}
              style={{ border:'1px solid var(--border-1)', background:activeForm === 'schulung' ? 'var(--color-near-black)' : 'var(--color-white)', color:activeForm === 'schulung' ? '#fff' : 'var(--fg-1)', borderRadius:999, padding:'7px 10px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Schulung anmelden
            </button>
            <button onClick={() => setActiveForm(activeForm === 'stelle' ? null : 'stelle')}
              style={{ border:'1px solid var(--border-1)', background:activeForm === 'stelle' ? 'var(--color-near-black)' : 'var(--color-white)', color:activeForm === 'stelle' ? '#fff' : 'var(--fg-1)', borderRadius:999, padding:'7px 10px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Stellenanzeige erstellen
            </button>
          </div>

          <div ref={chatBodyRef} style={{ flex:1, padding:'16px', overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ alignSelf:msg.from === 'user' ? 'flex-end' : 'flex-start', maxWidth:'82%' }}>
                <div style={{ background:msg.from === 'user' ? '#e8eaf7' : '#f4f3ee', color:'var(--fg-1)', borderRadius:12, padding:'10px 12px', fontSize:14, lineHeight:1.35 }}>
                  {msg.text}
                </div>
                <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:4, textAlign:msg.from === 'user' ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            ))}
            {activeForm === 'schulung' && (
              <div style={{ alignSelf:'flex-start', width:'100%', background:'#f4f3ee', border:'1px solid var(--border-1)', borderRadius:12, padding:12 }}>
                <div style={{ fontWeight:800, marginBottom:10 }}>Schulung anmelden</div>
                <Field label="Schulung">
                  <select value={schulungForm.training} onChange={e => setSchulungForm(f => ({ ...f, training:e.target.value }))} style={input}>
                    <option value="">-- Schulung auswaehlen --</option>
                    {(window.SEED.trainings || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </Field>
                <Field label="Teilnehmer">
                  <select value="" onChange={e => addTrainingEmployee(e.target.value)} style={input}>
                    <option value="">-- Mitarbeiter hinzufuegen --</option>
                    {(window.SEED.employees || [])
                      .filter(e => e.status === 'aktiv' && !selectedEmployees.includes(e.name))
                      .map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                  </select>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                    {selectedEmployees.map(name => (
                      <span key={name} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#d7f1f0', color:'#087878', borderRadius:999, padding:'5px 8px', fontSize:12, fontWeight:700 }}>
                        {name}
                        <button onClick={() => removeTrainingEmployee(name)} title="Entfernen" style={{ border:0, background:'transparent', color:'#087878', cursor:'pointer', padding:0, fontSize:16, lineHeight:1 }}>x</button>
                      </span>
                    ))}
                  </div>
                </Field>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <Field label="Wunschdatum"><input type="date" value={schulungForm.date} onChange={e => setSchulungForm(f => ({ ...f, date:e.target.value }))} style={input} /></Field>
                  <Field label="Ort / Baustelle"><input value={schulungForm.location} onChange={e => setSchulungForm(f => ({ ...f, location:e.target.value }))} style={input} /></Field>
                </div>
                <Field label="Bemerkung"><textarea value={schulungForm.note} onChange={e => setSchulungForm(f => ({ ...f, note:e.target.value }))} style={{ ...input, minHeight:64, resize:'vertical' }} /></Field>
                <button onClick={sendTrainingForm} style={{ width:'100%', border:0, borderRadius:9, background:'var(--color-terracotta)', color:'#fff', padding:'10px', fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Als Nachricht senden</button>
              </div>
            )}
            {activeForm === 'stelle' && (
              <div style={{ alignSelf:'flex-start', width:'100%', background:'#f4f3ee', border:'1px solid var(--border-1)', borderRadius:12, padding:12 }}>
                <div style={{ fontWeight:800, marginBottom:10 }}>Stellenanzeige erstellen</div>
                <Field label="Position"><input value={stelleForm.position} onChange={e => setStelleForm(f => ({ ...f, position:e.target.value }))} style={input} /></Field>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <Field label="Firma / Baustelle"><input value={stelleForm.company} onChange={e => setStelleForm(f => ({ ...f, company:e.target.value }))} style={input} /></Field>
                  <Field label="Anzahl Personen"><input type="number" min="1" value={stelleForm.count} onChange={e => setStelleForm(f => ({ ...f, count:e.target.value }))} style={input} /></Field>
                </div>
                <Field label="Startdatum"><input type="date" value={stelleForm.startDate} onChange={e => setStelleForm(f => ({ ...f, startDate:e.target.value }))} style={input} /></Field>
                <Field label="Beschreibung"><textarea value={stelleForm.description} onChange={e => setStelleForm(f => ({ ...f, description:e.target.value }))} style={{ ...input, minHeight:64, resize:'vertical' }} /></Field>
                <button onClick={sendJobForm} style={{ width:'100%', border:0, borderRadius:9, background:'var(--color-terracotta)', color:'#fff', padding:'10px', fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Als Nachricht senden</button>
              </div>
            )}
          </div>

          <div style={{ padding:16, borderTop:'1px solid var(--border-1)', display:'grid', gridTemplateColumns:'1fr auto', gap:8, background:'var(--color-ivory)' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Nachricht schreiben..."
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(text);
                }
              }}
              style={{ minHeight:48, maxHeight:110, resize:'vertical', border:'1px solid var(--border-1)', borderRadius:8, padding:'12px', fontFamily:'inherit', fontSize:15, background:'var(--color-white)', outline:'none' }}
            />
            <button onClick={() => sendMessage(text)} style={{ alignSelf:'end', height:48, padding:'0 18px', border:0, borderRadius:10, background:'var(--color-terracotta)', color:'#fff', fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
              Senden
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

Object.assign(window, { QuickActions });
