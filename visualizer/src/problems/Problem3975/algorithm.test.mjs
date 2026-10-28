import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (occupiedIntervals, freeStart, freeEnd) => buildTrace(parseInput(JSON.stringify({ occupiedIntervals, freeStart, freeEnd }))).result

test('3975 official examples', () => {
  assert.deepEqual(solve([[2, 6], [4, 8], [10, 10], [10, 12], [14, 16]], 7, 11), [[2, 6], [12, 12], [14, 16]])
  assert.deepEqual(solve([[1, 5], [2, 3]], 3, 8), [[1, 2]])
})

test('3975 touching intervals merge, and a window covering everything leaves nothing', () => {
  assert.deepEqual(solve([[1, 1], [2, 2]], 5, 6), [[1, 2]])
  assert.deepEqual(solve([[3, 4]], 1, 12), [])
})

test('3975 rejects an interval outside 1 to 12', () => {
  assert.throws(() => parseInput('{"occupiedIntervals":[[0,3]],"freeStart":1,"freeEnd":2}'))
})

// Independent oracle: mark every integer point occupied, clear the free window, and read off the runs.
function oracle(occupiedIntervals, freeStart, freeEnd) {
  const occupied = Array(18).fill(false)
  for (const [s, e] of occupiedIntervals) for (let p = s; p <= e; p++) occupied[p] = true
  for (let p = freeStart; p <= freeEnd; p++) occupied[p] = false
  const out = []
  let p = 1
  while (p <= 16) {
    if (occupied[p]) {
      const start = p
      while (p + 1 <= 16 && occupied[p + 1]) p++
      out.push([start, p])
    }
    p++
  }
  return out
}

test('3975 random intervals match a point-marking oracle', () => {
  let seed = 3975
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(8)
    const occupiedIntervals = Array.from({ length: count }, () => { const s = 1 + rnd(16); return [s, s + rnd(17 - s)] })
    const freeStart = 1 + rnd(16)
    const freeEnd = freeStart + rnd(17 - freeStart)
    assert.deepEqual(solve(occupiedIntervals, freeStart, freeEnd), oracle(occupiedIntervals, freeStart, freeEnd), JSON.stringify({ occupiedIntervals, freeStart, freeEnd }))
  }
})
