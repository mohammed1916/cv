import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2351 official examples', () => {
  assert.equal(solve('{"s":"abccbaacz"}'), 'c')
  assert.equal(solve('{"s":"abcdd"}'), 'd')
})

test('2351 the earliest second copy wins, not the earliest first copy', () => {
  // "a" repeats at index 3, "b" repeats at index 2; "b" completes first.
  assert.equal(solve('{"s":"abba"}'), 'b')
})

test('2351 rejects a string with no repeated letter', () => {
  assert.throws(() => parseInput('{"s":"abc"}'), /appear twice/)
})

// Independent oracle: for each letter, find where its second copy starts; take the smallest.
function oracle(s) {
  let best = null, bestAt = Infinity
  for (const letter of new Set(s)) {
    const first = s.indexOf(letter)
    const second = s.indexOf(letter, first + 1)
    if (second !== -1 && second < bestAt) {
      best = letter
      bestAt = second
    }
  }
  return best
}

test('2351 random strings match a second-occurrence oracle', () => {
  let seed = 2351
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const s = Array.from({ length: 2 + rnd(11) }, () => 'abcdef'[rnd(6)]).join('')
    if (oracle(s) === null) continue
    assert.equal(solve(JSON.stringify({ s })), oracle(s), s)
  }
})
