import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2181 worked examples', () => {
  assert.deepEqual(solve('[0,3,1,0,4,5,2,0]'), [4, 11])
  assert.deepEqual(solve('[0,1,0,3,0,2,2,0]'), [1, 3, 4])
  assert.deepEqual(solve('[0,7,0]'), [7])
})

test('2181 rejects invalid input', () => {
  assert.throws(() => parseInput('[1,0]'))
  assert.throws(() => parseInput('[0,1,2]'))
  assert.throws(() => parseInput('[0,1,0,0,2,0]'))
  assert.throws(() => parseInput('[0,10,0]'))
})

test('2181 random lists match a direct split on zeros', () => {
  let seed = 2181
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const parts = Array.from({ length: 1 + rnd(3) }, () => Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(9)))
    const list = [0]
    for (const p of parts) list.push(...p, 0)
    const expected = parts.map(p => p.reduce((a, b) => a + b, 0))
    assert.deepEqual(solve(JSON.stringify(list)), expected, JSON.stringify(list))
  }
})

test('2181 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[0,3,1,0,4,5,2,0]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
