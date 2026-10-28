import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, roads) => buildTrace({ n, roads }).result

test('2285 official examples', () => {
  assert.equal(solve(5, [[0, 1], [1, 2], [2, 3], [0, 2], [1, 3], [2, 4]]), 43)
  assert.equal(solve(5, [[0, 3], [2, 4], [1, 3]]), 20)
})

test('2285 a single road gets the two largest values', () => {
  assert.equal(solve(3, [[0, 2]]), 5)
})

test('2285 rejects a duplicate road', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 3, roads: [[0, 1], [1, 0]] })))
})

// Independent oracle: try every assignment of the values 1 to n to the cities.
function oracle(n, roads) {
  let best = 0
  const used = new Array(n).fill(false)
  const value = new Array(n).fill(0)
  const rec = city => {
    if (city === n) {
      best = Math.max(best, roads.reduce((sum, [a, b]) => sum + value[a] + value[b], 0))
      return
    }
    for (let v = 1; v <= n; v++) {
      if (used[v - 1]) continue
      used[v - 1] = true
      value[city] = v
      rec(city + 1)
      used[v - 1] = false
    }
  }
  rec(0)
  return best
}

test('2285 random graphs match a permutation oracle', () => {
  let seed = 2285
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const all = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) all.push([a, b])
    const roads = all.filter(() => rnd(2) === 0)
    if (roads.length === 0) roads.push(all[0])
    assert.equal(solve(n, roads), oracle(n, roads), JSON.stringify({ n, roads }))
  }
})
