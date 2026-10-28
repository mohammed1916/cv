import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4067 official examples', () => {
  assert.equal(solve([2, 3, 5, 3, 2, 1]), 3)
  assert.equal(solve([3, 4, 5, 6]), 4)
})

test('4067 two equal values conflict with a later sum but a longer window can avoid it', () => {
  // In [1, 1, 2] the indices 0, 1, 2 form 1 + 1 = 2, so only length 2 is valid.
  assert.equal(solve([1, 1, 2]), 2)
  // [1, 2, 2] avoids it, since there is only one 1.
  assert.equal(solve([1, 1, 2, 2]), 3)
})

test('4067 rejects a value of 0', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: check every subarray by testing all ordered triples of distinct indices.
function valid(sub) {
  const n = sub.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (i !== j && j !== k && i !== k && sub[i] + sub[j] === sub[k]) return false
      }
    }
  }
  return true
}

function oracle(nums) {
  let best = 0
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      if (valid(nums.slice(l, r + 1))) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('4067 random arrays match an all-triples oracle', () => {
  let seed = 4067
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
