import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent check: a direct recursive game search with memoization, written without the table.
function bruteWins(n, memo = new Map()) {
  if (memo.has(n)) return memo.get(n)
  let result = false
  for (let x = 1; x < n && !result; x++) {
    if (n % x === 0 && !bruteWins(n - x, memo)) result = true
  }
  memo.set(n, result)
  return result
}

test('sample inputs give the expected outcome', () => {
  assert.equal(buildTrace({ n: 2 }).result, true)
  assert.equal(buildTrace({ n: 1 }).result, false)
  assert.equal(buildTrace({ n: 9 }).result, false)
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
})

test('every pile size from 1 to 60 matches the direct game search', () => {
  for (let n = 1; n <= 60; n++) {
    const trace = buildTrace({ n })
    assert.equal(trace.result, bruteWins(n), `n=${n}`)
    checkFrames(trace)
  }
})

test('the final table agrees with the direct search for every prefix', () => {
  const { wins } = buildTrace({ n: 30 }).frames.at(-1).snapshot
  assert.equal(wins.length, 31)
  for (let i = 1; i <= 30; i++) assert.equal(wins[i], bruteWins(i), `i=${i}`)
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":61}'))
  assert.throws(() => parseInput('{"n":"4"}'))
})
