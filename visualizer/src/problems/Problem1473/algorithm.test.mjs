import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (houses, cost, m, n, target) => buildTrace(parseInput(JSON.stringify({ houses, cost, m, n, target }))).result

test('1473 hand-checked examples', () => {
  // Colours 1,2,2,1,1 give neighbourhoods [1],[2,2],[1,1] and cost 1+1+1+1+5 = 9.
  assert.equal(solve([0, 0, 0, 0, 0], [[1, 10], [10, 1], [10, 1], [1, 10], [5, 1]], 5, 2, 3), 9)
  // House 0 is already colour 1; the other two must also be colour 1, costing 1 + 1.
  assert.equal(solve([1, 0, 0], [[1, 1], [1, 1], [1, 1]], 3, 2, 1), 2)
  // Houses 1, 2, 2 are already painted, giving neighbourhoods [1] and [2,2].
  assert.equal(solve([1, 2, 2], [[1, 1], [1, 1], [1, 1]], 3, 2, 2), 0)
  // Colours 1, 2, 1 form three neighbourhoods, so target 1 is impossible.
  assert.equal(solve([1, 2, 1], [[1, 1], [1, 1], [1, 1]], 3, 2, 1), -1)
})

test('1473 rejects inconsistent sizes', () => {
  assert.throws(() => parseInput('{"houses":[0,0],"cost":[[1,1]],"m":2,"n":2,"target":1}'))
  assert.throws(() => parseInput('{"houses":[0,4],"cost":[[1,1],[1,1]],"m":2,"n":2,"target":1}'))
})

// Independent oracle: try every colouring of the unpainted houses and count neighbourhoods directly.
function oracle(houses, cost, m, n, target) {
  let best = Infinity
  const colour = Array(m).fill(0)
  const walk = i => {
    if (i === m) {
      for (let h = 0; h < m; h++) if (houses[h] !== 0 && houses[h] !== colour[h]) return
      let groups = 0
      for (let h = 0; h < m; h++) if (h === 0 || colour[h] !== colour[h - 1]) groups++
      if (groups !== target) return
      let total = 0
      for (let h = 0; h < m; h++) if (houses[h] === 0) total += cost[h][colour[h] - 1]
      best = Math.min(best, total)
      return
    }
    if (houses[i] !== 0) { colour[i] = houses[i]; walk(i + 1); return }
    for (let c = 1; c <= n; c++) { colour[i] = c; walk(i + 1) }
  }
  walk(0)
  return best === Infinity ? -1 : best
}

test('1473 random cases match the colouring oracle', () => {
  let seed = 1473
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = rnd(6) + 1
    const n = rnd(3) + 1
    const target = rnd(m) + 1
    const houses = Array.from({ length: m }, () => rnd(n + 1))
    const cost = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(20) + 1))
    assert.equal(solve(houses, cost, m, n, target), oracle(houses, cost, m, n, target), JSON.stringify({ houses, cost, m, n, target }))
  }
})
