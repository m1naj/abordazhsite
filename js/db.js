/* =====================================================
   «Абордаж» — «база данных» заявок (localStorage браузера)
   ===================================================== */
const DB_KEY = 'abordazh_leads_v1';

const LeadDB = {
  all() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
    catch { return []; }
  },
  save(leads) { localStorage.setItem(DB_KEY, JSON.stringify(leads)); },

  add({ name, contact, message }) {
    const leads = this.all();
    leads.unshift({
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      name, contact, message,
      status: 'new'
    });
    this.save(leads);
  },

  update(id, patch) {
    this.save(this.all().map(l => l.id === id ? { ...l, ...patch } : l));
  },
  remove(id) {
    this.save(this.all().filter(l => l.id !== id));
  },
  clear() { localStorage.removeItem(DB_KEY); }
};