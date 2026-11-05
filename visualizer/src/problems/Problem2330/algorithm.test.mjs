import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = s => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(can_make_palindrome("${s}"))`]).toString().trim() === 'True'

test('2330 worked examples', () => {
  assert.equal(solve('kitten'), true)
  assert.equal(solve('harbors'), false)
  assert.equal(solve('a'), true)
})

test('2330 a palindrome or one mismatch is always fixable', () => {
  assert.equal(solve('abcba'), true)
  assert.equal(solve('abcdeba'), true)
  assert.equal(solve('abcdef'), false)
})

test('2330 frames point at real python lines', () => {
  for (const f of buildTrace({ s: 'abca' }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2330 rejects invalid input', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('AbC'))
  assert.throws(() => parseInput('a'.repeat(21)))
})

test('2330 random strings match a brute force over one or two changes and the python mirror', () => {
  const letters = 'abc'
  const ok = (s, ops) => {
    const n = s.length
    const mismatches = []
    for (let i = 0; i < Math.floor(n / 2); i++) if (s[i] !== s[n - 1 - i]) mismatches.push(i)
    if (ops === 1) return mismatches.length <= 1 && (n % 2 === 1 || mismatches.length === 1 || mismatches.length === 0) && (mismatches.length === 1 || mismatches.length === 0)
    return mismatches.length <= 2
  }
  let seed = 2330
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + rnd(6) }, () => letters[rnd(3)]).join('')
    const expected = ok(s, 2)
    assert.equal(solve(s), expected, s)
    if (t < 8) assert.equal(runPy(s), expected, s)
  }
})
