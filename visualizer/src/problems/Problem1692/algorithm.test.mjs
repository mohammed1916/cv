import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, k) => buildTrace({ n, k }).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1692 worked examples (Stirling numbers of the second kind)', () => {
  assert.equal(solve(3, 2), 3)
  assert.equal(solve(4, 2), 7)
  assert.equal(solve(5, 3), 25)
  assert.equal(solve(4, 4), 1)
  assert.equal(solve(6, 1), 1)
})

test('1692 rejects k above n and sizes above the visualization cap', () => {
  assert.throws(() => parseInput('{"n":2,"k":3}'))
  assert.throws(() => parseInput('{"n":13,"k":2}'))
})

test('1692 frames point at real pseudocode and python lines', () => {
  const run = buildTrace({ n: 4, k: 2 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: enumerate every set partition of 1..n and count the ones with exactly k blocks.
function oracle(n, k) {
  let count = 0
  const blocks = []
  const place = i => {
    if (i > n) { if (blocks.length === k) count += 1; return }
    for (let b = 0; b < blocks.length; b++) { blocks[b] += 1; place(i + 1); blocks[b] -= 1 }
    blocks.push(1)
    place(i + 1)
    blocks.pop()
  }
  place(1)
  return count % 1000000007
}

test('1692 small sizes match a set-partition enumeration oracle', () => {
  for (let n = 1; n <= 8; n++) for (let k = 1; k <= n; k++) assert.equal(solve(n, k), oracle(n, k), `${n},${k}`)
})
