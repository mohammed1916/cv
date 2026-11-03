import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, python } from './algorithm.js'

const solve = (a, b) => buildTrace({ a, b }).result

function brute(a, b) {
  let best = 0
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      best = Math.max(best, Math.abs(a[i] - a[j]) + Math.abs(b[i] - b[j]) + Math.abs(i - j))
    }
  }
  return best
}

test('1131 hand-checked small cases', () => {
  assert.equal(solve([0, 10], [0, 0]), 11)
  assert.equal(solve([5, 5, 5], [2, 2, 2]), 2)
  assert.equal(solve([3, 3], [7, 7]), 1)
})

test('1131 sign-pair method matches the pairwise brute force on seeded arrays', () => {
  let seed = 1131
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(7)
    const a = Array.from({ length: len }, () => rnd(41) - 20)
    const b = Array.from({ length: len }, () => rnd(41) - 20)
    assert.equal(solve(a, b), brute(a, b), JSON.stringify({ a, b }))
  }
})

test('1131 frames carry phase, line, message and snapshot', () => {
  const { frames } = buildTrace({ a: [1, 4, 2], b: [3, 0, 5] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(frames.at(-1).phase, 'done')
})

test('1131 parser rejects bad shapes and limits', () => {
  assert.throws(() => parseInput('{"a":[1,2]}'))
  assert.throws(() => parseInput({ a: [1, 2], b: [1] }))
  assert.throws(() => parseInput({ a: [1], b: [1] }))
  assert.throws(() => parseInput({ a: [1.5, 2], b: [1, 2] }))
})
