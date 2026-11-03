import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, initial, edges) => buildTrace({ n, initial, edges }).result

test('3383 worked examples', () => {
  assert.equal(solve(6, [0], [[0, 1], [1, 2], [3, 2], [4, 5], [5, 4]]), 2)
  assert.equal(solve(4, [], [[0, 1], [1, 0], [2, 3]]), 2)
})

test('3383 edge cases', () => {
  assert.equal(solve(1, [], []), 1)
  assert.equal(solve(1, [0], []), 0)
  assert.equal(solve(3, [0], [[0, 1], [1, 2], [2, 0]]), 0)
  assert.equal(solve(3, [], [[0, 1], [0, 2]]), 1)
})

test('3383 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":2,"initial":[2],"edges":[]}'))
  assert.throws(() => parseInput('{"n":2,"initial":[],"edges":[[0,3]]}'))
})

// Brute oracle: try every set of added starts, smallest first, and check that the closure covers all runes.
function oracle(n, initial, edges) {
  const covers = starts => {
    const seen = new Set(starts)
    let grew = true
    while (grew) {
      grew = false
      for (const [a, b] of edges) if (seen.has(a) && !seen.has(b)) { seen.add(b); grew = true }
    }
    return seen.size === n
  }
  for (let size = 0; size <= n; size += 1) {
    for (let mask = 0; mask < (1 << n); mask += 1) {
      const chosen = []
      for (let v = 0; v < n; v += 1) if (mask & (1 << v)) chosen.push(v)
      if (chosen.length !== size) continue
      if (covers([...new Set([...initial, ...chosen])])) return size
    }
  }
  return null
}

test('3383 random graphs match a subset-search oracle', () => {
  let seed = 3383
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t += 1) {
    const n = 1 + rnd(6)
    const initial = [...new Set(Array.from({ length: rnd(3) }, () => rnd(n)))]
    const edges = Array.from({ length: rnd(9) }, () => [rnd(n), rnd(n)])
    assert.equal(solve(n, initial, edges), oracle(n, initial, edges), JSON.stringify({ n, initial, edges }))
  }
})

test('3383 frames end with the answer and valid lines', () => {
  const run = buildTrace(parseInput('{"n":6,"initial":[0],"edges":[[0,1],[1,2],[3,2],[4,5],[5,4]]}'))
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 19)
})
