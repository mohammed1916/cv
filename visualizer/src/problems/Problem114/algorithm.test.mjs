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

// ─── Statement contract tests (parseInput / buildTrace / python) ───
import { parseInput, buildTrace, python } from './algorithm.js'

test('statement examples flatten to the pre-order chain', () => {
  assert.deepEqual(buildTrace(parseInput('{"root":[1,2,5,3,4,null,6]}')).result, [1, 2, 3, 4, 5, 6])
  assert.deepEqual(buildTrace(parseInput('{"root":[]}')).result, [])
  assert.deepEqual(buildTrace(parseInput('{"root":[0]}')).result, [0])
})

test('validation rejects malformed input with clear errors', () => {
  assert.throws(() => parseInput('[1,2]'), /object with a "root" array/)
  assert.throws(() => parseInput('{"root":[null,1]}'), /root slot cannot be null/)
  assert.throws(() => parseInput('{"root":[1.5]}'), /integers from -100 to 100/)
  assert.throws(() => parseInput('{"root":' + JSON.stringify(Array(201).fill(1)) + '}'), /at most 200/)
})

test('every frame points at a pseudocode line and the python export is present', () => {
  const trace = buildTrace(parseInput('{"root":[1,2,5,3,4,null,6]}'))
  for (const f of trace.frames) assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
  assert.match(python, /def flatten_tree\(root\):/)
})

test('seeded random trees match an independent recursive pre-order oracle', () => {
  let seed = 114
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const oracle = root => {
    const n = root.length
    if (n === 0) return []
    const nodes = root.map(v => (v === null ? null : { v, l: null, r: null }))
    const queue = [nodes[0]]; let slot = 1
    for (let i = 0; i < queue.length; i++) {
      const t = queue[i]
      const li = slot++, ri = slot++
      if (li < n && nodes[li]) { t.l = nodes[li]; queue.push(nodes[li]) }
      if (ri < n && nodes[ri]) { t.r = nodes[ri]; queue.push(nodes[ri]) }
    }
    const out = []
    const walk = t => { if (!t) return; out.push(t.v); walk(t.l); walk(t.r) }
    walk(nodes[0])
    return out
  }
  for (let k = 0; k < 150; k++) {
    const len = 1 + rnd(20)
    const root = Array.from({ length: len }, (_, i) => (i > 0 && rnd(3) === 0 ? null : rnd(201) - 100))
    const input = { root }
    assert.deepEqual(buildTrace(parseInput(JSON.stringify(input))).result, oracle(root), JSON.stringify(root))
  }
})
