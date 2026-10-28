import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result

test('3677 official examples', () => {
  assert.equal(solve(9), 6)
  assert.equal(solve(0), 1)
})

test('3677 small bounds', () => {
  assert.equal(solve(1), 2)
  assert.equal(solve(3), 3)
  assert.equal(solve(8), 5)
})

test('3677 rejects negative and out-of-range values', () => {
  assert.throws(() => parseInput('-1'))
  assert.throws(() => parseInput('1.5'))
  assert.throws(() => parseInput('1000000000000001'))
})

// Independent oracle: test every integer from 0 to n as a binary string.
const isPalBinary = k => { const s = k.toString(2); return s === [...s].reverse().join('') }
function oracle(n) {
  let count = 0
  for (let k = 0; k <= n; k++) if (isPalBinary(k)) count++
  return count
}

test('3677 random bounds match a brute-force oracle', () => {
  let seed = 3677
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(4000)
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})
