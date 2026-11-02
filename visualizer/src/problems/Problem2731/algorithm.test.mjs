import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, s, d) => buildTrace({ nums, s, d }).result

test('2731 worked examples', () => {
  assert.equal(solve([-2, 0, 2], 'RLL', 3), 8)
  assert.equal(solve([1, 0], 'RL', 2), 5)
})

test('2731 edge cases', () => {
  assert.equal(solve([4, 9], 'RR', 0), 5)
  assert.equal(solve([3], 'L', 5), 0)
  assert.equal(solve([0, 1], 'RR', 1000000000), 1)
})

test('2731 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1,1],"s":"RL","d":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"s":"RX","d":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"s":"RL","d":-1}'))
})

// Independent oracle: simulate half-second steps; robots that meet reverse direction.
function oracle(nums, s, d) {
  const pos = nums.map(x => 2 * x)
  const dir = [...s].map(c => (c === 'R' ? 1 : -1))
  for (let t = 0; t < 2 * d; t++) {
    for (let i = 0; i < pos.length; i++) pos[i] += dir[i]
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        if (pos[i] === pos[j]) { dir[i] = -dir[i]; dir[j] = -dir[j] }
      }
    }
  }
  let total = 0
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) total += Math.abs(pos[i] - pos[j]) / 2
  }
  return total % 1000000007
}

test('2731 random inputs match a half-step collision simulation', () => {
  let seed = 2731
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const count = 2 + rnd(4)
    const nums = [...new Set(Array.from({ length: count }, () => rnd(21) - 10))]
    const s = nums.map(() => (rnd(2) ? 'R' : 'L')).join('')
    const d = rnd(8)
    assert.equal(solve(nums, s, d), oracle(nums, s, d), JSON.stringify({ nums, s, d }))
  }
})
