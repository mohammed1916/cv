import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFlattenStory } from './algorithm.js';
import { parseLevelOrderTree } from '../../components/shared/levelOrderTree.js';

test('final right chain preserves original preorder and every node identity', () => {
  for (const input of ['[]','[1]','[1,2,5,3,4,null,6]','[1,null,2,3]','[1,1,1,1,null,1]','[1,2,null,3,null,4]']) {
    const root = parseLevelOrderTree(input), expected = [];
    const visit = n => { if (n) { expected.push(n.id); visit(n.left); visit(n.right); } }; visit(root);
    const story = buildFlattenStory(input), final = story.frames.at(-1), actual = [];
    for (let id = story.rootId; id !== null; id = final.links[id].right) {
      assert.equal(final.links[id].left, null); actual.push(id); assert.ok(actual.length <= expected.length);
    }
    assert.deepEqual(actual, expected);
  }
});

test('each pointer assignment has its own immutable snapshot and all nodes stay reachable', () => {
  const story = buildFlattenStory('[1,2,5,3,4,null,6]');
  assert.deepEqual(story.frames.filter(f=>f.changed).slice(0,3).map(f=>f.activeLine),[9,11,12]);
  for (let i=0; i<story.frames.length; i++) {
    const frame=story.frames[i], seen=new Set(), pending=[story.rootId];
    while(pending.length) { const id=pending.pop(); if(id===null||seen.has(id))continue;seen.add(id);pending.push(frame.links[id].left,frame.links[id].right); }
    assert.equal(seen.size,story.nodes.length);
    if(frame.changed) { let changes=0; for(const id of Object.keys(frame.links))for(const side of ['left','right'])if(frame.links[id][side]!==story.frames[i-1].links[id][side])changes++;assert.ok(changes<=1); }
  }
  assert.equal(story.frames[0].links[0].left,1);
  assert.throws(()=>buildFlattenStory('[1,null,null,2]'));
});
