import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const content = [
  { content_id: 3, content_text: 'SQL is fun' },
  { content_id: 1, content_text: 'hello WORLD' },
  { content_id: 2, content_text: 'x2 PLANS' },
]

test('3368 capitalizes only the first character of the whole text', () => {
  assert.deepEqual(buildTrace({ content }).result, [
    { content_id: 1, content_text: 'Hello world' },
    { content_id: 2, content_text: 'X2 plans' },
    { content_id: 3, content_text: 'Sql is fun' },
  ])
})

test('3368 a single letter becomes uppercase and text with digits keeps them', () => {
  assert.deepEqual(buildTrace({ content: [{ content_id: 9, content_text: 'a' }] }).result, [{ content_id: 9, content_text: 'A' }])
  assert.equal(buildTrace({ content: [{ content_id: 1, content_text: '2024 OK' }] }).result[0].content_text, '2024 ok')
})

test('3368 frame invariants hold', () => {
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

test('3368 parseInput rejects punctuation', () => {
  assert.throws(() => parseInput('{"content":[{"content_id":1,"content_text":"hi!"}]}'))
})
