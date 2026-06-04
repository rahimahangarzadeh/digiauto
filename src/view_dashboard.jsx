/* Dashboard view — 3-column redesign */

function KpiCard({ kpi, onNavigate }) {
  return (
    <div
      onClick={() => onNavigate?.(kpi.nav, kpi.filter)}
      style={{
        background: 'var(--color-ivory)',
        border: '1px solid var(--border-1)',
        borderRadius: 10,
        padding: '10px 14px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 16,
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.048)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-white)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--color-ivory)';
        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.048)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}>
      {/* Left: Label */}
      <div style={{ display:'flex', flexDirection:'column', gap:2, minWidth:0 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'var(--fg-3)' }}>{kpi.label}</div>
      </div>

      {/* Middle: Value + Delta */}
      <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'center', textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:500, lineHeight:1, color: kpi.accent || 'var(--fg-1)' }}>{kpi.value}</div>
        <div style={{ fontSize:11, color:'var(--fg-3)' }}>{kpi.delta}</div>
      </div>

      {/* Right: Trend */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, minWidth:'max-content' }}>
        <div style={{ fontSize:11, fontWeight:600, color: kpi.trendUp ? '#3f7a4a' : '#a13232', display:'flex', alignItems:'center', gap:2 }}>
          <span>{kpi.trendUp ? '↑' : '↓'}</span><span>{kpi.trend}</span>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ activeCompany, setNav: setCurrentNav, hideSummary = false }) {
  const allEmps = window.SEED.employees.filter(e =>
    activeCompany === 'all' ? true : e.company === activeCompany
  );
  const activeEmps = allEmps.filter(e => e.status === 'aktiv');

  let valid=0, warn=0, expired=0, missing=0, planned=0, mandatoryOpen=0;
  activeEmps.forEach(e => {
    window.SEED.trainings.forEach(t => {
      const c = window.SEED.certs[e.id]?.[t.id];
      const s = c?.status || 'missing';
      if (s==='valid') valid++;
      else if (s==='warn') warn++;
      else if (s==='expired') expired++;
      else if (s==='planned') planned++;
      else { missing++; if (t.mandatory) mandatoryOpen++; }
    });
  });

  // Upcoming events — all sorted
  const today = '2026-04-30';
  const events = [...window.SEED.events]
    .sort((a,b) => a.date.localeCompare(b.date));
  const currentWeekBounds = () => {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };
  const { start: weekStart, end: weekEnd } = currentWeekBounds();
  const weekEvents = events.filter(ev => {
    const date = new Date(ev.date + 'T00:00:00');
    return date >= weekStart && date <= weekEnd;
  });
  const nextWeekEvent = weekEvents[0];

  // Training compliance per training
  const trainStats = window.SEED.trainings.map(t => {
    let good=0, total=0;
    activeEmps.forEach(e => {
      const c = window.SEED.certs[e.id]?.[t.id];
      if (!c || c.status==='missing') { total++; return; }
      total++;
      if (c.status==='valid' || c.status==='warn') good++;
    });
    return { ...t, pct: total ? Math.round(good*100/total) : 0, good, total };
  }).sort((a,b) => b.pct - a.pct);

  // Expiring soon (next 60d) + recently expired (last 30d)
  const expiring = [];
  activeEmps.forEach(e => window.SEED.trainings.forEach(t => {
    const c = window.SEED.certs[e.id]?.[t.id];
    if (!c?.expiresAt) return;
    const d = window.daysFromToday(c.expiresAt);
    if (d !== null && d <= 60 && d >= -30) expiring.push({ emp: e, training: t, cert: c, days: d });
  }));
  expiring.sort((a,b) => a.days - b.days);

  // ── local state ──────────────────────────────────────────
  const [showAllBars, setShowAllBars] = React.useState(false);
  const [hoveredBar, setHoveredBar] = React.useState(null);
  const [expiryFilter, setExpiryFilter] = React.useState('all'); // all | warn | expired

  const visibleStats = showAllBars ? trainStats : trainStats.slice(0, 5);
  const filteredExpiring = expiring.filter(r => {
    if (expiryFilter === 'warn')    return r.cert.status === 'warn';
    if (expiryFilter === 'expired') return r.cert.status === 'expired';
    return true;
  });

  // ── helpers ───────────────────────────────────────────────
  const barColor = (pct) => pct >= 80 ? '#4a8c5c' : pct >= 60 ? '#c89b3f' : '#b84040';
  const barBg    = (pct) => pct >= 80 ? '#e8f5eb' : pct >= 60 ? '#fdf3e0' : '#fbeaea';
  const openTraining = (trainingId) => {
    window.dispatchEvent(new CustomEvent('navigate-to-training', { detail: { trainingId } }));
  };
  const openMatrixEmployee = (emp) => {
    window.dispatchEvent(new CustomEvent('navigate-to-matrix-employee', {
      detail: { empId: emp.id, companyId: emp.company },
    }));
  };

  const daysLabel = (days) => {
    if (days === 0) return 'Heute';
    if (days === 1) return 'Morgen';
    if (days < 0)  return `${Math.abs(days)} T überfällig`;
    return `in ${days} T`;
  };

  const urgencyStyle = (ev) => {
    const d = Math.round((new Date(ev.date) - new Date(today)) / 86400000);
    if (d <= 0)  return { dot: '#a13232', bg: '#fbecea', label: 'Heute' };
    if (d <= 1)  return { dot: '#a13232', bg: '#fbecea', label: 'Morgen' };
    if (d <= 7)  return { dot: '#8a6a1f', bg: '#fdf3e0', label: `in ${d} T` };
    return { dot: 'var(--fg-3)', bg: 'transparent', label: null };
  };

  const monthShort = (dateStr) =>
    new Date(dateStr).toLocaleString('de-DE', { month: 'short' }).toUpperCase().replace('.','');

  const dashboardAudits = [
    { id: 'audit-1', date: '2026-05-21', time: '08:00', title: 'GW 301', companyName: 'Janning Tiefbau GmbH' },
    { id: 'audit-2', date: '2026-05-25', time: '08:00', title: 'ADR Schulung', companyName: 'Janning Transporte GmbH' },
    { id: 'audit-3', date: '2026-05-31', time: '08:00', title: 'm62 AwsV', companyName: 'Janning Tiefbau GmbH' },
    { id: 'audit-4', date: '2026-06-10', time: '11:00', title: 'RAL Überprüfung', companyName: 'Janning Galabau GmbH' },
    { id: 'audit-5', date: '2026-06-15', time: '09:00', title: 'ISO 45001', companyName: 'Janning Bohrtechnik GmbH' },
    { id: 'audit-6', date: '2026-07-01', time: '08:00', title: 'EN ISO 3834', companyName: 'Janning Rohrbau GmbH' },
    { id: 'audit-7', date: '2026-07-20', time: '10:00', title: 'SCC Audit', companyName: 'Janning Bohrtechnik GmbH' },
    { id: 'audit-8', date: '2026-08-15', time: '14:00', title: 'DVGW Inspektion', companyName: 'Janning Rohrbau GmbH' },
    { id: 'audit-9', date: '2026-09-30', time: '08:00', title: 'RAL', companyName: 'Janning Tiefbau GmbH' },
    { id: 'audit-10', date: '2026-10-12', time: '13:00', title: 'ISO 39001 Review', companyName: 'Janning Transporte GmbH' },
    { id: 'audit-11', date: '2026-11-02', time: '08:00', title: 'ISO 14001', companyName: 'Janning Tiefbau GmbH' },
    { id: 'audit-12', date: '2026-11-02', time: '08:00', title: 'SCL', companyName: 'Janning Tiefbau GmbH' },
    { id: 'audit-13', date: '2027-02-28', time: '08:00', title: 'ISO 3834', companyName: 'Janning Tiefbau GmbH' },
    { id: 'audit-14', date: '2027-02-28', time: '08:00', title: 'AD2000-HPO', companyName: 'Janning Tiefbau GmbH' },
    { id: 'audit-15', date: '2027-02-28', time: '08:00', title: 'PED-3-1', companyName: 'Janning Tiefbau GmbH' },
  ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const auditCountdown = (dateStr, timeStr) => {
    const now = new Date(window.SEED.today || '2026-04-21');
    const auditDate = new Date(dateStr + 'T' + timeStr + ':00');
    let diff = Math.floor((auditDate - now) / 1000);
    if (diff < 0) diff = 0;
    return {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  };

  return (
    <div>
      {!hideSummary && <div className="view__header">
        <div>
          <h1 className="view__title">Dashboard</h1>
          <div className="view__subtitle">
            {activeCompany === 'all'
              ? 'Gesamtgruppe — ein ruhiger Blick auf Qualifikationen, Fristen und offene Pflichten.'
              : window.company(activeCompany).name + ' — Kennzahlen und laufende Fristen.'}
          </div>
        </div>
        <div className="view__actions">
        </div>
      </div>}

      {!hideSummary && (() => {
        const kpis = [
          {
            label: 'Mitarbeiter aktiv',
            value: activeEmps.length,
            delta: `von ${allEmps.length} insgesamt`,
            trend: '+2 diese Woche',
            trendUp: true,
            nav: 'matrix',
            accent: null,
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ),
          },
          {
            label: 'Gültige Nachweise',
            value: valid,
            delta: `${warn} laufen bald ab`,
            trend: `${Math.round(valid*100/(valid+warn+expired+missing))}% Abdeckung`,
            trendUp: true,
            nav: 'matrix',
            filter: 'valid',
            accent: '#3f7a4a',
            accentBg: '#eff5ed',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ),
          },
          {
            label: 'Abgelaufen',
            value: expired,
            delta: 'Handlungsbedarf',
            trend: '−5 seit letztem Monat',
            trendUp: false,
            nav: 'matrix',
            filter: 'expired',
            accent: '#a13232',
            accentBg: '#fbecea',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ),
          },
          {
            label: 'Aktuelle Termine',
            value: weekEvents.length,
            delta: 'diese Woche',
            trend: nextWeekEvent ? `${window.fmtDE(nextWeekEvent.date)} - ${nextWeekEvent.title}` : 'Keine Termine diese Woche',
            trendUp: weekEvents.length > 0,
            nav: 'calendar',
            accent: weekEvents.length > 0 ? '#3f7a4a' : '#8a6a1f',
            accentBg: weekEvents.length > 0 ? '#eff5ed' : '#fdf3e0',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            ),
          },
        ];

        const handleKpiNavigate = (nav, filter) => {
          if (filter === 'valid') {
            window.dispatchEvent(new CustomEvent('navigate-to-matrix-kpi-filter', { detail: { filter: 'valid' } }));
          } else if (filter === 'expired') {
            window.dispatchEvent(new CustomEvent('navigate-to-matrix-kpi-filter', { detail: { filter: 'expired' } }));
          }
          setCurrentNav(nav);
        };

        return (
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            {kpis.map((k, i) => (
              <KpiCard key={i} kpi={k} onNavigate={handleKpiNavigate} />
            ))}
          </div>
        );
      })()}

      {/* ── Dashboard panels ── */}
      <div className="dashboard-panel-grid">

        {/* ── COL 1: Abdeckung nach Schulung ── */}
        <div className="card card--pad" style={{ display:'flex', flexDirection:'column', gap:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div className="card__title">Abdeckung nach Schulung</div>
              <div className="card__sub" style={{ marginTop:3 }}>Gültige Nachweise · aktive Mitarbeiter</div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {visibleStats.map(t => {
              const color = barColor(t.pct);
              const bg    = barBg(t.pct);
              const isHov = hoveredBar === t.id;
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openTraining(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openTraining(t.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredBar(t.id)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: isHov ? bg : 'transparent',
                    transition: 'background 150ms',
                    cursor: 'pointer',
                  }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                    <div>
                      <span style={{ fontSize:13.5, fontWeight:500, color:'var(--fg-1)' }}>{t.short}</span>
                      <span style={{ fontSize:11, color:'var(--fg-3)', marginLeft:6 }}>{t.cat}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {isHov && (
                        <span style={{ fontSize:11, color:'var(--fg-3)' }}>{t.good}/{t.total}</span>
                      )}
                      <span style={{
                        fontSize: 13, fontWeight: 700, color,
                        minWidth: 38, textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}>{t.pct}%</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    height: 7, borderRadius: 999,
                    background: 'var(--color-warm-sand)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: t.pct + '%',
                      borderRadius: 999,
                      background: color,
                      transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more */}
          <button
            onClick={() => setShowAllBars(s => !s)}
            style={{
              marginTop: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12.5, color: 'var(--color-accent)',
              fontFamily: 'inherit', fontWeight: 500,
              padding: '6px 4px', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
            {showAllBars
              ? <><span>▲</span> Weniger anzeigen</>
              : <><span>▼</span> Alle {trainStats.length} Schulungen anzeigen</>
            }
          </button>
        </div>

        {/* ── COL 2: Nächste Termine ── */}
        <div className="card card--pad" style={{ display:'flex', flexDirection:'column', gap:0 }}>
          <div style={{ marginBottom:16 }}>
            <div className="card__title">Nächste Termine</div>
            <div className="card__sub" style={{ marginTop:3 }}>Aus dem Schulungskalender</div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {events.map(ev => {
              const urg = urgencyStyle(ev);
              const dayNum = ev.date.slice(-2).replace(/^0/, '');
              const handleTerminClick = () => {
                window.dispatchEvent(new CustomEvent('navigate-to-calendar-event', { detail: { eventId: ev.id } }));
                setCurrentNav('calendar');
              };
              return (
                <div
                  key={ev.id}
                  onClick={handleTerminClick}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: urg.bg || 'var(--color-parchment)',
                    border: '1px solid var(--border-1)',
                    transition: 'box-shadow 150ms, background 150ms',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                >
                  {/* Date badge */}
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-ivory)',
                    border: '1px solid var(--border-1)',
                    borderRadius: 8,
                    padding: '4px 6px',
                  }}>
                    <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:0.6, color:'var(--fg-3)', textTransform:'uppercase' }}>
                      {monthShort(ev.date)}
                    </span>
                    <span style={{ fontFamily:'var(--font-serif)', fontSize:20, lineHeight:1.1, fontWeight:500, color: urg.dot !== 'var(--fg-3)' ? urg.dot : 'var(--fg-1)' }}>
                      {dayNum}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                      <span style={{ fontSize:13.5, fontWeight:500, color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {ev.title}
                      </span>
                      {urg.label && (
                        <span style={{
                          fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:99,
                          background: urg.dot === '#a13232' ? '#fbecea' : '#fdf3e0',
                          color: urg.dot,
                          flexShrink:0,
                        }}>{urg.label}</span>
                      )}
                    </div>
                    <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5, display:'flex', alignItems:'center', gap:4 }}>
                      <Icon name="cal" size={10} />
                      {ev.time} · {ev.location}
                    </div>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:4,
                        fontSize:11, fontWeight:600, padding:'2px 8px',
                        borderRadius:99, background:'rgba(201,100,66,0.1)',
                        color:'var(--color-terracotta)',
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        {ev.participants} TN
                      </span>
                      <span style={{
                        fontSize:11, padding:'2px 8px', borderRadius:99,
                        background:'var(--color-ivory)', border:'1px solid var(--border-1)',
                        color:'var(--fg-2)',
                      }}>
                        {window.provider(ev.provider)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── COL 3: Ablaufende & abgelaufene Nachweise ── */}
        <div className="card card--pad" style={{ display:'flex', flexDirection:'column', gap:0 }}>
          <div style={{ marginBottom:12 }}>
            <div className="card__title">Ablaufende Nachweise</div>
            <div className="card__sub" style={{ marginTop:3 }}>Nächste 60 Tage + letzte 30 Tage</div>
          </div>

          {/* Filter tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:14, borderBottom:'1px solid var(--border-1)', paddingBottom:10 }}>
            {[
              { id:'all',     label:'Alle',          count: expiring.length },
              { id:'warn',    label:'Läuft bald ab', count: expiring.filter(r=>r.cert.status==='warn').length },
              { id:'expired', label:'Abgelaufen',    count: expiring.filter(r=>r.cert.status==='expired').length },
            ].map(f => (
              <button key={f.id} onClick={() => setExpiryFilter(f.id)} style={{
                display:'inline-flex', alignItems:'center', gap:5,
                padding:'4px 10px', fontSize:12, fontWeight:500,
                borderRadius:20,
                border:'1px solid ' + (expiryFilter===f.id ? (f.id==='expired' ? '#eac8c2' : f.id==='warn' ? '#ece0bc' : 'var(--color-near-black)') : 'var(--border-1)'),
                background: expiryFilter===f.id ? (f.id==='expired' ? '#fbecea' : f.id==='warn' ? '#fdf3e0' : 'var(--color-near-black)') : 'transparent',
                color: expiryFilter===f.id ? (f.id==='expired' ? '#a13232' : f.id==='warn' ? '#8a6a1f' : 'var(--color-ivory)') : 'var(--fg-2)',
                cursor:'pointer', transition:'all 120ms',
              }}>
                {f.label}
                <span style={{
                  fontSize:10, fontWeight:700,
                  padding:'0px 5px', borderRadius:99,
                  background: expiryFilter===f.id ? 'rgba(255,255,255,0.25)' : 'var(--color-warm-sand)',
                  color:'inherit',
                }}>{f.count}</span>
              </button>
            ))}
          </div>

          {/* Cards list */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filteredExpiring.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--fg-3)' }}>
                <Icon name="check" size={22} />
                <div className="small muted" style={{ marginTop:8 }}>Keine Einträge in dieser Kategorie.</div>
              </div>
            ) : filteredExpiring.slice(0, 8).map((r, i) => {
              const isExp = r.cert.status === 'expired';
              const isWarn = r.cert.status === 'warn';
              return (
                <div key={i} onClick={() => openMatrixEmployee(r.emp)} style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: isExp ? 'rgba(161,50,50,0.04)' : isWarn ? 'rgba(138,106,31,0.04)' : 'var(--color-parchment)',
                  border: '1px solid ' + (isExp ? '#eac8c2' : isWarn ? '#ece0bc' : 'var(--border-1)'),
                  cursor: 'pointer',
                }}>
                  {/* Avatar */}
                  <div className={'avatar avatar--' + r.emp.color} style={{ width:32, height:32, fontSize:11, flexShrink:0 }}>
                    {r.emp.initials}
                  </div>
                  {/* Info */}
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {r.emp.name}
                    </div>
                    <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {r.training.short} · {window.fmtDE(r.cert.expiresAt)}
                    </div>
                  </div>
                  {/* Badge */}
                  <div style={{
                    fontSize:11, fontWeight:700, padding:'3px 8px',
                    borderRadius:99, flexShrink:0, whiteSpace:'nowrap',
                    background: isExp ? '#fbecea' : '#fdf3e0',
                    color: isExp ? '#a13232' : '#8a6a1f',
                    border: '1px solid ' + (isExp ? '#eac8c2' : '#ece0bc'),
                  }}>
                    {daysLabel(r.days)}
                  </div>
                </div>
              );
            })}
            {filteredExpiring.length > 8 && (
              <div style={{ textAlign:'center', fontSize:12, color:'var(--fg-3)', paddingTop:4 }}>
                + {filteredExpiring.length - 8} weitere Einträge
              </div>
            )}
          </div>
        </div>

        {/* ── COL 4: Auditsliste ── */}
        <div className="card card--pad" style={{ display:'flex', flexDirection:'column', gap:0 }}>
          <div className="dashboard-card-head">
            <div>
              <div className="card__sub">Audits</div>
              <div className="card__title">Auditsliste</div>
            </div>
            <span className="dashboard-count-badge">{dashboardAudits.length}</span>
          </div>

          <div className="dashboard-audit-stack">
            {dashboardAudits.slice(0, 6).map((audit) => {
              const countdown = auditCountdown(audit.date, audit.time);
              return (
                <div key={audit.id} className="cert-audit-item dashboard-audit-item">
                  <div className="cert-audit-item__left">
                    <div className="cert-audit-date">{window.fmtDE(audit.date)}</div>
                    <div className="cert-audit-time">{audit.time} Uhr</div>
                    <div className="cert-audit-countdown">
                      {countdown.days}d | {String(countdown.hours).padStart(2, '0')}h | {String(countdown.minutes).padStart(2, '0')}m | {String(countdown.seconds).padStart(2, '0')}s
                    </div>
                  </div>
                  <div className="cert-audit-item__body">
                    <div className="cert-audit-item__title">{audit.title}</div>
                    <div className="cert-audit-company">{audit.companyName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { DashboardView });
