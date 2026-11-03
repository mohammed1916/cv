import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (a, b) => buildTrace({ coins: [a, b] }).result
const pyLines = python.trim().split('\n').length

test('2979 teaching examples', () => {
  assert.equal(solve(5, 7), 23)
  assert.equal(solve(3, 11), 19)
  assert.equal(solve(2, 3), 1)
  assert.equal(solve(3, 2), 1)
})

test('2979 parser rejects non-primes, equal coins and wrong shapes', () => {
  assert.throws(() => parseInput('{"coins":[4,7]}'))
  assert.throws(() => parseInput('{"coins":[5,5]}'))
  assert.throws(() => parseInput('{"coins":[5]}'))
  assert.throws(() => parseInput('{"coins":[5,19]}'))
})

// Brute oracle: a cost is payable when some count of a-coins leaves a multiple of b.
function oracle(a, b) {
  const payable = x => {
    for (let i = 0; a * i <= x; i++) if ((x - a * i) % b === 0) return true
    return false
  }
  let largest = 0
  for (let x = 1; x <= a * b; x++) if (!payable(x)) largest = x
  return largest
}

test('2979 every pair of small distinct primes matches the oracle and the closed form', () => {
  const primes = [2, 3, 5, 7, 11, 13, 17]
  for (const a of primes) for (const b of primes) {
    if (a === b) continue
    assert.equal(solve(a, b), oracle(a, b), `${a}, ${b}`)
    assert.equal(solve(a, b), a * b - a - b, `${a}, ${b}`)
  }
})

test('2979 frames keep valid lines and mark every cost up to a times b', () => {
  const run = buildTrace({ coins: [5, 7] })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
  const lastCheck = run.frames.filter(f => f.phase === 'reach' || f.phase === 'gap').at(-1)
  assert.equal(lastCheck.x, 35)
})
