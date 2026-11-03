import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(transactions) {
  return buildTrace(parseInput(JSON.stringify(transactions))).result
}

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PY_COUNT)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent oracle: try every subset in order and keep the largest whose prefix balances stay nonnegative.
function oracle(transactions) {
  const n = transactions.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask += 1) {
    let balance = 0
    let count = 0
    let ok = true
    for (let p = 0; p < n && ok; p += 1) {
      if (!(mask & (1 << p))) continue
      balance += transactions[p]
      count += 1
      if (balance < 0) ok = false
    }
    if (ok) best = Math.max(best, count)
  }
  return best
}

test('3711 presets', () => {
  assert.equal(solve([-3, 5, -4, 2, -6]), 3)
  assert.equal(solve([4, -2, -5, 3, -1, -4]), 5)
  assert.equal(solve([-1, -1, -1]), 0)
})

test('3711 empty input and all-positive input', () => {
  assert.equal(solve([]), 0)
  assert.equal(solve([3, 1, 4]), 3)
})

test('3711 random inputs match the subset oracle', () => {
  let seed = 3711
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t += 1) {
    const transactions = Array.from({ length: rnd(9) }, () => rnd(15) - 7)
    assert.equal(solve(transactions), oracle(transactions), JSON.stringify(transactions))
  }
})

test('3711 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('[-3,5,-4,2,-6]')))
})

test('3711 rejects malformed input', () => {
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[99]'))
  assert.throws(() => parseInput('{"t":[1]}'))
})
