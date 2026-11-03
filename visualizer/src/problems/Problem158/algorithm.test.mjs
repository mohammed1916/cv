import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (file, calls) => buildTrace({ file, calls }).result

test('own samples return the expected pieces across calls', () => {
  assert.deepEqual(solve('abcdefghij', [3, 5, 2, 9]), ['abc', 'defgh', 'ij', ''])
  assert.deepEqual(solve('wxyzqrst', [4, 4, 1]), ['wxyz', 'qrst', ''])
  assert.deepEqual(solve('hi', [1, 5]), ['h', 'i'])
})

test('cached characters are reused when calls split a four-character chunk', () => {
  assert.deepEqual(solve('abcdefgh', [1, 1, 1, 1, 1, 1, 1, 1]), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
  assert.deepEqual(solve('abcdefgh', [2, 6]), ['ab', 'cdefgh'])
})

test('frames carry a phase, a pseudocode line, a message and a snapshot', () => {
  const trace = buildTrace(parseInput('{"file":"abcde","calls":[2,4]}'))
  for (const f of trace.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
  assert.match(python, /class Reader:/)
})

test('parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"file":"Ab","calls":[1]}'), /lowercase/)
  assert.throws(() => parseInput('{"file":"ab","calls":[]}'), /1 to 8/)
  assert.throws(() => parseInput('{"file":"ab","calls":[11]}'), /1 to 10/)
})

test('random call sequences match slicing the file in order', () => {
  let seed = 158
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const file = Array.from({ length: rnd(25) }, () => 'abcdefghijklmnopqrstuvwxyz'[rnd(26)]).join('')
    const calls = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(10))
    let pos = 0
    const expected = calls.map(n => { const s = file.slice(pos, pos + n); pos += s.length; return s })
    assert.deepEqual(solve(file, calls), expected)
  }
})
