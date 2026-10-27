import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (parent, s) => buildTrace({ parent, s }).result

test('3331 worked examples', () => {
  // Node 2 ('a') skips its 'b' parent and moves under the root 'a'.
  assert.deepEqual(solve([-1, 0, 1], 'aba'), [3, 1, 1])
  // Every node has the same letter, so each moves under its parent and the chain stays intact.
  assert.deepEqual(solve([-1, 0, 1, 2], 'aaaa'), [4, 3, 2, 1])
  assert.deepEqual(solve([-1, 0, 0], 'abc'), [3, 1, 1])
})

test('3331 a single node is its own tree', () => {
  assert.deepEqual(solve([-1], 'a'), [1])
})

test('3331 rejects a parent that is not an earlier node', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,0],"s":"abc"}'))
})

// Independent oracle: rebuild the new tree explicitly, then count each node's subtree by walking every node up to the root.
function oracle(parent, s) {
  const n = parent.length
  const newParent = Array(n).fill(-1)
  for (let x = 1; x < n; x++) {
    const chain = []
    for (let y = parent[x]; y !== -1; y = parent[y]) chain.push(y)
    const same = chain.find(y => s[y] === s[x])
    newParent[x] = same === undefined ? parent[x] : same
  }
  const sizes = Array(n).fill(0)
  for (let v = 0; v < n; v++) {
    for (let y = v; y !== -1; y = newParent[y]) sizes[y]++
  }
  return sizes
}

test('3331 random trees match an explicit re-parenting oracle', () => {
  let seed = 3331
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const parent = [-1]
    for (let i = 1; i < n; i++) parent.push(rnd(i))
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    assert.deepEqual(solve(parent, s), oracle(parent, s), JSON.stringify({ parent, s }))
  }
})
