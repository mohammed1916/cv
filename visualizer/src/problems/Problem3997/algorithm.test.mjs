import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(values).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Oracle: explicit recursion over subtree lists.
function oracle(values) {
  const n = values.length
  const subtree = i => {
    const items = [values[i]]
    for (const c of [2 * i + 1, 2 * i + 2]) if (c < n) items.push(...subtree(c))
    return items
  }
  let count = 0
  for (let i = 0; i < n; i++) if (values[i] === Math.max(...subtree(i))) count++
  return count
}

test('3997 authored examples', () => {
  assert.equal(solve([4, 6, 2, 3, 1, 5, 7]), 5)
  assert.equal(solve([9, 9, 9]), 3)
})

test('3997 a lone root and a leaf-only chain', () => {
  assert.equal(solve([5]), 1)
  assert.equal(solve([3, 1, 2]), 3)
  assert.equal(solve([1, 3, 2]), 2)
})

test('3997 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1,2.5]'))
})

test('3997 random complete trees match a recursive oracle', () => {
  let seed = 3997
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(15)
    const values = Array.from({ length: n }, () => 1 + rnd(6))
    const run = buildTrace(values)
    assert.equal(run.result, oracle(values), JSON.stringify(values))
    checkFrames(run)
  }
})
