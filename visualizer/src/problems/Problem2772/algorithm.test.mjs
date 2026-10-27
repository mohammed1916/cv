import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2772 statement examples', () => {
  assert.equal(solve({ nums: [2, 2, 3, 1, 1, 0], k: 3 }), true)
  assert.equal(solve({ nums: [1, 3, 1, 1], k: 2 }), false)
})

test('2772 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":2}'))
})

// Independent oracle: try every way to choose how many operations start at each position.
function oracle({ nums, k }) {
  const n = nums.length
  const starts = n - k + 1
  const limit = Math.max(...nums)
  const choose = (j, counts) => {
    if (j === starts) {
      for (let i = 0; i < n; i++) {
        let covered = 0
        for (let s = Math.max(0, i - k + 1); s <= Math.min(i, starts - 1); s++) covered += counts[s]
        if (covered !== nums[i]) return false
      }
      return true
    }
    for (let x = 0; x <= limit; x++) {
      counts[j] = x
      if (choose(j + 1, counts)) return true
    }
    return false
  }
  return choose(0, Array(starts).fill(0))
}

test('2772 random cases match an exhaustive oracle', () => {
  let seed = 2772
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(4))
    const input = { nums, k: 1 + rnd(n) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
