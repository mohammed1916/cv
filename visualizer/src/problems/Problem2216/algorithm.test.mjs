import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2216 worked examples', () => {
  assert.equal(solve([1, 1, 2, 3, 5]), 1)
  assert.equal(solve([1, 1, 2, 2, 3, 3]), 2)
  assert.equal(solve([1, 2, 3]), 1)
  assert.equal(solve([4, 4, 4, 4]), 4)
})

test('2216 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[6]'))
  assert.throws(() => parseInput('[1.5]'))
})

// Oracle: try every subsequence (small arrays) and keep the longest one that is beautiful.
function beautiful(arr) {
  if (arr.length % 2) return false
  for (let i = 0; i < arr.length; i += 2) if (arr[i] === arr[i + 1]) return false
  return true
}

function oracle(nums) {
  let best = 0
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    const sub = nums.filter((_, i) => (mask >> i) & 1)
    if (beautiful(sub)) best = Math.max(best, sub.length)
  }
  return nums.length - best
}

test('2216 random arrays match a subsequence oracle', () => {
  let seed = 2216
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(3))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2216 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[1,1,2,3,5]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
