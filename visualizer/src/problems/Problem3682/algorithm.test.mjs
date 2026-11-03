import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(nums1, nums2) {
  return buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result
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

// Independent oracle: first positions, then the smallest sum among common values.
function oracle(nums1, nums2) {
  let best = Infinity
  let out = []
  for (const x of new Set(nums1)) {
    const j = nums2.indexOf(x)
    const i = nums1.indexOf(x)
    if (j < 0) continue
    const sum = i + j
    if (sum < best) { best = sum; out = [x] } else if (sum === best) out.push(x)
  }
  return out.sort((a, b) => a - b)
}

test('3682 presets: a unique minimum, a tie, and no common value', () => {
  assert.deepEqual(solve([7, 3, 9, 4, 1], [4, 8, 1, 3, 6]), [4])
  assert.deepEqual(solve([6, 1, 4, 9], [9, 4, 1, 6]), [1, 4, 6, 9])
  assert.deepEqual(solve([1, 2], [3, 4]), [])
})

test('3682 repeated values use their first occurrences', () => {
  assert.deepEqual(solve([5, 5, 2], [2, 5]), [5])
  assert.deepEqual(solve([2, 9, 2], [9, 2, 2]), [2, 9])
})

test('3682 random inputs match the first-occurrence oracle', () => {
  let seed = 3682
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t += 1) {
    const nums1 = Array.from({ length: 1 + rnd(7) }, () => rnd(6))
    const nums2 = Array.from({ length: 1 + rnd(7) }, () => rnd(6))
    assert.deepEqual(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})

test('3682 frames carry valid pseudocode and python lines', () => {
  for (const text of ['{"nums1":[7,3,9,4,1],"nums2":[4,8,1,3,6]}', '{"nums1":[6,1,4,9],"nums2":[9,4,1,6]}']) {
    checkFrames(buildTrace(parseInput(text)))
  }
})

test('3682 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('{"nums1":[],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[100],"nums2":[1]}'))
})
