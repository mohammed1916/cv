import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('658 official examples', () => {
  assert.deepEqual(buildTrace({ arr: [1, 2, 3, 4, 5], k: 4, x: 3 }).result, [1, 2, 3, 4])
  assert.deepEqual(buildTrace({ arr: [1, 1, 2, 3, 4, 5], k: 4, x: -1 }).result, [1, 1, 2, 3])
})

test('658 random sorted arrays match the sort-by-distance oracle', () => {
  let state = 91
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(10)
    const arr = Array.from({ length: n }, () => rand(20) - 10).sort((a, b) => a - b)
    const k = 1 + rand(n), x = rand(30) - 15
    const expected = [...arr].sort((a, b) => Math.abs(a - x) - Math.abs(b - x) || a - b).slice(0, k).sort((a, b) => a - b)
    assert.deepEqual(buildTrace({ arr, k, x }).result, expected, JSON.stringify({ arr, k, x }))
  }
})

test('658 rejects an unsorted array', () => {
  assert.throws(() => parseInput('{"arr":[2,1],"k":1,"x":0}'))
})
