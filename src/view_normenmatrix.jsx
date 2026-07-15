function NormenmatrixView({ activeCompany = 'all', extraAction = null, title = 'Normenmatrix', onBack = null }) {
  const companies = window.SEED?.companies || [];
  const today = new Date(window.SEED?.today || '2026-04-21');
  const sourceRows = window.NORMENMATRIX_ROWS || [];

  const [rows, setRows] = React.useState(() => sourceRows.map((row, index) => normalizeNormRow(row, index, today)));
  const [viewMode, setViewMode] = React.useState(() => window.localStorage?.getItem('normenmatrix-view') || 'list');
  const [tab, setTab] = React.useState('all');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [detailId, setDetailId] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [menuId, setMenuId] = React.useState(null);
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [sortBy, setSortBy] = React.useState({ key: 'number', dir: 'asc' });
  const [groupBy, setGroupBy] = React.useState('');
  const [hiddenCols, setHiddenCols] = React.useState([]);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    company: activeCompany === 'all' ? 'all' : activeCompany,
    status: 'all',
    area: 'all',
    owner: 'all',
    due: 'all',
    docs: 'all',
  });

  React.useEffect(() => {
    setFilters(current => ({ ...current, company: activeCompany === 'all' ? 'all' : activeCompany }));
    setSelectedIds([]);
  }, [activeCompany]);

  React.useEffect(() => {
    window.localStorage?.setItem('normenmatrix-view', viewMode);
  }, [viewMode]);

  const companyMap = Object.fromEntries(companies.map(company => [company.id, company]));
  const scopedRows = rows
    .map(row => enrichNormRow(row, today, companyMap))
    .filter(row => activeCompany === 'all' || row.companies.includes(activeCompany) || row.companies.includes('all'))
    .filter(row => filters.company === 'all' || row.companies.includes(filters.company) || row.companies.includes('all'))
    .filter(row => filters.status === 'all' || row.status === filters.status)
    .filter(row => filters.area === 'all' || row.area === filters.area)
    .filter(row => filters.owner === 'all' || row.owner === filters.owner)
    .filter(row => filters.due === 'all' || (filters.due === '90' && row.daysToCheck <= 90 && row.daysToCheck >= 0) || (filters.due === '30' && row.daysToCheck <= 30 && row.daysToCheck >= 0) || (filters.due === '7' && row.daysToCheck <= 7 && row.daysToCheck >= 0) || (filters.due === 'overdue' && row.daysToCheck < 0))
    .filter(row => filters.docs === 'all' || (filters.docs === 'missing' ? row.documents.length === 0 : row.documents.length > 0))
    .filter(row => tab === 'all' || (tab === 'missingDocs' ? row.documents.length === 0 : tab === 'Prüfung fällig' ? row.status === 'Prüfung fällig' || row.daysToCheck <= 30 : row.status === tab))
    .sort((a, b) => compareNormRows(a, b, sortBy));

  const groups = groupBy ? groupNormRows(scopedRows, groupBy) : [['Alle Normen', scopedRows]];
  const selectedRows = rows.filter(row => selectedIds.includes(row.id));
  const detailRow = rows.map(row => enrichNormRow(row, today, companyMap)).find(row => row.id === detailId);
  const kpis = getNormKpis(rows.map(row => enrichNormRow(row, today, companyMap)), activeCompany, filters.company).filter(kpi => !['Ersetzt', 'Archiviert'].includes(kpi.label));
  const tabs = getNormTabs(rows.map(row => enrichNormRow(row, today, companyMap)), activeCompany, filters.company);

  const openNormDialog = (mode, row = null) => {
    const target = row || {};
    setDialog({ type: 'norm', mode, id: target.id });
    setForm({
      area: target.area || '',
      name: target.name || '',
      normNumber: target.normNumber || '',
      version: target.version || '',
      issueDate: target.issueDate || '',
      purpose: target.purpose || '',
      provider: target.provider || '',
      companies: (target.companies || [activeCompany === 'all' ? 'all' : activeCompany]).join(', '),
      scope: target.scope || 'Unternehmen',
      validFrom: target.validFrom || '',
      lastCheck: target.lastCheck || '',
      nextCheck: target.nextCheck || '',
      interval: target.interval || 'jährlich',
      owner: target.owner || '',
      status: target.status || 'Aktuell',
      document: target.documents?.[0]?.file || '',
      link: target.link || '',
      notes: target.notes || '',
    });
  };

  const openCheckDialog = (row) => {
    setDialog({ type: 'check', id: row.id });
    setForm({
      checkDate: window.SEED?.today || '2026-04-21',
      checker: row.owner || 'Rahim Ahangarzadeh',
      result: 'Keine Änderung',
      current: 'Ja',
      newVersion: 'Nein',
      replaced: 'Nein',
      relevant: 'Nein',
      measures: 'Nein',
      nextCheck: row.nextCheck || '',
      note: '',
      evidence: '',
    });
  };

  const saveDialog = (event) => {
    event.preventDefault();
    if (dialog.type === 'norm') {
      const next = {
        id: dialog.id || `norm-${Date.now()}`,
        number: dialog.id ? rows.find(row => row.id === dialog.id)?.number : rows.length + 1,
        area: form.area,
        name: form.name,
        normNumber: form.normNumber,
        version: form.version,
        issueDate: form.issueDate,
        purpose: form.purpose,
        provider: form.provider,
        companies: String(form.companies || 'all').split(',').map(item => item.trim()).filter(Boolean),
        scope: form.scope,
        validFrom: form.validFrom,
        lastCheck: form.lastCheck,
        nextCheck: form.nextCheck,
        interval: form.interval,
        owner: form.owner,
        status: form.status,
        documents: form.document ? [{ file: form.document, type: 'Normdokument', version: form.version || '1.0', uploadedAt: window.SEED?.today || '2026-04-21', uploadedBy: form.owner || 'Rahim Ahangarzadeh', validFrom: form.validFrom, status: 'Aktiv' }] : [],
        link: form.link,
        notes: form.notes,
        previousVersions: dialog.id ? rows.find(row => row.id === dialog.id)?.previousVersions || [] : [],
        history: dialog.id ? [...(rows.find(row => row.id === dialog.id)?.history || []), `Bearbeitet am ${window.fmtDE?.(window.SEED?.today) || '21.04.2026'}`] : ['Neu angelegt'],
      };
      setRows(current => dialog.mode === 'edit' ? current.map(row => row.id === dialog.id ? { ...row, ...next, id: row.id } : row) : [...current, next]);
    }
    if (dialog.type === 'check') {
      setRows(current => current.map(row => row.id === dialog.id ? {
        ...row,
        lastCheck: form.checkDate,
        nextCheck: form.nextCheck,
        status: form.replaced === 'Ja' ? 'Ersetzt' : form.newVersion === 'Ja' ? 'Prüfung fällig' : 'Aktuell',
        checks: [...(row.checks || []), { ...form }],
        history: [...(row.history || []), `Prüfung durchgeführt von ${form.checker}`],
      } : row));
    }
    setDialog(null);
    setForm({});
  };

  const createNewVersion = (row) => {
    const newRow = {
      ...row,
      id: `${row.id}-v${Date.now()}`,
      number: rows.length + 1,
      version: nextVersionLabel(row.version),
      status: 'In Prüfung',
      previousVersions: [{ name: row.name, version: row.version, status: 'Ersetzt', reason: 'Neue Ausgabe verfügbar' }, ...(row.previousVersions || [])],
      history: [...(row.history || []), 'Neue Version angelegt'],
    };
    setRows(current => current.map(item => item.id === row.id ? { ...item, status: 'Ersetzt' } : item).concat(newRow));
  };

  const toggleSelected = (id) => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => {
    const ids = scopedRows.map(row => row.id);
    setSelectedIds(ids.every(id => selectedIds.includes(id)) ? [] : ids);
  };

  if (detailRow) {
    return <NormDetailPage
      row={detailRow}
      onBack={() => setDetailId(null)}
      onEdit={() => openNormDialog('edit', detailRow)}
      onCheck={() => openCheckDialog(detailRow)}
      onVersion={() => createNewVersion(detailRow)}
    />;
  }

  const titleActions = <div className="norm-actions">
        {extraAction}
        <select className="norm-select" value={filters.company} onChange={event => setFilters(current => ({ ...current, company: event.target.value }))}>
          <option value="all">Alle Firmen</option>
          {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>
        <div className="segmented">
          <button type="button" className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}><Icon name="dashboard" size={15} />Kacheln</button>
          <button type="button" className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><Icon name="matrix" size={15} />Liste</button>
        </div>
        <button className="btn btn--ghost" type="button" onClick={() => setFilterOpen(true)}><Icon name="filter" size={15} />Filter</button>
        <button className="btn btn--ghost" type="button"><Icon name="download" size={15} />Export</button>
        <button className="btn btn--primary" type="button" onClick={() => openNormDialog('add')}><Icon name="plus" size={15} />Norm hinzufügen</button>
      </div>;

  return <div className="norm-admin-page">
    {onBack
      ? <CompanyPageTitle title={title} onBack={onBack} action={titleActions} />
      : <div className="norm-page-head"><div><h1>{title}</h1></div>{titleActions}</div>}

    <section className="norm-kpis">
      {kpis.map(kpi => <button key={kpi.label} className={'norm-kpi ' + ((kpi.status && filters.status === kpi.status) || (kpi.due && filters.due === kpi.due) || (kpi.docs && filters.docs === kpi.docs) || (!kpi.status && !kpi.due && !kpi.docs && filters.status === 'all' && filters.due === 'all' && filters.docs === 'all') ? 'is-active' : '')} type="button" onClick={() => setFilters(current => ({ ...current, status: kpi.status || 'all', due: kpi.due || 'all', docs: kpi.docs || 'all' }))}>
        <span>{kpi.label}</span>
        <strong className={kpi.tone ? `tone-${kpi.tone}` : ''}>{kpi.value}</strong>
        <small>{kpi.hint}</small>
      </button>)}
    </section>

    <nav className="norm-tabs" aria-label="Normenstatus">
      {tabs.map(item => <button key={item.key} type="button" className={tab === item.key ? 'is-active' : ''} onClick={() => { setTab(item.key); setSelectedIds([]); }}>
        <span>{item.label}</span>
        <strong>{item.count}</strong>
      </button>)}
    </nav>

    {selectedIds.length > 0 && <div className="norm-bulkbar">
      <strong>{selectedIds.length} ausgewählt</strong>
      <button type="button">Status ändern</button>
      <button type="button">Person zuweisen</button>
      <button type="button">Prüfung bestätigen</button>
      <button type="button">Nächste Prüfung festlegen</button>
      <button type="button">Dokumente exportieren</button>
      <button type="button">Archivieren</button>
      <button type="button" className="is-danger">Löschen</button>
      <button type="button" className="icon-btn" onClick={() => setSelectedIds([])}><Icon name="x" size={14} /></button>
    </div>}

    {viewMode === 'cards'
      ? <div className="norm-card-grid">{scopedRows.map(row => <NormCard key={row.id} row={row} menuOpen={menuId === row.id} onMenu={() => setMenuId(menuId === row.id ? null : row.id)} onOpen={() => setDetailId(row.id)} onEdit={() => openNormDialog('edit', row)} onCheck={() => openCheckDialog(row)} onVersion={() => createNewVersion(row)} />)}</div>
      : <NormTable groups={groups} columns={NORM_COMPACT_COLUMNS} selectedIds={selectedIds} toggleSelected={toggleSelected} toggleAll={toggleAll} onOpen={setDetailId} onEdit={openNormDialog} onCheck={openCheckDialog} onVersion={createNewVersion} columnMenu={columnMenu} setColumnMenu={setColumnMenu} sortBy={sortBy} setSortBy={setSortBy} groupBy={groupBy} setGroupBy={setGroupBy} hiddenCols={hiddenCols} setHiddenCols={setHiddenCols} />}

    {filterOpen && <NormFilterDialog filters={filters} setFilters={setFilters} companies={companies} rows={rows} onClose={() => setFilterOpen(false)} />}
    {dialog?.type === 'norm' && <NormDialog form={form} setForm={setForm} companies={companies} onClose={() => setDialog(null)} onSubmit={saveDialog} />}
    {dialog?.type === 'check' && <NormCheckDialog form={form} setForm={setForm} onClose={() => setDialog(null)} onSubmit={saveDialog} />}
  </div>;
}

const NORM_COLUMNS = [
  ['number', 'Nummer'],
  ['area', 'Bereich'],
  ['name', 'Norm / Regelwerk'],
  ['normNumber', 'Normnummer'],
  ['purpose', 'Zweck / Beschreibung'],
  ['version', 'Ausgabe / Version'],
  ['issueDate', 'Ausgabedatum'],
  ['lastCheck', 'letzte Prüfung'],
  ['nextCheck', 'nächste Prüfung'],
  ['owner', 'zuständige Person'],
  ['status', 'Status'],
  ['documents', 'Dokument'],
  ['link', 'Link'],
  ['provider', 'Anbieter'],
  ['notes', 'Bemerkungen'],
  ['actions', 'Aktionen'],
];

const NORM_COMPACT_COLUMNS = [
  ['name', 'Norm / Regelwerk'],
  ['area', 'Bereich'],
  ['normNumber', 'Normnummer'],
  ['version', 'Ausgabe / Version'],
  ['nextCheck', 'Nächste Prüfung'],
  ['owner', 'Zuständig'],
  ['status', 'Status'],
  ['documents', 'Dokument'],
  ['actions', 'Aktionen'],
];

function normalizeNormRow(row, index, today) {
  const nextCheck = addMonths(row.lastCheck || '2026-05-12', index % 5 === 0 ? 1 : index % 7 === 0 ? -1 : 12);
  const status = row.status === 'Pruefung faellig' ? 'Prüfung fällig' : row.status || (new Date(nextCheck) < today ? 'Prüfung fällig' : 'Aktuell');
  return {
    id: row.id || `norm-${index + 1}`,
    number: row.nr || index + 1,
    area: decodeText(row.bereich || 'Allgemein'),
    name: decodeText(row.norm || ''),
    normNumber: extractNormNumber(decodeText(row.norm || '')),
    version: row.version || '2026-01',
    issueDate: versionToDate(row.version),
    purpose: decodeText(row.zweck || ''),
    provider: decodeText(row.provider || 'DIN Media'),
    companies: inferCompanies(row, index),
    scope: 'Unternehmen',
    validFrom: versionToDate(row.version),
    lastCheck: row.lastCheck || '2026-05-12',
    nextCheck,
    interval: 'jährlich',
    owner: ownerForIndex(index),
    status,
    documents: row.document ? [{ file: row.document, type: 'Normdokument', version: row.version || '1.0', uploadedAt: row.lastCheck || '2026-05-12', uploadedBy: ownerForIndex(index), validFrom: versionToDate(row.version), status: 'Aktiv' }] : [],
    link: row.link || '',
    notes: decodeText(row.notes || ''),
    checks: [{ checkDate: row.lastCheck || '2026-05-12', checker: ownerForIndex(index), result: 'Keine Änderung', nextCheck, note: 'Routineprüfung' }],
    previousVersions: index % 8 === 0 ? [{ name: decodeText(row.norm || ''), version: '2021-01', status: 'Ersetzt', reason: 'Neue Ausgabe übernommen' }] : [],
    replacedBy: index % 8 === 0 ? `${decodeText(row.norm || '')} · ${row.version || '2026'}` : '',
    replaces: index % 8 === 0 ? `${decodeText(row.norm || '')} · 2021` : '',
    history: ['Angelegt aus FBAG_049', `Letzte Prüfung ${row.lastCheck || '2026-05-12'}`],
  };
}

function enrichNormRow(row, today, companyMap) {
  const daysToCheck = Math.round((new Date(row.nextCheck) - today) / 86400000);
  const autoWarning = row.documents.length === 0 ? 'Dokument fehlt' : row.status === 'Veraltet' ? 'Norm veraltet' : daysToCheck < 0 ? 'Prüfung überfällig' : daysToCheck <= 7 ? 'Prüfung in 7 Tagen fällig' : daysToCheck <= 30 ? 'Prüfung in 30 Tagen fällig' : daysToCheck <= 90 ? 'Prüfung in 90 Tagen fällig' : 'Keine Warnung';
  const companyNames = row.companies.includes('all') ? 'Alle Firmen' : row.companies.map(id => companyMap[id]?.name || id).join(', ');
  return { ...row, daysToCheck, autoWarning, companyNames };
}

function decodeText(text) {
  let value = String(text || '');
  [
    [[0x00c3, 0x0192, 0x00c2, 0x00a4], 'ä'],
    [[0x00c3, 0x0192, 0x00c2, 0x00b6], 'ö'],
    [[0x00c3, 0x0192, 0x00c2, 0x00bc], 'ü'],
    [[0x00c3, 0x0192, 0x00e2, 0x20ac, 0x017e], 'Ä'],
    [[0x00c3, 0x0192, 0x00e2, 0x20ac, 0x201c], 'Ö'],
    [[0x00c3, 0x0192, 0x00c5, 0x201c], 'Ü'],
    [[0x00c3, 0x0192, 0x00c5, 0xb8], 'ß'],
    [[0x00c3, 0x00a4], 'ä'],
    [[0x00c3, 0x00b6], 'ö'],
    [[0x00c3, 0x00bc], 'ü'],
    [[0x00c3, 0x0084], 'Ä'],
    [[0x00c3, 0x0096], 'Ö'],
    [[0x00c3, 0x009c], 'Ü'],
    [[0x00c3, 0x009f], 'ß'],
    [[0x00e2, 0x20ac, 0x201c], '-'],
    [[0x00e2, 0x20ac, 0x017e], '„'],
    [[0x00e2, 0x20ac, 0x0153], '“'],
  ].forEach(([codes, replacement]) => {
    value = value.split(String.fromCharCode(...codes)).join(replacement);
  });
  return value;
}

function extractNormNumber(name) {
  const match = name.match(/(DIN\s?EN\s?ISO\s?[\d-]+|DIN\s?VDE\s?[\d-]+|DVGW\s?[A-Z]{1,3}\s?\d+|DGUV\s?Vorschrift\s?\d+|ISO\s?\d+|RAL|WHG|AwSV)/i);
  return match ? match[0] : name.split(' ').slice(0, 3).join(' ');
}

function versionToDate(version) {
  const match = String(version || '').match(/(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-01` : '2026-01-01';
}

function addMonths(dateStr, months) {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function inferCompanies(row, index) {
  const text = `${row.bereich || ''} ${row.norm || ''} ${row.provider || ''}`.toLowerCase();
  if (text.includes('janning group') || text.includes('handbuch')) return ['all'];
  if (text.includes('bohr') || text.includes('dca')) return ['bohrtechnik'];
  if (text.includes('rohr') || text.includes('dvgw') || text.includes('fernw')) return ['tiefbau', 'rohrbau'];
  if (text.includes('transport') || text.includes('dguv vorschrift 70')) return ['transporte'];
  if (text.includes('umwelt')) return ['tiefbau', 'galabau'];
  return [['tiefbau'], ['bohrtechnik'], ['rohrbau'], ['galabau'], ['transporte']][index % 5];
}

function ownerForIndex(index) {
  return ['Rahim Ahangarzadeh', 'Christian Janning', 'Sabine Janning', 'Annika Tholen', 'Stefan Janning'][index % 5];
}

function compareNormRows(a, b, sortBy) {
  const factor = sortBy.dir === 'desc' ? -1 : 1;
  if (['number', 'daysToCheck'].includes(sortBy.key)) return factor * (Number(a[sortBy.key]) - Number(b[sortBy.key]));
  if (['lastCheck', 'nextCheck', 'issueDate'].includes(sortBy.key)) return factor * (new Date(a[sortBy.key]) - new Date(b[sortBy.key]));
  return factor * String(a[sortBy.key] || '').localeCompare(String(b[sortBy.key] || ''), 'de');
}

function groupNormRows(rows, key) {
  const map = new Map();
  rows.forEach(row => {
    const label = row[key] || 'Ohne Angabe';
    if (!map.has(label)) map.set(label, []);
    map.get(label).push(row);
  });
  return Array.from(map.entries());
}

function getNormKpis(rows, activeCompany, companyFilter) {
  const scoped = rows.filter(row => (activeCompany === 'all' || row.companies.includes(activeCompany) || row.companies.includes('all')) && (companyFilter === 'all' || row.companies.includes(companyFilter) || row.companies.includes('all')));
  return [
    { label: 'Normen gesamt', value: scoped.length, hint: 'im Filter' },
    { label: 'Aktuell', value: scoped.filter(row => row.status === 'Aktuell').length, status: 'Aktuell', tone: 'success', hint: 'bestätigt' },
    { label: 'Prüfung fällig', value: scoped.filter(row => row.status === 'Prüfung fällig' || row.daysToCheck <= 30).length, status: 'Prüfung fällig', due: '30', tone: 'warning', hint: '30 Tage' },
    { label: 'In Prüfung', value: scoped.filter(row => row.status === 'In Prüfung').length, status: 'In Prüfung', hint: 'laufend' },
    { label: 'Veraltet', value: scoped.filter(row => row.status === 'Veraltet').length, status: 'Veraltet', tone: 'danger', hint: 'Handlung' },
    { label: 'Ersetzt', value: scoped.filter(row => row.status === 'Ersetzt').length, status: 'Ersetzt', hint: 'Historie' },
    { label: 'Dokument fehlt', value: scoped.filter(row => row.documents.length === 0).length, docs: 'missing', tone: 'danger', hint: 'nachreichen' },
    { label: 'Archiviert', value: scoped.filter(row => row.status === 'Archiviert').length, status: 'Archiviert', hint: 'Ablage' },
  ];
}

function getNormTabs(rows, activeCompany, companyFilter) {
  const scoped = rows.filter(row => (activeCompany === 'all' || row.companies.includes(activeCompany) || row.companies.includes('all')) && (companyFilter === 'all' || row.companies.includes(companyFilter) || row.companies.includes('all')));
  const countStatus = status => scoped.filter(row => row.status === status).length;
  return [
    { key: 'all', label: 'Alle', count: scoped.length },
    { key: 'Aktuell', label: 'Aktuell', count: countStatus('Aktuell') },
    { key: 'Prüfung fällig', label: 'Prüfung fällig', count: scoped.filter(row => row.status === 'Prüfung fällig' || row.daysToCheck <= 30).length },
    { key: 'In Prüfung', label: 'In Prüfung', count: countStatus('In Prüfung') },
    { key: 'Veraltet', label: 'Veraltet', count: countStatus('Veraltet') },
    { key: 'Ersetzt', label: 'Ersetzt', count: countStatus('Ersetzt') },
    { key: 'missingDocs', label: 'Dokument fehlt', count: scoped.filter(row => row.documents.length === 0).length },
    { key: 'Archiviert', label: 'Archiviert', count: countStatus('Archiviert') },
  ];
}

function nextVersionLabel(version) {
  const match = String(version || '').match(/(\d{4})-(\d{2})/);
  if (!match) return '2026-01';
  return `${Number(match[1]) + 1}-${match[2]}`;
}

function NormCard({ row, menuOpen, onMenu, onOpen, onEdit, onCheck, onVersion }) {
  return <article className={`norm-card norm-status-${statusClass(row.status)}`} onClick={onOpen}>
    <button className="dots-btn" type="button" onClick={(event) => { event.stopPropagation(); onMenu(); }}>⋮</button>
    {menuOpen && <NormContextMenu />}
    <div className="norm-card-top"><span className={`norm-status-pill norm-status-${statusClass(row.status)}`}>{row.status}</span><small>{row.area}</small></div>
    <h3>{row.name}</h3>
    <p>{row.purpose}</p>
    <div className="norm-card-meta">
      <span><b>Normnummer</b>{row.normNumber}</span>
      <span><b>Version</b>{row.version}</span>
      <span><b>Nächste Prüfung</b>{window.fmtDE?.(row.nextCheck) || row.nextCheck}</span>
      <span><b>Zuständig</b>{row.owner}</span>
    </div>
    <div className="norm-warning">{row.autoWarning}</div>
    <div className="norm-card-actions" onClick={event => event.stopPropagation()}>
      <button type="button" onClick={onOpen}><Icon name="eye" size={14} />Details</button>
      <button type="button" onClick={onEdit}><Icon name="edit" size={14} />Bearbeiten</button>
      <button type="button" onClick={onCheck}><Icon name="check" size={14} />Prüfung</button>
      <button type="button" onClick={onVersion}><Icon name="history" size={14} />Neue Version</button>
    </div>
  </article>;
}

function NormTable({ groups, columns, selectedIds, toggleSelected, toggleAll, onOpen, onEdit, onCheck, onVersion, columnMenu, setColumnMenu, sortBy, setSortBy, groupBy, setGroupBy, hiddenCols, setHiddenCols }) {
  const flat = groups.flatMap(([, items]) => items);
  const visibleColumns = columns.filter(([key]) => !hiddenCols.includes(key));
  const renderCell = (row, key) => {
    if (key === 'name') return <><strong>{row.name}</strong><small>{row.companyNames}</small></>;
    if (key === 'nextCheck') return <><strong>{window.fmtDE?.(row.nextCheck) || row.nextCheck}</strong><small>{row.daysToCheck < 0 ? Math.abs(row.daysToCheck) + ' Tage überfällig' : 'in ' + row.daysToCheck + ' Tagen'}</small></>;
    if (key === 'status') return <span className={'norm-status-pill norm-status-' + statusClass(row.status)}>{row.status}</span>;
    if (key === 'documents') return row.documents.length ? row.documents.length + ' Datei(en)' : <span className="tone-danger">fehlt</span>;
    if (key === 'actions') return <div className="norm-row-actions"><button onClick={() => onEdit('edit', row)}><Icon name="edit" size={14} /></button><button onClick={() => onCheck(row)}><Icon name="check" size={14} /></button><button onClick={() => onVersion(row)}><Icon name="history" size={14} /></button></div>;
    return row[key] || '-';
  };

  return <div className="norm-table-shell">
    <div className="norm-table-wrap">
      <table className="admin-table norm-admin-table norm-admin-table--compact">
        <thead><tr>
          <th className="norm-sticky-select"><input type="checkbox" checked={flat.length > 0 && flat.every(row => selectedIds.includes(row.id))} onChange={toggleAll} /></th>
          {visibleColumns.map(([key, label]) => <th key={key} className={(key === 'name' ? 'norm-sticky-name ' : '') + (key === 'actions' ? 'norm-sticky-actions ' : '')}>
            <button type="button" className="column-head-btn" onClick={() => key !== 'actions' && setColumnMenu(columnMenu === key ? null : key)}>{label}{key !== 'actions' && <span>{sortBy.key === key ? (sortBy.dir === 'asc' ? '↑' : '↓') : '⌄'}</span>}</button>
            {columnMenu === key && key !== 'actions' && <NormColumnMenu colKey={key} label={label} setSortBy={setSortBy} groupBy={groupBy} setGroupBy={setGroupBy} hiddenCols={hiddenCols} setHiddenCols={setHiddenCols} />}
          </th>)}
        </tr></thead>
        {groups.map(([label, items]) => <tbody key={label}>
          {groups.length > 1 && <tr className="group-row"><td colSpan={visibleColumns.length + 1}>{label} · {items.length}</td></tr>}
          {items.map(row => <tr key={row.id} className={row.status === 'Veraltet' || row.daysToCheck < 0 ? 'is-danger-row' : ''} onClick={() => onOpen(row.id)}>
            <td className="norm-sticky-select" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
            {visibleColumns.map(([key]) => <td key={key} className={(key === 'name' ? 'norm-name-cell norm-sticky-name ' : '') + (key === 'nextCheck' ? 'norm-date-cell ' : '') + (key === 'actions' ? 'norm-sticky-actions ' : '')} onClick={key === 'actions' ? event => event.stopPropagation() : undefined}>{renderCell(row, key)}</td>)}
          </tr>)}
        </tbody>)}
      </table>
    </div>
  </div>;
}
function NormColumnMenu({ colKey, label, setSortBy, groupBy, setGroupBy, hiddenCols, setHiddenCols }) {
  const hidden = hiddenCols.includes(colKey);
  return <div className="column-menu">
    <button type="button" onClick={() => setSortBy({ key: colKey, dir: 'asc' })}>A bis Z</button>
    <button type="button" onClick={() => setSortBy({ key: colKey, dir: 'desc' })}>Z bis A</button>
    <button type="button">Filtern nach</button>
    <button type="button" onClick={() => setGroupBy(groupBy === colKey ? '' : colKey)}>Gruppieren nach "{label}"</button>
    <button type="button" onClick={() => setHiddenCols(hidden ? hiddenCols.filter(item => item !== colKey) : [...hiddenCols, colKey])}>{hidden ? 'Spalte einblenden' : 'Spalte ausblenden'}</button>
    <button type="button">Spalten verwalten</button>
    <button type="button" onClick={() => setHiddenCols([])}>Standardansicht wiederherstellen</button>
  </div>;
}

function NormContextMenu() {
  return <div className="cert-context-menu">{['Details anzeigen', 'Bearbeiten', 'Dokument öffnen', 'Dokument ersetzen', 'neue Version anlegen', 'Prüfung durchführen', 'als aktuell bestätigen', 'durch neue Norm ersetzen', 'duplizieren', 'archivieren', 'löschen'].map(item => <button key={item} type="button">{item}</button>)}</div>;
}

function statusClass(status) {
  return status === 'Aktuell' ? 'current' : status === 'Prüfung fällig' ? 'due' : status === 'In Prüfung' ? 'review' : status === 'Veraltet' ? 'old' : status === 'Ersetzt' ? 'replaced' : 'archived';
}

function NormFilterDialog({ filters, setFilters, companies, rows, onClose }) {
  const set = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const unique = key => Array.from(new Set(rows.map(row => row[key]).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), 'de'));
  return <div className="cert-modal-backdrop" onMouseDown={onClose}>
    <div className="cert-modal-card norm-filter-card" onMouseDown={event => event.stopPropagation()}>
      <div className="cert-modal-card__head"><div><span className="eyebrow">Normenmatrix</span><h2>Filter</h2></div><button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button></div>
      <div className="form-grid form-grid--three">
        <NormField label="Firma"><select value={filters.company} onChange={event => set('company', event.target.value)}><option value="all">Alle Firmen</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></NormField>
        <NormField label="Status"><select value={filters.status} onChange={event => set('status', event.target.value)}><option value="all">Alle Status</option>{['Aktuell', 'Prüfung fällig', 'In Prüfung', 'Veraltet', 'Ersetzt', 'Archiviert'].map(value => <option key={value}>{value}</option>)}</select></NormField>
        <NormField label="Bereich"><select value={filters.area} onChange={event => set('area', event.target.value)}><option value="all">Alle Bereiche</option>{unique('area').map(value => <option key={value}>{value}</option>)}</select></NormField>
        <NormField label="Zuständige Person"><select value={filters.owner} onChange={event => set('owner', event.target.value)}><option value="all">Alle Personen</option>{unique('owner').map(value => <option key={value}>{value}</option>)}</select></NormField>
        <NormField label="Fälligkeit"><select value={filters.due} onChange={event => set('due', event.target.value)}><option value="all">Alle Fristen</option><option value="90">in 90 Tagen</option><option value="30">in 30 Tagen</option><option value="7">in 7 Tagen</option><option value="overdue">überfällig</option></select></NormField>
        <NormField label="Dokument"><select value={filters.docs} onChange={event => set('docs', event.target.value)}><option value="all">Alle</option><option value="present">Dokument vorhanden</option><option value="missing">Dokument fehlt</option></select></NormField>
      </div>
      <div className="modal-actions"><button className="btn btn--ghost" type="button" onClick={() => setFilters({ company: 'all', status: 'all', area: 'all', owner: 'all', due: 'all', docs: 'all' })}>Zurücksetzen</button><button className="btn btn--primary" type="button" onClick={onClose}>Anwenden</button></div>
    </div>
  </div>;
}

function NormDialog({ form, setForm, companies, onClose, onSubmit }) {
  const [step, setStep] = React.useState(1);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const steps = ['Grunddaten', 'Ausgabe und Version', 'Prüfung', 'Dokumente', 'Zusammenfassung'];
  const isLast = step === steps.length;
  const submit = (event) => {
    event.preventDefault();
    if (!isLast) {
      setStep(current => Math.min(steps.length, current + 1));
      return;
    }
    onSubmit(event);
  };

  return <NormModal title="Norm hinzufügen" eyebrow={'Schritt ' + step + ' von ' + steps.length} onClose={onClose} onSubmit={submit} submitLabel={isLast ? 'Norm hinzufügen' : 'Weiter'} secondaryAction={!isLast ? <button className="btn btn--ghost" type="button" onClick={() => setStep(current => Math.max(1, current - 1))} disabled={step === 1}>Zurück</button> : <button className="btn btn--ghost" type="button">Als Entwurf speichern</button>}>
    <div className="norm-stepper">{steps.map((item, index) => <button key={item} type="button" className={step === index + 1 ? 'is-active' : ''} onClick={() => setStep(index + 1)}>{index + 1}. {item}</button>)}</div>
    {step === 1 && <div className="form-grid form-grid--three">
      <NormField label="Firma"><select value={form.companies} onChange={event => set('companies', event.target.value)}><option value="all">Alle Firmen</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></NormField>
      <NormField label="Bereich"><input value={form.area} onChange={event => set('area', event.target.value)} /></NormField>
      <NormField label="Norm / Regelwerk"><input value={form.name} onChange={event => set('name', event.target.value)} /></NormField>
      <NormField label="Normnummer"><input value={form.normNumber} onChange={event => set('normNumber', event.target.value)} /></NormField>
      <NormField label="Geltungsbereich"><select value={form.scope} onChange={event => set('scope', event.target.value)}>{['Unternehmen', 'Abteilung', 'Tätigkeit', 'Standort', 'Projekt'].map(value => <option key={value}>{value}</option>)}</select></NormField>
      <NormField label="Anbieter / Herausgeber"><input value={form.provider} onChange={event => set('provider', event.target.value)} /></NormField>
      <NormField label="Externer Link"><input value={form.link} onChange={event => set('link', event.target.value)} /></NormField>
      <NormField label="Zweck / Beschreibung"><textarea value={form.purpose} onChange={event => set('purpose', event.target.value)} /></NormField>
    </div>}
    {step === 2 && <div className="form-grid form-grid--three">
      <NormField label="Ausgabe / Version"><input value={form.version} onChange={event => set('version', event.target.value)} /></NormField>
      <NormField label="Ausgabedatum"><input type="date" value={form.issueDate} onChange={event => set('issueDate', event.target.value)} /></NormField>
      <NormField label="Gültig ab"><input type="date" value={form.validFrom} onChange={event => set('validFrom', event.target.value)} /></NormField>
      <NormField label="Aktuelle Version"><select value={form.currentVersion || 'Ja'} onChange={event => set('currentVersion', event.target.value)}><option>Ja</option><option>Nein</option></select></NormField>
      <NormField label="Ersetzt frühere Norm"><select value={form.replacesOld || 'Nein'} onChange={event => set('replacesOld', event.target.value)}><option>Nein</option><option>Ja</option></select></NormField>
      <NormField label="Ersetzte Norm"><input value={form.replacedNorm || ''} onChange={event => set('replacedNorm', event.target.value)} /></NormField>
      <NormField label="Bemerkung"><textarea value={form.notes} onChange={event => set('notes', event.target.value)} /></NormField>
    </div>}
    {step === 3 && <div className="form-grid form-grid--three">
      <NormField label="Letzte Prüfung"><input type="date" value={form.lastCheck} onChange={event => set('lastCheck', event.target.value)} /></NormField>
      <NormField label="Nächste Prüfung"><input type="date" value={form.nextCheck} onChange={event => set('nextCheck', event.target.value)} /></NormField>
      <NormField label="Prüfintervall"><select value={form.interval} onChange={event => set('interval', event.target.value)}>{['halbjährlich', 'jährlich', 'zweijährlich', 'benutzerdefiniert'].map(value => <option key={value}>{value}</option>)}</select></NormField>
      <NormField label="Zuständige Person"><input value={form.owner} onChange={event => set('owner', event.target.value)} /></NormField>
      <NormField label="Vertretung"><input value={form.deputy || ''} onChange={event => set('deputy', event.target.value)} /></NormField>
      <NormField label="Status"><select value={form.status} onChange={event => set('status', event.target.value)}>{['Aktuell', 'Prüfung fällig', 'In Prüfung', 'Veraltet', 'Ersetzt', 'Archiviert'].map(value => <option key={value}>{value}</option>)}</select></NormField>
      <NormField label="Erinnerung aktivieren"><select value={form.reminder || 'Ja'} onChange={event => set('reminder', event.target.value)}><option>Ja</option><option>Nein</option></select></NormField>
    </div>}
    {step === 4 && <div className="form-grid form-grid--three">
      <NormField label="Normdokument"><input value={form.document} onChange={event => set('document', event.target.value)} placeholder="Normdokument.pdf" /></NormField>
      <NormField label="Prüfprotokoll"><input value={form.checkDocument || ''} onChange={event => set('checkDocument', event.target.value)} placeholder="Pruefprotokoll.pdf" /></NormField>
      <NormField label="Freigabedokument"><input value={form.releaseDocument || ''} onChange={event => set('releaseDocument', event.target.value)} /></NormField>
      <NormField label="Weitere Anlagen"><textarea value={form.attachments || ''} onChange={event => set('attachments', event.target.value)} /></NormField>
    </div>}
    {step === 5 && <div className="norm-summary-box">
      <h3>{form.name || 'Neue Norm'}</h3>
      <dl><div><dt>Firma</dt><dd>{form.companies || 'Alle Firmen'}</dd></div><div><dt>Bereich</dt><dd>{form.area || '-'}</dd></div><div><dt>Version</dt><dd>{form.version || '-'}</dd></div><div><dt>Nächste Prüfung</dt><dd>{form.nextCheck || '-'}</dd></div><div><dt>Zuständig</dt><dd>{form.owner || '-'}</dd></div><div><dt>Status</dt><dd>{form.status || '-'}</dd></div></dl>
    </div>}
  </NormModal>;
}
function NormCheckDialog({ form, setForm, onClose, onSubmit }) {
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <NormModal title="Prüfung durchführen" eyebrow="Normenprüfung" onClose={onClose} onSubmit={onSubmit}>
    <div className="form-grid form-grid--three">
      <NormField label="Prüfdatum"><input type="date" value={form.checkDate} onChange={event => set('checkDate', event.target.value)} /></NormField>
      <NormField label="Prüfer"><input value={form.checker} onChange={event => set('checker', event.target.value)} /></NormField>
      <NormField label="Ergebnis"><select value={form.result} onChange={event => set('result', event.target.value)}>{['Keine Änderung', 'Neue Version vorhanden', 'Norm nicht mehr gültig', 'Norm ersetzt', 'Prüfung nicht möglich', 'weitere Klärung erforderlich'].map(value => <option key={value}>{value}</option>)}</select></NormField>
      {['current:Norm weiterhin aktuell', 'newVersion:Neue Ausgabe verfügbar', 'replaced:Norm wurde ersetzt', 'relevant:Änderungen relevant', 'measures:Maßnahmen erforderlich'].map(pair => {
        const [key, label] = pair.split(':');
        return <NormField key={key} label={label}><select value={form[key]} onChange={event => set(key, event.target.value)}><option>Ja</option><option>Nein</option></select></NormField>;
      })}
      <NormField label="Nächste Prüfung"><input type="date" value={form.nextCheck} onChange={event => set('nextCheck', event.target.value)} /></NormField>
      <NormField label="Nachweis hochladen"><input value={form.evidence} onChange={event => set('evidence', event.target.value)} placeholder="Pruefprotokoll.pdf" /></NormField>
      <NormField label="Bemerkung"><textarea value={form.note} onChange={event => set('note', event.target.value)} /></NormField>
    </div>
  </NormModal>;
}

function NormDetailPage({ row, onBack, onEdit, onCheck, onVersion }) {
  return <div className="norm-detail-page">
    <div className="emp-page-title">
      <button className="round-back" type="button" onClick={onBack}><Icon name="chevL" size={18} /></button>
      <h1>{row.name}</h1>
      <div className="page-actions"><button className="btn btn--ghost" onClick={onEdit}><Icon name="edit" size={14} />Bearbeiten</button><button className="btn btn--ghost" onClick={onCheck}><Icon name="check" size={14} />Prüfung durchführen</button><button className="btn btn--primary" onClick={onVersion}><Icon name="history" size={14} />Neue Version</button></div>
    </div>
    <section className="norm-detail-hero"><div><span className={`norm-status-pill norm-status-${statusClass(row.status)}`}>{row.status}</span><h2>{row.normNumber}</h2><p>{row.purpose}</p></div><div><strong>{row.autoWarning}</strong><span>Nächste Prüfung: {window.fmtDE?.(row.nextCheck) || row.nextCheck}</span></div></section>
    <div className="cert-detail-grid">
      <NormInfoCard title="Stammdaten" rows={[['Bereich', row.area], ['Norm / Regelwerk', row.name], ['Normnummer', row.normNumber], ['Ausgabe / Version', row.version], ['Ausgabedatum', window.fmtDE?.(row.issueDate) || row.issueDate], ['Geltungsbereich', row.scope], ['Firmen', row.companyNames]]} />
      <NormInfoCard title="Prüfungen" rows={[['Letzte Prüfung', window.fmtDE?.(row.lastCheck) || row.lastCheck], ['Nächste Prüfung', window.fmtDE?.(row.nextCheck) || row.nextCheck], ['Prüfintervall', row.interval], ['Zuständig', row.owner], ...row.checks.map((check, index) => [`Prüfung ${index + 1}`, `${check.result} · ${check.checker}`])]} />
      <NormInfoCard title="Dokumente" rows={row.documents.length ? row.documents.map(doc => [doc.type, `${doc.file} · ${doc.version} · ${doc.status}`]) : [['Dokument', 'fehlt']]} />
      <NormInfoCard title="Anbieter und Links" rows={[['Anbieter / Herausgeber', row.provider], ['Externer Link', row.link || '-']]} />
      <NormInfoCard title="Versionen" rows={[['Aktuelle Version', row.version], ['Ersetzende Norm', row.replacedBy || '-'], ['Ersetzte Normen', row.replaces || '-'], ...row.previousVersions.map(version => [version.version, `${version.status} · ${version.reason}`])]} />
      <NormInfoCard title="Historie" rows={row.history.map((entry, index) => [`Eintrag ${index + 1}`, entry])} />
      <NormInfoCard title="Bemerkungen" rows={[['Notiz', row.notes || '-']]} />
    </div>
  </div>;
}

function NormInfoCard({ title, rows }) {
  return <section className="info-card"><h2>{title}</h2>{rows.map(([label, value]) => <div key={`${title}-${label}`} className="info-row"><span>{label}</span><strong>{value}</strong></div>)}</section>;
}

function NormField({ label, children }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

function NormModal({ title, eyebrow, children, onClose, onSubmit, submitLabel = 'Speichern', secondaryAction = null }) {
  return <div className="cert-modal-backdrop" onMouseDown={onClose}>
    <form className="cert-modal-card cert-modal-card--wide" onMouseDown={event => event.stopPropagation()} onSubmit={onSubmit}>
      <div className="cert-modal-card__head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-btn" type="button" onClick={onClose}><Icon name="x" size={18} /></button></div>
      {children}
      <div className="modal-actions">{secondaryAction}<button className="btn btn--ghost" type="button" onClick={onClose}>Abbrechen</button><button className="btn btn--primary" type="submit">{submitLabel}</button></div>
    </form>
  </div>;
}

Object.assign(window, { NormenmatrixView });
