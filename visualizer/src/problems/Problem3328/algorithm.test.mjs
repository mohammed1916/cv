import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  Cities: [
    { state: 'Ardena', city: 'Alder Bay' },
    { state: 'Ardena', city: 'Arrow' },
    { state: 'Ardena', city: 'Brook' },
    { state: 'Ardena', city: 'Anvil' },
    { state: 'Belmar', city: 'Cove' },
    { state: 'Belmar', city: 'Dunes' },
    { state: 'Belmar', city: 'Harbor' },
    { state: 'Cassel', city: 'Cinder' },
    { state: 'Cassel', city: 'Mesa' },
    { state: 'Cassel', city: 'Quarry' },
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
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3328 keeps states with 3+ cities and at least one matching initial, ordered by matching count', () => {
  const trace = buildTrace(sample)
  // Ardena: 4 cities, 3 start with A -> kept with 3. Belmar: 3 cities, none starts with B except none -> dropped.
  // Cassel: 3 cities, Cinder starts with C -> 1 match, kept.
  assert.deepEqual(trace.result, [
    { state: 'Ardena', cities: 'Alder Bay, Anvil, Arrow, Brook', matching_letter_count: 3 },
    { state: 'Cassel', cities: 'Cinder, Mesa, Quarry', matching_letter_count: 1 },
  ])
  checkFrames(trace)
})

test('3328 rejects a state name with digits', () => {
  assert.throws(() => parseInput('{"Cities":[{"state":"A1","city":"Bo"}]}'))
})
