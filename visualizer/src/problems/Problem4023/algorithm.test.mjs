import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (start, floors) => buildTrace({ start, floors }).result

test('4023 small hand cases', () => {
  assert.equal(solve(3, [3]), 0)
  assert.equal(solve(1, [2]), 1)
  assert.equal(solve(3, [1, 5]), 8)
  assert.equal(solve(1, [2, 3]), 3)
})

test('4023 rejects invalid floors', () => {
  assert.throws(() => parseInput('{"start":0,"floors":[1]}'))
  assert.throws(() => parseInput('{"start":1,"floors":[]}'))
})

// Brute oracle: try every visiting order, moving directly between floors, and sum arrival times.
function brute(start, floors) {
  const targets = [...new Set(floors)].filter(f => f !== start)
  let best = Infinity
  const rec = (pos, time, left, sum) => {
    if (left.length === 0) {
      best = Math.min(best, sum)
      return
    }
    for (let i = 0; i < left.length; i++) {
      const next = left[i]
      const arrive = time + Math.abs(next - pos)
      rec(next, arrive, [...left.slice(0, i), ...left.slice(i + 1)], sum + arrive)
    }
  }
  rec(start, 0, targets, 0)
  return best === Infinity ? 0 : best
}

test('4023 matches a visiting-order enumeration', () => {
  let seed = 4023
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const start = 1 + rnd(12)
    const floors = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(12))
    assert.equal(solve(start, floors), brute(start, floors), JSON.stringify({ start, floors }))
  }
})

test('4023 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ start: 4, floors: [1, 6, 9] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
