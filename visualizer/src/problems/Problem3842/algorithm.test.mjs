import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = bulbs => buildTrace({ bulbs }).result

test('3842 worked examples', () => {
  assert.deepEqual(solve([10, 30, 20, 10, 20, 40]), [30, 40])
  assert.deepEqual(solve([1, 2, 2, 3]), [1, 3])
})

test('3842 edge cases', () => {
  assert.deepEqual(solve([5, 5]), [])
  assert.deepEqual(solve([100]), [100])
  assert.deepEqual(solve([1, 1, 1]), [1])
  assert.deepEqual(solve([7, 3, 7, 3, 7]), [7])
})

test('3842 rejects out of range entries', () => {
  assert.throws(() => parseInput('{"bulbs":[0]}'))
  assert.throws(() => parseInput('{"bulbs":[101]}'))
  assert.throws(() => parseInput('{"bulbs":[]}'))
})

// Oracle: a bulb is on exactly when it appears an odd number of times.
function oracle(bulbs) {
  const out = []
  for (let b = 1; b <= 100; b++) {
    const count = bulbs.filter(x => x === b).length
    if (count % 2 === 1) out.push(b)
  }
  return out
}

test('3842 random inputs match a parity oracle', () => {
  let seed = 3842
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const bulbs = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(12))
    assert.deepEqual(solve(bulbs), oracle(bulbs), JSON.stringify(bulbs))
  }
})

test('3842 every frame has phase, real pseudocode line, message and python line', () => {
  const pyLines = python.trim().split('\n').length
  for (const bulbs of [[10, 30, 20, 10, 20, 40], [5, 5], [100]]) {
    const { frames } = buildTrace({ bulbs })
    for (const f of frames) {
      assert.ok(['start', 'toggle', 'done'].includes(f.phase))
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(typeof f.message === 'string' && f.message.length > 0)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    }
  }
})

test('3842 toggle frames carry before and after state for the named bulb', () => {
  const { frames } = buildTrace({ bulbs: [4, 9, 4] })
  const toggles = frames.filter(f => f.phase === 'toggle')
  assert.deepEqual(toggles.map(f => [f.bulb, f.before, f.on]), [[4, false, true], [9, false, true], [4, true, false]])
  assert.deepEqual(toggles.map(f => f.at), [0, 1, 2])
})

test('3842 two events for one bulb visibly turn on then off', () => {
  const { frames } = buildTrace({ bulbs: [30, 30] })
  const toggles = frames.filter(f => f.phase === 'toggle')
  assert.deepEqual(toggles.map(f => f.on), [true, false])
  assert.deepEqual(toggles.map(f => f.count), [1, 2])
  assert.deepEqual(frames[1].lit, [30])
  assert.deepEqual(frames[2].lit, [])
})

test('3842 done frame keeps the sorted final lit set', () => {
  const { frames, result } = buildTrace({ bulbs: [40, 10, 30, 10, 20] })
  const done = frames[frames.length - 1]
  assert.equal(done.phase, 'done')
  assert.deepEqual(done.lit, result)
  assert.deepEqual(result, [20, 30, 40])
  assert.deepEqual([...result].sort((a, b) => a - b), result)
})
