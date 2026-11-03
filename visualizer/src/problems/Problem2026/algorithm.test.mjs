import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

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

test('2026 sample keeps problems 2 and 4 in id order', () => {
  // 1/10 = 10 percent and 3/10 = 30 percent are kept. 10/12, 6/10 (exactly 60) and the no-vote row are not.
  const trace = run('{"Problems":[{"problem_id":4,"likes":1,"dislikes":9},{"problem_id":2,"likes":3,"dislikes":7},{"problem_id":1,"likes":10,"dislikes":2},{"problem_id":3,"likes":6,"dislikes":4},{"problem_id":5,"likes":0,"dislikes":0}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ problem_id: 2 }, { problem_id: 4 }])
})

test('2026 keeps nothing when the like percentage is exactly 60', () => {
  const trace = run('{"Problems":[{"problem_id":9,"likes":6,"dislikes":4}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('2026 rejects a row without dislikes', () => {
  assert.throws(() => parseInput('{"Problems":[{"problem_id":1,"likes":2}]}'))
})
