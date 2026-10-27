import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = date => buildTrace(parseInput(JSON.stringify({ date }))).result

test('3280 official-style examples', () => {
  assert.equal(solve('2080-02-29'), '100000100000-10-11101')
  assert.equal(solve('1900-01-01'), '11101101100-1-1')
})

test('3280 accepts leap day in a century leap year and rejects impossible dates', () => {
  assert.equal(solve('2000-02-29'), '11111010000-10-11101')
  assert.throws(() => parseInput(JSON.stringify({ date: '2023-02-29' })))
  assert.throws(() => parseInput(JSON.stringify({ date: '1899-12-31' })))
  assert.throws(() => parseInput(JSON.stringify({ date: '2023-1-01' })))
})

const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const monthLength = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]

// Independent oracle: write each field with a leading power of two, then subtract powers of two
// from largest to smallest; no toString(2) call is involved.
function oracle(date) {
  const [y, m, d] = date.split('-').map(Number)
  const toBits = n => {
    let power = 1
    while (power * 2 <= n) power *= 2
    let out = ''
    let rest = n
    for (let p = power; p >= 1; p /= 2) {
      if (rest >= p) { out += '1'; rest -= p } else if (out) out += '0'
    }
    return out || '0'
  }
  return `${toBits(y)}-${toBits(m)}-${toBits(d)}`
}

test('3280 random valid dates match the oracle', () => {
  let seed = 3280
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const y = 1900 + rnd(201)
    const m = 1 + rnd(12)
    const d = 1 + rnd(monthLength(y, m))
    const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    assert.equal(solve(date), oracle(date), date)
  }
})
