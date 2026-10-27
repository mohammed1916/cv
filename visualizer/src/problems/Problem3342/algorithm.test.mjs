import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = move_time => buildTrace(parseInput(JSON.stringify({ move_time }))).result

test('3342 examples', () => {
  assert.equal(solve([[0, 4], [4, 4]]), 7)
  // Three moves are needed (1 + 2 + 1 seconds) to cross a 2 by 3 grid of open rooms.
  assert.equal(solve([[0, 0, 0], [0, 0, 0]]), 4)
})

test('3342 the second move costs two seconds', () => {
  // Two moves into a 1 by 2 corridor cost 1 then 2; the room opens at 0 so no waiting is needed.
  assert.equal(solve([[0, 0], [0, 0]]), 3)
})

test('3342 rejects a value out of range', () => {
  assert.throws(() => parseInput('{"move_time":[[0,10],[0,0]]}'))
})

// Independent oracle: relax every (room, next-move-cost) state repeatedly until nothing changes.
function oracle(moveTime) {
  const rows = moveTime.length, cols = moveTime[0].length
  const arrive = Array.from({ length: rows }, () => Array.from({ length: cols }, () => [Infinity, Infinity]))
  arrive[0][0][0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (let k = 0; k < 2; k++) {
      const t = arrive[r][c][k]
      if (t === Infinity) continue
      const cost = k === 0 ? 1 : 2
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        const time = Math.max(t, moveTime[nr][nc]) + cost
        if (time < arrive[nr][nc][1 - k]) { arrive[nr][nc][1 - k] = time; changed = true }
      }
    }
  }
  return Math.min(...arrive[rows - 1][cols - 1])
}

test('3342 random grids match a state relaxation oracle', () => {
  let seed = 3342
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 2 + rnd(4), cols = 2 + rnd(4)
    const moveTime = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(10)))
    assert.equal(solve(moveTime), oracle(moveTime), JSON.stringify(moveTime))
  }
})
