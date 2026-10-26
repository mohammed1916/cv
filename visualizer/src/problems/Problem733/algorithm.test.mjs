import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('733 official examples', () => {
  assert.deepEqual(buildTrace({ image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr: 1, sc: 1, color: 2 }).result, [[2, 2, 2], [2, 2, 0], [2, 0, 1]])
  assert.deepEqual(buildTrace({ image: [[0, 0, 0], [0, 0, 0]], sr: 0, sc: 0, color: 0 }).result, [[0, 0, 0], [0, 0, 0]])
})

// Oracle: recursive depth-first fill, a different traversal order from the queue-based trace.
test('733 random images match a recursive depth-first fill', () => {
  let state = 301
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rand(5), n = 1 + rand(5)
    const image = Array.from({ length: m }, () => Array.from({ length: n }, () => rand(3)))
    const sr = rand(m), sc = rand(n), color = rand(4)
    const expected = image.map(r => [...r])
    const original = expected[sr][sc]
    const dfs = (r, c) => {
      if (r < 0 || c < 0 || r >= m || c >= n || expected[r][c] !== original || original === color) return
      expected[r][c] = color
      dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
    }
    dfs(sr, sc)
    assert.deepEqual(buildTrace({ image, sr, sc, color }).result, expected, JSON.stringify({ image, sr, sc, color }))
  }
})

test('733 rejects a start outside the image', () => {
  assert.throws(() => parseInput('{"image":[[1]],"sr":1,"sc":0,"color":2}'))
})
