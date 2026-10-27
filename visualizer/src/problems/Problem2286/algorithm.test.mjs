import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2286 official style example', () => {
  const ops = [['gather', 4, 0], ['gather', 2, 0], ['scatter', 5, 1], ['scatter', 5, 1]]
  // After seats 0 to 3 of row 0 are booked, only one seat there is free, so the second gather fails.
  assert.deepEqual(solve({ n: 2, m: 5, ops }), [[0, 0], [], true, false])
})

test('2286 gather needs consecutive seats in one row', () => {
  // Row 0 has one seat free at each end after the first booking, so a group of 2 goes to row 1.
  const ops = [['gather', 3, 0], ['gather', 2, 1]]
  assert.deepEqual(solve({ n: 2, m: 4, ops }), [[0, 0], [1, 0]])
})

test('2286 rejects a gather larger than a row', () => {
  assert.throws(() => parseInput('{"n":1,"m":3,"ops":[["gather",4,0]]}'))
})

// Independent oracle: keep a plain seat grid and scan it directly for every operation.
function oracle({ n, m, ops }) {
  const grid = Array.from({ length: n }, () => Array(m).fill(false))
  const out = []
  for (const [name, k, maxRow] of ops) {
    if (name === 'gather') {
      let found = null
      for (let r = 0; r <= maxRow && !found; r++) {
        for (let s = 0; s + k <= m && !found; s++) {
          let free = true
          for (let c = s; c < s + k; c++) if (grid[r][c]) { free = false; break }
          if (free) found = [r, s]
        }
      }
      if (found) for (let c = found[1]; c < found[1] + k; c++) grid[found[0]][c] = true
      out.push(found ?? [])
    } else {
      let free = 0
      for (let r = 0; r <= maxRow; r++) for (let c = 0; c < m; c++) if (!grid[r][c]) free++
      if (free < k) { out.push(false); continue }
      let left = k
      for (let r = 0; r <= maxRow; r++) for (let c = 0; c < m; c++) {
        if (left > 0 && !grid[r][c]) { grid[r][c] = true; left-- }
      }
      out.push(true)
    }
  }
  return out
}

test('2286 random bookings match a direct grid scan', () => {
  let seed = 2286
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4), m = 1 + rnd(6)
    const ops = []
    for (let k = 1 + rnd(8); k > 0; k--) {
      if (rnd(2) === 0) ops.push(['gather', 1 + rnd(m), rnd(n)])
      else ops.push(['scatter', 1 + rnd(n * m), rnd(n)])
    }
    const input = { n, m, ops }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
