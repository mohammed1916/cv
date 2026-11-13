
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseInput,
  raiseCost,
  buildTrace,
  buildAlternativeTrace,
} from './algorithm.js';

function oracle(nums, k) {
  let answer = 0;

  for (let l = 0; l < nums.length; l++) {
    let high = -Infinity;
    let cost = 0;

    for (let r = l; r < nums.length; r++) {
      high = Math.max(high, nums[r]);
      cost += high - nums[r];

      if (cost <= k) answer++;
    }
  }

  return answer;
}

const cases = [
  { nums: [4, 1, 5, 2], k: 3, expected: 9 },
  { nums: [3], k: 0, expected: 1 },
  { nums: [4, 4, 4], k: 2, expected: 6 },
  { nums: [1, 2, 3, 4], k: 0, expected: 10 },
  { nums: [5, 4, 3], k: 0, expected: 3 },
  { nums: [5, 4, 3], k: 3, expected: 6 },
  { nums: [9, 1], k: 7, expected: 2 },
  { nums: [9, 1], k: 8, expected: 3 },
];

test('raiseCost calculates minimum increments', () => {
  assert.equal(raiseCost([4, 1, 5]), 3);
  assert.equal(raiseCost([4, 1, 5, 2]), 6);
  assert.equal(raiseCost([1, 2, 3]), 0);
  assert.equal(raiseCost([5, 4, 3]), 3);
});

for (const [name, build] of [
  ['brute force', buildTrace],
  ['optimized deque', buildAlternativeTrace],
]) {
  test(`${name}: known cases`, () => {
    for (const { expected, ...input } of cases) {
      assert.equal(build(input).result, expected);
    }
  });

  test(`${name}: trace contains complete result`, () => {
    const input = { nums: [4, 1, 5, 2], k: 3 };
    const run = build(input);
    const final = run.frames.at(-1);

    assert.equal(final.phase, 'done');
    assert.equal(final.result, 9);
    assert.equal(final.count, 9);
    assert.equal(run.result, 9);
    assert.equal(Object.keys(final.matrix).length, 10);
  });

  test(`${name}: loop conditions are visible`, () => {
    const run = build({ nums: [4, 1, 5, 2], k: 3 });
    const loops = run.frames.filter(f => f.phase === 'loop-check');

    assert.ok(loops.length > 0);
    assert.ok(loops.some(f => f.loop?.branch === 'repeat'));
    assert.ok(loops.some(f => f.loop?.branch === 'exit'));
  });

  test(`${name}: 1000 randomized inputs match oracle`, () => {
    let seed = 3420;

    function random(n) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % n;
    }

    for (let trial = 0; trial < 1000; trial++) {
      const n = 1 + random(8);
      const nums = Array.from({ length: n }, () => 1 + random(9));
      const k = random(21);

      const input = { nums, k };

      assert.equal(
        build(input).result,
        oracle(nums, k),
        JSON.stringify(input)
      );
    }
  });
}

test('brute force shows increment and budget decisions', () => {
  const run = buildTrace({ nums: [4, 1, 5, 2], k: 3 });

  assert.ok(run.frames.some(f => f.phase === 'increment'));
  assert.ok(run.frames.some(f => f.phase === 'fits'));
  assert.ok(run.frames.some(f => f.phase === 'too-costly'));

  const full = run.frames.find(
    f => f.phase === 'too-costly' && f.l === 0 && f.r === 3
  );

  assert.equal(full.cost, 6);
});

test('optimized trace shows block merges and window shrinking', () => {
  const run = buildAlternativeTrace({
    nums: [6, 4, 4, 7, 4, 4, 8, 8],
    k: 2,
  });

  assert.ok(run.frames.some(f => f.phase === 'merge'));
  assert.ok(run.frames.some(f => f.phase === 'shrink'));
  assert.ok(run.frames.some(f => f.phase === 'deque-push'));
  assert.ok(run.frames.some(f => f.phase === 'count-window'));
});

test('both approaches agree on assignment of valid matrix cells', () => {
  const input = {
    nums: [6, 4, 4, 7, 4, 4, 8, 8],
    k: 12,
  };

  const brute = buildTrace(input);
  const optimized = buildAlternativeTrace(input);

  assert.equal(brute.result, optimized.result);

  const a = brute.frames.at(-1).matrix;
  const b = optimized.frames.at(-1).matrix;

  for (const key of Object.keys(a)) {
    assert.equal(a[key].valid, b[key].valid, key);
    assert.equal(a[key].cost, b[key].cost, key);
  }
});

test('input validation rejects invalid values', () => {
  assert.throws(() => parseInput('{"nums":[],"k":2}'));
  assert.throws(() => parseInput('{"nums":[1,2],"k":-1}'));
  assert.throws(() => parseInput('{"nums":[1,10],"k":2}'));
  assert.throws(() => parseInput('{"nums":[1.5],"k":2}'));
});
