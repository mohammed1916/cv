import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (tree, arr) => buildTrace({ tree, arr }).result

function checkFrames(run) {
  const pyLines = python.split('\n')
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1430 worked examples', () => {
  assert.equal(solve([0, 1, 0, 0, 1, 0, null, null, 1, 0, 0], [0, 1, 0, 1]), true)
  assert.equal(solve([0, 1, 0, 0, 1, 0, null, null, 1, 0, 0], [0, 0, 1]), false)
  assert.equal(solve([1, 2, 3], [1, 3, 9]), false)
  checkFrames(buildTrace({ tree: [0, 1, 0, 0, 1, 0, null, null, 1, 0, 0], arr: [0, 1, 0, 1] }))
})

test('1430 edge cases: a prefix ending at an internal node is not enough', () => {
  assert.equal(solve([1, 2, 3], [1, 2]), true)
  assert.equal(solve([1, 2, 3], [1]), false)
  assert.equal(solve([1, null, 2, null, 3], [1, 2, 3]), true)
  assert.equal(solve([1, null, 2, null, 3], [1, 2]), false)
})

// Oracle: enumerate every root-to-leaf value sequence of a nested tree.
function leafPaths(node, prefix = [], out = []) {
  if (!node) return out
  const next = [...prefix, node.val]
  if (!node.left && !node.right) out.push(next)
  leafPaths(node.left, next, out)
  leafPaths(node.right, next, out)
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
  const val = rand(4)
  const leftSize = rand(size)
  return { val, left: randomTree(rand, leftSize), right: randomTree(rand, size - 1 - leftSize) }
}

test('1430 random trees match a leaf-path oracle', () => {
  let seed = 1430
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 300; trial++) {
    const root = randomTree(rand, 1 + rand(9))
    if (!root) continue
    const tree = toLevelOrder(root)
    const paths = leafPaths(root)
    const arr = rand(2) === 0 ? paths[rand(paths.length)] : Array.from({ length: 1 + rand(4) }, () => rand(4))
    const expected = paths.some(path => path.length === arr.length && path.every((v, i) => v === arr[i]))
    assert.equal(solve(tree, arr), expected, JSON.stringify({ tree, arr }))
  }
})

test('1430 rejects malformed arrays', () => {
  assert.throws(() => parseInput('{"tree":[null,1],"arr":[1]}'))
  assert.throws(() => parseInput('{"tree":[1,2,3],"arr":[]}'))
  assert.throws(() => parseInput('{"tree":[1,null,null,2],"arr":[1,2]}'))
})
