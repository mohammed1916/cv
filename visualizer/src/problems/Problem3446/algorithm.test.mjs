import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3446 official example', () => {
  assert.deepEqual(solve({ grid: [[1, 7, 3], [9, 8, 2], [4, 5, 6]] }), [[8, 2, 3], [9, 6, 7], [4, 5, 1]])
})

test('3446 a single cell and a one-diagonal matrix stay put', () => {
  assert.deepEqual(solve({ grid: [[5]] }), [[5]])
  assert.deepEqual(solve({ grid: [[1, 2], [3, 4]] }), [[4, 2], [3, 1]])
})

test('3446 rejects a non-square grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2,3],[4,5,6]]}'))
})

// Independent oracle: group cells by row minus column, sort each group, and place values back in row-major order.
function oracle({ grid }) {
  const n = grid.length
  const groups = new Map()
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const key = r - c
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(grid[r][c])
  }
  for (const [key, list] of groups) list.sort((a, b) => (key >= 0 ? b - a : a - b))
  const cursor = new Map([...groups.keys()].map(key => [key, 0]))
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
    const key = r - c
    const value = groups.get(key)[cursor.get(key)]
    cursor.set(key, cursor.get(key) + 1)
    return value
  }))
}

test('3446 random matrices match a grouped-sort oracle', () => {
  let seed = 3446
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(21)))
    assert.deepEqual(solve({ grid }), oracle({ grid }), JSON.stringify(grid))
  }
})
