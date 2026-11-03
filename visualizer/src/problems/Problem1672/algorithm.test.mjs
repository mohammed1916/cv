import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = accounts => buildTrace(accounts).result

test('sample customers give the largest row total', () => {
  assert.equal(solve([[4, 4], [10, 1], [3, 3, 3]]), 11)
  assert.equal(solve([[5], [0, 0], [9, 2, 2]]), 13)
})

test('a single zero balance gives 0', () => {
  assert.equal(solve([[0]]), 0)
})

test('the trace records which customer is richest', () => {
  const run = buildTrace([[4, 4], [10, 1], [3, 3, 3]])
  assert.equal(run.frames.at(-1).snapshot.bestIndex, 1)
})

// Independent oracle: sum each row with a plain loop and take the maximum.
test('random customer lists agree with a plain maximum-sum oracle', () => {
  let seed = 21
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const accounts = Array.from({ length: 1 + rnd(8) }, () => Array.from({ length: 1 + rnd(6) }, () => rnd(101)))
    let expected = 0
    for (const row of accounts) {
      let total = 0
      for (const v of row) total += v
      if (total > expected) expected = total
    }
    assert.equal(solve(accounts), expected, JSON.stringify(accounts))
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[[1,-2]]'), /balances/)
  assert.throws(() => parseInput('[[101]]'), /0 to 100/)
  assert.throws(() => parseInput('[]'), /1 to 30/)
})

test('every frame names a real phase and lines inside the code and Python listings', () => {
  const ids = new Set(phases.map(p => p.id))
  const codeLines = code.length, pyLines = python.split('\n').length
  for (const frame of buildTrace([[4, 4], [10, 1]]).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
})
