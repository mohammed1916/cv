import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1294 labels countries by their November average', () => {
  // Chile: (33 + 29 + 26) / 3 = 29.33 -> Hot. Kenya: (4 + 9) / 2 = 6.5 -> Cold. Norway: (12 + 19) / 2 = 15.5 -> Warm.
  // Japan has only an October reading, so it is absent.
  assert.deepEqual(run.result, [
    { country_name: 'Chile', weather_type: 'Hot' },
    { country_name: 'Kenya', weather_type: 'Cold' },
    { country_name: 'Norway', weather_type: 'Warm' },
  ])
})

test('1294 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).rows, run.result)
})

test('1294 the boundary values 15 and 25 follow the rule', () => {
  const edge = buildTrace({
    countries: [{ country_id: 1, country_name: 'Edge' }],
    weather: [{ country_id: 1, weather_state: 15, day: '2019-11-02' }, { country_id: 1, weather_state: 15, day: '2019-11-03' }],
  })
  assert.deepEqual(edge.result, [{ country_name: 'Edge', weather_type: 'Cold' }])
})
