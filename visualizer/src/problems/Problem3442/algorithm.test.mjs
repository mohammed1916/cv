import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3442 official examples', () => {
  assert.equal(solve('aaaaabbc'), 3)
  assert.equal(solve('abcabcab'), 1)
})

test('3442 rejects a string with no even-count letter', () => {
  assert.throws(() => parseInput('"aaa"'))
})

test('3442 rejects non-letters and short strings', () => {
  assert.throws(() => parseInput('"ab"'))
  assert.throws(() => parseInput('"ab1"'))
})

// Independent oracle: try every pair of letters, one with an odd count and one with an even positive count.
function oracle(s) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const occ = ch => [...s].filter(x => x === ch).length
  let best = -Infinity
  for (const x of letters) {
    for (const y of letters) {
      const fx = occ(x)
      const fy = occ(y)
      if (fx % 2 === 1 && fy > 0 && fy % 2 === 0) best = Math.max(best, fx - fy)
    }
  }
  return best
}

test('3442 random strings match a pair-search oracle', () => {
  let seed = 3442
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400 && checked < 300; t++) {
    const s = Array.from({ length: 3 + rnd(18) }, () => 'abcd'[rnd(4)]).join('')
    let parsed
    try { parsed = parseInput(JSON.stringify(s)) } catch { continue }
    checked++
    assert.equal(buildTrace(parsed).result, oracle(parsed), s)
  }
  assert.equal(checked, 300)
})
