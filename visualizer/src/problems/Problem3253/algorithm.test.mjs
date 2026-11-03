import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.equal(frame.best.length, run.input.target.length + 1)
  }
}

test('3253 authored presets', () => {
  assert.equal(solve({ target: 'abcdab', words: ['ab', 'abc', 'cd', 'd'], costs: [2, 5, 3, 1] }), 7)
  assert.equal(solve({ target: 'aaaa', words: ['a', 'aa'], costs: [4, 3] }), 6)
  assert.equal(solve({ target: 'xyz', words: ['ab'], costs: [1] }), -1)
})

test('3253 a word can be reused and a zero cost is allowed', () => {
  assert.equal(solve({ target: 'abab', words: ['ab'], costs: [0] }), 0)
  assert.equal(solve({ target: 'a', words: ['b', 'a'], costs: [9, 4] }), 4)
})

test('3253 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"target":"ab","words":["a"],"costs":[1,2]}'))
  assert.throws(() => parseInput('{"target":"","words":["a"],"costs":[1]}'))
  assert.throws(() => parseInput('["ab"]'))
})

// Independent oracle: exhaustive search over every way to split the target into words.
function oracle(target, words, costs) {
  const memo = new Map()
  const go = pos => {
    if (pos === target.length) return 0
    if (memo.has(pos)) return memo.get(pos)
    let best = Infinity
    words.forEach((w, k) => {
      if (target.startsWith(w, pos)) best = Math.min(best, costs[k] + go(pos + w.length))
    })
    memo.set(pos, best)
    return best
  }
  const r = go(0)
  return r === Infinity ? -1 : r
}

test('3253 random inputs match an exhaustive split oracle', () => {
  let seed = 3253
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const target = word(1 + rnd(9))
    const words = Array.from({ length: 1 + rnd(4) }, () => word(1 + rnd(3)))
    const costs = words.map(() => rnd(20))
    assert.equal(solve({ target, words, costs }), oracle(target, words, costs), JSON.stringify({ target, words, costs }))
  }
})

test('3253 frames keep pseudocode and python lines valid', () => {
  checkFrames(buildTrace(parseInput('{"target":"abcdab","words":["ab","abc","cd","d"],"costs":[2,5,3,1]}')))
  checkFrames(buildTrace(parseInput('{"target":"xyz","words":["ab"],"costs":[1]}')))
})
