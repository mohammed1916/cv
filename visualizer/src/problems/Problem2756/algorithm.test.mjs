import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { examples } from './presets.js'

const solve = (values, k) => buildTrace({ values, k }).result

test('2756 practice problem: presets', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5], 2), [3, 7, 5])
  assert.deepEqual(solve([7, 0, 3], 1), [7, 0, 3])
  assert.deepEqual(solve([2, 2], 4), [4])
  assert.equal(parseInput(examples[0].input).k, 2)
})

test('2756 random inputs match a direct split', () => {
  let seed = 2756
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(12) }, () => rnd(10))
    const k = 1 + rnd(4)
    const want = []
    for (let i = 0; i < values.length; i += k) want.push(values.slice(i, i + k).reduce((a, b) => a + b, 0))
    assert.deepEqual(solve(values, k), want, JSON.stringify({ values, k }))
  }
})
