import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(nums) {
  let best = -Infinity
  for (let k = 0; k < nums.length; k++) {
    const modified = nums.map((v, i) => (i === k ? v * v : v))
    for (let a = 0; a < modified.length; a++) {
      let sum = 0
      for (let b = a; b < modified.length; b++) {
        sum += modified[b]
        best = Math.max(best, sum)
      }
    }
  }
  return best
}

test('1746 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def maxSumAfterOperation'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1746 matches squaring each position in turn', () => {
  let seed = 251
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => rnd(21) - 10)
    assert.equal(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('1746 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[101]'))
})
