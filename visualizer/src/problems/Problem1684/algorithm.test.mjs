import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const solve = (allowed, words) => buildTrace({ allowed, words }).result

test('1684 a small mixed list counts only the fully allowed words', () => {
  assert.equal(solve('ab', ['ab', 'ba', 'aab', 'abc', 'ca']), 3)
})

test('1684 a word containing one disallowed letter at the end is rejected', () => {
  assert.equal(solve('xyz', ['xyzq']), 0)
  assert.equal(solve('xyz', ['zyx', 'xyzz']), 2)
})

test('1684 random inputs match a set-based oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const pool = [...new Set(Array.from({ length: 1 + rnd(8) }, () => letters[rnd(26)]))].join('')
    const words = Array.from({ length: 1 + rnd(12) }, () => Array.from({ length: 1 + rnd(10) }, () => letters[rnd(8)]).join(''))
    const input = JSON.stringify({ allowed: pool, words })
    parseInput(input)
    const allowed = new Set(pool)
    const expected = words.filter(w => [...w].every(ch => allowed.has(ch))).length
    assert.equal(solve(pool, words), expected, input)
  }
})

test('1684 malformed input is rejected', () => {
  assert.throws(() => parseInput('{"allowed":"aab","words":["a"]}'), /repeat/)
  assert.throws(() => parseInput('{"allowed":"ab","words":["A"]}'), /lowercase/)
  assert.throws(() => parseInput('{"allowed":"ab","words":[]}'), /1 to 12/)
  assert.throws(() => parseInput('["ab"]'), /object/)
})

test('1684 every frame has a message and lines inside the solver', () => {
  const run = buildTrace({ allowed: 'ab', words: ['ab', 'abc'] })
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 12)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
