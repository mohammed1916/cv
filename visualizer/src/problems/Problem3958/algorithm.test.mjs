import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result
const pyLineCount = python.trim().split('\n').length

test('3958 hand-checked values', () => {
  assert.equal(solve(1), 0)
  assert.equal(solve(2), 1)
  assert.equal(solve(3), 3)
  assert.equal(solve(4), 6)
})

test('3958 rejects out-of-range inputs', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('41'))
  assert.throws(() => parseInput('2.5'))
})

// Independent oracle: memoised recursion over every split a + b = x.
function oracle(n) {
  const memo = new Map()
  const f = x => {
    if (x === 1) return 0
    if (memo.has(x)) return memo.get(x)
    let best = Infinity
    for (let a = 1; a < x; a++) best = Math.min(best, a * (x - a) + f(a) + f(x - a))
    memo.set(x, best)
    return best
  }
  return f(n)
}

test('3958 DP agrees with the recursive oracle for 1 to 30', () => {
  for (let n = 1; n <= 30; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('3958 frame invariants hold', () => {
  const run = buildTrace(parseInput('12'))
  assert.equal(run.frames[run.frames.length - 1].phase, 'done')
  assert.equal(run.frames[run.frames.length - 1].result ?? run.result, run.result)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLineCount)
    assert.equal(frame.best.length, 13)
    assert.equal(frame.best[1], 0)
  }
  for (const frame of run.frames.filter(f => f.phase === 'keep')) assert.equal(frame.best[frame.x], frame.cand)
})
