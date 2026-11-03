import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = time => buildTrace({ time }).result

test('1010 complementary remainders pair across the list', () => {
  assert.equal(solve([30, 90, 150, 210]), 6)
  assert.equal(solve([60, 120, 240, 300]), 6)
})

test('1010 a single song never pairs with itself', () => {
  assert.equal(solve([180]), 0)
  assert.equal(solve([47, 13]), 1)
})

test('1010 rejects bad lists', () => {
  assert.throws(() => parseInput('{"time":[]}'), /time is a list/)
  assert.throws(() => parseInput('{"time":[501]}'), /time is a list/)
})

// Independent oracle: check every pair i < j directly.
function oracle(time) {
  let count = 0
  for (let i = 0; i < time.length; i++) {
    for (let j = i + 1; j < time.length; j++) {
      if ((time[i] + time[j]) % 60 === 0) count++
    }
  }
  return count
}

test('1010 random lists match a pairwise oracle', () => {
  let seed = 1010
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(24)
    const time = Array.from({ length: len }, () => 1 + rnd(500))
    const input = JSON.stringify({ time })
    parseInput(input)
    assert.equal(solve(time), oracle(time), input)
  }
})
