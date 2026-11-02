import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3024 worked examples', () => {
  assert.equal(solve([3, 3, 3]), 'equilateral')
  assert.equal(solve([3, 4, 5]), 'scalene')
  assert.equal(solve([3, 4, 8]), 'none')
})

test('3024 edge cases', () => {
  assert.equal(solve([1, 1, 1]), 'equilateral')
  assert.equal(solve([2, 2, 3]), 'isosceles')
  assert.equal(solve([5, 2, 2]), 'none')
  assert.equal(solve([7, 3, 3]), 'none')
  assert.equal(solve([100, 100, 1]), 'isosceles')
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[0,1,1]'))
})

// Independent oracle: a triangle needs every pair of sides to be longer than the third side.
function oracle(a, b, c) {
  if (!(a + b > c && a + c > b && b + c > a)) return 'none'
  if (a === b && b === c) return 'equilateral'
  if (a === b || b === c || a === c) return 'isosceles'
  return 'scalene'
}

test('3024 all small triples match the oracle', () => {
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) {
    assert.equal(solve([a, b, c]), oracle(a, b, c), JSON.stringify([a, b, c]))
  }
})
