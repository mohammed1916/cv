import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2827 official examples', () => {
  assert.equal(solve({ low: 10, high: 20, k: 3 }), 2)
  assert.equal(solve({ low: 1, high: 10, k: 1 }), 1)
  assert.equal(solve({ low: 5, high: 5, k: 2 }), 0)
})

test('2827 rejects a bad divisor', () => {
  assert.throws(() => parseInput('{"low":1,"high":5,"k":0}'))
})

// Independent oracle: test every integer in the range for equal digit parities and divisibility.
function oracle({ low, high, k }) {
  let count = 0
  for (let x = low; x <= high; x++) {
    const s = String(x)
    let even = 0
    let odd = 0
    for (const c of s) if (Number(c) % 2 === 0) even++; else odd++
    if (even === odd && x % k === 0) count++
  }
  return count
}

test('2827 random ranges match a direct scan', () => {
  let seed = 2827
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const low = 1 + rnd(3000)
    const high = low + rnd(3000)
    const k = 1 + rnd(12)
    const input = { low, high, k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
