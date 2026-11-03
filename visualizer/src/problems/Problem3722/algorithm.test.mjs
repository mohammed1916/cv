import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

// Oracle: collect every string reachable by one prefix or suffix reversal, then take the minimum.
function oracle(s) {
  const n = s.length; const all = []
  for (let k = 1; k <= n; k++) {
    all.push(s.slice(0, k).split('').reverse().join('') + s.slice(k))
    all.push(s.slice(0, n - k) + s.slice(n - k).split('').reverse().join(''))
  }
  return all.sort()[0]
}

test('3722 invented examples', () => {
  assert.equal(solve('gfec'), oracle('gfec'))
  assert.equal(solve('mkj'), 'jkm')
})

test('3722 matches the oracle', () => {
  for (const s of ['dcab', 'abba', 'a', 'ba', 'cabbd', 'qwerty']) assert.equal(solve(s), oracle(s))
})
