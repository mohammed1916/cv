import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ nums, k }) {
  let best = null
  for (let i = 0; i + k <= nums.length; i++) {
    const cand = nums.slice(i, i + k)
    if (best === null || cand.some((v, j) => v !== best[j]) && cand.find((v, j) => v !== best[j]) > best.find((v, j) => v !== cand[j]) ) best = cand
  }
  return best
}

test('1708 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 5)
  assert.ok(python.includes('def largestSubarray'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1708 matches a lexicographic brute force', () => {
  let seed = 101
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = [...Array(n)].map((_, i) => i + 1).sort(() => rnd(3) - 1)
    const k = 1 + rnd(n)
    const input = { nums, k }
    assert.deepEqual(buildTrace(input).result, brute(input), JSON.stringify(input))
  }
})

test('1708 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[1,1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})
