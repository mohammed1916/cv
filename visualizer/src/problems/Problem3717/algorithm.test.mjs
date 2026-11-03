import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(nums) {
  return buildTrace(parseInput(JSON.stringify(nums))).result
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

// Independent oracle: brute force over every final value up to a wide bound.
function oracle(nums, bound) {
  let best = Infinity
  const rec = (i, prev, cost) => {
    if (cost >= best) return
    if (i === nums.length) { best = cost; return }
    for (let v = nums[i]; v <= bound; v += 1) if (v % prev === 0) rec(i + 1, v, cost + v - nums[i])
  }
  rec(1, nums[0], 0)
  return best
}

test('3717 presets', () => {
  assert.equal(solve([1, 8, 5, 9]), 5)
  assert.equal(solve([4, 6, 9]), 9)
  assert.equal(solve([3, 7, 2, 11]), oracle([3, 7, 2, 11], 80))
})

test('3717 a single element costs nothing', () => {
  assert.equal(solve([7]), 0)
})

test('3717 the chain may raise an earlier element to help a later one', () => {
  assert.equal(solve([2, 3, 5]), oracle([2, 3, 5], 40))
})

test('3717 random inputs match a wider brute force', () => {
  let seed = 3717
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t += 1) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(9))
    const max = Math.max(...nums)
    assert.equal(solve(nums), oracle(nums, 4 * max + 8), JSON.stringify(nums))
  }
})

test('3717 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('[1,8,5,9]')))
})

test('3717 rejects malformed input', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[21]'))
  assert.throws(() => parseInput('[]'))
})
