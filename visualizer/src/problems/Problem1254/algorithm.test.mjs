import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

// Independent oracle: union-find over land cells, then count components that never touch the border.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  const parent = Array.from({ length: m * n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const union = (a, b) => { parent[find(a)] = find(b) }
  const border = new Set()
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 0) continue
      if (r === 0 || c === 0 || r === m - 1 || c === n - 1) border.add(find(r * n + c))
      if (r + 1 < m && grid[r + 1][c] === 0) union(r * n + c, (r + 1) * n + c)
      if (c + 1 < n && grid[r][c + 1] === 0) union(r * n + c, r * n + c + 1)
    }
  }
  // Recompute border membership after all unions.
  const roots = new Set()
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 0) continue
      const root = find(r * n + c)
      if (r === 0 || c === 0 || r === m - 1 || c === n - 1) border.add(root)
      roots.add(root)
    }
  }
  const borderRoots = new Set([...border].map(find))
  return [...roots].filter(root => !borderRoots.has(root)).length
}

test('hand-checked grids', () => {
  assert.equal(buildTrace([[1, 1, 1, 1], [1, 0, 0, 1], [1, 0, 1, 1], [1, 1, 1, 1]]).result, 1)
  assert.equal(buildTrace([[0, 0, 1], [1, 0, 1], [1, 1, 0]]).result, 0)
  assert.equal(buildTrace([[1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [1, 1, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]).result, 2)
})

test('random grids agree with the union-find oracle', () => {
  let state = 5
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const m = 1 + rand(7)
    const n = 1 + rand(7)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rand(3) === 0 ? 0 : 1)))
    assert.equal(buildTrace(grid).result, oracle(grid), JSON.stringify(grid))
  }
})

test('every frame points at real pseudocode and Python lines', () => {
  const run = buildTrace([[1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [1, 1, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed grids are rejected', () => {
  assert.throws(() => parseInput('[[1,0],[1]]'), /same length/)
  assert.throws(() => parseInput('[[1,2]]'), /0 \(land\)/)
  assert.throws(() => parseInput('[]'), /rows/)
})
