import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrames(trace) {
  assert.ok(trace.frames.length > 1)
  for (const frame of trace.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const el = (symbol, type, electrons) => ({ symbol, type, electrons })

test('2480 keeps metal and nonmetal pairs whose electrons sum to 8', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ elements: [
    el('Na', 'Metal', 1), el('Mg', 'Metal', 2), el('Ca', 'Metal', 2), el('Al', 'Metal', 3),
    el('O', 'Nonmetal', 6), el('Cl', 'Nonmetal', 7), el('F', 'Nonmetal', 7), el('N', 'Nonmetal', 5),
  ] })))
  assert.deepEqual(trace.result, [
    { metal: 'Al', nonmetal: 'N' },
    { metal: 'Ca', nonmetal: 'O' },
    { metal: 'Mg', nonmetal: 'O' },
    { metal: 'Na', nonmetal: 'Cl' },
    { metal: 'Na', nonmetal: 'F' },
  ])
  assertFrames(trace)
})

test('2480 two metals never bond with each other and no pair means an empty result', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ elements: [
    el('Na', 'Metal', 1), el('K', 'Metal', 7), el('Si', 'Metalloid', 4),
  ] })))
  assert.deepEqual(trace.result, [])
  assertFrames(trace)
})

test('2480 rejects an element type outside the three known types', () => {
  assert.throws(() => parseInput(JSON.stringify({ elements: [el('Na', 'Gas', 1)] })))
})
