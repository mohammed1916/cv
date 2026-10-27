import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('996 official examples', () => {
  assert.equal(solve([1, 17, 8]), 2)
  assert.equal(solve([2, 2, 2]), 1)
})

test('996 edge cases: one value, a zero pair, and no squareful pair', () => {
  assert.equal(solve([1]), 1)
  assert.equal(solve([0, 0]), 1)
  assert.equal(solve([1, 2]), 0)
})

test('996 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3,4,5,6,7,8,9]}'), /1 to 8/)
  assert.throws(() => parseInput('{"nums":[21]}'), /0 to 20/)
  assert.throws(() => parseInput('{"nums":[1.5]}'), /0 to 20/)
  assert.throws(() => parseInput('{"nums":[]}'), /1 to 8/)
})

// Independent oracle: enumerate every index permutation, keep distinct value sequences in a Set,
// and count the sequences whose adjacent sums are all perfect squares.
function oracle(nums) {
  const n = nums.length
  const distinct = new Set()
  const used = Array(n).fill(false)
  const seq = []
  const enumerate = () => {
    if (seq.length === n) {
      distinct.add(seq.join(','))
      return
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      used[i] = true
      seq.push(nums[i])
      enumerate()
      seq.pop()
      used[i] = false
    }
  }
  enumerate()
  let total = 0
  for (const key of distinct) {
    const values = key.split(',').map(Number)
    const ok = values.every((v, j) => j === 0 || Number.isInteger(Math.sqrt(values[j - 1] + v)))
    if (ok) total++
  }
  return total
}

test('996 random arrays match an index-permutation oracle', () => {
  let seed = 996
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(7)
    const nums = Array.from({ length: n }, () => rnd(21))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
