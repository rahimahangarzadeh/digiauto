// Seed data for Schulungs- und Qualifikationsmatrix App
// Fictional but plausible data for the Janning group.

window.SEED = (function () {
  const companies = [
    { id: 'tiefbau',     name: 'Janning Tiefbau GmbH',      short: 'Tiefbau',     logo: 'assets/logos/tiefbau.png',     tone: '#4a4a48' },
    { id: 'bohrtechnik', name: 'Janning Bohrtechnik GmbH',  short: 'Bohrtechnik', logo: 'assets/logos/bohrtechnik.png', tone: '#1f5fa8' },
    { id: 'rohrbau',     name: 'Janning Rohrbau GmbH',      short: 'Rohrbau',     logo: 'assets/logos/rohrbau.png',     tone: '#7d6b3a' },
    { id: 'galabau',     name: 'Janning Galabau GmbH',      short: 'Galabau',     logo: 'assets/logos/galabau.png',     tone: '#1e9e80' },
    { id: 'transporte',  name: 'Janning Transporte GmbH',   short: 'Transporte',  logo: 'assets/logos/transporte.png',  tone: '#d06c1f' },
  ];

  const departments = ['Bauleitung', 'Poliere', 'Maschinisten', 'Gewerbliche', 'Fahrer', 'Werkstatt', 'Büro', 'Auszubildende'];

  const providers = [
    { id: 'biw',       name: 'BiW Bildungszentrum',       contact: 'Frau Möller',     phone: '+49 591 12345-0',  email: 'info@biw-akademie.de', site: 'biw-akademie.de', address: 'Lingen' },
    { id: 'dekra',     name: 'DEKRA Akademie',            contact: 'Hr. Brockmann',   phone: '+49 541 98765-0',  email: 'os@dekra-akademie.de', site: 'dekra-akademie.de', address: 'Osnabrück' },
    { id: 'dvgw',      name: 'DVGW Berufliche Bildung',   contact: 'Frau Schütte',    phone: '+49 228 91880-0',  email: 'bildung@dvgw.de', site: 'dvgw.de', address: 'Bonn' },
    { id: 'tuv',       name: 'TÜV Nord Akademie',         contact: 'Hr. Lammers',     phone: '+49 511 998-0',    email: 'akademie@tuev-nord.de', site: 'tuev-nord.de', address: 'Hannover' },
    { id: 'bg-bau',    name: 'BG BAU Schulungszentrum',   contact: 'Frau Kraus',      phone: '+49 30 85781-0',   email: 'seminare@bgbau.de', site: 'bgbau.de', address: 'Berlin' },
    { id: 'intern',    name: 'Interne Schulung (Janning)', contact: 'Michael Janning', phone: '+49 5921 12345-10', email: 'schulung@janning-gruppe.de', site: 'janning-gruppe.de', address: 'Nordhorn' },
  ];

  const trainings = [
    { id: 't-erstehilfe', name: 'Erste Hilfe (9 UE)',        short: 'Erste Hilfe',  cat: 'Sicherheit',   months: 24, mandatory: true,  provider: 'biw',    desc: 'Betrieblicher Ersthelfer nach DGUV Vorschrift 1.' },
    { id: 't-scc016',     name: 'SCC Dok. 016',              short: 'SCC 016',      cat: 'SCC',          months: 36, mandatory: true,  provider: 'dekra',  desc: 'Sicherheits-Fachkraft / operativ Tätige.' },
    { id: 't-scc017',     name: 'SCC Dok. 017',              short: 'SCC 017',      cat: 'SCC',          months: 36, mandatory: true,  provider: 'dekra',  desc: 'SCC für operative Führungskräfte.' },
    { id: 't-gw129',      name: 'GW 129 Rohrnetzbau',        short: 'GW 129',       cat: 'DVGW',         months: 36, mandatory: false, provider: 'dvgw',   desc: 'Rohrnetzbauer Gas/Wasser.' },
    { id: 't-gw330',      name: 'GW 330 Schweißverfahren',   short: 'GW 330',       cat: 'DVGW',         months: 24, mandatory: false, provider: 'dvgw',   desc: 'Schweißer für PE-Rohrleitungen.' },
    { id: 't-staplerschein', name: 'Gabelstaplerschein',     short: 'Stapler',      cat: 'Fahrerlaubnis', months: 24, mandatory: false, provider: 'tuv',    desc: 'Fahrausweis Flurförderfahrzeuge.' },
    { id: 't-absturz',    name: 'PSA gegen Absturz',         short: 'PSAgA',        cat: 'Sicherheit',   months: 12, mandatory: false, provider: 'bg-bau', desc: 'Höhenarbeiten / Auffanggurt.' },
    { id: 't-brand',      name: 'Brandschutzhelfer',         short: 'Brandschutz',  cat: 'Sicherheit',   months: 36, mandatory: true,  provider: 'intern', desc: 'Ausbildung nach ASR A2.2.' },
    { id: 't-baggerf',    name: 'Bagger & Radlader',         short: 'Erdbau',       cat: 'Fahrerlaubnis', months: 24, mandatory: false, provider: 'tuv',    desc: 'Erdbaumaschinenführerschein.' },
    { id: 't-unterweisung', name: 'Jahresunterweisung',      short: 'Jahresunterw.', cat: 'Unterweisung', months: 12, mandatory: true,  provider: 'intern', desc: 'Jährliche Pflichtunterweisung nach §12 ArbSchG.' },
    { id: 't-mvas99',     name: 'MVAS 99',                   short: 'MVAS 99',       cat: 'Sicherheit / Verkehr', months: 36, mandatory: true, provider: 'bg-bau', desc: 'Merkblatt über Rahmenbedingungen für erforderliche Fachkenntnisse zur Verkehrssicherung von Arbeitsstellen an Straßen.' },
  ];

  // Employees
  const firstNames = ['Michael','Andreas','Stefan','Thomas','Markus','Daniel','Christian','Jürgen','Bernd','Frank','Lukas','Tobias','Jens','Maik','Alexander','Sven','Mehmet','Piotr','Andrzej','Dimitri','Oliver','Kevin','Matthias','Hendrik','Mustafa','Heiko','Ralf','Dirk','Uwe','Jan'];
  const lastNames  = ['Janning','Böckmann','Brinker','Schmitz','Hoffmann','Wolf','Schröder','Fischer','Meyer','Vogt','Lange','Krause','Beck','Wittke','Özdemir','Nowak','Kowalski','Petersen','Brüning','Schulte','Kramer','Tappe','Berg','Jürgens','Lammers','Kempers','Hinrichs','Thole','Siemens','Wiegmann'];

  const streets = ['Hauptstraße','Bahnhofstraße','Kirchstraße','Gartenstraße','Schillerstraße','Am Markt','Mühlenstraße','Feldstraße','Ringstraße','Birkenweg','Lindenallee','Schulstraße','Rosenweg','Bergstraße','Dorfstraße'];
  const cities  = ['Nordhorn','Lingen','Meppen','Bad Bentheim','Gronau','Emlichheim','Neuenhaus','Schüttorf','Rheine','Ibbenbüren','Osnabrück','Münster','Bad Iburg','Bramsche','Fürstenau'];

  // Create 38 employees mixed across companies
  const rand = mulberry32(20240401);
  const employees = [];
  for (let i = 0; i < 38; i++) {
    const firm = companies[Math.floor(rand() * companies.length)];
    const fn = firstNames[Math.floor(rand() * firstNames.length)];
    const ln = lastNames[Math.floor(rand() * lastNames.length)];
    const dept = departments[Math.floor(rand() * departments.length)];
    const year = 2010 + Math.floor(rand() * 14);
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    employees.push({
      id: 'e' + (1000 + i),
      personalNr: String(2000 + i),
      firstName: fn,
      lastName: ln,
      name: fn + ' ' + ln,
      company: firm.id,
      department: dept,
      position: positionFor(dept),
      entry: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ä/g,'ae').replace(/ß/g,'ss')}@janning-gruppe.de`,
      phone: `+49 5921 ${1000 + Math.floor(rand()*8999)}`,
      address: `${streets[Math.floor(rand()*streets.length)]} ${1 + Math.floor(rand()*99)}, ${cities[Math.floor(rand()*cities.length)]}`,
      status: rand() > 0.08 ? 'aktiv' : 'inaktiv',
      initials: (fn[0] + ln[0]).toUpperCase(),
      color: Math.floor(rand()*6) + 1,
    });
  }
  // Ensure a known "current employee" for portal view
  employees[0] = {
    ...employees[0],
    id: 'e-me',
    personalNr: '2038',
    firstName: 'Daniel',
    lastName: 'Bert',
    name: 'Daniel Bert',
    initials: 'DB',
    company: 'galabau',
    department: 'Vermessung',
    position: 'QGIS-Expertin',
    entry: '2019-08-01',
    email: 'daniel.bert@janning-gruppe.de',
    phone: '+49 2562 8804-12',
    status: 'aktiv',
    color: 1,
    address: 'Gartenweg 8, 49744 Geeste',
  };

  // Training matrix — per (employee, training) → status + optional dates
  const todayStr = '2026-04-21';
  const today = new Date(todayStr);
  const certs = {}; // certs[empId][trainId] = { status, issuedAt, expiresAt }
  employees.forEach((emp, ei) => {
    certs[emp.id] = {};
    trainings.forEach((t, ti) => {
      const r = rand();
      // not everyone has every training
      if (!t.mandatory && r < 0.38) {
        certs[emp.id][t.id] = { status: 'missing' };
        return;
      }
      // relevance filter: some trainings mostly for some companies
      if (t.id === 't-gw129' || t.id === 't-gw330') {
        if (!['rohrbau','bohrtechnik','tiefbau'].includes(emp.company) && r < 0.7) {
          certs[emp.id][t.id] = { status: 'missing' };
          return;
        }
      }
      // random date in past few years
      const monthsAgo = Math.floor(rand() * (t.months + 8));
      const issued = new Date(today);
      issued.setMonth(issued.getMonth() - monthsAgo);
      const expires = new Date(issued);
      expires.setMonth(expires.getMonth() + t.months);
      const diffDays = Math.round((expires - today) / (1000*60*60*24));
      let status;
      if (diffDays < 0) status = 'expired';
      else if (diffDays < 60) status = 'warn';
      else status = 'valid';
      if (r < 0.05) status = 'planned';
      certs[emp.id][t.id] = {
        status,
        issuedAt: fmtDate(issued),
        expiresAt: fmtDate(expires),
        docNr: 'ZK-' + (10000 + ei * 13 + ti).toString(),
        provider: t.provider,
      };
    });
  });

  const events = [
    { id: 'ev1', title: 'Erste Hilfe Auffrischung',        training: 't-erstehilfe', date: '2026-04-22', time: '08:00–16:00', location: 'Nordhorn, Schulungsraum B', provider: 'biw',     participants: 12, status: 'geplant', kind: 'sage' },
    { id: 'ev2', title: 'SCC 017 Führungskräfte',          training: 't-scc017',     date: '2026-04-27', time: '09:00–17:00', location: 'Osnabrück, DEKRA',        provider: 'dekra',   participants: 6,  status: 'geplant', kind: 'default' },
    { id: 'ev3', title: 'GW 330 PE-Schweißen',             training: 't-gw330',      date: '2026-05-04', time: '07:30–15:30', location: 'Bonn, DVGW Zentrum',      provider: 'dvgw',    participants: 4,  status: 'geplant', kind: 'accent' },
    { id: 'ev4', title: 'Jahresunterweisung Tiefbau',      training: 't-unterweisung', date: '2026-04-29', time: '13:00–15:00', location: 'Nordhorn, Aufenthaltsraum', provider: 'intern', participants: 23, status: 'offen', kind: 'accent' },
    { id: 'ev5', title: 'Brandschutzhelfer',               training: 't-brand',      date: '2026-05-12', time: '09:00–12:00', location: 'Nordhorn',                provider: 'intern',  participants: 8,  status: 'geplant', kind: 'default' },
    { id: 'ev6', title: 'Gabelstaplerschein',              training: 't-staplerschein', date: '2026-05-18', time: '08:00–17:00', location: 'Hannover, TÜV Nord',   provider: 'tuv',     participants: 3,  status: 'geplant', kind: 'blue' },
    { id: 'ev7', title: 'PSA gegen Absturz',               training: 't-absturz',    date: '2026-04-24', time: '08:00–12:00', location: 'Nordhorn, Trainingsturm', provider: 'bg-bau',  participants: 5,  status: 'bestätigt', kind: 'sage' },
    { id: 'ev8', title: 'SCC 016 Operativ',                training: 't-scc016',     date: '2026-05-07', time: '09:00–17:00', location: 'Osnabrück, DEKRA',        provider: 'dekra',   participants: 9,  status: 'geplant', kind: 'default' },
    { id: 'ev9', title: 'Jahresunterweisung Galabau',      training: 't-unterweisung', date: '2026-05-22', time: '13:00–15:00', location: 'Nordhorn',            provider: 'intern', participants: 14, status: 'geplant', kind: 'accent' },
  ];

  // Unterweisungen (instructions/briefings) — detailed
  const instructions = [
    {
      id: 'u1', number: 'UW-2026-014', title: 'Jahresunterweisung Tiefbau 2026', version: 'v3.2',
      validFrom: '2026-04-29', date: '2026-04-29', company: 'tiefbau', group: 'Poliere + Maschinisten',
      instructor: 'Michael Janning', translation: 'PL, TR', whatsapp: '\n',
      description: 'Pflichtunterweisung nach §12 ArbSchG. Themen: Absturz, PSA, Verkehrssicherung, Baustellenordnung, Gefahrstoffe.',
      explanation: 'Gemeinsame Durchsprache anhand Präsentation, anschließend Fragerunde und Unterschrift.',
      document: 'UW-Tiefbau-2026_v3.2.pdf',
      status: 'aktiv',
      participants: [
        { emp: employees[0].id, signed: true,  date: '2026-04-29' },
        { emp: employees[1].id, signed: true,  date: '2026-04-29' },
        { emp: employees[2].id, signed: false, date: null, reason: 'Krank' },
        { emp: employees[3].id, signed: true,  date: '2026-04-29' },
        { emp: employees[4].id, signed: true,  date: '2026-04-29' },
        { emp: employees[5].id, signed: false, date: null, reason: 'Urlaub' },
        { emp: employees[6].id, signed: true,  date: '2026-04-29' },
        { emp: employees[7].id, signed: true,  date: '2026-04-29' },
        { emp: employees[8].id, signed: true,  date: '2026-04-29' },
        { emp: employees[9].id, signed: false, date: null, reason: 'Auswärtig' },
      ],
      history: [
        { version: 'v3.2', date: '2026-01-15', note: 'Kapitel Gefahrstoffe aktualisiert' },
        { version: 'v3.1', date: '2025-02-10', note: 'Signatur per Tablet ergänzt' },
        { version: 'v3.0', date: '2024-01-18', note: 'Neue Fassung nach ArbSchG-Novelle' },
      ],
    },
    {
      id: 'u2', number: 'UW-2026-015', title: 'Umgang mit Erdbaumaschinen', version: 'v1.4',
      validFrom: '2026-02-01', date: '2026-03-12', company: 'tiefbau', group: 'Maschinisten',
      instructor: 'Andreas Böckmann', translation: 'PL', whatsapp: 'JT-Maschinisten',
      description: 'Bedienung, Wartung, Not-Aus, Schwenkbereich, Absicherung.',
      explanation: 'Praktische Einweisung an zwei Maschinen. Schriftliche Kurzprüfung.',
      document: 'UW-Erdbau-v1.4.pdf',
      status: 'aktiv',
      participants: [
        { emp: employees[11].id, signed: true, date: '2026-03-12' },
        { emp: employees[12].id, signed: true, date: '2026-03-12' },
        { emp: employees[13].id, signed: true, date: '2026-03-12' },
        { emp: employees[14].id, signed: true, date: '2026-03-12' },
      ],
      history: [
        { version: 'v1.4', date: '2026-02-01', note: 'Kapitel Neuer Bagger JCB' },
        { version: 'v1.3', date: '2025-03-20', note: 'Piktogramme ergänzt' },
      ],
    },
    {
      id: 'u3', number: 'UW-2026-016', title: 'Verhalten im Rohrgraben', version: 'v2.0',
      validFrom: '2026-03-01', date: '2026-04-03', company: 'rohrbau', group: 'Gewerbliche',
      instructor: 'Stefan Schmitz', translation: 'PL, TR, RU', whatsapp: 'JR-Kolonne',
      description: 'Verbau, Böschungssicherung, Rettungswege, Unterweisung nach DGUV 113-016.',
      explanation: 'Begehung Baustelle Emsstraße + Dokumenten­durchsprache.',
      document: 'UW-Rohrgraben-v2.0.pdf',
      status: 'aktiv',
      participants: [
        { emp: employees[15].id, signed: true, date: '2026-04-03' },
        { emp: employees[16].id, signed: true, date: '2026-04-03' },
        { emp: employees[17].id, signed: false, date: null, reason: 'Krank' },
        { emp: employees[18].id, signed: true, date: '2026-04-03' },
      ],
      history: [
        { version: 'v2.0', date: '2026-03-01', note: 'Überarbeitung nach Vorfall KW 42' },
        { version: 'v1.9', date: '2024-06-01', note: 'Kleinere Korrekturen' },
      ],
    },
    {
      id: 'u4', number: 'UW-2026-017', title: 'Ladungssicherung LKW', version: 'v2.7',
      validFrom: '2026-01-20', date: '2026-02-22', company: 'transporte', group: 'Fahrer',
      instructor: 'Heiko Lammers', translation: 'PL', whatsapp: 'JTrans-Fahrer',
      description: 'VDI 2700, Zurrgurte, Reibwerte, Ladungskontrolle, Beladungsvorschriften.',
      explanation: 'Durchsprache mit Kurzvideo und praktischer Übung am Fahrzeug.',
      document: 'UW-Ladungssicherung-v2.7.pdf',
      status: 'aktiv',
      participants: [
        { emp: employees[20].id, signed: true, date: '2026-02-22' },
        { emp: employees[21].id, signed: true, date: '2026-02-22' },
        { emp: employees[22].id, signed: true, date: '2026-02-22' },
      ],
      history: [
        { version: 'v2.7', date: '2026-01-20', note: 'Neue Normen 2026' },
      ],
    },
    {
      id: 'u5', number: 'UW-2026-018', title: 'Pflanzenschutzmittel – Sachkunde', version: 'v1.2',
      validFrom: '2026-03-10', date: '2026-03-20', company: 'galabau', group: 'Gewerbliche',
      instructor: 'Frank Vogt', translation: '—', whatsapp: 'JG-Team',
      description: 'Lagerung, Anwendung, Dokumentation nach PflSchG.',
      explanation: 'Theoretischer Teil + Inventur Lager.',
      document: 'UW-Pflanzenschutz-v1.2.pdf',
      status: 'aktiv',
      participants: [
        { emp: employees[25].id, signed: true, date: '2026-03-20' },
        { emp: employees[26].id, signed: true, date: '2026-03-20' },
      ],
      history: [
        { version: 'v1.2', date: '2026-03-10', note: 'Aktualisierte Mittelliste' },
      ],
    },
    {
      id: 'u6', number: 'UW-2025-042', title: 'Horizontalbohrung – Sicherheitsabstände', version: 'v1.0',
      validFrom: '2025-11-15', date: '2025-11-28', company: 'bohrtechnik', group: 'Gesamte Mannschaft',
      instructor: 'Michael Janning', translation: 'PL, RU', whatsapp: 'JB-Crew',
      description: 'HDD-Verfahren, Schutzabstände, Verhalten bei Beschädigung fremder Leitungen.',
      explanation: 'Präsentation mit Beispielfotos vergangener Vorfälle.',
      document: 'UW-HDD-v1.0.pdf',
      status: 'archiviert',
      participants: [
        { emp: employees[30].id, signed: true, date: '2025-11-28' },
        { emp: employees[31].id, signed: true, date: '2025-11-28' },
      ],
      history: [
        { version: 'v1.0', date: '2025-11-15', note: 'Erstversion' },
      ],
    },
  ];

  return { companies, departments, providers, trainings, employees, certs, events, instructions, today: todayStr };

  // ---- helpers ----
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function positionFor(dept) {
    const map = {
      'Bauleitung': 'Bauleiter',
      'Poliere': 'Polier',
      'Maschinisten': 'Baumaschinist',
      'Gewerbliche': 'Facharbeiter',
      'Fahrer': 'Kraftfahrer',
      'Werkstatt': 'KFZ-Mechaniker',
      'Büro': 'Kaufm. Angestellte:r',
      'Auszubildende': 'Auszubildende:r',
    };
    return map[dept] || 'Mitarbeiter';
  }
})();
