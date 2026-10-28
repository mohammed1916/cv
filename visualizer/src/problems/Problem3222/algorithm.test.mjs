import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (x, y) => buildTrace({ x, y }).result

test('3222 official examples', () => {
  assert.equal(solve(2, 7), 'Alice')
  assert.equal(solve(4, 11), 'Bob')
})

test('3222 with no full bundle the first player loses', () => {
  assert.equal(solve(1, 3), 'Bob')
  assert.equal(solve(2, 100), 'Bob') // two turns: Alice makes one, Bob makes one, Alice cannot move
})

test('3222 rejects a count below one', () => {
  assert.throws(() => parseInput('{"x":0,"y":5}'))
})

// Independent oracle: memoised game search over (x, y). A position is winning when some move
// leads to a losing position for the opponent.
function oracle(x, y, memo = new Map()) {
  const key = `${x},${y}`
  if (memo.has(key)) return memo.get(key)
  const wins = x >= 1 && y >= 4 && !oracle(x - 1, y - 4, memo)
  memo.set(key, wins)
  return wins
}

test('3222 random positions match a memoised game search', () => {
  let seed = 3222
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const x = 1 + rnd(40)
    const y = 1 + rnd(80)
    assert.equal(solve(x, y), oracle(x, y) ? 'Alice' : 'Bob', `${x},${y}`)
  }
})
