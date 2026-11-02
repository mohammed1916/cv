import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3510 worked examples', () => {
  assert.equal(solve([5, 2, 3, 1]), 2)
  assert.equal(solve([1, 2, 2]), 0)
  assert.equal(solve([3, 2, 1]), 1)
})

test('3510 single values and sorted arrays need no operations', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([-4, -4, 0, 9]), 0)
})

test('3510 ties merge the leftmost pair first', () => {
  // [2, 1, 1] -> pairs (2,1)=3 and (1,1)=2, so the (1,1) pair merges to [2, 2]: sorted after 1 step.
  assert.equal(solve([2, 1, 1]), 1)
  // [2, 1, 2, 0]: sums 3, 3, 2 -> merge (2,0) to [2, 1, 2]; sums 3, 3 -> merge leftmost to [3, 2]; then [5].
  assert.equal(solve([2, 1, 2, 0]), 3)
  const frames = buildTrace([2, 1, 2, 0]).frames.filter(f => f.phase === 'merge' && f.pair === null)
  assert.deepEqual(frames.map(f => f.arr), [[2, 1, 2], [3, 2], [5]])
})

test('3510 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1001]'))
})

// Independent oracle: keep the array as objects and locate the leftmost minimum pair with reduce.
function oracle(nums) {
  let arr = nums.map(value => ({ value }))
  let ops = 0
  const sorted = list => list.every((item, i) => i === 0 || list[i - 1].value <= item.value)
  while (!sorted(arr)) {
    const sums = arr.slice(0, -1).map((item, i) => item.value + arr[i + 1].value)
    const at = sums.reduce((best, sum, i) => (sum < sums[best] ? i : best), 0)
    arr = [...arr.slice(0, at), { value: sums[at] }, ...arr.slice(at + 2)]
    ops++
  }
  return ops
}

test('3510 random inputs match an independent oracle', () => {
  let seed = 3510
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(41) - 20)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
