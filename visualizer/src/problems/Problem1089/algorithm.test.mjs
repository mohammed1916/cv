import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(parseInput(JSON.stringify(values))).result

test('1089 sample arrays', () => {
  assert.deepEqual(solve([1, 0, 2, 3, 0, 4, 5, 0]), [1, 0, 0, 2, 3, 0, 0, 4])
  assert.deepEqual(solve([0, 3, 9]), [0, 0, 3])
  assert.deepEqual(solve([8, 9]), [8, 9])
})

test('1089 zero in the last slot and all zeros', () => {
  assert.deepEqual(solve([1, 2, 3, 0]), [1, 2, 3, 0])
  assert.deepEqual(solve([0, 0, 0]), [0, 0, 0])
  assert.deepEqual(solve([4]), [4])
})

test('1089 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /1 to 20/)
  assert.throws(() => parseInput('[10]'), /single digits/)
  assert.throws(() => parseInput('[-1]'), /single digits/)
})

test('1089 frames point at real code and Python lines', () => {
  const { frames } = buildTrace([1, 0, 2])
  const pyCount = python.split('\n').length
  for (const frame of frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount, frame.message)
  }
})

// Independent oracle: build the full expanded list with a new array, then truncate.
test('1089 random digit arrays match an expanded-copy oracle', () => {
  let seed = 1089
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rnd(20) }, () => (rnd(3) === 0 ? 0 : 1 + rnd(9)))
    const expanded = arr.flatMap(v => (v === 0 ? [0, 0] : [v]))
    const oracle = expanded.slice(0, arr.length)
    assert.deepEqual(solve(arr), oracle, JSON.stringify(arr))
  }
})
