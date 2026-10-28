import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2930 official examples', () => {
  // Length 4: the only multiset that works is {l, e, e, t}, which has 4!/2! = 12 orderings.
  assert.equal(solve(4), 12)
  assert.equal(solve(10), 83943898)
})

test('2930 lengths below four cannot contain leet', () => {
  assert.equal(solve(3), 0)
})

test('2930 rejects a non-integer length', () => {
  assert.throws(() => parseInput('4.5'))
  assert.throws(() => parseInput('0'))
})

// Independent oracle: inclusion-exclusion over the three failed requirements (no l, at most one e, no t).
function oracle(n) {
  const binom = (a, b) => {
    let r = 1n
    for (let i = 0; i < b; i++) r = (r * BigInt(a - i)) / BigInt(i + 1)
    return r
  }
  let sum = 0n
  for (let mask = 0; mask < 8; mask++) {
    const noL = (mask & 1) !== 0
    const fewE = (mask & 2) !== 0
    const noT = (mask & 4) !== 0
    let count
    if (fewE) {
      const others = BigInt(25 - (noL ? 1 : 0) - (noT ? 1 : 0))
      count = 0n
      for (let k = 0; k <= 1 && k <= n; k++) count += binom(n, k) * others ** BigInt(n - k)
    } else {
      count = BigInt(26 - (noL ? 1 : 0) - (noT ? 1 : 0)) ** BigInt(n)
    }
    const bits = (noL ? 1 : 0) + (fewE ? 1 : 0) + (noT ? 1 : 0)
    sum += bits % 2 === 1 ? -count : count
  }
  const M = 1000000007n
  return Number(((sum % M) + M) % M)
}

test('2930 lengths 1 to 40 match an inclusion-exclusion oracle', () => {
  for (let n = 1; n <= 40; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
