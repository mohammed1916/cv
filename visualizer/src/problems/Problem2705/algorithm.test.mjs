import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (value) => buildTrace(parseInput(JSON.stringify(value))).result

// Independent oracle written in a different style: filter entries, then recurse.
const isFalsy = (v) => v === null || v === false || v === 0 || v === ''
function oracle(v) {
  if (Array.isArray(v)) return v.filter((x) => !isFalsy(x)).map(oracle)
  if (v !== null && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).filter(([, x]) => !isFalsy(x)).map(([k, x]) => [k, oracle(x)]))
  }
  return v
}

test('2705 worked examples', () => {
  assert.deepEqual(solve([null, 0, 5, 'a', false, [], { x: 0, y: [false, 2] }]), [5, 'a', [], { y: [2] }])
  assert.deepEqual(solve({ a: 1, b: null, c: { d: '' }, e: [0, {}] }), { a: 1, c: {}, e: [{}] })
})

test('2705 empty containers are truthy and stay', () => {
  assert.deepEqual(solve({ a: {}, b: [] }), { a: {}, b: [] })
})

test('2705 brute force agrees on small nested values', () => {
  const cases = [
    [0, 1, '', 'x', null, false, true],
    { p: [0, [0, 1, []], {}], q: { r: null, s: 'k' }, t: false },
    [[[0, 0], [1]], { u: { v: 0, w: 2 } }],
  ]
  for (const value of cases) assert.deepEqual(solve(value), oracle(value), JSON.stringify(value))
})

test('2705 rejects nesting deeper than the visualization cap', () => {
  assert.throws(() => parseInput(JSON.stringify([[[[[1]]]]])))
})

test('2705 frames name real pseudocode and python lines', () => {
  const trace = buildTrace(parseInput('{"a":0,"b":[1,false]}'))
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(code[frame.activeLine - 1].text.length > 0)
    assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
})
