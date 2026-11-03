import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const split = values => buildTrace({ values }).result

test('2674 authored presets', () => {
  assert.deepEqual(split([7, 3, 9, 4, 8, 2]), [[7, 3, 9], [4, 8, 2]])
  assert.deepEqual(split([5, 1, 6, 2, 9]), [[5, 1, 6], [2, 9]])
  assert.deepEqual(split([42]), [[42], []])
})

test('2674 two and three nodes', () => {
  assert.deepEqual(split([1, 2]), [[1], [2]])
  assert.deepEqual(split([4, 5, 6]), [[4, 5], [6]])
})

test('2674 input validation', () => {
  assert.throws(() => parseInput('{"values":[]}'))
  assert.throws(() => parseInput('{"values":[100]}'))
  assert.throws(() => parseInput('{"values":[1.5]}'))
})

test('2674 random rings keep order and ceil(n / 2) on the first list', () => {
  let seed = 2674
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const values = Array.from({ length: n }, () => rnd(100))
    const [first, second] = split(values)
    assert.equal(first.length, Math.ceil(n / 2))
    assert.deepEqual([...first, ...second], values)
    assert.equal(second.length, n - first.length)
  }
})

test('2674 frames keep valid lines and the final frame is done', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ values: [7, 3, 9, 4, 8, 2] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(frame.values.length, 6)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
