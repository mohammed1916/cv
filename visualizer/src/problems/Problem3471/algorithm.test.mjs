import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3471 worked examples', () => {
  // Windows of 3: [3,9,2], [9,2,1], [2,1,7]. Only 3 and 7 appear in exactly one window; 7 is larger.
  assert.equal(solve([3, 9, 2, 1, 7], 3), 7)
  assert.equal(solve([3, 9, 7, 2, 1, 7], 4), 3)
  assert.equal(solve([0, 0], 1), -1)
})

test('3471 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: for each candidate value, count the windows that contain it by scanning them directly.
function oracle(nums, k) {
  let best = -1
  for (let x = 0; x <= 50; x++) {
    let windowsWithX = 0
    for (let i = 0; i + k <= nums.length; i++) if (nums.slice(i, i + k).includes(x)) windowsWithX++
    if (windowsWithX === 1 && x > best) best = x
  }
  return best
}

test('3471 random arrays match a window-scan oracle', () => {
  let seed = 3471
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const spread = 1 + rnd(51)
    const nums = Array.from({ length: 1 + rnd(14) }, () => rnd(spread))
    const k = 1 + rnd(nums.length)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
