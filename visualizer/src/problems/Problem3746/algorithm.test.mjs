import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('3746 worked examples', () => {
  assert.equal(solve('aabaa'), 3)
  assert.equal(solve('bbbab'), 3)
  assert.equal(solve('ab'), 0)
})

// Brute force: explore every string reachable by removing an equal-count substring.
function bruteMin(s) {
  const seen = new Set([s])
  const stack = [s]
  let best = s.length
  while (stack.length) {
    const cur = stack.pop()
    best = Math.min(best, cur.length)
    for (let i = 0; i < cur.length; i++) {
      let a = 0
      let b = 0
      for (let j = i; j < cur.length; j++) {
        if (cur[j] === 'a') a++
        else b++
        if (a === b) {
          const next = cur.slice(0, i) + cur.slice(j + 1)
          if (!seen.has(next)) { seen.add(next); stack.push(next) }
        }
      }
    }
  }
  return best
}

test('3746 matches exhaustive search on every short string', () => {
  for (let len = 1; len <= 9; len++) {
    for (let mask = 0; mask < 1 << len; mask++) {
      let s = ''
      for (let k = 0; k < len; k++) s += (mask >> k) & 1 ? 'a' : 'b'
      assert.equal(solve(s), bruteMin(s), s)
    }
  }
})

test('3746 rejects other letters', () => {
  assert.throws(() => parseInput('abc'))
  assert.throws(() => parseInput(''))
})
