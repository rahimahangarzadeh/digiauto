/* Globaler Freigegeben-Status Manager für alle Views */

// Zentrale Datenstruktur für alle Freigegeben-Status
window.freigebenManager = {
  // Format: { [empId_docId]: { status: 'nicht' | 'pruefung' | 'ja', erledigtAm: '', erledigtVon: '', pdfUrl: '' } }
  data: {},

  // Status aus localStorage laden
  load: function() {
    try {
      const stored = localStorage.getItem('freigegeben_data');
      if (stored) this.data = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading freigegeben data:', e);
    }
  },

  // Status speichern
  save: function() {
    localStorage.setItem('freigegeben_data', JSON.stringify(this.data));
  },

  // Status für Eintrag abrufen
  getStatus: function(empId, docId) {
    const key = `${empId}_${docId}`;
    return this.data[key] || { status: 'nicht', erledigtAm: '', erledigtVon: '', pdfUrl: '' };
  },

  // Status setzen
  setStatus: function(empId, docId, status, details = {}) {
    const key = `${empId}_${docId}`;
    this.data[key] = {
      status: status, // 'nicht' | 'pruefung' | 'ja'
      erledigtAm: details.erledigtAm || '',
      erledigtVon: details.erledigtVon || '',
      pdfUrl: details.pdfUrl || '',
      ...details
    };
    this.save();
  },

  // Auto-Freigabe wenn erledigt
  autoReleaseIfDone: function(empId, docId) {
    this.setStatus(empId, docId, 'ja', {
      erledigtAm: new Date('2026-04-21').toLocaleDateString('de-DE'),
      erledigtVon: 'Admin'
    });
  },

  // Alle freigegebenen für Mitarbeiter abrufen
  getFreigebenForEmployee: function(empId) {
    return Object.entries(this.data)
      .filter(([key, val]) => key.startsWith(empId + '_') && val.status === 'ja')
      .map(([key, val]) => ({ docId: key.split('_')[1], ...val }));
  }
};

// Auf Page-Load laden
window.freigebenManager.load();
