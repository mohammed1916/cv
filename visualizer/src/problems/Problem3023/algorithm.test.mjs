import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (stream, pattern) => buildTrace({ stream, pattern }).result

test('3023 worked presets', () => {
  assert.equal(solve('0110101101', '1011'), 4)
  assert.equal(solve('000001', '1'), 5)
  assert.equal(solve('1111011', '11011'), 2)
})

test('3023 the first occurrence wins when the pattern repeats', () => {
  assert.equal(solve('1010101', '101'), 0)
  assert.equal(solve('0000', '0'), 0)
  assert.equal(solve('1001001', '1001'), 0)
})

test('3023 rejects bad input', () => {
  assert.throws(() => parseInput('{"stream":"0101","pattern":"11"}'))
  assert.throws(() => parseInput('{"stream":"01x","pattern":"1"}'))
  assert.throws(() => parseInput('{"stream":"0101","pattern":""}'))
})

// Oracle: the first index where the pattern occurs in the bit string.
test('3023 random streams match an indexOf oracle', () => {
  let seed = 3023
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(40)
    const stream = Array.from({ length: len }, () => String(rnd(2))).join('')
    const size = 1 + rnd(Math.min(6, len))
    const start = rnd(len - size + 1)
    const pattern = stream.slice(start, start + size)
    assert.equal(solve(stream, pattern), stream.indexOf(pattern), JSON.stringify({ stream, pattern }))
  }
})

test('3023 frame invariants hold', () => {
  const { frames, result } = buildTrace({ stream: '0110101101', pattern: '1011' })
  const lines = python.trim().split('\n').length
  let last = -1
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= lines)
    assert.ok(f.message.length > 0)
    assert.ok(f.window.length <= f.pattern.length)
    assert.equal(f.bits.length, f.index + 1)
    assert.ok(f.index >= last)
    last = f.index
  }
  assert.equal(frames.at(-1).found, result)
})

test('3023 python export is a complete function', () => {
  assert.match(python, /def find_pattern\(next_bit, pattern\):/)
  assert.match(python, /return index - m \+ 1/)
})
