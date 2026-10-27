import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (parent, s) => buildTrace({ parent, s }).result

test('2791 worked examples', () => {
  assert.equal(solve([-1, 0], 'aa'), 1)
  assert.equal(solve([-1, 0], 'ab'), 0)
  // Pairs (0,2) reads "aa" and (1,2) reads "baa" (b odd only); (0,1) reads "ab" and fails.
  assert.equal(solve([-1, 0, 0], 'aba'), 2)
})

test('2791 a path with two or more odd letter counts is not counted', () => {
  // Chain 0-1-2 spelling "abc": every path has at least two odd letters.
  assert.equal(solve([-1, 0, 1], 'abc'), 0)
  // Chain spelling "aba": only the whole path 0-1-2 (one odd letter, b) counts.
  assert.equal(solve([-1, 0, 1], 'aba'), 1)
})

test('2791 rejects a parent that is not an earlier node', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,0],"s":"abc"}'))
  assert.throws(() => parseInput('{"parent":[0,0],"s":"ab"}'))
})

// Independent oracle: breadth-first search for each path, then count letter parities directly.
function oracle(parent, s) {
  const n = parent.length
  const adjacency = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) { adjacency[i].push(parent[i]); adjacency[parent[i]].push(i) }
  let count = 0
  for (let u = 0; u < n; u++) {
    const back = Array(n).fill(-2)
    back[u] = -1
    const queue = [u]
    for (let q = 0; q < queue.length; q++) for (const w of adjacency[queue[q]]) if (back[w] === -2) { back[w] = queue[q]; queue.push(w) }
    for (let v = u + 1; v < n; v++) {
      const parity = new Map()
      for (let x = v; x !== -1; x = back[x]) parity.set(s[x], !(parity.get(s[x]) || false))
      let odd = 0
      for (const isOdd of parity.values()) if (isOdd) odd++
      if (odd <= 1) count++
    }
  }
  return count
}

test('2791 random trees match a BFS-path oracle', () => {
  let seed = 2791
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const parent = [-1]
    for (let i = 1; i < n; i++) parent.push(rnd(i))
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(parent, s), oracle(parent, s), JSON.stringify({ parent, s }))
  }
})
