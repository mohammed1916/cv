import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = water => buildTrace(parseInput(JSON.stringify({ water })))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

// Every consecutive group of three released atoms must hold two H and one O.
function assertMolecules(result, water) {
  assert.equal(result.length, water.length)
  for (let i = 0; i < result.length; i += 3) {
    assert.equal(result.slice(i, i + 3).split('').sort().join(''), 'HHO', `group at ${i}`)
  }
  assert.equal(result.split('').sort().join(''), water.split('').sort().join(''))
}

test('sample HHOHOH forms two complete molecules', () => {
  const trace = run('HHOHOH')
  checkFrames(trace)
  assertMolecules(trace.result, 'HHOHOH')
})

test('several arrangements all form complete groups', () => {
  for (const water of ['HHOHHO', 'OHHHOH', 'OOHHHH', 'HHHHOO', 'HOHHOH']) {
    const trace = run(water)
    checkFrames(trace)
    assertMolecules(trace.result, water)
  }
})

test('a thread waits when every permit for its element is taken', () => {
  assert.ok(run('OOHHHH').frames.some(frame => frame.phase === 'wait'))
})

test('letters with the wrong counts are rejected', () => {
  assert.throws(() => parseInput('{"water":"HOO"}'))
  assert.throws(() => parseInput('{"water":"HOHOHO"}'))
  assert.throws(() => parseInput('{"water":"HOX"}'))
})
