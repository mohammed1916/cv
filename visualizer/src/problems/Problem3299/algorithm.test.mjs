import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.maps.up.every(e => e.count >= 0))
  }
}

test('3299 authored presets', () => {
  // [1,2,3,2]: singles 8; pairs [1,2] (twice, using either 2) 6, [2,3] 5, [3,2] 5; triple [1,2,3] 6.
  assert.equal(solve([1, 2, 3, 2]), 30)
  // [4,5,3,4]: singles 16, [4,5] 9, [4,3] 7, [5,4] 9, [3,4] 7.
  assert.equal(solve([4, 5, 3, 4]), 48)
  assert.equal(solve([3, 2, 1]), 20)
  assert.equal(solve([7]), 7)
})

test('3299 a value with no neighbour in either chain stands alone', () => {
  assert.equal(solve([1, 5, 9]), 15)
  // Singles -3, pairs -3 and -1, triple -3: total -10, reported modulo 1000000007.
  assert.equal(solve([-2, -1, 0]), 999999997)
})

test('3299 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[21]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Independent oracle: enumerate every nonempty subsequence (by index subset) and test its steps.
function oracle(nums) {
  let total = 0
  const n = nums.length
  for (let mask = 1; mask < 1 << n; mask++) {
    const seq = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) seq.push(nums[i])
    let up = true
    let down = true
    for (let k = 1; k < seq.length; k++) {
      if (seq[k] - seq[k - 1] !== 1) up = false
      if (seq[k] - seq[k - 1] !== -1) down = false
    }
    if (seq.length === 1 || up || down) total += seq.reduce((s, x) => s + x, 0)
  }
  return ((total % 1000000007) + 1000000007) % 1000000007
}

test('3299 random arrays match a subsequence enumeration oracle', () => {
  let seed = 3299
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(7) - 3)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3299 frames keep pseudocode and python lines valid', () => {
  checkFrames(buildTrace([4, 5, 3, 4]))
})
