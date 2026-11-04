import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm.js'

const table = heights => ({ Heights: heights.map((height, i) => ({ id: i + 1, height })) })
const solve = heights => buildTrace(table(heights)).result[0].total_trapped_water

test('3061 hand-computed landscapes', () => {
  // peaks left 4 4 4 5 5 5 5, right 5 5 5 5 3 3 1, level 4 4 4 5 3 3 1, water 0 3 2 0 3 0 0
  assert.equal(solve([4, 1, 2, 5, 0, 3, 1]), 8)
  assert.equal(solve([2, 1, 0, 1, 3]), 4)
  assert.equal(solve([3, 0, 3]), 3)
})

test('3061 edge cases', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([0, 0, 0]), 0)
  assert.equal(solve([1, 3, 6, 2]), 0)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([3, 2, 1]), 0)
  assert.equal(solve([5, 5]), 0)
})

test('3061 row order in the table does not matter', () => {
  const shuffled = { Heights: [{ id: 3, height: 0 }, { id: 1, height: 2 }, { id: 5, height: 3 }, { id: 2, height: 1 }, { id: 4, height: 1 }] }
  assert.equal(buildTrace(shuffled).result[0].total_trapped_water, solve([2, 1, 0, 1, 3]))
})

test('3061 parseInput rejects invalid tables', () => {
  assert.doesNotThrow(() => parseInput('{"Heights":[{"id":1,"height":0}]}'))
  assert.throws(() => parseInput('{"Heights":[]}'))
  assert.throws(() => parseInput('{"Heights":[{"id":1,"height":-1}]}'))
  assert.throws(() => parseInput('{"Heights":[{"id":1,"height":1},{"id":1,"height":2}]}'))
  assert.throws(() => parseInput('{"Heights":[{"id":1,"height":1},{"id":3,"height":2}]}'))
  assert.throws(() => parseInput('[1]'))
})

// Oracle: fill the landscape level by level and count empty cells walled in on both sides.
function byLevels(heights) {
  let total = 0
  for (let level = 1; level <= Math.max(0, ...heights); level++) {
    const solid = heights.flatMap((h, i) => (h >= level ? [i] : []))
    if (solid.length >= 2) total += solid.at(-1) - solid[0] + 1 - solid.length
  }
  return total
}

test('3061 matches level-by-level counting', () => {
  let seed = 23
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 500; t++) {
    const heights = Array.from({ length: 1 + rnd(14) }, () => rnd(9))
    assert.equal(solve(heights), byLevels(heights), JSON.stringify(heights))
  }
})

test('3061 frames are well formed', () => {
  const run = buildTrace(table([2, 0, 1, 3]))
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= lines.length && lines[f.pythonLine - 1].trim())
    assert.ok(f.message)
  }
  assert.deepEqual([...new Set(run.frames.map(f => f.phase))], phases.map(p => p.id))
  // The right-peak scan really runs from the last id to the first.
  assert.deepEqual(run.frames.filter(f => f.phase === 'right').map(f => f.at), [3, 2, 1, 0])
  const last = run.frames.at(-1)
  assert.equal(last.total, 3)
  assert.deepEqual(last.rows.map(r => r.water), [0, 2, 1, 0])
  assert.match(sql, /total_trapped_water/)
})
