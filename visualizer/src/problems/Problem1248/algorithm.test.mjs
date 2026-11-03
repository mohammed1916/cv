import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)

// Independent oracle: examine every contiguous subarray and count the odd values in each.
function oracle(nums, k) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    let odd = 0
    for (let r = l; r < nums.length; r++) {
      odd += nums[r] % 2
      if (odd === k) count++
    }
  }
  return count
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

test('the three samples match the oracle', () => {
  for (const example of examples) {
    const input = parseInput(example.input)
    const trace = buildTrace(input)
    checkFrames(trace)
    assert.equal(trace.result, oracle(input.nums, input.k), example.label)
  }
})

test('random arrays agree with the all-subarrays oracle', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(14)
    const nums = Array.from({ length: n }, () => 1 + rand(9))
    const k = 1 + rand(n)
    assert.equal(buildTrace({ nums, k }).result, oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('all-even and all-odd arrays behave as expected', () => {
  assert.equal(buildTrace({ nums: [2, 4, 6, 8], k: 1 }).result, 0)
  assert.equal(buildTrace({ nums: [1, 3, 5, 7], k: 2 }).result, 3)
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[1,0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})
