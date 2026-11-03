import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, shift) => buildTrace({ s, shift }).result

test('1427 sample inputs give the expected strings', () => {
  assert.equal(solve('abcde', [[0, 1], [1, 2], [1, 3]]), 'bcdea')
  assert.equal(solve('abcde', [[1, 1]]), 'eabcd')
  assert.equal(solve('abcde', [[0, 1]]), 'bcdea')
  assert.equal(solve('abc', [[1, 1], [0, 1]]), 'abc')
})

test('1427 full cycles leave the string unchanged', () => {
  assert.equal(solve('wxyz', [[1, 4]]), 'wxyz')
  assert.equal(solve('wxyz', [[0, 8], [1, 0]]), 'wxyz')
})

test('1427 rejects malformed input', () => {
  assert.throws(() => parseInput('["a"]'), /object/)
  assert.throws(() => parseInput('{"s":"AB","shift":[[1,1]]}'), /lowercase/)
  assert.throws(() => parseInput('{"s":"ab","shift":[[2,1]]}'), /direction/)
  assert.throws(() => parseInput('{"s":"ab","shift":[]}'), /shift/)
})

// Independent oracle: apply each operation one character at a time.
test('1427 random operations match a step-by-step simulation', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(10)
    const s = Array.from({ length: len }, () => String.fromCharCode(97 + rnd(26))).join('')
    const shift = Array.from({ length: 1 + rnd(6) }, () => [rnd(2), rnd(30)])
    let expected = s
    for (const [dir, amt] of shift) {
      for (let k = 0; k < amt; k++) {
        expected = dir === 0 ? expected.slice(1) + expected[0] : expected[expected.length - 1] + expected.slice(0, -1)
      }
    }
    const input = JSON.stringify({ s, shift })
    parseInput(input)
    assert.equal(solve(s, shift), expected, input)
  }
})
