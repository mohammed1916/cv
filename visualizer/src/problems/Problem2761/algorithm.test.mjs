import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('2761 statement examples', () => {
  assert.deepEqual(solve(10), [[3, 7], [5, 5]])
  assert.deepEqual(solve(2), [])
})

test('2761 rejects n of zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: a prime has exactly two divisors, so count divisors by brute force.
function oracle(n) {
  const divisors = x => { let c = 0; for (let d = 1; d <= x; d++) if (x % d === 0) c++; return c }
  const isP = x => divisors(x) === 2
  const out = []
  for (let x = 1; x <= n; x++) {
    const y = n - x
    if (x <= y && y >= 1 && isP(x) && isP(y)) out.push([x, y])
  }
  return out
}

test('2761 every n from 1 to 200 matches a divisor-count oracle', () => {
  for (let n = 1; n <= 200; n++) assert.deepEqual(solve(n), oracle(n), `n=${n}`)
})
