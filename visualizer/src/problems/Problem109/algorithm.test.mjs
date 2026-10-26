import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSortedListStory, parseSortedList } from './algorithm.js';
test('construction preserves order, identity and balance for 0 through 200 nodes', () => {
  for (let size = 0; size <= 200; size++) {
    const values = Array.from({length:size}, (_,i) => Math.floor(i/3)-30);
    const story = buildSortedListStory(values), ordered = [];
    function walk(node) {
      if (!node) return 0;
      const l = walk(node.left); ordered.push(node.val); const r = walk(node.right);
      assert.ok(Math.abs(l-r)<=1);
      assert.ok(node.createdAt < node.returnedAt);
      for (const child of [node.left,node.right]) if(child) { assert.ok(node.createdAt < child.createdAt); assert.ok(child.returnedAt < node.returnedAt); }
      return 1+Math.max(l,r);
    }
    walk(story.root);
    assert.deepEqual(ordered,values);
    assert.equal(new Set(story.nodes.map(n=>n.id)).size,size);
    assert.equal(story.frames.at(-1).phase,'done');
  }
});
test('reject unsorted, noninteger and oversized input without substituting an example', () => {
  for (const text of ['[2,1]','[null]','["3"]','{}',JSON.stringify(Array(201).fill(1))]) assert.throws(()=>parseSortedList(text));
  assert.deepEqual(parseSortedList('[-2,-2,0]'),[-2,-2,0]);
});
