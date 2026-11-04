import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = values => buildTrace(values).result

test('143 sample lists are reordered by alternating ends', () => {
  assert.deepEqual(solve([1, 2, 3, 4]), [1, 4, 2, 3])
  assert.deepEqual(solve([10, 20, 30, 40, 50]), [10, 50, 20, 40, 30])
  assert.deepEqual(solve([7]), [7])
  assert.deepEqual(solve([8, 9]), [8, 9])
})

test('143 every split point is reached in the trace', () => {
  const { frames } = buildTrace([5, 6, 7])
  const split = frames.filter(f => f.phase === 'split').at(-1)
  assert.equal(split.snapshot.split, 2)
  assert.equal(frames.at(-1).phase, 'done')
  const ids = new Set(phases.map(p => p.id))
  assert.ok(frames.every(f => ids.has(f.phase)))
})

test('143 rejects malformed input', () => {
  assert.throws(() => parseInput('{"a":1}'), /list/)
  assert.throws(() => parseInput('[]'), /1 to 20/)
  assert.throws(() => parseInput('[1,"2"]'), /integers/)
  assert.throws(() => parseInput('[100]'), /-99 to 99/)
})

// Independent oracle: the required order is front, back, front, back ... using two inward-moving indices.
test('143 random lists match the two-index oracle', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    const values = Array.from({ length: len }, () => rnd(199) - 99)
    const expected = []
    let lo = 0
    let hi = len - 1
    while (lo <= hi) {
      expected.push(values[lo++])
      if (lo <= hi) expected.push(values[hi--])
    }
    parseInput(JSON.stringify(values))
    assert.deepEqual(solve(values), expected, JSON.stringify(values))
  }
})
