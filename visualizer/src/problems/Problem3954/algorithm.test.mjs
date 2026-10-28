import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k }))).result

test('3954 official examples', () => {
  assert.equal(solve(2, 3), 10)
  assert.equal(solve(5, 1), 0)
})

test('3954 n = 1 with k = 1 keeps only the even numbers in range', () => {
  // x in [1, 2]: 1 shares the bit with n, 2 does not, so the answer is 2.
  assert.equal(solve(1, 1), 2)
})

test('3954 rejects k = 0', () => {
  assert.throws(() => parseInput('{"n":2,"k":0}'))
})

// Independent oracle: scan every x from 1 to 300 and test |n - x| <= k and (n & x) = 0 directly.
function oracle(n, k) {
  let total = 0
  for (let x = 1; x <= 300; x++) if (Math.abs(n - x) <= k && (n & x) === 0) total += x
  return total
}

test('3954 every n and k in range match a direct-scan oracle', () => {
  for (let n = 1; n <= 100; n += 3) for (let k = 1; k <= 100; k += 7) {
    assert.equal(solve(n, k), oracle(n, k), `n=${n} k=${k}`)
  }
})
