import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (bulbs, k) => buildTrace({ bulbs, k }).result

test('683 official examples', () => {
  assert.equal(solve([1, 3, 2], 1), 2)
  assert.equal(solve([1, 2, 3], 1), -1)
})

test('683 rejects a repeated position', () => {
  assert.throws(() => parseInput('{"bulbs":[1,1],"k":0}'))
})

// Independent oracle: after each day, test every pair of lit bulbs directly.
function oracle(bulbs, k) {
  const n = bulbs.length
  const on = Array(n + 1).fill(false)
  for (let day = 1; day <= n; day++) {
    on[bulbs[day - 1]] = true
    for (let a = 1; a <= n; a++) {
      for (let b = a + k + 1; b <= n; b++) {
        if (!on[a] || !on[b]) continue
        let dark = true
        for (let p = a + 1; p < b; p++) if (on[p]) dark = false
        if (dark && b - a - 1 === k) return day
      }
    }
  }
  return -1
}

test('683 random permutations match a pairwise oracle', () => {
  let seed = 13
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const bulbs = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [bulbs[i], bulbs[j]] = [bulbs[j], bulbs[i]] }
    const k = rnd(n)
    assert.equal(solve(bulbs, k), oracle(bulbs, k), JSON.stringify({ bulbs, k }))
  }
})
