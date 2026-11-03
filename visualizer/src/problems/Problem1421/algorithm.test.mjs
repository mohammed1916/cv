import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'match', 'output', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

test('1421 keeps query order and reports 0 for a missing NPV row', () => {
  const input = parseInput(JSON.stringify({
    NPV: [{ id: 1, year: 2018, npv: 100 }, { id: 2, year: 2019, npv: 40 }],
    Queries: [{ id: 1, year: 2018 }, { id: 1, year: 2019 }, { id: 2, year: 2019 }],
  }))
  const run = buildTrace(input)
  assert.deepEqual(run.result, [
    { id: 1, year: 2018, npv: 100 },
    { id: 1, year: 2019, npv: 0 },
    { id: 2, year: 2019, npv: 40 },
  ])
  checkFrames(run)
})

test('1421 with no queries returns no rows', () => {
  const run = buildTrace(parseInput('{"NPV":[{"id":1,"year":2018,"npv":5}],"Queries":[]}'))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('1421 rejects malformed input', () => {
  assert.throws(() => parseInput('{"NPV":[{"id":1,"year":2018}],"Queries":[]}'))
  assert.throws(() => parseInput('{"NPV":[],"Queries":[{"id":"1","year":2018}]}'))
})
