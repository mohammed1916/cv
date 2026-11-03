import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'check', 'done'])

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

test('1517 keeps only mails that match the prefix and exact domain rules', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Users: [
    { user_id: 1, name: 'Winston', mail: 'winston@leetcode.com' },
    { user_id: 2, name: 'Jonathan', mail: 'jonathan.leetcode@leetcode.com' },
    { user_id: 3, name: 'Annabelle', mail: '1annabelle@leetcode.com' },
    { user_id: 4, name: 'Sally', mail: 'sally.2020@gmail.com' },
    { user_id: 5, name: 'Marco', mail: 'marco-x_9@leetcode.com' },
    { user_id: 6, name: 'Bad', mail: 'bad@leetcode.co' },
    { user_id: 7, name: 'Upper', mail: 'Upper@LeetCode.com' },
  ] })))
  assert.deepEqual(run.result, [
    { user_id: 1, name: 'Winston', mail: 'winston@leetcode.com' },
    { user_id: 2, name: 'Jonathan', mail: 'jonathan.leetcode@leetcode.com' },
    { user_id: 5, name: 'Marco', mail: 'marco-x_9@leetcode.com' },
  ])
  checkFrames(run)
})

test('1517 a prefix with a disallowed character is dropped', () => {
  const run = buildTrace(parseInput('{"Users":[{"user_id":1,"name":"A","mail":"a+b@leetcode.com"}]}'))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('1517 an empty user list returns no rows', () => {
  const run = buildTrace(parseInput('{"Users":[]}'))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})
