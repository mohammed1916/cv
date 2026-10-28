import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

// Independent oracle: try every pair of digits (x, y), including x = y, and keep results without a leading zero.
function oracle(num) {
  const s = String(num)
  const values = []
  for (let x = 0; x <= 9; x++) {
    for (let y = 0; y <= 9; y++) {
      const r = s.split(String(x)).join(String(y))
      if (r[0] !== '0') values.push(Number(r))
    }
  }
  return Math.max(...values) - Math.min(...values)
}

test('1432 examples', () => {
  assert.equal(solve(555), 888)
  assert.equal(solve(9), oracle(9))
})

test('1432 rejects zero and out of range values', () => {
  assert.throws(() => parseInput('{"num":0}'))
  assert.throws(() => parseInput('{"num":100000000}'))
})

test('1432 random numbers match an all-digit-pairs oracle', () => {
  let seed = 1432
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    let digits = String(1 + rnd(9))
    for (let i = 1; i < len; i++) digits += String(rnd(10))
    const num = Number(digits)
    assert.equal(solve(num), oracle(num), `num ${num}`)
  }
})
