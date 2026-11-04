import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('2189 hand-checked totals', () => {
  assert.equal(solve(1), 0)
  assert.equal(solve(2), 1)
  assert.equal(solve(4), 0)
  assert.equal(solve(7), 1)
  assert.equal(solve(16), 2)
})

test('2189 the parser rejects out-of-range counts', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":41}'))
  assert.throws(() => parseInput('{"n":2.5}'))
  assert.throws(() => parseInput('[4]'))
})

// Independent oracle: enumerate every set of distinct row sizes whose costs add up to n.
function oracle(n) {
  let count = 0
  const walk = (left, t) => {
    if (left === 0) { count++; return }
    for (let u = t; 3 * u - 1 <= left; u++) walk(left - (3 * u - 1), u + 1)
  }
  walk(n, 1)
  return count
}

test('2189 totals match the enumeration oracle up to 40 cards', () => {
  for (let n = 1; n <= 40; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('2189 frame invariants hold', () => {
  const run = buildTrace({ n: 12 })
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, f.phase)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
    assert.equal(f.ways.length, 13)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).ways[12], run.result)
})
