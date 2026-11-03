import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace(words).result

test('1002 hand-checked cases', () => {
  assert.deepEqual(solve(['pepper', 'paper', 'reap']), ['e', 'p', 'r'])
  assert.deepEqual(solve(['ab', 'ba']), ['a', 'b'])
  assert.deepEqual(solve(['cc']), ['c', 'c'])
  assert.deepEqual(solve(['abc', 'xyz']), [])
})

test('1002 every frame points at real code and Python lines', () => {
  for (const frame of buildTrace(['aab', 'abb', 'bba']).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('1002 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /words/)
  assert.throws(() => parseInput('["Ab"]'), /lowercase/)
  assert.throws(() => parseInput('{"words":["a"]}'), /list/)
})

// Independent oracle: for each letter a..z, the minimum count across words, then sorted expansion.
function oracle(words) {
  const out = []
  for (let c = 97; c <= 122; c++) {
    const ch = String.fromCharCode(c)
    const min = Math.min(...words.map(w => w.split(ch).length - 1))
    for (let t = 0; t < min; t++) out.push(ch)
  }
  return out
}

test('1002 random word lists match a per-letter oracle', () => {
  let seed = 1002
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const words = Array.from({ length: 1 + rnd(6) }, () => Array.from({ length: 1 + rnd(10) }, () => 'abcd'[rnd(4)]).join(''))
    assert.deepEqual(solve(words), oracle(words), JSON.stringify(words))
  }
})
