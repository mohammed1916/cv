import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2614 worked examples', () => {
  assert.equal(solve([[1, 2], [3, 4]]), 3)
  assert.equal(solve([[4, 6], [8, 9]]), 0)
  assert.equal(solve([[2, 0, 0], [0, 7, 0], [0, 0, 5]]), 7)
})

test('2614 the centre cell of an odd matrix is counted once', () => {
  assert.equal(solve([[1]]), 0)
  assert.equal(solve([[2]]), 2)
})

test('2614 rejects a non-square matrix', () => {
  assert.throws(() => parseInput('{"nums":[[1,2],[3]]}'))
  assert.throws(() => parseInput('{"nums":[[1,2,3],[4,5,6]]}'))
})

// Independent oracle: test every cell, keeping the ones on either diagonal.
function oracle(nums) {
  const n = nums.length
  const isPrimeByTable = x => { for (let d = 1; d <= x; d++) for (let e = 1; e <= x; e++) if (d * e === x && d !== 1 && e !== 1) return false; return x > 1 }
  let best = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if ((r === c || r + c === n - 1) && isPrimeByTable(nums[r][c])) best = Math.max(best, nums[r][c])
  }
  return best
}

test('2614 random matrices match a cell-by-cell oracle', () => {
  let seed = 2614
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const nums = Array.from({ length: n }, () => Array.from({ length: n }, () => 1 + rnd(30)))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
