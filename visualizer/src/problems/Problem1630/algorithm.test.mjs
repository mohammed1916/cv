import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Oracle: the values form an arithmetic progression exactly when sorted neighbours share one difference.
function oracle(nums, start, end) {
  const part = nums.slice(start, end + 1).sort((a, b) => a - b)
  const gap = part[1] - part[0]
  return part.every((v, i) => i === 0 || v - part[i - 1] === gap)
}

test('own sample: one progression and one that is not', () => {
  const run = buildTrace(parseInput('{"nums":[8,2,14,20,5,11,17],"l":[0,1,4],"r":[2,6,6]}'))
  assert.deepEqual(run.result, [true, false, true])
})

test('two-element ranges are always progressions', () => {
  assert.deepEqual(buildTrace({ nums: [9, -4, 3], l: [0, 1], r: [1, 2] }).result, [true, true])
})

test('random queries agree with the sorted-difference oracle', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rand(12)
    const nums = Array.from({ length: n }, () => rand(41) - 20)
    const l = [], r = []
    for (let q = 0; q < 1 + rand(5); q++) { const a = rand(n - 1); l.push(a); r.push(a + 1 + rand(n - 1 - a)) }
    const expected = l.map((a, i) => oracle(nums, a, r[i]))
    assert.deepEqual(buildTrace({ nums, l, r }).result, expected, JSON.stringify({ nums, l, r }))
  }
})

test('frames use declared phases, valid code lines, and narration', () => {
  const run = buildTrace({ nums: [4, 1, 7], l: [0], r: [2] })
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.message.length > 5)
  }
  assert.ok(python.includes('def arithmetic_subarrays'))
})

test('invalid index pairs are rejected', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"l":[1],"r":[1]}'), /0 ≤ l < r/)
})
