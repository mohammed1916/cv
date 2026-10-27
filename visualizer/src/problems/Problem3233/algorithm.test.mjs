import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r) => buildTrace({ l, r }).result

test('3233 worked examples', () => {
  // Special numbers in 1 to 10 are 4 and 9.
  assert.equal(solve(1, 10), 8)
  assert.equal(solve(4, 4), 0)
  assert.equal(solve(5, 8), 4)
  assert.equal(solve(1, 1), 1)
})

test('3233 a prime square counts only when it is inside the range', () => {
  assert.equal(solve(9, 9), 0)
  assert.equal(solve(10, 15), 6)
})

test('3233 rejects an inverted or out-of-range interval', () => {
  assert.throws(() => parseInput('{"l":5,"r":4}'))
  assert.throws(() => parseInput('{"l":1,"r":201}'))
})

// Independent oracle: count the divisors of every number in the range directly.
function oracle(l, r) {
  let notSpecial = 0
  for (let x = l; x <= r; x++) {
    let divisors = 0
    for (let d = 1; d <= x; d++) if (x % d === 0) divisors++
    if (divisors !== 3) notSpecial++
  }
  return notSpecial
}

test('3233 every interval up to 60 matches a divisor-count oracle', () => {
  for (let l = 1; l <= 60; l++) {
    for (let r = l; r <= 60; r++) assert.equal(solve(l, r), oracle(l, r), `${l} ${r}`)
  }
})
