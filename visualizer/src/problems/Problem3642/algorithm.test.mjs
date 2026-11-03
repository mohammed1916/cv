import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm.js'

const PHASES = new Set(['load', 'count', 'reject', 'keep', 'order', 'done'])

function checkFrames(frames) {
  const pyLineCount = python.split('\n').length
  for (const f of frames) {
    assert.ok(PHASES.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLineCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
}

test('3642 sample: Atlas and Dune are polarized, the others are rejected', () => {
  const run = buildTrace(parseInput(SAMPLE_TEXT))
  assert.deepEqual(run.result, [
    { book_id: 1, title: 'Atlas', high: 3, low: 1 },
    { book_id: 4, title: 'Dune', high: 1, low: 2 },
  ])
  checkFrames(run.frames)
})

test('3642 a rating of 3 disqualifies a book even with enough reviews', () => {
  const input = {
    min_reviews: 2,
    books: [{ book_id: 1, title: 'Hush' }],
    reviews: [{ book_id: 1, rating: 5 }, { book_id: 1, rating: 3 }, { book_id: 1, rating: 1 }],
  }
  assert.deepEqual(buildTrace(input).result, [])
})

test('3642 rejects a rating outside 1 to 5', () => {
  assert.throws(() => parseInput('{"min_reviews":1,"books":[],"reviews":[{"book_id":1,"rating":6}]}'))
})
