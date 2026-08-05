/* ============ «Абордаж» — админ-панель ============ */
const ADMIN_PASS = 'ahoy2026'; // ⚠ ОБЯЗАТЕЛЬНО смените пароль!

const gate = document.getElementById('gate');
const panel = document.getElementById('panel');
const loginErr = document.getElementById('loginErr');

const authed = () => sessionStorage.getItem('abordazh_admin') === '1';

// Вход
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const pass = document.getElementById('loginPass');
  if (pass.value === ADMIN_PASS) {
    sessionStorage.setItem('abordazh_admin', '1');
    openPanel();
  } else {
    loginErr.classList.add('show');
    pass.value = '';
    pass.focus();
  }
});

// Выход
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('abordazh_admin');
  panel.hidden = true;
  gate.hidden = false;
});

function openPanel() {
  gate.hidden = true;
  panel.hidden = false;
  render();
}

// Защита от XSS при выводе заявок
const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Отрисовка таблицы и статистики
function render() {
  const leads = LeadDB.all();
  document.getElementById('statTotal').textContent = leads.length;
  document.getElementById('statNew').textContent = leads.filter(l => l.status === 'new').length;
  document.getElementById('statDone').textContent = leads.filter(l => l.status === 'done').length;

  const tbody = document.getElementById('leadsBody');
  if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Пока пусто — ни одной голубиной вести…</td></tr>';
    return;
  }
  tbody.innerHTML = leads.map(l => `
    <tr class="${l.status}">
      <td>${esc(l.date)}</td>
      <td><b>${esc(l.name)}</b></td>
      <td>${esc(l.contact)}</td>
      <td>${esc(l.message || '—')}</td>
      <td><span class="badge ${l.status}">${l.status === 'new' ? 'новая' : 'обработана'}</span></td>
      <td class="acts">
        <button data-act="toggle" data-id="${l.id}" title="Сменить статус">✔</button>
        <button data-act="del" data-id="${l.id}" title="Удалить">☠</button>
      </td>
    </tr>`).join('');
}

// Действия в таблице
document.getElementById('leadsBody').addEventListener('click', e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.act === 'del') {
    if (confirm('Удалить заявку безвозвратно?')) { LeadDB.remove(id); render(); }
  } else {
    const lead = LeadDB.all().find(l => l.id === id);
    LeadDB.update(id, { status: lead.status === 'new' ? 'done' : 'new' });
    render();
  }
});

// Кнопки панели
document.getElementById('refreshBtn').addEventListener('click', render);

document.getElementById('exportBtn').addEventListener('click', () => {
  const leads = LeadDB.all();
  if (!leads.length) { alert('Нет заявок для экспорта.'); return; }
  const rows = [
    ['Дата', 'Имя', 'Контакт', 'Сообщение', 'Статус'],
    ...leads.map(l => [l.date, l.name, l.contact, l.message || '', l.status === 'new' ? 'новая' : 'обработана'])
  ];
  const csv = '\uFEFF' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'abordazh-leads.csv';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Стереть ВСЮ базу заявок? Действие необратимо!')) { LeadDB.clear(); render(); }
});

// Синхронизация между вкладками
addEventListener('storage', () => { if (!panel.hidden) render(); });

if (authed()) openPanel();