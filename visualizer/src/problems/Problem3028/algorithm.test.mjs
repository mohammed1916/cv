import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3028 official examples', () => {
  assert.equal(solve('{"nums":[2,3,-5]}'), 1)
  assert.equal(solve('{"nums":[3,2,-3,-4]}'), 0)
})

test('3028 rejects a step outside -10 to 10', () => {
  assert.throws(() => parseInput('{"nums":[11]}'))
})

// Independent oracle: the ant is on the boundary after step i exactly when the sum of nums[0..i] is zero.
function oracle({ nums }) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    if (nums.slice(0, i + 1).reduce((a, b) => a + b, 0) === 0) count += 1
  }
  return count
}

test('3028 seeded random cases match a prefix-sum oracle', () => {
  let seed = 3028
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => rnd(11) - 5) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
