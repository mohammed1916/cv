import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num, k) => buildTrace({ num, k }).result

test('1505 official examples', () => {
  assert.equal(solve('4321', 4), '1342')
  assert.equal(solve('100', 1), '010')
})

test('1505 with no swaps the number is unchanged', () => {
  assert.equal(solve('5489', 0), '5489')
})

test('1505 rejects a non-digit string', () => {
  assert.throws(() => parseInput(JSON.stringify({ num: '12a', k: 1 })))
})

// Independent oracle: breadth-first search over every string reachable with at most k adjacent swaps.
function oracle(num, k) {
  let frontier = new Set([num])
  const seen = new Set([num])
  let best = num
  for (let step = 0; step < k; step++) {
    const next = new Set()
    for (const s of frontier) {
      for (let i = 0; i + 1 < s.length; i++) {
        const t = s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)
        if (!seen.has(t)) { seen.add(t); next.add(t) }
      }
    }
    frontier = next
  }
  for (const s of seen) if (s < best) best = s
  return best
}

test('1505 random inputs match a breadth-first swap oracle', () => {
  let seed = 1505
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(6)
    let num = ''
    for (let i = 0; i < len; i++) num += String(rnd(10))
    const k = rnd(9)
    assert.equal(solve(num, k), oracle(num, k), `${num} ${k}`)
  }
})
