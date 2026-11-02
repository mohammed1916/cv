import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2679 official examples', () => {
  assert.equal(solve([[7, 2, 1], [6, 4, 2], [6, 5, 3], [3, 2, 1]]), 15)
  assert.equal(solve([[1]]), 1)
})

test('2679 edge cases', () => {
  assert.equal(solve([[0, 0], [0, 0]]), 0)
  assert.equal(solve([[5], [3], [9]]), 9)
  assert.equal(solve([[1, 2, 3]]), 3 + 2 + 1)
  assert.equal(solve([[4, 4], [4, 4]]), 8)
})

test('2679 rejects ragged rows and out-of-range values', () => {
  assert.throws(() => parseInput('{"nums":[[1,2],[3]]}'))
  assert.throws(() => parseInput('{"nums":[[1001]]}'))
  assert.throws(() => parseInput('{"nums":[[-1]]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

test('2679 frames end at the result', () => {
  const trace = buildTrace({ nums: [[7, 2, 1], [6, 4, 2]] })
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.equal(trace.frames.at(-1).score, trace.result)
})

// Independent oracle: literally play the game. Each round removes the maximum
// from every row and adds the largest removed value; rows shrink until empty.
function oracle(nums) {
  const rows = nums.map(row => [...row])
  let score = 0
  while (rows[0].length > 0) {
    let roundMax = 0
    for (const row of rows) {
      let at = 0
      for (let k = 1; k < row.length; k++) if (row[k] > row[at]) at = k
      roundMax = Math.max(roundMax, row[at])
      row.splice(at, 1)
    }
    score += roundMax
  }
  return score
}

test('2679 random matrices match the play-the-game oracle', () => {
  let seed = 2679
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const nums = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(20)))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
