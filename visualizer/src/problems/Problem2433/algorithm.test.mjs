import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = pref => buildTrace(parseInput(JSON.stringify({ pref }))).result

test('2433 official examples', () => {
  assert.deepEqual(solve([5, 2, 0, 3, 1]), [5, 7, 2, 3, 2])
  assert.deepEqual(solve([13]), [13])
})

test('2433 rejects a value above 15 in this visualization', () => {
  assert.throws(() => parseInput('{"pref":[16]}'))
})

// Independent oracle: for short arrays, search every original array over 0 to 15 for one whose prefix xors match.
function oracle(pref) {
  const n = pref.length
  const total = 16 ** n
  for (let code = 0; code < total; code++) {
    const arr = []
    let c = code
    for (let i = 0; i < n; i++) { arr.push(c % 16); c = Math.floor(c / 16) }
    let running = 0
    const prefixes = arr.map(v => (running ^= v))
    if (prefixes.every((p, i) => p === pref[i])) return arr
  }
  return null
}

test('2433 random short arrays match a search oracle', () => {
  let seed = 2433
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(3)
    const pref = Array.from({ length: n }, () => rnd(16))
    assert.deepEqual(solve(pref), oracle(pref), JSON.stringify(pref))
  }
})
