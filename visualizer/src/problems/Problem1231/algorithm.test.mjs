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

// Independent oracle: try every choice of k cut positions and keep the best minimum piece sum.
function oracle(sweetness, k) {
  const n = sweetness.length
  let best = -1
  for (let mask = 0; mask < 1 << (n - 1); mask += 1) {
    const cuts = []
    for (let b = 0; b < n - 1; b += 1) if (mask & (1 << b)) cuts.push(b)
    if (cuts.length !== k) continue
    const bounds = [-1, ...cuts, n - 1]
    let minimum = Infinity
    for (let p = 0; p + 1 < bounds.length; p += 1) {
      let sum = 0
      for (let idx = bounds[p] + 1; idx <= bounds[p + 1]; idx += 1) sum += sweetness[idx]
      minimum = Math.min(minimum, sum)
    }
    best = Math.max(best, minimum)
  }
  return best
}

test('the nine-bar example with five cuts gives 6', () => {
  const run = buildTrace(parseInput('{"sweetness":[1,2,3,4,5,6,7,8,9],"k":5}'))
  assert.equal(run.result, 6)
  assertFrameInvariants(run)
})

test('the four-bar example with two cuts gives 7', () => {
  assert.equal(solve('{"sweetness":[5,6,7,8],"k":2}'), 7)
})

test('zero cuts keep the whole total as the single piece', () => {
  assert.equal(solve('{"sweetness":[4,1],"k":0}'), 5)
})

test('parseInput rejects negative bars and impossible cut counts', () => {
  assert.throws(() => parseInput('{"sweetness":[1,-2],"k":0}'), /nonnegative/)
  assert.throws(() => parseInput('{"sweetness":[1,2],"k":2}'), /from 0 to one less/)
  assert.throws(() => parseInput('{"sweetness":[],"k":0}'), /1 to 12/)
})

test('the trace agrees with the subset oracle on random small bars', () => {
  let seed = 1231
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  for (let trial = 0; trial < 300; trial += 1) {
    const n = 1 + (next() % 8)
    const sweetness = Array.from({ length: n }, () => next() % 12)
    const k = next() % n
    const text = JSON.stringify({ sweetness, k })
    const run = buildTrace(parseInput(text))
    assert.equal(run.result, oracle(sweetness, k), text)
    assertFrameInvariants(run)
  }
})
