import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (queries, dictionary) => buildTrace({ queries, dictionary }).result
const PY = python.split('\n')

test('2452 worked examples', () => {
  assert.deepEqual(solve(['word', 'note', 'ants', 'wood'], ['wood', 'joke', 'moat']), ['word', 'note', 'wood'])
  assert.deepEqual(solve(['yes'], ['not']), [])
})

test('2452 a query is kept once even with several matches', () => {
  assert.deepEqual(solve(['abc'], ['abd', 'xbc', 'abz']), ['abc'])
})

test('2452 frames point at real python lines', () => {
  for (const f of buildTrace({ queries: ['word', 'note'], dictionary: ['wood', 'joke'] }).frames) {
    assert.ok(PY[f.pythonLine - 1].trim() !== '')
  }
})

test('2452 rejects mixed lengths and empty lists', () => {
  assert.throws(() => parseInput('{"queries":["ab"],"dictionary":["abc"]}'))
  assert.throws(() => parseInput('{"queries":[],"dictionary":["abc"]}'))
})

function oracle(queries, dictionary) {
  return queries.filter(q => dictionary.some(w => [...q].filter((c, i) => c !== w[i]).length <= 2))
}

test('2452 random inputs match a brute-force oracle', () => {
  let seed = 2452
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(5)
    const queries = Array.from({ length: 1 + rnd(5) }, () => word(len))
    const dictionary = Array.from({ length: 1 + rnd(5) }, () => word(len))
    assert.deepEqual(solve(queries, dictionary), oracle(queries, dictionary), JSON.stringify({ queries, dictionary }))
  }
})
