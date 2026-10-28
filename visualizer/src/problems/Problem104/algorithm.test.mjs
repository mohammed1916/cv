import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('maximum depth returns a real root-to-leaf witness for sparse, tied and empty trees',()=>{
  for(const [text,depth] of [['[]',0],['[3,9,20,null,null,15,7]',3],['[1,null,2,null,3]',3],['[1,2,2]',2]]){
    const story=generateSteps(text),last=story.steps.at(-1);
    assert.equal(last.total,depth);assert.equal(last.path.length,depth);
    for(let i=1;i<last.path.length;i++)assert.ok(story.edges.some(e=>e.fromId===last.path[i-1]&&e.toId===last.path[i]));
    assert.equal(story.steps[0].returnValues.size,0);
  }
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('104 official examples', () => {
  assert.equal(solve([3, 9, 20, null, null, 15, 7]), 3)
  assert.equal(solve([1, null, 2]), 2)
})

test('104 empty tree and single node', () => {
  assert.equal(solve([]), 0)
  assert.equal(solve([0]), 1)
})

test('104 rejects a null root with children and out-of-range values', () => {
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[101]'))
})

// Independent oracle: an explicit stack of (node, depth) pairs instead of recursion.
function oracle(root) {
  if (!root) return 0
  const stack = [[root, 1]]
  let best = 0
  while (stack.length) {
    const [node, depth] = stack.pop()
    best = Math.max(best, depth)
    if (node.left) stack.push([node.left, depth + 1])
    if (node.right) stack.push([node.right, depth + 1])
  }
  return best
}

test('104 seeded random trees match an explicit-stack oracle', () => {
  let seed = 104
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = rnd(8) === 0 ? [] : [rnd(5)]
    const size = rnd(14)
    for (let i = 1; i < size && arr.length; i++) arr.push(rnd(3) === 0 ? null : rnd(5))
    assert.equal(solve(arr), oracle(treeFromLevelOrder(arr)), JSON.stringify(arr))
  }
})

test('104 displayed Python returns the same depths', () => {
  const cases = [[3, 9, 20, null, null, 15, 7], [1, null, 2], [], [0], [1, 2, null, 3, null, 4]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([max_depth(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
