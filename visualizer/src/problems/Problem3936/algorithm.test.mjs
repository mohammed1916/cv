import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
    assert.equal(f.arr.length, run.input.nums.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  const last = run.frames.at(-1).arr
  const zeros = last.filter(v => v === 0).length
  assert.ok(last.slice(last.length - zeros).every(v => v === 0), 'zeros end the array')
}

test('3936 hand-checked cases', () => {
  assert.equal(solve([0, 4, 0, 7, 1]), 2)
  assert.equal(solve([5, 0, 3, 0]), 1)
  assert.equal(solve([0, 0, 1]), 1)
  assert.equal(solve([1, 2, 0]), 0)
  assert.equal(solve([0]), 0)
})

test('3936 frames are complete for the presets', () => {
  assertFrames(buildTrace({ nums: [0, 4, 0, 7, 1] }))
  assertFrames(buildTrace({ nums: [5, 0, 3, 0] }))
})

test('3936 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[10]'))
})

// Oracle: breadth-first search over every arrangement reached by swapping any two positions.
function oracle(nums) {
  const n = nums.length
  const isGood = a => {
    let seenZero = false
    for (const v of a) {
      if (v === 0) seenZero = true
      else if (seenZero) return false
    }
    return true
  }
  const key = a => a.join(',')
  const seen = new Map([[key(nums), 0]])
  const queue = [nums]
  while (queue.length) {
    const cur = queue.shift()
    const d = seen.get(key(cur))
    if (isGood(cur)) return d
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const next = cur.slice()
        ;[next[i], next[j]] = [next[j], next[i]]
        const k = key(next)
        if (!seen.has(k)) { seen.set(k, d + 1); queue.push(next) }
      }
    }
  }
  return -1
}

test('3936 random small arrays match swap-level breadth-first search', () => {
  let seed = 3936
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(3))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
