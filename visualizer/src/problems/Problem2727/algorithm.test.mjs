import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (text) => buildTrace(parseInput(text)).result

test('2727 worked examples', () => {
  assert.equal(solve('{}'), true)
  assert.equal(solve('[]'), true)
  assert.equal(solve('{"a":null}'), false)
  assert.equal(solve('[0]'), false)
})

test('2727 a nested empty value is still a key', () => {
  assert.equal(solve('{"a":{}}'), false)
})

test('2727 brute force agrees on small inputs', () => {
  const cases = [{}, [], { x: 0 }, [null], { a: false, b: '' }, [[]], { k: [] }]
  for (const value of cases) {
    const expected = Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0
    assert.equal(buildTrace(value).result, expected, JSON.stringify(value))
  }
})

test('2727 rejects scalars', () => {
  assert.throws(() => parseInput('5'))
  assert.throws(() => parseInput('"text"'))
})

test('2727 frames name real pseudocode and python lines', () => {
  const pyLines = python.split('\n')
  for (const text of ['{"a":1}', '[1,2]']) {
    const trace = buildTrace(parseInput(text))
    for (const frame of trace.frames) {
      assert.ok(code[frame.activeLine - 1].text.length > 0)
      assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
    }
    assert.equal(trace.frames.at(-1).phase, 'done')
  }
})
