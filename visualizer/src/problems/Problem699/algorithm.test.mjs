import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('699 official examples', () => {
  assert.deepEqual(buildTrace([[1, 2], [2, 3], [6, 1]]).result, [2, 5, 5])
  assert.deepEqual(buildTrace([[100, 100], [200, 100]]).result, [100, 100])
  assert.deepEqual(buildTrace([[1, 2], [1, 3]]).result, [2, 5])
})

// Oracle: a grid of columns with explicit heights, updated square by square.
test('699 random squares match a column-array simulation', () => {
  let state = 31
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const squares = Array.from({ length: 1 + rand(8) }, () => [1 + rand(10), 1 + rand(5)])
    const columns = Array(30).fill(0)
    let best = 0
    const expected = squares.map(([left, side]) => {
      let base = 0
      for (let x = left; x < left + side; x++) base = Math.max(base, columns[x])
      for (let x = left; x < left + side; x++) columns[x] = base + side
      best = Math.max(best, base + side)
      return best
    })
    assert.deepEqual(buildTrace(squares).result, expected, JSON.stringify(squares))
  }
})

test('699 rejects side lengths of zero', () => {
  assert.throws(() => parseInput('[[1,0]]'))
})
