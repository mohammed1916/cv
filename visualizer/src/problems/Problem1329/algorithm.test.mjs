import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = mat => buildTrace(parseInput(JSON.stringify({ mat }))).result

test('1329 official examples', () => {
  assert.deepEqual(solve([[3, 3, 1, 1], [2, 2, 1, 2], [1, 1, 1, 2]]), [[1, 1, 1, 1], [1, 2, 2, 2], [1, 2, 3, 3]])
  assert.deepEqual(solve([[11, 25, 66, 1, 69, 7], [23, 55, 17, 45, 15, 52], [75, 31, 36, 44, 58, 8], [22, 27, 33, 25, 68, 4], [84, 28, 14, 11, 5, 50]]), [[5, 17, 4, 1, 52, 7], [11, 11, 25, 45, 8, 69], [14, 23, 25, 44, 58, 15], [22, 27, 31, 36, 50, 66], [84, 28, 75, 33, 55, 68]])
})

test('1329 a single row has one diagonal per column', () => {
  assert.deepEqual(solve([[5, 2, 9]]), [[5, 2, 9]])
})

test('1329 rejects values below 1', () => {
  assert.throws(() => parseInput('{"mat":[[0]]}'))
})

// Independent oracle: group cells by row minus column, sort each group with the built-in sort, write back.
function oracle(mat) {
  const groups = new Map()
  mat.forEach((row, r) => row.forEach((v, c) => {
    const key = r - c
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push([r, c, v])
  }))
  const out = mat.map(row => [...row])
  for (const cells of groups.values()) {
    const sorted = cells.map(([, , v]) => v).sort((a, b) => a - b)
    cells.forEach(([r, c], i) => { out[r][c] = sorted[i] })
  }
  return out
}

test('1329 seeded random matrices match the grouped-sort oracle', () => {
  let seed = 1329
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(100)))
    assert.deepEqual(solve(mat), oracle(mat), JSON.stringify(mat))
  }
})
