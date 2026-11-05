import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, sql, python, pythonLineMap } from './algorithm.js'

test('1729 examples, code, sql and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 5)
  assert.ok(sql.includes('GROUP BY user_id'))
  assert.ok(python.includes('def countFollowers'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1729 counts followers per user in user order', () => {
  assert.deepEqual(buildTrace(parseInput(examples[0].input)).result, [
    { user_id: 2, followers_count: 2 }, { user_id: 7, followers_count: 2 }, { user_id: 9, followers_count: 1 },
  ])
})

test('1729 rejects invalid rows', () => {
  assert.throws(() => parseInput('[{"user_id":1,"follower_id":1}]'))
})
