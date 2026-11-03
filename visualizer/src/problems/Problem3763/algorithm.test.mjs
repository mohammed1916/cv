import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(nums, threshold) {
  return buildTrace(parseInput(JSON.stringify({ nums, threshold }))).result
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

// Independent oracle: every forced sequence of picks; a run ends only when nothing is eligible.
function oracle(nums, threshold) {
  let best = -Infinity
  const go = (used, step, total) => {
    const eligible = nums.map((_, i) => i).filter(i => !used[i] && threshold[i] <= step)
    if (eligible.length === 0) { best = Math.max(best, total); return }
    for (const i of eligible) {
      used[i] = true
      go(used, step + 1, total + nums[i])
      used[i] = false
    }
  }
  go(nums.map(() => false), 1, 0)
  return best
}

test('3763 presets', () => {
  assert.equal(solve([5, -2, 9, 4], [1, 3, 2, 1]), oracle([5, -2, 9, 4], [1, 3, 2, 1]))
  assert.equal(solve([3, 8, 1], [1, 1, 3]), 12)
  assert.equal(solve([7, 14, -4, 12], [2, 2, 1, 2]), 29)
})

test('3763 a forced negative pick is still taken', () => {
  assert.equal(solve([-5], [1]), -5)
  assert.equal(solve([1, 1], [2, 1]), 2)
})

test('3763 random inputs match the forced-sequence oracle', () => {
  let seed = 3763
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t += 1) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(25) - 6)
    const threshold = Array.from({ length: n }, () => 1 + rnd(n))
    assert.equal(solve(nums, threshold), oracle(nums, threshold), JSON.stringify({ nums, threshold }))
  }
})

test('3763 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('{"nums":[5,-2,9,4],"threshold":[1,3,2,1]}')))
})

test('3763 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1],"threshold":[2]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"threshold":[1]}'))
  assert.throws(() => parseInput('[1]'))
})
