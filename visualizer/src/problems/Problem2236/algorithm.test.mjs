import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (root, left, right) => buildTrace({ root, left, right }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (r, l, rt) => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(check_tree(${r}, ${l}, ${rt}))`]).toString().trim() === 'True'

test('2236 worked examples', () => {
  assert.equal(solve(9, 2, 7), true)
  assert.equal(solve(4, 1, 2), false)
})

test('2236 negative values and zero', () => {
  assert.equal(solve(-2, -1, -1), true)
  assert.equal(solve(0, 0, 0), true)
  assert.equal(runPy(3, 1, 1), false)
})

test('2236 random triples match the python mirror', () => {
  let seed = 2236
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 10; t++) {
    const [r, l, rt] = [rnd(9) - 4, rnd(9) - 4, rnd(9) - 4]
    assert.equal(solve(r, l, rt), runPy(r, l, rt), `${r} ${l} ${rt}`)
  }
})

test('2236 frames point at real python lines', () => {
  for (const f of buildTrace({ root: 3, left: 1, right: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2236 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"root":101,"left":0,"right":0}'))
})
