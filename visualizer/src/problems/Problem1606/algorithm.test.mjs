
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseInput,
  buildTrace,
  buildAlternativeTrace,
} from './algorithm.js';

function oracle({ k, arrival, load }) {
  const freeAt = Array(k).fill(-Infinity);
  const handled = Array(k).fill(0);
  for (let i = 0; i < arrival.length; i++) {
    for (let j = 0; j < k; j++) {
      const s = (i % k + j) % k;
      if (freeAt[s] <= arrival[i]) {
        handled[s]++;
        freeAt[s] = arrival[i] + load[i];
        break;
      }
    }
  }
  const best = Math.max(...handled);
  return handled.flatMap((v, s) => v === best ? [s] : []);
}

const examples = [
  {
    input: { k: 3, arrival: [1, 2, 3, 4, 5], load: [5, 2, 3, 3, 3] },
    expected: [1],
  },
  {
    input: { k: 3, arrival: [1, 2, 3, 4], load: [1, 2, 1, 2] },
    expected: [0],
  },
  {
    input: { k: 3, arrival: [1, 2, 3], load: [10, 12, 11] },
    expected: [0, 1, 2],
  },
  {
    input: { k: 2, arrival: [1, 2, 3, 5], load: [1, 10, 1, 1] },
    expected: [0],
  },
];

for (const [name, build] of [
  ['bisect', buildTrace],
  ['virtual', buildAlternativeTrace],
]) {
  test(`${name}: official examples and wraparound`, () => {
    for (const { input, expected } of examples) {
      assert.deepEqual(build(input).result, expected);
    }
  });

  test(`${name}: frames contain loop metadata`, () => {
    const run = build({
      k: 3,
      arrival: [1, 3, 5, 7, 9],
      load: [2, 2, 2, 2, 2],
    });
    const loops = run.frames.filter(f => f.phase === 'loop-check');
    assert.ok(loops.length > 0);
    assert.ok(loops.some(f => f.loop?.id === 'requests'));
    assert.ok(loops.some(f => f.loop?.id === 'release'));
    assert.ok(loops.some(f => f.loop?.branch === 'exit'));
  });

  test(`${name}: timeline jobs match assigned requests`, () => {
    const run = build({
      k: 3,
      arrival: [1, 2, 3, 4, 5, 6],
      load: [2, 2, 2, 2, 2, 2],
    });
    const done = run.frames.at(-1);
    assert.equal(done.jobs.length, done.assignments.length);
    for (const job of done.jobs) {
      assert.equal(job.end, job.start + [2, 2, 2, 2, 2, 2][job.request]);
      assert.equal(job.server, done.assignments[job.request]);
    }
  });

  test(`${name}: 300 randomized inputs match oracle`, () => {
    let seed = 1606;
    const rnd = n => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return (seed >>> 16) % n;
    };
    for (let trial = 0; trial < 300; trial++) {
      const count = 1 + rnd(12);
      const arrival = [];
      let t = 0;
      for (let i = 0; i < count; i++) {
        t += 1 + rnd(4);
        arrival.push(t);
      }
      const input = {
        k: 1 + rnd(6),
        arrival,
        load: arrival.map(() => 1 + rnd(20)),
      };
      assert.deepEqual(
        build(input).result,
        oracle(input),
        JSON.stringify(input)
      );
    }
  });
}

test('bisect frames show interval bounds and comparisons', () => {
  const run = buildTrace({
    k: 3,
    arrival: [1, 2, 3, 4, 5, 6],
    load: [2, 2, 2, 2, 2, 2],
  });
  const comparisons = run.frames.filter(
    f => f.phase === 'bisect-compare'
  );
  assert.ok(comparisons.length > 0);
  for (const frame of comparisons) {
    assert.ok(frame.search);
    assert.ok(frame.search.left <= frame.search.mid);
    assert.ok(frame.search.mid < frame.search.right);
  }
});

test('virtual heap frames contain operation logs', () => {
  const run = buildAlternativeTrace({
    k: 3,
    arrival: [1, 2, 3, 4, 5, 6],
    load: [2, 2, 2, 2, 2, 2],
  });
  assert.ok(run.frames.some(f => f.phase === 'key-calc'));
  assert.ok(run.frames.some(f => f.phase === 'key-select'));
  assert.ok(run.frames.some(
    f => f.freeHeap?.ops?.length > 0
  ));
});

test('both approaches have identical assignment history', () => {
  const input = {
    k: 3,
    arrival: [1, 5, 9, 13, 15, 17, 19, 20, 23, 25, 30, 31],
    load: [9, 13, 4, 2, 6, 14, 4, 9, 17, 17, 3, 19],
  };
  const a = buildTrace(input);
  const b = buildAlternativeTrace(input);
  assert.deepEqual(a.result, b.result);
  assert.deepEqual(
    a.frames.at(-1).assignments,
    b.frames.at(-1).assignments
  );
});

test('input validation', () => {
  assert.throws(() => parseInput(
    '{"k":2,"arrival":[1,1],"load":[1,1]}'
  ));
  assert.throws(() => parseInput(
    '{"k":0,"arrival":[1],"load":[1]}'
  ));
  assert.throws(() => parseInput(
    '{"k":2,"arrival":[1],"load":[0]}'
  ));
});
