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

// Independent oracle: try every start time, from earliest to latest, and test both people.
function oracle(slots1, slots2, duration) {
  const lo = Math.min(...slots1.concat(slots2).map(s => s[0]))
  const hi = Math.max(...slots1.concat(slots2).map(s => s[1]))
  const fits = (slots, t) => slots.some(([s, e]) => s <= t && t + duration <= e)
  for (let t = lo; t <= hi; t += 1) {
    if (fits(slots1, t) && fits(slots2, t)) return [t, t + duration]
  }
  return []
}

test('the first example skips a short overlap and meets at 70 to 79', () => {
  const run = buildTrace(parseInput('{"slots1":[[10,40],[70,130]],"slots2":[[0,12],[62,80]],"duration":9}'))
  assert.deepEqual(run.result, [70, 79])
  assertFrameInvariants(run)
})

test('an immediate overlap is returned at its start', () => {
  assert.deepEqual(solve('{"slots1":[[1,5]],"slots2":[[2,9]],"duration":3}'), [2, 5])
})

test('no shared window returns an empty list', () => {
  assert.deepEqual(solve('{"slots1":[[1,5]],"slots2":[[6,9]],"duration":2}'), [])
})

test('unsorted input is sorted before the walk', () => {
  assert.deepEqual(solve('{"slots1":[[70,130],[10,40]],"slots2":[[62,80],[0,12]],"duration":9}'), [70, 79])
})

test('parseInput rejects overlapping, empty or non-integer slots', () => {
  assert.throws(() => parseInput('{"slots1":[[1,5],[4,8]],"slots2":[[0,9]],"duration":1}'), /must not overlap/)
  assert.throws(() => parseInput('{"slots1":[[5,5]],"slots2":[[0,9]],"duration":1}'), /starts before it ends/)
  assert.throws(() => parseInput('{"slots1":[[1.5,5]],"slots2":[[0,9]],"duration":1}'), /integers/)
  assert.throws(() => parseInput('{"slots1":[[1,5]],"slots2":[[0,9]],"duration":0}'), /positive/)
})

test('the trace agrees with the brute-force oracle on random schedules', () => {
  let seed = 1229
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  const schedule = () => {
    const slots = []
    let cursor = next() % 6
    const count = 1 + (next() % 4)
    for (let k = 0; k < count; k += 1) {
      const start = cursor + (next() % 5)
      const end = start + 1 + (next() % 9)
      slots.push([start, end])
      cursor = end + (next() % 4)
    }
    return slots
  }
  for (let trial = 0; trial < 300; trial += 1) {
    const slots1 = schedule()
    const slots2 = schedule()
    const duration = 1 + (next() % 6)
    const text = JSON.stringify({ slots1, slots2, duration })
    const run = buildTrace(parseInput(text))
    assert.deepEqual(run.result, oracle(slots1, slots2, duration), text)
    assertFrameInvariants(run)
  }
})
