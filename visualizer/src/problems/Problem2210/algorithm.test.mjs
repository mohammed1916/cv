import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2210 worked examples', () => {
  assert.equal(solve([2, 4, 1, 1, 6, 5]), 3)
  assert.equal(solve([6, 6, 5, 5, 4, 1]), 0)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([3, 1, 1, 3]), 1)
})

test('2210 rejects invalid input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[1,-2,3]'))
  assert.throws(() => parseInput('[1,10,3]'))
})

// Oracle: for each interior position, find the nearest neighbours with a different value on each side.
function oracle(nums) {
  let count = 0
  for (let i = 1; i < nums.length - 1; i++) {
    if (nums[i] === nums[i - 1]) continue
    let l = i - 1; while (l >= 0 && nums[l] === nums[i]) l--
    let r = i + 1; while (r < nums.length && nums[r] === nums[i]) r++
    if (l < 0 || r >= nums.length) continue
    if ((nums[i] > nums[l] && nums[i] > nums[r]) || (nums[i] < nums[l] && nums[i] < nums[r])) count++
  }
  return count
}

test('2210 random arrays match a nearest-different-neighbour oracle', () => {
  let seed = 2210
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2210 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[2,4,1,1,6,5]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
