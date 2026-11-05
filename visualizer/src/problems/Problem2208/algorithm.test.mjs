import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2208 worked examples', () => {
  assert.equal(solve([5, 19, 8, 1]), 3)
  assert.equal(solve([3, 8, 20]), 3)
  assert.equal(solve([1]), 1)
  assert.equal(solve([4, 4]), 2)
})

test('2208 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[21]'))
})

// Oracle: exhaustive search over all sequences of halvings up to a small depth, returning the fewest that suffice.
function oracle(nums) {
  const total = nums.reduce((a, b) => a + b, 0)
  const best = (arr, removed, depth) => {
    if (removed * 2 >= total) return depth
    if (depth > 12) return Infinity
    let res = Infinity
    for (let i = 0; i < arr.length; i++) {
      const next = arr.slice(); const half = next[i] / 2; next[i] = half
      res = Math.min(res, best(next, removed + half, depth + 1))
    }
    return res
  }
  return best(nums, 0, 0)
}

test('2208 small arrays match an exhaustive search', () => {
  let seed = 2208
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 80; t++) {
    const nums = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2208 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[5,19,8,1]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
