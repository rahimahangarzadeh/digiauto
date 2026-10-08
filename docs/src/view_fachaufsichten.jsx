function FachaufsichtenView({ activeCompany = 'all', title = 'Fachaufsichten', subtitle = 'Verantwortlichkeiten, Qualifikationen, Gültigkeiten und Dokumente je Fachaufsicht.', onBack = null, extraAction = null }) {
  const seedRows = [
    { id:'fw-1', company:'tiefbau', name:'Stahlschweißaufsicht', description:'Überwachung und Kontrolle von Schweißarbeiten im Stahlbau', status:'Aktiv', main:'Thorsten Schmitz', deputy:'Alexander Bartel', people:[{ name:'Thorsten Schmitz', role:'Hauptverantwortlicher', certs:['FW601','FW446','GW 301'] }], qualifications:['Schweißaufsicht', 'GW 301'], evidence:['FW601', 'GW 301'], validFrom:'2026-01-01', validUntil:'2027-04-30', documents:['Fachaufsicht_Stahlschweissaufsicht.pdf'], changed:'05.06.2026 - Sabine Janning', note:'Prüfung jährlich einplanen.' },
    { id:'fw-2', company:'tiefbau', name:'Fachaufsicht Fernwärme & GW', description:'Fachaufsicht für Fernwärme- und Sachkundige-Arbeiten', status:'Nachweis läuft ab', main:'Christian Janning', deputy:'Daniel Bert', people:[{ name:'Christian Janning', role:'Hauptverantwortlicher', certs:['GW 301','FW601'] }], qualifications:['GW 301','FW601'], evidence:['GW 301 Zertifikat'], validFrom:'2025-05-01', validUntil:'2026-08-15', documents:['Fachaufsicht_Fernwaerme_GW.pdf'], changed:'04.06.2026 - Sabine Janning', note:'Nachweis läuft bald ab.' },
    { id:'fw-3', company:'rohrbau', name:'Kunststoffschweißaufsicht', description:'Überwachung von Kunststoffschweißarbeiten und PE-HD Verbindungen', status:'Aktiv', main:'Christian Janning', deputy:'Stefan Janning', people:[{ name:'Christian Janning', role:'Hauptverantwortlicher', certs:['GW 301','GW 331 (M)','FW601'] }], qualifications:['GW 331 (M)','PE-HD'], evidence:['PE-Schweißen'], validFrom:'2026-02-01', validUntil:'2028-02-01', documents:['Fachaufsicht_Kunststoff.pdf'], changed:'03.06.2026 - Christian Janning', note:'' },
    { id:'fw-4', company:'rohrbau', name:'Beauftragter nach WHG/AwSV', description:'Wasserhaushalts- und Abwasserbestimmungen', status:'Prüfung erforderlich', main:'Christian Janning', deputy:'Bastian Bothe', people:[{ name:'Christian Janning', role:'Hauptverantwortlicher', certs:['WHG','AwSV'] }], qualifications:['WHG','AwSV'], evidence:['AwSV Nachweis'], validFrom:'2024-04-01', validUntil:'2026-07-20', documents:['Fachaufsicht_WHG_AwSV.pdf'], changed:'31.05.2026 - Sabine Janning', note:'Dokument fachlich prüfen.' },
    { id:'fw-5', company:'bohrtechnik', name:'Asbest-Sachkundige', description:'Sachkundige für Asbest-Arbeiten und -entsorgung', status:'Aktiv', main:'Thorsten Isensee', deputy:'Stefan Boguta', people:[{ name:'Thorsten Isensee', role:'Hauptverantwortlicher', certs:['Asbest I','Asbest II'] }, { name:'Stefan Boguta', role:'Stellvertretung', certs:['Asbest I','Asbest II'] }, { name:'Hichem Aoune', role:'Weitere Fachaufsicht', certs:['Asbest I'] }], qualifications:['Asbest I','Asbest II'], evidence:['Sachkundenachweis'], validFrom:'2025-06-01', validUntil:'2027-06-01', documents:['Fachaufsicht_Asbest.pdf'], changed:'29.05.2026 - Andreas Janning', note:'' },
    { id:'fw-6', company:'galabau', name:'AutoCAD Spezialisten', description:'Konstruktion und technische Zeichnungen', status:'In Vorbereitung', main:'Daniel Fehren', deputy:'Annika Tholen', people:[{ name:'Daniel Fehren', role:'Hauptverantwortlicher', certs:['AutoCAD 2024','BIM'] }], qualifications:['AutoCAD 2024','BIM'], evidence:['Schulungsnachweis'], validFrom:'2026-05-01', validUntil:'2029-05-01', documents:[], changed:'28.05.2026 - Sabine Janning', note:'Dokument fehlt.' },
    { id:'fw-7', company:'galabau', name:'QGIS-Experten', description:'Geographische Informationssysteme und Vermessung', status:'Aktiv', main:'Annika Tholen', deputy:'Emmelie Gebbeken', people:[{ name:'Annika Tholen', role:'Hauptverantwortlicher', certs:['QGIS Advanced','GPS'] }, { name:'Emmelie Gebbeken', role:'Stellvertretung', certs:['QGIS Basis','Vermessung'] }, { name:'Simone Wilmes', role:'Weitere Fachaufsicht', certs:['QGIS Advanced'] }, { name:'Britta Kuhl', role:'Mitarbeiter in Einarbeitung', certs:['QGIS Basis'] }], qualifications:['QGIS','Vermessung'], evidence:['QGIS Zertifikate'], validFrom:'2026-01-15', validUntil:'2028-01-15', documents:['Fachaufsicht_QGIS.pdf'], changed:'27.05.2026 - Sabine Janning', note:'' },
    { id:'fw-8', company:'tiefbau', name:'Schweißer', description:'Qualifizierte Schweißer nach DIN EN 9606', status:'Abgelaufen', main:'Alexander Bartel', deputy:'Sergej Litke', people:[{ name:'Alexander Bartel', role:'Hauptverantwortlicher', certs:['DIN EN 9606 - 111','DIN EN 9606 - 135'] }, { name:'Sergej Litke', role:'Stellvertretung', certs:['DIN EN 9606 - 111','DIN EN 9606 - 131'] }], qualifications:['DIN EN 9606'], evidence:['Schweißerprüfung'], validFrom:'2023-05-01', validUntil:'2026-04-01', documents:['Fachaufsicht_Schweisser.pdf'], changed:'26.05.2026 - Sabine Janning', note:'Nachweise erneuern.' },
    { id:'fw-9', company:'bohrtechnik', name:'Elektriker', description:'Qualifizierte Elektrofachkräfte und -führer', status:'Aktiv', main:'Paul Krahn', deputy:'Tobias Bruns', people:[{ name:'Paul Krahn', role:'Hauptverantwortlicher', certs:['E-Fachkraft','Elektroprüfung'] }, { name:'Tobias Bruns', role:'Stellvertretung', certs:['E-Fachkraft','DGUV V3'] }, { name:'Jane Wenke', role:'Weitere Fachaufsicht', certs:['E-Fachkraft','Installation'] }], qualifications:['E-Fachkraft','DGUV V3'], evidence:['Elektroprüfung'], validFrom:'2026-03-01', validUntil:'2027-03-01', documents:['Fachaufsicht_Elektriker.pdf'], changed:'25.05.2026 - Andreas Janning', note:'' },
  ];

  const [rows, setRows] = React.useState(seedRows);
  const [viewMode, setViewMode] = React.useState('cards');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(null);
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [sort, setSort] = React.useState({ key:'name', dir:'asc' });
  const [hiddenColumns, setHiddenColumns] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  const columns = [
    ['name', 'Fachaufsicht'],
    ['companyName', 'Firma'],
    ['main', 'Hauptverantwortlicher'],
    ['peopleCount', 'Personen'],
    ['qualificationsText', 'Qualifikationen'],
    ['status', 'Status'],
    ['validUntil', 'Gültig bis'],
    ['documentsCount', 'Dokumente'],
  ];
  const statusOptions = ['In Vorbereitung', 'Aktiv', 'Prüfung erforderlich', 'Nachweis läuft ab', 'Abgelaufen', 'Inaktiv', 'Archiviert'];
  const companyOptions = window.SEED.companies.map(company => ({ id:company.id, name:company.name }));
  const peopleOptions = window.SEED.employees.slice(0, 18).map(employee => employee.name);
  const rowCompanyName = row => window.company(row.company)?.name || row.company;
  const enrich = row => ({ ...row, companyName:rowCompanyName(row), peopleCount:row.people.length, qualificationsText:row.qualifications.join(', '), documentsCount:row.documents.length });
  const daysUntil = row => row.validUntil ? Math.ceil((new Date(row.validUntil + 'T00:00:00') - new Date(window.SEED.today + 'T00:00:00')) / 86400000) : null;
  const warningText = row => {
    if (!row.documents.length) return 'Dokument fehlt';
    const days = daysUntil(row);
    if (days === null) return '';
    if (days < 0) return 'bereits abgelaufen';
    if (days <= 30) return 'läuft in 30 Tagen ab';
    if (days <= 90) return 'läuft in 90 Tagen ab';
    return '';
  };
  const statusClass = status => ({
    'Aktiv':'is-active',
    'Nachweis läuft ab':'is-warn',
    'Prüfung erforderlich':'is-warn',
    'Abgelaufen':'is-expired',
    'Inaktiv':'is-muted',
    'Archiviert':'is-muted',
    'In Vorbereitung':'is-prep',
  }[status] || 'is-muted');
  const columnLabel = key => columns.find(([columnKey]) => columnKey === key)?.[1] || key;
  const columnValue = (row, key) => String(enrich(row)[key] || '');
  const scopedRows = rows.filter(row => activeCompany === 'all' || row.company === activeCompany);
  const searchedRows = scopedRows.filter(row => {
    const haystack = [row.name, row.description, row.main, row.deputy, row.status, row.qualifications.join(' '), row.people.map(person => person.name).join(' ')].join(' ').toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });
  let filteredRows = searchedRows.filter(row => Object.entries(columnFilters).every(([key, values]) => !values?.length || values.includes(columnValue(row, key))));
  filteredRows = [...filteredRows].sort((a, b) => columnValue(a, sort.key).localeCompare(columnValue(b, sort.key), 'de', { numeric:true }) * (sort.dir === 'asc' ? 1 : -1));
  const groupedRows = groupBy ? Object.entries(filteredRows.reduce((groups, row) => {
    const value = columnValue(row, groupBy) || '-';
    groups[value] = groups[value] || [];
    groups[value].push(row);
    return groups;
  }, {})) : [];
  const visibleColumns = columns.filter(([key]) => !hiddenColumns.includes(key));
  const selectedRows = filteredRows.filter(row => selectedIds.includes(row.id));
  const allVisibleSelected = filteredRows.length > 0 && filteredRows.every(row => selectedIds.includes(row.id));
  const expiringCount = scopedRows.filter(row => {
    const days = daysUntil(row);
    return !row.documents.length || (days !== null && days <= 90);
  }).length;
  const filterValues = filterPanel ? Array.from(new Set(searchedRows.map(row => columnValue(row, filterPanel)))).filter(Boolean).sort((a, b) => a.localeCompare(b, 'de', { numeric:true })) : [];
  const visibleFilterValues = filterValues.filter(value => value.toLowerCase().includes(filterSearch.toLowerCase()));

  const toggleSelected = id => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAllVisible = () => setSelectedIds(current => allVisibleSelected ? current.filter(id => !filteredRows.some(row => row.id === id)) : Array.from(new Set([...current, ...filteredRows.map(row => row.id)])));
  const toggleFilter = (key, value) => setColumnFilters(current => {
    const values = current[key] || [];
    return { ...current, [key]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
  });
  const archiveRow = row => setRows(current => current.map(item => item.id === row.id ? { ...item, status:'Archiviert' } : item));
  const deleteRow = row => {
    if (window.confirm('Möchten Sie diese Fachaufsicht wirklich löschen?')) {
      setRows(current => current.filter(item => item.id !== row.id));
      setSelectedIds(current => current.filter(id => id !== row.id));
      if (selected?.id === row.id) setSelected(null);
    }
  };
  const duplicateRow = row => setRows(current => [{ ...row, id:'fw-' + Date.now(), name:row.name + ' Kopie', status:'In Vorbereitung', changed:'13.07.2026 - Rahim Ahangarzadeh' }, ...current]);
  const renderColumnMenu = key => columnMenu === key && <div className="fach-column-menu" onClick={event => event.stopPropagation()}>
    <button onClick={() => { setSort({ key, dir:'asc' }); setColumnMenu(null); }}>A bis Z</button>
    <button onClick={() => { setSort({ key, dir:'desc' }); setColumnMenu(null); }}>Z bis A</button>
    <button onClick={() => { setFilterPanel(key); setFilterSearch(''); setColumnMenu(null); }}>Filtern nach</button>
    <button onClick={() => { setGroupBy(key); setColumnMenu(null); }}>Gruppieren nach "{columnLabel(key)}"</button>
    <button onClick={() => { setHiddenColumns(current => current.includes(key) ? current : [...current, key]); setColumnMenu(null); }}>Spalte ausblenden</button>
  </div>;
  const renderRowActions = row => <div className="fach-card-menu">
    <button onClick={event => { event.stopPropagation(); setMenuOpen(menuOpen === row.id ? null : row.id); }}>⋮</button>
    {menuOpen === row.id && <div onClick={event => event.stopPropagation()}>
      <button onClick={() => { setSelected(row); setMenuOpen(null); }}>Anzeigen</button>
      <button onClick={() => { setSelected(row); setMenuOpen(null); }}>Bearbeiten</button>
      <button>Person hinzufügen</button>
      <button>Person entfernen</button>
      <button>Dokument hochladen</button>
      <button onClick={() => { duplicateRow(row); setMenuOpen(null); }}>Duplizieren</button>
      <button onClick={() => { archiveRow(row); setMenuOpen(null); }}>Archivieren</button>
      <button className="is-danger" onClick={() => { deleteRow(row); setMenuOpen(null); }}>Löschen</button>
    </div>}
  </div>;
  const renderTableRows = list => list.map(row => <tr key={row.id} className={selectedIds.includes(row.id) ? 'is-selected' : ''}>
    <td><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
    {visibleColumns.map(([key]) => <td key={key} onClick={() => key === 'name' && setSelected(row)}>
      {key === 'name' ? <strong>{row.name}</strong> : key === 'status' ? <span className={'fach-status ' + statusClass(row.status)}>{row.status}</span> : key === 'validUntil' ? <span>{row.validUntil}<small>{warningText(row)}</small></span> : columnValue(row, key)}
    </td>)}
    <td>{renderRowActions(row)}</td>
  </tr>);

  if (selected) return <FachaufsichtDetail row={selected} onBack={() => setSelected(null)} statusClass={statusClass} warningText={warningText} />;

  return <div className="view fach-page">
    <div className="fach-head">
      <div className="fach-head__title">{onBack && <button className="emp-round-back" onClick={onBack}><Icon name="chevL" size={18} /></button>}<div><h1>{title}</h1><p>{subtitle}</p></div></div>
      <div className="fach-head__actions">
        {extraAction}
        <button className="btn btn--ghost"><Icon name="filter" size={14} />Filter</button>
        <div className="fach-view-toggle"><button className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}><Icon name="dashboard" size={14} />Kacheln</button><button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><Icon name="matrix" size={14} />Liste</button></div>
        <button className="btn btn--primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={14} />Fachaufsicht</button>
      </div>
    </div>

    <div className="fach-kpis">
      <button><span>Fachaufsichten</span><strong>{scopedRows.length}</strong></button>
      <button><span>Aktiv</span><strong>{scopedRows.filter(row => row.status === 'Aktiv').length}</strong></button>
      <button><span>2 Nachweise laufen bald ab</span><strong>{expiringCount}</strong></button>
      <button><span>Archiviert</span><strong>{scopedRows.filter(row => row.status === 'Archiviert').length}</strong></button>
    </div>

    <div className="fach-filter-row">
      <label><Icon name="search" size={15} /><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Fachaufsicht, Person, Qualifikation suchen..." /></label>
      {hiddenColumns.length > 0 && <button className="btn btn--ghost" onClick={() => setHiddenColumns([])}>Alle Spalten anzeigen</button>}
      {groupBy && <button className="btn btn--ghost" onClick={() => setGroupBy('')}>Gruppierung aufheben</button>}
    </div>

    {selectedIds.length > 0 && <div className="fach-bulkbar"><strong>{selectedRows.length} ausgewählt</strong><button>Status ändern</button><button>Firma zuordnen</button><button>Person hinzufügen</button><button>Dokument exportieren</button><button>Archivieren</button><button className="is-danger">Löschen</button><button onClick={() => setSelectedIds([])}><Icon name="x" size={13} /></button></div>}

    {viewMode === 'cards' ? <div className="fachaufsichten-grid fach-grid-new">
      {filteredRows.map(row => <article key={row.id} className="fachaufsicht-card fach-card-new" onClick={() => setSelected(row)}>
        <header><div><h3>{row.name}</h3><p>{row.description}</p></div><span className={'fach-status ' + statusClass(row.status)}>{row.status}</span>{renderRowActions(row)}</header>
        <div className="fach-card-people"><strong>{row.main}</strong><small>Hauptverantwortlicher</small><span>{row.deputy}</span><small>Vertretung</small></div>
        <div className="zertifikate-tags">{row.qualifications.map(item => <span key={item} className="tag">{item}</span>)}</div>
        <footer><span>{row.people.length} Personen</span><span>{row.documents.length} Dokumente</span><span>{warningText(row) || 'Gültig bis ' + row.validUntil}</span></footer>
      </article>)}
    </div> : <div className="fach-table-wrap">
      <table className="fach-table">
        <thead><tr><th><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} /></th>{visibleColumns.map(([key, label]) => <th key={key}><div><button onClick={() => setColumnMenu(columnMenu === key ? null : key)}>{label}<span>{sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '⌄'}</span></button>{renderColumnMenu(key)}</div></th>)}<th>Aktionen</th></tr></thead>
        <tbody>{groupBy ? groupedRows.flatMap(([group, items]) => [<tr key={'g-' + group} className="fach-group-row"><td colSpan={visibleColumns.length + 2}>{columnLabel(groupBy)}: {group}<span>{items.length}</span></td></tr>, ...renderTableRows(items)]) : renderTableRows(filteredRows)}</tbody>
      </table>
    </div>}

    {filterPanel && <div className="fach-filter-backdrop" onClick={() => setFilterPanel(null)}><section className="fach-filter-panel" onClick={event => event.stopPropagation()}><header><strong>{columnLabel(filterPanel)} filtern</strong><button onClick={() => setFilterPanel(null)}><Icon name="x" size={14} /></button></header><label><Icon name="search" size={14} /><input autoFocus value={filterSearch} onChange={event => setFilterSearch(event.target.value)} placeholder="Suchen..." /></label><div>{visibleFilterValues.map(value => <label key={value}><input type="checkbox" checked={(columnFilters[filterPanel] || []).includes(value)} onChange={() => toggleFilter(filterPanel, value)} /><span>{value}</span></label>)}</div><footer><button className="btn btn--ghost" onClick={() => setColumnFilters(current => ({ ...current, [filterPanel]:[] }))}>Zurücksetzen</button><button className="btn btn--primary" onClick={() => setFilterPanel(null)}>Anwenden</button></footer></section></div>}
    {createOpen && <FachaufsichtCreateDialog onClose={() => setCreateOpen(false)} onSave={draft => { const qualifications = draft.qualifications.split(',').map(item => item.trim()).filter(Boolean); const evidence = draft.evidence.split(',').map(item => item.trim()).filter(Boolean); const people = draft.personRows.filter(person => person.name).map(person => ({ name:person.name, role:person.role, certs:person.certs.split(',').map(item => item.trim()).filter(Boolean) })); setRows(current => [{ ...draft, id:'fw-' + Date.now(), main:people.find(person => person.role === 'Hauptverantwortlicher')?.name || people[0]?.name || '', deputy:people.find(person => person.role === 'Stellvertretung')?.name || '', people, documents:draft.documents ? [draft.documents] : [], qualifications, evidence, changed:'13.07.2026 - Rahim Ahangarzadeh' }, ...current]); setCreateOpen(false); }} statusOptions={statusOptions} companyOptions={companyOptions} peopleOptions={peopleOptions} />}
  </div>;
}

function FachaufsichtCreateDialog({ onClose, onSave, statusOptions, companyOptions, peopleOptions }) {
  const roleOptions = ['Hauptverantwortlicher', 'Stellvertretung', 'Weitere Fachaufsicht', 'Mitarbeiter in Einarbeitung'];
  const [draft, setDraft] = React.useState({ name:'', description:'', company:companyOptions[0]?.id || 'tiefbau', status:'In Vorbereitung', personRows:[{ id:1, name:'', role:'Hauptverantwortlicher', certs:'' }], qualifications:'', evidence:'', validFrom:'2026-07-13', validUntil:'2027-07-13', documents:'', note:'' });
  const set = (key, value) => setDraft(current => ({ ...current, [key]:value }));
  const updatePerson = (id, key, value) => set('personRows', draft.personRows.map(person => person.id === id ? { ...person, [key]:value } : person));
  const addPerson = () => set('personRows', [...draft.personRows, { id:Date.now(), name:'', role:'Weitere Fachaufsicht', certs:draft.qualifications }]);
  const removePerson = id => set('personRows', draft.personRows.filter(person => person.id !== id));
  return <div className="fach-dialog-backdrop" onClick={onClose}><section className="fach-dialog" onClick={event => event.stopPropagation()}>
    <header><div><span>Neue Fachaufsicht</span><h2>Fachaufsicht erstellen</h2></div><button onClick={onClose}><Icon name="x" size={18} /></button></header>
    <div className="fach-dialog-grid">
      <label><span>Bezeichnung der Fachaufsicht</span><input value={draft.name} onChange={event => set('name', event.target.value)} /></label>
      <label><span>Firma</span><select value={draft.company} onChange={event => set('company', event.target.value)}>{companyOptions.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
      <label className="is-wide"><span>Status</span><select value={draft.status} onChange={event => set('status', event.target.value)}>{statusOptions.map(status => <option key={status}>{status}</option>)}</select></label>
      <div className="fach-person-editor is-wide">
        <div className="fach-person-editor__head"><span>Verantwortliche Personen</span><button type="button" className="btn btn--ghost" onClick={addPerson}><Icon name="plus" size={14} />Person hinzufügen</button></div>
        {draft.personRows.map(person => <div key={person.id} className="fach-person-row">
          <label><span>Person</span><select value={person.name} onChange={event => updatePerson(person.id, 'name', event.target.value)}><option value="">Bitte auswählen</option>{peopleOptions.map(name => <option key={name}>{name}</option>)}</select></label>
          <label><span>Rolle</span><select value={person.role} onChange={event => updatePerson(person.id, 'role', event.target.value)}>{roleOptions.map(role => <option key={role}>{role}</option>)}</select></label>
          <label><span>Qualifikationen / Nachweise</span><input value={person.certs} onChange={event => updatePerson(person.id, 'certs', event.target.value)} placeholder="QGIS Advanced, GPS" /></label>
          <button type="button" className="btn btn--ghost" disabled={draft.personRows.length === 1} onClick={() => removePerson(person.id)}><Icon name="x" size={14} /></button>
        </div>)}
        <p>So kann z.B. Annika Tholen Hauptverantwortliche sein, Emmelie Gebbeken Stellvertretung und weitere Personen eigene Nachweise bekommen.</p>
      </div>
      <label><span>Erforderliche Qualifikationen</span><input value={draft.qualifications} onChange={event => set('qualifications', event.target.value)} placeholder="GW 301, FW601" /></label>
      <label><span>Erforderliche Zertifikate oder Nachweise</span><input value={draft.evidence} onChange={event => set('evidence', event.target.value)} placeholder="Sachkundenachweis" /></label>
      <label><span>Gültig ab</span><input type="date" value={draft.validFrom} onChange={event => set('validFrom', event.target.value)} /></label>
      <label><span>Gültig bis</span><input type="date" value={draft.validUntil} onChange={event => set('validUntil', event.target.value)} /></label>
      <label><span>Dokumente hochladen</span><div className="fach-upload"><Icon name="upload" size={16} /><strong>{draft.documents || 'Dokument hochladen'}</strong><input type="file" onChange={event => set('documents', event.target.files?.[0]?.name || '')} /></div></label>
      <label className="is-wide"><span>Beschreibung</span><textarea value={draft.description} onChange={event => set('description', event.target.value)} /></label>
      <label className="is-wide"><span>Bemerkung</span><textarea value={draft.note} onChange={event => set('note', event.target.value)} /></label>
    </div>
    <footer><button className="btn btn--ghost" onClick={onClose}>Abbrechen</button><button className="btn btn--primary" onClick={() => onSave(draft)}>Speichern</button></footer>
  </section></div>;
}

function FachaufsichtDetail({ row, onBack, statusClass, warningText }) {
  return <div className="emp-full fach-detail-page">
    <header className="emp-page-title"><div><button className="emp-round-back" onClick={onBack}><Icon name="chevL" size={18} /></button><h1>{row.name}</h1></div><div><button className="btn btn--ghost"><Icon name="edit" size={14} />Bearbeiten</button><button className="btn btn--ghost"><Icon name="doc" size={14} />Archivieren</button></div></header>
    <section className="fach-detail-hero"><div><span className={'fach-status ' + statusClass(row.status)}>{row.status}</span><h2>{row.name}</h2><p>{row.description}</p></div><dl><div><dt>Firma</dt><dd>{window.company(row.company)?.name || row.company}</dd></div><div><dt>Hauptverantwortlicher</dt><dd>{row.main}</dd></div><div><dt>Gültig bis</dt><dd>{row.validUntil}</dd></div></dl></section>
    <div className="fach-detail-grid">
      <section><h3>Stammdaten</h3><p>{row.description}</p><p><strong>Bemerkung:</strong> {row.note || '-'}</p></section>
      <section><h3>Verantwortliche Personen</h3>{row.people.map(person => <div key={person.name} className="fach-person-detail"><strong>{person.name}</strong><small>{person.role}</small><span>{person.certs.join(', ')}</span></div>)}</section>
      <section><h3>Qualifikationen</h3><div className="zertifikate-tags">{row.qualifications.map(item => <span key={item} className="tag">{item}</span>)}</div></section>
      <section><h3>Dokumente und Gültigkeiten</h3><p>{warningText(row) || 'Alle Nachweise gültig.'}</p>{row.documents.map(doc => <button key={doc} className="btn btn--ghost"><Icon name="doc" size={14} />{doc}</button>)}</section>
      <section><h3>Historie</h3><p>Erstellt: 25.05.2026 - Sabine Janning</p><p>Geändert: {row.changed}</p><p>Statusänderung: {row.status}</p></section>
      <section><h3>Notizen</h3><p>{row.note || 'Keine Notizen hinterlegt.'}</p></section>
    </div>
  </div>;
}

window.FachaufsichtenView = FachaufsichtenView;
