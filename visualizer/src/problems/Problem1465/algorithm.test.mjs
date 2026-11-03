import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = input => buildTrace(input).result

// Independent oracle: mark every unit position that is cut and measure the longest run of uncut units.
function longestRun(length, cuts) {
  const cut = new Set(cuts)
  let best = 0
  let run = 0
  for (let x = 1; x <= length; x++) {
    run += 1
    if (cut.has(x) || x === length) {
      best = Math.max(best, run)
      run = 0
    }
  }
  return best
}
const oracle = ({ h, w, horizontalCuts, verticalCuts }) =>
  Number((BigInt(longestRun(h, horizontalCuts)) * BigInt(longestRun(w, verticalCuts))) % 1000000007n)

test('1465 sample cakes give the expected areas', () => {
  assert.equal(solve({ h: 10, w: 6, horizontalCuts: [3, 7], verticalCuts: [2] }), 16)
  assert.equal(solve({ h: 8, w: 8, horizontalCuts: [], verticalCuts: [] }), 64)
})

test('1465 large dimensions are reduced modulo 1000000007', () => {
  const expected = Number((10n ** 18n) % 1000000007n)
  assert.equal(solve({ h: 1000000000, w: 1000000000, horizontalCuts: [], verticalCuts: [] }), expected)
})

test('1465 rejects malformed input', () => {
  assert.throws(() => parseInput('{"h":1,"w":5,"horizontalCuts":[],"verticalCuts":[]}'), /h and w/)
  assert.throws(() => parseInput('{"h":5,"w":5,"horizontalCuts":[5],"verticalCuts":[]}'), /horizontalCuts/)
  assert.throws(() => parseInput('{"h":5,"w":5,"horizontalCuts":[2,2],"verticalCuts":[]}'), /distinct/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1465 random cakes match the run-length oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pick = (length, count) => {
    const set = new Set()
    while (set.size < count) set.add(1 + rnd(length - 1))
    return [...set]
  }
  for (let t = 0; t < 200; t++) {
    const h = 2 + rnd(30)
    const w = 2 + rnd(30)
    const input = {
      h, w,
      horizontalCuts: pick(h, rnd(Math.min(6, h - 1) + 1)),
      verticalCuts: pick(w, rnd(Math.min(6, w - 1) + 1)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})

test('1465 every frame points at a real phase and code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ h: 9, w: 5, horizontalCuts: [4], verticalCuts: [1, 3] }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
