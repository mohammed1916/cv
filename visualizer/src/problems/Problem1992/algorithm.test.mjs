import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: flood-fill each component and take its bounding box.
function oracle(land) {
  const rows = land.length, cols = land[0].length
  const seen = land.map(row => row.map(() => false))
  const out = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (land[r][c] !== 1 || seen[r][c]) continue
    let top = r, bottom = r, left = c, right = c
    const stack = [[r, c]]
    seen[r][c] = true
    while (stack.length) {
      const [y, x] = stack.pop()
      top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x)
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ny = y + dy, nx = x + dx
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && land[ny][nx] === 1 && !seen[ny][nx]) { seen[ny][nx] = true; stack.push([ny, nx]) }
      }
    }
    out.push([top, left, bottom, right])
  }
  return out.sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

test('examples', () => {
  assert.deepEqual(solve('[[1,0,0],[0,1,1],[0,1,1]]'), [[0, 0, 0, 0], [1, 1, 2, 2]])
  assert.deepEqual(solve('[[1,1],[1,1]]'), [[0, 0, 1, 1]])
  assert.deepEqual(solve('[[0]]'), [])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[[1,0],[0,1]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random block layouts match the bounding-box oracle', () => {
  let state = 101
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 100; t++) {
    const rows = 1 + rand(8), cols = 1 + rand(8)
    const land = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))
    // Place rectangles on cells separated by a gap so no two groups touch.
    for (let by = 0; by < rows; by += 3) for (let bx = 0; bx < cols; bx += 3) {
      if (rand(2) === 0) continue
      const h = 1 + rand(2), w = 1 + rand(2)
      for (let y = by; y < Math.min(rows, by + h); y++) for (let x = bx; x < Math.min(cols, bx + w); x++) land[y][x] = 1
    }
    assert.deepEqual(solve(JSON.stringify(land)), oracle(land), JSON.stringify(land))
  }
})
