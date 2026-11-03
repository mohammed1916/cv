import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (stream, pattern) => buildTrace({ stream, pattern }).result

test('3037 worked presets', () => {
  assert.equal(solve('101101110010', '110010'), 6)
  assert.equal(solve('0000000001', '0001'), 6)
  assert.equal(solve('10101010110', '101011'), 4)
})

test('3037 borders let the match resume without rereading bits', () => {
  assert.equal(solve('1110111', '1101'), 1)
  assert.equal(solve('00001', '0001'), 1)
  assert.equal(solve('0101001', '0100'), 2)
})

test('3037 rejects bad input', () => {
  assert.throws(() => parseInput('{"stream":"0101","pattern":"0110"}'))
  assert.throws(() => parseInput('{"stream":"2","pattern":"2"}'))
})

// Oracle: the first index where the pattern occurs in the bit string.
test('3037 random streams match an indexOf oracle', () => {
  let seed = 3037
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(50)
    const stream = Array.from({ length: len }, () => String(rnd(2))).join('')
    const size = 1 + rnd(Math.min(8, len))
    const start = rnd(len - size + 1)
    const pattern = stream.slice(start, start + size)
    assert.equal(solve(stream, pattern), stream.indexOf(pattern), JSON.stringify({ stream, pattern }))
  }
})

test('3037 frame invariants hold', () => {
  const { frames, result } = buildTrace({ stream: '101101110010', pattern: '110010' })
  const lines = python.trim().split('\n').length
  let last = -1
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= lines)
    assert.ok(f.message.length > 0)
    assert.ok(f.state >= 0 && f.state <= f.pattern.length)
    assert.equal(f.fail.length, f.pattern.length)
    assert.equal(f.bits.length, f.index + 1)
    assert.ok(f.index >= last)
    last = f.index
  }
  assert.equal(frames.at(-1).found, result)
})

test('3037 python export is a complete function', () => {
  assert.match(python, /def find_pattern\(next_bit, pattern\):/)
  assert.match(python, /return index - m \+ 1/)
})
