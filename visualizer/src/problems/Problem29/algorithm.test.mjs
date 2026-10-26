import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { buildDivision, code } from './algorithm.js';

test('division trace agrees with truncation and preserves every committed chunk', () => {
  const cases = [[10, 3], [43, 5], [7, -3], [-7, 3], [-7, -3], [0, 1], [2, 5], [-2147483648, -1], [-2147483648, 1], [2147483647, 1], [-2147483648, -2147483648], [2147483647, -2147483648]];
  for (let dividend = -70; dividend <= 70; dividend++) for (let divisor = -20; divisor <= 20; divisor++) if (divisor) cases.push([dividend, divisor]);
  for (const [dividend, divisor] of cases) {
    const story = buildDivision({ dividend, divisor });
    const expected = Math.max(-2147483648, Math.min(2147483647, Math.trunc(dividend / divisor))) || 0;
    assert.equal(story.frames.at(-1).result, expected, `${dividend} / ${divisor}`);
    for (const frame of story.frames) {
      assert.equal(frame.remaining + frame.taken.reduce((sum, term) => sum + term.chunk, 0), story.total);
      for (const term of frame.taken) assert.equal(term.chunk, term.count * story.base);
      if (frame.activeLine === 13) assert.equal(frame.quotient * story.base + frame.remaining, story.total);
    }
  }
});

test('displayed Python solution handles signed boundaries and doubling', () => {
  const cases = [[10,3], [43,5], [7,-3], [-2147483648,1], [-2147483648,-1], [0,3]];
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([divide(*args) for args in p["cases"]]))'], {
    input: JSON.stringify({ source: code.map(line => line.text).join('\n'), cases }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  assert.deepEqual(JSON.parse(result.stdout), cases.map(([dividend, divisor]) => buildDivision({ dividend, divisor }).frames.at(-1).result));
});

test('rejects invalid integers and division by zero', () => {
  for (const values of [{ dividend: 1, divisor: 0 }, { dividend: '', divisor: 1 }, { dividend: 2147483648, divisor: 1 }, { dividend: '3.5', divisor: 2 }]) assert.throws(() => buildDivision(values));
});
