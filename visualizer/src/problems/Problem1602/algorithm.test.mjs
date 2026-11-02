import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (tree, u) => buildTrace({ tree, u }).result

function checkFrames(trace) {
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1602 worked examples (u is an array position)', () => {
  // Levels: [1], [2, 3], [4, 5, 6] at positions [0], [1, 2], [4, 5, 6].
  const tree = [1, 2, 3, null, 4, 5, 6]
  assert.equal(solve(tree, 4), 5)
  assert.equal(solve(tree, 1), 2)
  assert.equal(solve(tree, 2), null)
  assert.equal(solve(tree, 5), 6)
  assert.equal(solve(tree, 6), null)
  checkFrames(buildTrace({ tree, u: 4 }))
})

test('1602 edge cases: the root has no neighbour; the rightmost node of a level has none', () => {
  assert.equal(solve([7], 0), null)
  assert.equal(solve([1, 2, 3], 1), 2)
  assert.equal(solve([1, 2, 3], 2), null)
})

// Oracle: nested BFS levels; find the level holding u and read the next node.
function oracle(root, target) {
  let level = [root]
  while (level.length) {
    const i = level.indexOf(target)
    if (i >= 0) return i + 1 < level.length ? level[i + 1] : null
    level = level.flatMap(node => [node.left, node.right].filter(Boolean))
  }
  return null
}

function serialize(root) {
  const out = []
  const pos = new Map()
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (!node) { out.push(null); continue }
    pos.set(node, out.length)
    out.push(node.val)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return { out, pos }
}

function randomTree(rand, size) {
  if (size === 0) return null
  const leftSize = rand(size)
  return { val: rand(10), left: randomTree(rand, leftSize), right: randomTree(rand, size - 1 - leftSize) }
}

function allNodes(root, acc = []) {
  if (!root) return acc
  acc.push(root)
  allNodes(root.left, acc)
  allNodes(root.right, acc)
  return acc
}

test('1602 random trees match a level-order oracle', () => {
  let seed = 1602
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  for (let trial = 0; trial < 300; trial++) {
    const root = randomTree(rand, 1 + rand(12))
    const { out, pos } = serialize(root)
    const nodes = allNodes(root)
    if (out.length > 15) continue
    const target = nodes[rand(nodes.length)]
    const expectedNode = oracle(root, target)
    const expected = expectedNode ? pos.get(expectedNode) : null
    assert.equal(solve(out, pos.get(target)), expected, JSON.stringify({ out, u: pos.get(target) }))
  }
})

test('1602 rejects a position that is empty', () => {
  assert.throws(() => parseInput('{"tree":[1,null,2],"u":1}'))
})
