import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3072 official examples', () => {
  assert.deepEqual(solve('[2,1,4,5]'), [2, 4, 1, 5])
  assert.deepEqual(solve('[5,14,3,1,2]'), [5, 3, 1, 2, 14])
  assert.deepEqual(solve('[3,1,2,4]'), [3, 2, 1, 4])
})

test('3072 a tie goes to the shorter array', () => {
  // Equal counts (zero each) send 3 to arr1 (equal lengths); then arr2 is shorter, so 4 goes there.
  assert.deepEqual(solve('[1,2,3,4]'), [1, 3, 2, 4])
})

test('3072 rejects repeated values', () => {
  assert.throws(() => parseInput('[1,2,2]'))
})

// Independent oracle: count the larger values by scanning the arrays directly; no Fenwick tree.
function oracle(nums) {
  const arr1 = [nums[0]], arr2 = [nums[1]]
  for (const x of nums.slice(2)) {
    const g1 = arr1.filter(v => v > x).length
    const g2 = arr2.filter(v => v > x).length
    if (g1 > g2 || (g1 === g2 && arr1.length <= arr2.length)) arr1.push(x)
    else arr2.push(x)
  }
  return [...arr1, ...arr2]
}

test('3072 random distinct arrays match a direct-scan oracle', () => {
  let seed = 3072
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 3 + rnd(8)
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    const nums = []
    for (let k = 0; k < count; k++) nums.push(pool.splice(rnd(pool.length), 1)[0])
    assert.deepEqual(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
