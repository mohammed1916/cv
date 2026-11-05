import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = s => buildTrace({ s }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = s => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(longest_alphabetical_run("${s}"))`]).toString().trim())

test('2414 worked examples', () => {
  assert.equal(solve('dcfgbcdef'), 5)
  assert.equal(solve('bcdz'), 3)
  assert.equal(solve('q'), 1)
})

test('2414 frames point at real python lines', () => {
  for (const f of buildTrace({ s: 'abcd' }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2414 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

test('2414 random strings match a substring brute force and the python mirror', () => {
  let seed = 2414
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rnd(10) }, () => 'abcd'[rnd(4)]).join('')
    let brute = 1
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
      let ok = true
      for (let k = i + 1; k <= j; k++) if (s.charCodeAt(k) !== s.charCodeAt(k - 1) + 1) ok = false
      if (ok) brute = Math.max(brute, j - i + 1)
    }
    assert.equal(solve(s), brute, s)
    if (t < 8) assert.equal(runPy(s), brute)
  }
})
