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
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).total, run.result)
}

test('3927 hand-checked cases', () => {
  assert.equal(solve([6, 9, 4, 3]), 13)
  assert.equal(solve([10, 5, 2, 15]), 14)
  assert.equal(solve([7]), 7)
  assert.equal(solve([4, 4]), 8)
})

test('3927 frames are complete for the presets', () => {
  assertFrames(buildTrace({ nums: [6, 9, 4, 3] }))
  assertFrames(buildTrace({ nums: [10, 5, 2, 15] }))
})

test('3927 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[101]'))
})

// Oracle: breadth-first search over every reachable array, one replacement at a time.
function oracle(start) {
  const key = a => a.join(',')
  const seen = new Set([key(start)])
  const queue = [start]
  let best = start.reduce((s, v) => s + v, 0)
  while (queue.length) {
    const cur = queue.shift()
    best = Math.min(best, cur.reduce((s, v) => s + v, 0))
    const present = new Set(cur)
    cur.forEach((x, i) => {
      for (const y of present) {
        if (y !== x && x % y === 0) {
          const next = cur.slice()
          next[i] = y
          const k = key(next)
          if (!seen.has(k)) { seen.add(k); queue.push(next) }
        }
      }
    })
  }
  return best
}

test('3927 random small arrays match a reachability search', () => {
  let seed = 3927
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
