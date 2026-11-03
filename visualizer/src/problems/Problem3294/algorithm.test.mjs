import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.head >= 0 && frame.head < run.input.values.length)
  }
}

test('3294 authored presets', () => {
  assert.deepEqual(solve({ values: [5, 8, 2, 6], node: 2 }), [5, 8, 2, 6])
  assert.deepEqual(solve({ values: [1, 2, 3], node: 0 }), [1, 2, 3])
  assert.deepEqual(solve({ values: [7, -3, 4, 9, 0], node: 4 }), [7, -3, 4, 9, 0])
})

test('3294 the same list is returned from every starting node', () => {
  const values = [3, 1, 4, 1, 5]
  for (let node = 0; node < values.length; node++) assert.deepEqual(solve({ values, node }), values)
})

test('3294 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"values":[1,2],"node":2}'))
  assert.throws(() => parseInput('{"values":[],"node":0}'))
  assert.throws(() => parseInput('[1,2]'))
})

test('3294 random lists match the stored order', () => {
  let seed = 3294
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(10) }, () => rnd(199) - 99)
    const node = rnd(values.length)
    assert.deepEqual(solve({ values, node }), values)
  }
})

test('3294 frames keep pseudocode and python lines valid', () => {
  checkFrames(buildTrace({ values: [5, 8, 2, 6], node: 2 }))
  checkFrames(buildTrace({ values: [7, -3, 4, 9, 0], node: 4 }))
})
