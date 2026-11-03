import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(heights) {
  return buildTrace(parseInput(JSON.stringify(heights))).result
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

// Independent oracle: every visiting order after the ground.
function oracle(heights) {
  let best = -Infinity
  const go = (current, rest, total) => {
    if (rest.length === 0) { best = Math.max(best, total); return }
    rest.forEach((h, i) => go(h, rest.filter((_, j) => j !== i), total + (current - h) ** 2))
  }
  go(0, heights, 0)
  return best
}

test('3730 presets', () => {
  assert.equal(solve([3, 10, 4, 1]), oracle([3, 10, 4, 1]))
  assert.equal(solve([0, 7, 7, 2, 5]), oracle([0, 7, 7, 2, 5]))
  assert.equal(solve([6]), 36)
})

test('3730 a block at height zero and repeated heights', () => {
  assert.equal(solve([0]), 0)
  assert.equal(solve([4, 4, 4]), 16)
})

test('3730 random inputs match the every-order oracle', () => {
  let seed = 3730
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t += 1) {
    const heights = Array.from({ length: 1 + rnd(6) }, () => rnd(12))
    assert.equal(solve(heights), oracle(heights), JSON.stringify(heights))
  }
})

test('3730 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('[3,10,4,1]')))
})

test('3730 rejects malformed input', () => {
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[51]'))
})
