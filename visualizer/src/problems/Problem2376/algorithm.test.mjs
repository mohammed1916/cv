import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result

test('2376 official examples', () => {
  assert.equal(solve(20), 19)
  assert.equal(solve(5), 5)
  assert.equal(solve(135), 110)
})

test('2376 rejects zero and out-of-range input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('100001'))
})

// Independent oracle: test every number from 1 to n for distinct digits.
function oracle(n) {
  let count = 0
  for (let x = 1; x <= n; x++) {
    const s = String(x)
    if (new Set(s).size === s.length) count++
  }
  return count
}

test('2376 every n up to 3000 matches a direct count', () => {
  for (let n = 1; n <= 3000; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('2376 larger values match a direct count', () => {
  let seed = 2376
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 40; t++) {
    const n = 1 + rnd(20000)
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})
