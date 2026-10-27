import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (coordinates, k) => buildTrace(parseInput(JSON.stringify({ coordinates, k }))).result

test('3288 examples', () => {
  // The path (2,2) -> (5,3) rises, and (0,0) -> (2,2) falls into the chosen point.
  assert.equal(solve([[3, 1], [2, 2], [4, 1], [0, 0], [5, 3]], 1), 3)
  assert.equal(solve([[2, 1], [7, 0], [5, 6]], 2), 2)
})

test('3288 a point alone is a path of length one', () => {
  assert.equal(solve([[4, 4]], 0), 1)
})

test('3288 rejects duplicate points', () => {
  assert.throws(() => parseInput('{"coordinates":[[1,1],[1,1]],"k":0}'))
})

// Independent oracle: enumerate every subset of points that contains k, keep the ones that form a
// strictly increasing chain in both coordinates, and take the largest.
function oracle(coordinates, k) {
  const n = coordinates.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    if (!((mask >> k) & 1)) continue
    const chosen = coordinates.filter((_, i) => (mask >> i) & 1).sort((a, b) => a[0] - b[0])
    let ok = true
    for (let i = 1; i < chosen.length; i++) {
      if (!(chosen[i][0] > chosen[i - 1][0] && chosen[i][1] > chosen[i - 1][1])) {
        ok = false
        break
      }
    }
    if (ok) best = Math.max(best, chosen.length)
  }
  return best
}

test('3288 seeded random point sets match a subset enumeration', () => {
  let seed = 3288
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(8)
    const coordinates = []
    while (coordinates.length < count) {
      const p = [rnd(6), rnd(6)]
      if (!coordinates.some(q => q[0] === p[0] && q[1] === p[1])) coordinates.push(p)
    }
    const k = rnd(count)
    assert.equal(solve(coordinates, k), oracle(coordinates, k), JSON.stringify({ coordinates, k }))
  }
})
