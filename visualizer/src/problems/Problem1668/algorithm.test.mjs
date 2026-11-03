import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (sequence, word) => buildTrace({ sequence, word }).result

test('sample sequences give the expected repeat counts', () => {
  assert.equal(solve('abababcab', 'ab'), 3)
  assert.equal(solve('xyzxyzxy', 'xyz'), 2)
  assert.equal(solve('qwerty', 'zz'), 0)
})

test('a word longer than the sequence gives 0', () => {
  assert.equal(solve('abc', 'abcd'), 0)
})

test('the whole sequence can be one repeated word', () => {
  assert.equal(solve('aaaa', 'a'), 4)
  assert.equal(solve('cdcdcd', 'cd'), 3)
})

// Independent oracle: test every count from 0 upward and keep the largest one that appears.
test('random inputs agree with a brute-force oracle', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const sequence = Array.from({ length: 1 + rnd(30) }, () => 'ab'[rnd(2)]).join('')
    const word = Array.from({ length: 1 + rnd(4) }, () => 'ab'[rnd(2)]).join('')
    let expected = 0
    for (let k = 1; k * word.length <= sequence.length; k++) if (sequence.includes(word.repeat(k))) expected = k
    assert.equal(solve(sequence, word), expected, `${sequence} / ${word}`)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"sequence":"","word":"a"}'), /sequence/)
  assert.throws(() => parseInput('{"sequence":"abc","word":"A"}'), /word/)
  assert.throws(() => parseInput('"abc"'), /object/)
})

test('every frame names a real phase and lines inside the code and Python listings', () => {
  const ids = new Set(phases.map(p => p.id))
  const codeLines = code.length, pyLines = python.split('\n').length
  for (const frame of buildTrace({ sequence: 'abababcab', word: 'ab' }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
})
