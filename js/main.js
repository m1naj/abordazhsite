/* ============ «Абордаж» — скрипты сайта ============ */

// Бургер-меню
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

// Плавное появление секций
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Подсветка меню + кнопка «наверх»
const links = [...document.querySelectorAll('.menu a[href^="#"]')];
const secs = [...document.querySelectorAll('main section[id]')];
const toTop = document.getElementById('toTop');
addEventListener('scroll', () => {
  const y = scrollY + 160;
  let cur = secs[0].id;
  secs.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  toTop.classList.toggle('show', scrollY > 600);
}, { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

// Форма заявки → запись в базу
document.getElementById('conForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('fName');
  const contact = document.getElementById('fTel');
  const message = document.getElementById('fMsg');
  if (!name.value.trim()) { name.focus(); return; }
  if (!contact.value.trim()) { contact.focus(); return; }

  LeadDB.add({
    name: name.value.trim(),
    contact: contact.value.trim(),
    message: message.value.trim()
  });

  e.target.reset();
  const ok = document.getElementById('formOk');
  ok.classList.add('show');
  setTimeout(() => ok.classList.remove('show'), 7000);
});

document.getElementById('year').textContent = new Date().getFullYear();