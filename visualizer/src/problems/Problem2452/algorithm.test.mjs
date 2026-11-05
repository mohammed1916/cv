import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (queries, dictionary) => buildTrace({ queries, dictionary }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (q, d) => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(two_edit_words(${JSON.stringify(q)}, ${JSON.stringify(d)}))`]).toString().trim()

test('2452 worked examples', () => {
  assert.deepEqual(solve(['cat', 'dog', 'sun'], ['cot', 'fog', 'zzz']), ['cat', 'dog'])
  assert.deepEqual(solve(['abc'], ['xyz']), [])
  assert.deepEqual(solve(['abcd'], ['abce']), ['abcd'])
})

test('2452 a query is kept once even when several words match', () => {
  assert.deepEqual(solve(['aaa'], ['aab', 'aba']), ['aaa'])
})

test('2452 frames point at real python lines', () => {
  for (const f of buildTrace({ queries: ['ab'], dictionary: ['ac'] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2452 rejects words of different lengths', () => {
  assert.throws(() => parseInput('{"queries":["ab"],"dictionary":["abc"]}'))
})

test('2452 random inputs match a brute force and the python mirror', () => {
  let seed = 2452
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 120; t++) {
    const len = 1 + rnd(4)
    const queries = Array.from({ length: 1 + rnd(4) }, () => word(len))
    const dictionary = Array.from({ length: 1 + rnd(4) }, () => word(len))
    const expected = queries.filter(q => dictionary.some(w => [...q].filter((c, i) => c !== w[i]).length <= 2))
    assert.deepEqual(solve(queries, dictionary), expected, JSON.stringify({ queries, dictionary }))
    if (t < 6) assert.equal(runPy(queries, dictionary), `[${expected.map(x => `'${x}'`).join(', ')}]`)
  }
})
