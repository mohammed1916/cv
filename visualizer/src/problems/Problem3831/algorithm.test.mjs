import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (values, level) => buildTrace({ values, level }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: insert with plain objects, measure each value's depth by walking from the root.
function oracle(values, level) {
  let root = null
  const depths = []
  for (const v of values) {
    if (!root) { root = { v, l: null, r: null }; depths.push([v, 0]); continue }
    let cur = root, d = 0
    for (;;) {
      d++
      if (v < cur.v) { if (!cur.l) { cur.l = { v, l: null, r: null }; break } cur = cur.l } else { if (!cur.r) { cur.r = { v, l: null, r: null }; break } cur = cur.r }
    }
    depths.push([v, d])
  }
  const atLevel = depths.filter(([, d]) => d === level).map(([v]) => v).sort((a, b) => a - b)
  return atLevel.length ? atLevel[Math.floor(atLevel.length / 2)] : -1
}

test('3831 worked cases', () => {
  assert.equal(solve([5, 3, 8, 1, 4, 7, 9], 2), 7)
  assert.equal(solve([5, 3, 8, 1, 4, 7, 9], 0), 5)
  assert.equal(solve([5, 3, 8, 1, 4, 7, 9], 3), -1)
  assert.equal(solve([4, 2, 6, 1, 3], 2), 3)
})

test('3831 a single root is level zero only', () => {
  assert.equal(solve([7], 0), 7)
  assert.equal(solve([7], 1), -1)
})

test('3831 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ values: [5, 3, 8, 1, 4, 7, 9], level: 2 }))
})

test('3831 parseInput rejects duplicates', () => {
  assert.throws(() => parseInput('{"values":[1,1],"level":0}'))
  assert.throws(() => parseInput('{"values":[1,2],"level":-1}'))
})

test('3831 random trees match the depth-walk oracle', () => {
  let seed = 3831
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const pool = Array.from({ length: 40 }, (_, i) => i + 1)
    const values = []
    for (let i = 0; i < len; i++) values.push(pool.splice(rnd(pool.length), 1)[0])
    const level = rnd(6)
    assert.equal(solve(values, level), oracle(values, level), JSON.stringify({ values, level }))
  }
})
