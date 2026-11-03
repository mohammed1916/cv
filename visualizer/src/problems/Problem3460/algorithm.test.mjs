import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (first, second) => buildTrace({ first, second }).result

test('3460 worked presets', () => {
  assert.equal(solve('abxcd', 'abcd'), 4)
  assert.equal(solve('xyz', 'abc'), 0)
  assert.equal(solve('mnop', 'mn'), 2)
})

test('3460 edge cases', () => {
  assert.equal(solve('a', 'a'), 1)
  assert.equal(solve('a', 'b'), 0)
  assert.equal(solve('ab', 'ab'), 2)
  assert.equal(solve('b', 'ab'), 0)
})

test('3460 rejects bad input', () => {
  assert.throws(() => parseInput('{"first":"","second":"a"}'))
  assert.throws(() => parseInput('{"first":"A","second":"a"}'))
  assert.throws(() => parseInput('[]'))
})

// Oracle: delete each index (or nothing) and take the plain common prefix length.
function oracle(first, second) {
  const lcp = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i }
  let best = lcp(first, second)
  for (let r = 0; r < first.length; r++) best = Math.max(best, lcp(first.slice(0, r) + first.slice(r + 1), second))
  return best
}

test('3460 random inputs match a delete-one oracle', () => {
  let seed = 3460
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 400; t++) {
    const first = word(1 + rnd(7))
    const second = word(1 + rnd(7))
    assert.equal(solve(first, second), oracle(first, second), JSON.stringify({ first, second }))
  }
})

test('3460 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  for (const input of [{ first: 'abxcd', second: 'abcd' }, { first: 'mnop', second: 'mn' }, { first: 'a', second: 'a' }]) {
    const run = buildTrace(input)
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
      assert.ok(frame.reach >= 0 && frame.reach <= Math.max(input.first.length, input.second.length))
    }
  }
})
