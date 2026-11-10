import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSteps } from './algorithm.js';
test('same-tree trace distinguishes sparse structure, values and empty trees',()=>{
  for(const [p,q,expected] of [[[],[],true],[[1],[],false],[[1,null,2,null,3],[1,null,2,null,3],true],[[1,2],[1,null,2],false],[[1,2,3],[1,2,4],false]]) {
    const frames=generateSteps(p,q);
    assert.equal(frames.at(-1).finalResult,expected);
    assert.equal(frames.at(-1).activeLine,11);
  }
  const frames=generateSteps([1,null,2,null,3],[1,null,2,null,3]);
  assert.equal(frames[0].pNodes.length,3);
  assert.equal(frames[0].pEdges.length,2);
});
test('invalid orphan values are rejected by the shared parser',()=>{
  assert.throws(()=>generateSteps([null,2],[]));
  assert.throws(()=>generateSteps([1,null,null,2],[]));
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = (p, q) => buildTrace(parseInput(JSON.stringify({ p, q }))).result

test('100 official examples', () => {
  assert.equal(solve([1, 2, 3], [1, 2, 3]), true)
  assert.equal(solve([1, 2], [1, null, 2]), false)
  assert.equal(solve([1, 2, 1], [1, 1, 2]), false)
})

test('100 empty trees and one-sided trees', () => {
  assert.equal(solve([], []), true)
  assert.equal(solve([1], []), false)
  assert.equal(solve([], [1]), false)
})

test('100 rejects a missing key and a null root with children', () => {
  assert.throws(() => parseInput('{"p":[1]}'))
  assert.throws(() => parseInput('{"p":[null,1],"q":[]}'))
})

// Independent oracle: write each tree as a pre-order string with markers for missing children.
function signature(node) {
  if (!node) return '#'
  return `${node.value}(${signature(node.left)},${signature(node.right)})`
}

test('100 seeded random pairs match a pre-order signature oracle', () => {
  let seed = 100
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const randomTree = () => {
    const size = rnd(7)
    const arr = []
    for (let i = 0; i < size; i++) arr.push(rnd(3) === 0 ? null : rnd(3))
    if (arr.length && arr[0] === null) arr[0] = 1
    // Orphaned values are rejected by the shared parser; keep only arrays it accepts.
    try { buildTrace({ p: arr, q: [] }); return arr } catch { return [] }
  }
  for (let t = 0; t < 300; t++) {
    const p = randomTree()
    const q = rnd(2) ? p.slice() : randomTree()
    const expected = signature(treeFromLevelOrder(p)) === signature(treeFromLevelOrder(q))
    assert.equal(solve(p, q), expected, JSON.stringify({ p, q }))
  }
})

test('100 displayed Python returns the same answers', () => {
  const cases = [{ p: [1, 2, 3], q: [1, 2, 3] }, { p: [1, 2], q: [1, null, 2] }, { p: [], q: [] }, { p: [1, 2, 1], q: [1, 1, 2] }]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([is_same_tree(c["p"], c["q"]) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(c => solve(c.p, c.q)))
})

import { buildTrace as buildSameTreeTrace } from './algorithm.js'

test('100 call frames name the child pair entered, including null children', () => {
  const { frames } = buildSameTreeTrace({ p: [1, 2], q: [1, null, 3] })
  const calls = frames.filter(frame => frame.kind === 'call')
  assert.deepEqual(calls.map(frame => [frame.side, frame.activeLine]), [['left', 5], ['right', 6]])
  const leftCall = calls[0]
  assert.notEqual(leftCall.childP, null)
  assert.equal(leftCall.childQ, null)
  // The call frame keeps the parent pair; the child's own check frame follows immediately.
  assert.equal(frames[frames.indexOf(leftCall) + 1].kind, 'check')
})

test('100 receive frames carry the child boolean that the parent stores', () => {
  const { frames, result } = buildSameTreeTrace({ p: [1, 2, 3], q: [1, 2, 4] })
  const receives = frames.filter(frame => frame.kind === 'receive')
  // Leaf pairs 2/2 and 3/4 receive their children first; the root's own two receipts come last.
  assert.deepEqual(receives.map(frame => [frame.side, frame.returned]).slice(-2), [['left', true], ['right', false]])
  assert.equal(receives.length, 4)
  assert.equal(result, false)
})

test('100 returns carry the returned value; condition-only frames never transfer', () => {
  const { frames, result } = buildSameTreeTrace({ p: [1, 2, 1], q: [1, 1, 2] })
  for (const frame of frames) {
    if (frame.kind === 'check') {
      assert.equal(frame.returned, null)
      assert.equal(frame.childP, null)
      assert.equal(frame.childQ, null)
    }
    if (frame.kind === 'call') assert.equal(frame.returned, null)
    if (frame.kind === 'return') assert.equal(typeof frame.returned, 'boolean')
  }
  assert.equal(frames.filter(frame => frame.kind === 'return' && frame.activeLine === 7).at(-1).returned, result)
})

test('100 base-case return of true on two empty children is its own frame', () => {
  const { frames } = buildSameTreeTrace({ p: [1], q: [1] })
  const baseReturns = frames.filter(frame => frame.kind === 'return' && frame.activeLine === 2)
  assert.equal(baseReturns.length, 2)
  assert.ok(baseReturns.every(frame => frame.returned === true && frame.activePId === null && frame.activeQId === null))
})
