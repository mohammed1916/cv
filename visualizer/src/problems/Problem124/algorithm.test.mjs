import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CODE, parseTreeInput, buildMaxPathStory } from './algorithm.js';

describe('Problem 124: Binary Tree Maximum Path Sum', () => {
  describe('CODE export', () => {
    it('matches Python reference implementation exactly', () => {
      assert.equal(Array.isArray(CODE), true);
      assert.equal(CODE.length, 12);
      assert.equal(CODE[0], 'def maxPathSum(root):');
      assert.equal(CODE[1].trim(), "max_sum = float('-inf')");
      assert.equal(CODE[2].trim(), 'def gain(node):');
      assert.equal(CODE[7].trim(), 'path = node.val + left + right');
      assert.equal(CODE[8].trim(), 'max_sum = max(max_sum, path)');
      assert.equal(CODE[11].trim(), 'return max_sum');
    });
  });

  describe('parseTreeInput', () => {
    it('parses valid arrays and string representations', () => {
      const fromArr = parseTreeInput([-10, 9, 20, null, null, 15, 7]);
      assert.equal(fromArr.val, -10);
      assert.equal(fromArr.left.val, 9);
      assert.equal(fromArr.right.val, 20);
      assert.equal(fromArr.right.left.val, 15);
      assert.equal(fromArr.right.right.val, 7);

      const fromJson = parseTreeInput('[-10, 9, 20, null, null, 15, 7]');
      assert.equal(fromJson.val, -10);
      assert.equal(fromJson.right.left.val, 15);

      const fromCsv = parseTreeInput('-10, 9, 20, null, null, 15, 7');
      assert.equal(fromCsv.val, -10);
      assert.equal(fromCsv.right.right.val, 7);
    });

    it('rejects empty inputs, empty strings, and empty arrays', () => {
      assert.throws(() => parseTreeInput(null), /empty/i);
      assert.throws(() => parseTreeInput(undefined), /empty/i);
      assert.throws(() => parseTreeInput(''), /empty/i);
      assert.throws(() => parseTreeInput('   '), /empty/i);
      assert.throws(() => parseTreeInput([]), /empty/i);
      assert.throws(() => parseTreeInput('[]'), /empty/i);
      assert.throws(() => parseTreeInput([null]), /empty/i);
      assert.throws(() => parseTreeInput('[null]'), /empty/i);
    });

    it('rejects invalid or non-integer node values', () => {
      assert.throws(() => parseTreeInput([1, 'abc', 3]), /invalid node value/i);
      assert.throws(() => parseTreeInput('[1, 2.5, 3]'), /invalid node value/i);
      assert.throws(() => parseTreeInput([1, NaN, 3]), /invalid node value/i);
      assert.throws(() => parseTreeInput([1, Infinity, 3]), /invalid node value/i);
    });

    it('rejects orphan nodes beyond tree structure', () => {
      // 1 has left=null, right=null; any subsequent non-null child is an orphan
      assert.throws(() => parseTreeInput([1, null, null, 2]), /orphan node/i);
      assert.throws(() => parseTreeInput('[1, null, null, null, 5]'), /orphan node/i);
    });
  });

  describe('buildMaxPathStory - LeetCode examples and core requirements', () => {
    it('computes maximum path sum 42 for [-10,9,20,null,null,15,7]', () => {
      const story = buildMaxPathStory([-10, 9, 20, null, null, 15, 7]);
      assert.equal(story.maxSum, 42);
      assert.deepEqual(story.bestPathValues, [15, 20, 7]);

      // Check node layout was computed
      assert.equal(story.nodes.length, 5);
      assert.equal(story.edges.length, 4);

      // Check final frame
      const lastFrame = story.frames[story.frames.length - 1];
      assert.equal(lastFrame.phase, 'done');
      assert.equal(lastFrame.activeLine, 12);
      assert.equal(lastFrame.maxSum, 42);
      assert.deepEqual(lastFrame.bestPathValues, [15, 20, 7]);
    });

    it('computes maximum path sum 6 for [1,2,3]', () => {
      const story = buildMaxPathStory([1, 2, 3]);
      assert.equal(story.maxSum, 6);
      assert.deepEqual(story.bestPathValues, [2, 1, 3]);
    });

    it('handles single node negative tree [-3]', () => {
      const story = buildMaxPathStory([-3]);
      assert.equal(story.maxSum, -3);
      assert.deepEqual(story.bestPathValues, [-3]);
    });

    it('handles single node positive tree [42]', () => {
      const story = buildMaxPathStory([42]);
      assert.equal(story.maxSum, 42);
      assert.deepEqual(story.bestPathValues, [42]);
    });

    it('handles all negative trees correctly', () => {
      // Tree:
      //        -10
      //       /   \
      //     -20   -30
      //     /  \
      //   -5   -40
      const story = buildMaxPathStory([-10, -20, -30, -5, -40]);
      assert.equal(story.maxSum, -5);
      assert.deepEqual(story.bestPathValues, [-5]);
    });

    it('handles negative root with positive children [-10, 20, 30]', () => {
      // Path: 20 -> -10 -> 30, sum = 40 (which beats individual 20 and 30)
      const story = buildMaxPathStory([-10, 20, 30]);
      assert.equal(story.maxSum, 40);
      assert.deepEqual(story.bestPathValues, [20, -10, 30]);
    });

    it('handles trees where optimal path is completely inside a subtree', () => {
      // Root is -100, but left subtree has [10, 20, 30] -> max path 20 -> 10 -> 30 = 60
      const story = buildMaxPathStory([-100, 10, null, 20, 30]);
      assert.equal(story.maxSum, 60);
      assert.deepEqual(story.bestPathValues, [20, 10, 30]);
    });

    it('handles zeros and duplicates', () => {
      const story = buildMaxPathStory([0, 0, 0]);
      assert.equal(story.maxSum, 0);
      assert.equal(story.bestPathValues.reduce((a, b) => a + b, 0), 0);
      assert.ok(story.bestPathValues.length >= 1);
    });
  });

  describe('Trace frames and immutability', () => {
    it('produces valid frames with required properties', () => {
      const story = buildMaxPathStory([1, 2, 3]);
      assert.ok(story.frames.length > 0);

      const first = story.frames[0];
      assert.equal(first.phase, 'init');
      assert.equal(first.activeLine, 2);

      const phases = new Set();
      for (const frame of story.frames) {
        assert.ok(typeof frame.activeLine === 'number');
        assert.ok(typeof frame.phase === 'string');
        assert.ok(typeof frame.message === 'string');
        assert.ok(typeof frame.explanation === 'string');
        assert.ok(typeof frame.gainMap === 'object');
        phases.add(frame.phase);
      }

      // Check all key algorithm phases were recorded
      assert.ok(phases.has('init'));
      assert.ok(phases.has('recurse'));
      assert.ok(phases.has('compute'));
      assert.ok(phases.has('update'));
      assert.ok(phases.has('return'));
      assert.ok(phases.has('done'));
    });

    it('ensures frames are immutable and snapshots do not leak future mutations', () => {
      const story = buildMaxPathStory([-10, 9, 20, null, null, 15, 7]);
      const initFrame = story.frames[0];
      assert.deepEqual(initFrame.gainMap, {});
      assert.equal(initFrame.maxSum, -Infinity);

      // Mutate a frame copy and verify original frames remain intact
      const midFrame = story.frames[3];
      const midGains = { ...midFrame.gainMap };
      midFrame.gainMap['999'] = 999;
      assert.equal(story.frames[0].gainMap['999'], undefined);
      assert.notDeepEqual(midGains, midFrame.gainMap);
    });
  });
});

// ─── Statement contract tests (parseInput / buildTrace / python) ───
import { parseInput, buildTrace, code, python } from './algorithm.js'

it('statement examples', () => {
  assert.equal(buildTrace(parseInput('{"root":[1,2,3]}')).result, 6)
  assert.equal(buildTrace(parseInput('{"root":[-10,9,20,null,null,15,7]}')).result, 42)
  assert.equal(buildTrace(parseInput('{"root":[-3]}')).result, -3)
})

it('validation rejects malformed input with clear errors', () => {
  assert.throws(() => parseInput('[1]'), /object with a "root" array/)
  assert.throws(() => parseInput('{"root":[]}'), /between 1 and 60/)
  assert.throws(() => parseInput('{"root":[null,1]}'), /root slot cannot be null/)
  assert.throws(() => parseInput('{"root":[1001]}'), /integers from -1000 to 1000/)
})

it('every frame points at a pseudocode line and the python export is present', () => {
  const trace = buildTrace(parseInput('{"root":[1,2,3]}'))
  for (const f of trace.frames) assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
  assert.match(python, /def max_path_sum\(root\):/)
})

it('seeded random trees match a brute-force oracle over all node pairs', () => {
  let seed = 124
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const brute = root => {
    // Independent oracle: object nodes built from a queue, parent pointers, every node pair.
    const slots = root.map(v => (v === null ? null : { v, parent: null, kids: [] }))
    const queue = [slots[0]]; let slot = 1
    for (let i = 0; i < queue.length; i++) {
      for (let k = 0; k < 2; k++) {
        const idx = slot++
        if (idx < slots.length && slots[idx]) { slots[idx].parent = queue[i]; queue[i].kids.push(slots[idx]); queue.push(slots[idx]) }
      }
    }
    const nodes = queue // only nodes reachable from the root; trailing unattached slots are ignored
    const ancestors = x => { const out = []; for (let y = x; y; y = y.parent) out.push(y); return out }
    let best = -Infinity
    for (const a of nodes) for (const b of nodes) {
      const up = ancestors(a), other = new Set(ancestors(b))
      const lca = up.find(x => other.has(x))
      const path = new Set()
      for (let x = a; x !== lca; x = x.parent) path.add(x)
      for (let x = b; x !== lca; x = x.parent) path.add(x)
      path.add(lca)
      best = Math.max(best, [...path].reduce((sum, x) => sum + x.v, 0))
    }
    return best
  }
  for (let t = 0; t < 150; t++) {
    const len = 1 + rnd(15)
    const root = Array.from({ length: len }, (_, i) => (i > 0 && rnd(3) === 0 ? null : rnd(201) - 100))
    root[0] = root[0] === null ? 0 : root[0]
    assert.equal(buildTrace(parseInput(JSON.stringify({ root }))).result, brute(root), JSON.stringify(root))
  }
})
