import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(values).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1836 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, 2]), [1, 3])
  assert.deepEqual(solve([1, 1, 1, 2, 3]), [2, 3])
  assert.deepEqual(solve([4, 4]), [])
  assert.deepEqual(solve([]), [])
  assert.deepEqual(solve([5]), [5])
})

test('1836 rejects non-integers and lists over the visualization cap', () => {
  assert.throws(() => parseInput('[1,"a"]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13]'))
})

test('1836 frames point at real pseudocode and python lines', () => {
  const run = buildTrace([1, 2, 1])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: for each position, look for any other equal value anywhere in the list.
function oracle(values) {
  return values.filter((v, i) => values.every((w, j) => j === i || w !== v))
}

test('1836 random lists match a pairwise oracle', () => {
  let seed = 1836
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: rnd(13) }, () => rnd(6))
    assert.deepEqual(solve(values), oracle(values), JSON.stringify(values))
  }
})
