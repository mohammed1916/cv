import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (low, high) => buildTrace(parseInput(JSON.stringify({ low, high }))).result

test('2801 official examples', () => {
  assert.equal(solve('1', '11'), 10)
  // Only 98 and 101 are stepping numbers in [90, 101].
  assert.equal(solve('90', '101'), 2)
})

test('2801 a single-digit low bound counts as stepping', () => {
  assert.equal(solve('5', '5'), 1)
  assert.equal(solve('6', '6'), 1)
})

test('2801 rejects leading zeros and reversed bounds', () => {
  assert.throws(() => parseInput('{"low":"01","high":"5"}'))
  assert.throws(() => parseInput('{"low":"9","high":"3"}'))
})

// Independent oracle: test each integer in the range by its adjacent digits.
function oracle(low, high) {
  let count = 0
  for (let x = Number(low); x <= Number(high); x++) {
    const s = String(x)
    let ok = true
    for (let i = 1; i < s.length; i++) if (Math.abs(Number(s[i]) - Number(s[i - 1])) !== 1) ok = false
    if (ok) count++
  }
  return count % 1000000007
}

test('2801 random ranges match a direct scan', () => {
  let seed = 2801
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const a = 1 + rnd(9999)
    const b = a + rnd(10000 - a)
    assert.equal(solve(String(a), String(b)), oracle(String(a), String(b)), `${a}..${b}`)
  }
})
