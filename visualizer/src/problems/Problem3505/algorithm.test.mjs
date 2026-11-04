import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, x, k) => buildTrace({ nums, x, k }).result

test('3505 hand-computed: costs 8,12,10,10,5,10,10,12 pick windows at 0 and 4', () => {
  const trace = buildTrace({ nums: [4, 9, 1, -3, 7, 7, 2, 12, 5, 0], x: 3, k: 2 })
  assert.equal(trace.result, 13)
  assert.deepEqual(trace.frames.at(-1).cost, [8, 12, 10, 10, 5, 10, 10, 12])
  assert.deepEqual(trace.frames.at(-1).chosen.map(w => [w.start, w.median, w.cost]), [[0, 4, 8], [4, 7, 5]])
})

test('3505 hand-computed small cases', () => {
  assert.equal(solve([1, 5, 2, 8], 2, 2), 10)
  assert.equal(solve([6, 6, 6, 6, 6], 2, 2), 0)
  assert.equal(solve([-4, 10], 2, 1), 14)
  assert.equal(solve([3, 3, 9, 9, 9], 3, 1), 0)
  assert.equal(solve([1, 100, 2, 3], 2, 1), 1)
})

test('3505 repeated values cross the halves safely', () => {
  assert.equal(solve([2, 2, 2, 5, 2, 2], 2, 2), 0)
  assert.equal(solve([5, 5, 1, 5, 5, 1, 5], 3, 2), 8)
})

test('3505 parseInput rejects bad input', () => {
  assert.doesNotThrow(() => parseInput('{"nums":[1,2],"x":2,"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"x":2,"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"x":1,"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"x":2,"k":2}'))
  assert.throws(() => parseInput('{"nums":[1,2],"x":2,"k":0}'))
  assert.throws(() => parseInput('{"nums":[1,2.5],"x":2,"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2000000],"x":2,"k":1}'))
  assert.throws(() => parseInput(`{"nums":${JSON.stringify(Array(14).fill(1))},"x":2,"k":1}`))
})

// Oracle: every target value for each window, every set of at least k non-overlapping windows.
function oracle(nums, x, k) {
  const windowCost = start => {
    let best = Infinity
    for (let target = Math.min(...nums); target <= Math.max(...nums); target++) {
      let total = 0
      for (let i = start; i < start + x; i++) total += Math.abs(nums[i] - target)
      best = Math.min(best, total)
    }
    return best
  }
  let best = Infinity
  const pick = (from, count, total) => {
    if (count >= k) best = Math.min(best, total)
    for (let start = from; start + x <= nums.length; start++) pick(start + x, count + 1, total + windowCost(start))
  }
  pick(0, 0, 0)
  return best
}

test('3505 agrees with a brute-force oracle on random inputs', () => {
  let seed = 3505
  const rand = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let t = 0; t < 400; t++) {
    const n = 2 + rand(9)
    const nums = Array.from({ length: n }, () => rand(21) - 10)
    const x = 2 + rand(n - 1)
    const k = 1 + rand(Math.floor(n / x))
    assert.equal(solve(nums, x, k), oracle(nums, x, k), JSON.stringify({ nums, x, k }))
  }
})

test('3505 frames are well formed', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const lines = python.split('\n')
  for (const input of [
    { nums: [4, 9, 1, -3, 7, 7, 2, 12, 5, 0], x: 3, k: 2 },
    { nums: [1, 5, 2, 8], x: 2, k: 2 },
    { nums: [6, 6, 6, 6, 6], x: 2, k: 2 },
  ]) {
    const { frames, result } = buildTrace(parseInput(JSON.stringify(input)))
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      const line = lines[frame.pythonLine - 1]
      assert.ok(line.trim() && !line.trim().startsWith('def ') && !line.startsWith('from '), line)
      assert.ok(frame.message.length > 0)
      if (frame.stage === 'window' && frame.r >= 0 && frame.phase !== 'add' && frame.phase !== 'evict') {
        assert.ok(frame.low.every(v => !frame.high.length || v <= frame.high[0]))
      }
      if (frame.phase === 'cost') {
        assert.equal(frame.low.length + frame.high.length, input.x)
        assert.ok(frame.low.length - frame.high.length === 0 || frame.low.length - frame.high.length === 1)
      }
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.at(-1).chosen.length, input.k)
    assert.equal(frames.at(-1).chosen.reduce((sum, w) => sum + w.cost, 0), result)
    assert.equal(frames.filter(frame => frame.phase === 'cost').length, input.nums.length - input.x + 1)
  }
})
