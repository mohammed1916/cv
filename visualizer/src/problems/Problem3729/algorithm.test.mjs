import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3729 official examples', () => {
  assert.equal(solve([1, 2, 3], 3), 3)
  assert.equal(solve([2, 2, 2, 2, 2, 2], 6), 2)
})

test('3729 equal values give one distinct subarray per length', () => {
  assert.equal(solve([1, 1, 1], 2), 1)
})

test('3729 rejects an unsorted array', () => {
  assert.throws(() => parseInput('{"nums":[2,1],"k":1}'))
})

// Independent oracle: list every subarray as a value sequence, keep distinct ones, test the sum.
function oracle(nums, k) {
  const seqs = new Set()
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) seqs.add(nums.slice(l, r + 1).join(','))
  }
  let count = 0
  for (const s of seqs) {
    const sum = s.split(',').reduce((a, b) => a + Number(b), 0)
    if (sum % k === 0) count++
  }
  return count
}

let seed = 3729
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3729 seeded random against value-sequence oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(6)).sort((a, b) => a - b)
    const k = 1 + rnd(6)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
