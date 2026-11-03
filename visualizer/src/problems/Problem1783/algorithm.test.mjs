import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const sample = '{"Players":[{"player_id":1,"player_name":"Alice"},{"player_id":2,"player_name":"Bob"},{"player_id":3,"player_name":"Cara"},{"player_id":4,"player_name":"Dan"},{"player_id":5,"player_name":"Eve"}],"Championships":[{"year":2019,"Wimbledon":1,"Fr_open":2,"US_open":3,"Au_open":4},{"year":2020,"Wimbledon":1,"Fr_open":4,"US_open":4,"Au_open":2},{"year":2021,"Wimbledon":2,"Fr_open":3,"US_open":1,"Au_open":1}]}'

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('sample counts Alice 4, Bob 3, Cara 2, Dan 3 and drops Eve', () => {
  const trace = buildTrace(parseInput(sample))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { player_id: 1, player_name: 'Alice', grand_slams_count: 4 },
    { player_id: 2, player_name: 'Bob', grand_slams_count: 3 },
    { player_id: 3, player_name: 'Cara', grand_slams_count: 2 },
    { player_id: 4, player_name: 'Dan', grand_slams_count: 3 },
  ])
})

test('one player winning in every column of one year counts four', () => {
  const trace = buildTrace(parseInput('{"Players":[{"player_id":7,"player_name":"Gus"}],"Championships":[{"year":2000,"Wimbledon":7,"Fr_open":7,"US_open":7,"Au_open":7}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ player_id: 7, player_name: 'Gus', grand_slams_count: 4 }])
})

test('parseInput rejects a missing tournament column', () => {
  assert.throws(() => parseInput('{"Players":[{"player_id":1,"player_name":"A"}],"Championships":[{"year":2000,"Wimbledon":1,"Fr_open":1,"US_open":1}]}'))
})
