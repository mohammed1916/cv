import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1305 official examples', () => {
  assert.deepEqual(solve({ root1: [2, 1, 4], root2: [1, 0, 3] }), [0, 1, 1, 2, 3, 4])
  assert.deepEqual(solve({ root1: [1, null, 8], root2: [8, 1] }), [1, 1, 8, 8])
})

test('1305 rejects a tree that is not a binary search tree', () => {
  assert.throws(() => parseInput('{"root1":[2,3,1],"root2":[1]}'), /not a binary search tree/)
})

// Independent oracle: collect every value from the arrays, then sort them.
function oracle({ root1, root2 }) {
  return [...root1, ...root2].filter(v => v !== null).sort((a, b) => a - b)
}

// Builds a level-order array by inserting values into a binary search tree.
function bstArray(values) {
  let root = null
  const insert = (node, v) => {
    if (!node) return { v, l: null, r: null }
    if (v < node.v) node.l = insert(node.l, v)
    else node.r = insert(node.r, v)
    return node
  }
  for (const v of values) root = insert(root, v)
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (!node) { out.push(null); continue }
    out.push(node.v)
    queue.push(node.l, node.r)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('1305 seeded random trees match a sort of all values', () => {
  let seed = 1305
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const distinct = count => { const set = new Set(); while (set.size < count) set.add(-20 + rnd(41)); return [...set] }
  for (let t = 0; t < 200; t++) {
    const input = { root1: bstArray(distinct(1 + rnd(8))), root2: bstArray(distinct(1 + rnd(8))) }
    if (input.root1.length > 31 || input.root2.length > 31) continue
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
