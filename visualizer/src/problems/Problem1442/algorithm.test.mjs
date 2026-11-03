import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: enumerate i < j ≤ k and compare the two XOR segments directly.
function oracle(arr) {
  const n = arr.length
  const xorRange = (from, to) => { let x = 0; for (let t = from; t < to; t++) x ^= arr[t]; return x }
  let count = 0
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j; k < n; k++) {
    if (xorRange(i, j) === xorRange(j, k + 1)) count++
  }
  return count
}

test('two equal values in a row give a single valid triple per split', () => {
  assert.equal(buildTrace([1, 1]).result, 1)
})

test('equal values in a row of three give the middle-split count', () => {
  assert.equal(buildTrace([4, 4, 4]).result, oracle([4, 4, 4]))
})

test('all-zero arrays count every triple', () => {
  assert.equal(buildTrace([0, 0, 0, 0]).result, oracle([0, 0, 0, 0]))
})

test('a single value has no triple', () => {
  assert.equal(buildTrace([9]).result, 0)
})

test('matches the brute-force oracle on pseudo-random arrays', () => {
  let seed = 4242
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(12)
    const arr = Array.from({ length: n }, () => rand(8))
    assert.equal(buildTrace(arr).result, oracle(arr), JSON.stringify(arr))
  }
})

test('frames use declared phases and existing code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace([2, 5, 2, 5]).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(l => l.line === frame.activeLine))
  }
  assert.equal(code.length, python.split('\n').length)
})

test('parseInput rejects non-integers and out-of-range values', () => {
  assert.throws(() => parseInput('[1.5]'), /integer/)
  assert.throws(() => parseInput('[300]'), /0 to 255/)
  assert.deepEqual(parseInput('[3,1]'), [3, 1])
})
