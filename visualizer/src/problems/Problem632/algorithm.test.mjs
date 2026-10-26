import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('632 official examples', () => {
  assert.deepEqual(buildTrace([[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]).result, [20, 24])
  assert.deepEqual(buildTrace([[1, 2, 3], [1, 2, 3], [1, 2, 3]]).result, [1, 1])
  assert.deepEqual(buildTrace([[1, 3, 5], [2, 4, 6]]).result, [1, 2])
})

test('632 random lists match exhaustive window search', () => {
  let state = 6
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const k = 2 + rand(3)
    const lists = Array.from({ length: k }, () => Array.from({ length: 1 + rand(4) }, () => rand(30)).sort((a, b) => a - b))
    const all = [...new Set(lists.flat())].sort((a, b) => a - b)
    let expected = null
    for (const lo of all) for (const hi of all) {
      if (hi < lo) continue
      if (!lists.every(list => list.some(v => v >= lo && v <= hi))) continue
      if (!expected || hi - lo < expected[1] - expected[0]) expected = [lo, hi]
    }
    assert.deepEqual(buildTrace(lists).result, expected, JSON.stringify(lists))
  }
})

test('632 rejects unsorted lists', () => {
  assert.throws(() => parseInput('[[2,1],[3]]'))
})
