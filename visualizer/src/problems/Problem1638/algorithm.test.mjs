import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function bruteForce(s, t) {
  let count = 0
  for (let i = 0; i < s.length; i++) for (let j = 0; j < t.length; j++) for (let len = 1; i + len <= s.length && j + len <= t.length; len++) {
    let diffs = 0
    for (let k = 0; k < len; k++) if (s[i + k] !== t[j + k]) diffs++
    if (diffs === 1) count++
  }
  return count
}

test('1638 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 12)
  assert.ok(python.includes('def countSubstrings'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1638 matches brute force on random strings', () => {
  let seed = 21
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  const word = () => Array.from({ length: 1 + rnd(6) }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = word(), u = word()
    assert.equal(buildTrace({ s, t: u }).result, bruteForce(s, u), `${s} ${u}`)
  }
})

test('1638 rejects invalid input', () => {
  assert.throws(() => parseInput('{"s":"","t":"a"}'))
  assert.throws(() => parseInput('{"s":"A","t":"a"}'))
})
