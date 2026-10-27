import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace(parseInput(JSON.stringify({ values }))).result

test('1448 official examples', () => {
  assert.equal(solve([3, 1, 4, 3, null, 1, 5]), 4)
  assert.equal(solve([3, 3, null, 4, 2]), 3)
  assert.equal(solve([1]), 1)
})

test('1448 a decreasing path has only its root good', () => {
  assert.equal(solve([5, 4, null, 3]), 1)
})

test('1448 rejects a null root', () => {
  assert.throws(() => parseInput('{"values":[null,1]}'))
})

// Independent oracle: for each node, find its ancestors by searching from the root, then compare with their maximum.
function oracle(values) {
  const nodes = []
  // Level-order serialization: each present node takes the next two entries as its children, in queue order.
  const make = v => ({ v, left: null, right: null })
  const root = make(values[0])
  const queue = [root]
  let cursor = 1
  for (let qi = 0; qi < queue.length && cursor < values.length; qi++) {
    const node = queue[qi]
    if (cursor < values.length && values[cursor] !== null) { node.left = make(values[cursor]); queue.push(node.left) }
    cursor++
    if (cursor < values.length && values[cursor] !== null) { node.right = make(values[cursor]); queue.push(node.right) }
    cursor++
  }
  const walk = (node, path) => {
    if (!node) return
    nodes.push({ v: node.v, path: [...path] })
    walk(node.left, [...path, node.v])
    walk(node.right, [...path, node.v])
  }
  walk(root, [])
  return nodes.filter(({ v, path }) => path.every(a => a <= v)).length
}

test('1448 random trees match an ancestor-path oracle', () => {
  let seed = 1448
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const size = 1 + rnd(15)
    const values = [rnd(7) - 3]
    for (let k = 1; k < size; k++) values.push(rnd(4) ? rnd(7) - 3 : null)
    assert.equal(solve(values), oracle(values), JSON.stringify(values))
  }
})
