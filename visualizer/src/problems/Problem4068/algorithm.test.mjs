import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = meetings => buildTrace(meetings).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

// Independent oracle: every non-empty subset whose meetings do not overlap (half-open intervals).
function oracle(meetings) {
  const n = meetings.length
  let best = -Infinity
  for (let mask = 1; mask < 1 << n; mask++) {
    const chosen = meetings.filter((_, k) => mask & (1 << k)).sort((a, b) => a[0] - b[0])
    let total = 0
    let ok = true
    for (let k = 0; k < chosen.length; k++) {
      total += chosen[k][2]
      if (k > 0) {
        if (chosen[k - 1][1] > chosen[k][0]) { ok = false; break }
        total += chosen[k][0] - chosen[k - 1][1]
      }
    }
    if (ok) best = Math.max(best, total)
  }
  return best
}

test('4068 a single meeting earns its revenue only', () => {
  assert.equal(solve([[2, 5, 9]]), 9)
})

test('4068 gaps between chosen meetings add to the earnings', () => {
  // Meeting 0 then meeting 1: 10 + 2 + the gap 3 - 2 = 13. Taking only meeting 0 gives 10.
  assert.equal(solve([[1, 2, 10], [3, 4, 2]]), 13)
})

test('4068 touching meetings are allowed and overlapping ones are not', () => {
  assert.equal(solve([[0, 5, 4], [5, 9, 4]]), 8) // half-open: 5 is free again
  assert.equal(solve([[0, 5, 4], [4, 9, 7]]), 7) // overlap, so the single larger meeting wins
})

test('4068 a long gap can beat a short high-revenue meeting', () => {
  assert.equal(solve([[0, 1, 1], [1, 2, 1], [50, 60, 3]]), 1 + 1 + 48 + 3)
})

test('4068 random meeting sets match the subset oracle and frames stay valid', () => {
  let seed = 4068
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const meetings = Array.from({ length: 1 + rnd(7) }, () => {
      const start = rnd(20)
      const end = start + 1 + rnd(8)
      return [start, end, 1 + rnd(9)]
    })
    const run = buildTrace(meetings)
    assert.equal(run.result, oracle(meetings), JSON.stringify(meetings))
    checkFrames(run)
  }
})

test('4068 rejects malformed meetings', () => {
  assert.throws(() => parseInput('[[3,3,1]]'))
  assert.throws(() => parseInput('[[1,2]]'))
  assert.throws(() => parseInput('[[1,2,0]]'))
})
