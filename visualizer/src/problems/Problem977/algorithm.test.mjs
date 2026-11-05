import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('977 sorted squares match squaring and sorting', () => {
  const samples = [
    [-5, -2, 0, 1, 4], [-9, -3, -1, 2], [0, 3, 6], [-4], [1, 2, 3], [-8, -6, -6, 1, 5, 7],
    [-10, -7, -2, 0, 3, 3, 9], [-3, -3, 2, 2],
  ]
  for (const nums of samples) {
    const expected = nums.map(v => v * v).sort((p, q) => p - q)
    assert.deepEqual(buildTrace(parseInput(JSON.stringify({ nums }))).result, expected, JSON.stringify(nums))
  }
})

test('977 rejects unsorted input', () => {
  assert.throws(() => parseInput('{"nums":[2,1]}'))
})
