import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = num => buildTrace({ num }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = num => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(largest_integer(${num}))`]).toString().trim())

test('2231 worked examples', () => {
  assert.equal(solve(2736), 6732)
  assert.equal(solve(9083), 9803)
  assert.equal(solve(9), 9)
})

test('2231 swaps stay within a parity class', () => {
  assert.equal(solve(2468), 8642)
  assert.equal(solve(1357), 7531)
})

test('2231 frames point at real lines', () => {
  for (const f of buildTrace({ num: 1234 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2231 rejects bad input', () => {
  assert.throws(() => parseInput('{"num":0}'))
  assert.throws(() => parseInput('{"num":1.5}'))
})

function oracle(num) {
  const seen = new Set([String(num)])
  const queue = [String(num)]
  while (queue.length) {
    const s = queue.pop()
    for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
      if ((s[i] % 2) !== (s[j] % 2)) continue
      const t = s.split(''); [t[i], t[j]] = [t[j], t[i]]
      const u = t.join('')
      if (!seen.has(u)) { seen.add(u); queue.push(u) }
    }
  }
  return Math.max(...[...seen].map(Number))
}

test('2231 matches a brute-force closure over swaps', () => {
  let seed = 2231
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const num = 1 + rnd(99999)
    assert.equal(solve(num), oracle(num), String(num))
    if (t < 10) assert.equal(runPy(num), oracle(num), String(num))
  }
})
