import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3360 ten and eleven stones win for Alice; nine cannot start', () => {
  assert.equal(solve(10), true)
  assert.equal(solve(11), true)
  assert.equal(solve(9), false)
})

test('3360 nineteen stones: Alice takes 10, Bob takes 9, Alice cannot take 8', () => {
  assert.equal(solve(19), false)
})

test('3360 rejects zero stones and more than 50', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":51}'))
})

// Independent oracle: a recursive formulation of the same forced sequence. The player to move
// with too few stones loses, so the result is decided by who faces that position.
function oracle(n) {
  const aliceWins = (stones, need, aliceToMove) => {
    if (stones < need) return !aliceToMove
    return aliceWins(stones - need, need - 1, !aliceToMove)
  }
  return aliceWins(n, 10, true)
}

test('3360 every n from 1 to 50 matches the recursive oracle', () => {
  for (let n = 1; n <= 50; n++) assert.equal(solve(n), oracle(n), `n = ${n}`)
})
