import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace(n).result

test('4050 small totals by hand', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 3)
  assert.equal(solve(3), 2)
  assert.equal(solve(6), 3)
  assert.equal(solve(7), 5)
})

test('4050 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace(7)
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.strip.replace(/S/g, '').length, run.runs.length - 1)
})

test('4050 rejects bad totals', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('2.5'))
})

// Independent oracle: breadth-first search over states (points, current streak length).
function oracle(n) {
  const start = '0,0'
  const seen = new Map([[start, 0]])
  const queue = [[0, 0]]
  for (let head = 0; head < queue.length; head++) {
    const [points, streak] = queue[head]
    const d = seen.get(`${points},${streak}`)
    if (points === n) return d
    const next = [
      [points + streak + 1, streak + 1],
      [points, 0],
    ]
    for (const [p, s] of next) {
      if (p > n) continue
      const k = `${p},${s}`
      if (!seen.has(k)) {
        seen.set(k, d + 1)
        queue.push([p, s])
      }
    }
  }
  return -1
}

test('4050 totals 1 to 40 match a state search', () => {
  for (let n = 1; n <= 40; n++) assert.equal(solve(n), oracle(n), `n = ${n}`)
})
