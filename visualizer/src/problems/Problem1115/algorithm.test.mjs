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

test('n = 1 prints foo then bar', () => {
  const trace = run('{"n":1}')
  checkFrames(trace)
  assert.equal(trace.result, 'foobar')
})

test('output alternates foo and bar for every n from 1 to 12', () => {
  for (let n = 1; n <= 12; n++) {
    const trace = run(JSON.stringify({ n }))
    checkFrames(trace)
    assert.equal(trace.result, 'foobar'.repeat(n), `n=${n}`)
  }
})

test('the two permits are never both available', () => {
  for (const frame of run('{"n":3}').frames) assert.ok(!(frame.fooPermit && frame.barPermit), frame.phase)
})

test('invalid n is rejected', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":1.5}'))
})
