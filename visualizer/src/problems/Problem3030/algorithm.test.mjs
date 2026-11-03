import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, python } from './algorithm.js'

const solve = (image, threshold) => buildTrace({ image, threshold }).result

test('3030 reference cases', () => {
  assert.deepEqual(solve([[5, 6, 7, 10], [8, 9, 10, 10], [11, 12, 13, 10]], 3), [[9, 9, 9, 9], [9, 9, 9, 9], [9, 9, 9, 9]])
  assert.deepEqual(solve([[10, 20, 30], [15, 25, 35], [20, 30, 40], [25, 35, 45]], 12), [[25, 25, 25], [27, 27, 27], [27, 27, 27], [30, 30, 30]])
})

test('3030 a window with no valid region keeps the original pixels', () => {
  const image = [[0, 0, 0], [0, 0, 0], [0, 0, 255]]
  assert.deepEqual(solve(image, 0), image)
  assert.deepEqual(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0), [[1, 2, 3], [4, 5, 6], [7, 8, 9]])
})

test('3030 rejects malformed images', () => {
  assert.throws(() => parseInput('{"image":[[1,2],[3,4],[5,6]],"threshold":1}'))
  assert.throws(() => parseInput('{"image":[[1,2,3],[4,5],[6,7,8]],"threshold":1}'))
  assert.throws(() => parseInput('{"image":[[1,2,3],[4,5,6],[7,8,300]],"threshold":1}'))
  assert.throws(() => parseInput('{"image":[[1,2,3],[4,5,6],[7,8,9]],"threshold":-1}'))
})

// Independent oracle: direct window scan, pixel-by-pixel coverage check.
function oracle(image, threshold) {
  const m = image.length, n = image[0].length
  const windows = []
  for (let r = 0; r + 3 <= m; r++) {
    for (let c = 0; c + 3 <= n; c++) {
      let ok = true
      for (let i = r; i < r + 3; i++) for (let j = c; j < c + 3; j++) {
        if (j + 1 < c + 3 && Math.abs(image[i][j] - image[i][j + 1]) > threshold) ok = false
        if (i + 1 < r + 3 && Math.abs(image[i][j] - image[i + 1][j]) > threshold) ok = false
      }
      if (!ok) continue
      let s = 0
      for (let i = r; i < r + 3; i++) for (let j = c; j < c + 3; j++) s += image[i][j]
      windows.push({ r, c, mean: Math.floor(s / 9) })
    }
  }
  return image.map((row, i) => row.map((v, j) => {
    const cover = windows.filter(w => i >= w.r && i < w.r + 3 && j >= w.c && j < w.c + 3)
    if (cover.length === 0) return v
    return Math.floor(cover.reduce((a, w) => a + w.mean, 0) / cover.length)
  }))
}

test('3030 random images match the direct oracle', () => {
  let seed = 3030
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const m = 3 + rnd(3), n = 3 + rnd(3)
    const threshold = rnd(40)
    const image = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(60)))
    assert.deepEqual(solve(image, threshold), oracle(image, threshold), JSON.stringify({ image, threshold }))
  }
})

test('3030 frames keep valid line references and final grid shape', () => {
  const image = [[1, 2, 3, 8], [2, 3, 4, 9], [3, 4, 5, 10], [4, 5, 6, 11]]
  const run = buildTrace({ image, threshold: 2 })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, f.phase)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
    assert.equal(f.regionMean.length, 2)
    assert.equal(f.result.length, 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.result.length, 4)
  assert.equal(run.result[0].length, 4)
})
