import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const EXAMPLE_WEIGHTS = [5, 3, 12, 14, 1, 2, 3, 2, 10, 6, 6, 9, 7, 8, 7, 10, 8, 9, 6, 9, 9, 8, 3, 7, 7, 2]
const solve = (words, weights) => buildTrace({ words, weights }).result

test('3838 worked example', () => {
  assert.equal(solve(['abcd', 'def', 'xyz'], EXAMPLE_WEIGHTS), 'rij')
})

test('3838 edge cases', () => {
  const ones = Array(26).fill(1)
  assert.equal(solve(['a'], ones), 'y')
  assert.equal(solve(['abcdefghijklmnopqrstuvwxyz'], ones), 'z')
  const heavyZ = Array(26).fill(1); heavyZ[25] = 100
  assert.equal(solve(['z'], heavyZ), String.fromCharCode(122 - (100 % 26)))
})

test('3838 residue 0 maps to z and residue 25 maps to a', () => {
  const ones = Array(26).fill(1)
  const zero = buildTrace({ words: ['abcdefghijklmnopqrstuvwxyz'], weights: ones })
  const mod0 = zero.frames.find(f => f.phase === 'mod')
  assert.equal(mod0.value, 0)
  assert.equal(mod0.mapped, '')
  assert.equal(zero.result, 'z')
  const weights25 = Array(26).fill(1); weights25[0] = 25
  const twentyFive = buildTrace({ words: ['a'], weights: weights25 })
  assert.equal(twentyFive.frames.find(f => f.phase === 'mod').value, 25)
  assert.equal(twentyFive.result, 'a')
})

test('3838 multiple words reset total and append in order', () => {
  const trace = buildTrace({ words: ['a', 'z', 'ab'], weights: [25, ...Array(24).fill(1), 2] })
  assert.equal(trace.result, 'axz')
  const wordFrames = trace.frames.filter(f => f.phase === 'word')
  assert.equal(wordFrames.length, 3)
  assert.ok(wordFrames.every(f => f.total === 0))
  assert.deepEqual(trace.frames.filter(f => f.phase === 'emit').map(f => f.output), [trace.result.slice(0, 1), trace.result.slice(0, 2), trace.result])
})

test('3838 output snapshot is kept at completion and total is not reset', () => {
  const trace = buildTrace({ words: ['abcd', 'def', 'xyz'], weights: EXAMPLE_WEIGHTS })
  const done = trace.frames.at(-1)
  assert.equal(done.phase, 'done')
  assert.equal(done.output, 'rij')
  assert.equal(done.total, trace.frames.filter(f => f.phase === 'mod').at(-1).total)
  assert.ok(done.total > 0)
})

test('3838 every frame has valid pseudocode and python lines', () => {
  const pyLines = python.trim().split('\n').length
  const trace = buildTrace({ words: ['abcd', 'def', 'xyz'], weights: EXAMPLE_WEIGHTS })
  for (const f of trace.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode line ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines, `python line ${f.pythonLine}`)
    assert.ok(typeof f.message === 'string' && f.message.length > 0)
  }
})

test('3838 frames expose the weight, mod and reverse mapping used by the visual', () => {
  const trace = buildTrace({ words: ['a'], weights: [5, ...Array(25).fill(1)] })
  const sum = trace.frames.find(f => f.phase === 'sum')
  assert.equal(sum.weight, 5)
  assert.equal(sum.total, 5)
  const emit = trace.frames.find(f => f.phase === 'emit')
  assert.equal(emit.mapped, String.fromCharCode(122 - 5))
})

test('3838 rejects malformed input', () => {
  assert.throws(() => parseInput('{"words":["ab"],"weights":[1]}'))
  assert.throws(() => parseInput('{"words":["aB"],"weights":' + JSON.stringify(Array(26).fill(1)) + '}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: letter index as a char-code offset from 'a', reduced by hand.
function oracle(words, weights) {
  let out = ''
  for (const word of words) {
    let sum = 0
    for (const ch of word) sum += weights[ch.charCodeAt(0) - 'a'.charCodeAt(0)]
    out += String.fromCharCode('z'.charCodeAt(0) - (sum % 26))
  }
  return out
}

test('3838 random inputs match a brute-force oracle', () => {
  let seed = 3838
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const weights = Array.from({ length: 26 }, () => 1 + rnd(100))
    const words = Array.from({ length: 1 + rnd(5) }, () => Array.from({ length: 1 + rnd(8) }, () => letters[rnd(26)]).join(''))
    assert.equal(solve(words, weights), oracle(words, weights), JSON.stringify({ words, weights }))
  }
})
