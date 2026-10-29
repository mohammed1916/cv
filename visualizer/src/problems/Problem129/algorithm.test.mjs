import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CODE, parseTreeInput, buildSumNumbersStory } from './algorithm.js';

describe('Problem 129: Sum Root to Leaf Numbers', () => {
  describe('CODE export', () => {
    it('matches Python reference implementation exactly', () => {
      assert.equal(Array.isArray(CODE), true);
      assert.equal(CODE.length, 8);
      assert.equal(CODE[0], 'def sumNumbers(root):');
      assert.equal(CODE[1].trim(), 'def dfs(node, current_sum):');
      assert.equal(CODE[2].trim(), 'if not node: return 0');
      assert.equal(CODE[3].trim(), 'current_sum = current_sum * 10 + node.val');
      assert.equal(CODE[4].trim(), 'if not node.left and not node.right:');
      assert.equal(CODE[5].trim(), 'return current_sum');
      assert.equal(CODE[6].trim(), 'return dfs(node.left, current_sum) + dfs(node.right, current_sum)');
      assert.equal(CODE[7].trim(), 'return dfs(root, 0)');
    });
  });

  describe('parseTreeInput validation', () => {
    it('parses valid arrays and string representations', () => {
      const tree1 = parseTreeInput([1, 2, 3]);
      assert.equal(tree1.val, 1);
      assert.equal(tree1.left.val, 2);
      assert.equal(tree1.right.val, 3);

      const tree2 = parseTreeInput('[4, 9, 0, 5, 1]');
      assert.equal(tree2.val, 4);
      assert.equal(tree2.left.val, 9);
      assert.equal(tree2.right.val, 0);
      assert.equal(tree2.left.left.val, 5);
      assert.equal(tree2.left.right.val, 1);

      const treeCsv = parseTreeInput('4, 9, 0, 5, 1');
      assert.equal(treeCsv.val, 4);
      assert.equal(treeCsv.left.val, 9);
    });

    it('rejects empty input, empty strings, and empty arrays', () => {
      assert.throws(() => parseTreeInput(null), /empty/i);
      assert.throws(() => parseTreeInput(undefined), /empty/i);
      assert.throws(() => parseTreeInput(''), /empty/i);
      assert.throws(() => parseTreeInput('   '), /empty/i);
      assert.throws(() => parseTreeInput([]), /empty/i);
      assert.throws(() => parseTreeInput('[]'), /empty/i);
      assert.throws(() => parseTreeInput([null]), /null/i);
      assert.throws(() => parseTreeInput('[null]'), /null/i);
    });

    it('rejects digits > 9 and negative values', () => {
      assert.throws(() => parseTreeInput([10]), /between 0 and 9/i);
      assert.throws(() => parseTreeInput('[1, 12, 3]'), /between 0 and 9/i);
      assert.throws(() => parseTreeInput([-1]), /between 0 and 9/i);
      assert.throws(() => parseTreeInput('[4, -9, 0]'), /between 0 and 9/i);
      assert.throws(() => parseTreeInput([-5, 2, 3]), /between 0 and 9/i);
    });

    it('rejects non-integer node values', () => {
      assert.throws(() => parseTreeInput([1, 2.5, 3]), /expected integer|invalid/i);
      assert.throws(() => parseTreeInput('[1, "abc", 3]'), /expected single digit|invalid/i);
      assert.throws(() => parseTreeInput([1, NaN, 3]), /expected integer|invalid/i);
    });

    it('rejects orphan nodes beyond tree capacity', () => {
      assert.throws(() => parseTreeInput([1, null, null, 2]), /orphan node/i);
      assert.throws(() => parseTreeInput('[1, null, null, null, 5]'), /orphan node/i);
    });
  });

  describe('buildSumNumbersStory - Core test cases', () => {
    it('computes sum 25 for [1, 2, 3]', () => {
      const story = buildSumNumbersStory([1, 2, 3]);
      assert.equal(story.totalSum, 25);
      assert.equal(story.paths.length, 2);
      assert.deepEqual(story.paths.map((p) => ({ path: p.path, value: p.value })), [
        { path: [1, 2], value: 12 },
        { path: [1, 3], value: 13 },
      ]);
      assert.equal(story.nodes.length, 3);
      assert.equal(story.edges.length, 2);

      const lastFrame = story.frames[story.frames.length - 1];
      assert.equal(lastFrame.phase, 'done');
      assert.equal(lastFrame.activeLine, 8);
      assert.equal(lastFrame.totalSum, 25);
      assert.equal(lastFrame.accumulatedSum, 25);
    });

    it('computes sum 1026 for [4, 9, 0, 5, 1] (495 + 491 + 40)', () => {
      const story = buildSumNumbersStory('[4, 9, 0, 5, 1]');
      assert.equal(story.totalSum, 1026);
      assert.equal(story.paths.length, 3);
      assert.deepEqual(story.paths.map((p) => ({ path: p.path, value: p.value })), [
        { path: [4, 9, 5], value: 495 },
        { path: [4, 9, 1], value: 491 },
        { path: [4, 0], value: 40 },
      ]);

      const lastFrame = story.frames.at(-1);
      assert.equal(lastFrame.totalSum, 1026);
      assert.equal(lastFrame.accumulatedSum, 1026);
    });

    it('handles single node [5]', () => {
      const story = buildSumNumbersStory([5]);
      assert.equal(story.totalSum, 5);
      assert.deepEqual(story.paths.map((p) => ({ path: p.path, value: p.value })), [
        { path: [5], value: 5 },
      ]);
      assert.equal(story.nodes.length, 1);
      assert.equal(story.edges.length, 0);
    });

    it('handles single node [0]', () => {
      const story = buildSumNumbersStory('[0]');
      assert.equal(story.totalSum, 0);
      assert.deepEqual(story.paths.map((p) => ({ path: p.path, value: p.value })), [
        { path: [0], value: 0 },
      ]);
    });

    it('handles sparse trees with null children', () => {
      // Tree: 1 -> left: null, right: 3
      const story = buildSumNumbersStory([1, null, 3]);
      assert.equal(story.totalSum, 13);
      assert.deepEqual(story.paths.map((p) => ({ path: p.path, value: p.value })), [
        { path: [1, 3], value: 13 },
      ]);

      // Verify null child frame was emitted
      const nullFrame = story.frames.find((f) => f.phase === 'null');
      assert.ok(nullFrame);
      assert.equal(nullFrame.activeLine, 3);
    });

    it('handles deeply nested branch with duplicate digits', () => {
      // Tree: 1 -> 1 -> 1
      const story = buildSumNumbersStory([1, 1, null, 1]);
      assert.equal(story.totalSum, 111);
      assert.deepEqual(story.paths.map((p) => ({ path: p.path, value: p.value })), [
        { path: [1, 1, 1], value: 111 },
      ]);
    });
  });

  describe('Trace frames and immutability', () => {
    it('produces valid frames with required snapshot properties', () => {
      const story = buildSumNumbersStory([1, 2, 3]);
      assert.ok(story.frames.length > 0);

      const initFrame = story.frames[0];
      assert.equal(initFrame.phase, 'init');
      assert.equal(initFrame.activeLine, 8);
      assert.equal(initFrame.currentSum, 0);
      assert.deepEqual(initFrame.completedPaths, []);

      // Verify all frames have required keys
      for (const frame of story.frames) {
        assert.ok(typeof frame.activeLine === 'number');
        assert.ok(typeof frame.phase === 'string');
        assert.ok(Array.isArray(frame.relatedLines));
        assert.ok(typeof frame.explanation === 'string');
        assert.ok(typeof frame.message === 'string');
        assert.ok(Array.isArray(frame.completedPaths));
        assert.ok(Array.isArray(frame.currentPath));
      }
    });

    it('ensures snapshots in frames are immutable across steps', () => {
      const story = buildSumNumbersStory([4, 9, 0, 5, 1]);
      const frame0Paths = story.frames[0].completedPaths;
      const midFrame = story.frames.find((f) => f.phase === 'leaf');
      const finalFrame = story.frames.at(-1);

      assert.equal(frame0Paths.length, 0);
      assert.equal(midFrame.completedPaths.length, 1);
      assert.equal(finalFrame.completedPaths.length, 3);
    });
  });
});

// ─── Statement contract tests (parseInput / buildTrace / python) ───
import { parseInput, buildTrace, code, python } from './algorithm.js'


// Level-order slots that cannot be reached from the root are ignored by the oracle, so the
// generated array is normalised the same way before it is parsed (the parser rejects orphans).
function normalizeTree(values) {
  const out = [...values]
  const attached = new Set([0])
  const queue = [0]
  let cursor = 1
  for (let qi = 0; qi < queue.length; qi++) {
    for (let side = 0; side < 2; side++) {
      const idx = cursor++
      if (idx < out.length && out[idx] !== null) { attached.add(idx); queue.push(idx) }
    }
  }
  return out.map((value, i) => (attached.has(i) || value === null ? value : null))
}

it('statement examples', () => {
  assert.equal(buildTrace(parseInput('{"root":[1,2,3]}')).result, 25)
  assert.equal(buildTrace(parseInput('{"root":[4,9,0,5,1]}')).result, 1026)
  assert.equal(buildTrace(parseInput('{"root":[0]}')).result, 0)
})

it('validation rejects malformed input with clear errors', () => {
  assert.throws(() => parseInput('[1]'), /object with a "root" array/)
  assert.throws(() => parseInput('{"root":[null,1]}'), /root slot cannot be null/)
  assert.throws(() => parseInput('{"root":[10]}'), /digits 0 to 9/)
  assert.throws(() => parseInput('{"root":' + JSON.stringify(Array(16).fill(1)) + '}'), /at most|between 1 and 15/)
})

it('every frame points at a pseudocode line and the python export is present', () => {
  const trace = buildTrace(parseInput('{"root":[4,9,0,5,1]}'))
  for (const f of trace.frames) assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
  assert.match(python, /def sum_root_to_leaf\(root\):/)
})

it('seeded random trees match a path-enumeration oracle', () => {
  let seed = 129
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const oracle = root => {
    // Independent oracle: nested objects built from a recursive split of the slot list, then explicit path strings.
    const build = (index) => {
      if (index >= root.length || root[index] === null) return null
      return { digit: root[index], kids: [] }
    }
    const nodes = root.map((_, i) => build(i))
    const queue = [nodes[0]]; let slot = 1
    for (let i = 0; i < queue.length; i++) {
      for (let k = 0; k < 2; k++) {
        const idx = slot++
        if (idx < nodes.length && nodes[idx]) { queue[i].kids.push(nodes[idx]); queue.push(nodes[idx]) }
      }
    }
    let total = 0
    const paths = (node, digits) => {
      const d = digits + String(node.digit)
      if (node.kids.length === 0) total += Number(d)
      for (const kid of node.kids) paths(kid, d)
    }
    paths(nodes[0], '')
    return total
  }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(12)
    const root = Array.from({ length: len }, (_, i) => (i > 0 && rnd(3) === 0 ? null : rnd(10)))
    root[0] = root[0] === null ? 5 : root[0]
    const tree = normalizeTree(root)
    assert.equal(buildTrace(parseInput(JSON.stringify({ root: tree }))).result, oracle(tree), JSON.stringify(tree))
  }
})
