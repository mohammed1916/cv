import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

function brute(piles, l, r) { // best lead for the mover by plain minimax recursion
  if (l > r) return 0
  return Math.max(piles[l] - brute(piles, l + 1, r), piles[r] - brute(piles, l, r - 1))
}

test('official example', () => {
  assert.equal(buildTrace(parseInput('[5,3,4,5]')).result, true)
  assert.equal(buildTrace(parseInput('[3,7,2,3]')).result, true)
})

test('matches minimax brute force and the final dp cell equals the lead', () => {
  let seed = 7
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 * (1 + rnd(5))
    let piles
    do { piles = Array.from({ length: n }, () => 1 + rnd(20)) } while (piles.reduce((a, b) => a + b) % 2 === 0)
    const trace = buildTrace(parseInput(JSON.stringify(piles)))
    const lead = brute(piles, 0, n - 1)
    assert.equal(trace.result, lead > 0)
    assert.equal(trace.frames.at(-1).table[0][n - 1], lead)
    assert.equal(trace.frames.at(-1).phase, 'done')
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[1,1]'))
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('{}'))
})
