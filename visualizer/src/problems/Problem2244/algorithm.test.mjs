import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = tasks => buildTrace({ tasks }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = tasks => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(minimum_rounds([${tasks.join(',')}]))`]).toString().trim())

test('2244 groups of 2 and 3 cover each difficulty', () => {
  assert.equal(solve([2, 2, 3, 3, 2, 4, 4, 4, 4, 4]), 4)
  assert.equal(solve([2, 3, 3, 2, 3]), 2)
})

test('2244 a lone task makes the whole job impossible', () => {
  assert.equal(solve([1, 1, 2]), -1)
})

test('2244 counts of 4 and 5 need two rounds each', () => {
  assert.equal(solve([7, 7, 7, 7]), 2)
  assert.equal(solve([8, 8, 8, 8, 8]), 2)
})

test('2244 frames point at real python lines', () => {
  for (const f of buildTrace({ tasks: [1, 1, 2, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2244 matches a brute force over group sizes and the python mirror', () => {
  const best = c => { if (c === 0) return 0; let b = Infinity; for (let x = 2; x <= 3; x++) if (c >= x) { const r = best(c - x); if (r !== Infinity) b = Math.min(b, r + 1) } return b }
  let seed = 2244
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const tasks = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(3))
    const counts = {}
    for (const x of tasks) counts[x] = (counts[x] || 0) + 1
    let expected = 0
    for (const c of Object.values(counts)) { const r = best(c); if (r === Infinity) { expected = -1; break } expected += r }
    assert.equal(solve(tasks), expected, JSON.stringify(tasks))
    if (t < 8) assert.equal(runPy(tasks), expected)
  }
})

test('2244 rejects out-of-range difficulties', () => {
  assert.throws(() => parseInput('{"tasks":[0]}'))
})
