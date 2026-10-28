import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2369 official examples', () => {
  assert.equal(solve([4, 4, 4, 5, 6]), true)
  assert.equal(solve([1, 1, 1, 2]), false)
})

test('2369 a run of consecutive values is one valid piece', () => {
  assert.equal(solve([1, 2, 3]), true)
  assert.equal(solve([1, 2]), false)
})

test('2369 rejects a value outside 1 to 6', () => {
  assert.throws(() => parseInput('{"nums":[1,7]}'))
})

// Independent oracle: recursively try every first piece of length 2 or 3 and check the rest.
function oracle(nums) {
  const isPiece = (start, len) => {
    const piece = nums.slice(start, start + len)
    if (len === 2) return piece[0] === piece[1]
    const [a, b, c] = piece
    return (a === b && b === c) || (b === a + 1 && c === b + 1)
  }
  const can = start => {
    if (start === nums.length) return true
    for (const len of [2, 3]) {
      if (start + len <= nums.length && isPiece(start, len) && can(start + len)) return true
    }
    return false
  }
  return can(0)
}

test('2369 seeded random arrays match a recursive partition search', () => {
  let seed = 2369
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 2 + rnd(9) }, () => 1 + rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
