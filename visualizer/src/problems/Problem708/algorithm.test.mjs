import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (values, insert) => buildTrace({ values, insert }).result

test('708 official examples', () => {
  assert.deepEqual(solve([3, 4, 1], 2), [3, 4, 1, 2])
  assert.deepEqual(solve([], 1), [1])
  assert.deepEqual(solve([1], 0), [1, 0])
})

test('708 rejects an unsorted cycle', () => {
  assert.throws(() => parseInput('{"values":[1,3,2,4],"insert":0}'))
})

// Independent oracle: the result must hold the old values plus the new one, and read as a sorted cycle
// (at most one drop, from the largest value back to the smallest).
function isSortedCycle(list) {
  const m = list.length
  return list.filter((v, i) => v > list[(i + 1) % m]).length <= 1
}

test('708 random sorted cycles stay sorted and keep every value', () => {
  let seed = 29
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const size = rnd(10)
    const sorted = Array.from({ length: size }, () => rnd(41) - 20).sort((a, b) => a - b)
    const shift = size ? rnd(size) : 0
    const values = [...sorted.slice(shift), ...sorted.slice(0, shift)]
    const insert = rnd(41) - 20
    const result = solve(values, insert)
    assert.deepEqual([...result].sort((a, b) => a - b), [...values, insert].sort((a, b) => a - b), JSON.stringify({ values, insert }))
    assert.ok(isSortedCycle(result), JSON.stringify({ values, insert, result }))
  }
})
