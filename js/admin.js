/* ============ «Абордаж» — админ-панель (API) ============ */
const gate = document.getElementById('gate');
const panel = document.getElementById('panel');
const loginErr = document.getElementById('loginErr');

const API = {
  login: '/api/login.php',
  logout: '/api/logout.php',
  getLeads: '/api/get-leads.php',
  updateLead: '/api/update-lead.php',
  deleteLead: '/api/delete-lead.php',
  clearLeads: '/api/clear-leads.php'
};

async function checkAuth() {
  try {
    const res = await fetch(API.getLeads, { credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

// Вход
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const pass = document.getElementById('loginPass');
  loginErr.classList.remove('show');
  
  try {
    const res = await fetch(API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: pass.value })
    });
    
    if (res.ok) {
      openPanel();
    } else {
      loginErr.classList.add('show');
    }
  } catch {
    loginErr.textContent = 'Ошибка соединения с сервером';
    loginErr.classList.add('show');
  }
  
  pass.value = '';
  pass.focus();
});

// Выход
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch(API.logout, { credentials: 'include' });
  panel.hidden = true;
  gate.hidden = false;
});

async function openPanel() {
  gate.hidden = true;
  panel.hidden = false;
  await render();
}

const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function render() {
  try {
    const res = await fetch(API.getLeads, { credentials: 'include' });
    if (res.status === 401) {
      panel.hidden = true;
      gate.hidden = false;
      return;
    }
    
    const { leads } = await res.json();
    
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
          <button data-act="toggle" data-id="${l.id}" data-status="${l.status}" title="Сменить статус">✔</button>
          <button data-act="del" data-id="${l.id}" title="Удалить">☠</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    console.error('Ошибка загрузки заявок:', err);
  }
}

// Действия в таблице
document.getElementById('leadsBody').addEventListener('click', async e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  
  const id = Number(btn.dataset.id);
  btn.disabled = true;
  
  try {
    if (btn.dataset.act === 'del') {
      if (confirm('Удалить заявку безвозвратно?')) {
        await fetch(API.deleteLead, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id })
        });
        await render();
      }
    } else if (btn.dataset.act === 'toggle') {
      const newStatus = btn.dataset.status === 'new' ? 'done' : 'new';
      await fetch(API.updateLead, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status: newStatus })
      });
      await render();
    }
  } catch (err) {
    alert('Ошибка выполнения действия');
    console.error(err);
  } finally {
    btn.disabled = false;
  }
});

// Кнопки панели
document.getElementById('refreshBtn').addEventListener('click', render);

document.getElementById('exportBtn').addEventListener('click', async () => {
  try {
    const res = await fetch(API.getLeads, { credentials: 'include' });
    const { leads } = await res.json();
    
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
  } catch (err) {
    alert('Ошибка экспорта');
  }
});

document.getElementById('clearBtn').addEventListener('click', async () => {
  if (confirm('Стереть ВСЮ базу заявок? Действие необратимо!')) {
    try {
      await fetch(API.clearLeads, {
        method: 'POST',
        credentials: 'include'
      });
      await render();
    } catch (err) {
      alert('Ошибка очистки базы');
    }
  }
});

// Проверка авторизации при загрузке
(async () => {
  if (await checkAuth()) {
    openPanel();
  }
})();