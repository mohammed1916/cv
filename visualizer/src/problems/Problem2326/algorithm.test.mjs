import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2326 official example', () => {
  assert.deepEqual(
    solve({ m: 3, n: 5, head: [3, 0, 2, 6, 8, 1, 7, 9, 4, 2, 5, 5, 0] }),
    [[3, 0, 2, 6, 8], [5, 0, -1, -1, 1], [5, 2, 4, 9, 7]],
  )
})

test('2326 a single row and a list longer than the matrix', () => {
  assert.deepEqual(solve({ m: 1, n: 4, head: [1, 2] }), [[1, 2, -1, -1]])
  assert.deepEqual(solve({ m: 1, n: 2, head: [5, 6, 7, 8] }), [[5, 6]])
})

test('2326 rejects a value above 99', () => {
  assert.throws(() => parseInput('{"m":1,"n":1,"head":[100]}'))
})

// Independent oracle: walk the grid by turning whenever the next cell is out of bounds or already visited.
function oracle({ m, n, head }) {
  const seen = Array.from({ length: m }, () => Array(n).fill(false))
  const dr = [0, 1, 0, -1]
  const dc = [1, 0, -1, 0]
  const order = []
  let r = 0
  let c = 0
  let d = 0
  for (let step = 0; step < m * n; step++) {
    order.push([r, c])
    seen[r][c] = true
    const nr = r + dr[d]
    const nc = c + dc[d]
    if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) d = (d + 1) % 4
    r += dr[d]
    c += dc[d]
  }
  const out = Array.from({ length: m }, () => Array(n).fill(-1))
  order.forEach(([row, col], k) => { out[row][col] = k < head.length ? head[k] : -1 })
  return out
}

test('2326 random inputs match a turn-on-visited oracle', () => {
  let seed = 2326
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { m: 1 + rnd(6), n: 1 + rnd(6), head: Array.from({ length: 1 + rnd(12) }, () => rnd(100)) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
