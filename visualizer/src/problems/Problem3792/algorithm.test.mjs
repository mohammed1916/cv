import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace({ n }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: exact BigInt blocks, reduced only at the end.
function oracle(n) {
  let total = 0n
  let start = 1n
  for (let k = 1n; k <= BigInt(n); k++) {
    let product = 1n
    for (let t = 0n; t < k; t++) product *= start + t
    total += product
    start += k
  }
  return Number(total % 1000000007n)
}

test('3792 worked cases', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 7)
  assert.equal(solve(3), 127)
  assert.equal(solve(4), 5167)
})

test('3792 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ n: 4 }))
})

test('3792 parseInput limits the visualization to small n', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":9}'))
})

test('3792 matches the BigInt oracle for larger n', () => {
  for (let n = 1; n <= 40; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
