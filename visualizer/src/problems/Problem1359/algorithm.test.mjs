import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('1359 official examples', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 6)
  assert.equal(solve(3), 90)
})

test('1359 the largest allowed input stays under the modulus', () => {
  assert.equal(solve(8), 729647433)
})

test('1359 rejects out-of-range n', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":9}'))
  assert.throws(() => parseInput('{"n":2.5}'))
})

// Independent oracle: count by a recursion on (pickups left, deliveries still owed).
// Choosing a pickup gives p ways to choose which order; choosing a delivery gives d ways.
function oracle(n) {
  const memo = new Map()
  const f = (p, d) => {
    if (p === 0 && d === 0) return 1
    const key = `${p},${d}`
    if (memo.has(key)) return memo.get(key)
    let total = 0
    if (p > 0) total += p * f(p - 1, d + 1)
    if (d > 0) total += d * f(p, d - 1)
    total %= MOD
    memo.set(key, total)
    return total
  }
  return f(n, 0)
}

test('1359 every n from 1 to 8 matches the recursion oracle', () => {
  for (let n = 1; n <= 8; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
