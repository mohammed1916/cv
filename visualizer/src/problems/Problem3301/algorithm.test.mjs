import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = limits => buildTrace(limits).result

test('3301 official examples', () => {
  assert.equal(solve([2, 3, 4, 3]), 10)
  assert.equal(solve([15, 10]), 25)
  assert.equal(solve([2, 2, 1]), -1)
})

test('3301 a limit above 15 is rejected', () => {
  assert.throws(() => parseInput('[16]'))
})

// Independent oracle: try every height assignment with each height between 1 and its limit.
function oracle(limits) {
  const n = limits.length
  let best = -1
  const heights = Array(n).fill(0)
  const go = i => {
    if (i === n) {
      if (new Set(heights).size === n) best = Math.max(best, heights.reduce((s, v) => s + v, 0))
      return
    }
    for (let h = 1; h <= limits[i]; h++) {
      heights[i] = h
      go(i + 1)
    }
  }
  go(0)
  return best
}

test('3301 random limits match the assignment oracle', () => {
  let seed = 3301
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const limits = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(6))
    assert.equal(solve(limits), oracle(limits), JSON.stringify(limits))
  }
})
