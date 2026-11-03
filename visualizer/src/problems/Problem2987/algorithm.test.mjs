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

test('only Cedar is above the row-weighted overall average of 271.25', () => {
  const trace = run('{"Listings":[{"listing_id":1,"city":"Ashford","price":100},{"listing_id":2,"city":"Ashford","price":300},{"listing_id":3,"city":"Brookvale","price":150},{"listing_id":4,"city":"Brookvale","price":160},{"listing_id":5,"city":"Cedar","price":500},{"listing_id":6,"city":"Cedar","price":100},{"listing_id":7,"city":"Cedar","price":600},{"listing_id":8,"city":"Dunmore","price":260}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ city: 'Cedar' }])
})

test('a city exactly equal to the overall average is not kept', () => {
  const trace = run('{"Listings":[{"listing_id":1,"city":"Oak","price":100},{"listing_id":2,"city":"Oak","price":200}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('a listing with no city is not accepted', () => {
  assert.throws(() => parseInput('{"Listings":[{"listing_id":1,"price":100}]}'))
})
