import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

test('1320 official examples', () => {
  assert.equal(solve('CAKE'), 3)
  assert.equal(solve('HAPPY'), 6)
})

test('1320 a single letter costs nothing', () => {
  assert.equal(solve('Z'), 0)
})

test('1320 rejects lowercase letters', () => {
  assert.throws(() => parseInput('{"word":"cake"}'))
})

// Independent oracle: try every assignment of letters to the two fingers and price each one directly.
function oracle(word) {
  const letters = [...word].map(ch => ch.charCodeAt(0) - 65)
  const pos = k => [Math.floor(k / 6), k % 6]
  const dist = (a, b) => {
    const [ra, ca] = pos(a)
    const [rb, cb] = pos(b)
    return Math.abs(ra - rb) + Math.abs(ca - cb)
  }
  let best = Infinity
  for (let mask = 0; mask < 1 << letters.length; mask++) {
    const fingers = [null, null]
    let cost = 0
    for (let i = 0; i < letters.length; i++) {
      const f = (mask >> i) & 1
      if (fingers[f] !== null) cost += dist(fingers[f], letters[i])
      fingers[f] = letters[i]
    }
    best = Math.min(best, cost)
  }
  return best
}

test('1320 random words match an explicit finger assignment', () => {
  let seed = 1320
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(9)
    const word = Array.from({ length }, () => String.fromCharCode(65 + rnd(26))).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})
