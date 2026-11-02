import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = sentence => buildTrace({ sentence }).result
const PY = python.split('\n')

test('2490 worked examples', () => {
  assert.equal(solve('leetcode exercises sound delightful'), true)
  assert.equal(solve('eetcode'), true)
  assert.equal(solve('Leetcode is cool'), false)
})

test('2490 a single word needs its first and last letter to match', () => {
  assert.equal(solve('aba'), true)
  assert.equal(solve('ab'), false)
})

test('2490 frames point at real python lines', () => {
  for (const f of buildTrace({ sentence: 'ab ba' }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2490 rejects double spaces', () => {
  assert.throws(() => parseInput('{"sentence":"a  b"}'))
})

function oracle(sentence) {
  const w = sentence.split(' ')
  return w.every((x, i) => x.slice(-1) === w[(i + 1) % w.length][0])
}

test('2490 random sentences match a brute-force oracle', () => {
  let seed = 2490
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(4) }, () => Array.from({ length: 1 + rnd(3) }, () => 'ab'[rnd(2)]).join(''))
    const sentence = words.join(' ')
    assert.equal(solve(sentence), oracle(sentence), sentence)
  }
})
