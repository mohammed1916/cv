import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

// Reference: add each booking to every flight it covers.
function brute(n, bookings) {
  return Array.from({ length: n }, (_, i) => bookings.reduce((sum, [first, last, seats]) => sum + (first <= i + 1 && i + 1 <= last ? seats : 0), 0))
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
    assert.ok(Array.isArray(frame.snapshot.diff) && Array.isArray(frame.snapshot.totals))
  }
}

test('sample gives 5 15 10 17 7', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [5, 15, 10, 17, 7])
})

test('bookings that cover the whole range add to every flight', () => {
  const trace = run('{"n":3,"bookings":[[1,3,4],[1,3,6]]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [10, 10, 10])
})

test('random bookings agree with the direct per-flight sum', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(8)
    const bookings = Array.from({ length: 1 + rand(6) }, () => {
      const first = 1 + rand(n)
      const last = first + rand(n - first + 1)
      return [first, last, 1 + rand(50)]
    })
    const text = JSON.stringify({ n, bookings })
    assert.deepEqual(run(text).result, brute(n, bookings), text)
  }
})

test('one frame per booking and per flight, with the spare-slot count shown first', () => {
  const trace = run(examples[0].input)
  assert.equal(trace.frames.filter(frame => frame.phase === 'inspect').length, 3)
  assert.equal(trace.frames.filter(frame => frame.phase === 'update').length, 5)
  assert.equal(trace.frames[0].snapshot.diff.length, 7)
})

test('invalid bookings are rejected before tracing', () => {
  assert.throws(() => parseInput('{"n":3,"bookings":[[2,1,4]]}'))
  assert.throws(() => parseInput('{"n":3,"bookings":[[1,4,4]]}'))
  assert.throws(() => parseInput('{"n":3,"bookings":[[1,2,0]]}'))
})
