import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(values).result
const pyLines = python.split('\n').length

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
    assert.equal(typeof f.message, 'string')
  }
}

test('3062 authored examples', () => {
  assert.equal(solve([4, 9, 2, 7, 5, 5]), 'Odd')
  assert.equal(solve([8, 1, 3, 3, 6, 2, 5, 4]), 'Even')
  assert.equal(solve([2, 2, 7, 7]), 'Tie')
})

test('3062 rejects odd length and out-of-range values', () => {
  assert.throws(() => parseInput('[1, 2, 3]'))
  assert.throws(() => parseInput('[1, 101]'))
})

test('3062 smallest case and frame invariants', () => {
  assert.equal(solve([1, 2]), 'Odd')
  assertFrames(buildTrace([8, 1, 3, 3, 6, 2, 5, 4]))
})

// Oracle: count the points directly with a straight pair loop.
test('3062 random inputs match a direct scoring oracle', () => {
  let seed = 3062
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 * (1 + rnd(6))
    const values = Array.from({ length: len }, () => 1 + rnd(5))
    let even = 0, odd = 0
    for (let i = 0; i < len; i += 2) {
      if (values[i] > values[i + 1]) even++
      else if (values[i + 1] > values[i]) odd++
    }
    const expected = even > odd ? 'Even' : odd > even ? 'Odd' : 'Tie'
    assert.equal(solve(values), expected, JSON.stringify(values))
    assertFrames(buildTrace(values))
  }
})
