import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2659 official examples', () => {
  assert.equal(solve([3, 4, -1]), 5)
  assert.equal(solve([1, 2, 4, 3]), 5)
  assert.equal(solve([1, 2, 3]), 3)
})

test('2659 edge cases', () => {
  assert.equal(solve([7]), 1)
  assert.equal(solve([1, 2]), 2)
  assert.equal(solve([2, 1]), 3)
  assert.equal(solve([3, 2, 1]), 6)
})

test('2659 rejects duplicate or non-integer values', () => {
  assert.throws(() => parseInput('{"nums":[1,1]}'))
  assert.throws(() => parseInput('{"nums":[1.5,2]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

test('2659 every operation is either a removal or a rotation', () => {
  const trace = buildTrace({ nums: [3, 4, -1] })
  const removals = trace.frames.filter(f => f.phase === 'remove').length
  const rotations = trace.frames.filter(f => f.phase === 'rotate').length
  assert.equal(removals, 3)
  assert.equal(removals + rotations, trace.result)
  assert.equal(trace.frames.at(-1).phase, 'done')
})

// Independent oracle: simulate on a plain array using shift and push, with the
// smallest remaining value found by scanning instead of sorting.
function oracle(nums) {
  const arr = [...nums]
  let ops = 0
  while (arr.length) {
    ops++
    const min = Math.min(...arr)
    if (arr[0] === min) arr.shift()
    else arr.push(arr.shift())
  }
  return ops
}

test('2659 random small arrays match the scanning oracle', () => {
  let seed = 2659
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const size = 1 + rnd(10)
    const pool = Array.from({ length: 30 }, (_, i) => i - 10)
    const nums = []
    while (nums.length < size) {
      const v = pool[rnd(pool.length)]
      if (!nums.includes(v)) nums.push(v)
    }
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
