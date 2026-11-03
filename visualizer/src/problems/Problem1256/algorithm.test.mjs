import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: enumerate the codes length first, in binary order.
function sequence(limit) {
  const out = ['']
  for (let length = 1; out.length <= limit; length += 1) {
    for (let v = 0; v < 2 ** length && out.length <= limit; v += 1) {
      out.push(v.toString(2).padStart(length, '0'))
    }
  }
  return out
}

test('the draft mapping holds for the first seven numbers', () => {
  const expected = ['', '0', '1', '00', '01', '10', '11']
  expected.forEach((text, num) => {
    assert.equal(buildTrace(num).result, text, `num ${num}`)
  })
})

test('the example 5 encodes as "10"', () => {
  const run = buildTrace(parseInput('5'))
  assert.equal(run.result, '10')
  assertFrameInvariants(run)
})

test('every number up to 1023 matches the length-first enumeration', () => {
  const table = sequence(1023)
  for (let num = 0; num <= 1023; num += 1) {
    const run = buildTrace(num)
    assert.equal(run.result, table[num], `num ${num}`)
    if (num % 97 === 0) assertFrameInvariants(run)
  }
})

test('parseInput rejects negative, fractional or large values', () => {
  assert.throws(() => parseInput('-1'), /from 0 to 1023/)
  assert.throws(() => parseInput('2.5'), /integer/)
  assert.throws(() => parseInput('1024'), /from 0 to 1023/)
})
