import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, meetings) => buildTrace(parseInput(JSON.stringify({ n, meetings }))).result

test('2402 official examples', () => {
  assert.equal(solve(2, [[0, 10], [1, 5], [2, 7], [3, 4]]), 0)
  assert.equal(solve(3, [[1, 20], [2, 10], [3, 5], [4, 9], [6, 8]]), 1)
})

test('2402 a meeting waits for a room and keeps its length', () => {
  // The single room holds 0-5, so 1-3 starts at 5 and ends at 7.
  assert.equal(solve(1, [[0, 5], [1, 3]]), 0)
  assert.throws(() => parseInput('{"n":2,"meetings":[[1,2],[1,3]]}'))
})

// Independent oracle: track the time each room becomes free and choose the room by scanning all of them.
function oracle(n, meetings) {
  const freeAt = Array(n).fill(0)
  const used = Array(n).fill(0)
  const sorted = [...meetings].sort((a, b) => a[0] - b[0])
  for (const [s, e] of sorted) {
    const duration = e - s
    let room = -1
    for (let r = 0; r < n; r++) if (freeAt[r] <= s) { room = r; break }
    let begin = s
    if (room === -1) {
      room = 0
      for (let r = 1; r < n; r++) if (freeAt[r] < freeAt[room]) room = r
      begin = freeAt[room]
    }
    used[room]++
    freeAt[room] = begin + duration
  }
  const best = Math.max(...used)
  return used.indexOf(best)
}

test('2402 random inputs match a free-time oracle', () => {
  let seed = 2402
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4)
    const starts = [...new Set(Array.from({ length: 1 + rnd(6) }, () => rnd(25)))]
    const meetings = starts.map(s => [s, s + 1 + rnd(8)])
    assert.equal(solve(n, meetings), oracle(n, meetings), JSON.stringify({ n, meetings }))
  }
})
