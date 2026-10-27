import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2856 official examples', () => {
  assert.equal(solve([1, 3, 4, 9]), 0)
  assert.equal(solve([2, 3, 6, 9]), 0)
  assert.equal(solve([1, 1, 1, 1, 2, 3]), 2)
})

test('2856 a dominant value leaves its excess', () => {
  assert.equal(solve([5, 5, 5, 5, 6]), 3)
  assert.equal(solve([7]), 1)
})

test('2856 rejects an unsorted array', () => {
  assert.throws(() => parseInput('{"nums":[2,1]}'))
})

// Independent oracle: exhaustive search over which pairs remain, memoised on the set of remaining indices.
function oracle(nums) {
  const memo = new Map()
  const best = mask => {
    if (memo.has(mask)) return memo.get(mask)
    let result = null
    for (let i = 0; i < nums.length && result === null; i++) {
      if (!(mask & (1 << i))) continue
      for (let j = i + 1; j < nums.length; j++) {
        if (!(mask & (1 << j)) || !(nums[i] < nums[j])) continue
        result = best(mask & ~(1 << i) & ~(1 << j))
        break
      }
    }
    let answer = result
    if (answer === null) {
      answer = 0
      for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) answer++
    } else {
      // Remove at least one pair; the exhaustive minimum over all pairs is taken below.
      answer = Infinity
      for (let i = 0; i < nums.length; i++) {
        if (!(mask & (1 << i))) continue
        for (let j = i + 1; j < nums.length; j++) {
          if (!(mask & (1 << j)) || !(nums[i] < nums[j])) continue
          answer = Math.min(answer, best(mask & ~(1 << i) & ~(1 << j)))
        }
      }
    }
    memo.set(mask, answer)
    return answer
  }
  return best((1 << nums.length) - 1)
}

test('2856 small random sorted arrays match an exhaustive oracle', () => {
  let seed = 2856
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(4)).sort((a, b) => a - b)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
