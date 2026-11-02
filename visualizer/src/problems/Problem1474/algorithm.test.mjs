import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (list, m, n) => buildTrace({ list, m, n }).result

function checkFrames(run) {
  const pyLines = python.split('\n')
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1474 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 2, 3), [1, 2, 6, 7, 11, 12])
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1, 1), [1, 3, 5, 7, 9])
  assert.deepEqual(solve([5], 3, 2), [5])
  checkFrames(buildTrace({ list: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], m: 2, n: 3 }))
})

test('1474 edge cases: the list ends inside a keep block, or right after one', () => {
  assert.deepEqual(solve([1, 2, 3], 5, 1), [1, 2, 3])
  assert.deepEqual(solve([1, 2, 3, 4], 2, 2), [1, 2])
  assert.deepEqual(solve([1, 2, 3, 4, 5], 2, 5), [1, 2])
})

// Oracle: within each cycle of m + n positions, the first m survive.
const oracle = (list, m, n) => list.filter((_, p) => p % (m + n) < m)

test('1474 random lists match a modular oracle', () => {
  let seed = 1474
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % k }
  for (let trial = 0; trial < 300; trial++) {
    const list = Array.from({ length: 1 + rand(20) }, () => rand(100))
    const m = 1 + rand(10)
    const n = 1 + rand(10)
    assert.deepEqual(solve(list, m, n), oracle(list, m, n), JSON.stringify({ list, m, n }))
  }
})

test('1474 rejects invalid block sizes', () => {
  assert.throws(() => parseInput('{"list":[1],"m":0,"n":1}'))
  assert.throws(() => parseInput('{"list":[],"m":1,"n":1}'))
})
