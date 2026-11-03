import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every pair at every step (exhaustive search over join orders).
function exhaustive(values) {
  if (values.length === 1) return 0
  let best = Infinity
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const joined = values[i] + values[j]
      const rest = values.filter((_, k) => k !== i && k !== j)
      best = Math.min(best, joined + exhaustive([...rest, joined]))
    }
  }
  return best
}

test('sticks 4, 2, 7, 3 cost 30 in total', () => {
  assert.equal(buildTrace({ sticks: [4, 2, 7, 3] }).result, 30)
})

test('one stick needs no join and four equal sticks cost 8', () => {
  assert.equal(buildTrace({ sticks: [5] }).result, 0)
  assert.equal(buildTrace({ sticks: [1, 1, 1, 1] }).result, 8)
})

test('small random inputs agree with exhaustive join orders', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const sticks = Array.from({ length: 1 + rand(5) }, () => 1 + rand(20))
    assert.equal(buildTrace({ sticks }).result, exhaustive(sticks), JSON.stringify(sticks))
  }
})

test('every join frame reports the heap and a running total that ends at the result', () => {
  const run = buildTrace({ sticks: [4, 2, 7, 3] })
  const joinFrames = run.frames.filter(frame => frame.phase === 'join')
  assert.equal(joinFrames.length, 9)
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).snapshot.total, run.result)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9)
    assert.ok(frame.message.length > 5)
    assert.ok(Array.isArray(frame.snapshot.heap))
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1]'), /JSON object/)
  assert.throws(() => parseInput({ sticks: [] }), /between 1 and/)
  assert.throws(() => parseInput({ sticks: [0] }), /sticks\[0\]/)
  assert.throws(() => parseInput({ sticks: [2.5] }), /sticks\[0\]/)
})
