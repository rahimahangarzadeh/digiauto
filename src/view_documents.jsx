function DocumentsView({ mode = 'home' }) {
  const isDrive = mode === 'drive';
  const title = isDrive ? 'Meine Ablage' : 'Dokumente';

  const seedDocs = [
    {
      id: 'doc-001',
      name: 'SCC_Audit_Checkliste_2026.pdf',
      company: 'Janning Tiefbau GmbH',
      category: 'Audits',
      owner: 'Rahim Ahangarzadeh',
      location: 'Audits / SCC / 2026',
      type: 'PDF',
      size: '1.8 MB',
      version: '1.2',
      changed: '18.06.2026',
      changedBy: 'Rahim Ahangarzadeh',
      release: 'Freigegeben',
      validity: '31.12.2026',
      reason: 'läuft bald ab',
      status: 'warning',
    },
    {
      id: 'doc-002',
      name: 'BGBAU_Tiefbau_Aushang_2026.pdf',
      company: 'Janning Tiefbau GmbH',
      category: 'Baustellenaushang',
      owner: 'Sabine Janning',
      location: 'BGBAU / Janning Tiefbau GmbH / 2026',
      type: 'PDF',
      size: '1.4 MB',
      version: '2.0',
      changed: '24.05.2026',
      changedBy: 'Sabine Janning',
      release: 'Freigegeben',
      validity: '28.06.2026',
      reason: 'kürzlich geändert',
      status: 'ok',
    },
    {
      id: 'doc-003',
      name: 'Gefaehrdungsbeurteilung_Kanalsanierung.pdf',
      company: 'Janning Tiefbau GmbH',
      category: 'Gefährdungsbeurteilung',
      owner: 'Alexander Petersen',
      location: 'Baustellen / Kanalsanierung Nordhorn',
      type: 'PDF',
      size: '2.2 MB',
      version: '1.0',
      changed: '05.06.2026',
      changedBy: 'Alexander Petersen',
      release: 'Zur Prüfung',
      validity: '31.12.2026',
      reason: 'für mich freigegeben',
      status: 'review',
    },
    {
      id: 'doc-004',
      name: 'Unfallstatistik_Q2_2026.xlsx',
      company: 'Janning Rohrbau GmbH',
      category: 'Unfallstatistik',
      owner: 'HSE',
      location: 'Unfallstatistik / 2026',
      type: 'Excel',
      size: '380 KB',
      version: '1.1',
      changed: '30.06.2026',
      changedBy: 'HSE',
      release: 'Intern',
      validity: '-',
      reason: 'häufig verwendet',
      status: 'ok',
    },
    {
      id: 'doc-005',
      name: 'Organigramm_Janning_Group_V3.pdf',
      company: 'Janning Group',
      category: 'Organigramm',
      owner: 'Christian Janning',
      location: 'Organisation / Freigaben',
      type: 'PDF',
      size: '920 KB',
      version: '3.0',
      changed: '12.06.2026',
      changedBy: 'Christian Janning',
      release: 'Neue Version',
      validity: '31.12.2027',
      reason: 'neue Version vorhanden',
      status: 'new',
    },
    {
      id: 'doc-006',
      name: 'Fahrerlaubnis_Bestaetigung_SGU_007.pdf',
      company: 'Janning Transporte GmbH',
      category: 'Führerscheinkontrolle',
      owner: 'Fuhrpark',
      location: 'Formulare / SGU',
      type: 'PDF',
      size: '760 KB',
      version: '2.0',
      changed: '10.05.2026',
      changedBy: 'Fuhrpark',
      release: 'Freigegeben',
      validity: '31.12.2026',
      reason: 'zuletzt geöffnet',
      status: 'ok',
    },
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
  const [view, setView] = React.useState(isDrive ? 'grid' : 'list');
  const [selected, setSelected] = React.useState([]);
  const [openMenu, setOpenMenu] = React.useState(null);
  const [columnMenu, setColumnMenu] = React.useState(null);
  const [hiddenCols, setHiddenCols] = React.useState([]);
  const [sort, setSort] = React.useState({ key: 'changed', dir: 'desc' });
  const [groupBy, setGroupBy] = React.useState('');

  React.useEffect(() => {
    setView(isDrive ? 'grid' : 'list');
    setSelected([]);
  }, [mode]);

  const visibleColumns = columns.filter(([key]) => !hiddenCols.includes(key));
  const selectedDocs = docs.filter(doc => selected.includes(doc.id));
  const recentDocs = docs.slice(0, 4);
  const suggestedDocs = docs.filter(doc => doc.reason).slice(0, 4);

  const sortedDocs = [...docs].sort((a, b) => {
    const av = String(a[sort.key] || '');
    const bv = String(b[sort.key] || '');
    return sort.dir === 'asc' ? av.localeCompare(bv, 'de') : bv.localeCompare(av, 'de');
  });

  const groupedRows = groupBy
    ? sortedDocs.reduce((acc, doc) => {
        const group = doc[groupBy] || 'Ohne Wert';
        acc[group] = acc[group] || [];
        acc[group].push(doc);
        return acc;
      }, {})
    : null;

  const toggleSelected = (id) => {
    setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === docs.length ? [] : docs.map(doc => doc.id));
  };

  const confirmDelete = (ids) => {
    const amount = Array.isArray(ids) ? ids.length : 1;
    const ok = window.confirm(amount > 1
      ? `Möchten Sie diese ${amount} Dateien wirklich löschen?`
      : 'Möchten Sie diese Datei wirklich löschen?'
    );
    if (!ok) return;
    const deleteIds = Array.isArray(ids) ? ids : [ids];
    setDocs(current => current.filter(doc => !deleteIds.includes(doc.id)));
    setSelected(current => current.filter(id => !deleteIds.includes(id)));
    setOpenMenu(null);
  };

  const actionItems = [
    'Vorschau öffnen',
    'herunterladen',
    'bearbeiten',
    'umbenennen',
    'verschieben',
    'kopieren',
    'neue Version hochladen',
    'Freigabe ändern',
    'Link kopieren',
    'archivieren',
    'löschen',
  ];

  const statusClass = (status) => ({
    ok: 'is-ok',
    warning: 'is-warning',
    review: 'is-review',
    new: 'is-new',
  }[status] || 'is-ok');

  const renderActionMenu = (doc) => (
    <div className="docs-action-menu" onClick={(event) => event.stopPropagation()}>
      <button className="docs-more" onClick={() => setOpenMenu(openMenu === doc.id ? null : doc.id)} aria-label="Dateiaktionen">⋮</button>
      {openMenu === doc.id && (
        <div className="docs-menu-popover">
          {actionItems.map(action => (
            <button
              key={action}
              className={action === 'löschen' ? 'is-danger' : ''}
              onClick={() => action === 'löschen' ? confirmDelete(doc.id) : setOpenMenu(null)}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderColumnHead = ([key, label]) => (
    <th key={key}>
      <div className="docs-column-head">
        <button onClick={() => setColumnMenu(columnMenu === key ? null : key)}>{label}⌄</button>
        {columnMenu === key && (
          <div className="docs-column-menu">
            <button onClick={() => { setSort({ key, dir: 'asc' }); setColumnMenu(null); }}>A bis Z</button>
            <button onClick={() => { setSort({ key, dir: 'desc' }); setColumnMenu(null); }}>Z bis A</button>
            <button onClick={() => setColumnMenu(null)}>Filtern nach</button>
            <button onClick={() => { setGroupBy(key); setColumnMenu(null); }}>Gruppieren nach "{label}"</button>
            <button onClick={() => { setHiddenCols(cols => [...cols, key]); setColumnMenu(null); }}>Spalte ausblenden</button>
          </div>
        )}
      </div>
    </th>
  );

  const renderTableRows = (items) => items.map(doc => (
    <tr key={doc.id} className={selected.includes(doc.id) ? 'is-selected' : ''}>
      <td><input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggleSelected(doc.id)} /></td>
      {visibleColumns.map(([key]) => (
        <td key={key}>
          {key === 'name' && <strong>{doc.name}</strong>}
          {key === 'release' && <span className={`docs-status ${statusClass(doc.status)}`}>{doc.release}</span>}
          {key !== 'name' && key !== 'release' && doc[key]}
        </td>
      ))}
      <td>{renderActionMenu(doc)}</td>
    </tr>
  ));

  return (
    <div className="documents-page">
      <div className="documents-head">
        <div>
          <h1>{title}</h1>
          <p>Dateien, Freigaben, Versionen und Ablageorte zentral verwalten.</p>
        </div>
        <div className="documents-head-actions">
          <div className="segmented">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Liste</button>
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Raster</button>
          </div>
          <button className="btn"><Icon name="download" size={15} /> Export</button>
          <button className="btn primary"><Icon name="upload" size={15} /> Datei hochladen</button>
        </div>
      </div>

      {!isDrive && (
        <div className="documents-top-grid">
          <section className="documents-suggestion-panel">
            <header>
              <h2>Vorgeschlagene Dateien</h2>
              <span>{suggestedDocs.length} Hinweise</span>
            </header>
            <div className="documents-suggestion-list">
              {suggestedDocs.map(doc => (
                <button key={doc.id} className="documents-suggestion-card">
                  <span className={`docs-preview docs-preview--${doc.type.toLowerCase()}`}>{doc.type}</span>
                  <span>
                    <strong>{doc.name}</strong>
                    <small>{doc.company} · {doc.category}</small>
                  </span>
                  <em>{doc.reason}</em>
                </button>
              ))}
            </div>
          </section>
          <section className="documents-suggestion-panel">
            <header>
              <h2>Zuletzt verwendet</h2>
              <span>aktuell</span>
            </header>
            <div className="documents-recent-list">
              {recentDocs.map(doc => (
                <button key={doc.id}>
                  <Icon name="doc" size={16} />
                  <span>
                    <strong>{doc.name}</strong>
                    <small>{doc.changed} · {doc.changedBy}</small>
                  </span>
                  <b>{doc.type}</b>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {selected.length > 0 && (
        <div className="documents-bulkbar">
          <strong>{selected.length} Datei(en) ausgewählt</strong>
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
                <th className="is-select"><input type="checkbox" checked={selected.length === docs.length} onChange={toggleAll} /></th>
                {visibleColumns.map(renderColumnHead)}
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows
                ? Object.entries(groupedRows).map(([group, items]) => (
                    <React.Fragment key={group}>
                      <tr className="docs-group-row"><td colSpan={visibleColumns.length + 2}>{group}<span>{items.length} Dateien</span></td></tr>
                      {renderTableRows(items)}
                    </React.Fragment>
                  ))
                : renderTableRows(sortedDocs)
              }
            </tbody>
          </table>
        </div>
      ) : (
        <div className="documents-grid">
          {sortedDocs.map(doc => (
            <article key={doc.id} className="documents-card">
              <header>
                <div className={`docs-preview docs-preview--${doc.type.toLowerCase()}`}>{doc.type}</div>
                <div>
                  <h3>{doc.name}</h3>
                  <p>{doc.category} · {doc.company}</p>
                </div>
                {renderActionMenu(doc)}
              </header>
              <div className="documents-card-preview">
                <span>{doc.type === 'PDF' ? 'PDF-Vorschau Seite 1' : 'Dateivorschau'}</span>
                <i />
                <i />
                <i />
              </div>
              <dl>
                <div><dt>Eigentümer</dt><dd>{doc.owner}</dd></div>
                <div><dt>Änderungsdatum</dt><dd>{doc.changed}</dd></div>
                <div><dt>Status</dt><dd><span className={`docs-status ${statusClass(doc.status)}`}>{doc.release}</span></dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DocumentsView });
