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

test('2669 sample counts Ada Rowe three times, Ben Lo twice, Cy Vance once', () => {
  const trace = run('{"SpotifyRanking":[{"id":1,"artist":"Ada Rowe","track":"Blue Hour","position":1},{"id":2,"artist":"Ben Lo","track":"Night Bus","position":2},{"id":3,"artist":"Ada Rowe","track":"Glass Sky","position":3},{"id":4,"artist":"Cy Vance","track":"Paper Moon","position":4},{"id":5,"artist":"Ben Lo","track":"Night Bus","position":5},{"id":6,"artist":"Ada Rowe","track":"Tin Roof","position":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { artist: 'Ada Rowe', occurrences: 3 },
    { artist: 'Ben Lo', occurrences: 2 },
    { artist: 'Cy Vance', occurrences: 1 },
  ])
})

test('2669 equal counts are ordered by artist name', () => {
  const trace = run('{"SpotifyRanking":[{"id":1,"artist":"Zed","track":"A","position":1},{"id":2,"artist":"Amy","track":"B","position":2}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ artist: 'Amy', occurrences: 1 }, { artist: 'Zed', occurrences: 1 }])
})

test('2669 rejects a record without an artist', () => {
  assert.throws(() => parseInput('{"SpotifyRanking":[{"id":1,"track":"A","position":1}]}'))
})
