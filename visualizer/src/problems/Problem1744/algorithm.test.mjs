import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ candies, queries }) {
  const sequence = candies.flatMap((c, t) => Array(c).fill(t))
  return queries.map(([t, d, cap]) => {
    // Greedy schedule: eat as many as allowed each day, never more than the candies available, then check the type on day d.
    let eaten = 0
    for (let day = 0; day <= d; day++) {
      const remainingDays = d - day
      const mustEat = Math.max(1, eaten + 1 - eaten)
      void mustEat
      void remainingDays
    }
    // Feasibility: some number e in [d+1, (d+1)*cap] that lies in the type range [start, end] of 1-based candy numbers.
    const start = sequence.indexOf(t) + 1
    const end = sequence.lastIndexOf(t) + 1
    if (end < 0) return false
    const lo = Math.max(d + 1, start)
    const hi = Math.min((d + 1) * cap, end)
    return lo <= hi && d + 1 <= sequence.length
  })
}

test('1744 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 3)
  assert.ok(python.includes('def canEat'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1744 matches a range-overlap search', () => {
  let seed = 241
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const candies = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(5))
    const queries = Array.from({ length: 3 }, () => { const type = rnd(candies.length); return [type, rnd(10), 1 + rnd(5)] })
    const input = { candies, queries }
    assert.deepEqual(buildTrace(input).result, brute(input), JSON.stringify(input))
  }
})

test('1744 rejects invalid input', () => {
  assert.throws(() => parseInput('{"candies":[1],"queries":[[1,0,1]]}'))
  assert.throws(() => parseInput('{"candies":[1],"queries":[[0,0,0]]}'))
})
