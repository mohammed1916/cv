import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3432 official examples', () => {
  assert.equal(solve([10, 10, 3, 7, 6]), 4)
  assert.equal(solve([1, 2, 2]), 0)
})

test('3432 two equal elements give one even split', () => {
  assert.equal(solve([2, 2]), 1)
})

test('3432 rejects a single element', () => {
  assert.throws(() => parseInput('{"nums":[5]}'))
})

// Independent oracle: sum both sides from slices for every split.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length - 1; i++) {
    const left = nums.slice(0, i + 1).reduce((a, b) => a + b, 0)
    const right = nums.slice(i + 1).reduce((a, b) => a + b, 0)
    if (Math.abs(left - right) % 2 === 0) count++
  }
  return count
}

test('3432 seeded random arrays match a slice-based oracle', () => {
  let seed = 3432
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(11) }, () => 1 + rnd(10))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
