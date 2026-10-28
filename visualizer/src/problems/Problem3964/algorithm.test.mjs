import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = lights => buildTrace(parseInput(JSON.stringify({ lights }))).result

test('3964 official examples', () => {
  assert.equal(solve([0, 0, 0, 0]), 2)
  assert.equal(solve([0, 0, 0, 2, 0]), 1)
})

test('3964 existing bulbs that already cover the road need no extra bulbs', () => {
  assert.equal(solve([1, 0, 1]), 0)
})

test('3964 rejects a light value above n', () => {
  assert.throws(() => parseInput('{"lights":[0,5]}'))
})

// Independent oracle: try every set of extra bulb positions and keep the smallest that lights everything.
function oracle(lights) {
  const n = lights.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    const lit = Array(n).fill(false)
    let count = 0
    const bulbs = []
    lights.forEach((v, i) => { if (v > 0) bulbs.push([i, v, 0]) })
    for (let j = 0; j < n; j++) if ((mask >> j) & 1) { bulbs.push([j, 1, 1]); count++ }
    for (const [i, v] of bulbs) for (let p = Math.max(0, i - v); p <= Math.min(n - 1, i + v); p++) lit[p] = true
    if (lit.every(Boolean) && count < best) best = count
  }
  return best
}

test('3964 random roads match a try-every-set oracle', () => {
  let seed = 3964
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const lights = Array.from({ length: n }, () => (rnd(3) === 0 ? rnd(n + 1) : 0))
    assert.equal(solve(lights), oracle(lights), JSON.stringify(lights))
  }
})
