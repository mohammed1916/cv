import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = pressed_keys => buildTrace(parseInput(JSON.stringify({ pressed_keys }))).result

test('2266 official examples', () => {
  assert.equal(solve('22233'), 8)
  assert.equal(solve('7777'), 8)
})

test('2266 a single press gives one letter', () => {
  assert.equal(solve('2'), 1)
  assert.equal(solve('22'), 2)
})

test('2266 rejects the digits 0 and 1', () => {
  assert.throws(() => parseInput('{"pressed_keys":"201"}'))
})

// Independent oracle: write the text letter by letter, choosing how many equal presses form the next letter.
function oracle(keys) {
  const maxGroup = d => (d === '7' || d === '9' ? 4 : 3)
  const count = i => {
    if (i === keys.length) return 1
    let total = 0
    for (let k = 1; k <= maxGroup(keys[i]) && i + k <= keys.length; k++) {
      if (keys.slice(i, i + k).split('').every(c => c === keys[i])) total += count(i + k)
    }
    return total
  }
  return count(0) % MOD
}

test('2266 seeded random inputs match a letter-by-letter count', () => {
  let seed = 2266
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const keys = Array.from({ length: 1 + rnd(10) }, () => '2379'[rnd(4)]).join('')
    assert.equal(solve(keys), oracle(keys), keys)
  }
})
