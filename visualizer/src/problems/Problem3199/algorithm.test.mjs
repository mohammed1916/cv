import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (a, b, c) => buildTrace({ a, b, c }).result

test('3199 presets', () => {
  assert.equal(solve([1, 2], [3], [0, 4]), 2)
  assert.equal(solve([0], [0], [0]), 1)
  assert.equal(solve([1], [1], [1]), 0)
  assert.equal(solve([9], [12], [3]), 1)
})

test('3199 rejects bad arrays', () => {
  assert.throws(() => parseInput('{"a":[],"b":[1],"c":[1]}'))
  assert.throws(() => parseInput('{"a":[256],"b":[1],"c":[1]}'))
  assert.throws(() => parseInput('{"a":[1],"b":[1]}'))
})

// Oracle: count set bits by testing each of the 8 bit positions.
function oracle(a, b, c) {
  const bits = v => { let n = 0; for (let t = 0; t < 8; t++) if ((v >> t) & 1) n++; return n }
  let total = 0
  for (const x of a) for (const y of b) for (const z of c) if (bits(x ^ y ^ z) % 2 === 0) total++
  return total
}

test('3199 random arrays match a bit-position oracle', () => {
  let seed = 3199
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const arr = () => Array.from({ length: 1 + rnd(6) }, () => rnd(256))
  for (let t = 0; t < 200; t++) {
    const a = arr(), b = arr(), c = arr()
    assert.equal(solve(a, b, c), oracle(a, b, c), JSON.stringify({ a, b, c }))
  }
})

test('3199 frames stay inside the pseudocode and Python listings', () => {
  const pyLines = python.split('\n').length
  const run = buildTrace({ a: [1, 2], b: [3], c: [0, 4] })
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
  assert.equal(run.frames.at(-1).count, run.result)
})
