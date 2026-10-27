import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = stones => buildTrace(parseInput(JSON.stringify({ stones }))).result

test('1563 official examples', () => {
  assert.equal(solve([6, 2, 3, 4, 5, 5]), 18)
  assert.equal(solve([7, 7, 7, 7, 7, 7, 7]), 28)
  assert.equal(solve([4]), 0)
})

test('1563 a tie lets Alice choose the better half', () => {
  // Split [1, 1]: the sides tie, and Alice keeps the one worth 1 more when the game goes on.
  assert.equal(solve([1, 1]), 1)
  assert.equal(solve([3, 1, 1, 3]), 5)
})

test('1563 rejects bad input', () => {
  assert.throws(() => parseInput('{"stones":[]}'))
  assert.throws(() => parseInput('{"stones":[0]}'))
  assert.throws(() => parseInput('{"stones":[21]}'))
})

// Independent oracle: plain top-down game search on the array itself, with no table of segments.
function oracle(stones) {
  const play = row => {
    if (row.length === 1) return 0
    let top = 0
    for (let k = 1; k < row.length; k++) {
      const left = row.slice(0, k)
      const right = row.slice(k)
      const l = left.reduce((a, b) => a + b, 0)
      const r = right.reduce((a, b) => a + b, 0)
      let candidate
      if (l < r) candidate = l + play(left)
      else if (r < l) candidate = r + play(right)
      else candidate = Math.max(l + play(left), r + play(right))
      top = Math.max(top, candidate)
    }
    return top
  }
  return play(stones)
}

test('1563 random rows match the recursive game oracle', () => {
  let seed = 1563
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const stones = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(9))
    assert.equal(solve(stones), oracle(stones), JSON.stringify(stones))
  }
})
