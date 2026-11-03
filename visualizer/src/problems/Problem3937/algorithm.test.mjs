import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).best, run.result)
}

test('3937 hand-checked cases', () => {
  assert.equal(solve([1, 1], 2), 1)
  assert.equal(solve([3, 3, 3], 2), 1)
  assert.equal(solve([4, 4], 4), 1)
})

test('3937 frames are complete for the presets', () => {
  assertFrames(buildTrace({ nums: [7, 4, 9, 2, 5], k: 3 }))
  assertFrames(buildTrace({ nums: [10, 11, 20, 21], k: 4 }))
})

test('3937 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[],"k":3}'))
})

// Oracle: for every pair of residues, pick each final value from a wide integer window and
// take the cheapest; no residue formula is shared with the implementation.
function oracle(nums, k) {
  const mod = (a) => ((a % k) + k) % k
  const cheapest = (x, r) => {
    let best = Infinity
    for (let y = -4 * k; y <= 4 * k + 1000; y++) if (mod(y) === r) best = Math.min(best, Math.abs(x - y))
    return best
  }
  let best = Infinity
  for (let r0 = 0; r0 < k; r0++) {
    for (let r1 = 0; r1 < k; r1++) {
      if (r0 === r1) continue
      let total = 0
      nums.forEach((x, i) => { total += cheapest(x, i % 2 === 0 ? r0 : r1) })
      best = Math.min(best, total)
    }
  }
  return best
}

test('3937 random small inputs match the window oracle', () => {
  let seed = 3937
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const k = 2 + rnd(4)
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(30))
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
