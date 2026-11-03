import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

// Independent oracle: test repunits directly with BigInt for up to k+1 lengths.
function oracle(k) {
  let value = 0n
  for (let length = 1; length <= k + 1; length++) {
    value = value * 10n + 1n
    if (value % BigInt(k) === 0n) return length
  }
  return -1
}

test('sample inputs give the expected lengths', () => {
  assert.equal(run('{"k":17}').result, 16)
  assert.equal(run('{"k":1}').result, 1)
  assert.equal(run('{"k":8}').result, -1)
  assert.equal(run('{"k":25}').result, -1)
  for (const example of examples) checkFrames(run(example.input))
})

test('every k from 1 to 200 agrees with the BigInt oracle and emits valid frames', () => {
  for (let k = 1; k <= 200; k++) {
    const trace = buildTrace({ k })
    assert.equal(trace.result, oracle(k), `k=${k}`)
    checkFrames(trace)
  }
})

test('invalid or out-of-range inputs are rejected', () => {
  assert.throws(() => parseInput('{"k":0}'))
  assert.throws(() => parseInput('{"k":201}'))
  assert.throws(() => parseInput('{"k":2.5}'))
  assert.throws(() => parseInput('[]'))
})

test('python listing defines the function used by the trace', () => {
  assert.match(python, /def smallest_repunit_divisible_by\(k\):/)
})
