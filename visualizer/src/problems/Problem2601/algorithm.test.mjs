import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2601 official examples', () => {
  assert.equal(solve([4, 9, 6, 10]), true)
  assert.equal(solve([6, 8, 11, 12]), true)
  assert.equal(solve([5, 8, 3]), false)
})

test('2601 a value that cannot drop below its predecessor fails', () => {
  assert.equal(solve([2, 2]), false)
  assert.equal(solve([1]), true)
})

test('2601 rejects values outside 1 to 50', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[51]}'))
})

// Independent oracle: try every prime (or no subtraction) at every index, with no greedy step.
function oracle(nums) {
  const primes = []
  for (let x = 2; x < 60; x++) if (Array.from({ length: x - 2 }, (_, k) => k + 2).every(d => x % d !== 0)) primes.push(x)
  const choose = (i, prev) => {
    if (i === nums.length) return true
    const options = [nums[i], ...primes.filter(p => p < nums[i]).map(p => nums[i] - p)]
    return options.some(v => v > prev && choose(i + 1, v))
  }
  return choose(0, 0)
}

test('2601 random arrays match an exhaustive oracle', () => {
  let seed = 2601
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
