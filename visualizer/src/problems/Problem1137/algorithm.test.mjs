import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, python } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('1137 known small terms', () => {
  const expected = [0, 1, 1, 2, 4, 7, 13, 24, 44, 81, 149]
  expected.forEach((value, n) => assert.equal(solve(n), value, `n=${n}`))
})

test('1137 agrees with a direct recursive oracle for n up to 25', () => {
  const memo = [0, 1, 1]
  for (let i = 3; i <= 25; i++) memo[i] = memo[i - 1] + memo[i - 2] + memo[i - 3]
  for (let n = 0; n <= 25; n++) assert.equal(solve(n), memo[n], `n=${n}`)
})

test('1137 frames carry phase, line, message and snapshot', () => {
  const { frames } = buildTrace({ n: 6 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-1).snapshot.window.at(-1), 13)
})

test('1137 parser rejects bad input', () => {
  assert.throws(() => parseInput('{"m":3}'))
  assert.throws(() => parseInput({ n: -1 }))
  assert.throws(() => parseInput({ n: 38 }))
  assert.throws(() => parseInput({ n: 1.5 }))
})
