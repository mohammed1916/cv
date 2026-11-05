import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2168 worked examples', () => {
  assert.equal(solve('1212'), 5)
  assert.equal(solve('12321'), 9)
  assert.equal(solve('7'), 1)
  assert.equal(solve('1111'), 4)
})

test('2168 rejects invalid input', () => {
  assert.throws(() => parseInput('12a'))
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('1'.repeat(13)))
})

function oracle(s) {
  const seen = new Set()
  for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
    const freq = new Map()
    for (const c of s.slice(i, j + 1)) freq.set(c, (freq.get(c) || 0) + 1)
    if (new Set(freq.values()).size === 1) seen.add(s.slice(i, j + 1))
  }
  return seen.size
}

test('2168 random strings match a direct-count oracle', () => {
  let seed = 2168
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + rnd(9) }, () => String(rnd(4))).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('2168 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('1212')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
