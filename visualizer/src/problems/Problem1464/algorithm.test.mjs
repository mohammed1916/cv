import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('1464 sample inputs give the expected products', () => {
  assert.equal(solve([3, 4, 5, 2]), 12)
  assert.equal(solve([1, 5, 4, 5]), 16)
  assert.equal(solve([7, 7]), 36)
})

test('1464 rejects malformed input', () => {
  assert.throws(() => parseInput('[1]'), /2 to 500/)
  assert.throws(() => parseInput('[0,4]'), /1 to 1000/)
  assert.throws(() => parseInput('{"nums":[1,2]}'), /2 to 500/)
})

// Independent oracle: sort a copy in descending order and take the first two values.
test('1464 random arrays match a sorting oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(9)
    const nums = Array.from({ length: len }, () => 1 + rnd(20))
    const sorted = [...nums].sort((a, b) => b - a)
    assert.equal(solve(nums), (sorted[0] - 1) * (sorted[1] - 1), JSON.stringify(nums))
  }
})

test('1464 every frame points at a real phase and code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ nums: [2, 9, 4] }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
  }
})
