import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3232 official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 14]), true)
  assert.equal(solve([5, 5, 5, 25]), true)
})

test('3232 equal category sums are a loss for Alice', () => {
  assert.equal(solve([4, 6, 10]), false)
})

test('3232 rejects a value of 100', () => {
  assert.throws(() => parseInput('{"nums":[100]}'))
})

// Independent oracle: Alice picks one category; Bob gets the other. Alice wins if her sum is strictly larger.
function oracle(nums) {
  const single = nums.filter(v => v < 10)
  const double = nums.filter(v => v >= 10)
  const sum = list => list.reduce((a, b) => a + b, 0)
  const picks = [[single, double], [double, single]]
  return picks.some(([alice, bob]) => sum(alice) > sum(bob))
}

test('3232 random arrays match the two-category oracle', () => {
  let seed = 3232
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(99))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
