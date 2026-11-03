import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace(values).result

test('3157 worked trees', () => {
  assert.equal(solve([4, 1, 9, -6, 2, null, 3]), 3)
  assert.equal(solve([0, 1, -1]), 1)
  assert.equal(solve([7]), 1)
  assert.equal(solve([1, 2, -2]), 2)
  assert.equal(solve([1, 2, 3, 4, 5]), 1)
})

// Oracle: build the tree as objects from a random generator, sum levels by recursion,
// and serialize the same tree to a LeetCode-style list for the trace to read back.
function randomTree(rnd, depth) {
  if (depth === 0 || rnd(4) === 0) return null
  const value = rnd(21) - 10
  return { value, left: randomTree(rnd, depth - 1), right: randomTree(rnd, depth - 1) }
}
function serialize(root) {
  const out = []
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    if (!node) { out.push(null); continue }
    out.push(node.value)
    queue.push(node.left, node.right)
  }
  while (out.length && out.at(-1) === null) out.pop()
  return out
}
function oracle(root) {
  const sums = []
  const walk = (node, depth) => {
    if (!node) return
    sums[depth] = (sums[depth] ?? 0) + node.value
    walk(node.left, depth + 1)
    walk(node.right, depth + 1)
  }
  walk(root, 0)
  let best = 0
  for (let d = 1; d < sums.length; d++) if (sums[d] < sums[best]) best = d
  return best + 1
}

test('3157 random trees match a recursive level-sum oracle', () => {
  let seed = 3157
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    let root = randomTree(rnd, 4)
    if (!root) root = { value: 1, left: null, right: null }
    const values = serialize(root)
    assert.equal(solve(values), oracle(root), JSON.stringify(values))
  }
})

test('3157 frames carry real pseudocode and python lines', () => {
  const run = buildTrace([4, 1, 9, -6, 2, null, 3])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 12, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 28, `pythonLine ${frame.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.root.val, 4)
})

test('3157 parse rejects a null root and non-integers', () => {
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[]'))
  assert.deepEqual(parseInput('[1,null,2]'), [1, null, 2])
})
