import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3918 official examples', () => {
  assert.equal(solve(13), 132)
  assert.equal(solve(10), 17)
  assert.equal(solve(8), 0)
})

test('3918 a palindrome gives a one-point range and a trailing zero reverses to a smaller number', () => {
  assert.equal(solve(11), 11)
  assert.equal(solve(100), 1060)
})

test('3918 rejects out-of-range n', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":1001}'))
})

// Independent oracle: a sieve of Eratosthenes up to 1000, then a plain sum over the range.
function oracle(n) {
  const limit = 1000
  const composite = Array(limit + 1).fill(false)
  for (let i = 2; i * i <= limit; i++) if (!composite[i]) for (let j = i * i; j <= limit; j += i) composite[j] = true
  const r = Number(String(n).split('').reverse().join(''))
  let total = 0
  for (let x = Math.min(n, r); x <= Math.max(n, r); x++) if (x >= 2 && !composite[x]) total += x
  return total
}

test('3918 every n from 1 to 1000 matches a sieve oracle', () => {
  for (let n = 1; n <= 1000; n++) assert.equal(solve(n), oracle(n), `n = ${n}`)
})
