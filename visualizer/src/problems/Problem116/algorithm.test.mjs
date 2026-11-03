import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Reference: a plain level-order walk that links each node to the next node in its level.
function reference(values) {
  const out = Array(values.length).fill(null)
  let start = 0
  for (let size = 1; start < values.length; size *= 2) {
    for (let i = start; i < start + size; i++) out[i] = i + 1 < start + size ? values[i + 1] : null
    start += size
  }
  return out
}

test('seven node tree links each level from left to right', () => {
  assert.deepEqual(buildTrace(parseInput('[1,2,3,4,5,6,7]')).result, [null, 3, null, 5, 6, 7, null])
})

test('single node and three node trees', () => {
  assert.deepEqual(buildTrace([5]).result, [null])
  assert.deepEqual(buildTrace([9, 4, 8]).result, [null, 8, null])
})

test('fifteen node tree matches the level-order reference', () => {
  const values = Array.from({ length: 15 }, (_, i) => (i * 7) % 100)
  assert.deepEqual(buildTrace(values).result, reference(values))
})

test('every perfect size up to 15 matches the reference', () => {
  for (const size of [1, 3, 7, 15]) {
    const values = Array.from({ length: size }, (_, i) => i)
    assert.deepEqual(buildTrace(values).result, reference(values))
  }
})

test('invalid trees are rejected', () => {
  assert.throws(() => parseInput('[1,2]'), /1, 3, 7 or 15/)
  assert.throws(() => parseInput('[1,2,100]'), /0 to 99/)
  assert.throws(() => parseInput('nope'), /JSON/)
})

test('frames carry valid code lines and finish with done', () => {
  const run = buildTrace([1, 2, 3, 4, 5, 6, 7])
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 10)
  assert.equal(run.frames.at(-1).phase, 'done')
})
