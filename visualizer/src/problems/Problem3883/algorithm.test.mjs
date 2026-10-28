import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = sums => buildTrace({ digit_sum: sums }).result

// Independent oracle, for one or two positions: list the values with each digit sum by digit extraction,
// then count the pairs a <= b directly.
const values = s => {
  const out = []
  for (let v = 0; v <= 5000; v++) {
    let rest = v
    let total = 0
    while (rest > 0) { total += rest % 10; rest = Math.floor(rest / 10) }
    if (total === s) out.push(v)
  }
  return out
}
function oracle(sums) {
  if (sums.length === 1) return values(sums[0]).length
  const first = values(sums[0])
  const second = values(sums[1])
  let count = 0
  for (const a of first) for (const b of second) if (a <= b) count++
  return count % 1000000007
}

test('3883 official examples', () => {
  assert.equal(solve([25, 1]), 6)
  assert.equal(solve([1]), 4)
  assert.equal(solve([2, 49, 23]), 0)
})

test('3883 rejects a digit sum above 50', () => {
  assert.throws(() => parseInput('{"digit_sum":[51]}'))
})

test('3883 one or two positions match the pair-counting oracle', () => {
  let seed = 3883
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const sums = Array.from({ length: 1 + rnd(2) }, () => rnd(12))
    assert.equal(solve(sums), oracle(sums), JSON.stringify(sums))
  }
})
