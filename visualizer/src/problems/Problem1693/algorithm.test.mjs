import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: filter rows for each distinct (date, make) pair, then count distinct values.
function oracle(rows) {
  const pairs = [...new Set(rows.map(row => `${row.date_id}|${row.make_name}`))].sort((a, b) => {
    const [da, ma] = a.split('|')
    const [db, mb] = b.split('|')
    if (da !== db) return da < db ? -1 : 1
    return ma < mb ? -1 : ma > mb ? 1 : 0
  })
  return pairs.map(pair => {
    const [date_id, make_name] = pair.split('|')
    const mine = rows.filter(row => row.date_id === date_id && row.make_name === make_name)
    return {
      date_id,
      make_name,
      unique_leads: new Set(mine.map(row => row.lead_id)).size,
      unique_partners: new Set(mine.map(row => row.partner_id)).size,
    }
  })
}

function lcg(seed) {
  let state = seed
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state }
}

test('1693 random event rows match the grouped-distinct oracle', () => {
  const next = lcg(99)
  const dates = ['2021-01-01', '2021-01-02', '2021-01-03']
  const makes = ['cedar', 'birch', 'alder']
  for (let trial = 0; trial < 300; trial++) {
    const count = next() % 25
    const rows = Array.from({ length: count }, () => ({
      date_id: dates[next() % dates.length],
      make_name: makes[next() % makes.length],
      lead_id: next() % 5,
      partner_id: next() % 5,
    }))
    const run = buildTrace({ rows })
    assert.deepEqual(run.result, oracle(rows))
    assert.deepEqual(run.frames.at(-1).snapshot.result, run.result)
  }
})

test('1693 the same lead in different makes is counted separately', () => {
  const rows = [
    { date_id: '2021-04-08', make_name: 'cedar', lead_id: 7, partner_id: 1 },
    { date_id: '2021-04-08', make_name: 'birch', lead_id: 7, partner_id: 1 },
    { date_id: '2021-04-08', make_name: 'cedar', lead_id: 7, partner_id: 2 },
  ]
  assert.deepEqual(buildTrace({ rows }).result, [
    { date_id: '2021-04-08', make_name: 'birch', unique_leads: 1, unique_partners: 1 },
    { date_id: '2021-04-08', make_name: 'cedar', unique_leads: 1, unique_partners: 2 },
  ])
})

test('1693 empty input gives an empty report and every phase is traced', () => {
  const empty = buildTrace({ rows: [] })
  assert.deepEqual(empty.result, [])
  const run = buildTrace({ rows: [{ date_id: 'd', make_name: 'm', lead_id: 1, partner_id: 1 }] })
  const used = new Set(run.frames.map(frame => frame.phase))
  for (const phase of phases) assert.ok(used.has(phase.id), phase.id)
})

test('1693 invalid input is rejected', () => {
  for (const text of ['[]', '{"rows":5}', '{"rows":[{"date_id":"","make_name":"a","lead_id":1,"partner_id":1}]}', '{"rows":[{"date_id":"d","make_name":"a","lead_id":"1","partner_id":1}]}', '{"rows":[{"date_id":"d","make_name":"a","lead_id":1.5,"partner_id":1}]}', 'nope']) {
    assert.throws(() => parseInput(text), text)
  }
})
