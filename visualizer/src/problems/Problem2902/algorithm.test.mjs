import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, l, r) => buildTrace(parseInput(JSON.stringify({ nums, l, r }))).result

test('2902 hand-checked examples', () => {
  assert.equal(solve([1, 2, 2, 3], 6, 6), 1)
  assert.equal(solve([2, 1, 4, 2, 7], 1, 5), 7)
  assert.equal(solve([1, 2, 1, 3, 5, 2], 3, 5), 9)
})

test('2902 zeros multiply the count by one more than their number', () => {
  // Two zeros allow 0, 1 or 2 copies, so the sum-0 multiset appears three times.
  assert.equal(solve([0, 0], 0, 0), 3)
})

test('2902 rejects an inverted range', () => {
  assert.throws(() => parseInput('{"nums":[1],"l":5,"r":2}'))
})

// Independent oracle: enumerate every count vector over the distinct values and count those with a sum in range.
function oracle(nums, l, r) {
  const distinct = [...new Set(nums)]
  const occurrences = distinct.map(v => nums.filter(x => x === v).length)
  let count = 0
  const choose = (i, sum) => {
    if (i === distinct.length) {
      if (sum >= l && sum <= r) count++
      return
    }
    for (let t = 0; t <= occurrences[i]; t++) choose(i + 1, sum + t * distinct[i])
  }
  choose(0, 0)
  return count % 1000000007
}

test('2902 random inputs match a count-vector enumeration oracle', () => {
  let seed = 2902
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(5))
    const l = rnd(21)
    const r = l + rnd(21)
    assert.equal(solve(nums, l, r), oracle(nums, l, r), JSON.stringify({ nums, l, r }))
  }
})
