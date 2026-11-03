import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (a, b) => buildTrace({ a, b }).result

test('3032 worked presets', () => {
  assert.equal(solve(1, 20), 19)
  assert.equal(solve(100, 120), 9)
  assert.equal(solve(0, 9), 10)
})

test('3032 small hand-checked counts', () => {
  assert.equal(solve(0, 0), 1)
  assert.equal(solve(10, 10), 1)
  assert.equal(solve(11, 11), 0)
  assert.equal(solve(0, 100), 91)
  assert.equal(solve(98, 102), 2)
})

test('3032 rejects bad input', () => {
  assert.throws(() => parseInput('{"a":5,"b":4}'))
  assert.throws(() => parseInput('{"a":-1,"b":4}'))
  assert.throws(() => parseInput('{"a":1,"b":100000}'))
})

// Oracle: test every integer in the range directly.
function oracle(a, b) {
  let count = 0
  for (let x = a; x <= b; x++) {
    const digits = String(x)
    if (new Set(digits).size === digits.length) count++
  }
  return count
}

test('3032 random ranges match a direct-check oracle', () => {
  let seed = 3032
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const a = rnd(3000)
    const b = a + rnd(3000)
    assert.equal(solve(a, b), oracle(a, b), JSON.stringify({ a, b }))
  }
})

test('3032 frame invariants hold', () => {
  const { frames, result } = buildTrace({ a: 1, b: 20 })
  const lines = python.trim().split('\n').length
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= lines)
    assert.ok(f.message.length > 0)
    assert.ok(f.used.length <= 10)
    assert.ok(f.pos === -1 || f.pos < f.digits.length)
  }
  assert.equal(frames.at(-1).answer, result)
})

test('3032 python export is a complete function', () => {
  assert.match(python, /def count_between\(a, b\):/)
  assert.match(python, /return count_distinct\(b\) - count_distinct\(a - 1\)/)
})
