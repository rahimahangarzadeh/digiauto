// Shared tiny components & helpers used across views.
// Exposed on window.* because Babel scripts don't share scope.

const SEED = window.SEED;

/* ---- helpers ---- */
function byId(arr, id) { return arr.find(x => x.id === id); }
function company(id)   { return byId(SEED.companies, id); }
function training(id)  { return byId(SEED.trainings, id); }
function employee(id)  { return byId(SEED.employees, id); }
function provider(id)  { return byId(SEED.providers, id); }

function fmtDE(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
function daysFromToday(iso) {
  if (!iso) return null;
  const t = new Date(SEED.today);
  const d = new Date(iso);
  return Math.round((d - t)/(1000*60*60*24));
}

/* ---- Icon (Lucide-style inline svg) ---- */
const ICONS = {
  dashboard: 'M3 13h7V3H3v10zm0 8h7v-6H3v6zm11 0h7V11h-7v10zm0-18v6h7V3h-7z',
  matrix: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  users: 'M16 11a4 4 0 1 0-8 0M2 21v-1a6 6 0 0 1 12 0v1M18 8a3 3 0 1 0 0-6M22 21v-1a5 5 0 0 0-4-4.9',
  cap: 'M22 10L12 4 2 10l10 6 10-6zm0 0v6M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5',
  cal: 'M3 5h18v16H3zM3 9h18M8 3v4M16 3v4',
  doc: 'M7 3h8l4 4v14H7zM15 3v5h4',
  shield: 'M12 2l8 3v7c0 4.97-3.58 9.16-8 10-4.42-.84-8-5.03-8-10V5l8-3z',
  building: 'M4 22V4h16v18M9 8h.01M13 8h.01M9 12h.01M13 12h.01M9 16h.01M13 16h.01',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0',
  search: 'M11 11m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0M21 21l-4.3-4.3',
  plus: 'M12 5v14M5 12h14',
  chev: 'M6 9l6 6 6-6',
  chevR: 'M9 18l6-6-6-6',
  chevL: 'M15 18l-6-6 6-6',
  download: 'M12 3v12M6 9l6 6 6-6M3 21h18',
  filter: 'M3 5h18l-7 8v6l-4 2v-8z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  upload: 'M12 21V9M6 15l6-6 6 6M3 3h18',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  mail: 'M4 4h16v16H4zM4 4l8 8 8-8',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71',
  pin: 'M12 21s-7-8-7-13a7 7 0 1 1 14 0c0 5-7 13-7 13zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z',
  flag: 'M4 22V4s3-2 7-2 5 2 9 2v12c-4 0-5-2-9-2s-7 2-7 2',
  history: 'M3 12a9 9 0 1 0 3-6.7M3 3v6h6M12 7v5l4 2',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6',
};

function Icon({ name, size = 18, stroke = 1.5, style = {} }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style}>
      <path d={d} />
    </svg>
  );
}

/* ---- Status helpers ---- */
const STATUS_LABEL = {
  valid: 'Gültig',
  warn: 'Läuft ab',
  expired: 'Abgelaufen',
  planned: 'Geplant',
  missing: 'Fehlt',
};

function StatusBadge({ status, children }) {
  const map = { valid: 'badge--valid', warn: 'badge--warn', expired: 'badge--expired', planned: 'badge--planned', missing: 'badge--missing' };
  return (
    <span className={`badge ${map[status] || ''}`}>
      <span className="badge__dot" />
      {children || STATUS_LABEL[status]}
    </span>
  );
}

/* ---- Matrix cell ---- */
function MatrixCell({ cert, emp, training }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  
  if (!cert || cert.status === 'missing') {
    return <div className="cell cell--missing"><span className="cell__dot" /></div>;
  }
  
  const status = cert.status;
  const statusCfg = {
    valid:   { color:'#5f9268', bg:'#eff5ed', border:'#cde1cf', icon:'✔' },
    warn:    { color:'#c89b3f', bg:'#fdf3e0', border:'#e8d4a6', icon:'⏳' },
    expired: { color:'#b26060', bg:'#fbecea', border:'#e8c4be', icon:'❌' },
    planned: { color:'#2d6fa3', bg:'#e8f1fb', border:'#bcd3ee', icon:'⏳' },
  };
  const cfg = statusCfg[status];
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpen]);
  
  const handleStatusChange = (newStatus) => {
    if (emp && training) {
      window.SEED.certs[emp.id][training.id].status = newStatus;
      setMenuOpen(false);
      // Trigger re-render by updating a dummy state (could also use window.dispatchEvent)
      window.dispatchEvent(new Event('matrix-cell-updated'));
    }
  };
  
  return (
    <div ref={menuRef} style={{ position:'relative', display:'inline-block' }}>
      <div
        onClick={() => setMenuOpen(!menuOpen)}
        onMouseEnter={(e) => !menuOpen && (e.currentTarget.style.outline='2px solid '+cfg.color)}
        onMouseLeave={(e) => !menuOpen && (e.currentTarget.style.outline='none')}
        style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:62, minHeight:38, borderRadius:6,
          background: cfg.bg, border:'1px solid '+cfg.border,
          color: cfg.color, fontSize:14, fontWeight:500,
          cursor:'pointer', transition:'all 150ms', userSelect:'none',
          padding:'4px 6px', title: cert.expiresAt ? `Gültig bis ${fmtDE(cert.expiresAt)}` : ''
        }}>
        {cfg.icon}
      </div>
      
      {menuOpen && emp && training && (
        <div style={{
          position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
          marginTop:6, background:'var(--color-ivory)', border:'1px solid var(--border-1)',
          borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:1000,
          minWidth:180, overflow:'hidden',
          animation:'qaSlideUp 120ms cubic-bezier(0.4,0,0.2,1)',
        }}>
          <style>{`@keyframes qaSlideUp { from { transform:translateY(-8px) translateX(-50%); opacity:0 } to { transform:translateY(0) translateX(-50%); opacity:1 } }`}</style>
          
          {[
            { val:'valid',   label:'✔ Teilgenommen',    emoji:'✔' },
            { val:'expired', label:'❌ Nicht teilgenommen', emoji:'❌' },
            { val:'planned', label:'⏳ Nachholen',       emoji:'⏳' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => handleStatusChange(opt.val)}
              style={{
                display:'flex', alignItems:'center', gap:10, width:'100%',
                padding:'10px 14px', border:'none', background:'transparent',
                color:'var(--fg-1)', fontSize:13, cursor:'pointer',
                fontFamily:'inherit', fontWeight:500,
                borderBottom: opt.val !== 'planned' ? '1px solid var(--border-1)' : 'none',
                transition:'background 120ms',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background='var(--color-parchment)'}
              onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
            >
              <span style={{ fontSize:16 }}>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
          
          {status === 'planned' && (
            <>
              <div style={{ height:'1px', background:'var(--border-1)' }}></div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('navigate-to-calendar', { detail: { trainingId: training.id } }));
                }}
                style={{
                  display:'flex', alignItems:'center', gap:8, width:'100%',
                  padding:'10px 14px', border:'none', background:'transparent',
                  color:'var(--color-accent)', fontSize:13, cursor:'pointer',
                  fontFamily:'inherit', fontWeight:600,
                  transition:'background 120ms',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background='rgba(201,100,66,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
              >
                <span style={{ fontSize:14 }}>📅</span>
                <span>Termin planen</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Company logo tile ---- */
function CompanyChip({ id, size = 28 }) {
  const c = company(id);
  if (!c) return null;
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:8}}>
      <div className="company-switch__logo" style={{width:size,height:size}}>
        <img src={c.logo} alt={c.short} />
      </div>
      <span style={{fontSize:13, color:'var(--fg-1)'}}>{c.short}</span>
    </div>
  );
}

/* ---- Empty placeholder ---- */
function Empty({ title, sub }) {
  return (
    <div style={{padding:'40px 24px', textAlign:'center', color:'var(--fg-3)'}}>
      <div style={{fontFamily:'var(--font-serif)', fontSize:18, color:'var(--fg-2)', marginBottom:4}}>{title}</div>
      {sub && <div style={{fontSize:13}}>{sub}</div>}
    </div>
  );
}

Object.assign(window, {
  Icon, StatusBadge, MatrixCell, CompanyChip, Empty,
  byId, company, training, employee, provider, fmtDE, daysFromToday, STATUS_LABEL,
});
