import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'join', 'done'])

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

test('1715 adds chest contents for every box that refers to a chest', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Boxes: [
      { box_id: 1, chest_id: 1, apple_count: 2, orange_count: 1 },
      { box_id: 2, chest_id: null, apple_count: 4, orange_count: 0 },
      { box_id: 3, chest_id: 2, apple_count: 1, orange_count: 1 },
      { box_id: 4, chest_id: 1, apple_count: 0, orange_count: 2 },
    ],
    Chests: [
      { chest_id: 1, apple_count: 3, orange_count: 0 },
      { chest_id: 2, apple_count: 0, orange_count: 5 },
    ],
  })))
  // box 1: 5 apples, 1 orange; box 2: 4, 0; box 3: 1, 6; box 4: 3, 2 (chest 1 counted again).
  assert.deepEqual(run.result, [{ apple_count: 13, orange_count: 9 }])
  checkFrames(run)
})

test('1715 with no boxes the totals are zero', () => {
  const run = buildTrace(parseInput('{"Boxes":[],"Chests":[]}'))
  assert.deepEqual(run.result, [{ apple_count: 0, orange_count: 0 }])
  checkFrames(run)
})

test('1715 rejects duplicate chest ids and negative counts', () => {
  assert.throws(() => parseInput('{"Boxes":[],"Chests":[{"chest_id":1,"apple_count":0,"orange_count":0},{"chest_id":1,"apple_count":1,"orange_count":1}]}'))
  assert.throws(() => parseInput('{"Boxes":[{"box_id":1,"chest_id":null,"apple_count":-1,"orange_count":0}],"Chests":[]}'))
})
