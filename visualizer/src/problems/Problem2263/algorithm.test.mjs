import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2263 worked examples', () => {
  assert.equal(solve('[3,1,2]'), 1)
  assert.equal(solve('[1,2,3]'), 0)
  assert.equal(solve('[5]'), 0)
  assert.equal(solve('[2,2,2]'), 0)
})

test('2263 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[51]'))
})

// Oracle: try every target sequence with values in the original range [min, max] and take the cheapest monotone one.
function oracle(nums) {
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  const span = hi - lo + 1
  const n = nums.length
  let best = Infinity
  const target = Array(n).fill(lo)
  const total = span ** n
  for (let code = 0; code < total; code++) {
    let c = code
    for (let i = 0; i < n; i++) { target[i] = lo + (c % span); c = Math.floor(c / span) }
    const nd = target.every((v, i) => i === 0 || target[i - 1] <= v)
    const ni = target.every((v, i) => i === 0 || target[i - 1] >= v)
    if (nd || ni) {
      const cost = nums.reduce((acc, v, i) => acc + Math.abs(v - target[i]), 0)
      best = Math.min(best, cost)
    }
  }
  return best
}

test('2263 random small arrays match a brute-force target oracle', () => {
  let seed = 2263
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => rnd(6))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})

test('2263 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[3,1,2]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
