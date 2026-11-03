import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (values, tokens) => buildTrace({ values, tokens }).result

// Independent oracle: try every stay-or-move choice for each token and score the distinct occupied indices.
function oracle(values, tokens) {
  const n = values.length
  const tokenIdx = [...tokens].map((c, i) => (c === '1' ? i : -1)).filter(i => i >= 0)
  let best = 0
  for (let mask = 0; mask < 1 << tokenIdx.length; mask++) {
    const occupied = new Set()
    tokenIdx.forEach((pos, k) => {
      const moved = (mask >> k) & 1 && pos >= 1
      occupied.add(moved ? pos - 1 : pos)
    })
    let total = 0
    for (const p of occupied) total += values[p]
    best = Math.max(best, total)
  }
  return best
}

test('3952 authored presets', () => {
  assert.equal(solve([4, 2, 7, 1], '0110'), 11)
  assert.equal(solve([5, 1, 3, 8, 2], '11011'), 17)
})

test('3952 no tokens score nothing', () => {
  assert.equal(solve([3, 4], '00'), 0)
})

test('3952 rejects mismatched tokens', () => {
  assert.throws(() => parseInput('{"values":[1,2],"tokens":"1"}'))
  assert.throws(() => parseInput('{"values":[1,2],"tokens":"12"}'))
})

test('3952 random inputs match the enumerate-every-choice oracle', () => {
  let seed = 3952
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(9)
    const values = Array.from({ length: n }, () => 1 + rnd(20))
    const tokens = Array.from({ length: n }, () => (rnd(3) ? '1' : '0')).join('')
    assert.equal(solve(values, tokens), oracle(values, tokens), JSON.stringify({ values, tokens }))
  }
})
