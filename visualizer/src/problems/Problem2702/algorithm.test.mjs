import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, x, y) => buildTrace({ nums, x, y }).result

// Independent oracle: simulate every sequence of chosen indices for k = 0, 1, 2, ...
function oracle(nums, x, y) {
  const n = nums.length
  for (let k = 0; ; k++) {
    const total = n ** k
    for (let seq = 0; seq < total; seq++) {
      const values = [...nums]
      let rest = seq
      for (let step = 0; step < k; step++) {
        const chosen = rest % n
        rest = Math.floor(rest / n)
        for (let i = 0; i < n; i++) values[i] -= i === chosen ? x : y
      }
      if (values.every((v) => v <= 0)) return k
    }
  }
}

test('2702 worked examples', () => {
  assert.equal(solve([3, 4], 3, 1), 2)
  assert.equal(solve([1, 1, 1], 2, 1), 1)
  assert.equal(solve([5], 3, 1), 2)
})

test('2702 a single small value needs one operation', () => {
  assert.equal(solve([1], 5, 1), 1)
})

test('2702 rejects out of range input', () => {
  assert.throws(() => parseInput('{"nums":[],"x":3,"y":1}'))
  assert.throws(() => parseInput('{"nums":[3],"x":1,"y":1}'))
  assert.throws(() => parseInput('{"nums":[3],"x":3,"y":0}'))
  assert.throws(() => parseInput('{"nums":[51],"x":3,"y":1}'))
})

test('2702 brute force agrees on small inputs', () => {
  const cases = [
    [[2, 7], 4, 1], [[6, 2, 9], 3, 2], [[4, 4, 1], 5, 2], [[9, 3], 4, 1], [[1, 8, 2], 3, 1], [[7, 7, 7], 6, 3],
  ]
  for (const [nums, x, y] of cases) assert.equal(solve(nums, x, y), oracle(nums, x, y), JSON.stringify({ nums, x, y }))
})

test('2702 frames name real pseudocode and python lines', () => {
  const trace = buildTrace({ nums: [3, 4], x: 3, y: 1 })
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(code[frame.activeLine - 1].text.length > 0)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines.length)
    assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.equal(typeof frame.message, 'string')
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
})
