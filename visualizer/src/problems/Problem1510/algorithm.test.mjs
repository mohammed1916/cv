import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: plain recursion with memoisation over the rules as stated.
function oracle(n) {
  const memo = new Map()
  const wins = m => {
    if (m === 0) return false
    if (memo.has(m)) return memo.get(m)
    let result = false
    for (let k = 1; k * k <= m && !result; k++) if (!wins(m - k * k)) result = true
    memo.set(m, result)
    return result
  }
  return wins(n)
}

test('small known positions', () => {
  assert.equal(buildTrace(1).result, true)   // take the single stone; the opponent has none
  assert.equal(buildTrace(2).result, false)  // only one stone can be taken each turn; the reply leaves a win
  assert.equal(buildTrace(4).result, true)   // take all four stones
})

test('every n from 1 to 60 agrees with the recursive oracle', () => {
  for (let n = 1; n <= 60; n++) assert.equal(buildTrace(n).result, oracle(n), `n=${n}`)
})

test('parseInput accepts whole numbers from 1 to 60 and rejects the rest', () => {
  assert.equal(parseInput(' 7 '), 7)
  assert.throws(() => parseInput('0'), /1 to 60/)
  assert.throws(() => parseInput('61'), /1 to 60/)
  assert.throws(() => parseInput('2.5'), /whole number/)
  assert.throws(() => parseInput('abc'), /whole number/)
})

test('every frame names a real phase and in-range code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace(9)
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length - 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
