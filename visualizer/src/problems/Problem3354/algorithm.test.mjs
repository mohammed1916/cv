import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3354 official example', () => {
  assert.equal(solve('{"nums":[1,0,2,0,3]}'), 2)
})

test('3354 rejects a value above 5', () => {
  assert.throws(() => parseInput('{"nums":[6]}'))
})

// Independent oracle: for a zero with sums L on the left and R on the right, both directions work when L equals R,
// one works when they differ by one, and none works otherwise.
function oracle({ nums }) {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) continue
    const left = nums.slice(0, i).reduce((a, b) => a + b, 0)
    const right = nums.slice(i + 1).reduce((a, b) => a + b, 0)
    if (left === right) total += 2
    else if (Math.abs(left - right) === 1) total += 1
  }
  return total
}

test('3354 seeded random arrays match the sum-balance oracle', () => {
  let seed = 3354
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => (rnd(3) === 0 ? 0 : rnd(6))) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
