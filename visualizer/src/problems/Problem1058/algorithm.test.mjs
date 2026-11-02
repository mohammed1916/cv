import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, formatThousandths, toMicro } from './algorithm.js'

const solve = (prices, target) => buildTrace({ prices, target }).result
const pyLines = python.split('\n').length

test('1058 worked examples', () => {
  assert.equal(solve(['0.700', '2.800', '4.900', '0.000'], 8), '1.000')
  assert.equal(solve(['1.500', '2.500', '3.500'], 10), '-1')
  assert.equal(solve(['1.000'], 1), '0.000')
})

test('1058 formatting rounds half up at the third decimal', () => {
  assert.equal(formatThousandths(0), '0.000')
  assert.equal(formatThousandths(1234500), '1.235')
  assert.equal(formatThousandths(1234499), '1.234')
  assert.equal(toMicro('12.5'), 12500000)
})

test('1058 frames carry valid pseudocode and python lines', () => {
  for (const frame of buildTrace({ prices: ['0.700', '2.800'], target: 3 }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1058 rejects malformed prices', () => {
  assert.throws(() => parseInput('{"prices":[1.5],"target":1}'))
  assert.throws(() => parseInput('{"prices":["1.2345678"],"target":1}'))
  assert.throws(() => parseInput('{"prices":["-1.5"],"target":1}'))
})

// Oracle: try every up/down choice for each price and keep the cheapest one whose total hits the target.
function oracle(prices, target) {
  let best = null
  const n = prices.length
  for (let mask = 0; mask < 1 << n; mask++) {
    let total = 0, error = 0
    for (let i = 0; i < n; i++) {
      const m = toMicro(prices[i])
      const floor = Math.floor(m / 1000000)
      const ceil = m % 1000000 === 0 ? floor : floor + 1
      if (mask & (1 << i)) { total += ceil; error += ceil * 1000000 - m } else { total += floor; error += m - floor * 1000000 }
    }
    if (total === target && (best === null || error < best)) best = error
  }
  return best === null ? '-1' : formatThousandths(best)
}

test('1058 random prices match an exhaustive up/down oracle', () => {
  let seed = 1058
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const price = () => `${rnd(6)}.${String(rnd(1000)).padStart(3, '0')}`
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 1 + rnd(6) }, price)
    const target = rnd(prices.length * 6 + 1)
    assert.equal(solve(prices, target), oracle(prices, target), JSON.stringify({ prices, target }))
  }
})
