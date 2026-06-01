/* Organization seed data — pre-populate localStorage with example orgs */

function seedOrganizationData() {
  const storageKey = 'janning_org_data';
  const existing = localStorage.getItem(storageKey);
  
  // Only seed if empty
  if (existing && JSON.parse(existing).companies && Object.keys(JSON.parse(existing).companies).length > 0) {
    return;
  }

  const companies = {
    'cmp_realestatepl': {
      id: 'cmp_realestatepl',
      name: 'Janning Real Estate Polska',
      shortName: 'RE PL',
      colorKey: 'realestatepl',
      createdAt: new Date().toISOString()
    },
    'cmp_baupl': {
      id: 'cmp_baupl',
      name: 'Janning Bau Polska sp. z o.o.',
      shortName: 'Bau PL',
      colorKey: 'baupl',
      createdAt: new Date().toISOString()
    },
    'cmp_bohrtechnik': {
      id: 'cmp_bohrtechnik',
      name: 'Janning Bohrtechnik GmbH',
      shortName: 'Bohr',
      colorKey: 'bohrtechnik',
      createdAt: new Date().toISOString()
    },
    'cmp_rohrbau': {
      id: 'cmp_rohrbau',
      name: 'Janning Rohrbau GmbH',
      shortName: 'Rohr',
      colorKey: 'rohrbau',
      createdAt: new Date().toISOString()
    },
    'cmp_tiefbau': {
      id: 'cmp_tiefbau',
      name: 'Janning Tiefbau GmbH',
      shortName: 'Tief',
      colorKey: 'tiefbau',
      createdAt: new Date().toISOString()
    },
    'cmp_galabau': {
      id: 'cmp_galabau',
      name: 'Janning Galabau GmbH',
      shortName: 'Gala',
      colorKey: 'galabau',
      createdAt: new Date().toISOString()
    },
    'cmp_transporte': {
      id: 'cmp_transporte',
      name: 'Janning Transporte GmbH',
      shortName: 'Trans',
      colorKey: 'transporte',
      createdAt: new Date().toISOString()
    },
    'cmp_grundbesitz': {
      id: 'cmp_grundbesitz',
      name: 'Janning Grundbesitz GmbH',
      shortName: 'GB',
      colorKey: 'grundbesitz',
      createdAt: new Date().toISOString()
    }
  };

  const employees = {
    'emp_cj': { id: 'emp_cj', name: 'Christian Janning', companyId: 'cmp_bohrtechnik', createdAt: new Date().toISOString() },
    'emp_ab': { id: 'emp_ab', name: 'Alexander Braun', companyId: 'cmp_bohrtechnik', createdAt: new Date().toISOString() },
    'emp_kj': { id: 'emp_kj', name: 'Kathrin Janning', companyId: 'cmp_bohrtechnik', createdAt: new Date().toISOString() },
    'emp_sg': { id: 'emp_sg', name: 'Stefan Gottschalk', companyId: 'cmp_bohrtechnik', createdAt: new Date().toISOString() },
    'emp_gr': { id: 'emp_gr', name: 'Guido Rolfes', companyId: 'cmp_bohrtechnik', createdAt: new Date().toISOString() },
    'emp_pd': { id: 'emp_pd', name: 'Piotr Dubaj', companyId: 'cmp_bohrtechnik', createdAt: new Date().toISOString() },
    'emp_mj': { id: 'emp_mj', name: 'Mareike Janning', companyId: 'cmp_bohrtechnik', createdAt: new Date().toISOString() },
    
    'emp_mj_t': { id: 'emp_mj_t', name: 'Michael Janning', companyId: 'cmp_tiefbau', createdAt: new Date().toISOString() },
    'emp_sj_t': { id: 'emp_sj_t', name: 'Sabine Janning', companyId: 'cmp_tiefbau', createdAt: new Date().toISOString() },
    'emp_tk': { id: 'emp_tk', name: 'Thomas Krämer', companyId: 'cmp_tiefbau', createdAt: new Date().toISOString() },
    'emp_as': { id: 'emp_as', name: 'Anna Schulz', companyId: 'cmp_tiefbau', createdAt: new Date().toISOString() },
    'emp_pm': { id: 'emp_pm', name: 'Petra Müller', companyId: 'cmp_tiefbau', createdAt: new Date().toISOString() },
    
    'emp_rj': { id: 'emp_rj', name: 'Robert Janning', companyId: 'cmp_rohrbau', createdAt: new Date().toISOString() },
    'emp_tw': { id: 'emp_tw', name: 'Thomas Weber', companyId: 'cmp_rohrbau', createdAt: new Date().toISOString() },
    'emp_kf': { id: 'emp_kf', name: 'Klaus Fischer', companyId: 'cmp_rohrbau', createdAt: new Date().toISOString() },
    'emp_dh': { id: 'emp_dh', name: 'Dieter Hoffmann', companyId: 'cmp_rohrbau', createdAt: new Date().toISOString() },
    
    'emp_fj': { id: 'emp_fj', name: 'Frank Janning', companyId: 'cmp_galabau', createdAt: new Date().toISOString() },
    'emp_aw': { id: 'emp_aw', name: 'Angelika Winter', companyId: 'cmp_galabau', createdAt: new Date().toISOString() },
    'emp_ms': { id: 'emp_ms', name: 'Martin Schröder', companyId: 'cmp_galabau', createdAt: new Date().toISOString() },
    'emp_jm': { id: 'emp_jm', name: 'Jürgen Müller', companyId: 'cmp_galabau', createdAt: new Date().toISOString() },
    
    'emp_kj_t': { id: 'emp_kj_t', name: 'Klaus Janning', companyId: 'cmp_transporte', createdAt: new Date().toISOString() },
    'emp_uh': { id: 'emp_uh', name: 'Uta Hoffmann', companyId: 'cmp_transporte', createdAt: new Date().toISOString() },
    'emp_hb': { id: 'emp_hb', name: 'Hans Becker', companyId: 'cmp_transporte', createdAt: new Date().toISOString() },
    'emp_pv': { id: 'emp_pv', name: 'Petra Vogel', companyId: 'cmp_transporte', createdAt: new Date().toISOString() },

    'emp_ak': { id: 'emp_ak', name: 'Andrzej Kowalski', companyId: 'cmp_realestatepl', createdAt: new Date().toISOString() },
    'emp_mn': { id: 'emp_mn', name: 'Magda Nowak', companyId: 'cmp_realestatepl', createdAt: new Date().toISOString() },
    'emp_pl': { id: 'emp_pl', name: 'Paweł Lewandowski', companyId: 'cmp_realestatepl', createdAt: new Date().toISOString() },

    'emp_pk': { id: 'emp_pk', name: 'Piotr Kamiński', companyId: 'cmp_baupl', createdAt: new Date().toISOString() },
    'emp_aw_pl': { id: 'emp_aw_pl', name: 'Anna Wiśniewski', companyId: 'cmp_baupl', createdAt: new Date().toISOString() },
    'emp_tg': { id: 'emp_tg', name: 'Tomasz Górski', companyId: 'cmp_baupl', createdAt: new Date().toISOString() },

    'emp_ws': { id: 'emp_ws', name: 'Wolfgang Schmidt', companyId: 'cmp_grundbesitz', createdAt: new Date().toISOString() },
    'emp_im': { id: 'emp_im', name: 'Ingrid Müller', companyId: 'cmp_grundbesitz', createdAt: new Date().toISOString() },
    'emp_sb': { id: 'emp_sb', name: 'Stefan Bauer', companyId: 'cmp_grundbesitz', createdAt: new Date().toISOString() },
  };

  const positions = {
    // Bohrtechnik
    'pos_cj_ceo': { id: 'pos_cj_ceo', companyId: 'cmp_bohrtechnik', title: 'Geschäftsführer', employeeId: 'emp_cj', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_ab_ceo': { id: 'pos_ab_ceo', companyId: 'cmp_bohrtechnik', title: 'Geschäftsführer', employeeId: 'emp_ab', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_kj_proc': { id: 'pos_kj_proc', companyId: 'cmp_bohrtechnik', title: 'Prokuristin', employeeId: 'emp_kj', parentId: null, order: 2, createdAt: new Date().toISOString() },
    'pos_sg_dept': { id: 'pos_sg_dept', companyId: 'cmp_bohrtechnik', title: 'Fachaulsicht B - Spülbohrverfahren', employeeId: 'emp_sg', parentId: 'pos_kj_proc', order: 0, createdAt: new Date().toISOString() },
    'pos_gr_dept': { id: 'pos_gr_dept', companyId: 'cmp_bohrtechnik', title: 'Bauleitung', employeeId: 'emp_gr', parentId: 'pos_kj_proc', order: 1, createdAt: new Date().toISOString() },
    'pos_pd_team': { id: 'pos_pd_team', companyId: 'cmp_bohrtechnik', title: 'Team Nord', employeeId: 'emp_pd', parentId: 'pos_gr_dept', order: 0, createdAt: new Date().toISOString() },
    'pos_mj_dept': { id: 'pos_mj_dept', companyId: 'cmp_bohrtechnik', title: 'Verwaltung Buchha', employeeId: 'emp_mj', parentId: 'pos_kj_proc', order: 2, createdAt: new Date().toISOString() },

    // Tiefbau
    'pos_mj_t_ceo': { id: 'pos_mj_t_ceo', companyId: 'cmp_tiefbau', title: 'Geschäftsführer', employeeId: 'emp_mj_t', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_sj_t_ceo': { id: 'pos_sj_t_ceo', companyId: 'cmp_tiefbau', title: 'Geschäftsführerin', employeeId: 'emp_sj_t', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_tk_proc': { id: 'pos_tk_proc', companyId: 'cmp_tiefbau', title: 'Prokurist', employeeId: 'emp_tk', parentId: null, order: 2, createdAt: new Date().toISOString() },
    'pos_as_dept': { id: 'pos_as_dept', companyId: 'cmp_tiefbau', title: 'Poliere & Maschinisten', employeeId: 'emp_as', parentId: 'pos_tk_proc', order: 0, createdAt: new Date().toISOString() },
    'pos_pm_dept': { id: 'pos_pm_dept', companyId: 'cmp_tiefbau', title: 'Sicherheit & Umwelt', employeeId: 'emp_pm', parentId: 'pos_tk_proc', order: 1, createdAt: new Date().toISOString() },

    // Rohrbau
    'pos_rj_ceo': { id: 'pos_rj_ceo', companyId: 'cmp_rohrbau', title: 'Geschäftsführer', employeeId: 'emp_rj', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_tw_proc': { id: 'pos_tw_proc', companyId: 'cmp_rohrbau', title: 'Prokurist', employeeId: 'emp_tw', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_kf_dept': { id: 'pos_kf_dept', companyId: 'cmp_rohrbau', title: 'Schweißmeister', employeeId: 'emp_kf', parentId: 'pos_tw_proc', order: 0, createdAt: new Date().toISOString() },
    'pos_dh_dept': { id: 'pos_dh_dept', companyId: 'cmp_rohrbau', title: 'Rohrleitungsbau', employeeId: 'emp_dh', parentId: 'pos_tw_proc', order: 1, createdAt: new Date().toISOString() },

    // Galabau
    'pos_fj_ceo': { id: 'pos_fj_ceo', companyId: 'cmp_galabau', title: 'Geschäftsführer', employeeId: 'emp_fj', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_aw_proc': { id: 'pos_aw_proc', companyId: 'cmp_galabau', title: 'Prokuristin', employeeId: 'emp_aw', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_ms_dept': { id: 'pos_ms_dept', companyId: 'cmp_galabau', title: 'Projektleitung', employeeId: 'emp_ms', parentId: 'pos_aw_proc', order: 0, createdAt: new Date().toISOString() },
    'pos_jm_dept': { id: 'pos_jm_dept', companyId: 'cmp_galabau', title: 'Baubetrieb', employeeId: 'emp_jm', parentId: 'pos_aw_proc', order: 1, createdAt: new Date().toISOString() },

    // Transporte
    'pos_kj_t_ceo': { id: 'pos_kj_t_ceo', companyId: 'cmp_transporte', title: 'Geschäftsführer', employeeId: 'emp_kj_t', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_uh_proc': { id: 'pos_uh_proc', companyId: 'cmp_transporte', title: 'Prokuristin', employeeId: 'emp_uh', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_hb_dept': { id: 'pos_hb_dept', companyId: 'cmp_transporte', title: 'Fahrzeugverwaltung', employeeId: 'emp_hb', parentId: 'pos_uh_proc', order: 0, createdAt: new Date().toISOString() },
    'pos_pv_dept': { id: 'pos_pv_dept', companyId: 'cmp_transporte', title: 'Logistik', employeeId: 'emp_pv', parentId: 'pos_uh_proc', order: 1, createdAt: new Date().toISOString() },

    // Real Estate PL
    'pos_ak_ceo': { id: 'pos_ak_ceo', companyId: 'cmp_realestatepl', title: 'Geschäftsführer', employeeId: 'emp_ak', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_mn_proc': { id: 'pos_mn_proc', companyId: 'cmp_realestatepl', title: 'Prokuristin', employeeId: 'emp_mn', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_pl_dept': { id: 'pos_pl_dept', companyId: 'cmp_realestatepl', title: 'Immobilienverwaltung', employeeId: 'emp_pl', parentId: 'pos_mn_proc', order: 0, createdAt: new Date().toISOString() },

    // Bau PL
    'pos_pk_ceo': { id: 'pos_pk_ceo', companyId: 'cmp_baupl', title: 'Geschäftsführer', employeeId: 'emp_pk', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_aw_pl_proc': { id: 'pos_aw_pl_proc', companyId: 'cmp_baupl', title: 'Prokuristin', employeeId: 'emp_aw_pl', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_tg_dept': { id: 'pos_tg_dept', companyId: 'cmp_baupl', title: 'Bauleitung', employeeId: 'emp_tg', parentId: 'pos_aw_pl_proc', order: 0, createdAt: new Date().toISOString() },

    // Grundbesitz
    'pos_ws_ceo': { id: 'pos_ws_ceo', companyId: 'cmp_grundbesitz', title: 'Geschäftsführer', employeeId: 'emp_ws', parentId: null, order: 0, createdAt: new Date().toISOString() },
    'pos_im_proc': { id: 'pos_im_proc', companyId: 'cmp_grundbesitz', title: 'Prokuristin', employeeId: 'emp_im', parentId: null, order: 1, createdAt: new Date().toISOString() },
    'pos_sb_dept': { id: 'pos_sb_dept', companyId: 'cmp_grundbesitz', title: 'Immobilienmanagement', employeeId: 'emp_sb', parentId: 'pos_im_proc', order: 0, createdAt: new Date().toISOString() },
  };

  const seedData = {
    companies,
    employees,
    positions
  };

  localStorage.setItem(storageKey, JSON.stringify(seedData));
  console.log('Organization data seeded');
}

// Auto-seed on load
if (typeof window !== 'undefined') {
  seedOrganizationData();
}

Object.assign(window, { seedOrganizationData });
