import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const values = n => buildTrace(parseInput(JSON.stringify({ n }))).result
const PY = python.split('\n')

test('2803 yields factorials in order', () => {
  assert.deepEqual(values(0), [1])
  assert.deepEqual(values(1), [1])
  assert.deepEqual(values(5), [1, 2, 6, 24, 120])
})

test('2803 rejects out of range n', () => {
  assert.throws(() => parseInput('{"n":11}'))
})

test('2803 frames point at real python lines', () => {
  for (const f of buildTrace({ n: 3 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2803 matches a direct product for every n', () => {
  for (let n = 0; n <= 10; n++) {
    const expected = []
    let p = 1
    if (n === 0) expected.push(1)
    for (let i = 1; i <= n; i++) { p *= i; expected.push(p) }
    assert.deepEqual(values(n), expected, `n=${n}`)
  }
})
