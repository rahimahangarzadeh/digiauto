function UnfallstatistikView({ activeCompany = 'all', extraAction = null, onOpenFirma = null }) {
  const companies = [
    { id:'rohrbau', name:'Janning Rohrbau GmbH', code:'SGU_039', target:8, hours:13680, accidents:0, lostDays:0, prevUh:0 },
    { id:'bohrtechnik', name:'Janning Bohrtechnik GmbH', code:'SGU_038', target:7, hours:50160, accidents:1, lostDays:4, prevUh:0 },
    { id:'tiefbau', name:'Janning Tiefbau GmbH', code:'SGU_037', target:10, hours:243000, accidents:3, lostDays:18, prevUh:13.44 },
  ];
  const accidents = [
    { id:'u-1', company:'tiefbau', no:'UNF-2025-001', date:'14.02.2025', time:'09:20', person:'Daniel Bert', site:'Kanalsanierung Nordhorn', department:'Tiefbau', activity:'Rohrgraben absichern', type:'Stolpern / Sturz', body:'Knöchel', cause:'Unebene Verkehrsfläche', days:3, reportable:'Ja', status:'Abgeschlossen' },
    { id:'u-2', company:'tiefbau', no:'UNF-2025-002', date:'18.06.2025', time:'13:10', person:'Dirk Jürgens', site:'Baustelle Alex Barum', department:'Tiefbau', activity:'Material bewegen', type:'Quetschung', body:'Hand', cause:'Unklare Handzeichen', days:8, reportable:'Ja', status:'Maßnahme offen' },
    { id:'u-3', company:'tiefbau', no:'UNF-2025-003', date:'02.09.2025', time:'07:45', person:'Markus Brinker', site:'Fernwärme Innenstadt', department:'Tiefbau', activity:'Beschilderung aufstellen', type:'Anstoßen', body:'Schulter', cause:'Enger Arbeitsbereich', days:7, reportable:'Ja', status:'In Prüfung' },
    { id:'u-4', company:'bohrtechnik', no:'UNF-2025-004', date:'22.05.2025', time:'10:05', person:'Tobias Nowak', site:'Horizontalbohrung Gewerbepark', department:'Bohrtechnik', activity:'Bohrgestänge aufnehmen', type:'Schnittverletzung', body:'Finger', cause:'Handschuh beschädigt', days:4, reportable:'Ja', status:'Abgeschlossen' },
  ];
  const nearMisses = [
    { date:'12.03.2025', site:'Kanalsanierung Nordhorn', description:'Beinahe-Kollision mit Radlader', consequence:'Personenschaden möglich', owner:'Alexander Petersen', done:'18.03.2025' },
    { date:'04.07.2025', site:'Bohrung Gewerbepark', description:'Absperrung durch Dritte verschoben', consequence:'Absturz in Arbeitsbereich', owner:'Dirk Berg', done:'Offen' },
  ];
  const actions = [
    { task:'MVAS-Beschilderung vor Arbeitsbeginn prüfen', owner:'Daniel Bert', due:'11.05.2026', priority:'Hoch', status:'Offen' },
    { task:'Unterweisung Handzeichen und Anschlagen erneuern', owner:'Dirk Jürgens', due:'20.05.2026', priority:'Mittel', status:'In Bearbeitung' },
    { task:'Arbeitsbereich bei Bohrgeräten enger absperren', owner:'Mehmet Brinker', due:'24.05.2026', priority:'Hoch', status:'Nachweis fehlt' },
  ];
  const [companyFilter, setCompanyFilter] = React.useState(activeCompany === 'all' ? 'all' : activeCompany);
  const [yearFilter, setYearFilter] = React.useState('2025');
  const [periodFilter, setPeriodFilter] = React.useState('Aktuelles Jahr');
  const [dialog, setDialog] = React.useState(null);
  const [selectedYear, setSelectedYear] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState([]);

  const scopedCompanies = companies.filter(company => (activeCompany === 'all' || company.id === activeCompany) && (companyFilter === 'all' || company.id === companyFilter));
  const scopedAccidents = accidents.filter(accident => scopedCompanies.some(company => company.id === accident.company));
  const uh = company => company.hours ? company.accidents * 1000000 / company.hours : 0;
  const risk = value => value === 0 ? ['Niedrig', 'is-low'] : value < 8 ? ['Mittel', 'is-mid'] : value < 12 ? ['Erhöht', 'is-warn'] : value < 18 ? ['Hoch', 'is-high'] : ['Kritisch', 'is-critical'];
  const totalAccidents = scopedCompanies.reduce((sum, company) => sum + company.accidents, 0);
  const totalHours = scopedCompanies.reduce((sum, company) => sum + company.hours, 0);
  const totalUh = totalHours ? totalAccidents * 1000000 / totalHours : 0;
  const selectedCompany = selectedYear ? companies.find(company => company.id === selectedYear.company) : null;
  const selectedCompanyAccidents = selectedYear ? accidents.filter(accident => accident.company === selectedYear.company) : [];
  const toggleSelection = id => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const openMenu = (event, id) => {
    event.stopPropagation();
    setMenuOpen(menuOpen === id ? null : id);
  };

  if (selectedYear && selectedCompany) {
    const currentUh = uh(selectedCompany);
    return <div className="view accident-page">
      <header className="emp-page-title"><div><button className="emp-round-back" onClick={() => setSelectedYear(null)}><Icon name="chevL" size={18} /></button><h1>Unfallstatistik {selectedYear.year} ({selectedCompany.name})</h1></div><div><button className="btn btn--ghost"><Icon name="download" size={14} />Jahresbericht PDF</button><button className="btn btn--primary"><Icon name="plus" size={14} />Maßnahme erstellen</button></div></header>
      <section className="accident-year-kpis">
        <div><span>Alle Unfälle</span><strong>{selectedCompanyAccidents.length}</strong></div>
        <div><span>Meldepflichtig</span><strong>{selectedCompanyAccidents.filter(item => item.reportable === 'Ja').length}</strong></div>
        <div><span>Ausfalltage</span><strong>{selectedCompany.lostDays}</strong></div>
        <div><span>Arbeitsstunden</span><strong>{selectedCompany.hours.toLocaleString('de-DE')}</strong></div>
        <div><span>Unfallhäufigkeit</span><strong>{currentUh.toFixed(1)}</strong></div>
        <div><span>Vergleich Vorjahr</span><strong>{(currentUh - selectedCompany.prevUh).toFixed(1)}</strong></div>
      </section>
      <section className="accident-chart-grid">
        <AccidentChart title="Unfallarten" items={[['Sturz', 2], ['Quetschung', 1], ['Schnitt', 1]]} />
        <AccidentChart title="Körperbereiche" items={[['Hand', 2], ['Knöchel', 1], ['Schulter', 1]]} />
        <AccidentChart title="Baustellen" items={[['Nordhorn', 2], ['Gewerbepark', 1], ['Innenstadt', 1]]} />
        <AccidentChart title="Ursachen" items={[['Organisation', 2], ['Arbeitsmittel', 1], ['Verkehrsweg', 1]]} />
      </section>
      <AccidentTable title="Unfälle des Jahres" rows={selectedCompanyAccidents} selectedIds={selectedIds} toggleSelection={toggleSelection} menuOpen={menuOpen} openMenu={openMenu} />
    </div>;
  }

  return <div className="view accident-page">
    <div className="accident-header">
      <div><h1>Unfallstatistik</h1><p>SCC-Unfallhäufigkeit, Arbeitsstunden, Risiken und Maßnahmen im Überblick.</p></div>
      <div className="accident-actions">
        {extraAction}
        <select value={companyFilter} onChange={event => setCompanyFilter(event.target.value)}><option value="all">Alle Firmen</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select>
        <select value={periodFilter} onChange={event => setPeriodFilter(event.target.value)}><option>Aktuelles Jahr</option><option>Letzte 3 Jahre</option><option>Letzte 5 Jahre</option><option>Eigener Zeitraum</option></select>
        <button className="btn btn--ghost"><Icon name="filter" size={14} />Filter</button>
        <button className="btn btn--ghost"><Icon name="download" size={14} />Export</button>
        <button className="btn btn--ghost" onClick={() => setDialog('hours')}>Arbeitsstunden erfassen</button>
        <button className="btn btn--primary" onClick={() => setDialog('accident')}><Icon name="plus" size={14} />Unfall erfassen</button>
      </div>
    </div>

    <section className="accident-filter-strip">
      {['Jahr', 'Baustelle', 'Abteilung', 'Unfallart', 'Meldepflichtig', 'Status', 'Zeitraum'].map(label => <label key={label}><span>{label}</span><select value={label === 'Jahr' ? yearFilter : 'all'} onChange={event => label === 'Jahr' && setYearFilter(event.target.value)}><option value="all">Alle</option><option value="2025">2025</option><option value="2024">2024</option><option value="2023">2023</option></select></label>)}
    </section>

    <section className="accident-kpis">
      <div><span>Unfälle</span><strong>{totalAccidents}</strong><small>berücksichtigte Arbeitsunfälle</small></div>
      <div><span>Arbeitsstunden</span><strong>{totalHours.toLocaleString('de-DE')}</strong><small>aus Monatswerten</small></div>
      <div><span>Unfallhäufigkeit</span><strong>{totalUh.toFixed(1)}</strong><small>Unfälle x 1.000.000 / Stunden</small></div>
      <div><span>Zielwert</span><strong>10,0</strong><small>Abweichung {(totalUh - 10).toFixed(1)}</small></div>
      <div><span>Beinaheunfälle</span><strong>{nearMisses.length}</strong><small>nicht in UH enthalten</small></div>
    </section>

    <section className="unfallstatistik-grid">
      {scopedCompanies.map(company => {
        const value = uh(company);
        const [riskLabel, riskClass] = risk(value);
        return <article key={company.id} className={`unfallkarte accident-company-card ${riskClass}`} onClick={() => setSelectedYear({ company:company.id, year:yearFilter })}>
          <div className="unfallkarte-header">
            <div><h3 className="unfallkarte-title">{company.name}</h3><p className="unfallkarte-intern">{company.code}</p></div>
            <span className={`accident-risk ${riskClass}`}>{riskLabel}</span>
          </div>
          <div className="uh-display"><div className="uh-value">{value.toFixed(1)}</div><div className="uh-label">UH-Quote {yearFilter}</div></div>
          <div className="unfallkarte-metrics"><div className="metric-item"><span className="metric-label">Unfälle {yearFilter}</span><span className="metric-value">{company.accidents}</span></div><div className="metric-item"><span className="metric-label">Arbeitsstunden</span><span className="metric-value">{(company.hours / 1000).toFixed(1)}k</span></div></div>
          <p className="accident-risk-reason">{riskLabel}es Risiko, weil die Unfallhäufigkeit {value.toFixed(1)} beträgt{value > company.prevUh ? ' und gegenüber dem Vorjahr gestiegen ist.' : '.'}</p>
          <div className="accident-target"><span>Ziel 10,0</span><strong>{(value - 10).toFixed(1)}</strong></div>
          <button className="accident-row-menu" onClick={event => openMenu(event, company.id)}>⋮</button>
          {menuOpen === company.id && <ActionMenu onClose={() => setMenuOpen(null)} />}
        </article>;
      })}
    </section>

    <section className="accident-chart-grid">
      <AccidentChart title="Unfallhäufigkeit nach Jahr" items={[['2023', 10.9], ['2024', 13.4], ['2025', 15.8]]} />
      <AccidentChart title="Unfälle nach Monat" items={[['Feb', 1], ['Mai', 1], ['Jun', 1], ['Sep', 1]]} />
      <AccidentChart title="Unfälle nach Firma" items={scopedCompanies.map(company => [company.name.replace('Janning ', ''), company.accidents])} />
      <AccidentChart title="Ausfalltage nach Jahr" items={[['2023', 9], ['2024', 13], ['2025', 22]]} />
    </section>

    <AccidentTable title="Unfallliste" rows={scopedAccidents} selectedIds={selectedIds} toggleSelection={toggleSelection} menuOpen={menuOpen} openMenu={openMenu} />

    <section className="accident-two-column">
      <div className="accident-panel"><h2>Beinaheunfälle</h2><p>Separat erfasst, nicht in der Unfallhäufigkeit enthalten.</p><table><tbody>{nearMisses.map(item => <tr key={item.date}><td><strong>{item.date}</strong><span>{item.site}</span></td><td>{item.description}<small>{item.consequence}</small></td><td>{item.owner}</td><td>{item.done}</td></tr>)}</tbody></table></div>
      <div className="accident-panel"><h2>Maßnahmen aus Unfällen</h2><p>Verbesserungsprozess direkt aus der Statistik.</p><table><tbody>{actions.map(item => <tr key={item.task}><td><strong>{item.task}</strong><span>{item.owner}</span></td><td>{item.due}</td><td>{item.priority}</td><td><span className="badge badge--warn">{item.status}</span></td></tr>)}</tbody></table></div>
    </section>

    <section className="accident-formula">
      <h2>Berechnungsgrundlage</h2>
      <p><strong>Unfallhäufigkeit = Anzahl der berücksichtigten Arbeitsunfälle × 1.000.000 / geleistete Arbeitsstunden</strong></p>
      <p>Gezählt werden nur meldepflichtige Arbeitsunfälle mit mindestens einem Ausfalltag. Wegeunfälle und Beinaheunfälle werden nicht eingerechnet.</p>
    </section>

    {dialog === 'accident' && <AccidentDialog onClose={() => setDialog(null)} companies={companies} />}
    {dialog === 'hours' && <HoursDialog onClose={() => setDialog(null)} companies={companies} />}
  </div>;
}

function ActionMenu() {
  return <div className="accident-action-menu">
    {['Details anzeigen', 'Bearbeiten', 'Dokument öffnen', 'PDF erstellen', 'Duplizieren', 'Archivieren', 'Löschen'].map(item => <button key={item}>{item}</button>)}
  </div>;
}

function AccidentChart({ title, items }) {
  const max = Math.max(...items.map(item => Number(item[1])), 1);
  return <div className="accident-chart"><h3>{title}</h3>{items.map(([label, value]) => <div key={label} className="accident-bar"><span>{label}</span><div><i style={{ width:`${Math.max((Number(value) / max) * 100, 4)}%` }} /></div><strong>{value}</strong></div>)}</div>;
}

function AccidentTable({ title, rows, selectedIds, toggleSelection, menuOpen, openMenu }) {
  return <section className="accident-panel">
    <div className="accident-panel-head"><div><h2>{title}</h2><p>{rows.length} Einträge</p></div>{selectedIds.length > 0 && <div className="accident-bulk"><strong>{selectedIds.length} ausgewählt</strong><button>Status ändern</button><button>Archivieren</button><button>Export</button></div>}</div>
    <div className="accident-table-wrap"><table className="accident-table"><thead><tr>{['', 'Unfallnummer', 'Datum', 'Person', 'Firma', 'Baustelle', 'Unfallart', 'Ausfalltage', 'Status', 'Aktionen'].map(head => <th key={head}>{head}{head && <button>⌄</button>}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelection(row.id)} /></td><td><strong>{row.no}</strong></td><td>{row.date}<small>{row.time}</small></td><td>{row.person}<small>{row.department}</small></td><td>{window.company(row.company)?.name || row.company}</td><td>{row.site}</td><td>{row.type}<small>{row.body}</small></td><td>{row.days}</td><td><span className="badge badge--warn">{row.status}</span></td><td className="accident-actions-cell"><button onClick={event => openMenu(event, row.id)}>⋮</button>{menuOpen === row.id && <ActionMenu />}</td></tr>)}</tbody></table></div>
  </section>;
}

function AccidentDialog({ onClose, companies }) {
  const fields = ['Unfallnummer', 'Datum und Uhrzeit', 'Betroffene Person', 'Baustelle / Standort', 'Abteilung', 'Tätigkeit beim Unfall', 'Unfallart', 'Verletzter Körperbereich', 'Unfallbeschreibung', 'Unfallursache', 'Sofortmaßnahmen', 'Arztbesuch', 'Krankenhaus', 'Meldepflichtig', 'Ausfalltage', 'Wiederaufnahme der Arbeit', 'Zuständige Führungskraft', 'Zeugen', 'BG-BAU-Meldung', 'Status'];
  return <ModalFrame title="Unfall erfassen" subtitle="Arbeitsunfall, Maßnahmen und Nachweise dokumentieren." onClose={onClose}>
    <label><span>Firma</span><select>{companies.map(company => <option key={company.id}>{company.name}</option>)}</select></label>
    {fields.map(field => <label key={field} className={field.includes('beschreibung') || field.includes('ursache') || field.includes('Sofort') ? 'is-wide' : ''}><span>{field}</span>{field.includes('beschreibung') || field.includes('ursache') || field.includes('Sofort') ? <textarea /> : <input />}</label>)}
    <div className="accident-documents-field is-wide">
      <span>Dokumente und Fotos</span>
      <div className="accident-doc-chip"><Icon name="doc" size={15} /><strong>Unfallmeldung_UNF-2025-005.pdf</strong><button type="button"><Icon name="x" size={14} /></button></div>
      <div className="accident-doc-chip"><Icon name="doc" size={15} /><strong>Foto_Baustelle_Schadstelle.jpg</strong><button type="button"><Icon name="x" size={14} /></button></div>
      <label className="accident-doc-upload"><Icon name="upload" size={16} /><strong>Anlagen hinzufügen</strong><input type="file" multiple /></label>
      <p>PDF, JPG oder PNG als Nachweis zum Unfall hinterlegen.</p>
    </div>
  </ModalFrame>;
}

function HoursDialog({ onClose, companies }) {
  return <ModalFrame title="Arbeitsstunden erfassen" subtitle="Monatswerte pflegen, Jahreswert automatisch ableiten." onClose={onClose}>
    <label><span>Firma</span><select>{companies.map(company => <option key={company.id}>{company.name}</option>)}</select></label>
    {['Jahr', 'Monat', 'Geleistete Arbeitsstunden', 'Quelle', 'Bemerkung'].map(field => <label key={field} className={field === 'Bemerkung' ? 'is-wide' : ''}><span>{field}</span>{field === 'Bemerkung' ? <textarea /> : <input />}</label>)}
    <div className="accident-auto-calc is-wide"><span>Jahresarbeitsstunden</span><strong>werden automatisch aus den Monatswerten berechnet</strong></div>
  </ModalFrame>;
}

function ModalFrame({ title, subtitle, onClose, children }) {
  return <div className="fach-dialog-backdrop" onClick={onClose}><section className="fach-dialog accident-dialog" onClick={event => event.stopPropagation()}>
    <header><div><span>Unfallstatistik</span><h2>{title}</h2><p>{subtitle}</p></div><button onClick={onClose}><Icon name="x" size={18} /></button></header>
    <div className="fach-dialog-grid">{children}</div>
    <footer><button className="btn btn--ghost" onClick={onClose}>Abbrechen</button><button className="btn btn--primary">Speichern</button></footer>
  </section></div>;
}

window.UnfallstatistikView = UnfallstatistikView;
