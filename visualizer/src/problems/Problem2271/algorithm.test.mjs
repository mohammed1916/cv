import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2271 official examples', () => {
  assert.equal(solve({ tiles: [[1, 5], [10, 11], [12, 18], [20, 25], [30, 32]], carpet_length: 10 }), 9)
  assert.equal(solve({ tiles: [[10, 11], [1, 1]], carpet_length: 2 }), 2)
})

test('2271 rejects overlapping tiles', () => {
  assert.throws(() => parseInput('{"tiles":[[1,5],[4,8]],"carpet_length":3}'), /overlap/)
})

// Independent oracle: try every carpet start position from 1 to 40 and count white tiles under it.
function oracle({ tiles, carpet_length: length }) {
  const white = new Set()
  for (const [l, r] of tiles) for (let x = l; x <= r; x++) white.add(x)
  let best = 0
  for (let start = 1; start <= 40; start++) {
    let covered = 0
    for (let x = start; x < start + length; x++) if (white.has(x)) covered++
    best = Math.max(best, covered)
  }
  return best
}

test('2271 seeded random tile sets match every carpet position', () => {
  let seed = 2271
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const tiles = []
    let position = 1 + rnd(5)
    const count = 1 + rnd(6)
    for (let i = 0; i < count && position <= 38; i++) {
      const end = Math.min(40, position + rnd(4))
      tiles.push([position, end])
      position = end + 2 + rnd(5)
    }
    const input = { tiles, carpet_length: 1 + rnd(12) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
