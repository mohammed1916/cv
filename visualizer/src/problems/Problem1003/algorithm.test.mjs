import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('1003 official examples', () => {
  assert.equal(solve('aabcbc'), true)
  assert.equal(solve('abcabcababcc'), true)
  assert.equal(solve('abccba'), false)
  assert.equal(solve('cababc'), false)
})

test('1003 edge cases', () => {
  assert.equal(solve('abc'), true)
  assert.equal(solve('a'), false)
  assert.equal(solve('cba'), false)
})

test('1003 rejects letters other than a, b, c', () => {
  assert.throws(() => parseInput('{"s":"abd"}'), /only the letters a, b and c/)
})

test('1003 rejects an empty or overlong word', () => {
  assert.throws(() => parseInput('{"s":""}'), /1 to 20/)
  assert.throws(() => parseInput(`{"s":"${'a'.repeat(21)}"}`), /1 to 20/)
})

// Independent oracle: repeatedly delete any abc substring until nothing changes.
function oracle(s) {
  let text = s
  let previous
  do {
    previous = text
    text = text.replace('abc', '')
  } while (text !== previous)
  return text === ''
}

test('1003 random words match a repeated-deletion oracle', () => {
  let seed = 417
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  let trues = 0
  let falses = 0
  for (let t = 0; t < 400; t++) {
    let s
    if (t % 2 === 0) {
      // Grow a valid word by inserting abc at random positions, then sometimes corrupt one letter.
      s = ''
      const inserts = rnd(7)
      for (let k = 0; k < inserts && s.length + 3 <= 20; k++) {
        const at = rnd(s.length + 1)
        s = s.slice(0, at) + 'abc' + s.slice(at)
      }
      if (s.length && rnd(2)) {
        const at = rnd(s.length)
        s = s.slice(0, at) + letters[rnd(3)] + s.slice(at + 1)
      }
      if (s.length === 0) s = 'c'
    } else {
      s = Array.from({ length: 1 + rnd(20) }, () => letters[rnd(3)]).join('')
    }
    const expected = oracle(s)
    if (expected) trues++
    else falses++
    assert.equal(solve(s), expected, s)
  }
  assert.ok(trues > 0 && falses > 0, 'the random mix should cover both outcomes')
})
