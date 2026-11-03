import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('4038 small cases', () => {
  assert.equal(solve([7]), 1)
  assert.equal(solve([1, 2]), 2)
  assert.equal(solve([5, 5, 6, 5]), 1)
  assert.equal(solve([1, 2, 2, 1, 3, 3, 3, 4]), 3)
})

test('4038 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace([3, 3, 1, 3])
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4038 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Independent oracle: a value is valid when its positions form one interval of consecutive indices.
function oracle(nums) {
  const values = new Set(nums)
  let count = 0
  for (const v of values) {
    const pos = nums.flatMap((x, i) => (x === v ? [i] : []))
    if (pos[pos.length - 1] - pos[0] + 1 === pos.length) count += 1
  }
  return count
}

test('4038 random inputs match an interval oracle', () => {
  let seed = 4038
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
