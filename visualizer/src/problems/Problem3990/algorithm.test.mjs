import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, countPaths, python, code, phases, MAX_SIZE } from './algorithm.js'

const paths = grid => countPaths(grid).at(-1).at(-1)

test('3990 path counter on hand-computed grids', () => {
  assert.equal(paths(['.']), 1)
  assert.equal(paths(['..', '..']), 2)
  assert.equal(paths(['...', '...', '...']), 6)
  assert.equal(paths(['.#', '#.']), 0)
  assert.equal(paths(['..#', '#..', '#..']), 2)
})

test('3990 hand-traced grids', () => {
  assert.deepEqual(buildTrace({ k: 1 }).result, ['...', '##.', '##.'])
  assert.deepEqual(buildTrace({ k: 2 }).result, ['...#', '##.#', '##..', '##..'])
})

// Independent oracle: walk every route with no memoisation.
function walk(grid, r = 0, c = 0) {
  if (grid[r]?.[c] !== '.') return 0
  if (r === grid.length - 1 && c === grid[0].length - 1) return 1
  return walk(grid, r + 1, c) + walk(grid, r, c + 1)
}

test('3990 every k from 1 to 1000 gives exactly k paths within 25 by 25', () => {
  for (let k = 1; k <= 1000; k++) {
    const { result: grid } = buildTrace({ k })
    assert.ok(grid.length <= MAX_SIZE && grid[0].length <= MAX_SIZE, `size for ${k}`)
    assert.ok(grid.every(row => row.length === grid[0].length && /^[.#]+$/.test(row)), `shape for ${k}`)
    assert.equal(grid[0][0], '.')
    assert.equal(grid.at(-1).at(-1), '.')
    assert.equal(paths(grid), k, `dp for ${k}`)
    assert.equal(walk(grid), k, `walk for ${k}`)
  }
})

test('3990 parser bounds', () => {
  assert.deepEqual(parseInput('{"k":1000}'), { k: 1000 })
  assert.throws(() => parseInput('{"k":0}'))
  assert.throws(() => parseInput('{"k":1001}'))
  assert.throws(() => parseInput('{"k":2.5}'))
  assert.throws(() => parseInput('[]'))
})

test('3990 frames: the working cell always holds the announced count', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (let k = 1; k <= 1000; k += 37) {
    const { frames, bits } = buildTrace({ k })
    let last = 1
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(pyLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
      const [r, c] = f.cell
      if (f.phase !== 'route') assert.equal(f.counts[r][c], f.x, `k=${k} ${f.phase}`)
      if (f.phase === 'double') assert.equal(f.x, last * 2)
      if (f.phase === 'tap') assert.equal(f.x, last + 1)
      last = f.x
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.at(-1).x, k)
    assert.equal(frames.filter(f => f.phase === 'double').length, bits.length - 1)
  }
})

test('3990 the path count of the 13 example grows 1, 2, 3, 6, 12, 13', () => {
  assert.deepEqual(buildTrace({ k: 13 }).frames.at(-1).chain, [1, 2, 3, 6, 12, 13])
})
