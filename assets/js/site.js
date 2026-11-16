import { daysUntil, familyFees, longDate, money, nextEvent, parseDate, termStatus, whenText } from './school.js';

const data = JSON.parse(document.getElementById('school-data').textContent);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ── Split headings into words for the entrance animation ──
$$('[data-split]').forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--w:${i}">${w}</span>`).join(' ');
});

// ── Mobile menu ──
const menuBtn = $('.menu-btn');
const menu = $('#menu');
const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) $('a', menu).focus();
};
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
$$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

// ── Scroll: progress, compact header, dock, back-to-top, timeline ──
const header = $('[data-header]');
const progress = $('.progress');
const dock = $('.dock');
const toTop = $('.to-top');
const timeline = $('[data-timeline]');
let ticking = false;
function onScroll() {
    ticking = false;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    progress.style.setProperty('--p', p);
    toTop.style.setProperty('--p', p);
    header.classList.toggle('is-scrolled', y > 10);
    dock?.classList.toggle('is-shown', y > 380);
    toTop.classList.toggle('is-shown', y > 700);
    if (timeline) {
        const r = timeline.getBoundingClientRect();
        const t = (innerHeight * 0.7 - r.top) / r.height;
        timeline.style.setProperty('--progress', Math.max(0, Math.min(1, t)));
    }
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

// ── Reveal on scroll and count-up figures ──
const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const show = (v) => (el.textContent = Math.round(v).toLocaleString('en-GB') + suffix);
    if (reduced) return show(target);
    const start = performance.now();
    const step = (now) => {
        const t = Math.min(1, (now - start) / 1700);
        show(target * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};
const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        io.unobserve(el);
        el.classList.add('is-in');
        if (el.matches('[data-count]')) countUp(el);
        $$('[data-count]', el).forEach(countUp);
        // Give the element back to its own hover styles once it has arrived.
        if (el.hasAttribute('data-reveal')) setTimeout(() => { el.removeAttribute('data-reveal'); }, 1500);
    }
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('[data-reveal], .rule, [data-count]').forEach((el) => {
    if (el.matches('[data-count]') && el.closest('[data-reveal]')) return;
    io.observe(el);
});

// ── Subtle 3D tilt on level cards (mouse only) ──
if (!reduced && matchMedia('(pointer: fine)').matches) {
    $$('[data-tilt]').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
}

// ── Term status and upcoming events ──
const now = new Date();
const status = termStatus(data.terms, now);
const termText = $('[data-term-text]');
if (termText) {
    termText.textContent = status.state === 'in-term'
        ? `${status.term.name} is on: ${status.daysLeft === 0 ? 'last day today' : `ends ${whenText(status.daysLeft)}`}`
        : status.state === 'break'
            ? `Holidays: ${status.term.name} starts ${whenText(status.daysToStart)}`
            : 'The school year has ended';
}
const termTitle = $('[data-term-title]');
if (termTitle) {
    const detail = $('[data-term-detail]');
    const bar = $('[data-term-bar]');
    if (status.state === 'in-term') {
        termTitle.textContent = `${status.term.name} is on`;
        detail.textContent = `${Math.round(status.progress * 100)}% of the term done. It ends on ${longDate(status.term.ends)}.`;
        requestAnimationFrame(() => { bar.style.width = `${Math.max(3, status.progress * 100)}%`; });
    } else if (status.state === 'break') {
        termTitle.textContent = 'School holidays';
        detail.textContent = `${status.term.name} starts on ${longDate(status.term.starts)}, ${whenText(status.daysToStart)}.`;
        bar.parentElement.hidden = true;
    } else {
        termTitle.textContent = 'The school year has ended';
        detail.textContent = 'Dates for next year will appear here soon.';
        bar.parentElement.hidden = true;
    }
}

const next = nextEvent(data.events, now);
$$('[data-next-title]').forEach((el) => { el.textContent = next ? next.title : 'No more events this year'; });
$$('[data-next-when]').forEach((el) => { el.textContent = next ? `${parseDate(next.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}, ${whenText(daysUntil(next.date, now))}` : ''; });
$$('[data-next-date]').forEach((el) => { el.textContent = next ? longDate(next.date) : ''; });

// Mark each event as past / next, and keep only the next few in "upcoming" lists.
$$('.event[data-date]').forEach((li) => {
    const d = daysUntil(li.dataset.date, now);
    li.classList.toggle('is-past', d < 0);
    li.classList.toggle('is-next', !!next && li.dataset.date === next.date);
    const when = $('[data-when]', li);
    if (when) when.textContent = d < 0 ? 'Done' : whenText(d);
});
$$('[data-upcoming]').forEach((list) => {
    const limit = Number(list.dataset.upcoming);
    let shown = 0;
    $$('.event', list).forEach((li) => {
        const keep = !li.classList.contains('is-past') && shown < limit;
        if (keep) shown++;
        li.classList.toggle('is-hidden', !keep);
    });
});

// Live countdown to the next event (its start of day).
const cd = $('[data-countdown]');
if (cd) {
    if (!next) cd.hidden = true;
    else {
        const target = parseDate(next.date).getTime();
        const parts = Object.fromEntries($$('[data-cd]', cd).map((b) => [b.dataset.cd, b]));
        const tick = () => {
            const ms = Math.max(0, target - Date.now());
            const s = Math.floor(ms / 1000);
            parts.days.textContent = Math.floor(s / 86400);
            parts.hours.textContent = String(Math.floor(s / 3600) % 24).padStart(2, '0');
            parts.minutes.textContent = String(Math.floor(s / 60) % 60).padStart(2, '0');
            parts.seconds.textContent = String(s % 60).padStart(2, '0');
        };
        tick();
        setInterval(tick, 1000);
    }
}

// ── Tabs (levels) ──
const tabs = $('[data-tabs]');
if (tabs) {
    const buttons = $$('[role="tab"]', tabs);
    const ink = $('.tabs__ink', tabs);
    const moveInk = (btn) => { ink.style.width = `${btn.offsetWidth}px`; ink.style.transform = `translateX(${btn.offsetLeft}px)`; };
    const select = (btn, focus = false) => {
        buttons.forEach((b) => {
            const on = b === btn;
            b.setAttribute('aria-selected', String(on));
            b.tabIndex = on ? 0 : -1;
            document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
        });
        moveInk(btn);
        if (focus) btn.focus();
        btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
    };
    buttons.forEach((b, i) => {
        b.addEventListener('click', () => { select(b); history.replaceState(null, '', '#' + b.getAttribute('aria-controls')); });
        b.addEventListener('keydown', (e) => {
            const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (d) { e.preventDefault(); select(buttons[(i + d + buttons.length) % buttons.length], true); }
        });
    });
    const fromHash = () => {
        const b = buttons.find((x) => '#' + x.getAttribute('aria-controls') === location.hash);
        if (b) { select(b); tabs.scrollIntoView({ block: 'start', behavior: 'auto' }); }
    };
    addEventListener('hashchange', fromHash);
    addEventListener('resize', () => moveInk(buttons.find((b) => b.getAttribute('aria-selected') === 'true')));
    document.fonts?.ready.then(() => moveInk(buttons.find((b) => b.getAttribute('aria-selected') === 'true')));
    moveInk(buttons[0]);
    fromHash();
}

// ── Family fee calculator ──
const calc = $('[data-calc]');
if (calc) {
    const list = $('[data-kids]', calc);
    const options = data.plans.map((p, i) => `<option value="${i}">${p.level}</option>`).join('');
    const out = { term: $('[data-per-term]', calc), year: $('[data-per-year]', calc), save: $('[data-saving]', calc), saveRow: $('[data-saving-row]', calc) };
    const bump = (el, text) => { if (el.textContent !== text) { el.textContent = text; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } };
    const update = () => {
        const rows = $$('li', list);
        const kids = rows.map((li) => Number($('select', li).value));
        const r = familyFees(kids, data.plans, data.discounts);
        // Show each child's own amount: match rows to the sorted lines by fee, dearest first.
        const order = kids.map((k, i) => ({ i, fee: data.plans[k].perTerm })).sort((a, b) => b.fee - a.fee);
        order.forEach(({ i }, n) => {
            const line = r.lines[n];
            $('.pays', rows[i]).innerHTML = `${money(line.pays, data.currency)}${line.pct ? `<small>${line.pct}% off</small>` : ''}`;
        });
        bump(out.term, money(r.perTerm, data.currency));
        bump(out.year, money(r.perYear, data.currency));
        out.saveRow.hidden = !r.saving;
        out.save.textContent = money(r.saving, data.currency);
        $$('button', list).forEach((b) => { b.hidden = rows.length === 1; });
    };
    const addChild = (level = 1) => {
        const li = document.createElement('li');
        li.innerHTML = `<select aria-label="Level">${options}</select><span class="pays"></span><button type="button" aria-label="Remove this child"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#x"/></svg></button>`;
        $('select', li).value = String(Math.min(level, data.plans.length - 1));
        $('select', li).addEventListener('change', update);
        $('button', li).addEventListener('click', () => { li.remove(); update(); });
        list.append(li);
        update();
    };
    $('[data-add-child]', calc).addEventListener('click', () => { if ($$('li', list).length < 8) addChild(0); });
    addChild(1);
}

// ── Forms: compose a WhatsApp message (or an email) from the labelled fields ──
$$('form[data-form]').forEach((form) => {
    const error = $('[data-error]', form);
    const fail = (msg, field) => {
        error.textContent = msg;
        error.hidden = false;
        $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
        field.setAttribute('aria-invalid', 'true');
        field.focus();
    };
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fields = $$('input, select, textarea', form);
        for (const f of fields) {
            if (f.required && !f.value.trim()) return fail(`Please fill in "${form.querySelector(`label[for="${f.id}"]`).textContent.replace(/\(optional\)/, '').trim()}".`, f);
            if (f.type === 'tel' && f.value && f.value.replace(/\D/g, '').length < 9) return fail('Please check the phone number.', f);
        }
        error.hidden = true;
        $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
        const lines = [`${form.dataset.form} for ${data.name}`, ''];
        for (const f of fields) {
            if (!f.value.trim()) continue;
            const value = f.type === 'date' ? longDate(f.value) : f.value.trim();
            lines.push(`${f.name}: ${value}`);
        }
        const text = lines.join('\n');
        form.classList.add('is-sent');
        if (data.whatsapp) window.open(`https://wa.me/${data.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        else location.href = `mailto:${data.email}?subject=${encodeURIComponent(form.dataset.form)}&body=${encodeURIComponent(text)}`;
    });
});

// ── Gallery: filters and lightbox ──
const gallery = $('[data-gallery]');
if (gallery) {
    const chips = $$('[data-filter]');
    chips.forEach((chip) => chip.addEventListener('click', () => {
        chips.forEach((c) => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
        $$('li', gallery).forEach((li) => {
            const show = chip.dataset.filter === 'all' || li.dataset.cat === chip.dataset.filter;
            li.hidden = !show;
            if (show && !reduced) li.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
        });
    }));

    const photos = JSON.parse($('#gallery-data').textContent);
    const box = $('[data-lightbox]');
    const img = $('[data-lb-img]', box);
    const cap = $('[data-lb-cap]', box);
    let index = 0;
    const visible = () => $$('li:not([hidden]) button', gallery).map((b) => Number(b.dataset.index));
    const show = (i) => {
        index = i;
        img.src = photos[i].src;
        img.alt = photos[i].caption;
        cap.textContent = photos[i].caption;
        img.getAnimations?.().forEach((a) => a.cancel());
        if (!reduced) img.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
    };
    const step = (d) => { const v = visible(); show(v[(v.indexOf(index) + d + v.length) % v.length]); };
    let opener = null;
    $$('button[data-index]', gallery).forEach((b) => b.addEventListener('click', () => { opener = b; show(Number(b.dataset.index)); box.showModal(); }));
    $('[data-close]', box).addEventListener('click', () => box.close());
    $('[data-prev]', box).addEventListener('click', () => step(-1));
    $('[data-next]', box).addEventListener('click', () => step(1));
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('close', () => opener?.focus());
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
    let startX = null;
    box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => { if (startX === null) return; const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); startX = null; });
}

const year = $('[data-year]');
if (year) year.textContent = new Date().getFullYear();
