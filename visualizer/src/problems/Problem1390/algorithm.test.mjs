import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('1390 official examples', () => {
  assert.equal(solve([21, 4, 7]), 32)
  assert.equal(solve([21, 21]), 64)
  assert.equal(solve([1, 2, 3, 5]), 0)
})

test('1390 edge cases and validation', () => {
  assert.equal(solve([6]), 12)
  assert.equal(solve([4]), 0)
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: count the divisors of each number by checking every value from 1 to it.
function oracle(nums) {
  let total = 0
  for (const value of nums) {
    const divs = []
    for (let d = 1; d <= value; d++) if (value % d === 0) divs.push(d)
    if (divs.length === 4) total += divs.reduce((a, b) => a + b, 0)
  }
  return total
}

test('1390 seeded random lists match an exhaustive oracle', () => {
  let seed = 1390
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(500))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
