import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r, k) => buildTrace({ l, r, k }).result

// Independent oracle: enumerate every k-digit string over the digits l..r and add up the numbers they spell.
function oracle(l, r, k) {
  const digits = []
  for (let d = l; d <= r; d++) digits.push(d)
  let total = 0n
  const walk = (pos, value) => {
    if (pos === k) { total += BigInt(value); return }
    for (const d of digits) walk(pos + 1, value * 10 + d)
  }
  walk(0, 0)
  return Number(total % 1000000007n)
}

test('3855 official examples', () => {
  assert.equal(solve(1, 2, 2), 66)
  assert.equal(solve(0, 1, 3), 444)
  assert.equal(solve(5, 5, 10), 555555520)
})

test('3855 rejects a digit above 9', () => {
  assert.throws(() => parseInput('{"l":1,"r":10,"k":2}'))
})

test('3855 random ranges match the enumeration oracle', () => {
  let seed = 3855
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const l = rnd(10)
    const r = l + rnd(10 - l)
    const k = 1 + rnd(4)
    assert.equal(solve(l, r, k), oracle(l, r, k), JSON.stringify({ l, r, k }))
  }
})
