function UnfallstatistikView({ activeCompany }) {
  const unfallDaten = [
    {
      id: 'rohrbau',
      firma: 'Janning Rohrbau GmbH',
      intern: 'SGU_039',
      jahreData: [
        { jahr: 2023, unfaelle: 0, stunden: 4560, uh: 0 },
        { jahr: 2024, unfaelle: 0, stunden: 13680, uh: 0 },
        { jahr: 2025, unfaelle: 0, stunden: 13680, uh: 0 },
      ],
    },
    {
      id: 'bohrtechnik',
      firma: 'Janning Bohrtechnik GmbH',
      intern: 'SGU_038',
      jahreData: [
        { jahr: 2023, unfaelle: 0, stunden: 41500, uh: 0 },
        { jahr: 2024, unfaelle: 0, stunden: 29264, uh: 0 },
        { jahr: 2025, unfaelle: 1, stunden: 50160, uh: 8.3 },
      ],
    },
    {
      id: 'tiefbau',
      firma: 'Janning Tiefbau GmbH',
      intern: 'SGU_037',
      jahreData: [
        { jahr: 2023, unfaelle: 3, stunden: 160400, uh: 15.8 },
        { jahr: 2024, unfaelle: 4, stunden: 230000, uh: 17.4 },
        { jahr: 2025, unfaelle: 3, stunden: 243000, uh: 12.3 },
      ],
    },
  ];

  const [selectedFirmaId, setSelectedFirmaId] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [addFirmaModalOpen, setAddFirmaModalOpen] = React.useState(false);
  const [editingFirmaId, setEditingFirmaId] = React.useState(null);

  const getCurrentUH = (firma) => {
    const aktuellesDatum = firma.jahreData[firma.jahreData.length - 1];
    return aktuellesDatum.uh;
  };

  const getVorjahresUH = (firma) => {
    if (firma.jahreData.length < 2) return null;
    return firma.jahreData[firma.jahreData.length - 2].uh;
  };

  const getRisikostufe = (uh) => {
    if (uh === 0) return 'kein-risiko';
    if (uh < 5) return 'niedrig';
    if (uh < 10) return 'mittel';
    return 'hoch';
  };

  const getRisikotextColor = (stufe) => {
    switch (stufe) {
      case 'kein-risiko': return '#22c55e';
      case 'niedrig': return '#84cc16';
      case 'mittel': return '#f59e0b';
      case 'hoch': return '#ef4444';
      default: return '#666';
    }
  };

  const getRisikotextLabel = (stufe) => {
    switch (stufe) {
      case 'kein-risiko': return 'Keine Unfälle';
      case 'niedrig': return 'Niedriges Risiko';
      case 'mittel': return 'Mittleres Risiko';
      case 'hoch': return 'Hohes Risiko';
      default: return 'Unbekannt';
    }
  };

  const getTrendPfeil = (uh, vorjahr) => {
    if (vorjahr === null) return '→';
    if (uh > vorjahr) return '↑';
    if (uh < vorjahr) return '↓';
    return '→';
  };

  const getTrendFarbe = (uh, vorjahr) => {
    if (vorjahr === null) return '#999';
    if (uh > vorjahr) return '#ef4444';
    if (uh < vorjahr) return '#22c55e';
    return '#999';
  };

  const selectedFirma = unfallDaten.find(f => f.id === selectedFirmaId);
  const aktuellesJahr = 2025;
  const letzteMonate = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  return (
    <div className="view">
      <div className="view-header">
        <div className="view-header-top">
          <h1>Unfallstatistik-Übersicht</h1>
          <p className="view-subtitle">SCC-Unfallhäufigkeit (UH) gemäß Regelwerk 2011 - Dokument 006</p>
        </div>
        <div className="view-header-tabs">
          <span className="tab-count">{unfallDaten.length} Firmen</span>
          <div className="header-actions">
            <button
              className={`btn btn--primary ${editMode ? 'btn--active' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '✓ Beenden' : '✎ Bearbeiten'}
            </button>
            <button
              className="btn btn--primary"
              onClick={() => setAddFirmaModalOpen(true)}
              disabled={!editMode}
            >
              + Neue Firma
            </button>
          </div>
        </div>
      </div>

      <div className="unfallstatistik-grid">
        {unfallDaten.map((firma) => {
          const aktuellesUH = getCurrentUH(firma);
          const vorjahresUH = getVorjahresUH(firma);
          const risiko = getRisikostufe(aktuellesUH);
          const trendPfeil = getTrendPfeil(aktuellesUH, vorjahresUH);
          const trendFarbe = getTrendFarbe(aktuellesUH, vorjahresUH);
          const aktuellesDatum = firma.jahreData[firma.jahreData.length - 1];

          return (
            <div
              key={firma.id}
              className={`unfallkarte unfallkarte--${risiko}`}
              onClick={() => {
                setSelectedFirmaId(firma.id);
                setDetailOpen(true);
              }}
            >
              <div className="unfallkarte-header">
                <div>
                  <h3 className="unfallkarte-title">{firma.firma}</h3>
                  <p className="unfallkarte-intern">{firma.intern}</p>
                </div>
                <div className={`risiko-badge risiko-badge--${risiko}`}>
                  {getRisikotextLabel(risiko)}
                </div>
              </div>

              <div className="unfallkarte-content">
                <div className="uh-display">
                  <div className="uh-value" style={{ color: getRisikotextColor(risiko) }}>
                    {aktuellesUH.toFixed(1)}
                  </div>
                  <div className="uh-label">UH-Quote 2025</div>
                </div>

                <div className="unfallkarte-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Unfälle 2025</span>
                    <span className="metric-value">{aktuellesDatum.unfaelle}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Arbeitsstunden</span>
                    <span className="metric-value">{(aktuellesDatum.stunden / 1000).toFixed(1)}k</span>
                  </div>
                </div>

                {vorjahresUH !== null && (
                  <div className="trend-indicator">
                    <span className="trend-pfeil" style={{ color: trendFarbe }}>
                      {trendPfeil}
                    </span>
                    <span className="trend-text">
                      {vorjahresUH > 0 ? `vs ${vorjahresUH.toFixed(1)}` : 'Neu mit Unfällen'}
                    </span>
                  </div>
                )}
              </div>

              <div className="unfallkarte-footer">
                {editMode ? (
                  <div className="card-actions">
                    <button
                      className="btn-small btn-small--edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFirmaId(firma.id);
                        setAddFirmaModalOpen(true);
                      }}
                    >
                      ✎ Bearbeiten
                    </button>
                    <button className="btn-small btn-small--delete" onClick={(e) => e.stopPropagation()}>
                      🗑 Löschen
                    </button>
                  </div>
                ) : (
                  <span className="view-hint">→ Details anzeigen</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="unfallstatistik-section">
        <h2>Jahresvergleich (2023 - 2025)</h2>
        <div className="unfallstatistik-tabelle">
          <table>
            <thead>
              <tr>
                <th>Firma</th>
                <th>2023 UH</th>
                <th>2024 UH</th>
                <th>2025 UH</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {unfallDaten.map((firma) => {
                const d2023 = firma.jahreData[0];
                const d2024 = firma.jahreData[1];
                const d2025 = firma.jahreData[2];
                const trend = d2025.uh > d2024.uh ? '↑' : d2025.uh < d2024.uh ? '↓' : '→';
                const trendColor = d2025.uh > d2024.uh ? '#ef4444' : d2025.uh < d2024.uh ? '#22c55e' : '#999';

                return (
                  <tr key={firma.id}>
                    <td className="firma-cell">
                      <strong>{firma.firma}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#999' }}>{firma.intern}</span>
                    </td>
                    <td className={getRisikostufe(d2023.uh) === 'kein-risiko' ? 'status-ok' : ''}>
                      {d2023.uh === 0 ? '—' : d2023.uh.toFixed(1)}
                    </td>
                    <td className={getRisikostufe(d2024.uh) === 'kein-risiko' ? 'status-ok' : ''}>
                      {d2024.uh === 0 ? '—' : d2024.uh.toFixed(1)}
                    </td>
                    <td className={getRisikostufe(d2025.uh) === 'kein-risiko' ? 'status-ok' : ''}>
                      {d2025.uh === 0 ? '—' : d2025.uh.toFixed(1)}
                    </td>
                    <td style={{ color: trendColor, fontWeight: 'bold', textAlign: 'center' }}>
                      {trend}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="unfallstatistik-section">
        <h2>Erklärung</h2>
        <div className="info-box">
          <p>
            <strong>Unfallhäufigkeit (UH)</strong> = (Anzahl der Arbeitsunfälle × 10⁶) / Geleistete Arbeitsstunden
          </p>
          <p style={{ marginTop: '12px', marginBottom: 0 }}>
            Die UH wird nach SCC-Regelwerk 2011 berechnet. Sie zeigt die Quote von Arbeitsunfällen pro 1 Million geleistete Arbeitsstunden.
          </p>
        </div>
      </div>

      {addFirmaModalOpen && (
        <div className="modal-overlay" onClick={() => { setAddFirmaModalOpen(false); setEditingFirmaId(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFirmaId ? 'Firma bearbeiten' : 'Neue Firma hinzufügen'}</h2>
              <button
                className="btn-close"
                onClick={() => {
                  setAddFirmaModalOpen(false);
                  setEditingFirmaId(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Firmenname *</label>
                <input type="text" className="form-input" placeholder="z.B. Janning Neue Firma GmbH" />
              </div>

              <div className="form-group">
                <label>SCC-Interne Nummer *</label>
                <input type="text" className="form-input" placeholder="z.B. SGU_040" />
              </div>

              <div className="form-section">
                <h3>Jahresangaben 2023</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Unfälle</label>
                    <input type="number" className="form-input" placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>Arbeitsstunden</label>
                    <input type="number" className="form-input" placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>UH-Quote</label>
                    <input type="number" className="form-input" placeholder="0.0" step="0.1" disabled />
                    <span className="form-hint">Berechnet automatisch</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Jahresangaben 2024</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Unfälle</label>
                    <input type="number" className="form-input" placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>Arbeitsstunden</label>
                    <input type="number" className="form-input" placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>UH-Quote</label>
                    <input type="number" className="form-input" placeholder="0.0" step="0.1" disabled />
                    <span className="form-hint">Berechnet automatisch</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Jahresangaben 2025</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Unfälle</label>
                    <input type="number" className="form-input" placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>Arbeitsstunden</label>
                    <input type="number" className="form-input" placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>UH-Quote</label>
                    <input type="number" className="form-input" placeholder="0.0" step="0.1" disabled />
                    <span className="form-hint">Berechnet automatisch</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={() => { setAddFirmaModalOpen(false); setEditingFirmaId(null); }}>
                Abbrechen
              </button>
              <button className="btn btn--primary">
                {editingFirmaId ? 'Speichern' : 'Firma hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailOpen && selectedFirma && (
        <div className="detail-panel detail-panel-unfallstatistik">
          <div className="detail-header">
            <button className="btn-close" onClick={() => setDetailOpen(false)}>✕</button>
            <h2>{selectedFirma.firma}</h2>
            <span className="detail-intern">{selectedFirma.intern}</span>
          </div>

          <div className="detail-content">
            <section className="detail-section">
              <h3>Detaillierte Übersicht</h3>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Jahr</th>
                    <th>Unfälle</th>
                    <th>Arbeitsstunden</th>
                    <th>UH-Quote</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFirma.jahreData.map((datum) => (
                    <tr key={datum.jahr}>
                      <td><strong>{datum.jahr}</strong></td>
                      <td>{datum.unfaelle}</td>
                      <td>{datum.stunden.toLocaleString('de-DE')}</td>
                      <td className={datum.uh === 0 ? 'status-ok' : ''}>
                        <strong>{datum.uh === 0 ? '—' : datum.uh.toFixed(1)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="detail-section">
              <h3>Risikobewertung</h3>
              <div className="risiko-erklarung">
                <div className="risiko-item">
                  <span className="risiko-color" style={{ background: '#22c55e' }}></span>
                  <span>UH = 0: Keine Unfälle</span>
                </div>
                <div className="risiko-item">
                  <span className="risiko-color" style={{ background: '#84cc16' }}></span>
                  <span>UH &lt; 5: Niedriges Risiko</span>
                </div>
                <div className="risiko-item">
                  <span className="risiko-color" style={{ background: '#f59e0b' }}></span>
                  <span>UH 5-10: Mittleres Risiko</span>
                </div>
                <div className="risiko-item">
                  <span className="risiko-color" style={{ background: '#ef4444' }}></span>
                  <span>UH &gt; 10: Hohes Risiko</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
