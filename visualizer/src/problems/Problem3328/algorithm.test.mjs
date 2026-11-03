import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  Cities: [
    { state: 'TX', city: 'Austin' }, { state: 'TX', city: 'Dallas' }, { state: 'TX', city: 'Abilene' },
    { state: 'OH', city: 'Akron' }, { state: 'OH', city: 'Toledo' },
    { state: 'CA', city: 'Fresno' }, { state: 'CA', city: 'Davis' }, { state: 'CA', city: 'Ojai' }, { state: 'CA', city: 'Azusa' },
  ],
}

function checkFrames(trace) {
  const pyCount = python.trimEnd().split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(phases.some(p => p.id === f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3328 keeps states with three or more cities, sorted by state and city', () => {
  const trace = buildTrace(sample)
  assert.deepEqual(trace.result, [
    { state: 'CA', cities: 'Azusa, Davis, Fresno, Ojai' },
    { state: 'TX', cities: 'Abilene, Austin, Dallas' },
  ])
  checkFrames(trace)
})

test('3328 returns nothing when every state has fewer than three cities', () => {
  const trace = buildTrace({ Cities: [{ state: 'NV', city: 'Reno' }, { state: 'NV', city: 'Elko' }, { state: 'ME', city: 'Bangor' }] })
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('3328 rejects a duplicate state and city pair', () => {
  assert.throws(() => parseInput('{"Cities":[{"state":"TX","city":"Austin"},{"state":"TX","city":"Austin"}]}'))
})
