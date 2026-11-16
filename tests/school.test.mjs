// Run with: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { daysUntil, nextEvent, termStatus, whenText, familyFees } from '../assets/js/school.js';

const day = (iso) => new Date(iso + 'T10:00:00');
const terms = [
    { name: 'Term 1', starts: '2026-09-08', ends: '2026-12-18' },
    { name: 'Term 2', starts: '2027-01-12', ends: '2027-04-01' },
];

test('days until a date', () => {
    assert.equal(daysUntil('2026-11-15', day('2026-11-15')), 0);
    assert.equal(daysUntil('2026-11-16', day('2026-11-15')), 1);
    assert.equal(daysUntil('2026-11-14', day('2026-11-15')), -1);
});

test('next event skips the past and includes today', () => {
    const events = [{ date: '2026-12-18', title: 'B' }, { date: '2026-11-05', title: 'A' }, { date: '2026-11-15', title: 'Today' }];
    assert.equal(nextEvent(events, day('2026-11-15')).title, 'Today');
    assert.equal(nextEvent(events, day('2026-11-16')).title, 'B');
    assert.equal(nextEvent(events, day('2027-01-01')), null);
});

test('term status: in term, break, finished', () => {
    const inTerm = termStatus(terms, day('2026-11-15'));
    assert.equal(inTerm.state, 'in-term');
    assert.equal(inTerm.term.name, 'Term 1');
    assert.equal(inTerm.daysLeft, 33);
    assert.ok(inTerm.progress > 0.6 && inTerm.progress < 0.7);
    const brk = termStatus(terms, day('2026-12-25'));
    assert.deepEqual([brk.state, brk.term.name, brk.daysToStart], ['break', 'Term 2', 18]);
    assert.equal(termStatus(terms, day('2027-05-01')).state, 'finished');
});

test('countdown wording', () => {
    assert.equal(whenText(0), 'today');
    assert.equal(whenText(1), 'tomorrow');
    assert.equal(whenText(12), 'in 12 days');
    assert.equal(whenText(35), 'in 5 weeks');
    assert.equal(whenText(95), 'in 3 months');
});

test('sibling discounts: dearest child pays full, then 5%, 10%, 15%, 15%', () => {
    const plans = [{ perTerm: 2500 }, { perTerm: 3200 }, { perTerm: 4000 }];
    const one = familyFees([1], plans, [5, 10, 15]);
    assert.deepEqual([one.perTerm, one.perYear, one.saving], [3200, 9600, 0]);
    const three = familyFees([0, 2, 1], plans, [5, 10, 15]);
    // 4000 full, 3200 less 5% = 3040, 2500 less 10% = 2250
    assert.equal(three.perTerm, 4000 + 3040 + 2250);
    assert.equal(three.saving, (160 + 250) * 3);
    const five = familyFees([0, 0, 0, 0, 0], plans, [5, 10, 15]);
    assert.deepEqual(five.lines.map((l) => l.pct), [0, 5, 10, 15, 15]);
});
