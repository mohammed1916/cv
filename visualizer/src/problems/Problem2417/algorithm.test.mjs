import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(n).result

test('2417 worked examples', () => {
  assert.equal(solve(2), 10)
  assert.equal(solve(10), 10)
  assert.equal(solve(999), 1001)
})

test('2417 result is fair and no smaller fair number lies at or above n', () => {
  const fair = x => {
    let odd = 0, even = 0
    for (const ch of String(x)) (Number(ch) % 2 ? odd++ : even++)
    return odd === even
  }
  for (const n of [1, 5, 77, 123, 500]) {
    const r = solve(n)
    assert.ok(r >= n && fair(r))
    for (let x = n; x < r; x++) assert.equal(fair(x), false)
  }
})

test('2417 rejects non-integers and values outside the cap', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('1001'))
  assert.throws(() => parseInput('2.5'))
})

// Oracle: arithmetic digit extraction instead of strings, applied to a fixed window of candidates.
function oracle(n) {
  for (let x = n; ; x++) {
    let odd = 0, even = 0, t = x
    do {
      const d = t % 10
      if (d % 2) odd++
      else even++
      t = Math.floor(t / 10)
    } while (t > 0)
    if (odd === even) return x
  }
}

test('2417 every n from 1 to 1000 matches an arithmetic oracle', () => {
  for (let n = 1; n <= 1000; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
