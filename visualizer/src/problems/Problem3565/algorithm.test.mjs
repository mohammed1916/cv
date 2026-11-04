import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples, FRAME_CAP } from './algorithm.js'

function isValidWalk(grid, k, path) {
  const m = grid.length
  const n = grid[0].length
  if (path.length !== m * n) return false
  const seen = new Set()
  let need = 1
  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i]
    if (r < 0 || r >= m || c < 0 || c >= n || seen.has(`${r},${c}`)) return false
    seen.add(`${r},${c}`)
    if (i && Math.abs(r - path[i - 1][0]) + Math.abs(c - path[i - 1][1]) !== 1) return false
    if (grid[r][c]) {
      if (grid[r][c] !== need) return false
      need++
    }
  }
  return need === k + 1
}

// Independent oracle: reachability over (visited mask, last cell), with the next number read from the mask.
function exists(grid) {
  const m = grid.length
  const n = grid[0].length
  const size = m * n
  const flat = grid.flat()
  const needOf = mask => { let need = 1; flat.forEach((v, i) => { if (v && mask >> i & 1) need = Math.max(need, v + 1) }); return need }
  const memo = new Map()
  const go = (mask, cell) => {
    if (mask === (1 << size) - 1) return true
    const key = mask * 32 + cell
    if (memo.has(key)) return memo.get(key)
    const need = needOf(mask)
    const r = Math.floor(cell / n)
    const c = cell % n
    let ok = false
    for (const [x, y] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (x < 0 || x >= m || y < 0 || y >= n) continue
      const next = x * n + y
      if (mask >> next & 1) continue
      if (flat[next] && flat[next] !== need) continue
      if (go(mask | 1 << next, next)) { ok = true; break }
    }
    memo.set(key, ok)
    return ok
  }
  for (let cell = 0; cell < size; cell++) {
    if (flat[cell] <= 1 && go(1 << cell, cell)) return true
  }
  return false
}

test('3565 hand-computed cases', () => {
  assert.deepEqual(buildTrace({ grid: [[1]], k: 1 }).result, [[0, 0]])
  assert.deepEqual(buildTrace({ grid: [[1, 2], [3, 4]], k: 4 }).result, [])
  // On a corridor the walk must start at an end; here 1 before 2 forces right-to-left.
  assert.deepEqual(buildTrace({ grid: [[0, 2, 1, 0]], k: 2 }).result, [[0, 3], [0, 2], [0, 1], [0, 0]])
  // The walk must run right to left to meet 1 before 2.
  assert.deepEqual(buildTrace({ grid: [[2, 0, 1]], k: 2 }).result, [[0, 2], [0, 1], [0, 0]])
  assert.deepEqual(buildTrace({ grid: [[0, 1, 0]], k: 1 }).result, [[0, 0], [0, 1], [0, 2]])
  assert.deepEqual(buildTrace({ grid: [[1, 0, 2, 0, 0]], k: 2 }).result, [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]])
})

test('3565 random grids agree with the mask oracle and answers are legal walks', () => {
  let seed = 3565
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let yes = 0
  let no = 0
  for (let t = 0; t < 500; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const k = 1 + rnd(m * n)
    const places = Array.from({ length: m * n }, (_, i) => i)
    for (let i = places.length - 1; i > 0; i--) { const j = rnd(i + 1); [places[i], places[j]] = [places[j], places[i]] }
    const flat = Array(m * n).fill(0)
    for (let v = 1; v <= k; v++) flat[places[v - 1]] = v
    const grid = Array.from({ length: m }, (_, r) => flat.slice(r * n, (r + 1) * n))
    const { result } = buildTrace({ grid, k })
    const expected = exists(grid)
    if (expected) { yes++; assert.ok(isValidWalk(grid, k, result), JSON.stringify({ grid, result })) } else { no++; assert.deepEqual(result, [], JSON.stringify(grid)) }
  }
  assert.ok(yes > 20 && no > 20, `yes ${yes} no ${no}`)
})

test('3565 parseInput enforces the numbering', () => {
  assert.throws(() => parseInput('{"grid":[[1,1]],"k":2}'))
  assert.throws(() => parseInput('{"grid":[[1,3]],"k":2}'))
  assert.throws(() => parseInput('{"grid":[[1,0]],"k":2}'))
  assert.throws(() => parseInput('{"grid":[[1],[0,0]],"k":1}'))
  assert.throws(() => parseInput('{"grid":[[1]],"k":2}'))
  assert.throws(() => parseInput('{"grid":[[0,0,0,0,0,1]],"k":1}'))
  assert.doesNotThrow(() => parseInput('{"grid":[[0,0,0,0,1]],"k":1}'))
})

test('3565 a failed 5 by 5 search finishes and summarises undrawn steps', () => {
  const { grid, k } = parseInput(examples.at(-1).input)
  const { frames, result } = buildTrace({ grid, k })
  assert.equal(frames.length, FRAME_CAP + 2)
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-2).phase, 'jump')
  assert.deepEqual(result, [])
  assert.equal(exists(grid), false)
})

test('3565 examples run and frames map to real lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const { frames, input, result } = buildTrace(parseInput(example.input))
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(result.length > 0, exists(input.grid))
    if (result.length) assert.ok(isValidWalk(input.grid, input.k, result))
    assert.deepEqual(frames.at(-1).path, result)
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(code.some(c => c.line === f.activeLine))
      assert.ok(lines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    }
  }
})

test('3565 stepping back restores the needed number', () => {
  const { frames } = buildTrace(parseInput(examples[1].input))
  assert.ok(frames.some(f => f.phase === 'back'), 'this example must backtrack')
  for (const f of frames) {
    const onPath = f.path.filter(([r, c]) => parseInput(examples[1].input).grid[r][c] > 0).length
    assert.ok(f.need === onPath + 1 || f.phase === 'enter', `need ${f.need} with ${onPath} numbers on path at ${f.phase}`)
  }
})
