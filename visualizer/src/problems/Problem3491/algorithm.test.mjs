import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = numbers => buildTrace({ numbers }).result

test('3491 worked presets', () => {
  assert.equal(solve(['911', '97625', '9725', '3']), true)
  assert.equal(solve(['1234', '12', '56']), false)
  assert.equal(solve(['77', '705', '77']), false)
})

test('3491 edge cases', () => {
  assert.equal(solve(['5']), true)
  assert.equal(solve(['12', '123']), false)
  assert.equal(solve(['123', '12']), false)
  assert.equal(solve(['1', '2', '3']), true)
  assert.equal(solve(['0123456789', '0123456788']), true)
})

test('3491 rejects bad input', () => {
  assert.throws(() => parseInput('{"numbers":["12a"]}'))
  assert.throws(() => parseInput('{"numbers":["12345678901"]}'))
  assert.throws(() => parseInput('{"numbers":[]}'))
})

// Oracle: a pairwise check. Equal strings count as a prefix of each other.
function oracle(numbers) {
  for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
      if (i !== j && numbers[j].startsWith(numbers[i])) return false
    }
  }
  return true
}

test('3491 random inputs match a pairwise prefix oracle', () => {
  let seed = 3491
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const numbers = Array.from({ length: 1 + rnd(6) }, () => Array.from({ length: 1 + rnd(4) }, () => String(rnd(3))).join(''))
    assert.equal(solve(numbers), oracle(numbers), JSON.stringify(numbers))
  }
})

test('3491 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  for (const numbers of [['911', '97625', '9725', '3'], ['1234', '12', '56']]) {
    const run = buildTrace({ numbers })
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    }
  }
})
