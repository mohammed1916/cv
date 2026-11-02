import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace(s).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1842 worked examples', () => {
  assert.equal(solve('1221'), '2112')
  assert.equal(solve('1331'), '3113')
  assert.equal(solve('11'), '')
  assert.equal(solve('9'), '')
  assert.equal(solve('12321'), '21312')
  assert.equal(solve('11111'), '')
})

test('1842 rejects non-palindromes and sizes above the cap', () => {
  assert.throws(() => parseInput('1212'))
  assert.throws(() => parseInput('12345678987654321'))
})

test('1842 frames point at real pseudocode and python lines', () => {
  const run = buildTrace('1221')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: all distinct rearrangements of the digits; keep palindromes larger than s; take the smallest.
function oracle(s) {
  const digits = s.split('')
  const out = new Set()
  const used = Array(digits.length).fill(false)
  const build = cur => {
    if (cur.length === digits.length) { out.add(cur); return }
    for (let k = 0; k < digits.length; k++) {
      if (used[k]) continue
      used[k] = true
      build(cur + digits[k])
      used[k] = false
    }
  }
  build('')
  const larger = [...out].filter(p => p > s && p === [...p].reverse().join(''))
  return larger.length ? larger.sort()[0] : ''
}

test('1842 small palindromes match a permutation oracle', () => {
  const seeds = ['1', '22', '121', '1221', '1331', '2332', '12321', '3443', '123321', '112211', '1001', '22522', '1111', '12021', '90909', '11211']
  for (const s of seeds) assert.equal(solve(s), oracle(s), s)
})
