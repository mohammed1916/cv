import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = labels => buildTrace(labels).result

test('2782 presets give the expected category counts', () => {
  assert.equal(solve([0, 1, 0, 2, 1, 2, 3]), 4)
  assert.equal(solve([5, 5, 5, 5]), 1)
  assert.equal(solve([4, 0, 7, 2, 9]), 5)
})

test('2782 a single element is one category', () => {
  assert.equal(solve([3]), 1)
})

test('2782 rejects inputs outside the visualization domain', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,1,2,3,4,5,6,7,8,9,10,11,0]'))
  assert.throws(() => parseInput('[12]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('{"a":1}'))
})

test('2782 frames reference real pseudocode and python lines', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace([0, 1, 0, 2])
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.reps.every((r, idx) => run.frames.length && r < run.input.length))
    assert.ok(f.assigned.every(a => a >= -1 && a < f.reps.length))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).result, run.result)
})

// Oracle: the number of distinct hidden labels.
test('2782 random inputs match a distinct-label oracle', () => {
  let seed = 2782
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const labels = Array.from({ length: 1 + rnd(10) }, () => rnd(6))
    assert.equal(solve(labels), new Set(labels).size, JSON.stringify(labels))
  }
})
