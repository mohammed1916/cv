import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = hours => buildTrace(parseInput(JSON.stringify(hours))).result

test('3185 official examples', () => {
  assert.equal(solve([12, 12, 30, 24, 24]), 2)
  assert.equal(solve([72, 48, 24, 3]), 3)
})

test('3185 pairs with remainder zero and pairs that sum to 24 both count', () => {
  assert.equal(solve([24, 48, 72]), 3)
  assert.equal(solve([1, 23]), 1)
  assert.equal(solve([1, 2]), 0)
})

test('3185 rejects hours outside 1 to 1000 and bad lengths', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1001]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"a":1}'))
})

// Independent oracle: compare every pair of positions directly.
function oracle(hours) {
  let count = 0
  for (let i = 0; i < hours.length; i++) {
    for (let j = i + 1; j < hours.length; j++) {
      if ((hours[i] + hours[j]) % 24 === 0) count++
    }
  }
  return count
}

test('3185 random lists match a pair-by-pair oracle', () => {
  let seed = 3185
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const hours = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(90))
    assert.equal(solve(hours), oracle(hours), JSON.stringify(hours))
  }
})
