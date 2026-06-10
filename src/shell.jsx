/* Sidebar + Topbar + overall layout */

function demoIdentityForRole(role) {
  if (role === 'employee') {
    return { initials:'DB', name:'Daniel Bert', firstName:'Daniel', lastName:'Bert', position:'Mitarbeiter', roleLabel:'Mitarbeiter - Galabau', company:'galabau', email:'daniel.bert@janning-gruppe.de', phone:'+49 2562 8804-12' };
  }
  if (role === 'superadmin') {
    return { initials:'RA', name:'Rahim Ahangarzadeh', firstName:'Rahim', lastName:'Ahangarzadeh', position:'Admin', roleLabel:'Admin', company:'all', email:'rahim.ahangarzadeh@janning-gruppe.de', phone:'+49 5921 8800-0' };
  }
  return { initials:'CJ', name:'Christian Janning', firstName:'Christian', lastName:'Janning', position:'Geschäftsführer', roleLabel:'Geschäftsführer', company:'tiefbau', email:'christian.janning@janning-gruppe.de', phone:'+49 5921 8801-0' };
}

function Sidebar({ nav, setNav, role, activeCompany, setActiveCompany, notifications, mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [hoveredNav, setHoveredNav] = React.useState(null);
  const [collapsedGroups, setCollapsedGroups] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jq_sidebar_collapsed_groups') || '{}');
    } catch (error) {
      return {};
    }
  });
  const isMobile = () => window.innerWidth <= 768;

  React.useEffect(() => {
    localStorage.setItem('jq_sidebar_collapsed_groups', JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  // Close sidebar on nav click (mobile)
  const handleNav = (id) => {
    setNav(id);
    if (isMobile()) setMobileOpen(false);
  };

  // Employee role: show qualification areas
  let sections = [];

  if (role === 'employee') {
    sections = [
      { label: 'Mein Bereich', items: [
        { id: 'portal', label: 'Portal', icon: 'dashboard' },
        { id: 'message_center', label: 'Nachrichtenzentrale', icon: 'mail', badge: 2 },
      ]},
    ];
  } else if (role === 'admin') {
    sections = [
      { label: '\u00dcbersicht', items: [
        { id: 'chatbot', label: 'Chatbot', icon: 'flag' },
      ]},
      { label: 'Organisation', items: [
        { id: 'company_hub', label: 'Firma', icon: 'building' },
        { id: 'employees', label: 'Mitarbeiter', icon: 'users' },
      ]},
      { label: 'Kommunikation', items: [
        { id: 'message_center', label: 'Nachrichtenzentrale', icon: 'mail', badge: 2 },
      ]},
    ];
  } else {
    // Admin and Superadmin: show all sections
    sections = [
      { label: '\u00dcbersicht', items: [
        { id: 'chatbot', label: 'Chatbot', icon: 'flag' },
      ]},
      { label: 'Organisation', items: [
        { id: 'company_hub', label: 'Firma', icon: 'building' },
        { id: 'employees', label: 'Mitarbeiter', icon: 'users' },
      ]},
      { label: 'Kommunikation', items: [
        { id: 'message_center', label: 'Nachrichtenzentrale', icon: 'mail', badge: 2 },
      ]},
    ];
  }

  const allCompanies = { id: 'all', short: 'Alle Firmen', logo: null, name: 'Gesamtgruppe' };
  const active = activeCompany === 'all' ? allCompanies : window.company(activeCompany);
  const sidebarUser = demoIdentityForRole(role);
  const toggleSection = (label) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
    {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    <aside className={'sidebar' + (collapsed ? ' sidebar--collapsed' : '') + (mobileOpen ? ' sidebar--mobile-open' : '')} data-collapsed={collapsed}>
      {/* Header with brand + collapse button */}
      <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'space-between' }}>
        <div className="sidebar__brand" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: collapsed ? 0 : 1 }}>
          <div className="sidebar__brand-mark" style={{ flexShrink: 0, padding: 0, overflow: 'hidden', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="assets/logos/janning-group.png" alt="Janning Group" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar__brand-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Janning Group</div>
              <div className="sidebar__brand-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Schulungs- &amp; Zertifikatsmanagement</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="icon-btn"
          title={collapsed ? 'Sidebar \u00f6ffnen' : 'Sidebar schlie\u00dfen'}
          style={{ flexShrink: 0 }}>
          <Icon name={collapsed ? 'chevR' : 'chevL'} size={16} />
        </button>
      </div>

      {/* Company switch – only in expanded mode */}
      {!collapsed && role === 'employee' && (
        <div className="sidebar__company-switch">
          <div className="sidebar__company-label">Firma</div>
          {(() => {
            const empCompany = window.company(window.employee('e-me').company);
            return (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'var(--color-parchment)', borderRadius:8, marginTop:4 }}>
                {empCompany?.logo
                  ? <img src={empCompany.logo} alt={empCompany.short} style={{ width:20, height:20, objectFit:'contain', flexShrink:0 }} />
                  : <Icon name="building" size={14} />
                }
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:11.5, fontWeight:600, color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {empCompany?.name || '�'}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav" style={{ flex: 1, overflowY: 'auto' }}>
        {sections.map(sec => {
          const sectionOpen = !collapsedGroups[sec.label];
          return (
          <div key={sec.label}>
            {!collapsed && (
              <button
                type="button"
                className="sidebar__section-label"
                onClick={() => toggleSection(sec.label)}
                aria-expanded={sectionOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}>
                <span>{sec.label}</span>
                <span className="sidebar__section-chevron">
                  <Icon name={sectionOpen ? 'chev' : 'chevR'} size={13} stroke={2} />
                </span>
              </button>
            )}
            {sectionOpen && sec.items.map(item => (
              <div key={item.id} style={{ position: 'relative' }}>
                <button
                  className={'nav-item' + (nav === item.id ? ' nav-item--active' : '')}
                  onClick={() => handleNav(item.id)}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{
                    width: '100%',
                    padding: collapsed ? '10px' : '10px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'all 120ms',
                    color: nav === item.id ? 'var(--color-accent)' : 'inherit',
                  }}>
                  <span className="nav-item__icon" style={{ flexShrink: 0, color: nav === item.id ? 'var(--color-accent)' : 'inherit' }}>
                    <Icon name={item.icon} size={16} />
                  </span>
                  {!collapsed && <span style={{ color: nav === item.id ? 'var(--color-accent)' : 'inherit' }}>{item.label}</span>}
                  {!collapsed && item.badge ? <span className="nav-item__badge">{item.badge}</span> : null}
                </button>
                {/* Tooltip on hover in collapsed mode */}
                {collapsed && hoveredNav === item.id && (
                  <div style={{
                    position: 'absolute',
                    left: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginLeft: 8,
                    background: 'var(--fg-1)',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>
          );
        })}
      </nav>

      {/* Footer user section */}
      <div className="sidebar__footer">
        <div className="sidebar__user" style={{
          flexDirection: collapsed ? 'column' : 'row',
          gap: collapsed ? 6 : 10,
          padding: collapsed ? '10px 10px' : '12px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          alignItems: collapsed ? 'center' : 'center',
          textAlign: collapsed ? 'center' : 'left',
          position: 'relative',
        }}
          onMouseEnter={() => setHoveredNav('user')}
          onMouseLeave={() => setHoveredNav(null)}>
          <div className={'avatar ' + (role === 'employee' ? 'avatar--2' : '')} style={{ flexShrink: 0 }}>
            {sidebarUser.initials}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sidebar__user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sidebarUser.name}
                </div>
                <div className="sidebar__user-role" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sidebarUser.roleLabel}
                </div>
              </div>
              <button className="icon-btn" title="Abmelden" onClick={() => window.__logout && window.__logout()} style={{ flexShrink: 0 }}>
                <Icon name="logout" size={16} />
              </button>
            </>
          )}
          {collapsed && hoveredNav === 'user' && (
            <div style={{
              position: 'absolute',
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: 8,
              background: 'var(--fg-1)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: 'nowrap',
              zIndex: 1000,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              {sidebarUser.name}
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}

function CompanySwitcher({ activeCompany, setActiveCompany }) {
  const [open, setOpen] = React.useState(false);
  const all = { id: 'all', short: 'Alle Firmen', logo: null };
  const options = [all, ...window.SEED.companies];
  const cur = options.find(x => x.id === activeCompany) || all;
  return (
    <div style={{position:'relative'}}>
      <button className="company-switch" onClick={() => setOpen(o => !o)}>
        <div className="company-switch__logo">
          {cur.logo ? <img src={cur.logo} alt={cur.short} /> : <Icon name="building" size={16} />}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div className="company-switch__name">{cur.short}</div>
          <div className="company-switch__all">
            {cur.id === 'all' ? '5 Firmen' : 'Einzelansicht'}
          </div>
        </div>
        <span className="company-switch__chev"><Icon name="chev" size={16} /></span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--color-white)', border: '1px solid var(--border-1)',
          borderRadius: 10, padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          {options.map(o => (
            <button key={o.id} className="company-switch"
              style={{border:0, marginBottom:2, background: o.id === cur.id ? 'var(--color-warm-sand)' : 'transparent'}}
              onClick={() => { setActiveCompany(o.id); setOpen(false); }}>
              <div className="company-switch__logo">
                {o.logo ? <img src={o.logo} alt={o.short} /> : <Icon name="building" size={16} />}
              </div>
              <div className="company-switch__name">{o.short}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsPanel({ onClose }) {
  const me = window.employee('e-me');

  // Mock notifications
  const [notifications, setNotifications] = React.useState([
    { id: 'n1', type: 'training',  unread: true,  time: 'Heute, 08:30',      title: 'Neue Schulung zugewiesen', body: 'Dir wurde „PSA gegen Absturz" als Pflichtschulung zugewiesen. Bitte buche einen Termin.' },
    { id: 'n2', type: 'cert',      unread: true,  time: 'Gestern, 14:12',    title: 'Zertifikat genehmigt', body: 'Dein hochgeladenes Zertifikat „SCC Dok. 016" wurde von Sabine Janning genehmigt.' },
    { id: 'n3', type: 'warning',   unread: true,  time: 'Gestern, 09:00',    title: 'Erinnerung: Zertifikat läuft ab', body: '„Bagger & Radlader" ist am 21.10.2025 abgelaufen. Bitte eine Auffrischung planen.' },
    { id: 'n4', type: 'admin',     unread: false, time: 'Mo., 11:45',        title: 'Mitteilung vom Admin', body: 'Alle Mitarbeiter der Tiefbau GmbH werden gebeten, bis Ende Mai die Jahresunterweisung zu absolvieren.' },
    { id: 'n5', type: 'calendar',  unread: false, time: 'Fr., 10:00',        title: 'Mein Termin: Erste Hilfe', body: 'Auffrischungskurs Erste Hilfe – 12.05.2026 – 08:00 Uhr BiW Bildungszentrum, Lingen.' },
    { id: 'n6', type: 'cert',      unread: false, time: '22. Apr., 16:30',   title: 'Zertifikat abgelehnt', body: '„Gabelstaplerschein"-Upload wurde abgelehnt. Bitte ein lesbares Dokument hochladen.' },
    { id: 'n7', type: 'calendar',  unread: false, time: '20. Apr., 08:00',   title: 'Mein Termin: SCC 017', body: 'SCC Dok. 017 Auffrischung – 28.05.2026 – 09:00 Uhr – DEKRA Akademie, Osnabrück.' },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, unread: false })));
  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, unread: false } : n));

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const typeIcon = (type) => {
    if (type === 'training')  return { icon: 'cap',      bg: '#e8f0fd', color: '#1f5fa8' };
    if (type === 'cert')      return { icon: 'doc',      bg: '#e8f5eb', color: '#3f7a4a' };
    if (type === 'warning')   return { icon: 'shield',   bg: '#fbeaea', color: '#a13232' };
    if (type === 'admin')     return { icon: 'flag',     bg: '#fdf3e0', color: '#8a6a1f' };
    if (type === 'calendar')  return { icon: 'cal',      bg: '#f3eef8', color: '#6b4fa8' };
    return { icon: 'bell', bg: '#f0f0f0', color: '#666' };
  };

  const [activeTab, setActiveTab] = React.useState('all');
  const filtered = activeTab === 'all' ? notifications : activeTab === 'unread' ? notifications.filter(n => n.unread) : notifications.filter(n => n.type === activeTab);

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.25)', backdropFilter:'blur(1px)', display:'flex', alignItems:'flex-start', justifyContent:'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 400, height: '100vh', background: 'var(--color-ivory)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 200ms var(--ease-standard)',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 20px 14px', borderBottom:'1px solid var(--border-1)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500 }}>Benachrichtigungen</div>
              {unreadCount > 0 && (
                <span style={{ background:'var(--color-accent)', color:'#fff', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{unreadCount}</span>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {unreadCount > 0 && (
                <button className="btn btn--ghost" style={{ fontSize:12, padding:'4px 10px' }} onClick={markAllRead}>Alle gelesen</button>
              )}
              <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
            </div>
          </div>
          {/* Filter tabs */}
          <div style={{ display:'flex', gap:4 }}>
            {[['all','Alle'], ['unread','Ungelesen'], ['warning','Ablauf'], ['calendar','Termine'], ['admin','Admin']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                padding:'4px 10px', fontSize:12, borderRadius:20, border:'1px solid',
                borderColor: activeTab === id ? 'var(--color-accent)' : 'var(--border-1)',
                background: activeTab === id ? 'var(--color-accent)' : 'transparent',
                color: activeTab === id ? '#fff' : 'var(--fg-2)',
                cursor:'pointer', fontWeight: activeTab === id ? 600 : 400,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--fg-3)' }}>
              <Icon name="bell" size={28} />
              <div className="small muted" style={{ marginTop:8 }}>Keine Benachrichtigungen</div>
            </div>
          ) : filtered.map(n => {
            const { bg, color, icon } = typeIcon(n.type);
            return (
              <div key={n.id} onClick={() => markRead(n.id)} style={{
                padding:'14px 20px', borderBottom:'1px solid var(--border-1)',
                display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer',
                background: n.unread ? 'var(--color-warm-sand)' : 'transparent',
                transition:'background 150ms',
              }}>
                {/* Icon */}
                <div style={{ width:36, height:36, borderRadius:10, background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                  <Icon name={icon} size={16} />
                </div>
                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <div style={{ fontWeight: n.unread ? 600 : 500, fontSize:13.5, lineHeight:1.3 }}>{n.title}</div>
                    {n.unread && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--color-accent)', flexShrink:0, marginTop:4 }}></div>}
                  </div>
                  <div className="small muted" style={{ marginTop:3, lineHeight:1.5, fontSize:12.5 }}>{n.body}</div>
                  <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:5 }}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ onClose, role }) {
  const demoMe = demoIdentityForRole(role);
  const storedMe = role === 'employee' ? window.employee('e-me') : null;
  const me = storedMe ? { ...storedMe, ...demoMe } : demoMe;
  const company = me.company === 'all' ? { name:'Janning Gruppe', short:'Alle Firmen' } : window.company(me.company);

  const [adresse, setAdresse] = React.useState('Mühlenstraße 12, 48531 Nordhorn');
  const [telefon, setTelefon] = React.useState(me.phone || '+49 5921 1004');
  const [saved, setSaved] = React.useState(false);
  const [photoHover, setPhotoHover] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, value, editable, inputValue, onChange }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 5 }}>{label}</div>
      {editable ? (
        <input
          value={inputValue}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px', fontSize: 14,
            border: '1px solid var(--border-1)', borderRadius: 8,
            background: 'var(--color-white)', color: 'var(--fg-1)',
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 150ms',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-1)'}
        />
      ) : (
        <div style={{
          padding: '9px 12px', fontSize: 14, borderRadius: 8,
          background: 'var(--color-parchment)', color: 'var(--fg-2)',
          border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{value}</span>
          <span style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: 0.3 }}>nur lesbar</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 420, height: '100vh', background: 'var(--color-ivory)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
          animation: 'slideInRight 200ms var(--ease-standard)',
        }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500 }}>Mein Profil</div>
            <div className="small muted" style={{ marginTop: 2 }}>Persönliche Einstellungen</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        {/* Avatar */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            onMouseEnter={() => setPhotoHover(true)}
            onMouseLeave={() => setPhotoHover(false)}
            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#2a2a28', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500,
              transition: 'opacity 150ms',
              opacity: photoHover ? 0.7 : 1,
            }}>{me.initials}</div>
            {photoHover && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
              }}>
                <Icon name="upload" size={18} />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{me.name}</div>
            <div className="small muted" style={{ marginTop: 2 }}>{me.position} – {company?.short}</div>
            <div className="small muted" style={{ marginTop: 2 }}>{me.email}</div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: '24px 24px 8px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>
            Persönliche Daten
          </div>
          <Field label="Vorname"    value={me.firstName} />
          <Field label="Nachname"   value={me.lastName} />
          <Field label="Position"   value={me.position} />
          <Field label="Firma"      value={company?.name} />

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--color-accent)', margin: '20px 0 16px' }}>
            Kontakt &amp; Adresse
            <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 10, color: 'var(--fg-3)', letterSpacing: 0.3, textTransform: 'none' }}>⚡ bearbeitbar</span>
          </div>
          <Field label="Adresse"      editable inputValue={adresse}  onChange={setAdresse} />
          <Field label="Telefonnummer" editable inputValue={telefon}  onChange={setTelefon} />
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 28px', borderTop: '1px solid var(--border-1)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn--primary"
            onClick={save}
            style={{ flex: 1 }}>
            {saved ? <><Icon name="check" size={14} /> Gespeichert</> : 'Änderungen speichern'}
          </button>
          <button className="btn btn--ghost" onClick={onClose} style={{ flex: 1 }}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

function Topbar({ title, breadcrumbs, actions, searchState, setSearchState, onMobileMenuOpen, role }) {
  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showFilter, setShowFilter] = React.useState(false);
  const filterRef = React.useRef(null);

  const ss = searchState || { query: '', areas: [], status: [], dateFrom: '', dateTo: '', datePreset: 'all' };
  const set = setSearchState || (() => {});

  // Close on outside click
  React.useEffect(() => {
    if (!showFilter) return;
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilter]);

  const AREAS = [
    { id: 'certificates', label: 'Zertifikate',           icon: 'doc' },
    { id: 'instructions', label: 'Unterweisungen',        icon: 'flag' },
    { id: 'health',       label: 'Untersuchungsvorsorge', icon: 'shield' },
    { id: 'jobdesc',      label: 'Stellenbeschreibung',   icon: 'doc' },
    { id: 'license',      label: 'F\u00fchrerschein',          icon: 'cap' },
  ];
  const STATUSES = [
    { id: 'valid',   label: 'G\u00fcltig',         color: '#3f7a4a', bg: '#eff5ed' },
    { id: 'warn',    label: 'L\u00e4uft bald ab',  color: '#8a6a1f', bg: '#faf3de' },
    { id: 'expired', label: 'Abgelaufen',     color: '#a13232', bg: '#fbecea' },
  ];

  const toggleArea   = (id) => set(s => ({ ...s, areas:  s.areas.includes(id)  ? s.areas.filter(x=>x!==id)  : [...s.areas, id] }));
  const toggleStatus = (id) => set(s => ({ ...s, status: s.status.includes(id) ? s.status.filter(x=>x!==id) : [...s.status, id] }));
  const reset = () => set({ query: '', areas: [], status: [], dateFrom: '', dateTo: '', datePreset: 'all' });

  const setDatePreset = (preset) => {
    if (preset === 'custom') {
      set(s => ({ ...s, datePreset: 'custom' }));
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const presets = {
        'all': { from: null, to: null },
        '1d': { days: 1 }, '3d': { days: 3 }, '1w': { days: 7 }, '2w': { days: 14 },
        '1m': { days: 30 }, '2m': { days: 60 }, '6m': { days: 180 }, '1y': { days: 365 },
      };
      const p = presets[preset];
      if (p.from === null) {
        set(s => ({ ...s, datePreset: preset, dateFrom: '', dateTo: '' }));
      } else {
        const to = new Date(today);
        to.setDate(to.getDate() + p.days);
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        set(s => ({ ...s, datePreset: preset, dateFrom: fmt(today), dateTo: fmt(to) }));
      }
    }
  };

  const activeFilterCount = ss.areas.length + ss.status.length + (ss.dateFrom ? 1 : 0) + (ss.dateTo ? 1 : 0);



  return (
    <>
      <div className="topbar">
        <button className="hamburger-btn" onClick={onMobileMenuOpen} title={'Men\u00fc \u00f6ffnen'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="breadcrumbs">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'breadcrumbs__current' : ''}>{b}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Enhanced search field */}
        <div ref={filterRef} style={{ position: 'relative', flex: 1, maxWidth: 480, zIndex: 2500 }}>
          <div className="topbar__search" style={{ gap: 6 }}>
            <Icon name="search" size={14} />
            <input
              placeholder="Schulung, Zertifikat, Dokument suchen..."
              value={ss.query}
              onChange={e => set(s => ({ ...s, query: e.target.value }))}
              onFocus={() => setShowFilter(true)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', color: 'var(--fg-1)' }}
            />
            {/* Active filter count badge */}
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {activeFilterCount}
              </span>
            )}
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilter(f => !f)}
              title="Erweiterte Filter"
              style={{
                background: showFilter || activeFilterCount > 0 ? 'var(--color-parchment)' : 'none',
                border: '1px solid ' + (showFilter || activeFilterCount > 0 ? 'var(--color-accent)' : 'var(--border-1)'),
                borderRadius: 6, padding: '3px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                color: showFilter || activeFilterCount > 0 ? 'var(--color-accent)' : 'var(--fg-3)',
                fontSize: 11, fontWeight: 600, flexShrink: 0, transition: 'all 120ms',
              }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filter
            </button>
            {!showFilter && !activeFilterCount && <span className="muted small" style={{fontSize:11, flexShrink:0}}>?K</span>}
          </div>

          {/* Filter dropdown panel */}
          {showFilter && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'var(--color-white)', border: '1px solid var(--border-1)',
              borderRadius: 12, boxShadow: '0 18px 46px rgba(0,0,0,0.18)',
              zIndex: 2600, padding: '16px 18px', minWidth: 500,
              maxHeight: 'calc(100vh - 92px)', overflowY: 'auto',
            }}>
              {/* Zeitraum */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border-1)' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', minWidth: 80 }}>Zeitraum</span>
                <select value={ss.datePreset || 'all'} onChange={e => setDatePreset(e.target.value)} style={{
                  flex: 1, padding: '8px 12px', fontSize: 12, border: '1px solid var(--border-1)', borderRadius: 6,
                  background: 'var(--color-parchment)', fontFamily: 'inherit', cursor: 'pointer',
                }}>
                  <option value="all">Alle Zeiten</option>
                  <option value="1d">1 Tag</option>
                  <option value="3d">3 Tage</option>
                  <option value="1w">1 Woche</option>
                  <option value="2w">2 Wochen</option>
                  <option value="1m">1 Monat</option>
                  <option value="2m">2 Monate</option>
                  <option value="6m">6 Monate</option>
                  <option value="1y">1 Jahr</option>
                  <option value="custom">Benutzerdefiniert</option>
                </select>
              </div>

              {ss.datePreset === 'custom' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border-1)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', minWidth: 80 }}>Von</span>
                    <input type="date" value={ss.dateFrom} onChange={e => set(s => ({ ...s, dateFrom: e.target.value }))}
                      style={{ flex: 1, padding: '8px 12px', fontSize: 12, border: '1px solid var(--border-1)', borderRadius: 6, background: 'var(--color-parchment)', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border-1)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', minWidth: 80 }}>Bis</span>
                    <input type="date" value={ss.dateTo} onChange={e => set(s => ({ ...s, dateTo: e.target.value }))}
                      style={{ flex: 1, padding: '8px 12px', fontSize: 12, border: '1px solid var(--border-1)', borderRadius: 6, background: 'var(--color-parchment)', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                </>
              )}

              {/* Bereich */}
              <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border-1)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 10 }}>Bereich (Seite/Kategorie)</div>
                <div style={{ border: '1px solid var(--border-1)', borderRadius: 8, background: 'var(--color-parchment)', maxHeight: 200, overflowY: 'auto', padding: '8px 0', marginLeft: 96 }}>
                  {[
                    { id: 'all', label: 'Alle (Default)' },
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'matrix', label: 'Qualifikationsmatrix' },
                    { id: 'companies', label: 'Firmen-Auswertung' },
                    { id: 'sites', label: 'Baustellen' },
                    { id: 'meetings', label: 'Bauleiterbesprechung' },
                    { id: 'bgbau', label: 'Baustellenaushang BGBAU' },
                    { id: 'norms', label: 'Normenmatrix' },
                    { id: 'forms', label: 'Formulare' },
                    { id: 'calendar', label: 'Schulungskalender' },
                    { id: 'trainings', label: 'Schulungen' },
                    { id: 'qualified', label: 'Befähigte Personen' },
                    { id: 'org', label: 'Organigramm' },
                    { id: 'certs', label: 'Zertifizierungsübersicht' },
                    { id: 'docs', label: 'Dokumente' },
                  ].map(area => (
                    <div key={area.id} onClick={() => toggleArea(area.id)} style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--fg-1)',
                      background: ss.areas.includes(area.id) ? 'var(--color-white)' : 'transparent',
                      borderLeft: ss.areas.includes(area.id) ? '3px solid var(--color-accent)' : '3px solid transparent',
                      transition: 'all 80ms',
                    }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,100,66,0.05)'} onMouseLeave={e => e.currentTarget.style.background = ss.areas.includes(area.id) ? 'var(--color-white)' : 'transparent'}>
                      {ss.areas.includes(area.id) ? '✓ ' : '  '}{area.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-1)' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', minWidth: 80 }}>Status</span>
                <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                  {STATUSES.map(s => {
                    const active = ss.status.includes(s.id);
                    return (
                      <button key={s.id} onClick={() => toggleStatus(s.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                        border: '1px solid ' + (active ? s.color : 'var(--border-1)'),
                        background: active ? s.bg : 'transparent',
                        color: active ? s.color : 'var(--fg-2)', cursor: 'pointer', transition: 'all 120ms',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? s.color : 'var(--border-1)', flexShrink: 0 }}></span>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, borderTop: '1px solid var(--border-1)', paddingTop: 14 }}>
                <button onClick={reset} style={{ background: 'none', border: '1px solid var(--border-1)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)', padding: '6px 18px', borderRadius: 6, fontFamily: 'inherit' }}>
                  Zur\u00fccksetzen
                </button>
                <button onClick={() => setShowFilter(false)} className="btn btn--primary" style={{ fontSize: 12, padding: '6px 24px' }}>
                  Anwenden
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="topbar__actions">
          {actions}
          <button
            className="icon-btn"
            title="Benachrichtigungen"
            onClick={() => { setShowNotifications(true); setShowProfile(false); }}
            style={{ color: showNotifications ? 'var(--color-accent)' : undefined }}>
            <Icon name="bell" size={18} />
            <span className="icon-btn__dot" />
          </button>
          <button
            className="icon-btn"
            title="Einstellungen / Profil"
            onClick={() => { setShowProfile(true); setShowNotifications(false); }}
            style={{ color: showProfile ? 'var(--color-accent)' : undefined }}>
            <Icon name="settings" size={18} />
          </button>
        </div>
      </div>
      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showProfile && <ProfileModal role={role} onClose={() => setShowProfile(false)} />}
    </>
  );
}

Object.assign(window, { Sidebar, Topbar, demoIdentityForRole });
