import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = arr => buildTrace(parseInput(JSON.stringify(arr)))

test('official examples', () => {
  assert.deepEqual(run([1, 2, 3, 4, 5]).result, [3, 4, 5])
  assert.deepEqual(run([1, 2, 3, 4, 5, 6]).result, [4, 5, 6])
})

test('matches floor(n/2) oracle for every length', () => {
  for (let n = 1; n <= 100; n++) {
    const arr = Array.from({ length: n }, (_, i) => (i % 100) + 1)
    const trace = run(arr)
    assert.deepEqual(trace.result, arr.slice(Math.floor(n / 2)))
    assert.equal(trace.frames.at(-1).phase, 'done')
    assert.equal(trace.frames[0].phase, 'start')
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('"x"'))
  assert.throws(() => parseInput('[1.5]'))
})
