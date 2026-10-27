import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1386 official examples', () => {
  assert.equal(solve({ n: 3, reserved_seats: [[1, 2], [1, 3], [1, 8], [2, 6], [3, 1], [3, 10]] }), 4)
  assert.equal(solve({ n: 2, reserved_seats: [] }), 4)
})

test('1386 a row with reservations in both ends keeps only the middle block', () => {
  // Seats 2 and 9 break the left and right blocks, so only seats 4 to 7 can seat one family.
  assert.equal(solve({ n: 1, reserved_seats: [[1, 2], [1, 9]] }), 1)
})

test('1386 rejects a seat outside 1 to 10', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 1, reserved_seats: [[1, 11]] })))
})

// Independent oracle: for each row, try every combination of the three blocks and keep the largest
// combination whose seats are all free and pairwise disjoint.
function oracle({ n, reserved_seats }) {
  const blocks = [[2, 3, 4, 5], [4, 5, 6, 7], [6, 7, 8, 9]]
  let total = 0
  for (let row = 1; row <= n; row++) {
    const taken = new Set(reserved_seats.filter(([r]) => r === row).map(([, seat]) => seat))
    let best = 0
    for (let subset = 0; subset < 8; subset++) {
      const used = new Set()
      let ok = true
      let size = 0
      for (let b = 0; b < 3; b++) {
        if (!((subset >> b) & 1)) continue
        size++
        for (const seat of blocks[b]) {
          if (taken.has(seat) || used.has(seat)) ok = false
          used.add(seat)
        }
      }
      if (ok) best = Math.max(best, size)
    }
    total += best
  }
  return total
}

test('1386 random cinemas match a block-combination oracle', () => {
  let seed = 1386
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const reserved_seats = Array.from({ length: rnd(13) }, () => [1 + rnd(n), 1 + rnd(10)])
    const input = { n, reserved_seats }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
