import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function solve(text) {
  return buildTrace(parseInput(text)).result
}

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: build the full progression and find the one value that is absent.
function oracle(arr) {
  const n = arr.length
  const step = (arr[n - 1] - arr[0]) / n
  for (let k = 0; k <= n; k += 1) {
    const value = arr[0] + k * step
    if (!arr.includes(value) && k > 0 && k < n) return value
  }
  return arr[0]
}

test('the first example finds 9 between 7 and 11', () => {
  const run = buildTrace(parseInput('[5,7,11,13]'))
  assert.equal(run.result, 9)
  assertFrameInvariants(run)
})

test('a decreasing progression works with a negative step', () => {
  assert.equal(solve('[15,13,11,7]'), 9)
})

test('a constant progression returns its repeated value', () => {
  assert.equal(solve('[4,4,4]'), 4)
})

test('parseInput rejects arrays with no single common difference', () => {
  assert.throws(() => parseInput('[1]'), /2 to 20/)
  assert.throws(() => parseInput('[1,2,4,9]'), /single removed term/)
  assert.throws(() => parseInput('[1,3,2,7]'), /one common difference/)
  assert.throws(() => parseInput('[1.5,3]'), /integer/)
})

test('the trace agrees with the brute-force oracle over many progressions', () => {
  for (let start = -6; start <= 6; start += 1) {
    for (let step = -3; step <= 3; step += 1) {
      for (let length = 3; length <= 8; length += 1) {
        for (let removed = 1; removed < length - 1; removed += 1) {
          const full = Array.from({ length }, (_, k) => start + k * step)
          const arr = full.filter((_, k) => k !== removed)
          const run = buildTrace(arr)
          assert.equal(run.result, full[removed], JSON.stringify(arr))
          assert.equal(oracle(arr), full[removed], JSON.stringify(arr))
          assertFrameInvariants(run)
        }
      }
    }
  }
})
