import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSteps } from './algorithm.js';
test('mirror comparison checks opposite children and sparse structure',()=>{
  for(const [tree,expected] of [[[],true],[[1,2,2,3,4,4,3],true],[[1,2,2,null,3,null,3],false],[[1,2,2,null,3,3,null],true]])assert.equal(generateSteps(tree).at(-1).finalResult,expected);
});
test('failed outer pair skips inner comparison and maps final return correctly',()=>{
  const frames=generateSteps([1,2,2,3,8,8,4]);
  assert.equal(frames.at(-1).finalResult,false);
  assert.equal(frames.at(-1).activeLine,12);
  assert.equal(frames.some(f=>f.activeLeftId==='n-4'||f.activeRightId==='n-5'),false);
  assert.ok(frames.some(f=>f.message.includes('Short-circuit')));
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('101 official examples', () => {
  assert.equal(solve([1, 2, 2, 3, 4, 4, 3]), true)
  assert.equal(solve([1, 2, 2, null, 3, null, 3]), false)
})

test('101 single node and one-sided tree', () => {
  assert.equal(solve([1]), true)
  assert.equal(solve([1, 2]), false)
  assert.equal(solve([1, null, 2]), false)
})

test('101 rejects an empty tree and a null root', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[101]'))
})

// Independent oracle: the left subtree must equal the right subtree after reflecting the right side,
// which is checked by comparing two pre-order strings.
function pre(node) {
  if (!node) return '#'
  return `${node.value}(${pre(node.left)},${pre(node.right)})`
}
function reflected(node) {
  if (!node) return '#'
  return `${node.value}(${reflected(node.right)},${reflected(node.left)})`
}

test('101 seeded random trees match a reflected pre-order oracle', () => {
  let seed = 101
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [rnd(2)]
    const size = rnd(9)
    for (let i = 1; i < size; i++) arr.push(rnd(3) === 0 ? null : rnd(2))
    const root = treeFromLevelOrder(arr)
    const expected = !root || pre(root.left) === reflected(root.right)
    assert.equal(solve(arr), expected, JSON.stringify(arr))
  }
})

test('101 displayed Python returns the same answers', () => {
  const cases = [[1, 2, 2, 3, 4, 4, 3], [1, 2, 2, null, 3, null, 3], [1], [1, 2]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([is_symmetric(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
