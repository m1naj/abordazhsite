/* ============ «Абордаж» — админ-панель (токен-авторизация) ============ */
const gate = document.getElementById('gate');
const panel = document.getElementById('panel');
const loginErr = document.getElementById('loginErr');

const TOKEN_KEY = 'abordazh_admin_token';
const getToken = () => localStorage.getItem(TOKEN_KEY) || '';

function api(url, options = {}) {
  options.headers = Object.assign({
    'Content-Type': 'application/json',
    'X-Admin-Token': getToken()
  }, options.headers || {});
  return fetch('/api/' + url, options).then(r => r.json());
}

// Вход
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const user = document.getElementById('loginUser');
  const pass = document.getElementById('loginPass');
  loginErr.classList.remove('show');

  try {
    const data = await api('login.php', {
      method: 'POST',
      body: JSON.stringify({ username: user.value.trim(), password: pass.value })
    });

    if (data.ok) {
      localStorage.setItem(TOKEN_KEY, data.token);
      openPanel();
    } else {
      loginErr.textContent = data.error || 'Неверный логин или пароль';
      loginErr.classList.add('show');
    }
  } catch (err) {
    loginErr.textContent = 'Ошибка соединения с сервером';
    loginErr.classList.add('show');
  }

  pass.value = '';
  pass.focus();
});

// Выход
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try { await api('logout.php', { method: 'POST' }); } catch (e) {}
  localStorage.removeItem(TOKEN_KEY);
  panel.hidden = true;
  gate.hidden = false;
});

function openPanel() {
  gate.hidden = true;
  panel.hidden = false;
  render();
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function render() {
  try {
    const data = await api('get-leads.php');

    if (!data.ok) {
      localStorage.removeItem(TOKEN_KEY);
      panel.hidden = true;
      gate.hidden = false;
      return;
    }

    const leads = data.leads || [];

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
        await api('delete-lead.php', { method: 'POST', body: JSON.stringify({ id }) });
        await render();
      }
    } else {
      const newStatus = btn.dataset.status === 'new' ? 'done' : 'new';
      await api('update-lead.php', { method: 'POST', body: JSON.stringify({ id, status: newStatus }) });
      await render();
    }
  } catch (err) {
    alert('Ошибка выполнения действия');
  } finally {
    btn.disabled = false;
  }
});

// Кнопки панели
document.getElementById('refreshBtn').addEventListener('click', render);

document.getElementById('exportBtn').addEventListener('click', async () => {
  const data = await api('get-leads.php');
  const leads = (data.ok && data.leads) ? data.leads : [];
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

document.getElementById('clearBtn').addEventListener('click', async () => {
  if (confirm('Стереть ВСЮ базу заявок? Действие необратимо!')) {
    await api('clear-leads.php', { method: 'POST' });
    await render();
  }
});

// Инициализация: если токен есть — сразу открываем панель
if (getToken()) openPanel();