import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, connections) => buildTrace({ n, connections }).result

test('1466 official examples', () => {
  assert.equal(solve(6, [[0, 1], [1, 3], [2, 3], [4, 0], [4, 5]]), 3)
  assert.equal(solve(5, [[1, 0], [1, 2], [3, 2], [3, 4]]), 2)
  assert.equal(solve(3, [[1, 0], [2, 0]]), 0)
})

test('1466 edge case: a two-city road must be reversed when it points away from zero', () => {
  assert.equal(solve(2, [[0, 1]]), 1)
  assert.equal(solve(2, [[1, 0]]), 0)
})

test('1466 rejects a disconnected or cyclic road set', () => {
  assert.throws(() => parseInput('{"n":3,"connections":[[0,1],[0,1]]}'))
  assert.throws(() => parseInput('{"n":4,"connections":[[0,1],[1,2],[2,0]]}'))
})

// Independent oracle: root the tree with a breadth-first search, then check each road against its parent link.
function oracle(n, connections) {
  const linked = Array.from({ length: n }, () => [])
  for (const [a, b] of connections) {
    linked[a].push(b)
    linked[b].push(a)
  }
  const parent = Array(n).fill(-1)
  const queue = [0]
  const seen = new Set([0])
  for (let head = 0; head < queue.length; head++) {
    for (const next of linked[queue[head]]) {
      if (seen.has(next)) continue
      seen.add(next)
      parent[next] = queue[head]
      queue.push(next)
    }
  }
  // A road a to b is wrong when b is the child of a, because it then points away from zero.
  return connections.reduce((total, [a, b]) => total + (parent[b] === a ? 1 : 0), 0)
}

test('1466 random trees match a parent-direction oracle', () => {
  let seed = 1466
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const connections = []
    for (let i = 1; i < n; i++) {
      const parent = rnd(i)
      connections.push(rnd(2) ? [parent, i] : [i, parent])
    }
    assert.equal(solve(n, connections), oracle(n, connections), JSON.stringify(connections))
  }
})
