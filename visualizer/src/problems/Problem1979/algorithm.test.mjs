import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const oracle = nums => gcd(Math.min(...nums), Math.max(...nums))

test('examples', () => {
  assert.equal(solve('[2,5,6,9,10]'), 2)
  assert.equal(solve('[7,5,6,8,3]'), 1)
  assert.equal(solve('[3,3]'), 3)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[2,5,6,9,10]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the oracle', () => {
  let state = 5
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 2 + rand(10) }, () => 1 + rand(1000))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums))
  }
})
