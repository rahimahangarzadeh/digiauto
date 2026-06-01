/* Login + Tweaks panel */

function Login({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const roles = [
    { key:'superadmin', title:'Admin', sub:'Alle Firmen, alle Rechte' },
    { key:'admin',      title:'Geschäftsführer / Verwaltung / Bauleiter', sub:'Eine Firma, Verwaltungsrechte' },
    { key:'employee',   title:'Mitarbeiter', sub:'Nur eigene Daten' },
  ];

  return (
    <div className="login-page">
      <div className="login-page__panel">
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div className="sidebar__brand-mark">J</div>
          <div>
            <div style={{fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500}}>Janning · Qualifikation</div>
            <div className="small muted">Schulungs- und Qualifikationsmatrix</div>
          </div>
        </div>

        <div>
          <div style={{fontFamily:'var(--font-serif)', fontSize:40, fontWeight:500, lineHeight:1.1, letterSpacing:'-0.3px'}}>Anmelden.</div>
          <div className="small muted" style={{marginTop:6, maxWidth:380}}>
            Willkommen zurück. Melden Sie sich mit Ihrer Firmen-E-Mail an — oder wählen Sie eine Rolle, um die Demo zu betreten.
          </div>
          <div className="login-form">
            <label>E-Mail</label>
            <input type="email" placeholder="name@janning-gruppe.de" value={email} onChange={e=>setEmail(e.target.value)} />
            <label>Passwort</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="login-form__submit" onClick={()=>onLogin('admin')}>Anmelden</button>

            <div style={{fontSize:11.5, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:0.5, marginTop:26, marginBottom:10}}>
              Oder Demo-Rolle wählen
            </div>
            <div className="login-roles">
              {roles.map(r => (
                <button key={r.key} className="login-role" onClick={()=>onLogin(r.key)}>
                  <strong>{r.title}</strong>
                  <span>{r.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="small muted">
          Fünf Firmen der Janning-Gruppe · Tiefbau, Bohrtechnik, Rohrbau, Galabau, Transporte.
        </div>
      </div>

      <div className="login-page__panel login-page__dark">
        <div className="small" style={{color:'var(--fg-on-dark-2)', letterSpacing:0.5, textTransform:'uppercase'}}>Qualifikation, aufgeräumt.</div>
        <div>
          <div className="login-quote">
            „Wer was kann, wann — und wann es nachgeschult werden muss. Alles an einer Stelle, ohne Lärm."
          </div>
          <div className="login-caption" style={{marginTop:24}}>
            Ein ruhiges Werkzeug für Unterweisungen, Zertifikate und Fristen. Gebaut für die Janning-Gruppe.
          </div>
        </div>

        <div style={{display:'flex', gap:18, alignItems:'center', flexWrap:'wrap'}}>
          {window.SEED.companies.map(c => (
            <div key={c.id} style={{background:'#fff', borderRadius:8, padding:'8px 10px', height:40, display:'grid', placeItems:'center'}}>
              <img src={c.logo} alt={c.short} style={{height:22, maxWidth:120, objectFit:'contain'}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TweaksPanel({ open, tweaks, setTweaks }) {
  if (!open) return null;
  const rows = [
    { key:'role', label:'Rolle', options:[['admin','Admin'],['superadmin','Superadmin'],['employee','Mitarbeiter']] },
    { key:'density', label:'Dichte', options:[['comfortable','Komfortabel'],['compact','Kompakt']] },
    { key:'cellStyle', label:'Matrixzelle', options:[['dot-date','Punkt + Datum'],['filled','Gefüllt']] },
  ];
  return (
    <div className="tweaks-panel">
      <div className="tweaks-panel__title">Tweaks</div>
      <div className="tweaks-panel__sub">Varianten umschalten.</div>
      {rows.map(r => (
        <div key={r.key} className="tweak-row">
          <div className="tweak-row__label">{r.label}</div>
          <div className="tweak-row__options">
            {r.options.map(([v, l]) => (
              <button key={v}
                className={'tweak-chip' + (tweaks[r.key] === v ? ' tweak-chip--active' : '')}
                onClick={()=>setTweaks({...tweaks, [r.key]: v})}>{l}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Login, TweaksPanel });
