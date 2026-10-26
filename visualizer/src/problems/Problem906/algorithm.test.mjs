import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (left, right) => buildTrace(parseInput(JSON.stringify({ left, right }))).result
const pal = x => { const s = String(x); return s === [...s].reverse().join('') }
function brute(L, R) {
  let c = 0
  for (let x = Math.ceil(Math.sqrt(L)); x * x <= R; x++) if (x * x >= L && pal(x) && pal(x * x)) c++
  return c
}
test('official examples', () => {
  assert.equal(solve('4', '1000'), 4)
  assert.equal(solve('1', '2'), 1)
})
test('matches brute force on ranges', () => {
  let seed = 3
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 60; t++) {
    const a = 1 + rnd(10 ** 8), b = a + rnd(10 ** 9)
    assert.equal(solve(String(a), String(b)), brute(a, b))
  }
  assert.equal(solve('1', '1000000000000'), brute(1, 1e12))
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('{"left":"1","right":"9"}')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('{"left":"9","right":"1"}'))
  assert.throws(() => parseInput('{"left":"0","right":"1"}'))
  assert.throws(() => parseInput('{"left":"1","right":"1000000000001"}'))
})
