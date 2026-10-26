import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('689 official examples', () => {
  assert.deepEqual(buildTrace({ nums: [1, 2, 1, 2, 6, 7, 5, 1], k: 2 }).result, [0, 3, 5])
  assert.deepEqual(buildTrace({ nums: [1, 2, 1, 2, 1, 2, 1, 2, 1], k: 2 }).result, [0, 2, 4])
})

// Oracle: scan every triple of starts in lexicographic order; keep the first strictly-best non-overlapping triple.
test('689 random arrays match a triple search in lexicographic order', () => {
  let state = 23
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 200; t++) {
    const k = 1 + rand(3)
    const nums = Array.from({ length: 3 * k + rand(6) }, () => rand(5))
    const n = nums.length
    const at = s => nums.slice(s, s + k).reduce((a, b) => a + b, 0)
    let best = -1, bestTriple = null
    for (let a = 0; a + k <= n; a++) for (let b = a + k; b + k <= n; b++) for (let c = b + k; c + k <= n; c++) {
      const total = at(a) + at(b) + at(c)
      if (total > best) { best = total; bestTriple = [a, b, c] }
    }
    assert.deepEqual(buildTrace({ nums, k }).result, bestTriple, JSON.stringify({ nums, k }))
  }
})

test('689 rejects too-short arrays', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":2}'))
})
