import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = values => buildTrace({ values }).result

test('147 sample lists come out sorted', () => {
  assert.deepEqual(solve([4, 2, 1, 3]), [1, 2, 3, 4])
  assert.deepEqual(solve([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3])
  assert.deepEqual(solve([7]), [7])
})

test('147 random lists match a sorting oracle', () => {
  let seed = 13
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(15)
    const values = Array.from({ length: len }, () => rnd(199) - 99)
    assert.deepEqual(solve(values), [...values].sort((a, b) => a - b), JSON.stringify(values))
  }
})

test('147 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /1 to 30/)
  assert.throws(() => parseInput('[1,100]'), /-99 to 99/)
  assert.throws(() => parseInput('{"values":[1]}'), /1 to 30/)
})

test('147 every frame points at a real phase and code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ values: [5, 1, 4, 2] }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
