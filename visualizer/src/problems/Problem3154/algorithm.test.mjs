import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = k => buildTrace(parseInput(JSON.stringify({ k }))).result

test('3154 examples', () => {
  assert.equal(solve(0), 2)
  assert.equal(solve(1), 4)
})

test('3154 rejects bad input', () => {
  assert.throws(() => parseInput('{"k":-1}'))
  assert.throws(() => parseInput('{"k":31}'))
})

// Independent oracle: enumerate every operation sequence with a bounded stair range and jump count, and count the
// sequences that end on stair k. The bounds are generous, so nothing that can end on k is cut off.
function oracle(k) {
  const cap = 4 * k + 16
  const maxJump = 8
  let total = 0
  const walk = (stair, jump, canDown) => {
    if (stair === k) total++
    if (canDown && stair > 0) walk(stair - 1, jump, false)
    if (jump < maxJump && stair + 2 ** jump <= cap) walk(stair + 2 ** jump, jump + 1, true)
  }
  walk(1, 0, true)
  return total
}

test('3154 every k up to 25 matches the bounded enumeration', () => {
  for (let k = 0; k <= 25; k++) assert.equal(solve(k), oracle(k), `k=${k}`)
})
