import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, space) => buildTrace({ nums, space }).result
const PY = python.split('\n')

test('2453 worked examples', () => {
  assert.equal(solve([3, 7, 8, 1, 1, 5], 2), 1)
  assert.equal(solve([1, 3, 5, 2, 4, 6], 2), 1)
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1), 1)
})

test('2453 a tie on group size takes the smaller seed', () => {
  assert.equal(solve([4, 2, 9, 7], 5), 2)
})

test('2453 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [3, 7, 8], space: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2453 rejects a zero space', () => {
  assert.throws(() => parseInput('{"nums":[1],"space":0}'))
})

function oracle(nums, space) {
  let best = null
  let bestCount = -1
  for (const seed of nums) {
    const c = nums.filter(x => x % space === seed % space).length
    if (c > bestCount || (c === bestCount && seed < best)) { bestCount = c; best = seed }
  }
  return best
}

test('2453 random inputs match a brute-force oracle', () => {
  let seed = 2453
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(30))
    const space = 1 + rnd(7)
    assert.equal(solve(nums, space), oracle(nums, space), JSON.stringify({ nums, space }))
  }
})
