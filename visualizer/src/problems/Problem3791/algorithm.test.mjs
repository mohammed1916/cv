import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (low, high) => buildTrace({ low, high }).result

test('3791 official examples', () => {
  assert.equal(solve(1, 100), 9)
  assert.equal(solve(120, 129), 1)
  assert.equal(solve(1234, 1234), 0)
})

test('3791 edge cases: a single digit is never balanced, and 11 is', () => {
  assert.equal(solve(1, 9), 0)
  assert.equal(solve(11, 11), 1)
})

test('3791 rejects a reversed range', () => {
  assert.throws(() => parseInput('{"low":10,"high":5}'))
})

// Independent oracle: digit dynamic programming over the difference between odd-position and even-position digit sums,
// with a tight flag for the upper bound. It never checks numbers one at a time.
function countUpTo(x) {
  if (x < 10) return 0
  const digits = []
  let y = x
  while (y > 0) { digits.unshift(y % 10); y = Math.floor(y / 10) }
  const n = digits.length
  const ways = (length, bound) => {
    let states = new Map([[`0|${bound ? 1 : 0}`, 1]])
    for (let pos = 0; pos < length; pos++) {
      const sign = pos % 2 === 0 ? 1 : -1
      const next = new Map()
      for (const [key, cnt] of states) {
        const [diffText, tightText] = key.split('|')
        const diff = Number(diffText)
        const tight = tightText === '1'
        const limit = tight ? bound[pos] : 9
        for (let d = pos === 0 ? 1 : 0; d <= limit; d++) {
          const nk = `${diff + sign * d}|${tight && d === limit ? 1 : 0}`
          next.set(nk, (next.get(nk) || 0) + cnt)
        }
      }
      states = next
    }
    let total = 0
    for (const [key, cnt] of states) if (Number(key.split('|')[0]) === 0) total += cnt
    return total
  }
  let total = 0
  for (let length = 2; length < n; length++) total += ways(length, null)
  return total + ways(n, digits)
}

test('3791 random ranges match a digit-DP oracle', () => {
  let seed = 3791
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const low = rnd(3000) + 1
    const high = low + rnd(300)
    assert.equal(solve(low, high), countUpTo(high) - countUpTo(low - 1), `${low}..${high}`)
  }
})
