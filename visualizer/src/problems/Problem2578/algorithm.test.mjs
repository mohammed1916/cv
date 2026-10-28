import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace({ num }).result

test('2578 official examples', () => {
  assert.equal(solve('4325'), 59)
  // Digits 6, 7, 8 dealt out as 68 and 7: 75, which beats 67 + 8 = 75 only in a tie and 78 + 6 = 84.
  assert.equal(solve('687'), 75)
})

test('2578 a two-digit number splits into its two digits', () => {
  assert.equal(solve('10'), 1)
})

test('2578 rejects a leading zero', () => {
  assert.throws(() => parseInput(JSON.stringify({ num: '0123' })))
})

// Independent oracle: every arrangement of the digits, every split point, keep the smallest sum.
function oracle(num) {
  const arrangements = new Set()
  const rec = (pre, rest) => {
    if (rest.length === 0) { arrangements.add(pre); return }
    for (let i = 0; i < rest.length; i++) rec(pre + rest[i], rest.slice(0, i) + rest.slice(i + 1))
  }
  rec('', num)
  let best = Infinity
  for (const arr of arrangements) {
    for (let cut = 1; cut < arr.length; cut++) {
      best = Math.min(best, Number(arr.slice(0, cut)) + Number(arr.slice(cut)))
    }
  }
  return best
}

test('2578 random numbers match an arrangement-and-split oracle', () => {
  let seed = 2578
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(4)
    let num = String(1 + rnd(9))
    for (let i = 1; i < len; i++) num += String(rnd(10))
    assert.equal(solve(num), oracle(num), num)
  }
})
