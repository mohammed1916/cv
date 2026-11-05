import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, lights, requirement) => buildTrace({ n, lights, requirement }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (n, lights, requirement) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_meeting_requirement(${n}, ${JSON.stringify(lights)}, ${JSON.stringify(requirement)}))`]).toString().trim())

test('2237 worked examples', () => {
  assert.equal(solve(4, [[1, 1], [3, 0]], [0, 1, 1, 2]), 3)
  assert.equal(solve(3, [[0, 1], [2, 2], [0, 1]], [2, 2, 2]), 2)
  assert.equal(solve(4, [[1, 0]], [0, 1, 0, 0]), 4)
})

test('2237 lamps are clipped at the street edges', () => {
  assert.equal(solve(3, [[0, 5]], [1, 1, 1]), 3)
  assert.equal(solve(3, [[2, 9]], [1, 0, 1]), 3)
})

test('2237 frames point at real python lines', () => {
  for (const f of buildTrace({ n: 3, lights: [[1, 1]], requirement: [0, 1, 0] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2237 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":3,"lights":[[3,0]],"requirement":[0,0,0]}'))
  assert.throws(() => parseInput('{"n":3,"lights":[[0,0]],"requirement":[0,0]}'))
})

test('2237 random streets match a direct brightness count and the python mirror', () => {
  let seed = 2237
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(8)
    const lights = Array.from({ length: 1 + rnd(4) }, () => [rnd(n), rnd(4)])
    const requirement = Array.from({ length: n }, () => rnd(4))
    let expected = 0
    for (let p = 0; p < n; p++) {
      let b = 0
      for (const [pos, r] of lights) if (p >= Math.max(0, pos - r) && p <= Math.min(n - 1, pos + r)) b++
      if (b >= requirement[p]) expected++
    }
    assert.equal(solve(n, lights, requirement), expected, JSON.stringify({ n, lights, requirement }))
    if (t < 8) assert.equal(runPy(n, lights, requirement), expected)
  }
})
