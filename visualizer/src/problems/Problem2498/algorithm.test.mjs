import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = stones => buildTrace({ stones }).result
const PY = python.split('\n')

test('2498 worked examples', () => {
  assert.equal(solve([0, 2, 5, 6, 7]), 5)
  assert.equal(solve([0, 3, 9]), 9)
})

test('2498 two stones', () => {
  assert.equal(solve([0, 4]), 4)
})

test('2498 frames point at real python lines', () => {
  for (const f of buildTrace({ stones: [0, 1, 3, 4] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2498 requires the first stone at zero', () => {
  assert.throws(() => parseInput('{"stones":[1,2]}'))
})

// Oracle: try every split of the middle stones between the outbound and return paths.
// Each stone is visited once; the frog's cost is the largest jump along the round trip.
function oracle(stones) {
  const n = stones.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 2); mask++) {
    const forward = [0]
    const back = []
    for (let i = 1; i < n - 1; i++) (mask >> (i - 1)) & 1 ? forward.push(i) : back.push(i)
    forward.push(n - 1)
    const path = [...forward, ...back.reverse(), 0]
    let worst = 0
    for (let k = 0; k + 1 < path.length; k++) worst = Math.max(worst, Math.abs(stones[path[k + 1]] - stones[path[k]]))
    best = Math.min(best, worst)
  }
  return best
}

test('2498 random inputs match a brute-force oracle', () => {
  let seed = 2498
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const set = new Set([0])
    const size = 2 + rnd(6)
    while (set.size < size) set.add(1 + rnd(40))
    const stones = [...set].sort((a, b) => a - b)
    assert.equal(solve(stones), oracle(stones), JSON.stringify(stones))
  }
})
