import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (energy_drink_a, energy_drink_b) => buildTrace(parseInput(JSON.stringify({ energy_drink_a, energy_drink_b }))).result

test('3259 examples', () => {
  // Staying on B gives 3 + 1 + 1 = 5; a switch would lose an hour.
  assert.equal(solve([1, 3, 1], [3, 1, 1]), 5)
  // Start on A (4), lose hour 1, then switch to B at hour 2 for 3.
  assert.equal(solve([4, 1, 1], [1, 1, 3]), 7)
})

test('3259 a single hour takes the better first drink', () => {
  assert.equal(solve([2], [5]), 5)
})

test('3259 rejects drinks with different lengths', () => {
  assert.throws(() => parseInput('{"energy_drink_a":[1,2],"energy_drink_b":[1]}'))
})

// Independent oracle: enumerate every hour plan. Each hour is drink A, drink B, or idle; a switch
// must leave exactly one idle hour between the two drinks, and idle hours appear only at such a switch.
function oracle(A, B) {
  const n = A.length
  let frontier = [[]]
  for (let h = 0; h < n; h++) {
    frontier = frontier.flatMap(p => ['A', 'B', 'I'].map(c => [...p, c]))
  }
  let best = -Infinity
  for (const seq of frontier) {
    if (!validPlan(seq)) continue
    const total = seq.reduce((sum, c, i) => sum + (c === 'A' ? A[i] : c === 'B' ? B[i] : 0), 0)
    best = Math.max(best, total)
  }
  return best
}

function validPlan(seq) {
  if (seq[0] === 'I' || seq[seq.length - 1] === 'I') return false
  for (let i = 0; i + 1 < seq.length; i++) {
    const x = seq[i]
    const y = seq[i + 1]
    if (x === 'I' && y === 'I') return false
    if (x !== 'I' && y !== 'I' && x !== y) return false
  }
  for (let i = 1; i + 1 < seq.length; i++) {
    if (seq[i] === 'I' && seq[i - 1] === seq[i + 1]) return false
  }
  return true
}

test('3259 random inputs match a plan-enumeration oracle', () => {
  let seed = 3259
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(6)
    const A = Array.from({ length: n }, () => 1 + rnd(10))
    const B = Array.from({ length: n }, () => 1 + rnd(10))
    assert.equal(solve(A, B), oracle(A, B), JSON.stringify({ A, B }))
  }
})
