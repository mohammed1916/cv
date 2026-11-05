import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (s, k) => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(digit_sum_rounds("${s}", ${k}))`]).toString().trim()

test('2243 rounds repeat until the string fits', () => {
  assert.equal(solve('1234567', 3), '127')
  assert.equal(solve('8745', 2), '69')
  assert.equal(solve('123', 3), '123')
})

test('2243 a single round when the length is exactly two groups', () => {
  assert.equal(solve('9999', 2), '99')
})

test('2243 frames point at real python lines', () => {
  for (const f of buildTrace({ s: '1234', k: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2243 rejects non-digit strings', () => {
  assert.throws(() => parseInput('{"s":"12a","k":2}'))
  assert.throws(() => parseInput('{"s":"12","k":1}'))
})

test('2243 matches a direct simulation and the python mirror', () => {
  let seed = 2243
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 100; t++) {
    const len = 1 + rnd(20)
    const s = Array.from({ length: len }, () => String(rnd(10))).join('')
    const k = 2 + rnd(4)
    let cur = s
    while (cur.length > k) {
      let nx = ''
      for (let i = 0; i < cur.length; i += k) nx += String([...cur.slice(i, i + k)].reduce((a, c) => a + Number(c), 0))
      cur = nx
    }
    assert.equal(solve(s, k), cur, `${s} ${k}`)
    if (t < 8) assert.equal(runPy(s, k), cur)
  }
})
