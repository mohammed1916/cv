import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('832 reverse then invert, checked against the two-step version', () => {
  let state = 832
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(6)
    const image = Array.from({ length: n }, () => Array.from({ length: n }, () => rand(2)))
    const expected = image.map(row => [...row].reverse().map(v => 1 - v))
    assert.deepEqual(buildTrace(image).result, expected, JSON.stringify(image))
  }
})

test('832 worked example', () => {
  assert.deepEqual(buildTrace([[1, 1, 0], [1, 0, 1], [0, 0, 0]]).result, [[1, 0, 0], [0, 1, 0], [1, 1, 1]])
})

test('832 rejects a non-square image', () => {
  assert.throws(() => parseInput('[[1,0]]'))
})
