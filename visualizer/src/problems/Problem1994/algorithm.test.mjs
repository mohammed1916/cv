import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: factor each subset product over the primes up to 30 and check it is squarefree and above 1.
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
function good(product) {
  if (product <= 1n) return false
  let rest = product
  for (const p of PRIMES) {
    const bp = BigInt(p)
    if (rest % bp === 0n) { rest /= bp; if (rest % bp === 0n) return false }
  }
  return rest === 1n
}
function oracle(nums) {
  let total = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let product = 1n
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) product *= BigInt(nums[i])
    if (good(product)) total++
  }
  return total
}

test('examples', () => {
  assert.equal(solve('[1,2,3,4]'), 6)
  assert.equal(solve('[4,2,3,15]'), 5)
  assert.equal(solve('[1]'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,2,3]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random small inputs match the factorisation oracle', () => {
  let state = 127
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rand(9) }, () => 1 + rand(30))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums) % 1000000007, JSON.stringify(nums))
  }
})
