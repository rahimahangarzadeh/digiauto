/* Unterweisungen view â€” detail-heavy, most important after matrix */

function InstructionsLegacyView({ activeCompany }) {
  const [selectedId, setSelectedId] = React.useState(window.SEED.instructions[0].id);
  const [companyFilter, setCompanyFilter] = React.useState(activeCompany);
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  React.useEffect(() => {
    setCompanyFilter(activeCompany);
  }, [activeCompany]);

  let list = window.SEED.instructions;
  if (companyFilter !== 'all') list = list.filter((u) => u.company === companyFilter);
  const allVisibleByCompany = companyFilter === 'all'
    ? window.SEED.instructions
    : window.SEED.instructions.filter((u) => u.company === companyFilter);
  const departmentOptions = [...new Set(allVisibleByCompany.map((u) => u.group))].sort();
  if (departmentFilter !== 'all') list = list.filter((u) => u.group === departmentFilter);
  if (statusFilter === 'aktiv') list = list.filter((u) => u.status === 'aktiv');
  if (statusFilter === 'archiv') list = list.filter((u) => u.status !== 'aktiv');
  if (statusFilter === 'nachzuholen') list = list.filter((u) => u.participants.some((p) => !p.signed));
  const selected = list.find((u) => u.id === selectedId) || list[0];
  const participantStats = list.reduce((acc, u) => {
    acc.total += u.participants.length;
    acc.done += u.participants.filter((p) => p.signed).length;
    acc.missing += u.participants.filter((p) => !p.signed).length;
    return acc;
  }, { total: 0, done: 0, missing: 0 });
  participantStats.quote = participantStats.total ? Math.round(participantStats.done / participantStats.total * 100) : 0;

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Unterweisungen</h1>
          <div className="view__subtitle">Nachweise nach Â§12 ArbSchG â€” Titel, Versionen, Teilnehmer, Historie.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost"><Icon name="upload" size={14} />Teilnehmerliste</button>
          <button className="btn btn--primary"><Icon name="plus" size={14} />Neue Unterweisung</button>
        </div>
      </div>

      <div className="instr-stats">
        <div className="instr-stat"><span>Gesamt Teilnehmer</span><strong>{participantStats.total}</strong></div>
        <div className="instr-stat"><span>Teilgenommen</span><strong>{participantStats.done}</strong></div>
        <div className="instr-stat instr-stat--missing"><span>Fehlt</span><strong>{participantStats.missing}</strong></div>
        <div className="instr-stat"><span>Quote</span><strong>{participantStats.quote}%</strong></div>
      </div>

      <div className="instr-filters">
        <label>
          <span>Firma</span>
          <select value={companyFilter} onChange={(e) => { setCompanyFilter(e.target.value); setDepartmentFilter('all'); }}>
            <option value="all">Alle Firmen</option>
            {window.SEED.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          <span>Abteilung</span>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="all">Alle Abteilungen</option>
            {departmentOptions.map((group) => <option key={group} value={group}>{group}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Alle Status</option>
            <option value="aktiv">Aktiv</option>
            <option value="nachzuholen">Nachzuholen</option>
            <option value="archiv">Archiv</option>
          </select>
        </label>
      </div>

      <div className="split">
        <div className="list-card">
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-1)', background: 'var(--color-parchment)' }}>
            <div className="small muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10.5 }}>{list.length} EintrÃ¤ge</div>
          </div>
          {list.map((u) =>
          <div key={u.id} className={'list-item' + (u.id === selected?.id ? ' list-item--active' : '')}
          onClick={() => setSelectedId(u.id)}>
              <div className="list-item__row">
                <div className="list-item__title">{u.title}</div>
                <span className="small muted">{u.version}</span>
              </div>
              <div className="list-item__meta">
                <span>{u.number}</span>
                <span>Â·</span>
                <span>{window.company(u.company)?.short}</span>
                <span>Â·</span>
                <span>{window.fmtDE(u.date)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {u.status === 'aktiv' ?
              <span className="badge badge--valid"><span className="badge__dot" />Aktiv</span> :
              <span className="badge"><span className="badge__dot" />Archiv</span>}
                <span className="badge">{u.participants.length} TN</span>
              </div>
            </div>
          )}
        </div>

        {selected && <InstructionDetail u={selected} />}
      </div>
    </div>);

}

function InstructionDetail({ u }) {
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(null); // emp id whose menu is open
  const [selectedVersion, setSelectedVersion] = React.useState(u.history?.[0] || null);
  const [instructionReleases, setInstructionReleases] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('employee_instruction_releases') || '{}'); }
    catch { return {}; }
  });
  React.useEffect(() => {
    setSelectedVersion(u.history?.[0] || null);
  }, [u.id]);
  const signed = u.participants.filter((p) => p.signed);
  const missing = u.participants.filter((p) => !p.signed);
  const quote = u.participants.length ? Math.round(signed.length / u.participants.length * 100) : 0;

  const planCatchup = (participant) => {
    const emp = window.employee(participant.emp);
    window.dispatchEvent(new CustomEvent('navigate-to-calendar', {
      detail: {
        trainingId: 't-unterweisung',
        instruction: {
          id: u.id,
          title: u.title,
          number: u.number,
          company: u.company,
          group: u.group,
          participantId: participant.emp,
          participantName: emp?.name || 'Unbekannt',
        },
      },
    }));
  };

  const handleStatusChange = (empId, newStatus) => {
    // newStatus: 'teilgenommen', 'nicht_teilgenommen', or 'nachholen'
    console.log(`Status changed for ${empId} to ${newStatus}`);
    setStatusMenuOpen(null);
    // In a real app, you'd update the data here
  };
  const releaseKey = (empId) => `${u.id}_${empId}`;
  const toggleInstructionRelease = (participant) => {
    const emp = window.employee(participant.emp);
    const key = releaseKey(participant.emp);
    const next = { ...instructionReleases };
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = {
        id: key,
        instructionId: u.id,
        employeeId: participant.emp,
        employeeName: emp?.name || 'Unbekannt',
        personalNr: emp?.personalNr || '',
        title: u.title,
        group: u.group,
        date: participant.date || u.date,
        status: 'teilgenommen',
        document: u.document,
        version: u.version,
        releasedAt: new Date().toISOString(),
        releasedBy: 'Admin',
      };
    }
    setInstructionReleases(next);
    localStorage.setItem('employee_instruction_releases', JSON.stringify(next));
    window.dispatchEvent(new Event('employee-instruction-releases-updated'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card card--pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div className="small muted" style={{ letterSpacing: 0.4 }}>{u.number} Â· {u.version}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, lineHeight: 1.2, marginTop: 4 }}>{u.title}</div>
            <div className="small muted" style={{ marginTop: 6 }}>{window.company(u.company)?.name} Â· {u.group}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn--ghost"><Icon name="download" size={14} />PDF</button>
            <button className="btn btn--sand"><Icon name="plus" size={14} />Neue Version</button>
          </div>
        </div>

        <div className="divider" />

        <div className="kv-grid">
          <div className="kv"><div className="kv__label">DURCHGEFÃœHRT</div><div className="kv__value">{window.fmtDE(u.validFrom)}</div></div>
          <div className="kv"><div className="kv__label">
</div><div className="kv__value">{window.fmtDE(u.date)}</div></div>
          <div className="kv"><div className="kv__label">Unterweisender</div><div className="kv__value">{u.instructor}</div></div>
          <div className="kv"><div className="kv__label">Gruppe / Abteilung</div><div className="kv__value">{u.group}</div></div>
          <div className="kv"><div className="kv__label">Ãœbersetzung</div><div className="kv__value">{u.translation}</div></div>
          <div className="kv"><div className="kv__label">
</div><div className="kv__value">{u.whatsapp}</div></div>
          <div className="kv"><div className="kv__label">Dokument</div><div className="kv__value"><a className="subtle" href="#" onClick={(e) => e.preventDefault()}><Icon name="doc" size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />{u.document}</a></div></div>
          <div className="kv"><div className="kv__label">Status</div><div className="kv__value"><span className={u.status === 'aktiv' ? 'badge badge--valid' : 'badge'}><span className="badge__dot" />{u.status}</span></div></div>
        </div>

        <h3 className="section-title" style={{ fontSize: 16, margin: '20px 0 6px' }}>Beschreibung</h3>
        <div className="pd-body-serif" style={{ color: 'var(--fg-1)', lineHeight: 1.65 }}>{u.description}</div>

        <h3 className="section-title" style={{ fontSize: 16, margin: '16px 0 6px' }}>ErklÃ¤rung</h3>
        <div className="pd-body-serif" style={{ color: 'var(--fg-2)', lineHeight: 1.65 }}>{u.explanation}</div>
      </div>

      <div className="card card--pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="card__title">Teilnehmerliste</div>
          <div className="small muted">{signed.length} von {u.participants.length} unterschrieben</div>
        </div>
        <div className="bar" style={{ marginBottom: 16 }}>
          <div className="bar__fill bar__fill--valid" style={{ width: signed.length / u.participants.length * 100 + '%' }} />
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10.5, marginBottom: 8 }}>Teilgenommen ({signed.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signed.map((p) => {const e = window.employee(p.emp) || { name: 'Unbekannt', initials: '?', color: 5 };return (
                    <div key={p.emp} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, background: '#eff5ed', position: 'relative' }}>
                    <div className={'avatar avatar--' + e.color} style={{ width: 26, height: 26, fontSize: 10 }}>{e.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</div>
                      <div className="small muted">{e.position || ''}</div>
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button 
                        onClick={() => setStatusMenuOpen(statusMenuOpen === p.emp ? null : p.emp)}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center', 
                          gap: 5,
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid rgba(63,122,74,0.2)',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'background 120ms, border-color 120ms',
                          color: '#3f7a4a',
                          fontSize: 12,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(63,122,74,0.08)';
                          e.currentTarget.style.borderColor = 'rgba(63,122,74,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(63,122,74,0.2)';
                        }}
                      >
                        <Icon name="check" size={14} style={{ verticalAlign: '-2px' }} /> {window.fmtDE(p.date)}
                      </button>
                      {statusMenuOpen === p.emp && (
                        <InlineStatusMenu 
                          onSelect={(status) => handleStatusChange(p.emp, status)}
                          onClose={() => setStatusMenuOpen(null)}
                        />
                      )}
                    </div>
                    <label style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:12, fontWeight:600, color: instructionReleases[releaseKey(p.emp)] ? '#3f7a4a' : 'var(--fg-3)', cursor:'pointer', whiteSpace:'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={!!instructionReleases[releaseKey(p.emp)]}
                        onChange={() => toggleInstructionRelease(p)}
                        style={{ width:17, height:17, accentColor:'#3f7a4a', cursor:'pointer' }}
                      />
                      {instructionReleases[releaseKey(p.emp)] ? 'Freigegeben' : 'Nicht freigegeben'}
                    </label>
                  </div>);

                })}
            </div>
          </div>
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10.5, marginBottom: 8 }}>Nachzuholen ({missing.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {missing.length === 0 && <div className="small muted" style={{ padding: '8px 4px' }}>Alle haben teilgenommen.</div>}
              {missing.map((p) => {
                const e = window.employee(p.emp) || { name: 'Unbekannt', initials: '?', color: 5 };
                return (
                  <div key={p.emp} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, background: '#fbecea', position: 'relative' }}>
                    <div className={'avatar avatar--' + e.color} style={{ width: 26, height: 26, fontSize: 10 }}>{e.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</div>
                      <div className="small muted">{p.reason || 'Abwesend'}</div>
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        onClick={() => planCatchup(p)}
                        className="btn btn--sand"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        <Icon name="cal" size={13} />Termin planen
                      </button>
                      {statusMenuOpen === p.emp && (
                        <InlineStatusMenu 
                          onSelect={(status) => handleStatusChange(p.emp, status)}
                          onClose={() => setStatusMenuOpen(null)}
                        />
                      )}
                    </div>
                  </div>);

              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card card--pad">
        <div className="card__title">Versionshistorie</div>
        <div className="card__sub">Alle frÃ¼heren Fassungen dieser Unterweisung.</div>
        <div className="instr-version-layout">
          <div>
          {u.history.map((h, i) =>
          <button key={i} className={'instr-version-row' + (selectedVersion?.version === h.version ? ' instr-version-row--active' : '')} onClick={() => setSelectedVersion(h)}>
              <span className="badge">{h.version}</span>
              <span className="small num">{window.fmtDE(h.date)}</span>
              <span className="small">{h.note}</span>
            </button>
          )}
          </div>
          {selectedVersion && (
            <div className="instr-version-detail">
              <div className="small muted">Was wurde geÃ¤ndert</div>
              <div className="instr-version-detail__note">{selectedVersion.note}</div>
              <div className="small muted" style={{ marginTop: 10 }}>Version {selectedVersion.version} vom {window.fmtDE(selectedVersion.date)}</div>
              <button className="btn btn--ghost" type="button" style={{ marginTop: 14 }}>
                <Icon name="doc" size={14} />Alte Version ansehen (PDF)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>);

}

/* Firmen-Auswertung */
function EvaluationView() {
  const [tab, setTab] = React.useState('schulung');
  const [entryFilter, setEntryFilter] = React.useState('all');
  const [groupFilter, setGroupFilter] = React.useState('all');
  const companies = window.SEED.companies;
  const today = new Date(window.SEED.today || '2026-04-21');

  const employeeGroup = (employee) => {
    const text = `${employee.department || ''} ${employee.position || ''}`.toLowerCase();
    if (
      text.includes('bÃ¼ro') || text.includes('bÃƒÂ¼ro') ||
      text.includes('kaufm') || text.includes('bauleit') ||
      text.includes('geschÃ¤ft') || text.includes('geschaeft') ||
      text.includes('verwaltung')
    ) return 'angestellte';
    return 'gewerbliche';
  };

  const monthsSinceEntry = (employee) => {
    const entry = new Date(employee.entry);
    if (Number.isNaN(entry.getTime())) return 999;
    return (today.getFullYear() - entry.getFullYear()) * 12 + (today.getMonth() - entry.getMonth()) - (today.getDate() < entry.getDate() ? 1 : 0);
  };

  const entryThresholds = { all: 0, '3': 3, '6': 6, '12': 12 };
  const activeEmpsBase = window.SEED.employees.filter(e => e.status === 'aktiv');
  const activeEmps = activeEmpsBase.filter((employee) => {
    const passesEntry = entryFilter === 'all' || monthsSinceEntry(employee) > entryThresholds[entryFilter];
    const passesGroup = groupFilter === 'all' || employeeGroup(employee) === groupFilter;
    return passesEntry && passesGroup;
  });
  const hiddenByFilters = activeEmpsBase.length - activeEmps.length;

  /* â”€â”€ helpers â”€â”€ */
  const pctColor = (pct) => pct >= 85 ? '#3f7a4a' : pct >= 60 ? '#8a6a1f' : '#a13232';
  const pctCls   = (pct) => pct >= 85 ? 'bar__fill--valid' : pct >= 60 ? 'bar__fill--warn' : 'bar__fill--expired';

  const MiniBar = ({ pct }) => (
    <div className="bar" style={{ height: 5, marginTop: 4 }}>
      <div className={'bar__fill ' + pctCls(pct)} style={{ width: pct + '%' }} />
    </div>
  );

  const CompanyCell = ({ count, total }) => {
    const pct = total ? Math.round(count * 100 / total) : 0;
    return (
      <td style={{ minWidth: 120, verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span className="muted">{count}/{total}</span>
          <span style={{ fontWeight: 500, color: pctColor(pct) }}>{pct}%</span>
        </div>
        <MiniBar pct={pct} />
      </td>
    );
  };

  /* â”€â”€ Tab 1: nach Schulung â”€â”€ */
  const TabSchulung = () => (
    <div className="card card--pad">
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 180 }}>Schulung</th>
              {companies.map(c => <th key={c.id} style={{ textAlign: 'center', minWidth: 120 }}>{c.short}</th>)}
              <th style={{ textAlign: 'center', minWidth: 80 }}>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {window.SEED.trainings.map(t => {
              let allGood = 0, allTotal = 0;
              const cells = companies.map(c => {
                const emps = activeEmps.filter(e => e.company === c.id);
                let good = 0;
                emps.forEach(e => {
                  const s = window.SEED.certs[e.id]?.[t.id]?.status;
                  if (s === 'valid' || s === 'warn') good++;
                });
                allGood += good; allTotal += emps.length;
                return { id: c.id, good, total: emps.length };
              });
              const totalPct = allTotal ? Math.round(allGood * 100 / allTotal) : 0;
              return (
                <tr
                  key={t.id}
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-training', { detail: { trainingId: t.id } }))}
                  title={`${t.short} in Schulungen & Qualifikationen oeffnen`}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.short}</div>
                    <div className="small muted">{t.cat}{t.mandatory ? ' Â· Pflicht' : ''}</div>
                  </td>
                  {cells.map(cell => <CompanyCell key={cell.id} count={cell.good} total={cell.total} />)}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: pctColor(totalPct) }}>{totalPct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* â”€â”€ Tab 2: nach Position â”€â”€ */
  const positions = [...new Set(activeEmps.map(e => e.position))].sort();
  const openMatrixForPosition = (position) => {
    window.dispatchEvent(new CustomEvent('navigate-to-matrix-position', {
      detail: { position },
    }));
  };
  const TabPosition = () => (
    <div className="card card--pad">
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 160 }}>Position</th>
              {companies.map(c => <th key={c.id} style={{ textAlign: 'center', minWidth: 120 }}>{c.short}</th>)}
              <th style={{ textAlign: 'center', minWidth: 80 }}>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => {
              const allInPos = activeEmps.filter(e => e.position === pos);
              const cells = companies.map(c => {
                const inCo = allInPos.filter(e => e.company === c.id);
                return { id: c.id, count: inCo.length, total: activeEmps.filter(e => e.company === c.id).length };
              });
              const totalCount = allInPos.length;
              const grandTotal = activeEmps.length;
              const totalPct = grandTotal ? Math.round(totalCount * 100 / grandTotal) : 0;
              return (
                <tr key={pos} onClick={() => openMatrixForPosition(pos)} title={`Qualifikationsmatrix fÃ¼r Position ${pos} Ã¶ffnen`} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{pos}</div>
                    <div className="small muted">{totalCount} Mitarbeiter gesamt</div>
                  </td>
                  {cells.map(cell => (
                    <td key={cell.id} style={{ minWidth: 120, verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ fontWeight: 500 }}>{cell.count}</span>
                        <span className="muted" style={{ fontSize: 11 }}>
                          {cell.total ? Math.round(cell.count * 100 / cell.total) + '% d. Firma' : 'â€”'}
                        </span>
                      </div>
                      <div className="bar" style={{ height: 5, marginTop: 4 }}>
                        <div
                          className="bar__fill bar__fill--valid"
                          style={{ width: cell.total ? (cell.count / cell.total * 100) + '%' : '0%', opacity: 0.75 }}
                        />
                      </div>
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{totalCount}</div>
                    <div className="small muted" style={{ fontSize: 11 }}>{totalPct}%</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* â”€â”€ Tab 3: nach Firma â”€â”€ */
  const TabFirma = () => {
    const rows = companies.map(c => {
      const emps = activeEmps.filter(e => e.company === c.id);
      let valid = 0, expired = 0, missing = 0, openInstr = 0;
      emps.forEach(e => {
        window.SEED.trainings.forEach(t => {
          const s = window.SEED.certs[e.id]?.[t.id]?.status;
          if (s === 'valid' || s === 'warn') valid++;
          else if (s === 'expired') expired++;
          else { missing++; }
        });
        // open instructions: instructions where this employee hasn't signed
        window.SEED.instructions.forEach(u => {
          const p = u.participants?.find(p => p.emp === e.id);
          if (p && !p.signed) openInstr++;
        });
      });
      const totalCerts = emps.length * window.SEED.trainings.length;
      const mandatoryMissing = emps.reduce((acc, e) => {
        window.SEED.trainings.filter(t => t.mandatory).forEach(t => {
          const s = window.SEED.certs[e.id]?.[t.id]?.status;
          if (!s || s === 'missing') acc++;
        });
        return acc;
      }, 0);
      const coverage = totalCerts ? Math.round(valid * 100 / totalCerts) : 0;
      const status = mandatoryMissing === 0 && expired === 0 ? 'ok'
        : mandatoryMissing > 0 || expired > 3 ? 'kritisch' : 'warnung';
      return { c, emps, valid, expired, mandatoryMissing, openInstr, coverage, status };
    });

    const statusBadge = (s) => {
      if (s === 'ok') return <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#e8f5eb', color:'#3f7a4a', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}><span style={{width:6,height:6,borderRadius:'50%',background:'#3f7a4a',display:'inline-block'}}></span>OK</span>;
      if (s === 'warnung') return <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#fdf3e0', color:'#8a6a1f', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}><span style={{width:6,height:6,borderRadius:'50%',background:'#8a6a1f',display:'inline-block'}}></span>Warnung</span>;
      return <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#fbeaea', color:'#a13232', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}><span style={{width:6,height:6,borderRadius:'50%',background:'#a13232',display:'inline-block'}}></span>Kritisch</span>;
    };

    return (
      <div className="card card--pad">
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Firma</th>
                <th style={{ textAlign: 'center', minWidth: 90 }}>Mitarbeiter</th>
                <th style={{ textAlign: 'center', minWidth: 130 }}>GÃ¼ltige Zertifikate</th>
                <th style={{ textAlign: 'center', minWidth: 130 }}>Abgelaufene Zert.</th>
                <th style={{ textAlign: 'center', minWidth: 150 }}>Fehlende Pflichtschulung.</th>
                <th style={{ textAlign: 'center', minWidth: 130 }}>Offene Unterweisungen</th>
                <th style={{ textAlign: 'center', minWidth: 100 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, emps, valid, expired, mandatoryMissing, openInstr, coverage, status }) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)' }}>
                        <span>Abdeckung</span><span style={{ fontWeight: 600, color: pctColor(coverage) }}>{coverage}%</span>
                      </div>
                      <MiniBar pct={coverage} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, fontSize: 18 }}>{emps.length}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#3f7a4a', fontSize: 16 }}>{valid}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: expired > 0 ? '#a13232' : 'var(--fg-3)', fontSize: 16 }}>{expired}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: mandatoryMissing > 0 ? '#a13232' : 'var(--fg-3)', fontSize: 16 }}>{mandatoryMissing}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: openInstr > 0 ? '#8a6a1f' : 'var(--fg-3)', fontSize: 16 }}>{openInstr}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{statusBadge(status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* â”€â”€ render â”€â”€ */
  const evalModeStats = {
    schulung: window.SEED.trainings.length,
    position: positions.length,
    firma: companies.length,
  };
  const tabs = [
    { id: 'schulung', label: 'Nach Schulung', value: evalModeStats.schulung, hint: 'Schulungen' },
    { id: 'position', label: 'Nach Position', value: evalModeStats.position, hint: 'Positionen' },
    { id: 'firma', label: 'Nach Firma', value: evalModeStats.firma, hint: 'Firmen' },
  ];

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Firmen-Auswertung</h1>
          <div className="view__subtitle">Abdeckung je Schulung und Firma â€” Ampelsystem.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost"><Icon name="download" size={14} />Excel</button>
          <button className="btn btn--ghost"><Icon name="download" size={14} />PDF</button>
        </div>
      </div>

      <div className="toolbar" style={{ marginTop: -4, marginBottom: 18 }}>
        <label className="select" style={{ cursor: 'default' }}>
          <span className="select__label">Eintritt</span>
          <select
            value={entryFilter}
            onChange={(event) => setEntryFilter(event.target.value)}
            style={{ border: 0, background: 'transparent', font: 'inherit', color: 'var(--fg-1)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Alle</option>
            <option value="3">&gt; 3 Monate</option>
            <option value="6">&gt; 6 Monate</option>
            <option value="12">&gt; 12 Monate</option>
          </select>
        </label>
        <label className="select" style={{ cursor: 'default' }}>
          <span className="select__label">Mitarbeitergruppe</span>
          <select
            value={groupFilter}
            onChange={(event) => setGroupFilter(event.target.value)}
            style={{ border: 0, background: 'transparent', font: 'inherit', color: 'var(--fg-1)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Alle</option>
            <option value="angestellte">Angestellte</option>
            <option value="gewerbliche">Gewerbliche</option>
          </select>
        </label>
        <span className="chip" style={{ cursor: 'default' }}>
          {activeEmps.length} relevante Mitarbeiter
        </span>
        {hiddenByFilters > 0 && (
          <span className="chip chip--warn" style={{ cursor: 'default' }}>
            {hiddenByFilters} ausgeblendet
          </span>
        )}
      </div>

      {/* KPI-style view selector */}
      <div className="evaluation-kpi-tabs" aria-label="Auswertungsansicht">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            className={'evaluation-kpi-tab' + (tab === t.id ? ' is-active' : '')}
            onClick={() => setTab(t.id)}
          >
            <span className="evaluation-kpi-tab__label">{t.label}</span>
            <strong>{t.value}</strong>
            <span className="evaluation-kpi-tab__hint">{t.hint}</span>
          </button>
        ))}
      </div>

      {tab === 'schulung' && <TabSchulung />}
      {tab === 'position' && <TabPosition />}
      {tab === 'firma'    && <TabFirma />}
    </div>
  );
}

/* Employee Portal â€” moved to view_portal.jsx */
function _PortalView_legacy() {
  const me = window.employee('e-me');
  const myCerts = window.SEED.trainings.map((t) => ({
    training: t,
    cert: window.SEED.certs[me.id]?.[t.id]
  })).filter((x) => x.cert && x.cert.status !== 'missing');
  const myInstructions = window.SEED.instructions.filter((u) =>
  u.participants.some((p) => p.emp === me.id)
  );
  const sortedCerts = [...myCerts].sort((a, b) => {
    const order = { expired: 0, warn: 1, valid: 2, planned: 3 };
    return (order[a.cert.status] ?? 9) - (order[b.cert.status] ?? 9);
  });

  const [openId, setOpenId] = React.useState(null);
  const openEntry = sortedCerts.find((x) => x.training.id === openId);

  return (
    <div>
      <div className="portal-hero">
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--fg-on-dark-2)' }}>Mein Portal</div>
          <div className="portal-hero__greet">Guten Morgen, {me.firstName}.</div>
          <div className="portal-hero__sub">Hier siehst du deine Schulungen, Zertifikate und die Unterweisungen, an denen du teilgenommen hast.</div>
        </div>
        <div className="portal-hero__avatar">{me.initials}</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="portal-stat">
          <div className="kpi__label">GÃ¼ltige Schulungen</div>
          <div className="portal-stat__num">{myCerts.filter((x) => x.cert.status === 'valid').length}</div>
        </div>
        <div className="portal-stat">
          <div className="kpi__label">Laufen bald ab</div>
          <div className="portal-stat__num" style={{ color: '#8a6a1f' }}>{myCerts.filter((x) => x.cert.status === 'warn').length}</div>
        </div>
        <div className="portal-stat">
          <div className="kpi__label">Abgelaufen</div>
          <div className="portal-stat__num" style={{ color: '#a13232' }}>{myCerts.filter((x) => x.cert.status === 'expired').length}</div>
        </div>
        <div className="portal-stat">
          <div className="kpi__label">Unterweisungen</div>
          <div className="portal-stat__num">{myInstructions.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="card card--pad">
          <div className="card__title">Meine Schulungen</div>
          <div className="card__sub">Sortiert nach Dringlichkeit. Zeile anklicken fÃ¼r Details, Upload & Nachricht an Admin.</div>
          <div style={{ marginTop: 12 }}>
            {sortedCerts.map(({ training, cert }) =>
            <PortalCertRow
              key={training.id}
              training={training}
              cert={cert}
              active={openId === training.id}
              onOpen={() => setOpenId(training.id)} />

            )}
          </div>
        </div>

        <div className="card card--pad">
          <div className="card__title">Meine Unterweisungen</div>
          <div className="card__sub">Historie deiner Teilnahmen.</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myInstructions.map((u) => {
              const my = u.participants.find((p) => p.emp === me.id);
              return (
                <div key={u.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border-1)' }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{u.title}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>{u.number} Â· {u.version}</div>
                  <div style={{ marginTop: 6 }}>
                    {my?.signed ?
                    <span className="badge badge--valid"><span className="badge__dot" />Unterschrieben am {window.fmtDE(my.date)}</span> :
                    <span className="badge badge--warn"><span className="badge__dot" />Offen Â· {my?.reason || 'Nachholen'}</span>}
                  </div>
                </div>);

            })}
          </div>
        </div>
      </div>

      {openEntry && <PortalCertDrawer entry={openEntry} onClose={() => setOpenId(null)} />}
    </div>);

}

/* ---- Row in "Meine Schulungen" ---- */
function PortalCertRow({ training, cert, active, onOpen }) {
  const stop = (e) => e.stopPropagation();
  return (
    <div
      onClick={onOpen}
      className={'portal-row' + (active ? ' portal-row--active' : '')}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 110px 110px 96px',
        alignItems: 'center',
        gap: 10,
        padding: '14px 10px',
        margin: '0 -10px',
        borderTop: '1px solid var(--border-1)',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 150ms var(--ease-standard)',
        background: active ? 'var(--color-parchment)' : 'transparent'
      }}>
      
      <div>
        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          {training.name}
          {training.mandatory && <span className="badge badge--accent" style={{ fontSize: 10 }}>Pflicht</span>}
        </div>
        <div className="small muted">{training.cat} Â· Wiederholung alle {training.months} Mon.</div>
      </div>
      <div className="small num">{cert.expiresAt ? window.fmtDE(cert.expiresAt) : 'â€”'}</div>
      <StatusBadge status={cert.status} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }} onClick={stop}>
        <button className="portal-qbtn" title="Dokument herunterladen" onClick={(e) => {e.stopPropagation();onOpen();}}>
          <Icon name="download" size={15} />
        </button>
        <button className="portal-qbtn" title="Dokument hochladen" onClick={(e) => {e.stopPropagation();onOpen();}}>
          <Icon name="upload" size={15} />
        </button>
        <button className="portal-qbtn" title="Nachricht an Admin" onClick={(e) => {e.stopPropagation();onOpen();}}>
          <Icon name="mail" size={15} />
        </button>
      </div>
    </div>);

}

/* ---- Drawer for a single training: Download, Upload, Comment ---- */
function PortalCertDrawer({ entry, onClose }) {
  const { training, cert } = entry;
  const [tab, setTab] = React.useState('download'); // download | upload | message

  // Upload wizard state
  const [uploadStep, setUploadStep] = React.useState(1); // 1 meta, 2 file, 3 pending
  const [docName, setDocName] = React.useState(training.short + ' Zertifikat');
  const [validUntil, setValidUntil] = React.useState(cert?.expiresAt || '');
  const [file, setFile] = React.useState(null);
  const [dragOver, setDrag] = React.useState(false);

  // Chat state
  const [messages, setMessages] = React.useState([
  { from: 'admin', text: 'Hallo Markus, falls du Fragen zu deinem Zertifikat â€ž' + training.short + '" hast, schreib mir einfach hier.', time: 'Mo. 09:14' }]
  );
  const [draft, setDraft] = React.useState('');
  const chatEndRef = React.useRef(null);

  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleFile = (f) => {if (f) setFile(f);};
  const onDrop = (e) => {
    e.preventDefault();setDrag(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const resetUpload = () => {
    setUploadStep(1);
    setFile(null);
    setDocName(training.short + ' Zertifikat');
    setValidUntil(cert?.expiresAt || '');
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const text = draft.trim();
    setMessages((m) => [...m, { from: 'me', text, time: `Heute ${hh}:${mm}`, status: 'sent' }]);
    setDraft('');
    // simulated admin typing reply
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'admin', typing: true }]);
    }, 900);
    setTimeout(() => {
      setMessages((m) => {
        const copy = m.filter((x) => !x.typing);
        const hh2 = String(new Date().getHours()).padStart(2, '0');
        const mm2 = String(new Date().getMinutes()).padStart(2, '0');
        return [...copy, { from: 'admin', text: 'Danke fÃ¼r deine Nachricht â€” ich schaue mir das an und melde mich.', time: `Heute ${hh2}:${mm2}` }];
      });
    }, 2600);
  };

  React.useEffect(() => {
    chatEndRef.current?.parentElement?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [messages, tab]);

  // fake document metadata
  const existingDoc = cert?.document || training.short.replace(/\s+/g, '_') + '_Zertifikat.pdf';
  const issuedBy = cert?.provider ? window.provider(cert.provider)?.name : 'Akademie n.n.';
  const issuedAt = cert?.issuedAt || cert?.validFrom || (cert?.expiresAt ? cert.expiresAt.slice(0, 4) + '-01-15' : 'â€”');

  return (
    <div className="portal-drawer__backdrop" onClick={onClose}>
      <aside className="portal-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="portal-drawer__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="small muted" style={{ letterSpacing: 0.4, textTransform: 'uppercase', fontSize: 10.5 }}>
              {training.cat}{training.mandatory ? ' Â· Pflichtschulung' : ''}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, lineHeight: 1.2, marginTop: 4 }}>
              {training.name}
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              Wiederholung alle {training.months} Monate
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="SchlieÃŸen" style={{ flexShrink: 0 }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Status summary */}
        <div className="portal-drawer__summary">
          <div className="kv"><div className="kv__label">Status</div><div className="kv__value"><StatusBadge status={cert.status} /></div></div>
          <div className="kv"><div className="kv__label">GÃ¼ltig bis</div><div className="kv__value num">{cert.expiresAt ? window.fmtDE(cert.expiresAt) : 'â€”'}</div></div>
          <div className="kv"><div className="kv__label">Ausgestellt von</div><div className="kv__value">{issuedBy}</div></div>
          <div className="kv"><div className="kv__label">Ausstellungsdatum</div><div className="kv__value num">{issuedAt === 'â€”' ? 'â€”' : window.fmtDE(issuedAt)}</div></div>
        </div>

        {/* Tabs */}
        <div className="portal-drawer__tabs" role="tablist">
          <button className={'portal-tab' + (tab === 'download' ? ' portal-tab--active' : '')} onClick={() => setTab('download')}>
            <Icon name="download" size={14} /> Dokument
          </button>
          <button className={'portal-tab' + (tab === 'upload' ? ' portal-tab--active' : '')} onClick={() => setTab('upload')}>
            <Icon name="upload" size={14} /> Hochladen
          </button>
          <button className={'portal-tab' + (tab === 'message' ? ' portal-tab--active' : '')} onClick={() => setTab('message')}>
            <Icon name="mail" size={14} /> Nachricht
          </button>
        </div>

        {/* Tab content */}
        <div className="portal-drawer__body">
          {tab === 'download' &&
          <div>
              <div className="portal-doc">
                <div className="portal-doc__icon"><Icon name="doc" size={22} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{existingDoc}</div>
                  <div className="small muted">PDF Â· hinterlegt am {issuedAt === 'â€”' ? 'â€”' : window.fmtDE(issuedAt)}</div>
                </div>
                <button className="btn btn--primary">
                  <Icon name="download" size={14} /> Herunterladen
                </button>
              </div>

              <h3 className="section-title" style={{ fontSize: 14, margin: '20px 0 8px' }}>Hinweise</h3>
              <div className="pd-body-serif" style={{ color: 'var(--fg-2)', lineHeight: 1.6, fontSize: 14 }}>
                Bewahre dein Zertifikat sicher auf. Wenn es sich Ã¤ndert â€” z.&nbsp;B. durch eine Auffrischung
                auÃŸerhalb der Janning-Gruppe â€” lade die neue Fassung Ã¼ber den Reiter <em>Hochladen</em> hoch.
                Die Personalabteilung prÃ¼ft die Datei und aktualisiert dein Ablaufdatum.
              </div>
            </div>
          }

          {tab === 'upload' &&
          <div className="portal-wizard">
              {/* Stepper */}
              <div className="wiz-steps">
                <div className={'wiz-step' + (uploadStep >= 1 ? ' wiz-step--on' : '') + (uploadStep === 1 ? ' wiz-step--cur' : '')}>
                  <span className="wiz-step__num">{uploadStep > 1 ? <Icon name="check" size={12} /> : '1'}</span>
                  <span className="wiz-step__lbl">Angaben</span>
                </div>
                <div className="wiz-line" />
                <div className={'wiz-step' + (uploadStep >= 2 ? ' wiz-step--on' : '') + (uploadStep === 2 ? ' wiz-step--cur' : '')}>
                  <span className="wiz-step__num">{uploadStep > 2 ? <Icon name="check" size={12} /> : '2'}</span>
                  <span className="wiz-step__lbl">Datei</span>
                </div>
                <div className="wiz-line" />
                <div className={'wiz-step' + (uploadStep >= 3 ? ' wiz-step--on' : '') + (uploadStep === 3 ? ' wiz-step--cur' : '')}>
                  <span className="wiz-step__num">{uploadStep > 3 ? <Icon name="check" size={12} /> : '3'}</span>
                  <span className="wiz-step__lbl">Freigabe</span>
                </div>
              </div>

              {uploadStep === 1 &&
            <div style={{ marginTop: 8 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>Wie heiÃŸt dieses Dokument?</div>
                  <div className="small muted" style={{ marginTop: 4 }}>Kurze Bezeichnung und GÃ¼ltigkeit â€” dann geht's zur Datei.</div>

                  <label className="portal-label" style={{ marginTop: 18 }}>Dokumentname</label>
                  <input
                className="portal-input"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="z. B. Staplerschein" />
              

                  <label className="portal-label" style={{ marginTop: 12 }}>GÃ¼ltig bis</label>
                  <input
                type="date"
                className="portal-input"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)} />
              
                  <div className="small muted" style={{ marginTop: 6 }}>
                    Das neue Ablaufdatum. Bei unbefristeten Nachweisen leer lassen.
                  </div>

                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                  className="btn btn--primary"
                  onClick={() => setUploadStep(2)}
                  disabled={!docName.trim()}
                  style={{ opacity: !docName.trim() ? 0.5 : 1 }}>
                  
                      Weiter <Icon name="chevR" size={14} />
                    </button>
                  </div>
                </div>
            }

              {uploadStep === 2 &&
            <div style={{ marginTop: 8 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>Datei auswÃ¤hlen</div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    <strong style={{ color: 'var(--fg-1)', fontWeight: 500 }}>{docName}</strong>
                    {validUntil && <> Â· gÃ¼ltig bis <span className="num">{window.fmtDE(validUntil)}</span></>}
                  </div>

                  <div
                className={'portal-drop' + (dragOver ? ' portal-drop--over' : '')}
                onDragOver={(e) => {e.preventDefault();setDrag(true);}}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: 16 }}>
                
                    <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])} />
                
                    {!file ?
                <>
                        <div className="portal-drop__icon"><Icon name="upload" size={22} /></div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginTop: 6 }}>Datei hier ablegen</div>
                        <div className="small muted" style={{ marginTop: 2 }}>oder klicken zum AuswÃ¤hlen Â· PDF, JPG, PNG Â· max. 10 MB</div>
                      </> :

                <div className="portal-file">
                        <div className="portal-file__icon"><Icon name="doc" size={18} /></div>
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                          <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                          <div className="small muted">{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button
                    className="icon-btn"
                    onClick={(e) => {e.stopPropagation();setFile(null);}}
                    aria-label="Entfernen">
                    <Icon name="x" size={16} /></button>
                      </div>
                }
                  </div>

                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <button className="btn btn--ghost" onClick={() => setUploadStep(1)}>
                      <Icon name="chevL" size={14} /> ZurÃ¼ck
                    </button>
                    <button
                  className="btn btn--primary"
                  onClick={() => setUploadStep(3)}
                  disabled={!file}
                  style={{ opacity: !file ? 0.5 : 1 }}>
                  
                      <Icon name="upload" size={14} /> Zur Freigabe senden
                    </button>
                  </div>
                </div>
            }

              {uploadStep === 3 &&
            <div style={{ marginTop: 8 }}>
                  <div className="wiz-success">
                    <div className="wiz-success__icon">
                      <Icon name="clock" size={24} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, marginTop: 12 }}>
                      Wartet auf Freigabe
                    </div>
                    <div className="small muted" style={{ marginTop: 6, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                      Dein Dokument wurde eingereicht. Sabine Janning prÃ¼ft den Nachweis und gibt ihn frei.
                      Sobald freigegeben, wird dein Ablaufdatum automatisch aktualisiert.
                    </div>
                  </div>

                  <div className="wiz-summary">
                    <div className="wiz-summary__row">
                      <span className="wiz-summary__k">Dokument</span>
                      <span className="wiz-summary__v">{docName}</span>
                    </div>
                    <div className="wiz-summary__row">
                      <span className="wiz-summary__k">GÃ¼ltig bis</span>
                      <span className="wiz-summary__v num">{validUntil ? window.fmtDE(validUntil) : 'â€”'}</span>
                    </div>
                    <div className="wiz-summary__row">
                      <span className="wiz-summary__k">Datei</span>
                      <span className="wiz-summary__v" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        {file?.name}
                      </span>
                    </div>
                    <div className="wiz-summary__row">
                      <span className="wiz-summary__k">Status</span>
                      <span className="wiz-summary__v">
                        <span className="badge badge--warn"><span className="badge__dot" />In PrÃ¼fung</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn--ghost" onClick={resetUpload}>
                      <Icon name="plus" size={14} /> Weiteres Dokument hochladen
                    </button>
                  </div>
                </div>
            }
            </div>
          }

          {tab === 'message' &&
          <div className="chat">
              <div className="chat__head">
                <div className="chat__avatar">SJ</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>Sabine Janning</div>
                  <div className="small" style={{ color: 'var(--fg-3)' }}>
                    <span className="chat__dot" /> Firmenverantwortliche Â· online
                  </div>
                </div>
              </div>

              <div className="chat__stream">
                <div className="chat__day">Heute</div>
                {messages.map((m, i) =>
              m.typing ?
              <div key={i} className="chat-bubble chat-bubble--them chat-bubble--typing">
                      <span></span><span></span><span></span>
                    </div> :

              <div key={i} className={'chat-bubble ' + (m.from === 'me' ? 'chat-bubble--me' : 'chat-bubble--them')}>
                      <div className="chat-bubble__text">{m.text}</div>
                      <div className="chat-bubble__meta">
                        {m.time}
                        {m.from === 'me' && <Icon name="check" size={11} style={{ marginLeft: 3, verticalAlign: '-1px' }} />}
                      </div>
                    </div>

              )}
                <div ref={chatEndRef} />
              </div>

              {messages.length <= 1 &&
            <div className="chat__quick">
                  <button className="chip" onClick={() => setDraft('Hallo Sabine, ich wÃ¼nschte mir eine Auffrischung fÃ¼r ' + training.short + '. Kannst du mich anmelden?')}>
                    Auffrischung anfragen
                  </button>
                  <button className="chip" onClick={() => setDraft('Mein ' + training.short + '-Zertifikat ist nicht mehr auffindbar â€” kannst du mir eine Kopie schicken?')}>
                    Zertifikat verloren
                  </button>
                  <button className="chip" onClick={() => setDraft('Die Angaben zu meiner Schulung stimmen nicht â€” kannst du kurz drauf schauen?')}>
                    Angaben korrigieren
                  </button>
                </div>
            }

              <div className="chat__input">
                <textarea
                rows={1}
                placeholder="Nachricht schreibenâ€¦"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();sendMessage();}
                }} />
              
                <button
                className="chat__send"
                onClick={sendMessage}
                disabled={!draft.trim()}
                aria-label="Senden">
                
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4z" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      </aside>
    </div>);

}

/* â”€â”€ Inline Status Change Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function InlineStatusMenu({ onSelect, onClose }) {
  const options = [
    { id: 'teilgenommen', label: 'âœ” teilgenommen', icon: 'âœ”', color: '#3f7a4a' },
    { id: 'nicht_teilgenommen', label: 'âŒ nicht teilgenommen', icon: 'âŒ', color: '#a13232' },
    { id: 'nachholen', label: 'â³ nachholen', icon: 'â³', color: '#8a6a1f' },
  ];

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        background: 'var(--color-ivory)',
        border: '1px solid var(--border-1)',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        zIndex: 9999,
        minWidth: 240,
        overflow: 'hidden',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(opt.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13.5,
            fontWeight: 500,
            color: 'var(--fg-1)',
            transition: 'background 120ms',
            borderBottom: opt.id !== 'nachholen' ? '1px solid var(--border-1)' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-parchment)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 14 }}>{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function InstructionsListView({ activeCompany }) {
  const [selectedInstruction, setSelectedInstruction] = React.useState(null);
  const [companyFilter, setCompanyFilter] = React.useState(activeCompany || 'all');
  const [instructionView, setInstructionView] = React.useState('current');
  const [instrSort, setInstrSort] = React.useState({ col: 'date', dir: 'desc' });
  const [instrColumnMenu, setInstrColumnMenu] = React.useState(null);
  const [instrFilterPanel, setInstrFilterPanel] = React.useState(null);
  const [instrFilterSearch, setInstrFilterSearch] = React.useState('');
  const [instrColumnFilters, setInstrColumnFilters] = React.useState({});
  const [instrGroupBy, setInstrGroupBy] = React.useState('');
  const [instructionReleases, setInstructionReleases] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('employee_instruction_releases') || '{}'); }
    catch { return {}; }
  });
  const [instructionPendingApprovals, setInstructionPendingApprovals] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('instruction_pending_approvals') || '{}'); }
    catch { return {}; }
  });
  const [instructionOverrides, setInstructionOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('instruction_edit_overrides') || '{}'); }
    catch { return {}; }
  });

  React.useEffect(() => setCompanyFilter(activeCompany || 'all'), [activeCompany]);

  const saveOverrides = (next) => {
    setInstructionOverrides(next);
    localStorage.setItem('instruction_edit_overrides', JSON.stringify(next));
  };
  const saveInstructionReleases = (next) => {
    setInstructionReleases(next);
    localStorage.setItem('employee_instruction_releases', JSON.stringify(next));
    window.dispatchEvent(new Event('employee-instruction-releases-updated'));
  };
  const saveInstructionPendingApprovals = (next) => {
    setInstructionPendingApprovals(next);
    localStorage.setItem('instruction_pending_approvals', JSON.stringify(next));
    window.dispatchEvent(new Event('instruction-pending-updated'));
  };
  const instructionReleaseKey = (instructionId, employeeId) => `${instructionId}_${employeeId}`;
  const releasedParticipants = (u) => u.participants.filter(p => p.signed);
  const isInstructionReleased = (u) => {
    const participants = releasedParticipants(u);
    return participants.length > 0 && participants.every(p => instructionReleases[instructionReleaseKey(u.id, p.emp)]);
  };
  const toggleInstructionRelease = (u) => {
    const next = { ...instructionReleases };
    const participants = releasedParticipants(u);
    const release = !isInstructionReleased(u);
    participants.forEach(p => {
      const emp = window.employee(p.emp);
      const key = instructionReleaseKey(u.id, p.emp);
      if (release) {
        next[key] = {
          id: key,
          instructionId: u.id,
          employeeId: p.emp,
          employeeName: emp?.name || 'Unbekannt',
          personalNr: emp?.personalNr || '',
          title: u.title,
          group: u.group,
          date: p.date || u.date,
          status: 'teilgenommen',
          document: u.document,
          version: u.version,
          releasedAt: new Date().toISOString(),
          releasedBy: 'Admin',
        };
      } else {
        delete next[key];
      }
    });
    saveInstructionReleases(next);
    if (u.id?.startsWith('uw-pending-')) {
      const nextApprovals = { ...instructionPendingApprovals };
      if (release) nextApprovals[u.id] = true;
      else delete nextApprovals[u.id];
      saveInstructionPendingApprovals(nextApprovals);
      if (release && instructionView === 'wartung') setInstructionView('current');
    }
  };
  const mergedInstruction = (u) => ({ ...u, ...(instructionOverrides[u.id] || {}) });
  const empId = (index) => window.SEED.employees[index]?.id || 'e-me';
  let allPendingInstructionRows = [
    {
      id: 'uw-pending-1',
      title: 'Baustellenunterweisung Tiefbau',
      number: 'UW-P-2026-001',
      company: 'tiefbau',
      group: 'Poliere + Maschinisten',
      date: '2026-05-06',
      instructor: 'Mustafa Kempers',
      version: 'v1.0',
      document: 'UW-Baustelle-Tiefbau-2026.pdf',
      status: 'in_pruefung',
      description: 'Nachweis wurde hochgeladen und wartet auf Admin-Pruefung.',
      explanation: 'Teilnehmerliste pruefen, Dokument freigeben und danach fuer Mitarbeiter sichtbar machen.',
      history: [{ version: 'v1.0', date: '2026-05-06', note: 'Hochgeladen durch Bauleiter' }],
      participants: [
        { emp: empId(0), signed: true, date: '2026-05-06' },
        { emp: empId(7), signed: true, date: '2026-05-06' },
        { emp: empId(8), signed: false, reason: 'fehlt' },
      ],
    },
    {
      id: 'uw-pending-2',
      title: 'Ladungssicherung Kolonne Nord',
      number: 'UW-P-2026-002',
      company: 'transporte',
      group: 'Fahrer',
      date: '2026-05-03',
      instructor: 'Thomas Wegener',
      version: 'v1.1',
      document: 'UW-Ladungssicherung-Kolonne-Nord.pdf',
      status: 'hochgeladen',
      description: 'Unterweisung aus dem Bereich Transport wurde nachgereicht.',
      explanation: 'Dokumentvorschau pruefen und Freigabe fuer Teilnehmer setzen.',
      history: [{ version: 'v1.1', date: '2026-05-03', note: 'Nachweis hochgeladen' }],
      participants: [
        { emp: empId(3), signed: true, date: '2026-05-03' },
        { emp: empId(4), signed: true, date: '2026-05-03' },
      ],
    },
    {
      id: 'uw-pending-3',
      title: 'Umgang mit Erdbaumaschinen',
      number: 'UW-P-2026-003',
      company: 'galabau',
      group: 'Werkstatt',
      date: '2026-04-28',
      instructor: 'Sabine Janning',
      version: 'v2.0',
      document: 'UW-Erdbaumaschinen-2026.pdf',
      status: 'offen',
      description: 'Dokument ist angelegt, Teilnehmerfreigabe steht noch aus.',
      explanation: 'Teilnehmer und Version pruefen.',
      history: [{ version: 'v2.0', date: '2026-04-28', note: 'Neue Version erstellt' }],
      participants: [
        { emp: empId(11), signed: true, date: '2026-04-28' },
        { emp: empId(12), signed: false, reason: 'Nachholen' },
        { emp: empId(13), signed: false, reason: 'Nachholen' },
      ],
    },
    {
      id: 'uw-pending-4',
      title: 'Sicherer Umgang mit Gefahrstoffen',
      number: 'UW-P-2026-004',
      company: 'bohrtechnik',
      group: 'Bohrtechnik',
      date: '2026-04-22',
      instructor: 'Rahim Ahangarzadeh',
      version: 'v1.0',
      document: 'UW-Gefahrstoffe-Bohrtechnik.pdf',
      status: 'in_pruefung',
      description: 'Neuer Unterweisungsnachweis fuer die Bohrtechnik.',
      explanation: 'PDF und Unterschriftenstatus kontrollieren.',
      history: [{ version: 'v1.0', date: '2026-04-22', note: 'Erster Upload' }],
      participants: [
        { emp: empId(5), signed: true, date: '2026-04-22' },
        { emp: empId(6), signed: true, date: '2026-04-22' },
        { emp: empId(9), signed: true, date: '2026-04-22' },
        { emp: empId(10), signed: false, reason: 'fehlt' },
      ],
    },
  ].map(mergedInstruction);
  let rows = [
    ...window.SEED.instructions.map(mergedInstruction),
    ...allPendingInstructionRows.filter(u => instructionPendingApprovals[u.id]),
  ];
  if (companyFilter !== 'all') rows = rows.filter(u => u.company === companyFilter);
  let pendingInstructionRows = allPendingInstructionRows.filter(u => !instructionPendingApprovals[u.id]);
  if (companyFilter !== 'all') pendingInstructionRows = pendingInstructionRows.filter(u => u.company === companyFilter);
  const activeRows = instructionView === 'wartung' ? pendingInstructionRows : rows;

  const instrColumns = [
    { key: 'title', label: 'Name Unterweisung' },
    { key: 'date', label: 'Durchgef\u00fchrt' },
    { key: 'instructor', label: 'Unterweisender' },
    { key: 'group', label: 'Gruppe / Abteilung' },
    { key: 'participants', label: 'Zahl Teilnehmer' },
    { key: 'version', label: 'Versionshistorie' },
  ];
  const instrColumnLabel = (key) => instrColumns.find(col => col.key === key)?.label || key;
  const instrColumnValue = (u, key) => {
    if (key === 'title') return u.title || '';
    if (key === 'date') return window.fmtDE(u.date);
    if (key === 'instructor') return u.instructor || '';
    if (key === 'group') return u.group || '';
    if (key === 'participants') {
      const missing = u.participants.filter(p => !p.signed).length;
      return `${u.participants.length} TN${missing ? ` - ${missing} fehlt` : ''}`;
    }
    if (key === 'version') return `${u.version} - ${u.history?.length || 1} Versionen`;
    return '';
  };
  const instrSortValue = (u, key) => {
    if (key === 'date') return u.date ? new Date(u.date).getTime() : 0;
    if (key === 'participants') return u.participants.length;
    return instrColumnValue(u, key);
  };
  const setInstrColumnSort = (col, dir) => {
    setInstrSort({ col, dir });
    setInstrColumnMenu(null);
  };
  const openInstrColumnFilter = (col) => {
    setInstrFilterPanel(col);
    setInstrFilterSearch('');
    setInstrColumnMenu(null);
  };
  const toggleInstrColumnFilterValue = (col, value) => {
    setInstrColumnFilters(current => {
      const selected = current[col] || [];
      const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      return { ...current, [col]: next };
    });
  };
  const clearInstrColumnFilter = (col) => {
    setInstrColumnFilters(current => ({ ...current, [col]: [] }));
  };
  const filteredRows = activeRows.filter(u => {
    for (const [col, values] of Object.entries(instrColumnFilters)) {
      if (values?.length && !values.includes(instrColumnValue(u, col))) return false;
    }
    return true;
  });
  const sortedRows = [...filteredRows].sort((a, b) => {
    const av = instrSortValue(a, instrSort.col);
    const bv = instrSortValue(b, instrSort.col);
    const result = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'de');
    return instrSort.dir === 'asc' ? result : -result;
  });
  const instrFilterValues = instrFilterPanel
    ? Array.from(new Set(activeRows.map(u => instrColumnValue(u, instrFilterPanel)))).sort((a, b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleInstrFilterValues = instrFilterValues.filter(value => String(value).toLowerCase().includes(instrFilterSearch.toLowerCase()));

  const InstructionColumnHeader = ({ col }) => {
    const active = instrSort.col === col.key || (instrColumnFilters[col.key] || []).length > 0 || instrGroupBy === col.key;
    return (
      <th style={{ position:'relative' }}>
        <button type="button" onClick={() => setInstrColumnMenu(instrColumnMenu === col.key ? null : col.key)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:0, padding:0, cursor:'pointer', font:'inherit', textTransform:'inherit', color:active ? 'var(--fg-1)' : 'inherit', fontWeight:active ? 700 : undefined }}>
          {col.label}
          <span style={{ fontSize:10 }}>{instrSort.col === col.key ? (instrSort.dir === 'asc' ? '\u2191' : '\u2193') : '\u2304'}</span>
        </button>
        {instrColumnMenu === col.key && (
          <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, minWidth:230, background:'white', border:'1px solid var(--border-1)', boxShadow:'0 16px 40px rgba(0,0,0,0.14)', borderRadius:4, padding:'6px 0', textTransform:'none', fontSize:14, color:'var(--fg-1)' }}>
            <button type="button" onClick={() => setInstrColumnSort(col.key, 'asc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setInstrColumnSort(col.key, 'desc')} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => openInstrColumnFilter(col.key)} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, borderTop:'1px solid var(--border-1)', background:'#f3f2f1', cursor:'pointer', font:'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setInstrGroupBy(instrGroupBy === col.key ? '' : col.key); setInstrSort({ col: col.key, dir: 'asc' }); setInstrColumnMenu(null); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 18px', border:0, background:'white', cursor:'pointer', font:'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };

  const saveInstructionPanel = (form) => {
    if (!selectedInstruction) return;
    saveOverrides({
      ...instructionOverrides,
      [selectedInstruction.id]: {
        title: form.title,
        date: form.date,
        instructor: form.instructor,
        group: form.group,
        version: form.version,
        document: form.document,
        status: form.status,
        description: form.description,
        explanation: form.explanation,
      },
    });
    setSelectedInstruction(null);
  };

  const ActionButtons = ({ u }) => (
    <div style={{ display:'inline-flex', gap:6 }} onClick={e => e.stopPropagation()}>
      <button title="Vorschau" onClick={() => setSelectedInstruction(u)} style={{ background:'none', border:0, cursor:'pointer', color:'var(--fg-2)', padding:4 }}><Icon name="eye" size={14} /></button>
      <button title="Bearbeiten" onClick={() => setSelectedInstruction(u)} style={{ background:'none', border:0, cursor:'pointer', color:'var(--fg-2)', padding:4 }}><Icon name="edit" size={14} /></button>
      <button title="Löschen" style={{ background:'none', border:0, cursor:'pointer', color:'#a13232', padding:4 }}><Icon name="trash" size={14} /></button>
    </div>
  );

  return (
    <div>
      <div className="view__header">
        <div>
          <h1 className="view__title">Unterweisungen</h1>
          <div className="view__subtitle">Alle Unterweisungen als klare Liste mit Versionen, Teilnehmern und Aktionen.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost"><Icon name="download" size={14} />PDF</button>
          <button className="btn btn--primary"><Icon name="plus" size={14} />Neue Unterweisung</button>
        </div>
      </div>

      <div style={{ display:'inline-flex', gap:4, background:'#f4f2ec', border:'1px solid var(--border-1)', borderRadius:10, padding:4, margin:'0 0 14px', boxShadow:'0 12px 30px rgba(20,20,19,.08)' }}>
        <button type="button" onClick={() => setInstructionView('current')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:instructionView === 'current' ? 700 : 500, color:instructionView === 'current' ? 'var(--fg-1)' : 'var(--fg-2)', background:instructionView === 'current' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (instructionView === 'current' ? 'var(--border-1)' : 'transparent'), boxShadow:instructionView === 'current' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Aktuell <span style={{ color:'var(--color-accent)' }}>{rows.length}</span>
        </button>
        <button type="button" onClick={() => setInstructionView('wartung')} style={{ padding:'9px 22px', fontSize:13.5, fontWeight:instructionView === 'wartung' ? 700 : 500, color:instructionView === 'wartung' ? 'var(--fg-1)' : 'var(--fg-2)', background:instructionView === 'wartung' ? 'var(--color-white)' : 'transparent', border:'1px solid ' + (instructionView === 'wartung' ? 'var(--border-1)' : 'transparent'), boxShadow:instructionView === 'wartung' ? '0 6px 16px rgba(20,20,19,.12)' : 'none', cursor:'pointer', borderRadius:8 }}>
          Wartungsliste <span style={{ color:'var(--color-accent)' }}>{pendingInstructionRows.length}</span>
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px' }}>
        {instrGroupBy && <button type="button" onClick={() => setInstrGroupBy('')} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Gruppierung aufheben</button>}
        {(instrSort.col !== 'date' || instrSort.dir !== 'desc') && <button type="button" onClick={() => setInstrSort({ col:'date', dir:'desc' })} className="btn btn--ghost" style={{ fontSize:12, padding:'6px 10px' }}>Sortierung zurücksetzen</button>}
        <span className="muted small" style={{ marginLeft:'auto' }}>{sortedRows.length} {instructionView === 'wartung' ? 'Einträge in Wartung' : 'Unterweisungen'}</span>
      </div>

      {Object.entries(instrColumnFilters).some(([, values]) => values?.length) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 12px', padding:'10px 0' }}>
          {Object.entries(instrColumnFilters).map(([col, values]) => (values || []).map(value => (
            <span key={col + value} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:999, background:'#efede8', color:'var(--fg-1)', fontSize:13 }}>
              <span style={{ color:'var(--fg-2)' }}>{instrColumnLabel(col)}:</span>
              <strong style={{ fontWeight:500 }}>{value}</strong>
              <button type="button" onClick={() => toggleInstrColumnFilterValue(col, value)} style={{ border:0, background:'transparent', cursor:'pointer', color:'var(--fg-2)', padding:0, lineHeight:1, display:'inline-flex' }}>
                <Icon name="x" size={14} />
              </button>
            </span>
          )))}
          <button type="button" onClick={() => setInstrColumnFilters({})} style={{ border:'1px solid var(--border-1)', background:'white', borderRadius:999, padding:'6px 10px', cursor:'pointer', font:'inherit', fontSize:13, color:'var(--fg-2)' }}>
            Alle Filter löschen
          </button>
        </div>
      )}

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {instrColumns.map(col => <InstructionColumnHeader key={col.key} col={col} />)}
              <th style={{ textAlign:'center' }}>Freigabe für Mitarbeiter</th>
              <th style={{ textAlign:'center' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((u, index) => {
              const missing = u.participants.filter(p => !p.signed).length;
              const groupValue = instrGroupBy ? instrColumnValue(u, instrGroupBy) : '';
              const previous = instrGroupBy && index > 0 ? instrColumnValue(sortedRows[index - 1], instrGroupBy) : null;
              return (
                <React.Fragment key={u.id}>
                {instrGroupBy && groupValue !== previous && (
                  <tr>
                    <td colSpan={8} style={{ background:'var(--color-parchment)', color:'var(--fg-1)', fontWeight:700, padding:'10px 14px' }}>
                      {instrColumnLabel(instrGroupBy)}: {groupValue}
                    </td>
                  </tr>
                )}
                <tr key={u.id} onClick={() => setSelectedInstruction(u)} style={{ cursor:'pointer' }}>
                  <td>
                    <div style={{ fontWeight:600 }}>{u.title}</div>
                    <div className="small muted">{u.number} - {window.company(u.company)?.short}</div>
                  </td>
                  <td>{window.fmtDE(u.date)}</td>
                  <td>{u.instructor}</td>
                  <td>{u.group}</td>
                  <td>
                    <span className={missing ? 'badge badge--warn' : 'badge badge--valid'}>
                      <span className="badge__dot" />{u.participants.length} TN{missing ? ` - ${missing} fehlt` : ''}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn--ghost" style={{ fontSize:12, padding:'5px 9px' }} onClick={e => { e.stopPropagation(); setSelectedInstruction(u); }}>
                      {u.version} - {u.history?.length || 1} Versionen
                    </button>
                  </td>
                  <td style={{ textAlign:'center', whiteSpace:'nowrap' }} onClick={e => e.stopPropagation()}>
                    <label style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:releasedParticipants(u).length ? 'pointer' : 'not-allowed', fontSize:12, color:isInstructionReleased(u) ? '#3f7a4a' : 'var(--fg-3)', fontWeight:600, opacity:releasedParticipants(u).length ? 1 : .5 }}>
                      <input
                        type="checkbox"
                        checked={isInstructionReleased(u)}
                        disabled={!releasedParticipants(u).length}
                        onChange={() => toggleInstructionRelease(u)}
                        style={{ width:18, height:18, accentColor:'#3f7a4a', cursor:releasedParticipants(u).length ? 'pointer' : 'not-allowed' }}
                      />
                      {isInstructionReleased(u) ? 'Freigegeben' : 'Nicht freigegeben'}
                    </label>
                  </td>
                  <td style={{ textAlign:'center' }}><ActionButtons u={u} /></td>
                </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {instrFilterPanel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.16)', display:'flex', justifyContent:'flex-end' }} onClick={() => setInstrFilterPanel(null)}>
          <aside style={{ width:390, maxWidth:'92vw', height:'100%', background:'white', boxShadow:'-18px 0 42px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 14px' }}>
              <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Filtern nach „{instrColumnLabel(instrFilterPanel)}“</h2>
              <button type="button" className="icon-btn" onClick={() => setInstrFilterPanel(null)}><Icon name="x" size={22} /></button>
            </div>
            <div style={{ padding:'10px 28px 16px' }}>
              <input value={instrFilterSearch} onChange={e => setInstrFilterSearch(e.target.value)} placeholder="Text eingeben, um Filter zu finden"
                style={{ width:'100%', boxSizing:'border-box', padding:'12px 10px', border:'1px solid var(--fg-2)', font:'inherit', fontSize:16 }} />
            </div>
            <div style={{ overflowY:'auto', padding:'8px 28px', flex:1 }}>
              {visibleInstrFilterValues.map(value => (
                <label key={value} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', fontSize:16, color:'var(--fg-1)' }}>
                  <input type="checkbox" checked={(instrColumnFilters[instrFilterPanel] || []).includes(value)} onChange={() => toggleInstrColumnFilterValue(instrFilterPanel, value)}
                    style={{ width:20, height:20, accentColor:'var(--color-accent)' }} />
                  {value}
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, padding:'16px 28px 22px', borderTop:'1px solid var(--border-1)' }}>
              <button type="button" className="btn btn--primary" onClick={() => setInstrFilterPanel(null)} disabled={!(instrColumnFilters[instrFilterPanel] || []).length}>Anwenden</button>
              <button type="button" className="btn btn--ghost" onClick={() => clearInstrColumnFilter(instrFilterPanel)}>Auswahl aufheben</button>
            </div>
          </aside>
        </div>
      )}

      {selectedInstruction && (
        <InstructionEditPanel
          instruction={selectedInstruction}
          onClose={() => setSelectedInstruction(null)}
          onSave={saveInstructionPanel}
        />
      )}
    </div>
  );
}

function InstructionEditPanel({ instruction, onClose, onSave }) {
  const [form, setForm] = React.useState({
    title: instruction.title || '',
    number: instruction.number || '',
    date: instruction.date || '',
    instructor: instruction.instructor || '',
    group: instruction.group || '',
    company: window.company(instruction.company)?.name || '',
    version: instruction.version || '',
    document: instruction.document || '',
    status: instruction.status || 'aktiv',
    description: instruction.description || '',
    explanation: instruction.explanation || '',
  });
  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const signed = instruction.participants.filter(p => p.signed).length;
  const missing = instruction.participants.length - signed;
  const input = { width:'100%', boxSizing:'border-box', border:'1px solid var(--border-1)', borderRadius:8, background:'var(--color-white)', padding:'8px 10px', font:'inherit', fontSize:13, color:'var(--fg-1)' };
  const label = { display:'grid', gap:5 };
  const labelText = { fontSize:11, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase' };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(20,20,19,0.35)', backdropFilter:'blur(1px)' }} />
      <aside style={{ position:'fixed', top:0, right:0, bottom:0, zIndex:3100, width:660, maxWidth:'calc(100vw - 24px)', background:'var(--color-ivory)', boxShadow:'-8px 0 40px rgba(0,0,0,0.16)', display:'flex', flexDirection:'column', animation:'slideInRight 220ms cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ background:'var(--color-near-black)', color:'#fff', padding:'20px 22px 16px', flexShrink:0 }}>
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ width:52, height:52, borderRadius:999, background:'var(--color-accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>UW</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:500 }}>{form.title}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.62)', marginTop:3 }}>{form.number} - {form.version}</div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <span className="badge badge--valid"><span className="badge__dot" />{signed} teilgenommen</span>
                <span className={missing ? 'badge badge--warn' : 'badge'}><span className="badge__dot" />{missing} fehlt</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:0, cursor:'pointer', color:'rgba(255,255,255,.65)', padding:4 }}><Icon name="x" size={18} /></button>
          </div>
        </div>

        <div style={{ borderBottom:'1px solid var(--border-1)', background:'var(--color-parchment)', padding:'12px 18px', fontWeight:700 }}>
          Unterweisung bearbeiten
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <label style={{ ...label, gridColumn:'1 / -1' }}><span style={labelText}>Name Unterweisung</span><input value={form.title} onChange={e => setField('title', e.target.value)} style={input} /></label>
            <label style={label}><span style={labelText}>{'Durchgef\u00fchrt'}</span><input type="date" value={form.date} onChange={e => setField('date', e.target.value)} style={input} /></label>
            <label style={label}><span style={labelText}>Unterweisender</span><input value={form.instructor} onChange={e => setField('instructor', e.target.value)} style={input} /></label>
            <label style={label}><span style={labelText}>Gruppe / Abteilung</span><input value={form.group} onChange={e => setField('group', e.target.value)} style={input} /></label>
            <label style={label}><span style={labelText}>Firma</span><input value={form.company} onChange={e => setField('company', e.target.value)} style={input} /></label>
            <label style={label}><span style={labelText}>Version</span><input value={form.version} onChange={e => setField('version', e.target.value)} style={input} /></label>
            <label style={label}><span style={labelText}>Status</span><select value={form.status} onChange={e => setField('status', e.target.value)} style={{ ...input, cursor:'pointer' }}><option value="aktiv">Aktiv</option><option value="archiv">Archiv</option></select></label>
            <label style={{ ...label, gridColumn:'1 / -1' }}><span style={labelText}>Dokument</span><input value={form.document} onChange={e => setField('document', e.target.value)} style={input} /></label>
            <label style={{ ...label, gridColumn:'1 / -1' }}><span style={labelText}>Beschreibung</span><textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={4} style={{ ...input, resize:'vertical' }} /></label>
            <label style={{ ...label, gridColumn:'1 / -1' }}><span style={labelText}>Erklärung</span><textarea value={form.explanation} onChange={e => setField('explanation', e.target.value)} rows={3} style={{ ...input, resize:'vertical' }} /></label>
          </div>

          <div style={{ marginTop:18, border:'1px solid var(--border-1)', borderRadius:10, overflow:'hidden', background:'var(--color-white)' }}>
            <div style={{ padding:'10px 12px', background:'var(--color-parchment)', fontWeight:700 }}>Versionshistorie</div>
            {(instruction.history || []).map(h => (
              <div key={h.version} style={{ display:'grid', gridTemplateColumns:'80px 110px 1fr auto', gap:10, alignItems:'center', padding:'10px 12px', borderTop:'1px solid var(--border-1)' }}>
                <span className="badge">{h.version}</span>
                <span className="small muted">{window.fmtDE(h.date)}</span>
                <span>{h.note}</span>
                <button className="btn btn--ghost" style={{ fontSize:12, padding:'5px 9px' }}><Icon name="eye" size={13} />PDF</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:'14px 22px 18px', borderTop:'1px solid var(--border-1)', display:'flex', justifyContent:'space-between', gap:10 }}>
          <button className="btn btn--ghost" style={{ color:'#a13232' }}><Icon name="trash" size={14} />Löschen</button>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
            <button className="btn btn--primary" onClick={() => onSave(form)}>Speichern</button>
          </div>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { InstructionsView: InstructionsListView, EvaluationView, PortalCertRow, PortalCertDrawer });
