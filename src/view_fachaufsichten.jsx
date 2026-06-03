function FachaufsichtenView({ activeCompany }) {
  const fachaufsichten = [
    {
      id: 'fw-1',
      name: 'Stahlschweißaufsicht',
      beschreibung: 'Überwachung und Kontrolle von Schweißarbeiten im Stahlbau',
      verantwortliche: [
        { name: 'Thorsten Schmitz', zertifikate: ['FW601', 'FW446', 'GW 301'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-2',
      name: 'Fachaufsicht Fernwärme & GW',
      beschreibung: 'Fachaufsicht für Fernwärme- und Sachkundige-Arbeiten',
      verantwortliche: [
        { name: 'Christian Janning', zertifikate: ['GW 301', 'FW601'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-3',
      name: 'Kunststoffschweißaufsicht',
      beschreibung: 'Überwachung von Kunststoffschweißarbeiten und PE-HD Verbindungen',
      verantwortliche: [
        { name: 'Christian Janning', zertifikate: ['GW 301', 'GW 331 (M)', 'FW601'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-4',
      name: 'Beauftragter nach WHG/AwSV',
      beschreibung: 'Wasserhaushalts- und Abwasserbestimmungen',
      verantwortliche: [
        { name: 'Christian Janning', zertifikate: ['WHG', 'AwSV'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-5',
      name: 'Asbest-Sachkundige',
      beschreibung: 'Sachkundige für Asbest-Arbeiten und -entsorgung',
      verantwortliche: [
        { name: 'Thorsten Isensee', zertifikate: ['Asbest I', 'Asbest II'] },
        { name: 'Stefan Boguta', zertifikate: ['Asbest I', 'Asbest II'] },
        { name: 'Hichem Aoune', zertifikate: ['Asbest I'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-6',
      name: 'AutoCAD Spezialisten',
      beschreibung: 'Konstruktion und technische Zeichnungen',
      verantwortliche: [
        { name: 'Daniel Fehren', zertifikate: ['AutoCAD 2024', 'BIM'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-7',
      name: 'QGIS-Experten',
      beschreibung: 'Geographische Informationssysteme und Vermessung',
      verantwortliche: [
        { name: 'Annika Tholen', zertifikate: ['QGIS Advanced', 'GPS'] },
        { name: 'Emmelie Gebbeken', zertifikate: ['QGIS Basis', 'Vermessung'] },
        { name: 'Simone Wilmes', zertifikate: ['QGIS Advanced'] },
        { name: 'Britta Kuhl', zertifikate: ['QGIS Basis'] },
        { name: 'Nadine Sommer', zertifikate: ['QGIS Basis'] },
        { name: 'Monika Schmitz', zertifikate: ['QGIS Advanced'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-8',
      name: 'Schweißer',
      beschreibung: 'Qualifizierte Schweißer nach DIN EN 9606',
      verantwortliche: [
        { name: 'Alexander Bartel', zertifikate: ['DIN EN 9606 - 111', 'DIN EN 9606 - 135'] },
        { name: 'Sergej Litke', zertifikate: ['DIN EN 9606 - 111', 'DIN EN 9606 - 131'] },
      ],
      status: 'active',
    },
    {
      id: 'fw-9',
      name: 'Elektriker',
      beschreibung: 'Qualifizierte Elektrofachkräfte und -führer',
      verantwortliche: [
        { name: 'Paul Krahn', zertifikate: ['E-Fachkraft', 'Elektroprüfung'] },
        { name: 'Tobias Bruns', zertifikate: ['E-Fachkraft', 'DGUV V3'] },
        { name: 'Jane Wenke', zertifikate: ['E-Fachkraft', 'Installation'] },
      ],
      status: 'active',
    },
  ];

  const [selectedFachId, setSelectedFachId] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = fachaufsichten.filter(fach =>
    fach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fach.beschreibung.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fach.verantwortliche.some(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedFach = fachaufsichten.find(f => f.id === selectedFachId);

  const getStatusBadge = (status) => {
    const badgeClass = status === 'active' ? 'badge--valid' : 'badge--expired';
    const badgeText = status === 'active' ? 'Aktiv' : 'Inaktiv';
    return <span className={`badge ${badgeClass}`}>{badgeText}</span>;
  };

  return (
    <div className="view">
      <div className="view-header">
        <div className="view-header-top">
          <h1>Fachaufsichten-Übersicht</h1>
          <input
            type="text"
            className="search-input"
            placeholder="Nach Person oder Fachgebiet suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="view-header-tabs">
          <span className="tab-count">{filtered.length} Fachaufsichten</span>
        </div>
      </div>

      <div className="fachaufsichten-grid">
        {filtered.map((fach) => (
          <div
            key={fach.id}
            className="fachaufsicht-card"
            onClick={() => {
              setSelectedFachId(fach.id);
              setDetailOpen(true);
            }}
          >
            <div className="card-header">
              <h3 className="card-title">{fach.name}</h3>
              <div className="card-status">{getStatusBadge(fach.status)}</div>
            </div>

            <p className="card-description">{fach.beschreibung}</p>

            <div className="card-content">
              <div className="verantwortliche-list">
                {fach.verantwortliche.map((person, idx) => (
                  <div key={idx} className="person-item">
                    <div className="person-name">
                      <strong>{person.name}</strong>
                    </div>
                    <div className="zertifikate-tags">
                      {person.zertifikate.map((zert, zIdx) => (
                        <span key={zIdx} className="tag">{zert}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-footer">
              <span className="person-count">
                {fach.verantwortliche.length} {fach.verantwortliche.length === 1 ? 'Person' : 'Personen'}
              </span>
              <span className="click-hint">→</span>
            </div>
          </div>
        ))}
      </div>

      {detailOpen && selectedFach && (
        <div className="detail-panel">
          <div className="detail-header">
            <button className="btn-close" onClick={() => setDetailOpen(false)}>✕</button>
            <h2>{selectedFach.name}</h2>
            <div className="detail-status">{getStatusBadge(selectedFach.status)}</div>
          </div>

          <div className="detail-content">
            <section className="detail-section">
              <h3>Beschreibung</h3>
              <p>{selectedFach.beschreibung}</p>
            </section>

            <section className="detail-section">
              <h3>Verantwortliche ({selectedFach.verantwortliche.length})</h3>
              <div className="detail-verantwortliche">
                {selectedFach.verantwortliche.map((person, idx) => (
                  <div key={idx} className="detail-person">
                    <div className="person-header">
                      <h4>{person.name}</h4>
                      <span className="person-role">Fachaufsicht</span>
                    </div>
                    <div className="zertifikate-detail">
                      <p className="label">Zertifikate:</p>
                      <ul>
                        {person.zertifikate.map((zert, zIdx) => (
                          <li key={zIdx}>{zert}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
