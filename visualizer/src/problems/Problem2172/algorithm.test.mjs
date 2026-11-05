import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2172 worked examples', () => {
  assert.equal(solve('{"nums":[1,2,3,4,5,6],"slots":3}'), 9)
  assert.equal(solve('{"nums":[1,3,10,4,7,1],"slots":3}'), 10)
  assert.equal(solve('{"nums":[5],"slots":1}'), 1)
  assert.equal(solve('{"nums":[2,3],"slots":1}'), 1)
})

test('2172 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"slots":1}'))
  assert.throws(() => parseInput('{"nums":[1],"slots":4}'))
  assert.throws(() => parseInput('{"nums":[0],"slots":1}'))
})

// Oracle: assign each number a slot in 1..slots, at most two per slot.
function oracle(nums, slots) {
  let best = 0
  const load = Array(slots + 1).fill(0)
  const go = (i, acc) => {
    if (i === nums.length) { best = Math.max(best, acc); return }
    for (let s = 1; s <= slots; s++) {
      if (load[s] >= 2) continue
      load[s]++
      go(i + 1, acc + (nums[i] & s))
      load[s]--
    }
  }
  go(0, 0)
  return best
}

test('2172 random inputs match an assignment oracle', () => {
  let seed = 2172
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const slots = 1 + rnd(3)
    const count = 1 + rnd(2 * slots)
    const nums = Array.from({ length: count }, () => 1 + rnd(15))
    const text = JSON.stringify({ nums, slots })
    assert.equal(solve(text), oracle(nums, slots), text)
  }
})

test('2172 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums":[1,3,10,4,7,1],"slots":3}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
