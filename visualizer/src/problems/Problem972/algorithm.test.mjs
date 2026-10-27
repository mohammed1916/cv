import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t) => buildTrace({ s, t }).result

test('972 official examples', () => {
  assert.equal(solve('0.(52)', '0.5(25)'), true)
  assert.equal(solve('0.1666(6)', '0.166(66)'), true)
  assert.equal(solve('0.9(9)', '1.'), true)
  assert.equal(solve('0.(6)', '0.(9)'), false)
})

test('972 rejects malformed numbers', () => {
  assert.throws(() => parseInput('{"s":"0.(","t":"1"}'))
  assert.throws(() => parseInput('{"s":"(3)","t":"1"}'))
})

// Independent oracle: write each rational as a repeating decimal by long division, then compare
// the original fractions. The solver never sees the fractions, only the decimal text.
function toRepeating(p, q) {
  const whole = p / q
  let r = p % q
  if (r === 0n) return `${whole}.`
  const digits = []
  const seen = new Map()
  for (;;) {
    if (r === 0n) return `${whole}.${digits.join('')}`
    if (seen.has(r)) break
    seen.set(r, digits.length)
    r *= 10n
    digits.push(String(r / q))
    r %= q
  }
  const start = seen.get(r)
  return `${whole}.${digits.slice(0, start).join('')}(${digits.slice(start).join('')})`
}

test('972 random rationals in two representations compare by value', () => {
  let seed = 83
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const p1 = BigInt(rnd(500)), q1 = BigInt(1 + rnd(60))
    // Same value with a scaled numerator and denominator half the time, otherwise an independent fraction.
    const k = BigInt(1 + rnd(4))
    const same = rnd(2) === 0
    const p2 = same ? p1 * k : BigInt(rnd(500)), q2 = same ? q1 * k : BigInt(1 + rnd(60))
    const expected = p1 * q2 === p2 * q1
    assert.equal(solve(toRepeating(p1, q1), toRepeating(p2, q2)), expected, `${p1}/${q1} vs ${p2}/${q2}`)
  }
})
