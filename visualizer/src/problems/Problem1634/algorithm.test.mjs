import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (poly1, poly2) => buildTrace({ poly1, poly2 }).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1634 worked example merges equal powers and drops the zero term', () => {
  assert.deepEqual(solve([[2, 2], [4, 1], [3, 0]], [[3, 2], [-4, 1], [-1, 0]]), [[5, 2], [2, 0]])
})

test('1634 empty and one-sided inputs', () => {
  assert.deepEqual(solve([], []), [])
  assert.deepEqual(solve([[1, 3]], []), [[1, 3]])
  assert.deepEqual(solve([], [[-2, 0]]), [[-2, 0]])
})

test('1634 rejects unsorted or zero terms', () => {
  assert.throws(() => parseInput('{"poly1":[[1,1],[2,2]],"poly2":[]}'))
  assert.throws(() => parseInput('{"poly1":[[0,1]],"poly2":[]}'))
})

test('1634 frames point at real pseudocode and python lines', () => {
  const run = buildTrace({ poly1: [[1, 2], [1, 0]], poly2: [[1, 1]] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: add coefficients per power in a map, then drop zeros and sort descending.
function oracle(poly1, poly2) {
  const sum = new Map()
  for (const [c, p] of [...poly1, ...poly2]) sum.set(p, (sum.get(p) || 0) + c)
  return [...sum.entries()].filter(([, c]) => c !== 0).sort((a, b) => b[0] - a[0]).map(([p, c]) => [c, p])
}

test('1634 random polynomials match a power-map oracle', () => {
  let seed = 1634
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const make = () => {
    const powers = Array.from({ length: 6 }, (_, p) => p).filter(() => rnd(2) === 0).sort((a, b) => b - a)
    return powers.map(p => {
      let c = 0
      while (c === 0) c = rnd(7) - 3
      return [c, p]
    })
  }
  for (let t = 0; t < 300; t++) {
    const a = make()
    const b = make()
    assert.deepEqual(solve(a, b), oracle(a, b), JSON.stringify({ a, b }))
  }
})
