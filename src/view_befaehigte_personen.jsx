function BefaehigtePersonenView({ activeCompany = 'all', title = 'Befähigte Personen', onBack = null }) {
  const companies = window.SEED?.companies || [];
  const allEmployees = (window.SEED?.employees || []).filter(employee => employee.status === 'aktiv');
  const today = new Date(window.SEED?.today || '2026-04-21');
  const employeeById = id => allEmployees.find(employee => employee.id === id) || allEmployees[0] || {};
  const companyById = id => companies.find(company => company.id === id) || {};
  const companyName = id => companyById(id).name || id || '-';
  const companyOptions = activeCompany === 'all' ? companies : companies.filter(company => company.id === activeCompany);
  const employeeOptions = allEmployees.filter(employee => activeCompany === 'all' || employee.company === activeCompany);
  const workAreas = [
    'Leitern und Tritte', 'Gerüste', 'Anschlagmittel', 'Hebezeuge', 'Erdbaumaschinen',
    'Straßenbaumaschinen', 'Kleingeräte', 'elektrische Betriebsmittel', 'Druckgeräte',
    'Fahrzeuge', 'Verbaugeräte', 'persönliche Schutzausrüstung', 'weitere Arbeitsmittel',
  ];
  const statuses = ['Entwurf', 'In Prüfung', 'Gültig', 'Läuft bald ab', 'Abgelaufen', 'Widerrufen', 'Nachweis fehlt', 'Archiviert'];
  const releaseOptions = ['sichtbar', 'nicht sichtbar', 'nur für Führungskräfte', 'nur für ausgewählte Personen'];

  const seedRows = () => {
    const pick = index => employeeOptions[index % Math.max(employeeOptions.length, 1)] || allEmployees[index % Math.max(allEmployees.length, 1)] || {};
    return [
      makeQualifiedRow('bp-1', pick(0), 'Leitern und Tritte', 'Beauftragung zur Prüfung von Leitern und Tritten', '2025-02-01', '2027-02-01', 'Sabine Janning', 'Dirk Jürgens', 'BP_Leitern_Markus_Brinker.pdf', 'Sichtprüfung auf Baustellen.'),
      makeQualifiedRow('bp-2', pick(2), 'Gerüste', 'Befähigte Person für Gerüstfreigabe', '2025-05-12', '2027-05-12', 'Michael Janning', 'Alexander Petersen', 'BP_Gerueste_Dirk_Juergens.pdf', 'Kontrolle und Dokumentation Gerüstfreigabe.'),
      makeQualifiedRow('bp-3', pick(3), 'persönliche Schutzausrüstung', 'Prüfung PSA gegen Absturz', '2024-11-20', '2026-11-20', 'QSGU', 'Ralf Kowalski', 'BP_PSAgA_Tobias_Nowak.pdf', 'Kontrolle von PSA und Rettungssets.'),
      makeQualifiedRow('bp-4', pick(4), 'elektrische Betriebsmittel', 'Befähigte Person nach DGUV V3', '2024-04-01', '2026-03-31', 'QSGU', '', 'BP_Elektro_Ralf_Kowalski.pdf', 'DGUV V3 Sicht- und Funktionsprüfung.'),
      makeQualifiedRow('bp-5', pick(5), 'Fahrzeuge', 'Fuhrpark-Prüfung', '2024-06-01', '2026-06-20', 'Fuhrpark', 'Maik Wiegmann', '', 'Beauftragungsdokument fehlt.'),
      makeQualifiedRow('bp-6', pick(6), 'Erdbaumaschinen', 'Befähigte Person für Baumaschinenprüfung', '2023-03-10', '2026-03-10', 'Michael Janning', 'Thomas Lange', 'BP_Erdbaumaschinen_Thomas_Lange.pdf', 'Beauftragung abgelaufen, Nachweis erneuern.'),
    ];
  };

  const [rows, setRows] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('befaehigte_personen_rows_v2') || 'null');
      return saved || seedRows();
    } catch {
      return seedRows();
    }
  });
  const [viewMode, setViewMode] = React.useState('list');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [sortBy, setSortBy] = React.useState({ key: 'employee', dir: 'asc' });
  const [filters, setFilters] = React.useState({ status: 'all', company: activeCompany, area: 'all', release: 'all' });
  const [groupBy, setGroupBy] = React.useState('');
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);
  const [form, setForm] = React.useState(null);
  const [detailId, setDetailId] = React.useState(null);

  React.useEffect(() => {
    try { localStorage.setItem('befaehigte_personen_rows_v2', JSON.stringify(rows)); } catch {}
  }, [rows]);

  React.useEffect(() => {
    setFilters(current => ({ ...current, company: activeCompany }));
    setSelectedIds([]);
  }, [activeCompany]);

  const enrichedRows = rows
    .map(row => enrichQualifiedRow(row, today, employeeById, companyName))
    .filter(row => activeCompany === 'all' || row.companyId === activeCompany)
    .filter(row => filters.company === 'all' || row.companyId === filters.company)
    .filter(row => filters.status === 'all' || row.status === filters.status)
    .filter(row => filters.area === 'all' || row.area === filters.area)
    .filter(row => filters.release === 'all' || row.release === filters.release)
    .sort((a, b) => compareQualifiedRows(a, b, sortBy));
  const groupedRows = groupBy ? groupQualifiedRows(enrichedRows, groupBy) : [['Alle Beauftragungen', enrichedRows]];
  const detailRow = rows.map(row => enrichQualifiedRow(row, today, employeeById, companyName)).find(row => row.id === detailId);
  const visibleIds = enrichedRows.map(row => row.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const kpis = getQualifiedKpis(rows.map(row => enrichQualifiedRow(row, today, employeeById, companyName)).filter(row => activeCompany === 'all' || row.companyId === activeCompany));

  const openDialog = (mode, row = null) => {
    const target = row || {};
    const fallbackEmployee = employeeOptions[0] || allEmployees[0] || {};
    const employee = target.employeeId ? employeeById(target.employeeId) : fallbackEmployee;
    setDialog({ mode, id: target.id });
    setForm({
      employeeId: target.employeeId || employee.id || '',
      companyId: target.companyId || employee.company || activeCompany || 'all',
      area: target.area || workAreas[0],
      competenceType: target.competenceType || 'Befähigte Person',
      authorizationType: target.authorizationType || 'schriftliche Beauftragung',
      authorization: target.authorization || 'Beauftragung zur Prüfung befähigte Person',
      validFrom: target.validFrom || '2026-06-01',
      validUntil: target.validUntil || '2028-06-01',
      issuer: target.issuer || 'Sabine Janning',
      manager: target.manager || 'Christian Janning',
      substitute: target.substitute || '',
      qualification: target.qualification || 'Sachkundenachweis',
      trainingProof: target.trainingProof || 'Schulungsnachweis.pdf',
      document: target.document || 'Beauftragung.pdf',
      note: target.note || '',
      status: target.status || 'Gültig',
      release: target.release || 'nicht sichtbar',
    });
  };
  const saveDialog = event => {
    event.preventDefault();
    const next = { ...form, id: dialog.id || `bp-${Date.now()}` };
    setRows(current => dialog.mode === 'edit'
      ? current.map(row => row.id === next.id ? { ...row, ...next } : row)
      : [next, ...current]);
    setDialog(null);
  };
  const openExtendDialog = row => {
    setDialog({ mode: 'extend', id: row.id });
    setForm({
      oldValidUntil: row.validUntil,
      validUntil: '2028-12-31',
      extensionDate: window.SEED?.today || '2026-04-21',
      checkedBy: row.manager || 'Christian Janning',
      newProof: 'Verlaengerungsnachweis.pdf',
      note: 'Verlängerung vorbereitet.',
    });
  };
  const saveExtension = event => {
    event.preventDefault();
    setRows(current => current.map(row => row.id === dialog.id ? {
      ...row,
      validUntil: form.validUntil,
      status: 'Gültig',
      document: form.newProof || row.document,
      history: [...(row.history || []), `Verlängert am ${fmtDate(form.extensionDate)} durch ${form.checkedBy}`],
    } : row));
    setDialog(null);
  };
  const deleteRow = id => setRows(current => current.filter(row => row.id !== id));
  const archiveRow = id => setRows(current => current.map(row => row.id === id ? { ...row, status: 'Archiviert' } : row));
  const toggleSelected = id => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds(current => allSelected ? current.filter(id => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])));
  const bulkStatus = status => setRows(current => current.map(row => selectedIds.includes(row.id) ? { ...row, status } : row));
  const bulkArchive = () => { bulkStatus('Archiviert'); setSelectedIds([]); };
  const bulkDelete = () => { setRows(current => current.filter(row => !selectedIds.includes(row.id))); setSelectedIds([]); };

  if (detailRow) {
    return <QualifiedDetailPage
      row={detailRow}
      onBack={() => setDetailId(null)}
      onEdit={() => openDialog('edit', detailRow)}
      onExtend={() => openExtendDialog(detailRow)}
    />;
  }

  return <div className="qualified-page">
    <div className="qualified-head">
      <div className="qualified-title-row">
        {onBack && <button className="round-back" type="button" onClick={onBack}><Icon name="chevL" size={18} /></button>}
        <h1>{title}</h1>
      </div>
      <div className="qualified-actions">
        <div className="segmented">
          <button type="button" className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}><Icon name="dashboard" size={15} />Kacheln</button>
          <button type="button" className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><Icon name="matrix" size={15} />Liste</button>
        </div>
        {activeCompany === 'all' && <select value={filters.company} onChange={event => setFilters(current => ({ ...current, company: event.target.value }))}>
          <option value="all">Alle Firmen</option>
          {companyOptions.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>}
        <select value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value }))}>
          <option value="all">Alle Status</option>
          {statuses.map(status => <option key={status}>{status}</option>)}
        </select>
        <button className="btn btn--primary" type="button" onClick={() => openDialog('add')}><Icon name="plus" size={15} />Beauftragung erstellen</button>
      </div>
    </div>

    <section className="qualified-kpis">
      {kpis.map(kpi => <button key={kpi.label} type="button" className={`qualified-kpi ${filters.status === kpi.filter ? 'is-active' : ''}`} onClick={() => setFilters(current => ({ ...current, status: kpi.filter || 'all' }))}>
        <span>{kpi.label}</span>
        <strong className={kpi.tone ? `tone-${kpi.tone}` : ''}>{kpi.value}</strong>
        <small>{kpi.hint}</small>
      </button>)}
    </section>

    {selectedIds.length > 0 && <div className="qualified-bulkbar">
      <strong>{selectedIds.length} ausgewählt</strong>
      <button type="button" onClick={() => bulkStatus('Gültig')}>Status ändern</button>
      <button type="button">Gültigkeit verlängern</button>
      <button type="button">Freigabe ändern</button>
      <button type="button">PDF exportieren</button>
      <button type="button" onClick={bulkArchive}>Archivieren</button>
      <button type="button" className="is-danger" onClick={bulkDelete}>Löschen</button>
      <button type="button" className="icon-btn" onClick={() => setSelectedIds([])}><Icon name="x" size={14} /></button>
    </div>}

    {viewMode === 'cards'
      ? <div className="qualified-card-grid">{enrichedRows.map(row => <QualifiedCard key={row.id} row={row} onOpen={() => setDetailId(row.id)} onEdit={() => openDialog('edit', row)} onExtend={() => openExtendDialog(row)} onArchive={() => archiveRow(row.id)} onDelete={() => deleteRow(row.id)} />)}</div>
      : <QualifiedTable
          groups={groupedRows}
          selectedIds={selectedIds}
          allSelected={allSelected}
          toggleSelected={toggleSelected}
          toggleAll={toggleAll}
          columnMenu={columnMenu}
          setColumnMenu={setColumnMenu}
          sortBy={sortBy}
          setSortBy={setSortBy}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          onOpen={setDetailId}
          onEdit={openDialog}
          onExtend={openExtendDialog}
          onArchive={archiveRow}
          onDelete={deleteRow}
        />}

    {dialog?.mode === 'add' || dialog?.mode === 'edit'
      ? <QualifiedDialog form={form} setForm={setForm} companies={companyOptions} employees={employeeOptions.length ? employeeOptions : allEmployees} workAreas={workAreas} statuses={statuses} releaseOptions={releaseOptions} onClose={() => setDialog(null)} onSubmit={saveDialog} />
      : null}
    {dialog?.mode === 'extend'
      ? <QualifiedExtendDialog form={form} setForm={setForm} onClose={() => setDialog(null)} onSubmit={saveExtension} />
      : null}
  </div>;
}

function makeQualifiedRow(id, employee, area, authorization, validFrom, validUntil, manager, substitute, document, note) {
  return {
    id,
    employeeId: employee.id,
    companyId: employee.company,
    position: employee.position,
    area,
    competenceType: 'Befähigte Person',
    authorizationType: 'schriftliche Beauftragung',
    authorization,
    validFrom,
    validUntil,
    issuer: manager,
    manager,
    substitute,
    qualification: 'Sachkundenachweis',
    trainingProof: 'Schulungsnachweis.pdf',
    document,
    note,
    status: 'Gültig',
    release: document ? 'sichtbar' : 'nicht sichtbar',
    history: ['Erstellt durch Sabine Janning'],
  };
}

function enrichQualifiedRow(row, today, employeeById, companyName) {
  const employee = employeeById(row.employeeId);
  const days = Math.ceil((new Date(row.validUntil) - today) / 86400000);
  const computedStatus = row.status && !['Gültig', 'Läuft bald ab', 'Abgelaufen', 'Nachweis fehlt'].includes(row.status)
    ? row.status
    : !row.document ? 'Nachweis fehlt' : days < 0 ? 'Abgelaufen' : days <= 60 ? 'Läuft bald ab' : 'Gültig';
  const warnings = [
    days <= 90 && days >= 0 ? `läuft in ${days} Tagen ab` : null,
    days < 0 ? 'ist abgelaufen' : null,
    !row.document ? 'Beauftragungsdokument fehlt' : null,
    !row.trainingProof ? 'Schulungsnachweis fehlt' : null,
    !row.substitute ? 'Stellvertretung fehlt' : null,
  ].filter(Boolean);
  return {
    ...row,
    employeeName: employee.name || '-',
    position: row.position || employee.position || '-',
    companyName: companyName(row.companyId || employee.company),
    companyId: row.companyId || employee.company,
    days,
    status: computedStatus,
    warnings,
  };
}

function compareQualifiedRows(a, b, sortBy) {
  const factor = sortBy.dir === 'desc' ? -1 : 1;
  if (sortBy.key === 'days') return factor * (a.days - b.days);
  if (['validFrom', 'validUntil'].includes(sortBy.key)) return factor * (new Date(a[sortBy.key]) - new Date(b[sortBy.key]));
  return factor * String(a[sortBy.key] || '').localeCompare(String(b[sortBy.key] || ''), 'de');
}

function groupQualifiedRows(rows, key) {
  const map = new Map();
  rows.forEach(row => {
    const value = row[key] || 'Ohne Angabe';
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(row);
  });
  return Array.from(map.entries());
}

function getQualifiedKpis(rows) {
  return [
    { label: 'Befähigte Personen gesamt', value: new Set(rows.map(row => row.employeeId)).size, hint: 'Personen' },
    { label: 'Gültig', value: rows.filter(row => row.status === 'Gültig').length, filter: 'Gültig', tone: 'success', hint: 'freigegeben' },
    { label: 'Läuft bald ab', value: rows.filter(row => row.status === 'Läuft bald ab').length, filter: 'Läuft bald ab', tone: 'warning', hint: '60 Tage' },
    { label: 'Abgelaufen', value: rows.filter(row => row.status === 'Abgelaufen').length, filter: 'Abgelaufen', tone: 'danger', hint: 'Handlung' },
    { label: 'Nachweis fehlt', value: rows.filter(row => row.status === 'Nachweis fehlt').length, filter: 'Nachweis fehlt', tone: 'danger', hint: 'nachreichen' },
    { label: 'Widerrufen', value: rows.filter(row => row.status === 'Widerrufen').length, filter: 'Widerrufen', hint: 'Archiv' },
  ];
}

const QUALIFIED_COLUMNS = [
  ['employeeName', 'Mitarbeiter'],
  ['companyName', 'Firma'],
  ['position', 'Position'],
  ['area', 'Arbeitsmittelbereich'],
  ['authorization', 'Befähigung / Beauftragung'],
  ['validFrom', 'gültig ab'],
  ['validUntil', 'gültig bis'],
  ['days', 'Restlaufzeit'],
  ['substitute', 'Stellvertretung'],
  ['status', 'Status'],
  ['release', 'Freigabe für Mitarbeiter'],
  ['document', 'Dokument'],
  ['note', 'Bemerkung'],
  ['actions', 'Aktionen'],
];

function QualifiedTable({ groups, selectedIds, allSelected, toggleSelected, toggleAll, columnMenu, setColumnMenu, sortBy, setSortBy, groupBy, setGroupBy, onOpen, onEdit, onExtend, onArchive, onDelete }) {
  return <div className="qualified-table-wrap">
    <table className="qualified-table">
      <thead><tr>
        <th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
        {QUALIFIED_COLUMNS.map(([key, label]) => <th key={key}>
          <button type="button" className="column-head-btn" onClick={() => setColumnMenu(columnMenu === key ? null : key)}>{label}⌄</button>
          {columnMenu === key && <QualifiedColumnMenu colKey={key} label={label} sortBy={sortBy} setSortBy={setSortBy} groupBy={groupBy} setGroupBy={setGroupBy} />}
        </th>)}
      </tr></thead>
      {groups.map(([group, rows]) => <tbody key={group}>
        {groups.length > 1 && <tr className="group-row"><td colSpan={QUALIFIED_COLUMNS.length + 1}>{group} · {rows.length}</td></tr>}
        {rows.map(row => <tr key={row.id} className={(row.status === 'Abgelaufen' || row.status === 'Nachweis fehlt') ? 'is-danger-row' : ''} onClick={() => onOpen(row.id)}>
          <td onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
          <td><strong>{row.employeeName}</strong><small>{row.position}</small></td>
          <td>{row.companyName}</td>
          <td>{row.position}</td>
          <td>{row.area}</td>
          <td className="wide-cell">{row.authorization}</td>
          <td>{fmtDate(row.validFrom)}</td>
          <td>{fmtDate(row.validUntil)}</td>
          <td>{row.days < 0 ? `${Math.abs(row.days)} Tage abgelaufen` : `${row.days} Tage`}</td>
          <td>{row.substitute || <span className="tone-danger">fehlt</span>}</td>
          <td><QualifiedStatus status={row.status} /></td>
          <td><QualifiedRelease release={row.release} /></td>
          <td>{row.document ? <button className="file-chip" type="button"><Icon name="file" size={13} />{row.document}</button> : <span className="tone-danger">fehlt</span>}</td>
          <td className="wide-cell">{row.note || '-'}</td>
          <td onClick={event => event.stopPropagation()}><QualifiedActions row={row} onEdit={onEdit} onExtend={onExtend} onArchive={onArchive} onDelete={onDelete} /></td>
        </tr>)}
      </tbody>)}
    </table>
  </div>;
}

function QualifiedColumnMenu({ colKey, label, setSortBy, groupBy, setGroupBy }) {
  return <div className="column-menu">
    <button type="button" onClick={() => setSortBy({ key: colKey, dir: 'asc' })}>A bis Z</button>
    <button type="button" onClick={() => setSortBy({ key: colKey, dir: 'desc' })}>Z bis A</button>
    <button type="button">Filtern nach</button>
    <button type="button" onClick={() => setGroupBy(groupBy === colKey ? '' : colKey)}>Gruppieren nach "{label}"</button>
    <button type="button">Spalte ausblenden</button>
  </div>;
}

function QualifiedCard({ row, onOpen, onEdit, onExtend, onArchive, onDelete }) {
  return <article className="qualified-card" onClick={onOpen}>
    <div className="qualified-card-top">
      <QualifiedStatus status={row.status} />
      <QualifiedActions row={row} onEdit={onEdit} onExtend={onExtend} onArchive={onArchive} onDelete={onDelete} />
    </div>
    <h3>{row.employeeName}</h3>
    <p>{row.area}</p>
    <div className="qualified-card-meta">
      <span><b>Firma</b>{row.companyName}</span>
      <span><b>Gültig bis</b>{fmtDate(row.validUntil)}</span>
      <span><b>Stellvertretung</b>{row.substitute || 'fehlt'}</span>
      <span><b>Freigabe</b>{row.release}</span>
    </div>
    <div className="qualified-warning">{row.warnings[0] || 'Keine Warnung'}</div>
  </article>;
}

function QualifiedActions({ row, onEdit, onExtend, onArchive, onDelete }) {
  const [open, setOpen] = React.useState(false);
  return <div className="qualified-menu" onClick={event => event.stopPropagation()}>
    <button type="button" className="dots-btn" onClick={() => setOpen(!open)}>⋮</button>
    {open && <div className="cert-context-menu">
      <button type="button">Details anzeigen</button>
      <button type="button" onClick={() => onEdit('edit', row)}>Bearbeiten</button>
      <button type="button">PDF-Dokument öffnen</button>
      <button type="button" onClick={() => onEdit('add', { ...row, id: null })}>neue Beauftragung erstellen</button>
      <button type="button" onClick={() => onExtend(row)}>Verlängern</button>
      <button type="button">Nachweis ersetzen</button>
      <button type="button">Stellvertretung festlegen</button>
      <button type="button">Freigabe ändern</button>
      <button type="button">Widerrufen</button>
      <button type="button" onClick={() => onArchive(row.id)}>Archivieren</button>
      <button type="button" onClick={() => onDelete(row.id)}>Löschen</button>
    </div>}
  </div>;
}

function QualifiedStatus({ status }) {
  const cls = status === 'Gültig' ? 'current' : status === 'Läuft bald ab' ? 'due' : status === 'In Prüfung' ? 'review' : status === 'Abgelaufen' || status === 'Nachweis fehlt' ? 'old' : 'archived';
  return <span className={`norm-status-pill norm-status-${cls}`}>{status}</span>;
}

function QualifiedRelease({ release }) {
  const visible = release === 'sichtbar';
  return <span className={`qualified-release ${visible ? 'is-visible' : ''}`}><span />{release}</span>;
}

function QualifiedDialog({ form, setForm, companies, employees, workAreas, statuses, releaseOptions, onClose, onSubmit }) {
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <QualifiedModal title="Beauftragung erstellen" eyebrow="Befähigte Personen" onClose={onClose} onSubmit={onSubmit}>
    <div className="form-grid form-grid--three">
      <QualifiedField label="Mitarbeiter"><select value={form.employeeId} onChange={event => set('employeeId', event.target.value)}>{employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></QualifiedField>
      <QualifiedField label="Firma"><select value={form.companyId} onChange={event => set('companyId', event.target.value)}>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></QualifiedField>
      <QualifiedField label="Tätigkeit oder Prüfbereich"><input value={form.area} onChange={event => set('area', event.target.value)} /></QualifiedField>
      <QualifiedField label="Arbeitsmittelbereich"><select value={form.area} onChange={event => set('area', event.target.value)}>{workAreas.map(area => <option key={area}>{area}</option>)}</select></QualifiedField>
      <QualifiedField label="Art der Befähigung"><input value={form.competenceType} onChange={event => set('competenceType', event.target.value)} /></QualifiedField>
      <QualifiedField label="Art der Beauftragung"><input value={form.authorizationType} onChange={event => set('authorizationType', event.target.value)} /></QualifiedField>
      <QualifiedField label="gültig ab"><input type="date" value={form.validFrom} onChange={event => set('validFrom', event.target.value)} /></QualifiedField>
      <QualifiedField label="gültig bis"><input type="date" value={form.validUntil} onChange={event => set('validUntil', event.target.value)} /></QualifiedField>
      <QualifiedField label="ausstellende Person"><input value={form.issuer} onChange={event => set('issuer', event.target.value)} /></QualifiedField>
      <QualifiedField label="verantwortliche Führungskraft"><input value={form.manager} onChange={event => set('manager', event.target.value)} /></QualifiedField>
      <QualifiedField label="Stellvertretung"><input value={form.substitute} onChange={event => set('substitute', event.target.value)} /></QualifiedField>
      <QualifiedField label="erforderliche Qualifikation"><input value={form.qualification} onChange={event => set('qualification', event.target.value)} /></QualifiedField>
      <QualifiedField label="Schulungsnachweis"><input value={form.trainingProof} onChange={event => set('trainingProof', event.target.value)} /></QualifiedField>
      <QualifiedDocumentField value={form.document} onChange={value => set('document', value)} />
      <QualifiedField label="Status"><select value={form.status} onChange={event => set('status', event.target.value)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></QualifiedField>
      <QualifiedField label="Freigabe für Mitarbeiter"><select value={form.release} onChange={event => set('release', event.target.value)}>{releaseOptions.map(option => <option key={option}>{option}</option>)}</select></QualifiedField>
      <QualifiedField label="Befähigung / Beauftragung"><textarea value={form.authorization} onChange={event => set('authorization', event.target.value)} /></QualifiedField>
      <QualifiedField label="Bemerkung"><textarea value={form.note} onChange={event => set('note', event.target.value)} /></QualifiedField>
    </div>
  </QualifiedModal>;
}

function QualifiedExtendDialog({ form, setForm, onClose, onSubmit }) {
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <QualifiedModal title="Beauftragung verlängern" eyebrow="Verlängerung" onClose={onClose} onSubmit={onSubmit}>
    <div className="form-grid form-grid--three">
      <QualifiedField label="bisher gültig bis"><input value={form.oldValidUntil} readOnly /></QualifiedField>
      <QualifiedField label="neu gültig bis"><input type="date" value={form.validUntil} onChange={event => set('validUntil', event.target.value)} /></QualifiedField>
      <QualifiedField label="Verlängerungsdatum"><input type="date" value={form.extensionDate} onChange={event => set('extensionDate', event.target.value)} /></QualifiedField>
      <QualifiedField label="neue Prüfung oder Unterweisung"><input value={form.newTraining || ''} onChange={event => set('newTraining', event.target.value)} /></QualifiedField>
      <QualifiedField label="geprüft von"><input value={form.checkedBy} onChange={event => set('checkedBy', event.target.value)} /></QualifiedField>
      <QualifiedField label="neue PDF-Datei"><input value={form.newProof} onChange={event => set('newProof', event.target.value)} /></QualifiedField>
      <QualifiedField label="Bemerkung"><textarea value={form.note} onChange={event => set('note', event.target.value)} /></QualifiedField>
    </div>
  </QualifiedModal>;
}

function QualifiedModal({ title, eyebrow, children, onClose, onSubmit }) {
  return <div className="cert-modal-backdrop" onMouseDown={onClose}>
    <form className="cert-modal-card cert-modal-card--wide" onMouseDown={event => event.stopPropagation()} onSubmit={onSubmit}>
      <div className="cert-modal-card__head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-btn" type="button" onClick={onClose}><Icon name="x" size={18} /></button></div>
      {children}
      <div className="modal-actions"><button className="btn btn--ghost" type="button" onClick={onClose}>Abbrechen</button><button className="btn btn--primary" type="submit">Speichern</button></div>
    </form>
  </div>;
}

function QualifiedField({ label, children }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

function QualifiedDocumentField({ value, onChange }) {
  const fileName = value || 'Noch kein Dokument hinterlegt';
  return <div className="form-field qualified-doc-field">
    <span>PDF-Dokument hochladen</span>
    <div className="qualified-doc-box">
      {value
        ? <div className="qualified-doc-chip"><Icon name="file" size={14} /><span>{fileName}</span><button type="button" onClick={() => onChange('')}><Icon name="x" size={12} /></button></div>
        : <div className="qualified-doc-empty"><Icon name="file" size={16} />Kein Dokument hinterlegt</div>}
      <label className="qualified-doc-upload">
        <Icon name="upload" size={14} />Dokument hinzufügen
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={event => onChange(event.target.files?.[0]?.name || value || '')} />
      </label>
    </div>
  </div>;
}

function QualifiedDetailPage({ row, onBack, onEdit, onExtend }) {
  return <div className="qualified-detail-page">
    <div className="emp-page-title">
      <button className="round-back" type="button" onClick={onBack}><Icon name="chevL" size={18} /></button>
      <h1>{row.employeeName}</h1>
      <div className="page-actions"><button className="btn btn--ghost" onClick={onEdit}><Icon name="edit" size={14} />Bearbeiten</button><button className="btn btn--primary" onClick={onExtend}><Icon name="history" size={14} />Verlängern</button></div>
    </div>
    <section className="qualified-detail-hero">
      <div><QualifiedStatus status={row.status} /><h2>{row.area}</h2><p>{row.authorization}</p></div>
      <div><strong>{row.warnings[0] || 'Keine Warnung'}</strong><span>Gültig bis: {fmtDate(row.validUntil)}</span></div>
    </section>
    <div className="cert-detail-grid">
      <QualifiedInfoCard title="Mitarbeiterdaten" rows={[['Mitarbeiter', row.employeeName], ['Firma', row.companyName], ['Position', row.position]]} />
      <QualifiedInfoCard title="Beauftragung" rows={[['Arbeitsmittelbereich', row.area], ['Art der Befähigung', row.competenceType], ['Art der Beauftragung', row.authorizationType], ['Status', row.status], ['Freigabe', row.release]]} />
      <QualifiedInfoCard title="Gültigkeit" rows={[['gültig ab', fmtDate(row.validFrom)], ['gültig bis', fmtDate(row.validUntil)], ['Restlaufzeit', row.days < 0 ? `${Math.abs(row.days)} Tage abgelaufen` : `${row.days} Tage`]]} />
      <QualifiedInfoCard title="Verantwortung" rows={[['beauftragende Person', row.issuer], ['Führungskraft', row.manager], ['Stellvertretung', row.substitute || 'fehlt']]} />
      <QualifiedInfoCard title="Dokumente" rows={[['Beauftragungsschreiben', row.document || 'fehlt'], ['Schulungsnachweis', row.trainingProof || 'fehlt'], ['Zertifikat', row.qualification || '-']]} />
      <QualifiedInfoCard title="Historie" rows={(row.history || ['Erstellt']).map((entry, index) => [`Eintrag ${index + 1}`, entry])} />
      <QualifiedInfoCard title="Bemerkung" rows={[['Notiz', row.note || '-']]} />
    </div>
  </div>;
}

function QualifiedInfoCard({ title, rows }) {
  return <section className="info-card">
    <h2>{title}</h2>
    {rows.map(([label, value]) => <div key={`${title}-${label}`} className="info-row"><span>{label}</span><strong>{value}</strong></div>)}
  </section>;
}

function fmtDate(iso) {
  if (!iso || !String(iso).includes('-')) return iso || '-';
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

Object.assign(window, { BefaehigtePersonenView });
