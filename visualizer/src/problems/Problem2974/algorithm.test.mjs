import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

// Independent oracle: simulate the game literally, finding the minimum of the remaining values each time.
function oracle(nums) {
  const left = [...nums]
  const takeMin = () => {
    let idx = 0
    for (let i = 1; i < left.length; i++) if (left[i] < left[idx]) idx = i
    return left.splice(idx, 1)[0]
  }
  const out = []
  while (left.length) {
    const alice = takeMin()
    const bob = takeMin()
    out.push(bob, alice)
  }
  return out
}

test('2974 examples', () => {
  assert.deepEqual(solve([5, 4, 2, 3]), [3, 2, 5, 4])
  assert.deepEqual(solve([2, 5]), [5, 2])
})

test('2974 rejects an odd length', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3]}'))
})

test('2974 random arrays match a literal simulation', () => {
  let seed = 2974
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 * (1 + rnd(8)) }, () => 1 + rnd(100))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
