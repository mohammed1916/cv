import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace({ num }).result

test('3765 official examples', () => {
  assert.equal(solve(23), true)
  assert.equal(solve(39), false)
  assert.equal(solve(7), true)
})

test('3765 edge cases: a single 1 is not prime, and a composite suffix fails', () => {
  assert.equal(solve(1), false)
  assert.equal(solve(4), false)
  assert.equal(solve(1000000000), false)
})

test('3765 rejects a value outside 1 to 10^9', () => {
  assert.throws(() => parseInput('{"num":0}'))
  assert.throws(() => parseInput('{"num":1000000001}'))
})

// Independent oracle: take prefixes and suffixes arithmetically (division and remainder), then test primality by trial division up to the value.
function oracle(num) {
  const isP = x => { if (x < 2) return false; for (let d = 2; d < x; d++) if (x % d === 0) return false; return true }
  const digits = String(num).length
  for (let k = 1; k <= digits; k++) {
    const prefix = Math.floor(num / 10 ** (digits - k))
    const suffix = num % 10 ** k
    if (!isP(prefix) || !isP(suffix)) return false
  }
  return true
}

test('3765 random values match an arithmetic oracle', () => {
  let seed = 3765
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const num = rnd(100000) + 1
    assert.equal(solve(num), oracle(num), String(num))
  }
})
