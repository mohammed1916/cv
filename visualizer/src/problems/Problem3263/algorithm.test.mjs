import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(parseInput(JSON.stringify(values))).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.current >= -1 && frame.current < run.input.length)
  }
}

test('3263 authored presets', () => {
  assert.deepEqual(solve([4, 1, 7, 3]), [4, 1, 7, 3])
  assert.deepEqual(solve([-2, 0, 5]), [-2, 0, 5])
  assert.deepEqual(solve([9]), [9])
  assert.deepEqual(solve([]), [])
})

test('3263 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('[1,2.5]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11]'))
  assert.throws(() => parseInput('{"values":[1]}'))
})

test('3263 random lists are read back in forward order', () => {
  let seed = 3263
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: rnd(11) }, () => rnd(199) - 99)
    assert.deepEqual(solve(values), values)
  }
})

test('3263 frames keep pseudocode and python lines valid', () => {
  checkFrames(buildTrace([4, 1, 7, 3]))
  checkFrames(buildTrace([]))
})
