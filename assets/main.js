(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- куда отправлять заявки: подставьте свой эндпоинт (например, Laravel /api/leads) ---- */
  async function sendLead(data) {
    console.log('lead', data);
    // return fetch('/api/leads', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
  }

  /* ---------- sticky header, up button, scrollspy ---------- */
  const sticky = $('#sticky'), up = $('#up'), heroCard = $('.hero__card');
  const onScroll = () => {
    const y = scrollY;
    sticky.classList.toggle('is-shown', !heroCard || y > heroCard.offsetHeight + 40);
    up.classList.toggle('is-shown', y > 700);
  };
  addEventListener('scroll', onScroll, {passive: true}); onScroll();
  up.onclick = () => scrollTo({top: 0, behavior: 'smooth'});

  const spyIds = ['activities', 'day', 'open', 'season', 'contacts'];
  const spy = () => {
    let cur = null;
    if (!heroCard) return;
    for (const id of spyIds) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .4) cur = id; }
    $$('[data-spy] a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', spy, {passive: true}); spy();

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), {threshold: .12});
  $$('.rv').forEach(el => io.observe(el));

  /* ---------- mobile menu ---------- */
  const drawer = $('#drawer');
  $$('[data-menu]').forEach(b => b.onclick = () => { drawer.classList.add('is-open'); document.body.style.overflow = 'hidden'; });
  const closeDrawer = () => { drawer.classList.remove('is-open'); document.body.style.overflow = ''; };
  $('[data-menu-close]').onclick = closeDrawer;
  $$('#drawer nav a, #drawer [data-book]').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---------- carousels: arrows + drag ---------- */
  $$('.car').forEach(car => {
    const track = $('.car__track', car), prev = $('[data-prev]', car), next = $('[data-next]', car);
    if (!track || !prev) return;
    const step = () => { const c = track.children[0]; return c.offsetWidth + parseFloat(getComputedStyle(track).gap); };
    const upd = () => { prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; };
    prev.onclick = () => track.scrollBy({left: -step(), behavior: 'smooth'});
    next.onclick = () => track.scrollBy({left: step(), behavior: 'smooth'});
    track.addEventListener('scroll', upd, {passive: true}); addEventListener('resize', upd); upd();

    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointermove', e => {
      if (!down) return; const dx = e.clientX - sx;
      if (Math.abs(dx) > 5 && !moved) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false;
      if (moved) {
        track.classList.remove('is-drag');
        const s = step(), target = Math.round(track.scrollLeft / s) * s;
        track.scrollTo({left: target, behavior: 'smooth'});
        track.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); }, {capture: true, once: true});
      }
    });
  });

  /* ---------- day programs ---------- */
  const PROGS = {
    friends: {name: 'С друзьями', chip: 'Сплав', items: [
      ['10:00', 'Сплав по реке', 'Сами или с инструктором — как решит компания'],
      ['14:00', 'Пейнтбол 14+', 'Команда на команду, проигравшие жарят шашлык'],
      ['17:00', 'Мангал в беседке', 'Привал у воды после игры — святое'],
      ['20:00', 'Закат на SUP', 'Тихая вода и лучший вид за весь день']]},
    kids: {name: 'С детьми', chip: 'Лазертаг', items: [
      ['11:00', 'Лазертаг 6+', 'Безопасная битва без синяков — дети в восторге'],
      ['13:00', 'Пикник в беседке', 'Мангал, чай и торт, если это день рождения'],
      ['15:00', 'Сплав с инструктором', 'Короткий спокойный маршрут для всей семьи'],
      ['18:00', 'Домой', 'Уставшие, счастливые и с кучей фото']]},
    work: {name: 'С коллегами', chip: 'Пейнтбол', items: [
      ['10:00', 'Пейнтбол 14+', 'Отдел на отдел — без поблажек начальству'],
      ['13:00', 'Обед в банкетном зале', 'Тосты за общую победу и горячее'],
      ['15:00', 'Командный сплав', 'Работа в команде — на воде, а не в чате'],
      ['19:00', 'Мангал в беседке', 'Неформальная часть, которую будут вспоминать']]},
    two: {name: 'Вдвоём', chip: 'SUP', items: [
      ['11:00', 'SUP-прогулка', 'Две доски и вся река на двоих'],
      ['14:00', 'Сплав вдвоём', 'Спокойный маршрут без спешки'],
      ['17:00', 'Беседка у воды', 'Мангал, плед и никаких дел'],
      ['20:00', 'Закат на SUP', 'Тихая вода и лучший вид за весь день']]}
  };
  const tiles = $('#tiles'); let curProg = 'friends';
  if (tiles) {
  const tileHTML = (it, i) => `<div class="tile"><div class="tile__step">Шаг ${i + 1}</div><div class="tile__time">${it[0]}</div><div class="tile__name">${it[1]}</div><div class="tile__text">${it[2]}</div></div>`;
  tiles.innerHTML = PROGS[curProg].items.map(tileHTML).join('');
  $$('[data-prog]').forEach(b => b.onclick = () => {
    if (b.dataset.prog === curProg) return;
    curProg = b.dataset.prog;
    $$('[data-prog]').forEach(x => x.classList.toggle('is-on', x === b));
    const els = $$('.tile', tiles);
    els.forEach((t, i) => setTimeout(() => t.classList.add('is-out'), i * 50));
    setTimeout(() => {
      PROGS[curProg].items.forEach((it, i) => {
        const t = els[i];
        t.querySelector('.tile__time').textContent = it[0];
        t.querySelector('.tile__name').textContent = it[1];
        t.querySelector('.tile__text').textContent = it[2];
        setTimeout(() => t.classList.remove('is-out'), i * 70);
      });
    }, 320);
  });
  $('[data-want]').onclick = () => {
    const p = PROGS[curProg];
    openModal('', '', p.name);
  };
  }

  /* ---------- season (по текущему месяцу) ---------- */
  const SEASONS = {
    autumn: ['Осень на<br>proОтдых', 'Сентябрь — не время скучать. Лес становится золотым, вода — спокойной, а поле для пейнтбола — самым красивым за год. Соберите класс или друзей и начните сезон с яркой игры.', 'Забронировать осень'],
    winter: ['Зима на<br>proОтдых', 'Снег под ногами, мангал в тёплой беседке и пейнтбол, после которого особенно вкусный чай. Отличный повод для корпоратива или дня рождения на свежем воздухе.', 'Забронировать зиму'],
    spring: ['Весна на<br>proОтдых', 'Река просыпается, лес зеленеет — самое время открыть сезон сплавов. Собирайте компанию и приезжайте на первые тёплые выходные.', 'Забронировать весну'],
    summer: ['Лето на<br>proОтдых', 'Тёплая вода, длинные вечера и закаты на SUP-досках. Сплавы, игры и беседки у воды — всё лето напролёт.', 'Забронировать лето']
  };
  const m = new Date().getMonth();
  const key = m < 2 || m === 11 ? 'winter' : m < 5 ? 'spring' : m < 8 ? 'summer' : 'autumn';
  const S = SEASONS[key];
  if ($('#sTitle')) {
  $('#sTitle').innerHTML = S[0]; $('#sText').textContent = S[1];
  $('#sBtn').firstChild.textContent = S[2] + ' ';
  }

  /* ---------- phone mask ---------- */
  const fmt = v => {
    let d = v.replace(/\D/g, '');
    if (d[0] === '8' || d[0] === '7') d = d.slice(1);
    d = d.slice(0, 10);
    let r = '+7';
    if (d.length) r += ' (' + d.slice(0, 3);
    if (d.length >= 3) r += ')';
    if (d.length > 3) r += ' ' + d.slice(3, 6);
    if (d.length > 6) r += '-' + d.slice(6, 8);
    if (d.length > 8) r += '-' + d.slice(8, 10);
    return r;
  };
  const digits = v => v.replace(/\D/g, '').replace(/^[78]/, '').length;
  $$('[data-mask]').forEach(inp => {
    inp.addEventListener('focus', () => { if (!inp.value) inp.value = '+7 '; });
    inp.addEventListener('blur', () => { if (digits(inp.value) === 0) inp.value = ''; });
    inp.addEventListener('input', () => { inp.value = fmt(inp.value); inp.classList.remove('is-err'); });
  });

  /* ---------- modal ---------- */
  const modal = $('#modal'), form = $('.form', modal), chips = $$('#chips button');
  let lastFocus = null;
  chips.forEach(c => c.onclick = () => { chips.forEach(x => x.classList.toggle('is-on', x === c)); });
  let curProgram = '';
  const setProgram = name => { curProgram = name || ''; $('#progName').textContent = curProgram; $('#prog').classList.toggle('is-shown', !!curProgram); };
  $('#progX').onclick = () => setProgram('');
  function openModal(activity, comment, program) {
    lastFocus = document.activeElement;
    modal.classList.remove('is-sent');
    setProgram(program);
    chips.forEach(c => c.classList.toggle('is-on', !!activity && c.textContent === activity));
    $('#mComment').value = comment || '';
    $('#mDate').min = new Date().toISOString().slice(0, 10);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#mName').focus(), 250);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    lastFocus && lastFocus.focus && lastFocus.focus({preventScroll: true});
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-book]');
    if (!b) return;
    e.preventDefault();
    openModal(b.dataset.book || '', b.dataset.comment || '');
  });
  $$('[data-close]', modal).forEach(b => b.onclick = closeModal);
  modal.addEventListener('mousedown', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (modal.classList.contains('is-open')) closeModal(); else closeDrawer(); } });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#mName'), phone = $('#mPhone'), agree = $('#mAgree');
    let ok = true;
    name.classList.toggle('is-err', !name.value.trim()); if (!name.value.trim()) ok = false;
    phone.classList.toggle('is-err', digits(phone.value) < 10); if (digits(phone.value) < 10) ok = false;
    agree.classList.toggle('is-err', !agree.checked); $('#mAgreeErr').classList.toggle('is-shown', !agree.checked); if (!agree.checked) ok = false;
    if (!ok) { $('.is-err', form)?.focus(); return; }
    await sendLead({
      type: 'booking', name: name.value.trim(), phone: phone.value, program: curProgram,
      activity: chips.find(c => c.classList.contains('is-on'))?.textContent || '',
      date: $('#mDate').value, people: $('#mCount').value, comment: $('#mComment').value.trim()
    });
    modal.classList.add('is-sent'); form.reset(); chips.forEach(c => c.classList.remove('is-on'));
  });
  $('#mName').addEventListener('input', e => e.target.classList.remove('is-err'));
  $('#mAgree').addEventListener('change', e => { e.target.classList.remove('is-err'); $('#mAgreeErr').classList.remove('is-shown'); });

  /* ---------- callback ---------- */
  const cb = $('#cb');
  $('form', cb).addEventListener('submit', async e => {
    e.preventDefault();
    const phone = $('#cbPhone'), agree = $('#cbAgree');
    const bad = digits(phone.value) < 10;
    phone.classList.toggle('is-err', bad); agree.classList.toggle('is-err', !agree.checked);
    if (bad || !agree.checked) return;
    await sendLead({type: 'callback', phone: phone.value});
    cb.classList.add('is-sent');
  });
  $('#cbAgree').addEventListener('change', e => e.target.classList.remove('is-err'));
})();
