import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const sample = JSON.stringify({
  content: [
    { content_id: 1, title: 'Dragon Quest', Kids_content: 'Y', content_type: 'Movies' },
    { content_id: 2, title: 'Night Shift', Kids_content: 'N', content_type: 'Movies' },
    { content_id: 3, title: 'Little Paws', Kids_content: 'Y', content_type: 'Series' },
    { content_id: 4, title: 'Ocean Tales', Kids_content: 'Y', content_type: 'Movies' },
    { content_id: 5, title: 'Late Show', Kids_content: 'Y', content_type: 'Movies' },
  ],
  tv_program: [
    { program_date: '2020-06-02', content_id: 1, channel: 'A' },
    { program_date: '2020-06-02', content_id: 2, channel: 'B' },
    { program_date: '2020-06-10', content_id: 1, channel: 'B' },
    { program_date: '2020-05-31', content_id: 4, channel: 'A' },
    { program_date: '2020-06-15', content_id: 4, channel: 'C' },
    { program_date: '2020-06-20', content_id: 3, channel: 'A' },
    { program_date: '2020-07-01', content_id: 5, channel: 'A' },
    { program_date: '2020-06-30', content_id: 5, channel: 'B' },
  ],
})

const PHASES = ['load', 'content', 'window', 'output', 'done']

function checkFrames(trace) {
  const pyCount = python.split('\n').length
  for (const frame of trace.frames) {
    assert.ok(PHASES.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
}

test('1495 keeps June kid-friendly movies with distinct titles', () => {
  const trace = buildTrace(parseInput(sample))
  assert.deepEqual(trace.result, [{ title: 'Dragon Quest' }, { title: 'Late Show' }, { title: 'Ocean Tales' }])
  checkFrames(trace)
})

test('1495 the window includes June 30 and excludes July 1 and May 31', () => {
  const trace = buildTrace(parseInput(JSON.stringify({
    content: [{ content_id: 9, title: 'Edge', Kids_content: 'Y', content_type: 'Movies' }],
    tv_program: [{ program_date: '2020-07-01', content_id: 9, channel: 'A' }],
  })))
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('1495 rejects an unknown Kids_content flag', () => {
  assert.throws(() => parseInput(JSON.stringify({
    content: [{ content_id: 1, title: 'X', Kids_content: 'Maybe', content_type: 'Movies' }],
    tv_program: [],
  })))
})
