import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const G = rows => rows.map(row => [...row])
const solve = (rows, pattern) => buildTrace({ grid: G(rows), pattern }).result

test('3529 hand-computed grids', () => {
  // Across "abba" matches 0-1, cells (0,0),(0,1). Down "abba" matches 0-1, cells (0,0),(1,0). Shared: (0,0).
  assert.equal(solve(['ab', 'ba'], 'ab'), 1)
  // Across "xaby" covers (0,1),(1,0). Down "xbay" has no "ab".
  assert.equal(solve(['xa', 'by'], 'ab'), 0)
  // Across "aaaa" all covered, down "aaaa" all covered.
  assert.equal(solve(['aa', 'aa'], 'aa'), 4)
  // Across "cats abat tzzc" matches at 0; down "cat abz tat..." matches at 0: shared (0,0) only.
  assert.equal(solve(['cats', 'abat', 'tzzc'], 'cat'), 1)
})

test('3529 wrapping counts in both readings', () => {
  // grid ab/ca, pattern "bc": across "abca" matches at 1-2 through the row wrap, cells (0,1),(1,0).
  // Down "acba" has no "bc". Nothing is shared.
  assert.equal(solve(['ab', 'ca'], 'bc'), 0)
  // grid ab/ba, pattern "ba": across "abba" matches at 2-3, cells (1,0),(1,1). Down "abba" matches 2-3, cells (0,1),(1,1).
  assert.equal(solve(['ab', 'ba'], 'ba'), 1)
  // Wrap both ways, 2 by 2, pattern "bb": across "abbz" uses a row wrap (0,1),(1,0); down "abbz" uses a column wrap (1,0),(0,1).
  assert.equal(solve(['ab', 'bz'], 'bb'), 2)
})

test('3529 page examples', () => {
  // Across and down both read "tree" from (0,0), sharing only that corner.
  assert.equal(solve(['tree', 'raxp', 'eqzk', 'envb'], 'tree'), 1)
  // Across "xyabacdbe" matches at 2-4: (0,2),(1,0),(1,1). Down "xbdyabace" matches at 4-6: (1,1),(2,1),(0,2). Shared: (0,2),(1,1).
  assert.equal(solve(['xya', 'bac', 'dbe'], 'aba'), 2)
  assert.equal(solve(['mo', 'qp'], 'mo'), 0)
  // One row: each column is one letter, so both readings are "run" and cover all three cells.
  assert.equal(solve(['run'], 'run'), 3)
})

test('3529 edge cases', () => {
  assert.equal(solve(['q'], 'q'), 1)
  assert.equal(solve(['q'], 'r'), 0)
  // One row: across and down both read "abc" because each column wraps into the next.
  assert.equal(solve(['abc'], 'abc'), 3)
  assert.equal(solve(['abc'], 'ac'), 0)
})

test('3529 parseInput rejects invalid input', () => {
  assert.doesNotThrow(() => parseInput('{"grid":[["a"]],"pattern":"a"}'))
  assert.throws(() => parseInput('{"grid":[],"pattern":"a"}'))
  assert.throws(() => parseInput('{"grid":[["a","b"],["c"]],"pattern":"a"}'))
  assert.throws(() => parseInput('{"grid":[["A"]],"pattern":"a"}'))
  assert.throws(() => parseInput('{"grid":[["a"]],"pattern":"aa"}'))
  assert.throws(() => parseInput('{"grid":[["a"]],"pattern":""}'))
})

// Oracle: compare the pattern at every start directly, then intersect the cell sets.
function oracle(rows, pattern) {
  const m = rows.length, n = rows[0].length
  const across = new Set(), down = new Set()
  const flatA = [], flatD = []
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) flatA.push([r, c])
  for (let c = 0; c < n; c++) for (let r = 0; r < m; r++) flatD.push([r, c])
  const mark = (flat, set) => {
    for (let s = 0; s + pattern.length <= flat.length; s++) {
      let ok = true
      for (let t = 0; t < pattern.length; t++) if (rows[flat[s + t][0]][flat[s + t][1]] !== pattern[t]) { ok = false; break }
      if (ok) for (let t = 0; t < pattern.length; t++) set.add(flat[s + t].join(':'))
    }
  }
  mark(flatA, across)
  mark(flatD, down)
  return [...across].filter(key => down.has(key)).length
}

test('3529 matches direct comparison', () => {
  let seed = 37
  const rnd = limit => (seed = (seed * 1103515245 + 12345) % 2147483648) % limit
  for (let t = 0; t < 600; t++) {
    const m = 1 + rnd(5), n = 1 + rnd(5)
    const rows = Array.from({ length: m }, () => Array.from({ length: n }, () => 'ab'[rnd(2)]).join(''))
    const len = 1 + rnd(Math.min(m * n, 5))
    const pattern = Array.from({ length: len }, () => 'ab'[rnd(2)]).join('')
    assert.equal(solve(rows, pattern), oracle(rows, pattern), JSON.stringify({ rows, pattern }))
  }
})

test('3529 frames are well formed', () => {
  const run = buildTrace({ grid: G(['aba', 'bab']), pattern: 'aba' })
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= lines.length && lines[f.pythonLine - 1].trim())
    assert.ok(f.message)
  }
  assert.equal(run.frames.at(-1).count, run.result)
  // Overlapping matches are kept: "ababab" holds "aba" at 0 and 2 across.
  const across = run.frames.filter(f => f.pass === 'across' && f.compare === 'hit')
  assert.equal(across.length, 2)
  const failFrame = run.frames.at(-1)
  assert.deepEqual(failFrame.fail, [0, 0, 1])
})
