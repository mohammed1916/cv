import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (prob, target) => buildTrace({ prob, target }).result
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} is not ${b}`)

test('1230 hand-checked cases', () => {
  near(solve([0.4], 1), 0.4)
  near(solve([0.2, 0.4, 0.6], 0), 0.8 * 0.6 * 0.4)
  near(solve([1, 0.5], 1), 0.5)
  near(solve([0.25, 0.75, 0.5], 2), 0.40625)
})

test('1230 certain and impossible coins', () => {
  near(solve([0, 1], 1), 1)
  near(solve([0, 1], 0), 0)
  near(solve([1, 1, 1], 3), 1)
})

test('1230 rejects bad input', () => {
  assert.throws(() => parseInput('{"prob":[],"target":0}'))
  assert.throws(() => parseInput('{"prob":[1.5],"target":0}'))
  assert.throws(() => parseInput('{"prob":[0.5],"target":2}'))
})

function brute(prob, target) {
  let total = 0
  for (let mask = 0; mask < 1 << prob.length; mask++) {
    let heads = 0, chance = 1
    prob.forEach((p, i) => {
      if (mask & (1 << i)) { heads++; chance *= p } else chance *= 1 - p
    })
    if (heads === target) total += chance
  }
  return total
}

test('1230 random inputs match a subset enumeration oracle', () => {
  let seed = 1230
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const prob = Array.from({ length: n }, () => rnd(11) / 10)
    const target = rnd(n + 1)
    near(solve(prob, target), brute(prob, target))
  }
})

test('1230 frame invariants', () => {
  const prob = [0.3, 0.6, 0.8]
  const run = buildTrace({ prob, target: 1 })
  const lines = code.length, pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= lines)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(f.dp.length, prob.length + 1)
    assert.ok(f.dp.every(v => v >= -1e-12 && v <= 1 + 1e-12))
  }
  const finishes = run.frames.filter(f => f.phase === 'update' && f.j === 0)
  assert.equal(finishes.length, prob.length)
  for (const f of finishes) near(f.dp.reduce((a, b) => a + b, 0), 1)
  assert.equal(run.frames.at(-1).phase, 'done')
})
