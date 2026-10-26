import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('661 official examples', () => {
  assert.deepEqual(buildTrace([[1, 1, 1], [1, 0, 1], [1, 1, 1]]).result, [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
  assert.deepEqual(buildTrace([[100, 200, 100], [200, 50, 200], [100, 200, 100]]).result, [[137, 141, 137], [141, 138, 141], [137, 141, 137]])
})

test('661 random images match an explicit 9-cell window oracle', () => {
  let state = 12
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rand(5), n = 1 + rand(5)
    const img = Array.from({ length: m }, () => Array.from({ length: n }, () => rand(256)))
    const expected = img.map((row, r) => row.map((_, c) => {
      const cells = []
      for (let i = r - 1; i <= r + 1; i++) for (let j = c - 1; j <= c + 1; j++) if (img[i]?.[j] !== undefined) cells.push(img[i][j])
      return Math.floor(cells.reduce((a, b) => a + b, 0) / cells.length)
    }))
    assert.deepEqual(buildTrace(img).result, expected, JSON.stringify(img))
  }
})

test('661 rejects ragged rows', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'))
})
