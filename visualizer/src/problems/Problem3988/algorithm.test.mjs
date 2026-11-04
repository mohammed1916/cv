import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

// Independent count: walk every right-and-down route.
function countRoutes(grid) {
  const m = grid.length, n = grid[0].length
  const walk = (r, c) => {
    if (r >= m || c >= n || grid[r][c] !== '.') return 0
    if (r === m - 1 && c === n - 1) return 1
    return walk(r + 1, c) + walk(r, c + 1)
  }
  return walk(0, 0)
}

function achievable(m, n, k) {
  for (let bits = 0; bits < 1 << m * n; bits++) {
    const grid = Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => bits >> r * n + c & 1 ? '#' : '.').join(''))
    if (countRoutes(grid) === k) return true
  }
  return false
}

test('3988 hand-computed cases', () => {
  assert.deepEqual(buildTrace({ m: 1, n: 1, k: 1 }).result, ['.'])
  assert.deepEqual(buildTrace({ m: 1, n: 1, k: 2 }).result, [])
  assert.deepEqual(buildTrace({ m: 1, n: 6, k: 3 }).result, [])
  assert.deepEqual(buildTrace({ m: 2, n: 2, k: 2 }).result, ['..', '..'])
  assert.deepEqual(buildTrace({ m: 2, n: 2, k: 3 }).result, [])
  assert.deepEqual(buildTrace({ m: 2, n: 3, k: 4 }).result, [])
  assert.deepEqual(buildTrace({ m: 2, n: 4, k: 4 }).result, ['....', '....'])
  assert.deepEqual(buildTrace({ m: 2, n: 3, k: 1 }).result, ['...', '##.'])
})

test('3988 every size and k gives a right-sized grid with exactly k routes, or is over the ceiling', () => {
  for (let m = 1; m <= 10; m++) for (let n = 1; n <= 10; n++) for (let k = 1; k <= 4; k++) {
    const { result, limit } = buildTrace({ m, n, k })
    if (k > limit) { assert.deepEqual(result, [], `${m} ${n} ${k}`); continue }
    assert.equal(result.length, m)
    assert.ok(result.every(row => row.length === n && /^[.#]+$/.test(row)))
    assert.equal(countRoutes(result), k, `${m} ${n} ${k}: ${result}`)
  }
})

test('3988 an empty answer matches exhaustive search over small grids', () => {
  for (let m = 1; m <= 4; m++) for (let n = 1; n <= 4; n++) {
    if (m * n > 12) continue
    for (let k = 1; k <= 4; k++) assert.equal(buildTrace({ m, n, k }).result.length > 0, achievable(m, n, k), `${m} ${n} ${k}`)
  }
})

test('3988 traced routes and the counted corner agree with k', () => {
  for (const [m, n, k] of [[4, 5, 3], [5, 4, 4], [5, 2, 4], [3, 6, 1]]) {
    const { frames, paths } = buildTrace({ m, n, k })
    assert.equal(paths.length, k)
    assert.equal(frames.at(-1).ways[m - 1][n - 1], k)
    assert.equal(frames.filter(f => f.phase === 'path').length, k)
  }
})

test('3988 parse enforces the rules', () => {
  assert.doesNotThrow(() => parseInput('{"m":10,"n":10,"k":4}'))
  assert.throws(() => parseInput('{"m":0,"n":1,"k":1}'))
  assert.throws(() => parseInput('{"m":11,"n":1,"k":1}'))
  assert.throws(() => parseInput('{"m":1,"n":1,"k":5}'))
  assert.throws(() => parseInput('{"m":1,"n":1}'))
})

test('3988 frames are well formed', () => {
  const lines = python.split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const [m, n, k] of [[4, 5, 3], [5, 4, 4], [1, 6, 3], [10, 10, 4]]) {
    const { frames } = buildTrace({ m, n, k })
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(code.some(c => c.line === frame.activeLine))
      assert.ok(lines[frame.pythonLine - 1].trim())
      assert.ok(frame.message.length > 0)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
})
