import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = barcodes => buildTrace(parseInput(JSON.stringify({ barcodes }))).result

// The answer is not unique, so the oracle checks the defining properties: same multiset and no equal neighbours.
function isValid(input, out) {
  const same = [...input].sort((a, b) => a - b).join(',') === [...out].sort((a, b) => a - b).join(',')
  return same && out.every((v, i) => i === 0 || out[i - 1] !== v)
}

test('1054 official examples produce valid arrangements', () => {
  const a = [1, 1, 1, 2, 2, 2]
  const b = [1, 1, 1, 1, 2, 2, 3, 3]
  assert.ok(isValid(a, solve(a)))
  assert.ok(isValid(b, solve(b)))
})

test('1054 a single barcode is returned as it is', () => {
  assert.deepEqual(solve([4]), [4])
})

test('1054 rejects a value that fills more than half the list', () => {
  assert.throws(() => parseInput('{"barcodes":[1,1,1,1,2]}'))
})

test('1054 random inputs give valid arrangements whenever one exists', () => {
  let seed = 1054
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const barcodes = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    try { parseInput(JSON.stringify({ barcodes })) } catch { continue }
    checked++
    assert.ok(isValid(barcodes, solve(barcodes)), JSON.stringify(barcodes))
  }
  assert.ok(checked > 100)
})
