import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (numBottles, numExchange) => buildTrace({ numBottles, numExchange }).result

test('1518 sample inputs match hand-worked totals', () => {
  assert.equal(solve(9, 3), 13)
  assert.equal(solve(1, 2), 1)
  assert.equal(solve(2, 2), 3)
  assert.equal(solve(15, 4), 19)
})

test('1518 simulation matches the closed form for every pair up to 100', () => {
  for (let b = 1; b <= 100; b++) for (let e = 2; e <= 100; e++) {
    const closed = b + Math.floor((b - 1) / (e - 1))
    assert.equal(solve(b, e), closed, `${b},${e}`)
  }
})

test('1518 frames end with the total and walk every exchange round', () => {
  const run = buildTrace({ numBottles: 9, numExchange: 3 })
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.filter(f => f.phase === "exchange").length, 2)
  for (const f of run.frames) assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
})

test('1518 rejects malformed input', () => {
  assert.throws(() => parseInput('[9,3]'), /object/)
  assert.throws(() => parseInput('{"numBottles":0,"numExchange":3}'), /numBottles/)
  assert.throws(() => parseInput('{"numBottles":9,"numExchange":1}'), /numExchange/)
})
