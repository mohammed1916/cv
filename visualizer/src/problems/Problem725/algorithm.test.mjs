import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('725 official examples', () => {
  assert.deepEqual(buildTrace({ values: [1, 2, 3], k: 5 }).result, [[1], [2], [3], [], []])
  assert.deepEqual(buildTrace({ values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 3 }).result, [[1, 2, 3, 4], [5, 6, 7], [8, 9, 10]])
})

test('725 every length up to 12 and k up to 6 splits into the balanced sizes', () => {
  for (let n = 0; n <= 12; n++) for (let k = 1; k <= 6; k++) {
    const values = Array.from({ length: n }, (_, i) => i)
    const parts = buildTrace({ values, k }).result
    assert.deepEqual(parts.flat(), values, `order preserved n=${n} k=${k}`)
    const sizes = parts.map(p => p.length)
    assert.equal(sizes.length, k)
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `balanced n=${n} k=${k}`)
    assert.ok(sizes.every((s, i) => i === 0 || s <= sizes[i - 1]), 'earlier parts are not smaller')
  }
})

test('725 rejects k above 50', () => {
  assert.throws(() => parseInput('{"values":[1],"k":51}'))
})
