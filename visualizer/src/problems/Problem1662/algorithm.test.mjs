import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (word1, word2) => buildTrace({ word1, word2 }).result

test('1662 teaching cases return the expected answers', () => {
  assert.equal(solve(['ab', 'c'], ['a', 'bc']), true)
  assert.equal(solve(['ab', 'c'], ['ac', 'b']), false)
  assert.equal(solve(['abc', 'd', 'ef'], ['abcdef']), true)
  assert.equal(solve(['abc', 'd', 'defg'], ['abcdef']), false)
  assert.equal(solve(['ab'], ['abc']), false)
  assert.equal(solve(['x'], ['x']), true)
})

test('1662 rejects malformed input', () => {
  assert.throws(() => parseInput('{"word1":[],"word2":["a"]}'), /word1/)
  assert.throws(() => parseInput('{"word1":["a"],"word2":["A"]}'), /word2/)
  assert.throws(() => parseInput('"ab"'), /object/)
})

test('1662 matches a plain concatenation oracle on random chunk lists', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'ab'
  const randomWord = () => Array.from({ length: 1 + rnd(3) }, () => alphabet[rnd(alphabet.length)]).join('')
  for (let t = 0; t < 500; t++) {
    const word1 = Array.from({ length: 1 + rnd(4) }, randomWord)
    // Often build word2 from the same characters with a different split, so true cases are common.
    const joined = word1.join('')
    const word2 = []
    if (rnd(2)) {
      for (let at = 0; at < joined.length;) { const size = 2 + rnd(2); word2.push(joined.slice(at, at + size)); at += size }
    } else {
      word2.push(...Array.from({ length: 1 + rnd(4) }, randomWord))
    }
    parseInput(JSON.stringify({ word1, word2 }))
    assert.equal(solve(word1, word2), word1.join('') === word2.join(''), JSON.stringify({ word1, word2 }))
  }
})

test('1662 frames point to valid code and Python lines', () => {
  const { frames } = buildTrace({ word1: ['ab', 'c'], word2: ['a', 'bc'] })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
})
