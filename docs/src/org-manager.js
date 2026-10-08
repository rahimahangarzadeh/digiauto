/* Organization Manager — localStorage-based org data */

class OrgManager {
  constructor() {
    this.storageKey = 'janning_org_data';
    this.initializeData();
  }

  initializeData() {
    if (!localStorage.getItem(this.storageKey)) {
      const defaultData = {
        companies: {},
        employees: {},
        positions: {},
      };
      localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || { companies: {}, employees: {}, positions: {} };
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Companies
  addCompany(company) {
    const data = this.getData();
    const id = 'cmp_' + Date.now();
    data.companies[id] = { id, ...company, createdAt: new Date().toISOString() };
    this.saveData(data);
    return id;
  }

  getCompanies() {
    return Object.values(this.getData().companies);
  }

  getCompany(id) {
    return this.getData().companies[id];
  }

  updateCompany(id, updates) {
    const data = this.getData();
    if (data.companies[id]) {
      data.companies[id] = { ...data.companies[id], ...updates };
      this.saveData(data);
    }
  }

  deleteCompany(id) {
    const data = this.getData();
    delete data.companies[id];
    // Also delete all positions for this company
    Object.keys(data.positions).forEach(posId => {
      if (data.positions[posId].companyId === id) delete data.positions[posId];
    });
    this.saveData(data);
  }

  // Employees
  addEmployee(employee) {
    const data = this.getData();
    const id = 'emp_' + Date.now();
    data.employees[id] = { id, ...employee, createdAt: new Date().toISOString() };
    this.saveData(data);
    return id;
  }

  getEmployees() {
    return Object.values(this.getData().employees);
  }

  getEmployee(id) {
    return this.getData().employees[id];
  }

  updateEmployee(id, updates) {
    const data = this.getData();
    if (data.employees[id]) {
      data.employees[id] = { ...data.employees[id], ...updates };
      this.saveData(data);
    }
  }

  // Positions
  addPosition(position) {
    const data = this.getData();
    const id = 'pos_' + Date.now();
    data.positions[id] = { id, ...position, createdAt: new Date().toISOString() };
    this.saveData(data);
    return id;
  }

  getPositions(companyId) {
    return Object.values(this.getData().positions).filter(p => p.companyId === companyId);
  }

  updatePosition(id, updates) {
    const data = this.getData();
    if (data.positions[id]) {
      data.positions[id] = { ...data.positions[id], ...updates };
      this.saveData(data);
    }
  }

  deletePosition(id) {
    const data = this.getData();
    delete data.positions[id];
    this.saveData(data);
  }

  // Get position hierarchy for a company
  getHierarchy(companyId) {
    const positions = this.getPositions(companyId);
    const hierarchyMap = {};
    positions.forEach(pos => {
      if (!hierarchyMap[pos.parentId || 'root']) {
        hierarchyMap[pos.parentId || 'root'] = [];
      }
      hierarchyMap[pos.parentId || 'root'].push(pos);
    });
    return hierarchyMap;
  }

  // Reorder positions
  reorderPositions(companyId, positions) {
    positions.forEach((pos, idx) => {
      this.updatePosition(pos.id, { order: idx });
    });
  }
}

window.orgManager = new OrgManager();
