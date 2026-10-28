import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1889 official style examples', () => {
  assert.equal(solve({ packages: [2, 3, 5], boxes: [[4, 8], [2, 8]] }), 6)
  assert.equal(solve({ packages: [3, 5, 8, 10, 11, 12], boxes: [[12], [11, 9], [10, 5, 14]] }), 9)
  assert.equal(solve({ packages: [2, 3, 5], boxes: [[1, 4], [2, 3]] }), -1)
})

test('1889 a single package wastes box minus package', () => {
  assert.equal(solve({ packages: [4], boxes: [[9]] }), 5)
})

test('1889 rejects a size above 20', () => {
  assert.throws(() => parseInput('{"packages":[21],"boxes":[[14]]}'))
})

// Independent oracle: each package independently takes the smallest box of a supplier that fits it.
function oracle({ packages, boxes }) {
  let best = null
  for (const supplier of boxes) {
    let total = 0
    let ok = true
    for (const p of packages) {
      let smallest = null
      for (const b of supplier) if (b >= p && (smallest === null || b < smallest)) smallest = b
      if (smallest === null) {
        ok = false
        break
      }
      total += smallest - p
    }
    if (ok && (best === null || total < best)) best = total
  }
  return best === null ? -1 : best % 1000000007
}

test('1889 random inputs match a per-package oracle', () => {
  let seed = 1889
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const packages = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(10))
    const boxes = Array.from({ length: 1 + rnd(3) }, () => Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(12)))
    const input = { packages, boxes }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
