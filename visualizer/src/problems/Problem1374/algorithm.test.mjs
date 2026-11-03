import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

// Every letter present must occur an odd number of times, and the length must be n.
function assertOddCounts(text, n) {
  assert.equal(text.length, n)
  const counts = new Map()
  for (const c of text) counts.set(c, (counts.get(c) || 0) + 1)
  for (const count of counts.values()) assert.equal(count % 2, 1, text)
}

test('odd and even lengths produce valid strings', () => {
  assert.equal(solve(1), 'a')
  assert.equal(solve(3), 'aaa')
  assert.equal(solve(2), 'ab')
  assertOddCounts(solve(4), 4)
})

test('every length from 1 to 500 yields odd counts for every present letter', () => {
  for (let n = 1; n <= 500; n++) assertOddCounts(solve(n), n)
})

test('every frame carries a phase, a code line, narration and a snapshot', () => {
  const run = buildTrace(parseInput('{"n":6}'))
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"n":0}'), /1 to 500/)
  assert.throws(() => parseInput('{"n":2.5}'), /1 to 500/)
})
