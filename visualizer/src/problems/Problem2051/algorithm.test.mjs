import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const sampleInput = {
  Members: [
    { member_id: 1, name: 'Ann' }, { member_id: 2, name: 'Ben' }, { member_id: 3, name: 'Cy' },
    { member_id: 4, name: 'Dee' }, { member_id: 5, name: 'Eli' },
  ],
  Visits: [
    { visit_id: 1, member_id: 1 }, { visit_id: 2, member_id: 1 }, { visit_id: 3, member_id: 1 }, { visit_id: 4, member_id: 1 },
    { visit_id: 5, member_id: 2 }, { visit_id: 6, member_id: 2 }, { visit_id: 7, member_id: 2 }, { visit_id: 8, member_id: 2 }, { visit_id: 9, member_id: 2 },
    { visit_id: 10, member_id: 3 }, { visit_id: 11, member_id: 3 },
    { visit_id: 12, member_id: 5 },
  ],
  Purchases: [
    { visit_id: 1, charged_amount: 30 }, { visit_id: 3, charged_amount: 45 }, { visit_id: 5, charged_amount: 20 },
    { visit_id: 12, charged_amount: 10 },
  ],
}

const ids = phases.map(phase => phase.id)

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

test('2051 sample labels each member by visit purchase rate', () => {
  const trace = buildTrace(parseInput(JSON.stringify(sampleInput)))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { member_id: 1, name: 'Ann', category: 'Premium' },
    { member_id: 2, name: 'Ben', category: 'Regular' },
    { member_id: 3, name: 'Cy', category: 'Casual' },
    { member_id: 4, name: 'Dee', category: 'Inactive' },
    { member_id: 5, name: 'Eli', category: 'Premium' },
  ])
})

test('2051 keeps a member with no visits even when no rows reference them', () => {
  const trace = buildTrace(parseInput('{"Members":[{"member_id":9,"name":"Zed"}],"Visits":[{"visit_id":1,"member_id":8}],"Purchases":[]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ member_id: 9, name: 'Zed', category: 'Inactive' }])
})

test('2051 rejects a table without its columns', () => {
  assert.throws(() => parseInput('{"Members":[{"member_id":1}],"Visits":[],"Purchases":[]}'))
})
