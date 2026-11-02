import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const reformat = date => buildTrace(parseInput(JSON.stringify({ date }))).result

test('1507 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"date":"20th Oct 2052"}')).result, '2052-10-20')
  assert.equal(buildTrace(parseInput('{"date":"6th Jun 1933"}')).result, '1933-06-06')
  assert.equal(buildTrace(parseInput('{"date":"26th May 1960"}')).result, '1960-05-26')
})

test('1507 every ordinal suffix and month maps to the same two-digit fields', () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const suffixes = { 1: 'st', 2: 'nd', 3: 'rd', 21: 'st', 22: 'nd', 23: 'rd', 31: 'st' }
  months.forEach((month, index) => {
    for (const day of [1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 30, 31]) {
      const suffix = suffixes[day] || 'th'
      const year = 1900 + index * 9
      const expected = `${year}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      assert.equal(reformat(`${day}${suffix} ${month} ${year}`), expected)
    }
  })
})

test('1507 rejects a malformed date', () => {
  assert.throws(() => parseInput('{"date":"2052-10-20"}'))
})
