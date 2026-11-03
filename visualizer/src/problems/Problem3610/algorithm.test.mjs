import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result

function checkFrames(trace) {
  const pyLines = python.split('\n').length
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(phaseIds.has(frame.phase))
    assert.equal(typeof frame.message, 'string')
    assert.equal(frame.best.length, trace.input + 1)
  }
}

test('3610 hand-checked values', () => {
  assert.equal(solve(1), -1)
  assert.equal(solve(2), 1)
  assert.equal(solve(4), 2)
  assert.equal(solve(27), 3)
})

test('3610 rejects out-of-range targets', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('61'))
  assert.throws(() => parseInput('2.5'))
})

test('3610 frames carry valid lines and phases', () => {
  checkFrames(buildTrace(27))
})

// Oracle: breadth-first search over sums using every prime as a step.
function oracle(target) {
  const isP = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true }
  const dist = Array(target + 1).fill(-1)
  dist[0] = 0
  const queue = [0]
  for (let q = 0; q < queue.length; q++) {
    const s = queue[q]
    for (let p = 2; p <= target; p++) {
      if (!isP(p) || s + p > target || dist[s + p] !== -1) continue
      dist[s + p] = dist[s] + 1
      queue.push(s + p)
    }
  }
  return dist[target]
}

test('3610 matches a BFS oracle for every target up to 60', () => {
  for (let t = 1; t <= 60; t++) assert.equal(solve(t), oracle(t), `target ${t}`)
})
