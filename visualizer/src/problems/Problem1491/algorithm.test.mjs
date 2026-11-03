import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = salary => buildTrace({ salary }).result

test('1491 sample inputs give the expected averages', () => {
  assert.equal(solve([4000, 3000, 1000, 2000]), 2500)
  assert.equal(solve([5000, 5000, 5000]), 5000)
  assert.equal(solve([8000, 1000, 9000, 4000, 6000]), 6000)
})

test('1491 frames line up with pseudocode and Python', () => {
  assert.equal(python.split('\n').length, code.length)
  for (const frame of buildTrace({ salary: [1000, 2000, 3000] }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(frame.pythonLine, frame.activeLine)
  }
})

test('1491 rejects malformed input', () => {
  assert.throws(() => parseInput('[1000,2000,3000]'), /object/)
  assert.throws(() => parseInput('{"salary":[1000,2000]}'), /salary/)
  assert.throws(() => parseInput('{"salary":[999,2000,3000]}'), /salary/)
})

test('1491 random inputs match a sorted-removal oracle', () => {
  let seed = 31
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const salary = Array.from({ length: 3 + rnd(8) }, () => 1000 + rnd(50) * 100)
    const sorted = [...salary].sort((a, b) => a - b).slice(1, -1)
    const expected = sorted.reduce((sum, v) => sum + v, 0) / sorted.length
    assert.ok(Math.abs(solve(salary) - expected) < 1e-9, JSON.stringify(salary))
  }
})
