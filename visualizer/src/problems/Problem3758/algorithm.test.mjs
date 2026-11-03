import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(s) {
  return buildTrace(parseInput(JSON.stringify(s))).result
}

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PY_COUNT)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent oracle: a sticky regular expression tried at each position.
const WORD = /zero|one|two|three|four|five|six|seven|eight|nine/y
const DIGIT = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9' }
function oracle(s) {
  let out = ''
  let i = 0
  while (i < s.length) {
    WORD.lastIndex = i
    const m = WORD.exec(s)
    if (m) { out += DIGIT[m[0]]; i += m[0].length } else i += 1
  }
  return out
}

test('3758 presets', () => {
  assert.equal(solve('xfourtwoy'), '42')
  assert.equal(solve('oneight'), '1')
  assert.equal(solve('stwoone'), '21')
})

test('3758 no digit words gives an empty result', () => {
  assert.equal(solve('abc'), '')
})

test('3758 random strings match the sticky-regex oracle', () => {
  let seed = 3758
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pieces = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'o', 'n', 'e', 't', 'x']
  for (let t = 0; t < 400; t += 1) {
    const s = Array.from({ length: 1 + rnd(6) }, () => pieces[rnd(pieces.length)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('3758 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('"xfourtwoy"')))
})

test('3758 rejects malformed input', () => {
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('"ONE"'))
  assert.throws(() => parseInput('["one"]'))
})
