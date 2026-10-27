import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('3115 statement examples', () => {
  assert.equal(solve([4, 2, 9, 5, 3]), 3)
  assert.equal(solve([4, 8, 2, 8]), 0)
})

test('3115 rejects an array with no prime', () => {
  assert.throws(() => parseInput('[4,8,9]'))
})

// Independent oracle: test every pair of positions and keep the widest pair of primes.
function oracle(arr) {
  const isP = x => { if (x < 2) return false; for (let d = 2; d < x; d++) if (x % d === 0) return false; return true }
  let best = 0
  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      if (isP(arr[i]) && isP(arr[j])) best = Math.max(best, j - i)
    }
  }
  return best
}

test('3115 random cases match a pairwise oracle', () => {
  let seed = 3115
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(40))
    let ok = true
    try { parseInput(JSON.stringify(arr)) } catch { ok = false }
    if (!ok) continue
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
