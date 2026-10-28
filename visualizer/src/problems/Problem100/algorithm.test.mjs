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
    return arr
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
