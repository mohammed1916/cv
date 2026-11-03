import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const books = [
  { book_id: 1, title: 'Dune', author: 'Herbert', published_year: 1965, rating: 4.5 },
  { book_id: 2, title: 'Ulysses', author: 'Joyce', published_year: 1922, rating: null },
  { book_id: 3, title: 'Emma', author: 'Austen', published_year: 1815, rating: 0 },
  { book_id: 4, title: 'Beloved', author: 'Morrison', published_year: 1987, rating: null },
  { book_id: 5, title: 'Notes', author: 'Anon', published_year: 2000, rating: null },
]

test('3358 keeps only NULL ratings and never zero ratings', () => {
  assert.deepEqual(buildTrace({ books }).result, [
    { book_id: 2, title: 'Ulysses' },
    { book_id: 4, title: 'Beloved' },
    { book_id: 5, title: 'Notes' },
  ])
})

test('3358 a table with only zero ratings gives an empty result', () => {
  assert.deepEqual(buildTrace({ books: [{ book_id: 7, title: 'Z', author: 'A', published_year: 2001, rating: 0 }] }).result, [])
})

test('3358 frame invariants hold', () => {
  const { frames } = buildTrace({ books })
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

test('3358 parseInput rejects a rating outside 0 to 5', () => {
  assert.throws(() => parseInput('{"books":[{"book_id":1,"title":"a","author":"b","published_year":1,"rating":9}]}'))
  assert.doesNotThrow(() => parseInput('{"books":[{"book_id":1,"title":"a","author":"b","published_year":1,"rating":null}]}'))
})
