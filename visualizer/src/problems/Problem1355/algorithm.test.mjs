import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const sample = {
  activities: [
    { id: 1, name: 'Chess' }, { id: 2, name: 'Tennis' }, { id: 3, name: 'Golf' },
    { id: 4, name: 'Rowing' }, { id: 5, name: 'Swim' }, { id: 6, name: 'Yoga' },
  ],
  friends: [
    { id: 1, name: 'Ann', activity: 1 }, { id: 2, name: 'Bo', activity: 1 }, { id: 3, name: 'Cy', activity: 1 },
    { id: 4, name: 'Di', activity: 2 }, { id: 5, name: 'Ed', activity: 2 },
    { id: 6, name: 'Fay', activity: 3 }, { id: 7, name: 'Gus', activity: 3 }, { id: 8, name: 'Hal', activity: 3 },
    { id: 9, name: 'Ira', activity: 5 }, { id: 10, name: 'Jo', activity: 5 },
    { id: 11, name: 'Kim', activity: 6 },
  ],
}

function checkFrames(trace) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(ids.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'output')
}

test('1355 sample: counts 3,2,3,2,1 keep Swim and Tennis only', () => {
  const trace = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(trace.result, [{ activity: 'Swim' }, { activity: 'Tennis' }])
  checkFrames(trace)
})

test('1355 tied extremes are excluded, including the zero-participant activity', () => {
  const trace = buildTrace(parseInput('{"activities":[{"id":1,"name":"Chess"},{"id":2,"name":"Golf"},{"id":3,"name":"Rowing"}],"friends":[{"id":1,"name":"Ann","activity":1},{"id":2,"name":"Bo","activity":2}]}'))
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('1355 rejects a friend without an integer activity id', () => {
  assert.throws(() => parseInput('{"activities":[],"friends":[{"id":1,"name":"A","activity":"1"}]}'))
})
