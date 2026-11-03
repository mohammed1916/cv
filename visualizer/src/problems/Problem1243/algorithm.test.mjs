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

// Independent oracle: apply the rule to the previous round until a fixed point.
function oracle(arr) {
  let current = arr.slice()
  for (let guard = 0; guard < 100000; guard += 1) {
    const next = current.map((value, i) => {
      if (i === 0 || i === current.length - 1) return value
      if (current[i] < current[i - 1] && current[i] < current[i + 1]) return value + 1
      if (current[i] > current[i - 1] && current[i] > current[i + 1]) return value - 1
      return value
    })
    if (next.every((value, i) => value === current[i])) return current
    current = next
  }
  throw new Error('no fixed point')
}

test('the first example settles into [6,3,3,3,1] after one change', () => {
  const run = buildTrace(parseInput('[6,2,3,4,1]'))
  assert.deepEqual(run.result, [6, 3, 3, 3, 1])
  assertFrameInvariants(run)
})

test('the second example changes twice and then stabilizes at [1,4,4,4,4,5]', () => {
  const run = buildTrace(parseInput('[1,6,3,4,3,5]'))
  assert.deepEqual(run.result, [1, 4, 4, 4, 4, 5])
  assert.equal(run.frames[run.frames.length - 1].round, 3)
  assertFrameInvariants(run)
})

test('an already stable array is returned unchanged', () => {
  assert.deepEqual(buildTrace(parseInput('[1,2,3,4,5]')).result, [1, 2, 3, 4, 5])
  assert.deepEqual(buildTrace(parseInput('[7]')).result, [7])
})

test('parseInput rejects arrays that are too long or hold non-integers', () => {
  assert.throws(() => parseInput('[]'), /1 to 12/)
  assert.throws(() => parseInput('[1.5]'), /integer/)
  assert.throws(() => parseInput('[101]'), /between/)
})

test('the trace agrees with the round-by-round oracle on random arrays', () => {
  let seed = 1243
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  for (let trial = 0; trial < 300; trial += 1) {
    const length = 1 + (next() % 9)
    const arr = Array.from({ length }, () => (next() % 21) - 10)
    const run = buildTrace(parseInput(JSON.stringify(arr)))
    assert.deepEqual(run.result, oracle(arr), JSON.stringify(arr))
    assertFrameInvariants(run)
  }
})
