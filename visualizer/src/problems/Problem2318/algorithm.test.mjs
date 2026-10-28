import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('2318 official examples', () => {
  assert.equal(solve(1), 6)
  assert.equal(solve(2), 22)
  assert.equal(solve(4), 184)
})

test('2318 rejects a roll count of zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: enumerate all 6^n sequences and check every pair of rolls directly.
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
function oracle(n) {
  let total = 0
  const seq = []
  const extend = pos => {
    if (pos === n) {
      let valid = true
      for (let i = 0; i < n && valid; i++) {
        for (let j = i + 1; j < n && valid; j++) {
          if (seq[i] === seq[j] && j - i <= 2) valid = false
        }
        if (i + 1 < n && gcd(seq[i], seq[i + 1]) !== 1) valid = false
      }
      if (valid) total++
      return
    }
    for (let v = 1; v <= 6; v++) {
      seq.push(v)
      extend(pos + 1)
      seq.pop()
    }
  }
  extend(0)
  return total % MOD
}

test('2318 small n match a full enumeration', () => {
  for (let n = 1; n <= 5; n++) assert.equal(solve(n), oracle(n), `n = ${n}`)
})

test('2318 seeded random lengths match a full enumeration', () => {
  let seed = 2318
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(5)
    assert.equal(solve(n), oracle(n), `n = ${n}`)
  }
})
