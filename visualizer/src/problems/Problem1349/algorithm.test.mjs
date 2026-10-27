import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = seats => buildTrace(parseInput(JSON.stringify({ seats }))).result

test('1349 official example and small halls', () => {
  // The official six-column hall is wider than the visualization cap, so the trace is built directly.
  const official = [
    ['#', '.', '#', '#', '.', '#'],
    ['.', '#', '#', '#', '#', '.'],
    ['#', '.', '#', '#', '.', '#'],
  ].map(row => row.join(''))
  assert.equal(buildTrace({ seats: official }).result, 4)
  assert.equal(solve(['.']), 1)
  assert.equal(solve(['#']), 0)
  assert.equal(solve(['....']), 2)
})

test('1349 a student clashes with the upper-left and upper-right seats only', () => {
  // A student in the middle of row 2 blocks the seats diagonally above, not the seat straight above.
  assert.equal(solve(['.', '.']), 2)
  assert.equal(solve(['.#.', '...']), 4)
})

test('1349 rejects bad input', () => {
  assert.throws(() => parseInput('{"seats":[".x"]}'))
  assert.throws(() => parseInput('{"seats":["..", "."]}'))
  assert.throws(() => parseInput('{"seats":[]}'))
})

// Independent oracle: try every subset of working seats and keep the largest subset with no clashing pair.
function oracle(seats) {
  const cells = []
  seats.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '.') cells.push([r, c]) }))
  let best = 0
  for (let s = 0; s < 1 << cells.length; s++) {
    const chosen = cells.filter((_, i) => s & (1 << i))
    const taken = new Set(chosen.map(([r, c]) => `${r}:${c}`))
    const ok = chosen.every(([r, c]) => !taken.has(`${r}:${c - 1}`) && !taken.has(`${r}:${c + 1}`)
      && !taken.has(`${r - 1}:${c - 1}`) && !taken.has(`${r - 1}:${c + 1}`))
    if (ok) best = Math.max(best, chosen.length)
  }
  return best
}

test('1349 random halls match a subset oracle', () => {
  let seed = 1349
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const cols = 1 + rnd(4)
    const seats = Array.from({ length: 1 + rnd(3) }, () => Array.from({ length: cols }, () => (rnd(4) ? '.' : '#')).join(''))
    assert.equal(solve(seats), oracle(seats), JSON.stringify(seats))
  }
})
