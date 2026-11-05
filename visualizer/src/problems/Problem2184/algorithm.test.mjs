import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (height, width, bricks) => buildTrace(parseInput(JSON.stringify({ height, width, bricks }))).result

test('2184 worked examples', () => {
  assert.equal(solve(2, 3, [1, 2]), 2)
  assert.equal(solve(1, 1, [1]), 1)
  assert.equal(solve(3, 1, [1]), 1)
  assert.equal(solve(1, 4, [1, 2]), 5)
})

test('2184 rejects invalid input', () => {
  assert.throws(() => parseInput('{"height":4,"width":2,"bricks":[1]}'))
  assert.throws(() => parseInput('{"height":1,"width":2,"bricks":[1,1]}'))
  assert.throws(() => parseInput('{"height":1,"width":2,"bricks":[3]}'))
})

// Oracle: brute force over every sequence of rows (each row a layout) and check adjacent seams directly.
function oracle(height, width, bricks) {
  const rows = []
  const dfs = (total, path) => {
    if (total === width) { rows.push(path.slice()); return }
    for (const b of bricks) if (total + b <= width) { path.push(b); dfs(total + b, path); path.pop() }
  }
  dfs(0, [])
  const seamSet = r => { const s = new Set(); let a = 0; for (const b of r.slice(0, -1)) { a += b; s.add(a) } return s }
  const seams = rows.map(seamSet)
  const ok = (i, j) => ![...seams[i]].some(v => seams[j].has(v))
  let count = 0
  const go = (r, last) => {
    if (r === height) { count++; return }
    for (let j = 0; j < rows.length; j++) if (last < 0 || ok(last, j)) go(r + 1, j)
  }
  go(0, -1)
  return count % 1000000007
}

test('2184 small walls match a brute-force oracle', () => {
  for (const [h, w, b] of [[2, 4, [1, 2]], [3, 4, [1, 2]], [2, 5, [1, 2, 3]], [3, 6, [2, 3]], [2, 6, [1, 3]], [1, 7, [2, 5]]]) {
    assert.equal(solve(h, w, b), oracle(h, w, b), JSON.stringify([h, w, b]))
  }
})

test('2184 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"height":2,"width":3,"bricks":[1,2]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
