import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2315 official examples', () => {
  assert.equal(solve('|**|a*'), 1)
  assert.equal(solve('iamprogrammer'), 0)
  assert.equal(solve('yo|uar|e**|b|e***au|tifu|l'), 5)
})

test('2315 edge cases: stars after an unpaired bar still count', () => {
  assert.equal(solve('a*|b*c'), 2)
  assert.equal(solve('|**|'), 0)
})

test('2315 rejects characters outside the alphabet', () => {
  assert.throws(() => parseInput('{"s":"a b"}'))
  assert.throws(() => parseInput('{"s":"A*"}'))
})

// Independent oracle: delete every bar-delimited segment with a regular expression, then count stars.
function oracle(s) {
  return (s.replace(/\|[^|]*\|/g, '').match(/\*/g) || []).length
}

test('2315 random strings match a regular-expression oracle', () => {
  let seed = 2315
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(20) }, () => 'a*|'[rnd(3)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
