import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (start, n, m) => buildTrace({ start, n, m }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Brute force: enumerate every alternating sequence with strict turns and steps 1..m.
function brute(start, n, m) {
  let best = start
  const dfs = (value, len, lastSign) => {
    best = Math.max(best, value)
    if (len === n) return
    for (const sign of [1, -1]) {
      if (lastSign === sign) continue
      for (let d = 1; d <= m; d++) dfs(value + sign * d, len + 1, sign)
    }
  }
  dfs(start, 1, 0)
  return best
}

test('3993 authored examples', () => {
  assert.equal(solve(5, 4, 3), 10)
  assert.equal(solve(20, 1, 9), 20)
  assert.equal(solve(2, 5, 1), 3)
})

test('3993 a single element is the start value', () => {
  assert.equal(solve(1, 1, 1), 1)
  assert.equal(solve(50, 1, 20), 50)
})

test('3993 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"start":0,"n":1,"m":1}'))
  assert.throws(() => parseInput('{"start":1,"n":13,"m":1}'))
  assert.throws(() => parseInput('{"start":1,"n":2,"m":21}'))
})

test('3993 small cases match an exhaustive search and the closed form', () => {
  for (let start = 1; start <= 4; start++) {
    for (let n = 1; n <= 5; n++) {
      for (let m = 1; m <= 3; m++) {
        const expected = brute(start, n, m)
        assert.equal(solve(start, n, m), expected, `start=${start} n=${n} m=${m}`)
        const downFirst = start + Math.floor((n - 1) / 2) * (m - 1)
        const upFirst = n === 1 ? start : start + 1 + Math.floor(n / 2) * (m - 1)
        assert.equal(expected, Math.max(downFirst, upFirst))
        checkFrames(buildTrace({ start, n, m }))
      }
    }
  }
})
