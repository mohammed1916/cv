import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2596 official examples', () => {
  assert.equal(solve('{"grid":[[0,11,16,5,20],[17,4,19,10,15],[12,1,8,21,6],[3,18,23,14,9],[24,13,2,7,22]]}'), true)
  assert.equal(solve('{"grid":[[0,3,6],[5,8,1],[2,7,4]]}'), false)
})

test('2596 rejects a grid that is not a permutation', () => {
  assert.throws(() => parseInput('{"grid":[[0,1,2],[3,4,5],[6,7,7]]}'))
})

// Independent oracle: check each consecutive pair by trying all eight knight offsets from the first cell.
function oracle({ grid }) {
  const n = grid.length
  const pos = {}
  grid.forEach((row, r) => row.forEach((v, c) => { pos[v] = [r, c] }))
  if (grid[0][0] !== 0) return false
  const offsets = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
  for (let k = 0; k < n * n - 1; k++) {
    const [r1, c1] = pos[k]
    const [r2, c2] = pos[k + 1]
    if (!offsets.some(([dr, dc]) => r1 + dr === r2 && c1 + dc === c2)) return false
  }
  return true
}

test('2596 seeded knight walks and shuffles match the offset oracle', () => {
  let seed = 2596
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const moves = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(3)
    let grid = null
    // Try a random knight walk from the corner; a full walk is a tour, otherwise shuffle the values.
    for (let attempt = 0; attempt < 40 && !grid; attempt++) {
      const board = Array.from({ length: n }, () => Array(n).fill(-1))
      board[0][0] = 0
      let r = 0
      let c = 0
      let count = 1
      for (;;) {
        const options = moves.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < n && nc < n && board[nr][nc] === -1)
        if (!options.length) break
        ;[r, c] = options[rnd(options.length)]
        board[r][c] = count
        count += 1
      }
      if (count === n * n) grid = board
    }
    if (!grid) {
      const values = Array.from({ length: n * n }, (_, i) => i)
      for (let i = values.length - 1; i > 0; i--) { const j = rnd(i + 1); [values[i], values[j]] = [values[j], values[i]] }
      grid = Array.from({ length: n }, (_, r) => values.slice(r * n, r * n + n))
    }
    const input = { grid }
    const expected = oracle(input)
    assert.equal(solve(JSON.stringify(input)), expected, JSON.stringify(input))
  }
})
