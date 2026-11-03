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

// Independent oracle: built-in hex conversion, then the same mapping with a regular expression.
function oracle(text) {
  const hex = BigInt(text).toString(16).toUpperCase()
  if (/[2-9]/.test(hex)) return 'ERROR'
  return hex.replace(/0/g, 'O').replace(/1/g, 'I')
}

test('the example 257 becomes IOI in Hexspeak', () => {
  const run = buildTrace(parseInput('"257"'))
  assert.equal(run.result, 'IOI')
  assertFrameInvariants(run)
})

test('a digit from 2 to 9 in the hex form gives ERROR (3 is hex 3)', () => {
  assert.equal(buildTrace(parseInput('"3"')).result, 'ERROR')
})

test('the letters A to F are kept unchanged', () => {
  assert.equal(buildTrace(parseInput('"171"')).result, 'AB')
})

test('parseInput rejects zero, leading zeros and non-digit text', () => {
  assert.throws(() => parseInput('"0"'), /positive decimal/)
  assert.throws(() => parseInput('"007"'), /positive decimal/)
  assert.throws(() => parseInput('"12a"'), /positive decimal/)
  assert.throws(() => parseInput('257'), /positive decimal/)
})

test('the trace agrees with the built-in conversion oracle on many numbers', () => {
  for (let value = 1; value <= 3000; value += 1) {
    const text = String(value)
    const run = buildTrace(parseInput(JSON.stringify(text)))
    assert.equal(run.result, oracle(text), text)
    if (value % 250 === 0) assertFrameInvariants(run)
  }
  const big = '999999999999999'
  assert.equal(buildTrace(parseInput(JSON.stringify(big))).result, oracle(big))
})
