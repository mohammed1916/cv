import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = digits => buildTrace(digits).result

test('3483 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4]), 12)
  assert.equal(solve([2, 2, 2]), 1)
  assert.equal(solve([3, 3, 3]), 0)
})

test('3483 zeros cannot lead and duplicates count once', () => {
  assert.equal(solve([0, 0, 2]), 1)
  assert.equal(solve([0, 2, 4]), 4)
  assert.equal(solve([1, 1, 1, 2]), 1)
})

test('3483 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[1,2,10]'))
})

// Independent oracle: test every 3-digit number against the multiset of available digits.
function oracle(digits) {
  let count = 0
  for (let v = 100; v <= 998; v += 2) {
    const need = [Math.floor(v / 100), Math.floor(v / 10) % 10, v % 10]
    const pool = digits.slice()
    let ok = true
    for (const d of need) {
      const at = pool.indexOf(d)
      if (at < 0) { ok = false; break }
      pool.splice(at, 1)
    }
    if (ok) count++
  }
  return count
}

test('3483 random inputs match a number-by-number oracle', () => {
  let seed = 3483
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const digits = Array.from({ length: 3 + rnd(6) }, () => rnd(10))
    assert.equal(solve(digits), oracle(digits), JSON.stringify(digits))
  }
})
