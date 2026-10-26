import test from 'node:test';
import assert from 'node:assert/strict';
import { binaryTreeLayout } from './binaryTreeLayout.js';

test('dense tree nodes have distinct horizontal space and stay in bounds', () => {
  const nodes = Array.from({ length: 127 }, (_, id) => ({ id }));
  nodes.forEach((node, i) => { node.left = nodes[i * 2 + 1]; node.right = nodes[i * 2 + 2]; });
  const layout = binaryTreeLayout(nodes[0]);
  const xs = [...layout.positions.values()].map(p => p.x).sort((a,b) => a-b);
  assert.equal(layout.edges.length, 126);
  xs.slice(1).forEach((x,i) => assert.ok(x-xs[i] >= 76));
  for (const p of layout.positions.values()) { assert.ok(p.x + 22 < layout.width); assert.ok(p.y + 22 < layout.height); }
});

test('deep and empty trees do not require recursion', () => {
  let root = null;
  for (let id = 0; id < 10000; id++) root = { id, right: root };
  const layout = binaryTreeLayout(root);
  assert.equal(layout.nodes.length, 10000);
  assert.equal(binaryTreeLayout(null).nodes.length, 0);
});
