import test from 'node:test';
import assert from 'node:assert/strict';
import { createLayout, ids, findGroup, move, remove, visible, update } from './layout.js';

test('collapse removes entire branches and restore preserves exact layout ratios', () => {
  const tree = createLayout([{ id: 'input' }, { id: 'viz', dockMode: 'split-bottom' }, { id: 'code' }]);
  const before = structuredClone(tree);
  assert.equal(tree.axis, 'horizontal');
  const collapsed = visible(tree, new Set(['code']));
  assert.deepEqual(ids(collapsed), ['input', 'viz']);
  assert.equal(collapsed.axis, 'vertical');
  assert.deepEqual(visible(tree, new Set(['input', 'viz'])), findGroup(tree, 'code'));
  assert.equal(visible(tree, new Set(ids(tree))), null);
  assert.deepEqual(visible(tree, new Set()), before);
  assert.deepEqual(tree, before);
});

test('grouping, splitting, and removing leave each panel in exactly one place', () => {
  let tree = createLayout([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  tree = move(tree, 'b', 'a', 'tab');
  assert.deepEqual(findGroup(tree, 'a').tabs, ['a', 'b']);
  assert.equal(findGroup(tree, 'a').active, 'b');
  assert.equal(findGroup(visible(tree, new Set(['b'])), 'a').active, 'a');
  tree = move(tree, 'a', 'c', 'bottom');
  tree = move(tree, 'b', 'a', 'right');
  assert.deepEqual(ids(tree).sort(), ['a', 'b', 'c']);
  const keys = [];
  function walk(node) { keys.push(node.key); if (node.type === 'split') { walk(node.first); walk(node.second); } }
  walk(tree); assert.equal(new Set(keys).size, keys.length);
  tree = remove(tree, 'b');
  assert.deepEqual(ids(tree).sort(), ['a', 'c']);
});

test('resize a visible split while another panel is collapsed', () => {
  let tree = createLayout([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  const display = visible(tree, new Set(['c']));
  tree = update(tree, display.key, node => ({ ...node, ratio: .7 }));
  assert.equal(visible(tree, new Set(['c'])).ratio, .7);
  assert.deepEqual(ids(visible(tree, new Set())), ['a', 'b', 'c']);
});
