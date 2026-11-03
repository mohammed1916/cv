import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'lookup', 'compare', 'done'])

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

test('1440 evaluates each comparison with the stored variable values', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Variables: [{ name: 'x', value: 66 }, { name: 'y', value: 77 }],
    Expressions: [
      { left_operand: 'x', operator: '>', right_operand: 'y' },
      { left_operand: 'x', operator: '<', right_operand: 'y' },
      { left_operand: 'y', operator: '=', right_operand: 'y' },
    ],
  })))
  assert.deepEqual(run.result, [
    { left_operand: 'x', operator: '>', right_operand: 'y', value: 'false' },
    { left_operand: 'x', operator: '<', right_operand: 'y', value: 'true' },
    { left_operand: 'y', operator: '=', right_operand: 'y', value: 'true' },
  ])
  checkFrames(run)
})

test('1440 equal variables satisfy only the = operator', () => {
  const run = buildTrace(parseInput('{"Variables":[{"name":"a","value":3},{"name":"b","value":3}],"Expressions":[{"left_operand":"a","operator":"=","right_operand":"b"},{"left_operand":"a","operator":">","right_operand":"b"}]}'))
  assert.deepEqual(run.result.map(row => row.value), ['true', 'false'])
  checkFrames(run)
})

test('1440 rejects an unknown operator and an unknown variable', () => {
  assert.throws(() => parseInput('{"Variables":[],"Expressions":[{"left_operand":"a","operator":"!=","right_operand":"b"}]}'))
  assert.throws(() => buildTrace(parseInput('{"Variables":[{"name":"a","value":1}],"Expressions":[{"left_operand":"a","operator":"<","right_operand":"z"}]}')))
})
