import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3344 worked examples and edge cases', () => {
  assert.equal(solve(0), 1)
  assert.equal(solve(50), 3)
  assert.equal(solve(1000), 5)
})

test('3344 rejects a negative limit', () => {
  assert.throws(() => parseInput('{"s":-1}'))
})

// Brute oracle: build every element and add them up; grow n while the total still fits.
function total(n) {
  let sum = 0
  for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) for (let k = 0; k < n; k += 1) sum += i * (j | k)
  return sum
}
function oracle(s) {
  let n = 1
  while (total(n + 1) <= s) n += 1
  return n
}

test('3344 matches a direct triple-sum oracle', () => {
  for (let s = 0; s <= 1200; s += 7) assert.equal(solve(s), oracle(s), `s=${s}`)
})

test('3344 frames end with the result and the last frame stops within the limit', () => {
  const run = buildTrace(parseInput('{"s":50}'))
  assert.equal(run.frames.at(-1).phase, 'done')
  const stop = run.frames.find(f => f.phase === 'stop')
  assert.ok(stop.total > 50)
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 11)
})
