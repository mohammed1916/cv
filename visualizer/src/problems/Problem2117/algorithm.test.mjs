import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (left, right) => buildTrace(parseInput(JSON.stringify({ left, right }))).result

test('2117 official examples', () => {
  assert.equal(solve(1, 4), '24e0')
  assert.equal(solve(2, 11), '399168e2')
  assert.equal(solve(371, 375), '7219856259e3')
})

test('2117 edge cases', () => {
  assert.equal(solve(5, 5), '5e0')
  assert.equal(solve(10, 10), '1e1')
})

test('2117 rejects bad ranges', () => {
  assert.throws(() => parseInput('{"left":5,"right":4}'))
  assert.throws(() => parseInput('{"left":0,"right":4}'))
  assert.throws(() => parseInput('{"left":1,"right":1001}'))
})

// Independent oracle: multiply the whole range exactly with BigInt, then read the digits of the result.
function oracle(left, right) {
  let product = 1n
  for (let i = BigInt(left); i <= BigInt(right); i++) product *= i
  let digits = product.toString()
  let zeros = 0
  while (digits.endsWith('0')) {
    digits = digits.slice(0, -1)
    zeros += 1
  }
  return digits.length <= 10 ? `${digits}e${zeros}` : `${digits.slice(0, 5)}...${digits.slice(-5)}e${zeros}`
}

test('2117 seeded random ranges match an exact-product oracle', () => {
  let seed = 2117
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const left = 1 + rnd(1000)
    const right = left + rnd(1001 - left)
    assert.equal(solve(left, right), oracle(left, right), `${left}..${right}`)
  }
})
