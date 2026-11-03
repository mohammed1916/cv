import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: memoised search over every palindromic contiguous removal.
function oracle(arr) {
  const memo = new Map()
  const isPal = seg => seg.every((v, k) => v === seg[seg.length - 1 - k])
  function solve(seq) {
    if (seq.length === 0) return 0
    const key = seq.join(',')
    if (memo.has(key)) return memo.get(key)
    let best = Infinity
    for (let a = 0; a < seq.length; a += 1) {
      for (let b = a; b < seq.length; b += 1) {
        const seg = seq.slice(a, b + 1)
        if (!isPal(seg)) continue
        best = Math.min(best, 1 + solve([...seq.slice(0, a), ...seq.slice(b + 1)]))
      }
    }
    memo.set(key, best)
    return best
  }
  return solve(arr)
}

test('a palindrome array clears in one move', () => {
  const run = buildTrace(parseInput('[1,2,3,2,1]'))
  assert.equal(run.result, 1)
  assertFrameInvariants(run)
})

test('the pairing example [1,3,4,1,5] clears in three moves', () => {
  const run = buildTrace(parseInput('[1,3,4,1,5]'))
  assert.equal(run.result, 3)
  assert.equal(oracle([1, 3, 4, 1, 5]), 3)
  assertFrameInvariants(run)
})

test('a single value takes one move and an empty-free input never costs zero', () => {
  assert.equal(buildTrace(parseInput('[7]')).result, 1)
})

test('parseInput rejects long or non-integer arrays', () => {
  assert.throws(() => parseInput('[]'), /1 to 10/)
  assert.throws(() => parseInput('[1,2.5]'), /integer/)
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11]'), /1 to 10/)
})

test('the trace agrees with the subset-search oracle on random small arrays', () => {
  let seed = 1246
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  for (let trial = 0; trial < 200; trial += 1) {
    const n = 1 + (next() % 7)
    const arr = Array.from({ length: n }, () => next() % 3)
    const run = buildTrace(parseInput(JSON.stringify(arr)))
    assert.equal(run.result, oracle(arr), JSON.stringify(arr))
    assertFrameInvariants(run)
  }
})
