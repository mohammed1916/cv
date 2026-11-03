import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

test('sample brackets each separator and keeps digits', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.equal(trace.result, '10[.]0[.]0[.]7')
})

test('zero and large octets are copied in order', () => {
  assert.equal(run(examples[1].input).result, '0[.]0[.]0[.]0')
  assert.equal(run(examples[2].input).result, '255[.]1[.]99[.]254')
})

test('matches a replaceAll oracle on seeded addresses', () => {
  let seed = 1108
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const octets = Array.from({ length: 4 }, () => String(rnd(256)))
    const address = octets.join('.')
    const trace = buildTrace(parseInput(JSON.stringify(address)))
    checkFrames(trace)
    assert.equal(trace.result, address.replaceAll('.', '[.]'))
  }
})

test('rejects malformed addresses', () => {
  assert.throws(() => parseInput('"1.2.3"'))
  assert.throws(() => parseInput('"1.2.3.4.5"'))
  assert.throws(() => parseInput('1.2.3.4'))
})
