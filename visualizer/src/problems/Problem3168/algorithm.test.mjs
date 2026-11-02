import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('3168 worked examples', () => {
  assert.equal(solve('EEEEEEE'), 7)
  assert.equal(solve('ELELEEL'), 2)
  assert.equal(solve('ELEELEELLL'), 3)
})

test('3168 edge cases', () => {
  assert.equal(solve('E'), 1)
  assert.equal(solve('EL'), 1)
  assert.equal(solve('EELL'), 2)
  assert.throws(() => parseInput('"EX"'))
})

// Independent oracle: the largest prefix difference between E count and L count, floored at zero.
function oracle(s) {
  let best = 0
  for (let end = 1; end <= s.length; end++) {
    let open = 0
    for (let i = 0; i < end; i++) open += s[i] === 'E' ? 1 : -1
    best = Math.max(best, open)
  }
  return best
}

test('3168 random strings match the prefix oracle', () => {
  let seed = 3168
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(20) }, () => 'EL'[rnd(2)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
