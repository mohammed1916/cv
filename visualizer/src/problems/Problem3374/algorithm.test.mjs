import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const content = [
  { content_id: 4, content_text: 'data-DRIVEN design' },
  { content_id: 1, content_text: 'x-RAY VISION' },
  { content_id: 2, content_text: 'x2-plans now' },
]

test('3374 capitalizes after spaces and hyphens and lowercases the rest', () => {
  assert.deepEqual(buildTrace({ content }).result, [
    { content_id: 1, content_text: 'X-Ray Vision' },
    { content_id: 2, content_text: 'X2-Plans Now' },
    { content_id: 4, content_text: 'Data-Driven Design' },
  ])
})

test('3374 a run of separators still capitalizes each word', () => {
  assert.equal(buildTrace({ content: [{ content_id: 5, content_text: 'top-OF-the list' }] }).result[0].content_text, 'Top-Of-The List')
})

test('3374 frame invariants hold', () => {
  const { frames } = buildTrace({ content })
  const ids = new Set(phases.map(p => p.id))
  assert.ok(frames.length > 0)
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.equal(frames.at(-1).phase, 'output')
})

test('3374 parseInput rejects other punctuation', () => {
  assert.throws(() => parseInput('{"content":[{"content_id":1,"content_text":"a_b"}]}'))
  assert.doesNotThrow(() => parseInput('{"content":[{"content_id":1,"content_text":"a-b c"}]}'))
})
