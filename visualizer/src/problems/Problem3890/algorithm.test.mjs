import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

// Independent oracle: for each candidate x, count the pairs a <= b with a^3 + b^3 = x by direct comparison.
function oracle(n) {
  const out = []
  for (let x = 1; x <= n; x++) {
    let count = 0
    for (let a = 1; a <= 20; a++) for (let b = a; b <= 20; b++) if (a ** 3 + b ** 3 === x) count++
    if (count >= 2) out.push(x)
  }
  return out
}

test('3890 official examples', () => {
  assert.deepEqual(solve(4104), [1729, 4104])
  assert.deepEqual(solve(578), [])
})

test('3890 rejects a non-integer', () => {
  assert.throws(() => parseInput('{"n":2.5}'))
})

test('3890 random limits match the per-candidate oracle', () => {
  let seed = 3890
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 40; t++) {
    const n = 1 + rnd(3000)
    assert.deepEqual(solve(n), oracle(n), `n=${n}`)
  }
})
