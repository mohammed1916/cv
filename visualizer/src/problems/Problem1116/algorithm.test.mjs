import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

// Reference: 0, 1, 0, 2, 0, 3, ... up to n.
function expected(n) {
  let out = ''
  for (let k = 1; k <= n; k++) out += '0' + k
  return out
}

test('n = 2 prints 0, 1, 0, 2', () => {
  const trace = run('{"n":2}')
  checkFrames(trace)
  assert.equal(trace.result, '0102')
})

test('every n from 1 to 12 gives the zero, number pattern', () => {
  for (let n = 1; n <= 12; n++) {
    const trace = run(JSON.stringify({ n }))
    checkFrames(trace)
    assert.equal(trace.result, expected(n), `n=${n}`)
  }
})

test('zero takes every other turn', () => {
  const printed = run('{"n":6}').result
  for (let i = 0; i < printed.length; i += 2) assert.equal(printed[i], '0', `turn ${i}`)
})

test('invalid n is rejected', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":"3"}'))
})
