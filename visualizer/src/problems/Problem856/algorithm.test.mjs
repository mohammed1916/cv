import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function byDepth(s) {
  // Score = sum over bare pairs of 2^(number of enclosing pairs).
  let depth = 0, score = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') { depth++; if (s[i + 1] === ')') score += 2 ** (depth - 1) }
    else depth--
  }
  return score
}

test('856 worked examples', () => {
  assert.equal(buildTrace('()').result, 1)
  assert.equal(buildTrace('(())').result, 2)
  assert.equal(buildTrace('()()').result, 2)
})

test('856 random balanced strings match the bare-pair depth sum', () => {
  let state = 856
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const build = budget => { if (budget === 0) return ''; const k = 1 + rand(budget); let out = ''; for (let i = 0; i < k; i++) { const pair = rand(2) ? '()' : '(' + build(Math.floor((budget - 1) / 2)) + ')'; out += pair }; return out }
  for (let t = 0; t < 400; t++) {
    const s = build(1 + rand(10))
    if (s.length < 2 || s.length > 50) continue
    assert.equal(buildTrace(s).result, byDepth(s), s)
  }
})

test('856 rejects unbalanced input', () => {
  assert.throws(() => parseInput('"(()"'))
})
