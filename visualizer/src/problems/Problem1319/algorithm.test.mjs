import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, links) => buildTrace({ n, links }).result

test('1319 sample inputs give the expected relocation counts', () => {
  assert.equal(solve(6, [[0, 1], [0, 2], [3, 4], [2, 3], [1, 2]]), 1)
  assert.equal(solve(4, [[0, 1], [0, 2], [1, 2]]), 1)
  assert.equal(solve(5, [[0, 1], [2, 3]]), -1)
})

test('1319 a single computer needs no moves', () => {
  assert.equal(solve(1, []), 0)
})

test('1319 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":0,"links":[]}'), /n/)
  assert.throws(() => parseInput('{"n":3,"links":[[0,3]]}'), /different computers/)
  assert.throws(() => parseInput('{"n":3,"links":[[1,1]]}'), /different computers/)
  assert.throws(() => parseInput('[]'), /object/)
})

// Independent oracle: count connected components with a breadth-first search, then apply the cable-count rule.
test('1319 matches a component-counting oracle on random graphs', () => {
  let seed = 11
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const links = []
    const count = rnd(16)
    for (let k = 0; k < count; k++) {
      const a = rnd(n)
      const b = rnd(n)
      if (a !== b) links.push([a, b])
    }
    const expected = links.length < n - 1 ? -1 : oracle(n, links)
    assert.equal(solve(n, links), expected, JSON.stringify({ n, links }))
  }
})

function oracle(n, links) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of links) { adj[a].push(b); adj[b].push(a) }
  const seen = new Array(n).fill(false)
  let components = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    components++
    const queue = [s]
    seen[s] = true
    while (queue.length) {
      const v = queue.shift()
      for (const w of adj[v]) if (!seen[w]) { seen[w] = true; queue.push(w) }
    }
  }
  return components - 1
}
