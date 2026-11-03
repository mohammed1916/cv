import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

// Oracle: literally remove each window, replay the moves, and collect the endpoints.
function oracle(s, k) {
  const moves = { U: [0, 1], D: [0, -1], L: [-1, 0], R: [1, 0] }
  const ends = new Set()
  for (let i = 0; i + k <= s.length; i++) {
    const rest = s.slice(0, i) + s.slice(i + k)
    let x = 0; let y = 0
    for (const c of rest) { x += moves[c][0]; y += moves[c][1] }
    ends.add(`${x},${y}`)
  }
  return ends.size
}

test('3694 invented examples', () => {
  assert.equal(solve('RRUDL', 2), oracle('RRUDL', 2))
  assert.equal(solve('UUDD', 2), oracle('UUDD', 2))
})

test('3694 matches the literal-removal oracle', () => {
  for (const [s, k] of [['LUL', 1], ['ULDRLU', 3], ['RRRR', 4], ['UDLRUDLR', 2]]) assert.equal(solve(s, k), oracle(s, k))
})
