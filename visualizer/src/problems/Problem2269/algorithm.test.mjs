import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num, k) => buildTrace(parseInput(JSON.stringify({ num, k }))).result

test('2269 official examples', () => {
  assert.equal(solve(240, 2), 2)
  assert.equal(solve(430043, 2), 2)
})

test('2269 a zero window does not count', () => {
  assert.equal(solve(100, 2), 1)
})

test('2269 rejects k longer than the number', () => {
  assert.throws(() => parseInput('{"num":12,"k":3}'))
})

// Independent oracle: read each k-digit window with arithmetic instead of text slicing.
function oracle(num, k) {
  const digitsCount = String(num).length
  let count = 0
  for (let start = 0; start + k <= digitsCount; start++) {
    const part = Math.floor(num / 10 ** (digitsCount - k - start)) % 10 ** k
    if (part !== 0 && num % part === 0) count++
  }
  return count
}

test('2269 random numbers match an arithmetic oracle', () => {
  let seed = 2269
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const num = 1 + rnd(999999999)
    const k = 1 + rnd(String(num).length)
    assert.equal(solve(num, k), oracle(num, k), `${num} ${k}`)
  }
})
