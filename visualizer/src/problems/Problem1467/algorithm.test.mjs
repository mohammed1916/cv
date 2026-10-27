import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = balls => buildTrace(parseInput(JSON.stringify(balls))).result
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} vs ${b}`)

test('1467 official examples', () => {
  close(solve([1, 1]), 1)
  close(solve([2, 1, 1]), 2 / 3)
  close(solve([1, 2, 1, 2]), 0.6)
  close(solve([3, 2, 1]), 0.3)
})

test('1467 rejects an odd total', () => {
  assert.throws(() => parseInput('[1,2]'), /even/)
})

// Independent oracle: list every subset of individual balls for box one and test the colour counts directly.
function oracle(balls) {
  const colours = []
  balls.forEach((count, c) => { for (let i = 0; i < count; i++) colours.push(c) })
  const total = colours.length
  const half = total / 2
  let favourable = 0
  let subsets = 0
  for (let mask = 0; mask < 1 << total; mask++) {
    let inBox = 0
    const one = new Set()
    const two = new Set()
    for (let i = 0; i < total; i++) {
      if (mask & (1 << i)) { inBox++; one.add(colours[i]) } else two.add(colours[i])
    }
    if (inBox !== half) continue
    subsets++
    if (one.size === two.size) favourable++
  }
  return favourable / subsets
}

test('1467 random colour counts match a subset-enumeration oracle', () => {
  let seed = 1467
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 200; t++) {
    const m = 2 + rnd(4)
    const balls = Array.from({ length: m }, () => 1 + rnd(4))
    try { parseInput(JSON.stringify(balls)) } catch { continue }
    if (balls.reduce((a, b) => a + b, 0) > 12) continue
    checked++
    close(solve(balls), oracle(balls))
  }
  assert.ok(checked > 50)
})
