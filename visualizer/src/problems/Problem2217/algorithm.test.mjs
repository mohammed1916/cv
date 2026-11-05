import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (queries, intLength) => buildTrace(parseInput(JSON.stringify({ queries, intLength }))).result

test('2217 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3], 3), [101, 111, 121])
  assert.deepEqual(solve([1, 2, 3, 4], 4), [1001, 1111, 1221, 1331])
  assert.deepEqual(solve([1000], 1), [-1])
  assert.deepEqual(solve([9, 10], 2), [99, -1])
})

test('2217 rejects invalid input', () => {
  assert.throws(() => parseInput('{"queries":[],"intLength":2}'))
  assert.throws(() => parseInput('{"queries":[0],"intLength":2}'))
  assert.throws(() => parseInput('{"queries":[1],"intLength":7}'))
})

// Oracle: list every palindrome of the given length in increasing order and index into the list.
function oracle(queries, L) {
  const all = []
  for (let v = 10 ** (L - 1); v < 10 ** L; v++) {
    const s = String(v)
    if (s === s.split('').reverse().join('')) all.push(v)
  }
  return queries.map(q => (q <= all.length ? all[q - 1] : -1))
}

test('2217 random queries match an enumeration of palindromes', () => {
  let seed = 2217
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const L = 1 + rnd(5)
    const queries = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(60))
    assert.deepEqual(solve(queries, L), oracle(queries, L), JSON.stringify({ queries, L }))
  }
})

test('2217 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"queries":[1,2],"intLength":3}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
