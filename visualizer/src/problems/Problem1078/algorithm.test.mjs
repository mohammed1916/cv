import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (text, first, second) => buildTrace(parseInput(JSON.stringify({ text, first, second }))).result

test('1078 sample texts', () => {
  assert.deepEqual(solve('red blue red green red blue red', 'red', 'blue'), ['red', 'red'])
  assert.deepEqual(solve('go go go stop', 'go', 'go'), ['go', 'stop'])
  assert.deepEqual(solve('one two three', 'three', 'one'), [])
})

test('1078 overlapping matches and final-position phrases', () => {
  assert.deepEqual(solve('x x x x', 'x', 'x'), ['x', 'x'])
  assert.deepEqual(solve('a b', 'a', 'b'), [])
  assert.deepEqual(solve('a b c a b', 'a', 'b'), ['c'])
})

test('1078 rejects malformed input', () => {
  assert.throws(() => parseInput('{"text":"Red blue","first":"red","second":"blue"}'), /lowercase/)
  assert.throws(() => parseInput('{"text":"a b","first":"a","second":"B"}'), /lowercase/)
  assert.throws(() => parseInput('["a b"]'), /Use an object/)
})

test('1078 frames point at real code and Python lines', () => {
  const { frames } = buildTrace({ words: ['a', 'b', 'a', 'b', 'c'], first: 'a', second: 'b' })
  const pyCount = python.split('\n').length
  for (const frame of frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount, frame.message)
  }
})

// Independent oracle: build the consecutive-triple list with a different loop shape.
test('1078 random texts match a filter-based oracle', () => {
  let seed = 1078
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const vocabulary = ['a', 'b', 'c']
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(20) }, () => vocabulary[rnd(3)])
    const first = vocabulary[rnd(3)]
    const second = vocabulary[rnd(3)]
    const oracle = words.slice(0, -2).flatMap((w, i) => (w === first && words[i + 1] === second ? [words[i + 2]] : []))
    assert.deepEqual(solve(words.join(' '), first, second), oracle, words.join(' '))
  }
})
