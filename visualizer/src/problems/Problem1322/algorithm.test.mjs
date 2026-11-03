import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, sample } from './algorithm.js'

function checkFrames(run) {
  const lineCount = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lineCount)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.view.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}


test('1322 ranks ads by click-through and gives ignored-only ads zero', () => {
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(run.result, [
    { ad_id: 2, ctr: 66.67 },
    { ad_id: 4, ctr: 50 },
    { ad_id: 1, ctr: 33.33 },
    { ad_id: 3, ctr: 0 },
    { ad_id: 5, ctr: 0 },
  ])
  checkFrames(run)
})

test('1322 rejects an unknown action', () => {
  assert.throws(() => parseInput('{"Ads":[{"ad_id":1,"user_id":1,"action":"Hovered"}]}'))
})
