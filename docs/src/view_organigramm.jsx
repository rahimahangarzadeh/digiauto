/* Organigramm document management - frontend only */

function OrganigrammView({ activeCompany = 'all', extraAction = null, onOpenDoc = null }) {
  const seedDocs = [
    { id:'org-1', companyId:'tiefbau', name:'Organigramm Janning Tiefbau', company:'Janning Tiefbau GmbH', scope:'Tiefbau, Baustellenleitung, Poliere und Kolonnen', documentNo:'ORG-TIEF-001', version:'1.4', createdAt:'27.03.2026', validFrom:'01.04.2026', createdBy:'Rahim Ahangarzadeh', checkedBy:'Christian Janning', approvedBy:'Michael Janning', status:'Freigegeben', description:'Freigegebenes Organigramm fuer Tiefbau und Baustellenorganisation.', file:'Organigramm_Tiefbau_v1.4.pdf', reason:'Anpassung Bauleitung und Poliere', note:'Aktuelle Version fuer SCC-Audit.', changed:'05.06.2026 - Rahim Ahangarzadeh' },
    { id:'org-2', companyId:'bohrtechnik', name:'Organigramm Janning Bohrtechnik', company:'Janning Bohrtechnik GmbH', scope:'Horizontalbohrungen, Fachaufsicht, Bauleitung und Spezialtechnik', documentNo:'ORG-BOHR-002', version:'1.2', createdAt:'15.03.2026', validFrom:'20.03.2026', createdBy:'Sabine Janning', checkedBy:'Andreas Janning', approvedBy:'-', status:'In Prüfung', description:'Organigramm fuer Bohrtechnik und Spezialtechnik.', file:'Organigramm_Bohrtechnik_v1.2.pdf', reason:'Neue Fachaufsicht ergaenzt', note:'Zur Pruefung eingereicht.', changed:'02.06.2026 - Sabine Janning' },
    { id:'org-3', companyId:'rohrbau', name:'Organigramm Janning Rohrbau', company:'Janning Rohrbau GmbH', scope:'Rohrbau, DVGW, Versorgung, Bauleitung und Montage', documentNo:'ORG-ROHR-003', version:'1.1', createdAt:'02.04.2026', validFrom:'10.04.2026', createdBy:'Michael Janning', checkedBy:'Stefan Janning', approvedBy:'-', status:'Entwurf', description:'Entwurf fuer Rohrbau und Montagebereiche.', file:'Organigramm_Rohrbau_v1.1.pdf', reason:'Erster Entwurf nach Strukturupdate', note:'Freigabe offen.', changed:'01.06.2026 - Michael Janning' },
    { id:'org-4', companyId:'galabau', name:'Organigramm Janning Galabau', company:'Janning Galabau GmbH', scope:'Galabau, Pflege, Kolonnen und Verwaltung', documentNo:'ORG-GALA-004', version:'1.0', createdAt:'18.04.2026', validFrom:'01.05.2026', createdBy:'Annika Tholen', checkedBy:'Thomas Janning', approvedBy:'Thomas Janning', status:'Freigegeben', description:'Organigramm fuer Garten- und Landschaftsbau.', file:'Organigramm_Galabau_v1.0.pdf', reason:'Neuanlage', note:'Portalversion freigegeben.', changed:'30.05.2026 - Annika Tholen' },
  ];
  const [docs, setDocs] = React.useState(seedDocs);
  const [viewMode, setViewMode] = React.useState('cards');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [previewDoc, setPreviewDoc] = React.useState(null);
  const [detailDoc, setDetailDoc] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(null);
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [sort, setSort] = React.useState({ key:'name', dir:'asc' });
  const [hiddenColumns, setHiddenColumns] = React.useState([]);

  const columns = [
    ['name', 'Name des Organigramms'],
    ['company', 'Firmenname'],
    ['scope', 'Geltungsbereich'],
    ['documentNo', 'Dokumentennummer'],
    ['version', 'Versionsnummer'],
    ['createdAt', 'Erstellungsdatum'],
    ['validFrom', 'Gültig ab'],
    ['createdBy', 'Ersteller'],
    ['checkedBy', 'Prüfer'],
    ['approvedBy', 'Freigeber'],
    ['status', 'Status'],
    ['file', 'PDF-Vorschau'],
  ];
  const statusOptions = ['Entwurf', 'In Prüfung', 'Freigegeben', 'Ungültig', 'Archiviert'];
  const statusClass = status => ({
    'Entwurf':'is-draft',
    'In Prüfung':'is-review',
    'Freigegeben':'is-approved',
    'Ungültig':'is-invalid',
    'Archiviert':'is-archived',
  }[status] || 'is-draft');
  const scopedDocs = docs.filter(doc => activeCompany === 'all' || doc.companyId === activeCompany);
  const enrich = doc => ({ ...doc });
  const columnLabel = key => columns.find(([columnKey]) => columnKey === key)?.[1] || key;
  const columnValue = (doc, key) => String(enrich(doc)[key] || '');
  const filteredDocs = [...scopedDocs.filter(doc => Object.entries(columnFilters).every(([key, values]) => !values?.length || values.includes(columnValue(doc, key))))].sort((a, b) => columnValue(a, sort.key).localeCompare(columnValue(b, sort.key), 'de', { numeric:true }) * (sort.dir === 'asc' ? 1 : -1));
  const groupedDocs = groupBy ? Object.entries(filteredDocs.reduce((groups, doc) => {
    const value = columnValue(doc, groupBy) || '-';
    groups[value] = groups[value] || [];
    groups[value].push(doc);
    return groups;
  }, {})) : [];
  const visibleColumns = columns.filter(([key]) => !hiddenColumns.includes(key));
  const selectedDocs = filteredDocs.filter(doc => selectedIds.includes(doc.id));
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(doc => selectedIds.includes(doc.id));
  const filterValues = filterPanel ? Array.from(new Set(scopedDocs.map(doc => columnValue(doc, filterPanel)))).filter(Boolean).sort((a, b) => a.localeCompare(b, 'de', { numeric:true })) : [];
  const visibleFilterValues = filterValues.filter(value => value.toLowerCase().includes(filterSearch.toLowerCase()));
  const history = doc => [
    { old:'1.2', next:doc.version, date:doc.changed.split(' - ')[0], reason:doc.reason, user:doc.changed.split(' - ')[1] || doc.createdBy, status:doc.status },
    { old:'1.0', next:'1.1', date:'15.04.2026', reason:'Initiale Dokumentenpruefung', user:doc.checkedBy, status:'In Prüfung' },
  ];
  const toggleSelected = id => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds(current => allSelected ? current.filter(id => !filteredDocs.some(doc => doc.id === id)) : Array.from(new Set([...current, ...filteredDocs.map(doc => doc.id)])));
  const toggleFilter = (key, value) => setColumnFilters(current => {
    const values = current[key] || [];
    return { ...current, [key]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
  });
  const deleteDoc = doc => {
    if (window.confirm('Möchten Sie dieses Organigramm wirklich löschen?')) {
      setDocs(current => current.filter(item => item.id !== doc.id));
      setSelectedIds(current => current.filter(id => id !== doc.id));
    }
  };
  const updateStatus = (doc, status) => setDocs(current => current.map(item => item.id === doc.id ? { ...item, status, changed:'13.07.2026 - Rahim Ahangarzadeh' } : item));
  const duplicateDoc = doc => setDocs(current => [{ ...doc, id:'org-' + Date.now(), name:doc.name + ' Kopie', status:'Entwurf', version:'1.0', changed:'13.07.2026 - Rahim Ahangarzadeh' }, ...current]);
  const createVersion = doc => setDocs(current => current.map(item => item.id === doc.id ? { ...item, version:String((Number(item.version) + 0.1).toFixed(1)), status:'Entwurf', reason:'Neue Version erstellt', changed:'13.07.2026 - Rahim Ahangarzadeh' } : item));
  const rowAction = (doc, action) => {
    setMenuOpen(null);
    if (action === 'Öffnen') { onOpenDoc ? onOpenDoc(doc) : setDetailDoc(doc); return; }
    if (action === 'Vorschau anzeigen') { setPreviewDoc(doc); return; }
    if (action === 'Bearbeiten') { setDetailDoc(doc); return; }
    if (action === 'neue Version erstellen') { createVersion(doc); return; }
    if (action === 'Duplizieren') { duplicateDoc(doc); return; }
    if (action === 'zur Prüfung senden') { updateStatus(doc, 'In Prüfung'); return; }
    if (action === 'Freigeben') { updateStatus(doc, 'Freigegeben'); return; }
    if (action === 'Freigabe zurückziehen') { updateStatus(doc, 'Entwurf'); return; }
    if (action === 'Archivieren') { updateStatus(doc, 'Archiviert'); return; }
    if (action === 'Löschen') deleteDoc(doc);
  };
  const renderMenu = doc => <div className="org-doc-menu">
    <button onClick={event => { event.stopPropagation(); setMenuOpen(menuOpen === doc.id ? null : doc.id); }}>⋮</button>
    {menuOpen === doc.id && <div>{['Öffnen', 'Vorschau anzeigen', 'Bearbeiten', 'neue Version erstellen', 'Duplizieren', 'zur Prüfung senden', 'Freigeben', 'Freigabe zurückziehen', 'PDF exportieren', 'Archivieren', 'Löschen'].map(action => <button key={action} onClick={event => { event.stopPropagation(); rowAction(doc, action); }}>{action}</button>)}</div>}
  </div>;
  const renderColumnMenu = key => columnMenu === key && <div className="org-doc-column-menu" onClick={event => event.stopPropagation()}>
    <button onClick={() => { setSort({ key, dir:'asc' }); setColumnMenu(null); }}>A bis Z</button>
    <button onClick={() => { setSort({ key, dir:'desc' }); setColumnMenu(null); }}>Z bis A</button>
    <button onClick={() => { setFilterPanel(key); setFilterSearch(''); setColumnMenu(null); }}>Filtern nach</button>
    <button onClick={() => { setGroupBy(key); setColumnMenu(null); }}>Gruppieren nach "{columnLabel(key)}"</button>
    <button onClick={() => { setHiddenColumns(current => current.includes(key) ? current : [...current, key]); setColumnMenu(null); }}>Spalte ausblenden</button>
  </div>;
  const renderRows = list => list.map(doc => <tr key={doc.id} className={selectedIds.includes(doc.id) ? 'is-selected' : ''}>
    <td><input type="checkbox" checked={selectedIds.includes(doc.id)} onChange={() => toggleSelected(doc.id)} /></td>
    {visibleColumns.map(([key]) => <td key={key} onClick={() => key === 'name' && setDetailDoc(doc)}>
      {key === 'status' ? <span className={'org-doc-status ' + statusClass(doc.status)}>{doc.status}</span> : key === 'file' ? <button className="job-small-btn" onClick={event => { event.stopPropagation(); setPreviewDoc(doc); }}>Vorschau</button> : columnValue(doc, key)}
    </td>)}
    <td>{renderMenu(doc)}</td>
  </tr>);

  if (detailDoc) return <OrganigrammDetail doc={detailDoc} onBack={() => setDetailDoc(null)} history={history(detailDoc)} statusClass={statusClass} />;

  return <div className="org-doc-page">
    <header className="org-doc-head">
      <div><h1>Organigramm</h1><p>Dokumentenverwaltung für Organigramme, Versionen, Prüfung und Freigabe.</p></div>
      <div className="org-doc-actions">
        {extraAction}
        <div className="org-mode"><button className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}><Icon name="dashboard" size={14} />Kacheln</button><button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><Icon name="matrix" size={14} />Liste</button></div>
        <button className="btn btn--ghost"><Icon name="download" size={14} />PDF exportieren</button>
        <button className="btn btn--primary" onClick={() => setDialog('create')}><Icon name="plus" size={14} />Organigramm</button>
      </div>
    </header>

    <section className="org-doc-kpis">
      <button><span>Organigramme</span><strong>{scopedDocs.length}</strong></button>
      <button><span>Freigegeben</span><strong>{scopedDocs.filter(doc => doc.status === 'Freigegeben').length}</strong></button>
      <button><span>In Prüfung</span><strong>{scopedDocs.filter(doc => doc.status === 'In Prüfung').length}</strong></button>
      <button><span>Entwurf</span><strong>{scopedDocs.filter(doc => doc.status === 'Entwurf').length}</strong></button>
    </section>

    {selectedIds.length > 0 && <div className="org-doc-bulk"><strong>{selectedDocs.length} ausgewählt</strong><button>PDF exportieren</button><button>zur Prüfung senden</button><button>Freigeben</button><button>Status ändern</button><button>Archivieren</button><button>Löschen</button><button onClick={() => setSelectedIds([])}><Icon name="x" size={13} /></button></div>}

    {viewMode === 'cards' ? <section className="org-doc-grid">
      {filteredDocs.map(doc => <article key={doc.id} className="org-doc-card" onClick={() => setDetailDoc(doc)}>
        <header><div><h3>{doc.name}</h3><p>{doc.company}</p></div><span className={'org-doc-status ' + statusClass(doc.status)}>{doc.status}</span>{renderMenu(doc)}</header>
        <dl><div><dt>Geltungsbereich</dt><dd>{doc.scope}</dd></div><div><dt>Dokument</dt><dd>{doc.documentNo} · Version {doc.version}</dd></div><div><dt>Gültig ab</dt><dd>{doc.validFrom}</dd></div></dl>
        <p>{doc.description}</p>
        <footer><span>{doc.file}</span><button onClick={event => { event.stopPropagation(); setPreviewDoc(doc); }}>Vorschau</button></footer>
      </article>)}
    </section> : <section className="org-doc-table-wrap">
      <table className="org-doc-table"><thead><tr><th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>{visibleColumns.map(([key, label]) => <th key={key}><div><button onClick={() => setColumnMenu(columnMenu === key ? null : key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button>{renderColumnMenu(key)}</div></th>)}<th>Aktionen</th></tr></thead><tbody>{groupBy ? groupedDocs.flatMap(([group, items]) => [<tr key={'g-' + group} className="org-doc-group"><td colSpan={visibleColumns.length + 2}>{columnLabel(groupBy)}: {group}<span>{items.length}</span></td></tr>, ...renderRows(items)]) : renderRows(filteredDocs)}</tbody></table>
    </section>}

    {filterPanel && <div className="fach-filter-backdrop" onClick={() => setFilterPanel(null)}><section className="fach-filter-panel" onClick={event => event.stopPropagation()}><header><strong>{columnLabel(filterPanel)} filtern</strong><button onClick={() => setFilterPanel(null)}><Icon name="x" size={14} /></button></header><label><Icon name="filter" size={14} /><input autoFocus value={filterSearch} onChange={event => setFilterSearch(event.target.value)} placeholder="Filtern..." /></label><div>{visibleFilterValues.map(value => <label key={value}><input type="checkbox" checked={(columnFilters[filterPanel] || []).includes(value)} onChange={() => toggleFilter(filterPanel, value)} /><span>{value}</span></label>)}</div><footer><button className="btn btn--ghost" onClick={() => setColumnFilters(current => ({ ...current, [filterPanel]:[] }))}>Zurücksetzen</button><button className="btn btn--primary" onClick={() => setFilterPanel(null)}>Anwenden</button></footer></section></div>}
    {previewDoc && <OrganigrammPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    {dialog === 'create' && <OrganigrammDialog onClose={() => setDialog(null)} companies={window.SEED.companies} statusOptions={statusOptions} />}
  </div>;
}

function OrganigrammDialog({ onClose, companies, statusOptions }) {
  const fields = ['Name des Organigramms', 'Geltungsbereich', 'Dokumentennummer', 'Versionsnummer', 'Erstellungsdatum', 'gültig ab', 'Ersteller', 'Prüfer', 'Freigeber', 'Beschreibung', 'Änderungsgrund', 'Bemerkung'];
  return <div className="fach-dialog-backdrop" onClick={onClose}><section className="fach-dialog org-doc-dialog" onClick={event => event.stopPropagation()}>
    <header><div><span>Neues Organigramm</span><h2>Organigramm erstellen</h2><p>Dokument als PDF oder Datei hinterlegen und Freigabeprozess starten.</p></div><button onClick={onClose}><Icon name="x" size={18} /></button></header>
    <div className="fach-dialog-grid">
      <label><span>Firma</span><select>{companies.map(company => <option key={company.id}>{company.name}</option>)}</select></label>
      <label><span>Status</span><select>{statusOptions.map(status => <option key={status}>{status}</option>)}</select></label>
      {fields.map(field => <label key={field} className={['Beschreibung', 'Änderungsgrund', 'Bemerkung'].includes(field) ? 'is-wide' : ''}><span>{field}</span>{['Beschreibung', 'Änderungsgrund', 'Bemerkung'].includes(field) ? <textarea /> : <input />}</label>)}
      <div className="org-doc-upload is-wide"><span>Organigramm-Datei oder PDF hochladen</span><label><Icon name="upload" size={16} /><strong>Datei hochladen</strong><input type="file" /></label></div>
    </div>
    <footer><button className="btn btn--ghost" onClick={onClose}>Abbrechen</button><button className="btn btn--primary">Speichern</button></footer>
  </section></div>;
}

function OrganigrammDetail({ doc, onBack, history, statusClass }) {
  return <div className="org-doc-detail">
    <header className="emp-page-title"><div><button className="emp-round-back" onClick={onBack}><Icon name="chevL" size={18} /></button><h1>{doc.name}</h1></div><div><button className="btn btn--ghost"><Icon name="download" size={14} />Aktuelle Version exportieren</button><button className="btn btn--primary">Neue Version erstellen</button></div></header>
    <section className="org-doc-detail-hero"><div><span className={'org-doc-status ' + statusClass(doc.status)}>{doc.status}</span><h2>{doc.company}</h2><p>{doc.scope}</p></div><dl><div><dt>Dokument</dt><dd>{doc.documentNo}</dd></div><div><dt>Version</dt><dd>{doc.version}</dd></div><div><dt>Gültig ab</dt><dd>{doc.validFrom}</dd></div></dl></section>
    <section className="org-doc-detail-grid">
      <div><h3>Stammdaten</h3><p>{doc.description}</p><p><strong>Erstellt:</strong> {doc.createdAt} von {doc.createdBy}</p><p><strong>Geändert:</strong> {doc.changed}</p></div>
      <div><h3>Prüfung und Freigabe</h3><p><strong>Prüfer:</strong> {doc.checkedBy}</p><p><strong>Freigeber:</strong> {doc.approvedBy}</p><p><strong>Status:</strong> {doc.status}</p></div>
      <div><h3>Dokument</h3><button className="btn btn--ghost"><Icon name="doc" size={14} />{doc.file}</button><p>{doc.note}</p></div>
      <div><h3>Versionshistorie</h3><table>{history.map(item => <tr key={item.date + item.next}><td>{item.old} → {item.next}</td><td>{item.date}</td><td>{item.reason}</td><td>{item.user}</td><td>{item.status}</td></tr>)}</table></div>
    </section>
  </div>;
}

function OrganigrammPreview({ doc, onClose }) {
  return <div className="org-doc-preview-backdrop" onClick={onClose}><section className="org-doc-preview" onClick={event => event.stopPropagation()}>
    <header><strong>{doc.name}</strong><button onClick={onClose}><Icon name="x" size={16} /></button></header>
    <div><article><span>{doc.documentNo} · Version {doc.version}</span><h2>{doc.company}</h2><p>{doc.scope}</p><div>PDF-Vorschau Organigramm</div></article></div>
    <footer><button className="btn btn--ghost" onClick={onClose}>Schließen</button><button className="btn btn--primary"><Icon name="download" size={14} />PDF exportieren</button></footer>
  </section></div>;
}

Object.assign(window, { OrganigrammView });
