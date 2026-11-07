import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';
import examples from '../../config/examples/collection--1879.js';

// Brute force over all permutations of the second array.
function brute(a, b) {
  let best = Infinity;
  const used = Array(b.length).fill(false);
  const go = (i, sum) => {
    if (sum >= best) return;
    if (i === a.length) { best = sum; return; }
    for (let j = 0; j < b.length; j++) if (!used[j]) { used[j] = true; go(i + 1, sum + (a[i] ^ b[j])); used[j] = false; }
  };
  go(0, 0);
  return best;
}

test('1879 solver matches permutation brute force on generated inputs', () => {
  let seed = 11;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let t = 0; t < 120; t++) {
    const n = 1 + rand(6);
    const nums1 = Array.from({ length: n }, () => rand(16));
    const nums2 = Array.from({ length: n }, () => rand(16));
    assert.equal(definitions[1879].build({ nums1, nums2 }).result, brute(nums1, nums2), JSON.stringify({ nums1, nums2 }));
  }
});

test('1879 transition frames expose the next position, candidate cost and mask dependency', () => {
  // Invented: nums1[0]=1 pairs with nums2[1]=6 (XOR 7) from mask 0; mask 0b10 stores 7.
  const { frames, result } = definitions[1879].build({ nums1: [1, 4], nums2: [2, 6] });
  assert.equal(result, brute([1, 4], [2, 6]));
  const pick = frames.find(f => f.assignment?.mask === 0 && f.assignment.chosen === 1 && f.phase === 'inspect').assignment;
  assert.equal(pick.firstIndex, 0);
  assert.equal(pick.pairXor, 7);
  assert.equal(pick.candidateCost, 7);
  assert.equal(pick.nextBits, '10');
  assert.deepEqual(pick.unused, [0, 1]);
  const after = frames.find(f => f.assignment?.mask === 0 && f.assignment.chosen === 1 && f.phase === 'update').assignment;
  assert.equal(after.decided, 'improves');
  assert.equal(after.bestAfter, 7);
});

test('1879 frames have valid trace lines and snapshot tables', () => {
  const { frames } = definitions[1879].build({ nums1: [3, 5], nums2: [6, 1] });
  const pythonLines = definitions[1879].python.split('\n').length;
  for (const f of frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= pythonLines, `activeLine ${f.activeLine}`);
  }
  const start = frames.find(f => f.assignment).table;
  assert.equal(start[0], 0);
  assert.equal(start[1], Infinity, 'early snapshots must not see later updates');
});

for (const example of examples) {
  test(`1879 authored preset: ${example.label}`, () => {
    const input = JSON.parse(example.input);
    const { result, frames } = definitions[1879].build(input);
    assert.equal(result, brute(input.nums1, input.nums2));
    assert.ok(frames.some(f => f.assignment));
  });
}
