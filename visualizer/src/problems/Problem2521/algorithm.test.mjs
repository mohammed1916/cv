import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('2521 statement examples', () => {
  assert.equal(solve([2, 4, 3, 7, 10, 6]), 4)
  assert.equal(solve([21, 4, 7]), 3)
})

test('2521 rejects a value of one', () => {
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: multiply everything exactly with BigInt and test each small prime against the product.
function oracle(arr) {
  const primes = []
  for (let p = 2; p <= 1000; p++) if (primes.every(q => p % q !== 0)) primes.push(p)
  let product = 1n
  for (const v of arr) product *= BigInt(v)
  return primes.filter(p => product % BigInt(p) === 0n).length
}

test('2521 random cases match a product-divisibility oracle', () => {
  let seed = 2521
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(6) }, () => 2 + rnd(999))
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
