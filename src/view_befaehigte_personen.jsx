function BefaehigtePersonenView({ activeCompany }) {
  const employees = window.SEED.employees
    .filter(e => e.status === 'aktiv')
    .filter(e => activeCompany === 'all' || e.company === activeCompany);
  const allEmployees = window.SEED.employees.filter(e => e.status === 'aktiv');
  const emp = id => allEmployees.find(e => e.id === id) || allEmployees[0];
  const today = new Date(window.SEED.today || '2026-04-21');
  const areas = [
    'Erdbaumaschinen',
    'Verbaugeräte',
    'Straßenbaumaschinen',
    'Gleisbaumaschinen',
    'Rammen und Bohrgeräte',
    'Fahrzeuge',
    'Hubarbeitsbühnen',
    'schwimmende Geräte incl. Maschinenanl.',
    'Flurförderzeuge / Gabelstapler',
    'Teleskoplader /-stapler',
    'elektrische Anlagen und Betriebsmittel',
    'Lastaufnahmeeinrichtungen',
    'Personenaufnahmemittel (PAM)',
    'Gerüste',
    'Leitern',
    'PSA gegen Absturz',
    'Holzbearbeitungsmaschinen',
    'Kleinmaschinen / -geräte',
  ];
  const areaLabelMap = {
    Verbaugeraete: 'Verbaugeräte',
    Strassenbaumaschinen: 'Straßenbaumaschinen',
    'Rammen und Bohrgeraete': 'Rammen und Bohrgeräte',
    Hubarbeitsbuehnen: 'Hubarbeitsbühnen',
    'Schwimmende Geraete inkl. Maschinenanlagen': 'schwimmende Geräte incl. Maschinenanl.',
    'Flurfoerderzeuge / Gabelstapler': 'Flurförderzeuge / Gabelstapler',
    'Teleskoplader / -stapler': 'Teleskoplader /-stapler',
    'Elektrische Anlagen und Betriebsmittel': 'elektrische Anlagen und Betriebsmittel',
    Gerueste: 'Gerüste',
    'Kleinmaschinen / -geraete': 'Kleinmaschinen / -geräte',
  };
  const normalizeArea = value => areaLabelMap[value] || value;
  const areaList = value => Array.isArray(value)
    ? value.map(normalizeArea).filter(Boolean)
    : String(value || '').split(',').map(item => normalizeArea(item.trim())).filter(Boolean);
  const areaText = value => areaList(value).join(', ');
  const normalizeRows = list => list.map(row => ({ ...row, area: areaList(row.area) }));
  const make = (id, empIndex, area, validFrom, validUntil, responsible, document, note) => {
    const person = allEmployees[empIndex % allEmployees.length];
    return {
      id,
      employeeId: person.id,
      company: window.company(person.company)?.name || person.company,
      area,
      authorization: 'Beauftragung zur Pruefung befaehigte Person',
      validFrom,
      validUntil,
      responsible,
      document,
      note,
    };
  };
  const initialRows = [
    make('bp-1', 0, 'Leitern', '2025-02-01', '2027-02-01', 'Sabine Janning', 'BP_Leitern_Markus_Brinker.pdf', 'Pruefung von Leitern und Tritten auf Baustellen.'),
    make('bp-2', 2, 'Gerüste', '2025-05-12', '2027-05-12', 'Michael Janning', 'BP_Gerueste_Dirk_Juergens.pdf', 'Sichtpruefung und Dokumentation Geruestfreigabe.'),
    make('bp-3', 3, 'PSA gegen Absturz', '2024-11-20', '2026-11-20', 'QSGU', 'BP_PSAgA_Tobias_Nowak.pdf', 'Kontrolle von PSA gegen Absturz und Rettungssets.'),
    make('bp-4', 4, 'Elektrische Anlagen und Betriebsmittel', '2024-04-01', '2026-03-31', 'QSGU', 'BP_Elektro_Ralf_Kowalski.pdf', 'DGUV V3 Sicht- und Funktionspruefung, bald neu beauftragen.'),
    make('bp-5', 5, 'Flurförderzeuge / Gabelstapler', '2025-09-15', '2027-09-15', 'Sabine Janning', 'BP_Stapler_Maik_Wiegmann.pdf', 'Pruefung Anbaugeraete und Staplerzubehoer.'),
    make('bp-6', 6, 'Erdbaumaschinen', '2023-03-10', '2026-03-10', 'Michael Janning', 'BP_Erdbaumaschinen_Thomas_Lange.pdf', 'Beauftragung abgelaufen, Nachweis erneuern.'),
    make('bp-7', 7, 'Lastaufnahmeeinrichtungen', '2025-06-18', '2027-06-18', 'QSGU', 'BP_Lastaufnahme_Daniel_Vogt.pdf', 'Ketten, Hebebaender und Anschlagpunkte.'),
    make('bp-8', 8, 'Hubarbeitsbühnen', '2025-10-02', '2027-10-02', 'Sabine Janning', 'BP_Hubarbeitsbuehnen_Lukas_Schroeder.pdf', 'Sichtpruefung vor Einsatz und Dokumentation.'),
    make('bp-9', 9, 'Kleinmaschinen / -geräte', '2025-01-22', '2027-01-22', 'QSGU', 'BP_Kleinmaschinen_Andreas_Oezdemir.pdf', 'Rüttelplatten, Trennschleifer, Pumpen, Kompressoren.'),
    make('bp-10', 10, 'Teleskoplader / -stapler', '2025-08-05', '2027-08-05', 'Michael Janning', 'BP_Teleskoplader_Mustafa_Kempers.pdf', 'Pruefung von Anbaugeraeten und Sicherheitsfunktionen.'),
    make('bp-11', 11, 'Verbaugeräte', '2025-04-16', '2027-04-16', 'Sabine Janning', 'BP_Verbau_Heiko_Lammers.pdf', 'Verbauplatten und Spreizen, Zustand und Vollstaendigkeit.'),
    make('bp-12', 12, 'Fahrzeuge', '2024-06-01', '2026-06-20', 'Fuhrpark', 'BP_Fahrzeuge_Bernd_Wittke.pdf', 'Interne Fuhrpark-Pruefung, laeuft bald ab.'),
  ];
  const [rows, setRows] = React.useState(() => {
    try { return normalizeRows(JSON.parse(localStorage.getItem('befaehigte_personen_rows_v1') || 'null') || initialRows); }
    catch { return normalizeRows(initialRows); }
  });
  const [sort, setSort] = React.useState({ col: 'employee', dir: 'asc' });
  const [filters, setFilters] = React.useState({});
  const [groupBy, setGroupBy] = React.useState('');
  const [menuCol, setMenuCol] = React.useState(null);
  const [filterPanel, setFilterPanel] = React.useState(null);
  const [filterSearch, setFilterSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [detail, setDetail] = React.useState(null);
  const [areaPickerId, setAreaPickerId] = React.useState(null);

  React.useEffect(() => {
    try { localStorage.setItem('befaehigte_personen_rows_v1', JSON.stringify(rows)); } catch {}
  }, [rows]);

  const fmt = iso => {
    if (!iso) return '-';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };
  const statusOf = row => {
    if (!row.document) return 'Kein Nachweis';
    const days = Math.ceil((new Date(row.validUntil) - today) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Abgelaufen';
    if (days <= 60) return 'Laeuft bald ab';
    return 'Gueltig';
  };
  const statusBadgeClass = status => status === 'Gueltig' ? 'badge--valid' : status === 'Laeuft bald ab' ? 'badge--warn' : 'badge--expired';
  const columns = [
    { key: 'employee', label: 'Mitarbeiter', value: r => emp(r.employeeId)?.name || '-' },
    { key: 'area', label: 'Arbeitsmittel-Bereiche', value: r => areaText(r.area) },
    { key: 'authorization', label: 'Befähigung / Beauftragung', value: r => r.authorization },
    { key: 'validFrom', label: 'Gültig ab', type: 'date', value: r => r.validFrom, display: r => fmt(r.validFrom) },
    { key: 'validUntil', label: 'Gültig bis', type: 'date', value: r => r.validUntil, display: r => fmt(r.validUntil) },
    { key: 'status', label: 'Status', value: r => statusOf(r) },
    { key: 'note', label: 'Bemerkung', value: r => r.note },
  ];
  const colValue = (row, key) => columns.find(c => c.key === key)?.value(row) ?? row[key];
  const colLabel = key => columns.find(c => c.key === key)?.label || key;
  const scopedRows = rows.filter(row => activeCompany === 'all' || emp(row.employeeId)?.company === activeCompany);
  const filtered = scopedRows
    .filter(row => Object.entries(filters).every(([col, values]) => values.includes(colValue(row, col))))
    .sort((a, b) => {
      const col = columns.find(c => c.key === sort.col);
      const av = colValue(a, sort.col);
      const bv = colValue(b, sort.col);
      if (col?.type === 'date') {
        const result = new Date(av) - new Date(bv);
        return sort.dir === 'asc' ? result : -result;
      }
      const result = String(av || '').localeCompare(String(bv || ''), 'de');
      return sort.dir === 'asc' ? result : -result;
    });
  const grouped = groupBy ? filtered.reduce((acc, row) => {
    const value = colValue(row, groupBy) || 'Leer';
    if (!acc[value]) acc[value] = [];
    acc[value].push(row);
    return acc;
  }, {}) : null;
  const filterValues = filterPanel
    ? Array.from(new Set(scopedRows.map(row => colValue(row, filterPanel))))
      .filter(value => String(value || '').toLowerCase().includes(filterSearch.toLowerCase()))
      .sort((a, b) => String(a).localeCompare(String(b), 'de'))
    : [];
  const visibleIds = filtered.map(row => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const toggleRow = id => setSelectedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
  const toggleAllVisible = () => setSelectedIds(ids => allVisibleSelected ? ids.filter(id => !visibleIds.includes(id)) : Array.from(new Set([...ids, ...visibleIds])));
  const setColumnSort = (col, dir) => { setSort({ col, dir }); setMenuCol(null); };
  const toggleFilterValue = (col, value) => {
    setFilters(current => {
      const selected = current[col] || [];
      const nextValues = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      const next = { ...current };
      if (nextValues.length) next[col] = nextValues;
      else delete next[col];
      return next;
    });
  };
  const clearFilterValue = (col, value) => {
    setFilters(current => {
      const nextValues = (current[col] || []).filter(item => item !== value);
      const next = { ...current };
      if (nextValues.length) next[col] = nextValues;
      else delete next[col];
      return next;
    });
  };
  const deleteRow = row => setRows(current => current.filter(item => item.id !== row.id));
  const toggleRowArea = (rowId, area) => setRows(current => current.map(row => {
    if (row.id !== rowId) return row;
    const selected = areaList(row.area);
    const next = selected.includes(area) ? selected.filter(item => item !== area) : [...selected, area];
    return { ...row, area: next.length ? next : [area] };
  }));
  const toggleDetailArea = area => setDetail(current => {
    const selected = areaList(current.area);
    const next = selected.includes(area) ? selected.filter(item => item !== area) : [...selected, area];
    return { ...current, area: next.length ? next : [area] };
  });
  const deleteSelected = () => {
    setRows(current => current.filter(row => !selectedIds.includes(row.id)));
    setSelectedIds([]);
  };
  const changeSelectedStatus = (status) => {
    setRows(current => current.map(row => selectedIds.includes(row.id)
      ? { ...row, validUntil: status === 'Abgelaufen' ? '2026-01-01' : status === 'Laeuft bald ab' ? '2026-06-20' : '2027-12-31' }
      : row));
  };
  const addRow = () => {
    const person = employees[0] || allEmployees[0];
    const next = {
      id: 'bp-' + Date.now(),
      employeeId: person.id,
      company: window.company(person.company)?.name || person.company,
      area: [areas[0]],
      authorization: 'Beauftragung zur Pruefung befaehigte Person',
      validFrom: '2026-06-01',
      validUntil: '2028-06-01',
      responsible: 'QSGU',
      document: 'Neue_Beauftragung.pdf',
      note: 'Neue Beauftragung erfassen.',
    };
    setRows(current => [next, ...current]);
    setDetail(next);
  };
  const saveDetail = () => {
    const selectedEmp = emp(detail.employeeId);
    const next = { ...detail, company: window.company(selectedEmp.company)?.name || selectedEmp.company };
    setRows(current => current.map(row => row.id === next.id ? next : row));
    setDetail(null);
  };
  const kpis = [
    { label: 'Befähigte Personen', value: new Set(scopedRows.map(r => r.employeeId)).size, color: '#3f7a4a' },
    { label: 'Gültig', value: scopedRows.filter(r => statusOf(r) === 'Gueltig').length, color: '#3f7a4a', filter: 'Gueltig' },
    { label: 'Läuft bald ab', value: scopedRows.filter(r => statusOf(r) === 'Laeuft bald ab').length, color: '#8a6a1f', filter: 'Laeuft bald ab' },
    { label: 'Abgelaufen / fehlt', value: scopedRows.filter(r => statusOf(r) === 'Abgelaufen' || statusOf(r) === 'Kein Nachweis').length, color: '#a13232' },
  ];
  const ColumnHeader = ({ col }) => {
    const active = sort.col === col.key || filters[col.key]?.length || groupBy === col.key;
    return (
      <th style={{ position: 'relative', whiteSpace: 'nowrap' }}>
        <button type="button" onClick={() => { setMenuCol(menuCol === col.key ? null : col.key); setFilterSearch(''); }}
          style={{ border: 0, background: active ? 'var(--color-parchment)' : 'transparent', borderRadius: 6, padding: '7px 8px', cursor: 'pointer', font: 'inherit', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {col.label}{sort.col === col.key ? <span>{sort.dir === 'asc' ? '^' : 'v'}</span> : <span style={{ opacity: .55 }}>v</span>}
        </button>
        {menuCol === col.key && (
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, minWidth: 260, background: 'white', border: '1px solid var(--border-1)', boxShadow: '0 16px 40px rgba(0,0,0,0.14)', borderRadius: 4, padding: '6px 0', textTransform: 'none', fontSize: 14, color: 'var(--fg-1)', letterSpacing: 0 }}>
            <button type="button" onClick={() => setColumnSort(col.key, 'asc')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 18px', border: 0, background: 'white', cursor: 'pointer', font: 'inherit' }}>A bis Z</button>
            <button type="button" onClick={() => setColumnSort(col.key, 'desc')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 18px', border: 0, background: 'white', cursor: 'pointer', font: 'inherit' }}>Z bis A</button>
            <button type="button" onClick={() => { setFilterPanel(col.key); setFilterSearch(''); setMenuCol(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 18px', border: 0, borderTop: '1px solid var(--border-1)', background: '#f3f2f1', cursor: 'pointer', font: 'inherit' }}>Filtern nach</button>
            <button type="button" onClick={() => { setGroupBy(groupBy === col.key ? '' : col.key); setColumnSort(col.key, 'asc'); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 18px', border: 0, background: 'white', cursor: 'pointer', font: 'inherit' }}>Gruppieren nach "{col.label}"</button>
          </div>
        )}
      </th>
    );
  };
  const Row = ({ row }) => {
    const person = emp(row.employeeId);
    const status = statusOf(row);
    return (
      <tr className={'job-row' + (selectedIds.includes(row.id) ? ' is-selected' : '')} onClick={() => setDetail({ ...row })}>
        <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>
        <td><strong>{person.name}</strong><div className="small muted">{person.position}</div></td>
        <td onClick={e => e.stopPropagation()}>
          <div className="bp-area-picker">
            <button type="button" className="bp-area-button" onClick={() => setAreaPickerId(areaPickerId === row.id ? null : row.id)}>
              {areaList(row.area).slice(0, 2).map(area => <span className="bp-area-chip" key={area}>{area}</span>)}
              {areaList(row.area).length > 2 && <span className="bp-area-chip">+{areaList(row.area).length - 2}</span>}
            </button>
            {areaPickerId === row.id && (
              <div className="bp-area-menu">
                {areas.map(area => (
                  <label key={area}>
                    <input type="checkbox" checked={areaList(row.area).includes(area)} onChange={() => toggleRowArea(row.id, area)} />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </td>
        <td>{row.authorization}</td>
        <td>{fmt(row.validFrom)}</td>
        <td>{fmt(row.validUntil)}</td>
        <td><span className={'badge ' + statusBadgeClass(status)}><span className="badge__dot" />{status}</span></td>
        <td style={{ minWidth: 240, whiteSpace: 'normal' }}>{row.note}</td>
        <td onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: 6 }}>
            <button className="job-icon-btn" title="Vorschau"><Icon name="eye" size={15} /></button>
            <button className="job-icon-btn" title="Bearbeiten" onClick={() => setDetail({ ...row })}><Icon name="edit" size={15} /></button>
            <button className="job-icon-btn" title="Loeschen" style={{ color: '#a13232' }} onClick={() => deleteRow(row)}><Icon name="trash" size={15} /></button>
          </div>
        </td>
      </tr>
    );
  };
  const renderRows = list => list.map(row => <Row key={row.id} row={row} />);

  return (
    <div>
      <style>{`
        .bp-table { min-width: 1320px; }
        .bp-area-picker { position: relative; min-width: 300px; max-width: 420px; }
        .bp-area-button { width: 100%; min-height: 40px; border: 1px solid var(--border-1); border-radius: 8px; background: white; padding: 7px 10px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; cursor: pointer; text-align: left; }
        .bp-area-chip { display: inline-flex; align-items: center; max-width: 175px; border-radius: 999px; background: var(--color-parchment); padding: 4px 8px; font-size: 12px; color: var(--fg-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bp-area-menu { position: absolute; z-index: 80; top: calc(100% + 6px); left: 0; width: min(380px, 72vw); max-height: 310px; overflow: auto; background: white; border: 1px solid var(--border-1); border-radius: 8px; box-shadow: 0 18px 45px rgba(0,0,0,.16); padding: 8px; display: grid; gap: 4px; }
        .bp-area-menu label { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 6px; cursor: pointer; }
        .bp-area-menu label:hover { background: var(--color-parchment); }
        .bp-filter-panel { position: fixed; right: 0; top: 64px; bottom: 0; width: 390px; z-index: 120; background: white; box-shadow: -18px 0 50px rgba(0,0,0,.16); display: flex; flex-direction: column; }
        .bp-drawer { position: fixed; top: 64px; right: 0; bottom: 0; width: min(760px, 96vw); z-index: 120; background: var(--color-ivory); border-left: 1px solid var(--border-1); box-shadow: -18px 0 42px rgba(0,0,0,.18); display: flex; flex-direction: column; }
        .bp-hero { background: #10100f; color: white; padding: 24px; display: flex; gap: 16px; align-items: flex-start; position: relative; }
        .bp-hero h2 { margin: 0 0 6px; font-family: var(--font-serif); font-size: 25px; font-weight: 500; }
        .bp-close { position: absolute; top: 18px; right: 18px; border: 0; background: transparent; color: rgba(255,255,255,.7); cursor: pointer; }
        .bp-body { overflow: auto; padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .bp-body label { display: grid; gap: 7px; margin: 0; min-width: 0; }
        .bp-body .form-label { font-size: 11px; line-height: 1; font-weight: 800; color: var(--fg-3); text-transform: uppercase; }
        .bp-body .input { width: 100%; min-height: 44px; border: 1px solid var(--border-1); border-radius: 8px; background: white; padding: 0 12px; font: inherit; box-sizing: border-box; }
        .bp-body textarea.input { min-height: 96px; padding: 10px 12px; resize: vertical; }
      `}</style>
      <div className="view__header">
        <div>
          <h1 className="view__title">Befähigte Personen</h1>
          <div className="view__subtitle">Beauftragungen zur Prüfung von Arbeitsmitteln, Geräten und Maschinen.</div>
        </div>
        <div className="view__actions">
          <button className="btn btn--primary" onClick={addRow}><Icon name="plus" size={14} />Beauftragung erstellen</button>
        </div>
      </div>

      <div className="job-kpis" style={{ gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))' }}>
        {kpis.map(kpi => (
          <button key={kpi.label} type="button" className="job-kpi" onClick={() => kpi.filter && setFilters({ status: [kpi.filter] })} style={{ '--job-kpi-color': kpi.color }}>
            <span>{kpi.label}</span><strong>{kpi.value}</strong>
          </button>
        ))}
      </div>

      {(Object.entries(filters).some(([, values]) => values.length) || groupBy) && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          {Object.entries(filters).map(([col, values]) => values.map(value => (
            <span key={col + value} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: 'var(--color-parchment)', borderRadius: 999, padding: '6px 10px' }}>
              <span style={{ color: 'var(--fg-2)' }}>{colLabel(col)}:</span>{String(value)}
              <button onClick={() => clearFilterValue(col, value)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>x</button>
            </span>
          )))}
          {groupBy && <span style={{ background: 'var(--color-parchment)', borderRadius: 999, padding: '6px 10px' }}>Gruppiert nach: {colLabel(groupBy)}</span>}
          <button className="btn btn--ghost" onClick={() => { setFilters({}); setGroupBy(''); }}>Filter zurücksetzen</button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="job-bulkbar">
          <strong>{selectedIds.length} ausgewählt</strong>
          <button className="btn btn--ghost"><Icon name="download" size={14} />PDF export</button>
          <select className="input" style={{ width: 190 }} onChange={event => event.target.value && changeSelectedStatus(event.target.value)} defaultValue="">
            <option value="" disabled>Status ändern</option>
            <option value="Gueltig">Gültig</option>
            <option value="Laeuft bald ab">Läuft bald ab</option>
            <option value="Abgelaufen">Abgelaufen</option>
          </select>
          <button className="btn btn--danger" onClick={deleteSelected}>Löschen</button>
        </div>
      )}

      <div className="tbl-wrap">
        <table className="tbl bp-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} /></th>
              {columns.map(col => <ColumnHeader key={col.key} col={col} />)}
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {grouped
              ? Object.entries(grouped).map(([group, groupRows]) => (
                <React.Fragment key={group}>
                  <tr><td colSpan={columns.length + 2} style={{ background: 'var(--color-parchment)', fontWeight: 800 }}>{colLabel(groupBy)}: {group} ({groupRows.length})</td></tr>
                  {renderRows(groupRows)}
                </React.Fragment>
              ))
              : renderRows(filtered)}
          </tbody>
        </table>
      </div>

      {filterPanel && (
        <div className="bp-filter-panel">
          <div style={{ padding: 22, borderBottom: '1px solid var(--border-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Filtern nach "{colLabel(filterPanel)}"</h2>
            <button className="icon-btn" onClick={() => setFilterPanel(null)}><Icon name="x" size={18} /></button>
          </div>
          <div style={{ padding: 18 }}>
            <input className="input" placeholder="Text eingeben, um Filter zu finden" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
          </div>
          <div style={{ overflow: 'auto', padding: '0 18px 18px', display: 'grid', gap: 12 }}>
            {filterValues.map(value => (
              <label key={String(value)} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="checkbox" checked={(filters[filterPanel] || []).includes(value)} onChange={() => toggleFilterValue(filterPanel, value)} />
                <span>{String(value)}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: 18, borderTop: '1px solid var(--border-1)', display: 'flex', gap: 10 }}>
            <button className="btn btn--primary" onClick={() => setFilterPanel(null)}>Anwenden</button>
            <button className="btn btn--ghost" onClick={() => setFilters(current => { const next = { ...current }; delete next[filterPanel]; return next; })}>Auswahl aufheben</button>
          </div>
        </div>
      )}

      {detail && (
        <aside className="bp-drawer">
          <div className="bp-hero">
            <div className="avatar avatar--2">{emp(detail.employeeId)?.initials}</div>
            <div>
              <h2>{emp(detail.employeeId)?.name}</h2>
              <div style={{ color: 'rgba(255,255,255,.68)' }}>{areaText(detail.area)} · {detail.company}</div>
              <span className={'badge ' + statusBadgeClass(statusOf(detail))} style={{ marginTop: 12 }}><span className="badge__dot" />{statusOf(detail)}</span>
            </div>
            <button className="bp-close" onClick={() => setDetail(null)}>x</button>
          </div>
          <div className="bp-body">
            <label><span className="form-label">Mitarbeiter</span><select className="input" value={detail.employeeId} onChange={e => setDetail(d => ({ ...d, employeeId: e.target.value }))}>{allEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
            <label><span className="form-label">Firma</span><input className="input" value={detail.company} onChange={e => setDetail(d => ({ ...d, company: e.target.value }))} /></label>
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="form-label">Arbeitsmittel-Bereiche</span>
              <div style={{ marginTop: 8, background: 'white', border: '1px solid var(--border-1)', borderRadius: 10, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
                {areas.map(area => (
                  <label key={area} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 7, borderRadius: 6, background: areaList(detail.area).includes(area) ? 'var(--color-parchment)' : 'transparent' }}>
                    <input type="checkbox" checked={areaList(detail.area).includes(area)} onChange={() => toggleDetailArea(area)} />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </div>
            <label style={{ gridColumn: '1 / -1' }}><span className="form-label">Befähigung / Beauftragung</span><input className="input" value={detail.authorization} onChange={e => setDetail(d => ({ ...d, authorization: e.target.value }))} /></label>
            <label><span className="form-label">Gültig ab</span><input className="input" type="date" value={detail.validFrom} onChange={e => setDetail(d => ({ ...d, validFrom: e.target.value }))} /></label>
            <label><span className="form-label">Gültig bis</span><input className="input" type="date" value={detail.validUntil} onChange={e => setDetail(d => ({ ...d, validUntil: e.target.value }))} /></label>
            <label><span className="form-label">Verantwortlich für Prüfung</span><input className="input" value={detail.responsible} onChange={e => setDetail(d => ({ ...d, responsible: e.target.value }))} /></label>
            <label><span className="form-label">Dokument</span><input className="input" value={detail.document} onChange={e => setDetail(d => ({ ...d, document: e.target.value }))} /></label>
            <label style={{ gridColumn: '1 / -1' }}><span className="form-label">Bemerkung</span><textarea className="input" value={detail.note} onChange={e => setDetail(d => ({ ...d, note: e.target.value }))} /></label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap', padding: 14, background: 'white', border: '1px solid var(--border-1)', borderRadius: 10 }}>
              <button className="job-small-btn"><Icon name="eye" size={12} />Dokument Vorschau</button>
              <button className="job-small-btn"><Icon name="download" size={12} />Download</button>
              <button className="job-small-btn"><Icon name="upload" size={12} />Neues Dokument</button>
              <button className="job-small-btn" style={{ color: '#a13232' }}><Icon name="trash" size={12} />Dokument löschen</button>
            </div>
          </div>
          <div style={{ marginTop: 'auto', padding: 18, borderTop: '1px solid var(--border-1)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn--ghost" onClick={() => setDetail(null)}>Abbrechen</button>
            <button className="btn btn--primary" onClick={saveDetail}>Speichern</button>
          </div>
        </aside>
      )}
    </div>
  );
}

Object.assign(window, { BefaehigtePersonenView });
