import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveNarrative } from './resolveNarrative.js';
import { stockNarrative } from '../../problems/Problem121/stockNarrative.js';
import { buildStock1Story } from '../../problems/Problem121/algorithm.js';
import { braceNarrative } from '../../problems/Problem1096/braceNarrative.js';

test('missing definitions opt out without creating placeholder explanations', () => {
  assert.equal(resolveNarrative(undefined, { step: null }), null);
  assert.equal(resolveNarrative(() => null, { step: null }), null);
});

test('ready content is restored on reset; line overrides refine a phase', () => {
  const definition = {
    goal: 'Goal', ready: { achieved: 'Not started' },
    phases: { scan: { why: 'Scan purpose', achieved: 'Phase outcome' } },
    lines: { 7: ({ step }) => ({ achieved: `Value ${step.value}` }) },
  };
  const frame = resolveNarrative(definition, { step: { phase: 'scan', activeLine: 7, value: 3 } });
  assert.equal(frame.goal, 'Goal');
  assert.equal(frame.why, 'Scan purpose');
  assert.equal(frame.achieved, 'Value 3');
  assert.equal(frame.activeLine, 7);
  assert.equal(resolveNarrative(definition, { step: null }).achieved, 'Not started');
  assert.equal(resolveNarrative(definition, { step: null }).activeLine, undefined);
});

test('every stock frame has purposeful content for gains, losses, ties and one day', () => {
  for (const input of ['[7,1,5,3,6,4]', '[5,4,3]', '[3,3,3]', '[5]']) {
    const story = buildStock1Story(input);
    for (const step of story.frames) {
      const narrative = resolveNarrative(stockNarrative, { step, story });
      for (const key of ['goal', 'why', 'achieved', 'next']) {
        assert.ok(narrative[key], `${input}: line ${step.activeLine} missing ${key}`);
        assert.ok(!narrative[key].includes('undefined'));
      }
    }
    const done = resolveNarrative(stockNarrative, { step: story.frames.at(-1), story });
    assert.ok(done.achieved.includes(story.maxProfit > 0 ? String(story.maxProfit) : 'zero'));
  }
});

test('standalone callback definitions receive current input after reset', () => {
  const first = resolveNarrative(braceNarrative, { step: null, input: '{a,b}' });
  const reset = resolveNarrative(braceNarrative, { step: null, input: '{x,y}' });
  assert.ok(first.next.includes('{a,b}'));
  assert.ok(reset.next.includes('{x,y}'));
  assert.equal(reset.activeLine, undefined);
});
