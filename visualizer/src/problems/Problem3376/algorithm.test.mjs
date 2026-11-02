import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (strength, x) => buildTrace({ strength, x }).result

test('3376 worked examples', () => {
  assert.equal(solve([3, 4, 1], 1), 4)
  assert.equal(solve([1, 1, 1], 1), 3)
})

test('3376 edge cases', () => {
  assert.equal(solve([7], 3), 7)
  assert.equal(solve([1, 50], 10), 6)
  assert.equal(solve([5, 5], 1), 5 + 3)
})

test('3376 rejects bad input', () => {
  assert.throws(() => parseInput('{"strength":[],"x":1}'))
  assert.throws(() => parseInput('{"strength":[1,2],"x":0}'))
})

// Oracle: try every permutation of the locks and simulate the minute-by-minute process directly.
function oracle(strength, x) {
  let best = Infinity
  const used = Array(strength.length).fill(false)
  const go = (done, energyMinutes, factor) => {
    if (done === strength.length) { best = Math.min(best, energyMinutes); return }
    for (let i = 0; i < strength.length; i++) {
      if (used[i]) continue
      used[i] = true
      let energy = 0, minutes = 0
      while (energy < strength[i]) { energy += factor; minutes++ }
      go(done + 1, energyMinutes + minutes, factor + x)
      used[i] = false
    }
  }
  go(0, 0, 1)
  return best
}

test('3376 random small inputs match a permutation oracle', () => {
  let seed = 3376
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const strength = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(20))
    const x = 1 + rnd(4)
    assert.equal(solve(strength, x), oracle(strength, x), JSON.stringify({ strength, x }))
  }
})
