import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (left, right) => buildTrace(parseInput(JSON.stringify({ left, right }))).result

test('2523 statement examples', () => {
  assert.deepEqual(solve(10, 19), [11, 13])
  assert.deepEqual(solve(4, 6), [-1, -1])
})

test('2523 rejects left above right', () => {
  assert.throws(() => parseInput('{"left":9,"right":3}'))
})

// Independent oracle: compare every pair of primes in the range and keep the smallest gap, earliest first.
function oracle(left, right) {
  const isP = x => { if (x < 2) return false; for (let d = 2; d < x; d++) if (x % d === 0) return false; return true }
  const primes = []
  for (let x = left; x <= right; x++) if (isP(x)) primes.push(x)
  let best = null
  let answer = [-1, -1]
  for (const a of primes) {
    for (const b of primes) {
      if (b <= a) continue
      const gap = b - a
      if (best === null || gap < best || (gap === best && a < answer[0])) { best = gap; answer = [a, b] }
    }
  }
  return answer
}

test('2523 random ranges match a pairwise oracle', () => {
  let seed = 2523
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const left = 1 + rnd(200)
    const right = left + rnd(120)
    assert.deepEqual(solve(left, right), oracle(left, right), `${left}..${right}`)
  }
})
