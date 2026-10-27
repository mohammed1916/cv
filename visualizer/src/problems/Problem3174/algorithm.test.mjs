import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3174 examples', () => {
  assert.equal(solve('cb34'), '')
  assert.equal(solve('abc'), 'abc')
  assert.equal(solve('ab12c'), 'c')
})

test('3174 a digit with no letter to its left is rejected', () => {
  assert.throws(() => parseInput('"1a"'), /no letter/)
  assert.throws(() => parseInput('"A1"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: repeatedly delete the first digit and the character before it, as the statement describes.
function oracle(s) {
  let t = s
  while (/[0-9]/.test(t)) {
    const i = t.search(/[0-9]/)
    t = t.slice(0, i - 1) + t.slice(i + 1)
  }
  return t
}

test('3174 random strings match the delete-first-digit oracle', () => {
  let seed = 3174
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 600; t++) {
    let s = ''
    const len = 1 + rnd(12)
    for (let i = 0; i < len; i++) s += rnd(3) === 0 ? String(rnd(10)) : String.fromCharCode(97 + rnd(26))
    try { parseInput(JSON.stringify(s)) } catch { continue }
    checked++
    assert.equal(solve(s), oracle(s), s)
  }
  assert.ok(checked > 100)
})
