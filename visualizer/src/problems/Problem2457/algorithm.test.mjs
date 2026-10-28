import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, target) => buildTrace({ n, target }).result

test('2457 official-style examples', () => {
  assert.equal(solve(999, 1), 1)
  assert.equal(solve(5, 5), 0)
  assert.equal(solve(1999, 1), 8001)
})

test('2457 a small number with a large digit sum needs the next power of ten', () => {
  assert.equal(solve(3, 2), 7)
})

test('2457 rejects a zero target', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 5, target: 0 })))
})

// Independent oracle: try every addition x from zero upward and stop at the first one that works.
function oracle(n, target) {
  const digitSum = v => String(v).split('').reduce((a, c) => a + Number(c), 0)
  for (let x = 0; ; x++) if (digitSum(n + x) <= target) return x
}

test('2457 random inputs match a brute-force search over additions', () => {
  let seed = 2457
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000)
    const target = 1 + rnd(30)
    assert.equal(solve(n, target), oracle(n, target), `${n} ${target}`)
  }
})
