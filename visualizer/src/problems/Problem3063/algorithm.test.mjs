import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(values).result
const pyLines = python.split('\n').length

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
}

test('3063 authored examples', () => {
  assert.deepEqual(solve([3, 1, 3, 2, 1, 3]), [3, 2, 1])
  assert.deepEqual(solve([7]), [1])
  assert.deepEqual(solve([0, 0, 0, 0, 5, 5]), [4, 2])
})

test('3063 rejects values outside the visualization range', () => {
  assert.throws(() => parseInput('[10]'))
  assert.throws(() => parseInput('[]'))
})

// Oracle: a plain object tally, compared as a multiset because the order is free.
test('3063 random lists match a tally oracle', () => {
  let seed = 3063
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(12) }, () => rnd(4))
    const tally = {}
    for (const v of values) tally[v] = (tally[v] || 0) + 1
    const expected = Object.values(tally).sort((a, b) => a - b)
    assert.deepEqual([...solve(values)].sort((a, b) => a - b), expected, JSON.stringify(values))
    assertFrames(buildTrace(values))
  }
})
