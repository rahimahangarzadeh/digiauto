function DocumentsView({ mode = 'home' }) {
  const isHome = mode === 'home';

  function file(name, type, changed, owner, size) {
    return { id:'file-' + name, name, type, changed, owner, size };
  }

  const makeYears = (prefix, owner) => ([
    { name:'2022', folders:[], files:[
      file(prefix + '_Aushang_2022.pdf', 'PDF', '12.12.2022', owner, '1.4 MB'),
      file(prefix + '_Nachweis_2022.pdf', 'PDF', '14.12.2022', 'Michael Janning', '980 KB'),
    ]},
    { name:'2023', folders:[], files:[
      file(prefix + '_Baustellenaushang_2023.pdf', 'PDF', '18.11.2023', owner, '1.6 MB'),
      file(prefix + '_Unternehmermodell_2023.pdf', 'PDF', '20.11.2023', 'HSE', '1.1 MB'),
    ]},
    { name:'2024', folders:[], files:[
      file(prefix + '_Aushang_2024.pdf', 'PDF', '09.09.2024', owner, '1.7 MB'),
      file(prefix + '_Pruefnachweis_2024.pdf', 'PDF', '11.09.2024', 'Rahim', '860 KB'),
    ]},
    { name:'2025', folders:[], files:[
      file(prefix + '_Aushang_2025.pdf', 'PDF', '16.10.2025', owner, '1.5 MB'),
      file(prefix + '_Meldebogen_2025.pdf', 'PDF', '17.10.2025', 'Sabine Janning', '760 KB'),
    ]},
    { name:'2026', folders:[], files:[
      file(prefix + '_Aushang_2026.pdf', 'PDF', '24.05.2026', owner, '1.8 MB'),
      file(prefix + '_Meldeformular_2026.pdf', 'PDF', '18.05.2026', 'Sabine Janning', '820 KB'),
    ]},
  ]);

  const initialDrive = {
    name:'Meine Ablage',
    folders:[
      {
        name:'BGBAU',
        folders:[
          { name:'Janning Tiefbau GmbH', folders:makeYears('BGBAU_Tiefbau', 'Sabine Janning'), files:[] },
          { name:'Janning Rohrbau GmbH', folders:makeYears('BGBAU_Rohrbau', 'Thomas Wegener'), files:[] },
          { name:'Janning Bohrtechnik GmbH', folders:makeYears('BGBAU_Bohrtechnik', 'Rahim'), files:[] },
        ],
        files:[]
      },
      {
        name:'Audits',
        folders:[
          { name:'ISO 9001', folders:[
            { name:'2026', folders:[], files:[
              file('Auditplan_ISO_9001_2026.xlsx', 'Excel', '20.05.2026', 'Rahim', '154 KB'),
              file('Auditbericht_ISO_9001_2026.pdf', 'PDF', '21.05.2026', 'Rahim', '2.4 MB'),
              file('Massnahmenliste_ISO_9001_2026.docx', 'Word', '22.05.2026', 'Sabine Janning', '312 KB'),
            ]},
            { name:'2025', folders:[], files:[file('Auditbericht_ISO_9001_2025.pdf', 'PDF', '18.12.2025', 'Sabine Janning', '2.1 MB')] },
          ], files:[] },
          { name:'SCC', folders:[{ name:'2026', folders:[], files:[file('SCC_Audit_Checkliste_2026.xlsx', 'Excel', '06.05.2026', 'Michael Janning', '188 KB')] }], files:[] },
        ],
        files:[]
      },
      {
        name:'Referenzschreiben',
        folders:[
          { name:'Tiefbau', folders:[{ name:'2026', folders:[], files:[file('Referenz_Kanalsanierung_Nordhorn.pdf', 'PDF', '14.05.2026', 'Sabine Janning', '650 KB')] }], files:[] },
          { name:'Rohrbau', folders:[{ name:'2026', folders:[], files:[file('Referenz_Hausanschluesse_Suedring.docx', 'Word', '08.05.2026', 'Thomas Wegener', '238 KB')] }], files:[] },
        ],
        files:[]
      },
      {
        name:'Unfallstatistik',
        folders:[
          { name:'2026', folders:[], files:[
            file('Unfallstatistik_Q1_2026.xlsx', 'Excel', '31.03.2026', 'HSE', '121 KB'),
            file('Beinaheunfaelle_2026.pdf', 'PDF', '12.05.2026', 'HSE', '740 KB'),
          ]},
          { name:'2025', folders:[], files:[file('Unfallstatistik_2025.xlsx', 'Excel', '10.01.2026', 'HSE', '144 KB')] },
        ],
        files:[]
      },
      {
        name:'Gefaehrdungsbeurteilung',
        folders:[
          { name:'Tiefbau', folders:[{ name:'2026', folders:[], files:[file('GB_Tiefbau_Baustelle_2026.pdf', 'PDF', '02.05.2026', 'Rahim', '1.2 MB')] }], files:[] },
          { name:'Rohrbau', folders:[{ name:'2026', folders:[], files:[file('GB_Rohrbau_Graben_2026.pdf', 'PDF', '05.05.2026', 'Rahim', '1.1 MB')] }], files:[] },
        ],
        files:[]
      },
    ],
    files:[]
  };

  const storageKey = 'document_drive_v1';
  const [drive, setDrive] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null') || initialDrive; }
    catch { return initialDrive; }
  });
  const [path, setPath] = React.useState([]);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [newOpen, setNewOpen] = React.useState(false);
  const [titleMenuOpen, setTitleMenuOpen] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const folderInputRef = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(drive)); } catch {}
  }, [drive]);

  React.useEffect(() => {
    setSelectedIds([]);
    if (isHome) setPath([]);
  }, [mode]);

  const getFolder = (node, folderPath) => {
    let current = node;
    for (const name of folderPath) {
      current = (current.folders || []).find(folder => folder.name === name) || current;
    }
    return current;
  };

  const walkFiles = (node, parts = []) => {
    const files = (node.files || []).map(doc => ({
      ...doc,
      kind:'file',
      path:parts,
      rowId:['file', ...parts, doc.name].join('/'),
      storage:parts.length ? parts.join(' / ') : 'Meine Ablage',
      reason:doc.changed ? 'Geaendert am ' + doc.changed : 'In Meine Ablage',
    }));
    return [
      ...files,
      ...(node.folders || []).flatMap(folder => walkFiles(folder, [...parts, folder.name])),
    ];
  };

  const current = getFolder(drive, path);
  const driveRows = [
    ...(current.folders || []).map(folder => ({ ...folder, kind:'folder', rowId:['folder', ...path, folder.name].join('/'), path:[...path, folder.name] })),
    ...(current.files || []).map(doc => ({ ...doc, kind:'file', rowId:['file', ...path, doc.name].join('/'), path, storage:path.join(' / ') || 'Meine Ablage' })),
  ];
  const homeRows = walkFiles(drive);
  const rows = isHome ? homeRows : driveRows;

  const updateFolder = (targetPath, updater) => {
    const walk = (node, rest) => {
      if (!rest.length) return updater(node);
      return {
        ...node,
        folders:(node.folders || []).map(folder => folder.name === rest[0] ? walk(folder, rest.slice(1)) : folder),
      };
    };
    setDrive(prev => walk(prev, targetPath));
  };

  const createFolder = () => {
    const name = window.prompt('Ordnername');
    if (!name) return;
    updateFolder(path, folder => ({
      ...folder,
      folders:[...(folder.folders || []), { name, folders:[], files:[] }],
    }));
    setNewOpen(false);
    setTitleMenuOpen(false);
  };

  const fileType = (name) => {
    const ext = String(name).split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['xlsx','xls','csv'].includes(ext)) return 'Excel';
    if (['docx','doc'].includes(ext)) return 'Word';
    if (['png','jpg','jpeg','webp'].includes(ext)) return 'Bild';
    if (['zip','rar'].includes(ext)) return 'Archiv';
    return ext ? ext.toUpperCase() : 'Datei';
  };

  const formatSize = (size) => {
    if (!size) return '-';
    if (size > 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB';
    return Math.max(1, Math.round(size / 1024)) + ' KB';
  };

  const addFiles = (event) => {
    const uploaded = Array.from(event.target.files || []).map(item => ({
      id:'file-' + Date.now() + '-' + item.name,
      name:item.name,
      type:fileType(item.name),
      changed:new Date().toLocaleDateString('de-DE'),
      owner:'Michael Janning',
      size:formatSize(item.size),
    }));
    if (!uploaded.length) return;
    updateFolder(path, folder => ({ ...folder, files:[...(folder.files || []), ...uploaded] }));
    event.target.value = '';
    setNewOpen(false);
    setTitleMenuOpen(false);
  };

  const addFolderUpload = (event) => {
    const uploaded = Array.from(event.target.files || []);
    if (!uploaded.length) return;
    const firstFolder = uploaded[0].webkitRelativePath?.split('/')?.[0] || 'Hochgeladener Ordner';
    const files = uploaded.map(item => ({
      id:'file-' + Date.now() + '-' + item.name,
      name:item.name,
      type:fileType(item.name),
      changed:new Date().toLocaleDateString('de-DE'),
      owner:'Michael Janning',
      size:formatSize(item.size),
    }));
    updateFolder(path, folder => ({
      ...folder,
      folders:[...(folder.folders || []), { name:firstFolder, folders:[], files }],
    }));
    event.target.value = '';
    setNewOpen(false);
    setTitleMenuOpen(false);
  };

  const deleteByPath = (row) => {
    if (isHome && row.kind === 'file') {
      updateFolder(row.path, folder => ({ ...folder, files:(folder.files || []).filter(item => item.name !== row.name) }));
      setSelectedIds(ids => ids.filter(id => id !== row.rowId));
      return;
    }
    updateFolder(path, folder => row.kind === 'folder'
      ? { ...folder, folders:(folder.folders || []).filter(item => item.name !== row.name) }
      : { ...folder, files:(folder.files || []).filter(item => item.name !== row.name) }
    );
    setSelectedIds(ids => ids.filter(id => id !== row.rowId));
  };

  const deleteSelected = () => {
    if (isHome) {
      selectedIds.forEach(id => {
        const row = rows.find(item => item.rowId === id);
        if (row) deleteByPath(row);
      });
      setSelectedIds([]);
      return;
    }
    updateFolder(path, folder => ({
      ...folder,
      folders:(folder.folders || []).filter(item => !selectedIds.includes(['folder', ...path, item.name].join('/'))),
      files:(folder.files || []).filter(item => !selectedIds.includes(['file', ...path, item.name].join('/'))),
    }));
    setSelectedIds([]);
  };

  const toggleSelected = (id) => setSelectedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
  const allSelected = rows.length > 0 && rows.every(row => selectedIds.includes(row.rowId));
  const toggleAll = () => setSelectedIds(allSelected ? [] : rows.map(row => row.rowId));
  const typeColor = (type) => ({
    PDF:'#a13232',
    Excel:'#3f7a4a',
    Word:'#2d6fa3',
    Bild:'#8a6a1f',
    Archiv:'#6f6a60',
    Ordner:'#4d4a43',
  }[type] || 'var(--fg-2)');

  return (
    <div>
      <style>{`
        .drive-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px; }
        .drive-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:16px 0; }
        .drive-new { position:relative; }
        .drive-new-menu { position:absolute; top:calc(100% + 8px); right:0; width:230px; background:white; border:1px solid var(--border-1); border-radius:10px; box-shadow:0 14px 40px rgba(0,0,0,.14); padding:6px; z-index:20; }
        .drive-new-menu button { width:100%; border:0; background:transparent; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; font:inherit; text-align:left; cursor:pointer; }
        .drive-new-menu button:hover { background:var(--color-warm-sand); }
        .drive-title-menu { position:relative; display:inline-block; }
        .drive-title-button { border:1px solid transparent; background:transparent; border-radius:999px; margin:0 0 6px; padding:2px 10px 4px 0; font:inherit; font-size:36px; color:var(--fg-1); cursor:pointer; display:inline-flex; align-items:center; gap:8px; }
        .drive-title-button:hover, .drive-title-button.is-open { border-color:#88aef4; box-shadow:0 0 0 1px #88aef4 inset; }
        .drive-title-menu .drive-new-menu { left:0; right:auto; top:calc(100% + 2px); width:300px; border-radius:0 0 4px 4px; padding:0; }
        .drive-title-menu .drive-new-menu button { border-radius:0; min-height:48px; justify-content:space-between; }
        .drive-title-menu .drive-new-menu button span:first-child { display:inline-flex; align-items:center; gap:14px; }
        .drive-shortcut { color:var(--fg-3); font-size:13px; white-space:nowrap; }
        .drive-breadcrumb { display:flex; flex-wrap:wrap; align-items:center; gap:6px; color:var(--fg-3); font-size:14px; }
        .drive-breadcrumb button { border:0; background:transparent; color:var(--fg-1); font:inherit; cursor:pointer; padding:0; }
        .drive-view-toggle { display:inline-flex; border:1px solid var(--border-1); border-radius:999px; overflow:hidden; background:white; }
        .drive-view-toggle span { padding:7px 12px; }
        .drive-view-toggle span:first-child { background:#d8ecfb; color:#0d3854; font-weight:700; }
        .drive-row-name { border:0; background:transparent; padding:0; display:inline-flex; align-items:center; gap:10px; font:inherit; color:var(--fg-1); cursor:pointer; }
        .drive-row-file { cursor:default; }
      `}</style>

      <div className="drive-head">
        <div>
          {isHome ? (
            <h1 style={{ margin:'0 0 6px', fontSize:36 }}>Startseite</h1>
          ) : (
            <div className="drive-title-menu">
              <button className={'drive-title-button' + (titleMenuOpen ? ' is-open' : '')} onClick={() => { setNewOpen(false); setTitleMenuOpen(open => !open); }}>
                Meine Ablage <Icon name="chev" size={18} />
              </button>
              {titleMenuOpen && (
                <div className="drive-new-menu">
                  <button onClick={createFolder}>
                    <span><Icon name="building" size={16} />Neuer Ordner</span>
                    <span className="drive-shortcut">Alt+C dann F</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()}>
                    <span><Icon name="upload" size={16} />Dateien hochladen</span>
                    <span className="drive-shortcut">Alt+C dann U</span>
                  </button>
                  <button onClick={() => folderInputRef.current?.click()}>
                    <span><Icon name="upload" size={16} />Ordner hochladen</span>
                    <span className="drive-shortcut">Alt+C dann I</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <p className="muted" style={{ margin:0 }}>
            {isHome ? 'Alle Dateien aus der Ablage als klare Liste.' : 'Ordner, Unterordner und Dateien wie in einer Drive-Ablage verwalten.'}
          </p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" multiple onChange={addFiles} style={{ display:'none' }} />
          <input ref={folderInputRef} type="file" multiple webkitdirectory="true" onChange={addFolderUpload} style={{ display:'none' }} />
        </div>
      </div>

      <div className="drive-toolbar">
        <div className="drive-breadcrumb">
          {isHome ? (
            <strong>Vorgeschlagene Dateien</strong>
          ) : (
            <>
              <button onClick={() => setPath([])}>Meine Ablage</button>
              {path.map((part, index) => (
                <React.Fragment key={part + index}>
                  <span>/</span>
                  <button onClick={() => setPath(path.slice(0, index + 1))}>{part}</button>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
        <div className="drive-view-toggle" aria-label="Ansicht">
          <span>Liste</span>
          <span>Raster</span>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="job-bulkbar">
          <strong>{selectedIds.length} ausgewaehlt</strong>
          <button><Icon name="download" size={14} />Download</button>
          <button><Icon name="edit" size={14} />Umbenennen</button>
          <button className="is-danger" onClick={deleteSelected}><Icon name="x" size={14} />Loeschen</button>
        </div>
      )}

      <div className="tbl-wrap">
        <table className="tbl job-table">
          <thead>
            <tr>
              <th style={{ width:38 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th>Name</th>
              {isHome && <th>Vorgeschlagener Grund</th>}
              <th>Eigentuemer</th>
              <th>{isHome ? 'Speicherort' : 'Aenderungsdatum'}</th>
              {!isHome && <th>Dateigroesse</th>}
              {isHome && <th>Typ</th>}
              <th style={{ textAlign:'center' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.rowId} className="job-row" onDoubleClick={() => row.kind === 'folder' && setPath(row.path)}>
                <td><input type="checkbox" checked={selectedIds.includes(row.rowId)} onChange={() => toggleSelected(row.rowId)} /></td>
                <td>
                  <button
                    className={'drive-row-name' + (row.kind === 'file' ? ' drive-row-file' : '')}
                    onClick={() => row.kind === 'folder' ? setPath(row.path) : null}
                  >
                    <Icon name={row.kind === 'folder' ? 'building' : 'doc'} size={16} style={{ color:typeColor(row.kind === 'folder' ? 'Ordner' : row.type) }} />
                    <strong>{row.name}</strong>
                  </button>
                </td>
                {isHome && <td>{row.reason}</td>}
                <td>{row.owner || 'Ich'}</td>
                <td>{isHome ? row.storage : (row.kind === 'folder' ? '-' : row.changed)}</td>
                {!isHome && <td>{row.kind === 'folder' ? '-' : row.size}</td>}
                {isHome && <td><span className="badge" style={{ color:typeColor(row.type) }}>{row.type}</span></td>}
                <td style={{ textAlign:'center' }}>
                  <div style={{ display:'inline-flex', gap:8 }}>
                    <button className="job-icon-btn" title="Vorschau"><Icon name="eye" size={15} /></button>
                    <button className="job-icon-btn" title="Download"><Icon name="download" size={15} /></button>
                    <button className="job-icon-btn" title="Bearbeiten"><Icon name="edit" size={15} /></button>
                    <button className="job-icon-btn" title="Loeschen" style={{ color:'#a13232' }} onClick={() => deleteByPath(row)}><Icon name="trash" size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={isHome ? 7 : 6} style={{ textAlign:'center', color:'var(--fg-3)', padding:28 }}>Dieser Bereich ist leer.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { DocumentsView });
