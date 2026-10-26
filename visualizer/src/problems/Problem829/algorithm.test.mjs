import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = n => buildTrace(parseInput(String(n))).result
function brute(n) {
  let c = 0
  for (let a = 1; a <= n; a++) { let s = 0; for (let b = a; s < n; b++) s += b; if (s === n) c++ }
  return c
}
test('official examples', () => { assert.equal(solve(5), 2); assert.equal(solve(9), 3); assert.equal(solve(15), 4) })
test('matches start-point enumeration for n up to 1500', () => {
  for (let n = 1; n <= 1500; n++) assert.equal(solve(n), brute(n), `n=${n}`)
  const r = buildTrace(10000000); assert.equal(r.frames.at(-1).phase, 'done')
})
test('invalid input rejected', () => {
  for (const bad of ['0', '10000001', '1.5', '"5"', '[5]']) assert.throws(() => parseInput(bad))
})
