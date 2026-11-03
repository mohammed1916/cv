import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = grid => buildTrace(grid).result

// Independent oracle: enumerate every simple path as a list of cells, then take the best sum.
function oracle(grid) {
  const rows = grid.length, cols = grid[0].length
  let best = 0
  const walk = (path, sum) => {
    best = Math.max(best, sum)
    const [r, c] = path[path.length - 1]
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] === 0) continue
      if (path.some(([pr, pc]) => pr === nr && pc === nc)) continue
      walk([...path, [nr, nc]], sum + grid[nr][nc])
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] > 0) walk([[r, c]], grid[r][c])
  return best
}

test('worked examples', () => {
  assert.equal(solve([[1, 0, 4], [2, 0, 3], [0, 5, 0]]), 7)
  assert.equal(solve([[2, 3, 4], [0, 0, 0]]), 9)
  assert.equal(solve([[0, 0], [0, 0]]), 0)
  assert.equal(solve([[1, 2], [9, 3]]), 15)
})

test('random grids agree with the enumerate-all-paths oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rand(4), cols = 1 + rand(4)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand(3) === 0 ? 0 : 1 + rand(9))))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})

test('parser rejects ragged grids and out-of-range values', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'), /same as the others/)
  assert.throws(() => parseInput('[[101]]'), /0 to 100/)
  assert.throws(() => parseInput('[]'), /1 to 5 rows/)
  assert.deepEqual(parseInput('[[1,0]]'), [[1, 0]])
})

test('every frame has a known phase, narration and a line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([[1, 2], [9, 3]])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
