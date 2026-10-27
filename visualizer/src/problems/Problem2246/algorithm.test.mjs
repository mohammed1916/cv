import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (parent, s) => buildTrace(parseInput(JSON.stringify({ parent, s }))).result

test('2246 official examples', () => {
  assert.equal(solve([-1, 0, 0, 1, 1, 2], 'abacbe'), 3)
  assert.equal(solve([-1, 0, 0, 0], 'aabc'), 3)
})

test('2246 a single node is a path of length one', () => {
  assert.equal(solve([-1], 'a'), 1)
})

test('2246 rejects a cycle and a bad letter', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,1],"s":"abc"}'))
  assert.throws(() => parseInput('{"parent":[-1,0],"s":"a1"}'))
})

// Independent oracle: enumerate every simple path that starts at each node (depth-first search, no caching)
// and keep the longest one whose neighboring letters all differ.
function oracle(parent, s) {
  const n = parent.length
  const adj = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) { adj[i].push(parent[i]); adj[parent[i]].push(i) }
  let best = 0
  const explore = (v, seen, length) => {
    best = Math.max(best, length)
    for (const w of adj[v]) {
      if (seen.has(w) || s[w] === s[v]) continue
      seen.add(w)
      explore(w, seen, length + 1)
      seen.delete(w)
    }
  }
  for (let v = 0; v < n; v++) explore(v, new Set([v]), 1)
  return best
}

test('2246 random trees match a path-enumeration oracle', () => {
  let seed = 2246
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const parent = [-1]
    for (let i = 1; i < n; i++) parent.push(rnd(i))
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(parent, s), oracle(parent, s), JSON.stringify({ parent, s }))
  }
})
