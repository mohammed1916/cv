import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (land, water) => buildTrace({ land, water }).result

test('3635 worked examples', () => {
  assert.equal(solve([[2, 8]], [[6, 3]]), 13)
  assert.equal(solve([[2, 15], [30, 5]], [[20, 10], [40, 5]]), 30)
})

test('3635 a later opening sets the start of the second ride', () => {
  assert.equal(solve([[0, 4]], [[10, 1]]), 11)
  assert.equal(solve([[0, 4]], [[1, 1]]), 5)
})

test('3635 water first can be the better order', () => {
  assert.equal(solve([[5, 1]], [[0, 2]]), 6)
})

test('3635 rejects malformed rides', () => {
  assert.throws(() => parseInput('{"land":[],"water":[[0,1]]}'))
  assert.throws(() => parseInput('{"land":[[0,0]],"water":[[0,1]]}'))
  assert.throws(() => parseInput('{"land":[[0]],"water":[[0,1]]}'))
})

// Independent oracle: simulate each full schedule of one land and one water ride.
function oracle(land, water) {
  let best = Infinity
  for (const L of land) {
    for (const W of water) {
      const landFirst = Math.max(L[0] + L[1], W[0]) + W[1]
      const waterFirst = Math.max(W[0] + W[1], L[0]) + L[1]
      best = Math.min(best, landFirst, waterFirst)
    }
  }
  return best
}

test('3635 agrees with the schedule oracle on generated rides', () => {
  let seed = 11
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
  const ride = () => [Math.floor(next() * 50), 1 + Math.floor(next() * 20)]
  for (let trial = 0; trial < 200; trial++) {
    const land = Array.from({ length: 1 + Math.floor(next() * 4) }, ride)
    const water = Array.from({ length: 1 + Math.floor(next() * 4) }, ride)
    assert.equal(solve(land, water), oracle(land, water), JSON.stringify({ land, water }))
  }
})
