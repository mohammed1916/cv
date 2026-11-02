import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (banned, n, maxSum) => buildTrace({ banned, n, maxSum }).result

test('2557 worked examples', () => {
  assert.equal(solve([1, 4, 6], 6, 4), 1)
  assert.equal(solve([4, 3, 5, 7], 7, 18), 3)
  assert.equal(solve([], 3, 5), 2)
  assert.equal(solve([], 10, 1000), 10)
})

test('2557 banned values outside the range are ignored', () => {
  assert.equal(solve([50, 99], 4, 7), 3)
})

test('2557 rejects bad input', () => {
  assert.throws(() => parseInput('{"banned":[1],"n":0,"maxSum":3}'))
  assert.throws(() => parseInput('{"banned":[1],"n":3}'))
})

// Oracle: try every subset of the allowed numbers and keep the largest one under the budget.
function oracle(banned, n, maxSum) {
  const bad = new Set(banned)
  const allowed = []
  for (let x = 1; x <= n; x++) if (!bad.has(x)) allowed.push(x)
  let best = 0
  for (let mask = 0; mask < 1 << allowed.length; mask++) {
    let sum = 0, cnt = 0
    for (let i = 0; i < allowed.length; i++) if ((mask >> i) & 1) { sum += allowed[i]; cnt++ }
    if (sum <= maxSum) best = Math.max(best, cnt)
  }
  return best
}

test('2557 random cases match a subset oracle', () => {
  let seed = 2557
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const banned = Array.from({ length: rnd(5) }, () => 1 + rnd(n + 2))
    const maxSum = 1 + rnd(30)
    assert.equal(solve(banned, n, maxSum), oracle(banned, n, maxSum), JSON.stringify({ banned, n, maxSum }))
  }
})
