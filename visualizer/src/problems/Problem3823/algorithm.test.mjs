import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3823 letters and specials are each reversed in their own positions', () => {
  assert.equal(solve('ab-cd'), 'dc-ba')
  assert.equal(solve('a!b@c'), 'c@b!a')
})

test('3823 a string of only letters or only specials', () => {
  assert.equal(solve('Abc'), 'cbA')
  assert.equal(solve('#-!'), '!-#')
})

test('3823 rejects digits and spaces', () => {
  assert.throws(() => parseInput('{"s":"a1b"}'))
  assert.throws(() => parseInput('{"s":"a b"}'))
})

// Independent oracle: sort the letter positions and the special positions with a regular expression split.
function oracle(s) {
  const letters = s.match(/[A-Za-z]/g) || []
  const specials = s.match(/[^A-Za-z]/g) || []
  let li = letters.length - 1
  let si = specials.length - 1
  return [...s].map(ch => (/[A-Za-z]/.test(ch) ? letters[li--] : specials[si--])).join('')
}

test('3823 random strings match a split-and-rebuild oracle', () => {
  let seed = 3823
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abcAB!@#-'[rnd(9)]
    assert.equal(solve(s), oracle(s), s)
  }
})
