import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (weights, days) => buildTrace({ weights, days }).result

test('1011 one day needs the total and one-per-day needs the heaviest', () => {
  assert.equal(solve([9, 4, 7, 2], 1), 22)
  assert.equal(solve([6, 2, 8, 3], 4), 8)
})

test('1011 a single package is its own capacity', () => {
  assert.equal(solve([23], 1), 23)
})

test('1011 rejects impossible day counts', () => {
  assert.throws(() => parseInput('{"weights":[1,2],"days":3}'), /days must be/)
  assert.throws(() => parseInput('{"weights":[],"days":1}'), /weights is a list/)
})

// Independent oracle: try every capacity from the heaviest package upward, with the same greedy check.
function oracle(weights, days) {
  const fits = cap => {
    let needed = 1
    let load = 0
    for (const w of weights) {
      if (load + w > cap) { needed++; load = 0 }
      load += w
    }
    return needed <= days
  }
  let cap = Math.max(...weights)
  while (!fits(cap)) cap++
  return cap
}

test('1011 random inputs match a linear-scan oracle', () => {
  let seed = 1011
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const weights = Array.from({ length: len }, () => 1 + rnd(100))
    const days = 1 + rnd(len)
    const input = JSON.stringify({ weights, days })
    parseInput(input)
    assert.equal(solve(weights, days), oracle(weights, days), input)
  }
})
