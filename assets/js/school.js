// School logic shared by the website and the tests (no dependencies).

const DAY = 86_400_000;

/** 'YYYY-MM-DD' -> Date at local midnight. */
export const parseDate = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const midnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Whole days from `now` until the date (0 = today, negative = past). */
export const daysUntil = (iso, now = new Date()) => Math.round((parseDate(iso) - midnight(now)) / DAY);

/** The first event today or later, or null when the calendar is over. */
export function nextEvent(events, now = new Date()) {
    return [...events].sort((a, b) => a.date.localeCompare(b.date)).find((e) => daysUntil(e.date, now) >= 0) || null;
}

/** Where the school year stands: in a term, between terms, before or after the year. */
export function termStatus(terms, now = new Date()) {
    const sorted = [...terms].sort((a, b) => a.starts.localeCompare(b.starts));
    for (const t of sorted) {
        if (daysUntil(t.starts, now) <= 0 && daysUntil(t.ends, now) >= 0) {
            const total = daysUntil(t.ends, parseDate(t.starts)) + 1;
            const done = -daysUntil(t.starts, now) + 1;
            return { state: 'in-term', term: t, progress: Math.min(1, done / total), daysLeft: daysUntil(t.ends, now) };
        }
    }
    const next = sorted.find((t) => daysUntil(t.starts, now) > 0);
    if (next) return { state: 'break', term: next, daysToStart: daysUntil(next.starts, now) };
    return { state: 'finished', term: sorted.at(-1) };
}

/** Plain-language countdown: 'today', 'tomorrow', 'in 12 days', 'in 3 weeks'. */
export function whenText(days) {
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days < 21) return `in ${days} days`;
    if (days < 60) return `in ${Math.round(days / 7)} weeks`;
    return `in ${Math.round(days / 30)} months`;
}

/**
 * Fees for a family. children: list of plan indexes, one per child.
 * The most expensive child pays in full; discounts apply to the next children in order of cost,
 * which is how schools usually apply sibling discounts (the family gets the larger saving).
 */
export function familyFees(children, plans, discounts) {
    const fees = children.map((i) => plans[i].perTerm).sort((a, b) => b - a);
    const lines = fees.map((fee, n) => {
        const pct = n === 0 ? 0 : discounts[Math.min(n - 1, discounts.length - 1)] || 0;
        return { fee, pct, pays: Math.round(fee * (1 - pct / 100)) };
    });
    const perTerm = lines.reduce((s, l) => s + l.pays, 0);
    const full = fees.reduce((s, f) => s + f, 0);
    return { lines, perTerm, perYear: perTerm * 3, saving: (full - perTerm) * 3 };
}

export const money = (n, currency) => `${currency} ${n.toLocaleString('en-GB')}`;

export const longDate = (iso, opts = {}) =>
    parseDate(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...opts });
