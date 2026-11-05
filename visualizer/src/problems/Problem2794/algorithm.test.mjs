import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (keys, values) => buildTrace(parseInput(JSON.stringify({ keys, values }))).result
const PY = python.split('\n')

test('2794 worked examples', () => {
  assert.deepEqual(solve(['a', 'b', 'c'], [1, 2, 3]), { a: 1, b: 2, c: 3 })
  assert.deepEqual(solve(['1', 1, false], [4, 5, 6]), { 1: 4, false: 6 })
})

test('2794 the first duplicate wins', () => {
  assert.deepEqual(solve(['a', 'b', 'a'], [1, 2, 3]), { a: 1, b: 2 })
})

test('2794 frames point at real python lines', () => {
  for (const f of buildTrace({ keys: ['x', 'x'], values: [1, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2794 random arrays match an oracle', () => {
  let seed = 2794
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(8)
    const keys = Array.from({ length: n }, () => [rnd(4), String(rnd(4)), rnd(2) === 0][rnd(3)])
    const values = Array.from({ length: n }, (_, i) => i * 10)
    const expected = Object.fromEntries(keys.map((k, i) => [String(k), values[i]]).reverse())
    assert.deepEqual(solve(keys, values), expected, JSON.stringify(keys))
  }
})
