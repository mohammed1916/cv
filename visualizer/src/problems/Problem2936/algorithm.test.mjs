import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace({ values }).result
const pyLines = python.trim().split('\n').length

test('2936 teaching examples', () => {
  assert.equal(solve([1, 1, 1, 4, 4, 7, 9, 9, 9, 9, 12]), 5)
  assert.equal(solve([-3, -3, 0, 0, 0, 2, 2, 8]), 4)
  assert.equal(solve([5]), 1)
  assert.equal(solve([2, 2, 2, 2]), 1)
  assert.equal(solve([1, 2, 3, 4]), 4)
})

test('2936 parser rejects unsorted or out-of-range values', () => {
  assert.throws(() => parseInput('{"values":[2,1]}'))
  assert.throws(() => parseInput('{"values":[]}'))
  assert.throws(() => parseInput('{"values":[21]}'))
})

// Brute oracle: count positions where the value changes, plus one.
function oracle(values) {
  let blocks = 1
  for (let i = 1; i < values.length; i++) if (values[i] !== values[i - 1]) blocks++
  return blocks
}

test('2936 random sorted arrays match the scan oracle', () => {
  let seed = 2936
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(30)
    const values = Array.from({ length: size }, () => rnd(9) - 4).sort((a, b) => a - b)
    assert.equal(solve(values), oracle(values), JSON.stringify(values))
  }
})

test('2936 reads stay within a logarithmic budget per block', () => {
  let seed = 7
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 100; t++) {
    const size = 2 + rnd(39)
    const values = Array.from({ length: size }, () => rnd(12) - 6).sort((a, b) => a - b)
    const run = buildTrace({ values })
    const budget = run.result * (Math.ceil(Math.log2(size)) + 2)
    assert.ok(run.calls <= run.frames.length && run.frames.every(f => f.revealed.length <= size))
    assert.ok(run.frames.filter(f => f.phase === 'probe').length <= budget, JSON.stringify(values))
  }
})

test('2936 frames keep valid lines and only reveal real entries', () => {
  const values = [1, 1, 1, 4, 4, 7, 9, 9, 9, 9, 12]
  const run = buildTrace({ values })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    for (const r of f.revealed) assert.equal(r.value, values[r.index])
  }
})
