import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBalancedTree, traceBalance } from './algorithm.js';

test('balanced, empty, duplicate and sparse trees match independent height calculation', () => {
  function height(node) { if (!node) return 0; const l = height(node.left), r = height(node.right); return l < 0 || r < 0 || Math.abs(l-r) > 1 ? -1 : 1 + Math.max(l,r); }
  for (let mask = 0; mask < 256; mask++) {
    const values = [1, ...Array.from({length: 8}, (_, i) => mask & (1 << i) ? 1 : null)];
    let root;
    try { root = parseBalancedTree(JSON.stringify(values)); } catch { continue; }
    assert.equal(traceBalance(root).at(-1).result, height(root) !== -1);
  }
  assert.equal(traceBalance(parseBalancedTree('[]')).at(-1).result, true);
  assert.equal(traceBalance(parseBalancedTree('[1,null,2,null,3]')).at(-1).result, false);
});

test('left failure skips the right subtree and identifies the first actual mismatch', () => {
  const root = parseBalancedTree('[1,2,9,3,null,null,null,4]');
  const frames = traceBalance(root);
  assert.equal(frames.at(-1).result, false);
  assert.equal(frames.some(f => f.activeId === root.right.id), false);
  const propagated = frames.find(f => f.activeId === root.id && f.phase === 'propagate');
  assert.equal(propagated.activeLine, 5);
  assert.equal(propagated.right, null);
  assert.equal(propagated.firstFailure, root.left.id);
  assert.equal(frames.filter(f => f.phase === 'unbalanced').length, 1);
});

test('right failure returns on the right-child guard', () => {
  const frames = traceBalance(parseBalancedTree('[1,null,2,null,3,null,4]'));
  assert.equal(frames.find(f => f.activeId === 0 && f.phase === 'propagate').activeLine, 7);
});

test('reject invalid and orphan input; snapshots do not contain future heights', () => {
  for (const value of ['{}', '[null,1]', '[1,null,null,2]', '["1"]']) assert.throws(() => parseBalancedTree(value));
  const frames = traceBalance(parseBalancedTree('[1,2,3]'));
  assert.equal(frames[0].heights.size, 0);
  assert.equal(frames.at(-1).heights.size, 3);
});
