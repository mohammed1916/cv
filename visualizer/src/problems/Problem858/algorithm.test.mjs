import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (p, q) => buildTrace(parseInput(JSON.stringify([p, q]))).result

// Oracle: simulate the ray bounce by bounce (x alternates between p and 0, y climbs q).
function oracle(p, q) {
  let y = 0, x = 0
  for (;;) {
    x = x === 0 ? p : 0; y += q
    if (y % p === 0) {
      const top = (y / p) % 2 === 1
      if (x === p) return top ? 1 : 0
      return 2
    }
  }
}

test('official examples', () => {
  assert.equal(solve(2, 1), 2)
  assert.equal(solve(3, 1), 1)
})

test('matches bounce simulation for all p, q up to 40', () => {
  for (let p = 1; p <= 40; p++) for (let q = 1; q <= p; q++) assert.equal(solve(p, q), oracle(p, q), `${p},${q}`)
})

test('trace shape', () => {
  const r = buildTrace(parseInput('[6,4]'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[3]'))
  assert.throws(() => parseInput('[3,0]'))
  assert.throws(() => parseInput('"a"'))
})
