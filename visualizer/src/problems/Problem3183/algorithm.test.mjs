import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const solve = n => buildTrace(n).result

test('3183 worked amounts', () => {
  assert.equal(solve(0), 1)
  assert.equal(solve(4), 4)
  assert.equal(solve(6), 7)
  assert.equal(solve(10), 16)
})

// Oracle: enumerate every count of the four coin types directly.
function oracle(n) {
  let count = 0
  for (let d = 0; d <= 2; d++) {
    for (let c = 0; c * 6 <= n - 4 * d; c++) {
      for (let b = 0; 2 * b <= n - 4 * d - 6 * c; b++) {
        if (n - 4 * d - 6 * c - 2 * b >= 0) count++
      }
    }
  }
  return count % 1000000007
}

test('3183 every amount up to 120 matches the enumeration oracle', () => {
  for (let n = 0; n <= 120; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('3183 the modulus is applied to large amounts', () => {
  const big = solve(200)
  assert.ok(big >= 0 && big < 1000000007)
  assert.equal(big, oracle(200))
})

test('3183 frames carry real pseudocode and python lines and the strip', () => {
  const run = buildTrace(10)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 12, `pythonLine ${frame.pythonLine}`)
    assert.equal(frame.ways.length, 11)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('3183 parse rejects negative and oversized amounts', () => {
  assert.throws(() => parseInput('-1'))
  assert.throws(() => parseInput('201'))
  assert.throws(() => parseInput('2.5'))
  assert.equal(parseInput('10'), 10)
})
