import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = move_time => buildTrace(parseInput(JSON.stringify({ move_time }))).result

test('3341 examples', () => {
  assert.equal(solve([[0, 4], [4, 4]]), 6)
  assert.equal(solve([[0, 0, 0], [0, 0, 0]]), 3)
  assert.equal(solve([[0, 1], [1, 2]]), 3)
})

test('3341 waits for the last room to open, then takes one second', () => {
  // Both routes reach the neighbours by time 1; the last room opens at 9, so entering at 9 arrives at 10.
  assert.equal(solve([[0, 0], [0, 9]]), 10)
})

test('3341 rejects a ragged grid', () => {
  assert.throws(() => parseInput('{"move_time":[[0,1],[2]]}'))
})

// Independent oracle: relax every room repeatedly with the same entry rule until nothing changes.
function oracle(moveTime) {
  const rows = moveTime.length, cols = moveTime[0].length
  const arrive = Array.from({ length: rows }, () => new Array(cols).fill(Infinity))
  arrive[0][0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (arrive[r][c] === Infinity) continue
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        const time = Math.max(arrive[r][c], moveTime[nr][nc]) + 1
        if (time < arrive[nr][nc]) { arrive[nr][nc] = time; changed = true }
      }
    }
  }
  return arrive[rows - 1][cols - 1]
}

test('3341 random grids match a relaxation oracle', () => {
  let seed = 3341
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 2 + rnd(4), cols = 2 + rnd(4)
    const moveTime = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(10)))
    assert.equal(solve(moveTime), oracle(moveTime), JSON.stringify(moveTime))
  }
})
