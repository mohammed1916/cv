import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('2314 returns the earliest hottest day for each city', () => {
  const trace = run('{"Weather":[{"city_id":1,"day":"2024-03-02","degree":25},{"city_id":2,"day":"2024-03-02","degree":18},{"city_id":1,"day":"2024-03-01","degree":20},{"city_id":3,"day":"2024-03-05","degree":30},{"city_id":2,"day":"2024-03-01","degree":18},{"city_id":1,"day":"2024-03-03","degree":25},{"city_id":3,"day":"2024-03-02","degree":10}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { city_id: 1, day: '2024-03-02', degree: 25 },
    { city_id: 2, day: '2024-03-01', degree: 18 },
    { city_id: 3, day: '2024-03-05', degree: 30 },
  ])
})

test('2314 picks the earliest day when every reading ties', () => {
  const trace = run('{"Weather":[{"city_id":4,"day":"2024-03-09","degree":11},{"city_id":4,"day":"2024-03-07","degree":11},{"city_id":4,"day":"2024-03-08","degree":11}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ city_id: 4, day: '2024-03-07', degree: 11 }])
})

test('2314 rejects a reading without degree', () => {
  assert.throws(() => parseInput('{"Weather":[{"city_id":1,"day":"2024-03-01"}]}'))
})
