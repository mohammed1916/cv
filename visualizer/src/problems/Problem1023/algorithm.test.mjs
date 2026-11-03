import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent oracle: a regular expression that allows any lowercase letters between pattern letters.
function oracle(query, pattern) {
  const body = pattern.split('').join('[a-z]*')
  return new RegExp(`^[a-z]*${body}[a-z]*$`).test(query)
}

test('sample input gives the expected flags', () => {
  assert.deepEqual(buildTrace(parseInput(examples[0].input)).result, [true, true, false, true, true])
  assert.deepEqual(buildTrace({ queries: ['AbCd', 'ABcd'], pattern: 'AC' }).result, [true, false])
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
})

test('seeded random words match the regular expression oracle', () => {
  let seed = 1023
  const next = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed >> 16 }
  const alphabet = 'abcABC'
  const word = max => Array.from({ length: 1 + (next() % max) }, () => alphabet[next() % alphabet.length]).join('')
  for (let t = 0; t < 300; t++) {
    const pattern = word(4)
    const queries = Array.from({ length: 1 + (next() % 6) }, () => word(10))
    const trace = buildTrace({ queries, pattern })
    assert.deepEqual(trace.result, queries.map(query => oracle(query, pattern)), JSON.stringify({ queries, pattern }))
    checkFrames(trace)
  }
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('{"queries":[],"pattern":"A"}'))
  assert.throws(() => parseInput('{"queries":["A1"],"pattern":"A"}'))
  assert.throws(() => parseInput('{"queries":["A"],"pattern":""}'))
  assert.throws(() => parseInput('{"queries":["A"]}'))
})
