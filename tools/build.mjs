// Builds every page of the school website from school.config.mjs. No packages: `node tools/build.mjs`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { longDate, money, parseDate } from '../assets/js/school.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(ROOT, 'school.config.mjs');
const c = (await import(pathToFileURL(configPath).href + '?t=' + Date.now())).default;

// ── Checks: stop with a clear message rather than publish a broken site ──
const problems = [];
const ICONS = new Set([...readFileSync(join(ROOT, 'assets/icons.svg'), 'utf8').matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
const usedIcons = [...c.levels, ...c.facilities, ...c.approach, ...c.admissions.requirements, ...c.fees.payment].map((x) => x.icon);
for (const i of usedIcons) if (!ICONS.has(i)) problems.push(`Icon "${i}" is not in assets/icons.svg.`);
const credited = new Set(c.photoCredits.flatMap((p) => p.files));
const usedPhotos = [...Object.values(c.photos), ...c.facilities.map((f) => f.photo), ...c.news.map((n) => n.photo), ...c.gallery.map((g) => g.photo)].filter(Boolean);
for (const p of new Set(usedPhotos)) {
    if (!existsSync(join(ROOT, 'assets/photos', p))) problems.push(`Photo "${p}" is not in assets/photos.`);
    if (!credited.has(p)) problems.push(`Photo "${p}" has no entry in photoCredits.`);
}
const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(parseDate(d));
for (const e of c.calendar.events) if (!isDate(e.date)) problems.push(`Event "${e.title}" has date "${e.date}"; use YYYY-MM-DD.`);
for (const t of c.calendar.terms) if (!isDate(t.starts) || !isDate(t.ends)) problems.push(`${t.name} dates must be YYYY-MM-DD.`);
for (const n of c.news) if (!isDate(n.date)) problems.push(`News "${n.title}" has date "${n.date}"; use YYYY-MM-DD.`);
if (c.contact.whatsapp && !/^\d{9,15}$/.test(c.contact.whatsapp)) problems.push('contact.whatsapp must be digits only, with the country code (e.g. 233241234567).');
if (problems.length) {
    console.error('Cannot build the site:\n  - ' + problems.join('\n  - '));
    process.exit(1);
}

// ── Helpers ──
const esc = (s = '') => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="assets/icons.svg#${name}"/></svg>`;
const photo = (file, alt, cls = '', eager = false) =>
    `<img class="${cls}" src="assets/photos/${esc(file)}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
const initials = (name) => name.replace(/^(Dr|Mr|Mrs|Ms|Miss|Prof|Rev)\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const tel = 'tel:' + c.contact.phone.replace(/[^\d+]/g, '');
const wa = c.contact.whatsapp;
const waLink = (text) => `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
const shortDate = (iso) => parseDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const sortedEvents = [...c.calendar.events].sort((a, b) => a.date.localeCompare(b.date));

const CAP = `<svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="currentColor"/><path d="M8 17.5 20 12l12 5.5-12 5.5L8 17.5Z" fill="var(--accent)"/><path d="M13 20.2v5.3c0 1.6 3.1 3.3 7 3.3s7-1.7 7-3.3v-5.3l-7 3.2-7-3.2Z" fill="#fff"/><path d="M31 18v6.5" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const mark = c.logo ? `<img class="logo" src="${esc(c.logo)}" alt="" width="40" height="40">` : CAP;

const NAV = [
    ['about.html', 'About'],
    ['curriculum.html', 'Academics'],
    ['admission.html', 'Admissions'],
    ['school-fee.html', 'Fees'],
    ['schoolcalendar.html', 'Calendar'],
    ['gallery.html', 'Gallery'],
    ['parent-portal.html', 'Parents'],
    ['contact.html', 'Contact'],
];

// Wave-like underline used under section titles (a hand-ruled line).
const RULE = `<svg class="rule" viewBox="0 0 120 10" aria-hidden="true" preserveAspectRatio="none"><path d="M2 6c18-5 38-5 58 0s40 4 58-1" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>`;
const head = (kicker, title, text = '', cls = '') => `<div class="head ${cls}" data-reveal>
      ${kicker ? `<p class="kicker">${kicker}</p>` : ''}
      <h2>${title}</h2>${RULE}
      ${text ? `<p class="head__text">${text}</p>` : ''}
    </div>`;

// ── Reusable blocks ──
const eventItem = (e) => `<li class="event event--${e.type}" data-date="${e.date}">
        <span class="event__date"><b>${parseDate(e.date).getDate()}</b>${parseDate(e.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
        <span class="event__body"><strong>${esc(e.title)}</strong><small>${parseDate(e.date).toLocaleDateString('en-GB', { weekday: 'long' })}${e.time ? `, ${esc(e.time)}` : ''}${e.place ? `, ${esc(e.place)}` : ''}</small></span>
        <span class="event__when" data-when></span>
      </li>`;

const newsCard = (n, i) => `<article class="news" data-reveal style="--i:${i}">
        <div class="news__photo">${photo(n.photo, '')}<span class="tag">${esc(n.tag)}</span></div>
        <div class="news__body"><time datetime="${n.date}">${longDate(n.date, { weekday: undefined })}</time><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div>
      </article>`;

const field = (id, label, input, hint = '') => `<div class="field"><label for="${id}">${label}</label>${input}${hint ? `<small>${hint}</small>` : ''}</div>`;
const levelOptions = c.levels.map((l) => `<option>${esc(l.name)}</option>`).join('');
const formFoot = (verb) => `<p class="form__error" data-error role="alert" hidden></p>
        <button class="btn btn--primary btn--wide" type="submit">${icon(wa ? 'message-circle' : 'mail')}<span>${verb} ${wa ? 'on WhatsApp' : 'by email'}</span></button>
        <p class="form__note">${wa ? 'WhatsApp opens with your message written out. Press send to deliver it to the school office.' : 'Your email app opens with the message written out, ready to send.'}</p>`;

const cta = (title, text) => `<section class="cta">
  <div class="wrap">
    <div class="cta__box" data-reveal="zoom">
      ${photo(c.photos.cta, '', 'cta__photo')}
      <div class="cta__text"><h2>${title}</h2><p>${text}</p></div>
      <div class="cta__actions">
        <a class="btn btn--accent btn--lg" href="admission.html#apply">${icon('send')}<span>Start an application</span></a>
        <a class="btn btn--glass btn--lg" href="${tel}">${icon('phone')}<span>${esc(c.contact.phone)}</span></a>
      </div>
    </div>
  </div>
</section>`;

const pageHero = (title, text, crumb, art = '') => `<section class="page-hero">
  <div class="wrap page-hero__grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon('chevron-right')}<span aria-current="page">${crumb}</span></nav>
      <h1 data-split>${title}</h1>
      <p>${text}</p>
    </div>
    ${art}
  </div>
  <svg class="page-hero__wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30c240-40 480 40 720 10s480-40 720 0v20H0z"/></svg>
</section>`;
const heroPhotos = (a, b) => `<div class="page-hero__art" aria-hidden="true">${photo(a, '', 'ph ph--a')}${b ? photo(b, '', 'ph ph--b') : ''}<span class="ph-dot"></span></div>`;

// ── Layout ──
function layout(file, title, description, body) {
    const current = file === 'index.html' ? '' : file;
    return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="${esc(c.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
${c.url ? `<meta property="og:image" content="${esc(c.url)}assets/photos/${esc(c.photos.hero)}">\n<link rel="canonical" href="${esc(c.url)}${file === 'index.html' ? '' : file}">` : ''}
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(CAP.replace('class="mark"', 'xmlns="http://www.w3.org/2000/svg"').replace('currentColor', c.brand).replaceAll('var(--accent)', c.accent))}">
<link rel="preload" href="assets/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/jakarta.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">
<style>:root { --brand: ${esc(c.brand)}; --accent: ${esc(c.accent)}; }</style>
<script>document.documentElement.classList.add('js')</script>
${file === 'index.html' ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org', '@type': 'School', name: c.name, description: c.intro, foundingDate: String(c.founded),
        telephone: c.contact.phone, email: c.contact.email, address: c.contact.address, url: c.url || undefined,
    }).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>
${c.demo ? `<p class="demo-note">${icon('info')}<span>Demo school: the name, people, numbers and dates on this site are samples.</span></p>` : ''}
<header class="header" data-header>
  <div class="wrap header__row">
    <a class="brand" href="index.html" aria-label="${esc(c.name)}, home">${mark}<span><strong>${esc(c.name)}</strong><small>Est. ${c.founded}</small></span></a>
    <nav class="nav" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${h === current ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <a class="btn btn--accent header__cta" href="admission.html#apply">Apply now</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span><span></span></button>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <nav aria-label="Menu">
    <a href="index.html"${current === '' ? ' aria-current="page"' : ''}>Home</a>
    ${NAV.map(([h, t], i) => `<a href="${h}" style="--i:${i + 1}"${h === current ? ' aria-current="page"' : ''}>${t}</a>`).join('\n    ')}
  </nav>
  <div class="menu__foot">
    <a class="btn btn--accent btn--wide" href="admission.html#apply">${icon('send')}<span>Apply now</span></a>
    <a class="btn btn--glass btn--wide" href="${tel}">${icon('phone')}<span>${esc(c.contact.phone)}</span></a>
  </div>
</div>

<main id="main">
${body}
</main>

<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__about">
      <a class="brand brand--footer" href="index.html">${mark}<span><strong>${esc(c.name)}</strong><small>${esc(c.motto)}</small></span></a>
      <p>${esc(c.intro)}</p>
    </div>
    <div><h3>School</h3>${NAV.slice(0, 4).map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
    <div><h3>Families</h3>${NAV.slice(4).map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="assets/calendar.ics" download>Term dates for your phone</a></div>
    <div><h3>Visit us</h3><p>${esc(c.contact.address)}</p><p><a href="${tel}">${esc(c.contact.phone)}</a></p><p><a href="mailto:${esc(c.contact.email)}">${esc(c.contact.email)}</a></p><p>${esc(c.contact.officeHours)}</p></div>
  </div>
  <div class="wrap footer__base"><span>© <span data-year>${new Date().getFullYear()}</span> ${esc(c.name)}</span><a href="gallery.html#credits">Photo credits</a></div>
</footer>

<nav class="dock" aria-label="Quick contact">
  <a href="${tel}">${icon('phone')}<span>Call</span></a>
  ${wa ? `<a href="${waLink(`Hello ${c.name}, `)}" target="_blank" rel="noopener">${icon('message-circle')}<span>WhatsApp</span></a>` : ''}
  <a class="dock__main" href="admission.html#apply">${icon('send')}<span>Apply</span></a>
</nav>

<button class="to-top" type="button" aria-label="Back to top">${icon('arrow-up')}</button>
<script type="application/json" id="school-data">${JSON.stringify({
        name: c.name, whatsapp: wa, email: c.contact.email, currency: c.currency,
        terms: c.calendar.terms, events: sortedEvents.map(({ date, title }) => ({ date, title })),
        plans: c.fees.plans.map(({ level, perTerm }) => ({ level, perTerm })), discounts: c.fees.siblingDiscounts,
    }).replace(/</g, '\\u003c')}</script>
<script type="module" src="assets/js/site.js"></script>
</body>
</html>
`;
}

// ── Pages ──
const pages = {};

pages['index.html'] = [`${c.name} | ${c.motto}`, c.intro, `
<section class="hero">
  <div class="hero__bg" aria-hidden="true"><span class="blob blob--a"></span><span class="blob blob--b"></span></div>
  <div class="wrap hero__grid">
    <div class="hero__text">
      <p class="term-chip" data-term-chip>${icon('calendar-days')}<span data-term-text>${esc(c.calendar.year)} academic year</span></p>
      <h1 data-split>${esc(c.motto)}</h1>
      <p class="lead">${esc(c.intro)}</p>
      <div class="actions">
        <a class="btn btn--primary btn--lg" href="admission.html#apply">${icon('send')}<span>Apply for ${esc(c.admissions.year)}</span></a>
        <a class="btn btn--ghost btn--lg" href="${wa ? waLink(`Hello ${c.name}, I would like to visit the school. `) : tel}"${wa ? ' target="_blank" rel="noopener"' : ''}>${icon('school')}<span>Book a school visit</span></a>
      </div>
      <ul class="levels-mini">${c.levels.map((l) => `<li><a href="curriculum.html#${l.id}">${icon(l.icon)}${esc(l.name)}</a></li>`).join('')}</ul>
    </div>
    <div class="hero__art">
      <div class="hero__frame">${photo(c.photos.hero, 'Pupils in yellow uniforms at a school in Ghana', 'hero__photo', true)}</div>
      <div class="float float--next" data-next-event>
        <span class="float__icon">${icon('calendar')}</span>
        <span><small>Next on the calendar</small><strong data-next-title>${esc(sortedEvents[0]?.title || '')}</strong><em data-next-when></em></span>
      </div>
      <div class="float float--stat"><b>${c.stats[3]?.value ?? ''}${esc(c.stats[3]?.suffix || '')}</b><span>${esc(c.stats[3]?.label || '')}</span></div>
      <div class="hero__thumb">${photo(c.photos.welcome, '', '')}</div>
    </div>
  </div>
</section>

<div class="ticker" aria-label="Announcements">
  <span class="ticker__label">${icon('megaphone')} Notices</span>
  <div class="ticker__track"><ul>${[...c.announcements, ...c.announcements].map((a, i) => `<li${i >= c.announcements.length ? ' aria-hidden="true"' : ''}>${icon('star')}${esc(a)}</li>`).join('')}</ul></div>
</div>

<section class="stats-band">
  <ul class="wrap stats">
    ${c.stats.map((s, i) => `<li data-reveal style="--i:${i}"><strong data-count="${s.value}" data-suffix="${esc(s.suffix || '')}">${s.value.toLocaleString('en-GB')}${esc(s.suffix || '')}</strong><span>${esc(s.label)}</span></li>`).join('\n    ')}
  </ul>
</section>

<section class="section">
  <div class="wrap">
    ${head('From the first day to the BECE', 'Four stages, one school', 'Children can grow up with us, from Creche through Junior High School, on the national curriculum.')}
    <div class="levels">
      ${c.levels.map((l, i) => `<a class="level" href="curriculum.html#${l.id}" data-reveal style="--i:${i}" data-tilt>
        <span class="level__num">0${i + 1}</span>
        <span class="level__icon">${icon(l.icon)}</span>
        <h3>${esc(l.name)}</h3>
        <p class="level__ages">${esc(l.ages)}</p>
        <p>${esc(l.text)}</p>
        <span class="level__more">See subjects ${icon('arrow-right')}</span>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap split">
    <div class="split__media" data-reveal="left">
      ${photo(c.photos.about, 'Pupils with their teacher', 'split__photo')}
      <div class="badge-card">${icon('award')}<span><strong>Best Community School</strong><small>2023</small></span></div>
    </div>
    <div data-reveal="right">
      <p class="kicker">Since ${c.founded}</p>
      <h2>A school where every child is known by name</h2>${RULE}
      <blockquote class="quote">${icon('quote')}<p>${esc(c.welcome.text[0])}</p><cite><b>${esc(c.welcome.from)}</b>${esc(c.welcome.role)}</cite></blockquote>
      <ul class="values">${c.values.map((v) => `<li>${icon('check')}${esc(v)}</li>`).join('')}</ul>
      <a class="link" href="about.html">Our story ${icon('arrow-right')}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head('Facilities', 'Room to learn, read and play')}
    <div class="facilities">
      ${c.facilities.map((f, i) => `<article class="facility" data-reveal style="--i:${i}">
        ${photo(f.photo, '')}
        <div class="facility__body"><span class="facility__icon">${icon(f.icon)}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--brand">
  <div class="wrap split split--top">
    <div data-reveal="left">
      <p class="kicker kicker--light">${esc(c.calendar.year)}</p>
      <h2>Coming up at ${esc(c.shortName)}</h2>${RULE}
      <p class="on-dark">Term dates, meetings and celebrations. Add them all to your phone's calendar in one tap.</p>
      <div class="actions">
        <a class="btn btn--accent" href="assets/calendar.ics" download>${icon('calendar-plus')}<span>Add to my calendar</span></a>
        <a class="btn btn--glass" href="schoolcalendar.html">${icon('calendar-days')}<span>Full calendar</span></a>
      </div>
    </div>
    <ul class="events events--dark" data-upcoming="4" data-reveal="right">
      ${sortedEvents.map(eventItem).join('\n      ')}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head('News', 'What’s happening at school')}
    <div class="news-grid">
      ${c.news.slice(0, 3).map(newsCard).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    ${head('Gallery', 'A glimpse of school life')}
    <div class="mosaic">
      ${c.gallery.slice(0, 6).map((g, i) => `<a class="mosaic__item" href="gallery.html" data-reveal="zoom" style="--i:${i}">${photo(g.photo, g.caption)}<span>${esc(g.caption)}</span></a>`).join('\n      ')}
    </div>
    <p class="center"><a class="btn btn--ghost" href="gallery.html">${icon('images')}<span>See the full gallery</span></a></p>
  </div>
</section>

${cta(`Admissions are open for ${esc(c.admissions.year)}`, 'Tell us about your child and we will guide you through every step.')}
`];

pages['about.html'] = [`About us | ${c.name}`, `The story, mission and people of ${c.name} since ${c.founded}.`, `
${pageHero(`About ${esc(c.name)}`, `Building a community of learners, leaders and caring citizens since ${c.founded}.`, 'About', heroPhotos(c.photos.about, 'friends.webp'))}

<section class="section">
  <div class="wrap split">
    <div class="split__media" data-reveal="left">${photo(c.photos.welcome, 'Junior High pupils at the school flag', 'split__photo split__photo--tall')}</div>
    <div data-reveal="right">
      <p class="kicker">A welcome note</p>
      <h2>From our ${esc(c.welcome.role)}</h2>${RULE}
      <div class="letter">${c.welcome.text.map((t) => `<p>${esc(t)}</p>`).join('')}<p class="letter__sign"><b>${esc(c.welcome.from)}</b>${esc(c.welcome.role)}</p></div>
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    ${head('What guides us', 'Mission, vision and values')}
    <div class="mvv">
      <article data-reveal style="--i:0"><span class="mvv__icon">${icon('target')}</span><h3>Our mission</h3><p>${esc(c.mission)}</p></article>
      <article data-reveal style="--i:1"><span class="mvv__icon">${icon('eye')}</span><h3>Our vision</h3><p>${esc(c.vision)}</p></article>
      <article data-reveal style="--i:2"><span class="mvv__icon">${icon('heart')}</span><h3>Our values</h3><ul class="values values--stack">${c.values.map((v) => `<li>${icon('check')}${esc(v)}</li>`).join('')}</ul></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head('Our story', `${new Date().getFullYear() - c.founded} years of growing together`)}
    <ol class="timeline" data-timeline>
      ${c.history.map((h, i) => `<li data-reveal="${i % 2 ? 'right' : 'left'}"><span class="timeline__year">${h.year}</span><div class="timeline__card"><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    ${head('Facilities', 'Where learning happens')}
    <div class="facilities">
      ${c.facilities.map((f, i) => `<article class="facility" data-reveal style="--i:${i}">${photo(f.photo, '')}<div class="facility__body"><span class="facility__icon">${icon(f.icon)}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="staff">
  <div class="wrap">
    ${head('Our people', 'The team leading the school', 'Qualified, caring teachers who know every child.')}
    <ul class="staff">
      ${c.staff.map((s, i) => `<li class="person" data-reveal style="--i:${i % 3}"><span class="person__avatar" aria-hidden="true">${esc(initials(s.name))}</span><strong>${esc(s.name)}</strong><span class="person__role">${esc(s.role)}</span><small>${esc(s.qualifications)}</small></li>`).join('\n      ')}
    </ul>
  </div>
</section>

${cta('Come and see the school', 'Visit during school hours and meet our teachers. Call or send a message to arrange a time.')}
`];

pages['curriculum.html'] = [`Academics | ${c.name}`, `What children learn at ${c.name}, from Creche to Junior High School.`, `
${pageHero('Academics', 'The national standards-based curriculum, taught with care from Creche to Junior High School.', 'Academics', heroPhotos('reading-test.webp', 'library.webp'))}

<section class="section">
  <div class="wrap">
    ${head('How we teach', 'Learning with purpose', 'We follow the national curriculum and focus on understanding and practical skills, not memorising.')}
    <div class="approach">
      ${c.approach.map((a, i) => `<article data-reveal style="--i:${i}"><span class="approach__icon">${icon(a.icon)}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--paper" id="levels">
  <div class="wrap">
    ${head('Levels', 'What your child will learn')}
    <div class="tabs" role="tablist" aria-label="School levels" data-tabs>
      ${c.levels.map((l, i) => `<button role="tab" id="tab-${l.id}" aria-controls="${l.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${icon(l.icon)}<span>${esc(l.name)}</span></button>`).join('')}
      <span class="tabs__ink" aria-hidden="true"></span>
    </div>
    ${c.levels.map((l, i) => `<section class="panel" role="tabpanel" id="${l.id}" aria-labelledby="tab-${l.id}"${i ? ' hidden' : ''}>
      <div class="panel__intro">
        <span class="panel__icon">${icon(l.icon)}</span>
        <div><h3>${esc(l.name)}</h3><p class="panel__ages">${esc(l.ages)}</p></div>
      </div>
      <p class="panel__text">${esc(l.text)}</p>
      <h4>Subjects</h4>
      <ul class="chips">${l.subjects.map((s, j) => `<li style="--i:${j}">${esc(s)}</li>`).join('')}</ul>
    </section>`).join('\n    ')}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head('Assessment', 'How progress is measured')}
    <div class="approach">
      <article data-reveal style="--i:0"><span class="approach__icon">${icon('notebook-pen')}</span><h3>Class work and tests</h3><p>Regular exercises, projects and end-of-term examinations, with a report card every term.</p></article>
      <article data-reveal style="--i:1"><span class="approach__icon">${icon('clipboard-list')}</span><h3>NSAT</h3><p>The National Standard Assessment Test in Basic 2, 4 and 6 tracks progress against national standards.</p></article>
      <article data-reveal style="--i:2"><span class="approach__icon">${icon('graduation-cap')}</span><h3>BECE</h3><p>JHS 3 pupils sit the Basic Education Certificate Examination for placement into Senior High School.</p></article>
    </div>
  </div>
</section>

${cta('Ready to join us?', 'Start an application and we will arrange a placement assessment if needed.')}
`];

pages['admission.html'] = [`Admissions | ${c.name}`, `How to apply to ${c.name} for ${c.admissions.year}.`, `
${pageHero('Admissions', `Applications are open for the ${esc(c.admissions.year)} academic year. Here is how it works.`, 'Admissions', heroPhotos(c.photos.admissions, 'uniform.webp'))}

<section class="section">
  <div class="wrap">
    ${head('Step by step', 'Five steps to your child’s first day')}
    <ol class="steps" data-steps>
      ${c.admissions.steps.map((s, i) => `<li data-reveal style="--i:${i}"><span class="steps__n">${i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('\n      ')}
    </ol>
    <p class="note">${icon('info')}<span>The application form costs ${money(c.admissions.formFee, c.currency)}, paid at the school office.</span></p>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    ${head('What we look for', 'Before you apply')}
    <div class="approach">
      ${c.admissions.requirements.map((r, i) => `<article data-reveal style="--i:${i}"><span class="approach__icon">${icon(r.icon)}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="apply">
  <div class="wrap split split--form">
    <div data-reveal="left">
      <p class="kicker">Apply</p>
      <h2>Start your application</h2>${RULE}
      <p class="lead-sm">Tell us a little about your child. The school office will reply with the next steps and a date for the assessment.</p>
      <ul class="checks">
        <li>${icon('circle-check')}Takes about two minutes</li>
        <li>${icon('circle-check')}No payment needed to enquire</li>
        <li>${icon('circle-check')}Fees from ${money(Math.min(...c.fees.plans.map((p) => p.perTerm)), c.currency)} a term. <a href="school-fee.html">See all fees</a></li>
      </ul>
    </div>
    <form class="form" data-form="Admission enquiry" novalidate data-reveal="right">
      <div class="field-row">
        ${field('a-parent', 'Parent or guardian', '<input id="a-parent" name="Parent" autocomplete="name" required>')}
        ${field('a-phone', 'Phone number', '<input id="a-phone" name="Phone" type="tel" autocomplete="tel" required>')}
      </div>
      <div class="field-row">
        ${field('a-child', 'Child’s name', '<input id="a-child" name="Child" required>')}
        ${field('a-age', 'Child’s age', '<input id="a-age" name="Age" inputmode="numeric" maxlength="2">')}
      </div>
      <div class="field-row">
        ${field('a-level', 'Level', `<select id="a-level" name="Level">${levelOptions}</select>`)}
        ${field('a-start', 'Start in', `<select id="a-start" name="Start">${c.calendar.terms.map((t) => `<option>${esc(t.name)}</option>`).join('')}<option>Next academic year</option></select>`)}
      </div>
      ${field('a-msg', 'Anything else? <span class="optional">(optional)</span>', '<textarea id="a-msg" name="Message" rows="3"></textarea>')}
      ${formFoot('Send enquiry')}
    </form>
  </div>
</section>

<section class="section section--paper" id="faq">
  <div class="wrap faq">
    <div data-reveal="left"><p class="kicker">Questions</p><h2>Parents often ask</h2>${RULE}<p class="lead-sm">Something else? Call <a href="${tel}">${esc(c.contact.phone)}</a>.</p></div>
    <div data-reveal="right">${c.faqs.map((f) => `<details><summary>${esc(f.q)}<span class="plus" aria-hidden="true"></span></summary><div class="details__body"><p>${esc(f.a)}</p></div></details>`).join('\n      ')}</div>
  </div>
</section>
`];

pages['school-fee.html'] = [`Fees | ${c.name}`, `School fees at ${c.name} for ${c.fees.year}, with sibling discounts and ways to pay.`, `
${pageHero('School fees', `Clear fees for ${esc(c.fees.year)}, with discounts for brothers and sisters.`, 'Fees', heroPhotos('uniform.webp'))}

<section class="section">
  <div class="wrap">
    ${head(`Academic year ${esc(c.fees.year)}`, 'Fees per term', esc(c.fees.note))}
    <div class="plans">
      ${c.fees.plans.map((p, i) => `<article class="plan${p.popular ? ' plan--popular' : ''}" data-reveal style="--i:${i}">
        ${p.popular ? '<span class="plan__flag">Most pupils</span>' : ''}
        <h3>${esc(p.level)}</h3><p class="plan__covers">${esc(p.covers)}</p>
        <p class="plan__price"><small>${esc(c.currency)}</small><b data-count="${p.perTerm}">${p.perTerm.toLocaleString('en-GB')}</b><span>a term</span></p>
        <p class="plan__year">${money(p.perTerm * 3, c.currency)} a year</p>
        <ul>${p.includes.map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--paper" id="calculator">
  <div class="wrap split split--top">
    <div data-reveal="left">
      <p class="kicker">Family fee calculator</p>
      <h2>Work out your family’s fees</h2>${RULE}
      <p class="lead-sm">Add each child and their level. Sibling discounts are applied automatically:</p>
      <ul class="discounts">${c.fees.siblingDiscounts.map((d, i) => `<li><b>${d}%</b><span>off for the ${['2nd', '3rd', '4th and later'][i] || `${i + 2}th`} child</span></li>`).join('')}</ul>
      <p class="small">The child with the highest fees pays in full, and the discounts apply to the others.</p>
    </div>
    <div class="calc" data-calc data-reveal="right">
      <ol class="calc__kids" data-kids></ol>
      <button class="btn btn--ghost btn--sm" type="button" data-add-child>${icon('plus')}<span>Add a child</span></button>
      <dl class="calc__total">
        <div><dt>Per term</dt><dd data-per-term></dd></div>
        <div><dt>Per year (3 terms)</dt><dd data-per-year></dd></div>
        <div class="calc__saving" data-saving-row hidden><dt>You save each year</dt><dd data-saving></dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head('Paying fees', 'Ways to pay', 'Fees are due in full in the first week of each term. Always keep your receipt.')}
    <div class="approach">
      ${c.fees.payment.map((p, i) => `<article data-reveal style="--i:${i}"><span class="approach__icon">${icon(p.icon)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join('\n      ')}
    </div>
  </div>
</section>

${cta('Questions about fees?', 'The school office is happy to explain fees and payment plans.')}
`];

pages['schoolcalendar.html'] = [`Calendar and news | ${c.name}`, `Term dates, events and news at ${c.name} for ${c.calendar.year}.`, `
${pageHero('Calendar and news', `Term dates and events for ${esc(c.calendar.year)}, and the latest from school.`, 'Calendar', heroPhotos('independence-march.webp', 'cultural-day.webp'))}

<section class="section">
  <div class="wrap">
    <div class="term-board" data-reveal>
      <div class="term-board__now">
        <p class="kicker">Right now</p>
        <h2 data-term-title>${esc(c.calendar.year)}</h2>
        <p data-term-detail></p>
        <div class="bar" aria-hidden="true"><span data-term-bar></span></div>
      </div>
      <div class="term-board__next">
        <p class="kicker">Next event</p>
        <h3 data-next-title>${esc(sortedEvents[0]?.title || '')}</h3>
        <p data-next-date></p>
        <div class="countdown" data-countdown aria-live="off">
          ${['days', 'hours', 'minutes', 'seconds'].map((u) => `<span><b data-cd="${u}">0</b><small>${u}</small></span>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    ${head(esc(c.calendar.year), 'Term dates and events')}
    <div class="term-dates">${c.calendar.terms.map((t, i) => `<div data-reveal style="--i:${i}"><b>${esc(t.name)}</b><span>${shortDate(t.starts)} to ${shortDate(t.ends)}</span></div>`).join('')}</div>
    <div class="calendar-cols">
      ${c.calendar.terms.map((t) => `<div class="calendar-col" data-reveal>
        <h3>${esc(t.name)}</h3>
        <ul class="events">${sortedEvents.filter((e) => e.date >= t.starts && e.date <= t.ends).map(eventItem).join('')}</ul>
      </div>`).join('\n      ')}
    </div>
    ${(() => { const loose = sortedEvents.filter((e) => !c.calendar.terms.some((t) => e.date >= t.starts && e.date <= t.ends)); return loose.length ? `<div class="calendar-col" data-reveal><h3>Holidays and other dates</h3><ul class="events">${loose.map(eventItem).join('')}</ul></div>` : ''; })()}
    <p class="center"><a class="btn btn--primary" href="assets/calendar.ics" download>${icon('calendar-plus')}<span>Add all dates to my phone calendar</span></a></p>
  </div>
</section>

<section class="section" id="news">
  <div class="wrap">
    ${head('News', 'Latest from school')}
    <div class="news-grid news-grid--2">
      ${c.news.map(newsCard).join('\n      ')}
    </div>
  </div>
</section>
`];

const categories = [...new Set(c.gallery.map((g) => g.category))];
pages['gallery.html'] = [`Gallery | ${c.name}`, `Photos of school life at ${c.name}.`, `
${pageHero('Gallery', 'Lessons, celebrations, sport and friendships: a look at everyday school life.', 'Gallery', heroPhotos('cultural-day.webp', 'friends.webp'))}

<section class="section">
  <div class="wrap">
    <div class="filters" role="group" aria-label="Show photos">
      <button type="button" class="chip-btn is-active" data-filter="all" aria-pressed="true">All</button>
      ${categories.map((k) => `<button type="button" class="chip-btn" data-filter="${slug(k)}" aria-pressed="false">${esc(k)}</button>`).join('')}
    </div>
    <ul class="gallery" data-gallery>
      ${c.gallery.map((g, i) => `<li data-cat="${slug(g.category)}" data-reveal="zoom" style="--i:${i % 4}"><button type="button" data-index="${i}" aria-label="Open photo: ${esc(g.caption)}">${photo(g.photo, g.caption)}<span>${icon('expand')}${esc(g.caption)}</span></button></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<dialog class="lightbox" data-lightbox aria-label="Photo viewer">
  <button class="lightbox__close" type="button" data-close aria-label="Close">${icon('x')}</button>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-prev aria-label="Previous photo">${icon('chevron-left')}</button>
  <figure><img alt="" data-lb-img><figcaption data-lb-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-next aria-label="Next photo">${icon('chevron-right')}</button>
</dialog>
<script type="application/json" id="gallery-data">${JSON.stringify(c.gallery.map((g) => ({ src: `assets/photos/${g.photo}`, caption: g.caption })))}</script>

<section class="section section--paper" id="credits">
  <div class="wrap">
    ${head('Photo credits', 'Thank you to the photographers', 'The photos on this demo site are freely licensed images of schools in Ghana, from Wikimedia Commons.')}
    <ul class="credits">
      ${c.photoCredits.map((p) => `<li><strong>${esc(p.title)}</strong><span>${esc(p.author)}</span><em>${esc(p.licence)}</em></li>`).join('\n      ')}
    </ul>
  </div>
</section>
`];

pages['parent-portal.html'] = [`Parents | ${c.name}`, `Notices, term dates, absence reporting and feedback for ${c.name} parents.`, `
${pageHero('For parents', 'Notices, term dates and a direct line to the school office.', 'Parents', heroPhotos('walk-to-school.webp'))}

<section class="section">
  <div class="wrap">
    <div class="quick">
      <a href="assets/calendar.ics" download data-reveal style="--i:0">${icon('calendar-plus')}<strong>Term dates</strong><span>Add to your phone</span></a>
      <a href="school-fee.html#calculator" data-reveal style="--i:1">${icon('calculator')}<strong>Fees</strong><span>Work out your fees</span></a>
      <a href="#absence" data-reveal style="--i:2">${icon('clipboard-list')}<strong>Report an absence</strong><span>Tell the office</span></a>
      <a href="#feedback" data-reveal style="--i:3">${icon('message-circle')}<strong>Feedback</strong><span>Share a concern or idea</span></a>
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap split split--top">
    <div data-reveal="left">
      <p class="kicker">Notice board</p>
      <h2>Latest notices</h2>${RULE}
      <ul class="notices">${c.announcements.map((a) => `<li>${icon('bell')}<span>${esc(a)}</span></li>`).join('')}</ul>
    </div>
    <div data-reveal="right">
      <p class="kicker">Coming up</p>
      <h2>Next dates</h2>${RULE}
      <ul class="events" data-upcoming="4">${sortedEvents.map(eventItem).join('')}</ul>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap forms-2">
    <form class="form" id="absence" data-form="Absence report" novalidate data-reveal="left">
      <h2>${icon('clipboard-list')} Report an absence</h2>
      <p class="small">Please tell us by 9:00 am on the day your child will be away.</p>
      ${field('ab-child', 'Child’s name and class', '<input id="ab-child" name="Child and class" required>')}
      <div class="field-row">
        ${field('ab-date', 'Date of absence', '<input id="ab-date" name="Date" type="date" required>')}
        ${field('ab-reason', 'Reason', '<select id="ab-reason" name="Reason"><option>Illness or medical</option><option>Family emergency</option><option>Travel</option><option>Other</option></select>')}
      </div>
      ${field('ab-parent', 'Your name', '<input id="ab-parent" name="Parent" autocomplete="name" required>')}
      ${field('ab-note', 'Details <span class="optional">(optional)</span>', '<textarea id="ab-note" name="Details" rows="2"></textarea>')}
      ${formFoot('Send')}
    </form>
    <form class="form" id="feedback" data-form="Parent feedback" novalidate data-reveal="right">
      <h2>${icon('message-circle')} Feedback or a concern</h2>
      <p class="small">Messages go to the school office and are handled by the administration.</p>
      ${field('fb-name', 'Your name', '<input id="fb-name" name="Name" autocomplete="name" required>')}
      ${field('fb-cat', 'About', '<select id="fb-cat" name="About"><option>Learning and teaching</option><option>A member of staff</option><option>Facilities</option><option>Bullying or behaviour</option><option>A suggestion</option></select>')}
      ${field('fb-msg', 'Your message', '<textarea id="fb-msg" name="Message" rows="4" required></textarea>')}
      ${formFoot('Send')}
    </form>
  </div>
</section>
`];

pages['contact.html'] = [`Contact | ${c.name}`, `Phone, address, office hours and directions for ${c.name}.`, `
${pageHero('Contact us', 'Call, send a message or visit. The school office is happy to help.', 'Contact')}

<section class="section">
  <div class="wrap">
    <div class="contact-cards">
      <a href="${tel}" data-reveal style="--i:0">${icon('phone')}<strong>Call</strong><span>${esc(c.contact.phone)}</span></a>
      ${wa ? `<a href="${waLink(`Hello ${c.name}, `)}" target="_blank" rel="noopener" data-reveal style="--i:1">${icon('message-circle')}<strong>WhatsApp</strong><span>Message the office</span></a>` : ''}
      <a href="mailto:${esc(c.contact.email)}" data-reveal style="--i:2">${icon('mail')}<strong>Email</strong><span>${esc(c.contact.email)}</span></a>
      <div data-reveal style="--i:3">${icon('clock')}<strong>Office hours</strong><span>${esc(c.contact.officeHours)}</span></div>
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap split split--form">
    <div data-reveal="left">
      <p class="kicker">Find us</p>
      <h2>${esc(c.contact.address)}</h2>${RULE}
      <p class="lead-sm">${esc(c.contact.landmark)}</p>
      <div class="map"><iframe title="Map showing ${esc(c.name)}" src="https://maps.google.com/maps?q=${encodeURIComponent(c.contact.mapQuery)}&amp;z=14&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
      <a class="btn btn--ghost" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(c.contact.mapQuery)}" target="_blank" rel="noopener">${icon('map-pin')}<span>Get directions</span></a>
    </div>
    <form class="form" data-form="Message" novalidate data-reveal="right">
      <h2>${icon('send')} Send a message</h2>
      <div class="field-row">
        ${field('c-name', 'Your name', '<input id="c-name" name="Name" autocomplete="name" required>')}
        ${field('c-phone', 'Phone number', '<input id="c-phone" name="Phone" type="tel" autocomplete="tel">')}
      </div>
      ${field('c-msg', 'Message', '<textarea id="c-msg" name="Message" rows="5" required></textarea>')}
      ${formFoot('Send')}
    </form>
  </div>
</section>
`];

// ── Calendar file for phones (iCalendar) ──
const icsDate = (iso) => iso.replaceAll('-', '');
const nextDay = (iso) => { const d = parseDate(iso); d.setDate(d.getDate() + 1); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; };
const icsText = (s) => String(s).replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${icsText(c.name)}//School calendar//EN`, 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${icsText(c.name)}`,
    ...sortedEvents.flatMap((e, i) => [
        'BEGIN:VEVENT', `UID:${icsDate(e.date)}-${i}-${slug(e.title)}@${slug(c.name)}`, `DTSTAMP:${icsDate(sortedEvents[0].date)}T000000Z`,
        `DTSTART;VALUE=DATE:${icsDate(e.date)}`, `DTEND;VALUE=DATE:${nextDay(e.date)}`,
        `SUMMARY:${icsText(e.title)}`, ...(e.place || e.time ? [`DESCRIPTION:${icsText([e.time, e.place].filter(Boolean).join(', '))}`] : []), 'END:VEVENT',
    ]),
    'END:VCALENDAR',
].join('\r\n');
writeFileSync(join(ROOT, 'assets/calendar.ics'), ics + '\r\n');

for (const [file, [title, description, body]] of Object.entries(pages)) {
    writeFileSync(join(ROOT, file), layout(file, title, description, body).replace(/\n{3,}/g, '\n\n'));
}
console.log(`Built ${Object.keys(pages).length} pages and assets/calendar.ics for ${c.name}.`);
