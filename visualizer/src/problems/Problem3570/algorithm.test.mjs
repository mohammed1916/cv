import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const SAMPLE = JSON.stringify({
  library_books: [
    { book_id: 1, title: 'Atlas', author: 'Ruiz', genre: 'fiction', publication_year: 2001, total_copies: 2 },
    { book_id: 2, title: 'Brook', author: 'Chen', genre: 'science', publication_year: 2010, total_copies: 1 },
    { book_id: 3, title: 'Cedar', author: 'Okafor', genre: 'history', publication_year: 1999, total_copies: 3 },
    { book_id: 4, title: 'Delta', author: 'Park', genre: 'fiction', publication_year: 2018, total_copies: 1 },
  ],
  borrowing_records: [
    { record_id: 1, book_id: 1, borrower_name: 'ann', borrow_date: '2024-01-01', return_date: '2024-01-10' },
    { record_id: 2, book_id: 1, borrower_name: 'bo', borrow_date: '2024-02-01', return_date: null },
    { record_id: 3, book_id: 1, borrower_name: 'cy', borrow_date: '2024-02-05', return_date: null },
    { record_id: 4, book_id: 2, borrower_name: 'dee', borrow_date: '2024-03-01', return_date: null },
    { record_id: 5, book_id: 3, borrower_name: 'eve', borrow_date: '2024-03-02', return_date: null },
    { record_id: 6, book_id: 3, borrower_name: 'fay', borrow_date: '2024-03-03', return_date: '2024-03-20' },
    { record_id: 7, book_id: 4, borrower_name: 'gus', borrow_date: '2024-01-05', return_date: '2024-01-06' },
    { record_id: 8, book_id: 2, borrower_name: 'hal', borrow_date: '2023-12-01', return_date: '2023-12-20' },
  ],
})

const PHASES = ['load', 'filter', 'count', 'compare', 'output']

function checkFrames(run) {
  const pythonCount = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(PHASES.includes(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonCount)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.result))
  }
  let previous = 0
  for (const frame of run.frames) {
    assert.ok(frame.result.length >= previous, 'result never shrinks')
    previous = frame.result.length
  }
  assert.deepEqual(run.frames.at(-1).result, run.result)
}

test('3570 sample lists Atlas and Brook, whose open loans equal their copies', () => {
  const run = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(run.result, [
    { book_id: 1, title: 'Atlas' },
    { book_id: 2, title: 'Brook' },
  ])
  checkFrames(run)
})

test('3570 a book with no records at all is never listed', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    library_books: [{ book_id: 5, title: 'Echo', author: 'Lind', genre: 'poetry', publication_year: 1990, total_copies: 1 }],
    borrowing_records: [],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('3570 rejects a record for an unknown book', () => {
  assert.throws(() => parseInput('{"library_books":[],"borrowing_records":[{"record_id":1,"book_id":9,"borrower_name":"x","borrow_date":"2024-01-01","return_date":null}]}'))
})
