import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (k, x) => buildTrace(parseInput(JSON.stringify({ k, x }))).result

test('3007 official examples', () => {
  assert.equal(solve(9, 1), 6)
  assert.equal(solve(7, 2), 9)
})

test('3007 edge cases', () => {
  assert.equal(solve(1, 1), 1)
  assert.equal(solve(1, 8), 128)
})

test('3007 rejects out of range values', () => {
  assert.throws(() => parseInput('{"k":0,"x":1}'))
  assert.throws(() => parseInput('{"k":5,"x":9}'))
})

// Independent oracle: add prices one number at a time by inspecting each set bit directly, until the budget is exceeded.
function oracle(k, x) {
  const price = num => {
    let p = 0
    for (let i = x; i <= 40; i += x) if (Math.floor(num / 2 ** (i - 1)) % 2 === 1) p++
    return p
  }
  let total = 0
  let num = 0
  for (;;) {
    const next = num + 1
    if (total + price(next) > k) return num
    total += price(next)
    num = next
  }
}

test('3007 random budgets match a linear accumulation', () => {
  let seed = 3007
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const k = 1 + rnd(200)
    const x = 1 + rnd(8)
    assert.equal(solve(k, x), oracle(k, x), `${k} ${x}`)
  }
})
