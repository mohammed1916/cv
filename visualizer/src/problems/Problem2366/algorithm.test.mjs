import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2366 official examples', () => {
  assert.equal(solve({ nums: [3, 9, 3] }), 2)
  assert.equal(solve({ nums: [1, 2, 3, 4, 5] }), 0)
})

test('2366 a single value needs no operations', () => {
  assert.equal(solve({ nums: [5] }), 0)
})

test('2366 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0,1]}'))
})

// Independent oracle: each original value becomes a block of non-decreasing parts. Enumerate every block
// composition with memoised recursion over the first block's lower bound, and keep the cheapest total.
function oracle({ nums }) {
  const memo = new Map()
  const solveFrom = (i, floor) => {
    if (i === nums.length) return 0
    const key = `${i}:${floor}`
    if (memo.has(key)) return memo.get(key)
    let best = Infinity
    const choose = (remaining, lo, count, last) => {
      if (remaining === 0) {
        best = Math.min(best, count - 1 + solveFrom(i + 1, last))
        return
      }
      for (let p = lo; p <= remaining; p++) choose(remaining - p, p, count + 1, p)
    }
    choose(nums[i], floor, 0, 0)
    memo.set(key, best)
    return best
  }
  return solveFrom(0, 1)
}

test('2366 random arrays match a block-composition oracle', () => {
  let seed = 2366
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(12)) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
