import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1847 official style examples', () => {
  assert.deepEqual(solve({ rooms: [[2, 2], [1, 2], [3, 2]], queries: [[3, 1], [3, 3], [5, 2]] }), [3, -1, 3])
  // Hand-checked: sizes at least 4 are rooms 1 and 3; query 1 prefers 2 and both are one away, so the smaller id wins.
  assert.deepEqual(solve({ rooms: [[1, 4], [2, 3], [3, 5], [4, 3], [5, 2]], queries: [[2, 3], [2, 4], [2, 5]] }), [2, 1, 3])
})

test('1847 a tie goes to the smaller id and an empty set gives -1', () => {
  assert.deepEqual(solve({ rooms: [[4, 1], [6, 1]], queries: [[5, 1], [5, 2]] }), [4, -1])
})

test('1847 rejects duplicate room ids', () => {
  assert.throws(() => parseInput('{"rooms":[[1,2],[1,3]],"queries":[[1,1]]}'))
})

// Independent oracle: for each query, scan every room that is big enough and pick the best by (distance, id).
function oracle({ rooms, queries }) {
  return queries.map(([preferred, minSize]) => {
    let best = null
    for (const [id, size] of rooms) {
      if (size < minSize) continue
      if (best === null) best = id
      else {
        const d = Math.abs(id - preferred)
        const bd = Math.abs(best - preferred)
        if (d < bd || (d === bd && id < best)) best = id
      }
    }
    return best === null ? -1 : best
  })
}

test('1847 random inputs match a brute-force scan oracle', () => {
  let seed = 1847
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 10 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const rooms = pool.slice(0, 1 + rnd(6)).map(id => [id, 1 + rnd(10)])
    const queries = Array.from({ length: 1 + rnd(6) }, () => [1 + rnd(10), 1 + rnd(10)])
    const input = { rooms, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
