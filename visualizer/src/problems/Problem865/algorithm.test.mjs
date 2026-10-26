import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = tree => buildTrace(parseInput(JSON.stringify(tree)))

// Oracle: collect deepest leaves, then take the deepest node whose subtree contains all of them.
function oracle(tree) {
  const root = treeFromLevelOrder(tree)
  const depth = new Map(); let max = 0
  const walk = (n, d) => { if (n) { depth.set(n, d); max = Math.max(max, d); walk(n.left, d + 1); walk(n.right, d + 1) } }
  walk(root, 0)
  const deepest = [...depth].filter(([, d]) => d === max).map(([n]) => n)
  const contains = (a, b) => !!a && (a === b || contains(a.left, b) || contains(a.right, b))
  let best = null
  for (const [n, d] of depth) if (deepest.every(x => contains(n, x)) && (!best || d > depth.get(best))) best = n
  return best.value
}

function randomTree() {
  const size = 1 + Math.floor(Math.random() * 15); const vals = [...Array(size).keys()].sort(() => Math.random() - 0.5)
  let used = 1; const out = [vals[0]]; const queue = [0]
  for (let h = 0; h < queue.length; h++) for (let s = 0; s < 2; s++) {
    if (used < size && Math.random() < 0.6) { out.push(vals[used]); queue.push(used); used++ } else out.push(null)
  }
  while (out.at(-1) === null) out.pop()
  return out
}

test('official examples', () => {
  const r = solve([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4])
  assert.equal(r.result, 2); assert.deepEqual(r.resultSubtree, [2, 7, 4])
  assert.equal(solve([1]).result, 1)
  assert.equal(solve([0, 1, 3, null, 2]).result, 2)
})

test('matches deepest-leaf containment oracle', () => {
  for (let t = 0; t < 400; t++) { const tree = randomTree(); assert.equal(solve(tree).result, oracle(tree), JSON.stringify(tree)) }
})

test('trace shape', () => {
  const r = solve([1, 2, 3])
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1,1]'))
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[1,null,null,3]'))
  assert.throws(() => parseInput('{}'))
})
