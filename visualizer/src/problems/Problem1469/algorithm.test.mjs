import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = tree => buildTrace({ tree }).result.slice().sort((a, b) => a - b)

function checkFrames(run) {
  const pyLines = python.split('\n')
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1469 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, null, 4]), [4])
  assert.deepEqual(solve([7, 1, 4, 6, null, 5, 3, null, null, null, null, null, 2]), [2, 6])
  assert.deepEqual(solve([8]), [])
  checkFrames(buildTrace({ tree: [1, 2, 3, null, 4] }))
})

test('1469 edge cases: the root is never lonely; two children mean nobody is lonely', () => {
  assert.deepEqual(solve([1, 2, 3]), [])
  assert.deepEqual(solve([1, null, 2]), [2])
  assert.deepEqual(solve([1, 2, null, 3]), [2, 3])
})

// Oracle: a node is lonely when its parent has exactly one child (nested tree walk).
function oracle(node, out = []) {
  if (!node) return out
  const kids = [node.left, node.right].filter(Boolean)
  if (kids.length === 1) out.push(kids[0].val)
  oracle(node.left, out)
  oracle(node.right, out)
  return out
}

function toLevelOrder(root) {
  const out = []
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    if (!node) { out.push(null); continue }
    out.push(node.val)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

function randomTree(rand, size) {
  if (size === 0) return null
  const leftSize = rand(size)
  return { val: rand(10), left: randomTree(rand, leftSize), right: randomTree(rand, size - 1 - leftSize) }
}

test('1469 random trees match a parent-child oracle', () => {
  let seed = 1469
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 300; trial++) {
    const root = randomTree(rand, 1 + rand(12))
    const tree = toLevelOrder(root)
    assert.deepEqual(solve(tree), oracle(root).sort((a, b) => a - b), JSON.stringify(tree))
  }
})

test('1469 rejects a non-tree array', () => {
  assert.throws(() => parseInput('{"tree":[1,null,null,2]}'))
  assert.throws(() => parseInput('{"tree":[null]}'))
})
