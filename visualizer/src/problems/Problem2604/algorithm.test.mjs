import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, python } from './algorithm.js'

const solve = (hens, grains) => buildTrace({ hens, grains }).result

test('2604 worked examples', () => {
  assert.equal(solve([3], [1, 2, 3]), 2)
  assert.equal(solve([3, 8], [0, 1, 5, 10, 12]), 7)
  assert.equal(solve([0, 6], [2, 4, 8]), 4)
})

test('2604 edge cases', () => {
  assert.equal(solve([5], []), 0)
  assert.equal(solve([4], [4]), 0)
  assert.equal(solve([0], [30]), 30)
  assert.equal(solve([15], [0, 30]), 45)
  assert.equal(solve([0, 30], [0, 30]), 0)
})

test('2604 input caps and types are enforced', () => {
  assert.throws(() => parseInput('{"hens":[],"grains":[1]}'))
  assert.throws(() => parseInput('{"hens":[1,2,3,4,5,6,7],"grains":[1]}'))
  assert.throws(() => parseInput('{"hens":[1],"grains":[31]}'))
  assert.throws(() => parseInput('{"hens":[1.5],"grains":[1]}'))
  assert.deepEqual(parseInput('{"hens":[3],"grains":[]}'), { hens: [3], grains: [] })
})

// Independent oracle: breadth-first search over time. Each second every hen moves -1, 0 or +1,
// and a grain is eaten when any hen stands on it. The first second where every grain is eaten is the answer.
function oracle(hens, grains) {
  if (grains.length === 0) return 0
  const lo = Math.min(...hens, ...grains)
  const hi = Math.max(...hens, ...grains)
  const full = (1 << grains.length) - 1
  const eatenAt = positions => {
    let mask = 0
    grains.forEach((g, i) => { if (positions.includes(g)) mask |= 1 << i })
    return mask
  }
  // State: hen positions plus the set of grains already eaten. The eaten set only grows.
  let frontier = new Map()
  const start = [...hens]
  frontier.set(`${start}|${eatenAt(start)}`, { positions: start, mask: eatenAt(start) })
  let time = 0
  while (true) {
    for (const state of frontier.values()) if (state.mask === full) return time
    const next = new Map()
    for (const { positions, mask } of frontier.values()) {
      const combine = (k, acc) => {
        if (k === positions.length) {
          if (acc.some(p => p < lo || p > hi)) return
          const nextMask = mask | eatenAt(acc)
          const key = `${acc}|${nextMask}`
          if (!next.has(key)) next.set(key, { positions: acc, mask: nextMask })
          return
        }
        for (const d of [-1, 0, 1]) combine(k + 1, [...acc, positions[k] + d])
      }
      combine(0, [])
    }
    frontier = next
    time++
  }
}

test('2604 random small inputs match a breadth-first simulation oracle', () => {
  let seed = 2604
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const hens = Array.from({ length: 1 + rnd(3) }, () => rnd(7))
    const grains = Array.from({ length: rnd(5) }, () => rnd(7))
    assert.equal(solve(hens, grains), oracle(hens, grains), JSON.stringify({ hens, grains }))
  }
})

test('2604 frame invariants: every line is real and the trace ends with the answer', () => {
  const pythonLines = python.split('\n').length
  const run = buildTrace({ hens: [3, 8], grains: [0, 1, 5, 10, 12] })
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pythonLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.phase)
    assert.ok(frame.view)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).view.answer, run.result)
})
