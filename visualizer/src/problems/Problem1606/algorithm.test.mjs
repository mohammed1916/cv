import {serverStatus} from './serverStatus.js';
import {code,alternativeCode} from './algorithm.js';

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


test('teaching frames connect finish calculation, reservation, and counting to their actual code', () => {
  for (const [build, source] of [[buildTrace, code], [buildAlternativeTrace, alternativeCode]]) {
    const run = build({k:2,arrival:[1,3,8],load:[4,2,1]});
    for (let i=1;i<run.frames.length;i++) {
      const frame=run.frames[i], previous=run.frames[i-1];
      const text=source.find(line=>line.line===frame.activeLine)?.text;
      assert.ok(text, `missing line for ${frame.phase}`);
      if (frame.phase==='timeline-create') {
        assert.match(text,/const end = t \+ load/);
        assert.deepEqual(frame.handled,previous.handled,'timeline calculation must not increment handled counts');
      }
      if (frame.phase==='assign') {
        assert.match(text,/handled\[server\]\+\+/);
        assert.equal(frame.handled[frame.server],previous.handled[frame.server]+1);
      }
      if (frame.phase==='free-pop') {
        assert.match(text,/free\.(pop|splice)/);
        assert.equal(frame.free.length,previous.free.length-1);
        assert.equal(serverStatus(frame,frame.server,run.input.k),'Reserved');
      }
    }
  }
});

import { python as bisectPython, alternativePython } from './algorithm.js';

const siftInputs = [
  { k: 6, arrival: [1, 3, 5, 7, 9, 11, 16, 20, 22, 25, 30, 31], load: [8, 4, 2, 8, 2, 3, 1, 2, 9, 5, 7, 11] },
  { k: 3, arrival: [1, 5, 9, 13, 15, 17, 19, 20, 23, 25, 30, 31], load: [9, 13, 4, 2, 6, 14, 4, 9, 17, 17, 3, 19] },
  { k: 2, arrival: [1, 2, 3, 4, 5, 6, 7, 8], load: [9, 9, 9, 9, 9, 9, 9, 9] },
];

// Each sift frame carries the real heap array; the busy and free heaps are checked separately.
function heapItems(frame, heap) {
  return heap === 'busy' ? frame.busyHeap.items : frame.freeHeap.items;
}
function heapOf(frame, heap) {
  return heap === 'busy' ? frame.busyHeap : frame.freeHeap;
}
function rank(heap, text) {
  if (heap === 'busy') {
    const [end, server] = text.match(/^(\d+):S(\d+)$/).slice(1).map(Number);
    return [end, server];
  }
  return [Number(text)];
}
function lessEq(heap, a, b) {
  const x = rank(heap, a), y = rank(heap, b);
  for (let i = 0; i < x.length; i++) {
    if (x[i] !== y[i]) return x[i] < y[i];
  }
  return true;
}

for (const [name, build] of [
  ['bisect', buildTrace],
  ['virtual', buildAlternativeTrace],
]) {
  test(`${name}: sift frames show real swaps that change exactly the two compared cells`, () => {
    for (const input of siftInputs) {
      const { frames } = build(input);
      for (let i = 1; i < frames.length; i++) {
        const frame = frames[i];
        if (frame.phase !== 'sift-compare') continue;
        const { heap, index, other, swapped, kind } = frame.sift;
        const before = frames[i - 1];
        const now = heapItems(frame, heap);
        const prev = heapItems(before, heap);
        assert.equal(now.length, prev.length, 'a sift step never changes heap size');
        const changed = now.map((v, j) => (v === prev[j] ? -1 : j)).filter(j => j >= 0);
        if (swapped) {
          assert.deepEqual(changed.sort((a, b) => a - b), [index, other].sort((a, b) => a - b));
          assert.equal(now[index], prev[other]);
          assert.equal(now[other], prev[index]);
          assert.ok(lessEq(heap, now[other], now[index]), 'a swap moves the smaller item up');
        } else {
          assert.deepEqual(changed, [], `${kind} comparison must not change the array`);
        }
        assert.deepEqual(frame.compare ?? heapOf(frame, heap).compare, [index, other]);
      }
    }
  });

  test(`${name}: each completed heap operation leaves a valid heap`, () => {
    for (const input of siftInputs) {
      const { frames } = build(input);
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        for (const heap of ['busy', 'free']) {
          if (heap === 'free' && !frame.freeHeap) continue;
          const next = frames[i + 1];
          const midSift = next?.phase === 'sift-compare' && next.sift.heap === heap;
          if (midSift) continue;
          const items = heapItems(frame, heap);
          for (let j = 1; j < items.length; j++) {
            assert.ok(lessEq(heap, items[(j - 1) >> 1], items[j]),
              `${heap} heap invalid at frame ${i} (${frame.phase}), index ${j}`);
          }
        }
      }
    }
  });

  test(`${name}: sift frame lines match the displayed JavaScript and Python`, () => {
    const jsSource = name === 'virtual' ? alternativeCode : code;
    const pySource = (name === 'virtual' ? alternativePython : bisectPython).split('\n');
    let seen = 0;
    for (const input of siftInputs) {
      for (const frame of build(input).frames) {
        if (frame.phase !== 'sift-compare') continue;
        seen++;
        const js = jsSource.find(l => l.line === frame.activeLine)?.text ?? '';
        const py = pySource[frame.pythonLine - 1] ?? '';
        assert.match(js, frame.sift.heap === 'busy' ? /busy\.(push|pop)\(/ : /free\.(push|pop)\(/);
        assert.match(py, frame.sift.heap === 'busy' ? /heapq\.heap(push|pop)\(busy/ : /heapq\.heap(push|pop)\(free/);
      }
    }
    assert.ok(seen > 0);
  });
}

test('virtual approach emits sift frames for both the busy and the free heap, and bisect only for busy', () => {
  const virtual = buildAlternativeTrace(siftInputs[0]).frames.filter(f => f.phase === 'sift-compare');
  assert.ok(virtual.some(f => f.sift.heap === 'busy'));
  assert.ok(virtual.some(f => f.sift.heap === 'free'));
  const bisect = buildTrace(siftInputs[0]).frames.filter(f => f.phase === 'sift-compare');
  assert.ok(bisect.length > 0);
  assert.ok(bisect.every(f => f.sift.heap === 'busy'));
});

test('sift frames include child choices and parent comparisons on the pop path', () => {
  const kinds = new Set(buildAlternativeTrace(siftInputs[0]).frames
    .filter(f => f.phase === 'sift-compare').map(f => f.sift.kind));
  assert.ok(kinds.has('child'));
  assert.ok(kinds.has('compare'));
});

test('frame results and operation counts are unchanged by the per-step frames', () => {
  for (const input of siftInputs) {
    const a = buildTrace(input), b = buildAlternativeTrace(input);
    assert.deepEqual(a.result, b.result);
    assert.equal(a.frames.at(-1).jobs.length, input.arrival.length - a.frames.filter(f => f.phase === 'drop').length);
  }
});
