function DocumentsView({ mode = 'home' }) {
  const isDrive = mode === 'drive';
  const title = isDrive ? 'Meine Ablage' : 'Dokumente';

  const seedFolders = [
    { id:'folder-bgbau', name:'BGBAU', parent:'Meine Ablage', company:'Janning Tiefbau GmbH', owner:'Rahim Ahangarzadeh', visibility:'Intern', description:'Baustellen- und BGBAU-Unterlagen', changed:'20.06.2026' },
    { id:'folder-bgbau-2026', name:'2026', parent:'Meine Ablage / BGBAU', company:'Janning Tiefbau GmbH', owner:'Sabine Janning', visibility:'Firma', description:'Unterlagen 2026', changed:'21.06.2026' },
    { id:'folder-aushang', name:'Baustellenaushänge', parent:'Meine Ablage / BGBAU / 2026', company:'Janning Tiefbau GmbH', owner:'Sabine Janning', visibility:'Freigegeben', description:'Aushänge je Baustelle', changed:'24.06.2026' },
    { id:'folder-audits', name:'Audits', parent:'Meine Ablage', company:'Janning Group', owner:'Rahim Ahangarzadeh', visibility:'Intern', description:'Auditberichte und Checklisten', changed:'18.06.2026' },
    { id:'folder-scc', name:'SCC', parent:'Meine Ablage / Audits', company:'Janning Group', owner:'Rahim Ahangarzadeh', visibility:'Intern', description:'SCC Unterlagen', changed:'18.06.2026' },
  ];

  const seedDocs = [
    { id:'doc-001', name:'SCC_Audit_Checkliste_2026.pdf', company:'Janning Tiefbau GmbH', category:'Audits', owner:'Rahim Ahangarzadeh', location:'Meine Ablage / Audits / SCC', type:'PDF', size:'1.8 MB', version:'1.2', changed:'18.06.2026', changedBy:'Rahim Ahangarzadeh', release:'Freigegeben', validity:'31.12.2026', reason:'läuft bald ab', status:'warning' },
    { id:'doc-002', name:'BGBAU_Tiefbau_Aushang_2026.pdf', company:'Janning Tiefbau GmbH', category:'Baustellenaushang', owner:'Sabine Janning', location:'Meine Ablage / BGBAU / 2026 / Baustellenaushänge', type:'PDF', size:'1.4 MB', version:'2.0', changed:'24.05.2026', changedBy:'Sabine Janning', release:'Freigegeben', validity:'28.06.2026', reason:'kürzlich geändert', status:'ok' },
    { id:'doc-003', name:'Gefährdungsbeurteilung_Kanalsanierung.pdf', company:'Janning Tiefbau GmbH', category:'Gefährdungsbeurteilung', owner:'Alexander Petersen', location:'Meine Ablage / BGBAU / 2026', type:'PDF', size:'2.2 MB', version:'1.0', changed:'05.06.2026', changedBy:'Alexander Petersen', release:'In Prüfung', validity:'31.12.2026', reason:'für mich freigegeben', status:'review' },
    { id:'doc-004', name:'Unfallstatistik_Q2_2026.xlsx', company:'Janning Rohrbau GmbH', category:'Unfallstatistik', owner:'HSE', location:'Meine Ablage / Audits', type:'Excel', size:'380 KB', version:'1.1', changed:'30.06.2026', changedBy:'HSE', release:'Entwurf', validity:'-', reason:'häufig verwendet', status:'draft' },
    { id:'doc-005', name:'Organigramm_Janning_Group_V3.pdf', company:'Janning Group', category:'Organigramm', owner:'Christian Janning', location:'Meine Ablage', type:'PDF', size:'920 KB', version:'3.0', changed:'12.06.2026', changedBy:'Christian Janning', release:'Ersetzt', validity:'31.12.2027', reason:'neue Version vorhanden', status:'new' },
    { id:'doc-006', name:'Fahrerlaubnis_Bestätigung_SGU_007.pdf', company:'Janning Transporte GmbH', category:'Führerscheinkontrolle', owner:'Fuhrpark', location:'Meine Ablage', type:'PDF', size:'760 KB', version:'2.0', changed:'10.05.2026', changedBy:'Fuhrpark', release:'Freigegeben', validity:'31.12.2026', reason:'zuletzt geöffnet', status:'ok' },
  ];

  const columns = [
    ['name', 'Name'],
    ['company', 'Firma'],
    ['category', 'Kategorie'],
    ['owner', 'Eigentümer'],
    ['location', 'Speicherort'],
    ['type', 'Dateityp'],
    ['size', 'Dateigröße'],
    ['version', 'Versionsnummer'],
    ['changed', 'Änderungsdatum'],
    ['changedBy', 'geändert von'],
    ['release', 'Freigabestatus'],
    ['validity', 'Gültigkeit'],
  ];

  const [docs, setDocs] = React.useState(seedDocs);
  const [folders, setFolders] = React.useState(seedFolders);
  const [view, setView] = React.useState(isDrive ? 'grid' : 'list');
  const [currentPath, setCurrentPath] = React.useState('Meine Ablage');
  const [selected, setSelected] = React.useState([]);
  const [openMenu, setOpenMenu] = React.useState(null);
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [hiddenCols, setHiddenCols] = React.useState([]);
  const [sort, setSort] = React.useState({ key:'changed', dir:'desc' });
  const [groupBy, setGroupBy] = React.useState('');
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setView(isDrive ? 'grid' : 'list');
    setSelected([]);
    if (!isDrive) setCurrentPath('Meine Ablage');
  }, [mode]);

  const folderRows = isDrive
    ? folders.filter(folder => folder.parent === currentPath).map(folder => ({
        ...folder,
        rowKind:'folder',
        category:'Ordner',
        location:folder.parent,
        type:'Ordner',
        size:'ZIP möglich',
        version:'-',
        changedBy:folder.owner,
        release:folder.visibility,
        validity:'-',
        status:'folder',
      }))
    : [];

  const docRows = isDrive
    ? docs.filter(doc => doc.location === currentPath).map(doc => ({ ...doc, rowKind:'file' }))
    : docs.map(doc => ({ ...doc, rowKind:'file' }));

  const visibleColumns = columns.filter(([key]) => !hiddenCols.includes(key));
  const rows = [...folderRows, ...docRows];
  const recentDocs = docs.slice(0, 4);
  const suggestedDocs = docs.filter(doc => doc.reason).slice(0, 4);
  const selectedRows = rows.filter(row => selected.includes(row.id));

  const sortedRows = [...rows].sort((a, b) => {
    if (a.rowKind !== b.rowKind) return a.rowKind === 'folder' ? -1 : 1;
    const av = String(a[sort.key] || '');
    const bv = String(b[sort.key] || '');
    return sort.dir === 'asc' ? av.localeCompare(bv, 'de') : bv.localeCompare(av, 'de');
  });

  const groupedRows = groupBy
    ? sortedRows.reduce((acc, row) => {
        const group = row[groupBy] || 'Ohne Wert';
        acc[group] = acc[group] || [];
        acc[group].push(row);
        return acc;
      }, {})
    : null;

  const pathParts = currentPath.split(' / ');
  const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join(' / ') : 'Meine Ablage';

  const toggleSelected = (id) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelected(selected.length === rows.length ? [] : rows.map(row => row.id));

  const confirmDelete = (ids) => {
    const deleteIds = Array.isArray(ids) ? ids : [ids];
    const ok = window.confirm(deleteIds.length > 1
      ? `Möchten Sie diese ${deleteIds.length} Einträge wirklich in den Papierkorb verschieben?`
      : 'Möchten Sie diesen Eintrag wirklich in den Papierkorb verschieben?'
    );
    if (!ok) return;
    setDocs(current => current.filter(doc => !deleteIds.includes(doc.id)));
    setFolders(current => current.filter(folder => !deleteIds.includes(folder.id)));
    setSelected(current => current.filter(id => !deleteIds.includes(id)));
    setOpenMenu(null);
  };

  const createFolder = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    if (!name) return;
    setFolders(current => [...current, {
      id:'folder-' + Date.now(),
      name,
      parent:String(form.get('parent') || currentPath),
      company:String(form.get('company') || 'Janning Tiefbau GmbH'),
      owner:'Rahim Ahangarzadeh',
      visibility:String(form.get('visibility') || 'Intern'),
      description:String(form.get('description') || ''),
      changed:new Date().toLocaleDateString('de-DE'),
    }]);
    setFolderDialogOpen(false);
  };

  const addUploadMock = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim() || 'Neues_Dokument.pdf';
    const duplicate = docs.some(doc => doc.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      window.confirm('Diese Datei existiert bereits. Möchten Sie eine neue Version erstellen?');
    }
    setDocs(current => [...current, {
      id:'doc-' + Date.now(),
      name,
      company:String(form.get('company') || 'Janning Tiefbau GmbH'),
      category:String(form.get('category') || 'Allgemein'),
      owner:String(form.get('owner') || 'Rahim Ahangarzadeh'),
      location:String(form.get('target') || currentPath),
      type:'PDF',
      size:'1.0 MB',
      version:String(form.get('version') || '1.0'),
      changed:new Date().toLocaleDateString('de-DE'),
      changedBy:'Rahim Ahangarzadeh',
      release:String(form.get('release') || 'Entwurf'),
      validity:String(form.get('validity') || '-'),
      reason:'kürzlich geändert',
      status:'draft',
    }]);
    setUploadDialogOpen(false);
  };

  const fileActions = [
    'Öffnen',
    'Vorschau',
    'Herunterladen',
    'Bearbeiten',
    'Umbenennen',
    'Verschieben',
    'Kopieren',
    'Freigeben',
    'neue Version hochladen',
    'Archivieren',
    'Löschen',
  ];

  const folderActions = [
    'Öffnen',
    'Umbenennen',
    'Verschieben',
    'Kopieren',
    'Freigeben',
    'Eigentümer ändern',
    'Herunterladen als ZIP',
    'Archivieren',
    'Löschen',
  ];

  const statusClass = (status) => ({
    ok:'is-ok',
    warning:'is-warning',
    review:'is-review',
    new:'is-new',
    draft:'is-draft',
    folder:'is-folder',
  }[status] || 'is-ok');

  const openFolder = (folder) => {
    if (folder.rowKind === 'folder') {
      setCurrentPath(`${folder.parent} / ${folder.name}`);
      setSelected([]);
    }
  };

  const renderActionMenu = (row) => {
    const actions = row.rowKind === 'folder' ? folderActions : fileActions;
    return (
      <div className="docs-action-menu" onClick={(event) => event.stopPropagation()}>
        <button className="docs-more" onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)} aria-label="Aktionen">⋮</button>
        {openMenu === row.id && (
          <div className="docs-menu-popover">
            {actions.map(action => (
              <button
                key={action}
                className={action === 'Löschen' ? 'is-danger' : ''}
                onClick={() => {
                  if (action === 'Öffnen' && row.rowKind === 'folder') openFolder(row);
                  else if (action === 'Löschen') confirmDelete(row.id);
                  else setOpenMenu(null);
                }}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderColumnHead = ([key, label]) => (
    <th key={key}>
      <div className="docs-column-head">
        <button onClick={() => setColumnMenu(columnMenu === key ? null : key)}>{label}⌄</button>
        {columnMenu === key && (
          <div className="docs-column-menu">
            <button onClick={() => { setSort({ key, dir:'asc' }); setColumnMenu(null); }}>A bis Z</button>
            <button onClick={() => { setSort({ key, dir:'desc' }); setColumnMenu(null); }}>Z bis A</button>
            <button onClick={() => setColumnMenu(null)}>Filtern nach</button>
            <button onClick={() => { setGroupBy(key); setColumnMenu(null); }}>Gruppieren nach "{label}"</button>
            <button onClick={() => { setHiddenCols(cols => [...cols, key]); setColumnMenu(null); }}>Spalte ausblenden</button>
          </div>
        )}
      </div>
    </th>
  );

  const renderTableRows = (items) => items.map(row => (
    <tr key={row.id} className={selected.includes(row.id) ? 'is-selected' : ''} onDoubleClick={() => openFolder(row)}>
      <td><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
      {visibleColumns.map(([key]) => (
        <td key={key}>
          {key === 'name' && (
            <button className="documents-name-btn" onClick={() => openFolder(row)}>
              <Icon name={row.rowKind === 'folder' ? 'building' : 'doc'} size={16} />
              <strong>{row.name}</strong>
            </button>
          )}
          {key === 'release' && <span className={`docs-status ${statusClass(row.status)}`}>{row.release}</span>}
          {key !== 'name' && key !== 'release' && row[key]}
        </td>
      ))}
      <td>{renderActionMenu(row)}</td>
    </tr>
  ));

  const renderDialog = () => (
    <>
      {folderDialogOpen && (
        <div className="documents-dialog-backdrop">
          <form className="documents-dialog" onSubmit={createFolder}>
            <header><div><span>Meine Ablage</span><h2>Ordner erstellen</h2></div><button type="button" onClick={() => setFolderDialogOpen(false)}>×</button></header>
            <div className="documents-dialog-grid">
              <label><span>Ordnername</span><input name="name" autoFocus /></label>
              <label><span>übergeordneter Ordner</span><input name="parent" defaultValue={currentPath} /></label>
              <label className="is-wide"><span>Beschreibung</span><textarea name="description" /></label>
              <label><span>Firma</span><select name="company"><option>Janning Tiefbau GmbH</option><option>Janning Rohrbau GmbH</option><option>Janning Group</option></select></label>
              <label><span>Sichtbarkeit</span><select name="visibility"><option>Intern</option><option>Nur ansehen</option><option>Freigegeben</option><option>Alle Firmen</option></select></label>
              <label className="is-wide"><span>Freigabe für andere Personen</span><input name="share" placeholder="Mitarbeiter, Abteilung, Gruppe oder Firma auswählen" /></label>
              <label className="is-wide"><span>Bemerkung</span><textarea name="note" /></label>
            </div>
            <footer><button type="button" onClick={() => setFolderDialogOpen(false)}>Abbrechen</button><button className="primary">Speichern</button></footer>
          </form>
        </div>
      )}
      {uploadDialogOpen && (
        <div className="documents-dialog-backdrop">
          <form className="documents-dialog documents-upload-dialog" onSubmit={addUploadMock}>
            <header><div><span>Dokumente</span><h2>Datei hochladen</h2></div><button type="button" onClick={() => setUploadDialogOpen(false)}>×</button></header>
            <div className="documents-dialog-grid">
              <label><span>Dokumentname</span><input name="name" placeholder="Dateiname oder Titel" /></label>
              <label><span>Firma</span><select name="company"><option>Janning Tiefbau GmbH</option><option>Janning Rohrbau GmbH</option><option>Janning Group</option></select></label>
              <label><span>Kategorie</span><input name="category" placeholder="z.B. Audit, Formular, Baustelle" /></label>
              <label><span>Zielordner</span><input name="target" defaultValue={currentPath} /></label>
              <label><span>Eigentümer</span><input name="owner" defaultValue="Rahim Ahangarzadeh" /></label>
              <label><span>Version</span><input name="version" defaultValue="1.0" /></label>
              <label><span>Gültigkeit</span><input name="validity" placeholder="TT.MM.JJJJ" /></label>
              <label><span>Freigabestatus</span><select name="release"><option>Entwurf</option><option>In Prüfung</option><option>Freigegeben</option><option>Abgelaufen</option><option>Ersetzt</option><option>Archiviert</option></select></label>
              <label><span>Sichtbarkeit</span><select name="visibility"><option>Nur ansehen</option><option>Herunterladen</option><option>Bearbeiten</option><option>Dateien hinzufügen</option><option>Dateien löschen</option><option>Freigaben verwalten</option><option>vollständiger Zugriff</option></select></label>
              <label className="is-wide"><span>Beschreibung</span><textarea name="description" /></label>
              <div className="documents-dropzone">
                <Icon name="upload" size={20} />
                <strong>Dateien hier ablegen oder auswählen</strong>
                <p>PDF, Word, Excel, Bilder, ZIP, DXF und freigegebene Formate · max. 50 MB · Vorschau vor dem Speichern</p>
                <button type="button">Dateien auswählen</button>
              </div>
              <label className="is-wide"><span>Bemerkung</span><textarea name="note" /></label>
              <div className="documents-version-note">
                Bei gleichem Dateinamen wird gefragt, ob eine neue Version erstellt oder die Datei separat hochgeladen werden soll.
              </div>
            </div>
            <footer><button type="button" onClick={() => setUploadDialogOpen(false)}>Abbrechen</button><button className="primary">Speichern</button></footer>
          </form>
        </div>
      )}
    </>
  );

  return (
    <div className="documents-page">
      <div className="documents-head">
        <div>
          <h1>{title}</h1>
          <p>{isDrive ? 'Persönliche Ordner, Dateien, Freigaben und Versionen verwalten.' : 'Zentrale Dokumentenübersicht der ausgewählten Firma.'}</p>
        </div>
        <div className="documents-head-actions">
          <div className="segmented">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Liste</button>
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Raster</button>
          </div>
          <button className="btn" onClick={() => setFolderDialogOpen(true)}><Icon name="building" size={15} /> Neuer Ordner</button>
          <button className="btn primary" onClick={() => setUploadDialogOpen(true)}><Icon name="upload" size={15} /> Datei hochladen</button>
        </div>
      </div>

      {isDrive && (
        <div className="documents-drive-nav">
          <button title="zurück" onClick={() => setCurrentPath(parentPath)}><Icon name="chevL" size={15} /> zurück</button>
          <button title="eine Ebene nach oben" onClick={() => setCurrentPath(parentPath)}>eine Ebene nach oben</button>
          <button title="Startseite der Ablage" onClick={() => setCurrentPath('Meine Ablage')}>Startseite der Ablage</button>
          <div className="documents-breadcrumb">
            {pathParts.map((part, index) => {
              const target = pathParts.slice(0, index + 1).join(' / ');
              return <React.Fragment key={target}><button onClick={() => setCurrentPath(target)}>{part}</button>{index < pathParts.length - 1 && <span>/</span>}</React.Fragment>;
            })}
          </div>
        </div>
      )}

      {!isDrive && (
        <div className="documents-top-grid">
          <section className="documents-suggestion-panel">
            <header><h2>Vorgeschlagene Dateien</h2><span>{suggestedDocs.length} Hinweise</span></header>
            <div className="documents-suggestion-list">
              {suggestedDocs.map(doc => (
                <button key={doc.id} className="documents-suggestion-card">
                  <span className={`docs-preview docs-preview--${doc.type.toLowerCase()}`}>{doc.type}</span>
                  <span><strong>{doc.name}</strong><small>{doc.company} · {doc.category}</small></span>
                  <em>{doc.reason}</em>
                </button>
              ))}
            </div>
          </section>
          <section className="documents-suggestion-panel">
            <header><h2>Zuletzt verwendet</h2><span>aktuell</span></header>
            <div className="documents-recent-list">
              {recentDocs.map(doc => (
                <button key={doc.id}><Icon name="doc" size={16} /><span><strong>{doc.name}</strong><small>{doc.changed} · {doc.changedBy}</small></span><b>{doc.type}</b></button>
              ))}
            </div>
          </section>
        </div>
      )}

      {isDrive && (
        <div className="documents-side-panels">
          <section><strong>Rechte und Freigaben</strong><span>nur ansehen · herunterladen · bearbeiten · Dateien hinzufügen · vollständiger Zugriff</span></section>
          <section><strong>Archiv</strong><span>Alte Dateien bleiben nachvollziehbar gespeichert.</span></section>
          <section><strong>Papierkorb</strong><span>Gelöschte Dateien bleiben 30 Tage wiederherstellbar.</span></section>
          <section><strong>Änderungshistorie</strong><span>Uploads, Freigaben, Downloads, Versionen und Löschungen werden protokolliert.</span></section>
        </div>
      )}

      {selected.length > 0 && (
        <div className="documents-bulkbar">
          <strong>{selectedRows.length} Eintrag/Einträge ausgewählt</strong>
          <button>herunterladen</button>
          <button>verschieben</button>
          <button>kopieren</button>
          <button>Eigentümer ändern</button>
          <button>Freigabe ändern</button>
          <button>Firma zuordnen</button>
          <button>archivieren</button>
          <button className="is-danger" onClick={() => confirmDelete(selected)}>löschen</button>
        </div>
      )}

      {view === 'list' ? (
        <div className="documents-table-wrap">
          <table className="documents-table">
            <thead>
              <tr>
                <th className="is-select"><input type="checkbox" checked={rows.length > 0 && selected.length === rows.length} onChange={toggleAll} /></th>
                {visibleColumns.map(renderColumnHead)}
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows
                ? Object.entries(groupedRows).map(([group, items]) => (
                    <React.Fragment key={group}>
                      <tr className="docs-group-row"><td colSpan={visibleColumns.length + 2}>{group}<span>{items.length} Einträge</span></td></tr>
                      {renderTableRows(items)}
                    </React.Fragment>
                  ))
                : renderTableRows(sortedRows)
              }
              {!rows.length && <tr><td colSpan={visibleColumns.length + 2} className="documents-empty">Dieser Ordner ist leer.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="documents-grid">
          {sortedRows.map(row => (
            <article key={row.id} className="documents-card" onDoubleClick={() => openFolder(row)}>
              <header>
                <div className={`docs-preview docs-preview--${row.type.toLowerCase()}`}>{row.rowKind === 'folder' ? 'ORD' : row.type}</div>
                <div><h3>{row.name}</h3><p>{row.category} · {row.company}</p></div>
                {renderActionMenu(row)}
              </header>
              <div className="documents-card-preview">
                <span>{row.rowKind === 'folder' ? 'Ordner mit ZIP-Download' : row.type === 'PDF' ? 'PDF-Vorschau Seite 1' : 'Dateivorschau'}</span>
                <i /><i /><i />
              </div>
              <dl>
                <div><dt>Eigentümer</dt><dd>{row.owner}</dd></div>
                <div><dt>Änderungsdatum</dt><dd>{row.changed}</dd></div>
                <div><dt>Status</dt><dd><span className={`docs-status ${statusClass(row.status)}`}>{row.release}</span></dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {renderDialog()}
    </div>
  );
}

Object.assign(window, { DocumentsView });
