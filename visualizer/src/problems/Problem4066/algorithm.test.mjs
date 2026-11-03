import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

const countEqualPairs = a => a.reduce((n, v, i) => n + (i > 0 && a[i - 1] === v ? 1 : 0), 0)

// Independent oracle: try every ordered pair of values, replace, and count directly.
function oracle(nums) {
  let best = countEqualPairs(nums)
  const values = [...new Set(nums)]
  for (const x of values) {
    for (const y of values) {
      if (x === y) continue
      const replaced = nums.map(v => (v === x ? y : v))
      best = Math.max(best, countEqualPairs(replaced))
    }
  }
  return best
}

test('4066 an equal pair can be created by merging neighbours', () => {
  assert.equal(solve([1, 2, 3]), 1)
  assert.equal(solve([1, 2, 1, 2]), 3) // replacing 2 with 1 makes all three adjacent pairs equal
})

test('4066 existing equal pairs survive and the best neighbour pair is added', () => {
  assert.equal(solve([1, 1, 2, 2, 1, 1]), 5)
  assert.equal(solve([7, 7, 7]), 2)
})

test('4066 all values distinct with no adjacency gain', () => {
  assert.equal(solve([4, 9]), 1)
  assert.equal(solve([5, 6, 7, 8]), 1)
})

test('4066 random arrays match the replacement oracle and frames stay valid', () => {
  let seed = 4066
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 2 + rnd(9) }, () => 1 + rnd(4))
    const run = buildTrace(nums)
    assert.equal(run.result, oracle(nums), JSON.stringify(nums))
    checkFrames(run)
  }
})

test('4066 rejects short arrays', () => {
  assert.throws(() => parseInput('[1]'))
})
