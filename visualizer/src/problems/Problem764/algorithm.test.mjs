import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(n, mines) {
  const blocked = new Set(mines.map(([r, c]) => `${r},${c}`))
  const open = (r, c) => r >= 0 && c >= 0 && r < n && c < n && !blocked.has(`${r},${c}`)
  let best = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    let k = 1
    while (open(r - k + 1, c) && open(r + k - 1, c) && open(r, c - k + 1) && open(r, c + k - 1)) {
      if (k > best) best = k
      k++
    }
  }
  return best
}

test('764 worked examples', () => {
  assert.equal(buildTrace({ n: 5, mines: [[1, 1], [3, 3]] }).result, 3)
  assert.equal(buildTrace({ n: 1, mines: [] }).result, 1)
  assert.equal(buildTrace({ n: 2, mines: [[0, 0], [0, 1], [1, 0], [1, 1]] }).result, 0)
})

test('764 random grids match a direct plus search', () => {
  let state = 764
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(7)
    const mines = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (rand(4) === 0) mines.push([r, c])
    assert.equal(buildTrace({ n, mines }).result, brute(n, mines), JSON.stringify({ n, mines }))
  }
})

test('764 rejects a mine outside the grid', () => {
  assert.throws(() => parseInput('{"n":3,"mines":[[3,0]]}'))
})
