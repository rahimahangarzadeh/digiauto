/* Organigramm document list - frontend only */

function OrganigrammView() {
  const [notice, setNotice] = React.useState('');
  const [previewDoc, setPreviewDoc] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState('all');

  React.useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  const docs = [
    {
      nr: '1',
      name: 'Organigramm Janning Tiefbau',
      company: 'Janning Tiefbau GmbH',
      scope: 'Tiefbau, Baustellenleitung, Poliere und Kolonnen',
      documentNo: 'ORG-TIEF-001',
      version: '1.4',
      createdAt: '27.03.2026',
      createdBy: 'Rahim Ahangarzadeh',
      status: 'Freigegeben',
    },
    {
      nr: '2',
      name: 'Organigramm Janning Bohrtechnik',
      company: 'Janning Bohrtechnik GmbH',
      scope: 'Horizontalbohrungen, Fachaufsicht, Bauleitung und Spezialtechnik',
      documentNo: 'ORG-BOHR-002',
      version: '1.2',
      createdAt: '15.03.2026',
      createdBy: 'Sabine Janning',
      status: 'In Prüfung',
    },
    {
      nr: '3',
      name: 'Organigramm Janning Rohrbau',
      company: 'Janning Rohrbau GmbH',
      scope: 'Rohrbau, DVGW, Versorgung, Bauleitung und Montage',
      documentNo: 'ORG-ROHR-003',
      version: '1.1',
      createdAt: '02.04.2026',
      createdBy: 'Michael Janning',
      status: 'Entwurf',
    },
  ];

  const filteredDocs = docs.filter((doc) => statusFilter === 'all' || doc.status === statusFilter);

  const statusClass = (status) => {
    if (status === 'Freigegeben') return 'badge badge--valid';
    if (status === 'In Prüfung') return 'badge badge--warn';
    return 'badge';
  };

  return (
    <div className="org-page">
      <div className="view__header org-header">
        <div>
          <h1 className="view__title">Organigramm</h1>
          <div className="view__subtitle">Dokumentenliste aller Firmen-Organigramme mit PDF-Vorschau.</div>
        </div>
        <div className="view__actions org-actions">
          <button className="btn btn--ghost" onClick={() => setNotice('PDF-Export vorbereitet.')}>
            <Icon name="download" size={15} />PDF exportieren
          </button>
          <button className="btn btn--primary" onClick={() => setNotice('Neues Organigramm vorbereitet.')}>
            <Icon name="plus" size={15} />Organigramm
          </button>
        </div>
      </div>

      {notice && <div className="org-notice">{notice}</div>}

      <div className="job-kpis" style={{ marginBottom: 16 }}>
        {[
          ['all', 'Organigramme', docs.length, '#111111'],
          ['Freigegeben', 'Freigegeben', docs.filter((doc) => doc.status === 'Freigegeben').length, '#3f7a4a'],
          ['In Prüfung', 'In Prüfung', docs.filter((doc) => doc.status === 'In Prüfung').length, '#8a6a1f'],
          ['Entwurf', 'Entwurf', docs.filter((doc) => doc.status === 'Entwurf').length, '#2d6fa3'],
        ].map(([key, label, value, color]) => (
          <button
            key={key}
            type="button"
            className={'job-kpi' + (statusFilter === key ? ' job-kpi--active' : '')}
            style={{ '--job-kpi-color': color, textAlign: 'left' }}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 18px', borderBottom:'1px solid var(--border-1)' }}>
          <div>
            <strong>Organigramm-Dokumente</strong>
            <div className="small muted">Nr., Name, Firmenname, Geltungsbereich, Dokumentennummer, Version, Datum, Ersteller und PDF-Vorschau.</div>
          </div>
          <div className="small muted">{filteredDocs.length} Einträge</div>
        </div>
        <div className="tbl-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Name Organigramm</th>
                <th>Firmenname</th>
                <th>Geltungsbereich</th>
                <th>Dokumentennummer</th>
                <th>Versionsnummer</th>
                <th>Datum der Erstellung</th>
                <th>Ersteller</th>
                <th>Status</th>
                <th style={{ width: 130, textAlign:'center' }}>PDF-Vorschau</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.documentNo}>
                  <td className="num">{doc.nr}</td>
                  <td><strong>{doc.name}</strong></td>
                  <td>{doc.company}</td>
                  <td>{doc.scope}</td>
                  <td>{doc.documentNo}</td>
                  <td>{doc.version}</td>
                  <td>{doc.createdAt}</td>
                  <td>{doc.createdBy}</td>
                  <td>
                    <span className={statusClass(doc.status)}>
                      <span className="badge__dot" />{doc.status}
                    </span>
                  </td>
                  <td style={{ textAlign:'center' }}>
                    <button className="job-small-btn" onClick={() => setPreviewDoc(doc)}>Vorschau</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewDoc && (
        <div onClick={() => setPreviewDoc(null)} style={{ position:'fixed', inset:0, zIndex:1800, background:'rgba(20,20,19,0.42)', display:'grid', placeItems:'center', padding:24 }}>
          <div onClick={(event) => event.stopPropagation()} className="card" style={{ width:720, maxWidth:'94vw', padding:0, overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid var(--border-1)' }}>
              <strong>{previewDoc.name}</strong>
              <button className="icon-btn" onClick={() => setPreviewDoc(null)}><Icon name="x" size={16} /></button>
            </div>
            <div style={{ padding:24, background:'#f7f6f1' }}>
              <div style={{ background:'#fff', border:'1px solid var(--border-1)', minHeight:420, padding:28 }}>
                <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border-1)', paddingBottom:12, marginBottom:28 }}>
                  <strong>Organigramm</strong>
                  <span>{previewDoc.documentNo} - Version {previewDoc.version} - {previewDoc.createdAt}</span>
                </div>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:30, margin:'0 0 8px' }}>{previewDoc.company}</h2>
                <p style={{ color:'var(--fg-2)', maxWidth:520 }}>{previewDoc.scope}</p>
                <div style={{ marginTop:34, border:'1px solid #111', padding:20, textAlign:'center' }}>
                  PDF-Vorschau Organigramm
                  <div className="small muted" style={{ marginTop:8 }}>Erstellt von {previewDoc.createdBy}</div>
                </div>
              </div>
            </div>
            <div style={{ padding:14, display:'flex', justifyContent:'flex-end', gap:8, borderTop:'1px solid var(--border-1)' }}>
              <button className="btn btn--ghost" onClick={() => setPreviewDoc(null)}>Schließen</button>
              <button className="btn btn--primary"><Icon name="download" size={14} />PDF exportieren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { OrganigrammView });
